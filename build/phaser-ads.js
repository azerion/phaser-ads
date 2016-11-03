/*!
 * phaser-ads - version 1.0.0 
 * A Phaser plugin for providing nice ads integration in your phaser.io game
 *
 * OrangeGames
 * Build at 03-11-2016
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
        (function (AdEvent) {
            AdEvent[AdEvent["start"] = 0] = "start";
            AdEvent[AdEvent["firstQuartile"] = 1] = "firstQuartile";
            AdEvent[AdEvent["midPoint"] = 2] = "midPoint";
            AdEvent[AdEvent["thirdQuartile"] = 3] = "thirdQuartile";
            AdEvent[AdEvent["complete"] = 4] = "complete";
        })(Plugins.AdEvent || (Plugins.AdEvent = {}));
        var AdEvent = Plugins.AdEvent;
        var AdManager = (function (_super) {
            __extends(AdManager, _super);
            function AdManager(game, pluginManager) {
                _super.call(this, game, pluginManager);
                this.onContentPaused = new Phaser.Signal();
                this.onContentResumed = new Phaser.Signal();
                this.onAdProgression = new Phaser.Signal();
                this.onAdsDisabled = new Phaser.Signal();
                this.onAdClicked = new Phaser.Signal();
                this.onAdRewardGranted = new Phaser.Signal();
                this.provider = null;
                this.wasMuted = false;
                Object.defineProperty(game, 'ads', {
                    value: this
                });
            }
            AdManager.prototype.setAdProvider = function (provider) {
                var _this = this;
                this.provider = provider;
                this.provider.setManager(this);
                this.onContentResumed.add(function () {
                    if (!_this.wasMuted) {
                        _this.game.sound.mute = false;
                    }
                });
            };
            AdManager.prototype.showAd = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                if (null === this.provider) {
                    throw new Error('Can not request an ad without an provider, please attach an ad provider!');
                }
                if (args[0] && args[0] !== Fabrique.AdProvider.CocoonAdType.banner) {
                    this.wasMuted = this.game.sound.mute;
                    this.game.sound.mute = true;
                }
                this.provider.showAd.apply(this.provider, args);
            };
            AdManager.prototype.preloadAd = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                if (null === this.provider) {
                    throw new Error('Can not preload an ad without an provider, please attach an ad provider!');
                }
                this.provider.preloadAd.apply(this.provider, args);
            };
            AdManager.prototype.destroyAd = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                if (null === this.provider) {
                    throw new Error('Can not destroy an ad without an provider, please attach an ad provider!');
                }
                this.provider.destroyAd.apply(this.provider, args);
            };
            AdManager.prototype.hideAd = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                if (null === this.provider) {
                    throw new Error('Can not hide an ad without an provider, please attach an ad provider!');
                }
                if (!this.wasMuted) {
                    this.game.sound.mute = false;
                }
                this.provider.hideAd.apply(this.provider, args);
            };
            AdManager.prototype.adsEnabled = function () {
                return this.provider.adsEnabled;
            };
            return AdManager;
        }(Phaser.Plugin));
        Plugins.AdManager = AdManager;
    })(Plugins = Fabrique.Plugins || (Fabrique.Plugins = {}));
})(Fabrique || (Fabrique = {}));
var Fabrique;
(function (Fabrique) {
    var AdProvider;
    (function (AdProvider) {
        (function (CocoonProvider) {
            CocoonProvider[CocoonProvider["AdMob"] = 0] = "AdMob";
            CocoonProvider[CocoonProvider["MoPub"] = 1] = "MoPub";
            CocoonProvider[CocoonProvider["Chartboost"] = 2] = "Chartboost";
            CocoonProvider[CocoonProvider["Heyzap"] = 3] = "Heyzap";
        })(AdProvider.CocoonProvider || (AdProvider.CocoonProvider = {}));
        var CocoonProvider = AdProvider.CocoonProvider;
        (function (CocoonAdType) {
            CocoonAdType[CocoonAdType["banner"] = 0] = "banner";
            CocoonAdType[CocoonAdType["interstitial"] = 1] = "interstitial";
            CocoonAdType[CocoonAdType["insentive"] = 2] = "insentive";
        })(AdProvider.CocoonAdType || (AdProvider.CocoonAdType = {}));
        var CocoonAdType = AdProvider.CocoonAdType;
        var CocoonAds = (function () {
            function CocoonAds(game, provider, config) {
                this.adsEnabled = false;
                this.banner = null;
                this.bannerShowable = false;
                this.interstitial = null;
                this.interstitialShowable = false;
                this.insentive = null;
                this.insentiveShowable = false;
                if ((game.device.cordova || game.device.crosswalk) && (Cocoon && Cocoon.Ad)) {
                    this.adsEnabled = true;
                }
                else {
                    return;
                }
                switch (provider) {
                    default:
                    case CocoonProvider.AdMob:
                        this.cocoonProvider = Cocoon.Ad.AdMob;
                        break;
                    case CocoonProvider.Chartboost:
                        this.cocoonProvider = Cocoon.Ad.Chartboost;
                        break;
                    case CocoonProvider.Heyzap:
                        this.cocoonProvider = Cocoon.Ad.Heyzap;
                        break;
                    case CocoonProvider.MoPub:
                        this.cocoonProvider = Cocoon.Ad.MoPub;
                        break;
                }
                this.cocoonProvider.configure(config);
            }
            CocoonAds.prototype.setManager = function (manager) {
                this.adManager = manager;
            };
            CocoonAds.prototype.showAd = function (adType) {
                if (!this.adsEnabled) {
                    this.adManager.onContentResumed.dispatch();
                    return;
                }
                if (adType === CocoonAdType.banner) {
                    if (!this.bannerShowable || null === this.banner) {
                        this.adManager.onContentResumed.dispatch(CocoonAdType.banner);
                        return;
                    }
                    this.banner.show();
                }
                if (adType === CocoonAdType.interstitial) {
                    if (!this.interstitialShowable || null === this.interstitial) {
                        this.adManager.onContentResumed.dispatch(CocoonAdType.interstitial);
                        return;
                    }
                    this.interstitial.show();
                }
                if (adType === CocoonAdType.insentive) {
                    if (!this.interstitialShowable || null === this.insentive) {
                        this.adManager.onContentResumed.dispatch(CocoonAdType.insentive);
                        return;
                    }
                    this.insentive.show();
                }
            };
            CocoonAds.prototype.preloadAd = function (adType, adId, bannerPosition) {
                var _this = this;
                if (!this.adsEnabled) {
                    return;
                }
                this.destroyAd(adType);
                if (adType === CocoonAdType.banner) {
                    this.banner = this.cocoonProvider.createBanner(adId);
                    if (bannerPosition) {
                        this.banner.setLayout(bannerPosition);
                    }
                    this.banner.on('load', function () {
                        _this.bannerShowable = true;
                    });
                    this.banner.on('fail', function () {
                        _this.bannerShowable = false;
                        _this.banner = null;
                    });
                    this.banner.on('click', function () {
                        _this.adManager.onAdClicked.dispatch(CocoonAdType.banner);
                    });
                    this.banner.on('show', function () {
                    });
                    this.banner.on('dismiss', function () {
                    });
                    this.banner.load();
                }
                if (adType === CocoonAdType.interstitial) {
                    this.interstitial = this.cocoonProvider.createInterstitial(adId);
                    this.interstitial.on('load', function () {
                        _this.interstitialShowable = true;
                    });
                    this.interstitial.on('fail', function () {
                        _this.interstitialShowable = false;
                        _this.interstitial = null;
                    });
                    this.interstitial.on('click', function () {
                        _this.adManager.onAdClicked.dispatch(CocoonAdType.interstitial);
                    });
                    this.interstitial.on('show', function () {
                        _this.adManager.onContentPaused.dispatch(CocoonAdType.interstitial);
                    });
                    this.interstitial.on('dismiss', function () {
                        _this.adManager.onContentResumed.dispatch(CocoonAdType.interstitial);
                        _this.interstitialShowable = false;
                        _this.interstitial = null;
                    });
                    this.interstitial.load();
                }
                if (adType === CocoonAdType.insentive) {
                    this.insentive = this.cocoonProvider.createRewardedVideo(adId);
                    this.insentive.on('load', function () {
                        _this.insentiveShowable = true;
                    });
                    this.interstitial.on('fail', function () {
                        _this.insentiveShowable = false;
                        _this.insentive = null;
                    });
                    this.insentive.on('click', function () {
                        _this.adManager.onAdClicked.dispatch(CocoonAdType.insentive);
                    });
                    this.insentive.on('show', function () {
                        _this.adManager.onContentPaused.dispatch(CocoonAdType.insentive);
                    });
                    this.insentive.on('dismiss', function () {
                        _this.adManager.onContentResumed.dispatch(CocoonAdType.insentive);
                        _this.interstitialShowable = false;
                        _this.insentive = null;
                    });
                    this.insentive.on('reward', function () {
                        _this.adManager.onAdRewardGranted.dispatch(CocoonAdType.insentive);
                        _this.interstitialShowable = false;
                        _this.insentive = null;
                    });
                    this.insentive.load();
                }
            };
            CocoonAds.prototype.destroyAd = function (adType) {
                if (!this.adsEnabled) {
                    return;
                }
                if (adType === CocoonAdType.banner && null !== this.banner) {
                    this.cocoonProvider.releaseBanner(this.banner);
                    this.banner = null;
                    this.bannerShowable = false;
                }
                if (adType === CocoonAdType.interstitial && null !== this.interstitial) {
                    this.cocoonProvider.releaseInterstitial(this.interstitial);
                    this.interstitial = null;
                    this.interstitialShowable = false;
                }
            };
            CocoonAds.prototype.hideAd = function (adType) {
                if (!this.adsEnabled) {
                    return;
                }
                if (adType === CocoonAdType.interstitial && null !== this.interstitial) {
                    this.interstitial.hide();
                }
                if (adType === CocoonAdType.banner && null !== this.banner) {
                    this.banner.hide();
                }
                if (adType === CocoonAdType.insentive && null !== this.insentive) {
                    this.insentive.hide();
                }
            };
            return CocoonAds;
        }());
        AdProvider.CocoonAds = CocoonAds;
    })(AdProvider = Fabrique.AdProvider || (Fabrique.AdProvider = {}));
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
                }, function (error) {
                    _this.adsEnabled = false;
                });
            }
            CordovaHeyzap.prototype.setManager = function (manager) {
                this.adManager = manager;
            };
            CordovaHeyzap.prototype.showAd = function (adType, bannerAdPositions) {
                var _this = this;
                if (!this.adsEnabled) {
                    this.adManager.onContentResumed.dispatch();
                }
                switch (adType) {
                    case HeyzapAdTypes.Interstitial:
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
                            _this.adManager.onContentPaused.dispatch();
                        }, function (error) {
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
                            _this.adManager.onContentPaused.dispatch();
                        }, function (error) {
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
                            _this.adManager.onContentPaused.dispatch();
                        }, function (error) {
                            _this.adManager.onContentResumed.dispatch();
                        });
                        break;
                    case HeyzapAdTypes.Banner:
                        HeyzapAds.BannerAd.show(bannerAdPositions).then(function () {
                        }, function (error) {
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
                    }, function (error) {
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
                    }, function (error) {
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
                    }, function (error) {
                    });
                }
                return;
            };
            return CordovaHeyzap;
        }());
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
                this.adsEnabled = true;
                this.adTagUrl = '';
                this.adRequested = false;
                this.adManager = null;
                this.resizeListener = null;
                this.adsEnabled = this.areAdsEnabled();
                if (typeof google === "undefined") {
                    return;
                }
                this.googleEnabled = true;
                this.gameContent = (typeof game.parent === 'string') ? document.getElementById(game.parent) : game.parent;
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
                this.adDisplay = new google.ima.AdDisplayContainer(this.adContent);
                google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);
                google.ima.settings.setLocale('nl');
                this.adLoader = new google.ima.AdsLoader(this.adDisplay);
                this.adLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this.onAdManagerLoader, false, this);
                this.adLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this.onAdError, false, this);
            }
            Ima3.prototype.setManager = function (manager) {
                this.adManager = manager;
            };
            Ima3.prototype.showAd = function (customParams) {
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
                this.adDisplay.initialize();
                var adsRequest = new google.ima.AdsRequest();
                adsRequest.adTagUrl = this.adTagUrl + this.parseCustomParams(customParams);
                var width = window.innerWidth;
                var height = window.innerHeight;
                if (this.game.scale.isFullScreen && document.body.clientHeight < window.innerHeight) {
                    height = document.body.clientHeight;
                    width = document.body.clientWidth;
                }
                adsRequest.linearAdSlotWidth = width;
                adsRequest.linearAdSlotHeight = height;
                adsRequest.nonLinearAdSlotWidth = width;
                adsRequest.nonLinearAdSlotHeight = height;
                adsRequest.forceNonLinearFullSlot = true;
                try {
                    this.adRequested = true;
                    this.adLoader.requestAds(adsRequest);
                }
                catch (e) {
                    console.log(e);
                    this.onContentResumeRequested();
                }
            };
            Ima3.prototype.preloadAd = function () {
                return;
            };
            Ima3.prototype.destroyAd = function () {
                return;
            };
            Ima3.prototype.hideAd = function () {
                return;
            };
            Ima3.prototype.onAdManagerLoader = function (adsManagerLoadedEvent) {
                var _this = this;
                console.log('AdsManager loaded');
                var adsRenderingSettings = new google.ima.AdsRenderingSettings();
                adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
                var adsManager = adsManagerLoadedEvent.getAdsManager(this.gameContent, adsRenderingSettings);
                this.adsManager = adsManager;
                console.log(adsManager.isCustomClickTrackingUsed());
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
                    this.adContent.style.display = 'block';
                    var width = window.innerWidth;
                    var height = window.innerHeight;
                    this.adsManager.init(width, height, google.ima.ViewMode.NORMAL);
                    this.adsManager.start();
                    this.resizeListener = function () {
                        console.log('Resizing ad size');
                        _this.adsManager.resize(window.innerWidth, window.innerHeight, google.ima.ViewMode.NORMAL);
                    };
                    window.addEventListener('resize', this.resizeListener);
                }
                catch (adError) {
                    console.log('Adsmanager error:', adError);
                    this.onAdError(adError);
                }
            };
            Ima3.prototype.onAdEvent = function (adEvent) {
                console.log('onAdEvent', adEvent);
                switch (adEvent.type) {
                    case google.ima.AdEvent.Type.CLICK:
                        this.adManager.onAdClicked.dispatch();
                        break;
                    case google.ima.AdEvent.Type.LOADED:
                        this.adRequested = false;
                        var ad = adEvent.getAd();
                        console.log('is ad linear?', ad.isLinear());
                        if (!ad.isLinear()) {
                            this.onContentResumeRequested();
                        }
                        break;
                    case google.ima.AdEvent.Type.STARTED:
                        this.adManager.onAdProgression.dispatch(Fabrique.Plugins.AdEvent.start);
                        break;
                    case google.ima.AdEvent.Type.FIRST_QUARTILE:
                        this.adManager.onAdProgression.dispatch(Fabrique.Plugins.AdEvent.firstQuartile);
                        break;
                    case google.ima.AdEvent.Type.MIDPOINT:
                        this.adManager.onAdProgression.dispatch(Fabrique.Plugins.AdEvent.midPoint);
                        break;
                    case google.ima.AdEvent.Type.THIRD_QUARTILE:
                        this.adManager.onAdProgression.dispatch(Fabrique.Plugins.AdEvent.thirdQuartile);
                        break;
                    case google.ima.AdEvent.Type.COMPLETE:
                        this.adManager.onAdProgression.dispatch(Fabrique.Plugins.AdEvent.complete);
                        break;
                    case google.ima.AdEvent.Type.ALL_ADS_COMPLETED:
                        this.onContentResumeRequested();
                        break;
                }
            };
            Ima3.prototype.onAdError = function (error) {
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
                this.onContentResumeRequested();
            };
            Ima3.prototype.onContentPauseRequested = function () {
                console.log('onContentPauseRequested', arguments);
                this.adManager.onContentPaused.dispatch();
            };
            Ima3.prototype.onContentResumeRequested = function () {
                console.log('onContentResumeRequested', arguments);
                if (typeof google === "undefined") {
                    this.adManager.onContentResumed.dispatch();
                    return;
                }
                this.adContent.style.display = 'none';
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
            Ima3.prototype.areAdsEnabled = function () {
                var test = document.createElement('div');
                test.innerHTML = '&nbsp;';
                test.className = 'adsbox';
                document.body.appendChild(test);
                var adsEnabled;
                var isEnabled = function () {
                    var enabled = true;
                    if (test.offsetHeight === 0) {
                        enabled = false;
                    }
                    test.parentNode.removeChild(test);
                    return enabled;
                };
                window.setTimeout(adsEnabled = isEnabled(), 100);
                return adsEnabled;
            };
            return Ima3;
        }());
        AdProvider.Ima3 = Ima3;
    })(AdProvider = Fabrique.AdProvider || (Fabrique.AdProvider = {}));
})(Fabrique || (Fabrique = {}));
//# sourceMappingURL=phaser-ads.js.map