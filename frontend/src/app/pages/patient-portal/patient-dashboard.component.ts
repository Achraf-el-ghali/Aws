import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RendezvousService } from '../../services/rendezvous.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="patient-dashboard">
      <h1>Bienvenue, {{ authService.currentUser?.prenom }} !</h1>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
          <div class="stat-info">
            <span class="stat-value">{{ nextRdv ? '1' : '0' }}</span>
            <span class="stat-label">Prochain RDV</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon rdv"><i class="fas fa-calendar-alt"></i></div>
          <div class="stat-info">
            <span class="stat-value">{{ totalRdv }}</span>
            <span class="stat-label">Total RDV</span>
          </div>
        </div>
      </div>

      <div class="next-rdv-card card" *ngIf="nextRdv">
        <div class="card-header"><h2><i class="fas fa-clock"></i> Prochain Rendez-vous</h2></div>
        <div class="rdv-details">
          <p><strong>Date :</strong> {{ nextRdv.dateRendezVous | date:'dd/MM/yyyy' }}</p>
          <p><strong>Heure :</strong> {{ nextRdv.heureDebut }} - {{ nextRdv.heureFin }}</p>
          <p><strong>Médecin :</strong> {{ nextRdv.medecinNom }}</p>
          <p><strong>Motif :</strong> {{ nextRdv.motif || 'Non précisé' }}</p>
          <span class="badge badge-info">{{ nextRdv.statut }}</span>
        </div>
      </div>

      <div class="card" *ngIf="!nextRdv">
        <p class="no-rdv"><i class="fas fa-calendar-times"></i> Aucun rendez-vous à venir</p>
      </div>

      <div class="quick-actions">
        <a routerLink="/patient/prendre-rdv" class="action-card">
          <i class="fas fa-calendar-plus"></i><span>Prendre un RDV</span>
        </a>
        <a routerLink="/patient/mes-rdv" class="action-card">
          <i class="fas fa-list"></i><span>Voir mes RDV</span>
        </a>
        <a routerLink="/patient/mon-dossier" class="action-card">
          <i class="fas fa-file-medical"></i><span>Mon Dossier</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 24px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .stat-icon { width: 48px; height: 48px; border-radius: 10px; background: #dbeafe; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 20px;
      &.rdv { background: #d1fae5; color: #059669; } }
    .stat-value { font-size: 24px; font-weight: 700; display: block; }
    .stat-label { font-size: 12px; color: #64748b; }
    .next-rdv-card { margin-bottom: 24px; }
    .rdv-details p { margin: 8px 0; font-size: 14px; }
    .no-rdv { text-align: center; padding: 32px; color: #94a3b8; font-size: 15px; i { margin-right: 8px; } }
    .quick-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-top: 24px; }
    .action-card { background: white; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 12px; text-decoration: none; color: #475569; transition: all 0.2s;
      i { font-size: 28px; color: #2563eb; }
      &:hover { border-color: #2563eb; background: #dbeafe; } }
  `]
})
export class PatientDashboardComponent implements OnInit {
  nextRdv: any = null;
  totalRdv = 0;
  constructor(public authService: AuthService, private rdvService: RendezvousService) {}
  ngOnInit(): void {
    const patientId = this.authService.currentUser?.id;
    this.rdvService.getAll({ patientId }).subscribe({
      next: (res) => {
        const rdvs = res.data || [];
        this.totalRdv = rdvs.length;
        const now = new Date();
        this.nextRdv = rdvs.find((r: any) => new Date(r.dateRendezVous) >= now) || null;
      },
      error: () => {}
    });
  }
}
