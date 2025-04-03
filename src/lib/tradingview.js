export function initTradingView(config) {
  return new Promise((resolve, reject) => {
    // Check if library is already loaded
    if (window.TradingView) {
      resolve(createWidget(config));
      return;
    }

    // Load the TradingView library dynamically
    const script = document.createElement('script');
    script.src = `${config.libraryPath}charting_library.js`;
    script.async = true;
    
    script.onload = () => {
      try {
        const widget = createWidget(config);
        resolve(widget);
      } catch (error) {
        reject(error);
      }
    };
    
    script.onerror = (err) => {
      console.error('Failed to load TradingView:', err);
      reject(new Error('Failed to load TradingView library'));
    };
    
    document.head.appendChild(script);
  });
}

function createWidget(config) {
  return new window.TradingView.widget({
    container: config.container,
    symbol: config.symbol,
    interval: config.interval,
    datafeed: config.datafeed,
    library_path: config.libraryPath,
    locale: config.locale || 'en',
    autosize: config.autosize !== false, // default true
    theme: config.theme || 'light',
    timezone: config.timezone || 'Etc/UTC',
    disabled_features: config.disabledFeatures || [
      "use_localstorage_for_settings",
      "header_widget_dom_node"
    ],
    enabled_features: config.enabledFeatures || [
      "study_templates",
      "show_symbol_logos",
      "dont_show_boolean_study_arguments",
      "hide_last_na_study_output"
    ],
    charts_storage_url: config.chartsStorageUrl,
    charts_storage_api_version: config.chartsStorageApiVersion || "1.1",
    client_id: config.clientId || 'tradingview.com',
    user_id: config.userId || 'public_user_id',
    overrides: {
      'paneProperties.background': '#ffffff',
      'paneProperties.vertGridProperties.color': '#f0f0f0',
      'paneProperties.horzGridProperties.color': '#f0f0f0',
      ...config.overrides
    },
    studies_overrides: {
      'volume.volume.color.0': '#FF0000',
      'volume.volume.color.1': '#00FF00',
      ...config.studiesOverrides
    },
    toolbar_bg: config.toolbarBg || '#f1f3f6',
    enable_publishing: config.enablePublishing || false,
    hide_top_toolbar: config.hideTopToolbar || false,
    ...config.customOptions // Any additional TradingView options
  });
}