import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="patients-page">
      <div class="page-header">
        <h1>Gestion des Patients</h1>
        <button class="btn btn-primary" (click)="openModal()">
          <i class="fas fa-plus"></i> Nouveau Patient
        </button>
      </div>

      <!-- Search -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Rechercher un patient..." [(ngModel)]="searchQuery" (input)="onSearch()">
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Date de naissance</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Groupe sanguin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let patient of patients">
                <td><strong>{{ patient.nom }}</strong></td>
                <td>{{ patient.prenom }}</td>
                <td>{{ patient.dateNaissance }}</td>
                <td>{{ patient.telephone }}</td>
                <td>{{ patient.email }}</td>
                <td><span class="badge badge-info">{{ patient.groupeSanguin || '-' }}</span></td>
                <td class="actions">
                  <button class="btn-icon" title="Modifier" (click)="editPatient(patient)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-icon danger" title="Supprimer" (click)="deletePatient(patient.id!)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p *ngIf="patients.length === 0" class="empty">Aucun patient trouvé</p>
      </div>

      <!-- Modal -->
      <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingPatient ? 'Modifier' : 'Nouveau' }} Patient</h2>
            <button class="close-btn" (click)="closeModal()">&times;</button>
          </div>

          <form (ngSubmit)="savePatient()">
            <div class="form-row">
              <div class="form-group">
                <label>Nom *</label>
                <input type="text" [(ngModel)]="form.nom" name="nom" required>
              </div>
              <div class="form-group">
                <label>Prénom *</label>
                <input type="text" [(ngModel)]="form.prenom" name="prenom" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Date de naissance *</label>
                <input type="date" [(ngModel)]="form.dateNaissance" name="dateNaissance" required>
              </div>
              <div class="form-group">
                <label>Sexe</label>
                <select [(ngModel)]="form.sexe" name="sexe">
                  <option value="">Sélectionner</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Téléphone *</label>
                <input type="tel" [(ngModel)]="form.telephone" name="telephone" required>
              </div>
              <div class="form-group">
                <label>Email *</label>
                <input type="email" [(ngModel)]="form.email" name="email" required>
              </div>
            </div>

            <div class="form-group">
              <label>Adresse</label>
              <input type="text" [(ngModel)]="form.adresse" name="adresse">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>N° Sécurité Sociale</label>
                <input type="text" [(ngModel)]="form.numeroSecuriteSociale" name="nss">
              </div>
              <div class="form-group">
                <label>Groupe Sanguin</label>
                <select [(ngModel)]="form.groupeSanguin" name="groupeSanguin">
                  <option value="">Sélectionner</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Allergies</label>
              <textarea [(ngModel)]="form.allergies" name="allergies"></textarea>
            </div>

            <div class="form-group">
              <label>Médecin traitant</label>
              <input type="text" [(ngModel)]="form.medecinTraitant" name="medecinTraitant">
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="closeModal()">Annuler</button>
              <button type="submit" class="btn btn-primary">
                {{ editingPatient ? 'Mettre à jour' : 'Créer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h1 { font-size: 24px; font-weight: 700; }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      background: none;
      border: 1px solid var(--gray-200);
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gray-500);
      transition: all 0.2s ease;

      &:hover { border-color: var(--primary); color: var(--primary); }
      &.danger:hover { border-color: var(--danger); color: var(--danger); }
    }

    .empty { text-align: center; padding: 40px; color: var(--gray-400); }
  `],
})
export class PatientsComponent implements OnInit {
  patients: Patient[] = [];
  showModal = false;
  editingPatient: Patient | null = null;
  searchQuery = '';
  form: Patient = this.getEmptyForm();

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getAll(this.searchQuery || undefined).subscribe({
      next: (res) => { this.patients = res.data || []; },
      error: (err) => console.error('Error loading patients:', err),
    });
  }

  onSearch(): void {
    this.loadPatients();
  }

  openModal(): void {
    this.form = this.getEmptyForm();
    this.editingPatient = null;
    this.showModal = true;
  }

  editPatient(patient: Patient): void {
    this.form = { ...patient };
    this.editingPatient = patient;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingPatient = null;
  }

  savePatient(): void {
    if (this.editingPatient) {
      this.patientService.update(this.editingPatient.id!, this.form).subscribe({
        next: () => { this.closeModal(); this.loadPatients(); },
        error: (err) => console.error('Error updating patient:', err),
      });
    } else {
      this.patientService.create(this.form).subscribe({
        next: () => { this.closeModal(); this.loadPatients(); },
        error: (err) => console.error('Error creating patient:', err),
      });
    }
  }

  deletePatient(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      this.patientService.delete(id).subscribe({
        next: () => this.loadPatients(),
        error: (err) => console.error('Error deleting patient:', err),
      });
    }
  }

  private getEmptyForm(): Patient {
    return {
      nom: '', prenom: '', dateNaissance: '', sexe: '',
      adresse: '', telephone: '', email: '',
      numeroSecuriteSociale: '', groupeSanguin: '',
      allergies: '', medecinTraitant: '',
    };
  }
}
