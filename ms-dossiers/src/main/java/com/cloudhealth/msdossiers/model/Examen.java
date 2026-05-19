package com.cloudhealth.msdossiers.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Examen {

    private String id;
    private String type; // sang, radiographie, IRM, echographie, etc.
    private LocalDate date;
    private String laboratoire;
    private String resultats;
    private String notes;
    private String statut; // en_attente, termine, annule
}
