import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-selector',
  imports: [FormsModule],
  templateUrl: './date-selector.component.html',
  styleUrl: './date-selector.component.css',
})
export class DateSelectorComponent implements OnInit {
  @Output() dateRangeChanged = new EventEmitter<string[]>();

  startMonth: string = '2024-01';
  endMonth: string = '2024-12';

  ngOnInit(): void {
    this.calculateDateRange();
  }

  calculateDateRange() {
    const start = new Date(this.startMonth);
    const end = new Date(this.endMonth);
    const months: string[] = [];

    while (start <= end) {
      months.push(
        start.toLocaleString('default', { month: 'long', year: 'numeric' })
      );
      start.setMonth(start.getMonth() + 1);
    }

    this.dateRangeChanged.emit(months);
  }
}
