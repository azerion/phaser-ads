import {IProvider} from './IProvider';
import PhaserAds from '../index';

export default class GameDistributionAds implements IProvider {
    public adManager: PhaserAds;

    public adsEnabled: boolean = true;

    constructor(game: Phaser.Game, gameId: string, userId: string) {
        this.areAdsEnabled();

        (<any>window).GD_OPTIONS = <IGameDistributionSettings>{
            gameId: gameId,
            userId: userId,
            advertisementSettings: {
                autoplay: false
            },
            onEvent: (event: any): void => {
                switch (event.name) {
                    case 'SDK_GAME_START':
                        if (typeof gdApi !== 'undefined') {
                            gdApi.play();
                        }
                        this.adManager.unMuteAfterAd();
                        this.adManager.emit(PhaserAds.CONTENT_RESUMED);
                        break;
                    case 'SDK_GAME_PAUSE':
                        this.adManager.emit(PhaserAds.CONTENT_PAUSED);
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

    public setManager(manager: PhaserAds): void {
        this.adManager = manager;
    }

    public showAd(): void {
        if (!this.adsEnabled) {
            this.adManager.unMuteAfterAd();
            this.adManager.emit(PhaserAds.CONTENT_RESUMED);
        } else {
            if (typeof gdApi === 'undefined' || (gdApi && typeof gdApi.showBanner === 'undefined')) {
                //So gdApi isn't available OR
                //gdApi is available, but showBanner is not there (weird but can happen)
                this.adsEnabled = false;

                this.adManager.unMuteAfterAd();
                this.adManager.emit(PhaserAds.CONTENT_RESUMED);

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
