# Cloud-Health — Architecture Microservices AWS

Application de gestion de santé basée sur une architecture microservices déployée sur AWS.

## Architecture

| Microservice | Technologie | Base de données | Port |
|---|---|---|---|
| MS_Patients | Symfony (PHP 8.2) | MySQL 8.0 | 8001 |
| MS_RendezVous | .NET Core 8 | PostgreSQL 15 | 8002 |
| MS_Dossiers | Spring Boot 3 | MongoDB 7 | 8003 |
| Frontend | Angular 17 | - | 4200 |
| API Gateway | Nginx | - | 80 |
| Event Broker | Apache Kafka | - | 9092 |

## Infrastructure AWS (eu-west-3 - Paris) — Déploiement Manuel

- **VPC**: 10.0.0.0/16
- **Public Subnet (DMZ)**: 10.0.1.0/24 — API Gateway, Internet Gateway
- **Private Subnet**: 10.0.2.0/24 — Microservices & Bases de données
- **Services**: IAM (MFA), CloudWatch (Logs), Budgets (Alertes)

### Déploiement sur AWS (étapes manuelles)

1. **Créer le VPC** (10.0.0.0/16) avec Internet Gateway
2. **Créer les subnets** :
   - Public (DMZ) : 10.0.1.0/24
   - Private : 10.0.2.0/24
3. **Lancer les instances EC2** (t3.medium, Amazon Linux 2023) :
   - MS_Patients (PHP/Symfony)
   - MS_RendezVous (.NET Core)
   - MS_Dossiers (Spring Boot)
   - Kafka Broker (t3.large)
4. **Créer les bases de données** :
   - RDS MySQL 8.0 pour Patients (port 3306)
   - RDS PostgreSQL 15 pour RendezVous (port 5432)
   - DocumentDB (MongoDB) pour Dossiers (port 27017)
5. **Configurer l'API Gateway** (HTTP API, VPC Link vers les EC2)
6. **Configurer Security Groups** selon les ports du diagramme
7. **Activer CloudWatch Logs** + Budgets Alerts

## Démarrage rapide (Docker)

```bash
docker-compose up -d
```

Accès:
- Frontend: http://localhost:4200
- API Gateway: http://localhost:80
- MS_Patients: http://localhost:8001
- MS_RendezVous: http://localhost:8002
- MS_Dossiers: http://localhost:8003

## Structure du projet

```
cloud-health/
├── ms-patients/          # Symfony 6.4 (PHP 8.2) - Gestion des patients
├── ms-rendezvous/        # .NET 8 - Gestion des rendez-vous
├── ms-dossiers/          # Spring Boot 3.2 (Java 21) - Dossiers médicaux
├── frontend/             # Angular 17 - Interface utilisateur
├── api-gateway/          # Nginx - Point d'entrée REST
├── kafka/                # Configuration Kafka (topics)
└── docker-compose.yml    # Orchestration locale (tout-en-un)
```

## Communication inter-services

Les microservices communiquent via **Apache Kafka** (événements asynchrones) :
- `patient.created` / `patient.updated` / `patient.deleted`
- `rendezvous.created` / `rendezvous.cancelled`
- `dossier.created` / `dossier.updated`
