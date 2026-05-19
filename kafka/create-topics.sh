#!/bin/bash
# Wait for Kafka to be ready
echo "Waiting for Kafka to be ready..."
sleep 10

# Create topics
kafka-topics --create --if-not-exists --topic patient.events --bootstrap-server kafka:29092 --partitions 3 --replication-factor 1
kafka-topics --create --if-not-exists --topic rendezvous.events --bootstrap-server kafka:29092 --partitions 3 --replication-factor 1
kafka-topics --create --if-not-exists --topic dossier.events --bootstrap-server kafka:29092 --partitions 3 --replication-factor 1

echo "Topics created successfully!"
kafka-topics --list --bootstrap-server kafka:29092
