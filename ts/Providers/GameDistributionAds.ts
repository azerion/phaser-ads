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

        export enum GameDistributionAlignment {
            TopLeft,
            TopCenter,
            TopRight,
            CenterLeft,
            Center,
            CenterRight,
            BottomLeft,
            BottomCenter,
            BottomRight
        }

        export class GameDistributionBanner {

            public element: HTMLElement;

            private resizeListener: () => void;

            private parent: HTMLElement;

            private alignment: GameDistributionAlignment;

            private width: number;

            private height: number;

            private offsetX: number = 0;

            private offsetY: number = 0;

            constructor() {
                this.element = document.createElement('div');
                this.element.style.position = 'absolute';
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

            public destroy(): void {
                document.body.removeChild(this.element);
                this.element = null;
                this.parent = null;
                this.alignment = null;

                if (this.resizeListener) {
                    window.removeEventListener('resize', this.resizeListener);
                }
            }

            public alignIn(element: HTMLElement, position: GameDistributionAlignment): void {
                this.parent = element;
                this.alignment = position;

                this.resizeListener = () => this.resize();

                window.addEventListener('resize', this.resizeListener);

                this.resize();
            }

            public setOffset(x: number = 0, y: number = 0): void {
                this.offsetX = x;
                this.offsetY = y;

                this.resize();
            }

            private resize(): void {
                const parentBoundingRect: ClientRect = this.parent.getBoundingClientRect();

                switch (this.alignment) {
                    case GameDistributionAlignment.TopLeft:
                        this.position(
                            parentBoundingRect.left,
                            parentBoundingRect.top
                        );
                        break;
                    case GameDistributionAlignment.TopCenter:
                        this.position(
                            parentBoundingRect.left + parentBoundingRect.width / 2 - this.width / 2,
                            parentBoundingRect.top
                        );
                        break;
                    case GameDistributionAlignment.TopRight:
                        this.position(
                            parentBoundingRect.left + parentBoundingRect.width - this.width,
                            parentBoundingRect.top
                        );
                        break;
                    case GameDistributionAlignment.CenterLeft:
                        this.position(
                            parentBoundingRect.left,
                            parentBoundingRect.top + parentBoundingRect.height / 2 - this.height / 2
                        );
                        break;
                    case GameDistributionAlignment.Center:
                        this.position(
                            parentBoundingRect.left + parentBoundingRect.width / 2 - this.width / 2,
                            parentBoundingRect.top + parentBoundingRect.height / 2 - this.height / 2
                        );
                        break;
                    case GameDistributionAlignment.CenterRight:
                        this.position(
                            parentBoundingRect.left + parentBoundingRect.width - this.width,
                            parentBoundingRect.top + parentBoundingRect.height / 2 - this.height / 2
                        );
                        break;
                    case GameDistributionAlignment.BottomLeft:
                        this.position(
                            parentBoundingRect.left,
                            parentBoundingRect.top + parentBoundingRect.height - this.height
                        );
                        break;
                    case GameDistributionAlignment.BottomCenter:
                        this.position(
                            parentBoundingRect.left + parentBoundingRect.width / 2 - this.width / 2,
                            parentBoundingRect.top + parentBoundingRect.height - this.height
                        );
                        break;
                    case GameDistributionAlignment.BottomRight:
                        this.position(
                            parentBoundingRect.left + parentBoundingRect.width - this.width,
                            parentBoundingRect.top + parentBoundingRect.height - this.height
                        );
                        break;
                }
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

                this.width = width;
                this.height = height;

                this.element.style.width = `${width}px`;
                this.element.style.height = `${height}px`;
            }

            public position(x: number, y: number): void {
                this.element.style.left = `${x + this.offsetX}px`;
                this.element.style.top = `${y + this.offsetY}px`;
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
                (function (d: Document, s: string, id: string): void {
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

                if (typeof gdsdk === 'undefined' || (gdsdk && typeof gdsdk.showAd === 'undefined')) {
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
