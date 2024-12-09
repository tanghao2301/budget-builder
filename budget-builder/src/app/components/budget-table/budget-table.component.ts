import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  BudgetCategory,
  BudgetData,
  BudgetSubCategory,
} from '../../interfaces/budget.interface';
import { FormsModule } from '@angular/forms';
import {
  Row,
  RowMainCategory,
  RowSubCategory,
} from '../../interfaces/table.interface';
import { CATEGORY } from '../../constants/category';
import { CategoryService } from '../../services/category.service';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-budget-table',
  imports: [FormsModule, CommonModule],
  templateUrl: './budget-table.component.html',
  styleUrl: './budget-table.component.css',
})
export class BudgetTableComponent implements OnInit, OnChanges {
  @Input() budgetData!: BudgetData;
  @ViewChild('table', { static: false }) table!: ElementRef;

  incomeTotals: number[] = [];
  expenseTotals: number[] = [];
  profitLoss: number[] = [];
  rows: RowMainCategory[] = [];
  incomeRows: Row[] = [];
  expenseRows: Row[] = [];
  openingBalances: number[] = [0];
  closingBalances: number[] = [];
  isOpenDeletePopup: boolean = false;

  // Context Menu State
  contextMenuVisible = false;
  contextMenuPosition = { x: 0, y: 0 };
  selectedsubCategoryID!: string;
  selectedrowCategoryID!: string;
  selectedrowCategoryType!: string;
  selectedCellValue: number | null = null;
  isSubCategorySelectAll!: boolean;

