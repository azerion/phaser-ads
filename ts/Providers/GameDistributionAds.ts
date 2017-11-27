
module PhaserAds {
    export module AdProvider {
        export enum GameDistributionAdType {
            preroll,
            midroll
        }

        export class GameDistributionAds implements PhaserAds.AdProvider.IProvider {
            public adManager: AdManager;

            public adsEnabled: boolean = true;

            constructor(game: Phaser.Game, gameId: string, userId: string) {
                this.areAdsEnabled();

                GD_OPTIONS = <IGameDistributionSettings>{
                    gameId: gameId,
                    userId: userId,
                    advertisementSettings: {
                        debug: false,
                        prefix: 'gdApi-',
                        autoplay: false,
                        responsive: true,
                        width: 640,
                        height: 300,
                        locale: 'en'
                    },
                    onEvent: (event: any): void => {
                        console.log('event.name = ', event.name);
                        switch (event.name) {
                            case 'SDK_GAME_START':
                                if (typeof gdApi !== 'undefined') {
                                    gdApi.play();
                                }
                                this.adManager.unMuteAfterAd();
                                this.adManager.onContentResumed.dispatch();
                                break;
                            case 'SDK_GAME_PAUSE':
                                this.adManager.onContentPaused.dispatch();
                                break;
                            case 'SDK_READY':
                                //add something here
                                 break;
                            case 'SDK_ERROR':
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

            public showAd(adType?: GameDistributionAdType): void {
                console.log('show ad');
                if (!this.adsEnabled) {
                    this.adManager.unMuteAfterAd();
                    this.adManager.onContentResumed.dispatch();
                } else {
                    if (gdApi && typeof gdApi.showBanner === 'undefined') {
                        //So gdApi is available, but showBanner is not there (weird but can happen)
                        this.adsEnabled = false;

                        this.adManager.unMuteAfterAd();
                        this.adManager.onContentResumed.dispatch();

                        return;
                    }
                    gdApi.showBanner();
                }
            }

            //Does nothing, but needed for Provider interface
            public preloadAd(): void {
                return;
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
