import { Asset } from '../types';
import { INITIAL_ASSETS, MOCK_HISTORY_LENGTH } from '../constants';

const API_KEY = 'BgJFz86n2t41sbtJiY5u2kSgpf8TYnfw';
const BASE_URL = 'https://brsapi.ir/Api/Market';

// Maintain state for history and last prices
let assetsState = [...INITIAL_ASSETS].map(asset => ({
  ...asset,
  history: Array.from({ length: MOCK_HISTORY_LENGTH }).map((_, i) => ({
    time: "00:00",
    price: asset.priceToman
  }))
}));

const parseNumber = (val: any): number => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  // Remove commas and convert to float
  return parseFloat(val.toString().replace(/,/g, ''));
};

const updateAsset = (id: string, price: number, change: number) => {
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
    // The user requested to use Gold_Currency.php which consolidates gold and currency data
    // We still keep Cryptocurrency.php separate as per standard API structure
    const endpoints = [
        { url: `${BASE_URL}/Gold_Currency.php?key=${API_KEY}`, type: 'combined' },
        { url: `${BASE_URL}/Cryptocurrency.php?key=${API_KEY}`, type: 'crypto' }
    ];

    const responses = await Promise.allSettled(
        endpoints.map(ep => fetch(ep.url).then(r => r.json().then(data => ({ type: ep.type, data }))))
    );

    responses.forEach(res => {
        if (res.status === 'fulfilled') {
            const { type, data } = res.value;
            // The API usually returns an array, but sometimes wrapped. Ensure we have an array.
            const items = Array.isArray(data) ? data : (data.data || []);

            if (type === 'combined') {
                // Logic to identify assets based on 'slug', 'name' or 'id'
                // Common slugs in this API: 'usd', 'eur', 'gbp', 'gram18', 'emami', 'bahar'

                // Helper to detect if price is in Rial (high value) and convert to Toman
                // USD ~ 70,000 Toman (700,000 Rial). If > 200,000, it's Rial.
                const cleanCurrency = (p: any) => {
                    let num = parseNumber(p);
                    return num > 200000 ? num / 10 : num;
                };

                // Gold 18k ~ 4.5m Toman (45m Rial). Threshold > 10m
                const cleanGold = (p: any) => {
                    let num = parseNumber(p);
                    return num > 10000000 ? num / 10 : num;
                };

                // Coin ~ 53m Toman (530m Rial). Threshold > 100m
                const cleanCoin = (p: any) => {
                    let num = parseNumber(p);
                    return num > 100000000 ? num / 10 : num;
                };

                items.forEach((item: any) => {
                    const slug = (item.slug || '').toLowerCase();
                    const name = (item.name || '').toLowerCase();
                    const price = item.price;
                    const change = parseNumber(item.percent_change_24h || item.change_percent);

                    // USD
                    if (slug === 'usd' || slug === 'price_dollar_rl' || name.includes('دلار')) {
                        updateAsset('usd', cleanCurrency(price), change);
                    }
                    // EUR
                    else if (slug === 'eur' || slug === 'price_eur' || name.includes('یورو')) {
                        updateAsset('eur', cleanCurrency(price), change);
                    }
                    // GBP
                    else if (slug === 'gbp' || name.includes('پوند')) {
                        updateAsset('gbp', cleanCurrency(price), change);
                    }
                    // Gold 18k
                    else if (slug === 'gram18' || slug === 'geram18' || name.includes('18 عیار') || name.includes('۱۸ عیار')) {
                        updateAsset('gold_18', cleanGold(price), change);
                    }
                    // Emami Coin
                    else if (slug === 'emami' || slug === 'sekee' || name.includes('امامی') || name.includes('سکه امامی')) {
                        updateAsset('coin_emami', cleanCoin(price), change);
                    }
                });
            }

            if (type === 'crypto') {
                const btc = items.find((i: any) => i.symbol === 'BTC' || i.slug === 'bitcoin');
                if (btc) {
                    let price = parseNumber(btc.price_toman);
                    // Fallback if Toman price is missing
                    if (!price) {
                         const usdPrice = parseNumber(btc.price);
                         // Use a fallback exchange rate or just raw logic if USD price is present
                         // Assuming roughly 70k rate if fetching failed
                         const currentUsd = assetsState.find(a => a.id === 'usd')?.priceToman || 70000;
                         price = usdPrice * currentUsd;
                    }
                    
                    // Rial sanity check for BTC
                    if (price > 20000000000) price /= 10;
                    
                    updateAsset('btc', price, parseNumber(btc.percent_change_24h || btc.change_percent));
                }
            }
        }
    });

  } catch (error) {
    console.warn("Error fetching from API", error);
  }

  return assetsState;
};