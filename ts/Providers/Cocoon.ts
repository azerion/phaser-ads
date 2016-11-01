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

            private cocoonProvider: Cocoon.Ad.IAdProvider;

            private banner: Cocoon.Ad.IBanner = null;

            private bannerShowable: boolean = false;

            private interstitial: Cocoon.Ad.IBanner = null;

            private interstitialShowable: boolean = false;

            private insentive: Cocoon.Ad.IBanner = null;

            private insentiveShowable: boolean = false;

            constructor(game: Phaser.Game, provider: CocoonProvider, config?: any) {
                if ((game.device.cordova || game.device.crosswalk) && (Cocoon && Cocoon.Ad)) {
                    this.adsEnabled = true;
                } else {
                    return;
                }

                switch (provider) {
                    default:
                    case CocoonProvider.AdMob:
                        this.cocoonProvider = Cocoon.Ad.AdMob;
                        break;
                    case CocoonProvider.Chartboost:
                        this.cocoonProvider = Cocoon.Ad.Chartboost;
                        break;
                    case CocoonProvider.Heyzap:
                        this.cocoonProvider = Cocoon.Ad.Heyzap;
                        break;
                    case CocoonProvider.MoPub:
                        this.cocoonProvider = Cocoon.Ad.MoPub;
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
                    return;
                }

                if (adType === CocoonAdType.banner) {
                    if (!this.bannerShowable || null === this.banner) {
                        //No banner ad available, skipping
                        this.adManager.onContentResumed.dispatch(CocoonAdType.banner);
                        return;
                    }

                    this.banner.show();
                }

                if (adType === CocoonAdType.interstitial) {
                    if (!this.interstitialShowable || null === this.interstitial) {
                        //No banner ad available, skipping
                        this.adManager.onContentResumed.dispatch(CocoonAdType.interstitial);
                        return;
                    }

                    this.interstitial.show();
                }

                if (adType === CocoonAdType.insentive) {
                    if (!this.interstitialShowable || null === this.insentive) {
                        //No banner ad available, skipping
                        this.adManager.onContentResumed.dispatch(CocoonAdType.insentive);
                        return;
                    }

                    this.insentive.show();
                }
            }

            public preloadAd(adType: CocoonAdType, adId?: string, bannerPosition?: string): void {
                if (!this.adsEnabled) {
                    return;
                }

                //Some cleanup before preloading a new ad
                this.destroyAd(adType);

                if (adType === CocoonAdType.banner) {
                    this.banner = this.cocoonProvider.createBanner(adId);
                    if (bannerPosition) {
                        this.banner.setLayout(bannerPosition);
                    }
                    this.banner.on('load', () => {
                        this.bannerShowable = true;
                    });
                    this.banner.on('fail', () => {
                        this.bannerShowable = false;
                        this.banner = null;
                    });
                    this.banner.on('click', () => {
                        this.adManager.onAdClicked.dispatch(CocoonAdType.banner);
                    });

                    //Banner don't pause or resume content
                    this.banner.on('show', () => {
                        // this.adManager.onContentPaused.dispatch(CocoonAdType.banner);
                    });

                    this.banner.on('dismiss', () => {
                        // this.adManager.onContentResumed.dispatch(CocoonAdType.banner);
                        this.bannerShowable = false;
                        this.banner = null;
                    });
                    this.banner.load();
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
                    this.interstitial.load();
                }

                if (adType === CocoonAdType.insentive) {
                    this.insentive = this.cocoonProvider.createRewardedVideo(adId);
                    this.insentive.on('load', () => {
                        this.insentiveShowable = true;
                    });
                    this.interstitial.on('fail', () => {
                        this.insentiveShowable = false;
                        this.insentive = null;
                    });
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
                    this.insentive.load();
                }
            }

            public destroyAd(adType: CocoonAdType): void {
                if (!this.adsEnabled) {
                    return;
                }

                if (adType === CocoonAdType.banner && null !== this.banner) {
                    this.cocoonProvider.releaseBanner(this.banner);
                    this.banner = null;
                    this.bannerShowable = false;
                }

                if (adType === CocoonAdType.interstitial && null !== this.interstitial) {
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
