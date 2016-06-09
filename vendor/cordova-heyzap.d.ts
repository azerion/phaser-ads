interface Thenable {
    then(cb1: () => void, cb2?: (...args: any[]) => void): Thenable;
}

declare module HeyzapAds {
    export function start(published_id: string): Thenable;

	export module InterstitialAd {
        export var Events: {
            SHOW_FAILED: string;
            SHOW: string;
            CLICKED: string;
        };
        export function show(): Thenable;
        export function addEventListener(target: string, call: () => void): void;
    }
    export module VideoAd {
        export var Events: {
            SHOW_FAILED: string;
            SHOW: string;
            CLICKED: string;
        };
        export function show(): Thenable;
        export function fetch(): Thenable;
        export function addEventListener(target: string, call: () => void): void;
    }
    export module IncentivizedAd {
        export var Events: {
            SHOW_FAILED: string;
            SHOW: string;
            CLICKED: string;
        };
        export function show(): Thenable;
        export function fetch(): Thenable;
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
        export function show(position: string): Thenable;
        export function hide(): Thenable;
        export function destroy(): Thenable;
        export function addEventListener(target: string, call: () => void): void;
    }
}