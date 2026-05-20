# Task Definitions — Cloud Health ECS Fargate

## ⚠️ Avant utilisation

Dans chaque fichier JSON, **remplace** les placeholders suivants :

| Placeholder | Où trouver la valeur |
|-------------|---------------------|
| `<ACCOUNT_ID>` | Console AWS (en haut à droite) ou `aws sts get-caller-identity` |
| `<RDS_MYSQL_ENDPOINT>` | RDS console → `cloudhealth-db-patients` → Endpoint |
| `<RDS_POSTGRES_ENDPOINT>` | RDS console → `cloudhealth-db-rendezvous` → Endpoint |
| `<DOCDB_CLUSTER_ENDPOINT>` | DocumentDB console → `cloudhealth-docdb-cluster` → Cluster endpoint |

## Ordre de création des services ECS

1. **kafka-task** (Kafka + Zookeeper ensemble) → Service `kafka-service` avec Service Discovery `kafka.cloud-health.local`
2. **ms-patients-task** → Service `ms-patients-service` derrière `tg-ms-patients`
3. **ms-rendezvous-task** → Service `ms-rendezvous-service` derrière `tg-ms-rendezvous`
4. **ms-dossiers-task** → Service `ms-dossiers-service` derrière `tg-ms-dossiers`

## Comment importer dans la console

1. Console ECS → **Task definitions** → **Create new task definition with JSON**
2. Colle le contenu du JSON
3. **Create**

Sinon via CLI :
```powershell
aws ecs register-task-definition --cli-input-json file://kafka-task.json --region eu-west-3
```

## Pré-requis IAM

Avant de créer les services ECS, il faut un **rôle d'exécution** :
- Nom : `ecsTaskExecutionRole`
- Permissions : `AmazonECSTaskExecutionRolePolicy` (managed AWS)
- Si tu ne l'as pas, ECS te proposera de le créer automatiquement à la première task definition.
