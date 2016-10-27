import AdManager = Fabrique.Plugins.AdManager;

module Fabrique {
    export module AdProvider {
        export interface IProvider {
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