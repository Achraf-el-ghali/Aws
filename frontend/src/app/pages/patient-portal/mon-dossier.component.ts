import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DossierService } from '../../services/dossier.service';

@Component({
  selector: 'app-mon-dossier',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <div class="loading-spinner"></div>
        <p>Chargement de votre dossier médical...</p>
      </div>

      <!-- Dossier Found -->
      <ng-container *ngIf="dossier && !loading">
        <!-- Patient Profile Card -->
        <div class="profile-card">
          <div class="profile-left">
            <div class="profile-avatar">
              {{ dossier.patientPrenom?.charAt(0) }}{{ dossier.patientNom?.charAt(0) }}
            </div>
            <div class="profile-info">
              <h1 class="profile-name">{{ dossier.patientPrenom }} {{ dossier.patientNom }}</h1>
              <p class="profile-subtitle">Dossier médical personnel</p>
            </div>
          </div>
          <div class="profile-badges">
            <span class="blood-badge" *ngIf="dossier.groupeSanguin">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 21c-4-4-8-7.5-8-11a8 8 0 0116 0c0 3.5-4 7-8 11z"/></svg>
              {{ dossier.groupeSanguin }}
            </span>
            <span class="info-badge" *ngIf="!dossier.groupeSanguin">Non renseigné</span>
          </div>
        </div>


        <!-- Allergies Section -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-icon danger-bg">
              <svg width="20" height="20" fill="none" stroke="#EF4444" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h3 class="section-title">Allergies</h3>
            <span class="section-count" *ngIf="dossier.allergies?.length">{{ dossier.allergies.length }}</span>
          </div>
          <div class="tags-container" *ngIf="dossier.allergies?.length > 0">
            <span class="tag tag-danger" *ngFor="let a of dossier.allergies">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01"/></svg>
              {{ a }}
            </span>
          </div>
          <p class="no-data" *ngIf="!dossier.allergies?.length">Aucune allergie connue</p>
        </div>

        <!-- Antecedents Section -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-icon info-bg">
              <svg width="20" height="20" fill="none" stroke="#2563EB" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 class="section-title">Antécédents médicaux</h3>
            <span class="section-count" *ngIf="dossier.antecedents?.length">{{ dossier.antecedents.length }}</span>
          </div>
          <div class="tags-container" *ngIf="dossier.antecedents?.length > 0">
            <span class="tag tag-info" *ngFor="let a of dossier.antecedents">{{ a }}</span>
          </div>
          <p class="no-data" *ngIf="!dossier.antecedents?.length">Aucun antécédent médical</p>
        </div>


        <!-- Consultations Section (Timeline) -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-icon primary-bg">
              <svg width="20" height="20" fill="none" stroke="#2563EB" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </div>
            <h3 class="section-title">Consultations</h3>
            <span class="section-count" *ngIf="dossier.consultations?.length">{{ dossier.consultations.length }}</span>
          </div>
          <div class="timeline" *ngIf="dossier.consultations?.length > 0">
            <div class="timeline-item" *ngFor="let c of dossier.consultations; let last = last" [class.last]="last">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-date">{{ c.date | date:'dd MMM yyyy' }}</span>
                  <span class="timeline-doctor">Dr. {{ c.medecinNom }}</span>
                </div>
                <p class="timeline-text">{{ c.diagnostic }}</p>
              </div>
            </div>
          </div>
          <p class="no-data" *ngIf="!dossier.consultations?.length">Aucune consultation enregistrée</p>
        </div>

        <!-- Ordonnances Section -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-icon success-bg">
              <svg width="20" height="20" fill="none" stroke="#10B981" stroke-width="2" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
            </div>
            <h3 class="section-title">Ordonnances</h3>
            <span class="section-count" *ngIf="dossier.ordonnances?.length">{{ dossier.ordonnances.length }}</span>
          </div>
          <div class="ordonnance-list" *ngIf="dossier.ordonnances?.length > 0">
            <div class="ordonnance-item" *ngFor="let o of dossier.ordonnances">
              <div class="ordonnance-info">
                <span class="ordonnance-date">{{ o.dateEmission }}</span>
                <span class="ordonnance-doctor">Dr. {{ o.medecinNom }}</span>
              </div>
              <span class="badge" [class.badge-active]="o.active" [class.badge-expired]="!o.active">
                {{ o.active ? 'Active' : 'Expirée' }}
              </span>
            </div>
          </div>
          <p class="no-data" *ngIf="!dossier.ordonnances?.length">Aucune ordonnance</p>
        </div>


        <!-- Examens Section -->
        <div class="section-card" *ngIf="dossier.examens?.length > 0">
          <div class="section-header">
            <div class="section-icon warning-bg">
              <svg width="20" height="20" fill="none" stroke="#F59E0B" stroke-width="2" viewBox="0 0 24 24"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <h3 class="section-title">Examens</h3>
            <span class="section-count">{{ dossier.examens.length }}</span>
          </div>
          <div class="examens-list">
            <div class="examen-item" *ngFor="let e of dossier.examens">
              <div class="examen-type">{{ e.type }}</div>
              <div class="examen-details">
                <span>{{ e.date | date:'dd MMM yyyy' }}</span>
                <span class="examen-result" *ngIf="e.resultat">{{ e.resultat }}</span>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Empty State (No Dossier) -->
      <div class="empty-state" *ngIf="!dossier && !loading">
        <div class="empty-icon-wrapper">
          <svg width="72" height="72" fill="none" stroke="#CBD5E1" stroke-width="1.2" viewBox="0 0 24 24">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
          </svg>
        </div>
        <h2 class="empty-title">Aucun dossier médical</h2>
        <p class="empty-text">
          Votre dossier médical sera créé automatiquement lors de votre première consultation.
          Prenez rendez-vous pour commencer.
        </p>
        <a routerLink="/patient/prendre-rdv" class="btn btn-primary">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          Prendre mon premier rendez-vous
        </a>
      </div>
    </div>
  `,

  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes spin { to { transform: rotate(360deg); } }

    .page-container { max-width: 900px; margin: 0 auto; padding: 0 16px; animation: fadeIn 0.4s ease; }

    /* Profile Card */
    .profile-card {
      display: flex; justify-content: space-between; align-items: center; padding: 28px 32px;
      background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%); border-radius: 20px;
      margin-bottom: 24px; box-shadow: 0 8px 32px rgba(37,99,235,0.3); flex-wrap: wrap; gap: 16px;
    }
    .profile-left { display: flex; align-items: center; gap: 18px; }
    .profile-avatar {
      width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.2);
      backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center;
      font-size: 22px; font-weight: 700; color: white; border: 3px solid rgba(255,255,255,0.3);
    }
    .profile-name { font-size: 24px; font-weight: 700; color: white; margin: 0; }
    .profile-subtitle { font-size: 14px; color: rgba(255,255,255,0.7); margin: 4px 0 0; }
    .profile-badges { display: flex; gap: 8px; }
    .blood-badge {
      display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 20px;
      background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); color: white;
      font-weight: 700; font-size: 14px; border: 1px solid rgba(255,255,255,0.3);
    }
    .info-badge {
      padding: 8px 16px; border-radius: 20px; background: rgba(255,255,255,0.15);
      color: rgba(255,255,255,0.8); font-size: 13px;
    }


    /* Section Cards */
    .section-card {
      background: white; border-radius: 20px; padding: 28px; margin-bottom: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.04);
      animation: slideUp 0.4s ease backwards; transition: transform 0.2s, box-shadow 0.2s;
    }
    .section-card:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
    .section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
    .section-icon {
      width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
    }
    .danger-bg { background: #FEF2F2; }
    .info-bg { background: #EFF6FF; }
    .primary-bg { background: #EFF6FF; }
    .success-bg { background: #ECFDF5; }
    .warning-bg { background: #FFFBEB; }
    .section-title { font-size: 16px; font-weight: 600; color: #1E293B; margin: 0; flex: 1; }
    .section-count {
      background: #F1F5F9; color: #475569; padding: 4px 10px; border-radius: 10px;
      font-size: 12px; font-weight: 600;
    }

    /* Tags */
    .tags-container { display: flex; flex-wrap: wrap; gap: 8px; }
    .tag {
      display: inline-flex; align-items: center; gap: 4px; padding: 6px 14px; border-radius: 20px;
      font-size: 13px; font-weight: 500; transition: transform 0.2s;
    }
    .tag:hover { transform: scale(1.03); }
    .tag-danger { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }
    .tag-info { background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; }


    /* Timeline */
    .timeline { position: relative; padding-left: 24px; }
    .timeline-item { position: relative; padding-bottom: 20px; padding-left: 20px; border-left: 2px solid #E2E8F0; }
    .timeline-item.last { border-left-color: transparent; padding-bottom: 0; }
    .timeline-dot {
      position: absolute; left: -7px; top: 4px; width: 12px; height: 12px; border-radius: 50%;
      background: #2563EB; border: 3px solid #EFF6FF;
    }
    .timeline-content {
      background: #F8FAFC; border-radius: 12px; padding: 14px 18px; border: 1px solid #E2E8F0;
    }
    .timeline-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 8px; }
    .timeline-date { font-size: 12px; font-weight: 600; color: #2563EB; background: #EFF6FF; padding: 3px 10px; border-radius: 8px; }
    .timeline-doctor { font-size: 13px; font-weight: 500; color: #475569; }
    .timeline-text { font-size: 14px; color: #374151; margin: 0; line-height: 1.5; }

    /* Ordonnances */
    .ordonnance-list { display: flex; flex-direction: column; gap: 10px; }
    .ordonnance-item {
      display: flex; justify-content: space-between; align-items: center; padding: 14px 18px;
      background: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0; transition: all 0.2s;
    }
    .ordonnance-item:hover { background: #EFF6FF; border-color: #BFDBFE; }
    .ordonnance-info { display: flex; flex-direction: column; gap: 2px; }
    .ordonnance-date { font-size: 14px; font-weight: 600; color: #1E293B; }
    .ordonnance-doctor { font-size: 12px; color: #64748B; }
    .badge { padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .badge-active { background: #ECFDF5; color: #065F46; }
    .badge-expired { background: #FEF2F2; color: #991B1B; }

    /* Examens */
    .examens-list { display: flex; flex-direction: column; gap: 10px; }
    .examen-item {
      display: flex; justify-content: space-between; align-items: center; padding: 14px 18px;
      background: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0;
    }
    .examen-type { font-size: 14px; font-weight: 600; color: #1E293B; }
    .examen-details { display: flex; align-items: center; gap: 12px; font-size: 13px; color: #64748B; }
    .examen-result { background: #FFFBEB; color: #92400E; padding: 3px 10px; border-radius: 8px; font-size: 12px; font-weight: 500; }


    /* Empty State */
    .empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 60px 32px; background: white; border-radius: 20px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06); text-align: center;
    }
    .empty-icon-wrapper { margin-bottom: 24px; opacity: 0.5; }
    .empty-title { font-size: 20px; font-weight: 700; color: #1E293B; margin: 0 0 10px; }
    .empty-text { font-size: 14px; color: #64748B; margin: 0 0 24px; max-width: 400px; line-height: 1.6; }

    .btn {
      display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 10px;
      font-size: 14px; font-weight: 600; cursor: pointer; border: none; text-decoration: none; transition: all 0.25s ease;
    }
    .btn-primary {
      background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); color: white;
      box-shadow: 0 4px 14px rgba(37,99,235,0.3);
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.4); }

    /* Loading */
    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 80px; color: #64748B; gap: 16px; }
    .loading-spinner { width: 40px; height: 40px; border: 3px solid #E2E8F0; border-top-color: #2563EB; border-radius: 50%; animation: spin 0.8s linear infinite; }

    .no-data { color: #94A3B8; font-size: 13px; font-style: italic; margin: 0; }

    @media (max-width: 640px) {
      .profile-card { flex-direction: column; align-items: flex-start; }
      .timeline-header { flex-direction: column; align-items: flex-start; }
      .ordonnance-item { flex-direction: column; align-items: flex-start; gap: 8px; }
    }
  `]
})

export class MonDossierComponent implements OnInit {
  dossier: any = null;
  loading = true;

  constructor(private authService: AuthService, private dossierService: DossierService) {}

  ngOnInit(): void {
    const patientId = this.authService.currentUser?.id;
    if (patientId) {
      this.dossierService.getByPatientId(patientId).subscribe({
        next: (res) => {
          this.dossier = res.data;
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
    } else {
      this.loading = false;
    }
  }
}
