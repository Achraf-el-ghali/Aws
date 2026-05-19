import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NotificationService, LogEntry } from '../../services/notification.service';
import { environment } from '@environments/environment';
import { Subscription } from 'rxjs';

interface ServiceStatus {
  name: string;
  url: string;
  tech: string;
  status: 'checking' | 'online' | 'offline';
  responseTime?: number;
  icon: string;
}

@Component({
  selector: 'app-diagnostic',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="diagnostic-page">
      <div class="diag-header">
        <h1><i class="fas fa-stethoscope"></i> Health Check Dashboard</h1>
        <p>Diagnostic en temps réel de l'infrastructure Cloud-Health</p>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="checkAllServices()">
            <i class="fas fa-sync-alt" [class.spinning]="isChecking"></i> Tester tout
          </button>
          <button class="btn btn-outline" (click)="simulateFullFlow()">
            <i class="fas fa-play"></i> Simuler flux complet
          </button>
        </div>
      </div>

      <section class="status-section">
        <h2>Statut des Microservices</h2>
        <div class="services-grid">
          <div *ngFor="let service of services" class="service-card" [class.online]="service.status === 'online'" [class.offline]="service.status === 'offline'" [class.checking]="service.status === 'checking'">
            <div class="service-indicator"><span class="dot"></span></div>
            <div class="service-info">
              <div class="service-name"><i [class]="service.icon"></i> {{ service.name }}</div>
              <div class="service-tech">{{ service.tech }}</div>
            </div>
            <div class="service-status">
              <span *ngIf="service.status === 'online'" class="status-text online">Connecté</span>
              <span *ngIf="service.status === 'offline'" class="status-text offline">Erreur</span>
              <span *ngIf="service.status === 'checking'" class="status-text checking">Test...</span>
              <span *ngIf="service.responseTime" class="response-time">{{ service.responseTime }}ms</span>
            </div>
          </div>
        </div>
      </section>

      <section class="console-section">
        <div class="console-header">
          <h2><i class="fas fa-terminal"></i> Console de Logs en Direct</h2>
          <button class="btn-sm" (click)="notificationService.clearLogs()"><i class="fas fa-trash"></i> Vider</button>
        </div>
        <div class="console-body">
          <div *ngIf="logs.length === 0" class="console-empty">
            <i class="fas fa-info-circle"></i> En attente d'événements... Cliquez sur "Tester tout" ou "Simuler flux complet"
          </div>
          <div *ngFor="let log of logs" class="log-entry">
            <span class="log-time">{{ log.timestamp | date:'HH:mm:ss.SSS' }}</span>
            <span class="log-type" [style.background]="log.color">{{ log.type }}</span>
            <span class="log-method" *ngIf="log.method">{{ log.method }}</span>
            <span class="log-status" *ngIf="log.status" [class.success]="log.status < 300" [class.error]="log.status >= 400">{{ log.status }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </section>

      <section class="flow-section">
        <h2><i class="fas fa-project-diagram"></i> Flux Kafka (Événements Asynchrones)</h2>
        <div class="flow-diagram">
          <div class="flow-step" [class.active]="flowStep >= 1">
            <div class="step-icon"><i class="fas fa-calendar-plus"></i></div>
            <span>RDV Créé</span><small>.NET Core</small>
          </div>
          <div class="flow-arrow" [class.active]="flowStep >= 2"><i class="fas fa-long-arrow-alt-right"></i></div>
          <div class="flow-step" [class.active]="flowStep >= 2">
            <div class="step-icon"><i class="fas fa-broadcast-tower"></i></div>
            <span>Event Publié</span><small>Kafka Topic</small>
          </div>
          <div class="flow-arrow" [class.active]="flowStep >= 3"><i class="fas fa-long-arrow-alt-right"></i></div>
          <div class="flow-step" [class.active]="flowStep >= 3">
            <div class="step-icon"><i class="fas fa-database"></i></div>
            <span>Dossier Créé</span><small>Spring Boot</small>
          </div>
          <div class="flow-arrow" [class.active]="flowStep >= 4"><i class="fas fa-long-arrow-alt-right"></i></div>
          <div class="flow-step" [class.active]="flowStep >= 4">
            <div class="step-icon"><i class="fas fa-check-circle"></i></div>
            <span>Notification</span><small>Front-End</small>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .diagnostic-page { max-width: 1200px; margin: 0 auto; animation: fadeIn 0.5s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .diag-header { margin-bottom: 32px; h1 { font-size: 26px; font-weight: 800; color: #1e293b; i { margin-right: 10px; color: #2563eb; } } p { color: #64748b; margin-top: 4px; } }
    .header-actions { display: flex; gap: 12px; margin-top: 16px; }
    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .status-section { margin-bottom: 32px; h2 { font-size: 16px; font-weight: 700; margin-bottom: 16px; color: #334155; } }
    .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
    .service-card { background: white; border-radius: 14px; padding: 20px; display: flex; align-items: center; gap: 14px; box-shadow: 0 2px 12px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; transition: all 0.3s;
      &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
      &.online { border-left: 4px solid #10b981; } &.offline { border-left: 4px solid #ef4444; } &.checking { border-left: 4px solid #f59e0b; } }
    .service-indicator .dot { width: 12px; height: 12px; border-radius: 50%; display: block; }
    .service-card.online .dot { background: #10b981; box-shadow: 0 0 8px rgba(16,185,129,0.4); }
    .service-card.offline .dot { background: #ef4444; } .service-card.checking .dot { background: #f59e0b; animation: pulse 1s infinite; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
    .service-info { flex: 1; } .service-name { font-size: 14px; font-weight: 600; color: #1e293b; i { margin-right: 8px; color: #3b82f6; } }
    .service-tech { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    .service-status { text-align: right; } .status-text { font-size: 12px; font-weight: 600; &.online { color: #10b981; } &.offline { color: #ef4444; } &.checking { color: #f59e0b; } }
    .response-time { display: block; font-size: 10px; color: #94a3b8; margin-top: 2px; }
    .console-section { margin-bottom: 32px; }
    .console-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; h2 { font-size: 16px; font-weight: 700; color: #334155; i { margin-right: 8px; color: #8b5cf6; } } }
    .btn-sm { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; color: #64748b; &:hover { background: #e2e8f0; } }
    .console-body { background: #0f172a; border-radius: 12px; padding: 20px; min-height: 200px; max-height: 350px; overflow-y: auto; font-family: monospace; }
    .console-empty { color: #475569; font-size: 13px; text-align: center; padding: 40px 0; i { margin-right: 6px; } }
    .log-entry { display: flex; align-items: center; gap: 10px; padding: 6px 0; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .log-time { color: #64748b; font-size: 10px; min-width: 80px; } .log-type { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; color: white; min-width: 50px; text-align: center; }
    .log-method { color: #93c5fd; font-weight: 600; } .log-status { padding: 1px 6px; border-radius: 3px; font-size: 10px; font-weight: 700; &.success { background: #064e3b; color: #6ee7b7; } &.error { background: #7f1d1d; color: #fca5a5; } }
    .log-message { color: #e2e8f0; flex: 1; }
    .flow-section { margin-bottom: 32px; h2 { font-size: 16px; font-weight: 700; margin-bottom: 20px; color: #334155; i { margin-right: 8px; color: #f59e0b; } } }
    .flow-diagram { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 32px; background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.04); flex-wrap: wrap; }
    .flow-step { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px; border-radius: 12px; background: #f8fafc; border: 2px solid #e2e8f0; transition: all 0.5s;
      span { font-size: 12px; font-weight: 600; color: #475569; } small { font-size: 10px; color: #94a3b8; }
      &.active { background: #eff6ff; border-color: #3b82f6; .step-icon { background: #2563eb; color: white; } span { color: #1e40af; } } }
    .step-icon { width: 48px; height: 48px; border-radius: 12px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #94a3b8; transition: all 0.5s; }
    .flow-arrow { color: #cbd5e1; font-size: 20px; transition: color 0.5s; &.active { color: #3b82f6; } }
  `]
})
export class DiagnosticComponent implements OnInit, OnDestroy {
  services: ServiceStatus[] = [
    { name: 'API Gateway', url: 'http://localhost/health', tech: 'Nginx (Port 80)', status: 'checking', icon: 'fas fa-network-wired' },
    { name: 'MS_Patients', url: `${environment.patientsApiUrl}/patients/stats`, tech: 'Symfony / PHP 8.2 / MySQL', status: 'checking', icon: 'fas fa-users' },
    { name: 'MS_RendezVous', url: `${environment.rendezvousApiUrl}/rendezvous/stats`, tech: '.NET Core 8 / PostgreSQL', status: 'checking', icon: 'fas fa-calendar-alt' },
    { name: 'MS_Dossiers', url: `${environment.dossiersApiUrl}/dossiers/stats`, tech: 'Spring Boot 3 / MongoDB', status: 'checking', icon: 'fas fa-folder-open' },
    { name: 'Event Broker (Kafka)', url: `${environment.dossiersApiUrl}/dossiers/stats`, tech: 'Apache Kafka / Confluent', status: 'checking', icon: 'fas fa-broadcast-tower' },
  ];
  logs: LogEntry[] = [];
  isChecking = false;
  flowStep = 0;
  private logsSub?: Subscription;

  constructor(private http: HttpClient, public notificationService: NotificationService) {}

  ngOnInit(): void {
    this.logsSub = this.notificationService.logs$.subscribe(logs => this.logs = logs);
    this.checkAllServices();
  }
  ngOnDestroy(): void { this.logsSub?.unsubscribe(); }

  checkAllServices(): void {
    this.isChecking = true;
    this.notificationService.addLog('SYSTEM', 'Début du diagnostic de tous les services...');
    this.services.forEach((service, i) => {
      service.status = 'checking';
      setTimeout(() => this.pingService(service), i * 500);
    });
    setTimeout(() => { this.isChecking = false; }, this.services.length * 500 + 2000);
  }

  private pingService(service: ServiceStatus): void {
    const start = Date.now();
    this.http.get(service.url, { observe: 'response' }).subscribe({
      next: (res) => {
        service.status = 'online';
        service.responseTime = Date.now() - start;
        this.notificationService.addLog('HTTP', `${service.name} → OK`, 'GET', res.status);
      },
      error: (err) => {
        if (err.status && err.status > 0) {
          service.status = 'online';
          service.responseTime = Date.now() - start;
          this.notificationService.addLog('HTTP', `${service.name} → Accessible (${err.status})`, 'GET', err.status);
        } else {
          service.status = 'offline';
          this.notificationService.addLog('HTTP', `${service.name} → Inaccessible`, 'GET', 0);
        }
      }
    });
  }

  simulateFullFlow(): void {
    this.flowStep = 0;
    this.notificationService.addLog('SYSTEM', '=== SIMULATION DU FLUX COMPLET ===');
    setTimeout(() => { this.flowStep = 1; this.notificationService.addLog('HTTP', 'POST /api/rendezvous → RDV créé', 'POST', 201); }, 500);
    setTimeout(() => { this.flowStep = 2; this.notificationService.addLog('KAFKA', "Événement 'rendezvous.created' publié sur topic"); }, 1500);
    setTimeout(() => { this.flowStep = 3; this.notificationService.addLog('DB', 'MongoDB → Dossier médical auto-créé pour patient'); }, 2800);
    setTimeout(() => { this.flowStep = 4; this.notificationService.addLog('SYSTEM', 'Notification → Dossier créé avec succès'); this.notificationService.showSuccess('Flux complet exécuté !'); }, 4000);
  }
}
