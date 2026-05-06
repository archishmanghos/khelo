import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing').then((m) => m.LandingComponent),
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'matches',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/matches/matches').then((m) => m.MatchesComponent),
      },
      {
        path: 'create',
        loadComponent: () => import('./features/matches/create/create-match').then((m) => m.CreateMatchComponent),
      }
    ]
  },
];
