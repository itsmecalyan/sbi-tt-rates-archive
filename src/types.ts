export interface RateRow {
  date: string; // YYYY-MM-DD
  tt_buying: number | null;
  tt_selling: number | null;
  bill_buying: number | null;
  bill_selling: number | null;
  card_buying: number | null;
  card_selling: number | null;
  cn_buying: number | null;
  cn_selling: number | null;
  publication_only: boolean;
  source_file: string;
}

export interface MetadataRow {
  date: string;
  source_file: string;
  currencies_found: number;
  status: string;
  parse_warnings: string;
  processed_at: string;
}

export interface CurrencyPairInfo {
  code: string; // e.g. "USD-INR"
  baseCurrency: string; // e.g. "USD"
  quoteCurrency: string; // e.g. "INR"
  label: string; // e.g. "US Dollar (USD-INR)"
  flag: string; // e.g. "🇺🇸"
}

export type RateField =
  | 'tt_buying'
  | 'tt_selling'
  | 'bill_buying'
  | 'bill_selling'
  | 'card_buying'
  | 'card_selling'
  | 'cn_buying'
  | 'cn_selling';

export interface FilterState {
  currency: string;
  startDate: string;
  endDate: string;
  selectedFields: RateField[];
}

export interface CurrencyStats {
  latestRate: number | null;
  prevRate: number | null;
  percentageChange: number | null;
  highest: number | null;
  lowest: number | null;
  average: number | null;
}
