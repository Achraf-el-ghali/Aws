package com.cloudhealth.msdossiers.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Consultation {

    private String id;
    private LocalDateTime date;
    private String medecinNom;
    private String motif;
    private String diagnostic;
    private String traitement;
    private String notes;
    private String typeConsultation; // generale, specialiste, urgence
}
