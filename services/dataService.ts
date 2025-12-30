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
  return parseFloat(val.toString().replace(/,/g, ''));
};

const updateAsset = (id: string, price: number, change: number) => {
  const index = assetsState.findIndex(a => a.id === id);
  if (index === -1) return;

  const asset = assetsState[index];
  
  // Only update history if price changed or enough time passed
  // For simplicity, we push to history on every fetch cycle
  const time = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  
  // Keep history length fixed
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
    // Fetch from multiple endpoints to ensure we cover Currency, Gold and Crypto
    const endpoints = [
        { url: `${BASE_URL}/Currency.php?key=${API_KEY}`, type: 'currency' },
        { url: `${BASE_URL}/Gold.php?key=${API_KEY}`, type: 'gold' },
        { url: `${BASE_URL}/Cryptocurrency.php?key=${API_KEY}`, type: 'crypto' }
    ];

    const responses = await Promise.allSettled(
        endpoints.map(ep => fetch(ep.url).then(r => r.json().then(data => ({ type: ep.type, data }))))
    );

    responses.forEach(res => {
        if (res.status === 'fulfilled') {
            const { type, data } = res.value;
            const items = Array.isArray(data) ? data : [];

            if (type === 'currency') {
                // Helper for heuristic conversion (Rial to Toman)
                // If USD > 200,000 it is definitely Rial (since USD is ~70k Toman)
                const checkToman = (p: number) => p > 200000 ? p / 10 : p;

                const usd = items.find((i: any) => i.slug === 'USD' || i.name === 'دلار');
                if (usd) updateAsset('usd', checkToman(parseNumber(usd.price)), parseNumber(usd.change_percent));

                const eur = items.find((i: any) => i.slug === 'EUR' || i.name === 'یورو');
                if (eur) updateAsset('eur', checkToman(parseNumber(eur.price)), parseNumber(eur.change_percent));

                const gbp = items.find((i: any) => i.slug === 'GBP' || i.name === 'پوند');
                if (gbp) updateAsset('gbp', checkToman(parseNumber(gbp.price)), parseNumber(gbp.change_percent));
            }

            if (type === 'gold') {
                // Gold 18k threshold for Rial check: > 10,000,000
                const checkTomanGold = (p: number) => p > 10000000 ? p / 10 : p;
                
                // Emami Coin threshold: > 100,000,000
                const checkTomanCoin = (p: number) => p > 100000000 ? p / 10 : p;

                const gold18 = items.find((i: any) => i.slug === 'gram18' || i.name.includes('18'));
                if (gold18) updateAsset('gold_18', checkTomanGold(parseNumber(gold18.price)), parseNumber(gold18.change_percent));

                const emami = items.find((i: any) => i.slug === 'emami' || i.name.includes('امامی'));
                if (emami) updateAsset('coin_emami', checkTomanCoin(parseNumber(emami.price)), parseNumber(emami.change_percent));
            }

            if (type === 'crypto') {
                const btc = items.find((i: any) => i.symbol === 'BTC');
                if (btc) {
                    // Try to find Toman price, fallback to USD calc
                    let price = parseNumber(btc.price_toman);
                    if (!price) {
                         // Fallback: price (USD) * ~70000
                         price = parseNumber(btc.price) * 70000; 
                    }
                    
                    // Check Rial threshold for BTC (~6 Billion Toman)
                    // If > 20 Billion, it's Rial
                    if (price > 20000000000) price /= 10;
                    
                    updateAsset('btc', price, parseNumber(btc.percent_change_24h || btc.change_percent));
                }
            }
        }
    });

  } catch (error) {
    console.warn("Error fetching from API", error);
    // On error, return current state (failsafe)
  }

  return assetsState;
};