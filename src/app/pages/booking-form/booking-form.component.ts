import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BarberService } from '../../services/barber.service';
import { BookingService } from '../../services/booking.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.css']
})
export class BookingFormComponent implements OnInit {
  bookingForm!: FormGroup;
  barbers: any[] = [];
  services: any[] = [];
  products: any[] = [];
  filteredProducts: any[] = []; // Initially empty

  constructor(
    private fb: FormBuilder,
    private barberService: BarberService,
    private bookingService: BookingService,
    private router: Router // inject here
  ) { }

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.bookingForm = this.fb.group({
      customerName: [''],
      mobileNumber: [''],
      barberId: ['', Validators.required],
      date: [today, Validators.required],
      selectedServices: [[], this.atLeastOneSelected()],
      selectedProducts: [[], this.atLeastOneSelected()],
      serviceAmount: ['', Validators.required],
      discount: [0],
      netTotal: [0],
      paymentMode: ['cash', Validators.required],
      totalProductAmount: [0],
    });

    this.loadBarbers();
    this.loadServices();
    this.loadProducts();

    this.bookingForm.valueChanges.subscribe(() => {
      this.updateNetTotal();
    });
  }

  atLeastOneSelected(): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      return value && value.length > 0 ? null : { required: true };
    };
  }

  // For validation display helper
  isInvalid(field: string) {
    const control = this.bookingForm.get(field);
    return control && control.invalid && (control.dirty || control.touched);
  }

  // getTodayDate(): string {
  //   const today = new Date();
  //   return today.toISOString().split('T')[0]; // Returns 'YYYY-MM-DD'
  // }

  loadBarbers() {
    this.barberService.getBarbers().subscribe(data => {
      this.barbers = data;
    });
  }

  loadServices() {
    this.bookingService.getServices().subscribe(data => {
      this.services = data;
    });
  }

  loadProducts() {
    this.bookingService.getProducts().subscribe(data => {
      this.products = data;  // Load all products, we'll filter them based on selected services
    });
  }

  toggleCheckbox(event: any, field: string): void {
    const formArray = this.bookingForm.get(field)?.value || [];
    const value = event.target.value;

    if (event.target.checked) {
      // Add to array
      this.bookingForm.get(field)?.setValue([...formArray, value]);
    } else {
      // Remove from array
      const updatedArray = formArray.filter((item: any) => item !== value);
      this.bookingForm.get(field)?.setValue(updatedArray);
    }

    this.bookingForm.get(field)?.markAsDirty();

    // If services are selected or deselected, update the available products
    if (field === 'selectedServices') {
      this.onServiceChange();
    }
  }

  onServiceChange(): void {
    const selectedServiceIds = this.bookingForm.get('selectedServices')?.value || [];

    // Filter products based on selected services

    this.filteredProducts = this.products.filter((product: any) => {
      const serviceLinks = product.services || [];
      const serviceIds = serviceLinks.map((s: any) => typeof s === 'string' ? s : s._id);
      return serviceIds.some((sid: string) => selectedServiceIds.includes(sid));
    });
   

    // Reset product selections
    this.bookingForm.get('selectedProducts')?.setValue([]);

    // 🟡 Update service amount
    let totalServiceAmount = 0;
    selectedServiceIds.forEach((serviceId: string) => {
      const service = this.services.find(s => s._id === serviceId);
      if (service) totalServiceAmount += service.price || 0;
    });

    this.bookingForm.get('serviceAmount')?.setValue(totalServiceAmount);

    // 🟢 Optionally recalculate net total
    this.updateNetTotal();
  }


  toggleProductCheckbox(event: any, product: any): void {
    const selected = this.bookingForm.get('selectedProducts')?.value || [];

    if (event.target.checked) {
      selected.push({ ...product });  // Store full product object
    } else {
      const index = selected.findIndex((p: any) => p._id === product._id);
      if (index !== -1) selected.splice(index, 1);
    }

    this.bookingForm.get('selectedProducts')?.setValue([...selected]);
    this.updateTotalProductAmount();  // Update the total product amount after selection
  }

  isProductSelected(productId: string): boolean {
    const selected = this.bookingForm.get('selectedProducts')?.value || [];
    return selected.some((p: any) => p._id === productId);
  }

  getProductPrice(productId: string): number {
    const selected = this.bookingForm.get('selectedProducts')?.value || [];
    const product = selected.find((p: any) => p._id === productId);
    return product ? product.perUsePrice : 0;
  }

  updateProductPrice(productId: string, event: any): void {
    const value = parseFloat(event.target.value);
    const selected = this.bookingForm.get('selectedProducts')?.value || [];

    const index = selected.findIndex((p: any) => p._id === productId);
    if (index !== -1) {
      selected[index].perUsePrice = value;
      this.bookingForm.get('selectedProducts')?.setValue([...selected]);
      this.updateTotalProductAmount();  // Update the total product amount after price update
    }
  }

  updateTotalProductAmount(): void {
    const selected = this.bookingForm.get('selectedProducts')?.value || [];
    const totalAmount = selected.reduce((sum: number, p: any) => sum + (p.perUsePrice || 0), 0);
    const serviceCharge = selected.reduce((sum: number, s: any) => sum + (s.serviceCharge || 0), 0);
    this.bookingForm.get('totalProductAmount')?.setValue(totalAmount);  // Set the total product amount in the form
    this.bookingForm.get('serviceAmount')?.setValue(serviceCharge); // ✅ add this line

  }


  updateNetTotal(): void {
    const serviceAmount = this.bookingForm.get('serviceAmount')?.value || 0;
    const productAmount = this.bookingForm.get('totalProductAmount')?.value || 0;
    const discount = this.bookingForm.get('discount')?.value || 0;

    const net = serviceAmount - (productAmount + discount);
    this.bookingForm.get('netTotal')?.setValue(net >= 0 ? net : 0, { emitEvent: false });
  }



  onSubmit() {
    if (this.bookingForm.valid) {
      this.bookingService.createBooking(this.bookingForm.value).subscribe(res => {
        alert('Booking entry successed! Enter next one.');
        this.router.navigate(['/dashboard']);
        // this.resetBookingFields();
      });
    }
    else {
      this.bookingForm.markAllAsTouched(); // Ensure all errors show on submit
    }
  }

  resetBookingFields(): void {
    // Reset form fields
    this.bookingForm.patchValue({
      selectedServices: [],
      selectedProducts: [],
      serviceAmount: '',
      totalProductAmount: 0,
      discount: 0,
    });

    // Reset checkboxes (if you are storing manually in array or UI binding depends on helper functions)
    const serviceCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    serviceCheckboxes.forEach((checkbox: any) => {
      checkbox.checked = false;
    });

    // Optional: reset filteredProducts if it depends on selectedServices
    this.filteredProducts = [];

    // Mark as pristine
    this.bookingForm.get('selectedServices')?.markAsPristine();
    this.bookingForm.get('selectedProducts')?.markAsPristine();
    this.bookingForm.get('serviceAmount')?.markAsPristine();
    this.bookingForm.get('discount')?.markAsPristine();

    // Update validity
    this.bookingForm.get('selectedServices')?.updateValueAndValidity();
    this.bookingForm.get('selectedProducts')?.updateValueAndValidity();
    this.bookingForm.get('serviceAmount')?.updateValueAndValidity();
    this.bookingForm.get('discount')?.updateValueAndValidity();
  }

}
