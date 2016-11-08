declare module HeyzapAds {
    export function start(published_id: string): Thenable<any>;

	export module InterstitialAd {
        export var Events: {
            SHOW_FAILED: string;
            SHOW: string;
            CLICKED: string;
            HIDE: string;
        };
        export function show(): Thenable<any>;
        export function addEventListener(target: string, call: () => void): void;
    }
    export module VideoAd {
        export var Events: {
            SHOW_FAILED: string;
            SHOW: string;
            CLICKED: string;
            HIDE: string;
        };
        export function show(): Thenable<any>;
        export function fetch(): Thenable<any>;
        export function addEventListener(target: string, call: () => void): void;
    }
    export module IncentivizedAd {
        export var Events: {
            SHOW_FAILED: string;
            SHOW: string;
            CLICKED: string;
            HIDE: string;
        };
        export function show(): Thenable<any>;
        export function fetch(): Thenable<any>;
        export function addEventListener(target: string, call: () => void): void;
    }
    export module BannerAd {
        export var POSITION_TOP: string;
        export var POSITION_BOTTOM: string;
        export var Events: {
            SHOW_FAILED: string;
            SHOW: string;
            CLICKED: string;
        };
        export function show(position: string): Thenable<any>;
        export function hide(): Thenable<any>;
        export function destroy(): Thenable<any>;
        export function addEventListener(target: string, call: () => void): void;
    }
}