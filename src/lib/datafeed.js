// src/tv/datafeed2.js
export class UDFCompatibleDatafeed {
    constructor() {
      this._apiBaseUrl = 'https://api.laganisutra.com/api/livedata/daywisedata/';
      this._subscriptions = new Map();
    }
  
    // ========== TradingView Datafeed Interface ==========
  
    onReady(callback) {
      callback({
        supports_search: true,
        supports_group_request: false,
        supports_marks: false,
        supports_timescale_marks: false,
        supported_resolutions: ['1', '5', '15', '30', '60', 'D','W','M'],
        supports_time: true
      });
      return Promise.resolve();
    }
  
    resolveSymbol(symbolName, onResolved) {
      const symbolInfo = {
        name: symbolName,
        ticker: symbolName,
        description: `${symbolName} Stock`,
        type: 'stock',
        session: '24x7',
        timezone: 'Asia/Kathmandu',
        pricescale: 100,
        minmov: 1,
        has_intraday: true,
        has_daily: true,
        supported_resolutions: ['1', '5', '15', '30', '60', 'D','W','M']
      };
      
      setTimeout(() => onResolved(symbolInfo), 0);
      return Promise.resolve(symbolInfo);
    }
  
    async getBars(symbolInfo, resolution, { from, to }, onResult, onError) {
      try {
        const apiBars = await this._fetchApiData(symbolInfo.name, resolution, from, to);
        onResult(apiBars, { noData: apiBars.length === 0 });
      } catch (error) {
        console.error('Failed to load data:', error);
        onError(error.message);
        onResult([], { noData: true });
      }
    }
  
    async _fetchApiData(symbol, resolution, from, to) {
      const response = await fetch(
        `${this._apiBaseUrl}?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}`
      );
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return this._mapApiDataToTradingViewFormat(data);
    }
  
    _mapApiDataToTradingViewFormat(apiData) {
      if (!Array.isArray(apiData)) return [];
      
      return apiData.map(item => ({
        time: this._parseTimestamp(item.timestamp || item.date),
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseInt(item.volume) || 0
      })).filter(bar => (
        !isNaN(bar.open) && 
        !isNaN(bar.time) && 
        bar.time > 0
      ));
    }
  
    _parseTimestamp(timestamp) {
      // Handle both Unix timestamps (in seconds or ms) and date strings
      if (typeof timestamp === 'string') {
        return Math.floor(Date.parse(timestamp) / 1000);
      }
      return timestamp > 1e12 ? Math.floor(timestamp / 1000) : timestamp;
    }
  
    subscribeBars(symbolInfo, resolution, onTick, listenerGuid) {
      // For real-time updates, you would typically connect to a WebSocket here
      // This example just uses the API with periodic refreshes
      const fetchAndUpdate = async () => {
        try {
          const to = Math.floor(Date.now() / 1000);
          const from = to - 60 * 60; // Last hour
          const bars = await this._fetchApiData(symbolInfo.name, resolution, from, to);
          if (bars.length > 0) {
            onTick(bars[bars.length - 1]);
          }
        } catch (error) {
          console.error('Real-time update failed:', error);
        }
      };
  
      // Initial update
      fetchAndUpdate();
      
      // Set up periodic updates
      const intervalId = setInterval(fetchAndUpdate, 5000);
      this._subscriptions.set(listenerGuid, { intervalId });
    }
  
    unsubscribeBars(listenerGuid) {
      const subscription = this._subscriptions.get(listenerGuid);
      if (subscription?.intervalId) {
        clearInterval(subscription.intervalId);
      }
      this._subscriptions.delete(listenerGuid);
    }
  }