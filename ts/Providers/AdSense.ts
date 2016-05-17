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

            private adsManager: GoogleAds.ima.AdsManager;

            private googleEnabled: boolean = false;

            private canPlayAds: boolean = false;

            private adTagUrl: string = '';

            private game: Phaser.Game;

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
                this.createAdDisplayContainer();

                (<any>google.ima.settings).setVpaidMode((<any>google.ima).ImaSdkSettings.VpaidMode.ENABLED);

                //set language
                (<any>google.ima.settings).setLocale('nl');
            }

            public playAd(): void {
                if (!this.googleEnabled || !this.canPlayAds) {
                    this.adManager.onAdFinished.dispatch();
                    return;
                }

                // Initialize the container. Must be done via a user action on mobile devices.
                this.adDisplay.initialize();

                try {
                    this.adContent.style.display = 'block';
                    // Initialize the ads manager. Ad rules playlist will start at this time.
                    this.adsManager.init(this.game.width, this.game.height, google.ima.ViewMode.NORMAL);
                    // Call play to start showing the ad. Single video and overlay ads will
                    // start at this time; the call will be ignored for ad rules.
                    this.adsManager.start();
                } catch (adError) {
                    this.adContent.style.display = 'none';
                    // An error may be thrown if there was a problem with the VAST response.
                    console.log('ad error!!!!', adError);
                    this.adManager.onAdError.dispatch(adError);
                }
            }

            public setManager(manager: AdManager): void {
                this.adManager = manager;

                if (!this.googleEnabled) {
                    this.adManager.onAdReady.dispatch();
                    return;
                }

                // Create ads loader.
                this.adLoader = new google.ima.AdsLoader(this.adDisplay);
                // Listen and respond to ads loaded and error events.
                this.adLoader.addEventListener(
                    google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
                    (adsManagerLoadedEvent: GoogleAds.ima.AdsManagerLoadedEvent) => this.onAdManagerLoader(adsManagerLoadedEvent),
                    false);
                this.adLoader.addEventListener(
                    google.ima.AdErrorEvent.Type.AD_ERROR,
                    (e) => {
                        console.log('No ad available', e);
                        //We silently ignore adLoader errors, it just means there is no ad available
                        this.adManager.onAdReady.dispatch()
                    },
                    false);

                // Request video ads.
                var adsRequest = new google.ima.AdsRequest();
                adsRequest.adTagUrl = this.adTagUrl;
                // Specify the linear and nonlinear slot sizes. This helps the SDK to
                // select the correct creative if multiple are returned.
                adsRequest.linearAdSlotWidth = this.game.width;
                adsRequest.linearAdSlotHeight = this.game.height;

                adsRequest.nonLinearAdSlotWidth = this.game.width;
                adsRequest.nonLinearAdSlotHeight = this.game.height;
                adsRequest.forceNonLinearFullSlot = true; //required to comply with google rules

                try {
                    this.adLoader.requestAds(adsRequest);
                } catch (e) {
                    this.adManager.onAdReady.dispatch();
                }
            }

            private createAdDisplayContainer(): void {
                this.adDisplay = new google.ima.AdDisplayContainer(this.adContent, this.gameContent);
            }

            private onAdManagerLoader(adsManagerLoadedEvent: GoogleAds.ima.AdsManagerLoadedEvent): void {
                // Get the ads manager.
                var adsRenderingSettings = new google.ima.AdsRenderingSettings();
                adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

                this.canPlayAds = true;

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

                this.adManager.onAdReady.dispatch();
            }

            private onAdEvent() {
                console.log('onAdEvent', arguments);
                this.adManager.onContentResumed.dispatch();
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
                this.adManager.onAdFinished.dispatch();
            }

            private onAdError(error: GoogleAds.ima.AdErrorEvent): void {
                console.log('error', error.getError());
                this.adManager.onAdError.dispatch(error.getError());
            }
        }
    }
}