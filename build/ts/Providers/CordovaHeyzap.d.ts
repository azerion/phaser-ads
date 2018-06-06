import { IProvider } from './IProvider';
import PhaserAds from '../index';
export declare enum HeyzapAdTypes {
    Interstitial = 0,
    Video = 1,
    Rewarded = 2,
    Banner = 3
}
export default class CordovaHeyzap implements IProvider {
    adManager: PhaserAds;
    adsEnabled: boolean;
    constructor(game: Phaser.Game, publisherId: string);
    setManager(manager: PhaserAds): void;
    showAd(adType: HeyzapAdTypes, bannerAdPositions?: string): void;
    preloadAd(adType: HeyzapAdTypes): void;
    destroyAd(adType: HeyzapAdTypes): void;
    hideAd(adType: HeyzapAdTypes): void;
}
