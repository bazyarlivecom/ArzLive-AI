import { Asset, HistoryPoint } from '../types';
import { INITIAL_ASSETS } from '../constants';

const API_URL = 'https://brsapi.ir/Api/Market/Gold_Currency.php?key=BgJFz86n2t41sbtJiY5u2kSgpf8TYnfw';
const STORAGE_KEY = 'arzlive_history_v1';

const loadOrGenerateHistory = (assetId: string, currentPrice: number): HistoryPoint[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed[assetId] && parsed[assetId].length > 0) {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        return parsed[assetId].filter((p: HistoryPoint) => p.timestamp > thirtyDaysAgo);
      }
    }
  } catch (e) {
    console.warn("Failed to load history", e);
  }

  const history: HistoryPoint[] = [];
  const now = Date.now();
  const points = 100;
  const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
  
  for (let i = 0; i < points; i++) {
    const time = now - (oneMonthMs * (points - i) / points);
    const randomFactor = 0.95 + Math.random() * 0.1; 
    history.push({
      timestamp: time,
      price: Math.round(currentPrice * randomFactor)
    });
  }
  history.push({ timestamp: now, price: currentPrice });
  
  return history;
};

let assetsState = INITIAL_ASSETS.map(asset => ({
  ...asset,
  history: loadOrGenerateHistory(asset.id, asset.priceToman)
}));

const parsePrice = (val: any): number => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    return parseFloat(val.replace(/,/g, ''));
  }
  return 0;
};

const saveHistoryToStorage = () => {
  const historyMap: Record<string, HistoryPoint[]> = {};
  assetsState.forEach(asset => {
    const safeHistory = asset.history.slice(-500); 
    historyMap[asset.id] = safeHistory;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(historyMap));
};

// Updated to accept partial asset data object for cleaner updates
const updateAsset = (id: string, data: { price: number; changePercent: number; changeValue: number; date?: string; time?: string }) => {
  if (!data.price || isNaN(data.price)) return;
  
  const index = assetsState.findIndex(a => a.id === id);
  if (index === -1) return;

  const asset = assetsState[index];
  const now = Date.now();

  const newPoint: HistoryPoint = { timestamp: now, price: data.price };
  const lastPoint = asset.history[asset.history.length - 1];
  const shouldAdd = !lastPoint || (now - lastPoint.timestamp > 60000) || (lastPoint.price !== data.price);

  let newHistory = asset.history;
  if (shouldAdd) {
    newHistory = [...asset.history, newPoint];
  }

  assetsState[index] = {
    ...asset,
    priceToman: data.price,
    change24h: data.changePercent,
    changeAmount: data.changeValue,
    shamsiDate: data.date || asset.shamsiDate,
    shamsiTime: data.time || asset.shamsiTime,
    lastUpdated: new Date().toISOString(),
    history: newHistory
  };
};

export const fetchMarketData = async (): Promise<{ assets: Asset[], error: string | null }> => {
  let error: string | null = null;
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }
    const data = await response.json();

    const goldList = Array.isArray(data.gold) ? data.gold : [];
    const currencyList = Array.isArray(data.currency) ? data.currency : [];
    const cryptoList = Array.isArray(data.cryptocurrency) ? data.cryptocurrency : [];

    const findItem = (list: any[], symbol: string) => list.find((i: any) => i.symbol === symbol);

    // Helper to process raw item
    const processItem = (item: any) => ({
        price: parsePrice(item.price),
        changePercent: parsePrice(item.change_percent),
        changeValue: parsePrice(item.change_value),
        date: item.date,
        time: item.time
    });

    // 1. Update Currency
    const usdItem = findItem(currencyList, 'USD');
    const eurItem = findItem(currencyList, 'EUR');
    const gbpItem = findItem(currencyList, 'GBP');
    const usdtItem = findItem(currencyList, 'USDT_IRT');

    if (usdItem) updateAsset('usd', processItem(usdItem));
    if (eurItem) updateAsset('eur', processItem(eurItem));
    if (gbpItem) updateAsset('gbp', processItem(gbpItem));

    // 2. Update Gold
    const gold18Item = findItem(goldList, 'IR_GOLD_18K');
    const coinEmamiItem = findItem(goldList, 'IR_COIN_EMAMI');

    if (gold18Item) updateAsset('gold_18', processItem(gold18Item));
    if (coinEmamiItem) updateAsset('coin_emami', processItem(coinEmamiItem));

    // 3. Update Crypto (BTC)
    const conversionRate = parsePrice(usdtItem?.price) || parsePrice(usdItem?.price) || 70000;
    const btcItem = findItem(cryptoList, 'BTC');
    if (btcItem) {
      const btcUsdPrice = parsePrice(btcItem.price);
      const btcTomanPrice = btcUsdPrice * conversionRate;
      // Calculate approximate Toman change value based on percent since API gives USD change
      const btcChangePercent = parsePrice(btcItem.change_percent);
      const btcChangeValueToman = (btcTomanPrice * btcChangePercent) / 100;

      updateAsset('btc', {
          price: btcTomanPrice,
          changePercent: btcChangePercent,
          changeValue: btcChangeValueToman,
          date: btcItem.date,
          time: btcItem.time
      });
    }

    saveHistoryToStorage();

  } catch (err) {
    console.error("Error fetching market data:", err);
    error = "مشکل در بروزرسانی اطلاعات. لطفا اتصال اینترنت را بررسی کنید.";
  }

  return { assets: assetsState, error };
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};