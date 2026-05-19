import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RendezvousService } from '../../services/rendezvous.service';

@Component({
  selector: 'app-mes-rdv',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mes-rdv">
      <h1>Mes Rendez-vous</h1>
      <div class="card">
        <div class="table-container" *ngIf="rendezvous.length > 0">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Heure</th>
                <th>Médecin</th>
                <th>Type</th>
                <th>Motif</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rdv of rendezvous">
                <td>{{ rdv.dateRendezVous | date:'dd/MM/yyyy' }}</td>
                <td>{{ rdv.heureDebut }} - {{ rdv.heureFin }}</td>
                <td>{{ rdv.medecinNom }}</td>
                <td><span class="badge badge-primary">{{ rdv.typeConsultation }}</span></td>
                <td>{{ rdv.motif || '-' }}</td>
                <td>
                  <span class="badge" [ngClass]="{'badge-info': rdv.statut==='planifie','badge-success': rdv.statut==='confirme','badge-danger': rdv.statut==='annule','badge-primary': rdv.statut==='termine'}">
                    {{ rdv.statut }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p *ngIf="rendezvous.length === 0" class="empty"><i class="fas fa-calendar-times"></i> Aucun rendez-vous</p>
      </div>
    </div>
  `,
  styles: [`
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 24px; }
    .empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 15px; i { margin-right: 8px; } }
  `]
})
export class MesRdvComponent implements OnInit {
  rendezvous: any[] = [];
  constructor(private authService: AuthService, private rdvService: RendezvousService) {}
  ngOnInit(): void {
    this.rdvService.getAll({ patientId: this.authService.currentUser?.id }).subscribe({
      next: (res) => { this.rendezvous = res.data || []; },
      error: () => {}
    });
  }
}
