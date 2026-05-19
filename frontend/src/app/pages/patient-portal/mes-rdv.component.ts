import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RendezvousService } from '../../services/rendezvous.service';

@Component({
  selector: 'app-mes-rdv',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Mes Rendez-vous</h1>
          <p class="page-subtitle">Gérez et suivez tous vos rendez-vous médicaux</p>
        </div>
        <a routerLink="/patient/prendre-rdv" class="btn btn-primary">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
          Nouveau RDV
        </a>
      </div>


      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button class="filter-tab" [class.active]="activeFilter === 'tous'" (click)="setFilter('tous')">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          Tous
          <span class="tab-count">{{ rendezvous.length }}</span>
        </button>
        <button class="filter-tab" [class.active]="activeFilter === 'avenir'" (click)="setFilter('avenir')">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          À venir
          <span class="tab-count">{{ getCountByFilter('avenir') }}</span>
        </button>
        <button class="filter-tab" [class.active]="activeFilter === 'passes'" (click)="setFilter('passes')">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Passés
          <span class="tab-count">{{ getCountByFilter('passes') }}</span>
        </button>
        <button class="filter-tab" [class.active]="activeFilter === 'annules'" (click)="setFilter('annules')">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Annulés
          <span class="tab-count">{{ getCountByFilter('annules') }}</span>
        </button>
      </div>

      <!-- Appointments List -->
      <div class="rdv-list" *ngIf="filteredRdv.length > 0">
        <div class="rdv-card" *ngFor="let rdv of filteredRdv; let i = index" [style.animation-delay]="i * 60 + 'ms'">
          <div class="rdv-card-left">
            <div class="doctor-avatar" [style.background]="getDoctorColor(rdv.medecinNom)">
              {{ getDoctorInitials(rdv.medecinNom) }}
            </div>
            <div class="rdv-info">
              <h4 class="rdv-doctor">{{ rdv.medecinNom }}</h4>
              <p class="rdv-motif">{{ rdv.motif || 'Consultation médicale' }}</p>
            </div>
          </div>
          <div class="rdv-card-center">
            <div class="rdv-date-block">
              <svg width="16" height="16" fill="none" stroke="#64748B" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              <span>{{ rdv.dateRendezVous | date:'dd MMM yyyy' }}</span>
            </div>
            <div class="rdv-time-block">
              <svg width="16" height="16" fill="none" stroke="#64748B" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <span>{{ rdv.heureDebut }} - {{ rdv.heureFin }}</span>
            </div>
          </div>
          <div class="rdv-card-right">
            <span class="badge badge-type">{{ rdv.typeConsultation }}</span>
            <span class="badge" [ngClass]="getStatusClass(rdv.statut)">{{ getStatusLabel(rdv.statut) }}</span>
          </div>
        </div>
      </div>


      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredRdv.length === 0 && !loading">
        <div class="empty-icon">
          <svg width="64" height="64" fill="none" stroke="#CBD5E1" stroke-width="1.5" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
          </svg>
        </div>
        <h3 class="empty-title">Aucun rendez-vous</h3>
        <p class="empty-text">{{ getEmptyMessage() }}</p>
        <a routerLink="/patient/prendre-rdv" class="btn btn-primary" style="margin-top: 16px;">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
          Prendre un rendez-vous
        </a>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <div class="loading-spinner"></div>
        <p>Chargement de vos rendez-vous...</p>
      </div>
    </div>
  `,

  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }

    .page-container { max-width: 900px; margin: 0 auto; padding: 0 16px; animation: fadeIn 0.4s ease; }

    .page-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px;
    }
    .page-title { font-size: 26px; font-weight: 700; color: #1E293B; margin: 0; }
    .page-subtitle { font-size: 14px; color: #64748B; margin-top: 4px; }

    .btn {
      display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 10px;
      font-size: 14px; font-weight: 600; cursor: pointer; border: none; text-decoration: none; transition: all 0.25s ease;
    }
    .btn-primary {
      background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); color: white;
      box-shadow: 0 4px 14px rgba(37,99,235,0.3);
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.4); }

    .filter-tabs {
      display: flex; gap: 6px; background: white; padding: 6px; border-radius: 14px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.04); margin-bottom: 24px; flex-wrap: wrap;
    }
    .filter-tab {
      display: flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 10px;
      border: none; background: transparent; font-size: 13px; font-weight: 500;
      color: #64748B; cursor: pointer; transition: all 0.2s ease;
    }
    .filter-tab:hover { background: #F1F5F9; color: #374151; }
    .filter-tab.active { background: #2563EB; color: white; box-shadow: 0 2px 8px rgba(37,99,235,0.3); }
    .filter-tab.active .tab-count { background: rgba(255,255,255,0.2); color: white; }
    .tab-count {
      background: #F1F5F9; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600;
      color: #64748B; min-width: 20px; text-align: center;
    }


    .rdv-list { display: flex; flex-direction: column; gap: 12px; }
    .rdv-card {
      display: flex; align-items: center; justify-content: space-between; padding: 20px 24px;
      background: white; border-radius: 16px; border: 1px solid rgba(0,0,0,0.04);
      box-shadow: 0 2px 12px rgba(0,0,0,0.04); transition: all 0.25s ease;
      animation: slideUp 0.4s ease backwards; flex-wrap: wrap; gap: 16px;
    }
    .rdv-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .rdv-card-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 200px; }
    .doctor-avatar {
      width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center;
      justify-content: center; color: white; font-weight: 700; font-size: 14px; flex-shrink: 0;
    }
    .rdv-info { min-width: 0; }
    .rdv-doctor { font-size: 15px; font-weight: 600; color: #1E293B; margin: 0; }
    .rdv-motif { font-size: 13px; color: #64748B; margin: 2px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }

    .rdv-card-center { display: flex; gap: 16px; align-items: center; }
    .rdv-date-block, .rdv-time-block { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #475569; font-weight: 500; }

    .rdv-card-right { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .badge {
      padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: capitalize;
    }
    .badge-type { background: #EFF6FF; color: #2563EB; }
    .badge-planifie { background: #E0F2FE; color: #0369A1; }
    .badge-confirme { background: #ECFDF5; color: #065F46; }
    .badge-annule { background: #FEF2F2; color: #991B1B; }
    .badge-termine { background: #F0FDF4; color: #166534; }

    .empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 60px 20px; background: white; border-radius: 20px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06); text-align: center;
    }
    .empty-icon { margin-bottom: 20px; opacity: 0.6; }
    .empty-title { font-size: 18px; font-weight: 600; color: #374151; margin: 0 0 8px; }
    .empty-text { font-size: 14px; color: #64748B; margin: 0; max-width: 320px; }

    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #64748B; gap: 16px; }
    .loading-spinner { width: 36px; height: 36px; border: 3px solid #E2E8F0; border-top-color: #2563EB; border-radius: 50%; animation: spin 0.8s linear infinite; }

    @media (max-width: 640px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
      .rdv-card { flex-direction: column; align-items: flex-start; }
      .rdv-card-center { flex-direction: column; gap: 4px; }
      .filter-tabs { overflow-x: auto; flex-wrap: nowrap; }
    }
  `]
})

