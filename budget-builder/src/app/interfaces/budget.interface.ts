export interface BudgetCategory {
    id: string;
    name: string;
    type: 'income' | 'expense';
    values: number[];
    subCategories: BudgetSubCategory[];
}

export interface BudgetSubCategory {
    id: string;
    name: string;
    values: number[];
}

export interface BudgetData {
    months: string[];
    categories: BudgetCategory[];
}
