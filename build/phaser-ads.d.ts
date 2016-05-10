declare module Fabrique {
    module Plugins {
        interface AdGame extends Phaser.Game {
            ads: Fabrique.Plugins.AdManager;
        }
        class AdManager extends Phaser.Plugin {
            onAdStarted: Phaser.Signal;
            onAdFinished: Phaser.Signal;
            onContentPaused: Phaser.Signal;
            onContentResumed: Phaser.Signal;
            onAdClicked: Phaser.Signal;
            onAdError: Phaser.Signal;
            private provider;
            constructor(game: AdGame, parent: PIXI.DisplayObject);
            setAdProvider(provider: AdProvider.IProvider): void;
            showAd(): void;
            hideAd(): void;
        }
    }
}
declare module Fabrique {
    module AdProvider {
        class AdSense implements IProvider {
            private gameContent;
            private adContent;
            private adDisplay;
            private adLoader;
            private adsManager;
            private googleEnabled;
            private canPlayAds;
            private adTagUrl;
            private game;
            adManager: AdManager;
            constructor(game: Phaser.Game, gameContentId: string, adContentId: string, adTagUrl: string);
            playAd(): void;
            setManager(manager: AdManager): void;
            private createAdDisplayContainer();
            private onAdManagerLoader(adsManagerLoadedEvent);
            private onAdEvent();
            /**
             * When the ad starts playing, and the game should be paused
             */
            private onContentPauseRequested();
            /**
             * When the ad is finished and the game should be resumed
             */
            private onContentResumeRequested();
            private onAdError(error);
        }
    }
}
import AdManager = Fabrique.Plugins.AdManager;
declare module Fabrique {
    module AdProvider {
        interface IProvider {
            adManager: AdManager;
            setManager(manager: AdManager): void;
            playAd(): void;
        }
    }
}
