import {IProvider} from './IProvider';
import PhaserAds from '../index';

export default class CordovaGameDistribution implements IProvider {
    public adManager: PhaserAds;

    public adsEnabled: boolean = false;

    constructor(game: Phaser.Game, gameId: string, userId: string, debug: boolean = false) {
        if (cordova.plugins === undefined ||
            (cordova.plugins !== undefined && cordova.plugins.gdApi === undefined)
        ) {
            console.log('gdApi not available!');
            return;
        }

        if (debug) {
            cordova.plugins.gdApi.enableTestAds();
        }

        this.setAdListeners();
        (<CordovaPluginGdApi>cordova.plugins.gdApi).init([
            gameId,
            userId
        ], (data: any) => {
            console.log('API init success!', data);
        }, (error: any) => {
            console.log('API init error!', error);
        });
    }

    private setAdListeners(): void {
        (<CordovaPluginGdApi>cordova.plugins.gdApi).setAdListener((data: any) => {
            console.log('banner reply, data.event', data.event, data);
            switch (data.event) {
                case 'BANNER_STARTED':
                    this.adManager.emit(PhaserAds.CONTENT_PAUSED);
                    break;
                case 'API_IS_READY':
                    //Send post init
                    this.adsEnabled = true;
                    break;
                case 'API_ALREADY_INITIALIZED':
                    break;
                case 'BANNER_CLOSED':
                case 'API_NOT_READY':
                case 'BANNER_FAILED':
                    this.adManager.emit(PhaserAds.CONTENT_RESUMED);
                    break;
            }
        }, (error: any) => {
            console.log('Set listener error:', error);
            this.adsEnabled = false;
        });
    }

    public setManager(manager: PhaserAds): void {
        this.adManager = manager;
    }

    public showAd(): void {
        if (this.adsEnabled) {
            console.log('show banner called');
            (<CordovaPluginGdApi>cordova.plugins.gdApi).showBanner((data: any) => {
                console.log('Show banner worked', data);
            }, (data: any) => {
                console.log('Could not show banner:', data);
                this.adManager.emit(PhaserAds.CONTENT_RESUMED);
            });
        } else {
            console.log('Ads not enabled, resuming');
            this.adManager.emit(PhaserAds.CONTENT_RESUMED);
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
}
