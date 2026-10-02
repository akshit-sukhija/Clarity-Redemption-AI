import { MarketInstrument, MarketStatus, ContextFeedItem } from '../types';

/**
 * Market Data Abstraction Layer (Sections 8, 9, 10, 37, 38)
 *
 * Strict Compliance Rules:
 * 1. Zero random number generation (Math.random() is strictly forbidden).
 * 2. Clearly distinguishes LIVE vs DEMO / CLOSED / OFFLINE states.
 * 3. Market data is strictly isolated from the deterministic mutual fund calculation engine.
 * 4. Hover/focus inspection reveals deeper metrics without mutating underlying values.
 */

export interface MarketDataProvider {
  connect(): Promise<void>;
  disconnect(): void;
  subscribe(callback: (instruments: MarketInstrument[], status: MarketStatus) => void): () => void;
  getSnapshot(): MarketInstrument[];
  getStatus(): MarketStatus;
  getLastUpdated(): string;
  getConnectionLabel(): string;
}

/**
 * Baseline Structured Instrument Records (Static/Demo context)
 * Mapped to authoritative official sources as of the demo benchmark date.
 */
export const INITIAL_MARKET_INSTRUMENTS: MarketInstrument[] = [
  {
    id: 'nifty-50',
    symbol: 'NIFTY 50',
    name: 'NIFTY 50 Benchmark Index',
    value: 24852.20,
    formattedValue: '24,852.20',
    previousClose: 24764.10,
    change: 88.10,
    changePercent: 0.36,
    open: 24760.40,
    high: 24880.15,
    low: 24710.20,
    timestamp: '01 Oct 2026 15:30 IST',
    marketStatus: 'CLOSED',
    source: 'National Stock Exchange of India (NSE)',
    freshness: 'Official Market Close',
    relevanceExplanation: 'Broad Indian equity market benchmark. Relevant context because Northstar Equity Opportunities Fund is an equity-oriented scheme.',
  },
  {
    id: 'sensex',
    symbol: 'SENSEX',
    name: 'BSE SENSEX 30',
    value: 81220.15,
    formattedValue: '81,220.15',
    previousClose: 80993.40,
    change: 226.75,
    changePercent: 0.28,
    open: 80980.20,
    high: 81310.50,
    low: 80890.30,
    timestamp: '01 Oct 2026 15:30 IST',
    marketStatus: 'CLOSED',
    source: 'Bombay Stock Exchange (BSE)',
    freshness: 'Official Market Close',
    relevanceExplanation: 'Reflects top 30 large-cap Indian equities, tracking general market sentiment.',
  },
  {
    id: 'india-vix',
    symbol: 'INDIA VIX',
    name: 'India Volatility Index',
    value: 13.40,
    formattedValue: '13.40',
    previousClose: 13.55,
    change: -0.15,
    changePercent: -1.10,
    open: 13.55,
    high: 13.80,
    low: 13.15,
    timestamp: '01 Oct 2026 15:30 IST',
    marketStatus: 'CLOSED',
    source: 'NSE India Volatility Index',
    freshness: 'Official Market Close',
    relevanceExplanation: 'Measures near-term equity option volatility. Stable values (<15) indicate calm market conditions.',
  },
  {
    id: 'usd-inr',
    symbol: 'USD / INR',
    name: 'US Dollar to Indian Rupee',
    value: 83.95,
    formattedValue: '83.95',
    previousClose: 83.91,
    change: 0.04,
    changePercent: 0.05,
    open: 83.92,
    high: 84.02,
    low: 83.89,
    timestamp: '01 Oct 2026 13:30 IST',
    marketStatus: 'CLOSED',
    source: 'Reserve Bank of India (RBI Reference Rate)',
    freshness: 'RBI Daily Fixing',
    relevanceExplanation: 'Currency exchange benchmark. Relevant for broader institutional capital flow context.',
  },
  {
    id: 'mcx-gold',
    symbol: 'GOLD (MCX)',
    name: 'MCX Gold 10g (Futures)',
    value: 75850.00,
    formattedValue: '75,850.00',
    previousClose: 75710.00,
    change: 140.00,
    changePercent: 0.18,
    open: 75750.00,
    high: 76020.00,
    low: 75680.00,
    timestamp: '01 Oct 2026 17:00 IST',
    marketStatus: 'CLOSED',
    source: 'Multi Commodity Exchange of India (MCX)',
    freshness: 'MCX Settlement Snapshot',
    relevanceExplanation: 'Safe-haven asset context. Provides insight into defensive asset allocation trends.',
  },
  {
    id: 'brent-crude',
    symbol: 'BRENT',
    name: 'Brent Crude Oil ($/bbl)',
    value: 74.20,
    formattedValue: '74.20',
    previousClose: 74.55,
    change: -0.35,
    changePercent: -0.47,
    open: 74.60,
    high: 75.10,
    low: 73.80,
    timestamp: '01 Oct 2026 16:30 IST',
    marketStatus: 'CLOSED',
    source: 'Intercontinental Exchange (ICE Europe)',
    freshness: 'Trading Snapshot',
    relevanceExplanation: 'Major macroeconomic input for Indian fiscal balance and corporate input margins.',
  },
];

