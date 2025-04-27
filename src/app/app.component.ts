import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']

})
export class AppComponent implements OnInit {
  isSidebarOpen = false;
  isLoggedIn = false;
  isNavbarCollapsed = false;
  barberMenuOpen: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    const userLoggedIn = localStorage.getItem('isLoggedIn');
    if (userLoggedIn == 'true') {
      this.isLoggedIn = true;
    } else {
      this.router.navigate(['']);
    }
  }

  // Toggle the visibility of the Barber Management sub-menu
  toggleBarberMenu() {
    this.barberMenuOpen = !this.barberMenuOpen;
  }
  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  logout() {
    localStorage.setItem('isLoggedIn', 'false');
    this.router.navigate(['']);
    this.isLoggedIn = false;
  }

}
