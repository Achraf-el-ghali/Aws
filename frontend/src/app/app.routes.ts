import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'patients',
    loadComponent: () => import('./pages/patients/patients.component').then(m => m.PatientsComponent),
  },
  {
    path: 'rendezvous',
    loadComponent: () => import('./pages/rendezvous/rendezvous.component').then(m => m.RendezvousComponent),
  },
  {
    path: 'dossiers',
    loadComponent: () => import('./pages/dossiers/dossiers.component').then(m => m.DossiersComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
