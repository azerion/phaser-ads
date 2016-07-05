/*!
 * phaser-ads - version 0.7.1 
 * A Phaser plugin for providing nice ads integration in your phaser.io game
 *
 * OrangeGames
 * Build at 05-07-2016
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
            function AdManager(game, pluginManager) {
                _super.call(this, game, pluginManager);
                this.onContentPaused = new Phaser.Signal();
                this.onContentResumed = new Phaser.Signal();
                this.onAdClicked = new Phaser.Signal();
                this.provider = null;
                this.wasMuted = false;
                Object.defineProperty(game, 'ads', {
                    value: this
                });
            }
            /**
             * Here we set an adprovider, any can be given as long as it implements the IProvider interface
             *
             * @param provider
             */
            AdManager.prototype.setAdProvider = function (provider) {
                this.provider = provider;
                this.provider.setManager(this);
            };
            /**
             * Here we request an ad, the arguments passed depend on the provider used!
             * @param args
             */
            AdManager.prototype.requestAd = function () {
                var _this = this;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                if (null === this.provider) {
                    throw new Error('Can not request an ad without an provider, please attach an ad provider!');
                    return;
                }
                //first we check if the sound was already muted before we requested an add
                this.wasMuted = this.game.sound.mute;
                //Let's mute audio for the game, we can resume the audi playback once the add has played
                this.game.sound.mute = true;
                //We add a once listener to when the content should be resumed in order to unmute audio
                this.onContentResumed.addOnce(function () {
                    if (!_this.wasMuted) {
                        //Here we unmute audio, but only if it wasn't muted before requesting an add
                        _this.game.sound.mute = false;
                    }
                });
                this.provider.requestAd.apply(this.provider, args);
            };
            /**
             * Some providers might require you to preload an ad before showing it, that can be done here
             *
             * @param args
             */
            AdManager.prototype.preloadAd = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                if (null === this.provider) {
                    throw new Error('Can not preload an ad without an provider, please attach an ad provider!');
                    return;
                }
                this.provider.preloadAd.apply(this.provider, args);
            };
            /**
             * Some providers require you to destroy an add after it was shown, that can be done here.
             *
             * @param args
             */
            AdManager.prototype.destroyAd = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                if (null === this.provider) {
                    throw new Error('Can not destroy an ad without an provider, please attach an ad provider!');
                    return;
                }
                this.provider.destroyAd.apply(this.provider, args);
            };
            /**
             * Some providers allow you to hide an ad, you might think of an banner ad that is shown in show cases
             *
             * @param args
             */
            AdManager.prototype.hideAd = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                if (null === this.provider) {
                    throw new Error('Can not hide an ad without an provider, please attach an ad provider!');
                    return;
                }
                this.provider.hideAd.apply(this.provider, args);
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
        (function (HeyzapAdTypes) {
            HeyzapAdTypes[HeyzapAdTypes["Interstitial"] = 0] = "Interstitial";
            HeyzapAdTypes[HeyzapAdTypes["Video"] = 1] = "Video";
            HeyzapAdTypes[HeyzapAdTypes["Rewarded"] = 2] = "Rewarded";
            HeyzapAdTypes[HeyzapAdTypes["Banner"] = 3] = "Banner";
        })(AdProvider.HeyzapAdTypes || (AdProvider.HeyzapAdTypes = {}));
        var HeyzapAdTypes = AdProvider.HeyzapAdTypes;
        var CordovaHeyzap = (function () {
            function CordovaHeyzap(game, publisherId) {
                var _this = this;
                this.adsEnabled = false;
                if (game.device.cordova || game.device.crosswalk) {
                    this.adsEnabled = true;
                }
                else {
                    return;
                }
                HeyzapAds.start(publisherId).then(function () {
                    // Native call successful.
                }, function (error) {
                    //Failed to start heyzap, disabling ads
                    _this.adsEnabled = false;
                });
            }
            CordovaHeyzap.prototype.setManager = function (manager) {
                this.adManager = manager;
            };
            CordovaHeyzap.prototype.requestAd = function (adType, bannerAdPositions) {
                var _this = this;
                if (!this.adsEnabled) {
                    this.adManager.onContentResumed.dispatch();
                }
                switch (adType) {
                    case HeyzapAdTypes.Interstitial:
                        //Register event listeners
                        HeyzapAds.InterstitialAd.addEventListener(HeyzapAds.InterstitialAd.Events.HIDE, function () {
                            _this.adManager.onContentResumed.dispatch(HeyzapAds.InterstitialAd.Events.HIDE);
                        });
                        HeyzapAds.InterstitialAd.addEventListener(HeyzapAds.InterstitialAd.Events.SHOW_FAILED, function () {
                            _this.adManager.onContentResumed.dispatch(HeyzapAds.InterstitialAd.Events.SHOW_FAILED);
                        });
                        HeyzapAds.InterstitialAd.addEventListener(HeyzapAds.InterstitialAd.Events.CLICKED, function () {
                            _this.adManager.onAdClicked.dispatch(HeyzapAds.InterstitialAd.Events.CLICKED);
                        });
                        HeyzapAds.InterstitialAd.show().then(function () {
                            // Native call successful.
                            _this.adManager.onContentPaused.dispatch();
                        }, function (error) {
                            //Failed to show insentive ad, continue operations
                            _this.adManager.onContentResumed.dispatch();
                        });
                        break;
                    case HeyzapAdTypes.Video:
                        HeyzapAds.VideoAd.addEventListener(HeyzapAds.VideoAd.Events.HIDE, function () {
                            _this.adManager.onContentResumed.dispatch(HeyzapAds.VideoAd.Events.HIDE);
                        });
                        HeyzapAds.VideoAd.addEventListener(HeyzapAds.VideoAd.Events.SHOW_FAILED, function () {
                            _this.adManager.onContentResumed.dispatch(HeyzapAds.VideoAd.Events.SHOW_FAILED);
                        });
                        HeyzapAds.VideoAd.addEventListener(HeyzapAds.VideoAd.Events.CLICKED, function () {
                            _this.adManager.onAdClicked.dispatch(HeyzapAds.VideoAd.Events.CLICKED);
                        });
                        HeyzapAds.VideoAd.show().then(function () {
                            // Native call successful.
                            _this.adManager.onContentPaused.dispatch();
                        }, function (error) {
                            //Failed to show insentive ad, continue operations
                            _this.adManager.onContentResumed.dispatch();
                        });
                        break;
                    case HeyzapAdTypes.Rewarded:
                        HeyzapAds.IncentivizedAd.addEventListener(HeyzapAds.IncentivizedAd.Events.HIDE, function () {
                            _this.adManager.onContentResumed.dispatch(HeyzapAds.IncentivizedAd.Events.HIDE);
                        });
                        HeyzapAds.IncentivizedAd.addEventListener(HeyzapAds.IncentivizedAd.Events.SHOW_FAILED, function () {
                            _this.adManager.onContentResumed.dispatch(HeyzapAds.IncentivizedAd.Events.SHOW_FAILED);
                        });
                        HeyzapAds.IncentivizedAd.addEventListener(HeyzapAds.IncentivizedAd.Events.CLICKED, function () {
                            _this.adManager.onAdClicked.dispatch(HeyzapAds.IncentivizedAd.Events.CLICKED);
                        });
                        HeyzapAds.IncentivizedAd.show().then(function () {
                            // Native call successful.
                            _this.adManager.onContentPaused.dispatch();
                        }, function (error) {
                            //Failed to show insentive ad, continue operations
                            _this.adManager.onContentResumed.dispatch();
                        });
                        break;
                    case HeyzapAdTypes.Banner:
                        HeyzapAds.BannerAd.show(bannerAdPositions).then(function () {
                            // Native call successful.
                        }, function (error) {
                            // Handle Error
                        });
                        break;
                }
            };
            CordovaHeyzap.prototype.preloadAd = function (adType) {
                if (!this.adsEnabled) {
                    return;
                }
                if (adType === HeyzapAdTypes.Rewarded) {
                    HeyzapAds.IncentivizedAd.fetch().then(function () {
                        // Native call successful.
                    }, function (error) {
                        // Handle Error
                    });
                }
                return;
            };
            CordovaHeyzap.prototype.destroyAd = function (adType) {
                if (!this.adsEnabled) {
                    return;
                }
                if (adType === HeyzapAdTypes.Banner) {
                    HeyzapAds.BannerAd.destroy().then(function () {
                        // Native call successful.
                    }, function (error) {
                        // Handle Error
                    });
                }
                return;
            };
            CordovaHeyzap.prototype.hideAd = function (adType) {
                if (!this.adsEnabled) {
                    return;
                }
                if (adType === HeyzapAdTypes.Banner) {
                    HeyzapAds.BannerAd.hide().then(function () {
                        // Native call successful.
                    }, function (error) {
                        // Handle Error
                    });
                }
                return;
            };
            return CordovaHeyzap;
        })();
        AdProvider.CordovaHeyzap = CordovaHeyzap;
    })(AdProvider = Fabrique.AdProvider || (Fabrique.AdProvider = {}));
})(Fabrique || (Fabrique = {}));
var AdManager = Fabrique.Plugins.AdManager;
var Fabrique;
(function (Fabrique) {
    var AdProvider;
    (function (AdProvider) {
        var Ima3 = (function () {
            function Ima3(game, adTagUrl) {
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
                this.gameContent = (typeof game.parent === 'string') ? document.getElementById(game.parent) : game.parent;
                // this.gameContent.currentTime = 100;
                this.gameContent.style.position = 'absolute';
                this.gameContent.style.width = '100%';
                this.gameContent.style.height = '100%';
                this.adContent = this.gameContent.parentNode.appendChild(document.createElement('div'));
                this.adContent.id = 'phaser-ad-container';
                this.adContent.style.position = 'absolute';
                this.adContent.style.zIndex = '9999';
                this.adContent.style.display = 'none';
                //This is a work around for some ios failing issues
                //iOS ima3 requires this information, but canvas doesn't provide it. so we create a a custom method
                this.fauxVideoElement = this.gameContent.parentNode.appendChild(document.createElement('video'));
                this.fauxVideoElement.id = 'phaser-ad-faux-video';
                this.fauxVideoElement.style.position = 'absolute';
                this.fauxVideoElement.style.zIndex = '999';
                this.fauxVideoElement.style.display = 'none';
                this.adTagUrl = adTagUrl;
                this.game = game;
                // Create the ad display container.
                this.adDisplay = new google.ima.AdDisplayContainer(this.adContent, this.fauxVideoElement);
                //Set vpaid enabled, and update locale
                google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);
                google.ima.settings.setLocale('nl');
                // Create ads loader, and register events
                this.adLoader = new google.ima.AdsLoader(this.adDisplay);
                this.adLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this.onAdManagerLoader, false, this);
                this.adLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this.onAdError, false, this);
            }
            Ima3.prototype.setManager = function (manager) {
                this.adManager = manager;
            };
            /**
             * Doing an ad request, if anything is wrong with the lib (missing ima3, failed request) we just dispatch the contentResumed event
             * Otherwise we display an ad
             */
            Ima3.prototype.requestAd = function (customParams) {
                console.log('Ad Requested');
                if (this.adRequested) {
                    return;
                }
                if (!this.googleEnabled) {
                    this.onContentResumeRequested();
                    return;
                }
                //For mobile this ad request needs to be handled post user click
                this.adDisplay.initialize();
                // Request video ads.
                var adsRequest = new google.ima.AdsRequest();
                adsRequest.adTagUrl = this.adTagUrl + this.parseCustomParams(customParams);
                var width = window.innerWidth; //parseInt(<string>(!this.game.canvas.style.width ? this.game.canvas.width : this.game.canvas.style.width), 10);
                var height = window.innerHeight; //parseInt(<string>(!this.game.canvas.style.height ? this.game.canvas.height : this.game.canvas.style.height), 10);
                // Specify the linear and nonlinear slot sizes. This helps the SDK to
                // select the correct creative if multiple are returned.
                adsRequest.linearAdSlotWidth = width;
                adsRequest.linearAdSlotHeight = height;
                adsRequest.nonLinearAdSlotWidth = width;
                adsRequest.nonLinearAdSlotHeight = height;
                if (this.game.device.iOS) {
                    this.fauxVideoElement.style.width = width + 'px';
                    this.fauxVideoElement.style.height = height + 'px';
                }
                //Required for games, see:
                //http://googleadsdeveloper.blogspot.nl/2015/10/important-changes-for-gaming-publishers.html
                adsRequest.forceNonLinearFullSlot = true;
                try {
                    if (this.game.device.iOS) {
                        //We need to play the video element on click, otherwise iOS won't work :(
                        this.fauxVideoElement.play();
                    }
                    this.adRequested = true;
                    this.adLoader.requestAds(adsRequest);
                }
                catch (e) {
                    console.log(e);
                    this.onContentResumeRequested();
                }
            };
            //Does nothing, but needed for Provider interface
            Ima3.prototype.preloadAd = function () {
                return;
            };
            //Does nothing, but needed for Provider interface
            Ima3.prototype.destroyAd = function () {
                return;
            };
            //Does nothing, but needed for Provider interface
            Ima3.prototype.hideAd = function () {
                return;
            };
            /**
             * Called when the ads manager was loaded.
             * We register all ad related events here, and initialize the manager with the game width/height
             *
             * @param adsManagerLoadedEvent
             */
            Ima3.prototype.onAdManagerLoader = function (adsManagerLoadedEvent) {
                var _this = this;
                console.log('AdsManager loaded');
                // Get the ads manager.
                var adsRenderingSettings = new google.ima.AdsRenderingSettings();
                adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
                // videoContent should be set to the content video element.
                var adsManager = adsManagerLoadedEvent.getAdsManager(this.gameContent, adsRenderingSettings);
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
                ].forEach(function (event) {
                    adsManager.addEventListener(event, _this.onAdEvent, false, _this);
                });
                try {
                    //Show the ad elements, we only need to show the faux videoelement on iOS, because the ad is displayed in there.
                    if (this.game.device.iOS) {
                        this.fauxVideoElement.style.display = 'block';
                    }
                    this.adContent.style.display = 'block';
                    // Initialize the ads manager. Ad rules playlist will start at this time.
                    var width = window.innerWidth; //parseInt(<string>(!this.game.canvas.style.width ? this.game.canvas.width : this.game.canvas.style.width), 10);
                    var height = window.innerHeight; //parseInt(<string>(!this.game.canvas.style.height ? this.game.canvas.height : this.game.canvas.style.height), 10);
                    this.adsManager.init(width, height, google.ima.ViewMode.NORMAL);
                    // Call play to start showing the ad. Single video and overlay ads will
                    // start at this time; the call will be ignored for ad rules.
                    this.adsManager.start();
                }
                catch (adError) {
                    console.log('Adsmanager error:', adError);
                    this.onAdError(adError);
                }
            };
            /**
             * Generic ad events are handled here
             * @param adEvent
             */
            Ima3.prototype.onAdEvent = function (adEvent) {
                var _this = this;
                console.log('onAdEvent', adEvent);
                this.adsManager.resize(window.innerWidth, window.innerHeight, google.ima.ViewMode.NORMAL);
                if (adEvent.type == google.ima.AdEvent.Type.CLICK) {
                    this.adManager.onAdClicked.dispatch();
                }
                else if (adEvent.type == google.ima.AdEvent.Type.LOADED) {
                    this.adRequested = false;
                    var ad = adEvent.getAd();
                    console.log('is ad linear?', ad.isLinear());
                    if (!ad.isLinear()) {
                        this.onContentResumeRequested();
                    }
                    //Work around for skip/end not registering @ ios
                    if (this.game.device.iOS) {
                        var intervalId = setInterval(function () {
                            if (_this.fauxVideoElement.src.length > 0) {
                                _this.onContentResumeRequested();
                                clearInterval(intervalId);
                            }
                        }, 200);
                    }
                }
                else if (adEvent.type === google.ima.AdEvent.Type.ALL_ADS_COMPLETED) {
                    this.onContentResumeRequested();
                }
            };
            Ima3.prototype.onAdError = function (error) {
                console.log('gneric ad error', error);
                if (null !== this.adsManager) {
                    this.adsManager.destroy();
                    this.adsManager = null;
                }
                if (this.adRequested) {
                    this.adRequested = false;
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
                if (typeof google === "undefined") {
                    this.adManager.onContentResumed.dispatch();
                    return;
                }
                this.adContent.style.display = 'none';
                if (this.game.device.iOS) {
                    this.fauxVideoElement.style.display = 'none';
                }
                this.adManager.onContentResumed.dispatch();
            };
            Ima3.prototype.parseCustomParams = function (customParams) {
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
                    return '&cust_params=' + encodeURIComponent(customDataString);
                }
                return '';
            };
            return Ima3;
        })();
        AdProvider.Ima3 = Ima3;
    })(AdProvider = Fabrique.AdProvider || (Fabrique.AdProvider = {}));
})(Fabrique || (Fabrique = {}));
//# sourceMappingURL=phaser-ads.js.map