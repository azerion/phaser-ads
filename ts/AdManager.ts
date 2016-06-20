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

            constructor(game: AdGame, pluginManager: Phaser.PluginManager) {
                super(game, pluginManager);

                Object.defineProperty(game, 'ads', {
                    value: this
                });
            }

            public setAdProvider(provider: AdProvider.IProvider): void {
                this.provider = provider;
                this.provider.setManager(this);
            }

            public requestAd(...args: any[]): void {
                if (null === this.provider) {
                    return;
                }

                this.provider.requestAd.apply(this.provider, args);
            }

            public preloadAd(...args: any[]): void {
                if (null === this.provider) {
                    return;
                }

                this.provider.preloadAd.apply(this.provider, args);
            }

            public destroyAd(...args: any[]): void {
                if (null === this.provider) {
                    return;
                }

                this.provider.destroyAd.apply(this.provider, args);
            }

            public hideAd(...args: any[]): void {
                if (null === this.provider) {
                    return;
                }

                this.provider.hideAd.apply(this.provider, args);
            }
        }
    }
}
