import { Component, OnInit,  ViewChild, ElementRef  } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-product-management',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  productForm: FormGroup;
  products: any[] = [];
  services: any[] = [];
  groupedServices: any[] = [];

  selectedProduct: any = null;
  loading: boolean = true;
  @ViewChild('menuContent') menuContent!: ElementRef;


  constructor(private fb: FormBuilder, private productService: ProductService) {
    this.productForm = this.fb.group({
      productName: [''],
      brand: [''],
      productPrice: [0],
      perUsePrice: [0],
      serviceCharge: [0],
      services: [[]]
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.loadProducts();
    this.loadServices();
  }

  loadProducts() {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
      this.groupProductsByService();
      this.loading = false;
    });
  }
  groupProductsByService() {
    const map: any = {};
  
    this.products.forEach(product => {
      product.services.forEach((service: any) => {
        if (!map[service.serviceName]) {
          map[service.serviceName] = [];
        }
        map[service.serviceName].push(product);
      });
    });
  
    this.groupedServices = Object.keys(map).map(serviceName => ({
      serviceName,
      products: map[serviceName]
    }));
  }

  loadServices() {
    this.productService.getServices().subscribe(data => {
      this.services = data;
    });
  }

  onSubmit() {
    this.loading = true;
    const data = this.productForm.value;

    if (this.selectedProduct) {
      this.productService.updateProduct(this.selectedProduct._id, data).subscribe(() => {
        this.loadProducts();
        this.resetForm();
      });
    } else {
      this.productService.addProduct(data).subscribe(() => {
        this.loadProducts();
        this.productForm.reset();
      });
    }
  }

  editProduct(product: any) {
    this.selectedProduct = product;
    this.productForm.patchValue({
      productName: product.productName,
      brand: product.brand,
      productPrice: product.productPrice,
      perUsePrice: product.perUsePrice,
      serviceCharge: product.serviceCharge,
      services: product.services.map((s: any) => s._id)
    });
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.loading = true;
      this.productService.deleteProduct(id).subscribe(() => {
        this.loadProducts();
      });
    }
  }

  resetForm() {
    this.selectedProduct = null;
    this.productForm.reset({
      productName: '',
      brand: '',
      productPrice: 0,
      perUsePrice: 0,
      serviceCharge: 0,
      services: []
    });
  }

  getProductsForService(serviceId: string) {
    return this.products.filter(product =>
      product.services.some((s: any) => s._id === serviceId)
    );
  }
  

  downloadPdf() {
    const content = this.menuContent.nativeElement;

    html2canvas(content, { scale: 1.5, useCORS: true }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
      // Add the image to the first page
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      let heightLeft = pdfHeight;
      
      // Add additional pages if needed
      while (heightLeft > pdf.internal.pageSize.getHeight()) {
        heightLeft -= pdf.internal.pageSize.getHeight();
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -heightLeft, pdfWidth, pdfHeight);
      }
    
      pdf.save('brobarber-menu.pdf');
    });
    
  }
  
  
}
