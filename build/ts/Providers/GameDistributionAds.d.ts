import { IProvider } from './IProvider';
import PhaserAds from '../index';
export default class GameDistributionAds implements IProvider {
    adManager: PhaserAds;
    adsEnabled: boolean;
    constructor(game: Phaser.Game, gameId: string, userId: string);
    setManager(manager: PhaserAds): void;
    showAd(): void;
    preloadAd(): void;
    destroyAd(): void;
    hideAd(): void;
    /**
     * Checks if the ads are enabled (e.g; adblock is enabled or not)
     * @returns {boolean}
     */
    private areAdsEnabled;
}
