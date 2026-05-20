#!/usr/bin/env bash
# ============================================================================
#  Cloud Health — EC2 Bootstrap & Deploy Script
# ============================================================================
#  Usage (sur l'EC2 fraîchement provisionnée, en tant qu'utilisateur ubuntu) :
#
#    # Option A — clone + lance directement
#    curl -fsSL https://raw.githubusercontent.com/<USER>/<REPO>/main/deploy.sh | bash
#
#    # Option B — copier le fichier puis exécuter
#    chmod +x deploy.sh
#    ./deploy.sh
#
#  Variables d'environnement (optionnelles) :
#    REPO_URL        URL Git du projet (par défaut : valeur ci-dessous)
#    REPO_BRANCH     Branche à cloner (par défaut : main)
#    APP_DIR         Dossier de déploiement (par défaut : /home/ubuntu/cloudhealth)
#    SKIP_INSTALL    "true" pour sauter l'installation de Docker (déjà installé)
# ============================================================================
set -euo pipefail

# ----- Configuration par défaut (à adapter) -----
REPO_URL="${REPO_URL:-https://github.com/CHANGE_ME/cloudhealth.git}"
REPO_BRANCH="${REPO_BRANCH:-main}"
APP_DIR="${APP_DIR:-/home/ubuntu/cloudhealth}"
SKIP_INSTALL="${SKIP_INSTALL:-false}"

# ----- Couleurs -----
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

log()     { echo -e "${CYAN}==>${NC} $1"; }
success() { echo -e "    ${GREEN}[OK]${NC} $1"; }
warn()    { echo -e "    ${YELLOW}[WARN]${NC} $1"; }
err()     { echo -e "    ${RED}[ERROR]${NC} $1" >&2; }

# ============================================================================
#  Étape 1 : Vérifications préalables
# ============================================================================

log "Vérification de l'environnement"

if [[ "$EUID" -eq 0 ]]; then
    err "Ne pas exécuter ce script en root. Utilise l'utilisateur 'ubuntu'."
    exit 1
fi

if ! command -v sudo >/dev/null 2>&1; then
    err "sudo est requis."
    exit 1
fi

success "Utilisateur courant : $(whoami)"
success "Système : $(lsb_release -ds 2>/dev/null || cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2 | tr -d '\"')"

# ============================================================================
#  Étape 2 : Installation Docker + Docker Compose v2
# ============================================================================

if [[ "$SKIP_INSTALL" == "true" ]]; then
    warn "SKIP_INSTALL=true — installation de Docker ignorée"
else
    log "Installation de Docker Engine + Docker Compose v2"

    sudo apt-get update -y -qq
    sudo apt-get install -y -qq \
        ca-certificates curl gnupg git ufw

    # Repo officiel Docker
    sudo install -m 0755 -d /etc/apt/keyrings
    if [[ ! -f /etc/apt/keyrings/docker.gpg ]]; then
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
            sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        sudo chmod a+r /etc/apt/keyrings/docker.gpg
    fi

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y -qq
    sudo apt-get install -y -qq \
        docker-ce docker-ce-cli containerd.io \
        docker-buildx-plugin docker-compose-plugin

    sudo systemctl enable --now docker

    # Ajout de l'utilisateur ubuntu au groupe docker
    if ! groups | grep -q docker; then
        sudo usermod -aG docker "$USER"
        warn "Tu as été ajouté au groupe 'docker' — la commande docker sera utilisable sans sudo après reconnexion SSH"
    fi

    success "Docker $(docker --version | awk '{print $3}' | tr -d ',')"
    success "Docker Compose $(docker compose version --short 2>/dev/null || sudo docker compose version --short)"
fi

# ============================================================================
#  Étape 3 : Clone ou mise à jour du dépôt
# ============================================================================

log "Synchronisation du code source"

if [[ -d "$APP_DIR/.git" ]]; then
    log "Dépôt existant — pull de la dernière version"
    cd "$APP_DIR"
    git fetch origin
    git checkout "$REPO_BRANCH"
    git pull origin "$REPO_BRANCH"
else
    log "Clone de $REPO_URL ($REPO_BRANCH)"
    git clone --branch "$REPO_BRANCH" "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

success "Code à jour dans $APP_DIR"

# ============================================================================
#  Étape 4 : Préparation du fichier .env
# ============================================================================

log "Configuration des variables d'environnement"

