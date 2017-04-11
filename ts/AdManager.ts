declare module 'phaser-ads' {
    export = PhaserAds;
}

module PhaserAds {
    export interface IAdGame extends Phaser.Game {
        ads: AdManager;
    }

    export enum AdEvent {
        start,
        firstQuartile,
        midPoint,
        thirdQuartile,
        complete
    }

    export class AdManager extends Phaser.Plugin {
        public onContentPaused: Phaser.Signal = new Phaser.Signal();

        public onContentResumed: Phaser.Signal = new Phaser.Signal();

        public onAdProgression: Phaser.Signal = new Phaser.Signal();

        public onAdsDisabled: Phaser.Signal = new Phaser.Signal();

        public onAdClicked: Phaser.Signal = new Phaser.Signal();

        public onAdRewardGranted: Phaser.Signal = new Phaser.Signal();

        public onBannerShown: Phaser.Signal = new Phaser.Signal();

        public onBannerHidden: Phaser.Signal = new Phaser.Signal();

        public bannerActive: boolean = false;

        private provider: AdProvider.IProvider = null;

        private wasMuted: boolean = false;

        constructor(game: IAdGame, pluginManager: Phaser.PluginManager) {
            super(game, pluginManager);

            Object.defineProperty(game, 'ads', {
                value: this
            });
        }

        /**
         * Here we set an adprovider, any can be given as long as it implements the IProvider interface
         *
         * @param provider
         */
        public setAdProvider(provider: AdProvider.IProvider): void {
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
            if (args[0] && args[0] !== AdProvider.CocoonAdType.banner) {
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
}
