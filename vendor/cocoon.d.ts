declare module Cocoon {
    export module Ads {
        export interface IBanner {
            show(): void;
            hide(): void;
            on(eventName: "load" | "fail" | "show" | "dismiss" | "click" | "reward", listener?: () => void): void;
        }
        export interface IAdProvider {
            configure(config: any): void;
            createBanner(config?: any): IBanner;
            createInterstitial(config?: any): IBanner;
            createRewardedVideo(config?: any): IBanner;
            createRewardedVideo(config?: any): IBanner;
            showDebug(): void;

        }

        export var AdMob: IAdProvider;
        export var MoPub: IAdProvider;
        export var Heyzap: IAdProvider;
        export var Chartboost: IAdProvider;
    }

}