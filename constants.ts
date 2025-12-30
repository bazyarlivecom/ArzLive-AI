import { Asset, AssetType } from './types';

export const APP_TITLE = "ارز لایو AI";

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'usd',
    nameFa: 'دلار آمریکا',
    nameEn: 'USD',
    priceToman: 70150,
    change24h: 0.5,
    changeAmount: 350,
    shamsiDate: '1402/01/01',
    shamsiTime: '12:00',
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
    changeAmount: 150,
    shamsiDate: '1402/01/01',
    shamsiTime: '12:00',
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
    changeAmount: -90,
    shamsiDate: '1402/01/01',
    shamsiTime: '12:00',
    type: AssetType.CURRENCY,
    lastUpdated: new Date().toISOString(),
    history: []
  },
  {
    id: 'gold_18',
    nameFa: 'طلای ۱۸ عیار',
    nameEn: 'GOLD 18K',
    priceToman: 4550000, 
    change24h: 1.2,
    changeAmount: 55000,
    shamsiDate: '1402/01/01',
    shamsiTime: '12:00',
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
    changeAmount: 420000,
    shamsiDate: '1402/01/01',
    shamsiTime: '12:00',
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
    changeAmount: 165000000,
    shamsiDate: '1402/01/01',
    shamsiTime: '12:00',
    type: AssetType.CRYPTO,
    lastUpdated: new Date().toISOString(),
    history: []
  }
];

export const MOCK_HISTORY_LENGTH = 10;