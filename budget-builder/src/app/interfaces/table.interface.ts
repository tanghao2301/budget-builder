export interface RowMainCategory {
  mainCategory: 'income' | 'expense';
  categories: Row[];
}

export interface Row {
  id: string;
  category: string;
  cells: number[];
  categoryType: 'income' | 'expense';
  subCategories?: RowSubCategory[];
  isMainCategory?: boolean;
  isCategoryTitle?: boolean;
}

export interface RowSubCategory {
  id: string;
  category: string;
  cells: number[];
}