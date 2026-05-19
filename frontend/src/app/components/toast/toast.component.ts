import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Toast } from '../../services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts; trackBy: trackById"
           class="toast toast-{{ toast.type }}"
           [class.toast-enter]="true">
        <div class="toast-icon">
          <i class="fas" [ngClass]="{
            'fa-check-circle': toast.type === 'success',
            'fa-times-circle': toast.type === 'error',
            'fa-info-circle': toast.type === 'info',
            'fa-exclamation-triangle': toast.type === 'warning'
          }"></i>
        </div>
        <div class="toast-content">
          <span class="toast-message">{{ toast.message }}</span>
        </div>
        <button class="toast-close" (click)="dismiss(toast.id)">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 380px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 10px;
      background: white;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
      border-left: 4px solid;
      animation: slideIn 0.3s ease-out;
      min-width: 300px;
    }

    .toast-success {
      border-left-color: #10b981;
      .toast-icon { color: #10b981; }
    }

    .toast-error {
      border-left-color: #ef4444;
      .toast-icon { color: #ef4444; }
    }

    .toast-info {
      border-left-color: #3b82f6;
      .toast-icon { color: #3b82f6; }
    }

    .toast-warning {
      border-left-color: #f59e0b;
      .toast-icon { color: #f59e0b; }
    }

    .toast-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .toast-content {
      flex: 1;
    }

    .toast-message {
      font-size: 13px;
      font-weight: 500;
      color: #1e293b;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;

      &:hover {
        color: #475569;
        background: #f1f5f9;
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription!: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  dismiss(id: number): void {
    this.notificationService.removeToast(id);
  }

  trackById(index: number, toast: Toast): number {
    return toast.id;
  }
}
