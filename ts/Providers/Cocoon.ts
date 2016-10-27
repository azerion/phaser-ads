module Fabrique {
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

            private cocoonProvider: Cocoon.Ads.IAdProvider;

            constructor(game: Phaser.Game, provider: CocoonProvider ,config: any) {
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

            public requestAd(...args: any[]): void {
            }

            public preloadAd(...args: any[]): void {
            }

            public destroyAd(...args: any[]): void {
            }

            public hideAd(...args: any[]): void {
            }
            public showAd(...args: any[]): void {
            }
        }
    }
}