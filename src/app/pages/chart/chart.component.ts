import { Component, OnInit } from '@angular/core';
import { ExpenseService } from '../../services/expense.service';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import html2pdf from 'html2pdf.js';

Chart.register(ChartDataLabels);

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {
  chartRef!: Chart;
  selectedYear!: number;
  availableYears: number[] = [];

  constructor(private expenseService: ExpenseService) {}

  ngOnInit() {
    this.getMonthlyExpenses(); // fetch default (latest year) data
  }

  getMonthlyExpenses(year?: number) {
    this.expenseService.getMonthlyEarningsWithYears(year).subscribe({
      next: (data) => {
        this.availableYears = data.availableYears;
        this.selectedYear = year || this.availableYears[0];
        this.createMonthlyEarningsChart(data.report);
      },
      error: (err) => {
        console.error('Failed to fetch expenses:', err);
      }
    });
  }

  onYearChange() {
    this.getMonthlyExpenses(this.selectedYear);
  }

  createMonthlyEarningsChart(monthlyData: any[]) {
    const labels = monthlyData.map(item => {
      const date = new Date(item.year, item.month - 1);
      return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    });

    const totalEarnings = monthlyData.map(item => item.totalEarnings);
    const totalExpenses = monthlyData.map(item => item.totalExpenses);
    const netProfit = monthlyData.map(item => item.netProfit);

    if (this.chartRef) {
      this.chartRef.destroy();
    }

    const ctx = document.getElementById('monthlyEarningsChart') as HTMLCanvasElement;

    this.chartRef = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Earnings',
            data: totalEarnings,
            backgroundColor: '#4BC0C0'
          },
          {
            label: 'Expenses',
            data: totalExpenses,
            backgroundColor: '#FF6384'
          },
          {
            label: 'Net Profit',
            data: netProfit,
            backgroundColor: '#90EE90'
          }
        ]
      },
      options: {
        responsive: true,
        aspectRatio: 2,
        layout: {
          padding: { top: 20 }
        },
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: `Monthly Earnings vs Expenses - ${this.selectedYear}`
          },
          datalabels: {
            display: true,
            anchor: 'end',
            align: 'top',
            offset: -4,
            color: '#000',
            font: {
              weight: 'bold',
              size: 12
            },
            formatter: (value: number) => `₹${value.toLocaleString('en-IN')}`
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  }

  downloadChartImage() {
    const canvas = document.getElementById('monthlyEarningsChart') as HTMLCanvasElement;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `monthly-earnings-${this.selectedYear}.png`;
    link.click();
  }

  downloadChartPDF() {
    const canvas = document.getElementById('monthlyEarningsChart') as HTMLCanvasElement;
    const image = canvas.toDataURL('image/png');
    html2pdf()
      .from(`<div><h3>Monthly Earnings - ${this.selectedYear}</h3><img src="${image}" style="width:100%"/></div>`)
      .set({
        margin: 10,
        filename: `monthly-earnings-${this.selectedYear}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      })
      .save();
  }
}
