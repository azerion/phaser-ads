module PhaserAds {
    export module AdProvider {
        export interface IProvider {
            adManager: AdManager;
            adsEnabled: boolean;

            setManager(manager: AdManager): void;
            preloadAd(...args: any[]): void;
            destroyAd(...args: any[]): void;
            hideAd(...args: any[]): void;
            showAd(...args: any[]): void;
            /*setLayout(...args: any[]): void;
            setPosition(...args: any[]): void;*/
        }
    }
}
