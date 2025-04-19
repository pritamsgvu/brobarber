import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent {
  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('isAdmin');
    this.router.navigate(['/login']);
  }
}
