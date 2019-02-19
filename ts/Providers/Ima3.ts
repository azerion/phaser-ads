module PhaserAds {
    export module AdProvider {
        export interface ICustomParams {
            [name: string]: string | number| any[];
        }

        export class Ima3 implements IProvider {
            private gameContent: any;

            private adContent: HTMLElement;

            private adDisplay: GoogleAds.ima.AdDisplayContainer;

            private adLoader: GoogleAds.ima.AdsLoader;

            private adsManager: GoogleAds.ima.AdsManager = null;

            private googleEnabled: boolean = false;

            public adsEnabled: boolean = true;

            private adTagUrl: string = '';

            private game: Phaser.Game;

            private adRequested: boolean = false;

            public hasRewarded: boolean = false;

            public adManager: AdManager = null;

            private resizeListener: () => void = null;

            constructor(game: Phaser.Game, adTagUrl: string) {
                this.areAdsEnabled();

                if (typeof google === 'undefined') {
                    return;
                }

                this.googleEnabled = true;

                this.gameContent = (typeof game.parent === 'string') ? document.getElementById(<string>(<any>game).parent) : game.parent;
                // this.gameContent.currentTime = 100;
                this.gameContent.style.position = 'absolute';
                this.gameContent.style.width = '100%';

                this.adContent = this.gameContent.parentNode.appendChild(document.createElement('div'));
                this.adContent.id = 'phaser-ad-container';
                this.adContent.style.position = 'absolute';
                this.adContent.style.zIndex = '9999';
                this.adContent.style.display = 'none';
                this.adContent.style.top = '0';
                this.adContent.style.left = '0';
                this.adContent.style.width = '100%';
                this.adContent.style.height = '100%';
                this.adContent.style.overflow = 'hidden';

                this.adTagUrl = adTagUrl;
                this.game = game;

                // Create the ad display container.
                this.adDisplay = new google.ima.AdDisplayContainer(this.adContent);

                //Set vpaid enabled, and update locale
                (<any>google.ima.settings).setVpaidMode((<any>google.ima).ImaSdkSettings.VpaidMode.ENABLED);
                (<any>google.ima.settings).setLocale('nl');

                // Create ads loader, and register events
                this.adLoader = new google.ima.AdsLoader(this.adDisplay);
                this.adLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this.onAdManagerLoader, false, this);
                this.adLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this.onAdError, false, this);
            }

            public setManager(manager: AdManager): void {
                this.adManager = manager;
            }

            /**
             * Doing an ad request, if anything is wrong with the lib (missing ima3, failed request) we just dispatch the contentResumed event
             * Otherwise we display an ad
             */
            public showAd(customParams?: ICustomParams): void {
                console.log('Ad Requested');
                if (this.adRequested) {
                    return;
                }

                if (!this.adsEnabled) {
                    this.adManager.onAdsDisabled.dispatch(true);
                }

                if (!this.googleEnabled) {
                    this.onContentResumeRequested();
                    return;
                }

                //For mobile this ad request needs to be handled post user click
                this.adDisplay.initialize();

                // Request video ads.
                let adsRequest: GoogleAds.ima.AdsRequest = new google.ima.AdsRequest();
                adsRequest.adTagUrl = this.adTagUrl + this.parseCustomParams(customParams);

                let width: number = window.innerWidth; //parseInt(<string>(!this.game.canvas.style.width ? this.game.canvas.width : this.game.canvas.style.width), 10);
                let height: number = window.innerHeight; //parseInt(<string>(!this.game.canvas.style.height ? this.game.canvas.height : this.game.canvas.style.height), 10);

                //Here we check if phaser is fullscreen or not, if we are fullscreen, we subtract some of the width and height, to counter for the resize (
                //Fullscreen should be disabled for the ad, (onContentPaused) and requested for again when the game resumes
                if (this.game.scale.isFullScreen && document.body.clientHeight < window.innerHeight) {
                    height = document.body.clientHeight;
                    width = document.body.clientWidth;
                }

                // Specify the linear and nonlinear slot sizes. This helps the SDK to
                // select the correct creative if multiple are returned.
                adsRequest.linearAdSlotWidth = width;
                adsRequest.linearAdSlotHeight = height;
                adsRequest.nonLinearAdSlotWidth = width;
                adsRequest.nonLinearAdSlotHeight = height;

                //Required for games, see:
                //http://googleadsdeveloper.blogspot.nl/2015/10/important-changes-for-gaming-publishers.html
                adsRequest.forceNonLinearFullSlot = true;

                try {
                    this.adRequested = true;
                    this.adLoader.requestAds(adsRequest);
                } catch (e) {
                    console.log(e);
                    this.onContentResumeRequested();
                }
            }

            //Does nothing, but needed for Provider interface
            public preloadAd(): void {
                return;
            }

            //Does nothing, but needed for Provider interface
            public destroyAd(): void {
                return;
            }

            //Does nothing, but needed for Provider interface
            public hideAd(): void {
                return;
            }

            /**
             * Called when the ads manager was loaded.
             * We register all ad related events here, and initialize the manager with the game width/height
             *
             * @param adsManagerLoadedEvent
             */
            private onAdManagerLoader(adsManagerLoadedEvent: GoogleAds.ima.AdsManagerLoadedEvent): void {
                console.log('AdsManager loaded');
                // Get the ads manager.
                let adsRenderingSettings: GoogleAds.ima.AdsRenderingSettings = new google.ima.AdsRenderingSettings();
                adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

                // videoContent should be set to the content video element.
                let adsManager: GoogleAds.ima.AdsManager = adsManagerLoadedEvent.getAdsManager(this.gameContent, adsRenderingSettings);
                this.adsManager = adsManager;
                console.log(adsManager.isCustomClickTrackingUsed());

                // Add listeners to the required events.
                adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, this.onContentPauseRequested, false, this);
                adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, this.onContentResumeRequested, false, this);
                adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this.onAdError, false, this);

                [
                    google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
                    google.ima.AdEvent.Type.CLICK,
                    google.ima.AdEvent.Type.COMPLETE,
                    google.ima.AdEvent.Type.FIRST_QUARTILE,
                    google.ima.AdEvent.Type.LOADED,
                    google.ima.AdEvent.Type.MIDPOINT,
                    google.ima.AdEvent.Type.PAUSED,
                    google.ima.AdEvent.Type.STARTED,
                    google.ima.AdEvent.Type.THIRD_QUARTILE
                ].forEach((event: string) => {
                    adsManager.addEventListener(
                        event,
                        this.onAdEvent,
                        false,
                        this);
                });

                try {
                    //Show the ad elements, we only need to show the faux videoelement on iOS, because the ad is displayed in there.
                    this.adContent.style.display = 'block';

                    // Initialize the ads manager. Ad rules playlist will start at this time.
                    let width: number = window.innerWidth; //parseInt(<string>(!this.game.canvas.style.width ? this.game.canvas.width : this.game.canvas.style.width), 10);
                    let height: number = window.innerHeight; //parseInt(<string>(!this.game.canvas.style.height ? this.game.canvas.height : this.game.canvas.style.height), 10);
                    this.adsManager.init(width, height, google.ima.ViewMode.NORMAL);

                    // Call play to start showing the ad. Single video and overlay ads will
                    // start at this time; the call will be ignored for ad rules.
                    this.adsManager.start();

                    this.resizeListener = () => {
                        if (this.adsManager === null) {
                            return;
                        }

                        //Window was resized, so expect something similar
                        console.log('Resizing ad size');
                        this.adsManager.resize(window.innerWidth, window.innerHeight, google.ima.ViewMode.NORMAL);
                    };

                    window.addEventListener('resize', this.resizeListener);
                } catch (adError) {
                    console.log('Adsmanager error:', adError);
                    this.onAdError(adError);
                }
            }

            /**
             * Generic ad events are handled here
             * @param adEvent
             */
            private onAdEvent(adEvent: any): void {
                console.log('onAdEvent', adEvent);

                switch (adEvent.type) {
                    case google.ima.AdEvent.Type.CLICK:
                        this.adManager.onAdClicked.dispatch();
                        break;
                    case google.ima.AdEvent.Type.LOADED:
                        this.adRequested = false;
                        let ad: any = adEvent.getAd();
                        console.log('is ad linear?', ad.isLinear());
                        if (!ad.isLinear()) {
                            this.onContentResumeRequested();
                        }
                        break;
                    case google.ima.AdEvent.Type.STARTED:
                        this.adManager.onAdProgression.dispatch(AdEvent.start);
                        break;
                    case google.ima.AdEvent.Type.FIRST_QUARTILE:
                        this.adManager.onAdProgression.dispatch(AdEvent.firstQuartile);
                        break;
                    case google.ima.AdEvent.Type.MIDPOINT:
                        this.adManager.onAdProgression.dispatch(AdEvent.midPoint);
                        break;
                    case google.ima.AdEvent.Type.THIRD_QUARTILE:
                        this.adManager.onAdProgression.dispatch(AdEvent.thirdQuartile);
                        break;
                    case google.ima.AdEvent.Type.COMPLETE:
                        this.adManager.onAdProgression.dispatch(AdEvent.complete);
                        break;
                    case google.ima.AdEvent.Type.ALL_ADS_COMPLETED:
                        this.onContentResumeRequested();
                        break;
                }
            }

            private onAdError(error: any): void {
                console.log('gneric ad error', error);
                if (null !== this.adsManager) {
                    this.adsManager.destroy();
                    this.adsManager = null;

                    if (null !== this.resizeListener) {
                        window.removeEventListener('resize', this.resizeListener);
                        this.resizeListener = null;
                    }
                }

                if (this.adRequested) {
                    this.adRequested = false;
                }

                //We silently ignore adLoader errors, it just means there is no ad available
                this.onContentResumeRequested();
            }

            /**
             * When the ad starts playing, and the game should be paused
             */
            private onContentPauseRequested(): void {
                console.log('onContentPauseRequested', arguments);
                this.adManager.onContentPaused.dispatch();
            }

            /**
             * When the ad is finished and the game should be resumed
             */
            private onContentResumeRequested(): void {
                console.log('onContentResumeRequested', arguments);

                if (typeof google === 'undefined') {
                    this.adManager.unMuteAfterAd();
                    this.adManager.onContentResumed.dispatch();
                    return;
                }

                this.adContent.style.display = 'none';
                this.adManager.unMuteAfterAd();
                this.adManager.onContentResumed.dispatch();
            }

            private parseCustomParams(customParams: ICustomParams): string {
                if (undefined !== customParams) {
                    let customDataString: string = '';
                    for (let key in customParams) {
                        if (customParams.hasOwnProperty(key)) {
                            if (customDataString.length > 0) {
                                customDataString += '' +
                                    '&';
                            }
                            let param: any = (Array.isArray(customParams[key])) ? (<any[]>customParams[key]).join(',') : customParams[key];
                            customDataString += key + '=' + param;
                        }
                    }
                    return '&cust_params=' + encodeURIComponent(customDataString);
                }

                return '';
            }

            /**
             * Checks if the ads are enabled (e.g; adblock is enabled or not)
             * @returns {boolean}
             */
            private areAdsEnabled(): void {
                let test: HTMLElement = document.createElement('div');
                test.innerHTML = '&nbsp;';
                test.className = 'adsbox';
                test.style.position = 'absolute';
                test.style.fontSize = '10px';
                document.body.appendChild(test);

                // let adsEnabled: boolean;
                let isEnabled: () => boolean = () => {
                    let enabled: boolean = true;
                    if (test.offsetHeight === 0) {
                        enabled = false;
                    }
                    test.parentNode.removeChild(test);

                    return enabled;
                };

                window.setTimeout(() => {
                    this.adsEnabled = isEnabled();
                }, 100);
            }
        }
    }
}
