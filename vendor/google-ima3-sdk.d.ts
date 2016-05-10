declare module GoogleAds.ima {
    class ViewMode {
        static NORMAL: string;
    }

    class AdErrorEvent {
        static Type: {
            AD_ERROR: string;
        };

        getError(): string;
    }

    class AdEvent {
        static Type: {
            CONTENT_PAUSE_REQUESTED: string;
            CONTENT_RESUME_REQUESTED: string;
            ALL_ADS_COMPLETED: string;
            LOADED: string;
            STARTED: string;
            COMPLETE: string;
        };
    }

    class AdsManagerLoadedEvent {
        static Type: {
            ADS_MANAGER_LOADED: string;
        };

        getAdsManager(content: HTMLElement, adRenderSettings: AdsRenderingSettings): AdsManager;
    }

    class AdsRequest {
        constructor();
        adTagUrl: string;
        linearAdSlotWidth: number;
        linearAdSlotHeight: number;
        nonLinearAdSlotWidth: number;
        nonLinearAdSlotHeight: number;
        forceNonLinearFullSlot: boolean;
    }

    class AdsRenderingSettings {
        restoreCustomPlaybackStateOnAdBreakComplete: boolean;
    }

    class AdContainer {
        initialize: () => void;
    }

    class AdsLoader {
        constructor(displayontainer: AdDisplayContainer);
        addEventListener(type: string, callback: (thingy: any) => void, something: boolean): void;
        requestAds(request: AdsRequest): void;
    }

    class AdsManager {
        addEventListener(type: string, callback: (thingy: any) => void, something?: boolean): void;
        init(width: number, height: number, viewMode: string): void;
        start(): void;
    }

    class AdDisplayContainer {
        constructor(content: HTMLElement, ad: HTMLElement);
        initialize(): void;
    }
}

declare var google: any;