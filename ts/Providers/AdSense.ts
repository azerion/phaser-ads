module Fabrique {
    export module AdProvider {
        export interface ICustomParams {
            [name: string]: string | number| any[];
        }

        export class AdSense implements IProvider {
            private gameContent: any;

            private adContent: HTMLElement;

            private adDisplay: GoogleAds.ima.AdDisplayContainer;

            private adLoader: GoogleAds.ima.AdsLoader;

            private adsManager: GoogleAds.ima.AdsManager = null;

            private googleEnabled: boolean = false;

            private canPlayAds: boolean = false;

            private adTagUrl: string = '';

            private game: Phaser.Game;

            private adRequested: boolean = false;

            public adManager: AdManager = null;

            constructor(game: Phaser.Game, gameContentId: string, adContentId: string, adTagUrl: string, customParams?: ICustomParams) {
                if (typeof google === "undefined") {
                    return;
                }

                this.googleEnabled = true;

                this.adContent = document.getElementById(adContentId);
                this.adContent.style.display = 'none';

                this.gameContent = document.getElementById(gameContentId);
                this.gameContent.currentTime = 100;

                this.adTagUrl = adTagUrl;
                this.game = game;

                if (undefined !== customParams) {
                    let customDataString: string = '';
                    for (let key in customParams) {
                        if (customDataString.length > 0) {
                            customDataString += '' +
                                '&';
                        }
                        var param = (Array.isArray(customParams[key])) ? (<any[]>customParams[key]).join(',') : customParams[key];
                        customDataString += key + '=' + param;
                    }
                    this.adTagUrl += '&cust_params=' + encodeURIComponent(customDataString);
                }

                // Create the ad display container.
                this.adDisplay = new google.ima.AdDisplayContainer(this.adContent, this.gameContent);

                //Set vpaid enabled, and update locale
                (<any>google.ima.settings).setVpaidMode((<any>google.ima).ImaSdkSettings.VpaidMode.ENABLED);
                (<any>google.ima.settings).setLocale('nl');

                // Create ads loader, and register events
                this.adLoader = new google.ima.AdsLoader(this.adDisplay);
                this.adLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this.onAdManagerLoader, false, this);
                this.adLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, (e) => {
                    console.log('No ad available', e);
                }, false);
            }

            public setManager(manager: AdManager): void {
                this.adManager = manager;
            }

            public requestAd(): void {
                if (!this.googleEnabled) {
                    this.adManager.onContentResumed.dispatch();
                    return;
                }

                // Request video ads.
                var adsRequest = new google.ima.AdsRequest();
                adsRequest.adTagUrl = this.adTagUrl;
                // Specify the linear and nonlinear slot sizes. This helps the SDK to
                // select the correct creative if multiple are returned.
                adsRequest.linearAdSlotWidth = parseInt(this.game.canvas.style.width, 10);
                adsRequest.linearAdSlotHeight = parseInt(this.game.canvas.style.height, 10);

                adsRequest.nonLinearAdSlotWidth = parseInt(this.game.canvas.style.width, 10);
                adsRequest.nonLinearAdSlotHeight = parseInt(this.game.canvas.style.height, 10);
                adsRequest.forceNonLinearFullSlot = true; //required to comply with google rules

                try {
                    this.adLoader.requestAds(adsRequest);
                } catch (e) {
                    this.adManager.onContentResumed.dispatch();
                }
            }

            public initializeAd(): void {
                // Initialize the container. Must be done via a user action on mobile devices.
                this.adDisplay.initialize();
            }

            private onAdManagerLoader(adsManagerLoadedEvent: GoogleAds.ima.AdsManagerLoadedEvent): void {
                // Get the ads manager.
                var adsRenderingSettings = new google.ima.AdsRenderingSettings();
                adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;


                // videoContent should be set to the content video element.
                this.adsManager = adsManagerLoadedEvent.getAdsManager(this.gameContent, adsRenderingSettings);

                // Add listeners to the required events.
                this.adsManager.addEventListener(
                    google.ima.AdErrorEvent.Type.AD_ERROR,
                    (error: GoogleAds.ima.AdErrorEvent) => this.onAdError.call(this, error));
                this.adsManager.addEventListener(
                    google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
                    this.onContentPauseRequested.bind(this));
                this.adsManager.addEventListener(
                    google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
                    this.onContentResumeRequested.bind(this));
                this.adsManager.addEventListener(
                    google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
                    this.onAdEvent.bind(this));

                // Listen to any additional events, if necessary.
                this.adsManager.addEventListener(
                    google.ima.AdEvent.Type.LOADED,
                    this.onAdEvent.bind(this));
                this.adsManager.addEventListener(
                    google.ima.AdEvent.Type.STARTED,
                    this.onAdEvent.bind(this));
                this.adsManager.addEventListener(
                    google.ima.AdEvent.Type.COMPLETE,
                    this.onAdEvent.bind(this));

                try {
                    this.adContent.style.display = 'block';
                    // Initialize the ads manager. Ad rules playlist will start at this time.
                    this.adsManager.init(
                        parseInt(this.game.canvas.style.width, 10),
                        parseInt(this.game.canvas.style.height, 10),
                        google.ima.ViewMode.NORMAL
                    );
                    // Call play to start showing the ad. Single video and overlay ads will
                    // start at this time; the call will be ignored for ad rules.
                    this.adsManager.start();
                } catch (adError) {
                    this.onAdError();
                }
            }

            private onAdEvent(adEvent: any) {
                console.log('onAdEvent', arguments);

                if (adEvent.type == google.ima.AdEvent.Type.CLICK) {
                    this.adManager.onAdClicked.dispatch();
                } else if (adEvent.type == google.ima.AdEvent.Type.LOADED) {
                    var ad = adEvent.getAd();
                    if (!ad.isLinear())
                    {
                        this.onContentResumeRequested();
                    }
                }
            }

            private onAdError() {
                if (null !== this.adsManager) {
                    this.adsManager.destroy();
                    this.adsManager = null;
                }

                //We silently ignore adLoader errors, it just means there is no ad available
                this.onContentResumeRequested()
            }

            /**
             * When the ad starts playing, and the game should be paused
             */
            private onContentPauseRequested() {
                console.log('onContentPauseRequested', arguments);
                this.adManager.onContentPaused.dispatch();
            }

            /**
             * When the ad is finished and the game should be resumed
             */
            private onContentResumeRequested() {
                console.log('onContentResumeRequested', arguments);
                this.adContent.style.display = 'none';
                this.adManager.onContentResumed.dispatch();
            }
        }
    }
}