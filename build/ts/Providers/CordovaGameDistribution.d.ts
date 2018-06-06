import { IProvider } from './IProvider';
import PhaserAds from '../index';
export default class CordovaGameDistribution implements IProvider {
    adManager: PhaserAds;
    adsEnabled: boolean;
    constructor(game: Phaser.Game, gameId: string, userId: string, debug?: boolean);
    private setAdListeners;
    setManager(manager: PhaserAds): void;
    showAd(): void;
    preloadAd(): void;
    destroyAd(): void;
    hideAd(): void;
}
