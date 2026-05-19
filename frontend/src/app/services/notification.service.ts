import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: Date;
}

export interface LogEntry {
  id: number;
  timestamp: Date;
  type: 'HTTP' | 'KAFKA' | 'DB' | 'SYSTEM';
  method?: string;
  status?: number;
  message: string;
  color: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private logsSubject = new BehaviorSubject<LogEntry[]>([]);
  logs$ = this.logsSubject.asObservable();

  private nextId = 1;

  showSuccess(message: string): void { this.addToast('success', message); }
  showError(message: string): void { this.addToast('error', message); }
  showInfo(message: string): void { this.addToast('info', message); }
  showWarning(message: string): void { this.addToast('warning', message); }

  private addToast(type: Toast['type'], message: string): void {
    const toast: Toast = { id: this.nextId++, type, message, timestamp: new Date() };
    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, toast]);
    setTimeout(() => this.removeToast(toast.id), 4000);
  }

  removeToast(id: number): void {
    this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
  }

  addLog(type: LogEntry['type'], message: string, method?: string, status?: number): void {
    const colors: Record<string, string> = { HTTP: '#3b82f6', KAFKA: '#f59e0b', DB: '#10b981', SYSTEM: '#8b5cf6' };
    const log: LogEntry = { id: this.nextId++, timestamp: new Date(), type, message, method, status, color: colors[type] || '#64748b' };
    const current = this.logsSubject.value;
    this.logsSubject.next([log, ...current].slice(0, 50));
  }

  clearLogs(): void { this.logsSubject.next([]); }
}
