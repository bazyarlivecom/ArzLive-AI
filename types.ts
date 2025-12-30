export enum AssetType {
  CURRENCY = 'CURRENCY',
  GOLD = 'GOLD',
  CRYPTO = 'CRYPTO'
}

export interface Asset {
  id: string;
  nameFa: string; // Persian Name
  nameEn: string; // English Code
  priceToman: number; // Base price in Toman
  change24h: number; // Percentage
  type: AssetType;
  lastUpdated: string;
  history: { time: string; price: number }[]; // For charts
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