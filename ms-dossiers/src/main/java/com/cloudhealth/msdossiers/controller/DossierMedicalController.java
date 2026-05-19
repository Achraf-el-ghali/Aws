package com.cloudhealth.msdossiers.controller;

import com.cloudhealth.msdossiers.model.*;
import com.cloudhealth.msdossiers.service.DossierMedicalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dossiers")
@CrossOrigin(origins = "*")
public class DossierMedicalController {

    private final DossierMedicalService service;

    public DossierMedicalController(DossierMedicalService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll(@RequestParam(required = false) String search) {
        List<DossierMedical> dossiers;
        if (search != null && !search.isEmpty()) {
            dossiers = service.search(search);
        } else {
            dossiers = service.findAll();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", dossiers);
        response.put("total", dossiers.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable String id) {
        return service.findById(id)
                .map(dossier -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("data", dossier);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Dossier non trouvé")));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<Map<String, Object>> getByPatientId(@PathVariable Integer patientId) {
        return service.findByPatientId(patientId)
                .map(dossier -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("data", dossier);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Dossier non trouvé pour ce patient")));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody DossierMedical dossier) {
        DossierMedical created = service.create(dossier);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Dossier médical créé avec succès");
        response.put("data", created);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable String id, @RequestBody DossierMedical dossier) {
        return service.update(id, dossier)
                .map(updated -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Dossier médical mis à jour avec succès");
                    response.put("data", updated);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Dossier non trouvé")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable String id) {
        if (service.delete(id)) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Dossier supprimé avec succès"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("success", false, "message", "Dossier non trouvé"));
    }

    // Add consultation to a dossier
    @PostMapping("/{id}/consultations")
    public ResponseEntity<Map<String, Object>> addConsultation(
            @PathVariable String id, @RequestBody Consultation consultation) {
        return service.addConsultation(id, consultation)
                .map(dossier -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Consultation ajoutée avec succès");
                    response.put("data", dossier);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Dossier non trouvé")));
    }

    // Add ordonnance to a dossier
    @PostMapping("/{id}/ordonnances")
    public ResponseEntity<Map<String, Object>> addOrdonnance(
            @PathVariable String id, @RequestBody Ordonnance ordonnance) {
        return service.addOrdonnance(id, ordonnance)
                .map(dossier -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Ordonnance ajoutée avec succès");
                    response.put("data", dossier);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Dossier non trouvé")));
    }

    // Add examen to a dossier
    @PostMapping("/{id}/examens")
    public ResponseEntity<Map<String, Object>> addExamen(
            @PathVariable String id, @RequestBody Examen examen) {
        return service.addExamen(id, examen)
                .map(dossier -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Examen ajouté avec succès");
                    response.put("data", dossier);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Dossier non trouvé")));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", Map.of("totalDossiers", service.count()));
        return ResponseEntity.ok(response);
    }
}
