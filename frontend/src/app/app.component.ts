import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  template: `
    <!-- No layout for login page -->
    <div *ngIf="!authService.isLoggedIn">
      <router-outlet></router-outlet>
    </div>

    <!-- Admin Layout -->
    <div class="app-layout" *ngIf="authService.isLoggedIn && authService.userRole === 'admin'">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo"><i class="fas fa-heartbeat"></i><span>Cloud Health</span></div>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
            <i class="fas fa-chart-line"></i><span>Dashboard</span>
          </a>
          <a routerLink="/admin/patients" routerLinkActive="active" class="nav-item">
            <i class="fas fa-users"></i><span>Patients</span>
          </a>
          <a routerLink="/admin/rendezvous" routerLinkActive="active" class="nav-item">
            <i class="fas fa-calendar-alt"></i><span>Rendez-vous</span>
          </a>
          <a routerLink="/admin/dossiers" routerLinkActive="active" class="nav-item">
            <i class="fas fa-folder-open"></i><span>Dossiers</span>
          </a>
          <a routerLink="/admin/diagnostic" routerLinkActive="active" class="nav-item">
            <i class="fas fa-stethoscope"></i><span>Diagnostic</span>
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="user-info">
            <i class="fas fa-user-md"></i>
            <div>
              <span class="user-name">{{ authService.currentUser?.prenom }} {{ authService.currentUser?.nom }}</span>
              <span class="user-role">Administrateur</span>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()"><i class="fas fa-sign-out-alt"></i></button>
        </div>
      </aside>
      <main class="main-content">
        <header class="top-bar">
          <h1 class="page-title">Cloud Health</h1>
          <div class="top-bar-actions">
            <span class="status-indicator"><i class="fas fa-circle" style="color: var(--success); font-size: 8px;"></i> Système en ligne</span>
          </div>
        </header>
        <div class="content-area"><router-outlet></router-outlet></div>
      </main>
    </div>

    <!-- Patient Layout - Premium Horizontal Navbar -->
    <div class="patient-layout" *ngIf="authService.isLoggedIn && authService.userRole === 'patient'">
      <nav class="patient-navbar">
        <div class="navbar-left">
          <a routerLink="/patient/dashboard" routerLinkActive="nav-active" class="nav-link">
            <i class="fas fa-home"></i><span>Accueil</span>
          </a>
          <a routerLink="/patient/prendre-rdv" routerLinkActive="nav-active" class="nav-link">
            <i class="fas fa-calendar-plus"></i><span>Prendre RDV</span>
          </a>
          <a routerLink="/patient/mes-rdv" routerLinkActive="nav-active" class="nav-link">
            <i class="fas fa-calendar-check"></i><span>Mes RDV</span>
          </a>
          <a routerLink="/patient/mon-dossier" routerLinkActive="nav-active" class="nav-link">
            <i class="fas fa-file-medical"></i><span>Mon Dossier</span>
          </a>
        </div>
        <div class="navbar-center">
          <div class="navbar-logo"><i class="fas fa-heartbeat"></i><span>Cloud Health</span></div>
        </div>
        <div class="navbar-right">
          <button class="notif-btn"><i class="fas fa-bell"></i><span class="notif-badge">2</span></button>
          <div class="user-pill" (click)="showDropdown = !showDropdown">
            <div class="user-avatar-sm">{{ authService.currentUser?.prenom?.charAt(0) }}{{ authService.currentUser?.nom?.charAt(0) }}</div>
            <span class="user-name-nav">{{ authService.currentUser?.prenom }}</span>
            <i class="fas fa-chevron-down"></i>
          </div>
          <div class="dropdown-menu" *ngIf="showDropdown">
            <div class="dropdown-header">
              <strong>{{ authService.currentUser?.prenom }} {{ authService.currentUser?.nom }}</strong>
              <span>Patient</span>
            </div>
            <hr>
            <button (click)="logout(); showDropdown=false"><i class="fas fa-sign-out-alt"></i> Déconnexion</button>
          </div>
        </div>
      </nav>
      <main class="patient-main">
        <router-outlet></router-outlet>
      </main>
    </div>

    <!-- Global Toast Notifications -->
    <app-toast></app-toast>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; }
    .sidebar { width: 260px; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); color: white; display: flex; flex-direction: column; position: fixed; height: 100vh; z-index: 100; }
    .sidebar-header { padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .logo { display: flex; align-items: center; gap: 12px; font-size: 20px; font-weight: 700; i { color: #60a5fa; font-size: 24px; } }
    .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 8px; color: #94a3b8; text-decoration: none; font-size: 14px; font-weight: 500; transition: all 0.2s ease;
      i { width: 20px; text-align: center; }
      &:hover { background: rgba(255,255,255,0.05); color: white; }
      &.active { background: #2563eb; color: white; box-shadow: 0 4px 12px rgba(37,99,235,0.3); } }
    .sidebar-footer { padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between; }
    .user-info { display: flex; align-items: center; gap: 12px; i { font-size: 20px; color: #60a5fa; }
      .user-name { display: block; font-size: 13px; font-weight: 500; } .user-role { display: block; font-size: 11px; color: #94a3b8; } }
    .logout-btn { background: rgba(239,68,68,0.1); border: none; color: #f87171; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;
      &:hover { background: rgba(239,68,68,0.2); } }
    .main-content { flex: 1; margin-left: 260px; display: flex; flex-direction: column; }
    .top-bar { background: white; padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 50; }
    .page-title { font-size: 20px; font-weight: 600; color: var(--gray-800); }
    .status-indicator { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--gray-500); }
    .content-area { padding: 32px; flex: 1; }

    /* ===== Patient Premium Navbar ===== */
    .patient-layout { min-height: 100vh; background: #F8FAFC; }
    .patient-navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
      height: 68px; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(226,232,240,0.6);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 32px;
      box-shadow: 0 2px 20px rgba(0,0,0,0.04);
    }
    .navbar-left { display: flex; align-items: center; gap: 4px; }
    .nav-link { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 10px; text-decoration: none;
      color: #64748b; font-size: 13px; font-weight: 500; transition: all 0.25s ease;
      i { font-size: 14px; }
      &:hover { background: #f1f5f9; color: #2563eb; }
      &.nav-active { background: #eff6ff; color: #2563eb; font-weight: 600; } }
    .navbar-center { position: absolute; left: 50%; transform: translateX(-50%); }
    .navbar-logo { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 800; color: #1e293b;
      i { color: #2563eb; font-size: 22px; } }
    .navbar-right { display: flex; align-items: center; gap: 12px; position: relative; }
    .notif-btn { position: relative; background: #f1f5f9; border: none; width: 38px; height: 38px; border-radius: 10px;
      cursor: pointer; color: #475569; transition: all 0.2s; display: flex; align-items: center; justify-content: center;
      &:hover { background: #e2e8f0; color: #2563eb; } }
    .notif-badge { position: absolute; top: 4px; right: 4px; width: 16px; height: 16px; background: #ef4444; border-radius: 50%;
      font-size: 10px; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; }
    .user-pill { display: flex; align-items: center; gap: 8px; padding: 6px 12px 6px 6px; border-radius: 24px;
      background: #f8fafc; border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.2s;
      &:hover { border-color: #cbd5e1; background: #f1f5f9; }
      .user-name-nav { font-size: 13px; font-weight: 500; color: #334155; }
      i { font-size: 10px; color: #94a3b8; } }
    .user-avatar-sm { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #3b82f6);
      color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
    .dropdown-menu { position: absolute; top: 52px; right: 0; background: white; border-radius: 12px; padding: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12); border: 1px solid #e2e8f0; min-width: 200px; z-index: 9999;
      animation: fadeIn 0.15s ease;
      .dropdown-header { padding: 8px 12px; strong { display: block; font-size: 14px; color: #1e293b; } span { font-size: 12px; color: #64748b; } }
      hr { border: none; border-top: 1px solid #f1f5f9; margin: 8px 0; }
      button { width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: none; background: none;
        border-radius: 8px; font-size: 13px; color: #dc2626; cursor: pointer; transition: background 0.2s;
        &:hover { background: #fef2f2; } } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    .patient-main { padding-top: 68px; }
  `]
})
export class AppComponent {
  showDropdown = false;
  constructor(public authService: AuthService, private router: Router) {}
  logout(): void { this.authService.logout(); }
}
