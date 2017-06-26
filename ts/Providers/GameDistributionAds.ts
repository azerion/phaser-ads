
module PhaserAds {
    export module AdProvider {
        export enum GameDistributionAdType {
            preroll,
            midroll
        }

        export class GameDistributionAds implements PhaserAds.AdProvider.IProvider {
            public adManager: AdManager;

            public adsEnabled: boolean = true;

            private settings: IGameDistributionSettings;

            constructor(game: Phaser.Game, gameId: string, userId: string) {
                this.areAdsEnabled();

                this.settings = <IGameDistributionSettings>{
                    gameId: gameId,
                    userId: userId,
                    resumeGame: (): void => {
                        console.log('Resuming game');
                        this.adManager.unMuteAfterAd();
                        this.adManager.onContentResumed.dispatch();
                    },
                    pauseGame: (): void => {
                        console.log('Pausing game');
                        this.adManager.onContentPaused.dispatch();
                    },
                    onInit: (data: any): void => {
                        console.log('Initialised vooxe', data);
                    },
                    onError: (data: any): void => {
                        console.log('Got an Vooxe error', data);
                        this.adsEnabled = false;
                    }
                };

                (<any>window)['GameDistribution'] = 'gdApi';
                (<any>window)['gdApi'] = (<any>window)['gdApi'] || function (): void {
                        ((<any>window)['gdApi'].q = (<any>window)['gdApi'].q || []).push(arguments);
                    };
                (<any>window)['gdApi'].l = Date.now();

                //Include script. even when adblock is enabled, this script also allows us to track our users;
                (function (window: Window, document: Document, tagName: string, url: string): void {
                    let a: HTMLScriptElement = <HTMLScriptElement>document.createElement(tagName);
                    let m: HTMLScriptElement = <HTMLScriptElement>document.getElementsByTagName(tagName)[0];
                    a.async = true;
                    a.src = url;
                    m.parentNode.insertBefore(a, m);
                })(window, document, 'script', '//html5.api.gamedistribution.com/libs/gd/api.js');

                gdApi(this.settings);
            }

            public setManager(manager: PhaserAds.AdManager): void {
                this.adManager = manager;
            }

            public showAd(adType?: GameDistributionAdType): void {
                if (!this.adsEnabled) {
                    this.adManager.unMuteAfterAd();
                    this.adManager.onContentResumed.dispatch();
                } else {
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
