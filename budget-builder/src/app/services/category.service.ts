import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BudgetData } from '../interfaces/budget.interface';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  category$: BehaviorSubject<BudgetData> =
    new BehaviorSubject<BudgetData>({
      months: [],
      categories: [],
    });
}
