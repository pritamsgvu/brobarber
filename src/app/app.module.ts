import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './pages/login/login.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { BarbersComponent } from './pages/barbers/barbers.component';
import { AuthGuard } from './guards/auth.guard';
import { BarberService } from './services/barber.service';
import { BookingFormComponent } from './pages/booking-form/booking-form.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductsComponent } from './pages/products/products.component';
// import { ChartsModule } from 'ng2-charts'; // Importing ChartsModule


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminDashboardComponent,
    BarbersComponent,
    BookingFormComponent,
    DashboardComponent,
    ProductsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    // ChartsModule
  ],
  providers: [AuthGuard, BarberService],
  bootstrap: [AppComponent]
})
export class AppModule {}
