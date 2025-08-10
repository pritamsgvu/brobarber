import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { BarberService } from '../../core/services/barber.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'], // optional
  imports: [CommonModule, FormsModule]
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  rememberMe = false;
  isLoading = false;

  constructor(
    private router: Router,
    private appComponent: AppComponent,
    private barberService: BarberService
  ) {}

  ngOnInit() {
    const savedUsername = localStorage.getItem('savedUsername');
    const savedPassword = localStorage.getItem('savedPassword');
    if (savedUsername && savedPassword) {
      this.username = savedUsername;
      this.password = savedPassword;
      this.rememberMe = true;
    }
  }

  login() {
    this.isLoading = true;
    this.barberService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.isLoading = false;

        // Remember Me credentials (⚠ Insecure - better to store token only)
        if (this.rememberMe) {
          localStorage.setItem('savedUsername', this.username);
          localStorage.setItem('savedPassword', this.password);
        } else {
          localStorage.removeItem('savedUsername');
          localStorage.removeItem('savedPassword');
        }

        // Store login state
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(res.user));
        this.appComponent.isLoggedIn = true;
        this.appComponent.role = res?.user?.role;

        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isLoading = false;
        alert('Invalid credentials or server error');
      }
    });
  }
}
