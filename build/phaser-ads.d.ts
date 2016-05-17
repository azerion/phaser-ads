declare module Fabrique {
    module Plugins {
        interface AdGame extends Phaser.Game {
            ads: Fabrique.Plugins.AdManager;
        }
        class AdManager extends Phaser.Plugin {
            onContentPaused: Phaser.Signal;
            onContentResumed: Phaser.Signal;
            onAdClicked: Phaser.Signal;
            private provider;
            constructor(game: AdGame, parent: PIXI.DisplayObject);
            setAdProvider(provider: AdProvider.IProvider): void;
            requestAd(): void;
            enableMobileAds(): void;
        }
    }
}
declare module Fabrique {
    module AdProvider {
        interface ICustomParams {
            [name: string]: string | number | any[];
        }
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
            private adRequested;
            adManager: AdManager;
            constructor(game: Phaser.Game, gameContentId: string, adContentId: string, adTagUrl: string, customParams?: ICustomParams);
            setManager(manager: AdManager): void;
            requestAd(): void;
            initializeAd(): void;
            private onAdManagerLoader(adsManagerLoadedEvent);
            private onAdEvent(adEvent);
            private onAdError();
            /**
             * When the ad starts playing, and the game should be paused
             */
            private onContentPauseRequested();
            /**
             * When the ad is finished and the game should be resumed
             */
            private onContentResumeRequested();
        }
    }
}
import AdManager = Fabrique.Plugins.AdManager;
declare module Fabrique {
    module AdProvider {
        interface IProvider {
            adManager: AdManager;
            setManager(manager: AdManager): void;
            requestAd(): void;
            initializeAd(): void;
        }
    }
}
