import { IProvider } from './Providers/IProvider';
export { default as CocoonAds } from './Providers/Cocoon';
export { default as CordovaGameDistribution } from './Providers/CordovaGameDistribution';
export { default as CordovaHeyzap } from './Providers/CordovaHeyzap';
export { default as GameDistributionAds } from './Providers/GameDistributionAds';
export { default as Ima3 } from './Providers/Ima3';
export { default as IStorage } from './Providers/IProvider';
export declare enum AdEvent {
    start = 0,
    firstQuartile = 1,
    midPoint = 2,
    thirdQuartile = 3,
    complete = 4
}
export default class PhaserAds extends Phaser.Events.EventEmitter {
    static CONTENT_PAUSED: string;
    static CONTENT_RESUMED: string;
    static AD_PROGRESSION: string;
    static AD_DISABLED: string;
    static AD_CLICKED: string;
    static AD_REWARDED: string;
    static BANNER_SHOWN: string;
    static BANNER_HIDDEN: string;
    bannerActive: boolean;
    private provider;
    private wasMuted;
    protected game: Phaser.Game;
    protected pluginManager: Phaser.Plugins.PluginManager;
    protected scene: Phaser.Scene;
    protected systems: Phaser.Scenes.Systems;
    constructor(game: Phaser.Game);
    init(): void;
    start(): void;
    stop(): void;
    boot(): void;
    destroy(): void;
    /**
     * Here we set an adprovider, any can be given as long as it implements the IProvider interface
     *
     * @param provider
     */
    setAdProvider(provider: IProvider): void;
    /**
     * Here we request an ad, the arguments passed depend on the provider used!
     * @param args
     */
    showAd(...args: any[]): void;
    /**
     * Some providers might require you to preload an ad before showing it, that can be done here
     *
     * @param args
     */
    preloadAd(...args: any[]): void;
    /**
     * Some providers require you to destroy an add after it was shown, that can be done here.
     *
     * @param args
     */
    destroyAd(...args: any[]): void;
    /**
     * Some providers allow you to hide an ad, you might think of an banner ad that is shown in show cases
     *
     * @param args
     */
    hideAd(...args: any[]): void;
    /**
     * Checks if ads are enabled or blocked
     *
     * @param args
     */
    adsEnabled(): boolean;
    /**
     * Should be called after ad was(n't) shown, demutes the game so we can peacefully continue
     */
    unMuteAfterAd(): void;
}
