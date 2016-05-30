/*!
 * phaser-ads - version 0.4.0 
 * A Phaser plugin for providing nice ads integration in your phaser.io game
 *
 * OrangeGames
 * Build at 30-05-2016
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
            return AdManager;
        })(Phaser.Plugin);
        Plugins.AdManager = AdManager;
    })(Plugins = Fabrique.Plugins || (Fabrique.Plugins = {}));
})(Fabrique || (Fabrique = {}));
var AdManager = Fabrique.Plugins.AdManager;
var Fabrique;
(function (Fabrique) {
    var AdProvider;
    (function (AdProvider) {
        var Ima3 = (function () {
            function Ima3(game, gameContentId, adTagUrl, customParams) {
                var _this = this;
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
                this.gameContent = document.getElementById(gameContentId);
                // this.gameContent.currentTime = 100;
                this.gameContent.style.position = 'absolute';
                this.adContent = this.gameContent.parentNode.appendChild(document.createElement('div'));
                this.adContent.id = 'phaser-ad-container';
                this.adContent.style.position = 'absolute';
                this.adContent.style.zIndex = '9999';
                this.adContent.style.display = 'none';
                //This is a work around for some ios failing issues
                //iOS ima3 requires this information, but canvas doesn't provide it. so we create a a custom method
                if (game.device.iOS) {
                    this.fauxVideoElement = this.gameContent.parentNode.appendChild(document.createElement('video'));
                    this.fauxVideoElement.id = 'phaser-ad-faux-video';
                    this.fauxVideoElement.style.position = 'absolute';
                    this.fauxVideoElement.style.zIndex = '999';
                    this.fauxVideoElement.style.display = 'none';
                    this.gameContent.canPlayType = function () {
                        return _this.fauxVideoElement.canPlayType('video/mp4');
                    };
                    this.gameContent.load = function () { console.log('loading video'); };
                    this.gameContent.pause = function () { console.log('pausing video'); };
                    this.gameContent.play = function () { console.log('playing video'); };
                }
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
                this.adDisplay = new google.ima.AdDisplayContainer(this.adContent, (game.device.iOS) ? this.fauxVideoElement : this.gameContent);
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
            Ima3.prototype.setManager = function (manager) {
                this.adManager = manager;
            };
            /**
             * Doing an ad request, if anything is wrong with the lib (missing ima3, failed request) we just dispatch the contentResumed event
             * Otherwise we display an ad
             */
            Ima3.prototype.requestAd = function () {
                if (!this.googleEnabled) {
                    this.adManager.onContentResumed.dispatch();
                    return;
                }
                //For mobile this ad request needs to be handled post user click
                this.adDisplay.initialize();
                // Request video ads.
                var adsRequest = new google.ima.AdsRequest();
                adsRequest.adTagUrl = this.adTagUrl;
                var width = parseInt((!this.game.canvas.style.width ? this.game.canvas.width : this.game.canvas.style.width), 10);
                var height = parseInt((!this.game.canvas.style.height ? this.game.canvas.height : this.game.canvas.style.height), 10);
                // Specify the linear and nonlinear slot sizes. This helps the SDK to
                // select the correct creative if multiple are returned.
                adsRequest.linearAdSlotWidth = width;
                adsRequest.linearAdSlotHeight = height;
                adsRequest.nonLinearAdSlotWidth = width;
                adsRequest.nonLinearAdSlotHeight = height / 3;
                if (this.game.device.iOS) {
                    this.fauxVideoElement.style.width = width + 'px';
                    this.fauxVideoElement.style.height = height + 'px';
                }
                //Required for games, see:
                //http://googleadsdeveloper.blogspot.nl/2015/10/important-changes-for-gaming-publishers.html
                adsRequest.forceNonLinearFullSlot = true;
                try {
                    this.adLoader.requestAds(adsRequest);
                }
                catch (e) {
                    console.log(e);
                    this.adManager.onContentResumed.dispatch();
                }
            };
            /**
             * Called when the ads manager was loaded.
             * We register all ad related events here, and initialize the manager with the game width/height
             *
             * @param adsManagerLoadedEvent
             */
            Ima3.prototype.onAdManagerLoader = function (adsManagerLoadedEvent) {
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
                    if (this.game.device.iOS) {
                        this.fauxVideoElement.style.display = 'block';
                    }
                    // Initialize the ads manager. Ad rules playlist will start at this time.
                    var width = parseInt((!this.game.canvas.style.width ? this.game.canvas.width : this.game.canvas.style.width), 10);
                    var height = parseInt((!this.game.canvas.style.height ? this.game.canvas.height : this.game.canvas.style.height), 10);
                    this.adsManager.init(width, height, google.ima.ViewMode.NORMAL);
                    // Call play to start showing the ad. Single video and overlay ads will
                    // start at this time; the call will be ignored for ad rules.
                    this.adsManager.start();
                }
                catch (adError) {
                    this.onAdError();
                }
            };
            /**
             * Generic ad events are handled here
             * @param adEvent
             */
            Ima3.prototype.onAdEvent = function (adEvent) {
                console.log('onAdEvent', arguments);
                if (adEvent.type == google.ima.AdEvent.Type.CLICK) {
                    this.adManager.onAdClicked.dispatch();
                }
                else if (adEvent.type == google.ima.AdEvent.Type.LOADED) {
                    var ad = adEvent.getAd();
                    console.log(ad);
                    if (!ad.isLinear()) {
                        this.onContentResumeRequested();
                    }
                }
                else if (adEvent.type === google.ima.AdEvent.Type.ALL_ADS_COMPLETED) {
                    this.onContentResumeRequested();
                }
            };
            Ima3.prototype.onAdError = function () {
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
            Ima3.prototype.onContentPauseRequested = function () {
                console.log('onContentPauseRequested', arguments);
                this.adManager.onContentPaused.dispatch();
            };
            /**
             * When the ad is finished and the game should be resumed
             */
            Ima3.prototype.onContentResumeRequested = function () {
                console.log('onContentResumeRequested', arguments);
                this.adContent.style.display = 'none';
                if (this.game.device.iOS) {
                    this.fauxVideoElement.style.display = 'none';
                }
                this.adManager.onContentResumed.dispatch();
            };
            return Ima3;
        })();
        AdProvider.Ima3 = Ima3;
    })(AdProvider = Fabrique.AdProvider || (Fabrique.AdProvider = {}));
})(Fabrique || (Fabrique = {}));
//# sourceMappingURL=phaser-ads.js.map