  constructor(private categoryService: CategoryService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['budgetData'].currentValue) {
      this.calculateRows();
    }
  }

  ngOnInit(): void {
    this.calculateRows();
  }

  ngAfterViewInit(): void {
    const tableElement = this.table.nativeElement;
    tableElement.scrollTop = 0;

    const firstCell = tableElement.querySelector('input');
    if (firstCell) {
      firstCell.focus();
    }
  }

  handleKeydown(event: KeyboardEvent, rowIndex: number, colIndex: number) {
    let maxRows = 0;
    this.rows.forEach((row: RowMainCategory) => {
      maxRows += row.categories.length || 0;
      row.categories.forEach((category: Row) => {
        maxRows += category.subCategories?.length || 0;
      });
    });
    const maxCols = this.budgetData.months.length;
    switch (event.key) {
      case 'ArrowUp':
        this.focusCell(rowIndex - 1, colIndex, maxRows, maxCols);
        break;
      case 'ArrowDown':
        this.focusCell(rowIndex + 1, colIndex, maxRows, maxCols);
        break;
      case 'ArrowLeft':
        this.focusCell(rowIndex, colIndex - 1, maxRows, maxCols);
        break;
      case 'ArrowRight':
      case 'Tab':
        event.preventDefault();
        this.focusCell(rowIndex, colIndex + 1, maxRows, maxCols);
        break;
      case 'Enter':
        this.focusCell(rowIndex + 1, colIndex, maxRows, maxCols);
        break;
    }
  }

  focusCell(row: number, col: number, maxRows: number, maxCols: number) {
    if (row >= 0 && row < maxRows && col >= 0 && col < maxCols) {
      const cellId = `cell-${row}-${col}`;
      const cellElement = document.getElementById(cellId);
      cellElement?.focus();
    }
  }

  calculateRows() {
    this.rows = [];
    this.incomeRows = [];
    this.expenseRows = [];
    this.calculateRow(CATEGORY.Income, this.incomeRows);
    this.calculateRow(CATEGORY.Expense, this.expenseRows);
  }

  calculateRow(
    categoryType: 'income' | 'expense' = 'income',
    globalRows: Row[]
  ) {
    const categoryArray = this.budgetData.categories.filter(
      (categories: BudgetCategory) =>
        categories.type.toLowerCase() === categoryType
    );
    categoryArray.forEach((item: BudgetCategory) => {
      const subCategories = item.subCategories.map(
        (subCategory: BudgetSubCategory) => ({
          id: subCategory.id,
          category: subCategory.name,
          cells: [...subCategory.values],
        })
      );
      globalRows.push({
        id: item.id,
        category: item.name,
        cells: item.values,
        categoryType,
        subCategories: [...subCategories],
        isMainCategory: true,
      });
    });
    this.rows.push({
      mainCategory: (categoryType.charAt(0).toUpperCase() +
        categoryType.slice(1)) as 'income' | 'expense',
      categories: [...globalRows],
    });
  }

  findCategory(rowCategory: Row): BudgetCategory {
    return (
      this.budgetData.categories.find(
        (category: BudgetCategory) => category.id === rowCategory.id
      ) || ({} as BudgetCategory)
    );
  }

  findSubCategory(
    rowCategory: Row,
    subCategory: RowSubCategory
  ): BudgetSubCategory {
    const updateRow = this.findCategory(rowCategory);
    return (
      updateRow?.subCategories.find(
        (subCate: BudgetSubCategory) => subCate.id === subCategory.id
      ) || ({} as BudgetSubCategory)
    );
  }

  createSubCategory(rowCategoryID: string) {
    const category = this.budgetData.categories.find(
      (category: BudgetCategory) => category.id === rowCategoryID
    );
    if (!category) return;
    category.subCategories.push({
      id: uuidv4(),
      name: '',
      values: new Array(this.budgetData.months.length).fill(0),
    });
    this.categoryService.category$.next(this.budgetData);
  }

  updateCell(
    event: Event,
    colIndex: number,
    rowCategory: Row,
    subCategory?: RowSubCategory
  ) {
    let updateRow: BudgetCategory | BudgetSubCategory = subCategory
      ? this.findSubCategory(rowCategory, subCategory)
      : this.findCategory(rowCategory);
    if (!updateRow) return;
    updateRow.values[colIndex] = +(event.target as HTMLInputElement).value;
    this.categoryService.category$.next(this.budgetData);
  }

  updateCategoryRow(rowCategory: Row, event: Event) {
    const updateRow = this.findCategory(rowCategory);
    if (!updateRow) return;
    updateRow.name = (event.target as HTMLInputElement).value;
    this.categoryService.category$.next(this.budgetData);
  }

  updateSubCategoryRow(
    rowCategory: Row,
    subCategory: RowSubCategory,
    event: Event
  ) {
    const updateRowCategory = this.findSubCategory(rowCategory, subCategory);
    if (!updateRowCategory) return;
    updateRowCategory.name = (event.target as HTMLInputElement).value;
    this.categoryService.category$.next(this.budgetData);
  }

  handleKeydownCreateCategory(row: RowMainCategory, event: Event) {
    this.budgetData.categories.push({
      id: uuidv4(),
      name: (event?.target as HTMLInputElement)?.value || '',
      type: row.mainCategory,
      values: new Array(this.budgetData.months.length).fill(0),
      subCategories: [],
    });
    this.categoryService.category$.next(this.budgetData);
  }

  calculateSubTotals(rowCategory: Row): number[] {
    const subtotals = Array(this.budgetData.months.length).fill(0);

    rowCategory.subCategories?.forEach((subCategory: RowSubCategory) => {
      subCategory.cells.forEach((value, index) => {
        subtotals[index] += value;
      });
    });
    rowCategory.cells.forEach((value, index) => {
      subtotals[index] += value;
    });
    return subtotals;
  }

  calculateTotal(mainCategory: string): number[] {
    const totals = Array(this.budgetData.months.length).fill(0);
    const row = this.rows.find(
      (row: RowMainCategory) => row.mainCategory === mainCategory
    );
    row?.categories.forEach((category: Row) => {
      const subTotals = this.calculateSubTotals(category);
      subTotals.forEach((value, index) => {
        totals[index] += value;
      });
    });

    return totals;
  }

  calculateProfitLoss(): number[] {
    const incomeTotal = this.calculateTotal('Income');
    const expenseTotal = this.calculateTotal('Expense');

    return incomeTotal.map((income, index) => income - expenseTotal[index]);
  }

  calculateClosingBalance(): void {
    const profitLoss = this.calculateProfitLoss();

    this.openingBalances = [];
    this.closingBalances = [];

    let currentBalance = 0;

    this.budgetData.months.forEach((_, index) => {
      this.openingBalances[index] = currentBalance;

      const closingBalance = currentBalance + profitLoss[index];
      this.closingBalances[index] = closingBalance;

      currentBalance = closingBalance;
    });
  }

  showContextMenu(
    event: MouseEvent,
    rowCategory: Row,
    subCategory?: RowSubCategory,
    isSubCategorySelectAll?: boolean
  ): void {
    event.preventDefault();
    this.contextMenuPosition = { x: event.clientX, y: event.clientY };
    this.contextMenuVisible = true;
    this.isSubCategorySelectAll = !!isSubCategorySelectAll;
    this.selectedrowCategoryID = rowCategory.id;
    this.selectedsubCategoryID = subCategory?.id || '';
    this.selectedrowCategoryType = rowCategory.categoryType || '';
    this.selectedCellValue = +(event.target as HTMLInputElement).value;
  }

  applyToAll(): void {
    if (
      this.selectedrowCategoryID !== null &&
      this.selectedCellValue !== null
    ) {
      const category =
        this.budgetData.categories.find(
          (category: BudgetCategory) =>
            category.id === this.selectedrowCategoryID
        ) || ({} as BudgetCategory);
      if (this.isSubCategorySelectAll) {
        const subCategory =
          category?.subCategories.find(
            (subCate: BudgetSubCategory) =>
              subCate.id === this.selectedsubCategoryID
          ) || ({} as BudgetSubCategory);
        subCategory.values.fill(this.selectedCellValue);
      } else {
        category.values.fill(this.selectedCellValue);
      }
      this.categoryService.category$.next(this.budgetData);
    }

    this.contextMenuVisible = false; // Hide the context menu
  }

  @HostListener('document:click', ['$event'])
  closeContextMenu(): void {
    this.contextMenuVisible = false;
  }

  removeCategory(rowCategory: Row, subCategory?: RowSubCategory) {
    if (!!subCategory) {
      const category = this.budgetData.categories.find(
        (category: BudgetCategory) => category.id === rowCategory.id
      );
      if (!category) return;
      category.subCategories = category?.subCategories.filter(
        (subCategory: BudgetSubCategory) => subCategory.id !== subCategory.id
      );
    } else {
      this.budgetData.categories = this.budgetData.categories.filter(
        (category: BudgetCategory) => category.id !== rowCategory.id
      );
    }
    this.categoryService.category$.next(this.budgetData);
  }
}
