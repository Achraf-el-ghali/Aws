import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DossierService } from '../../services/dossier.service';

@Component({
  selector: 'app-mon-dossier',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mon-dossier">
      <h1>Mon Dossier Médical</h1>

      <div class="card" *ngIf="dossier">
        <div class="dossier-header">
          <div class="patient-avatar">{{ dossier.patientNom?.charAt(0) }}{{ dossier.patientPrenom?.charAt(0) }}</div>
          <div>
            <h2>{{ dossier.patientPrenom }} {{ dossier.patientNom }}</h2>
            <span class="badge badge-info">Groupe Sanguin : {{ dossier.groupeSanguin || 'Non renseigné' }}</span>
          </div>
        </div>

        <div class="section">
          <h3><i class="fas fa-exclamation-triangle"></i> Allergies</h3>
          <div class="tags" *ngIf="dossier.allergies?.length > 0">
            <span class="tag danger" *ngFor="let a of dossier.allergies">{{ a }}</span>
          </div>
          <p *ngIf="!dossier.allergies?.length" class="no-data">Aucune allergie connue</p>
        </div>

        <div class="section">
          <h3><i class="fas fa-history"></i> Antécédents</h3>
          <div class="tags" *ngIf="dossier.antecedents?.length > 0">
            <span class="tag" *ngFor="let a of dossier.antecedents">{{ a }}</span>
          </div>
          <p *ngIf="!dossier.antecedents?.length" class="no-data">Aucun antécédent</p>
        </div>

        <div class="section">
          <h3><i class="fas fa-stethoscope"></i> Consultations ({{ dossier.consultations?.length || 0 }})</h3>
          <div *ngFor="let c of dossier.consultations" class="sub-item">
            <p><strong>{{ c.date | date:'dd/MM/yyyy' }}</strong> — Dr. {{ c.medecinNom }}</p>
            <p>{{ c.diagnostic }}</p>
          </div>
          <p *ngIf="!dossier.consultations?.length" class="no-data">Aucune consultation</p>
        </div>

        <div class="section">
          <h3><i class="fas fa-pills"></i> Ordonnances ({{ dossier.ordonnances?.length || 0 }})</h3>
          <div *ngFor="let o of dossier.ordonnances" class="sub-item">
            <p><strong>{{ o.dateEmission }}</strong> — Dr. {{ o.medecinNom }}
              <span class="badge" [class.badge-success]="o.active" [class.badge-danger]="!o.active">{{ o.active ? 'Active' : 'Expirée' }}</span>
            </p>
          </div>
          <p *ngIf="!dossier.ordonnances?.length" class="no-data">Aucune ordonnance</p>
        </div>
      </div>

      <div class="card" *ngIf="!dossier && !loading">
        <p class="empty"><i class="fas fa-folder-open"></i> Aucun dossier médical trouvé</p>
      </div>
    </div>
  `,
  styles: [`
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 24px; }
    .dossier-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }
    .patient-avatar { width: 56px; height: 56px; border-radius: 50%; background: #2563eb; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; }
    h2 { font-size: 18px; font-weight: 600; }
    .section { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;
      h3 { font-size: 15px; font-weight: 600; margin-bottom: 12px; color: #334155; i { margin-right: 8px; color: #2563eb; } } }
    .tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .tag { padding: 4px 12px; border-radius: 20px; font-size: 12px; background: #e2e8f0; color: #475569;
      &.danger { background: #fee2e2; color: #991b1b; } }
    .sub-item { padding: 10px 12px; margin-bottom: 8px; background: #f8fafc; border-radius: 8px; font-size: 13px; }
    .no-data { color: #94a3b8; font-size: 13px; font-style: italic; }
    .empty { text-align: center; padding: 40px; color: #94a3b8; i { margin-right: 8px; } }
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
        next: (res) => { this.dossier = res.data; this.loading = false; },
        error: () => { this.loading = false; }
      });
    }
  }
}
