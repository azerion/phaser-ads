module Fabrique {
    export module AdProvider {
        export enum CocoonProvider {
            AdMob,
            MoPub,
            Chartboost,
            Heyzap
        }

        export enum CocoonAdType {
            banner,
            interstitial,
            insentive
        }

        export class CocoonAds implements IProvider {
            public adManager: AdManager;

            public adsEnabled: boolean = false;

            private cocoonProvider: Cocoon.Ads.IAdProvider;

            private banner: Cocoon.Ads.IBanner = null;

            private bannerShowable: boolean = false;

            private interstitial: Cocoon.Ads.IBanner = null;

            private interstitialShowable: boolean = false;

            private insentive: Cocoon.Ads.IBanner = null;

            private insentiveShowable: boolean = false;

            constructor(game: Phaser.Game, provider: CocoonProvider, config: any) {
                if ((game.device.cordova || game.device.crosswalk) && (Cocoon && Cocoon.Ads)) {
                    this.adsEnabled = true;
                } else {
                    return;
                }

                switch (provider) {
                    default:
                    case CocoonProvider.AdMob:
                        this.cocoonProvider = Cocoon.Ads.AdMob;
                        break;
                    case CocoonProvider.Chartboost:
                        this.cocoonProvider = Cocoon.Ads.Chartboost;
                        break;
                    case CocoonProvider.Heyzap:
                        this.cocoonProvider = Cocoon.Ads.Heyzap;
                        break;
                    case CocoonProvider.MoPub:
                        this.cocoonProvider = Cocoon.Ads.MoPub;
                        break;
                }

                this.cocoonProvider.configure(config);
            }

            public setManager(manager: AdManager): void {
                this.adManager = manager;
            }

            public showAd(adType: CocoonAdType): void {
                if (!this.adsEnabled) {
                    this.adManager.onContentResumed.dispatch();
                }

                if (adType === CocoonAdType.banner) {
                    if (!this.bannerShowable && null === this.banner) {
                        //No banner ad available, skipping
                        this.adManager.onContentResumed.dispatch(CocoonAdType.banner);
                    }

                    this.banner.on('click', () => {
                        this.adManager.onAdClicked.dispatch(CocoonAdType.banner);
                    });

                    this.banner.on('show', () => {
                        this.adManager.onContentPaused.dispatch(CocoonAdType.banner);
                    });

                    this.banner.on('dismiss', () => {
                        this.adManager.onContentResumed.dispatch(CocoonAdType.banner);
                        this.bannerShowable = false;
                        this.banner = null;
                    });

                    this.banner.show();
                }

                if (adType === CocoonAdType.interstitial) {
                    if (!this.interstitialShowable && null === this.interstitial) {
                        //No banner ad available, skipping
                        this.adManager.onContentResumed.dispatch(CocoonAdType.interstitial);
                    }

                    this.interstitial.on('click', () => {
                        this.adManager.onAdClicked.dispatch(CocoonAdType.interstitial);
                    });

                    this.interstitial.on('show', () => {
                        this.adManager.onContentPaused.dispatch(CocoonAdType.interstitial);
                    });

                    this.interstitial.on('dismiss', () => {
                        this.adManager.onContentResumed.dispatch(CocoonAdType.interstitial);
                        this.interstitialShowable = false;
                        this.interstitial = null;
                    });

                    this.interstitial.show();
                }

                if (adType === CocoonAdType.insentive) {
                    if (!this.interstitialShowable && null === this.insentive) {
                        //No banner ad available, skipping
                        this.adManager.onContentResumed.dispatch(CocoonAdType.insentive);
                    }

                    this.insentive.on('click', () => {
                        this.adManager.onAdClicked.dispatch(CocoonAdType.insentive);
                    });

                    this.insentive.on('show', () => {
                        this.adManager.onContentPaused.dispatch(CocoonAdType.insentive);
                    });

                    this.insentive.on('dismiss', () => {
                        this.adManager.onContentResumed.dispatch(CocoonAdType.insentive);
                        this.interstitialShowable = false;
                        this.insentive = null;
                    });

                    this.insentive.on('reward', () => {
                        this.adManager.onAdRewardGranted.dispatch(CocoonAdType.insentive);
                        this.interstitialShowable = false;
                        this.insentive = null;
                    });

                    this.insentive.show();
                }
            }

            public preloadAd(adType: CocoonAdType, adId?: string): void {
                if (!this.adsEnabled) {
                    return;
                }

                if (adType === CocoonAdType.banner) {
                    this.banner = this.cocoonProvider.createBanner(adId);
                    this.banner.on('load', () => {
                        this.bannerShowable = true;
                    });
                    this.banner.on('fail', () => {
                        this.bannerShowable = false;
                        this.banner = null;
                    })
                }

                if (adType === CocoonAdType.interstitial) {
                    this.interstitial = this.cocoonProvider.createInterstitial(adId);
                    this.interstitial.on('load', () => {
                        this.interstitialShowable = true;
                    });
                    this.interstitial.on('fail', () => {
                        this.interstitialShowable = false;
                        this.interstitial = null;
                    });
                }

                if (adType === CocoonAdType.insentive) {
                    this.insentive = this.cocoonProvider.createRewardedVideo(adId);
                    this.interstitial = this.cocoonProvider.createInterstitial(adId);
                    this.insentive.on('load', () => {
                        this.insentiveShowable = true;
                    });
                    this.interstitial.on('fail', () => {
                        this.insentiveShowable = false;
                        this.insentive = null;
                    });
                }
            }

            public destroyAd(adType: CocoonAdType): void {
                if (!this.adsEnabled) {
                    return;
                }

                if (adType === CocoonAdType.banner) {
                    this.cocoonProvider.releaseBanner(this.banner);
                    this.banner = null;
                    this.bannerShowable = false;
                }

                if (adType === CocoonAdType.interstitial) {
                    this.cocoonProvider.releaseInterstitial(this.interstitial);
                    this.interstitial = null;
                    this.interstitialShowable = false;
                }
            }

            public hideAd(adType: CocoonAdType): void {
                if (!this.adsEnabled) {
                    return;
                }

                if (adType === CocoonAdType.banner) {
                    this.interstitial.hide();
                    this.interstitialShowable = true;
                    this.interstitial = null;

                    this.adManager.onContentResumed.dispatch(CocoonAdType.interstitial);
                }

                if (adType === CocoonAdType.interstitial) {
                    this.banner.hide();
                    this.bannerShowable = false;
                    this.banner = null;

                    this.adManager.onContentResumed.dispatch(CocoonAdType.interstitial);
                }

                if (adType === CocoonAdType.insentive) {
                    this.insentive.hide();
                    this.insentiveShowable = false;
                    this.insentive = null;

                    this.adManager.onContentResumed.dispatch(CocoonAdType.insentive);
                }
            }
        }
    }
}
