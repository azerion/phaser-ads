declare class CordovaPluginGdApi {
    init: (settings: any, succes: (data: any) => void, error: (error: any) => void) => void;
    setAdListener: (success: (data: any) => void, error: (data: any) => void) => void;
    showBanner: (succes: (data: any) => void, error: (error: any) => void) => void;
    enableTestAds: () => void;
}

declare var cordova: any;
