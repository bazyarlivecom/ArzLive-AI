import { Asset } from '../types';
import { INITIAL_ASSETS, MOCK_HISTORY_LENGTH } from '../constants';

const API_URL = 'https://brsapi.ir/Api/Market/Gold_Currency.php?key=BgJFz86n2t41sbtJiY5u2kSgpf8TYnfw';

// Maintain state for history and last prices
let assetsState = [...INITIAL_ASSETS].map(asset => ({
  ...asset,
  history: Array.from({ length: MOCK_HISTORY_LENGTH }).map((_, i) => ({
    time: "00:00",
    price: asset.priceToman
  }))
}));

const parsePrice = (val: any): number => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    // Remove commas and parse
    return parseFloat(val.replace(/,/g, ''));
  }
  return 0;
};

const updateAsset = (id: string, price: number, change: number) => {
  if (!price || isNaN(price)) return;
  
  const index = assetsState.findIndex(a => a.id === id);
  if (index === -1) return;

  const asset = assetsState[index];
  
  // Update history
  const time = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  const newHistory = [...asset.history.slice(1), { time, price }];

  assetsState[index] = {
    ...asset,
    priceToman: price,
    change24h: change,
    lastUpdated: new Date().toISOString(),
    history: newHistory
  };
};

export const fetchMarketData = async (): Promise<Asset[]> => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    // Data structure check based on user provided JSON
    const goldList = Array.isArray(data.gold) ? data.gold : [];
    const currencyList = Array.isArray(data.currency) ? data.currency : [];
    const cryptoList = Array.isArray(data.cryptocurrency) ? data.cryptocurrency : [];

    // Helper to find item by symbol
    const findItem = (list: any[], symbol: string) => list.find((i: any) => i.symbol === symbol);

    // 1. Update Currency
    const usdItem = findItem(currencyList, 'USD');
    const eurItem = findItem(currencyList, 'EUR');
    const gbpItem = findItem(currencyList, 'GBP');
    const usdtItem = findItem(currencyList, 'USDT_IRT'); // Tether in Toman

    if (usdItem) updateAsset('usd', parsePrice(usdItem.price), parsePrice(usdItem.change_percent));
    if (eurItem) updateAsset('eur', parsePrice(eurItem.price), parsePrice(eurItem.change_percent));
    if (gbpItem) updateAsset('gbp', parsePrice(gbpItem.price), parsePrice(gbpItem.change_percent));

    // 2. Update Gold
    const gold18Item = findItem(goldList, 'IR_GOLD_18K');
    const coinEmamiItem = findItem(goldList, 'IR_COIN_EMAMI');

    if (gold18Item) updateAsset('gold_18', parsePrice(gold18Item.price), parsePrice(gold18Item.change_percent));
    if (coinEmamiItem) updateAsset('coin_emami', parsePrice(coinEmamiItem.price), parsePrice(coinEmamiItem.change_percent));

    // 3. Update Crypto (BTC)
    // Crypto prices are in USD (unit: "دلار"), need to convert to Toman.
    // Use USDT_IRT price if available, otherwise USD price, otherwise fallback
    const conversionRate = parsePrice(usdtItem?.price) || parsePrice(usdItem?.price) || 70000;

    const btcItem = findItem(cryptoList, 'BTC');
    if (btcItem) {
      const btcUsdPrice = parsePrice(btcItem.price);
      const btcTomanPrice = btcUsdPrice * conversionRate;
      updateAsset('btc', btcTomanPrice, parsePrice(btcItem.change_percent));
    }

  } catch (error) {
    console.error("Error fetching market data:", error);
  }

  return assetsState;
};