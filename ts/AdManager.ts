module Fabrique {
    export module Plugins {
        export interface AdGame extends Phaser.Game {
            ads: Fabrique.Plugins.AdManager;
        }

        export class AdManager extends Phaser.Plugin {
            public onAdStarted: Phaser.Signal = new Phaser.Signal();

            public onAdFinished: Phaser.Signal = new Phaser.Signal();

            public onContentPaused: Phaser.Signal = new Phaser.Signal();

            public onContentResumed: Phaser.Signal = new Phaser.Signal();

            public onAdClicked: Phaser.Signal = new Phaser.Signal();

            public onAdError: Phaser.Signal = new Phaser.Signal();

            private provider: AdProvider.IProvider = null;

            constructor(game: AdGame, parent:PIXI.DisplayObject) {
                super(game, parent);

                Object.defineProperty(game.ads, 'game', {
                    value: this
                });
            }

            setAdProvider(provider: AdProvider.IProvider): void {
                this.provider = provider;
                this.provider.setManager(this);
            }

            showAd(): void {
                if (null === this.provider) {
                    return;
                }
            }

            hideAd(): void {
                if (null === this.provider) {
                    return;
                }

            }
        }
    }
}