export class MesRdvComponent implements OnInit {
  rendezvous: any[] = [];
  filteredRdv: any[] = [];
  activeFilter = 'tous';
  loading = true;

  private doctorColors: Record<string, string> = {
    'Dr. Martin': 'linear-gradient(135deg, #2563EB, #7C3AED)',
    'Dr. Bernard': 'linear-gradient(135deg, #DC2626, #F59E0B)',
    'Dr. Petit': 'linear-gradient(135deg, #10B981, #06B6D4)',
    'Dr. Robert': 'linear-gradient(135deg, #8B5CF6, #EC4899)',
  };

  constructor(private authService: AuthService, private rdvService: RendezvousService) {}

  ngOnInit(): void {
    this.rdvService.getAll({ patientId: this.authService.currentUser?.id }).subscribe({
      next: (res) => {
        this.rendezvous = res.data || [];
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    const now = new Date();
    switch (this.activeFilter) {
      case 'avenir':
        this.filteredRdv = this.rendezvous.filter(r => new Date(r.dateRendezVous) >= now && r.statut !== 'annule');
        break;
      case 'passes':
        this.filteredRdv = this.rendezvous.filter(r => new Date(r.dateRendezVous) < now || r.statut === 'termine');
        break;
      case 'annules':
        this.filteredRdv = this.rendezvous.filter(r => r.statut === 'annule');
        break;
      default:
        this.filteredRdv = [...this.rendezvous];
    }
  }

  getCountByFilter(filter: string): number {
    const now = new Date();
    switch (filter) {
      case 'avenir': return this.rendezvous.filter(r => new Date(r.dateRendezVous) >= now && r.statut !== 'annule').length;
      case 'passes': return this.rendezvous.filter(r => new Date(r.dateRendezVous) < now || r.statut === 'termine').length;
      case 'annules': return this.rendezvous.filter(r => r.statut === 'annule').length;
      default: return this.rendezvous.length;
    }
  }

  getDoctorColor(name: string): string {
    return this.doctorColors[name] || 'linear-gradient(135deg, #6366F1, #8B5CF6)';
  }

  getDoctorInitials(name: string): string {
    if (!name) return '?';
    const parts = name.replace('Dr. ', '').split(' ');
    return parts.map(p => p.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  getStatusClass(statut: string): string {
    const classes: Record<string, string> = {
      'planifie': 'badge-planifie', 'confirme': 'badge-confirme',
      'annule': 'badge-annule', 'termine': 'badge-termine'
    };
    return classes[statut] || 'badge-planifie';
  }

  getStatusLabel(statut: string): string {
    const labels: Record<string, string> = {
      'planifie': 'Planifié', 'confirme': 'Confirmé',
      'annule': 'Annulé', 'termine': 'Terminé'
    };
    return labels[statut] || statut;
  }

  getEmptyMessage(): string {
    const msgs: Record<string, string> = {
      'tous': 'Vous n\'avez pas encore de rendez-vous. Prenez votre premier rendez-vous maintenant !',
      'avenir': 'Aucun rendez-vous à venir. Planifiez votre prochaine consultation.',
      'passes': 'Aucun rendez-vous passé trouvé.',
      'annules': 'Aucun rendez-vous annulé.'
    };
    return msgs[this.activeFilter] || msgs['tous'];
  }
}