if [[ ! -f "$APP_DIR/.env" ]]; then
    if [[ -f "$APP_DIR/.env.prod.example" ]]; then
        cp "$APP_DIR/.env.prod.example" "$APP_DIR/.env"
        warn "Fichier .env créé depuis .env.prod.example"
        warn ""
        warn "ACTION REQUISE : édite le fichier $APP_DIR/.env"
        warn "                 et remplace toutes les valeurs CHANGE_ME"
        warn ""
        warn "Génère un APP_SECRET Symfony aléatoire avec :"
        warn "    openssl rand -hex 32"
        warn ""
        echo -en "${YELLOW}Continuer le déploiement quand même ? (y/N) ${NC}"
        read -r answer
        if [[ ! "$answer" =~ ^[Yy]$ ]]; then
            log "Déploiement interrompu — édite $APP_DIR/.env puis relance ./deploy.sh"
            exit 0
        fi
    else
        err "Aucun fichier .env ni .env.prod.example trouvé dans $APP_DIR"
        exit 1
    fi
else
    success "Fichier .env existant utilisé"
fi

# ============================================================================
#  Étape 5 : Build & Run
# ============================================================================

log "Construction et démarrage des containers (peut prendre 15-25 min au premier run)"

# Permet d'utiliser docker sans relogin pour cette session si l'user vient d'être ajouté au groupe
DOCKER_CMD="docker"
if ! docker info >/dev/null 2>&1; then
    DOCKER_CMD="sudo docker"
    warn "Utilisation de sudo docker (reconnecte-toi en SSH pour ne plus avoir besoin de sudo)"
fi

cd "$APP_DIR"
$DOCKER_CMD compose -f docker-compose.prod.yml pull --ignore-pull-failures 2>/dev/null || true
$DOCKER_CMD compose -f docker-compose.prod.yml up -d --build --remove-orphans

# ============================================================================
#  Étape 6 : Attente du démarrage et vérification
# ============================================================================

log "Attente du démarrage des services (max 3 min)"

MAX_WAIT=180
ELAPSED=0
INTERVAL=10

while [[ $ELAPSED -lt $MAX_WAIT ]]; do
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))

    if curl -fs --max-time 3 http://localhost:8080/health >/dev/null 2>&1; then
        success "API Gateway répond sur :8080"
        break
    fi
    log "Attente API Gateway... (${ELAPSED}s / ${MAX_WAIT}s)"
done

# ============================================================================
#  Étape 7 : Tests d'intégration
# ============================================================================

log "Tests des endpoints microservices via l'API Gateway"

ALL_OK=true
for path in \
    "/api/patients/stats" \
    "/api/rendezvous/stats" \
    "/api/dossiers/stats"
do
    if curl -fs --max-time 10 "http://localhost:8080${path}" -o /dev/null; then
        success "GET ${path} — OK"
    else
        warn "GET ${path} — pas encore prêt (le microservice peut être en cours de démarrage)"
        ALL_OK=false
    fi
done

# ============================================================================
#  Étape 8 : Récapitulatif
# ============================================================================

PUB_IP=$(curl -fs --max-time 3 http://169.254.169.254/latest/meta-data/public-ipv4 || echo "<EC2_PUBLIC_IP>")

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  CLOUD HEALTH BACKEND DÉPLOYÉ${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "  Containers :"
$DOCKER_CMD compose -f docker-compose.prod.yml ps --format "    {{.Name}} ({{.State}}) - {{.Status}}"
echo ""
echo -e "${CYAN}  API publique :${NC}"
echo "    http://${PUB_IP}:8080/health"
echo "    http://${PUB_IP}:8080/api/patients/stats"
echo "    http://${PUB_IP}:8080/api/rendezvous/stats"
echo "    http://${PUB_IP}:8080/api/dossiers/stats"
echo ""
echo -e "${CYAN}  Commandes utiles :${NC}"
echo "    docker compose -f docker-compose.prod.yml ps"
echo "    docker compose -f docker-compose.prod.yml logs -f <service>"
echo "    docker compose -f docker-compose.prod.yml restart <service>"
echo "    docker compose -f docker-compose.prod.yml down"
echo ""

if [[ "$ALL_OK" == "true" ]]; then
    echo -e "${GREEN}Déploiement complet — backend opérationnel.${NC}"
else
    echo -e "${YELLOW}Backend démarré mais certains microservices ne répondent pas encore.${NC}"
    echo -e "${YELLOW}Attends 1-2 min et retape :${NC}"
    echo "    curl http://localhost:8080/api/patients/stats"
fi
echo ""
