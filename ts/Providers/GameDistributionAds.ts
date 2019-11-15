
module PhaserAds {
    export module AdProvider {
        export enum GameDistributionAdType {
            interstitial = 'interstitial',
            rewarded = 'rewarded',
            display = 'display'
        }

        export enum GameDistributionBannerSize {
            LargeRectangle,     // 336x280
            MediumRectangle,    // 300x250
            Billboard,          // 970x250
            Leaderboard,        // 728x90
            Skyscraper,         // 120x600
            WideSkyscraper      // 160x600
        }

        export class GameDistributionBanner {

            public element: HTMLElement;

            constructor() {
                this.element = document.createElement('div');
                this.element.style.position = 'absolute';
                this.element.style.visibility = 'visible';
                this.element.style.top = `0px`;
                this.element.style.left = `0px`;
                this.element.id = `banner-${Date.now()}${Math.random() * 10000000 | 0}`;
                document.body.appendChild(this.element);
            };

            public loadBanner(): void {
                return gdsdk.showAd(GameDistributionAdType.display, {
                    containerId: this.element.id
                });
            }

            public show(): void {
                this.element.style.visibility = 'visible';
            }

            public hide(): void {
                this.element.style.visibility = 'hidden';
            }

            public setSize(size: GameDistributionBannerSize): void {
                let width: number, height: number;
                switch (size) {
                    default:
                    case GameDistributionBannerSize.LargeRectangle:
                        width = 336;
                        height = 280;
                        break;
                    case GameDistributionBannerSize.MediumRectangle:
                        width = 300;
                        height = 250;
                        break;
                    case GameDistributionBannerSize.Billboard:
                        width = 970;
                        height = 250;
                        break;
                    case GameDistributionBannerSize.Leaderboard:
                        width = 728;
                        height = 90;
                        break;
                    case GameDistributionBannerSize.Skyscraper:
                        width = 120;
                        height = 600;
                        break;
                    case GameDistributionBannerSize.WideSkyscraper:
                        width = 160;
                        height = 600;
                        break;
                }
                this.element.style.width = `${width}px`;
                this.element.style.height = `${height}px`;
            }

            public position(x: number, y: number): void {
                this.element.style.left = `${x}px`;
                this.element.style.top = `${y}px`;
            }
        }

        export class GameDistributionAds implements PhaserAds.AdProvider.IProvider {
            public adManager: AdManager;

            public adsEnabled: boolean = true;

            public hasRewarded: boolean = false;

            constructor(game: Phaser.Game, gameId: string, userId: string = '') {
                this.areAdsEnabled();

                GD_OPTIONS = <IGameDistributionSettings>{
                    gameId: gameId,
                    advertisementSettings: {
                        autoplay: false
                    },
                    onEvent: (event: any): void => {
                        switch (event.name as string) {
                            case 'SDK_GAME_PAUSE':
                                // pause game logic / mute audio
                                this.adManager.onContentPaused.dispatch();
                                break;
                            default:
                                break;
                        }
                    }
                };

                //Include script. even when adblock is enabled, this script also allows us to track our users;
                (function(d: Document, s: string, id: string): void {
                    let js: HTMLScriptElement;
                    let fjs: HTMLScriptElement = <HTMLScriptElement>d.getElementsByTagName(s)[0];
                    if (d.getElementById(id)) {
                        return;
                    }
                    js = <HTMLScriptElement>d.createElement(s);
                    js.id = id;
                    js.src = '//html5.api.gamedistribution.com/main.min.js';
                    fjs.parentNode.insertBefore(js, fjs);
                }(document, 'script', 'gamedistribution-jssdk'));
            }

            public setManager(manager: PhaserAds.AdManager): void {
                this.adManager = manager;
            }

            public showAd(adType: AdType, containerId?: string): void {
                if (!this.adsEnabled) {
                    this.adManager.unMuteAfterAd();
                    this.adManager.onContentResumed.dispatch();
                    return;
                }

                if (typeof gdsdk === 'undefined' ||  (gdsdk && typeof gdsdk.showAd === 'undefined')) {
                    //So gdApi isn't available OR
                    //gdApi is available, but showBanner is not there (weird but can happen)
                    this.adsEnabled = false;
                    this.adManager.unMuteAfterAd();
                    this.adManager.onContentResumed.dispatch();
                    return;
                }

                if (adType === PhaserAds.AdType.rewarded && this.hasRewarded === false) {
                    this.adManager.unMuteAfterAd();
                    this.adManager.onContentResumed.dispatch();
                    return;
                }

                gdsdk.showAd((adType === PhaserAds.AdType.rewarded) ? GameDistributionAdType.rewarded : GameDistributionAdType.interstitial).then(() => {
                    if (adType === PhaserAds.AdType.rewarded && this.hasRewarded === true) {
                        this.adManager.onAdRewardGranted.dispatch();
                        this.hasRewarded = false;
                    }

                    this.adManager.unMuteAfterAd();
                    this.adManager.onContentResumed.dispatch();
                }).catch(() => {
                    if (adType === PhaserAds.AdType.rewarded && this.hasRewarded === true) {
                        this.hasRewarded = false;
                    }

                    this.adManager.unMuteAfterAd();
                    this.adManager.onContentResumed.dispatch();
                });
            }

            public loadBanner(size: GameDistributionBannerSize): GameDistributionBanner {
                const banner: GameDistributionBanner = new GameDistributionBanner();
                banner.setSize(size);
                banner.loadBanner();
                return banner;
            }

            //Does nothing, but needed for Provider interface
            public preloadAd(adType: PhaserAds.AdType): void {
                if (this.hasRewarded) {
                    return;
                }

                gdsdk.preloadAd(GameDistributionAdType.rewarded).then(() => {
                    this.hasRewarded = true;
                    this.adManager.onAdLoaded.dispatch(adType);
                });
            }

            //Does nothing, but needed for Provider interface
            public destroyAd(): void {
                return;
            }

            //Does nothing, but needed for Provider interface
            public hideAd(): void {
                return;
            }

            /**
             * Checks if the ads are enabled (e.g; adblock is enabled or not)
             * @returns {boolean}
             */
            private areAdsEnabled(): void {
                let test: HTMLElement = document.createElement('div');
                test.innerHTML = '&nbsp;';
                test.className = 'adsbox';
                test.style.position = 'absolute';
                test.style.fontSize = '10px';
                document.body.appendChild(test);

                // let adsEnabled: boolean;
                let isEnabled: () => boolean = () => {
                    let enabled: boolean = true;
                    if (test.offsetHeight === 0) {
                        enabled = false;
                    }
                    test.parentNode.removeChild(test);

                    return enabled;
                };

                window.setTimeout(() => {
                    this.adsEnabled = isEnabled();
                }, 100);
            }
        }
    }
}