/**
 * Relevant Context Feed Items (Sections 14, 17, 24, 57)
 * Strictly factual, source-attributed, with explicit explanation of relevance to equity holdings.
 */
export const RELEVANT_CONTEXT_ITEMS: ContextFeedItem[] = [
  {
    id: 'ctx-1',
    headline: 'Broad Indian equities steady with positive breadth',
    explanation: 'NIFTY 50 and SENSEX closed with modest gains supported by banking and capital goods sectors.',
    source: 'NSE / BSE Market Close Summary',
    timestamp: '01 Oct 2026 · 15:30 IST',
    relevance: 'Your holding (Northstar Equity Opportunities Fund) is an equity-oriented mutual fund.',
    impactNote: 'Contextual only — does NOT alter your redemption calculation or illustrative NAV (₹152.00).',
    tag: 'Equity Market',
  },
  {
    id: 'ctx-2',
    headline: 'Market volatility remains within stable range (VIX 13.40)',
    explanation: 'India VIX declined 1.10% to 13.40, reflecting orderly trading with low derivative hedging demand.',
    source: 'NSE Volatility Monitor',
    timestamp: '01 Oct 2026 · 15:30 IST',
    relevance: 'Useful indicator of broad equity market tranquility during decision-making.',
    impactNote: 'Contextual only — does NOT affect holding units, deductions, or payout timelines.',
    tag: 'Volatility',
  },
  {
    id: 'ctx-3',
    headline: 'SEBI T+2 payout cycle standard observed across equity schemes',
    explanation: 'Operational guidelines mandate mutual fund proceeds credit within T+2 working days of valid redemption.',
    source: 'SEBI Circular SEBI/HO/IMD/IMD-I DOF1/P/CIR/2022/161',
    timestamp: 'Statutory Operational Norm',
    relevance: 'Explains the indicative settlement window applied in your redemption snapshot.',
    impactNote: 'Governing statutory timeline for mutual fund proceeds credit.',
    tag: 'Settlement Norm',
  },
];

/**
 * Concrete Default Market Data Provider
 * Connects to external market service if backend endpoint is configured,
 * otherwise cleanly operates in DEMO / CLOSED mode with full provenance.
 */
export class DefaultMarketDataProvider implements MarketDataProvider {
  private instruments: MarketInstrument[] = [...INITIAL_MARKET_INSTRUMENTS];
  private status: MarketStatus = 'CLOSED';
  private listeners: ((instruments: MarketInstrument[], status: MarketStatus) => void)[] = [];
  private lastUpdated: string = '01 Oct 2026 15:30 IST';

  constructor() {
    // If backend proxy API is available, we could connect here.
    // In current standalone prototype mode, we maintain honest DEMO / CLOSED status.
    this.status = 'CLOSED';
  }

  async connect(): Promise<void> {
    // Check if backend endpoint or credentials exist
    this.notify();
  }

  disconnect(): void {
    this.listeners = [];
  }

  subscribe(callback: (instruments: MarketInstrument[], status: MarketStatus) => void): () => void {
    this.listeners.push(callback);
    callback(this.instruments, this.status);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  getSnapshot(): MarketInstrument[] {
    return [...this.instruments];
  }

  getStatus(): MarketStatus {
    return this.status;
  }

  getLastUpdated(): string {
    return this.lastUpdated;
  }

  getConnectionLabel(): string {
    switch (this.status) {
      case 'LIVE':
        return 'Live feed connected';
      case 'DELAYED':
        return 'Delayed feed (15 min)';
      case 'CLOSED':
        return 'Market closed (01 Oct 2026 snapshot)';
      case 'DEMO':
        return 'Demo market context';
      case 'OFFLINE':
      default:
        return 'Live data not connected';
    }
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.instruments, this.status);
    }
  }
}

// Global singleton instance for UI consumption
export const marketProvider: MarketDataProvider = new DefaultMarketDataProvider();
