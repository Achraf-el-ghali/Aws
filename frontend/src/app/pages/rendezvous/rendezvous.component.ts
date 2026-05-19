import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RendezvousService } from '../../services/rendezvous.service';
import { RendezVous } from '../../models/patient.model';

@Component({
  selector: 'app-rendezvous',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rdv-page">
      <div class="page-header">
        <h1>Gestion des Rendez-vous</h1>
        <button class="btn btn-primary" (click)="openModal()">
          <i class="fas fa-plus"></i> Nouveau RDV
        </button>
      </div>

      <!-- Filters -->
      <div class="card filters" style="margin-bottom: 20px;">
        <div class="filter-row">
          <div class="form-group">
            <label>Statut</label>
            <select [(ngModel)]="filterStatut" (change)="loadRendezvous()">
              <option value="">Tous</option>
              <option value="planifie">Planifié</option>
              <option value="confirme">Confirmé</option>
              <option value="annule">Annulé</option>
              <option value="termine">Terminé</option>
            </select>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" [(ngModel)]="filterDate" (change)="loadRendezvous()">
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Médecin</th>
                <th>Date</th>
                <th>Heure</th>
                <th>Type</th>
                <th>Motif</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rdv of rendezvous">
                <td><strong>{{ rdv.patientNom }}</strong></td>
                <td>{{ rdv.medecinNom }}</td>
                <td>{{ rdv.dateRendezVous | date:'dd/MM/yyyy' }}</td>
                <td>{{ rdv.heureDebut }} - {{ rdv.heureFin }}</td>
                <td><span class="badge badge-primary">{{ rdv.typeConsultation }}</span></td>
                <td>{{ rdv.motif || '-' }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-info': rdv.statut === 'planifie',
                    'badge-success': rdv.statut === 'confirme',
                    'badge-danger': rdv.statut === 'annule',
                    'badge-primary': rdv.statut === 'termine'
                  }">{{ rdv.statut }}</span>
                </td>
                <td class="actions">
                  <button class="btn-icon" title="Modifier" (click)="editRdv(rdv)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-icon" title="Confirmer" *ngIf="rdv.statut === 'planifie'" (click)="updateStatus(rdv, 'confirme')">
                    <i class="fas fa-check"></i>
                  </button>
                  <button class="btn-icon danger" title="Supprimer" (click)="deleteRdv(rdv.id!)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p *ngIf="rendezvous.length === 0" class="empty">Aucun rendez-vous trouvé</p>
      </div>

      <!-- Modal -->
      <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingRdv ? 'Modifier' : 'Nouveau' }} Rendez-vous</h2>
            <button class="close-btn" (click)="closeModal()">&times;</button>
          </div>

          <form (ngSubmit)="saveRdv()">
            <div class="form-row">
              <div class="form-group">
                <label>ID Patient *</label>
                <input type="number" [(ngModel)]="form.patientId" name="patientId" required>
              </div>
              <div class="form-group">
                <label>Nom Patient *</label>
                <input type="text" [(ngModel)]="form.patientNom" name="patientNom" required>
              </div>
            </div>

            <div class="form-group">
              <label>Médecin *</label>
              <input type="text" [(ngModel)]="form.medecinNom" name="medecinNom" required>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Date *</label>
                <input type="date" [(ngModel)]="form.dateRendezVous" name="dateRendezVous" required>
              </div>
              <div class="form-group">
                <label>Type *</label>
                <select [(ngModel)]="form.typeConsultation" name="typeConsultation" required>
                  <option value="generale">Générale</option>
                  <option value="specialiste">Spécialiste</option>
                  <option value="urgence">Urgence</option>
                  <option value="suivi">Suivi</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Heure début *</label>
                <input type="time" [(ngModel)]="form.heureDebut" name="heureDebut" required>
              </div>
              <div class="form-group">
                <label>Heure fin *</label>
                <input type="time" [(ngModel)]="form.heureFin" name="heureFin" required>
              </div>
            </div>

            <div class="form-group">
              <label>Motif</label>
              <input type="text" [(ngModel)]="form.motif" name="motif">
            </div>

            <div class="form-group">
              <label>Lieu</label>
              <input type="text" [(ngModel)]="form.lieu" name="lieu">
            </div>

            <div class="form-group">
              <label>Notes</label>
              <textarea [(ngModel)]="form.notes" name="notes"></textarea>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="closeModal()">Annuler</button>
              <button type="submit" class="btn btn-primary">
                {{ editingRdv ? 'Mettre à jour' : 'Créer' }}
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

    .filter-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .actions { display: flex; gap: 8px; }

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
      transition: all 0.2s ease;
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.danger:hover { border-color: var(--danger); color: var(--danger); }
    }

    .empty { text-align: center; padding: 40px; color: var(--gray-400); }
  `],
})
export class RendezvousComponent implements OnInit {
  rendezvous: RendezVous[] = [];
  showModal = false;
  editingRdv: RendezVous | null = null;
  filterStatut = '';
  filterDate = '';
  form: any = this.getEmptyForm();

  constructor(private rdvService: RendezvousService) {}

  ngOnInit(): void {
    this.loadRendezvous();
  }

  loadRendezvous(): void {
    const filters: any = {};
    if (this.filterStatut) filters.statut = this.filterStatut;
    if (this.filterDate) filters.date = this.filterDate;

    this.rdvService.getAll(filters).subscribe({
      next: (res) => { this.rendezvous = res.data || []; },
      error: (err) => console.error('Error:', err),
    });
  }

  openModal(): void {
    this.form = this.getEmptyForm();
    this.editingRdv = null;
    this.showModal = true;
  }

  editRdv(rdv: RendezVous): void {
    this.form = { ...rdv };
    this.editingRdv = rdv;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingRdv = null;
  }

  saveRdv(): void {
    if (this.editingRdv) {
      this.rdvService.update(this.editingRdv.id!, this.form).subscribe({
        next: () => { this.closeModal(); this.loadRendezvous(); },
        error: (err) => console.error('Error:', err),
      });
    } else {
      this.rdvService.create(this.form).subscribe({
        next: () => { this.closeModal(); this.loadRendezvous(); },
        error: (err) => console.error('Error:', err),
      });
    }
  }

  updateStatus(rdv: RendezVous, statut: string): void {
    this.rdvService.update(rdv.id!, { statut }).subscribe({
      next: () => this.loadRendezvous(),
      error: (err) => console.error('Error:', err),
    });
  }

  deleteRdv(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      this.rdvService.delete(id).subscribe({
        next: () => this.loadRendezvous(),
        error: (err) => console.error('Error:', err),
      });
    }
  }

  private getEmptyForm(): any {
    return {
      patientId: null, patientNom: '', medecinNom: '',
      dateRendezVous: '', heureDebut: '09:00', heureFin: '09:30',
      motif: '', notes: '', lieu: '', typeConsultation: 'generale',
    };
  }
}
