import {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  AppOpenAd,
} from 'react-native-google-mobile-ads';
import {Platform} from 'react-native';
import {AdConfig, AppError, ErrorCodes} from '../types';

class AdMobService {
  private config: AdConfig;
  private interstitialAd: InterstitialAd | null = null;
  private rewardedAd: RewardedAd | null = null;
  private appOpenAd: AppOpenAd | null = null;
  private interstitialLoaded = false;
  private rewardedLoaded = false;
  private appOpenLoaded = false;
  private lastInterstitialShow = 0;
  private lastAppOpenShow = 0;
  private interstitialCooldown = 60000; // 1 minute cooldown
  private appOpenCooldown = 240000; // 4 minute cooldown for app open ads

  constructor() {
    // Always use production IDs (real ads in both dev and production)
    this.config = {
      bannerId: this.getProductionBannerId(),
      interstitialId: this.getProductionInterstitialId(),
      rewardedId: this.getProductionRewardedId(),
      appOpenId: this.getProductionAppOpenId(),
      testMode: false, // Always use real ads
    };

    this.initializeAds();
  }

  private getProductionBannerId(): string {
    return Platform.select({
      ios: 'ca-app-pub-1181029024567851/2683270943', // Use Android ID for iOS too (or replace when iOS is published)
      android: 'ca-app-pub-1181029024567851/2683270943', // Android Banner Ad ID
    }) || 'ca-app-pub-1181029024567851/2683270943';
  }

  private getProductionInterstitialId(): string {
    return Platform.select({
      ios: 'ca-app-pub-1181029024567851/1370189278', // Use Android ID for iOS too (or replace when iOS is published)
      android: 'ca-app-pub-1181029024567851/1370189278', // Android Interstitial Ad ID
    }) || 'ca-app-pub-1181029024567851/1370189278';
  }

  private getProductionRewardedId(): string {
    return Platform.select({
      ios: 'ca-app-pub-1181029024567851/3649137759', // Use Android ID for iOS too (or replace when iOS is published)
      android: 'ca-app-pub-1181029024567851/3649137759', // Android Rewarded Ad ID
    }) || 'ca-app-pub-1181029024567851/3649137759';
  }

  private getProductionAppOpenId(): string {
    return Platform.select({
      ios: 'ca-app-pub-1181029024567851/3452015995', // Use Android ID for iOS too (or replace when iOS is published)
      android: 'ca-app-pub-1181029024567851/3452015995', // Android App Open Ad ID
    }) || 'ca-app-pub-1181029024567851/3452015995';
  }

  private async initializeAds() {
    try {
      await this.loadInterstitialAd();
      await this.loadRewardedAd();
      await this.loadAppOpenAd();
    } catch (error) {
      // Silent initialization - ads will retry automatically
    }
  }

  // Load interstitial ad
  private async loadInterstitialAd() {
    try {
      this.interstitialAd = InterstitialAd.createForAdRequest(this.config.interstitialId, {
        requestNonPersonalizedAdsOnly: false,
      });

      this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
        this.interstitialLoaded = true;
      });

