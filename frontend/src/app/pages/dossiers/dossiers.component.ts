import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DossierService } from '../../services/dossier.service';
import { DossierMedical } from '../../models/patient.model';

@Component({
  selector: 'app-dossiers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dossiers-page">
      <div class="page-header">
        <h1>Dossiers Médicaux</h1>
        <button class="btn btn-primary" (click)="openModal()">
          <i class="fas fa-plus"></i> Nouveau Dossier
        </button>
      </div>

      <!-- Search -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Rechercher par nom du patient..." [(ngModel)]="searchQuery" (input)="onSearch()">
        </div>
      </div>

      <!-- Dossiers Grid -->
      <div class="dossiers-grid">
        <div class="dossier-card card" *ngFor="let dossier of dossiers" (click)="viewDossier(dossier)">
          <div class="dossier-header">
            <div class="patient-avatar">
              {{ dossier.patientNom.charAt(0) }}{{ dossier.patientPrenom.charAt(0) }}
            </div>
            <div class="patient-info">
              <h3>{{ dossier.patientNom }} {{ dossier.patientPrenom }}</h3>
              <span class="badge badge-info">Patient #{{ dossier.patientId }}</span>
            </div>
          </div>
          <div class="dossier-body">
            <div class="info-row">
              <span><i class="fas fa-tint"></i> {{ dossier.groupeSanguin || 'N/A' }}</span>
              <span><i class="fas fa-stethoscope"></i> {{ dossier.consultations.length }} consultations</span>
            </div>
            <div class="info-row">
              <span><i class="fas fa-pills"></i> {{ dossier.ordonnances.length }} ordonnances</span>
              <span><i class="fas fa-flask"></i> {{ dossier.examens.length }} examens</span>
            </div>
            <div class="allergies" *ngIf="dossier.allergies.length > 0">
              <small><i class="fas fa-exclamation-triangle"></i> Allergies: {{ dossier.allergies.join(', ') }}</small>
            </div>
          </div>
          <div class="dossier-footer">
            <button class="btn btn-outline" (click)="editDossier(dossier); $event.stopPropagation()">
              <i class="fas fa-edit"></i> Modifier
            </button>
            <button class="btn-icon danger" (click)="deleteDossier(dossier.id!); $event.stopPropagation()">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <p *ngIf="dossiers.length === 0" class="empty">Aucun dossier médical trouvé</p>

      <!-- Detail View -->
      <div class="modal-backdrop" *ngIf="selectedDossier" (click)="selectedDossier = null">
        <div class="modal" style="max-width: 800px;" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Dossier de {{ selectedDossier.patientNom }} {{ selectedDossier.patientPrenom }}</h2>
            <button class="close-btn" (click)="selectedDossier = null">&times;</button>
          </div>

          <div class="detail-sections">
            <div class="detail-section">
              <h3><i class="fas fa-user"></i> Informations</h3>
              <p><strong>Groupe Sanguin:</strong> {{ selectedDossier.groupeSanguin || 'Non renseigné' }}</p>
              <p><strong>Allergies:</strong> {{ selectedDossier.allergies.length > 0 ? selectedDossier.allergies.join(', ') : 'Aucune' }}</p>
              <p><strong>Antécédents:</strong> {{ selectedDossier.antecedents.length > 0 ? selectedDossier.antecedents.join(', ') : 'Aucun' }}</p>
            </div>

            <div class="detail-section">
              <h3><i class="fas fa-stethoscope"></i> Consultations ({{ selectedDossier.consultations.length }})</h3>
              <div *ngFor="let c of selectedDossier.consultations" class="sub-item">
                <p><strong>{{ c.date | date:'dd/MM/yyyy' }}</strong> — Dr. {{ c.medecinNom }}</p>
                <p>Motif: {{ c.motif }} | Diagnostic: {{ c.diagnostic }}</p>
              </div>
              <p *ngIf="selectedDossier.consultations.length === 0" class="no-data">Aucune consultation</p>
            </div>

            <div class="detail-section">
              <h3><i class="fas fa-pills"></i> Ordonnances ({{ selectedDossier.ordonnances.length }})</h3>
              <div *ngFor="let o of selectedDossier.ordonnances" class="sub-item">
                <p><strong>{{ o.dateEmission }}</strong> — Dr. {{ o.medecinNom }}
                  <span class="badge" [class.badge-success]="o.active" [class.badge-danger]="!o.active">
                    {{ o.active ? 'Active' : 'Expirée' }}
                  </span>
                </p>
                <p *ngFor="let m of o.medicaments">- {{ m.nom }} {{ m.dosage }} ({{ m.frequence }})</p>
              </div>
              <p *ngIf="selectedDossier.ordonnances.length === 0" class="no-data">Aucune ordonnance</p>
            </div>

            <div class="detail-section">
              <h3><i class="fas fa-flask"></i> Examens ({{ selectedDossier.examens.length }})</h3>
              <div *ngFor="let e of selectedDossier.examens" class="sub-item">
                <p><strong>{{ e.type }}</strong> — {{ e.date }}
                  <span class="badge" [ngClass]="{
                    'badge-warning': e.statut === 'en_attente',
                    'badge-success': e.statut === 'termine',
                    'badge-danger': e.statut === 'annule'
                  }">{{ e.statut }}</span>
                </p>
                <p *ngIf="e.resultats">Résultats: {{ e.resultats }}</p>
              </div>
              <p *ngIf="selectedDossier.examens.length === 0" class="no-data">Aucun examen</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingDossier ? 'Modifier' : 'Nouveau' }} Dossier</h2>
            <button class="close-btn" (click)="closeModal()">&times;</button>
          </div>

          <form (ngSubmit)="saveDossier()">
            <div class="form-row">
              <div class="form-group">
                <label>ID Patient *</label>
                <input type="number" [(ngModel)]="form.patientId" name="patientId" required>
              </div>
              <div class="form-group">
                <label>Groupe Sanguin</label>
                <select [(ngModel)]="form.groupeSanguin" name="groupeSanguin">
                  <option value="">Sélectionner</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Nom Patient *</label>
                <input type="text" [(ngModel)]="form.patientNom" name="patientNom" required>
              </div>
              <div class="form-group">
                <label>Prénom Patient *</label>
                <input type="text" [(ngModel)]="form.patientPrenom" name="patientPrenom" required>
              </div>
            </div>

            <div class="form-group">
              <label>Allergies (séparées par des virgules)</label>
              <input type="text" [(ngModel)]="form.allergiesText" name="allergies">
            </div>

            <div class="form-group">
              <label>Antécédents (séparés par des virgules)</label>
              <input type="text" [(ngModel)]="form.antecedentsText" name="antecedents">
            </div>

            <div class="form-group">
              <label>Notes</label>
              <textarea [(ngModel)]="form.notes" name="notes"></textarea>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="closeModal()">Annuler</button>
              <button type="submit" class="btn btn-primary">
                {{ editingDossier ? 'Mettre à jour' : 'Créer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      h1 { font-size: 24px; font-weight: 700; }
    }

    .dossiers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .dossier-card {
      cursor: pointer;
      transition: all 0.2s ease;
      &:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
    }

    .dossier-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .patient-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 16px;
    }

    .patient-info h3 { font-size: 16px; font-weight: 600; }

    .dossier-body { margin-bottom: 16px; }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
      color: var(--gray-500);

      i { margin-right: 4px; }
    }

    .allergies {
      margin-top: 8px;
      padding: 8px;
      background: #fef2f2;
      border-radius: 6px;
      color: #991b1b;
      font-size: 12px;
    }

    .dossier-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid var(--gray-200);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .detail-sections { max-height: 60vh; overflow-y: auto; }

    .detail-section {
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--gray-200);

      h3 {
        font-size: 15px;
        font-weight: 600;
        margin-bottom: 12px;
        color: var(--gray-700);
        i { margin-right: 8px; color: var(--primary); }
      }
    }

    .sub-item {
      padding: 8px 12px;
      margin-bottom: 8px;
      background: var(--gray-50);
      border-radius: 6px;
      font-size: 13px;
    }

    .no-data { color: var(--gray-400); font-size: 13px; font-style: italic; }

    .btn-icon {
      background: none;
      border: 1px solid var(--gray-200);
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gray-500);
      &.danger:hover { border-color: var(--danger); color: var(--danger); }
    }

    .empty { text-align: center; padding: 40px; color: var(--gray-400); }
  `],
})
export class DossiersComponent implements OnInit {
  dossiers: DossierMedical[] = [];
  showModal = false;
  editingDossier: DossierMedical | null = null;
  selectedDossier: DossierMedical | null = null;
  searchQuery = '';
  form: any = this.getEmptyForm();

  constructor(private dossierService: DossierService) {}

  ngOnInit(): void {
    this.loadDossiers();
  }

  loadDossiers(): void {
    this.dossierService.getAll(this.searchQuery || undefined).subscribe({
      next: (res) => { this.dossiers = res.data || []; },
      error: (err) => console.error('Error:', err),
    });
  }

  onSearch(): void {
    this.loadDossiers();
  }

  viewDossier(dossier: DossierMedical): void {
    this.selectedDossier = dossier;
  }

  openModal(): void {
    this.form = this.getEmptyForm();
    this.editingDossier = null;
    this.showModal = true;
  }

  editDossier(dossier: DossierMedical): void {
    this.form = {
      patientId: dossier.patientId,
      patientNom: dossier.patientNom,
      patientPrenom: dossier.patientPrenom,
      groupeSanguin: dossier.groupeSanguin || '',
      allergiesText: dossier.allergies.join(', '),
      antecedentsText: dossier.antecedents.join(', '),
      notes: dossier.notes || '',
    };
    this.editingDossier = dossier;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingDossier = null;
  }

  saveDossier(): void {
    const payload: any = {
      patientId: this.form.patientId,
      patientNom: this.form.patientNom,
      patientPrenom: this.form.patientPrenom,
      groupeSanguin: this.form.groupeSanguin,
      allergies: this.form.allergiesText ? this.form.allergiesText.split(',').map((s: string) => s.trim()) : [],
      antecedents: this.form.antecedentsText ? this.form.antecedentsText.split(',').map((s: string) => s.trim()) : [],
      notes: this.form.notes,
    };

    if (this.editingDossier) {
      this.dossierService.update(this.editingDossier.id!, payload).subscribe({
        next: () => { this.closeModal(); this.loadDossiers(); },
        error: (err) => console.error('Error:', err),
      });
    } else {
      this.dossierService.create(payload).subscribe({
        next: () => { this.closeModal(); this.loadDossiers(); },
        error: (err) => console.error('Error:', err),
      });
    }
  }

  deleteDossier(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) {
      this.dossierService.delete(id).subscribe({
        next: () => this.loadDossiers(),
        error: (err) => console.error('Error:', err),
      });
    }
  }

  private getEmptyForm(): any {
    return {
      patientId: null, patientNom: '', patientPrenom: '',
      groupeSanguin: '', allergiesText: '', antecedentsText: '', notes: '',
    };
  }
}
