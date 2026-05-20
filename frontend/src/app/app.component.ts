import { Component, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  template: `
    <!-- ========== Login (no layout) ========== -->
    <ng-container *ngIf="!authService.isLoggedIn || isLoginRoute">
      <router-outlet></router-outlet>
    </ng-container>

    <!-- ========== Admin Layout (sidebar) ========== -->
    <div class="app-layout"
         *ngIf="authService.isLoggedIn && authService.userRole === 'admin' && !isLoginRoute">
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
          <button class="logout-btn" (click)="logout()" title="Déconnexion">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </aside>
      <main class="main-content">
        <header class="top-bar">
          <h1 class="page-title">Cloud Health</h1>
          <div class="top-bar-actions">
            <span class="status-indicator">
              <i class="fas fa-circle status-dot"></i> Système en ligne
            </span>
          </div>
        </header>
        <div class="content-area"><router-outlet></router-outlet></div>
      </main>
    </div>

    <!-- ========== Patient Layout (top navbar) ========== -->
    <div class="patient-layout"
         *ngIf="authService.isLoggedIn && authService.userRole === 'patient' && !isLoginRoute">

      <nav class="patient-navbar" [class.scrolled]="isScrolled">
        <div class="navbar-inner">
          <!-- Brand -->
          <a routerLink="/patient/dashboard" class="navbar-brand">
            <span class="brand-icon"><i class="fas fa-heartbeat"></i></span>
            <span class="brand-text">Cloud Health</span>
          </a>

          <!-- Nav links (desktop) -->
          <div class="navbar-links" [class.mobile-open]="mobileMenuOpen">
            <a routerLink="/patient/dashboard"   routerLinkActive="active" class="nav-link" (click)="closeMobileMenu()">
              <i class="fas fa-home"></i><span>Accueil</span>
            </a>
            <a routerLink="/patient/prendre-rdv" routerLinkActive="active" class="nav-link" (click)="closeMobileMenu()">
              <i class="fas fa-calendar-plus"></i><span>Prendre RDV</span>
            </a>
            <a routerLink="/patient/mes-rdv"     routerLinkActive="active" class="nav-link" (click)="closeMobileMenu()">
              <i class="fas fa-calendar-check"></i><span>Mes RDV</span>
            </a>
            <a routerLink="/patient/mon-dossier" routerLinkActive="active" class="nav-link" (click)="closeMobileMenu()">
              <i class="fas fa-file-medical"></i><span>Mon Dossier</span>
            </a>
          </div>

          <!-- User -->
          <div class="navbar-actions">
            <button class="icon-btn" title="Notifications">
              <i class="fas fa-bell"></i>
              <span class="dot"></span>
            </button>

            <div class="user-menu" (click)="showDropdown = !showDropdown" #userMenu>
              <div class="user-avatar">
                {{ authService.currentUser?.prenom?.charAt(0) }}{{ authService.currentUser?.nom?.charAt(0) }}
              </div>
              <span class="user-name">{{ authService.currentUser?.prenom }}</span>
              <i class="fas fa-chevron-down chevron" [class.rotated]="showDropdown"></i>

              <div class="dropdown" *ngIf="showDropdown" (click)="$event.stopPropagation()">
                <div class="dropdown-header">
                  <div class="user-avatar lg">
                    {{ authService.currentUser?.prenom?.charAt(0) }}{{ authService.currentUser?.nom?.charAt(0) }}
                  </div>
                  <div>
                    <strong>{{ authService.currentUser?.prenom }} {{ authService.currentUser?.nom }}</strong>
                    <small>{{ authService.currentUser?.email }}</small>
                  </div>
                </div>
                <div class="dropdown-divider"></div>
                <button (click)="logout(); showDropdown = false">
                  <i class="fas fa-sign-out-alt"></i>
                  Se déconnecter
                </button>
              </div>
            </div>

            <!-- Mobile burger -->
            <button class="burger" (click)="toggleMobileMenu()" [class.open]="mobileMenuOpen">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>

      <main class="patient-main">
        <router-outlet></router-outlet>
      </main>
    </div>

    <!-- Toast notifications -->
    <app-toast></app-toast>
  `,
  styles: [`
    /* ========== ADMIN LAYOUT ========== */
    .app-layout { display: flex; min-height: 100vh; }
    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 100;
    }
    .sidebar-header { padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .logo {
      display: flex; align-items: center; gap: 12px;
      font-size: 20px; font-weight: 700;
      i { color: #60a5fa; font-size: 24px; }
    }
    .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px; border-radius: 8px;
      color: #94a3b8; text-decoration: none;
      font-size: 14px; font-weight: 500;
      transition: all 0.2s ease;
      i { width: 20px; text-align: center; }
      &:hover { background: rgba(255,255,255,0.05); color: white; }
      &.active {
        background: #2563eb; color: white;
        box-shadow: 0 4px 12px rgba(37,99,235,0.3);
      }
    }
    .sidebar-footer {
      padding: 16px 24px;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex; align-items: center; justify-content: space-between;
    }
    .user-info {
      display: flex; align-items: center; gap: 12px;
      i { font-size: 20px; color: #60a5fa; }
      .user-name { display: block; font-size: 13px; font-weight: 500; }
      .user-role { display: block; font-size: 11px; color: #94a3b8; }
    }
    .logout-btn {
      background: rgba(239,68,68,0.1); border: none; color: #f87171;
      width: 32px; height: 32px; border-radius: 6px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      &:hover { background: rgba(239,68,68,0.2); }
    }
    .main-content { flex: 1; margin-left: 260px; display: flex; flex-direction: column; }
    .top-bar {
      background: white; padding: 16px 32px;
      display: flex; justify-content: space-between; align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      position: sticky; top: 0; z-index: 50;
    }
    .page-title { font-size: 20px; font-weight: 600; color: #1e293b; }
    .status-indicator { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #64748b; }
    .status-dot { color: #10b981; font-size: 8px; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }
    .content-area { padding: 32px; flex: 1; }


    /* ========== PATIENT LAYOUT — MODERN NAVBAR ========== */
    .patient-layout { min-height: 100vh; background: #f8fafc; }

    .patient-navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: saturate(180%) blur(16px);
      -webkit-backdrop-filter: saturate(180%) blur(16px);
      border-bottom: 1px solid transparent;
      transition: all 0.25s ease;

      &.scrolled {
        background: rgba(255, 255, 255, 0.95);
        border-bottom-color: rgba(226, 232, 240, 0.8);
        box-shadow: 0 2px 16px rgba(15, 23, 42, 0.06);
      }
    }

    .navbar-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 24px;
      height: 68px;
      display: flex;
      align-items: center;
      gap: 24px;
    }

    /* Brand (left) */
    .navbar-brand {
      display: flex; align-items: center; gap: 10px;
      text-decoration: none;
      transition: opacity 0.2s;
      flex-shrink: 0;
      &:hover { opacity: 0.8; }
    }
    .brand-icon {
      width: 36px; height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px;
      box-shadow: 0 2px 8px rgba(37,99,235,0.3);
    }
    .brand-text {
      font-size: 17px; font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.3px;
    }

    /* Nav links (center) */
    .navbar-links {
      flex: 1;
      display: flex;
      justify-content: center;
      gap: 4px;
    }
    .nav-link {
      position: relative;
      display: flex; align-items: center; gap: 8px;
      padding: 10px 16px;
      border-radius: 10px;
      color: #475569;
      text-decoration: none;
      font-size: 14px; font-weight: 500;
      transition: all 0.2s ease;
      i { font-size: 13px; opacity: 0.85; }

      &:hover { background: #f1f5f9; color: #2563eb; }

      &.active {
        background: #eff6ff;
        color: #2563eb;
        font-weight: 600;
        i { opacity: 1; }
      }

      &.active::after {
        content: '';
        position: absolute;
        bottom: -2px; left: 50%;
        transform: translateX(-50%);
        width: 24px; height: 3px;
        background: #2563eb;
        border-radius: 2px 2px 0 0;
        animation: slideIn 0.25s ease;
      }
    }
    @keyframes slideIn {
      from { width: 0; opacity: 0 }
      to { width: 24px; opacity: 1 }
    }

    /* Actions (right) */
    .navbar-actions {
      display: flex; align-items: center; gap: 8px;
      flex-shrink: 0;
    }

    .icon-btn {
      position: relative;
      width: 40px; height: 40px;
      border: none; background: #f1f5f9;
      border-radius: 10px;
      color: #475569;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s ease;
      &:hover { background: #e2e8f0; color: #2563eb; }
      .dot {
        position: absolute; top: 9px; right: 10px;
        width: 8px; height: 8px;
        background: #ef4444;
        border: 2px solid white;
        border-radius: 50%;
      }
    }

    /* User menu */
    .user-menu {
      position: relative;
      display: flex; align-items: center; gap: 8px;
      padding: 6px 14px 6px 6px;
      border-radius: 24px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      cursor: pointer;
      transition: all 0.2s ease;
      &:hover { background: #f1f5f9; border-color: #cbd5e1; }
      .user-name { font-size: 13px; font-weight: 600; color: #1e293b; }
      .chevron {
        font-size: 10px; color: #94a3b8;
        transition: transform 0.25s ease;
        &.rotated { transform: rotate(180deg); }
      }
    }
    .user-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700;
      &.lg { width: 48px; height: 48px; font-size: 16px; }
    }

    .dropdown {
      position: absolute; top: calc(100% + 12px); right: 0;
      min-width: 260px;
      background: white;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
      overflow: hidden;
      animation: dropIn 0.18s cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes dropIn {
      from { opacity: 0; transform: translateY(-8px) scale(0.97) }
      to { opacity: 1; transform: translateY(0) scale(1) }
    }
    .dropdown-header {
      display: flex; align-items: center; gap: 12px;
      padding: 16px;
      strong { display: block; font-size: 14px; color: #0f172a; }
      small { display: block; font-size: 12px; color: #64748b; margin-top: 2px; }
    }
    .dropdown-divider { height: 1px; background: #f1f5f9; }
    .dropdown button {
      width: 100%; padding: 12px 16px;
      display: flex; align-items: center; gap: 10px;
      border: none; background: none;
      font-size: 13px; font-weight: 500;
      color: #dc2626;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s;
      &:hover { background: #fef2f2; }
      i { width: 16px; }
    }

    /* Burger (mobile only) */
    .burger {
      display: none;
      flex-direction: column; justify-content: space-around;
      width: 32px; height: 32px;
      background: none; border: none;
      cursor: pointer; padding: 0;
      span {
        display: block;
        width: 22px; height: 2px;
        background: #0f172a;
        border-radius: 2px;
        transition: all 0.25s ease;
        transform-origin: 1px;
      }
      &.open span:nth-child(1) { transform: rotate(45deg); }
      &.open span:nth-child(2) { opacity: 0; }
      &.open span:nth-child(3) { transform: rotate(-45deg); }
    }

    /* Main content */
    .patient-main {
      padding-top: 92px;
      padding-bottom: 32px;
      max-width: 1280px;
      margin: 0 auto;
      padding-left: 24px; padding-right: 24px;
    }

    /* ========== RESPONSIVE ========== */
    @media (max-width: 768px) {
      .navbar-inner { padding: 0 16px; height: 64px; }
      .navbar-links {
        position: fixed;
        top: 64px; left: 0; right: 0;
        flex-direction: column; gap: 4px;
        padding: 16px;
        background: white;
        border-bottom: 1px solid #e2e8f0;
        transform: translateY(-110%);
        transition: transform 0.25s ease;
        &.mobile-open { transform: translateY(0); }
      }
      .nav-link { width: 100%; padding: 14px 16px; }
      .nav-link.active::after { display: none; }
      .user-menu .user-name { display: none; }
      .user-menu .chevron { display: none; }
      .burger { display: flex; }
      .icon-btn { width: 36px; height: 36px; }
      .patient-main { padding-top: 84px; padding-left: 16px; padding-right: 16px; }
    }
  `]
})
export class AppComponent {
  showDropdown = false;
  isLoginRoute = false;
  isScrolled = false;
  mobileMenuOpen = false;

  constructor(public authService: AuthService, private router: Router) {
    this.router.events.subscribe(() => {
      this.isLoginRoute = this.router.url === '/login' || this.router.url === '/';
      this.mobileMenuOpen = false;
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 8;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent): void {
    const target = ev.target as HTMLElement;
    if (this.showDropdown && !target.closest('.user-menu')) {
      this.showDropdown = false;
    }
  }

  toggleMobileMenu(): void { this.mobileMenuOpen = !this.mobileMenuOpen; }
  closeMobileMenu(): void { this.mobileMenuOpen = false; }
  logout(): void { this.authService.logout(); }
}
