import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  // Admin routes
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard], data: { role: 'admin' },
  },
  {
    path: 'admin/patients',
    loadComponent: () => import('./pages/patients/patients.component').then(m => m.PatientsComponent),
    canActivate: [AuthGuard], data: { role: 'admin' },
  },
  {
    path: 'admin/rendezvous',
    loadComponent: () => import('./pages/rendezvous/rendezvous.component').then(m => m.RendezvousComponent),
    canActivate: [AuthGuard], data: { role: 'admin' },
  },
  {
    path: 'admin/dossiers',
    loadComponent: () => import('./pages/dossiers/dossiers.component').then(m => m.DossiersComponent),
    canActivate: [AuthGuard], data: { role: 'admin' },
  },
  // Patient routes
  {
    path: 'patient/dashboard',
    loadComponent: () => import('./pages/patient-portal/patient-dashboard.component').then(m => m.PatientDashboardComponent),
    canActivate: [AuthGuard], data: { role: 'patient' },
  },
  {
    path: 'patient/prendre-rdv',
    loadComponent: () => import('./pages/patient-portal/prendre-rdv.component').then(m => m.PrendreRdvComponent),
    canActivate: [AuthGuard], data: { role: 'patient' },
  },
  {
    path: 'patient/mes-rdv',
    loadComponent: () => import('./pages/patient-portal/mes-rdv.component').then(m => m.MesRdvComponent),
    canActivate: [AuthGuard], data: { role: 'patient' },
  },
  {
    path: 'patient/mon-dossier',
    loadComponent: () => import('./pages/patient-portal/mon-dossier.component').then(m => m.MonDossierComponent),
    canActivate: [AuthGuard], data: { role: 'patient' },
  },
  // Legacy redirects
  { path: 'dashboard', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  { path: 'patients', redirectTo: 'admin/patients', pathMatch: 'full' },
  { path: 'rendezvous', redirectTo: 'admin/rendezvous', pathMatch: 'full' },
  { path: 'dossiers', redirectTo: 'admin/dossiers', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
