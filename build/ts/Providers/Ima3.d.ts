import { IProvider } from './IProvider';
import { default as PhaserAds } from '../index';
export interface ICustomParams {
    [name: string]: string | number | any[];
}
export default class Ima3 implements IProvider {
    private gameContent;
    private adContent;
    private adDisplay;
    private adLoader;
    private adsManager;
    private googleEnabled;
    adsEnabled: boolean;
    private adTagUrl;
    private game;
    private adRequested;
    adManager: PhaserAds;
    private resizeListener;
    constructor(game: Phaser.Game, adTagUrl: string);
    setManager(manager: PhaserAds): void;
    /**
     * Doing an ad request, if anything is wrong with the lib (missing ima3, failed request) we just dispatch the contentResumed event
     * Otherwise we display an ad
     */
    showAd(customParams?: ICustomParams): void;
    preloadAd(): void;
    destroyAd(): void;
    hideAd(): void;
    /**
     * Called when the ads manager was loaded.
     * We register all ad related events here, and initialize the manager with the game width/height
     *
     * @param adsManagerLoadedEvent
     */
    private onAdManagerLoader;
    /**
     * Generic ad events are handled here
     * @param adEvent
     */
    private onAdEvent;
    private onAdError;
    /**
     * When the ad starts playing, and the game should be paused
     */
    private onContentPauseRequested;
    /**
     * When the ad is finished and the game should be resumed
     */
    private onContentResumeRequested;
    private parseCustomParams;
    /**
     * Checks if the ads are enabled (e.g; adblock is enabled or not)
     * @returns {boolean}
     */
    private areAdsEnabled;
}
