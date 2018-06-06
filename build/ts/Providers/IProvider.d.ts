import PhaserAds from '../index';
export interface IProvider {
    adManager: PhaserAds;
    adsEnabled: boolean;
    setManager(manager: PhaserAds): void;
    preloadAd(...args: any[]): void;
    destroyAd(...args: any[]): void;
    hideAd(...args: any[]): void;
    showAd(...args: any[]): void;
}
export default IProvider;
