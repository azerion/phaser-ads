Phaser Ads
==========
This Phaser plugin that allows you to leverage different ad providers whilst providing the same simple API.
Also allows you to easily integrate mobile ads (via [Cocoon](https://cocoon.io)).

Key features:
 - Ads for your mobile web experience
 - Pluggable ad providers
  - Gamedistribution.com
  - IMA3 SDK
  - Cocoon.io (support for AdMob/HeyZap/MoPub/Chartboost)
  - HeyZap for Cordova
 - Integrates nicely into Phaser
 - Fullscreen ad support

Getting Started
---------------
First you want to get a fresh copy of the plugin. You can get it from [this repo](https://github.com/orange-games/phaser-ads/releases) or from [npm](https://www.npmjs.com/package/@orange-games/phaser-ads).
```
npm install @orange-games/phaser-ads
```

Next up you'd want to add it to your list of js sources you load into your game:
```html
<script src="path/to/phaser-ads.min.js"></script>
```

You could also opt for using the (free) jsdelivr cdn:
```html
<script src="https://cdn.jsdelivr.net/npm/@orange-games/phaser-ads@latest/build/phaser-ads.min.js"></script>
```

After adding the script to the page you can activate it by enabling the plugin:
```javascript
game.add.plugin(PhaserAds.AdManager);
```

Usage
-----
First thing you need to do after loading the plugin is attaching a provider to the adManager. PhaserAds comes pre-compiled with 4 providers for you to choose from:
 - [Gamedistribution.com](http://gamedistribution.com/)
 - [IMA SDK](https://developers.google.com/interactive-media-ads/docs/sdks/html5/)
 - [Cocoon.io](https://cocoon.io)
 - Cordova HeyZap (wrapping your game with Cordova? Want HeyZap ads? Then this is your provider)

### Gamedistribution.com
If you already have an account on Gamedistribution.com you can skip this introduction if not, head on over to [gamedistribution.com](http://www.gamedistribution.com) and sign up for a free account.
Once you're signed up you can check out [this guide](http://gamedistribution.com/api/) for settings up a game. This is important because this will supply you with a GameId and UserId, both of which you need to supply to the plugin.

So when you have your GameId and UserId you can start by registering the provider to the plugin:
```javascript
//let's create a new provider, first argument should be the game, second should be the ad tag URL
var provider = new PhaserAds.AdProvider.GameDistributionAds(
   game,                                        //Your Phaser game instance
   '2d77cfd4b1e5487d998465c29de195b3',          //Your gameId
   'ABD36C6C-E74B-4BA7-BE87-0AB01F98D30D-s1'    //Aaaand your gameId
);
game.ads.setAdProvider(provider);
```

After this it's as easy as calling:
```javascript
game.ads.showAd();
```


### IMA SDK
A provider can use any number of arguments configured in order to make it work, it all depends on the implementation that was made by the developer. For our IMA Provider you can create one like this:
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
You can also send custom parameters by adding them as an object to the showAd function.

F.A.Q.
------
### I Don't see any ads!
This can happen, sometimes the provider does something wrong, but most of the time (and when you are testing locally) your ads get blocked from showing.
That's right, ads don't show when testing locally. The easiest way to avoid this is by testing your game on a server (online).

Another work around would be to adjust your [/etc/hosts](https://www.howtogeek.com/howto/27350/beginner-geek-how-to-edit-your-hosts-file/).


### Why don't you support this ad provider!
The setup allows for a multitude of ad providers to work, but sadly we don't have the time and resources to add all of them.
That beeing sad, this plugin is on github, and you're welcome to shoot in a PR to add a new Provider =).

Disclaimer
----------
We at OrangeGames just love playing and creating awesome games. We aren't affiliated with Phaser.io. We just needed some awesome ads in our awesome HTML5 games. Feel free to use it for enhancing your own awesome games!

Phaser Ads is distributed under the MIT license. All 3rd party libraries and components are distributed under their
respective license terms.
