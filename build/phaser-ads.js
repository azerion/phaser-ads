/*!
 * phaser-ads - version 0.1.0-alpha3 
 * A Phaser plugin for providing nice ads integration in your phaser.io game
 *
 * OrangeGames
 * Build at 17-05-2016
 * Released under MIT License 
 */

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Fabrique;
(function (Fabrique) {
    var Plugins;
    (function (Plugins) {
        var AdManager = (function (_super) {
            __extends(AdManager, _super);
            function AdManager(game, parent) {
                _super.call(this, game, parent);
                this.onAdStarted = new Phaser.Signal();
                this.onAdFinished = new Phaser.Signal();
                this.onContentPaused = new Phaser.Signal();
                this.onContentResumed = new Phaser.Signal();
                this.onAdClicked = new Phaser.Signal();
                this.onAdError = new Phaser.Signal();
                this.onAdReady = new Phaser.Signal();
                this.provider = null;
                Object.defineProperty(game, 'ads', {
                    value: this
                });
            }
            AdManager.prototype.setAdProvider = function (provider) {
                this.provider = provider;
                this.provider.setManager(this);
            };
            AdManager.prototype.showAd = function () {
                if (null === this.provider) {
                    return;
                }
                this.provider.playAd();
            };
            AdManager.prototype.hideAd = function () {
                if (null === this.provider) {
                    return;
                }
            };
            return AdManager;
        })(Phaser.Plugin);
        Plugins.AdManager = AdManager;
    })(Plugins = Fabrique.Plugins || (Fabrique.Plugins = {}));
})(Fabrique || (Fabrique = {}));
var Fabrique;
(function (Fabrique) {
    var AdProvider;
    (function (AdProvider) {
        var AdSense = (function () {
            function AdSense(game, gameContentId, adContentId, adTagUrl, customParams) {
                this.googleEnabled = false;
                this.canPlayAds = false;
                this.adTagUrl = '';
                this.adManager = null;
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
                    var customDataString = '';
                    for (var key in customParams) {
                        if (customDataString.length > 0) {
                            customDataString += '' +
                                '&';
                        }
                        var param = (Array.isArray(customParams[key])) ? customParams[key].join(',') : customParams[key];
                        customDataString += key + '=' + param;
                    }
                    this.adTagUrl += '&cust_params=' + encodeURIComponent(customDataString);
                }
                // Create the ad display container.
                this.createAdDisplayContainer();
                google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);
                //set language
                google.ima.settings.setLocale('nl');
            }
            AdSense.prototype.playAd = function () {
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
                }
                catch (adError) {
                    this.adContent.style.display = 'none';
                    // An error may be thrown if there was a problem with the VAST response.
                    console.log('ad error!!!!', adError);
                    this.adManager.onAdError.dispatch(adError);
                }
            };
            AdSense.prototype.setManager = function (manager) {
                var _this = this;
                this.adManager = manager;
                if (!this.googleEnabled) {
                    this.adManager.onAdReady.dispatch();
                    return;
                }
                // Create ads loader.
                this.adLoader = new google.ima.AdsLoader(this.adDisplay);
                // Listen and respond to ads loaded and error events.
                this.adLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, function (adsManagerLoadedEvent) { return _this.onAdManagerLoader(adsManagerLoadedEvent); }, false);
                this.adLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, function (e) {
                    console.log('No ad available', e);
                    //We silently ignore adLoader errors, it just means there is no ad available
                    _this.adManager.onAdReady.dispatch();
                }, false);
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
                }
                catch (e) {
                    this.adManager.onAdReady.dispatch();
                }
            };
            AdSense.prototype.createAdDisplayContainer = function () {
                this.adDisplay = new google.ima.AdDisplayContainer(this.adContent, this.gameContent);
            };
            AdSense.prototype.onAdManagerLoader = function (adsManagerLoadedEvent) {
                var _this = this;
                // Get the ads manager.
                var adsRenderingSettings = new google.ima.AdsRenderingSettings();
                adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
                this.canPlayAds = true;
                // videoContent should be set to the content video element.
                this.adsManager = adsManagerLoadedEvent.getAdsManager(this.gameContent, adsRenderingSettings);
                // Add listeners to the required events.
                this.adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, function (error) { return _this.onAdError.call(_this, error); });
                this.adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, this.onContentPauseRequested.bind(this));
                this.adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, this.onContentResumeRequested.bind(this));
                this.adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, this.onAdEvent.bind(this));
                // Listen to any additional events, if necessary.
                this.adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, this.onAdEvent.bind(this));
                this.adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, this.onAdEvent.bind(this));
                this.adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, this.onAdEvent.bind(this));
                this.adManager.onAdReady.dispatch();
            };
            AdSense.prototype.onAdEvent = function () {
                console.log('onAdEvent', arguments);
                this.adManager.onContentResumed.dispatch();
            };
            /**
             * When the ad starts playing, and the game should be paused
             */
            AdSense.prototype.onContentPauseRequested = function () {
                console.log('onContentPauseRequested', arguments);
                this.adManager.onContentPaused.dispatch();
            };
            /**
             * When the ad is finished and the game should be resumed
             */
            AdSense.prototype.onContentResumeRequested = function () {
                console.log('onContentResumeRequested', arguments);
                this.adContent.style.display = 'none';
                this.adManager.onAdFinished.dispatch();
            };
            AdSense.prototype.onAdError = function (error) {
                console.log('error', error.getError());
                this.adManager.onAdError.dispatch(error.getError());
            };
            return AdSense;
        })();
        AdProvider.AdSense = AdSense;
    })(AdProvider = Fabrique.AdProvider || (Fabrique.AdProvider = {}));
})(Fabrique || (Fabrique = {}));
var AdManager = Fabrique.Plugins.AdManager;
//# sourceMappingURL=phaser-ads.js.map