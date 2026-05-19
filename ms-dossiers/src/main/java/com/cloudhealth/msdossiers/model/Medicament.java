package com.cloudhealth.msdossiers.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Medicament {

    private String nom;
    private String dosage;
    private String frequence;
    private String duree;
    private String instructions;
}
