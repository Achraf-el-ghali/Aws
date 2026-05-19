package com.cloudhealth.msdossiers.service;

import com.cloudhealth.msdossiers.model.*;
import com.cloudhealth.msdossiers.repository.DossierMedicalRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DossierMedicalService {

    private final DossierMedicalRepository repository;
    private final KafkaProducerService kafkaProducer;

    public DossierMedicalService(DossierMedicalRepository repository, KafkaProducerService kafkaProducer) {
        this.repository = repository;
        this.kafkaProducer = kafkaProducer;
    }

    public List<DossierMedical> findAll() {
        return repository.findAll();
    }

    public Optional<DossierMedical> findById(String id) {
        return repository.findById(id);
    }

    public Optional<DossierMedical> findByPatientId(Integer patientId) {
        return repository.findByPatientId(patientId);
    }

    public List<DossierMedical> search(String query) {
        return repository.findByPatientNomContainingIgnoreCaseOrPatientPrenomContainingIgnoreCase(query, query);
    }

    public DossierMedical create(DossierMedical dossier) {
        dossier.setCreatedAt(LocalDateTime.now());
        dossier.setUpdatedAt(LocalDateTime.now());
        DossierMedical saved = repository.save(dossier);
        kafkaProducer.produce("dossier.events", "dossier.created", saved);
        return saved;
    }

    public Optional<DossierMedical> update(String id, DossierMedical updatedDossier) {
        return repository.findById(id).map(existing -> {
            if (updatedDossier.getGroupeSanguin() != null) existing.setGroupeSanguin(updatedDossier.getGroupeSanguin());
            if (updatedDossier.getAllergies() != null) existing.setAllergies(updatedDossier.getAllergies());
            if (updatedDossier.getAntecedents() != null) existing.setAntecedents(updatedDossier.getAntecedents());
            if (updatedDossier.getNotes() != null) existing.setNotes(updatedDossier.getNotes());
            existing.setUpdatedAt(LocalDateTime.now());
            DossierMedical saved = repository.save(existing);
            kafkaProducer.produce("dossier.events", "dossier.updated", saved);
            return saved;
        });
    }

    public boolean delete(String id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            kafkaProducer.produce("dossier.events", "dossier.deleted", id);
            return true;
        }
        return false;
    }

    // Add consultation to dossier
    public Optional<DossierMedical> addConsultation(String dossierId, Consultation consultation) {
        return repository.findById(dossierId).map(dossier -> {
            consultation.setId(UUID.randomUUID().toString());
            if (consultation.getDate() == null) consultation.setDate(LocalDateTime.now());
            dossier.getConsultations().add(consultation);
            dossier.setUpdatedAt(LocalDateTime.now());
            return repository.save(dossier);
        });
    }

    // Add ordonnance to dossier
    public Optional<DossierMedical> addOrdonnance(String dossierId, Ordonnance ordonnance) {
        return repository.findById(dossierId).map(dossier -> {
            ordonnance.setId(UUID.randomUUID().toString());
            ordonnance.setActive(true);
            dossier.getOrdonnances().add(ordonnance);
            dossier.setUpdatedAt(LocalDateTime.now());
            return repository.save(dossier);
        });
    }

    // Add examen to dossier
    public Optional<DossierMedical> addExamen(String dossierId, Examen examen) {
        return repository.findById(dossierId).map(dossier -> {
            examen.setId(UUID.randomUUID().toString());
            if (examen.getStatut() == null) examen.setStatut("en_attente");
            dossier.getExamens().add(examen);
            dossier.setUpdatedAt(LocalDateTime.now());
            return repository.save(dossier);
        });
    }

    public long count() {
        return repository.count();
    }
}
