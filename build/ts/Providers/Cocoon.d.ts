import { IProvider } from './IProvider';
import PhaserAds from '../index';
export declare enum CocoonProvider {
    AdMob = 0,
    MoPub = 1,
    Chartboost = 2,
    Heyzap = 3
}
export declare enum CocoonAdType {
    banner = 0,
    interstitial = 1,
    insentive = 2
}
export default class CocoonAds implements IProvider {
    adManager: PhaserAds;
    adsEnabled: boolean;
    private cocoonProvider;
    private banner;
    private bannerShowable;
    private interstitial;
    private interstitialShowable;
    private insentive;
    private insentiveShowable;
    constructor(game: Phaser.Game, provider: CocoonProvider, config?: any);
    setManager(manager: PhaserAds): void;
    showAd(adType: CocoonAdType): void;
    preloadAd(adType: CocoonAdType, adId?: string, bannerPosition?: string): void;
    destroyAd(adType: CocoonAdType): void;
    hideAd(adType: CocoonAdType): void;
}
