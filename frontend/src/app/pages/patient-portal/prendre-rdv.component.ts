import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RendezvousService } from '../../services/rendezvous.service';

@Component({
  selector: 'app-prendre-rdv',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="prendre-rdv">
      <h1>Prendre un Rendez-vous</h1>
      <div class="card">
        <form (ngSubmit)="submitRdv()">
          <div class="form-row">
            <div class="form-group">
              <label>Médecin *</label>
              <select [(ngModel)]="form.medecinNom" name="medecin" required>
                <option value="">Choisir un médecin</option>
                <option value="Dr. Martin">Dr. Martin - Généraliste</option>
                <option value="Dr. Bernard">Dr. Bernard - Cardiologue</option>
                <option value="Dr. Petit">Dr. Petit - Dermatologue</option>
                <option value="Dr. Robert">Dr. Robert - Ophtalmologue</option>
              </select>
            </div>
            <div class="form-group">
              <label>Type de consultation *</label>
              <select [(ngModel)]="form.typeConsultation" name="type" required>
                <option value="generale">Générale</option>
                <option value="specialiste">Spécialiste</option>
                <option value="suivi">Suivi</option>
                <option value="urgence">Urgence</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Date souhaitée *</label>
              <input type="date" [(ngModel)]="form.dateRendezVous" name="date" [min]="minDate" required>
            </div>
            <div class="form-group">
              <label>Créneau horaire *</label>
              <select [(ngModel)]="form.heureDebut" name="heure" required>
                <option value="">Choisir un créneau</option>
                <option value="08:00">08:00 - 08:30</option>
                <option value="08:30">08:30 - 09:00</option>
                <option value="09:00">09:00 - 09:30</option>
                <option value="09:30">09:30 - 10:00</option>
                <option value="10:00">10:00 - 10:30</option>
                <option value="10:30">10:30 - 11:00</option>
                <option value="11:00">11:00 - 11:30</option>
                <option value="14:00">14:00 - 14:30</option>
                <option value="14:30">14:30 - 15:00</option>
                <option value="15:00">15:00 - 15:30</option>
                <option value="15:30">15:30 - 16:00</option>
                <option value="16:00">16:00 - 16:30</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Motif de la consultation</label>
            <textarea [(ngModel)]="form.motif" name="motif" placeholder="Décrivez brièvement le motif..."></textarea>
          </div>
          <div class="success" *ngIf="success">{{ success }}</div>
          <div class="error" *ngIf="error">{{ error }}</div>
          <button type="submit" class="btn btn-primary" [disabled]="loading">
            <i class="fas fa-calendar-check"></i> {{ loading ? 'En cours...' : 'Confirmer le rendez-vous' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 24px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .success { background: #d1fae5; color: #065f46; padding: 12px; border-radius: 8px; margin-bottom: 12px; text-align: center; }
    .error { background: #fef2f2; color: #dc2626; padding: 12px; border-radius: 8px; margin-bottom: 12px; text-align: center; }
  `]
})
export class PrendreRdvComponent {
  minDate = new Date().toISOString().split('T')[0];
  form = { medecinNom: '', typeConsultation: 'generale', dateRendezVous: '', heureDebut: '', motif: '' };
  loading = false; success = ''; error = '';

  constructor(private authService: AuthService, private rdvService: RendezvousService) {}

  submitRdv(): void {
    this.loading = true; this.success = ''; this.error = '';
    const [h, m] = this.form.heureDebut.split(':');
    const heureFin = `${h}:${parseInt(m) + 30 >= 60 ? '00' : (parseInt(m) + 30).toString().padStart(2, '0')}`;
    const payload = {
      patientId: this.authService.currentUser?.id,
      patientNom: `${this.authService.currentUser?.prenom} ${this.authService.currentUser?.nom}`,
      medecinNom: this.form.medecinNom,
      dateRendezVous: this.form.dateRendezVous + 'T00:00:00Z',
      heureDebut: this.form.heureDebut,
      heureFin: heureFin,
      motif: this.form.motif,
      typeConsultation: this.form.typeConsultation,
    };
    this.rdvService.create(payload).subscribe({
      next: () => { this.loading = false; this.success = 'Rendez-vous confirmé avec succès !'; this.form = { medecinNom: '', typeConsultation: 'generale', dateRendezVous: '', heureDebut: '', motif: '' }; },
      error: () => { this.loading = false; this.error = 'Erreur lors de la création du rendez-vous'; }
    });
  }
}
