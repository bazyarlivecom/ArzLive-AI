import React, { useState } from 'react';
import { Asset, GeminiAnalysisResponse } from '../types';
import { getMarketAnalysis } from '../services/geminiService';

interface MarketAnalysisProps {
  assets: Asset[];
}

export const MarketAnalysis: React.FC<MarketAnalysisProps> = ({ assets }) => {
  const [analysis, setAnalysis] = useState<GeminiAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMarketAnalysis(assets);
      setAnalysis(result);
    } catch (e) {
      setError("متاسفانه در برقراری ارتباط با هوش مصنوعی مشکلی پیش آمد.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 mt-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">تحلیل هوشمند بازار (Gemini AI)</h2>
        </div>
        
        {!analysis && (
          <button 
            onClick={handleAnalyze} 
            disabled={loading}
            className={`px-6 py-2 rounded-full font-medium transition-all ${loading ? 'bg-slate-700 cursor-wait text-slate-400' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'}`}
          >
            {loading ? 'در حال تحلیل...' : 'دریافت تحلیل روز'}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm mb-4">
          {error}
        </div>
      )}

      {analysis && (
        <div className="animate-fade-in space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="col-span-1 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-sm block mb-1">وضعیت کلی بازار</span>
              <div className={`text-lg font-bold flex items-center gap-2 ${
                analysis.trend === 'BULLISH' ? 'text-green-400' : 
                analysis.trend === 'BEARISH' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {analysis.trend === 'BULLISH' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                {analysis.trend === 'BEARISH' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>}
                {analysis.trend === 'NEUTRAL' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" /></svg>}
                {analysis.trend === 'BULLISH' ? 'صعودی' : analysis.trend === 'BEARISH' ? 'نزولی' : 'خنثی'}
              </div>
            </div>
            <div className="col-span-2 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-sm block mb-1">خلاصه وضعیت</span>
              <p className="text-slate-200 text-sm leading-relaxed">{analysis.summary}</p>
            </div>
          </div>
          
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
             <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                   <span className="text-indigo-300 font-bold block mb-1 text-sm">پیشنهاد هوشمند</span>
                   <p className="text-indigo-100 text-sm leading-relaxed">{analysis.advice}</p>
                </div>
             </div>
          </div>
          
          <button 
            onClick={handleAnalyze} 
            className="text-xs text-slate-500 hover:text-slate-300 underline mt-2"
          >
            بروزرسانی تحلیل
          </button>
        </div>
      )}
    </div>
  );
};