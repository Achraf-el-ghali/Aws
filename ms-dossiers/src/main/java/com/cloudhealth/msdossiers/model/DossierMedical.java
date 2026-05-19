package com.cloudhealth.msdossiers.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "dossiers_medicaux")
public class DossierMedical {

    @Id
    private String id;

    @NotNull(message = "L'ID du patient est obligatoire")
    @Indexed
    private Integer patientId;

    @NotBlank(message = "Le nom du patient est obligatoire")
    private String patientNom;

    @NotBlank(message = "Le prénom du patient est obligatoire")
    private String patientPrenom;

    private String groupeSanguin;

    private List<String> allergies = new ArrayList<>();

    private List<String> antecedents = new ArrayList<>();

    private List<Consultation> consultations = new ArrayList<>();

    private List<Ordonnance> ordonnances = new ArrayList<>();

    private List<Examen> examens = new ArrayList<>();

    private String notes;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
