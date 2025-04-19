import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']

})
export class AppComponent {
  isSidebarOpen = false;

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
