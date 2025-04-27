import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Service, ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.css']
})
export class ServiceComponent implements OnInit {
  services: Service[] = [];
  serviceForm: FormGroup;
  isEditing = false;
  currentServiceId: string | null = null;
  loading = false;

  constructor(private serviceService: ServiceService, private fb: FormBuilder) {
    this.serviceForm = this.fb.group({
      serviceName: ['', Validators.required],
      servicePrice: [0, Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    this.fetchServices();
  }

  fetchServices() {
    this.loading = true;
    this.serviceService.getServices().subscribe({
      next: (res) => {
        this.services = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  submitForm() {
    if (this.serviceForm.invalid) return;

    const serviceData = this.serviceForm.value;

    if (this.isEditing && this.currentServiceId) {
      this.serviceService.updateService(this.currentServiceId, serviceData).subscribe(() => {
        this.resetForm();
        this.fetchServices();
      });
    } else {
      this.serviceService.addService(serviceData).subscribe(() => {
        this.resetForm();
        this.fetchServices();
      });
    }
  }

  editService(service: Service) {
    this.serviceForm.patchValue(service);
    this.isEditing = true;
    this.currentServiceId = service._id ?? null;
  }

  deleteService(id: string) {
    if (confirm('Are you sure you want to delete?')) {
      this.serviceService.deleteService(id).subscribe(() => {
        this.fetchServices();
      });
    }
  }

  resetForm() {
    this.serviceForm.reset();
    this.isEditing = false;
    this.currentServiceId = null;
  }
}
