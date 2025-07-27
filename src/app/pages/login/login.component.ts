import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { BarberService } from '../../core/services/barber.service';
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private router: Router, private appComponent: AppComponent, private barberService: BarberService) {}

  login() {
    this.barberService.login(this.username, this.password).subscribe({
      next: (res) => {
        // Login successful
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(res.user)); // optional
        this.appComponent.isLoggedIn = true;
        this.appComponent.role = res?.user?.role;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        // Login failed
        alert('Invalid credentials or server error');
      }
    });
  }
  
}
