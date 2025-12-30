export enum AssetType {
  CURRENCY = 'CURRENCY',
  GOLD = 'GOLD',
  CRYPTO = 'CRYPTO'
}

export interface HistoryPoint {
  timestamp: number;
  price: number;
}

export interface Asset {
  id: string;
  nameFa: string; // Persian Name
  nameEn: string; // English Code
  priceToman: number; // Base price in Toman
  change24h: number; // Percentage
  changeAmount: number; // Value change in Toman
  shamsiDate: string; // e.g., 1404/10/09
  shamsiTime: string; // e.g., 14:22
  type: AssetType;
  lastUpdated: string;
  history: HistoryPoint[];
}

export interface MarketState {
  assets: Asset[];
  currencyMode: 'TOMAN' | 'RIAL';
  isLoading: boolean;
}

export interface GeminiAnalysisResponse {
  summary: string;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  advice: string;
}

export type Timeframe = '1D' | '1W' | '1M';

export type SortOption = 'DEFAULT' | 'PRICE_ASC' | 'PRICE_DESC' | 'CHANGE_ASC' | 'CHANGE_DESC';