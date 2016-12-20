Phaser Ads
==========
A Phaser plugin for providing nice ads integration in your Phaser.io game through the IMA3 SDK.

Key features:
 - Ads for your mobile web experience
 - Pluggable ad providers
  - IMA3 SDK
  - Cocoon.io (support for AdMob/HeyZap/MoPub/Chartboost)
  - HeyZap for Cordova
 - Integrates nicely into Phaser
 - Fullscreen ad support

Getting Started
---------------
First you want to get a fresh copy of the plugin. You can get it from this repo or from npm, ain't that handy.
```
npm install @orange-games/phaser-ads --save-dev
```

Next up you'd want to add it to your list of js sources you load into your game:
```html
<script src="path/to/phaser-ads.min.js"></script>
```

After adding the script to the page you can activate it by enabling the plugin:
```javascript
game.add.plugin(PhaserAds.AdManager);
```

Usage
-----
First thing you need to do after loading the plugin is attaching a provider to the adManager. By default we supply 2 providers for you to choose from:
 - IMA 3  (use this for (mobile) web)
 - Cocoon.io ()
 - Cordova HeyZap (wrapping your game with Cordova? Want HeyZap ads? Then this is your provider)

We'll continue this part of the readme asuming you're going to implement IMA3.

A provider can use any number of arguments configured in order to make it work, it all depends on the implementation that was made by the developer. For our IMA3 Provider you can create one like this:
```javascript
//let's create a new provider, first argument should be the game, second should be the ad tag URL
var provider = new PhaserAds.AdProvider.Ima3(
   game,
   'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&correlator'
);
game.ads.setAdProvider(provider);
```

Now all you need to do is request an ad, and add an event listener that is called when the ad is completed/skipped/finished/done playing.
```javascript
game.ads.onContentResumed.addOnce(function() {
    // This gets called when the ad is complete
    game.state.start('NextState');
});

//Here we request the ad
game.ads.showAd();
```

Credits
-------
The IMA3 provider is based on the code provided by Google for their [IMA3 SDK](https://github.com/googleads/googleads-ima-html5/releases).

Disclaimer
----------
We at OrangeGames just love playing and creating awesome games. We aren't affiliated with Phaser.io. We just needed some awesome ads in our awesome HTML5 games. Feel free to use it for enhancing your own awesome games!

Phaser Ads is distributed under the MIT license. All 3rd party libraries and components are distributed under their
respective license terms.
