module Fabrique {
    export module Plugins {
        export interface AdGame extends Phaser.Game {
            ads: Fabrique.Plugins.AdManager;
        }

        export class AdManager extends Phaser.Plugin {
            public onContentPaused: Phaser.Signal = new Phaser.Signal();

            public onContentResumed: Phaser.Signal = new Phaser.Signal();

            public onAdClicked: Phaser.Signal = new Phaser.Signal();

            private provider: AdProvider.IProvider = null;

            private wasMuted: boolean = false;

            constructor(game: AdGame, pluginManager: Phaser.PluginManager) {
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
            public requestAd(...args: any[]): void {
                if (null === this.provider) {
                    throw new Error('Can not request an ad without an provider, please attach an ad provider!');
                    return;
                }

                //first we check if the sound was already muted before we requested an add
                this.wasMuted = this.game.sound.mute;
                //Let's mute audio for the game, we can resume the audi playback once the add has played
                this.game.sound.mute = true;

                //We add a once listener to when the content should be resumed in order to unmute audio
                this.onContentResumed.addOnce(() => {
                    if (!this.wasMuted) {
                        //Here we unmute audio, but only if it wasn't muted before requesting an add
                        this.game.sound.mute = false;
                    }
                });
                this.provider.requestAd.apply(this.provider, args);
            }

            /**
             * Some providers might require you to preload an ad before showing it, that can be done here
             *
             * @param args
             */
            public preloadAd(...args: any[]): void {
                if (null === this.provider) {
                    throw new Error('Can not preload an ad without an provider, please attach an ad provider!');
                    return;
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
                    return;
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
                    return;
                }

                this.provider.hideAd.apply(this.provider, args);
            }
        }
    }
}
