import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BarberService } from '../../core/services/barber.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-barbers',
  templateUrl: './barbers.component.html',
  styleUrls: ['./barbers.component.css'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class BarbersComponent implements OnInit {
  barberForm!: FormGroup;
  barbers: any[] = [];
  selectedBarber: any = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private barberService: BarberService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.fetchBarbers();
  }

  initForm() {
    this.barberForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: ['', Validators.required],
      mobile: ['', Validators.required],
      address: [''],
      aadhar: [''],
      photo: [''],
      isActive: [false],
    });
  }

  fetchBarbers() {
    this.loading = true;
    this.barberService.getBarbers().subscribe({
      next: (res) => {
        this.barbers = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.barberForm.invalid) return;

    const barberData = { ...this.barberForm.value };

    if (this.selectedBarber) {
      // Update
      this.barberService.updateBarber(this.selectedBarber._id, barberData).subscribe({
        next: () => {
          this.fetchBarbers();
          this.resetForm();
        },
        error: (err) => console.error(err)
      });
    } else {
      // Create
      this.barberService.addBarber(barberData).subscribe({
        next: () => {
          this.fetchBarbers();
          this.resetForm();
        },
        error: (err) => console.error(err)
      });
    }
  }

  editBarber(barber: any) {
    this.selectedBarber = barber;
    this.barberForm.patchValue({
      name: barber.name,
      mobile: barber.mobile,
      username: barber.username,
      password: barber.password,
      role: barber.role,
      address: barber.address,
      aadhar: barber.aadhar,
      photo: barber.photo,
      isActive: barber.isActive,
    });
  }

  deleteBarber(barberId: string) {
    if (confirm('Are you sure you want to delete this barber?')) {
      this.barberService.deleteBarber(barberId).subscribe({
        next: () => this.fetchBarbers(),
        error: (err) => console.error(err)
      });
    }
  }

  resetForm() {
    this.barberForm.reset();
    this.selectedBarber = null;
  }
}
