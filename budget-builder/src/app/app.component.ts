import { Component, OnDestroy, OnInit } from '@angular/core';
import { BudgetData } from './interfaces/budget.interface';
import { DateSelectorComponent } from './components/date-selector/date-selector.component';
import { BudgetTableComponent } from './components/budget-table/budget-table.component';
import { CategoryService } from './services/category.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [DateSelectorComponent, BudgetTableComponent],
})
export class AppComponent implements OnInit, OnDestroy {
  budgetData!: BudgetData;
  subscription$!: Subscription;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.subscription$ = this.categoryService.category$
      .subscribe((category: BudgetData) => {
        this.budgetData = JSON.parse(JSON.stringify(category));
      });
  }

  updateMonths(months: string[]) {
    this.budgetData.months = months;

    for (const category of this.budgetData.categories) {
      category.values = new Array(months.length).fill(0);
    }
  }

  ngOnDestroy(): void {
    this.subscription$.unsubscribe();
  }
}
