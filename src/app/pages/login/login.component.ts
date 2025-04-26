import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component'; // import AppComponent


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
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
