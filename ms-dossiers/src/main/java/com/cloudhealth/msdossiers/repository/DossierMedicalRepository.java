package com.cloudhealth.msdossiers.repository;

import com.cloudhealth.msdossiers.model.DossierMedical;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DossierMedicalRepository extends MongoRepository<DossierMedical, String> {

    Optional<DossierMedical> findByPatientId(Integer patientId);

    List<DossierMedical> findByPatientNomContainingIgnoreCaseOrPatientPrenomContainingIgnoreCase(
            String nom, String prenom);
}