      this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
        this.interstitialLoaded = false;
        // Retry loading after 30 seconds
        setTimeout(() => this.loadInterstitialAd(), 30000);
      });

      this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        this.interstitialLoaded = false;
        this.lastInterstitialShow = Date.now();
        // Load next ad
        setTimeout(() => this.loadInterstitialAd(), 1000);
      });

      await this.interstitialAd.load();
    } catch (error) {
      this.interstitialLoaded = false;
    }
  }

  // Load rewarded ad
  private async loadRewardedAd() {
    try {
      this.rewardedAd = RewardedAd.createForAdRequest(this.config.rewardedId!, {
        requestNonPersonalizedAdsOnly: false,
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
        this.rewardedLoaded = true;
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.ERROR, (error) => {
        this.rewardedLoaded = false;
        // Retry loading after 30 seconds
        setTimeout(() => this.loadRewardedAd(), 30000);
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
        // Handle reward logic here if needed
      });

      this.rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
        this.rewardedLoaded = false;
        // Load next ad
        setTimeout(() => this.loadRewardedAd(), 1000);
      });

      await this.rewardedAd.load();
    } catch (error) {
      this.rewardedLoaded = false;
    }
  }

  // Load app open ad
  private async loadAppOpenAd() {
    try {
      this.appOpenAd = AppOpenAd.createForAdRequest(this.config.appOpenId!, {
        requestNonPersonalizedAdsOnly: false,
      });

      this.appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
        this.appOpenLoaded = true;
      });

      this.appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => {
        this.appOpenLoaded = false;
        // Retry loading after 60 seconds
        setTimeout(() => this.loadAppOpenAd(), 60000);
      });

      this.appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
        this.appOpenLoaded = false;
        this.lastAppOpenShow = Date.now();
        // Load next ad
        setTimeout(() => this.loadAppOpenAd(), 1000);
      });

      await this.appOpenAd.load();
    } catch (error) {
      this.appOpenLoaded = false;
    }
  }

  // Show interstitial ad with cooldown
  async showInterstitialAd(force = false): Promise<boolean> {
    try {
      const now = Date.now();
      const timeSinceLastShow = now - this.lastInterstitialShow;

      // Check cooldown unless forced
      if (!force && timeSinceLastShow < this.interstitialCooldown) {
        return false;
      }

      if (!this.interstitialLoaded || !this.interstitialAd) {
        return false;
      }

      await this.interstitialAd.show();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Show rewarded ad
  async showRewardedAd(): Promise<boolean> {
    try {
      if (!this.rewardedLoaded || !this.rewardedAd) {
        return false;
      }

      await this.rewardedAd.show();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Check if interstitial ad is ready
  isInterstitialReady(): boolean {
    return this.interstitialLoaded && this.interstitialAd !== null;
  }

  // Check if rewarded ad is ready
  isRewardedReady(): boolean {
    return this.rewardedLoaded && this.rewardedAd !== null;
  }

  // Show app open ad with cooldown
  async showAppOpenAd(force = false): Promise<boolean> {
    try {
      const now = Date.now();
      const timeSinceLastShow = now - this.lastAppOpenShow;

      // Check cooldown unless forced
      if (!force && timeSinceLastShow < this.appOpenCooldown) {
        return false;
      }

      if (!this.appOpenLoaded || !this.appOpenAd) {
        return false;
      }

      await this.appOpenAd.show();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Check if app open ad is ready
  isAppOpenReady(): boolean {
    return this.appOpenLoaded && this.appOpenAd !== null;
  }

  // Get banner ad component props
  getBannerAdProps() {
    return {
      unitId: this.config.bannerId,
      size: BannerAdSize.ADAPTIVE_BANNER,
      requestOptions: {
        requestNonPersonalizedAdsOnly: false,
      },
    };
  }

  // Strategic ad showing based on user actions
  async showAdOnAction(action: 'email_generated' | 'email_opened' | 'app_opened' | 'settings_opened') {
    const adProbability = this.getAdProbabilityForAction(action);
    const shouldShow = Math.random() < adProbability;

    if (shouldShow) {
      await this.showInterstitialAd();
    }
  }

  private getAdProbabilityForAction(action: string): number {
    // Define probability of showing ads for different actions
    switch (action) {
      case 'email_generated':
        return 0.3; // 30% chance when generating new email
      case 'email_opened':
        return 0.2; // 20% chance when opening email
      case 'app_opened':
        return 0.1; // 10% chance when opening app
      case 'settings_opened':
        return 0.05; // 5% chance when opening settings
      default:
        return 0.1;
    }
  }

  // Update ad configuration
  updateConfig(newConfig: Partial<AdConfig>) {
    this.config = {...this.config, ...newConfig};
  }

  // Get current configuration
  getConfig(): AdConfig {
    return {...this.config};
  }

  // Preload ads
  async preloadAds() {
    if (!this.interstitialLoaded) {
      await this.loadInterstitialAd();
    }
    if (!this.rewardedLoaded) {
      await this.loadRewardedAd();
    }
    if (!this.appOpenLoaded) {
      await this.loadAppOpenAd();
    }
  }

  // Clean up ads
  cleanup() {
    if (this.interstitialAd) {
      this.interstitialAd = null;
      this.interstitialLoaded = false;
    }
    if (this.rewardedAd) {
      this.rewardedAd = null;
      this.rewardedLoaded = false;
    }
    if (this.appOpenAd) {
      this.appOpenAd = null;
      this.appOpenLoaded = false;
    }
  }
}

export default new AdMobService();

