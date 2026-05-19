import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RendezvousService } from '../../services/rendezvous.service';

@Component({
  selector: 'app-prendre-rdv',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <!-- Step Indicator -->
      <div class="steps-header">
        <div class="step" [class.active]="currentStep >= 1" [class.completed]="currentStep > 1" (click)="goToStep(1)">
          <div class="step-circle">
            <span *ngIf="currentStep <= 1">1</span>
            <i *ngIf="currentStep > 1" class="fas fa-check"></i>
          </div>
          <span class="step-label">Médecin</span>
        </div>
        <div class="step-line" [class.active]="currentStep > 1"></div>
        <div class="step" [class.active]="currentStep >= 2" [class.completed]="currentStep > 2" (click)="currentStep > 1 ? goToStep(2) : null">
          <div class="step-circle">
            <span *ngIf="currentStep <= 2">2</span>
            <i *ngIf="currentStep > 2" class="fas fa-check"></i>
          </div>
          <span class="step-label">Date & Heure</span>
        </div>
        <div class="step-line" [class.active]="currentStep > 2"></div>
        <div class="step" [class.active]="currentStep >= 3">
          <div class="step-circle">3</div>
          <span class="step-label">Confirmation</span>
        </div>
      </div>


      <!-- Step 1: Choose Doctor -->
      <div class="step-content" *ngIf="currentStep === 1">
        <div class="card main-card">
          <h2 class="card-title">
            <svg width="24" height="24" fill="none" stroke="#2563EB" stroke-width="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            Choisissez votre médecin
          </h2>
          <p class="card-subtitle">Sélectionnez le praticien pour votre consultation</p>

          <div class="doctors-grid">
            <div class="doctor-card" *ngFor="let doc of doctors"
                 [class.selected]="form.medecinNom === doc.name"
                 (click)="selectDoctor(doc)">
              <div class="doctor-avatar" [style.background]="doc.color">{{ doc.initials }}</div>
              <div class="doctor-info">
                <h4>{{ doc.name }}</h4>
                <span class="doctor-specialty">{{ doc.specialty }}</span>
              </div>
              <div class="check-icon" *ngIf="form.medecinNom === doc.name">
                <svg width="20" height="20" fill="#2563EB" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              </div>
            </div>
          </div>

          <div class="form-group" style="margin-top: 24px;">
            <label class="form-label">Type de consultation</label>
            <div class="type-pills">
              <button *ngFor="let t of consultationTypes" class="type-pill"
                      [class.active]="form.typeConsultation === t.value"
                      (click)="form.typeConsultation = t.value">
                {{ t.label }}
              </button>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn btn-primary" [disabled]="!form.medecinNom" (click)="nextStep()">
              Continuer
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>


      <!-- Step 2: Choose Date & Time -->
      <div class="step-content" *ngIf="currentStep === 2">
        <div class="card main-card">
          <h2 class="card-title">
            <svg width="24" height="24" fill="none" stroke="#2563EB" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            Choisissez la date et l'heure
          </h2>
          <p class="card-subtitle">Sélectionnez un créneau disponible</p>

          <div class="datetime-section">
            <div class="date-picker-wrapper">
              <label class="form-label">Date souhaitée</label>
              <input type="date" class="date-input" [(ngModel)]="form.dateRendezVous" [min]="minDate" name="date">
            </div>

            <div class="time-section" *ngIf="form.dateRendezVous">
              <label class="form-label">Créneaux disponibles</label>
              <div class="time-slots-grid">
                <button *ngFor="let slot of timeSlots" class="time-slot"
                        [class.selected]="form.heureDebut === slot.value"
                        (click)="form.heureDebut = slot.value">
                  {{ slot.label }}
                </button>
              </div>
            </div>
          </div>

          <div class="form-group" style="margin-top: 24px;">
            <label class="form-label">Motif de la consultation (optionnel)</label>
            <textarea class="form-textarea" [(ngModel)]="form.motif" name="motif"
                      placeholder="Décrivez brièvement la raison de votre visite..."></textarea>
          </div>

          <div class="card-actions">
            <button class="btn btn-secondary" (click)="prevStep()">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
              Retour
            </button>
            <button class="btn btn-primary" [disabled]="!form.dateRendezVous || !form.heureDebut" (click)="nextStep()">
              Continuer
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>


      <!-- Step 3: Confirmation -->
      <div class="step-content" *ngIf="currentStep === 3">
        <div class="card main-card">
          <h2 class="card-title">
            <svg width="24" height="24" fill="none" stroke="#2563EB" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Confirmez votre rendez-vous
          </h2>
          <p class="card-subtitle">Vérifiez les détails avant de confirmer</p>

          <div class="confirmation-card">
            <div class="confirm-row">
              <div class="confirm-icon">
                <svg width="20" height="20" fill="none" stroke="#2563EB" stroke-width="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
              <div>
                <span class="confirm-label">Médecin</span>
                <span class="confirm-value">{{ form.medecinNom }}</span>
              </div>
            </div>
            <div class="confirm-row">
              <div class="confirm-icon">
                <svg width="20" height="20" fill="none" stroke="#2563EB" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              </div>
              <div>
                <span class="confirm-label">Date</span>
                <span class="confirm-value">{{ form.dateRendezVous | date:'EEEE d MMMM yyyy' }}</span>
              </div>
            </div>
            <div class="confirm-row">
              <div class="confirm-icon">
                <svg width="20" height="20" fill="none" stroke="#2563EB" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <div>
                <span class="confirm-label">Horaire</span>
                <span class="confirm-value">{{ form.heureDebut }} - {{ getHeureFin() }}</span>
              </div>
            </div>
            <div class="confirm-row">
              <div class="confirm-icon">
                <svg width="20" height="20" fill="none" stroke="#2563EB" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              </div>
              <div>
                <span class="confirm-label">Type</span>
                <span class="confirm-value">{{ getTypeLabel() }}</span>
              </div>
            </div>
            <div class="confirm-row" *ngIf="form.motif">
              <div class="confirm-icon">
                <svg width="20" height="20" fill="none" stroke="#2563EB" stroke-width="2" viewBox="0 0 24 24"><path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
              </div>
              <div>
                <span class="confirm-label">Motif</span>
                <span class="confirm-value">{{ form.motif }}</span>
              </div>
            </div>
          </div>

          <div class="alert alert-success" *ngIf="success">
            <svg width="20" height="20" fill="#10B981" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            {{ success }}
          </div>
          <div class="alert alert-error" *ngIf="error">
            <svg width="20" height="20" fill="#EF4444" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
            {{ error }}
          </div>

          <div class="card-actions">
            <button class="btn btn-secondary" (click)="prevStep()" [disabled]="loading">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
              Retour
            </button>
            <button class="btn btn-primary btn-confirm" (click)="submitRdv()" [disabled]="loading">
              <svg *ngIf="!loading" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
              <span *ngIf="loading" class="spinner"></span>
              {{ loading ? 'Confirmation...' : 'Confirmer le rendez-vous' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,

  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }

    .page-container { max-width: 900px; margin: 0 auto; padding: 0 16px; animation: fadeIn 0.4s ease; }

    .steps-header {
      display: flex; align-items: center; justify-content: center; margin-bottom: 32px; padding: 24px;
      background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    }
    .step { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; position: relative; }
    .step-circle {
      width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-weight: 600; font-size: 14px; background: #E2E8F0; color: #64748B; transition: all 0.3s ease;
    }
    .step.active .step-circle { background: #2563EB; color: white; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
    .step.completed .step-circle { background: #10B981; color: white; }
    .step-label { font-size: 12px; font-weight: 500; color: #94A3B8; transition: color 0.3s; }
    .step.active .step-label { color: #2563EB; font-weight: 600; }
    .step.completed .step-label { color: #10B981; }
    .step-line { flex: 1; height: 3px; background: #E2E8F0; margin: 0 12px; border-radius: 2px; transition: background 0.3s; max-width: 80px; }
    .step-line.active { background: #10B981; }

    .step-content { animation: slideUp 0.4s ease; }


    .main-card {
      background: white; border-radius: 20px; padding: 32px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.04);
    }
    .card-title {
      font-size: 22px; font-weight: 700; color: #1E293B; margin-bottom: 6px;
      display: flex; align-items: center; gap: 12px;
    }
    .card-subtitle { font-size: 14px; color: #64748B; margin-bottom: 28px; padding-left: 36px; }

    .doctors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
    .doctor-card {
      display: flex; align-items: center; gap: 14px; padding: 16px 20px; border-radius: 14px;
      border: 2px solid #E2E8F0; cursor: pointer; transition: all 0.25s ease; position: relative;
    }
    .doctor-card:hover { border-color: #93C5FD; transform: translateY(-2px); box-shadow: 0 4px 16px rgba(37,99,235,0.1); }
    .doctor-card.selected { border-color: #2563EB; background: #EFF6FF; box-shadow: 0 4px 16px rgba(37,99,235,0.15); }
    .doctor-avatar {
      width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 15px; flex-shrink: 0;
    }
    .doctor-info h4 { font-size: 14px; font-weight: 600; color: #1E293B; margin: 0; }
    .doctor-specialty { font-size: 12px; color: #64748B; }
    .check-icon { position: absolute; top: 12px; right: 12px; }

    .type-pills { display: flex; flex-wrap: wrap; gap: 10px; }
    .type-pill {
      padding: 8px 18px; border-radius: 20px; border: 2px solid #E2E8F0; background: white;
      font-size: 13px; font-weight: 500; color: #475569; cursor: pointer; transition: all 0.2s;
    }
    .type-pill:hover { border-color: #93C5FD; color: #2563EB; }
    .type-pill.active { background: #2563EB; color: white; border-color: #2563EB; box-shadow: 0 2px 8px rgba(37,99,235,0.3); }


    .form-label { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; display: block; }
    .datetime-section { display: grid; grid-template-columns: 1fr; gap: 24px; }
    .date-picker-wrapper { max-width: 300px; }
    .date-input {
      width: 100%; padding: 12px 16px; border: 2px solid #E2E8F0; border-radius: 12px;
      font-size: 14px; color: #1E293B; transition: border-color 0.2s; outline: none;
    }
    .date-input:focus { border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

    .time-slots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
    .time-slot {
      padding: 10px 14px; border-radius: 10px; border: 2px solid #E2E8F0; background: white;
      font-size: 13px; font-weight: 500; color: #475569; cursor: pointer; text-align: center; transition: all 0.2s;
    }
    .time-slot:hover { border-color: #93C5FD; background: #F0F7FF; transform: translateY(-1px); }
    .time-slot.selected { background: #2563EB; color: white; border-color: #2563EB; box-shadow: 0 3px 10px rgba(37,99,235,0.3); }

    .form-textarea {
      width: 100%; padding: 14px 16px; border: 2px solid #E2E8F0; border-radius: 12px;
      font-size: 14px; color: #1E293B; resize: vertical; min-height: 80px; outline: none;
      font-family: inherit; transition: border-color 0.2s;
    }
    .form-textarea:focus { border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

    .confirmation-card {
      background: #F8FAFC; border-radius: 16px; padding: 24px; margin-bottom: 24px;
      border: 1px solid #E2E8F0;
    }
    .confirm-row { display: flex; align-items: flex-start; gap: 14px; padding: 12px 0; border-bottom: 1px solid #E2E8F0; }
    .confirm-row:last-child { border-bottom: none; }
    .confirm-icon { width: 36px; height: 36px; background: #EFF6FF; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .confirm-label { display: block; font-size: 12px; color: #64748B; margin-bottom: 2px; }
    .confirm-value { font-size: 15px; font-weight: 600; color: #1E293B; }


    .card-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 28px; padding-top: 20px; border-top: 1px solid #F1F5F9; }
    .btn {
      display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 10px;
      font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.25s ease;
    }
    .btn-primary {
      background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); color: white;
      box-shadow: 0 4px 14px rgba(37,99,235,0.3);
    }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.4); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .btn-secondary { background: #F1F5F9; color: #475569; }
    .btn-secondary:hover:not(:disabled) { background: #E2E8F0; }
    .btn-confirm { padding: 14px 32px; font-size: 15px; }

    .alert {
      display: flex; align-items: center; gap: 10px; padding: 14px 18px; border-radius: 12px;
      font-size: 14px; font-weight: 500; margin-bottom: 16px; animation: fadeIn 0.3s ease;
    }
    .alert-success { background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; }
    .alert-error { background: #FEF2F2; color: #991B1B; border: 1px solid #FECACA; }

    .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }

    .form-group { margin-bottom: 0; }

    @media (max-width: 640px) {
      .doctors-grid { grid-template-columns: 1fr; }
      .time-slots-grid { grid-template-columns: repeat(3, 1fr); }
      .card-actions { flex-direction: column; }
      .btn { justify-content: center; }
    }
  `]
})

export class PrendreRdvComponent {
  currentStep = 1;
  minDate = new Date().toISOString().split('T')[0];
  form = { medecinNom: '', typeConsultation: 'generale', dateRendezVous: '', heureDebut: '', motif: '' };
  loading = false;
  success = '';
  error = '';

  doctors = [
    { name: 'Dr. Martin', specialty: 'Médecine Générale', initials: 'PM', color: 'linear-gradient(135deg, #2563EB, #7C3AED)' },
    { name: 'Dr. Bernard', specialty: 'Cardiologie', initials: 'AB', color: 'linear-gradient(135deg, #DC2626, #F59E0B)' },
    { name: 'Dr. Petit', specialty: 'Dermatologie', initials: 'SP', color: 'linear-gradient(135deg, #10B981, #06B6D4)' },
    { name: 'Dr. Robert', specialty: 'Ophtalmologie', initials: 'LR', color: 'linear-gradient(135deg, #8B5CF6, #EC4899)' },
  ];

  consultationTypes = [
    { value: 'generale', label: 'Générale' },
    { value: 'specialiste', label: 'Spécialiste' },
    { value: 'suivi', label: 'Suivi' },
    { value: 'urgence', label: 'Urgence' },
  ];

  timeSlots = [
    { value: '08:00', label: '08:00' }, { value: '08:30', label: '08:30' },
    { value: '09:00', label: '09:00' }, { value: '09:30', label: '09:30' },
    { value: '10:00', label: '10:00' }, { value: '10:30', label: '10:30' },
    { value: '11:00', label: '11:00' }, { value: '14:00', label: '14:00' },
    { value: '14:30', label: '14:30' }, { value: '15:00', label: '15:00' },
    { value: '15:30', label: '15:30' }, { value: '16:00', label: '16:00' },
  ];

  constructor(private authService: AuthService, private rdvService: RendezvousService) {}

  selectDoctor(doc: any): void { this.form.medecinNom = doc.name; }

  nextStep(): void { if (this.currentStep < 3) this.currentStep++; }
  prevStep(): void { if (this.currentStep > 1) this.currentStep--; }
  goToStep(step: number): void { if (step <= this.currentStep) this.currentStep = step; }

  getHeureFin(): string {
    if (!this.form.heureDebut) return '';
    const [h, m] = this.form.heureDebut.split(':').map(Number);
    const totalMin = h * 60 + m + 30;
    return `${Math.floor(totalMin / 60).toString().padStart(2, '0')}:${(totalMin % 60).toString().padStart(2, '0')}`;
  }

  getTypeLabel(): string {
    return this.consultationTypes.find(t => t.value === this.form.typeConsultation)?.label || '';
  }

  submitRdv(): void {
    this.loading = true;
    this.success = '';
    this.error = '';
    const payload = {
      patientId: this.authService.currentUser?.id,
      patientNom: `${this.authService.currentUser?.prenom} ${this.authService.currentUser?.nom}`,
      medecinNom: this.form.medecinNom,
      dateRendezVous: this.form.dateRendezVous + 'T00:00:00Z',
      heureDebut: this.form.heureDebut,
      heureFin: this.getHeureFin(),
      motif: this.form.motif,
      typeConsultation: this.form.typeConsultation,
    };
    this.rdvService.create(payload).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Rendez-vous confirmé avec succès ! Vous recevrez une confirmation par email.';
      },
      error: () => {
        this.loading = false;
        this.error = 'Une erreur est survenue lors de la prise de rendez-vous. Veuillez réessayer.';
      }
    });
  }
}
