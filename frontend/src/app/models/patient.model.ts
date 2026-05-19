export interface Patient {
  id?: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe?: string;
  adresse?: string;
  telephone: string;
  email: string;
  numeroSecuriteSociale?: string;
  groupeSanguin?: string;
  allergies?: string;
  medecinTraitant?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RendezVous {
  id?: number;
  patientId: number;
  patientNom: string;
  medecinNom: string;
  dateRendezVous: string;
  heureDebut: string;
  heureFin: string;
  statut: string;
  motif?: string;
  notes?: string;
  lieu?: string;
  typeConsultation: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DossierMedical {
  id?: string;
  patientId: number;
  patientNom: string;
  patientPrenom: string;
  groupeSanguin?: string;
  allergies: string[];
  antecedents: string[];
  consultations: Consultation[];
  ordonnances: Ordonnance[];
  examens: Examen[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Consultation {
  id?: string;
  date: string;
  medecinNom: string;
  motif: string;
  diagnostic: string;
  traitement: string;
  notes?: string;
  typeConsultation: string;
}

export interface Ordonnance {
  id?: string;
  dateEmission: string;
  medecinNom: string;
  medicaments: Medicament[];
  notes?: string;
  active: boolean;
}

export interface Medicament {
  nom: string;
  dosage: string;
  frequence: string;
  duree: string;
  instructions?: string;
}

export interface Examen {
  id?: string;
  type: string;
  date: string;
  laboratoire?: string;
  resultats?: string;
  notes?: string;
  statut: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  total?: number;
}
