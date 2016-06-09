import AdManager = Fabrique.Plugins.AdManager;

module Fabrique {
    export module AdProvider {
        export interface IProvider {
            adManager: AdManager;

            setManager(manager: AdManager): void;
            requestAd(...args: any[]): void;
            preloadAd(...args: any[]): void;
            destroyAd(...args: any[]): void;
            hideAd(...args: any[]): void;
        }
    }
}