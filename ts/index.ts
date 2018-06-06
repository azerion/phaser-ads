import {IProvider} from './Providers/IProvider';
import {CocoonAdType} from './Providers/Cocoon';

export {default as CocoonAds} from './Providers/Cocoon';
export {default as CordovaGameDistribution} from './Providers/CordovaGameDistribution';
export {default as CordovaHeyzap} from './Providers/CordovaHeyzap';
export {default as GameDistributionAds} from './Providers/GameDistributionAds';
export {default as Ima3} from './Providers/Ima3';
export {default as IStorage} from './Providers/IProvider';

export enum AdEvent {
    start,
    firstQuartile,
    midPoint,
    thirdQuartile,
    complete
}

export default class PhaserAds extends Phaser.Events.EventEmitter {
    public static CONTENT_PAUSED: string = 'onContentPaused';

    public static CONTENT_RESUMED: string = 'onContentResumed';

    public static AD_PROGRESSION: string = 'onAdProgression';

    public static AD_DISABLED: string = 'onAdsDisabled';

    public static AD_CLICKED: string = 'onAdClicked';

    public static AD_REWARDED: string = 'onAdRewardGranted';

    public static BANNER_SHOWN: string = 'onBannerShown';

    public static BANNER_HIDDEN: string = 'onBannerHidden';

    public bannerActive: boolean = false;

    private provider: IProvider = null;

    private wasMuted: boolean = false;

    protected game: Phaser.Game;

    protected pluginManager: Phaser.Plugins.PluginManager;

    protected scene: Phaser.Scene;

    protected systems: Phaser.Scenes.Systems;

    constructor(game: Phaser.Game) {
        super();
        this.game = game;
        this.pluginManager = this.game.plugins;
    }

    public init(): void {};
    public start(): void {};
    public stop(): void {};
    public boot(): void {};
    public destroy(): void {};

    /**
     * Here we set an adprovider, any can be given as long as it implements the IProvider interface
     *
     * @param provider
     */
    public setAdProvider(provider: IProvider): void {
        this.provider = provider;
        this.provider.setManager(this);
    }

    /**
     * Here we request an ad, the arguments passed depend on the provider used!
     * @param args
     */
    public showAd(...args: any[]): void {
        if (null === this.provider) {
            throw new Error('Can not request an ad without an provider, please attach an ad provider!');
        }

        //Let's not do this for banner's
        if (args[0] !== CocoonAdType.banner) {
            //first we check if the sound was already muted before we requested an add
            this.wasMuted = this.game.sound.mute;
            //Let's mute audio for the game, we can resume the audi playback once the add has played
            this.game.sound.mute = true;
        }

        this.provider.showAd.apply(this.provider, args);
    }

    /**
     * Some providers might require you to preload an ad before showing it, that can be done here
     *
     * @param args
     */
    public preloadAd(...args: any[]): void {
        if (null === this.provider) {
            throw new Error('Can not preload an ad without an provider, please attach an ad provider!');
        }

        this.provider.preloadAd.apply(this.provider, args);
    }

    /**
     * Some providers require you to destroy an add after it was shown, that can be done here.
     *
     * @param args
     */
    public destroyAd(...args: any[]): void {
        if (null === this.provider) {
            throw new Error('Can not destroy an ad without an provider, please attach an ad provider!');
        }

        this.provider.destroyAd.apply(this.provider, args);
    }

    /**
     * Some providers allow you to hide an ad, you might think of an banner ad that is shown in show cases
     *
     * @param args
     */
    public hideAd(...args: any[]): void {
        if (null === this.provider) {
            throw new Error('Can not hide an ad without an provider, please attach an ad provider!');
        }

        this.unMuteAfterAd();

        this.provider.hideAd.apply(this.provider, args);
    }

    /**
     * Checks if ads are enabled or blocked
     *
     * @param args
     */
    public adsEnabled(): boolean {
        return this.provider.adsEnabled;
    }

    /**
     * Should be called after ad was(n't) shown, demutes the game so we can peacefully continue
     */
    public unMuteAfterAd(): void {
        if (!this.wasMuted) {
            //Here we unmute audio, but only if it wasn't muted before requesting an add
            this.game.sound.mute = false;
        }

    }
}
