declare module 'phaser-ads' {
    export = PhaserAds;
}
declare module PhaserAds {
    interface IAdGame extends Phaser.Game {
        ads: AdManager;
    }
    enum AdEvent {
        start = 0,
        firstQuartile = 1,
        midPoint = 2,
        thirdQuartile = 3,
        complete = 4
    }
    enum AdType {
        interstitial = 0,
        rewarded = 1,
        banner = 2,
        video = 3
    }
    class AdManager extends Phaser.Plugin {
        onContentPaused: Phaser.Signal;
        onContentResumed: Phaser.Signal;
        onAdProgression: Phaser.Signal;
        onAdsDisabled: Phaser.Signal;
        onAdClicked: Phaser.Signal;
        onAdRewardGranted: Phaser.Signal;
        onAdLoaded: Phaser.Signal;
        onBannerShown: Phaser.Signal;
        onBannerHidden: Phaser.Signal;
        bannerActive: boolean;
        private provider;
        private wasMuted;
        constructor(game: IAdGame, pluginManager: Phaser.PluginManager);
        /**
         * Here we set an adprovider, any can be given as long as it implements the IProvider interface
         *
         * @param provider
         */
        setAdProvider(provider: AdProvider.IProvider): void;
        /**
         * Here we request an ad, the arguments passed depend on the provider used!
         * @param args
         */
        showAd(...args: any[]): void;
        loadBanner(...args: any[]): any;
        isRewardedAvailable(): boolean;
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
}
declare module PhaserAds {
    module AdProvider {
        enum CocoonProvider {
            AdMob = 0,
            MoPub = 1,
            Chartboost = 2,
            Heyzap = 3
        }
        class CocoonAds implements IProvider {
            adManager: AdManager;
            adsEnabled: boolean;
            private cocoonProvider;
            private banner;
            private bannerShowable;
            private interstitial;
            private interstitialShowable;
            private rewarded;
            hasRewarded: boolean;
            constructor(game: Phaser.Game, provider: CocoonProvider, config?: any);
            setManager(manager: AdManager): void;
            showAd(adType: AdType): void;
            preloadAd(adType: AdType, adId?: string, bannerPosition?: string): void;
            destroyAd(adType: AdType): void;
            hideAd(adType: AdType): void;
        }
    }
}
declare module PhaserAds {
    module AdProvider {
        class CordovaGameDistribution implements PhaserAds.AdProvider.IProvider {
            adManager: AdManager;
            adsEnabled: boolean;
            hasRewarded: boolean;
            constructor(game: Phaser.Game, gameId: string, userId: string, debug?: boolean);
            private setAdListeners;
            setManager(manager: PhaserAds.AdManager): void;
            showAd(adType?: AdType): void;
            preloadAd(): void;
            destroyAd(): void;
            hideAd(): void;
        }
    }
}
declare module PhaserAds {
    module AdProvider {
        enum HeyzapAdTypes {
            Interstitial = 0,
            Video = 1,
            Rewarded = 2,
            Banner = 3
        }
        class CordovaHeyzap implements IProvider {
            adManager: AdManager;
            adsEnabled: boolean;
            hasRewarded: boolean;
            constructor(game: Phaser.Game, publisherId: string);
            setManager(manager: AdManager): void;
            showAd(adType: HeyzapAdTypes, bannerAdPositions?: string): void;
            preloadAd(adType: HeyzapAdTypes): void;
            destroyAd(adType: HeyzapAdTypes): void;
            hideAd(adType: HeyzapAdTypes): void;
        }
    }
}
declare module PhaserAds {
    module AdProvider {
        enum GameDistributionAdType {
            interstitial = "interstitial",
            rewarded = "rewarded",
            display = "display"
        }
        enum GameDistributionBannerSize {
            LargeRectangle = 0,
            MediumRectangle = 1,
            Billboard = 2,
            Leaderboard = 3,
            Skyscraper = 4,
            WideSkyscraper = 5
        }
        enum GameDistributionAlignment {
            TopLeft = 0,
            TopCenter = 1,
            TopRight = 2,
            CenterLeft = 3,
            Center = 4,
            CenterRight = 5,
            BottomLeft = 6,
            BottomCenter = 7,
            BottomRight = 8
        }
        class GameDistributionBanner {
            element: HTMLElement;
            private resizeListener;
            private parent;
            private alignment;
            private width;
            private height;
            private offsetX;
            private offsetY;
            constructor();
            loadBanner(): void;
            destroy(): void;
            alignIn(element: HTMLElement, position: GameDistributionAlignment): void;
            setOffset(x?: number, y?: number): void;
            private resize;
            setSize(size: GameDistributionBannerSize): void;
            position(x: number, y: number): void;
        }
        class GameDistributionAds implements PhaserAds.AdProvider.IProvider {
            adManager: AdManager;
            adsEnabled: boolean;
            hasRewarded: boolean;
            constructor(game: Phaser.Game, gameId: string, userId?: string);
            setManager(manager: PhaserAds.AdManager): void;
            showAd(adType: AdType, containerId?: string): void;
            loadBanner(size: GameDistributionBannerSize): GameDistributionBanner;
            preloadAd(adType: PhaserAds.AdType): void;
            destroyAd(): void;
            hideAd(): void;
            /**
             * Checks if the ads are enabled (e.g; adblock is enabled or not)
             * @returns {boolean}
             */
            private areAdsEnabled;
        }
    }
}
declare module PhaserAds {
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
            hasRewarded: boolean;
            adManager: AdManager;
            private resizeListener;
            constructor(game: Phaser.Game, adTagUrl: string);
            setManager(manager: AdManager): void;
            /**
             * Doing an ad request, if anything is wrong with the lib (missing ima3, failed request) we just dispatch the contentResumed event
             * Otherwise we display an ad
             */
            showAd(customParams?: ICustomParams): void;
            preloadAd(): void;
            destroyAd(): void;
            hideAd(): void;
            /**
             * Called when the ads manager was loaded.
             * We register all ad related events here, and initialize the manager with the game width/height
             *
             * @param adsManagerLoadedEvent
             */
            private onAdManagerLoader;
            /**
             * Generic ad events are handled here
             * @param adEvent
             */
            private onAdEvent;
            private onAdError;
            /**
             * When the ad starts playing, and the game should be paused
             */
            private onContentPauseRequested;
            /**
             * When the ad is finished and the game should be resumed
             */
            private onContentResumeRequested;
            private parseCustomParams;
            /**
             * Checks if the ads are enabled (e.g; adblock is enabled or not)
             * @returns {boolean}
             */
            private areAdsEnabled;
        }
    }
}
declare module PhaserAds {
    module AdProvider {
        interface IProvider {
            adManager: AdManager;
            adsEnabled: boolean;
            hasRewarded: boolean;
            setManager(manager: AdManager): void;
            preloadAd(...args: any[]): void;
            destroyAd(...args: any[]): void;
            hideAd(...args: any[]): void;
            showAd(...args: any[]): void;
            loadBanner?(...args: any[]): void;
        }
    }
}
