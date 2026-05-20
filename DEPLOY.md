# Déploiement Backend — AWS EC2

## TL;DR

```bash
# Sur ton EC2 Ubuntu 22.04 fraîchement créée
git clone https://github.com/<USER>/cloudhealth.git
cd cloudhealth
chmod +x deploy.sh
./deploy.sh
```

## Pré-requis EC2

| Élément | Valeur recommandée |
|---------|-------------------|
| AMI | Ubuntu Server 22.04 LTS |
| Type | `t3.large` (8 GB RAM) |
| Disque | 30 GiB gp3 |
| Security Group | SSH (22) depuis ton IP, TCP 8080 depuis 0.0.0.0/0 |

## Étapes pas à pas

### 1. Connexion SSH
```bash
ssh -i cloudhealth-key.pem ubuntu@<IP_PUBLIQUE>
```

### 2. Récupération du code
```bash
git clone https://github.com/<USER>/cloudhealth.git
cd cloudhealth
```

### 3. Configuration des secrets
```bash
cp .env.prod.example .env
nano .env
# remplace tous les CHANGE_ME — utilise `openssl rand -hex 32` pour SYMFONY_APP_SECRET
```

### 4. Lancement
```bash
chmod +x deploy.sh
./deploy.sh
```

⏳ Le premier lancement prend **15-25 minutes** (build des 3 images polyglottes).

### 5. Démarrage auto au boot (recommandé)
```bash
sudo cp cloudhealth.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable cloudhealth
```

## Vérification

Depuis ton PC local :
```bash
curl http://<IP_PUBLIQUE_EC2>:8080/health
curl http://<IP_PUBLIQUE_EC2>:8080/api/patients/stats
curl http://<IP_PUBLIQUE_EC2>:8080/api/rendezvous/stats
curl http://<IP_PUBLIQUE_EC2>:8080/api/dossiers/stats
```

## CloudFront — ajouter le backend en origin

| Champ | Valeur |
|-------|--------|
| Origin domain | `<IP_PUBLIQUE_EC2>` |
| Protocol | HTTP only |
| HTTP port | 8080 |
| Behavior path | `/api/*` |
| Cache policy | CachingDisabled |
| Origin request policy | AllViewer |
| Allowed methods | GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE |

Puis : Invalidations → Create → `/*`

## Commandes utiles sur l'EC2

```bash
# Voir l'état des containers
docker compose -f docker-compose.prod.yml ps

# Suivre les logs d'un service
docker compose -f docker-compose.prod.yml logs -f ms-patients

# Redémarrer un service
docker compose -f docker-compose.prod.yml restart ms-rendezvous

# Tout arrêter
docker compose -f docker-compose.prod.yml down

# Tout redémarrer (après modif du code)
git pull && docker compose -f docker-compose.prod.yml up -d --build

# Nettoyer le disque (images orphelines)
docker system prune -a -f
```

## Coûts

| Ressource | Coût/mois |
|-----------|-----------|
| EC2 t3.large 24/7 | ~$60 |
| EC2 t3.large arrêté | ~$3 (stockage seul) |
| Elastic IP attachée | gratuit |
| Elastic IP détachée | ~$3.60 |

## Sécurité

- ❌ Aucune base ni Kafka exposés sur internet (réseau Docker interne uniquement)
- ✅ Seul le port 8080 ouvert au public (devant CloudFront)
- 🔒 Idéalement : restreindre le SG du port 8080 aux IPs de CloudFront
  (voir https://ip-ranges.amazonaws.com/ip-ranges.json — service `CLOUDFRONT_ORIGIN_FACING`)
