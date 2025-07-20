import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private router: Router, private appComponent: AppComponent) {}

  login() {
    if (this.username === 'brobarber' && this.password === 'brobarber') {
      localStorage.setItem('isLoggedIn', 'true');
      this.router.navigate(['/dashboard']);
      this.appComponent.isLoggedIn = true;
    } else {
      alert('Invalid credentials');
    }
  }
}
