package com.cloudhealth.msdossiers.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ordonnance {

    private String id;
    private LocalDate dateEmission;
    private String medecinNom;
    private List<Medicament> medicaments;
    private String notes;
    private boolean active;
}
