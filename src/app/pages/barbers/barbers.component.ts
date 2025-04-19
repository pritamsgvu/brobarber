import { Component, OnInit } from '@angular/core';
import { BarberService } from '../../services/barber.service';

@Component({
  selector: 'app-barbers',
  templateUrl: './barbers.component.html',
  styleUrls: ['./barbers.component.css']
})
export class BarbersComponent implements OnInit {
  barbers: any[] = [];

  constructor(private barberService: BarberService) {}

  ngOnInit(): void {
    this.barberService.getBarbers().subscribe((data: any) => {
      this.barbers = data;
    });
  }
}
