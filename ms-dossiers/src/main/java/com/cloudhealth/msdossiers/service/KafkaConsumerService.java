package com.cloudhealth.msdossiers.service;

import com.cloudhealth.msdossiers.model.DossierMedical;
import com.cloudhealth.msdossiers.repository.DossierMedicalRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

@Service
public class KafkaConsumerService {

    private static final Logger logger = LoggerFactory.getLogger(KafkaConsumerService.class);
    private final DossierMedicalRepository repository;
    private final ObjectMapper objectMapper;

    public KafkaConsumerService(DossierMedicalRepository repository) {
        this.repository = repository;
        this.objectMapper = new ObjectMapper();
    }

    @KafkaListener(topics = "rendezvous.events", groupId = "ms-dossiers-group")
    public void handleRendezVousEvent(String message) {
        try {
            JsonNode root = objectMapper.readTree(message);
            String eventKey = root.get("key").asText();

            if ("rendezvous.created".equals(eventKey)) {
                JsonNode data = root.get("data");
                int patientId = data.get("patientId").asInt();
                String patientNom = extractPatientNom(data);
                String patientPrenom = extractPatientPrenom(data);

                // Check if dossier already exists for this patient
                Optional<DossierMedical> existing = repository.findByPatientId(patientId);

                if (existing.isEmpty()) {
                    // Auto-create a dossier skeleton
                    DossierMedical dossier = new DossierMedical();
                    dossier.setPatientId(patientId);
                    dossier.setPatientNom(patientNom);
                    dossier.setPatientPrenom(patientPrenom);
                    dossier.setAllergies(new ArrayList<>());
                    dossier.setAntecedents(new ArrayList<>());
                    dossier.setConsultations(new ArrayList<>());
                    dossier.setOrdonnances(new ArrayList<>());
                    dossier.setExamens(new ArrayList<>());
                    dossier.setNotes("Dossier créé automatiquement lors de la prise du premier rendez-vous");
                    dossier.setCreatedAt(LocalDateTime.now());
                    dossier.setUpdatedAt(LocalDateTime.now());

                    repository.save(dossier);
                    logger.info("Auto-created dossier for patient {} (ID: {})", patientNom, patientId);
                } else {
                    logger.info("Dossier already exists for patient ID: {}", patientId);
                }
            }
        } catch (Exception e) {
            logger.error("Error processing Kafka event: {}", e.getMessage());
        }
    }

    private String extractPatientNom(JsonNode data) {
        if (data.has("patientNom")) {
            String fullName = data.get("patientNom").asText();
            String[] parts = fullName.split(" ");
            return parts.length > 1 ? parts[parts.length - 1] : fullName;
        }
        return "Inconnu";
    }

    private String extractPatientPrenom(JsonNode data) {
        if (data.has("patientNom")) {
            String fullName = data.get("patientNom").asText();
            String[] parts = fullName.split(" ");
            return parts.length > 1 ? parts[0] : "";
        }
        return "";
    }
}
