declare module Cocoon {
    export module Ad {
        export interface IBanner {
            show(): void;
            hide(): void;
            load(): void;
            on(eventName: "load" | "fail" | "show" | "dismiss" | "click" | "reward", listener?: () => void): void;
            setLayout(layout: string): void;
        }
        export interface IAdProvider {
            configure(config: any): void;
            createBanner(adId?: any): IBanner;
            createInterstitial(adId?: any): IBanner;
            createRewardedVideo(adId?: any): IBanner;
            showDebug(): void;
            releaseBanner(banner: IBanner): void;
            releaseInterstitial(interstitial: IBanner): void;

        }

        export var BannerLayout: {
            TOP_CENTER: string,
            BOTTOM_CENTER: string,
            CUSTOM: string
        };

        export var AdMob: IAdProvider;
        export var MoPub: IAdProvider;
        export var Heyzap: IAdProvider;
        export var Chartboost: IAdProvider;
    }

}