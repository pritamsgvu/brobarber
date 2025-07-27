import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterOutlet, RouterModule, ReactiveFormsModule, CommonModule, FormsModule],

})
export class AppComponent implements OnInit {
  isSidebarOpen = false;
  isLoggedIn = false;
  role : any;
  isNavbarCollapsed = false;
  barberMenuOpen: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    const userLoggedIn = localStorage.getItem('isLoggedIn');
    const userDetails = localStorage.getItem('user') || '';
    if (userLoggedIn == 'true') {
      this.isLoggedIn = true;
      this.role = JSON.parse(userDetails)?.role;
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
    this.router.navigate(['/login']);
    this.isLoggedIn = false;
  }

}
