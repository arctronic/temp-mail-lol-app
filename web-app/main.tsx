import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Define the adsbygoogle global
declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

// Initialize Google AdSense
const initializeAds = () => {
  try {
    window.adsbygoogle = window.adsbygoogle || [];
    (window.adsbygoogle as any).push({
      google_ad_client: "ca-pub-1181029024567851",
      enable_page_level_ads: true
    });
    console.log("AdSense initialization successful");
  } catch (e) {
    console.error("AdSense initialization error:", e);
  }
};

// Run after the page has loaded
window.addEventListener('load', initializeAds);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
