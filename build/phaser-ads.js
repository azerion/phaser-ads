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
                this.onContentPaused = new Phaser.Signal();
                this.onContentResumed = new Phaser.Signal();
                this.onAdClicked = new Phaser.Signal();
                this.provider = null;
                Object.defineProperty(game, 'ads', {
                    value: this
                });
            }
            AdManager.prototype.setAdProvider = function (provider) {
                this.provider = provider;
                this.provider.setManager(this);
            };
            AdManager.prototype.requestAd = function () {
                if (null === this.provider) {
                    return;
                }
                this.provider.requestAd();
            };
            AdManager.prototype.enableMobileAds = function () {
                if (null === this.provider) {
                    return;
                }
                this.provider.initializeAd();
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
                this.adsManager = null;
                this.googleEnabled = false;
                this.canPlayAds = false;
                this.adTagUrl = '';
                this.adRequested = false;
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
                this.adDisplay = new google.ima.AdDisplayContainer(this.adContent, this.gameContent);
                //Set vpaid enabled, and update locale
                google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);
                google.ima.settings.setLocale('nl');
                // Create ads loader, and register events
                this.adLoader = new google.ima.AdsLoader(this.adDisplay);
                this.adLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this.onAdManagerLoader, false, this);
                this.adLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, function (e) {
                    console.log('No ad available', e);
                }, false);
            }
            AdSense.prototype.setManager = function (manager) {
                this.adManager = manager;
            };
            AdSense.prototype.requestAd = function () {
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
                }
                catch (e) {
                    this.adManager.onContentResumed.dispatch();
                }
            };
            AdSense.prototype.initializeAd = function () {
                // Initialize the container. Must be done via a user action on mobile devices.
                this.adDisplay.initialize();
            };
            AdSense.prototype.onAdManagerLoader = function (adsManagerLoadedEvent) {
                var _this = this;
                // Get the ads manager.
                var adsRenderingSettings = new google.ima.AdsRenderingSettings();
                adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
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
                try {
                    this.adContent.style.display = 'block';
                    // Initialize the ads manager. Ad rules playlist will start at this time.
                    this.adsManager.init(parseInt(this.game.canvas.style.width, 10), parseInt(this.game.canvas.style.height, 10), google.ima.ViewMode.NORMAL);
                    // Call play to start showing the ad. Single video and overlay ads will
                    // start at this time; the call will be ignored for ad rules.
                    this.adsManager.start();
                }
                catch (adError) {
                    this.onAdError();
                }
            };
            AdSense.prototype.onAdEvent = function (adEvent) {
                console.log('onAdEvent', arguments);
                if (adEvent.type == google.ima.AdEvent.Type.CLICK) {
                    this.adManager.onAdClicked.dispatch();
                }
                else if (adEvent.type == google.ima.AdEvent.Type.LOADED) {
                    var ad = adEvent.getAd();
                    if (!ad.isLinear()) {
                        this.onContentResumeRequested();
                    }
                }
            };
            AdSense.prototype.onAdError = function () {
                if (null !== this.adsManager) {
                    this.adsManager.destroy();
                    this.adsManager = null;
                }
                //We silently ignore adLoader errors, it just means there is no ad available
                this.onContentResumeRequested();
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
                this.adManager.onContentResumed.dispatch();
            };
            return AdSense;
        })();
        AdProvider.AdSense = AdSense;
    })(AdProvider = Fabrique.AdProvider || (Fabrique.AdProvider = {}));
})(Fabrique || (Fabrique = {}));
var AdManager = Fabrique.Plugins.AdManager;
//# sourceMappingURL=phaser-ads.js.map