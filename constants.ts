import { Asset, AssetType } from './types';

export const APP_TITLE = "ارز لایو AI";

// Mock initial data - Updated to reflect closer to real market rates (Approximate)
// Prices are estimated in Toman
export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'usd',
    nameFa: 'دلار آمریکا',
    nameEn: 'USD',
    priceToman: 70150,
    change24h: 0.5,
    type: AssetType.CURRENCY,
    lastUpdated: new Date().toISOString(),
    history: []
  },
  {
    id: 'eur',
    nameFa: 'یورو',
    nameEn: 'EUR',
    priceToman: 76400,
    change24h: 0.2,
    type: AssetType.CURRENCY,
    lastUpdated: new Date().toISOString(),
    history: []
  },
  {
    id: 'gbp',
    nameFa: 'پوند انگلیس',
    nameEn: 'GBP',
    priceToman: 89200,
    change24h: -0.1,
    type: AssetType.CURRENCY,
    lastUpdated: new Date().toISOString(),
    history: []
  },
  {
    id: 'gold_18',
    nameFa: 'طلای ۱۸ عیار',
    nameEn: 'GOLD 18K',
    priceToman: 4550000, // Per gram
    change24h: 1.2,
    type: AssetType.GOLD,
    lastUpdated: new Date().toISOString(),
    history: []
  },
  {
    id: 'coin_emami',
    nameFa: 'سکه امامی',
    nameEn: 'Emami Coin',
    priceToman: 53200000,
    change24h: 0.8,
    type: AssetType.GOLD,
    lastUpdated: new Date().toISOString(),
    history: []
  },
  {
    id: 'btc',
    nameFa: 'بیت‌کوین',
    nameEn: 'BTC',
    priceToman: 6600000000,
    change24h: 2.5,
    type: AssetType.CRYPTO,
    lastUpdated: new Date().toISOString(),
    history: []
  }
];

export const MOCK_HISTORY_LENGTH = 10;