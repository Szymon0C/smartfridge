export interface Household {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
}

export interface Profile {
  id: string;
  household_id: string;
  email: string;
  display_name: string;
}

export type ProductStatus = 'active' | 'consumed' | 'trashed';
export type ProductLocation = 'lodówka' | 'zamrażarka' | 'spiżarnia';
export type ShoppingSource = 'manual' | 'suggestion' | 'template';

export interface Product {
  id: string;
  household_id: string;
  name: string;
  barcode: string | null;
  category: string;
  image_url: string | null;
  expiry_date: string;
  opened_at: string | null;
  freshness_days: number;
  quantity: number;
  location: ProductLocation;
  added_by: string | null;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export interface ShoppingItem {
  id: string;
  household_id: string;
  name: string;
  quantity: number;
  category: string | null;
  checked: boolean;
  source: ShoppingSource;
  added_by: string | null;
  created_at: string;
}

export interface ShoppingTemplate {
  id: string;
  household_id: string;
  name: string;
  items: { name: string; quantity: number; category?: string }[];
}

export interface FreshnessRule {
  id: string;
  household_id: string | null;
  category: string;
  default_days: number;
  is_custom: boolean;
}
