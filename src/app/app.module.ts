import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './pages/login/login.component';
import { BarbersComponent } from './pages/barbers/barbers.component';
import { AuthGuard } from './guards/auth.guard';
import { BarberService } from './services/barber.service';
import { BookingFormComponent } from './pages/booking-form/booking-form.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductsComponent } from './pages/products/products.component';
import { ChartComponent } from './pages/chart/chart.component';
import { BaseChartDirective } from 'ng2-charts';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    BarbersComponent,
    BookingFormComponent,
    DashboardComponent,
    ProductsComponent,
    ChartComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BaseChartDirective
  ],
  providers: [AuthGuard, BarberService],
  bootstrap: [AppComponent]
})
export class AppModule {}
