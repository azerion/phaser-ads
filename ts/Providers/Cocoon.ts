module PhaserAds {
    export module AdProvider {
        export enum CocoonProvider {
            AdMob,
            MoPub,
            Chartboost,
            Heyzap
        }

        export class CocoonAds implements IProvider {
            public adManager: AdManager;

            public adsEnabled: boolean = false;

            private cocoonProvider: Cocoon.Ad.IAdProvider;

            private banner: Cocoon.Ad.IBanner = null;

            private bannerShowable: boolean = false;

            private interstitial: Cocoon.Ad.IBanner = null;

            private interstitialShowable: boolean = false;

            private rewarded: Cocoon.Ad.IBanner = null;

            public hasRewarded: boolean = false;

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

            public showAd(adType: AdType): void {
                if (!this.adsEnabled) {
                    this.adManager.unMuteAfterAd();
                    if (!(adType === AdType.banner)) {
                        this.adManager.onContentResumed.dispatch();
                    }
                    return;
                }

                if (adType === AdType.banner) {
                    if (!this.bannerShowable || null === this.banner) {
                        this.adManager.unMuteAfterAd();
                        //No banner ad available, skipping
                        //this.adManager.onContentResumed.dispatch(CocoonAdType.banner);
                        return;
                    }
                    this.adManager.onBannerShown.dispatch(this.banner.width, this.banner.height);
                    this.adManager.bannerActive = true;
                    this.banner.show();
                }

                if (adType === AdType.interstitial) {
                    if (!this.interstitialShowable || null === this.interstitial) {
                        this.adManager.unMuteAfterAd();
                        //No banner ad available, skipping
                        this.adManager.onContentResumed.dispatch(AdType.interstitial);
                        return;
                    }

                    this.interstitial.show();
                }

                if (adType === AdType.rewarded) {
                    if (!this.hasRewarded || null === this.rewarded) {
                        this.adManager.unMuteAfterAd();
                        //No banner ad available, skipping
                        this.adManager.onContentResumed.dispatch(AdType.rewarded);
                        return;
                    }

                    this.rewarded.show();
                }
            }

            public preloadAd(adType: AdType, adId?: string, bannerPosition?: string): void {
                if (!this.adsEnabled) {
                    return;
                }

                //Some cleanup before preloading a new ad
                this.destroyAd(adType);

                if (adType === AdType.banner) {
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
                        this.adManager.onAdClicked.dispatch(AdType.banner);
                    });

                    //Banner don't pause or resume content
                    this.banner.on('show', () => {
                        /*this.adManager.onBannerShown.dispatch(this.banner.width, this.banner.height);
                        this.adManager.bannerActive = true;*/
                        // this.adManager.onContentPaused.dispatch(AdType.banner);
                    });

                    this.banner.on('dismiss', () => {
                        /*this.adManager.bannerActive = false;
                        this.adManager.onBannerHidden.dispatch(this.banner.width, this.banner.height);*/
                        // this.adManager.onContentResumed.dispatch(AdType.banner);
                        // this.bannerShowable = false;
                        // this.banner = null;
                    });
                    this.banner.load();
                }

                if (adType === AdType.interstitial) {
                    this.interstitial = this.cocoonProvider.createInterstitial(adId);
                    this.interstitial.on('load', () => {
                        this.interstitialShowable = true;
                    });
                    this.interstitial.on('fail', () => {
                        this.interstitialShowable = false;
                        this.interstitial = null;
                    });
                    this.interstitial.on('click', () => {
                        this.adManager.onAdClicked.dispatch(AdType.interstitial);
                    });

                    this.interstitial.on('show', () => {
                        this.adManager.onContentPaused.dispatch(AdType.interstitial);
                    });

                    this.interstitial.on('dismiss', () => {
                        this.adManager.unMuteAfterAd();
                        this.adManager.onContentResumed.dispatch(AdType.interstitial);
                        this.interstitialShowable = false;
                        this.interstitial = null;
                    });
                    this.interstitial.load();
                }

                if (adType === AdType.rewarded) {
                    this.rewarded = this.cocoonProvider.createRewardedVideo(adId);
                    this.rewarded.on('load', () => {
                        this.hasRewarded = true;
                    });
                    this.rewarded.on('fail', () => {
                        this.hasRewarded = false;
                        this.rewarded = null;
                    });
                    this.rewarded.on('click', () => {
                        this.adManager.onAdClicked.dispatch(AdType.rewarded);
                    });

                    this.rewarded.on('show', () => {
                        this.adManager.onContentPaused.dispatch(AdType.rewarded);
                    });

                    this.rewarded.on('dismiss', () => {
                        this.adManager.unMuteAfterAd();
                        this.adManager.onContentResumed.dispatch(AdType.rewarded);
                        this.hasRewarded = false;
                        this.rewarded = null;
                    });

                    this.rewarded.on('reward', () => {
                        this.adManager.unMuteAfterAd();
                        this.adManager.onAdRewardGranted.dispatch(AdType.rewarded);
                        this.hasRewarded = false;
                        this.rewarded = null;
                    });
                    this.rewarded.load();
                }
            }

            public destroyAd(adType: AdType): void {
                if (!this.adsEnabled) {
                    return;
                }

                if (adType === AdType.banner && null !== this.banner) {
                    //Releasing banners will fail on cocoon due to:
                    // https://github.com/ludei/atomic-plugins-ads/pull/12
                    try {
                        this.cocoonProvider.releaseBanner(this.banner);
                    } catch (e) {
                        //silently ignore
                    }
                    this.banner = null;
                    this.bannerShowable = false;
                }

                if (adType === AdType.interstitial && null !== this.interstitial) {
                    this.cocoonProvider.releaseInterstitial(this.interstitial);
                    this.interstitial = null;
                    this.interstitialShowable = false;
                }
            }

            public hideAd(adType: AdType): void {
                if (!this.adsEnabled) {
                    return;
                }

                if (adType === AdType.interstitial && null !== this.interstitial) {
                    this.interstitial.hide();

                    // this.adManager.onContentResumed.dispatch(AdType.interstitial);
                }

                if (adType === AdType.banner && null !== this.banner) {
                    if (this.adManager.bannerActive) {
                        this.adManager.bannerActive = false;
                        this.adManager.onBannerHidden.dispatch(this.banner.width, this.banner.height);
                    }
                    this.banner.hide();

                    // this.adManager.onContentResumed.dispatch(AdType.banner);
                }

                if (adType === AdType.rewarded && null !== this.rewarded) {
                    this.rewarded.hide();

                    // this.adManager.onContentResumed.dispatch(AdType.rewarded);
                }
            }

            /*public setLayout(bannerPosition: string): void {
                this.banner.setLayout(bannerPosition);
            }

            public setPosition(x: number, y: number): void {
                this.banner.setPosition(x, y);
            }*/
        }
    }
}
