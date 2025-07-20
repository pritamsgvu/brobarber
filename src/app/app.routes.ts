import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'todo', loadComponent: () => import('./pages/todo/todo.component').then(m => m.TodoComponent), canActivate: [AuthGuard] },
  { path: 'barbers', loadComponent: () => import('./pages/barbers/barbers.component').then(m => m.BarbersComponent), canActivate: [AuthGuard] },
  { path: 'booking-form', loadComponent: () => import('./pages/booking-form/booking-form.component').then(m => m.BookingFormComponent), canActivate: [AuthGuard] },
  { path: 'products', loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent), canActivate: [AuthGuard] },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [AuthGuard] },
  { path: 'service', loadComponent: () => import('./pages/service/service.component').then(m => m.ServiceComponent), canActivate: [AuthGuard] },
  { path: 'chart', loadComponent: () => import('./pages/chart/chart.component').then(m => m.ChartComponent), canActivate: [AuthGuard] },
  { path: 'expenses', loadComponent: () => import('./pages/expenses/expenses.component').then(m => m.ExpensesComponent), canActivate: [AuthGuard] },
];
