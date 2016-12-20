module PhaserAds {
    export module AdProvider {
        export enum HeyzapAdTypes {
            Interstitial,
            Video,
            Rewarded,
            Banner
        }

        export class CordovaHeyzap implements IProvider {
            public adManager: AdManager;

            public adsEnabled: boolean = false;

            constructor(game: Phaser.Game, publisherId: string) {
                if (game.device.cordova || game.device.crosswalk) {
                    this.adsEnabled = true;
                } else {
                    return;
                }

                HeyzapAds.start(publisherId).then(() => {
                    // Native call successful.
                }, (error: any) => {
                    //Failed to start heyzap, disabling ads
                    this.adsEnabled = false;
                });
            }

            public setManager(manager: AdManager): void {
                this.adManager = manager;
            }

            public showAd(adType: HeyzapAdTypes, bannerAdPositions?: string): void {
                if (!this.adsEnabled) {
                    this.adManager.onContentResumed.dispatch();
                }

                switch (adType) {
                    case HeyzapAdTypes.Interstitial:
                        //Register event listeners
                        HeyzapAds.InterstitialAd.addEventListener(HeyzapAds.InterstitialAd.Events.HIDE, () => {
                            this.adManager.onContentResumed.dispatch(HeyzapAds.InterstitialAd.Events.HIDE);
                        });
                        HeyzapAds.InterstitialAd.addEventListener(HeyzapAds.InterstitialAd.Events.SHOW_FAILED, () => {
                            this.adManager.onContentResumed.dispatch(HeyzapAds.InterstitialAd.Events.SHOW_FAILED);
                        });
                        HeyzapAds.InterstitialAd.addEventListener(HeyzapAds.InterstitialAd.Events.CLICKED, () => {
                            this.adManager.onAdClicked.dispatch(HeyzapAds.InterstitialAd.Events.CLICKED);
                        });

                        HeyzapAds.InterstitialAd.show().then(() => {
                            // Native call successful.
                            this.adManager.onContentPaused.dispatch();
                        }, (error: any) => {
                            //Failed to show insentive ad, continue operations
                            this.adManager.onContentResumed.dispatch();
                        });
                        break;
                    case HeyzapAdTypes.Video:
                        HeyzapAds.VideoAd.addEventListener(HeyzapAds.VideoAd.Events.HIDE, () => {
                            this.adManager.onContentResumed.dispatch(HeyzapAds.VideoAd.Events.HIDE);
                        });
                        HeyzapAds.VideoAd.addEventListener(HeyzapAds.VideoAd.Events.SHOW_FAILED, () => {
                            this.adManager.onContentResumed.dispatch(HeyzapAds.VideoAd.Events.SHOW_FAILED);
                        });
                        HeyzapAds.VideoAd.addEventListener(HeyzapAds.VideoAd.Events.CLICKED, () => {
                            this.adManager.onAdClicked.dispatch(HeyzapAds.VideoAd.Events.CLICKED);
                        });

                        HeyzapAds.VideoAd.show().then(() => {
                            // Native call successful.
                            this.adManager.onContentPaused.dispatch();
                        }, (error: any) => {
                            //Failed to show insentive ad, continue operations
                            this.adManager.onContentResumed.dispatch();
                        });
                        break;
                    case HeyzapAdTypes.Rewarded:
                        HeyzapAds.IncentivizedAd.addEventListener(HeyzapAds.IncentivizedAd.Events.HIDE, () => {
                            this.adManager.onContentResumed.dispatch(HeyzapAds.IncentivizedAd.Events.HIDE);
                        });
                        HeyzapAds.IncentivizedAd.addEventListener(HeyzapAds.IncentivizedAd.Events.SHOW_FAILED, () => {
                            this.adManager.onContentResumed.dispatch(HeyzapAds.IncentivizedAd.Events.SHOW_FAILED);
                        });
                        HeyzapAds.IncentivizedAd.addEventListener(HeyzapAds.IncentivizedAd.Events.CLICKED, () => {
                            this.adManager.onAdClicked.dispatch(HeyzapAds.IncentivizedAd.Events.CLICKED);
                        });

                        HeyzapAds.IncentivizedAd.show().then(() => {
                            // Native call successful.
                            this.adManager.onContentPaused.dispatch();
                        }, (error: any) => {
                            //Failed to show insentive ad, continue operations
                            this.adManager.onContentResumed.dispatch();
                        });
                        break;
                    case HeyzapAdTypes.Banner:
                        HeyzapAds.BannerAd.show(bannerAdPositions).then(() => {
                            // Native call successful.
                        }, (error: any) => {
                            // Handle Error
                        });
                        break;
                }
            }

            public preloadAd(adType: HeyzapAdTypes): void {
                if (!this.adsEnabled) {
                    return;
                }

                if (adType === HeyzapAdTypes.Rewarded) {
                    HeyzapAds.IncentivizedAd.fetch().then(() => {
                        // Native call successful.
                    }, (error: any) => {
                        // Handle Error
                    });
                }

                return;
            }

            public destroyAd(adType: HeyzapAdTypes): void {
                if (!this.adsEnabled) {
                    return;
                }

                if (adType === HeyzapAdTypes.Banner) {
                    HeyzapAds.BannerAd.destroy().then(() => {
                        // Native call successful.
                    }, (error: any) => {
                        // Handle Error
                    });
                }

                return;
            }

            public hideAd(adType: HeyzapAdTypes): void {
                if (!this.adsEnabled) {
                    return;
                }

                if (adType === HeyzapAdTypes.Banner) {
                    HeyzapAds.BannerAd.hide().then(() => {
                        // Native call successful.
                    }, (error: any) => {
                        // Handle Error
                    });
                }

                return;
            }
        }
    }
}
