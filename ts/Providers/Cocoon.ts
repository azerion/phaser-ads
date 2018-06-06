import {IProvider} from './IProvider';
import PhaserAds from '../index';

export enum CocoonProvider {
    AdMob,
    MoPub,
    Chartboost,
    Heyzap
}

export enum CocoonAdType {
    banner,
    interstitial,
    insentive
}

export default class CocoonAds implements IProvider {
    public adManager: PhaserAds;

    public adsEnabled: boolean = false;

    private cocoonProvider: Cocoon.Ad.IAdProvider;

    private banner: Cocoon.Ad.IBanner = null;

    private bannerShowable: boolean = false;

    private interstitial: Cocoon.Ad.IBanner = null;

    private interstitialShowable: boolean = false;

    private insentive: Cocoon.Ad.IBanner = null;

    private insentiveShowable: boolean = false;

    constructor(game: Phaser.Game, provider: CocoonProvider, config?: any) {
        if ((game.device.os.cordova || game.device.os.crosswalk) && (Cocoon && Cocoon.Ad)) {
            this.adsEnabled = true;
        } else {
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

    public setManager(manager: PhaserAds): void {
        this.adManager = manager;
    }

    public showAd(adType: CocoonAdType): void {
        if (!this.adsEnabled) {
            this.adManager.unMuteAfterAd();
            if (!(adType === CocoonAdType.banner)) {
                this.adManager.emit(PhaserAds.CONTENT_RESUMED);
            }
            return;
        }

        if (adType === CocoonAdType.banner) {
            if (!this.bannerShowable || null === this.banner) {
                this.adManager.unMuteAfterAd();
                //No banner ad available, skipping
                //this.adManager.onContentResumed.dispatch(CocoonAdType.banner);
                return;
            }
            this.adManager.emit(PhaserAds.BANNER_SHOWN, this.banner.width, this.banner.height);

            this.adManager.bannerActive = true;
            this.banner.show();
        }

        if (adType === CocoonAdType.interstitial) {
            if (!this.interstitialShowable || null === this.interstitial) {
                this.adManager.unMuteAfterAd();
                //No banner ad available, skipping
                this.adManager.emit(PhaserAds.CONTENT_RESUMED, CocoonAdType.interstitial);
                return;
            }

            this.interstitial.show();
        }

        if (adType === CocoonAdType.insentive) {
            if (!this.insentiveShowable || null === this.insentive) {
                this.adManager.unMuteAfterAd();
                //No banner ad available, skipping
                this.adManager.emit(PhaserAds.CONTENT_RESUMED, CocoonAdType.insentive);

                return;
            }

            this.insentive.show();
        }
    }

    public preloadAd(adType: CocoonAdType, adId?: string, bannerPosition?: string): void {
        if (!this.adsEnabled) {
            return;
        }

        //Some cleanup before preloading a new ad
        this.destroyAd(adType);

        if (adType === CocoonAdType.banner) {
            this.banner = this.cocoonProvider.createBanner(adId);
            if (bannerPosition) {
                this.banner.setLayout(bannerPosition);
            }
            this.banner.on('load', () => {
                this.bannerShowable = true;
            });
            this.banner.on('fail', () => {
                this.bannerShowable = false;
                this.banner = null;
            });
            this.banner.on('click', () => {
                   this.adManager.emit(PhaserAds.AD_CLICKED, CocoonAdType.banner);

            });

            //Banner don't pause or resume content
            this.banner.on('show', () => {
                /*this.adManager.onBannerShown.dispatch(this.banner.width, this.banner.height);
                 this.adManager.bannerActive = true;*/
                // this.adManager.onContentPaused.dispatch(CocoonAdType.banner);
            });

            this.banner.on('dismiss', () => {
                /*this.adManager.bannerActive = false;
                 this.adManager.onBannerHidden.dispatch(this.banner.width, this.banner.height);*/
                // this.adManager.onContentResumed.dispatch(CocoonAdType.banner);
                // this.bannerShowable = false;
                // this.banner = null;
            });
            this.banner.load();
        }

        if (adType === CocoonAdType.interstitial) {
            this.interstitial = this.cocoonProvider.createInterstitial(adId);
            this.interstitial.on('load', () => {
                this.interstitialShowable = true;
            });
            this.interstitial.on('fail', () => {
                this.interstitialShowable = false;
                this.interstitial = null;
            });
            this.interstitial.on('click', () => {
                this.adManager.emit(PhaserAds.AD_CLICKED, CocoonAdType.interstitial);
            });

            this.interstitial.on('show', () => {
                this.adManager.emit(PhaserAds.CONTENT_PAUSED, CocoonAdType.interstitial);
            });

            this.interstitial.on('dismiss', () => {
                this.adManager.unMuteAfterAd();
                this.adManager.emit(PhaserAds.CONTENT_RESUMED, CocoonAdType.interstitial);

                this.interstitialShowable = false;
                this.interstitial = null;
            });
            this.interstitial.load();
        }

        if (adType === CocoonAdType.insentive) {
            this.insentive = this.cocoonProvider.createRewardedVideo(adId);
            this.insentive.on('load', () => {
                this.insentiveShowable = true;
            });
            this.insentive.on('fail', () => {
                this.insentiveShowable = false;
                this.insentive = null;
            });
            this.insentive.on('click', () => {
                this.adManager.emit(PhaserAds.AD_CLICKED, CocoonAdType.insentive);

            });

            this.insentive.on('show', () => {
                this.adManager.emit(PhaserAds.CONTENT_PAUSED, CocoonAdType.insentive);

            });

            this.insentive.on('dismiss', () => {
                this.adManager.unMuteAfterAd();
                this.adManager.emit(PhaserAds.CONTENT_RESUMED, CocoonAdType.insentive);
                this.insentiveShowable = false;
                this.insentive = null;
            });

            this.insentive.on('reward', () => {
                this.adManager.unMuteAfterAd();
                this.adManager.emit(PhaserAds.AD_REWARDED, CocoonAdType.insentive);
                this.insentiveShowable = false;
                this.insentive = null;
            });
            this.insentive.load();
        }
    }

    public destroyAd(adType: CocoonAdType): void {
        if (!this.adsEnabled) {
            return;
        }

        if (adType === CocoonAdType.banner && null !== this.banner) {
            //Releasing banners will fail on cocoon due to:
            // https://github.com/ludei/atomic-plugins-ads/pull/12
            try {
                this.cocoonProvider.releaseBanner(this.banner);
            } catch (e) {
                //silently ignore
            }
            this.banner = null;
            this.bannerShowable = false;
        }

        if (adType === CocoonAdType.interstitial && null !== this.interstitial) {
            this.cocoonProvider.releaseInterstitial(this.interstitial);
            this.interstitial = null;
            this.interstitialShowable = false;
        }
    }

    public hideAd(adType: CocoonAdType): void {
        if (!this.adsEnabled) {
            return;
        }

        if (adType === CocoonAdType.interstitial && null !== this.interstitial) {
            this.interstitial.hide();

            // this.adManager.onContentResumed.dispatch(CocoonAdType.interstitial);
        }

        if (adType === CocoonAdType.banner && null !== this.banner) {
            if (this.adManager.bannerActive) {
                this.adManager.bannerActive = false;
                this.adManager.emit(PhaserAds.BANNER_HIDDEN, this.banner.width, this.banner.height);

            }
            this.banner.hide();

            // this.adManager.onContentResumed.dispatch(CocoonAdType.banner);
        }

        if (adType === CocoonAdType.insentive && null !== this.insentive) {
            this.insentive.hide();

            // this.adManager.onContentResumed.dispatch(CocoonAdType.insentive);
        }
    }
}
