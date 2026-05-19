import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <i class="fas fa-heartbeat"></i>
            <span>Cloud Health</span>
          </div>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <i class="fas fa-chart-line"></i>
            <span>Dashboard</span>
          </a>
          <a routerLink="/patients" routerLinkActive="active" class="nav-item">
            <i class="fas fa-users"></i>
            <span>Patients</span>
          </a>
          <a routerLink="/rendezvous" routerLinkActive="active" class="nav-item">
            <i class="fas fa-calendar-alt"></i>
            <span>Rendez-vous</span>
          </a>
          <a routerLink="/dossiers" routerLinkActive="active" class="nav-item">
            <i class="fas fa-folder-open"></i>
            <span>Dossiers</span>
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="user-info">
            <i class="fas fa-user-md"></i>
            <div>
              <span class="user-name">Dr. Admin</span>
              <span class="user-role">Administrateur</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="top-bar">
          <h1 class="page-title">Cloud Health</h1>
          <div class="top-bar-actions">
            <span class="status-indicator">
              <i class="fas fa-circle" style="color: var(--success); font-size: 8px;"></i>
              Système en ligne
            </span>
          </div>
        </header>
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
    }

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

    .sidebar-header {
      padding: 24px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
      font-weight: 700;

      i { color: #60a5fa; font-size: 24px; }
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;

      i { width: 20px; text-align: center; }

      &:hover {
        background: rgba(255,255,255,0.05);
        color: white;
      }

      &.active {
        background: #2563eb;
        color: white;
        box-shadow: 0 4px 12px rgba(37,99,235,0.3);
      }
    }

    .sidebar-footer {
      padding: 16px 24px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;

      i { font-size: 20px; color: #60a5fa; }

      .user-name { display: block; font-size: 14px; font-weight: 500; }
      .user-role { display: block; font-size: 12px; color: #94a3b8; }
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
    }

    .top-bar {
      background: white;
      padding: 16px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--gray-800);
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--gray-500);
    }

    .content-area {
      padding: 32px;
      flex: 1;
    }
  `]
})
export class AppComponent {}
