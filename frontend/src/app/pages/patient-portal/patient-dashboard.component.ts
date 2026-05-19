import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RendezvousService } from '../../services/rendezvous.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <!-- Premium SaaS Patient Dashboard -->
    <div class="dashboard-container">

      <!-- Hero Welcome Section -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <span class="hero-greeting">Bonjour,</span>
            <h1 class="hero-name">{{ authService.currentUser?.prenom }} {{ authService.currentUser?.nom }}</h1>
            <p class="hero-date">{{ todayFormatted }}</p>
          </div>
          <div class="hero-avatar">
            <div class="avatar-circle">
              <span>{{ getInitials() }}</span>
            </div>
            <div class="avatar-pulse"></div>
          </div>
        </div>
        <div class="hero-wave">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
            <path d="M0,60 C360,0 720,40 1440,10 L1440,60 Z" fill="#F8FAFC"/>
          </svg>
        </div>
      </section>

      <!-- KPI Stats Cards -->
      <section class="stats-section">
        <div class="stat-card next-rdv-stat" (mouseenter)="hoveredCard='next'" (mouseleave)="hoveredCard=''">
          <div class="stat-icon-wrapper blue">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <polyline points="9 16 11 18 15 14"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Prochain Rendez-vous</span>
            <span class="stat-value" *ngIf="nextRdv">{{ nextRdv.dateRendezVous | date:'dd MMM yyyy' }}</span>
            <span class="stat-value muted" *ngIf="!nextRdv">Aucun</span>
            <span class="stat-sub" *ngIf="nextRdv">{{ nextRdv.heureDebut }} · {{ nextRdv.medecinNom }}</span>
          </div>
        </div>

        <div class="stat-card total-rdv-stat" (mouseenter)="hoveredCard='total'" (mouseleave)="hoveredCard=''">
          <div class="stat-icon-wrapper green">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total Rendez-vous</span>
            <span class="stat-value">{{ totalRdv }}</span>
            <span class="stat-sub">Depuis votre inscription</span>
          </div>
        </div>
      </section>


      <!-- Two Column Layout: Calendar + Actions -->
      <section class="content-grid">

        <!-- Left: Mini Weekly Calendar -->
        <div class="calendar-card">
          <div class="card-header">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Cette Semaine
            </h2>
          </div>
          <div class="calendar-grid">
            <div *ngFor="let day of weekDays"
                 class="calendar-day"
                 [class.today]="day.isToday"
                 [class.has-rdv]="day.hasAppointment"
                 [class.past]="day.isPast">
              <span class="day-name">{{ day.name }}</span>
              <span class="day-number">{{ day.number }}</span>
              <div class="day-dot" *ngIf="day.hasAppointment"></div>
              <div class="day-rdv-preview" *ngIf="day.hasAppointment && day.appointment">
                <span class="rdv-time">{{ day.appointment.heureDebut }}</span>
                <span class="rdv-doctor">{{ day.appointment.medecinNom }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Quick Action Tiles -->
        <div class="actions-card">
          <div class="card-header">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              Actions Rapides
            </h2>
          </div>
          <div class="actions-grid">
            <a routerLink="/patient/prendre-rdv" class="action-tile blue-tile">
              <div class="tile-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                  <line x1="12" y1="14" x2="12" y2="18"/>
                  <line x1="10" y1="16" x2="14" y2="16"/>
                </svg>
              </div>
              <span class="tile-label">Prendre RDV</span>
              <span class="tile-desc">Réserver une consultation</span>
            </a>

            <a routerLink="/patient/mes-rdv" class="action-tile indigo-tile">
              <div class="tile-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </div>
              <span class="tile-label">Mes RDV</span>
              <span class="tile-desc">Historique & à venir</span>
            </a>

            <a routerLink="/patient/mon-dossier" class="action-tile green-tile">
              <div class="tile-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <path d="M12 18v-6"/>
                  <path d="M9 15l3 3 3-3"/>
                </svg>
              </div>
              <span class="tile-label">Mon Dossier</span>
              <span class="tile-desc">Dossier médical complet</span>
            </a>
          </div>
        </div>

      </section>
    </div>
  `,

  styles: [`
    :host { display: block; }

    .dashboard-container {
      min-height: 100vh;
      background: #F8FAFC;
      padding-bottom: 48px;
      animation: fadeIn 0.6s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.15); opacity: 0; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ===== Hero Section ===== */
    .hero-section {
      background: linear-gradient(135deg, #2563EB 0%, #3B82F6 60%, #60A5FA 100%);
      padding: 48px 32px 64px;
      position: relative;
      overflow: hidden;
    }

    .hero-section::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
      border-radius: 50%;
    }

    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 2;
    }

    .hero-greeting {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: rgba(255,255,255,0.8);
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 4px;
    }

    .hero-name {
      font-size: 32px;
      font-weight: 800;
      color: #fff;
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }

    .hero-date {
      font-size: 15px;
      color: rgba(255,255,255,0.75);
      margin: 0;
      font-weight: 400;
    }

    .hero-avatar {
      position: relative;
    }

    .avatar-circle {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255,255,255,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 700;
      color: #fff;
    }

    .avatar-pulse {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.4);
      animation: pulse 2.5s ease-in-out infinite;
    }

    .hero-wave {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      line-height: 0;
    }

    .hero-wave svg {
      width: 100%;
      height: 60px;
    }


    /* ===== Stats Section ===== */
    .stats-section {
      max-width: 1200px;
      margin: -32px auto 32px;
      padding: 0 32px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      position: relative;
      z-index: 10;
      animation: slideUp 0.7s ease-out 0.2s both;
    }

    .stat-card {
      background: #fff;
      border-radius: 20px;
      padding: 28px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
      border: 1px solid rgba(255,255,255,0.8);
      backdrop-filter: blur(10px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: default;
    }

    .stat-card:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 12px 40px rgba(37,99,235,0.12), 0 4px 12px rgba(0,0,0,0.06);
    }

    .stat-icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon-wrapper.blue {
      background: linear-gradient(135deg, #DBEAFE, #BFDBFE);
      color: #2563EB;
    }

    .stat-icon-wrapper.green {
      background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
      color: #059669;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat-label {
      font-size: 13px;
      font-weight: 500;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 22px;
      font-weight: 800;
      color: #1E293B;
      letter-spacing: -0.3px;
    }

    .stat-value.muted {
      color: #94A3B8;
      font-size: 18px;
      font-weight: 600;
    }

    .stat-sub {
      font-size: 12px;
      color: #94A3B8;
      font-weight: 400;
    }


    /* ===== Content Grid ===== */
    .content-grid {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 32px;
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 28px;
      animation: slideUp 0.7s ease-out 0.4s both;
    }

    .calendar-card, .actions-card {
      background: #fff;
      border-radius: 24px;
      padding: 28px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.03);
      border: 1px solid rgba(226, 232, 240, 0.6);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .calendar-card:hover, .actions-card:hover {
      box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
    }

    .card-header {
      margin-bottom: 24px;
    }

    .card-header h2 {
      font-size: 16px;
      font-weight: 700;
      color: #1E293B;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }

    .card-header h2 svg {
      color: #3B82F6;
    }

    /* ===== Calendar Grid ===== */
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
    }

    .calendar-day {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 6px;
      border-radius: 14px;
      transition: all 0.25s ease;
      cursor: default;
      position: relative;
    }

    .calendar-day:hover {
      background: #F1F5F9;
      transform: scale(1.05);
    }

    .calendar-day.today {
      background: linear-gradient(135deg, #2563EB, #3B82F6);
      color: #fff;
      box-shadow: 0 4px 16px rgba(37,99,235,0.3);
    }

    .calendar-day.today .day-name,
    .calendar-day.today .day-number {
      color: #fff;
    }

    .calendar-day.past {
      opacity: 0.45;
    }

    .calendar-day.has-rdv:not(.today) {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
    }

    .day-name {
      font-size: 11px;
      font-weight: 600;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .day-number {
      font-size: 18px;
      font-weight: 700;
      color: #1E293B;
    }

    .day-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #2563EB;
      margin-top: 6px;
    }

    .calendar-day.today .day-dot {
      background: #fff;
    }

    .day-rdv-preview {
      position: absolute;
      bottom: -40px;
      left: 50%;
      transform: translateX(-50%);
      background: #1E293B;
      color: #fff;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 10px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .calendar-day:hover .day-rdv-preview {
      opacity: 1;
    }

    .rdv-time { font-weight: 600; }
    .rdv-doctor { font-weight: 400; color: #94A3B8; }


    /* ===== Action Tiles ===== */
    .actions-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .action-tile {
      display: flex;
      align-items: center;
      gap: 18px;
      padding: 22px 24px;
      border-radius: 16px;
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid transparent;
      position: relative;
      overflow: hidden;
    }

    .action-tile::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      opacity: 0;
      transition: opacity 0.3s ease;
      border-radius: 16px;
    }

    .action-tile:hover {
      transform: translateX(6px) scale(1.02);
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }

    .blue-tile {
      background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
      border-color: #BFDBFE;
    }
    .blue-tile:hover { border-color: #3B82F6; }
    .blue-tile .tile-icon { color: #2563EB; }
    .blue-tile .tile-label { color: #1E40AF; }
    .blue-tile .tile-desc { color: #3B82F6; }

    .indigo-tile {
      background: linear-gradient(135deg, #EEF2FF, #E0E7FF);
      border-color: #C7D2FE;
    }
    .indigo-tile:hover { border-color: #6366F1; }
    .indigo-tile .tile-icon { color: #4F46E5; }
    .indigo-tile .tile-label { color: #3730A3; }
    .indigo-tile .tile-desc { color: #6366F1; }

    .green-tile {
      background: linear-gradient(135deg, #ECFDF5, #D1FAE5);
      border-color: #A7F3D0;
    }
    .green-tile:hover { border-color: #10B981; }
    .green-tile .tile-icon { color: #059669; }
    .green-tile .tile-label { color: #065F46; }
    .green-tile .tile-desc { color: #10B981; }

    .tile-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: rgba(255,255,255,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      backdrop-filter: blur(4px);
    }

    .tile-label {
      display: block;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: -0.2px;
    }

    .tile-desc {
      display: block;
      font-size: 12px;
      font-weight: 400;
      margin-top: 2px;
    }

    /* ===== Responsive ===== */
    @media (max-width: 768px) {
      .hero-section { padding: 32px 20px 48px; }
      .hero-name { font-size: 24px; }
      .stats-section { padding: 0 16px; margin-top: -24px; }
      .content-grid {
        grid-template-columns: 1fr;
        padding: 0 16px;
      }
      .calendar-grid { gap: 4px; }
      .calendar-day { padding: 8px 4px; }
      .day-number { font-size: 14px; }
    }
  `]
})

export class PatientDashboardComponent implements OnInit {
  nextRdv: any = null;
  totalRdv = 0;
  todayFormatted = '';
  hoveredCard = '';
  weekDays: Array<{
    name: string;
    number: number;
    isToday: boolean;
    isPast: boolean;
    hasAppointment: boolean;
    appointment: any;
    date: Date;
  }> = [];

  constructor(
    public authService: AuthService,
    private rdvService: RendezvousService
  ) {}

  ngOnInit(): void {
    this.setTodayDate();
    this.buildWeekCalendar();
    this.loadAppointments();
  }

  getInitials(): string {
    const user = this.authService.currentUser;
    if (!user) return '?';
    const first = user.prenom?.charAt(0) || '';
    const last = user.nom?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  private setTodayDate(): void {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    this.todayFormatted = now.toLocaleDateString('fr-FR', options);
    // Capitalize first letter
    this.todayFormatted = this.todayFormatted.charAt(0).toUpperCase() + this.todayFormatted.slice(1);
  }

  private buildWeekCalendar(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Monday-based week (0=Mon ... 6=Sun)
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      this.weekDays.push({
        name: dayNames[i],
        number: date.getDate(),
        isToday: this.isSameDay(date, today),
        isPast: date < today && !this.isSameDay(date, today),
        hasAppointment: false,
        appointment: null,
        date: date
      });
    }
  }

  private isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  private loadAppointments(): void {
    const patientId = this.authService.currentUser?.id;
    if (!patientId) return;

    this.rdvService.getAll({ patientId }).subscribe({
      next: (res) => {
        const rdvs = res.data || [];
        this.totalRdv = rdvs.length;

        // Find next upcoming appointment
        const now = new Date();
        const upcoming = rdvs
          .filter((r: any) => new Date(r.dateRendezVous) >= now)
          .sort((a: any, b: any) =>
            new Date(a.dateRendezVous).getTime() - new Date(b.dateRendezVous).getTime()
          );
        this.nextRdv = upcoming.length > 0 ? upcoming[0] : null;

        // Map appointments to calendar days
        this.weekDays.forEach(day => {
          const match = rdvs.find((r: any) => this.isSameDay(new Date(r.dateRendezVous), day.date));
          if (match) {
            day.hasAppointment = true;
            day.appointment = match;
          }
        });
      },
      error: () => {
        this.totalRdv = 0;
        this.nextRdv = null;
      }
    });
  }
}
