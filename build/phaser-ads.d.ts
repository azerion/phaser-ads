/// <reference path="../vendor/cordova-heyzap.d.ts" />
/// <reference path="../vendor/cocoon.d.ts" />
/// <reference path="../vendor/google-ima3-sdk.d.ts" />
declare module Fabrique {
    module Plugins {
        interface AdGame extends Phaser.Game {
            ads: Fabrique.Plugins.AdManager;
        }
        enum AdEvent {
            start = 0,
            firstQuartile = 1,
            midPoint = 2,
            thirdQuartile = 3,
            complete = 4,
        }
        class AdManager extends Phaser.Plugin {
            onContentPaused: Phaser.Signal;
            onContentResumed: Phaser.Signal;
            onAdProgression: Phaser.Signal;
            onAdsDisabled: Phaser.Signal;
            onAdClicked: Phaser.Signal;
            onAdRewardGranted: Phaser.Signal;
            private provider;
            private wasMuted;
            constructor(game: AdGame, pluginManager: Phaser.PluginManager);
            setAdProvider(provider: AdProvider.IProvider): void;
            showAd(...args: any[]): void;
            preloadAd(...args: any[]): void;
            destroyAd(...args: any[]): void;
            hideAd(...args: any[]): void;
            adsEnabled(): boolean;
        }
    }
}
declare module Fabrique {
    module AdProvider {
        enum CocoonProvider {
            AdMob = 0,
            MoPub = 1,
            Chartboost = 2,
            Heyzap = 3,
        }
        enum CocoonAdType {
            banner = 0,
            interstitial = 1,
            insentive = 2,
        }
        class CocoonAds implements IProvider {
            adManager: AdManager;
            adsEnabled: boolean;
            private cocoonProvider;
            private banner;
            private bannerShowable;
            private interstitial;
            private interstitialShowable;
            private insentive;
            private insentiveShowable;
            constructor(game: Phaser.Game, provider: CocoonProvider, config?: any);
            setManager(manager: AdManager): void;
            showAd(adType: CocoonAdType): void;
            preloadAd(adType: CocoonAdType, adId?: string): void;
            destroyAd(adType: CocoonAdType): void;
            hideAd(adType: CocoonAdType): void;
        }
    }
}
declare module Fabrique {
    module AdProvider {
        enum HeyzapAdTypes {
            Interstitial = 0,
            Video = 1,
            Rewarded = 2,
            Banner = 3,
        }
        class CordovaHeyzap implements IProvider {
            adManager: AdManager;
            adsEnabled: boolean;
            constructor(game: Phaser.Game, publisherId: string);
            setManager(manager: AdManager): void;
            showAd(adType: HeyzapAdTypes, bannerAdPositions?: string): void;
            preloadAd(adType: HeyzapAdTypes): void;
            destroyAd(adType: HeyzapAdTypes): void;
            hideAd(adType: HeyzapAdTypes): void;
        }
    }
}
import AdManager = Fabrique.Plugins.AdManager;
declare module Fabrique {
    module AdProvider {
        interface IProvider {
            adManager: AdManager;
            adsEnabled: boolean;
            setManager(manager: AdManager): void;
            preloadAd(...args: any[]): void;
            destroyAd(...args: any[]): void;
            hideAd(...args: any[]): void;
            showAd(...args: any[]): void;
        }
    }
}
declare module Fabrique {
    module AdProvider {
        interface ICustomParams {
            [name: string]: string | number | any[];
        }
        class Ima3 implements IProvider {
            private gameContent;
            private adContent;
            private adDisplay;
            private adLoader;
            private adsManager;
            private googleEnabled;
            adsEnabled: boolean;
            private adTagUrl;
            private game;
            private adRequested;
            adManager: AdManager;
            private resizeListener;
            constructor(game: Phaser.Game, adTagUrl: string);
            setManager(manager: AdManager): void;
            showAd(customParams?: ICustomParams): void;
            preloadAd(): void;
            destroyAd(): void;
            hideAd(): void;
            private onAdManagerLoader(adsManagerLoadedEvent);
            private onAdEvent(adEvent);
            private onAdError(error);
            private onContentPauseRequested();
            private onContentResumeRequested();
            private parseCustomParams(customParams);
            private areAdsEnabled();
        }
    }
}
