import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { RendezvousService } from '../../services/rendezvous.service';
import { DossierService } from '../../services/dossier.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <h1 class="page-heading">Tableau de Bord</h1>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card stat-patients">
          <div class="stat-icon"><i class="fas fa-users"></i></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.totalPatients }}</span>
            <span class="stat-label">Patients</span>
          </div>
        </div>
        <div class="stat-card stat-rdv">
          <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.totalRendezVous }}</span>
            <span class="stat-label">Rendez-vous</span>
          </div>
        </div>
        <div class="stat-card stat-dossiers">
          <div class="stat-icon"><i class="fas fa-folder-open"></i></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.totalDossiers }}</span>
            <span class="stat-label">Dossiers</span>
          </div>
        </div>
        <div class="stat-card stat-confirmes">
          <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.confirmes }}</span>
            <span class="stat-label">RDV Confirmés</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Actions rapides</h2>
        <div class="actions-grid">
          <a routerLink="/admin/patients" class="action-card">
            <i class="fas fa-user-plus"></i>
            <span>Nouveau Patient</span>
          </a>
          <a routerLink="/admin/rendezvous" class="action-card">
            <i class="fas fa-calendar-plus"></i>
            <span>Nouveau RDV</span>
          </a>
          <a routerLink="/admin/dossiers" class="action-card">
            <i class="fas fa-file-medical"></i>
            <span>Nouveau Dossier</span>
          </a>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-section">
        <div class="card">
          <div class="card-header">
            <h2>Rendez-vous récents</h2>
            <a routerLink="/admin/rendezvous" class="btn btn-outline">Voir tout</a>
          </div>
          <div class="table-container" *ngIf="recentRdv.length > 0">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Médecin</th>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let rdv of recentRdv">
                  <td>{{ rdv.patientNom }}</td>
                  <td>{{ rdv.medecinNom }}</td>
                  <td>{{ rdv.dateRendezVous | date:'dd/MM/yyyy' }}</td>
                  <td>{{ rdv.heureDebut }}</td>
                  <td>
                    <span class="badge" [ngClass]="{
                      'badge-info': rdv.statut === 'planifie',
                      'badge-success': rdv.statut === 'confirme',
                      'badge-danger': rdv.statut === 'annule',
                      'badge-primary': rdv.statut === 'termine'
                    }">{{ rdv.statut }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p *ngIf="recentRdv.length === 0" class="empty-state">Aucun rendez-vous récent</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-heading {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 24px;
      color: var(--gray-800);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      border-radius: var(--radius);
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: var(--shadow);
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .stat-patients .stat-icon { background: #dbeafe; color: #2563eb; }
    .stat-rdv .stat-icon { background: #d1fae5; color: #059669; }
    .stat-dossiers .stat-icon { background: #fef3c7; color: #d97706; }
    .stat-confirmes .stat-icon { background: #cffafe; color: #0891b2; }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--gray-800);
    }

    .stat-label {
      font-size: 13px;
      color: var(--gray-500);
      margin-top: 2px;
    }

    .quick-actions {
      margin-bottom: 32px;

      h2 { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
    }

    .action-card {
      background: white;
      border: 2px dashed var(--gray-200);
      border-radius: var(--radius);
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: var(--gray-600);
      transition: all 0.2s ease;

      i { font-size: 28px; color: var(--primary); }

      &:hover {
        border-color: var(--primary);
        background: var(--primary-light);
        color: var(--primary-dark);
      }
    }

    .recent-section { margin-bottom: 32px; }
    .empty-state { text-align: center; padding: 32px; color: var(--gray-400); }
  `],
})
export class DashboardComponent implements OnInit {
  stats = {
    totalPatients: 0,
    totalRendezVous: 0,
    totalDossiers: 0,
    confirmes: 0,
  };
  recentRdv: any[] = [];

  constructor(
    private patientService: PatientService,
    private rendezvousService: RendezvousService,
    private dossierService: DossierService,
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentRdv();
  }

  loadStats(): void {
    this.patientService.getStats().subscribe({
      next: (res) => { this.stats.totalPatients = res.data?.totalPatients || 0; },
      error: () => {},
    });
    this.rendezvousService.getStats().subscribe({
      next: (res) => {
        this.stats.totalRendezVous = res.data?.totalRendezVous || 0;
        this.stats.confirmes = res.data?.confirmes || 0;
      },
      error: () => {},
    });
    this.dossierService.getStats().subscribe({
      next: (res) => { this.stats.totalDossiers = res.data?.totalDossiers || 0; },
      error: () => {},
    });
  }

  loadRecentRdv(): void {
    this.rendezvousService.getAll().subscribe({
      next: (res) => { this.recentRdv = (res.data || []).slice(0, 5); },
      error: () => {},
    });
  }
}
