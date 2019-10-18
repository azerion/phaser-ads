
module PhaserAds {
    export module AdProvider {
        export enum GameDistributionAdType {
            interstitial = 'interstitial',
            rewarded = 'rewarded'
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

            public showAd(adType: AdType): void {
                if (!this.adsEnabled) {
                    this.adManager.unMuteAfterAd();
                    this.adManager.onContentResumed.dispatch();
                } else {
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
