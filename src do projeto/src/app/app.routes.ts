import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage) },
  { path: 'menu', canActivate: [authGuard], loadComponent: () => import('./pages/menu/menu.page').then((m) => m.MenuPage) },
  { path: 'order', canActivate: [authGuard], loadComponent: () => import('./pages/order/order.page').then((m) => m.OrderPage) },
  { path: '**', redirectTo: 'login' },
];
