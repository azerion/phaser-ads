declare module GoogleAds.ima {
    class ViewMode {
        public static NORMAL: string;
        public static FULLSCREEN: string;
    }

    class AdErrorEvent {
        public static Type: {
            AD_ERROR: string;
        };

        public getError(): string;
    }

    class AdEvent {
        public static Type: {
            CONTENT_PAUSE_REQUESTED: string;
            CONTENT_RESUME_REQUESTED: string;
            ALL_ADS_COMPLETED: string;
            LOADED: string;
            STARTED: string;
            COMPLETE: string;
            CLICK: string;
            PAUSED: string;
            FIRST_QUARTILE: string;
            MIDPOINT: string;
            THIRD_QUARTILE: string;
        };
    }

    class AdsManagerLoadedEvent {
        public static Type: {
            ADS_MANAGER_LOADED: string;
        };

        public getAdsManager(content: HTMLElement, adRenderSettings: AdsRenderingSettings): AdsManager;
    }

    class AdsRequest {
        constructor();
        public adTagUrl: string;
        public linearAdSlotWidth: number;
        public linearAdSlotHeight: number;
        public nonLinearAdSlotWidth: number;
        public nonLinearAdSlotHeight: number;
        public forceNonLinearFullSlot: boolean;
    }

    class AdsRenderingSettings {
        public restoreCustomPlaybackStateOnAdBreakComplete: boolean;
    }

    class AdContainer {
        public initialize: () => void;
    }

    class AdsLoader {
        constructor(displayontainer: AdDisplayContainer);
        public addEventListener(type: string, callback: (thingy: any) => void, something: boolean, context?: any): void;
        public requestAds(request: AdsRequest): void;
    }

    class AdsManager {
        public isCustomClickTrackingUsed(): boolean;
        public addEventListener(type: string, callback: (thingy: any) => void, something?: boolean, context?: any): void;
        public init(width: number, height: number, viewMode: string): void;
        public start(): void;
        public destroy(): void;
        public resize(width: number, height: number, viewMode: string): void;
    }

    class AdDisplayContainer {
        constructor(content: HTMLElement, ad?: HTMLElement, customClickTrack?: HTMLElement);
        public initialize(): void;
    }
}

declare var google: any;