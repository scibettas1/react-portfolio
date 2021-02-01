(function(define){if(typeof define==="function"&&define.amd){define=undefined;}(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

/*
 * Module dependencies.
 */

var analytics = require('@segment/analytics.js-core');
var each = require('@ndhoule/each');

/*
 * Exports.
 */

module.exports = function(Integrations) {
  each(function(Integration) {
    analytics.use(Integration);
  }, Integrations);

  return analytics;
};

},{"@ndhoule/each":32,"@segment/analytics.js-core":76}],2:[function(require,module,exports){
(function (global){
'use strict';

var send = require('@segment/send-json');

// Use double quotes to handle the case where writeKey maybe be an empty string.
// This shouldn't happen in production, but is how our tests are written
// (which don't assume the Segment integration always exists).
// Using single quotes in this case renders incorrectly as`var writeKey = ;`.
/*eslint-disable */
var loadedWriteKey = "i49svebw12";
/* eslint-enable */

module.exports = function() {
  if (loadedWriteKey) {
    // We're seeing cases where the snippet loaded is not the same the same as the
    // one requested due to a caching bug in Chrome 55.0.2883.59. So we verify that
    // the write key being loaded is the same as the write key being requested. We
    // do this by checking all script tags.

    // Some customers are loading a.js twice. So we look for two markers.
    // First we check if any script match our regex.
    // If we don't find any scripts that match our regex, we continue as normal.
    // If we do find scripts that match our regex, we check if these scripts
    // contain our writeKey.
    var regexFound = false;
    var writeKeyFound = false;

    var regex = /.*\/analytics\.js\/v1\/([^/]*)(\/platform)?\/analytics.*/;
    var scripts = global.document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src;
      var result = regex.exec(src);

      // Check if the script src matches our regex.
      if (!result) {
        continue;
      }

      regexFound = true;

      // If the script does match our regex, check which writeKey was requested.
      var requestedKey = result[1];
      if (requestedKey === loadedWriteKey) {
        writeKeyFound = true;
        break;
      }
    }

    // Only track an event if we found at least one script matching our regex,
    // but none of those matching scripts contained our writeKey.
    if (regexFound && !writeKeyFound) {
      // Record an event if the writeKey does not match.
      var url = 'https://api.segment.io/v1/t';
      var headers = { 'Content-Type': 'text/plain' };
      var msg = {
        userId: 'segment',
        event: 'Invalid WriteKey Loaded',
        properties: {
          hostname: global.window.location.hostname,
          href: global.window.location.href,
          loadedKey: loadedWriteKey,
          requestedKey: requestedKey,
          userAgent: global.navigator.userAgent,
          bailed: true
        },
        // https://segment.com/segment-engineering/sources/bot_detection
        writeKey: 'fkTyC7tQ4NxYVrfdUOVENwWgoJe8hXKA'
      };
      send(url, msg, headers, function() {});
      return true;
    }
  }
  return false;
};

}).call(this,typeof window !== "undefined" && window.document && window.document.implementation ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {})
},{"@segment/send-json":1217}],3:[function(require,module,exports){
(function (global){
'use strict';

var detectBot = require('./bot');

if (detectBot()) {
  return;
}

/*
 * Module dependencies.
 */

var Integrations = require('./integrations');
var analytics = require('./analytics')(Integrations);
var extend = require('extend');


// Get a handle on the global analytics queue and middleware queue, as initialized by the
// analytics.js snippet. The snippet stubs out the analytics.js API and queues
// up calls for execution when the full analytics.js library (this file) loads.
var analyticsq = global.analytics || [];

// Later we'll want middlewareq to be initialized from a global var.
var sourceMiddlewareq = [];
var integrationMiddlewareq = [];

// Parse the version from the analytics.js snippet.
var snippetVersion = analyticsq && analyticsq.SNIPPET_VERSION ? parseFloat(analyticsq.SNIPPET_VERSION, 10) : 0;

// Include as much version information as possible so we know exactly what we're running.
// Looks like: {
//   "core": "3.0.0",
//   "cdn": "1.15.3",
//   "integrations": {
//     "Segment.io": "3.1.1",
//     ...
//   }
// }
analytics._VERSIONS = {"core":"4.0.4","cdn":"ajs-renderer 2.9.1 (analytics.js-private ce545ce73ea0bdb58cb206a6d7e6af11c5e4c824)","integrations":{"Facebook Pixel":"2.11.3","FullStory":"2.2.3","LinkedIn Insight Tag":"1.0.0","Hotjar":"1.3.1","Google AdWords New":"1.2.0","Visual Tagger":"0.3.4","Optimizely":"3.5.0","Bing Ads":"2.0.0","Google Tag Manager":"2.5.0","Segment.io":"4.3.0"}};

analytics.plugins = {};
extend(analytics.plugins, require('@segment/analytics.js-video-plugins/dist'));

// Initialize analytics.js. CDN will render configuration objects using project settings.
var settings = {"Facebook Pixel":{"automaticConfiguration":true,"blacklistPiiProperties":[],"contentTypes":{},"initWithExistingTraits":true,"keyForExternalId":"anonymousId","legacyEvents":{"submit registration form":"6015599164850","Submit Personal Loan Registration Form":"6027532404850","Viewed Rate Check Results Page":"6022650473450","apply for loan":"6015599169050","loan approved":"6015661151450","loan rejected":"6015661165250"},"limitedDataUse":true,"pixelId":"1444497665818954","standardEvents":{"Cosigner Application Submitted":"SubmitApplication","Primary Application Submitted":"SubmitApplication","Application Started":"Lead","Primary Eligibility Submitted":"CompleteRegistration","Cosigner Eligibility Submitted":"CompleteRegistration"},"standardEventsCustomProperties":[],"userIdAsExternalId":true,"valueIdentifier":"price","whitelistPiiProperties":[]},"FullStory":{"debug":false,"org":"4FCB6"},"LinkedIn Insight Tag":{"partnerId":"86403"},"Hotjar":{"hjPlaceholderPolyfill":true,"hjid":"1020730"},"Google AdWords New":{"accountId":"AW-970736269","clickConversions":[{"event":"Rate Check Started","id":"DS_QCIGp4pMBEI2F8c4D","accountId":""},{"event":"Received Rate Check Results","id":"OoshCOWe-pMBEI2F8c4D","accountId":""},{"event":"Review Student Loan Offer","id":"hDM4COLchpQBEI2F8c4D","accountId":""},{"event":"loan agreement signed","id":"7PRtCPK1jJQBEI2F8c4D","accountId":""},{"event":"apply for loan","id":"qk7PCNizjJQBEI2F8c4D","accountId":""},{"event":"Email Subscribed on WordPress","id":"xleMCPKNspYBEI2F8c4D","accountId":""},{"event":"Primary Eligibility Submitted","id":"m9HjCPzx85cBEI2F8c4D","accountId":""},{"event":"Invitation submitted","id":"rvVPCLnktZgBEI2F8c4D","accountId":""},{"event":"Application Submitted","id":"LU67CLqFv5gBEI2F8c4D","accountId":""},{"event":"Loan agreement signed","id":"SULECL2Fv5gBEI2F8c4D","accountId":""},{"event":"Primary Eligibility Started","id":"hTmjCOSbv5gBEI2F8c4D","accountId":""},{"event":"Viewed Cost of Attendance Page","id":"2mdqCJS-uZgBEI2F8c4D","accountId":""},{"event":"Application Started","id":"tsYECLj-9JoBEI2F8c4D","accountId":""},{"event":"Primary Eligibility Submitted","id":"m9HjCPzx85cBEI2","accountId":""},{"event":"Cosigner Eligibility Viewed","id":"sN70CP2tgdIBEI2F8c4D","accountId":""},{"event":"Cosigner Eligibility Submitted","id":"gQU3CJzZ4dUBEI2F8c4D","accountId":""},{"event":"Cosigner Application Submitted","id":"eKwHCPf-4dUBEI2F8c4D","accountId":""},{"event":"Primary Eligibility Viewed","id":"nfW6CPC0xNUBEI2F8c4D","accountId":""},{"event":"Click Sign Agreement CTA","id":"giOVCInM5NUBEI2F8c4D","accountId":""},{"event":"Primary Application Submitted","id":"w4R9COaRvtYBEI2F8c4D","accountId":""},{"event":"Primary Eligibility Submitted","id":"Y6h4CKzArdcBEI2F8c4D","accountId":""}],"conversionLinker":true,"defaultPageConversion":"","disableAdPersonalization":false,"pageLoadConversions":[],"sendPageView":true},"Visual Tagger":{"instrumentationSpec":[{"selector":".v2-hero__headings > .v2-hero__buttons > .v2-hero__cta","url":"https://www.earnest.com/personal-loans","handler":"click","event":"Test PL Landing Page Loaded","taggingMethod":"event","formAction":"track","state":"published","bindings":[],"urlRules":[{"ruleType":"is","pattern":"https://www.earnest.com/personal-loans","id":"is:https://www.earnest.com/personal-loans"}],"actions":[{"type":"track","event":"Test PL Landing Page Loaded","bindings":[],"id":"c9de25e7-f84c-4580-8254-bba3e3d0fd0d"}],"createdAt":"1586392389154","lastModified":"1586392486979","id":"259dd9aa-38d2-41de-8f43-15719b8afd27"},{"selector":".v2-hero__headings > .v2-hero__buttons > .v2-hero__cta--secondary","url":"https://www.earnest.com/student-loans","handler":"click","event":"Test Landing Page Ready to Apply","taggingMethod":"event","formAction":"track","state":"published","bindings":[],"urlRules":[{"ruleType":"is","pattern":"https://www.earnest.com/student-loans","id":"c1e95a5a-c1ae-47da-9670-2e0a393ea7bd"}],"actions":[{"type":"track","event":"Test Landing Page Ready to Apply","bindings":[],"id":"c119e6c4-59ba-4d16-bffb-57a4c7296d18"}],"createdAt":"1586458467903","lastModified":"1586458496456","id":"bca632c6-62a8-4071-9884-ec62adcc8e4c"}],"sourceId":"kv7oekrc1q","workspaceId":"f6njg89nhv"},"Optimizely":{"listen":true,"nonInteraction":true,"sendRevenueOnlyForOrderCompleted":false,"trackCategorizedPages":false,"trackNamedPages":true,"variations":true},"Bing Ads":{"tagId":"4056032"},"Google Tag Manager":{"containerId":"GTM-TQSKLXZ","environment":"","trackAllPages":false,"trackCategorizedPages":true,"trackNamedPages":true},"Segment.io":{"apiKey":"i49svebw12","unbundledIntegrations":["Google Analytics","Amplitude"],"addBundledMetadata":true,"bundledConfigIds":["3ELeUNlYmF","4JRHPh02Ba","59c01a189585320001572354","59e7c10d829291000154b510","5SoMZPHnwM","5ba500cf4d482c0001864cee","5c4b9a0d5cfa740001286357","5d8cfffeeced9d1ec837e6b7","5e28d2cc3a80dbe6a3fed46b","5e3b63c13fe075140400900e","5e7279b8d4300e1c5f1f89a2","5e8e6d299f80f918ed5acc76","5f2dae110dfe4b5f354a71be","7018444696","7cnVqtgQl9","XZyuyxTuzc","ak5xri1fi8kus","bsary6j2cvpol","ed7kVYiP4Z","efon0y31ltqwm","jaOAaQFRhm","nj3qcBozwd","svtm3sbg97ege","t44j32te86sin","uf10m018o10ji","xchrmjhe8yaj9","ylXg3Xnejd","zbAABaYWOM"],"unbundledConfigIds":["97kxekvq6teik","gjP06i1RT7"],"retryQueue":true}};
var integrations; // Default to undefined to minimise the impact of code changes

if (analyticsq._loadOptions && analyticsq._loadOptions.integrations) {
  var integrationOptions = analyticsq._loadOptions.integrations;
  integrations = {};
  var integrationName;

  for (integrationName in integrationOptions) {
    if (!integrationOptions.hasOwnProperty(integrationName)) continue;

    // Get the enabled/disabled status for the integrations that are configured
    // (config objects get converted to true)
    integrations[integrationName] = Boolean(integrationOptions[integrationName]);

    // Merge the DCS and load options
    if (
      // Make sure the integration exists
      typeof settings[integrationName] === 'object'
      // Ignore booleans
      && typeof integrationOptions[integrationName] === 'object'
    ) {
      // true means recursive=true
      extend(true, settings[integrationName], integrationOptions[integrationName]);
    }
  }
}

var middlewares = require('./middlewares');

// Add Segment middlewares last, if any.
middlewares.source.forEach(function(middleware) {
  sourceMiddlewareq.push(middleware);
});
middlewares.integration.forEach(function(middleware) {
  integrationMiddlewareq.push(middleware);
});

// Add any user-supplied middlewares to the middleware handler.
var sourceMiddleware;
while (sourceMiddlewareq && sourceMiddlewareq.length > 0) {
  sourceMiddleware = sourceMiddlewareq.shift();
  if (typeof sourceMiddleware === 'function') {
    analytics.addSourceMiddleware(sourceMiddleware);
  }
}
var integrationMiddleware;
while (integrationMiddlewareq && integrationMiddlewareq.length > 0) {
  integrationMiddleware = integrationMiddlewareq.shift();
  if (typeof integrationMiddleware === 'function') {
    analytics.addIntegrationMiddleware(integrationMiddleware);
  }
}

var flushBeforeInit= ['setAnonymousId'];

// Go through the queued calls and execute them 
// if they should be flushed before initialization
var args;
var method;
for (var queueI = 0; queueI < analyticsq.length; queueI++) {
  args = analyticsq[queueI];
  method = args.length && args[0];
  if (
    typeof analytics[method] === 'function'
    && flushBeforeInit.indexOf(method) !== -1
  ) {
    args.shift();
    analytics[method].apply(analytics, args);
    analyticsq.splice(queueI, 1);
  }
}

analytics.initialize(settings, {
  initialPageview: snippetVersion === 0,
  plan: {"track":{"__default":{"enabled":true,"integrations":{}}},"identify":{"__default":{"enabled":true}},"group":{"__default":{"enabled":true}}},
  integrations: integrations,
  metrics: {"sampleRate":0.1},
  user: {},
  group: {},
  middlewareSettings: {}
});

// Make any queued calls up before the full analytics.js library
// loaded
while (analyticsq && analyticsq.length > 0) {
  args = analyticsq.shift();
  method = args.shift();

  if (typeof analytics[method] === 'function') {
    analytics[method].apply(analytics, args);
  }
}

// Free the reference to analyticsq
analyticsq = null;

/*
 * Exports.
 */

// Set `global.analytics` explicitly rather than using Browserify's
// `--standalone` flag in order to avoid hooking into an already-declared
// `global.require`
global.analytics = analytics;

}).call(this,typeof window !== "undefined" && window.document && window.document.implementation ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {})
},{"./analytics":1,"./bot":2,"./integrations":4,"./middlewares":5,"@segment/analytics.js-video-plugins/dist":1191,"extend":1304}],4:[function(require,module,exports){
/* eslint quote-props: 0 */
'use strict';

module.exports = {
  '@asayerio/analytics.js-integration-asayer': require('@asayerio/analytics.js-integration-asayer'),
  '@auryc/analytics.js-integration-auryc': require('@auryc/analytics.js-integration-auryc'),
  '@convertflow/analytics.js-integration-convertflow': require('@convertflow/analytics.js-integration-convertflow'),
  '@owneriq/analytics.js-integration-owneriq-pixel': require('@owneriq/analytics.js-integration-owneriq-pixel'),
  '@profitwell/analytics.js-integration': require('@profitwell/analytics.js-integration'),
  'adlearn-open-platform': require('@segment/analytics.js-integration-adlearn-open-platform'),
  'adobe-analytics': require('@segment/analytics.js-integration-adobe-analytics'),
  'adobe-target': require('@segment/analytics.js-integration-adobe-target'),
  'adometry': require('@segment/analytics.js-integration-adometry'),
  'adroll': require('@segment/analytics.js-integration-adroll'),
  'adwords': require('@segment/analytics.js-integration-adwords'),
  'alexa': require('@segment/analytics.js-integration-alexa'),
  'ambassador': require('@segment/analytics.js-integration-ambassador'),
  'amplitude': require('@segment/analytics.js-integration-amplitude'),
  'appboy': require('@segment/analytics.js-integration-appboy'),
  'appboy-ibm': require('@segment/analytics.js-integration-appboy-ibm'),
  'appcues': require('@segment/analytics.js-integration-appcues'),
  'appnexus': require('@segment/analytics.js-integration-appnexus'),
  'aptrinsic': require('@segment/analytics.js-integration-aptrinsic'),
  'atatus': require('@segment/analytics.js-integration-atatus'),
  'autosend': require('@segment/analytics.js-integration-autosend'),
  'awesm': require('@segment/analytics.js-integration-awesm'),
  'bing-ads': require('@segment/analytics.js-integration-bing-ads'),
  'blueshift': require('@segment/analytics.js-integration-blueshift'),
  'boomtrain': require('@segment/analytics.js-integration-boomtrain'),
  'bronto': require('@segment/analytics.js-integration-bronto'),
  'bugherd': require('@segment/analytics.js-integration-bugherd'),
  'bugsnag': require('@segment/analytics.js-integration-bugsnag'),
  'castle': require('@segment/analytics.js-integration-castle'),
  'chameleon': require('@segment/analytics.js-integration-chameleon'),
  'chartbeat': require('@segment/analytics.js-integration-chartbeat'),
  'clevertap': require('@segment/analytics.js-integration-clevertap'),
  'clicky': require('@segment/analytics.js-integration-clicky'),
  'comscore': require('@segment/analytics.js-integration-comscore'),
  'convertro': require('@segment/analytics.js-integration-convertro'),
  'crazy-egg': require('@segment/analytics.js-integration-crazy-egg'),
  'criteo': require('@segment/analytics.js-integration-criteo'),
  'curebit': require('@segment/analytics.js-integration-curebit'),
  'customerio': require('@segment/analytics.js-integration-customerio'),
  'cxense': require('@segment/analytics.js-integration-cxense'),
  'doubleclick-floodlight': require('@segment/analytics.js-integration-doubleclick-floodlight'),
  'drift': require('@segment/analytics.js-integration-drift'),
  'drip': require('@segment/analytics.js-integration-drip'),
  'elevio': require('@segment/analytics.js-integration-elevio'),
  'eloqua': require('@segment/analytics.js-integration-eloqua'),
  'email-aptitude': require('@segment/analytics.js-integration-email-aptitude'),
  'errorception': require('@segment/analytics.js-integration-errorception'),
  'evergage': require('@segment/analytics.js-integration-evergage'),
  'extole': require('@segment/analytics.js-integration-extole'),
  'facebook-conversion-tracking': require('@segment/analytics.js-integration-facebook-conversion-tracking'),
  'facebook-pixel': require('@segment/analytics.js-integration-facebook-pixel'),
  'foxmetrics': require('@segment/analytics.js-integration-foxmetrics'),
  'friendbuy': require('@segment/analytics.js-integration-friendbuy'),
  'fullstory': require('@segment/analytics.js-integration-fullstory'),
  'gauges': require('@segment/analytics.js-integration-gauges'),
  'get-satisfaction': require('@segment/analytics.js-integration-get-satisfaction'),
  'google-adwords-new': require('@segment/analytics.js-integration-google-adwords-new'),
  'google-analytics': require('@segment/analytics.js-integration-google-analytics'),
  'google-tag-manager': require('@segment/analytics.js-integration-google-tag-manager'),
  'gosquared': require('@segment/analytics.js-integration-gosquared'),
  'gtag': require('@segment/analytics.js-integration-gtag'),
  'heap': require('@segment/analytics.js-integration-heap'),
  'hellobar': require('@segment/analytics.js-integration-hellobar'),
  'hindsight': require('@segment/analytics.js-integration-hindsight'),
  'hittail': require('@segment/analytics.js-integration-hittail'),
  'hotjar': require('@segment/analytics.js-integration-hotjar'),
  'hubspot': require('@segment/analytics.js-integration-hubspot'),
  'improvely': require('@segment/analytics.js-integration-improvely'),
  'inspectlet': require('@segment/analytics.js-integration-inspectlet'),
  'intercom': require('@segment/analytics.js-integration-intercom'),
  'keen-io': require('@segment/analytics.js-integration-keen-io'),
  'kenshoo': require('@segment/analytics.js-integration-kenshoo'),
  'kenshoo-infinity': require('@segment/analytics.js-integration-kenshoo-infinity'),
  'kissmetrics': require('@segment/analytics.js-integration-kissmetrics'),
  'klaviyo': require('@segment/analytics.js-integration-klaviyo'),
  'linkedin-insight-tag': require('@segment/analytics.js-integration-linkedin-insight-tag'),
  'livechat': require('@segment/analytics.js-integration-livechat'),
  'localytics': require('@segment/analytics.js-integration-localytics'),
  'lucky-orange': require('@segment/analytics.js-integration-lucky-orange'),
  'lytics': require('@segment/analytics.js-integration-lytics'),
  'madkudu': require('@segment/analytics.js-integration-madkudu'),
  'marketo': require('@segment/analytics.js-integration-marketo'),
  'marketo-v2': require('@segment/analytics.js-integration-marketo-v2'),
  'mediamath': require('@segment/analytics.js-integration-mediamath'),
  'mixpanel': require('@segment/analytics.js-integration-mixpanel'),
  'moengage': require('@segment/analytics.js-integration-moengage'),
  'mojn': require('@segment/analytics.js-integration-mojn'),
  'monetate': require('@segment/analytics.js-integration-monetate'),
  'mouseflow': require('@segment/analytics.js-integration-mouseflow'),
  'mousestats': require('@segment/analytics.js-integration-mousestats'),
  'nanigans': require('@segment/analytics.js-integration-nanigans'),
  'navilytics': require('@segment/analytics.js-integration-navilytics'),
  'nielsen-dcr': require('@segment/analytics.js-integration-nielsen-dcr'),
  'nielsen-dtvr': require('@segment/analytics.js-integration-nielsen-dtvr'),
  'nudgespot': require('@segment/analytics.js-integration-nudgespot'),
  'olark': require('@segment/analytics.js-integration-olark'),
  'omniture': require('@segment/analytics.js-integration-omniture'),
  'onespot': require('@segment/analytics.js-integration-onespot'),
  'optimizely': require('@segment/analytics.js-integration-optimizely'),
  'outbound': require('@segment/analytics.js-integration-outbound'),
  'pardot': require('@segment/analytics.js-integration-pardot'),
  'parsely': require('@segment/analytics.js-integration-parsely'),
  'pendo': require('@segment/analytics.js-integration-pendo'),
  'perfect-audience': require('@segment/analytics.js-integration-perfect-audience'),
  'perimeterx': require('@segment/analytics.js-integration-perimeterx'),
  'personas': require('@segment/analytics.js-integration-personas'),
  'pingdom': require('@segment/analytics.js-integration-pingdom'),
  'pinterest-tag': require('@segment/analytics.js-integration-pinterest-tag'),
  'piwik': require('@segment/analytics.js-integration-piwik'),
  'qualaroo': require('@segment/analytics.js-integration-qualaroo'),
  'quantcast': require('@segment/analytics.js-integration-quantcast'),
  'quanticmind': require('@segment/analytics.js-integration-quanticmind'),
  'quora-conversion-pixel': require('@segment/analytics.js-integration-quora-conversion-pixel'),
  'ramen': require('@segment/analytics.js-integration-ramen'),
  'rockerbox': require('@segment/analytics.js-integration-rockerbox'),
  'rocket-fuel': require('@segment/analytics.js-integration-rocket-fuel'),
  'rollbar': require('@segment/analytics.js-integration-rollbar'),
  'route': require('@segment/analytics.js-integration-route'),
  'saasquatch': require('@segment/analytics.js-integration-saasquatch'),
  'salesforce-dmp': require('@segment/analytics.js-integration-salesforce-dmp'),
  'salesforce-live-agent': require('@segment/analytics.js-integration-salesforce-live-agent'),
  'satismeter': require('@segment/analytics.js-integration-satismeter'),
  'segmentio': require('@segment/analytics.js-integration-segmentio'),
  'sentry': require('@segment/analytics.js-integration-sentry'),
  'shareasale': require('@segment/analytics.js-integration-shareasale'),
  'simplereach': require('@segment/analytics.js-integration-simplereach'),
  'simplifi': require('@segment/analytics.js-integration-simplifi'),
  'snapengage': require('@segment/analytics.js-integration-snapengage'),
  'spinnakr': require('@segment/analytics.js-integration-spinnakr'),
  'steelhouse': require('@segment/analytics.js-integration-steelhouse'),
  'stripe-radar': require('@segment/analytics.js-integration-stripe-radar'),
  'supporthero': require('@segment/analytics.js-integration-supporthero'),
  'tag-injector': require('@segment/analytics.js-integration-tag-injector'),
  'taplytics': require('@segment/analytics.js-integration-taplytics'),
  'tapstream': require('@segment/analytics.js-integration-tapstream'),
  'tell-apart': require('@segment/analytics.js-integration-tell-apart'),
  'totango': require('@segment/analytics.js-integration-totango'),
  'trackjs': require('@segment/analytics.js-integration-trackjs'),
  'tvsquared': require('@segment/analytics.js-integration-tvsquared'),
  'twitter-ads': require('@segment/analytics.js-integration-twitter-ads'),
  'userlike': require('@segment/analytics.js-integration-userlike'),
  'uservoice': require('@segment/analytics.js-integration-uservoice'),
  'vero': require('@segment/analytics.js-integration-vero'),
  'visual-tagger': require('@segment/analytics.js-integration-visual-tagger'),
  'visual-website-optimizer': require('@segment/analytics.js-integration-visual-website-optimizer'),
  'webengage': require('@segment/analytics.js-integration-webengage'),
  'wigzo': require('@segment/analytics.js-integration-wigzo'),
  'wishpond': require('@segment/analytics.js-integration-wishpond'),
  'woopra': require('@segment/analytics.js-integration-woopra'),
  'wootric': require('@segment/analytics.js-integration-wootric'),
  'yandex-metrica': require('@segment/analytics.js-integration-yandex-metrica'),
  'yellowhammer': require('@segment/analytics.js-integration-yellowhammer'),
  'youbora': require('@segment/analytics.js-integration-youbora'),
  'zopim': require('@segment/analytics.js-integration-zopim'),
  '@segment/mme-e2e-direct-destination': require('@segment/mme-e2e-direct-destination'),
  '@smartlook/analytics.js-integration-smartlook': require('@smartlook/analytics.js-integration-smartlook'),
  '@survicate/analytics.js-integration-survicate': require('@survicate/analytics.js-integration-survicate'),
  '@userpilot/analytics.js-integration-userpilot': require('@userpilot/analytics.js-integration-userpilot'),
  '@walkme/analytics.js-integration-walkme': require('@walkme/analytics.js-integration-walkme'),
  'analytics.js-integration-bouncex-test': require('analytics.js-integration-bouncex-test'),
  'analytics.js-integration-crisp': require('analytics.js-integration-crisp'),
  'listrak': require('listrak')
};

},{"@asayerio/analytics.js-integration-asayer":6,"@auryc/analytics.js-integration-auryc":13,"@convertflow/analytics.js-integration-convertflow":20,"@owneriq/analytics.js-integration-owneriq-pixel":43,"@profitwell/analytics.js-integration":50,"@segment/analytics.js-integration-adlearn-open-platform":102,"@segment/analytics.js-integration-adobe-analytics":109,"@segment/analytics.js-integration-adobe-target":116,"@segment/analytics.js-integration-adometry":123,"@segment/analytics.js-integration-adroll":130,"@segment/analytics.js-integration-adwords":137,"@segment/analytics.js-integration-alexa":144,"@segment/analytics.js-integration-ambassador":151,"@segment/analytics.js-integration-amplitude":158,"@segment/analytics.js-integration-appboy":185,"@segment/analytics.js-integration-appboy-ibm":165,"@segment/analytics.js-integration-appcues":192,"@segment/analytics.js-integration-appnexus":200,"@segment/analytics.js-integration-aptrinsic":207,"@segment/analytics.js-integration-atatus":214,"@segment/analytics.js-integration-autosend":222,"@segment/analytics.js-integration-awesm":229,"@segment/analytics.js-integration-bing-ads":236,"@segment/analytics.js-integration-blueshift":243,"@segment/analytics.js-integration-boomtrain":250,"@segment/analytics.js-integration-bronto":257,"@segment/analytics.js-integration-bugherd":264,"@segment/analytics.js-integration-bugsnag":271,"@segment/analytics.js-integration-castle":279,"@segment/analytics.js-integration-chameleon":286,"@segment/analytics.js-integration-chartbeat":293,"@segment/analytics.js-integration-clevertap":300,"@segment/analytics.js-integration-clicky":307,"@segment/analytics.js-integration-comscore":315,"@segment/analytics.js-integration-convertro":322,"@segment/analytics.js-integration-crazy-egg":329,"@segment/analytics.js-integration-criteo":336,"@segment/analytics.js-integration-curebit":344,"@segment/analytics.js-integration-customerio":351,"@segment/analytics.js-integration-cxense":358,"@segment/analytics.js-integration-doubleclick-floodlight":365,"@segment/analytics.js-integration-drift":372,"@segment/analytics.js-integration-drip":379,"@segment/analytics.js-integration-elevio":387,"@segment/analytics.js-integration-eloqua":396,"@segment/analytics.js-integration-email-aptitude":403,"@segment/analytics.js-integration-errorception":410,"@segment/analytics.js-integration-evergage":419,"@segment/analytics.js-integration-extole":426,"@segment/analytics.js-integration-facebook-conversion-tracking":433,"@segment/analytics.js-integration-facebook-pixel":440,"@segment/analytics.js-integration-foxmetrics":449,"@segment/analytics.js-integration-friendbuy":456,"@segment/analytics.js-integration-fullstory":465,"@segment/analytics.js-integration-gauges":473,"@segment/analytics.js-integration-get-satisfaction":480,"@segment/analytics.js-integration-google-adwords-new":487,"@segment/analytics.js-integration-google-analytics":494,"@segment/analytics.js-integration-google-tag-manager":501,"@segment/analytics.js-integration-gosquared":508,"@segment/analytics.js-integration-gtag":515,"@segment/analytics.js-integration-heap":522,"@segment/analytics.js-integration-hellobar":529,"@segment/analytics.js-integration-hindsight":536,"@segment/analytics.js-integration-hittail":543,"@segment/analytics.js-integration-hotjar":550,"@segment/analytics.js-integration-hubspot":557,"@segment/analytics.js-integration-improvely":564,"@segment/analytics.js-integration-inspectlet":571,"@segment/analytics.js-integration-intercom":578,"@segment/analytics.js-integration-keen-io":585,"@segment/analytics.js-integration-kenshoo":599,"@segment/analytics.js-integration-kenshoo-infinity":592,"@segment/analytics.js-integration-kissmetrics":606,"@segment/analytics.js-integration-klaviyo":613,"@segment/analytics.js-integration-linkedin-insight-tag":620,"@segment/analytics.js-integration-livechat":627,"@segment/analytics.js-integration-localytics":634,"@segment/analytics.js-integration-lucky-orange":641,"@segment/analytics.js-integration-lytics":648,"@segment/analytics.js-integration-madkudu":655,"@segment/analytics.js-integration-marketo":669,"@segment/analytics.js-integration-marketo-v2":662,"@segment/analytics.js-integration-mediamath":676,"@segment/analytics.js-integration-mixpanel":683,"@segment/analytics.js-integration-moengage":690,"@segment/analytics.js-integration-mojn":697,"@segment/analytics.js-integration-monetate":704,"@segment/analytics.js-integration-mouseflow":711,"@segment/analytics.js-integration-mousestats":718,"@segment/analytics.js-integration-nanigans":725,"@segment/analytics.js-integration-navilytics":734,"@segment/analytics.js-integration-nielsen-dcr":741,"@segment/analytics.js-integration-nielsen-dtvr":748,"@segment/analytics.js-integration-nudgespot":755,"@segment/analytics.js-integration-olark":762,"@segment/analytics.js-integration-omniture":769,"@segment/analytics.js-integration-onespot":776,"@segment/analytics.js-integration-optimizely":783,"@segment/analytics.js-integration-outbound":792,"@segment/analytics.js-integration-pardot":801,"@segment/analytics.js-integration-parsely":810,"@segment/analytics.js-integration-pendo":819,"@segment/analytics.js-integration-perfect-audience":826,"@segment/analytics.js-integration-perimeterx":833,"@segment/analytics.js-integration-personas":840,"@segment/analytics.js-integration-pingdom":847,"@segment/analytics.js-integration-pinterest-tag":854,"@segment/analytics.js-integration-piwik":861,"@segment/analytics.js-integration-qualaroo":868,"@segment/analytics.js-integration-quantcast":875,"@segment/analytics.js-integration-quanticmind":882,"@segment/analytics.js-integration-quora-conversion-pixel":889,"@segment/analytics.js-integration-ramen":896,"@segment/analytics.js-integration-rockerbox":903,"@segment/analytics.js-integration-rocket-fuel":910,"@segment/analytics.js-integration-rollbar":917,"@segment/analytics.js-integration-route":924,"@segment/analytics.js-integration-saasquatch":931,"@segment/analytics.js-integration-salesforce-dmp":938,"@segment/analytics.js-integration-salesforce-live-agent":945,"@segment/analytics.js-integration-satismeter":952,"@segment/analytics.js-integration-segmentio":959,"@segment/analytics.js-integration-sentry":968,"@segment/analytics.js-integration-shareasale":975,"@segment/analytics.js-integration-simplereach":982,"@segment/analytics.js-integration-simplifi":989,"@segment/analytics.js-integration-snapengage":996,"@segment/analytics.js-integration-spinnakr":1003,"@segment/analytics.js-integration-steelhouse":1010,"@segment/analytics.js-integration-stripe-radar":1017,"@segment/analytics.js-integration-supporthero":1024,"@segment/analytics.js-integration-tag-injector":1031,"@segment/analytics.js-integration-taplytics":1038,"@segment/analytics.js-integration-tapstream":1045,"@segment/analytics.js-integration-tell-apart":1052,"@segment/analytics.js-integration-totango":1071,"@segment/analytics.js-integration-trackjs":1078,"@segment/analytics.js-integration-tvsquared":1085,"@segment/analytics.js-integration-twitter-ads":1092,"@segment/analytics.js-integration-userlike":1099,"@segment/analytics.js-integration-uservoice":1106,"@segment/analytics.js-integration-vero":1113,"@segment/analytics.js-integration-visual-tagger":1120,"@segment/analytics.js-integration-visual-website-optimizer":1121,"@segment/analytics.js-integration-webengage":1128,"@segment/analytics.js-integration-wigzo":1135,"@segment/analytics.js-integration-wishpond":1142,"@segment/analytics.js-integration-woopra":1149,"@segment/analytics.js-integration-wootric":1156,"@segment/analytics.js-integration-yandex-metrica":1157,"@segment/analytics.js-integration-yellowhammer":1164,"@segment/analytics.js-integration-youbora":1171,"@segment/analytics.js-integration-zopim":1178,"@segment/mme-e2e-direct-destination":1214,"@smartlook/analytics.js-integration-smartlook":1228,"@survicate/analytics.js-integration-survicate":1235,"@userpilot/analytics.js-integration-userpilot":1242,"@walkme/analytics.js-integration-walkme":1250,"analytics.js-integration-bouncex-test":1258,"analytics.js-integration-crisp":1265,"listrak":1330}],5:[function(require,module,exports){
/* eslint quotes: 0 */
'use strict';

var middlewares = {
  source: [
    require("@segment/analytics.js-middleware-braze-deduplicate")
  ].map(function(module) {
    return module.__esModule && module.default
      ? module.default
      : module;
  }),
  integration: []
};

/* eslint-disable */

/* eslint-enable */

module.exports = middlewares;

},{"@segment/ajs-middleware-routing":70,"@segment/analytics.js-middleware-braze-deduplicate":1190}],6:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":7}],7:[function(require,module,exports){

;
'use strict';

/**
 * Module dependencies.
 */

var bind = require('component-bind');
var debug = require('debug');
var defaults = require('@ndhoule/defaults');
var extend = require('extend');
var slug = require('slug-component');
var protos = require('./protos');
var statics = require('./statics');

/**
 * Create a new `Integration` constructor.
 *
 * @constructs Integration
 * @param {string} name
 * @return {Function} Integration
 */

function createIntegration(name) {
  /**
   * Initialize a new `Integration`.
   *
   * @class
   * @param {Object} options
   */

  function Integration(options) {
    if (options && options.addIntegration) {
      // plugin
      return options.addIntegration(Integration);
    }
    this.debug = debug('analytics:integration:' + slug(name));
    var clonedOpts = {};
    extend(true, clonedOpts, options); // deep clone options
    this.options = defaults(clonedOpts || {}, this.defaults);
    this._queue = [];
    this.once('ready', bind(this, this.flush));

    Integration.emit('construct', this);
    this.ready = bind(this, this.ready);
    this._wrapInitialize();
    this._wrapPage();
    this._wrapTrack();
  }

  Integration.prototype.defaults = {};
  Integration.prototype.globals = [];
  Integration.prototype.templates = {};
  Integration.prototype.name = name;
  extend(Integration, statics);
  extend(Integration.prototype, protos);

  return Integration;
}

/**
 * Exports.
 */

module.exports = createIntegration;

;

},{"./protos":8,"./statics":9,"@ndhoule/defaults":30,"component-bind":1277,"debug":11,"extend":10,"slug-component":1398}],8:[function(require,module,exports){

;
'use strict';

/**
 * Module dependencies.
 */

var Emitter = require('component-emitter');
var after = require('@ndhoule/after');
var each = require('@ndhoule/each');
var events = require('analytics-events');
var every = require('@ndhoule/every');
var fmt = require('@segment/fmt');
var foldl = require('@ndhoule/foldl');
var is = require('is');
var loadIframe = require('load-iframe');
var loadScript = require('@segment/load-script');
var nextTick = require('next-tick');
var normalize = require('to-no-case');

/**
 * hasOwnProperty reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * No operation.
 */

var noop = function noop() {};

/**
 * Window defaults.
 */

var onerror = window.onerror;
var onload = null;

/**
 * Mixin emitter.
 */

/* eslint-disable new-cap */
Emitter(exports);
/* eslint-enable new-cap */

/**
 * Initialize.
 */

exports.initialize = function() {
  var ready = this.ready;
  nextTick(ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

exports.loaded = function() {
  return false;
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

/* eslint-disable no-unused-vars */
exports.page = function(page) {};
/* eslint-enable no-unused-vars */

/**
 * Track.
 *
 * @api public
 * @param {Track} track
 */

/* eslint-disable no-unused-vars */
exports.track = function(track) {};
/* eslint-enable no-unused-vars */

/**
 * Get values from items in `options` that are mapped to `key`.
 * `options` is an integration setting which is a collection
 * of type 'map', 'array', or 'mixed'
 *
 * Use cases include mapping events to pixelIds (map), sending generic
 * conversion pixels only for specific events (array), or configuring dynamic
 * mappings of event properties to query string parameters based on event (mixed)
 *
 * @api public
 * @param {Object|Object[]|String[]} options An object, array of objects, or
 * array of strings pulled from settings.mapping.
 * @param {string} key The name of the item in options whose metadata
 * we're looking for.
 * @return {Array} An array of settings that match the input `key` name.
 * @example
 *
 * // 'Map'
 * var events = { my_event: 'a4991b88' };
 * .map(events, 'My Event');
 * // => ["a4991b88"]
 * .map(events, 'whatever');
 * // => []
 *
 * // 'Array'
 * * var events = ['Completed Order', 'My Event'];
 * .map(events, 'My Event');
 * // => ["My Event"]
 * .map(events, 'whatever');
 * // => []
 *
 * // 'Mixed'
 * var events = [{ key: 'my event', value: '9b5eb1fa' }];
 * .map(events, 'my_event');
 * // => ["9b5eb1fa"]
 * .map(events, 'whatever');
 * // => []
 */

exports.map = function(options, key) {
  var normalizedComparator = normalize(key);
  var mappingType = getMappingType(options);

  if (mappingType === 'unknown') {
    return [];
  }

  return foldl(function(matchingValues, val, key) {
    var compare;
    var result;

    if (mappingType === 'map') {
      compare = key;
      result = val;
    }

    if (mappingType === 'array') {
      compare = val;
      result = val;
    }

    if (mappingType === 'mixed') {
      compare = val.key;
      result = val.value;
    }

    if (normalize(compare) === normalizedComparator) {
      matchingValues.push(result);
    }

    return matchingValues;
  }, [], options);
};

/**
 * Invoke a `method` that may or may not exist on the prototype with `args`,
 * queueing or not depending on whether the integration is "ready". Don't
 * trust the method call, since it contains integration party code.
 *
 * @api private
 * @param {string} method
 * @param {...*} args
 */

exports.invoke = function(method) {
  if (!this[method]) return;
  var args = Array.prototype.slice.call(arguments, 1);
  if (!this._ready) return this.queue(method, args);

  this.debug('%s with %o', method, args);
  return this[method].apply(this, args);
};

/**
 * Queue a `method` with `args`.
 *
 * @api private
 * @param {string} method
 * @param {Array} args
 */

exports.queue = function(method, args) {
  this._queue.push({ method: method, args: args });
};

/**
 * Flush the internal queue.
 *
 * @api private
 */

exports.flush = function() {
  this._ready = true;
  var self = this;

  each(function(call) {
    self[call.method].apply(self, call.args);
  }, this._queue);

  // Empty the queue.
  this._queue.length = 0;
};

/**
 * Reset the integration, removing its global variables.
 *
 * @api private
 */

exports.reset = function() {
  for (var i = 0; i < this.globals.length; i++) {
    window[this.globals[i]] = undefined;
  }

  window.onerror = onerror;
  window.onload = onload;
};

/**
 * Load a tag by `name`.
 *
 * @param {string} name The name of the tag.
 * @param {Object} locals Locals used to populate the tag's template variables
 * (e.g. `userId` in '<img src="https://whatever.com/{{ userId }}">').
 * @param {Function} [callback=noop] A callback, invoked when the tag finishes
 * loading.
 */

exports.load = function(name, locals, callback) {
  // Argument shuffling
  if (typeof name === 'function') { callback = name; locals = null; name = null; }
  if (name && typeof name === 'object') { callback = locals; locals = name; name = null; }
  if (typeof locals === 'function') { callback = locals; locals = null; }

  // Default arguments
  name = name || 'library';
  locals = locals || {};

  locals = this.locals(locals);
  var template = this.templates[name];
  if (!template) throw new Error(fmt('template "%s" not defined.', name));
  var attrs = render(template, locals);
  callback = callback || noop;
  var self = this;
  var el;

  switch (template.type) {
  case 'img':
    attrs.width = 1;
    attrs.height = 1;
    el = loadImage(attrs, callback);
    break;
  case 'script':
    el = loadScript(attrs, function(err) {
      if (!err) return callback();
      self.debug('error loading "%s" error="%s"', self.name, err);
    });
      // TODO: hack until refactoring load-script
    delete attrs.src;
    each(function(val, key) {
      el.setAttribute(key, val);
    }, attrs);
    break;
  case 'iframe':
    el = loadIframe(attrs, callback);
    break;
  default:
      // No default case
  }

  return el;
};

/**
 * Locals for tag templates.
 *
 * By default it includes a cache buster and all of the options.
 *
 * @param {Object} [locals]
 * @return {Object}
 */

exports.locals = function(locals) {
  locals = locals || {};
  var cache = Math.floor(new Date().getTime() / 3600000);
  if (!locals.hasOwnProperty('cache')) locals.cache = cache;
  each(function(val, key) {
    if (!locals.hasOwnProperty(key)) locals[key] = val;
  }, this.options);
  return locals;
};

/**
 * Simple way to emit ready.
 *
 * @api public
 */

exports.ready = function() {
  this.emit('ready');
};

/**
 * Wrap the initialize method in an exists check, so we don't have to do it for
 * every single integration.
 *
 * @api private
 */

exports._wrapInitialize = function() {
  var initialize = this.initialize;
  this.initialize = function() {
    this.debug('initialize');
    this._initialized = true;
    var ret = initialize.apply(this, arguments);
    this.emit('initialize');
    return ret;
  };
};

/**
 * Wrap the page method to call to noop the first page call if the integration assumes
 * a pageview.
 *
 * @api private
 */

exports._wrapPage = function() {
  // Noop the first page call if integration assumes pageview
  if (this._assumesPageview) return this.page = after(2, this.page);
};

/**
 * Wrap the track method to call other ecommerce methods if available depending
 * on the `track.event()`.
 *
 * @api private
 */

exports._wrapTrack = function() {
  var t = this.track;
  this.track = function(track) {
    var event = track.event();
    var called;
    var ret;

    for (var method in events) {
      if (has.call(events, method)) {
        var regexp = events[method];
        if (!this[method]) continue;
        if (!regexp.test(event)) continue;
        ret = this[method].apply(this, arguments);
        called = true;
        break;
      }
    }

    if (!called) ret = t.apply(this, arguments);
    return ret;
  };
};

/**
 * Determine the type of the option passed to `#map`
 *
 * @api private
 * @param {Object|Object[]} mapping
 * @return {String} mappingType
 */

function getMappingType(mapping) {
  if (is.array(mapping)) {
    return every(isMixed, mapping) ? 'mixed' : 'array';
  }
  if (is.object(mapping)) return 'map';
  return 'unknown';
}

/**
 * Determine if item in mapping array is a valid "mixed" type value
 *
 * Must be an object with properties "key" (of type string)
 * and "value" (of any type)
 *
 * @api private
 * @param {*} item
 * @return {Boolean}
 */

function isMixed(item) {
  if (!is.object(item)) return false;
  if (!is.string(item.key)) return false;
  if (!has.call(item, 'value')) return false;
  return true;
}

/**
 * TODO: Document me
 *
 * @api private
 * @param {Object} attrs
 * @param {Function} fn
 * @return {Image}
 */

function loadImage(attrs, fn) {
  fn = fn || function() {};
  var img = new Image();
  img.onerror = error(fn, 'failed to load pixel', img);
  img.onload = function() { fn(); };
  img.src = attrs.src;
  img.width = 1;
  img.height = 1;
  return img;
}

/**
 * TODO: Document me
 *
 * @api private
 * @param {Function} fn
 * @param {string} message
 * @param {Element} img
 * @return {Function}
 */

function error(fn, message, img) {
  return function(e) {
    e = e || window.event;
    var err = new Error(message);
    err.event = e;
    err.source = img;
    fn(err);
  };
}

/**
 * Render template + locals into an `attrs` object.
 *
 * @api private
 * @param {Object} template
 * @param {Object} locals
 * @return {Object}
 */

function render(template, locals) {
  return foldl(function(attrs, val, key) {
    attrs[key] = val.replace(/\{\{\ *(\w+)\ *\}\}/g, function(_, $1) {
      return locals[$1];
    });
    return attrs;
  }, {}, template.attrs);
}

;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],9:[function(require,module,exports){

;
'use strict';

/**
 * Module dependencies.
 */

var Emitter = require('component-emitter');
var domify = require('domify');
var each = require('@ndhoule/each');
var includes = require('@ndhoule/includes');

/**
 * Mix in emitter.
 */

/* eslint-disable new-cap */
Emitter(exports);
/* eslint-enable new-cap */

/**
 * Add a new option to the integration by `key` with default `value`.
 *
 * @api public
 * @param {string} key
 * @param {*} value
 * @return {Integration}
 */

exports.option = function(key, value) {
  this.prototype.defaults[key] = value;
  return this;
};

/**
 * Add a new mapping option.
 *
 * This will create a method `name` that will return a mapping for you to use.
 *
 * @api public
 * @param {string} name
 * @return {Integration}
 * @example
 * Integration('My Integration')
 *   .mapping('events');
 *
 * new MyIntegration().track('My Event');
 *
 * .track = function(track){
 *   var events = this.events(track.event());
 *   each(send, events);
 *  };
 */

exports.mapping = function(name) {
  this.option(name, []);
  this.prototype[name] = function(key) {
    return this.map(this.options[name], key);
  };
  return this;
};

/**
 * Register a new global variable `key` owned by the integration, which will be
 * used to test whether the integration is already on the page.
 *
 * @api public
 * @param {string} key
 * @return {Integration}
 */

exports.global = function(key) {
  this.prototype.globals.push(key);
  return this;
};

/**
 * Mark the integration as assuming an initial pageview, so to defer the first page call, keep track of
 * whether we already nooped the first page call.
 *
 * @api public
 * @return {Integration}
 */

exports.assumesPageview = function() {
  this.prototype._assumesPageview = true;
  return this;
};

/**
 * Mark the integration as being "ready" once `load` is called.
 *
 * @api public
 * @return {Integration}
 */

exports.readyOnLoad = function() {
  this.prototype._readyOnLoad = true;
  return this;
};

/**
 * Mark the integration as being "ready" once `initialize` is called.
 *
 * @api public
 * @return {Integration}
 */

exports.readyOnInitialize = function() {
  this.prototype._readyOnInitialize = true;
  return this;
};

/**
 * Define a tag to be loaded.
 *
 * @api public
 * @param {string} [name='library'] A nicename for the tag, commonly used in
 * #load. Helpful when the integration has multiple tags and you need a way to
 * specify which of the tags you want to load at a given time.
 * @param {String} str DOM tag as string or URL.
 * @return {Integration}
 */

exports.tag = function(name, tag) {
  if (tag == null) {
    tag = name;
    name = 'library';
  }
  this.prototype.templates[name] = objectify(tag);
  return this;
};

/**
 * Given a string, give back DOM attributes.
 *
 * Do it in a way where the browser doesn't load images or iframes. It turns
 * out domify will load images/iframes because whenever you construct those
 * DOM elements, the browser immediately loads them.
 *
 * @api private
 * @param {string} str
 * @return {Object}
 */

function objectify(str) {
  // replace `src` with `data-src` to prevent image loading
  str = str.replace(' src="', ' data-src="');

  var el = domify(str);
  var attrs = {};

  each(function(attr) {
    // then replace it back
    var name = attr.name === 'data-src' ? 'src' : attr.name;
    if (!includes(attr.name + '=', str)) return;
    attrs[name] = attr.value;
  }, el.attributes);

  return {
    type: el.tagName.toLowerCase(),
    attrs: attrs
  };
}

;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302}],10:[function(require,module,exports){

;
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) { /**/ }

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone;
	var target = arguments[0];
	var i = 1;
	var length = arguments.length;
	var deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}
	if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};

;

},{}],11:[function(require,module,exports){
(function (process){
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

}).call(this,require('_process'))
},{"./debug":12,"_process":1273}],12:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":1355}],13:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/extend":35,"@segment/analytics.js-integration":14,"@segment/to-iso-string":1219,"component-each":1283,"is":1321}],14:[function(require,module,exports){

;
'use strict';

/**
 * Module dependencies.
 */

var bind = require('component-bind');
var clone = require('@ndhoule/clone');
var debug = require('debug');
var defaults = require('@ndhoule/defaults');
var extend = require('@ndhoule/extend');
var slug = require('slug-component');
var protos = require('./protos');
var statics = require('./statics');

/**
 * Create a new `Integration` constructor.
 *
 * @constructs Integration
 * @param {string} name
 * @return {Function} Integration
 */

function createIntegration(name) {
  /**
   * Initialize a new `Integration`.
   *
   * @class
   * @param {Object} options
   */

  function Integration(options) {
    if (options && options.addIntegration) {
      // plugin
      return options.addIntegration(Integration);
    }
    this.debug = debug('analytics:integration:' + slug(name));
    this.options = defaults(clone(options) || {}, this.defaults);
    this._queue = [];
    this.once('ready', bind(this, this.flush));

    Integration.emit('construct', this);
    this.ready = bind(this, this.ready);
    this._wrapInitialize();
    this._wrapPage();
    this._wrapTrack();
  }

  Integration.prototype.defaults = {};
  Integration.prototype.globals = [];
  Integration.prototype.templates = {};
  Integration.prototype.name = name;
  extend(Integration, statics);
  extend(Integration.prototype, protos);

  return Integration;
}

/**
 * Exports.
 */

module.exports = createIntegration;

;

},{"./protos":15,"./statics":16,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":18,"slug-component":1398}],15:[function(require,module,exports){

;
'use strict';

/**
 * Module dependencies.
 */

var Emitter = require('component-emitter');
var after = require('@ndhoule/after');
var each = require('@ndhoule/each');
var events = require('analytics-events');
var every = require('@ndhoule/every');
var fmt = require('@segment/fmt');
var foldl = require('@ndhoule/foldl');
var is = require('is');
var loadIframe = require('load-iframe');
var loadScript = require('@segment/load-script');
var nextTick = require('next-tick');
var normalize = require('to-no-case');

/**
 * hasOwnProperty reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * No operation.
 */

var noop = function noop() {};

/**
 * Window defaults.
 */

var onerror = window.onerror;
var onload = null;

/**
 * Mixin emitter.
 */

/* eslint-disable new-cap */
Emitter(exports);
/* eslint-enable new-cap */

/**
 * Initialize.
 */

exports.initialize = function() {
  var ready = this.ready;
  nextTick(ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

exports.loaded = function() {
  return false;
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

/* eslint-disable no-unused-vars */
exports.page = function(page) {};
/* eslint-enable no-unused-vars */

/**
 * Track.
 *
 * @api public
 * @param {Track} track
 */

/* eslint-disable no-unused-vars */
exports.track = function(track) {};
/* eslint-enable no-unused-vars */

/**
 * Get values from items in `options` that are mapped to `key`.
 * `options` is an integration setting which is a collection
 * of type 'map', 'array', or 'mixed'
 *
 * Use cases include mapping events to pixelIds (map), sending generic
 * conversion pixels only for specific events (array), or configuring dynamic
 * mappings of event properties to query string parameters based on event (mixed)
 *
 * @api public
 * @param {Object|Object[]|String[]} options An object, array of objects, or
 * array of strings pulled from settings.mapping.
 * @param {string} key The name of the item in options whose metadata
 * we're looking for.
 * @return {Array} An array of settings that match the input `key` name.
 * @example
 *
 * // 'Map'
 * var events = { my_event: 'a4991b88' };
 * .map(events, 'My Event');
 * // => ["a4991b88"]
 * .map(events, 'whatever');
 * // => []
 *
 * // 'Array'
 * * var events = ['Completed Order', 'My Event'];
 * .map(events, 'My Event');
 * // => ["My Event"]
 * .map(events, 'whatever');
 * // => []
 *
 * // 'Mixed'
 * var events = [{ key: 'my event', value: '9b5eb1fa' }];
 * .map(events, 'my_event');
 * // => ["9b5eb1fa"]
 * .map(events, 'whatever');
 * // => []
 */

exports.map = function(options, key) {
  var normalizedComparator = normalize(key);
  var mappingType = getMappingType(options);

  if (mappingType === 'unknown') {
    return [];
  }

  return foldl(function(matchingValues, val, key) {
    var compare;
    var result;

    if (mappingType === 'map') {
      compare = key;
      result = val;
    }

    if (mappingType === 'array') {
      compare = val;
      result = val;
    }

    if (mappingType === 'mixed') {
      compare = val.key;
      result = val.value;
    }

    if (normalize(compare) === normalizedComparator) {
      matchingValues.push(result);
    }

    return matchingValues;
  }, [], options);
};

/**
 * Invoke a `method` that may or may not exist on the prototype with `args`,
 * queueing or not depending on whether the integration is "ready". Don't
 * trust the method call, since it contains integration party code.
 *
 * @api private
 * @param {string} method
 * @param {...*} args
 */

exports.invoke = function(method) {
  if (!this[method]) return;
  var args = Array.prototype.slice.call(arguments, 1);
  if (!this._ready) return this.queue(method, args);

  this.debug('%s with %o', method, args);
  return this[method].apply(this, args);
};

/**
 * Queue a `method` with `args`. If the integration assumes an initial
 * pageview, then let the first call to `page` pass through.
 *
 * @api private
 * @param {string} method
 * @param {Array} args
 */

exports.queue = function(method, args) {
  if (method === 'page' && this._assumesPageview && !this._initialized) {
    return this.page.apply(this, args);
  }

  this._queue.push({ method: method, args: args });
};

/**
 * Flush the internal queue.
 *
 * @api private
 */

exports.flush = function() {
  this._ready = true;
  var self = this;

  each(function(call) {
    self[call.method].apply(self, call.args);
  }, this._queue);

  // Empty the queue.
  this._queue.length = 0;
};

/**
 * Reset the integration, removing its global variables.
 *
 * @api private
 */

exports.reset = function() {
  for (var i = 0; i < this.globals.length; i++) {
    window[this.globals[i]] = undefined;
  }

  window.onerror = onerror;
  window.onload = onload;
};

/**
 * Load a tag by `name`.
 *
 * @param {string} name The name of the tag.
 * @param {Object} locals Locals used to populate the tag's template variables
 * (e.g. `userId` in '<img src="https://whatever.com/{{ userId }}">').
 * @param {Function} [callback=noop] A callback, invoked when the tag finishes
 * loading.
 */

exports.load = function(name, locals, callback) {
  // Argument shuffling
  if (typeof name === 'function') { callback = name; locals = null; name = null; }
  if (name && typeof name === 'object') { callback = locals; locals = name; name = null; }
  if (typeof locals === 'function') { callback = locals; locals = null; }

  // Default arguments
  name = name || 'library';
  locals = locals || {};

  locals = this.locals(locals);
  var template = this.templates[name];
  if (!template) throw new Error(fmt('template "%s" not defined.', name));
  var attrs = render(template, locals);
  callback = callback || noop;
  var self = this;
  var el;

  switch (template.type) {
  case 'img':
    attrs.width = 1;
    attrs.height = 1;
    el = loadImage(attrs, callback);
    break;
  case 'script':
    el = loadScript(attrs, function(err) {
      if (!err) return callback();
      self.debug('error loading "%s" error="%s"', self.name, err);
    });
      // TODO: hack until refactoring load-script
    delete attrs.src;
    each(function(val, key) {
      el.setAttribute(key, val);
    }, attrs);
    break;
  case 'iframe':
    el = loadIframe(attrs, callback);
    break;
  default:
      // No default case
  }

  return el;
};

/**
 * Locals for tag templates.
 *
 * By default it includes a cache buster and all of the options.
 *
 * @param {Object} [locals]
 * @return {Object}
 */

exports.locals = function(locals) {
  locals = locals || {};
  var cache = Math.floor(new Date().getTime() / 3600000);
  if (!locals.hasOwnProperty('cache')) locals.cache = cache;
  each(function(val, key) {
    if (!locals.hasOwnProperty(key)) locals[key] = val;
  }, this.options);
  return locals;
};

/**
 * Simple way to emit ready.
 *
 * @api public
 */

exports.ready = function() {
  this.emit('ready');
};

/**
 * Wrap the initialize method in an exists check, so we don't have to do it for
 * every single integration.
 *
 * @api private
 */

exports._wrapInitialize = function() {
  var initialize = this.initialize;
  this.initialize = function() {
    this.debug('initialize');
    this._initialized = true;
    var ret = initialize.apply(this, arguments);
    this.emit('initialize');
    return ret;
  };

  if (this._assumesPageview) this.initialize = after(2, this.initialize);
};

/**
 * Wrap the page method to call `initialize` instead if the integration assumes
 * a pageview.
 *
 * @api private
 */

exports._wrapPage = function() {
  var page = this.page;
  this.page = function() {
    if (this._assumesPageview && !this._initialized) {
      return this.initialize.apply(this, arguments);
    }

    return page.apply(this, arguments);
  };
};

/**
 * Wrap the track method to call other ecommerce methods if available depending
 * on the `track.event()`.
 *
 * @api private
 */

exports._wrapTrack = function() {
  var t = this.track;
  this.track = function(track) {
    var event = track.event();
    var called;
    var ret;

    for (var method in events) {
      if (has.call(events, method)) {
        var regexp = events[method];
        if (!this[method]) continue;
        if (!regexp.test(event)) continue;
        ret = this[method].apply(this, arguments);
        called = true;
        break;
      }
    }

    if (!called) ret = t.apply(this, arguments);
    return ret;
  };
};

/**
 * Determine the type of the option passed to `#map`
 *
 * @api private
 * @param {Object|Object[]} mapping
 * @return {String} mappingType
 */

function getMappingType(mapping) {
  if (is.array(mapping)) {
    return every(isMixed, mapping) ? 'mixed' : 'array';
  }
  if (is.object(mapping)) return 'map';
  return 'unknown';
}

/**
 * Determine if item in mapping array is a valid "mixed" type value
 *
 * Must be an object with properties "key" (of type string)
 * and "value" (of any type)
 *
 * @api private
 * @param {*} item
 * @return {Boolean}
 */

function isMixed(item) {
  if (!is.object(item)) return false;
  if (!is.string(item.key)) return false;
  if (!has.call(item, 'value')) return false;
  return true;
}

/**
 * TODO: Document me
 *
 * @api private
 * @param {Object} attrs
 * @param {Function} fn
 * @return {Image}
 */

function loadImage(attrs, fn) {
  fn = fn || function() {};
  var img = new Image();
  img.onerror = error(fn, 'failed to load pixel', img);
  img.onload = function() { fn(); };
  img.src = attrs.src;
  img.width = 1;
  img.height = 1;
  return img;
}

/**
 * TODO: Document me
 *
 * @api private
 * @param {Function} fn
 * @param {string} message
 * @param {Element} img
 * @return {Function}
 */

function error(fn, message, img) {
  return function(e) {
    e = e || window.event;
    var err = new Error(message);
    err.event = e;
    err.source = img;
    fn(err);
  };
}

/**
 * Render template + locals into an `attrs` object.
 *
 * @api private
 * @param {Object} template
 * @param {Object} locals
 * @return {Object}
 */

function render(template, locals) {
  return foldl(function(attrs, val, key) {
    attrs[key] = val.replace(/\{\{\ *(\w+)\ *\}\}/g, function(_, $1) {
      return locals[$1];
    });
    return attrs;
  }, {}, template.attrs);
}

;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":17,"component-emitter":1285,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],16:[function(require,module,exports){

;
'use strict';

/**
 * Module dependencies.
 */

var Emitter = require('component-emitter');
var domify = require('domify');
var each = require('@ndhoule/each');
var includes = require('@ndhoule/includes');

/**
 * Mix in emitter.
 */

/* eslint-disable new-cap */
Emitter(exports);
/* eslint-enable new-cap */

/**
 * Add a new option to the integration by `key` with default `value`.
 *
 * @api public
 * @param {string} key
 * @param {*} value
 * @return {Integration}
 */

exports.option = function(key, value) {
  this.prototype.defaults[key] = value;
  return this;
};

/**
 * Add a new mapping option.
 *
 * This will create a method `name` that will return a mapping for you to use.
 *
 * @api public
 * @param {string} name
 * @return {Integration}
 * @example
 * Integration('My Integration')
 *   .mapping('events');
 *
 * new MyIntegration().track('My Event');
 *
 * .track = function(track){
 *   var events = this.events(track.event());
 *   each(send, events);
 *  };
 */

exports.mapping = function(name) {
  this.option(name, []);
  this.prototype[name] = function(key) {
    return this.map(this.options[name], key);
  };
  return this;
};

/**
 * Register a new global variable `key` owned by the integration, which will be
 * used to test whether the integration is already on the page.
 *
 * @api public
 * @param {string} key
 * @return {Integration}
 */

exports.global = function(key) {
  this.prototype.globals.push(key);
  return this;
};

/**
 * Mark the integration as assuming an initial pageview, so to defer loading
 * the script until the first `page` call, noop the first `initialize`.
 *
 * @api public
 * @return {Integration}
 */

exports.assumesPageview = function() {
  this.prototype._assumesPageview = true;
  return this;
};

/**
 * Mark the integration as being "ready" once `load` is called.
 *
 * @api public
 * @return {Integration}
 */

exports.readyOnLoad = function() {
  this.prototype._readyOnLoad = true;
  return this;
};

/**
 * Mark the integration as being "ready" once `initialize` is called.
 *
 * @api public
 * @return {Integration}
 */

exports.readyOnInitialize = function() {
  this.prototype._readyOnInitialize = true;
  return this;
};

/**
 * Define a tag to be loaded.
 *
 * @api public
 * @param {string} [name='library'] A nicename for the tag, commonly used in
 * #load. Helpful when the integration has multiple tags and you need a way to
 * specify which of the tags you want to load at a given time.
 * @param {String} str DOM tag as string or URL.
 * @return {Integration}
 */

exports.tag = function(name, tag) {
  if (tag == null) {
    tag = name;
    name = 'library';
  }
  this.prototype.templates[name] = objectify(tag);
  return this;
};

/**
 * Given a string, give back DOM attributes.
 *
 * Do it in a way where the browser doesn't load images or iframes. It turns
 * out domify will load images/iframes because whenever you construct those
 * DOM elements, the browser immediately loads them.
 *
 * @api private
 * @param {string} str
 * @return {Object}
 */

function objectify(str) {
  // replace `src` with `data-src` to prevent image loading
  str = str.replace(' src="', ' data-src="');

  var el = domify(str);
  var attrs = {};

  each(function(attr) {
    // then replace it back
    var name = attr.name === 'data-src' ? 'src' : attr.name;
    if (!includes(attr.name + '=', str)) return;
    attrs[name] = attr.value;
  }, el.attributes);

  return {
    type: el.tagName.toLowerCase(),
    attrs: attrs
  };
}

;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302}],17:[function(require,module,exports){

;

module.exports = {
  // Promotions
  promotionViewed: /^[ _]?promotion[ _]?viewed?[ _]?$/i,
  viewedPromotion: /^[ _]?viewed[ _]?promotion?[ _]?$/i,
  promotionClicked: /^[ _]?promotion[ _]?clicked?[ _]?$/i,
  clickedPromotion: /^[ _]?clicked[ _]?promotion?[ _]?$/i,
  // Browsing
  productsSearched: /^[ _]?products[ _]?searched[ _]?$/i,
  productListViewed: /^[ _]?product[ _]?list[ _]?viewed[ _]?$/i,
  productListFiltered: /^[ _]?product[ _]?list[ _]?filtered[ _]?$/i,
  viewedProductCategory: /^[ _]?viewed[ _]?product[ _]?category[ _]?$/i,
  viewedProductDetails: /^[ _]?viewed[ _]?product[ _]?details?[ _]?$/i,
  // Core Ordering
  productClicked: /^[ _]?product[ _]?clicked[ _]?$/i,
  clickedProduct: /^[ _]?clicked[ _]?product[ _]?$/i,
  productViewed: /^[ _]?product[ _]?viewed[ _]?$/i,
  viewedProduct: /^[ _]?viewed[ _]?product[ _]?$/i,
  productAdded: /^[ _]?product[ _]?added[ _]?$/i,
  addedProduct: /^[ _]?added[ _]?product[ _]?$/i,
  productRemoved: /^[ _]?product[ _]?removed[ _]?$/i,
  removedProduct: /^[ _]?removed[ _]?product[ _]?$/i,
  cartViewed: /^[ _]?cart[ _]?viewed[ _]?$/i,
  orderStarted: /^[ _]?order[ _]?started[ _]?$/i,
  startedOrder: /^[ _]?started[ _]?order[ _]?$/i,
  orderUpdated: /^[ _]?order[ _]?updated[ _]?$/i,
  updatedOrder: /^[ _]?updated[ _]?order[ _]?$/i,
  orderCompleted: /^[ _]?order[ _]?completed[ _]?$/i,
  completedOrder: /^[ _]?completed[ _]?order[ _]?$/i,
  orderRefunded: /^[ _]?order[ _]?refunded[ _]?$/i,
  refundedOrder: /^[ _]?refunded[ _]?order[ _]?$/i,
  orderCancelled: /^[ _]?order[ _]?cancelled[ _]?$/i,
  paymentInfoAdded: /^[ _]?payment[ _]?info[ _]?added[ _]?$/i,
  checkoutStarted: /^[ _]?checkout[ _]?started[ _]?$/i,
  checkoutStepViewed: /^[ _]?checkout[ _]?step[ _]?viewed[ _]?$/i,
  viewedCheckoutStep: /^[ _]?viewed[ _]?checkout[ _]?step[ _]?$/i,
  checkoutStepCompleted: /^[ _]?checkout[ _]?step[ _]?completed[ _]?$/i,
  completedCheckoutStep: /^[ _]?completed[ _]?checkout[ _]?step[ _]?$/i,
  // Coupons
  couponEntered: /^[ _]?coupon[ _]?entered[ _]?$/i,
  couponApplied: /^[ _]?coupon[ _]?applied[ _]?$/i,
  couponDenied: /^[ _]?coupon[ _]?denied[ _]?$/i,
  couponRemoved: /^[ _]?coupon[ _]?removed[ _]?$/i,
  // Wishlisting
  productAddedToWishlist: /^[ _]?product[ _]?added[ _]?to[ _]?wishlist[ _]?$/i,
  wishlistProductRemoved: /^[ _]?wishlist[ _]?product[ _]?removed[ _]?$/i,
  wishlistProductAddedToCart: /^[ _]?wishlist[ _]?product[ _]?added[ _]?to[ _]?cart[ _]?$/i,
  // Sharing
  productShared: /^[ _]?product[ _]?shared[ _]?$/i,
  cartShared: /^[ _]?cart[ _]?shared[ _]?$/i,
  // Reviewing
  productRemoved: /^[ _]?product[ _]?removed[ _]?$/i,
  // App Lifecycle
  applicationInstalled: /^[ _]?application[ _]?installed[ _]?$/i,
  applicationUpdated: /^[ _]?application[ _]?updated[ _]?$/i,
  applicationOpened: /^[ _]?application[ _]?opened[ _]?$/i,
  applicationBackgrounded: /^[ _]?application[ _]?backgrounded[ _]?$/i,
  applicationUninstalled: /^[ _]?application[ _]?uninstalled[ _]?$/i,
  // App Campaign and Referral Events
  installAttributed: /^[ _]?install[ _]?attributed[ _]?$/i,
  deepLinkOpened: /^[ _]?deep[ _]?link[ _]?opened[ _]?$/i,
  pushNotificationReceived: /^[ _]?push[ _]?notification[ _]?received[ _]?$/i,
  pushNotificationTapped: /^[ _]?push[ _]?notification[ _]?received[ _]?$/i,
  pushNotificationBounced: /^[ _]?push[ _]?notification[ _]?bounced[ _]?$/i
};

;

},{}],18:[function(require,module,exports){

;
arguments[4][11][0].apply(exports,arguments)
;

},{"./debug":19,"_process":1273,"dup":11}],19:[function(require,module,exports){

;
arguments[4][12][0].apply(exports,arguments)
;

},{"dup":12,"ms":1355}],20:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":21}],21:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":22,"./statics":23,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":25,"dup":14,"slug-component":1398}],22:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":24,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],23:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],24:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],25:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":26,"_process":1273,"dup":11}],26:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],27:[function(require,module,exports){

;
'use strict';

/*
 * Module dependencies.
 */

var arity = require('@ndhoule/arity');

var objToString = Object.prototype.toString;

/**
 * Determine if a value is a function.
 *
 * @param {*} val
 * @return {boolean}
 */
// TODO: Move to lib
var isFunction = function(val) {
  return typeof val === 'function';
};

/**
 * Determine if a value is a number.
 *
 * @param {*} val
 * @return {boolean}
 */
// TODO: Move to lib
var isNumber = function(val) {
  var type = typeof val;
  return type === 'number' || (type === 'object' && objToString.call(val) === '[object Number]');
};

/**
 * Wrap a function `fn` in a function that will invoke `fn` when invoked `n` or
 * more times.
 *
 * @name after
 * @api public
 * @category Function
 * @param {Number} n The number of
 * @param {Function} fn The function to wrap.
 * @return {Function} A function that will call `fn` after `n` or more
 * invocations.
 * @example
 */
var after = function after(n, fn) {
  if (!isNumber(n)) {
    throw new TypeError('Expected a number but received ' + typeof n);
  }

  if (!isFunction(fn)) {
    throw new TypeError('Expected a function but received ' + typeof fn);
  }

  var callCount = 0;

  return arity(fn.length, function() {
    callCount += 1;

    if (callCount < n) {
      return;
    }

    return fn.apply(this, arguments);
  });
};

/*
 * Exports.
 */

module.exports = after;

;

},{"@ndhoule/arity":28}],28:[function(require,module,exports){

;
'use strict';

var objToString = Object.prototype.toString;

/**
 * Determine if a value is a function.
 *
 * @param {*} val
 * @return {boolean}
 */
// TODO: Move to lib
var isFunction = function(val) {
  return typeof val === 'function';
};

/**
 * Determine if a value is a number.
 *
 * @param {*} val
 * @return {boolean}
 */
// TODO: Move to lib
var isNumber = function(val) {
  var type = typeof val;
  return type === 'number' || (type === 'object' && objToString.call(val) === '[object Number]');
};

 /**
  * Creates an array of generic, numbered argument names.
  *
  * @name createParams
  * @api private
  * @param {number} n
  * @return {Array}
  * @example
  * argNames(2);
  * //=> ['arg1', 'arg2']
  */
var createParams = function createParams(n) {
  var args = [];

  for (var i = 1; i <= n; i += 1) {
    args.push('arg' + i);
  }

  return args;
};

 /**
  * Dynamically construct a wrapper function of `n` arity that.
  *
  * If at all possible, prefer a function from the arity wrapper cache above to
  * avoid allocating a new function at runtime.
  *
  * @name createArityWrapper
  * @api private
  * @param {number} n
  * @return {Function(Function)}
  */
var createArityWrapper = function createArityWrapper(n) {
  var paramNames = createParams(n).join(', ');
  var wrapperBody = ''.concat(
    '  return function(', paramNames, ') {\n',
    '    return func.apply(this, arguments);\n',
    '  };'
  );

  /* eslint-disable no-new-func */
  return new Function('func', wrapperBody);
  /* eslint-enable no-new-func */
};

// Cache common arity wrappers to avoid constructing them at runtime
var arityWrapperCache = [
  /* eslint-disable no-unused-vars */
  function(fn) {
    return function() {
      return fn.apply(this, arguments);
    };
  },

  function(fn) {
    return function(arg1) {
      return fn.apply(this, arguments);
    };
  },

  function(fn) {
    return function(arg1, arg2) {
      return fn.apply(this, arguments);
    };
  },

  function(fn) {
    return function(arg1, arg2, arg3) {
      return fn.apply(this, arguments);
    };
  },

  function(fn) {
    return function(arg1, arg2, arg3, arg4) {
      return fn.apply(this, arguments);
    };
  },

  function(fn) {
    return function(arg1, arg2, arg3, arg4, arg5) {
      return fn.apply(this, arguments);
    };
  }
  /* eslint-enable no-unused-vars */
];

/**
 * Takes a function and an [arity](https://en.wikipedia.org/wiki/Arity) `n`, and returns a new
 * function that expects `n` arguments.
 *
 * @name arity
 * @api public
 * @category Function
 * @see {@link curry}
 * @param {Number} n The desired arity of the returned function.
 * @param {Function} fn The function to wrap.
 * @return {Function} A function of n arity, wrapping `fn`.
 * @example
 * var add = function(a, b) {
 *   return a + b;
 * };
 *
 * // Check the number of arguments this function expects by accessing `.length`:
 * add.length;
 * //=> 2
 *
 * var unaryAdd = arity(1, add);
 * unaryAdd.length;
 * //=> 1
 */
var arity = function arity(n, func) {
  if (!isFunction(func)) {
    throw new TypeError('Expected a function but got ' + typeof func);
  }

  n = Math.max(isNumber(n) ? n : 0, 0);

  if (!arityWrapperCache[n]) {
    arityWrapperCache[n] = createArityWrapper(n);
  }

  return arityWrapperCache[n](func);
};

/*
 * Exports.
 */

module.exports = arity;

;

},{}],29:[function(require,module,exports){
'use strict';

/*
 * Module dependencies.
 */

var type = require('component-type');

/**
 * Deeply clone an object.
 *
 * @param {*} obj Any object.
 */

var clone = function clone(obj) {
  var t = type(obj);

  if (t === 'object') {
    var copy = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        copy[key] = clone(obj[key]);
      }
    }
    return copy;
  }

  if (t === 'array') {
    var copy = new Array(obj.length);
    for (var i = 0, l = obj.length; i < l; i++) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }

  if (t === 'regexp') {
    // from millermedeiros/amd-utils - MIT
    var flags = '';
    flags += obj.multiline ? 'm' : '';
    flags += obj.global ? 'g' : '';
    flags += obj.ignoreCase ? 'i' : '';
    return new RegExp(obj.source, flags);
  }

  if (t === 'date') {
    return new Date(obj.getTime());
  }

  // string, number, boolean, etc.
  return obj;
};

/*
 * Exports.
 */

module.exports = clone;

},{"component-type":1291}],30:[function(require,module,exports){
'use strict';

/*
 * Module dependencies.
 */

var drop = require('@ndhoule/drop');
var rest = require('@ndhoule/rest');

var has = Object.prototype.hasOwnProperty;
var objToString = Object.prototype.toString;

/**
 * Returns `true` if a value is an object, otherwise `false`.
 *
 * @name isObject
 * @api private
 * @param {*} val The value to test.
 * @return {boolean}
 */
// TODO: Move to a library
var isObject = function isObject(value) {
  return Boolean(value) && typeof value === 'object';
};

/**
 * Returns `true` if a value is a plain object, otherwise `false`.
 *
 * @name isPlainObject
 * @api private
 * @param {*} val The value to test.
 * @return {boolean}
 */
// TODO: Move to a library
var isPlainObject = function isPlainObject(value) {
  return Boolean(value) && objToString.call(value) === '[object Object]';
};

/**
 * Assigns a key-value pair to a target object when the value assigned is owned,
 * and where target[key] is undefined.
 *
 * @name shallowCombiner
 * @api private
 * @param {Object} target
 * @param {Object} source
 * @param {*} value
 * @param {string} key
 */
var shallowCombiner = function shallowCombiner(target, source, value, key) {
  if (has.call(source, key) && target[key] === undefined) {
    target[key] = value;
  }
  return source;
};

/**
 * Assigns a key-value pair to a target object when the value assigned is owned,
 * and where target[key] is undefined; also merges objects recursively.
 *
 * @name deepCombiner
 * @api private
 * @param {Object} target
 * @param {Object} source
 * @param {*} value
 * @param {string} key
 * @return {Object}
 */
var deepCombiner = function(target, source, value, key) {
  if (has.call(source, key)) {
    if (isPlainObject(target[key]) && isPlainObject(value)) {
        target[key] = defaultsDeep(target[key], value);
    } else if (target[key] === undefined) {
        target[key] = value;
    }
  }

  return source;
};

/**
 * TODO: Document
 *
 * @name defaultsWith
 * @api private
 * @param {Function} combiner
 * @param {Object} target
 * @param {...Object} sources
 * @return {Object} Return the input `target`.
 */
var defaultsWith = function(combiner, target /*, ...sources */) {
  if (!isObject(target)) {
    return target;
  }

  combiner = combiner || shallowCombiner;
  var sources = drop(2, arguments);

  for (var i = 0; i < sources.length; i += 1) {
    for (var key in sources[i]) {
      combiner(target, sources[i], sources[i][key], key);
    }
  }

  return target;
};

/**
 * Copies owned, enumerable properties from a source object(s) to a target
 * object when the value of that property on the source object is `undefined`.
 * Recurses on objects.
 *
 * @name defaultsDeep
 * @api public
 * @param {Object} target
 * @param {...Object} sources
 * @return {Object} The input `target`.
 */
var defaultsDeep = function defaultsDeep(target /*, sources */) {
  // TODO: Replace with `partial` call?
  return defaultsWith.apply(null, [deepCombiner, target].concat(rest(arguments)));
};

/**
 * Copies owned, enumerable properties from a source object(s) to a target
 * object when the value of that property on the source object is `undefined`.
 *
 * @name defaults
 * @api public
 * @param {Object} target
 * @param {...Object} sources
 * @return {Object}
 * @example
 * var a = { a: 1 };
 * var b = { a: 2, b: 2 };
 *
 * defaults(a, b);
 * console.log(a); //=> { a: 1, b: 2 }
 */
var defaults = function(target /*, ...sources */) {
  // TODO: Replace with `partial` call?
  return defaultsWith.apply(null, [null, target].concat(rest(arguments)));
};

/*
 * Exports.
 */

module.exports = defaults;
module.exports.deep = defaultsDeep;

},{"@ndhoule/drop":31,"@ndhoule/rest":41}],31:[function(require,module,exports){
'use strict';

var max = Math.max;

/**
 * Produce a new array composed of all but the first `n` elements of an input `collection`.
 *
 * @name drop
 * @api public
 * @param {number} count The number of elements to drop.
 * @param {Array} collection The collection to iterate over.
 * @return {Array} A new array containing all but the first element from `collection`.
 * @example
 * drop(0, [1, 2, 3]); // => [1, 2, 3]
 * drop(1, [1, 2, 3]); // => [2, 3]
 * drop(2, [1, 2, 3]); // => [3]
 * drop(3, [1, 2, 3]); // => []
 * drop(4, [1, 2, 3]); // => []
 */
var drop = function drop(count, collection) {
  var length = collection ? collection.length : 0;

  if (!length) {
    return [];
  }

  // Preallocating an array *significantly* boosts performance when dealing with
  // `arguments` objects on v8. For a summary, see:
  // https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
  var toDrop = max(Number(count) || 0, 0);
  var resultsLength = max(length - toDrop, 0);
  var results = new Array(resultsLength);

  for (var i = 0; i < resultsLength; i += 1) {
    results[i] = collection[i + toDrop];
  }

  return results;
};

/*
 * Exports.
 */

module.exports = drop;

},{}],32:[function(require,module,exports){
'use strict';

/*
 * Module dependencies.
 */

var keys = require('@ndhoule/keys');

var objToString = Object.prototype.toString;

/**
 * Tests if a value is a number.
 *
 * @name isNumber
 * @api private
 * @param {*} val The value to test.
 * @return {boolean} Returns `true` if `val` is a number, otherwise `false`.
 */
// TODO: Move to library
var isNumber = function isNumber(val) {
  var type = typeof val;
  return type === 'number' || (type === 'object' && objToString.call(val) === '[object Number]');
};

/**
 * Tests if a value is an array.
 *
 * @name isArray
 * @api private
 * @param {*} val The value to test.
 * @return {boolean} Returns `true` if the value is an array, otherwise `false`.
 */
// TODO: Move to library
var isArray = typeof Array.isArray === 'function' ? Array.isArray : function isArray(val) {
  return objToString.call(val) === '[object Array]';
};

/**
 * Tests if a value is array-like. Array-like means the value is not a function and has a numeric
 * `.length` property.
 *
 * @name isArrayLike
 * @api private
 * @param {*} val
 * @return {boolean}
 */
// TODO: Move to library
var isArrayLike = function isArrayLike(val) {
  return val != null && (isArray(val) || (val !== 'function' && isNumber(val.length)));
};

/**
 * Internal implementation of `each`. Works on arrays and array-like data structures.
 *
 * @name arrayEach
 * @api private
 * @param {Function(value, key, collection)} iterator The function to invoke per iteration.
 * @param {Array} array The array(-like) structure to iterate over.
 * @return {undefined}
 */
var arrayEach = function arrayEach(iterator, array) {
  for (var i = 0; i < array.length; i += 1) {
    // Break iteration early if `iterator` returns `false`
    if (iterator(array[i], i, array) === false) {
      break;
    }
  }
};

/**
 * Internal implementation of `each`. Works on objects.
 *
 * @name baseEach
 * @api private
 * @param {Function(value, key, collection)} iterator The function to invoke per iteration.
 * @param {Object} object The object to iterate over.
 * @return {undefined}
 */
var baseEach = function baseEach(iterator, object) {
  var ks = keys(object);

  for (var i = 0; i < ks.length; i += 1) {
    // Break iteration early if `iterator` returns `false`
    if (iterator(object[ks[i]], ks[i], object) === false) {
      break;
    }
  }
};

/**
 * Iterate over an input collection, invoking an `iterator` function for each element in the
 * collection and passing to it three arguments: `(value, index, collection)`. The `iterator`
 * function can end iteration early by returning `false`.
 *
 * @name each
 * @api public
 * @param {Function(value, key, collection)} iterator The function to invoke per iteration.
 * @param {Array|Object|string} collection The collection to iterate over.
 * @return {undefined} Because `each` is run only for side effects, always returns `undefined`.
 * @example
 * var log = console.log.bind(console);
 *
 * each(log, ['a', 'b', 'c']);
 * //-> 'a', 0, ['a', 'b', 'c']
 * //-> 'b', 1, ['a', 'b', 'c']
 * //-> 'c', 2, ['a', 'b', 'c']
 * //=> undefined
 *
 * each(log, 'tim');
 * //-> 't', 2, 'tim'
 * //-> 'i', 1, 'tim'
 * //-> 'm', 0, 'tim'
 * //=> undefined
 *
 * // Note: Iteration order not guaranteed across environments
 * each(log, { name: 'tim', occupation: 'enchanter' });
 * //-> 'tim', 'name', { name: 'tim', occupation: 'enchanter' }
 * //-> 'enchanter', 'occupation', { name: 'tim', occupation: 'enchanter' }
 * //=> undefined
 */
var each = function each(iterator, collection) {
  return (isArrayLike(collection) ? arrayEach : baseEach).call(this, iterator, collection);
};

/*
 * Exports.
 */

module.exports = each;

},{"@ndhoule/keys":38}],33:[function(require,module,exports){


module.exports = function() {};
;

},{}],34:[function(require,module,exports){

;
'use strict';

/*
 * Module dependencies.
 */

var each = require('@ndhoule/each');

/**
 * Check if a predicate function returns `true` for all values in a `collection`.
 * Checks owned, enumerable values and exits early when `predicate` returns
 * `false`.
 *
 * @name every
 * @param {Function} predicate The function used to test values.
 * @param {Array|Object|string} collection The collection to search.
 * @return {boolean} True if all values passes the predicate test, otherwise false.
 * @example
 * var isEven = function(num) { return num % 2 === 0; };
 *
 * every(isEven, []); // => true
 * every(isEven, [1, 2]); // => false
 * every(isEven, [2, 4, 6]); // => true
 */
var every = function every(predicate, collection) {
  if (typeof predicate !== 'function') {
    throw new TypeError('`predicate` must be a function but was a ' + typeof predicate);
  }

  var result = true;

  each(function(val, key, collection) {
    result = !!predicate(val, key, collection);

    // Exit early
    if (!result) {
      return false;
    }
  }, collection);

  return result;
};

/*
 * Exports.
 */

module.exports = every;

;

},{"@ndhoule/each":32}],35:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty;

/**
 * Copy the properties of one or more `objects` onto a destination object. Input objects are iterated over
 * in left-to-right order, so duplicate properties on later objects will overwrite those from
 * erevious ones. Only enumerable and own properties of the input objects are copied onto the
 * resulting object.
 *
 * @name extend
 * @api public
 * @category Object
 * @param {Object} dest The destination object.
 * @param {...Object} sources The source objects.
 * @return {Object} `dest`, extended with the properties of all `sources`.
 * @example
 * var a = { a: 'a' };
 * var b = { b: 'b' };
 * var c = { c: 'c' };
 *
 * extend(a, b, c);
 * //=> { a: 'a', b: 'b', c: 'c' };
 */
var extend = function extend(dest /*, sources */) {
  var sources = Array.prototype.slice.call(arguments, 1);

  for (var i = 0; i < sources.length; i += 1) {
    for (var key in sources[i]) {
      if (has.call(sources[i], key)) {
        dest[key] = sources[i][key];
      }
    }
  }

  return dest;
};

/*
 * Exports.
 */

module.exports = extend;

},{}],36:[function(require,module,exports){
'use strict';

/*
 * Module dependencies.
 */

var each = require('@ndhoule/each');

/**
 * Reduces all the values in a collection down into a single value. Does so by iterating through the
 * collection from left to right, repeatedly calling an `iterator` function and passing to it four
 * arguments: `(accumulator, value, index, collection)`.
 *
 * Returns the final return value of the `iterator` function.
 *
 * @name foldl
 * @api public
 * @param {Function} iterator The function to invoke per iteration.
 * @param {*} accumulator The initial accumulator value, passed to the first invocation of `iterator`.
 * @param {Array|Object} collection The collection to iterate over.
 * @return {*} The return value of the final call to `iterator`.
 * @example
 * foldl(function(total, n) {
 *   return total + n;
 * }, 0, [1, 2, 3]);
 * //=> 6
 *
 * var phonebook = { bob: '555-111-2345', tim: '655-222-6789', sheila: '655-333-1298' };
 *
 * foldl(function(results, phoneNumber) {
 *  if (phoneNumber[0] === '6') {
 *    return results.concat(phoneNumber);
 *  }
 *  return results;
 * }, [], phonebook);
 * // => ['655-222-6789', '655-333-1298']
 */
var foldl = function foldl(iterator, accumulator, collection) {
  if (typeof iterator !== 'function') {
    throw new TypeError('Expected a function but received a ' + typeof iterator);
  }

  each(function(val, i, collection) {
    accumulator = iterator(accumulator, val, i, collection);
  }, collection);

  return accumulator;
};

/*
 * Exports.
 */

module.exports = foldl;

},{"@ndhoule/each":32}],37:[function(require,module,exports){
'use strict';

/*
 * Module dependencies.
 */

var each = require('@ndhoule/each');

var strIndexOf = String.prototype.indexOf;

/**
 * Object.is/sameValueZero polyfill.
 *
 * @api private
 * @param {*} value1
 * @param {*} value2
 * @return {boolean}
 */
// TODO: Move to library
var sameValueZero = function sameValueZero(value1, value2) {
  // Normal values and check for 0 / -0
  if (value1 === value2) {
    return value1 !== 0 || 1 / value1 === 1 / value2;
  }
  // NaN
  return value1 !== value1 && value2 !== value2;
};

/**
 * Searches a given `collection` for a value, returning true if the collection
 * contains the value and false otherwise. Can search strings, arrays, and
 * objects.
 *
 * @name includes
 * @api public
 * @param {*} searchElement The element to search for.
 * @param {Object|Array|string} collection The collection to search.
 * @return {boolean}
 * @example
 * includes(2, [1, 2, 3]);
 * //=> true
 *
 * includes(4, [1, 2, 3]);
 * //=> false
 *
 * includes(2, { a: 1, b: 2, c: 3 });
 * //=> true
 *
 * includes('a', { a: 1, b: 2, c: 3 });
 * //=> false
 *
 * includes('abc', 'xyzabc opq');
 * //=> true
 *
 * includes('nope', 'xyzabc opq');
 * //=> false
 */
var includes = function includes(searchElement, collection) {
  var found = false;

  // Delegate to String.prototype.indexOf when `collection` is a string
  if (typeof collection === 'string') {
    return strIndexOf.call(collection, searchElement) !== -1;
  }

  // Iterate through enumerable/own array elements and object properties.
  each(function(value) {
    if (sameValueZero(value, searchElement)) {
      found = true;
      // Exit iteration early when found
      return false;
    }
  }, collection);

  return found;
};

/*
 * Exports.
 */

module.exports = includes;

},{"@ndhoule/each":32}],38:[function(require,module,exports){
'use strict';

var hop = Object.prototype.hasOwnProperty;
var strCharAt = String.prototype.charAt;
var toStr = Object.prototype.toString;

/**
 * Returns the character at a given index.
 *
 * @param {string} str
 * @param {number} index
 * @return {string|undefined}
 */
// TODO: Move to a library
var charAt = function(str, index) {
  return strCharAt.call(str, index);
};

/**
 * hasOwnProperty, wrapped as a function.
 *
 * @name has
 * @api private
 * @param {*} context
 * @param {string|number} prop
 * @return {boolean}
 */

// TODO: Move to a library
var has = function has(context, prop) {
  return hop.call(context, prop);
};

/**
 * Returns true if a value is a string, otherwise false.
 *
 * @name isString
 * @api private
 * @param {*} val
 * @return {boolean}
 */

// TODO: Move to a library
var isString = function isString(val) {
  return toStr.call(val) === '[object String]';
};

/**
 * Returns true if a value is array-like, otherwise false. Array-like means a
 * value is not null, undefined, or a function, and has a numeric `length`
 * property.
 *
 * @name isArrayLike
 * @api private
 * @param {*} val
 * @return {boolean}
 */
// TODO: Move to a library
var isArrayLike = function isArrayLike(val) {
  return val != null && (typeof val !== 'function' && typeof val.length === 'number');
};


/**
 * indexKeys
 *
 * @name indexKeys
 * @api private
 * @param {} target
 * @param {Function} pred
 * @return {Array}
 */
var indexKeys = function indexKeys(target, pred) {
  pred = pred || has;

  var results = [];

  for (var i = 0, len = target.length; i < len; i += 1) {
    if (pred(target, i)) {
      results.push(String(i));
    }
  }

  return results;
};

/**
 * Returns an array of an object's owned keys.
 *
 * @name objectKeys
 * @api private
 * @param {*} target
 * @param {Function} pred Predicate function used to include/exclude values from
 * the resulting array.
 * @return {Array}
 */
var objectKeys = function objectKeys(target, pred) {
  pred = pred || has;

  var results = [];

  for (var key in target) {
    if (pred(target, key)) {
      results.push(String(key));
    }
  }

  return results;
};

/**
 * Creates an array composed of all keys on the input object. Ignores any non-enumerable properties.
 * More permissive than the native `Object.keys` function (non-objects will not throw errors).
 *
 * @name keys
 * @api public
 * @category Object
 * @param {Object} source The value to retrieve keys from.
 * @return {Array} An array containing all the input `source`'s keys.
 * @example
 * keys({ likes: 'avocado', hates: 'pineapple' });
 * //=> ['likes', 'pineapple'];
 *
 * // Ignores non-enumerable properties
 * var hasHiddenKey = { name: 'Tim' };
 * Object.defineProperty(hasHiddenKey, 'hidden', {
 *   value: 'i am not enumerable!',
 *   enumerable: false
 * })
 * keys(hasHiddenKey);
 * //=> ['name'];
 *
 * // Works on arrays
 * keys(['a', 'b', 'c']);
 * //=> ['0', '1', '2']
 *
 * // Skips unpopulated indices in sparse arrays
 * var arr = [1];
 * arr[4] = 4;
 * keys(arr);
 * //=> ['0', '4']
 */
var keys = function keys(source) {
  if (source == null) {
    return [];
  }

  // IE6-8 compatibility (string)
  if (isString(source)) {
    return indexKeys(source, charAt);
  }

  // IE6-8 compatibility (arguments)
  if (isArrayLike(source)) {
    return indexKeys(source, has);
  }

  return objectKeys(source);
};

/*
 * Exports.
 */

module.exports = keys;

},{}],39:[function(require,module,exports){

;
'use strict';

/*
 * Module dependencies.
 */

var each = require('@ndhoule/each');

/**
 * Produce a new array by passing each value in the input `collection` through a transformative
 * `iterator` function. The `iterator` function is passed three arguments:
 * `(value, index, collection)`.
 *
 * @name map
 * @api public
 * @param {Function} iterator The transformer function to invoke per iteration.
 * @param {Array} collection The collection to iterate over.
 * @return {Array} A new array containing the results of each `iterator` invocation.
 * @example
 * var square = function(x) { return x * x; };
 *
 * map(square, [1, 2, 3]);
 * //=> [1, 4, 9]
 */
var map = function map(iterator, collection) {
  if (typeof iterator !== 'function') {
    throw new TypeError('Expected a function but received a ' + typeof iterator);
  }

  var result = [];

  each(function(val, i, collection) {
    result.push(iterator(val, i, collection));
  }, collection);

  return result;
};

/*
 * Exports.
 */

module.exports = map;

;

},{"@ndhoule/each":32}],40:[function(require,module,exports){
'use strict';

var objToString = Object.prototype.toString;

// TODO: Move to lib
var existy = function(val) {
  return val != null;
};

// TODO: Move to lib
var isArray = function(val) {
  return objToString.call(val) === '[object Array]';
};

// TODO: Move to lib
var isString = function(val) {
   return typeof val === 'string' || objToString.call(val) === '[object String]';
};

// TODO: Move to lib
var isObject = function(val) {
  return val != null && typeof val === 'object';
};

/**
 * Returns a copy of the new `object` containing only the specified properties.
 *
 * @name pick
 * @api public
 * @param {string|string[]} props The property or properties to keep.
 * @param {Object} object The object to iterate over.
 * @return {Object} A new object containing only the specified properties from `object`.
 * @example
 * var person = { name: 'Tim', occupation: 'enchanter', fears: 'rabbits' };
 *
 * pick('name', person);
 * //=> { name: 'Tim' }
 *
 * pick(['name', 'fears'], person);
 * //=> { name: 'Tim', fears: 'rabbits' }
 */
var pick = function pick(props, object) {
  if (!existy(object) || !isObject(object)) {
    return {};
  }

  if (isString(props)) {
    props = [props];
  }

  if (!isArray(props)) {
    props = [];
  }

  var result = {};

  for (var i = 0; i < props.length; i += 1) {
    if (isString(props[i]) && props[i] in object) {
      result[props[i]] = object[props[i]];
    }
  }

  return result;
};

/*
 * Exports.
 */

module.exports = pick;

},{}],41:[function(require,module,exports){
'use strict';

var max = Math.max;

/**
 * Produce a new array by passing each value in the input `collection` through a transformative
 * `iterator` function. The `iterator` function is passed three arguments:
 * `(value, index, collection)`.
 *
 * @name rest
 * @api public
 * @param {Array} collection The collection to iterate over.
 * @return {Array} A new array containing all but the first element from `collection`.
 * @example
 * rest([1, 2, 3]); // => [2, 3]
 */
var rest = function rest(collection) {
  if (collection == null || !collection.length) {
    return [];
  }

  // Preallocating an array *significantly* boosts performance when dealing with
  // `arguments` objects on v8. For a summary, see:
  // https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
  var results = new Array(max(collection.length - 2, 0));

  for (var i = 1; i < collection.length; i += 1) {
    results[i - 1] = collection[i];
  }

  return results;
};

/*
 * Exports.
 */

module.exports = rest;

},{}],42:[function(require,module,exports){

;
'use strict';

/*
 * Module dependencies.
 */

var keys = require('@ndhoule/keys');

/**
 * Returns an array containing all enumerable values from a `source` object.
 *
 * @name values
 * @api public
 * @category Object
 * @param {Object} source The object to retrieve values from.
 * @return {Array} An array of all the `source` object's values.
 * @example
 * values({ a: 1, b: 2, c: 3 });
 * //=> [1, 2, 3]
 */
var values = function values(source) {
  var ks = keys(source);
  var results = new Array(ks.length);

  for (var i = 0; i < ks.length; i += 1) {
    results[i] = source[ks[i]];
  }

  return results;
};

/*
 * Exports.
 */

module.exports = values;

;

},{"@ndhoule/keys":38}],43:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":44,"@segment/load-script":1202,"global-queue":1307}],44:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":45,"./statics":46,"@ndhoule/defaults":30,"component-bind":1277,"debug":48,"dup":7,"extend":47,"slug-component":1398}],45:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],46:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],47:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],48:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":49,"_process":1273,"dup":11}],49:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],50:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":51,"segmentio-facade":63}],51:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":52,"./statics":53,"@ndhoule/defaults":30,"component-bind":1277,"debug":54,"dup":7,"extend":56,"slug-component":1398}],52:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],53:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],54:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":55,"_process":1273,"dup":11}],55:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],56:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],57:[function(require,module,exports){
'use strict';

var get = require('obj-case');

/**
 * Add address getters to `proto`.
 *
 * @ignore
 * @param {Function} proto
 */
module.exports = function(proto) {
  proto.zip = trait('postalCode', 'zip');
  proto.country = trait('country');
  proto.street = trait('street');
  proto.state = trait('state');
  proto.city = trait('city');
  proto.region = trait('region');

  function trait(a, b) {
    return function() {
      var traits = this.traits();
      var props = this.properties ? this.properties() : {};

      return get(traits, 'address.' + a)
        || get(traits, a)
        || (b ? get(traits, 'address.' + b) : null)
        || (b ? get(traits, b) : null)
        || get(props, 'address.' + a)
        || get(props, a)
        || (b ? get(props, 'address.' + b) : null)
        || (b ? get(props, b) : null);
    };
  }
};

},{"obj-case":1365}],58:[function(require,module,exports){
'use strict';

var inherit = require('./utils').inherit;
var Facade = require('./facade');

/**
 * Initialize a new `Alias` facade with a `dictionary` of arguments.
 *
 * @param {Object} dictionary - The object to wrap.
 * @param {string} [dictionary.from] - The previous ID of the user.
 * @param {string} [dictionary.to] - The new ID of the user.
 * @param {Object} opts - Options about what kind of Facade to create.
 *
 * @augments Facade
 */
function Alias(dictionary, opts) {
  Facade.call(this, dictionary, opts);
}

inherit(Alias, Facade);

/**
 * Return the type of facade this is. This will always return `"alias"`.
 *
 * @return {string}
 */
Alias.prototype.action = function() {
  return 'alias';
};

/**
 * An alias for {@link Alias#action}.
 *
 * @function
 * @return {string}
 */
Alias.prototype.type = Alias.prototype.action;

/**
 * Get the user's previous ID from `previousId` or `from`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Alias.prototype.previousId = function() {
  return this.field('previousId') || this.field('from');
};

/**
 * An alias for {@link Alias#previousId}.
 *
 * @function
 * @return {string}
 */
Alias.prototype.from = Alias.prototype.previousId;

/**
 * Get the user's new ID from `userId` or `to`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Alias.prototype.userId = function() {
  return this.field('userId') || this.field('to');
};

/**
 * An alias for {@link Alias#userId}.
 *
 * @function
 * @return {string}
 */
Alias.prototype.to = Alias.prototype.userId;

module.exports = Alias;

},{"./facade":60,"./utils":68}],59:[function(require,module,exports){
'use strict';

var inherit = require('./utils').inherit;
var Facade = require('./facade');

/**
 * Initialize a new `Delete` facade with a `dictionary` of arguments.
 *
 * @param {Object} dictionary - The object to wrap.
 * @param {string} [dictionary.category] - The delete category.
 * @param {string} [dictionary.name] - The delete name.
 * @param {string} [dictionary.properties] - The delete properties.
 * @param {Object} opts - Options about what kind of Facade to create.
 *
 * @augments Facade
 */
function Delete(dictionary, opts) {
  Facade.call(this, dictionary, opts);
}

inherit(Delete, Facade);

/**
 * Return the type of facade this is. This will always return `"delete"`.
 *
 * @return {string}
 */
Delete.prototype.type = function() {
  return 'delete';
};

module.exports = Delete;

},{"./facade":60,"./utils":68}],60:[function(require,module,exports){
'use strict';

var address = require('./address');
var clone = require('./utils').clone;
var isEnabled = require('./is-enabled');
var newDate = require('new-date');
var objCase = require('obj-case');
var traverse = require('@segment/isodate-traverse');
var type = require('./utils').type;

/**
 * A *Facade* is an object meant for creating convience wrappers around
 * objects. When developing integrations, you probably want to look at its
 * subclasses, such as {@link Track} or {@link Identify}, rather than this
 * general-purpose class.
 *
 * This constructor will initialize a new `Facade` with an `obj` of arguments.
 *
 * If the inputted `obj` doesn't have a `timestamp` property, one will be added
 * with the value `new Date()`. Otherwise, the `timestamp` property will be
 * converted to a Date using the `new-date` package.
 *
 * By default, the inputted object will be defensively copied, and all ISO
 * strings present in the string will be converted into Dates.
 *
 * @param {Object} obj - The object to wrap.
 * @param {Object} opts - Options about what kind of Facade to create.
 * @param {boolean} [opts.clone=true] - Whether to make defensive clones. If enabled,
 * the inputted object will be cloned, and any objects derived from this facade
 * will be cloned before being returned.
 * @param {boolean} [opts.traverse=true] - Whether to perform ISODate-Traverse
 * on the inputted object.
 *
 * @see {@link https://github.com/segmentio/new-date|new-date}
 * @see {@link https://github.com/segmentio/isodate-traverse|isodate-traverse}
 */
function Facade(obj, opts) {
  opts = opts || {};
  if (!('clone' in opts)) opts.clone = true;
  if (opts.clone) obj = clone(obj);
  if (!('traverse' in opts)) opts.traverse = true;
  if (!('timestamp' in obj)) obj.timestamp = new Date();
  else obj.timestamp = newDate(obj.timestamp);
  if (opts.traverse) traverse(obj);
  this.opts = opts;
  this.obj = obj;
}

/**
 * Get a potentially-nested field in this facade. `field` should be a
 * period-separated sequence of properties.
 *
 * If the first field passed in points to a function (e.g. the `field` passed
 * in is `a.b.c` and this facade's `obj.a` is a function), then that function
 * will be called, and then the deeper fields will be fetched (using obj-case)
 * from what that function returns. If the first field isn't a function, then
 * this function works just like obj-case.
 *
 * Because this function uses obj-case, the camel- or snake-case of the input
 * is irrelevant.
 *
 * @example
 * YourClass.prototype.height = function() {
 *   return this.proxy('getDimensions.height') ||
 *     this.proxy('props.size.side_length');
 * }
 * @param {string} field - A sequence of properties, joined by periods (`.`).
 * @return {*} - A property of the inputted object.
 * @see {@link https://github.com/segmentio/obj-case|obj-case}
 */
Facade.prototype.proxy = function(field) {
  var fields = field.split('.');
  field = fields.shift();

  // Call a function at the beginning to take advantage of facaded fields
  var obj = this[field] || this.field(field);
  if (!obj) return obj;
  if (typeof obj === 'function') obj = obj.call(this) || {};
  if (fields.length === 0) return this.opts.clone ? transform(obj) : obj;

  obj = objCase(obj, fields.join('.'));
  return this.opts.clone ? transform(obj) : obj;
};

/**
 * Directly access a specific `field` from the underlying object. Only
 * "top-level" fields will work with this function. "Nested" fields *will not
 * work* with this function.
 *
 * @param {string} field
 * @return {*}
 */
Facade.prototype.field = function(field) {
  var obj = this.obj[field];
  return this.opts.clone ? transform(obj) : obj;
};

/**
 * Utility method to always proxy a particular `field`. In other words, it
 * returns a function that will always return `this.proxy(field)`.
 *
 * @example
 * MyClass.prototype.height = Facade.proxy('options.dimensions.height');
 *
 * @param {string} field
 * @return {Function}
 */
Facade.proxy = function(field) {
  return function() {
    return this.proxy(field);
  };
};

/**
 * Utility method to always access a `field`. In other words, it returns a
 * function that will always return `this.field(field)`.
 *
 * @param {string} field
 * @return {Function}
 */
Facade.field = function(field) {
  return function() {
    return this.field(field);
  };
};

/**
 * Create a helper function for fetching a "plural" thing.
 *
 * The generated method will take the inputted `path` and append an "s" to it
 * and calls `this.proxy` with this "pluralized" path. If that produces an
 * array, that will be returned. Otherwise, a one-element array containing
 * `this.proxy(path)` will be returned.
 *
 * @example
 * MyClass.prototype.birds = Facade.multi('animals.bird');
 *
 * @param {string} path
 * @return {Function}
 */
Facade.multi = function(path) {
  return function() {
    var multi = this.proxy(path + 's');
    if (type(multi) === 'array') return multi;
    var one = this.proxy(path);
    if (one) one = [this.opts.clone ? clone(one) : one];
    return one || [];
  };
};

/**
 * Create a helper function for getting a "singular" thing.
 *
 * The generated method will take the inputted path and call
 * `this.proxy(path)`. If a truthy thing is produced, it will be returned.
 * Otherwise, `this.proxy(path + 's')` will be called, and if that produces an
 * array the first element of that array will be returned. Otherwise,
 * `undefined` is returned.
 *
 * @example
 * MyClass.prototype.bird = Facade.one('animals.bird');
 *
 * @param {string} path
 * @return {Function}
 */
Facade.one = function(path) {
  return function() {
    var one = this.proxy(path);
    if (one) return one;
    var multi = this.proxy(path + 's');
    if (type(multi) === 'array') return multi[0];
  };
};

/**
 * Gets the underlying object this facade wraps around.
 *
 * If this facade has a property `type`, it will be invoked as a function and
 * will be assigned as the property `type` of the outputted object.
 *
 * @return {Object}
 */
Facade.prototype.json = function() {
  var ret = this.opts.clone ? clone(this.obj) : this.obj;
  if (this.type) ret.type = this.type();
  return ret;
};

/**
 * Get the options of a call. If an integration is passed, only the options for
 * that integration are included. If the integration is not enabled, then
 * `undefined` is returned.
 *
 * Options are taken from the `options` property of the underlying object,
 * falling back to the object's `context` or simply `{}`.
 *
 * @param {string} integration - The name of the integration to get settings
 * for. Casing does not matter.
 * @return {Object|undefined}
 */
Facade.prototype.options = function(integration) {
  var obj = this.obj.options || this.obj.context || {};
  var options = this.opts.clone ? clone(obj) : obj;
  if (!integration) return options;
  if (!this.enabled(integration)) return;
  var integrations = this.integrations();
  var value = integrations[integration] || objCase(integrations, integration);
  if (typeof value !== 'object') value = objCase(this.options(), integration);
  return typeof value === 'object' ? value : {};
};

/**
 * An alias for {@link Facade#options}.
 */
Facade.prototype.context = Facade.prototype.options;

/**
 * Check whether an integration is enabled.
 *
 * Basically, this method checks whether this integration is explicitly
 * enabled. If it isn'texplicitly mentioned, it checks whether it has been
 * enabled at the global level. Some integrations (e.g. Salesforce), cannot
 * enabled by these global event settings.
 *
 * More concretely, the deciding factors here are:
 *
 * 1. If `this.integrations()` has the integration set to `true`, return `true`.
 * 2. If `this.integrations().providers` has the integration set to `true`, return `true`.
 * 3. If integrations are set to default-disabled via global parameters (i.e.
 * `options.providers.all`, `options.all`, or `integrations.all`), then return
 * false.
 * 4. If the integration is one of the special default-deny integrations
 * (currently, only Salesforce), then return false.
 * 5. Else, return true.
 *
 * @param {string} integration
 * @return {boolean}
 */
Facade.prototype.enabled = function(integration) {
  var allEnabled = this.proxy('options.providers.all');
  if (typeof allEnabled !== 'boolean') allEnabled = this.proxy('options.all');
  if (typeof allEnabled !== 'boolean') allEnabled = this.proxy('integrations.all');
  if (typeof allEnabled !== 'boolean') allEnabled = true;

  var enabled = allEnabled && isEnabled(integration);
  var options = this.integrations();

  // If the integration is explicitly enabled or disabled, use that
  // First, check options.providers for backwards compatibility
  if (options.providers && options.providers.hasOwnProperty(integration)) {
    enabled = options.providers[integration];
  }

  // Next, check for the integration's existence in 'options' to enable it.
  // If the settings are a boolean, use that, otherwise it should be enabled.
  if (options.hasOwnProperty(integration)) {
    var settings = options[integration];
    if (typeof settings === 'boolean') {
      enabled = settings;
    } else {
      enabled = true;
    }
  }

  return !!enabled;
};

/**
 * Get all `integration` options.
 *
 * @ignore
 * @param {string} integration
 * @return {Object}
 */
Facade.prototype.integrations = function() {
  return this.obj.integrations || this.proxy('options.providers') || this.options();
};

/**
 * Check whether the user is active.
 *
 * @return {boolean}
 */
Facade.prototype.active = function() {
  var active = this.proxy('options.active');
  if (active === null || active === undefined) active = true;
  return active;
};

/**
 * Get `sessionId / anonymousId`.
 *
 * @return {*}
 */
Facade.prototype.anonymousId = function() {
  return this.field('anonymousId') || this.field('sessionId');
};

/**
 * An alias for {@link Facade#anonymousId}.
 *
 * @function
 * @return {string}
 */
Facade.prototype.sessionId = Facade.prototype.anonymousId;

/**
 * Get `groupId` from `context.groupId`.
 *
 * @function
 * @return {string}
 */
Facade.prototype.groupId = Facade.proxy('options.groupId');

/**
 * Get the call's "traits". All event types can pass in traits, though {@link
 * Identify} and {@link Group} override this implementation.
 *
 * Traits are gotten from `options.traits`, augmented with a property `id` with
 * the event's `userId`.
 *
 * The parameter `aliases` is meant to transform keys in `options.traits` into
 * new keys. Each alias like `{ "xxx": "yyy" }` will take whatever is at `xxx`
 * in the traits, and move it to `yyy`. If `xxx` is a method of this facade,
 * it'll be called as a function instead of treated as a key into the traits.
 *
 * @example
 * var obj = { options: { traits: { foo: "bar" } }, anonymousId: "xxx" }
 * var facade = new Facade(obj)
 *
 * facade.traits() // { "foo": "bar" }
 * facade.traits({ "foo": "asdf" }) // { "asdf": "bar" }
 * facade.traits({ "sessionId": "rofl" }) // { "rofl": "xxx" }
 *
 * @param {Object} aliases - A mapping from keys to the new keys they should be
 * transformed to.
 * @return {Object}
 */
Facade.prototype.traits = function(aliases) {
  var ret = this.proxy('options.traits') || {};
  var id = this.userId();
  aliases = aliases || {};

  if (id) ret.id = id;

  for (var alias in aliases) {
    var value = this[alias] == null ? this.proxy('options.traits.' + alias) : this[alias]();
    if (value == null) continue;
    ret[aliases[alias]] = value;
    delete ret[alias];
  }

  return ret;
};

/**
 * The library and version of the client used to produce the message.
 *
 * If the library name cannot be determined, it is set to `"unknown"`. If the
 * version cannot be determined, it is set to `null`.
 *
 * @return {{name: string, version: string}}
 */
Facade.prototype.library = function() {
  var library = this.proxy('options.library');
  if (!library) return { name: 'unknown', version: null };
  if (typeof library === 'string') return { name: library, version: null };
  return library;
};

/**
 * Return the device information, falling back to an empty object.
 *
 * Interesting values of `type` are `"ios"` and `"android"`, but other values
 * are possible if the client is doing something unusual with `context.device`.
 *
 * @return {{type: string}}
 */
Facade.prototype.device = function() {
  var device = this.proxy('context.device');
  if (type(device) !== 'object') device = {};
  var library = this.library().name;
  if (device.type) return device;

  if (library.indexOf('ios') > -1) device.type = 'ios';
  if (library.indexOf('android') > -1) device.type = 'android';
  return device;
};

/**
 * Get the User-Agent from `context.userAgent`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return string
 */
Facade.prototype.userAgent = Facade.proxy('context.userAgent');

/**
 * Get the timezone from `context.timezone`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return string
 */
Facade.prototype.timezone = Facade.proxy('context.timezone');

/**
 * Get the timestamp from `context.timestamp`.
 *
 * @function
 * @return string
 */
Facade.prototype.timestamp = Facade.field('timestamp');

/**
 * Get the channel from `channel`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return string
 */
Facade.prototype.channel = Facade.field('channel');

/**
 * Get the IP address from `context.ip`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return string
 */
Facade.prototype.ip = Facade.proxy('context.ip');

/**
 * Get the user ID from `userId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return string
 */
Facade.prototype.userId = Facade.field('userId');

/**
 * Get the ZIP/Postal code from `traits`, `traits.address`, `properties`, or
 * `properties.address`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @name zip
 * @function
 * @memberof Facade.prototype
 * @return {string}
 */

/**
 * Get the country from `traits`, `traits.address`, `properties`, or
 * `properties.address`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @name country
 * @function
 * @memberof Facade.prototype
 * @return {string}
 */

/**
 * Get the street from `traits`, `traits.address`, `properties`, or
 * `properties.address`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @name street
 * @function
 * @memberof Facade.prototype
 * @return {string}
 */

/**
 * Get the state from `traits`, `traits.address`, `properties`, or
 * `properties.address`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @name state
 * @function
 * @memberof Facade.prototype
 * @return {string}
 */

/**
 * Get the city from `traits`, `traits.address`, `properties`, or
 * `properties.address`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @name city
 * @function
 * @memberof Facade.prototype
 * @return {string}
 */

/**
 * Get the region from `traits`, `traits.address`, `properties`, or
 * `properties.address`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @name region
 * @function
 * @memberof Facade.prototype
 * @return {string}
 */

address(Facade.prototype);

/**
 * Return the cloned and traversed object
 *
 * @ignore
 * @param {*} obj
 * @return {*}
 */
function transform(obj) {
  return clone(obj);
}

module.exports = Facade;

},{"./address":57,"./is-enabled":64,"./utils":68,"@segment/isodate-traverse":1200,"new-date":1356,"obj-case":1365}],61:[function(require,module,exports){
'use strict';

var inherit = require('./utils').inherit;
var isEmail = require('is-email');
var newDate = require('new-date');
var Facade = require('./facade');

/**
 * Initialize a new `Group` facade with a `dictionary` of arguments.
 *
 * @param {Object} dictionary - The object to wrap.
 * @param {string} [dictionary.userId] - The user to add to the group.
 * @param {string} [dictionary.groupId] - The ID of the group.
 * @param {Object} [dictionary.traits] - The traits of the group.
 * @param {Object} opts - Options about what kind of Facade to create.
 *
 * @augments Facade
 */
function Group(dictionary, opts) {
  Facade.call(this, dictionary, opts);
}

inherit(Group, Facade);

/**
 * Return the type of facade this is. This will always return `"group"`.
 *
 * @return {string}
 */
Group.prototype.action = function() {
  return 'group';
};

/**
 * An alias for {@link Group#action}.
 *
 * @function
 * @return {string}
 */
Group.prototype.type = Group.prototype.action;

/**
 * Get the group ID from `groupId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Group.prototype.groupId = Facade.field('groupId');

/**
 * Get the time of creation of the group from `traits.createdAt`,
 * `traits.created`, `properties.createdAt`, or `properties.created`.
 *
 * @return {Date}
 */
Group.prototype.created = function() {
  var created = this.proxy('traits.createdAt')
    || this.proxy('traits.created')
    || this.proxy('properties.createdAt')
    || this.proxy('properties.created');

  if (created) return newDate(created);
};

/**
 * Get the group's email from `traits.email`, falling back to `groupId` only if
 * it looks like a valid email.
 *
 * @return {string}
 */
Group.prototype.email = function() {
  var email = this.proxy('traits.email');
  if (email) return email;
  var groupId = this.groupId();
  if (isEmail(groupId)) return groupId;
};

/**
 * Get the group's traits. This is identical to how {@link Facade#traits}
 * works, except it looks at `traits.*` instead of `options.traits.*`.
 *
 * Traits are gotten from `traits`, augmented with a property `id` with
 * the event's `groupId`.
 *
 * The parameter `aliases` is meant to transform keys in `traits` into new
 * keys. Each alias like `{ "xxx": "yyy" }` will take whatever is at `xxx` in
 * the traits, and move it to `yyy`. If `xxx` is a method of this facade, it'll
 * be called as a function instead of treated as a key into the traits.
 *
 * @example
 * var obj = { traits: { foo: "bar" }, anonymousId: "xxx" }
 * var group = new Group(obj)
 *
 * group.traits() // { "foo": "bar" }
 * group.traits({ "foo": "asdf" }) // { "asdf": "bar" }
 * group.traits({ "sessionId": "rofl" }) // { "rofl": "xxx" }
 *
 * @param {Object} aliases - A mapping from keys to the new keys they should be
 * transformed to.
 * @return {Object}
 */
Group.prototype.traits = function(aliases) {
  var ret = this.properties();
  var id = this.groupId();
  aliases = aliases || {};

  if (id) ret.id = id;

  for (var alias in aliases) {
    var value = this[alias] == null ? this.proxy('traits.' + alias) : this[alias]();
    if (value == null) continue;
    ret[aliases[alias]] = value;
    delete ret[alias];
  }

  return ret;
};

/**
 * Get the group's name from `traits.name`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Group.prototype.name = Facade.proxy('traits.name');

/**
 * Get the group's industry from `traits.industry`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Group.prototype.industry = Facade.proxy('traits.industry');

/**
 * Get the group's employee count from `traits.employees`.
 *
 * This *should* be a number, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {number}
 */
Group.prototype.employees = Facade.proxy('traits.employees');

/**
 * Get the group's properties from `traits` or `properties`, falling back to
 * simply an empty object.
 *
 * @return {Object}
 */
Group.prototype.properties = function() {
  // TODO remove this function
  return this.field('traits') || this.field('properties') || {};
};

module.exports = Group;

},{"./facade":60,"./utils":68,"is-email":1317,"new-date":1356}],62:[function(require,module,exports){
'use strict';

var Facade = require('./facade');
var get = require('obj-case');
var inherit = require('./utils').inherit;
var isEmail = require('is-email');
var newDate = require('new-date');
var trim = require('trim');
var type = require('./utils').type;

/**
 * Initialize a new `Identify` facade with a `dictionary` of arguments.
 *
 * @param {Object} dictionary - The object to wrap.
 * @param {string} [dictionary.userId] - The ID of the user.
 * @param {string} [dictionary.anonymousId] - The anonymous ID of the user.
 * @param {string} [dictionary.traits] - The user's traits.
 * @param {Object} opts - Options about what kind of Facade to create.
 *
 * @augments Facade
 */
function Identify(dictionary, opts) {
  Facade.call(this, dictionary, opts);
}

inherit(Identify, Facade);

/**
 * Return the type of facade this is. This will always return `"identify"`.
 *
 * @return {string}
 */
Identify.prototype.action = function() {
  return 'identify';
};

/**
 * An alias for {@link Identify#action}.
 *
 * @function
 * @return {string}
 */
Identify.prototype.type = Identify.prototype.action;

/**
 * Get the user's traits. This is identical to how {@link Facade#traits} works,
 * except it looks at `traits.*` instead of `options.traits.*`.
 *
 * Traits are gotten from `traits`, augmented with a property `id` with
 * the event's `userId`.
 *
 * The parameter `aliases` is meant to transform keys in `traits` into new
 * keys. Each alias like `{ "xxx": "yyy" }` will take whatever is at `xxx` in
 * the traits, and move it to `yyy`. If `xxx` is a method of this facade, it'll
 * be called as a function instead of treated as a key into the traits.
 *
 * @example
 * var obj = { traits: { foo: "bar" }, anonymousId: "xxx" }
 * var identify = new Identify(obj)
 *
 * identify.traits() // { "foo": "bar" }
 * identify.traits({ "foo": "asdf" }) // { "asdf": "bar" }
 * identify.traits({ "sessionId": "rofl" }) // { "rofl": "xxx" }
 *
 * @param {Object} aliases - A mapping from keys to the new keys they should be
 * transformed to.
 * @return {Object}
 */
Identify.prototype.traits = function(aliases) {
  var ret = this.field('traits') || {};
  var id = this.userId();
  aliases = aliases || {};

  if (id) ret.id = id;

  for (var alias in aliases) {
    var value = this[alias] == null ? this.proxy('traits.' + alias) : this[alias]();
    if (value == null) continue;
    ret[aliases[alias]] = value;
    if (alias !== aliases[alias]) delete ret[alias];
  }

  return ret;
};

/**
 * Get the user's email from `traits.email`, falling back to `userId` only if
 * it looks like a valid email.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Identify.prototype.email = function() {
  var email = this.proxy('traits.email');
  if (email) return email;

  var userId = this.userId();
  if (isEmail(userId)) return userId;
};

/**
 * Get the time of creation of the user from `traits.created` or
 * `traits.createdAt`.
 *
 * @return {Date}
 */
Identify.prototype.created = function() {
  var created = this.proxy('traits.created') || this.proxy('traits.createdAt');
  if (created) return newDate(created);
};

/**
 * Get the time of creation of the user's company from `traits.company.created`
 * or `traits.company.createdAt`.
 *
 * @return {Date}
 */
Identify.prototype.companyCreated = function() {
  var created = this.proxy('traits.company.created') || this.proxy('traits.company.createdAt');

  if (created) {
    return newDate(created);
  }
};

/**
 * Get the user's company name from `traits.company.name`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Identify.prototype.companyName = function() {
  return this.proxy('traits.company.name');
};

/**
 * Get the user's name `traits.name`, falling back to combining {@link
 * Identify#firstName} and {@link Identify#lastName} if possible.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Identify.prototype.name = function() {
  var name = this.proxy('traits.name');
  if (typeof name === 'string') {
    return trim(name);
  }

  var firstName = this.firstName();
  var lastName = this.lastName();
  if (firstName && lastName) {
    return trim(firstName + ' ' + lastName);
  }
};

/**
 * Get the user's first name from `traits.firstName`, optionally splitting it
 * out of a the full name if that's all that was provided.
 *
 * Splitting the full name works on the assumption that the full name is of the
 * form "FirstName LastName"; it will not work for non-Western names.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Identify.prototype.firstName = function() {
  var firstName = this.proxy('traits.firstName');
  if (typeof firstName === 'string') {
    return trim(firstName);
  }

  var name = this.proxy('traits.name');
  if (typeof name === 'string') {
    return trim(name).split(' ')[0];
  }
};

/**
 * Get the user's last name from `traits.lastName`, optionally splitting it out
 * of a the full name if that's all that was provided.
 *
 * Splitting the full name works on the assumption that the full name is of the
 * form "FirstName LastName"; it will not work for non-Western names.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Identify.prototype.lastName = function() {
  var lastName = this.proxy('traits.lastName');
  if (typeof lastName === 'string') {
    return trim(lastName);
  }

  var name = this.proxy('traits.name');
  if (typeof name !== 'string') {
    return;
  }

  var space = trim(name).indexOf(' ');
  if (space === -1) {
    return;
  }

  return trim(name.substr(space + 1));
};

/**
 * Get the user's "unique id" from `userId`, `traits.username`, or
 * `traits.email`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Identify.prototype.uid = function() {
  return this.userId() || this.username() || this.email();
};

/**
 * Get the user's description from `traits.description` or `traits.background`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Identify.prototype.description = function() {
  return this.proxy('traits.description') || this.proxy('traits.background');
};

/**
 * Get the user's age from `traits.age`, falling back to computing it from
 * `traits.birthday` and the current time.
 *
 * @return {number}
 */
Identify.prototype.age = function() {
  var date = this.birthday();
  var age = get(this.traits(), 'age');
  if (age != null) return age;
  if (type(date) !== 'date') return;
  var now = new Date();
  return now.getFullYear() - date.getFullYear();
};

/**
 * Get the URL of the user's avatar from `traits.avatar`, `traits.photoUrl`, or
 * `traits.avatarUrl`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Identify.prototype.avatar = function() {
  var traits = this.traits();
  return get(traits, 'avatar') || get(traits, 'photoUrl') || get(traits, 'avatarUrl');
};

/**
 * Get the user's job position from `traits.position` or `traits.jobTitle`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Identify.prototype.position = function() {
  var traits = this.traits();
  return get(traits, 'position') || get(traits, 'jobTitle');
};

/**
 * Get the user's username from `traits.username`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Identify.prototype.username = Facade.proxy('traits.username');

/**
 * Get the user's website from `traits.website`, or if there are multiple in
 * `traits.websites`, return the first one.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Identify.prototype.website = Facade.one('traits.website');

/**
 * Get the user's websites from `traits.websites`, or if there is only one in
 * `traits.website`, then wrap it in an array.
 *
 * This *should* be an array of strings, but may not be if the client isn't
 * adhering to the spec.
 *
 * @function
 * @return {array}
 */
Identify.prototype.websites = Facade.multi('traits.website');

/**
 * Get the user's phone number from `traits.phone`, or if there are multiple in
 * `traits.phones`, return the first one.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Identify.prototype.phone = Facade.one('traits.phone');

/**
 * Get the user's phone numbers from `traits.phones`, or if there is only one
 * in `traits.phone`, then wrap it in an array.
 *
 * This *should* be an array of strings, but may not be if the client isn't
 * adhering to the spec.
 *
 * @function
 * @return {array}
 */
Identify.prototype.phones = Facade.multi('traits.phone');

/**
 * Get the user's address from `traits.address`.
 *
 * This *should* be an object, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {object}
 */
Identify.prototype.address = Facade.proxy('traits.address');

/**
 * Get the user's gender from `traits.gender`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Identify.prototype.gender = Facade.proxy('traits.gender');

/**
 * Get the user's birthday from `traits.birthday`.
 *
 * This *should* be a Date if `opts.traverse` was enabled (it is by default)
 * when constructing this Identify. Otherwise, it should be a string. But it
 * may be neither if the client isn't adhering to the spec.
 * spec.
 *
 * @function
 * @return {object}
 */
Identify.prototype.birthday = Facade.proxy('traits.birthday');

module.exports = Identify;

},{"./facade":60,"./utils":68,"is-email":1317,"new-date":1356,"obj-case":1365,"trim":1413}],63:[function(require,module,exports){
'use strict';

var Facade = require('./facade');

Facade.Alias = require('./alias');
Facade.Group = require('./group');
Facade.Identify = require('./identify');
Facade.Track = require('./track');
Facade.Page = require('./page');
Facade.Screen = require('./screen');
Facade.Delete = require('./delete');

module.exports = Facade;

},{"./alias":58,"./delete":59,"./facade":60,"./group":61,"./identify":62,"./page":65,"./screen":66,"./track":67}],64:[function(require,module,exports){
'use strict';

// A few integrations are disabled by default. They must be explicitly enabled
// by setting options[Provider] = true.
var disabled = {
  Salesforce: true
};

/**
 * Check whether an integration should be enabled by default.
 *
 * @ignore
 * @param {string} integration
 * @return {boolean}
 */
module.exports = function(integration) {
  return !disabled[integration];
};

},{}],65:[function(require,module,exports){
'use strict';

var inherit = require('./utils').inherit;
var Facade = require('./facade');
var Track = require('./track');
var isEmail = require('is-email');

/**
 * Initialize a new `Page` facade with a `dictionary` of arguments.
 *
 * @param {Object} dictionary - The object to wrap.
 * @param {string} [dictionary.category] - The page category.
 * @param {string} [dictionary.name] - The page name.
 * @param {string} [dictionary.properties] - The page properties.
 * @param {Object} opts - Options about what kind of Facade to create.
 *
 * @augments Facade
 */
function Page(dictionary, opts) {
  Facade.call(this, dictionary, opts);
}

inherit(Page, Facade);

/**
 * Return the type of facade this is. This will always return `"page"`.
 *
 * @return {string}
 */
Page.prototype.action = function() {
  return 'page';
};

/**
 * An alias for {@link Page#action}.
 *
 * @function
 * @return {string}
 */
Page.prototype.type = Page.prototype.action;

/**
 * Get the page category from `category`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Page.prototype.category = Facade.field('category');

/**
 * Get the page name from `name`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Page.prototype.name = Facade.field('name');

/**
 * Get the page title from `properties.title`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Page.prototype.title = Facade.proxy('properties.title');

/**
 * Get the page path from `properties.path`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Page.prototype.path = Facade.proxy('properties.path');

/**
 * Get the page URL from `properties.url`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Page.prototype.url = Facade.proxy('properties.url');

/**
 * Get the HTTP referrer from `context.referrer.url`, `context.page.referrer`,
 * or `properties.referrer`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Page.prototype.referrer = function() {
  return this.proxy('context.referrer.url')
    || this.proxy('context.page.referrer')
    || this.proxy('properties.referrer');
};

/**
 * Get the page's properties. This is identical to how {@link Facade#traits}
 * works, except it looks at `properties.*` instead of `options.traits.*`.
 *
 * Properties are gotten from `properties`, augmented with the page's `name`
 * and `category`.
 *
 * The parameter `aliases` is meant to transform keys in `properties` into new
 * keys. Each alias like `{ "xxx": "yyy" }` will take whatever is at `xxx` in
 * the traits, and move it to `yyy`. If `xxx` is a method of this facade, it'll
 * be called as a function instead of treated as a key into the traits.
 *
 * @example
 * var obj = { properties: { foo: "bar" }, anonymousId: "xxx" }
 * var page = new Page(obj)
 *
 * page.traits() // { "foo": "bar" }
 * page.traits({ "foo": "asdf" }) // { "asdf": "bar" }
 * page.traits({ "sessionId": "rofl" }) // { "rofl": "xxx" }
 *
 * @param {Object} aliases - A mapping from keys to the new keys they should be
 * transformed to.
 * @return {Object}
 */
Page.prototype.properties = function(aliases) {
  var props = this.field('properties') || {};
  var category = this.category();
  var name = this.name();
  aliases = aliases || {};

  if (category) props.category = category;
  if (name) props.name = name;

  for (var alias in aliases) {
    var value = this[alias] == null
      ? this.proxy('properties.' + alias)
      : this[alias]();
    if (value == null) continue;
    props[aliases[alias]] = value;
    if (alias !== aliases[alias]) delete props[alias];
  }

  return props;
};

/**
 * Get the user's email from `context.traits.email` or `properties.email`,
 * falling back to `userId` if it's a valid email.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Page.prototype.email = function() {
  var email = this.proxy('context.traits.email') || this.proxy('properties.email');
  if (email) return email;

  var userId = this.userId();
  if (isEmail(userId)) return userId;
};

/**
 * Get the page fullName. This is `$category $name` if both are present, and
 * just `name` otherwiser.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Page.prototype.fullName = function() {
  var category = this.category();
  var name = this.name();
  return name && category
    ? category + ' ' + name
    : name;
};

/**
 * Get an event name from this page call. If `name` is present, this will be
 * `Viewed $name Page`; otherwise, it will be `Loaded a Page`.
 *
 * @param {string} name - The name of this page.
 * @return {string}
 */
Page.prototype.event = function(name) {
  return name
    ? 'Viewed ' + name + ' Page'
    : 'Loaded a Page';
};

/**
 * Convert this Page to a {@link Track} facade. The inputted `name` will be
 * converted to the Track's event name via {@link Page#event}.
 *
 * @param {string} name
 * @return {Track}
 */
Page.prototype.track = function(name) {
  var json = this.json();
  json.event = this.event(name);
  json.timestamp = this.timestamp();
  json.properties = this.properties();
  return new Track(json, this.opts);
};

module.exports = Page;

},{"./facade":60,"./track":67,"./utils":68,"is-email":1317}],66:[function(require,module,exports){
'use strict';

var inherit = require('./utils').inherit;
var Page = require('./page');
var Track = require('./track');

/**
 * Initialize a new `Screen` facade with a `dictionary` of arguments.
 *
 * Note that this class extends {@link Page}, so its methods are available to
 * instances of this class as well.
 *
 * @param {Object} dictionary - The object to wrap.
 * @param {string} [dictionary.category] - The page category.
 * @param {string} [dictionary.name] - The page name.
 * @param {string} [dictionary.properties] - The page properties.
 * @param {Object} opts - Options about what kind of Facade to create.
 *
 * @augments Page
 */
function Screen(dictionary, opts) {
  Page.call(this, dictionary, opts);
}

inherit(Screen, Page);

/**
 * Return the type of facade this is. This will always return `"screen"`.
 *
 * @return {string}
 */
Screen.prototype.action = function() {
  return 'screen';
};

/**
 * An alias for {@link Screen#action}.
 *
 * @function
 * @return {string}
 */
Screen.prototype.type = Screen.prototype.action;

/**
 * Get an event name from this screen call. If `name` is present, this will be
 * `Viewed $name Screen`; otherwise, it will be `Loaded a Screen`.
 *
 * @param {string} name - The name of this screen.
 * @return {string}
 */
Screen.prototype.event = function(name) {
  return name ? 'Viewed ' + name + ' Screen' : 'Loaded a Screen';
};

/**
 * Convert this Screen to a {@link Track} facade. The inputted `name` will be
 * converted to the Track's event name via {@link Screen#event}.
 *
 * @param {string} name
 * @return {Track}
 */
Screen.prototype.track = function(name) {
  var json = this.json();
  json.event = this.event(name);
  json.timestamp = this.timestamp();
  json.properties = this.properties();
  return new Track(json, this.opts);
};

module.exports = Screen;

},{"./page":65,"./track":67,"./utils":68}],67:[function(require,module,exports){
'use strict';

var inherit = require('./utils').inherit;
var type = require('./utils').type;
var Facade = require('./facade');
var Identify = require('./identify');
var isEmail = require('is-email');
var get = require('obj-case');

/**
 * Initialize a new `Track` facade with a `dictionary` of arguments.
 *
 * @param {Object} dictionary - The object to wrap.
 * @param {string} [dictionary.event] - The name of the event being tracked.
 * @param {string} [dictionary.userId] - The ID of the user being tracked.
 * @param {string} [dictionary.anonymousId] - The anonymous ID of the user.
 * @param {string} [dictionary.properties] - Properties of the track event.
 * @param {Object} opts - Options about what kind of Facade to create.
 *
 * @augments Facade
 */
function Track(dictionary, opts) {
  Facade.call(this, dictionary, opts);
}

inherit(Track, Facade);

/**
 * Return the type of facade this is. This will always return `"track"`.
 *
 * @return {string}
 */
Track.prototype.action = function() {
  return 'track';
};

/**
 * An alias for {@link Track#action}.
 *
 * @function
 * @return {string}
 */
Track.prototype.type = Track.prototype.action;

/**
 * Get the event name from `event`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.event = Facade.field('event');

/**
 * Get the event value, usually the monetary value, from `properties.value`.
 *
 * This *should* be a number, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.value = Facade.proxy('properties.value');

/**
 * Get the event cateogry from `properties.category`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.category = Facade.proxy('properties.category');

/**
 * Get the event ID from `properties.id`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.id = Facade.proxy('properties.id');

/**
 * Get the product ID from `properties.productId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.productId = function() {
  return this.proxy('properties.product_id') || this.proxy('properties.productId');
};

/**
 * Get the promotion ID from `properties.promotionId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.promotionId = function() {
  return this.proxy('properties.promotion_id') || this.proxy('properties.promotionId');
};

/**
 * Get the cart ID from `properties.cartId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.cartId = function() {
  return this.proxy('properties.cart_id') || this.proxy('properties.cartId');
};

/**
 * Get the checkout ID from `properties.checkoutId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.checkoutId = function() {
  return this.proxy('properties.checkout_id') || this.proxy('properties.checkoutId');
};

/**
 * Get the payment ID from `properties.paymentId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.paymentId = function() {
  return this.proxy('properties.payment_id') || this.proxy('properties.paymentId');
};

/**
 * Get the coupon ID from `properties.couponId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.couponId = function() {
  return this.proxy('properties.coupon_id') || this.proxy('properties.couponId');
};

/**
 * Get the wishlist ID from `properties.wishlistId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.wishlistId = function() {
  return this.proxy('properties.wishlist_id') || this.proxy('properties.wishlistId');
};

/**
 * Get the review ID from `properties.reviewId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.reviewId = function() {
  return this.proxy('properties.review_id') || this.proxy('properties.reviewId');
};

/**
 * Get the order ID from `properties.id` or `properties.orderId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.orderId = function() {
  // doesn't follow above convention since this fallback order was how it used to be
  return this.proxy('properties.id')
    || this.proxy('properties.order_id')
    || this.proxy('properties.orderId');
};

/**
 * Get the SKU from `properties.sku`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.sku = Facade.proxy('properties.sku');

/**
 * Get the amount of tax for this purchase from `properties.tax`.
 *
 * This *should* be a number, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {number}
 */
Track.prototype.tax = Facade.proxy('properties.tax');

/**
 * Get the name of this event from `properties.name`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.name = Facade.proxy('properties.name');

/**
 * Get the price of this purchase from `properties.price`.
 *
 * This *should* be a number, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {number}
 */
Track.prototype.price = Facade.proxy('properties.price');

/**
 * Get the total for this purchase from `properties.total`.
 *
 * This *should* be a number, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {number}
 */
Track.prototype.total = Facade.proxy('properties.total');

/**
 * Whether this is a repeat purchase from `properties.repeat`.
 *
 * This *should* be a boolean, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {boolean}
 */
Track.prototype.repeat = Facade.proxy('properties.repeat');

/**
 * Get the coupon for this purchase from `properties.coupon`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.coupon = Facade.proxy('properties.coupon');

/**
 * Get the shipping for this purchase from `properties.shipping`.
 *
 * This *should* be a number, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {number}
 */
Track.prototype.shipping = Facade.proxy('properties.shipping');

/**
 * Get the discount for this purchase from `properties.discount`.
 *
 * This *should* be a number, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {number}
 */
Track.prototype.discount = Facade.proxy('properties.discount');

/**
 * Get the shipping method for this purchase from `properties.shippingMethod`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.shippingMethod = function() {
  return this.proxy('properties.shipping_method') || this.proxy('properties.shippingMethod');
};

/**
 * Get the payment method for this purchase from `properties.paymentMethod`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.paymentMethod = function() {
  return this.proxy('properties.payment_method') || this.proxy('properties.paymentMethod');
};

/**
 * Get a description for this event from `properties.description`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.description = Facade.proxy('properties.description');

/**
 * Get a plan, as in the plan the user is on, for this event from
 * `properties.plan`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.plan = Facade.proxy('properties.plan');

/**
 * Get the subtotal for this purchase from `properties.subtotal`.
 *
 * If `properties.subtotal` isn't available, then fall back to computing the
 * total from `properties.total` or `properties.revenue`, and then subtracting
 * tax, shipping, and discounts.
 *
 * If neither subtotal, total, nor revenue are available, then return 0.
 *
 * @return {number}
 */
Track.prototype.subtotal = function() {
  var subtotal = get(this.properties(), 'subtotal');
  var total = this.total() || this.revenue();

  if (subtotal) return subtotal;
  if (!total) return 0;

  if (this.total()) {
    var n = this.tax();
    if (n) total -= n;
    n = this.shipping();
    if (n) total -= n;
    n = this.discount();
    if (n) total += n;
  }

  return total;
};

/**
 * Get the products for this event from `properties.products` if it's an
 * array, falling back to an empty array.
 *
 * @return {Array}
 */
Track.prototype.products = function() {
  var props = this.properties();
  var products = get(props, 'products');
  return type(products) === 'array' ? products : [];
};

/**
 * Get the quantity for this event from `properties.quantity`, falling back to
 * a quantity of one.
 *
 * @return {number}
 */
Track.prototype.quantity = function() {
  var props = this.obj.properties || {};
  return props.quantity || 1;
};

/**
 * Get the currency for this event from `properties.currency`, falling back to
 * "USD".
 *
 * @return {string}
 */
Track.prototype.currency = function() {
  var props = this.obj.properties || {};
  return props.currency || 'USD';
};

/**
 * Get the referrer for this event from `context.referrer.url`,
 * `context.page.referrer`, or `properties.referrer`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.referrer = function() {
  // TODO re-examine whether this function is necessary
  return this.proxy('context.referrer.url')
    || this.proxy('context.page.referrer')
    || this.proxy('properties.referrer');
};

/**
 * Get the query for this event from `options.query`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string|object}
 */
Track.prototype.query = Facade.proxy('options.query');

/**
 * Get the page's properties. This is identical to how {@link Facade#traits}
 * works, except it looks at `properties.*` instead of `options.traits.*`.
 *
 * Properties are gotten from `properties`.
 *
 * The parameter `aliases` is meant to transform keys in `properties` into new
 * keys. Each alias like `{ "xxx": "yyy" }` will take whatever is at `xxx` in
 * the traits, and move it to `yyy`. If `xxx` is a method of this facade, it'll
 * be called as a function instead of treated as a key into the traits.
 *
 * @example
 * var obj = { properties: { foo: "bar" }, anonymousId: "xxx" }
 * var track = new Track(obj)
 *
 * track.traits() // { "foo": "bar" }
 * track.traits({ "foo": "asdf" }) // { "asdf": "bar" }
 * track.traits({ "sessionId": "rofl" }) // { "rofl": "xxx" }
 *
 * @param {Object} aliases - A mapping from keys to the new keys they should be
 * transformed to.
 * @return {Object}
 */
Track.prototype.properties = function(aliases) {
  var ret = this.field('properties') || {};
  aliases = aliases || {};

  for (var alias in aliases) {
    var value = this[alias] == null ? this.proxy('properties.' + alias) : this[alias]();
    if (value == null) continue;
    ret[aliases[alias]] = value;
    delete ret[alias];
  }

  return ret;
};

/**
 * Get the username of the user for this event from `traits.username`,
 * `properties.username`, `userId`, or `anonymousId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string|undefined}
 */
Track.prototype.username = function() {
  return this.proxy('traits.username')
    || this.proxy('properties.username')
    || this.userId()
    || this.sessionId();
};

/**
 * Get the email of the user for this event from `trais.email`,
 * `properties.email`, or `options.traits.email`, falling back to `userId` if
 * it looks like a valid email.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string|undefined}
 */
Track.prototype.email = function() {
  var email = this.proxy('traits.email')
    || this.proxy('properties.email')
    || this.proxy('options.traits.email');
  if (email) return email;

  var userId = this.userId();
  if (isEmail(userId)) return userId;
};

/**
 * Get the revenue for this event.
 *
 * If this is an "Order Completed" event, this will be the `properties.total`
 * falling back to the `properties.revenue`. For all other events, this is
 * simply taken from `properties.revenue`.
 *
 * If there are dollar signs in these properties, they will be removed. The
 * result will be parsed into a number.
 *
 * @return {number}
 */
Track.prototype.revenue = function() {
  var revenue = this.proxy('properties.revenue');
  var event = this.event();
  var orderCompletedRegExp = /^[ _]?completed[ _]?order[ _]?|^[ _]?order[ _]?completed[ _]?$/i;

  // it's always revenue, unless it's called during an order completion.
  if (!revenue && event && event.match(orderCompletedRegExp)) {
    revenue = this.proxy('properties.total');
  }

  return currency(revenue);
};

/**
 * Get the revenue for this event in "cents" -- in other words, multiply the
 * {@link Track#revenue} by 100, or return 0 if there isn't a numerical revenue
 * for this event.
 *
 * @return {number}
 */
Track.prototype.cents = function() {
  var revenue = this.revenue();
  return typeof revenue !== 'number' ? this.value() || 0 : revenue * 100;
};

/**
 * Convert this event into an {@link Identify} facade.
 *
 * This works by taking this event's underlying object and creating an Identify
 * from it. This event's traits, taken from `options.traits`, will be used as
 * the Identify's traits.
 *
 * @return {Identify}
 */
Track.prototype.identify = function() {
  // TODO: remove me.
  var json = this.json();
  json.traits = this.traits();
  return new Identify(json, this.opts);
};

/**
 * Get float from currency value.
 *
 * @ignore
 * @param {*} val
 * @return {number}
 */
function currency(val) {
  if (!val) return;
  if (typeof val === 'number') {
    return val;
  }
  if (typeof val !== 'string') {
    return;
  }

  val = val.replace(/\$/g, '');
  val = parseFloat(val);

  if (!isNaN(val)) {
    return val;
  }
}

module.exports = Track;

},{"./facade":60,"./identify":62,"./utils":68,"is-email":1317,"obj-case":1365}],68:[function(require,module,exports){
'use strict';

exports.inherit = require('inherits');
exports.clone = require('@ndhoule/clone');
exports.type = require('type-component');

},{"@ndhoule/clone":29,"inherits":1313,"type-component":1414}],69:[function(require,module,exports){

;
'use strict';

/*
 * Module dependencies.
 */

var parse = require('component-querystring').parse;

/**
 * All the ad query params we look for.
 */
var QUERYIDS = {
  btid: 'dataxu',
  urid: 'millennial-media'
};

/**
 * Get all ads info from the given `querystring`
 *
 * @param {string} query
 * @return {Object}
 */
function ads(query) {
  var params = parse(query);
  for (var key in params) {
    if (params.hasOwnProperty(key)) {
      for (var id in QUERYIDS) {
        if (QUERYIDS.hasOwnProperty(id)) {
          if (key === id) {
            return {
              id : params[key],
              type : QUERYIDS[id]
            };
          }
        }
      }
    }
  }
}

/*
 * Exports.
 */

module.exports = ads;

;

},{"component-querystring":1289}],70:[function(require,module,exports){


module.exports = function() {};
;

},{"@segment/tsub":1223}],71:[function(require,module,exports){


module.exports = function() {};
;

},{"component-clone":1278,"component-type":1291}],72:[function(require,module,exports){
(function (global){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var _analytics = global.analytics;
/*
 * Module dependencies.
 */
var Alias = require('segmentio-facade').Alias;
var Emitter = require('component-emitter');
var Facade = require('segmentio-facade');
var Group = require('segmentio-facade').Group;
var Identify = require('segmentio-facade').Identify;
var SourceMiddlewareChain = require('./middleware').SourceMiddlewareChain;
var IntegrationMiddlewareChain = require('./middleware')
    .IntegrationMiddlewareChain;
var DestinationMiddlewareChain = require('./middleware')
    .DestinationMiddlewareChain;
var Page = require('segmentio-facade').Page;
var Track = require('segmentio-facade').Track;
var bindAll = require('bind-all');
var clone = require('./utils/clone');
var extend = require('extend');
var cookie = require('./cookie');
var metrics = require('./metrics');
var debug = require('debug');
var defaults = require('@ndhoule/defaults');
var each = require('./utils/each');
var foldl = require('@ndhoule/foldl');
var group = require('./group');
var is = require('is');
var isMeta = require('@segment/is-meta');
var keys = require('@ndhoule/keys');
var memory = require('./memory');
var nextTick = require('next-tick');
var normalize = require('./normalize');
var on = require('component-event').bind;
var pageDefaults = require('./pageDefaults');
var pick = require('@ndhoule/pick');
var prevent = require('@segment/prevent-default');
var querystring = require('component-querystring');
var store = require('./store');
var user = require('./user');
var type = require('component-type');
/**
 * Initialize a new `Analytics` instance.
 */
function Analytics() {
    this._options({});
    this.Integrations = {};
    this._sourceMiddlewares = new SourceMiddlewareChain();
    this._integrationMiddlewares = new IntegrationMiddlewareChain();
    this._destinationMiddlewares = {};
    this._integrations = {};
    this._readied = false;
    this._timeout = 300;
    // XXX: BACKWARDS COMPATIBILITY
    this._user = user;
    this.log = debug('analytics.js');
    bindAll(this);
    var self = this;
    this.on('initialize', function (settings, options) {
        if (options.initialPageview)
            self.page();
        self._parseQuery(window.location.search);
    });
}
/**
 * Mix in event emitter.
 */
Emitter(Analytics.prototype);
/**
 * Use a `plugin`.
 */
Analytics.prototype.use = function (plugin) {
    plugin(this);
    return this;
};
/**
 * Define a new `Integration`.
 */
Analytics.prototype.addIntegration = function (Integration) {
    var name = Integration.prototype.name;
    if (!name)
        throw new TypeError('attempted to add an invalid integration');
    this.Integrations[name] = Integration;
    return this;
};
/**
 * Define a new `SourceMiddleware`
 */
Analytics.prototype.addSourceMiddleware = function (middleware) {
    this._sourceMiddlewares.add(middleware);
    return this;
};
/**
 * Define a new `IntegrationMiddleware`
 * @deprecated
 */
Analytics.prototype.addIntegrationMiddleware = function (middleware) {
    this._integrationMiddlewares.add(middleware);
    return this;
};
/**
 * Define a new `DestinationMiddleware`
 * Destination Middleware is chained after integration middleware
 */
Analytics.prototype.addDestinationMiddleware = function (integrationName, middlewares) {
    var self = this;
    middlewares.forEach(function (middleware) {
        if (!self._destinationMiddlewares[integrationName]) {
            self._destinationMiddlewares[integrationName] = new DestinationMiddlewareChain();
        }
        self._destinationMiddlewares[integrationName].add(middleware);
    });
    return self;
};
/**
 * Initialize with the given integration `settings` and `options`.
 *
 * Aliased to `init` for convenience.
 */
Analytics.prototype.init = Analytics.prototype.initialize = function (settings, options) {
    settings = settings || {};
    options = options || {};
    this._options(options);
    this._readied = false;
    // clean unknown integrations from settings
    var self = this;
    each(function (_opts, name) {
        var Integration = self.Integrations[name];
        if (!Integration)
            delete settings[name];
    }, settings);
    // add integrations
    each(function (opts, name) {
        // Don't load disabled integrations
        if (options.integrations) {
            if (options.integrations[name] === false ||
                (options.integrations.All === false && !options.integrations[name])) {
                return;
            }
        }
        var Integration = self.Integrations[name];
        var clonedOpts = {};
        extend(true, clonedOpts, opts); // deep clone opts
        var integration = new Integration(clonedOpts);
        self.log('initialize %o - %o', name, opts);
        self.add(integration);
    }, settings);
    var integrations = this._integrations;
    // load user now that options are set
    user.load();
    group.load();
    // make ready callback
    var readyCallCount = 0;
    var integrationCount = keys(integrations).length;
    var ready = function () {
        readyCallCount++;
        if (readyCallCount >= integrationCount) {
            self._readied = true;
            self.emit('ready');
        }
    };
    // init if no integrations
    if (integrationCount <= 0) {
        ready();
    }
    // initialize integrations, passing ready
    // create a list of any integrations that did not initialize - this will be passed with all events for replay support:
    this.failedInitializations = [];
    var initialPageSkipped = false;
    each(function (integration) {
        if (options.initialPageview &&
            integration.options.initialPageview === false) {
            // We've assumed one initial pageview, so make sure we don't count the first page call.
            var page = integration.page;
            integration.page = function () {
                if (initialPageSkipped) {
                    return page.apply(this, arguments);
                }
                initialPageSkipped = true;
                return;
            };
        }
        integration.analytics = self;
        integration.once('ready', ready);
        try {
            metrics.increment('analytics_js.integration.invoke', {
                method: 'initialize',
                integration_name: integration.name
            });
            integration.initialize();
        }
        catch (e) {
            var integrationName = integration.name;
            metrics.increment('analytics_js.integration.invoke.error', {
                method: 'initialize',
                integration_name: integration.name
            });
            self.failedInitializations.push(integrationName);
            self.log('Error initializing %s integration: %o', integrationName, e);
            // Mark integration as ready to prevent blocking of anyone listening to analytics.ready()
            integration.ready();
        }
    }, integrations);
    // backwards compat with angular plugin and used for init logic checks
    this.initialized = true;
    this.emit('initialize', settings, options);
    return this;
};
/**
 * Set the user's `id`.
 */
Analytics.prototype.setAnonymousId = function (id) {
    this.user().anonymousId(id);
    return this;
};
/**
 * Add an integration.
 */
Analytics.prototype.add = function (integration) {
    this._integrations[integration.name] = integration;
    return this;
};
/**
 * Identify a user by optional `id` and `traits`.
 *
 * @param {string} [id=user.id()] User ID.
 * @param {Object} [traits=null] User traits.
 * @param {Object} [options=null]
 * @param {Function} [fn]
 * @return {Analytics}
 */
Analytics.prototype.identify = function (id, traits, options, fn) {
    // Argument reshuffling.
    /* eslint-disable no-unused-expressions, no-sequences */
    if (is.fn(options))
        (fn = options), (options = null);
    if (is.fn(traits))
        (fn = traits), (options = null), (traits = null);
    if (is.object(id))
        (options = traits), (traits = id), (id = user.id());
    /* eslint-enable no-unused-expressions, no-sequences */
    // clone traits before we manipulate so we don't do anything uncouth, and take
    // from `user` so that we carryover anonymous traits
    user.identify(id, traits);
    var msg = this.normalize({
        options: options,
        traits: user.traits(),
        userId: user.id()
    });
    // Add the initialize integrations so the server-side ones can be disabled too
    if (this.options.integrations) {
        defaults(msg.integrations, this.options.integrations);
    }
    this._invoke('identify', new Identify(msg));
    // emit
    this.emit('identify', id, traits, options);
    this._callback(fn);
    return this;
};
/**
 * Return the current user.
 *
 * @return {Object}
 */
Analytics.prototype.user = function () {
    return user;
};
/**
 * Identify a group by optional `id` and `traits`. Or, if no arguments are
 * supplied, return the current group.
 *
 * @param {string} [id=group.id()] Group ID.
 * @param {Object} [traits=null] Group traits.
 * @param {Object} [options=null]
 * @param {Function} [fn]
 * @return {Analytics|Object}
 */
Analytics.prototype.group = function (id, traits, options, fn) {
    /* eslint-disable no-unused-expressions, no-sequences */
    if (!arguments.length)
        return group;
    if (is.fn(options))
        (fn = options), (options = null);
    if (is.fn(traits))
        (fn = traits), (options = null), (traits = null);
    if (is.object(id))
        (options = traits), (traits = id), (id = group.id());
    /* eslint-enable no-unused-expressions, no-sequences */
    // grab from group again to make sure we're taking from the source
    group.identify(id, traits);
    var msg = this.normalize({
        options: options,
        traits: group.traits(),
        groupId: group.id()
    });
    // Add the initialize integrations so the server-side ones can be disabled too
    if (this.options.integrations) {
        defaults(msg.integrations, this.options.integrations);
    }
    this._invoke('group', new Group(msg));
    this.emit('group', id, traits, options);
    this._callback(fn);
    return this;
};
/**
 * Track an `event` that a user has triggered with optional `properties`.
 *
 * @param {string} event
 * @param {Object} [properties=null]
 * @param {Object} [options=null]
 * @param {Function} [fn]
 * @return {Analytics}
 */
Analytics.prototype.track = function (event, properties, options, fn) {
    // Argument reshuffling.
    /* eslint-disable no-unused-expressions, no-sequences */
    if (is.fn(options))
        (fn = options), (options = null);
    if (is.fn(properties))
        (fn = properties), (options = null), (properties = null);
    /* eslint-enable no-unused-expressions, no-sequences */
    // figure out if the event is archived.
    var plan = this.options.plan || {};
    var events = plan.track || {};
    var planIntegrationOptions = {};
    // normalize
    var msg = this.normalize({
        properties: properties,
        options: options,
        event: event
    });
    // plan.
    plan = events[event];
    if (plan) {
        this.log('plan %o - %o', event, plan);
        if (plan.enabled === false) {
            // Disabled events should always be sent to Segment.
            planIntegrationOptions = { All: false, 'Segment.io': true };
        }
        else {
            planIntegrationOptions = plan.integrations || {};
        }
    }
    else {
        var defaultPlan = events.__default || { enabled: true };
        if (!defaultPlan.enabled) {
            // Disabled events should always be sent to Segment.
            planIntegrationOptions = { All: false, 'Segment.io': true };
        }
    }
    // Add the initialize integrations so the server-side ones can be disabled too
    defaults(msg.integrations, this._mergeInitializeAndPlanIntegrations(planIntegrationOptions));
    this._invoke('track', new Track(msg));
    this.emit('track', event, properties, options);
    this._callback(fn);
    return this;
};
/**
 * Helper method to track an outbound link that would normally navigate away
 * from the page before the analytics calls were sent.
 *
 * BACKWARDS COMPATIBILITY: aliased to `trackClick`.
 *
 * @param {Element|Array} links
 * @param {string|Function} event
 * @param {Object|Function} properties (optional)
 * @return {Analytics}
 */
Analytics.prototype.trackClick = Analytics.prototype.trackLink = function (links, event, properties) {
    if (!links)
        return this;
    // always arrays, handles jquery
    if (type(links) === 'element')
        links = [links];
    var self = this;
    each(function (el) {
        if (type(el) !== 'element') {
            throw new TypeError('Must pass HTMLElement to `analytics.trackLink`.');
        }
        on(el, 'click', function (e) {
            var ev = is.fn(event) ? event(el) : event;
            var props = is.fn(properties) ? properties(el) : properties;
            var href = el.getAttribute('href') ||
                el.getAttributeNS('http://www.w3.org/1999/xlink', 'href') ||
                el.getAttribute('xlink:href');
            self.track(ev, props);
            if (href && el.target !== '_blank' && !isMeta(e)) {
                prevent(e);
                self._callback(function () {
                    window.location.href = href;
                });
            }
        });
    }, links);
    return this;
};
/**
 * Helper method to track an outbound form that would normally navigate away
 * from the page before the analytics calls were sent.
 *
 * BACKWARDS COMPATIBILITY: aliased to `trackSubmit`.
 *
 * @param {Element|Array} forms
 * @param {string|Function} event
 * @param {Object|Function} properties (optional)
 * @return {Analytics}
 */
Analytics.prototype.trackSubmit = Analytics.prototype.trackForm = function (forms, event, properties) {
    if (!forms)
        return this;
    // always arrays, handles jquery
    if (type(forms) === 'element')
        forms = [forms];
    var self = this;
    each(function (el) {
        if (type(el) !== 'element')
            throw new TypeError('Must pass HTMLElement to `analytics.trackForm`.');
        function handler(e) {
            prevent(e);
            var ev = is.fn(event) ? event(el) : event;
            var props = is.fn(properties) ? properties(el) : properties;
            self.track(ev, props);
            self._callback(function () {
                el.submit();
            });
        }
        // Support the events happening through jQuery or Zepto instead of through
        // the normal DOM API, because `el.submit` doesn't bubble up events...
        var $ = window.jQuery || window.Zepto;
        if ($) {
            $(el).submit(handler);
        }
        else {
            on(el, 'submit', handler);
        }
    }, forms);
    return this;
};
/**
 * Trigger a pageview, labeling the current page with an optional `category`,
 * `name` and `properties`.
 *
 * @param {string} [category]
 * @param {string} [name]
 * @param {Object|string} [properties] (or path)
 * @param {Object} [options]
 * @param {Function} [fn]
 * @return {Analytics}
 */
Analytics.prototype.page = function (category, name, properties, options, fn) {
    // Argument reshuffling.
    /* eslint-disable no-unused-expressions, no-sequences */
    if (is.fn(options))
        (fn = options), (options = null);
    if (is.fn(properties))
        (fn = properties), (options = properties = null);
    if (is.fn(name))
        (fn = name), (options = properties = name = null);
    if (type(category) === 'object')
        (options = name), (properties = category), (name = category = null);
    if (type(name) === 'object')
        (options = properties), (properties = name), (name = null);
    if (type(category) === 'string' && type(name) !== 'string')
        (name = category), (category = null);
    /* eslint-enable no-unused-expressions, no-sequences */
    properties = clone(properties) || {};
    if (name)
        properties.name = name;
    if (category)
        properties.category = category;
    // Ensure properties has baseline spec properties.
    // TODO: Eventually move these entirely to `options.context.page`
    var defs = pageDefaults();
    defaults(properties, defs);
    // Mirror user overrides to `options.context.page` (but exclude custom properties)
    // (Any page defaults get applied in `this.normalize` for consistency.)
    // Weird, yeah--moving special props to `context.page` will fix this in the long term.
    var overrides = pick(keys(defs), properties);
    if (!is.empty(overrides)) {
        options = options || {};
        options.context = options.context || {};
        options.context.page = overrides;
    }
    var msg = this.normalize({
        properties: properties,
        category: category,
        options: options,
        name: name
    });
    // Add the initialize integrations so the server-side ones can be disabled too
    if (this.options.integrations) {
        defaults(msg.integrations, this.options.integrations);
    }
    this._invoke('page', new Page(msg));
    this.emit('page', category, name, properties, options);
    this._callback(fn);
    return this;
};
/**
 * FIXME: BACKWARDS COMPATIBILITY: convert an old `pageview` to a `page` call.
 * @api private
 */
Analytics.prototype.pageview = function (url) {
    var properties = {};
    if (url)
        properties.path = url;
    this.page(properties);
    return this;
};
/**
 * Merge two previously unassociated user identities.
 *
 * @param {string} to
 * @param {string} from (optional)
 * @param {Object} options (optional)
 * @param {Function} fn (optional)
 * @return {Analytics}
 */
Analytics.prototype.alias = function (to, from, options, fn) {
    // Argument reshuffling.
    /* eslint-disable no-unused-expressions, no-sequences */
    if (is.fn(options))
        (fn = options), (options = null);
    if (is.fn(from))
        (fn = from), (options = null), (from = null);
    if (is.object(from))
        (options = from), (from = null);
    /* eslint-enable no-unused-expressions, no-sequences */
    var msg = this.normalize({
        options: options,
        previousId: from,
        userId: to
    });
    // Add the initialize integrations so the server-side ones can be disabled too
    if (this.options.integrations) {
        defaults(msg.integrations, this.options.integrations);
    }
    this._invoke('alias', new Alias(msg));
    this.emit('alias', to, from, options);
    this._callback(fn);
    return this;
};
/**
 * Register a `fn` to be fired when all the analytics services are ready.
 */
Analytics.prototype.ready = function (fn) {
    if (is.fn(fn)) {
        if (this._readied) {
            nextTick(fn);
        }
        else {
            this.once('ready', fn);
        }
    }
    return this;
};
/**
 * Set the `timeout` (in milliseconds) used for callbacks.
 */
Analytics.prototype.timeout = function (timeout) {
    this._timeout = timeout;
};
/**
 * Enable or disable debug.
 */
Analytics.prototype.debug = function (str) {
    if (!arguments.length || str) {
        debug.enable('analytics:' + (str || '*'));
    }
    else {
        debug.disable();
    }
};
/**
 * Apply options.
 * @api private
 */
Analytics.prototype._options = function (options) {
    options = options || {};
    this.options = options;
    cookie.options(options.cookie);
    metrics.options(options.metrics);
    store.options(options.localStorage);
    user.options(options.user);
    group.options(options.group);
    return this;
};
/**
 * Callback a `fn` after our defined timeout period.
 * @api private
 */
Analytics.prototype._callback = function (fn) {
    if (is.fn(fn)) {
        this._timeout ? setTimeout(fn, this._timeout) : nextTick(fn);
    }
    return this;
};
/**
 * Call `method` with `facade` on all enabled integrations.
 *
 * @param {string} method
 * @param {Facade} facade
 * @return {Analytics}
 * @api private
 */
Analytics.prototype._invoke = function (method, facade) {
    var self = this;
    try {
        this._sourceMiddlewares.applyMiddlewares(extend(true, new Facade({}), facade), this._integrations, function (result) {
            // A nullified payload should not be sent.
            if (result === null) {
                self.log('Payload with method "%s" was null and dropped by source a middleware.', method);
                return;
            }
            // Check if the payload is still a Facade. If not, convert it to one.
            if (!(result instanceof Facade)) {
                result = new Facade(result);
            }
            self.emit('invoke', result);
            metrics.increment('analytics_js.invoke', {
                method: method
            });
            applyIntegrationMiddlewares(result);
        });
    }
    catch (e) {
        metrics.increment('analytics_js.invoke.error', {
            method: method
        });
        self.log('Error invoking .%s method of %s integration: %o', method, name, e);
    }
    return this;
    function applyIntegrationMiddlewares(facade) {
        var failedInitializations = self.failedInitializations || [];
        each(function (integration, name) {
            var facadeCopy = extend(true, new Facade({}), facade);
            if (!facadeCopy.enabled(name))
                return;
            // Check if an integration failed to initialize.
            // If so, do not process the message as the integration is in an unstable state.
            if (failedInitializations.indexOf(name) >= 0) {
                self.log('Skipping invocation of .%s method of %s integration. Integration failed to initialize properly.', method, name);
            }
            else {
                try {
                    // Apply any integration middlewares that exist, then invoke the integration with the result.
                    self._integrationMiddlewares.applyMiddlewares(facadeCopy, integration.name, function (result) {
                        // A nullified payload should not be sent to an integration.
                        if (result === null) {
                            self.log('Payload to integration "%s" was null and dropped by a middleware.', name);
                            return;
                        }
                        // Check if the payload is still a Facade. If not, convert it to one.
                        if (!(result instanceof Facade)) {
                            result = new Facade(result);
                        }
                        // apply destination middlewares
                        // Apply any integration middlewares that exist, then invoke the integration with the result.
                        if (self._destinationMiddlewares[integration.name]) {
                            self._destinationMiddlewares[integration.name].applyMiddlewares(facadeCopy, integration.name, function (result) {
                                // A nullified payload should not be sent to an integration.
                                if (result === null) {
                                    self.log('Payload to destination "%s" was null and dropped by a middleware.', name);
                                    return;
                                }
                                // Check if the payload is still a Facade. If not, convert it to one.
                                if (!(result instanceof Facade)) {
                                    result = new Facade(result);
                                }
                                metrics.increment('analytics_js.integration.invoke', {
                                    method: method,
                                    integration_name: integration.name
                                });
                                integration.invoke.call(integration, method, result);
                            });
                        }
                        else {
                            metrics.increment('analytics_js.integration.invoke', {
                                method: method,
                                integration_name: integration.name
                            });
                            integration.invoke.call(integration, method, result);
                        }
                    });
                }
                catch (e) {
                    metrics.increment('analytics_js.integration.invoke.error', {
                        method: method,
                        integration_name: integration.name
                    });
                    self.log('Error invoking .%s method of %s integration: %o', method, name, e);
                }
            }
        }, self._integrations);
    }
};
/**
 * Push `args`.
 *
 * @param {Array} args
 * @api private
 */
Analytics.prototype.push = function (args) {
    var method = args.shift();
    if (!this[method])
        return;
    this[method].apply(this, args);
};
/**
 * Reset group and user traits and id's.
 *
 * @api public
 */
Analytics.prototype.reset = function () {
    this.user().logout();
    this.group().logout();
};
/**
 * Parse the query string for callable methods.
 *
 * @api private
 */
Analytics.prototype._parseQuery = function (query) {
    // Parse querystring to an object
    var q = querystring.parse(query);
    // Create traits and properties objects, populate from querysting params
    var traits = pickPrefix('ajs_trait_', q);
    var props = pickPrefix('ajs_prop_', q);
    // Trigger based on callable parameters in the URL
    if (q.ajs_uid)
        this.identify(q.ajs_uid, traits);
    if (q.ajs_event)
        this.track(q.ajs_event, props);
    if (q.ajs_aid)
        user.anonymousId(q.ajs_aid);
    return this;
    /**
     * Create a shallow copy of an input object containing only the properties
     * whose keys are specified by a prefix, stripped of that prefix
     *
     * @return {Object}
     * @api private
     */
    function pickPrefix(prefix, object) {
        var length = prefix.length;
        var sub;
        return Object.keys(object).reduce(function (acc, key) {
            if (key.substr(0, length) === prefix) {
                sub = key.substr(length);
                acc[sub] = object[key];
            }
            return acc;
        }, {});
    }
};
/**
 * Normalize the given `msg`.
 */
Analytics.prototype.normalize = function (msg) {
    msg = normalize(msg, keys(this._integrations));
    if (msg.anonymousId)
        user.anonymousId(msg.anonymousId);
    msg.anonymousId = user.anonymousId();
    // Ensure all outgoing requests include page data in their contexts.
    msg.context.page = defaults(msg.context.page || {}, pageDefaults());
    return msg;
};
/**
 * Merges the tracking plan and initialization integration options.
 *
 * @param  {Object} planIntegrations Tracking plan integrations.
 * @return {Object}                  The merged integrations.
 */
Analytics.prototype._mergeInitializeAndPlanIntegrations = function (planIntegrations) {
    // Do nothing if there are no initialization integrations
    if (!this.options.integrations) {
        return planIntegrations;
    }
    // Clone the initialization integrations
    var integrations = extend({}, this.options.integrations);
    var integrationName;
    // Allow the tracking plan to disable integrations that were explicitly
    // enabled on initialization
    if (planIntegrations.All === false) {
        integrations = { All: false };
    }
    for (integrationName in planIntegrations) {
        if (planIntegrations.hasOwnProperty(integrationName)) {
            // Don't allow the tracking plan to re-enable disabled integrations
            if (this.options.integrations[integrationName] !== false) {
                integrations[integrationName] = planIntegrations[integrationName];
            }
        }
    }
    return integrations;
};
/**
 * No conflict support.
 */
Analytics.prototype.noConflict = function () {
    window.analytics = _analytics;
    return this;
};
/*
 * Exports.
 */
module.exports = Analytics;
module.exports.cookie = cookie;
module.exports.memory = memory;
module.exports.store = store;
module.exports.metrics = metrics;

}).call(this,typeof window !== "undefined" && window.document && window.document.implementation ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {})
},{"./cookie":73,"./group":75,"./memory":77,"./metrics":78,"./middleware":79,"./normalize":80,"./pageDefaults":81,"./store":82,"./user":83,"./utils/clone":84,"./utils/each":85,"@ndhoule/defaults":30,"@ndhoule/foldl":36,"@ndhoule/keys":38,"@ndhoule/pick":40,"@segment/is-meta":1199,"@segment/prevent-default":1215,"bind-all":1272,"component-emitter":1285,"component-event":1286,"component-querystring":1289,"component-type":1291,"debug":87,"extend":1304,"is":1321,"next-tick":1360,"segmentio-facade":95}],73:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Module dependencies.
 */
var bindAll = require('bind-all');
var clone = require('./utils/clone');
var cookie = require('@segment/cookie');
var debug = require('debug')('analytics.js:cookie');
var defaults = require('@ndhoule/defaults');
var topDomain = require('@segment/top-domain');
/**
 * Initialize a new `Cookie` with `options`.
 *
 * @param {Object} options
 */
function Cookie(options) {
    this.options(options);
}
/**
 * Get or set the cookie options.
 */
Cookie.prototype.options = function (options) {
    if (arguments.length === 0)
        return this._options;
    options = options || {};
    var domain = '.' + topDomain(window.location.href);
    if (domain === '.')
        domain = null;
    this._options = defaults(options, {
        // default to a year
        maxage: 31536000000,
        path: '/',
        domain: domain,
        sameSite: 'Lax'
    });
    // http://curl.haxx.se/rfc/cookie_spec.html
    // https://publicsuffix.org/list/effective_tld_names.dat
    //
    // try setting a dummy cookie with the options
    // if the cookie isn't set, it probably means
    // that the domain is on the public suffix list
    // like myapp.herokuapp.com or localhost / ip.
    this.set('ajs:test', true);
    if (!this.get('ajs:test')) {
        debug('fallback to domain=null');
        this._options.domain = null;
    }
    this.remove('ajs:test');
};
/**
 * Set a `key` and `value` in our cookie.
 */
Cookie.prototype.set = function (key, value) {
    try {
        value = window.JSON.stringify(value);
        cookie(key, value === 'null' ? null : value, clone(this._options));
        return true;
    }
    catch (e) {
        return false;
    }
};
/**
 * Get a value from our cookie by `key`.
 */
Cookie.prototype.get = function (key) {
    try {
        var value = cookie(key);
        value = value ? window.JSON.parse(value) : null;
        return value;
    }
    catch (e) {
        return null;
    }
};
/**
 * Remove a value from our cookie by `key`.
 */
Cookie.prototype.remove = function (key) {
    try {
        cookie(key, null, clone(this._options));
        return true;
    }
    catch (e) {
        return false;
    }
};
/**
 * Expose the cookie singleton.
 */
module.exports = bindAll(new Cookie());
/**
 * Expose the `Cookie` constructor.
 */
module.exports.Cookie = Cookie;

},{"./utils/clone":84,"@ndhoule/defaults":30,"@segment/cookie":1195,"@segment/top-domain":1220,"bind-all":1272,"debug":87}],74:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Module dependencies.
 */
var clone = require('./utils/clone');
var cookie = require('./cookie');
var debug = require('debug')('analytics:entity');
var defaults = require('@ndhoule/defaults');
var extend = require('@ndhoule/extend');
var memory = require('./memory');
var store = require('./store');
var isodateTraverse = require('@segment/isodate-traverse');
/**
 * Expose `Entity`
 */
module.exports = Entity;
/**
 * Initialize new `Entity` with `options`.
 */
function Entity(options) {
    this.options(options);
    this.initialize();
}
/**
 * Initialize picks the storage.
 *
 * Checks to see if cookies can be set
 * otherwise fallsback to localStorage.
 */
Entity.prototype.initialize = function () {
    cookie.set('ajs:cookies', true);
    // cookies are enabled.
    if (cookie.get('ajs:cookies')) {
        cookie.remove('ajs:cookies');
        this._storage = cookie;
        return;
    }
    // localStorage is enabled.
    if (store.enabled) {
        this._storage = store;
        return;
    }
    // fallback to memory storage.
    debug('warning using memory store both cookies and localStorage are disabled');
    this._storage = memory;
};
/**
 * Get the storage.
 */
Entity.prototype.storage = function () {
    return this._storage;
};
/**
 * Get or set storage `options`.
 */
Entity.prototype.options = function (options) {
    if (arguments.length === 0)
        return this._options;
    this._options = defaults(options || {}, this.defaults || {});
};
/**
 * Get or set the entity's `id`.
 */
Entity.prototype.id = function (id) {
    switch (arguments.length) {
        case 0:
            return this._getId();
        case 1:
            return this._setId(id);
        default:
        // No default case
    }
};
/**
 * Get the entity's id.
 */
Entity.prototype._getId = function () {
    if (!this._options.persist) {
        return this._id === undefined ? null : this._id;
    }
    // Check cookies.
    var cookieId = this._getIdFromCookie();
    if (cookieId) {
        return cookieId;
    }
    // Check localStorage.
    var lsId = this._getIdFromLocalStorage();
    if (lsId) {
        // Copy the id to cookies so we can read it directly from cookies next time.
        this._setIdInCookies(lsId);
        return lsId;
    }
    return null;
};
/**
 * Get the entity's id from cookies.
 */
// FIXME `options.cookie` is an optional field, so `this._options.cookie.key`
// can thrown an exception.
Entity.prototype._getIdFromCookie = function () {
    return this.storage().get(this._options.cookie.key);
};
/**
 * Get the entity's id from cookies.
 */
Entity.prototype._getIdFromLocalStorage = function () {
    if (!this._options.localStorageFallbackDisabled) {
        return store.get(this._options.cookie.key);
    }
    return null;
};
/**
 * Set the entity's `id`.
 */
Entity.prototype._setId = function (id) {
    if (this._options.persist) {
        this._setIdInCookies(id);
        this._setIdInLocalStorage(id);
    }
    else {
        this._id = id;
    }
};
/**
 * Set the entity's `id` in cookies.
 */
Entity.prototype._setIdInCookies = function (id) {
    this.storage().set(this._options.cookie.key, id);
};
/**
 * Set the entity's `id` in local storage.
 */
Entity.prototype._setIdInLocalStorage = function (id) {
    if (!this._options.localStorageFallbackDisabled) {
        store.set(this._options.cookie.key, id);
    }
};
/**
 * Get or set the entity's `traits`.
 *
 * BACKWARDS COMPATIBILITY: aliased to `properties`
 */
Entity.prototype.properties = Entity.prototype.traits = function (traits) {
    switch (arguments.length) {
        case 0:
            return this._getTraits();
        case 1:
            return this._setTraits(traits);
        default:
        // No default case
    }
};
/**
 * Get the entity's traits. Always convert ISO date strings into real dates,
 * since they aren't parsed back from local storage.
 */
Entity.prototype._getTraits = function () {
    var ret = this._options.persist
        ? store.get(this._options.localStorage.key)
        : this._traits;
    return ret ? isodateTraverse(clone(ret)) : {};
};
/**
 * Set the entity's `traits`.
 */
Entity.prototype._setTraits = function (traits) {
    traits = traits || {};
    if (this._options.persist) {
        store.set(this._options.localStorage.key, traits);
    }
    else {
        this._traits = traits;
    }
};
/**
 * Identify the entity with an `id` and `traits`. If we it's the same entity,
 * extend the existing `traits` instead of overwriting.
 */
Entity.prototype.identify = function (id, traits) {
    traits = traits || {};
    var current = this.id();
    if (current === null || current === id)
        traits = extend(this.traits(), traits);
    if (id)
        this.id(id);
    this.debug('identify %o, %o', id, traits);
    this.traits(traits);
    this.save();
};
/**
 * Save the entity to local storage and the cookie.
 */
Entity.prototype.save = function () {
    if (!this._options.persist)
        return false;
    this._setId(this.id());
    this._setTraits(this.traits());
    return true;
};
/**
 * Log the entity out, reseting `id` and `traits` to defaults.
 */
Entity.prototype.logout = function () {
    this.id(null);
    this.traits({});
    this.storage().remove(this._options.cookie.key);
    store.remove(this._options.cookie.key);
    store.remove(this._options.localStorage.key);
};
/**
 * Reset all entity state, logging out and returning options to defaults.
 */
Entity.prototype.reset = function () {
    this.logout();
    this.options({});
};
/**
 * Load saved entity `id` or `traits` from storage.
 */
Entity.prototype.load = function () {
    this.id(this.id());
    this.traits(this.traits());
};

},{"./cookie":73,"./memory":77,"./store":82,"./utils/clone":84,"@ndhoule/defaults":30,"@ndhoule/extend":35,"@segment/isodate-traverse":1200,"debug":87}],75:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Module dependencies.
 */
var Entity = require('./entity');
var bindAll = require('bind-all');
var debug = require('debug')('analytics:group');
var inherit = require('inherits');
/**
 * Group defaults
 */
Group.defaults = {
    persist: true,
    cookie: {
        key: 'ajs_group_id'
    },
    localStorage: {
        key: 'ajs_group_properties'
    }
};
/**
 * Initialize a new `Group` with `options`.
 */
function Group(options) {
    this.defaults = Group.defaults;
    this.debug = debug;
    Entity.call(this, options);
}
/**
 * Inherit `Entity`
 */
inherit(Group, Entity);
/**
 * Expose the group singleton.
 */
module.exports = bindAll(new Group());
/**
 * Expose the `Group` constructor.
 */
module.exports.Group = Group;

},{"./entity":74,"bind-all":1272,"debug":87,"inherits":1313}],76:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Analytics.js
 *
 * (C) 2013-2016 Segment.io Inc.
 */
var Analytics = require('./analytics');
// Create a new `analytics` singleton.
var analytics = new Analytics();
// Expose `require`.
// TODO(ndhoule): Look into deprecating, we no longer need to expose it in tests
analytics.require = require;
// Expose package version.
analytics.VERSION = require('../package.json').version;
/*
 * Exports.
 */
module.exports = analytics;

},{"../package.json":101,"./analytics":72}],77:[function(require,module,exports){
'use strict';
/*
 * Module Dependencies.
 */
var bindAll = require('bind-all');
var clone = require('./utils/clone');
/**
 * HOP.
 */
var has = Object.prototype.hasOwnProperty;
/**
 * Expose `Memory`
 */
module.exports = bindAll(new Memory());
/**
 * Initialize `Memory` store
 */
function Memory() {
    this.store = {};
}
/**
 * Set a `key` and `value`.
 */
Memory.prototype.set = function (key, value) {
    this.store[key] = clone(value);
    return true;
};
/**
 * Get a `key`.
 */
Memory.prototype.get = function (key) {
    if (!has.call(this.store, key))
        return;
    return clone(this.store[key]);
};
/**
 * Remove a `key`.
 */
Memory.prototype.remove = function (key) {
    delete this.store[key];
    return true;
};

},{"./utils/clone":84,"bind-all":1272}],78:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var bindAll = require('bind-all');
var send = require('@segment/send-json');
var debug = require('debug')('analytics.js:metrics');
function Metrics(options) {
    this.options(options);
}
/**
 * Set the metrics options.
 */
Metrics.prototype.options = function (options) {
    options = options || {};
    this.host = options.host || 'api.segment.io/v1';
    this.sampleRate = options.sampleRate || 0; // disable metrics by default.
    this.flushTimer = options.flushTimer || 30 * 1000 /* 30s */;
    this.maxQueueSize = options.maxQueueSize || 20;
    this.queue = [];
    if (this.sampleRate > 0) {
        var self = this;
        setInterval(function () {
            self._flush();
        }, this.flushTimer);
    }
};
/**
 * Increments the counter identified by name and tags by one.
 */
Metrics.prototype.increment = function (metric, tags) {
    if (Math.random() > this.sampleRate) {
        return;
    }
    if (this.queue.length >= this.maxQueueSize) {
        return;
    }
    this.queue.push({ type: 'Counter', metric: metric, value: 1, tags: tags });
    // Trigger a flush if this is an error metric.
    if (metric.indexOf('error') > 0) {
        this._flush();
    }
};
/**
 * Flush all queued metrics.
 */
Metrics.prototype._flush = function () {
    var self = this;
    if (self.queue.length <= 0) {
        return;
    }
    var payload = { series: this.queue };
    var headers = { 'Content-Type': 'text/plain' };
    self.queue = [];
    // This endpoint does not support jsonp, so only proceed if the browser
    // supports xhr.
    if (send.type !== 'xhr')
        return;
    send('https://' + this.host + '/m', payload, headers, function (err, res) {
        debug('sent %O, received %O', payload, [err, res]);
    });
};
/**
 * Expose the metrics singleton.
 */
module.exports = bindAll(new Metrics());
/**
 * Expose the `Metrics` constructor.
 */
module.exports.Metrics = Metrics;

},{"@segment/send-json":1217,"bind-all":1272,"debug":87}],79:[function(require,module,exports){
'use strict';
var Facade = require('segmentio-facade');
module.exports.SourceMiddlewareChain = function SourceMiddlewareChain() {
    var apply = middlewareChain(this);
    this.applyMiddlewares = function (facade, integrations, callback) {
        return apply(function (mw, payload, next) {
            mw({
                integrations: integrations,
                next: next,
                payload: payload
            });
        }, facade, callback);
    };
};
module.exports.IntegrationMiddlewareChain = function IntegrationMiddlewareChain() {
    var apply = middlewareChain(this);
    this.applyMiddlewares = function (facade, integration, callback) {
        return apply(function (mw, payload, next) {
            mw(payload, integration, next);
        }, facade, callback);
    };
};
module.exports.DestinationMiddlewareChain = function DestinationMiddlewareChain() {
    var apply = middlewareChain(this);
    this.applyMiddlewares = function (facade, integration, callback) {
        return apply(function (mw, payload, next) {
            mw({ payload: payload, integration: integration, next: next });
        }, facade, callback);
    };
};
// Chain is essentially a linked list of middlewares to run in order.
function middlewareChain(dest) {
    var middlewares = [];
    // Return a copy to prevent external mutations.
    dest.getMiddlewares = function () {
        return middlewares.slice();
    };
    dest.add = function (middleware) {
        if (typeof middleware !== 'function')
            throw new Error('attempted to add non-function middleware');
        // Check for identical object references - bug check.
        if (middlewares.indexOf(middleware) !== -1)
            throw new Error('middleware is already registered');
        middlewares.push(middleware);
    };
    // fn is the callback to be run once all middlewares have been applied.
    return function applyMiddlewares(run, facade, callback) {
        if (typeof facade !== 'object')
            throw new Error('applyMiddlewares requires a payload object');
        if (typeof callback !== 'function')
            throw new Error('applyMiddlewares requires a function callback');
        // Attach callback to the end of the chain.
        var middlewaresToApply = middlewares.slice();
        middlewaresToApply.push(callback);
        executeChain(run, facade, middlewaresToApply, 0);
    };
}
// Go over all middlewares until all have been applied.
function executeChain(run, payload, middlewares, index) {
    // If the facade has been nullified, immediately skip to the final middleware.
    if (payload === null) {
        middlewares[middlewares.length - 1](null);
        return;
    }
    // Check if the payload is still a Facade. If not, convert it to one.
    if (!(payload instanceof Facade)) {
        payload = new Facade(payload);
    }
    var mw = middlewares[index];
    if (mw) {
        // If there's another middleware, continue down the chain. Otherwise, call the final function.
        if (middlewares[index + 1]) {
            run(mw, payload, function (result) {
                executeChain(run, result, middlewares, ++index);
            });
        }
        else {
            mw(payload);
        }
    }
}
module.exports.middlewareChain = middlewareChain;

},{"segmentio-facade":95}],80:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Module Dependencies.
 */
var debug = require('debug')('analytics.js:normalize');
var defaults = require('@ndhoule/defaults');
var each = require('./utils/each');
var includes = require('@ndhoule/includes');
var map = require('./utils/map');
var type = require('component-type');
var uuid = require('uuid/v4');
var md5 = require('spark-md5').hash;
/**
 * HOP.
 */
var has = Object.prototype.hasOwnProperty;
/**
 * Expose `normalize`
 */
module.exports = normalize;
/**
 * Toplevel properties.
 */
var toplevel = ['integrations', 'anonymousId', 'timestamp', 'context'];
function normalize(msg, list) {
    var lower = map(function (s) {
        return s.toLowerCase();
    }, list);
    var opts = msg.options || {};
    var integrations = opts.integrations || {};
    var providers = opts.providers || {};
    var context = opts.context || {};
    var ret = {};
    debug('<-', msg);
    // integrations.
    each(function (value, key) {
        if (!integration(key))
            return;
        if (!has.call(integrations, key))
            integrations[key] = value;
        delete opts[key];
    }, opts);
    // providers.
    delete opts.providers;
    each(function (value, key) {
        if (!integration(key))
            return;
        if (type(integrations[key]) === 'object')
            return;
        if (has.call(integrations, key) && typeof providers[key] === 'boolean')
            return;
        integrations[key] = value;
    }, providers);
    // move all toplevel options to msg
    // and the rest to context.
    each(function (_value, key) {
        if (includes(key, toplevel)) {
            ret[key] = opts[key];
        }
        else {
            context[key] = opts[key];
        }
    }, opts);
    // generate and attach a messageId to msg
    msg.messageId = 'ajs-' + md5(window.JSON.stringify(msg) + uuid());
    // cleanup
    delete msg.options;
    ret.integrations = integrations;
    ret.context = context;
    ret = defaults(ret, msg);
    debug('->', ret);
    return ret;
    function integration(name) {
        return !!(includes(name, list) ||
            name.toLowerCase() === 'all' ||
            includes(name.toLowerCase(), lower));
    }
}

},{"./utils/each":85,"./utils/map":86,"@ndhoule/defaults":30,"@ndhoule/includes":37,"component-type":1291,"debug":87,"spark-md5":1400,"uuid/v4":1428}],81:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Module dependencies.
 */
var canonical = require('@segment/canonical');
var includes = require('@ndhoule/includes');
var url = require('component-url');
/**
 * Return a default `options.context.page` object.
 *
 * https://segment.com/docs/spec/page/#properties
 */
function pageDefaults() {
    return {
        path: canonicalPath(),
        referrer: document.referrer,
        search: location.search,
        title: document.title,
        url: canonicalUrl(location.search)
    };
}
/**
 * Return the canonical path for the page.
 */
function canonicalPath() {
    var canon = canonical();
    if (!canon)
        return window.location.pathname;
    var parsed = url.parse(canon);
    return parsed.pathname;
}
/**
 * Return the canonical URL for the page concat the given `search`
 * and strip the hash.
 */
function canonicalUrl(search) {
    var canon = canonical();
    if (canon)
        return includes('?', canon) ? canon : canon + search;
    var url = window.location.href;
    var i = url.indexOf('#');
    return i === -1 ? url : url.slice(0, i);
}
/*
 * Exports.
 */
module.exports = pageDefaults;

},{"@ndhoule/includes":37,"@segment/canonical":1193,"component-url":1292}],82:[function(require,module,exports){
'use strict';
/*
 * Module dependencies.
 */
var bindAll = require('bind-all');
var defaults = require('@ndhoule/defaults');
var store = require('@segment/store');
/**
 * Initialize a new `Store` with `options`.
 *
 * @param {Object} options
 */
function Store(options) {
    this.options(options);
}
/**
 * Set the `options` for the store.
 */
Store.prototype.options = function (options) {
    if (arguments.length === 0)
        return this._options;
    options = options || {};
    defaults(options, { enabled: true });
    this.enabled = options.enabled && store.enabled;
    this._options = options;
};
/**
 * Set a `key` and `value` in local storage.
 */
Store.prototype.set = function (key, value) {
    if (!this.enabled)
        return false;
    return store.set(key, value);
};
/**
 * Get a value from local storage by `key`.
 */
Store.prototype.get = function (key) {
    if (!this.enabled)
        return null;
    return store.get(key);
};
/**
 * Remove a value from local storage by `key`.
 */
Store.prototype.remove = function (key) {
    if (!this.enabled)
        return false;
    return store.remove(key);
};
/**
 * Expose the store singleton.
 */
module.exports = bindAll(new Store());
/**
 * Expose the `Store` constructor.
 */
module.exports.Store = Store;

},{"@ndhoule/defaults":30,"@segment/store":1218,"bind-all":1272}],83:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var Entity = require('./entity');
var bindAll = require('bind-all');
var cookie = require('./cookie');
var debug = require('debug')('analytics:user');
var inherit = require('inherits');
var rawCookie = require('@segment/cookie');
var uuid = require('uuid');
var localStorage = require('./store');
User.defaults = {
    persist: true,
    cookie: {
        key: 'ajs_user_id',
        oldKey: 'ajs_user'
    },
    localStorage: {
        key: 'ajs_user_traits'
    }
};
/**
 * Initialize a new `User` with `options`.
 */
function User(options) {
    this.defaults = User.defaults;
    this.debug = debug;
    Entity.call(this, options);
}
/**
 * Inherit `Entity`
 */
inherit(User, Entity);
/**
 * Set/get the user id.
 *
 * When the user id changes, the method will reset his anonymousId to a new one.
 *
 * @example
 * // didn't change because the user didn't have previous id.
 * anonymousId = user.anonymousId();
 * user.id('foo');
 * assert.equal(anonymousId, user.anonymousId());
 *
 * // didn't change because the user id changed to null.
 * anonymousId = user.anonymousId();
 * user.id('foo');
 * user.id(null);
 * assert.equal(anonymousId, user.anonymousId());
 *
 * // change because the user had previous id.
 * anonymousId = user.anonymousId();
 * user.id('foo');
 * user.id('baz'); // triggers change
 * user.id('baz'); // no change
 * assert.notEqual(anonymousId, user.anonymousId());
 */
User.prototype.id = function (id) {
    var prev = this._getId();
    var ret = Entity.prototype.id.apply(this, arguments);
    if (prev == null)
        return ret;
    // FIXME: We're relying on coercion here (1 == "1"), but our API treats these
    // two values differently. Figure out what will break if we remove this and
    // change to strict equality
    /* eslint-disable eqeqeq */
    if (prev != id && id)
        this.anonymousId(null);
    /* eslint-enable eqeqeq */
    return ret;
};
/**
 * Set / get / remove anonymousId.
 *
 * @param {String} anonymousId
 * @return {String|User}
 */
User.prototype.anonymousId = function (anonymousId) {
    var store = this.storage();
    // set / remove
    if (arguments.length) {
        store.set('ajs_anonymous_id', anonymousId);
        this._setAnonymousIdInLocalStorage(anonymousId);
        return this;
    }
    // new
    anonymousId = store.get('ajs_anonymous_id');
    if (anonymousId) {
        // value exists in cookie, copy it to localStorage
        this._setAnonymousIdInLocalStorage(anonymousId);
        // refresh cookie to extend expiry
        store.set('ajs_anonymous_id', anonymousId);
        return anonymousId;
    }
    if (!this._options.localStorageFallbackDisabled) {
        // if anonymousId doesn't exist in cookies, check localStorage
        anonymousId = localStorage.get('ajs_anonymous_id');
        if (anonymousId) {
            // Write to cookies if available in localStorage but not cookies
            store.set('ajs_anonymous_id', anonymousId);
            return anonymousId;
        }
    }
    // old - it is not stringified so we use the raw cookie.
    anonymousId = rawCookie('_sio');
    if (anonymousId) {
        anonymousId = anonymousId.split('----')[0];
        store.set('ajs_anonymous_id', anonymousId);
        this._setAnonymousIdInLocalStorage(anonymousId);
        store.remove('_sio');
        return anonymousId;
    }
    // empty
    anonymousId = uuid.v4();
    store.set('ajs_anonymous_id', anonymousId);
    this._setAnonymousIdInLocalStorage(anonymousId);
    return store.get('ajs_anonymous_id');
};
/**
 * Set the user's `anonymousid` in local storage.
 */
User.prototype._setAnonymousIdInLocalStorage = function (id) {
    if (!this._options.localStorageFallbackDisabled) {
        localStorage.set('ajs_anonymous_id', id);
    }
};
/**
 * Remove anonymous id on logout too.
 */
User.prototype.logout = function () {
    Entity.prototype.logout.call(this);
    this.anonymousId(null);
};
/**
 * Load saved user `id` or `traits` from storage.
 */
User.prototype.load = function () {
    if (this._loadOldCookie())
        return;
    Entity.prototype.load.call(this);
};
/**
 * BACKWARDS COMPATIBILITY: Load the old user from the cookie.
 *
 * @api private
 */
User.prototype._loadOldCookie = function () {
    var user = cookie.get(this._options.cookie.oldKey);
    if (!user)
        return false;
    this.id(user.id);
    this.traits(user.traits);
    cookie.remove(this._options.cookie.oldKey);
    return true;
};
/**
 * Expose the user singleton.
 */
module.exports = bindAll(new User());
/**
 * Expose the `User` constructor.
 */
module.exports.User = User;

},{"./cookie":73,"./entity":74,"./store":82,"@segment/cookie":1195,"bind-all":1272,"debug":87,"inherits":1313,"uuid":1424}],84:[function(require,module,exports){
'use strict';
var type = require('component-type');
/**
 * Deeply clone an object.
 *
 * @param {*} obj Any object.
 *
 * COPYRIGHT: https://github.com/ndhoule/clone/blob/master/LICENSE.md
 * The MIT License (MIT)
 * Copyright (c) 2015 Nathan Houle
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var clone = function clone(obj) {
    var t = type(obj);
    var copy;
    if (t === 'object') {
        copy = {};
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                copy[key] = clone(obj[key]);
            }
        }
        return copy;
    }
    if (t === 'array') {
        copy = new Array(obj.length);
        for (var i = 0, l = obj.length; i < l; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }
    if (t === 'regexp') {
        // from millermedeiros/amd-utils - MIT
        var flags = '';
        flags += obj.multiline ? 'm' : '';
        flags += obj.global ? 'g' : '';
        flags += obj.ignoreCase ? 'i' : '';
        return new RegExp(obj.source, flags);
    }
    if (t === 'date') {
        return new Date(obj.getTime());
    }
    // string, number, boolean, etc.
    return obj;
};
module.exports = clone;

},{"component-type":1291}],85:[function(require,module,exports){
'use strict';
/*
 * The MIT License (MIT)
 * Copyright (c) 2015 Nathan Houle
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/*
 * Module dependencies.
 */
var keys = require('@ndhoule/keys');
var objToString = Object.prototype.toString;
/**
 * Tests if a value is a number.
 *
 * @name isNumber
 * @api private
 * @param {*} val The value to test.
 * @return {boolean} Returns `true` if `val` is a number, otherwise `false`.
 */
var isNumber = function isNumber(val) {
    var type = typeof val;
    return (type === 'number' ||
        (type === 'object' && objToString.call(val) === '[object Number]'));
};
/**
 * Tests if a value is an array.
 *
 * @name isArray
 * @api private
 * @param {*} val The value to test.
 * @return {boolean} Returns `true` if the value is an array, otherwise `false`.
 */
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function isArray(val) {
        return objToString.call(val) === '[object Array]';
    };
/**
 * Tests if a value is array-like. Array-like means the value is not a function and has a numeric
 * `.length` property.
 *
 * @name isArrayLike
 * @api private
 * @param {*} val
 * @return {boolean}
 */
var isArrayLike = function isArrayLike(val) {
    return (val != null &&
        (isArray(val) || (val !== 'function' && isNumber(val.length))));
};
/**
 * Internal implementation of `each`. Works on arrays and array-like data structures.
 *
 * @name arrayEach
 * @api private
 * @param {Function(value, key, collection)} iterator The function to invoke per iteration.
 * @param {Array} array The array(-like) structure to iterate over.
 * @return {undefined}
 */
var arrayEach = function arrayEach(iterator, array) {
    for (var i = 0; i < array.length; i += 1) {
        // Break iteration early if `iterator` returns `false`
        if (iterator(array[i], i, array) === false) {
            break;
        }
    }
};
/**
 * Internal implementation of `each`. Works on objects.
 *
 * @name baseEach
 * @api private
 * @param {Function(value, key, collection)} iterator The function to invoke per iteration.
 * @param {Object} object The object to iterate over.
 * @return {undefined}
 */
var baseEach = function baseEach(iterator, object) {
    var ks = keys(object);
    for (var i = 0; i < ks.length; i += 1) {
        // Break iteration early if `iterator` returns `false`
        if (iterator(object[ks[i]], ks[i], object) === false) {
            break;
        }
    }
};
/**
 * Iterate over an input collection, invoking an `iterator` function for each element in the
 * collection and passing to it three arguments: `(value, index, collection)`. The `iterator`
 * function can end iteration early by returning `false`.
 *
 * @name each
 * @api public
 * @param {Function(value, key, collection)} iterator The function to invoke per iteration.
 * @param {Array|Object|string} collection The collection to iterate over.
 * @return {undefined} Because `each` is run only for side effects, always returns `undefined`.
 * @example
 * var log = console.log.bind(console);
 *
 * each(log, ['a', 'b', 'c']);
 * //-> 'a', 0, ['a', 'b', 'c']
 * //-> 'b', 1, ['a', 'b', 'c']
 * //-> 'c', 2, ['a', 'b', 'c']
 * //=> undefined
 *
 * each(log, 'tim');
 * //-> 't', 2, 'tim'
 * //-> 'i', 1, 'tim'
 * //-> 'm', 0, 'tim'
 * //=> undefined
 *
 * // Note: Iteration order not guaranteed across environments
 * each(log, { name: 'tim', occupation: 'enchanter' });
 * //-> 'tim', 'name', { name: 'tim', occupation: 'enchanter' }
 * //-> 'enchanter', 'occupation', { name: 'tim', occupation: 'enchanter' }
 * //=> undefined
 */
var each = function each(iterator, collection) {
    return (isArrayLike(collection) ? arrayEach : baseEach).call(this, iterator, collection);
};
/*
 * Exports.
 */
module.exports = each;

},{"@ndhoule/keys":38}],86:[function(require,module,exports){
'use strict';
/*
 * The MIT License (MIT)
 * Copyright (c) 2015 Nathan Houle
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/*
 * Module dependencies.
 */
var each = require('./each');
/**
 * Produce a new array by passing each value in the input `collection` through a transformative
 * `iterator` function. The `iterator` function is passed three arguments:
 * `(value, index, collection)`.
 *
 * @name map
 * @api public
 * @param {Function} iterator The transformer function to invoke per iteration.
 * @param {Array} collection The collection to iterate over.
 * @return {Array} A new array containing the results of each `iterator` invocation.
 * @example
 * var square = function(x) { return x * x; };
 *
 * map(square, [1, 2, 3]);
 * //=> [1, 4, 9]
 */
var map = function map(iterator, collection) {
    if (typeof iterator !== 'function') {
        throw new TypeError('Expected a function but received a ' + typeof iterator);
    }
    var result = [];
    each(function (val, i, collection) {
        result.push(iterator(val, i, collection));
    }, collection);
    return result;
};
/*
 * Exports.
 */
module.exports = map;

},{"./each":85}],87:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"./debug":88,"_process":1273,"dup":11}],88:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"dup":12,"ms":1355}],89:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"dup":57,"obj-case":1365}],90:[function(require,module,exports){
arguments[4][58][0].apply(exports,arguments)
},{"./facade":92,"./utils":100,"dup":58}],91:[function(require,module,exports){
arguments[4][59][0].apply(exports,arguments)
},{"./facade":92,"./utils":100,"dup":59}],92:[function(require,module,exports){
arguments[4][60][0].apply(exports,arguments)
},{"./address":89,"./is-enabled":96,"./utils":100,"@segment/isodate-traverse":1200,"dup":60,"new-date":1356,"obj-case":1365}],93:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"./facade":92,"./utils":100,"dup":61,"is-email":1317,"new-date":1356}],94:[function(require,module,exports){
arguments[4][62][0].apply(exports,arguments)
},{"./facade":92,"./utils":100,"dup":62,"is-email":1317,"new-date":1356,"obj-case":1365,"trim":1413}],95:[function(require,module,exports){
arguments[4][63][0].apply(exports,arguments)
},{"./alias":90,"./delete":91,"./facade":92,"./group":93,"./identify":94,"./page":97,"./screen":98,"./track":99,"dup":63}],96:[function(require,module,exports){
arguments[4][64][0].apply(exports,arguments)
},{"dup":64}],97:[function(require,module,exports){
arguments[4][65][0].apply(exports,arguments)
},{"./facade":92,"./track":99,"./utils":100,"dup":65,"is-email":1317}],98:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"./page":97,"./track":99,"./utils":100,"dup":66}],99:[function(require,module,exports){
arguments[4][67][0].apply(exports,arguments)
},{"./facade":92,"./identify":94,"./utils":100,"dup":67,"is-email":1317,"obj-case":1365}],100:[function(require,module,exports){
arguments[4][68][0].apply(exports,arguments)
},{"@ndhoule/clone":29,"dup":68,"inherits":1313,"type-component":1414}],101:[function(require,module,exports){
module.exports={
  "version": "4.0.4"
}
},{}],102:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@segment/analytics.js-integration":103}],103:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":104,"./statics":105,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":107,"dup":14,"slug-component":1398}],104:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":106,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],105:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],106:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],107:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":108,"_process":1273,"dup":11}],108:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],109:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@segment/analytics.js-integration":110,"@segment/to-iso-string":1219,"@segment/trample":1222,"obj-case":1365,"segmentio-facade":1390}],110:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":111,"./statics":112,"@ndhoule/defaults":30,"component-bind":1277,"debug":113,"dup":7,"extend":115,"slug-component":1398}],111:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],112:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],113:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":114,"_process":1273,"dup":11}],114:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],115:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],116:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":117}],117:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":118,"./statics":119,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":121,"dup":14,"slug-component":1398}],118:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":120,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],119:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],120:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],121:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":122,"_process":1273,"dup":11}],122:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],123:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@ndhoule/entries":33,"@ndhoule/extend":35,"@ndhoule/map":39,"@ndhoule/pick":40,"@ndhoule/values":42,"@segment/analytics.js-integration":124}],124:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":125,"./statics":126,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":128,"dup":14,"slug-component":1398}],125:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":127,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],126:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],127:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],128:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":129,"_process":1273,"dup":11}],129:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],130:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@ndhoule/foldl":36,"@ndhoule/map":39,"@segment/analytics.js-integration":131,"to-snake-case":1409,"use-https":1419}],131:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":132,"./statics":133,"@ndhoule/defaults":30,"component-bind":1277,"debug":134,"dup":7,"extend":136,"slug-component":1398}],132:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],133:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],134:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":135,"_process":1273,"dup":11}],135:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],136:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],137:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":138,"do-when":1301}],138:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":139,"./statics":140,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":142,"dup":14,"slug-component":1398}],139:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":141,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],140:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],141:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],142:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":143,"_process":1273,"dup":11}],143:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],144:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":145}],145:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":146,"./statics":147,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":149,"dup":14,"slug-component":1398}],146:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":148,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],147:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],148:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],149:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":150,"_process":1273,"dup":11}],150:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],151:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":152}],152:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":153,"./statics":154,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":156,"dup":14,"slug-component":1398}],153:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":155,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],154:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],155:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],156:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":157,"_process":1273,"dup":11}],157:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],158:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@segment/analytics.js-integration":159,"@segment/top-domain":1220,"component-bind":1277,"do-when":1301,"is":1321,"segmentio-facade":1390}],159:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":160,"./statics":161,"@ndhoule/defaults":30,"component-bind":1277,"debug":162,"dup":7,"extend":164,"slug-component":1398}],160:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],161:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],162:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":163,"_process":1273,"dup":11}],163:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],164:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],165:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/clone":29,"@ndhoule/each":32,"@segment/analytics.js-integration":166,"obj-case":1365,"segmentio-facade":178}],166:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":167,"./statics":168,"@ndhoule/defaults":30,"component-bind":1277,"debug":169,"dup":7,"extend":171,"slug-component":1398}],167:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],168:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],169:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":170,"_process":1273,"dup":11}],170:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],171:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],172:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":57,"obj-case":1365}],173:[function(require,module,exports){


module.exports = function() {};
;

},{"./facade":175,"./utils":183,"dup":58}],174:[function(require,module,exports){


module.exports = function() {};
;

},{"./facade":175,"./utils":183,"dup":59}],175:[function(require,module,exports){


module.exports = function() {};
;

},{"./address":172,"./is-enabled":179,"./utils":183,"@segment/isodate-traverse":1200,"dup":60,"new-date":1356,"obj-case":1365}],176:[function(require,module,exports){


module.exports = function() {};
;

},{"./facade":175,"./utils":183,"dup":61,"is-email":1317,"new-date":1356}],177:[function(require,module,exports){


module.exports = function() {};
;

},{"./facade":175,"./utils":183,"dup":62,"is-email":1317,"new-date":1356,"obj-case":1365,"trim":1413}],178:[function(require,module,exports){


module.exports = function() {};
;

},{"./alias":173,"./delete":174,"./facade":175,"./group":176,"./identify":177,"./page":180,"./screen":181,"./track":182,"dup":63}],179:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":64}],180:[function(require,module,exports){


module.exports = function() {};
;

},{"./facade":175,"./track":182,"./utils":183,"dup":65,"is-email":1317}],181:[function(require,module,exports){


module.exports = function() {};
;

},{"./page":180,"./track":182,"./utils":183,"dup":66}],182:[function(require,module,exports){


module.exports = function() {};
;

},{"./facade":175,"./identify":177,"./utils":183,"dup":67,"is-email":1317,"obj-case":1365}],183:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/clone":29,"dup":68,"inherits":1313,"type-component":1414}],184:[function(require,module,exports){


module.exports = function() {};
;

},{}],185:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"./appboyUtil":184,"@ndhoule/clone":29,"@ndhoule/each":32,"@segment/analytics.js-integration":186,"obj-case":1365,"segmentio-facade":1390}],186:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":187,"./statics":188,"@ndhoule/defaults":30,"component-bind":1277,"debug":189,"dup":7,"extend":191,"slug-component":1398}],187:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],188:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],189:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":190,"_process":1273,"dup":11}],190:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],191:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],192:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":193,"@segment/load-script":1202,"isobject":199}],193:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":194,"./statics":195,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":197,"dup":14,"slug-component":1398}],194:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":196,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],195:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],196:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],197:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":198,"_process":1273,"dup":11}],198:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],199:[function(require,module,exports){


module.exports = function() {};
;

},{"isarray":1322}],200:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@segment/analytics.js-integration":201,"component-querystring":1289,"to-no-case":1408,"use-https":1419}],201:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":202,"./statics":203,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":205,"dup":14,"slug-component":1398}],202:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":204,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],203:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],204:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],205:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":206,"_process":1273,"dup":11}],206:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],207:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":208,"segmentio-facade":1390}],208:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":209,"./statics":210,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":212,"dup":14,"slug-component":1398}],209:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":211,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],210:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],211:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],212:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":213,"_process":1273,"dup":11}],213:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],214:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":215,"isobject":221}],215:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":216,"./statics":217,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":219,"dup":14,"slug-component":1398}],216:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":218,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],217:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],218:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],219:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":220,"_process":1273,"dup":11}],220:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],221:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":199,"isarray":1322}],222:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":223}],223:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":224,"./statics":225,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":227,"dup":14,"slug-component":1398}],224:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":226,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],225:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],226:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],227:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":228,"_process":1273,"dup":11}],228:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],229:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@segment/analytics.js-integration":230}],230:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":231,"./statics":232,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":234,"dup":14,"slug-component":1398}],231:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":233,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],232:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],233:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],234:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":235,"_process":1273,"dup":11}],235:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],236:[function(require,module,exports){


'use strict';

/**
 * Module dependencies.
 */

var integration = require('@segment/analytics.js-integration');

/**
 * Expose `Bing`.
 *
 * https://bingads.microsoft.com/campaign/signup
 */

var Bing = module.exports = integration('Bing Ads')
  .global('UET')
  .global('uetq')
  .option('tagId', '')
  .tag('<script src="//bat.bing.com/bat.js">');

/**
 * Initialize.
 *
 * Inferred from their snippet:
 * https://gist.github.com/sperand-io/8bef4207e9c66e1aa83b
 *
 * @api public
 */

Bing.prototype.initialize = function() {
  window.uetq = window.uetq || [];
  var self = this;

  self.load(function() {
    var setup = {
      ti: self.options.tagId,
      q: window.uetq
    };

    window.uetq = new window.UET(setup);
    self.ready();
  });
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Bing.prototype.loaded = function() {
  return !!(window.uetq && window.uetq.push !== Array.prototype.push);
};

/**
 * Page.
 *
 * @api public
 */

Bing.prototype.page = function() {
  window.uetq.push('pageLoad');
};

/**
 * Track.
 *
 * Send all events then set goals based
 * on them retroactively: http://advertise.bingads.microsoft.com/en-us/uahelp-topic?market=en&project=Bing_Ads&querytype=topic&query=HLP_BA_PROC_UET.htm
 *
 * @api public
 * @param {Track} track
 */

Bing.prototype.track = function(track) {
  var event = {
    ea: 'track',
    el: track.event()
  };

  if (track.category()) event.ec = track.category();
  if (track.revenue()) event.gv = track.revenue();

  window.uetq.push(event);
};



},{"@segment/analytics.js-integration":237}],237:[function(require,module,exports){

;
arguments[4][14][0].apply(exports,arguments)
;

},{"./protos":238,"./statics":239,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":241,"dup":14,"slug-component":1398}],238:[function(require,module,exports){

;
arguments[4][15][0].apply(exports,arguments)
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":240,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],239:[function(require,module,exports){

;
arguments[4][16][0].apply(exports,arguments)
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],240:[function(require,module,exports){

;
arguments[4][17][0].apply(exports,arguments)
;

},{"dup":17}],241:[function(require,module,exports){

;
arguments[4][11][0].apply(exports,arguments)
;

},{"./debug":242,"_process":1273,"dup":11}],242:[function(require,module,exports){

;
arguments[4][12][0].apply(exports,arguments)
;

},{"dup":12,"ms":1355}],243:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/foldl":36,"@segment/analytics.js-integration":244}],244:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":245,"./statics":246,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":248,"dup":14,"slug-component":1398}],245:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":247,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],246:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],247:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],248:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":249,"_process":1273,"dup":11}],249:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],250:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":251,"@segment/convert-dates":1194,"spark-md5":1400}],251:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":252,"./statics":253,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":255,"dup":14,"slug-component":1398}],252:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":254,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],253:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],254:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],255:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":256,"_process":1273,"dup":11}],256:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],257:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@segment/analytics.js-integration":258,"component-querystring":1289,"segmentio-facade":1390}],258:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":259,"./statics":260,"@ndhoule/defaults":30,"component-bind":1277,"debug":261,"dup":7,"extend":263,"slug-component":1398}],259:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],260:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],261:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":262,"_process":1273,"dup":11}],262:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],263:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],264:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":265,"next-tick":1360}],265:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":266,"./statics":267,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":269,"dup":14,"slug-component":1398}],266:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":268,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],267:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],268:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],269:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":270,"_process":1273,"dup":11}],270:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],271:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/extend":35,"@segment/analytics.js-integration":272,"isobject":278}],272:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":273,"./statics":274,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":276,"dup":14,"slug-component":1398}],273:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":275,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],274:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],275:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],276:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":277,"_process":1273,"dup":11}],277:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],278:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":199,"isarray":1322}],279:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":280}],280:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":281,"./statics":282,"@ndhoule/defaults":30,"component-bind":1277,"debug":283,"dup":7,"extend":285,"slug-component":1398}],281:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],282:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],283:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":284,"_process":1273,"dup":11}],284:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],285:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],286:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":287}],287:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":288,"./statics":289,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":291,"dup":14,"slug-component":1398}],288:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":290,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],289:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],290:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],291:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":292,"_process":1273,"dup":11}],292:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],293:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/defaults":30,"@segment/analytics.js-integration":294,"on-body":1373}],294:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":295,"./statics":296,"@ndhoule/defaults":30,"component-bind":1277,"debug":297,"dup":7,"extend":299,"slug-component":1398}],295:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],296:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],297:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":298,"_process":1273,"dup":11}],298:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],299:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],300:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@segment/analytics.js-integration":301,"is":1321,"use-https":1419}],301:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":302,"./statics":303,"@ndhoule/defaults":30,"component-bind":1277,"debug":304,"dup":7,"extend":306,"slug-component":1398}],302:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],303:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],304:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":305,"_process":1273,"dup":11}],305:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],306:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],307:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/extend":35,"@segment/analytics.js-integration":308,"isobject":314,"segmentio-facade":1390}],308:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":309,"./statics":310,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":312,"dup":14,"slug-component":1398}],309:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":311,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],310:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],311:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],312:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":313,"_process":1273,"dup":11}],313:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],314:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":199,"isarray":1322}],315:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":316,"use-https":1419}],316:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":317,"./statics":318,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":320,"dup":14,"slug-component":1398}],317:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":319,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],318:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],319:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],320:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":321,"_process":1273,"dup":11}],321:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],322:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@segment/analytics.js-integration":323,"global-queue":1307}],323:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":324,"./statics":325,"@ndhoule/defaults":30,"component-bind":1277,"debug":326,"dup":7,"extend":328,"slug-component":1398}],324:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],325:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],326:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":327,"_process":1273,"dup":11}],327:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],328:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],329:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":330}],330:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":331,"./statics":332,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":334,"dup":14,"slug-component":1398}],331:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":333,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],332:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],333:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],334:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":335,"_process":1273,"dup":11}],335:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],336:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@ndhoule/extend":35,"@ndhoule/pick":40,"@ndhoule/values":42,"@segment/analytics.js-integration":337,"is":1321,"is-email":343,"md5":1354,"obj-case":1365,"use-https":1419}],337:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":338,"./statics":339,"@ndhoule/defaults":30,"component-bind":1277,"debug":340,"dup":7,"extend":342,"slug-component":1398}],338:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],339:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],340:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":341,"_process":1273,"dup":11}],341:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],342:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],343:[function(require,module,exports){


module.exports = function() {};
;

},{}],344:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@segment/analytics.js-integration":345,"@segment/to-iso-string":1219,"component-bind":1277,"do-when":1301,"global-queue":1307,"segmentio-facade":1390,"throttleit":1402}],345:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":346,"./statics":347,"@ndhoule/defaults":30,"component-bind":1277,"debug":348,"dup":7,"extend":350,"slug-component":1398}],346:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],347:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],348:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":349,"_process":1273,"dup":11}],349:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],350:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],351:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/alias":71,"@segment/analytics.js-integration":352,"@segment/convert-dates":1194,"segmentio-facade":1390}],352:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":353,"./statics":354,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":356,"dup":14,"slug-component":1398}],353:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":355,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],354:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],355:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],356:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":357,"_process":1273,"dup":11}],357:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],358:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":359,"is":1321}],359:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":360,"./statics":361,"@ndhoule/defaults":30,"component-bind":1277,"debug":362,"dup":7,"extend":364,"slug-component":1398}],360:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],361:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],362:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":363,"_process":1273,"dup":11}],363:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],364:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],365:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@ndhoule/foldl":36,"@segment/analytics.js-integration":366,"component-querystring":1289,"obj-case":1365,"to-no-case":1408}],366:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":367,"./statics":368,"@ndhoule/defaults":30,"component-bind":1277,"debug":369,"dup":7,"extend":371,"slug-component":1398}],367:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],368:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],369:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":370,"_process":1273,"dup":11}],370:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],371:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],372:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@segment/analytics.js-integration":373,"@segment/convert-dates":1194}],373:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":374,"./statics":375,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":377,"dup":14,"slug-component":1398}],374:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":376,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],375:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],376:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],377:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":378,"_process":1273,"dup":11}],378:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],379:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@segment/analytics.js-integration":380,"global-queue":1307,"isobject":386,"obj-case":1365}],380:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":381,"./statics":382,"@ndhoule/defaults":30,"component-bind":1277,"debug":383,"dup":7,"extend":385,"slug-component":1398}],381:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],382:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],383:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":384,"_process":1273,"dup":11}],384:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],385:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],386:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":199,"isarray":1322}],387:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@ndhoule/keys":38,"@segment/analytics.js-integration":388,"next-tick":395,"obj-case":1365}],388:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":389,"./statics":390,"@ndhoule/defaults":30,"component-bind":1277,"debug":392,"dup":7,"extend":394,"slug-component":1398}],389:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":391,"to-no-case":1408}],390:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],391:[function(require,module,exports){
(function (process,setImmediate){
'use strict';

var callable, byObserver;

callable = function (fn) {
	if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
	return fn;
};

byObserver = function (Observer) {
	var node = document.createTextNode(''), queue, i = 0;
	new Observer(function () {
		var data;
		if (!queue) return;
		data = queue;
		queue = null;
		if (typeof data === 'function') {
			data();
			return;
		}
		data.forEach(function (fn) { fn(); });
	}).observe(node, { characterData: true });
	return function (fn) {
		callable(fn);
		if (queue) {
			if (typeof queue === 'function') queue = [queue, fn];
			else queue.push(fn);
			return;
		}
		queue = fn;
		node.data = (i = ++i % 2);
	};
};

module.exports = (function () {
	// Node.js
	if ((typeof process !== 'undefined') && process &&
			(typeof process.nextTick === 'function')) {
		return process.nextTick;
	}

	// MutationObserver=
	if ((typeof document === 'object') && document) {
		if (typeof MutationObserver === 'function') {
			return byObserver(MutationObserver);
		}
		if (typeof WebKitMutationObserver === 'function') {
			return byObserver(WebKitMutationObserver);
		}
	}

	// W3C Draft
	// http://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
	if (typeof setImmediate === 'function') {
		return function (cb) { setImmediate(callable(cb)); };
	}

	// Wide available standard
	if (typeof setTimeout === 'function') {
		return function (cb) { setTimeout(callable(cb), 0); };
	}

	return null;
}());

}).call(this,require('_process'),require("timers").setImmediate)
},{"_process":1273,"timers":1403}],392:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":393,"_process":1273,"dup":11}],393:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],394:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],395:[function(require,module,exports){

;
(function (process,setImmediate){
'use strict';

var callable, byObserver;

callable = function (fn) {
	if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
	return fn;
};

byObserver = function (Observer) {
	var node = document.createTextNode(''), queue, currentQueue, i = 0;
	new Observer(function () {
		var callback;
		if (!queue) {
			if (!currentQueue) return;
			queue = currentQueue;
		} else if (currentQueue) {
			queue = currentQueue.concat(queue);
		}
		currentQueue = queue;
		queue = null;
		if (typeof currentQueue === 'function') {
			callback = currentQueue;
			currentQueue = null;
			callback();
			return;
		}
		node.data = (i = ++i % 2); // Invoke other batch, to handle leftover callbacks in case of crash
		while (currentQueue) {
			callback = currentQueue.shift();
			if (!currentQueue.length) currentQueue = null;
			callback();
		}
	}).observe(node, { characterData: true });
	return function (fn) {
		callable(fn);
		if (queue) {
			if (typeof queue === 'function') queue = [queue, fn];
			else queue.push(fn);
			return;
		}
		queue = fn;
		node.data = (i = ++i % 2);
	};
};

module.exports = (function () {
	// Node.js
	if ((typeof process === 'object') && process && (typeof process.nextTick === 'function')) {
		return process.nextTick;
	}

	// MutationObserver
	if ((typeof document === 'object') && document) {
		if (typeof MutationObserver === 'function') return byObserver(MutationObserver);
		if (typeof WebKitMutationObserver === 'function') return byObserver(WebKitMutationObserver);
	}

	// W3C Draft
	// http://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
	if (typeof setImmediate === 'function') {
		return function (cb) { setImmediate(callable(cb)); };
	}

	// Wide available standard
	if ((typeof setTimeout === 'function') || (typeof setTimeout === 'object')) {
		return function (cb) { setTimeout(callable(cb), 0); };
	}

	return null;
}());

}).call(this,require('_process'),require("timers").setImmediate)
;

},{"_process":1273,"timers":1403}],396:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":397,"global-queue":1307}],397:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":398,"./statics":399,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":401,"dup":14,"slug-component":1398}],398:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":400,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],399:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],400:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],401:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":402,"_process":1273,"dup":11}],402:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],403:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":404}],404:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":405,"./statics":406,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":408,"dup":14,"slug-component":1398}],405:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":407,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],406:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],407:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],408:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":409,"_process":1273,"dup":11}],409:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],410:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/extend":411,"@segment/analytics.js-integration":412,"global-queue":1307}],411:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":35}],412:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":413,"./statics":414,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":415,"component-bind":1277,"debug":417,"dup":14,"slug-component":1398}],413:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":416,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],414:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],415:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":35}],416:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],417:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":418,"_process":1273,"dup":11}],418:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],419:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@segment/analytics.js-integration":420,"global-queue":1307}],420:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":421,"./statics":422,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":424,"dup":14,"slug-component":1398}],421:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":423,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],422:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],423:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],424:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":425,"_process":1273,"dup":11}],425:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],426:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@ndhoule/extend":35,"@segment/analytics.js-integration":427,"domify":1302,"json3":1326}],427:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":428,"./statics":429,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":431,"dup":14,"slug-component":1398}],428:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":430,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],429:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],430:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],431:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":432,"_process":1273,"dup":11}],432:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],433:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@segment/analytics.js-integration":434,"global-queue":1307}],434:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":435,"./statics":436,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":438,"dup":14,"slug-component":1398}],435:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":437,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],436:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],437:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],438:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":439,"_process":1273,"dup":11}],439:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],440:[function(require,module,exports){


'use strict';

/**
 * Module dependencies.
 */

var integration = require('@segment/analytics.js-integration');
var each = require('@ndhoule/each');
var reject = require('reject');
var camel = require('to-camel-case');
var is = require('is');
var dateformat = require('dateformat');
var Track = require('segmentio-facade').Track;
var sha256 = require('js-sha256');

/**
 * Expose `Facebook Pixel`.
 */

var FacebookPixel = (module.exports = integration('Facebook Pixel')
  .global('fbq')
  .option('pixelId', '')
  .option('agent', 'seg')
  .option('valueIdentifier', 'value')
  .option('initWithExistingTraits', false)
  .option('traverse', false)
  .option('automaticConfiguration', true)
  .option('whitelistPiiProperties', [])
  .option('blacklistPiiProperties', [])
  .option('standardEventsCustomProperties', [])
  .option('keyForExternalId', '')
  .option('userIdAsExternalId', false)
  .option('limitedDataUse', true)
  .mapping('standardEvents')
  .mapping('legacyEvents')
  .mapping('contentTypes')
  .tag('<script src="//connect.facebook.net/en_US/fbevents.js">'));

/**
 * FB requires these date fields be formatted in a specific way.
 * The specifications are non iso8601 compliant.
 * https://developers.facebook.com/docs/marketing-api/dynamic-ads-for-travel/audience
 * Therefore, we check if the property is one of these reserved fields.
 * If so, we check if we have converted it to an iso date object already.
 * If we have, we convert it again into Facebook's spec.
 * If we have not, the user has likely passed in a date string that already
 * adheres to FB's docs so we can just pass it through as is.
 */
var dateFields = [
  'checkinDate',
  'checkoutDate',
  'departingArrivalDate',
  'departingDepartureDate',
  'returningArrivalDate',
  'returningDepartureDate',
  'travelEnd',
  'travelStart'
];

/**
 * FB does not allow sending PII data with events. They provide a list of what they consider PII here:
 * https://developers.facebook.com/docs/facebook-pixel/pixel-with-ads/conversion-tracking
 * We need to check each property key to see if it matches what FB considers to be a PII property and strip it from the payload.
 * User's can override this by manually whitelisting keys they are ok with sending through in their integration settings.
 */
var defaultPiiProperties = [
  'email',
  'firstName',
  'lastName',
  'gender',
  'city',
  'country',
  'phone',
  'state',
  'zip',
  'birthday'
];

/**
 * Initialize Facebook Pixel.
 *
 * @param {Facade} page
 */

FacebookPixel.prototype.initialize = function() {
  window._fbq = function() {
    if (window.fbq.callMethod) {
      window.fbq.callMethod.apply(window.fbq, arguments);
    } else {
      window.fbq.queue.push(arguments);
    }
  };

  window.fbq = window.fbq || window._fbq;
  window.fbq.push = window.fbq;
  window.fbq.loaded = true;
  window.fbq.disablePushState = true; // disables automatic pageview tracking
  window.fbq.allowDuplicatePageViews = true; // enables fb
  window.fbq.agent = this.options.agent;
  window.fbq.version = '2.0';
  window.fbq.queue = [];
  this.load(this.ready);
  if (!this.options.automaticConfiguration) {
    window.fbq('set', 'autoConfig', false, this.options.pixelId);
  }
  if (this.options.limitedDataUse) {
    this.validateAndSetDataProcessing(
      this.options.dataProcessingOptions || [['LDU'], 0, 0]
    );
  } else {
    // explicitly not enable Limited Data Use (LDU) mode
    window.fbq('dataProcessingOptions', []);
  }
  if (this.options.initWithExistingTraits) {
    var traits = this.formatTraits(this.analytics);
    window.fbq('init', this.options.pixelId, traits);
  } else {
    window.fbq('init', this.options.pixelId);
  }
};

/**
 * Has the Facebook Pixel library been loaded yet?
 *
 * @return {Boolean}
 */

FacebookPixel.prototype.loaded = function() {
  return !!(window.fbq && window.fbq.callMethod);
};

/**
 * Trigger a page view.
 *
 * @param {Facade} identify
 */

FacebookPixel.prototype.page = function() {
  window.fbq('track', 'PageView');
};

/**
 * Track an event.
 *
 * @param {Facade} track
 */

FacebookPixel.prototype.track = function(track) {
  var self = this;
  var event = track.event();
  var revenue = formatRevenue(track.revenue());
  var payload = this.buildPayload(track);

  // Revenue
  if (track.properties().hasOwnProperty('revenue')) {
    payload.value = formatRevenue(track.revenue());
    // To keep compatible with the old implementation
    // that never added revenue to the payload
    delete payload.revenue;
  }

  var standard = this.standardEvents(event);
  var legacy = this.legacyEvents(event);

  // non-mapped events get sent as "custom events" with full
  // tranformed payload
  if (![].concat(standard, legacy).length) {
    window.fbq('trackSingleCustom', this.options.pixelId, event, payload, {
      eventID: track.proxy('messageId')
    });
    return;
  }

  // standard conversion events, mapped to one of 9 standard events
  // "Purchase" requires a currency parameter;
  // send full transformed payload
  each(function(event) {
    if (event === 'Purchase') payload.currency = track.currency(); // defaults to 'USD'
    window.fbq('trackSingle', self.options.pixelId, event, payload, {
      eventID: track.proxy('messageId')
    });
  }, standard);

  // legacy conversion events — mapped to specific "pixelId"s
  // send only currency and value
  each(function(event) {
    window.fbq(
      'trackSingle',
      self.options.pixelId,
      event,
      {
        currency: track.currency(),
        value: revenue
      },
      { eventID: track.proxy('messageId') }
    );
  }, legacy);
};

/**
 * Product List Viewed.
 *
 * @api private
 * @param {Track} track category
 */

FacebookPixel.prototype.productListViewed = function(track) {
  var self = this;
  var contentType;
  var contentIds = [];
  var contents = [];
  var products = track.products();
  var customProperties = this.buildPayload(track, true);

  // First, check to see if a products array with productIds has been defined.
  if (Array.isArray(products)) {
    products.forEach(function(product) {
      var track = new Track({ properties: product });
      var productId =
        track.proxy('properties.product_id') || track.productId() || track.id();

      if (productId) {
        contentIds.push(productId);
        contents.push({
          id: productId,
          quantity: track.quantity()
        });
      }
    });
  }

  // If no products have been defined, fallback on legacy behavior.
  // Facebook documents the content_type parameter decision here: https://developers.facebook.com/docs/facebook-pixel/api-reference
  if (contentIds.length) {
    contentType = ['product'];
  } else {
    contentIds.push(track.category() || '');
    contents.push({
      id: track.category() || '',
      quantity: 1
    });
    contentType = ['product_group'];
  }

  window.fbq(
    'trackSingle',
    this.options.pixelId,
    'ViewContent',
    merge(
      {
        content_ids: contentIds,
        content_type: this.getContentType(track, contentType),
        contents: contents
      },
      customProperties
    ),
    { eventID: track.proxy('messageId') }
  );

  // fall through for mapped legacy conversions
  each(function(event) {
    window.fbq(
      'trackSingle',
      self.options.pixelId,
      event,
      {
        currency: track.currency(),
        value: formatRevenue(track.revenue())
      },
      { eventID: track.proxy('messageId') }
    );
  }, this.legacyEvents(track.event()));
};

/**
 * Product viewed.
 *
 * @api private
 * @param {Track} track
 */

FacebookPixel.prototype.productViewed = function(track) {
  var self = this;
  var useValue = this.options.valueIdentifier === 'value';
  var customProperties = this.buildPayload(track, true);

  window.fbq(
    'trackSingle',
    this.options.pixelId,
    'ViewContent',
    merge(
      {
        content_ids: [track.productId() || track.id() || track.sku() || ''],
        content_type: this.getContentType(track, ['product']),
        content_name: track.name() || '',
        content_category: track.category() || '',
        currency: track.currency(),
        value: useValue
          ? formatRevenue(track.value())
          : formatRevenue(track.price()),
        contents: [
          {
            id: track.productId() || track.id() || track.sku() || '',
            quantity: track.quantity(),
            item_price: track.price()
          }
        ]
      },
      customProperties
    ),
    { eventID: track.proxy('messageId') }
  );

  // fall through for mapped legacy conversions
  each(function(event) {
    window.fbq(
      'trackSingle',
      self.options.pixelId,
      event,
      {
        currency: track.currency(),
        value: useValue
          ? formatRevenue(track.value())
          : formatRevenue(track.price())
      },
      { eventID: track.proxy('messageId') }
    );
  }, this.legacyEvents(track.event()));
};

/**
 * Product added.
 *
 * @api private
 * @param {Track} track
 */

FacebookPixel.prototype.productAdded = function(track) {
  var self = this;
  var useValue = this.options.valueIdentifier === 'value';
  var customProperties = this.buildPayload(track, true);

  window.fbq(
    'trackSingle',
    this.options.pixelId,
    'AddToCart',
    merge(
      {
        content_ids: [track.productId() || track.id() || track.sku() || ''],
        content_type: this.getContentType(track, ['product']),
        content_name: track.name() || '',
        content_category: track.category() || '',
        currency: track.currency(),
        value: useValue
          ? formatRevenue(track.value())
          : formatRevenue(track.price()),
        contents: [
          {
            id: track.productId() || track.id() || track.sku() || '',
            quantity: track.quantity(),
            item_price: track.price()
          }
        ]
      },
      customProperties
    ),
    { eventID: track.proxy('messageId') }
  );

  // fall through for mapped legacy conversions
  each(function(event) {
    window.fbq(
      'trackSingle',
      self.options.pixelId,
      event,
      {
        currency: track.currency(),
        value: useValue
          ? formatRevenue(track.value())
          : formatRevenue(track.price())
      },
      { eventID: track.proxy('messageId') }
    );
  }, this.legacyEvents(track.event()));
};

/**
 * Order Completed.
 *
 * @api private
 * @param {Track} track
 */

FacebookPixel.prototype.orderCompleted = function(track) {
  var self = this;
  var products = track.products();
  var customProperties = this.buildPayload(track, true);

  var revenue = formatRevenue(track.revenue());

  // Order completed doesn't have a top-level category spec'd.
  // Let's default to the category of the first product. - @gabriel

  var contentType = this.getContentType(track, ['product']);
  var contentIds = [];
  var contents = [];

  for (var i = 0; i < products.length; i++) {
    var trackItem = new Track({ properties: products[i] });
    var pId = trackItem.productId() || trackItem.id() || trackItem.sku();
    contentIds.push(pId);
    var content = {
      id: pId,
      quantity: trackItem.quantity()
    };
    if (trackItem.price()) {
      content.item_price = trackItem.price();
    }
    contents.push(content);
  }

  window.fbq(
    'trackSingle',
    this.options.pixelId,
    'Purchase',
    merge(
      {
        content_ids: contentIds,
        content_type: contentType,
        currency: track.currency(),
        value: revenue,
        contents: contents,
        num_items: contentIds.length
      },
      customProperties
    ),
    { eventID: track.proxy('messageId') }
  );

  // fall through for mapped legacy conversions
  each(function(event) {
    window.fbq(
      'trackSingle',
      self.options.pixelId,
      event,
      {
        currency: track.currency(),
        value: formatRevenue(track.revenue())
      },
      { eventID: track.proxy('messageId') }
    );
  }, this.legacyEvents(track.event()));
};

FacebookPixel.prototype.productsSearched = function(track) {
  var self = this;
  var customProperties = this.buildPayload(track, true);

  window.fbq(
    'trackSingle',
    this.options.pixelId,
    'Search',
    merge(
      {
        search_string: track.proxy('properties.query')
      },
      customProperties
    ),
    { eventID: track.proxy('messageId') }
  );

  // fall through for mapped legacy conversions
  each(function(event) {
    window.fbq(
      'trackSingle',
      self.options.pixelId,
      event,
      {
        currency: track.currency(),
        value: formatRevenue(track.revenue())
      },
      { eventID: track.proxy('messageId') }
    );
  }, this.legacyEvents(track.event()));
};

FacebookPixel.prototype.checkoutStarted = function(track) {
  var self = this;
  var products = track.products();
  var contentIds = [];
  var contents = [];
  var contentCategory = track.category();
  var customProperties = this.buildPayload(track, true);

  for (var i = 0; i < products.length; i++) {
    var trackItem = new Track({ properties: products[i] });
    var pId = trackItem.productId() || trackItem.id() || trackItem.sku();
    contentIds.push(pId);
    var content = {
      id: pId,
      quantity: trackItem.quantity(),
      item_price: track.price()
    };
    if (trackItem.price()) {
      content.item_price = trackItem.price();
    }
    contents.push(content);
  }

  // If no top-level category was defined use that of the first product. @gabriel
  if (!contentCategory && products[0] && products[0].category) {
    contentCategory = products[0].category;
  }

  window.fbq(
    'trackSingle',
    this.options.pixelId,
    'InitiateCheckout',
    merge(
      {
        content_category: contentCategory,
        content_ids: contentIds,
        content_type: this.getContentType(track, ['product']),
        contents: contents,
        currency: track.currency(),
        num_items: contentIds.length,
        value: formatRevenue(track.revenue())
      },
      customProperties
    ),
    { eventID: track.proxy('messageId') }
  );

  // fall through for mapped legacy conversions
  each(function(event) {
    window.fbq(
      'trackSingle',
      self.options.pixelId,
      event,
      {
        currency: track.currency(),
        value: formatRevenue(track.revenue())
      },
      { eventID: track.proxy('messageId') }
    );
  }, this.legacyEvents(track.event()));
};

/**
 * Returns an array of mapped content types for the category,
 * the provided value as an integration option or the default provided value.
 *
 * @param {Facade.Track} track Track payload
 * @param {Array} defaultValue Default array value returned if the previous parameters are not defined.
 *
 * @return Content Type array as defined in:
 * - https://developers.facebook.com/docs/facebook-pixel/reference/#object-properties
 * - https://developers.facebook.com/docs/marketing-api/dynamic-ads-for-real-estate/audience
 */
FacebookPixel.prototype.getContentType = function(track, defaultValue) {
  // 1- Integration options takes preference over everything
  var options = track.options('Facebook Pixel');
  if (options && options.contentType) {
    return [options.contentType];
  }

  // 2- Defined by category and its mappings
  var category = track.category();
  if (!category) {
    // Get the first product's category
    var products = track.products();
    if (products && products.length) {
      category = products[0].category;
    }
  }

  if (category) {
    var mapped = this.contentTypes(category);
    if (mapped.length) {
      return mapped;
    }
  }

  // 3- The default value
  return defaultValue;
};

/**
 * Get Revenue Formatted Correctly for FB.
 *
 * @api private
 * @param {Track} track
 */

function formatRevenue(revenue) {
  return Number(revenue || 0).toFixed(2);
}

/**
 * Get Traits Formatted Correctly for FB.
 *
 * https://developers.facebook.com/docs/facebook-pixel/pixel-with-ads/conversion-tracking#advanced_match
 *
 * @api private
 */
FacebookPixel.prototype.formatTraits = function formatTraits(analytics) {
  var traits = analytics && analytics.user().traits();
  if (!traits) return {};
  var firstName;
  var lastName;
  // Check for firstName property
  // else check for name
  if (traits.firstName || traits.first_name) {
    firstName = traits.firstName || traits.first_name;
    lastName = traits.lastName || traits.last_name;
  } else {
    var nameArray = (traits.name && traits.name.toLowerCase().split(' ')) || [];
    firstName = nameArray.shift();
    lastName = nameArray.pop();
  }
  var gender;
  if (traits.gender && is.string(traits.gender)) {
    gender = traits.gender.slice(0, 1).toLowerCase();
  }
  var birthday = traits.birthday && dateformat(traits.birthday, 'yyyymmdd');
  var address = traits.address || {};
  var city =
    address.city &&
    address.city
      .split(' ')
      .join('')
      .toLowerCase();
  var state = address.state && address.state.toLowerCase();
  var postalCode = address.postalCode || address.postal_code;
  var external_id; // eslint-disable-line
  if (this.options.keyForExternalId) {
    external_id = traits[this.options.keyForExternalId]; // eslint-disable-line
  }
  if (!external_id && this.options.userIdAsExternalId && analytics) { // eslint-disable-line
    external_id = analytics.user().id() || analytics.user().anonymousId(); // eslint-disable-line
  }
  return reject({
    em: traits.email,
    fn: firstName,
    ln: lastName,
    ph: traits.phone,
    ge: gender,
    db: birthday,
    ct: city,
    st: state,
    zp: postalCode,
    external_id: external_id  // eslint-disable-line
  });
};

/**
 * Builds the FB Event payload. It checks for PII fields and custom properties. If the event is Standard Event,
 * only properties defined in the setting are passed to the payload.
 *
 * @param {Facade.Track} track Track event.
 * @param {boolean} isStandardEvent Defines if the track call is a standard event.
 *
 * @return Payload to send deriveded from the track properties.
 */
FacebookPixel.prototype.buildPayload = function(track, isStandardEvent) {
  var whitelistPiiProperties = this.options.whitelistPiiProperties || [];
  var blacklistPiiProperties = this.options.blacklistPiiProperties || [];
  var standardEventsCustomProperties =
    this.options.standardEventsCustomProperties || [];

  // Transforming the setting in a map for easier lookups.
  var customPiiProperties = {};
  for (var i = 0; i < blacklistPiiProperties.length; i++) {
    var configuration = blacklistPiiProperties[i];
    customPiiProperties[configuration.propertyName] =
      configuration.hashProperty;
  }

  var payload = {};
  var properties = track.properties();

  for (var property in properties) {
    if (!properties.hasOwnProperty(property)) {
      continue;
    }

    // Standard Events only contains custom properties defined in the configuration
    // If the property is not listed there, we just drop it.
    if (
      isStandardEvent &&
      standardEventsCustomProperties.indexOf(property) < 0
    ) {
      continue;
    }

    var value = properties[property];

    // Dates
    if (dateFields.indexOf(camel(property)) >= 0) {
      if (is.date(value)) {
        payload[property] = value.toISOString().split('T')[0];
        continue;
      }
    }

    // Custom PII properties
    if (customPiiProperties.hasOwnProperty(property)) {
      // hash or drop
      if (customPiiProperties[property] && typeof value === 'string') {
        payload[property] = sha256(value);
      }
      continue;
    }

    // Default PII properties
    var isPropertyPii = defaultPiiProperties.indexOf(property) >= 0;
    var isPropertyWhitelisted = whitelistPiiProperties.indexOf(property) >= 0;
    if (!isPropertyPii || isPropertyWhitelisted) {
      payload[property] = value;
    }
  }

  return payload;
};

/**
 * Validates that a set of parameters are formatted correctly and passes them to the pixel instance.
 * https://developers.facebook.com/docs/marketing-apis/data-processing-options#reference
 *
 * @param {Array} options
 *
 * @api private
 */
FacebookPixel.prototype.validateAndSetDataProcessing = function(params) {
  var lenOk = params.length === 3;
  var valOk =
    Array.isArray(params[0]) &&
    typeof params[1] === 'number' &&
    typeof params[2] === 'number';

  // Pass the data processing options if they're valid, otherwise, fallback to geolocation.
  if (lenOk && valOk) {
    window.fbq('dataProcessingOptions', params[0], params[1], params[2]);
  } else {
    window.fbq('dataProcessingOptions', ['LDU'], 0, 0);
  }
};

/**
 * Merge two javascript objects. This works similarly to `Object.assign({}, obj1, obj2)`
 * but it's compatible with old browsers. The properties of the first argument takes preference
 * over the other.
 *
 * It does not do fancy stuff, just use it with top level properties.
 *
 * @param {Object} obj1 Object 1
 * @param {Object} obj2 Object 2
 *
 * @return {Object} a new object with all the properties of obj1 and the remainder of obj2.
 */
function merge(obj1, obj2) {
  var res = {};

  // All properties of obj1
  for (var propObj1 in obj1) {
    if (obj1.hasOwnProperty(propObj1)) {
      res[propObj1] = obj1[propObj1];
    }
  }

  // Extra properties of obj2
  for (var propObj2 in obj2) {
    if (obj2.hasOwnProperty(propObj2) && !res.hasOwnProperty(propObj2)) {
      res[propObj2] = obj2[propObj2];
    }
  }

  return res;
}

// Exposed only for testing
FacebookPixel.merge = merge;



},{"@ndhoule/each":32,"@segment/analytics.js-integration":441,"dateformat":444,"is":1321,"js-sha256":448,"reject":1382,"segmentio-facade":1390,"to-camel-case":1406}],441:[function(require,module,exports){

;
arguments[4][7][0].apply(exports,arguments)
;

},{"./protos":442,"./statics":443,"@ndhoule/defaults":30,"component-bind":1277,"debug":445,"dup":7,"extend":447,"slug-component":1398}],442:[function(require,module,exports){

;
arguments[4][8][0].apply(exports,arguments)
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],443:[function(require,module,exports){

;
arguments[4][9][0].apply(exports,arguments)
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],444:[function(require,module,exports){

;
/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

(function(global) {
  'use strict';

  var dateFormat = (function() {
      var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|'[^']*'|'[^']*'/g;
      var timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
      var timezoneClip = /[^-+\dA-Z]/g;
  
      // Regexes and supporting functions are cached through closure
      return function (date, mask, utc, gmt) {
  
        // You can't provide utc if you skip other args (use the 'UTC:' mask prefix)
        if (arguments.length === 1 && kindOf(date) === 'string' && !/\d/.test(date)) {
          mask = date;
          date = undefined;
        }
  
        date = date || new Date;
  
        if(!(date instanceof Date)) {
          date = new Date(date);
        }
  
        if (isNaN(date)) {
          throw TypeError('Invalid date');
        }
  
        mask = String(dateFormat.masks[mask] || mask || dateFormat.masks['default']);
  
        // Allow setting the utc/gmt argument via the mask
        var maskSlice = mask.slice(0, 4);
        if (maskSlice === 'UTC:' || maskSlice === 'GMT:') {
          mask = mask.slice(4);
          utc = true;
          if (maskSlice === 'GMT:') {
            gmt = true;
          }
        }
  
        var _ = utc ? 'getUTC' : 'get';
        var d = date[_ + 'Date']();
        var D = date[_ + 'Day']();
        var m = date[_ + 'Month']();
        var y = date[_ + 'FullYear']();
        var H = date[_ + 'Hours']();
        var M = date[_ + 'Minutes']();
        var s = date[_ + 'Seconds']();
        var L = date[_ + 'Milliseconds']();
        var o = utc ? 0 : date.getTimezoneOffset();
        var W = getWeek(date);
        var N = getDayOfWeek(date);
        var flags = {
          d:    d,
          dd:   pad(d),
          ddd:  dateFormat.i18n.dayNames[D],
          dddd: dateFormat.i18n.dayNames[D + 7],
          m:    m + 1,
          mm:   pad(m + 1),
          mmm:  dateFormat.i18n.monthNames[m],
          mmmm: dateFormat.i18n.monthNames[m + 12],
          yy:   String(y).slice(2),
          yyyy: y,
          h:    H % 12 || 12,
          hh:   pad(H % 12 || 12),
          H:    H,
          HH:   pad(H),
          M:    M,
          MM:   pad(M),
          s:    s,
          ss:   pad(s),
          l:    pad(L, 3),
          L:    pad(Math.round(L / 10)),
          t:    H < 12 ? 'a'  : 'p',
          tt:   H < 12 ? 'am' : 'pm',
          T:    H < 12 ? 'A'  : 'P',
          TT:   H < 12 ? 'AM' : 'PM',
          Z:    gmt ? 'GMT' : utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
          o:    (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
          S:    ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10],
          W:    W,
          N:    N
        };
  
        return mask.replace(token, function (match) {
          if (match in flags) {
            return flags[match];
          }
          return match.slice(1, match.length - 1);
        });
      };
    })();

  dateFormat.masks = {
    'default':               'ddd mmm dd yyyy HH:MM:ss',
    'shortDate':             'm/d/yy',
    'mediumDate':            'mmm d, yyyy',
    'longDate':              'mmmm d, yyyy',
    'fullDate':              'dddd, mmmm d, yyyy',
    'shortTime':             'h:MM TT',
    'mediumTime':            'h:MM:ss TT',
    'longTime':              'h:MM:ss TT Z',
    'isoDate':               'yyyy-mm-dd',
    'isoTime':               'HH:MM:ss',
    'isoDateTime':           'yyyy-mm-dd\'T\'HH:MM:sso',
    'isoUtcDateTime':        'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\'',
    'expiresHeaderFormat':   'ddd, dd mmm yyyy HH:MM:ss Z'
  };

  // Internationalization strings
  dateFormat.i18n = {
    dayNames: [
      'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ],
    monthNames: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ]
  };

function pad(val, len) {
  val = String(val);
  len = len || 2;
  while (val.length < len) {
    val = '0' + val;
  }
  return val;
}

/**
 * Get the ISO 8601 week number
 * Based on comments from
 * http://techblog.procurios.nl/k/n618/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
 *
 * @param  {Object} `date`
 * @return {Number}
 */
function getWeek(date) {
  // Remove time components of date
  var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Change date to Thursday same week
  targetThursday.setDate(targetThursday.getDate() - ((targetThursday.getDay() + 6) % 7) + 3);

  // Take January 4th as it is always in week 1 (see ISO 8601)
  var firstThursday = new Date(targetThursday.getFullYear(), 0, 4);

  // Change date to Thursday same week
  firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);

  // Check if daylight-saving-time-switch occured and correct for it
  var ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
  targetThursday.setHours(targetThursday.getHours() - ds);

  // Number of weeks between target Thursday and first Thursday
  var weekDiff = (targetThursday - firstThursday) / (86400000*7);
  return 1 + Math.floor(weekDiff);
}

/**
 * Get ISO-8601 numeric representation of the day of the week
 * 1 (for Monday) through 7 (for Sunday)
 * 
 * @param  {Object} `date`
 * @return {Number}
 */
function getDayOfWeek(date) {
  var dow = date.getDay();
  if(dow === 0) {
    dow = 7;
  }
  return dow;
}

/**
 * kind-of shortcut
 * @param  {*} val
 * @return {String}
 */
function kindOf(val) {
  if (val === null) {
    return 'null';
  }

  if (val === undefined) {
    return 'undefined';
  }

  if (typeof val !== 'object') {
    return typeof val;
  }

  if (Array.isArray(val)) {
    return 'array';
  }

  return {}.toString.call(val)
    .slice(8, -1).toLowerCase();
};



  if (typeof define === 'function' && define.amd) {
    define(function () {
      return dateFormat;
    });
  } else if (typeof exports === 'object') {
    module.exports = dateFormat;
  } else {
    global.dateFormat = dateFormat;
  }
})(this);

;

},{}],445:[function(require,module,exports){

;
arguments[4][11][0].apply(exports,arguments)
;

},{"./debug":446,"_process":1273,"dup":11}],446:[function(require,module,exports){

;
arguments[4][12][0].apply(exports,arguments)
;

},{"dup":12,"ms":1355}],447:[function(require,module,exports){

;
arguments[4][10][0].apply(exports,arguments)
;

},{"dup":10}],448:[function(require,module,exports){

;
(function (process,global){
/**
 * [js-sha256]{@link https://github.com/emn178/js-sha256}
 *
 * @version 0.9.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2017
 * @license MIT
 */
/*jslint bitwise: true */
(function () {
  'use strict';

  var ERROR = 'input is invalid type';
  var WINDOW = typeof window === 'object';
  var root = WINDOW ? window : {};
  if (root.JS_SHA256_NO_WINDOW) {
    WINDOW = false;
  }
  var WEB_WORKER = !WINDOW && typeof self === 'object';
  var NODE_JS = !root.JS_SHA256_NO_NODE_JS && typeof process === 'object' && process.versions && process.versions.node;
  if (NODE_JS) {
    root = global;
  } else if (WEB_WORKER) {
    root = self;
  }
  var COMMON_JS = !root.JS_SHA256_NO_COMMON_JS && typeof module === 'object' && module.exports;
  var AMD = typeof define === 'function' && define.amd;
  var ARRAY_BUFFER = !root.JS_SHA256_NO_ARRAY_BUFFER && typeof ArrayBuffer !== 'undefined';
  var HEX_CHARS = '0123456789abcdef'.split('');
  var EXTRA = [-2147483648, 8388608, 32768, 128];
  var SHIFT = [24, 16, 8, 0];
  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  var OUTPUT_TYPES = ['hex', 'array', 'digest', 'arrayBuffer'];

  var blocks = [];

  if (root.JS_SHA256_NO_NODE_JS || !Array.isArray) {
    Array.isArray = function (obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    };
  }

  if (ARRAY_BUFFER && (root.JS_SHA256_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
    ArrayBuffer.isView = function (obj) {
      return typeof obj === 'object' && obj.buffer && obj.buffer.constructor === ArrayBuffer;
    };
  }

  var createOutputMethod = function (outputType, is224) {
    return function (message) {
      return new Sha256(is224, true).update(message)[outputType]();
    };
  };

  var createMethod = function (is224) {
    var method = createOutputMethod('hex', is224);
    if (NODE_JS) {
      method = nodeWrap(method, is224);
    }
    method.create = function () {
      return new Sha256(is224);
    };
    method.update = function (message) {
      return method.create().update(message);
    };
    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
      var type = OUTPUT_TYPES[i];
      method[type] = createOutputMethod(type, is224);
    }
    return method;
  };

  var nodeWrap = function (method, is224) {
    var crypto = eval("require('crypto')");
    var Buffer = eval("require('buffer').Buffer");
    var algorithm = is224 ? 'sha224' : 'sha256';
    var nodeMethod = function (message) {
      if (typeof message === 'string') {
        return crypto.createHash(algorithm).update(message, 'utf8').digest('hex');
      } else {
        if (message === null || message === undefined) {
          throw new Error(ERROR);
        } else if (message.constructor === ArrayBuffer) {
          message = new Uint8Array(message);
        }
      }
      if (Array.isArray(message) || ArrayBuffer.isView(message) ||
        message.constructor === Buffer) {
        return crypto.createHash(algorithm).update(new Buffer(message)).digest('hex');
      } else {
        return method(message);
      }
    };
    return nodeMethod;
  };

  var createHmacOutputMethod = function (outputType, is224) {
    return function (key, message) {
      return new HmacSha256(key, is224, true).update(message)[outputType]();
    };
  };

  var createHmacMethod = function (is224) {
    var method = createHmacOutputMethod('hex', is224);
    method.create = function (key) {
      return new HmacSha256(key, is224);
    };
    method.update = function (key, message) {
      return method.create(key).update(message);
    };
    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
      var type = OUTPUT_TYPES[i];
      method[type] = createHmacOutputMethod(type, is224);
    }
    return method;
  };

  function Sha256(is224, sharedMemory) {
    if (sharedMemory) {
      blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] =
        blocks[4] = blocks[5] = blocks[6] = blocks[7] =
        blocks[8] = blocks[9] = blocks[10] = blocks[11] =
        blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
      this.blocks = blocks;
    } else {
      this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    if (is224) {
      this.h0 = 0xc1059ed8;
      this.h1 = 0x367cd507;
      this.h2 = 0x3070dd17;
      this.h3 = 0xf70e5939;
      this.h4 = 0xffc00b31;
      this.h5 = 0x68581511;
      this.h6 = 0x64f98fa7;
      this.h7 = 0xbefa4fa4;
    } else { // 256
      this.h0 = 0x6a09e667;
      this.h1 = 0xbb67ae85;
      this.h2 = 0x3c6ef372;
      this.h3 = 0xa54ff53a;
      this.h4 = 0x510e527f;
      this.h5 = 0x9b05688c;
      this.h6 = 0x1f83d9ab;
      this.h7 = 0x5be0cd19;
    }

    this.block = this.start = this.bytes = this.hBytes = 0;
    this.finalized = this.hashed = false;
    this.first = true;
    this.is224 = is224;
  }

  Sha256.prototype.update = function (message) {
    if (this.finalized) {
      return;
    }
    var notString, type = typeof message;
    if (type !== 'string') {
      if (type === 'object') {
        if (message === null) {
          throw new Error(ERROR);
        } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
          message = new Uint8Array(message);
        } else if (!Array.isArray(message)) {
          if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
            throw new Error(ERROR);
          }
        }
      } else {
        throw new Error(ERROR);
      }
      notString = true;
    }
    var code, index = 0, i, length = message.length, blocks = this.blocks;

    while (index < length) {
      if (this.hashed) {
        this.hashed = false;
        blocks[0] = this.block;
        blocks[16] = blocks[1] = blocks[2] = blocks[3] =
          blocks[4] = blocks[5] = blocks[6] = blocks[7] =
          blocks[8] = blocks[9] = blocks[10] = blocks[11] =
          blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
      }

      if (notString) {
        for (i = this.start; index < length && i < 64; ++index) {
          blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
        }
      } else {
        for (i = this.start; index < length && i < 64; ++index) {
          code = message.charCodeAt(index);
          if (code < 0x80) {
            blocks[i >> 2] |= code << SHIFT[i++ & 3];
          } else if (code < 0x800) {
            blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else if (code < 0xd800 || code >= 0xe000) {
            blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else {
            code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
            blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          }
        }
      }

      this.lastByteIndex = i;
      this.bytes += i - this.start;
      if (i >= 64) {
        this.block = blocks[16];
        this.start = i - 64;
        this.hash();
        this.hashed = true;
      } else {
        this.start = i;
      }
    }
    if (this.bytes > 4294967295) {
      this.hBytes += this.bytes / 4294967296 << 0;
      this.bytes = this.bytes % 4294967296;
    }
    return this;
  };

  Sha256.prototype.finalize = function () {
    if (this.finalized) {
      return;
    }
    this.finalized = true;
    var blocks = this.blocks, i = this.lastByteIndex;
    blocks[16] = this.block;
    blocks[i >> 2] |= EXTRA[i & 3];
    this.block = blocks[16];
    if (i >= 56) {
      if (!this.hashed) {
        this.hash();
      }
      blocks[0] = this.block;
      blocks[16] = blocks[1] = blocks[2] = blocks[3] =
        blocks[4] = blocks[5] = blocks[6] = blocks[7] =
        blocks[8] = blocks[9] = blocks[10] = blocks[11] =
        blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
    }
    blocks[14] = this.hBytes << 3 | this.bytes >>> 29;
    blocks[15] = this.bytes << 3;
    this.hash();
  };

  Sha256.prototype.hash = function () {
    var a = this.h0, b = this.h1, c = this.h2, d = this.h3, e = this.h4, f = this.h5, g = this.h6,
      h = this.h7, blocks = this.blocks, j, s0, s1, maj, t1, t2, ch, ab, da, cd, bc;

    for (j = 16; j < 64; ++j) {
      // rightrotate
      t1 = blocks[j - 15];
      s0 = ((t1 >>> 7) | (t1 << 25)) ^ ((t1 >>> 18) | (t1 << 14)) ^ (t1 >>> 3);
      t1 = blocks[j - 2];
      s1 = ((t1 >>> 17) | (t1 << 15)) ^ ((t1 >>> 19) | (t1 << 13)) ^ (t1 >>> 10);
      blocks[j] = blocks[j - 16] + s0 + blocks[j - 7] + s1 << 0;
    }

    bc = b & c;
    for (j = 0; j < 64; j += 4) {
      if (this.first) {
        if (this.is224) {
          ab = 300032;
          t1 = blocks[0] - 1413257819;
          h = t1 - 150054599 << 0;
          d = t1 + 24177077 << 0;
        } else {
          ab = 704751109;
          t1 = blocks[0] - 210244248;
          h = t1 - 1521486534 << 0;
          d = t1 + 143694565 << 0;
        }
        this.first = false;
      } else {
        s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        ab = a & b;
        maj = ab ^ (a & c) ^ bc;
        ch = (e & f) ^ (~e & g);
        t1 = h + s1 + ch + K[j] + blocks[j];
        t2 = s0 + maj;
        h = d + t1 << 0;
        d = t1 + t2 << 0;
      }
      s0 = ((d >>> 2) | (d << 30)) ^ ((d >>> 13) | (d << 19)) ^ ((d >>> 22) | (d << 10));
      s1 = ((h >>> 6) | (h << 26)) ^ ((h >>> 11) | (h << 21)) ^ ((h >>> 25) | (h << 7));
      da = d & a;
      maj = da ^ (d & b) ^ ab;
      ch = (h & e) ^ (~h & f);
      t1 = g + s1 + ch + K[j + 1] + blocks[j + 1];
      t2 = s0 + maj;
      g = c + t1 << 0;
      c = t1 + t2 << 0;
      s0 = ((c >>> 2) | (c << 30)) ^ ((c >>> 13) | (c << 19)) ^ ((c >>> 22) | (c << 10));
      s1 = ((g >>> 6) | (g << 26)) ^ ((g >>> 11) | (g << 21)) ^ ((g >>> 25) | (g << 7));
      cd = c & d;
      maj = cd ^ (c & a) ^ da;
      ch = (g & h) ^ (~g & e);
      t1 = f + s1 + ch + K[j + 2] + blocks[j + 2];
      t2 = s0 + maj;
      f = b + t1 << 0;
      b = t1 + t2 << 0;
      s0 = ((b >>> 2) | (b << 30)) ^ ((b >>> 13) | (b << 19)) ^ ((b >>> 22) | (b << 10));
      s1 = ((f >>> 6) | (f << 26)) ^ ((f >>> 11) | (f << 21)) ^ ((f >>> 25) | (f << 7));
      bc = b & c;
      maj = bc ^ (b & d) ^ cd;
      ch = (f & g) ^ (~f & h);
      t1 = e + s1 + ch + K[j + 3] + blocks[j + 3];
      t2 = s0 + maj;
      e = a + t1 << 0;
      a = t1 + t2 << 0;
    }

    this.h0 = this.h0 + a << 0;
    this.h1 = this.h1 + b << 0;
    this.h2 = this.h2 + c << 0;
    this.h3 = this.h3 + d << 0;
    this.h4 = this.h4 + e << 0;
    this.h5 = this.h5 + f << 0;
    this.h6 = this.h6 + g << 0;
    this.h7 = this.h7 + h << 0;
  };

  Sha256.prototype.hex = function () {
    this.finalize();

    var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5,
      h6 = this.h6, h7 = this.h7;

    var hex = HEX_CHARS[(h0 >> 28) & 0x0F] + HEX_CHARS[(h0 >> 24) & 0x0F] +
      HEX_CHARS[(h0 >> 20) & 0x0F] + HEX_CHARS[(h0 >> 16) & 0x0F] +
      HEX_CHARS[(h0 >> 12) & 0x0F] + HEX_CHARS[(h0 >> 8) & 0x0F] +
      HEX_CHARS[(h0 >> 4) & 0x0F] + HEX_CHARS[h0 & 0x0F] +
      HEX_CHARS[(h1 >> 28) & 0x0F] + HEX_CHARS[(h1 >> 24) & 0x0F] +
      HEX_CHARS[(h1 >> 20) & 0x0F] + HEX_CHARS[(h1 >> 16) & 0x0F] +
      HEX_CHARS[(h1 >> 12) & 0x0F] + HEX_CHARS[(h1 >> 8) & 0x0F] +
      HEX_CHARS[(h1 >> 4) & 0x0F] + HEX_CHARS[h1 & 0x0F] +
      HEX_CHARS[(h2 >> 28) & 0x0F] + HEX_CHARS[(h2 >> 24) & 0x0F] +
      HEX_CHARS[(h2 >> 20) & 0x0F] + HEX_CHARS[(h2 >> 16) & 0x0F] +
      HEX_CHARS[(h2 >> 12) & 0x0F] + HEX_CHARS[(h2 >> 8) & 0x0F] +
      HEX_CHARS[(h2 >> 4) & 0x0F] + HEX_CHARS[h2 & 0x0F] +
      HEX_CHARS[(h3 >> 28) & 0x0F] + HEX_CHARS[(h3 >> 24) & 0x0F] +
      HEX_CHARS[(h3 >> 20) & 0x0F] + HEX_CHARS[(h3 >> 16) & 0x0F] +
      HEX_CHARS[(h3 >> 12) & 0x0F] + HEX_CHARS[(h3 >> 8) & 0x0F] +
      HEX_CHARS[(h3 >> 4) & 0x0F] + HEX_CHARS[h3 & 0x0F] +
      HEX_CHARS[(h4 >> 28) & 0x0F] + HEX_CHARS[(h4 >> 24) & 0x0F] +
      HEX_CHARS[(h4 >> 20) & 0x0F] + HEX_CHARS[(h4 >> 16) & 0x0F] +
      HEX_CHARS[(h4 >> 12) & 0x0F] + HEX_CHARS[(h4 >> 8) & 0x0F] +
      HEX_CHARS[(h4 >> 4) & 0x0F] + HEX_CHARS[h4 & 0x0F] +
      HEX_CHARS[(h5 >> 28) & 0x0F] + HEX_CHARS[(h5 >> 24) & 0x0F] +
      HEX_CHARS[(h5 >> 20) & 0x0F] + HEX_CHARS[(h5 >> 16) & 0x0F] +
      HEX_CHARS[(h5 >> 12) & 0x0F] + HEX_CHARS[(h5 >> 8) & 0x0F] +
      HEX_CHARS[(h5 >> 4) & 0x0F] + HEX_CHARS[h5 & 0x0F] +
      HEX_CHARS[(h6 >> 28) & 0x0F] + HEX_CHARS[(h6 >> 24) & 0x0F] +
      HEX_CHARS[(h6 >> 20) & 0x0F] + HEX_CHARS[(h6 >> 16) & 0x0F] +
      HEX_CHARS[(h6 >> 12) & 0x0F] + HEX_CHARS[(h6 >> 8) & 0x0F] +
      HEX_CHARS[(h6 >> 4) & 0x0F] + HEX_CHARS[h6 & 0x0F];
    if (!this.is224) {
      hex += HEX_CHARS[(h7 >> 28) & 0x0F] + HEX_CHARS[(h7 >> 24) & 0x0F] +
        HEX_CHARS[(h7 >> 20) & 0x0F] + HEX_CHARS[(h7 >> 16) & 0x0F] +
        HEX_CHARS[(h7 >> 12) & 0x0F] + HEX_CHARS[(h7 >> 8) & 0x0F] +
        HEX_CHARS[(h7 >> 4) & 0x0F] + HEX_CHARS[h7 & 0x0F];
    }
    return hex;
  };

  Sha256.prototype.toString = Sha256.prototype.hex;

  Sha256.prototype.digest = function () {
    this.finalize();

    var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5,
      h6 = this.h6, h7 = this.h7;

    var arr = [
      (h0 >> 24) & 0xFF, (h0 >> 16) & 0xFF, (h0 >> 8) & 0xFF, h0 & 0xFF,
      (h1 >> 24) & 0xFF, (h1 >> 16) & 0xFF, (h1 >> 8) & 0xFF, h1 & 0xFF,
      (h2 >> 24) & 0xFF, (h2 >> 16) & 0xFF, (h2 >> 8) & 0xFF, h2 & 0xFF,
      (h3 >> 24) & 0xFF, (h3 >> 16) & 0xFF, (h3 >> 8) & 0xFF, h3 & 0xFF,
      (h4 >> 24) & 0xFF, (h4 >> 16) & 0xFF, (h4 >> 8) & 0xFF, h4 & 0xFF,
      (h5 >> 24) & 0xFF, (h5 >> 16) & 0xFF, (h5 >> 8) & 0xFF, h5 & 0xFF,
      (h6 >> 24) & 0xFF, (h6 >> 16) & 0xFF, (h6 >> 8) & 0xFF, h6 & 0xFF
    ];
    if (!this.is224) {
      arr.push((h7 >> 24) & 0xFF, (h7 >> 16) & 0xFF, (h7 >> 8) & 0xFF, h7 & 0xFF);
    }
    return arr;
  };

  Sha256.prototype.array = Sha256.prototype.digest;

  Sha256.prototype.arrayBuffer = function () {
    this.finalize();

    var buffer = new ArrayBuffer(this.is224 ? 28 : 32);
    var dataView = new DataView(buffer);
    dataView.setUint32(0, this.h0);
    dataView.setUint32(4, this.h1);
    dataView.setUint32(8, this.h2);
    dataView.setUint32(12, this.h3);
    dataView.setUint32(16, this.h4);
    dataView.setUint32(20, this.h5);
    dataView.setUint32(24, this.h6);
    if (!this.is224) {
      dataView.setUint32(28, this.h7);
    }
    return buffer;
  };

  function HmacSha256(key, is224, sharedMemory) {
    var i, type = typeof key;
    if (type === 'string') {
      var bytes = [], length = key.length, index = 0, code;
      for (i = 0; i < length; ++i) {
        code = key.charCodeAt(i);
        if (code < 0x80) {
          bytes[index++] = code;
        } else if (code < 0x800) {
          bytes[index++] = (0xc0 | (code >> 6));
          bytes[index++] = (0x80 | (code & 0x3f));
        } else if (code < 0xd800 || code >= 0xe000) {
          bytes[index++] = (0xe0 | (code >> 12));
          bytes[index++] = (0x80 | ((code >> 6) & 0x3f));
          bytes[index++] = (0x80 | (code & 0x3f));
        } else {
          code = 0x10000 + (((code & 0x3ff) << 10) | (key.charCodeAt(++i) & 0x3ff));
          bytes[index++] = (0xf0 | (code >> 18));
          bytes[index++] = (0x80 | ((code >> 12) & 0x3f));
          bytes[index++] = (0x80 | ((code >> 6) & 0x3f));
          bytes[index++] = (0x80 | (code & 0x3f));
        }
      }
      key = bytes;
    } else {
      if (type === 'object') {
        if (key === null) {
          throw new Error(ERROR);
        } else if (ARRAY_BUFFER && key.constructor === ArrayBuffer) {
          key = new Uint8Array(key);
        } else if (!Array.isArray(key)) {
          if (!ARRAY_BUFFER || !ArrayBuffer.isView(key)) {
            throw new Error(ERROR);
          }
        }
      } else {
        throw new Error(ERROR);
      }
    }

    if (key.length > 64) {
      key = (new Sha256(is224, true)).update(key).array();
    }

    var oKeyPad = [], iKeyPad = [];
    for (i = 0; i < 64; ++i) {
      var b = key[i] || 0;
      oKeyPad[i] = 0x5c ^ b;
      iKeyPad[i] = 0x36 ^ b;
    }

    Sha256.call(this, is224, sharedMemory);

    this.update(iKeyPad);
    this.oKeyPad = oKeyPad;
    this.inner = true;
    this.sharedMemory = sharedMemory;
  }
  HmacSha256.prototype = new Sha256();

  HmacSha256.prototype.finalize = function () {
    Sha256.prototype.finalize.call(this);
    if (this.inner) {
      this.inner = false;
      var innerHash = this.array();
      Sha256.call(this, this.is224, this.sharedMemory);
      this.update(this.oKeyPad);
      this.update(innerHash);
      Sha256.prototype.finalize.call(this);
    }
  };

  var exports = createMethod();
  exports.sha256 = exports;
  exports.sha224 = createMethod(true);
  exports.sha256.hmac = createHmacMethod();
  exports.sha224.hmac = createHmacMethod(true);

  if (COMMON_JS) {
    module.exports = exports;
  } else {
    root.sha256 = exports.sha256;
    root.sha224 = exports.sha224;
    if (AMD) {
      define(function () {
        return exports;
      });
    }
  }
})();

}).call(this,require('_process'),typeof window !== "undefined" && window.document && window.document.implementation ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {})
;

},{"_process":1273}],449:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":450,"component-each":1283,"global-queue":1307,"segmentio-facade":1390}],450:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":451,"./statics":452,"@ndhoule/defaults":30,"component-bind":1277,"debug":453,"dup":7,"extend":455,"slug-component":1398}],451:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],452:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],453:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":454,"_process":1273,"dup":11}],454:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],455:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],456:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@segment/analytics.js-integration":457,"is":1321,"obj-case":1365,"reject":1382,"segmentio-facade":1390,"to-no-case":464}],457:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":458,"./statics":459,"@ndhoule/defaults":30,"component-bind":1277,"debug":461,"dup":7,"extend":463,"slug-component":1398}],458:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":460}],459:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],460:[function(require,module,exports){

;

/**
 * Expose `toNoCase`.
 */

module.exports = toNoCase;


/**
 * Test whether a string is camel-case.
 */

var hasSpace = /\s/;
var hasSeparator = /[\W_]/;


/**
 * Remove any starting case from a `string`, like camel or snake, but keep
 * spaces and punctuation that may be important otherwise.
 *
 * @param {String} string
 * @return {String}
 */

function toNoCase (string) {
  if (hasSpace.test(string)) return string.toLowerCase();
  if (hasSeparator.test(string)) return (unseparate(string) || string).toLowerCase();
  return uncamelize(string).toLowerCase();
}


/**
 * Separator splitter.
 */

var separatorSplitter = /[\W_]+(.|$)/g;


/**
 * Un-separate a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function unseparate (string) {
  return string.replace(separatorSplitter, function (m, next) {
    return next ? ' ' + next : '';
  });
}


/**
 * Camelcase splitter.
 */

var camelSplitter = /(.)([A-Z]+)/g;


/**
 * Un-camelcase a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function uncamelize (string) {
  return string.replace(camelSplitter, function (m, previous, uppers) {
    return previous + ' ' + uppers.toLowerCase().split('').join(' ');
  });
}
;

},{}],461:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":462,"_process":1273,"dup":11}],462:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],463:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],464:[function(require,module,exports){

;

/**
 * Export.
 */

module.exports = toNoCase

/**
 * Test whether a string is camel-case.
 */

var hasSpace = /\s/
var hasSeparator = /(_|-|\.|:)/
var hasCamel = /([a-z][A-Z]|[A-Z][a-z])/

/**
 * Remove any starting case from a `string`, like camel or snake, but keep
 * spaces and punctuation that may be important otherwise.
 *
 * @param {String} string
 * @return {String}
 */

function toNoCase(string) {
  if (hasSpace.test(string)) return string.toLowerCase()
  if (hasSeparator.test(string)) return (unseparate(string) || string).toLowerCase()
  if (hasCamel.test(string)) return uncamelize(string).toLowerCase()
  return string.toLowerCase()
}

/**
 * Separator splitter.
 */

var separatorSplitter = /[\W_]+(.|$)/g

/**
 * Un-separate a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function unseparate(string) {
  return string.replace(separatorSplitter, function (m, next) {
    return next ? ' ' + next : ''
  })
}

/**
 * Camelcase splitter.
 */

var camelSplitter = /(.)([A-Z]+)/g

/**
 * Un-camelcase a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function uncamelize(string) {
  return string.replace(camelSplitter, function (m, previous, uppers) {
    return previous + ' ' + uppers.toLowerCase().split('').join(' ')
  })
}

;

},{}],465:[function(require,module,exports){


'use strict';

/**
 * Module dependencies.
 */

var camel = require('camelcase');
var foldl = require('@ndhoule/foldl');
var integration = require('@segment/analytics.js-integration');

/**
 * Expose `FullStory` integration.
 *
 * https://www.fullstory.com/docs/developer
 */

var FullStory = (module.exports = integration('FullStory')
  .option('org', '')
  .option('debug', false)
  .option('trackAllPages', false)
  .option('trackNamedPages', false)
  .option('trackCategorizedPages', false)
  .tag(
    '<script async src="https://edge.fullstory.com/s/fs.js" crossorigin="anonymous"></script>'
  ));

/**
 * The ApiSource string.
 *
 * @type {string}
 */
var apiSource = 'segment';

/**
 * Initialize.
 */
FullStory.prototype.initialize = function() {
  window._fs_debug = this.options.debug;
  window._fs_host = 'fullstory.com';
  window._fs_org = this.options.org;
  window._fs_namespace = 'FS';

  /* eslint-disable */
  /* istanbul ignore next */
  /* The snippet below differs slightly from the snippet available on fullstory.com because fs.js is already loaded above*/
  (function(m,n,e,t,l,o,g,y){
    if (e in m) {if(m.console && m.console.log) { m.console.log('FullStory namespace conflict. Please set window["_fs_namespace"].');} return;}
    g=m[e]=function(a,b,s){g.q?g.q.push([a,b,s]):g._api(a,b,s);};g.q=[];
    g.identify=function(i,v,s){g(l,{uid:i},s);if(v)g(l,v,s)};g.setUserVars=function(v,s){g(l,v,s)};g.event=function(i,v,s){g('event',{n:i,p:v},s)};
    g.shutdown=function(){g("rec",!1)};g.restart=function(){g("rec",!0)};
    g.log = function(a,b) { g("log", [a,b]) };
    g.consent=function(a){g("consent",!arguments.length||a)};
    g.identifyAccount=function(i,v){o='account';v=v||{};v.acctId=i;g(o,v)};
    g.clearUserCookie=function(){};
    g._w={};y='XMLHttpRequest';g._w[y]=m[y];y='fetch';g._w[y]=m[y];
    if(m[y])m[y]=function(){return g._w[y].apply(this,arguments)};
  })(window,document,window['_fs_namespace'],'script','user');
  /* eslint-enable */

  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */
FullStory.prototype.loaded = function() {
  return !!window.FS;
};

/**
 * Identify.  But, use FS.setUserVars if we only have an anonymous id, keeping the
 * user id unbound until we (hopefully) get a login page or similar and another call
 * to identify with more useful contents.  (This because FullStory doesn't like the
 * user id changing once set.)
 *
 * @param {Identify} identify
 */
FullStory.prototype.identify = function(identify) {
  var traits = identify.traits({ name: 'displayName' });

  var newTraits = foldl(
    function(results, value, key) {
      var rs = results;
      if (key !== 'id') {
        rs[
          key === 'displayName' || key === 'email' ? key : camelCaseField(key)
        ] = value;
      }
      return rs;
    },
    {},
    traits
  );
  if (identify.userId()) {
    window.FS.identify(String(identify.userId()), newTraits, apiSource);
  } else {
    newTraits.segmentAnonymousId_str = String(identify.anonymousId());
    window.FS.setUserVars(newTraits, apiSource);
  }
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

FullStory.prototype.page = function(page) {
  var category = page.category();
  var name = page.fullName();
  var opts = this.options;

  if (name && opts.trackNamedPages) {
    // named pages
    this.track(page.track(name));
  } else if (category && opts.trackCategorizedPages) {
    // categorized pages
    this.track(page.track(category));
  } else if (opts.trackAllPages) {
    // all pages
    this.track(page.track());
  }
};

/**
 * Track. Passes the events directly to FullStory via FS.event API.
 *
 * @param {Track} track
 */
FullStory.prototype.track = function(track) {
  window.FS.event(track.event(), track.properties(), apiSource);
};

/**
 * Camel cases `.`, `-`, `_`, and white space within fieldNames. Leaves type suffix alone.
 *
 * NOTE: Does not fix otherwise malformed fieldNames.
 * FullStory will scrub characters from keys that do not conform to /^[a-zA-Z][a-zA-Z0-9_]*$/.
 *
 * @param {string} fieldName
 */
function camelCaseField(fieldName) {
  // Do not camel case across type suffixes.
  var parts = fieldName.split('_');
  if (parts.length > 1) {
    var typeSuffix = parts.pop();
    switch (typeSuffix) {
      case 'str':
      case 'int':
      case 'date':
      case 'real':
      case 'bool':
      case 'strs':
      case 'ints':
      case 'dates':
      case 'reals':
      case 'bools':
        return camel(parts.join('_')) + '_' + typeSuffix;
      default: // passthrough
    }
  }

  // No type suffix found. Camel case the whole field name.
  return camel(fieldName);
}



},{"@ndhoule/foldl":36,"@segment/analytics.js-integration":466,"camelcase":470}],466:[function(require,module,exports){

;
arguments[4][14][0].apply(exports,arguments)
;

},{"./protos":467,"./statics":468,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":471,"dup":14,"slug-component":1398}],467:[function(require,module,exports){

;
arguments[4][15][0].apply(exports,arguments)
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":469,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],468:[function(require,module,exports){

;
arguments[4][16][0].apply(exports,arguments)
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],469:[function(require,module,exports){

;
arguments[4][17][0].apply(exports,arguments)
;

},{"dup":17}],470:[function(require,module,exports){

;
'use strict';

function preserveCamelCase(str) {
	var isLastCharLower = false;

	for (var i = 0; i < str.length; i++) {
		var c = str.charAt(i);

		if (isLastCharLower && (/[a-zA-Z]/).test(c) && c.toUpperCase() === c) {
			str = str.substr(0, i) + '-' + str.substr(i);
			isLastCharLower = false;
			i++;
		} else {
			isLastCharLower = (c.toLowerCase() === c);
		}
	}

	return str;
}

module.exports = function () {
	var str = [].map.call(arguments, function (str) {
		return str.trim();
	}).filter(function (str) {
		return str.length;
	}).join('-');

	if (!str.length) {
		return '';
	}

	if (str.length === 1) {
		return str.toLowerCase();
	}

	if (!(/[_.\- ]+/).test(str)) {
		if (str === str.toUpperCase()) {
			return str.toLowerCase();
		}

		if (str[0] !== str[0].toLowerCase()) {
			return str[0].toLowerCase() + str.slice(1);
		}

		return str;
	}

	str = preserveCamelCase(str);

	return str
	.replace(/^[_.\- ]+/, '')
	.toLowerCase()
	.replace(/[_.\- ]+(\w|$)/g, function (m, p1) {
		return p1.toUpperCase();
	});
};

;

},{}],471:[function(require,module,exports){

;
arguments[4][11][0].apply(exports,arguments)
;

},{"./debug":472,"_process":1273,"dup":11}],472:[function(require,module,exports){

;
arguments[4][12][0].apply(exports,arguments)
;

},{"dup":12,"ms":1355}],473:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":474,"global-queue":1307}],474:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":475,"./statics":476,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":478,"dup":14,"slug-component":1398}],475:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":477,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],476:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],477:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],478:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":479,"_process":1273,"dup":11}],479:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],480:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":481,"on-body-ready":1372}],481:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":482,"./statics":483,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":485,"dup":14,"slug-component":1398}],482:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":484,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],483:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],484:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],485:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":486,"_process":1273,"dup":11}],486:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],487:[function(require,module,exports){


'use strict';

/**
 * Module dependencies.
 */

var integration = require('@segment/analytics.js-integration');
var each = require('@ndhoule/each');
var find = require('obj-case');
var reject = require('reject');
var extend = require('extend');

/**
 * Expose `GoogleAdWordsNew` integration.
 */

var GoogleAdWordsNew = (module.exports = integration('Google AdWords New')
  .option('accountId', '')
  .option('sendPageView', true)
  .option('conversionLinker', true)
  .option('clickConversions', [])
  .option('pageLoadConversions', [])
  .option('defaultPageConversion', '')
  .option('disableAdPersonalization', false)
  // The ID in this line (i.e. the gtag.js ID) does not determine which account(s) will receive data from the tag; rather, it is used to uniquely identify your global site tag. Which account(s) receive data from the tag is determined by calling the config command (and by using the send_to parameter on an event). For instance, if you use Google Analytics, you may already have the gtag.js global site tag installed on your site. In that case, the gtag.js ID may be that of the Google Analytics property where you first obtained the snippet.
  .tag(
    '<script src="https://www.googletagmanager.com/gtag/js?id={{ accountId }}">'
  ));

/**
 * Initialize.
 *
 * https://support.google.com/adwords/answer/6095821?hl=en&ref_topic=3165803
 * @api public
 */

GoogleAdWordsNew.prototype.initialize = function() {
  var self = this;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };

  var config = {};
  if (this.options.sendPageView === false)
    config.send_page_view = this.options.sendPageView;
  if (this.options.conversionLinker === false)
    config.conversion_linker = this.options.conversionLinker; // not recommended to set this by GA docs — less accurate measurements

  this.load(function() {
    window.gtag('js', new Date());

    // ad personalization must be disabled before any 'config' statements
    // https://support.google.com/analytics/answer/9050852?hl=en
    if (self.options.disableAdPersonalization)
      window.gtag('set', 'allow_ad_personalization_signals', false);

    window.gtag('config', self.options.accountId, config);
    self.ready();
  });
};

/**
 * Loaded?
 *
 * @api public
 * @return {boolean}
 */

GoogleAdWordsNew.prototype.loaded = function() {
  return window.dataLayer.push !== Array.prototype.push;
};

/**
 * Page
 *
 * https://support.google.com/adwords/answer/6095821?hl=en&ref_topic=3165803
 * @api public
 */

GoogleAdWordsNew.prototype.page = function(page) {
  var self = this;
  // If there is no pageName, we support firing default Page Load conversion if provided in options
  var configs = this.options;
  var pageName = page.name();
  // If you are naming your `.page()` calls, you should explicitly map each one rather than expecting a fallback to default page conversion
  if (!pageName && configs.defaultPageConversion)
    return sendPageLoadConversion(configs.defaultPageConversion);

  // A mapped event can either be a 'Page Load' or a 'Click' conversion in AdWords.
  // Since the Page Load conversions are meant to just be dropped on a given page, we are mapping named page calls rather than `.track()`
  var mappedConversions = matchConversion(
    this.options.pageLoadConversions,
    pageName
  );

  each(function(mappedConversion) {
    sendPageLoadConversion(mappedConversion.id, mappedConversion.override);
  }, mappedConversions);

  function sendPageLoadConversion(id, override) {
    var semanticMetadata = reject({
      send_to: (override || configs.accountId) + '/' + id,
      // the below are not spec'd props of page API, AdWords accepts can accept them for this type of conversions
      value: page.options(self.name).value,
      currency: page.options(self.name).currency,
      transaction_id: find(page.options(self.name), 'order_id')
    });
    var metadata = extend(page.properties(), semanticMetadata);
    // metadata shouldn't contain PII — warning by Google
    return window.gtag('event', pageName || 'conversion', metadata);
  }
};

/**
 * Track
 *
 * https://support.google.com/adwords/answer/6331314?hl=en&ref_topic=3165803&co=ADWORDS.IsAWNCustomer%3Dtrue&oco=0
 * https://developers.google.com/adwords-remarketing-tag/
 * NOTE: If customers want to send conversions to multiple accounts, they should:
 * "Alternatively, you should consider using cross-account conversion tracking which allows you to have a manager account (MCC) own
 * the conversion actions and share them with one or more of its sub-accounts. In doing so, you only need to specify a single conversion
 * identifier in the event snippet. Learn more about cross- account conversion tracking."
 *
 * But assuming pushback, we will allow overriding the default AdWords account ID per `.track()` if needed via UI settings
 * NOTE: Conversion tracking and remarketing functionalities are now combined into a single tag so no need for feature flag for remarketing
 *
 * @api public
 */

GoogleAdWordsNew.prototype.track = function(track) {
  var self = this;
  // A mapped event can either be a 'Page Load' or a 'Click' conversion in AdWords.
  // Depending on what you chose inside Adwords when creating the conversions, we should expect `properties.value` if that is what they want to send
  // But for purchase events, we should map revenue/total
  var eventName = track.event();
  var mappedConversions = matchConversion(
    this.options.clickConversions,
    track.event()
  );

  each(function(mappedConversion) {
    var properties = track.properties({ orderId: 'transaction_id' });
    var metadata = extend(properties, {
      send_to:
        (mappedConversion.override || self.options.accountId) +
        '/' +
        mappedConversion.id
    });
    // metadata shouldn't contain PII — warning by Google
    return window.gtag('event', eventName, metadata);
  }, mappedConversions);
};

/**
 * Order Completed
 *
 * https://support.google.com/adwords/answer/6331314?hl=en&ref_topic=3165803&co=ADWORDS.IsAWNCustomer%3Dtrue&oco=0
 * @api public
 */

GoogleAdWordsNew.prototype.orderCompleted = function(track) {
  var self = this;
  // A mapped event can either be a 'Page Load' or a 'Click' conversion in AdWords.
  // Depending on what you chose inside Adwords when creating the conversions, we should expect `properties.value` if that is what they want to send
  // But for purchase events, we should map revenue/total
  var eventName = track.event();
  var mappedConversions = matchConversion(
    this.options.clickConversions,
    track.event()
  );

  each(function(mappedConversion) {
    var properties = track.properties({
      orderId: 'transaction_id',
      order_id: 'transaction_id',
      revenue: 'value'
    });
    var metadata = extend(properties, {
      send_to:
        (mappedConversion.override || self.options.accountId) +
        '/' +
        mappedConversion.id
    });
    // metadata shouldn't contain PII — warning by Google
    return window.gtag('event', eventName, metadata);
  }, mappedConversions);
};

/**
 * Match Mapped AdWords conversions to your `.page()` or `.track()` calls
 *
 * @param {Array} mappedConversions
 * @param {String} segmentEvent
 */

function matchConversion(mappedConversions, segmentEvent) {
  var ret = [];
  each(function(setting) {
    var conversion = setting.value || setting;

    // to prevent common casing mistakes in our UI
    if (
      typeof segmentEvent === 'string' &&
      segmentEvent.toLowerCase() === conversion.event.toLowerCase()
    ) {
      var con = { id: conversion.id };
      if (conversion.accountId) con.override = conversion.accountId;

      ret.push(con);
    }
  }, mappedConversions);

  return ret;
}



},{"@ndhoule/each":32,"@segment/analytics.js-integration":488,"extend":1304,"obj-case":1365,"reject":1382}],488:[function(require,module,exports){

;
arguments[4][7][0].apply(exports,arguments)
;

},{"./protos":489,"./statics":490,"@ndhoule/defaults":30,"component-bind":1277,"debug":492,"dup":7,"extend":491,"slug-component":1398}],489:[function(require,module,exports){

;
arguments[4][8][0].apply(exports,arguments)
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],490:[function(require,module,exports){

;
arguments[4][9][0].apply(exports,arguments)
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],491:[function(require,module,exports){

;
arguments[4][10][0].apply(exports,arguments)
;

},{"dup":10}],492:[function(require,module,exports){

;
arguments[4][11][0].apply(exports,arguments)
;

},{"./debug":493,"_process":1273,"dup":11}],493:[function(require,module,exports){

;
arguments[4][12][0].apply(exports,arguments)
;

},{"dup":12,"ms":1355}],494:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/defaults":30,"@segment/analytics.js-integration":495,"component-each":1283,"extend":1304,"global-queue":1307,"is":1321,"obj-case":1365,"object-component":1366,"reject":1382,"segmentio-facade":1390,"use-https":1419}],495:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":496,"./statics":497,"@ndhoule/defaults":30,"component-bind":1277,"debug":499,"dup":7,"extend":498,"slug-component":1398}],496:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],497:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],498:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],499:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":500,"_process":1273,"dup":11}],500:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],501:[function(require,module,exports){


'use strict';

/**
 * Module dependencies.
 */

var integration = require('@segment/analytics.js-integration');
var push = require('global-queue')('dataLayer', { wrap: false });

/**
 * Expose `GTM`.
 */

var GTM = module.exports = integration('Google Tag Manager')
  .global('dataLayer')
  .global('google_tag_manager')
  .option('containerId', '')
  .option('environment', '')
  .option('trackNamedPages', true)
  .option('trackCategorizedPages', true)
  .tag('no-env', '<script src="//www.googletagmanager.com/gtm.js?id={{ containerId }}&l=dataLayer">')
  .tag('with-env', '<script src="//www.googletagmanager.com/gtm.js?id={{ containerId }}&l=dataLayer&gtm_preview={{ environment }}">');

/**
 * Initialize.
 *
 * https://developers.google.com/tag-manager
 *
 * @api public
 */

GTM.prototype.initialize = function() {
  push({ 'gtm.start': Number(new Date()), event: 'gtm.js' });

  if (this.options.environment.length) {
    this.load('with-env', this.options, this.ready);
  } else {
    this.load('no-env', this.options, this.ready);
  }
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

GTM.prototype.loaded = function() {
  return !!(window.dataLayer && Array.prototype.push !== window.dataLayer.push);
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

GTM.prototype.page = function(page) {
  var category = page.category();
  var name = page.fullName();
  var opts = this.options;

  // all
  if (opts.trackAllPages) {
    this.track(page.track());
  }

  // categorized
  if (category && opts.trackCategorizedPages) {
    this.track(page.track(category));
  }

  // named
  if (name && opts.trackNamedPages) {
    this.track(page.track(name));
  }
};

/**
 * Track.
 *
 * https://developers.google.com/tag-manager/devguide#events
 *
 * @api public
 * @param {Track} track
 */

GTM.prototype.track = function(track) {
  var props = track.properties();
  var userId = this.analytics.user().id();
  var anonymousId = this.analytics.user().anonymousId();
  if (userId) props.userId = userId;
  if (anonymousId) props.segmentAnonymousId = anonymousId;
  props.event = track.event();

  push(props);
};



},{"@segment/analytics.js-integration":502,"global-queue":1307}],502:[function(require,module,exports){

;
arguments[4][7][0].apply(exports,arguments)
;

},{"./protos":503,"./statics":504,"@ndhoule/defaults":30,"component-bind":1277,"debug":505,"dup":7,"extend":507,"slug-component":1398}],503:[function(require,module,exports){

;
arguments[4][8][0].apply(exports,arguments)
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],504:[function(require,module,exports){

;
arguments[4][9][0].apply(exports,arguments)
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],505:[function(require,module,exports){

;
arguments[4][11][0].apply(exports,arguments)
;

},{"./debug":506,"_process":1273,"dup":11}],506:[function(require,module,exports){

;
arguments[4][12][0].apply(exports,arguments)
;

},{"dup":12,"ms":1355}],507:[function(require,module,exports){

;
arguments[4][10][0].apply(exports,arguments)
;

},{"dup":10}],508:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":509,"component-each":1283,"omit":1371,"pick":1377,"segmentio-facade":1390}],509:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":510,"./statics":511,"@ndhoule/defaults":30,"component-bind":1277,"debug":512,"dup":7,"extend":514,"slug-component":1398}],510:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],511:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],512:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":513,"_process":1273,"dup":11}],513:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],514:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],515:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/defaults":30,"@segment/analytics.js-integration":516,"extend":521,"reject":1382,"segmentio-facade":1390}],516:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":517,"./statics":518,"@ndhoule/defaults":30,"component-bind":1277,"debug":519,"dup":7,"extend":521,"slug-component":1398}],517:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],518:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],519:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":520,"_process":1273,"dup":11}],520:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],521:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],522:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/extend":35,"@segment/analytics.js-integration":523,"@segment/to-iso-string":1219,"component-each":1283,"is":1321}],523:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":524,"./statics":525,"@ndhoule/defaults":30,"component-bind":1277,"debug":526,"dup":7,"extend":528,"slug-component":1398}],524:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],525:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],526:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":527,"_process":1273,"dup":11}],527:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],528:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],529:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":530}],530:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":531,"./statics":532,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":534,"dup":14,"slug-component":1398}],531:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":533,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],532:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],533:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],534:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":535,"_process":1273,"dup":11}],535:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],536:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@segment/analytics.js-integration":537,"is":1321}],537:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":538,"./statics":539,"@ndhoule/defaults":30,"component-bind":1277,"debug":540,"dup":7,"extend":542,"slug-component":1398}],538:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],539:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],540:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":541,"_process":1273,"dup":11}],541:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],542:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],543:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":544}],544:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":545,"./statics":546,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":548,"dup":14,"slug-component":1398}],545:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":547,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],546:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],547:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],548:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":549,"_process":1273,"dup":11}],549:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],550:[function(require,module,exports){


'use strict';

var integration = require('@segment/analytics.js-integration');
var is = require('is');

/**
 * Expose `HotJar` integration
 */

var Hotjar = (module.exports = integration('Hotjar')
  .option('hjid', null)
  .option('hjPlaceholderPolyfill', true));

/**
 * Initialize HotJar
 */

Hotjar.prototype.initialize = function() {
  // Make sure our metadata inputs are valid, putting out a console error and aborting if not.
  function areOptionsValid(options) {
    var validators = {
      isHjidValid:
        is.number(options.hjid) && !is.nan(options.hjid) && options.hjid !== 0, // Make sure that HJID is a number (and isn't NaN)
      isPlaceholderPolyfillValid: is.bool(options.hjPlaceholderPolyfill) // Make sure we received a boolean.
    };

    for (var validator in validators) {
      if (!validators[validator]) {
        console.warn(
          'Hotjar Integration - ' + validator + ' returned false, not loading.'
        );
        return false;
      }
    }

    return true;
  }

  // Convert from string to number.
  this.options.hjid = Number(this.options.hjid);
  if (!areOptionsValid(this.options)) return;

  window._hjSelf = this;

  // Load HotJar snippet - for some reason, trying to load in .tag() was unsuccessful - directly loading script here.

  /* eslint-disable no-param-reassign */
  (function(h, o, t, j, a, r) {
    h.hj =
      h.hj ||
      function() {
        (h.hj.q = h.hj.q || []).push(arguments);
      };
    h._hjSettings = {
      hjid: h._hjSelf.options.hjid,
      hjsv: 6,
      hjPlaceholderPolyfill: h._hjSelf.options.hjPlaceholderPolyfill
    };
    a = o.getElementsByTagName('head')[0];
    r = o.createElement('script');
    r.async = 1;
    r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
    a.appendChild(r);
  })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
  /* eslint-enable no-param-reassign */

  this.ready();
};

Hotjar.prototype.identify = function(identify) {
  if (!identify.userId()) {
    return this.debug('user id is required');
  }

  var traits = identify.traits();
  delete traits.id;

  window.hj('identify', identify.userId(), traits);
};



},{"@segment/analytics.js-integration":551,"is":1321}],551:[function(require,module,exports){

;
arguments[4][7][0].apply(exports,arguments)
;

},{"./protos":552,"./statics":553,"@ndhoule/defaults":30,"component-bind":1277,"debug":554,"dup":7,"extend":556,"slug-component":1398}],552:[function(require,module,exports){

;
arguments[4][8][0].apply(exports,arguments)
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],553:[function(require,module,exports){

;
arguments[4][9][0].apply(exports,arguments)
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],554:[function(require,module,exports){

;
arguments[4][11][0].apply(exports,arguments)
;

},{"./debug":555,"_process":1273,"dup":11}],555:[function(require,module,exports){

;
arguments[4][12][0].apply(exports,arguments)
;

},{"dup":12,"ms":1355}],556:[function(require,module,exports){

;
arguments[4][10][0].apply(exports,arguments)
;

},{"dup":10}],557:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@segment/analytics.js-integration":558,"@segment/convert-dates":1194,"global-queue":1307,"segmentio-facade":1390}],558:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":559,"./statics":560,"@ndhoule/defaults":30,"component-bind":1277,"debug":561,"dup":7,"extend":563,"slug-component":1398}],559:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],560:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],561:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":562,"_process":1273,"dup":11}],562:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],563:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],564:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":565}],565:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":566,"./statics":567,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":569,"dup":14,"slug-component":1398}],566:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":568,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],567:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],568:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],569:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":570,"_process":1273,"dup":11}],570:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],571:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":572,"global-queue":1307}],572:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":573,"./statics":574,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":576,"dup":14,"slug-component":1398}],573:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":575,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],574:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],575:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],576:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":577,"_process":1273,"dup":11}],577:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],578:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/each":32,"@ndhoule/extend":35,"@ndhoule/pick":40,"@segment/analytics.js-integration":579,"@segment/convert-dates":1194,"is":1321,"obj-case":1365}],579:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":580,"./statics":581,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":583,"dup":14,"slug-component":1398}],580:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":582,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],581:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],582:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],583:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":584,"_process":1273,"dup":11}],584:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],585:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/clone":29,"@segment/analytics.js-integration":586}],586:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":587,"./statics":588,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":590,"dup":14,"slug-component":1398}],587:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":589,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],588:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],589:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],590:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":591,"_process":1273,"dup":11}],591:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],592:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@ndhoule/extend":35,"@ndhoule/keys":38,"@segment/analytics.js-integration":593,"@segment/trample":1222,"obj-case":1365,"reject":1382}],593:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":594,"./statics":595,"@ndhoule/defaults":30,"component-bind":1277,"debug":596,"dup":7,"extend":598,"slug-component":1398}],594:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],595:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],596:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":597,"_process":1273,"dup":11}],597:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],598:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],599:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/includes":37,"@segment/analytics.js-integration":600,"is":1321}],600:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":601,"./statics":602,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":604,"dup":14,"slug-component":1398}],601:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":603,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],602:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],603:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],604:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":605,"_process":1273,"dup":11}],605:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],606:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/extend":35,"@segment/analytics.js-integration":607,"component-each":1283,"global-queue":1307,"is":1321,"obj-case":1365}],607:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":608,"./statics":609,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":611,"dup":14,"slug-component":1398}],608:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":610,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],609:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],610:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],611:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":612,"_process":1273,"dup":11}],612:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],613:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/extend":35,"@ndhoule/foldl":36,"@segment/analytics.js-integration":614,"global-queue":1307,"next-tick":1360,"obj-case":1365,"segmentio-facade":1390}],614:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":615,"./statics":616,"@ndhoule/defaults":30,"component-bind":1277,"debug":617,"dup":7,"extend":619,"slug-component":1398}],615:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],616:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],617:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":618,"_process":1273,"dup":11}],618:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],619:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],620:[function(require,module,exports){


'use strict'

/**
 * Module dependencies.
 */

var integration = require('@segment/analytics.js-integration')

/**
 * Expose `aginkedIn Insight Tag` integration.
 */

var Linkedin = module.exports = integration('LinkedIn Insight Tag')
  .option('partnerId', '')
  .tag('<script src="https://snap.licdn.com/li.lms-analytics/insight.min.js"></script>')

Linkedin.prototype.initialize = function () {
  // We require a Partner ID to run this integration.
  if (!this.options.partnerId) return

  window._linkedin_data_partner_id = this.options.partnerId

  this.load(this.ready)
}

Linkedin.prototype.loaded = function () {
  return !!(window._linkedin_data_partner_id && typeof window._bizo_callback === 'function')
}



},{"@segment/analytics.js-integration":621}],621:[function(require,module,exports){

;
arguments[4][14][0].apply(exports,arguments)
;

},{"./protos":622,"./statics":623,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":625,"dup":14,"slug-component":1398}],622:[function(require,module,exports){

;
arguments[4][15][0].apply(exports,arguments)
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":624,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],623:[function(require,module,exports){

;
arguments[4][16][0].apply(exports,arguments)
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],624:[function(require,module,exports){

;
arguments[4][17][0].apply(exports,arguments)
;

},{"dup":17}],625:[function(require,module,exports){

;
arguments[4][11][0].apply(exports,arguments)
;

},{"./debug":626,"_process":1273,"dup":11}],626:[function(require,module,exports){

;
arguments[4][12][0].apply(exports,arguments)
;

},{"dup":12,"ms":1355}],627:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":628,"component-clone":1278,"component-each":1283,"do-when":1301,"next-tick":1360,"segmentio-facade":1390}],628:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":629,"./statics":630,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":632,"dup":14,"slug-component":1398}],629:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":631,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],630:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],631:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],632:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":633,"_process":1273,"dup":11}],633:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],634:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":635,"component-each":1283}],635:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":636,"./statics":637,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":639,"dup":14,"slug-component":1398}],636:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":638,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],637:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],638:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],639:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":640,"_process":1273,"dup":11}],640:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],641:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":642,"segmentio-facade":1390,"use-https":1419}],642:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":643,"./statics":644,"@ndhoule/defaults":30,"component-bind":1277,"debug":645,"dup":7,"extend":647,"slug-component":1398}],643:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],644:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],645:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":646,"_process":1273,"dup":11}],646:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],647:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],648:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/alias":71,"@segment/analytics.js-integration":649}],649:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":650,"./statics":651,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":653,"dup":14,"slug-component":1398}],650:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":652,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],651:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],652:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],653:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":654,"_process":1273,"dup":11}],654:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],655:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":656}],656:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":657,"./statics":658,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":660,"dup":14,"slug-component":1398}],657:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":659,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],658:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],659:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],660:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":661,"_process":1273,"dup":11}],661:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],662:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@segment/analytics.js-integration":663,"@segment/fmt":1198,"component-url":1292,"do-when":1301,"is":1321,"jsonp":1327}],663:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":664,"./statics":665,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":667,"dup":14,"slug-component":1398}],664:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":666,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],665:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],666:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],667:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":668,"_process":1273,"dup":11}],668:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],669:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":670,"@segment/fmt":1198,"component-url":1292,"do-when":1301,"is":1321,"jsonp":1327}],670:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":671,"./statics":672,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":674,"dup":14,"slug-component":1398}],671:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":673,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],672:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],673:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],674:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":675,"_process":1273,"dup":11}],675:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],676:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/foldl":36,"@segment/analytics.js-integration":677,"component-each":1283,"component-querystring":1289,"to-no-case":1408}],677:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":678,"./statics":679,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":681,"dup":14,"slug-component":1398}],678:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":680,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],679:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],680:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],681:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":682,"_process":1273,"dup":11}],682:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],683:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/includes":37,"@ndhoule/pick":40,"@segment/alias":71,"@segment/analytics.js-integration":684,"@segment/convert-dates":1194,"@segment/to-iso-string":1219,"component-indexof":1287,"is":1321,"obj-case":1365}],684:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":685,"./statics":686,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":688,"dup":14,"slug-component":1398}],685:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":687,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],686:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],687:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],688:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":689,"_process":1273,"dup":11}],689:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],690:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@segment/analytics.js-integration":691,"do-when":1301,"obj-case":1365,"reject":1382}],691:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":692,"./statics":693,"@ndhoule/defaults":30,"component-bind":1277,"debug":694,"dup":7,"extend":696,"slug-component":1398}],692:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],693:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],694:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":695,"_process":1273,"dup":11}],695:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],696:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],697:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":698,"component-bind":1277,"do-when":1301,"is":1321}],698:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":699,"./statics":700,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":702,"dup":14,"slug-component":1398}],699:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":701,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],700:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],701:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],702:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":703,"_process":1273,"dup":11}],703:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],704:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":705,"component-each":1283,"global-queue":1307,"segmentio-facade":1390}],705:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":706,"./statics":707,"@ndhoule/defaults":30,"component-bind":1277,"debug":708,"dup":7,"extend":710,"slug-component":1398}],706:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],707:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],708:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":709,"_process":1273,"dup":11}],709:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],710:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],711:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":712,"component-each":1283,"global-queue":1307}],712:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":713,"./statics":714,"@ndhoule/defaults":30,"component-bind":1277,"debug":715,"dup":7,"extend":717,"slug-component":1398}],713:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],714:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],715:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":716,"_process":1273,"dup":11}],716:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],717:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],718:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":719,"component-each":1283,"is":1321,"use-https":1419}],719:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":720,"./statics":721,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":723,"dup":14,"slug-component":1398}],720:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":722,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],721:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],722:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],723:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":724,"_process":1273,"dup":11}],724:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],725:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":726,"component-querystring":1289,"js-sha256":1325,"segmentio-facade":1390,"to-no-case":733}],726:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":727,"./statics":728,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":731,"dup":14,"slug-component":1398}],727:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":730,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":729}],728:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],729:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":460}],730:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],731:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":732,"_process":1273,"dup":11}],732:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],733:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":464}],734:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":735,"global-queue":1307}],735:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":736,"./statics":737,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":739,"dup":14,"slug-component":1398}],736:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":738,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],737:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],738:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],739:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":740,"_process":1273,"dup":11}],740:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],741:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":742,"dateformat":1298,"obj-case":1365,"reject":1382}],742:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":743,"./statics":744,"@ndhoule/defaults":30,"component-bind":1277,"debug":745,"dup":7,"extend":747,"slug-component":1398}],743:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],744:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],745:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":746,"_process":1273,"dup":11}],746:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],747:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],748:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":749}],749:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":750,"./statics":751,"@ndhoule/defaults":30,"component-bind":1277,"debug":752,"dup":7,"extend":754,"slug-component":1398}],750:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],751:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],752:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":753,"_process":1273,"dup":11}],753:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],754:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],755:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/alias":71,"@segment/analytics.js-integration":756}],756:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":757,"./statics":758,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":760,"dup":14,"slug-component":1398}],757:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":759,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],758:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],759:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],760:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":761,"_process":1273,"dup":11}],761:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],762:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":763,"next-tick":1360,"use-https":1419}],763:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":764,"./statics":765,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":767,"dup":14,"slug-component":1398}],764:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":766,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],765:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],766:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],767:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":768,"_process":1273,"dup":11}],768:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],769:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@ndhoule/map":39,"@segment/analytics.js-integration":770,"@segment/to-iso-string":1219,"obj-case":1365,"type-of":1415}],770:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":771,"./statics":772,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":774,"dup":14,"slug-component":1398}],771:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":773,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],772:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],773:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],774:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":775,"_process":1273,"dup":11}],775:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],776:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":777}],777:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":778,"./statics":779,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":781,"dup":14,"slug-component":1398}],778:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":780,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],779:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],780:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],781:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":782,"_process":1273,"dup":11}],782:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],783:[function(require,module,exports){


'use strict';

/**
 * Module dependencies.
 */

var keys = require('@ndhoule/keys');
var values = require('@ndhoule/values');
var foldl = require('@ndhoule/foldl');
var each = require('@ndhoule/each');
var integration = require('@segment/analytics.js-integration');
var push = require('global-queue')('optimizely', { wrap: false });
var tick = require('next-tick');

/**
 * Expose `Optimizely` integration.
 */

var Optimizely = (module.exports = integration('Optimizely')
  .option('trackCategorizedPages', true)
  .option('trackNamedPages', true)
  .option('variations', false) // send data via `.identify()`
  .option('listen', true) // send data via `.track()`
  .option('nonInteraction', false)
  .option('sendRevenueOnlyForOrderCompleted', true)
  .option('customExperimentProperties', {})
  .option('customCampaignProperties', {}));

/**
 * The name and version for this integration.
 */

var optimizelyContext = {
  name: 'optimizely',
  version: '2.0.0'
};

/**
 * Initialize.
 *
 * https://www.optimizely.com/docs/api#function-calls
 * https://jsfiddle.net/ushmw723/ <- includes optimizely snippets for capturing campaign and experiment data
 *
 * @api public
 */

Optimizely.prototype.initialize = function() {
  var self = this;
  // Flag source of integration (requested by Optimizely)
  push({
    type: 'integration',
    OAuthClientId: '5360906403'
  });
  // Initialize listeners for both Classic and New Optimizely
  // crazying binding because that's just how javascript works
  // We're caling this on the next tick to be safe so we don't hold up
  // initializing the integration even though the function below is designed to be async,
  // just want to be extra safe
  tick(function() {
    Optimizely.initOptimizelyIntegration({
      referrerOverride: self.setEffectiveReferrer.bind(self),
      sendExperimentData: self.sendClassicDataToSegment.bind(self),
      sendCampaignData: self.sendNewDataToSegment.bind(self)
    });
  });

  this.ready();
};

/**
 * Track. The Optimizely X Web event API accepts a single payload object.
 *        It works with Classic Optimizely as well.
 *
 * Optimizely X:  https://developers.optimizely.com/x/solutions/javascript/reference/index.html#function_setevent
 *
 * The new-style X API is forward compatible from Optimizely Classic to Optimizely X.
 *   - Classic will correctly consume the tags object to identify the revenue
 *   - In bundled mode, it will be forwarded along to the X API with the entire payload
 *
 * If the Optimizely X Fullstack JavaScript SDK is being used we should pass along
 * the event to it. Any properties in the track object will be passed along as event tags.
 * If the userId is not passed into the options object of the track call, we'll
 * attempt to use the userId of the track event, which is set using the analytics.identify call.
 *
 * https://developers.optimizely.com/x/solutions/sdks/reference/?language=javascript#tracking
 *
 * @api public
 * @param {Track} track
 */

Optimizely.prototype.track = function(track) {
  var opts = this.options;
  var eventProperties = track.properties();

  // Optimizely expects revenue only passed through Order Completed events
  if (eventProperties.revenue && opts.sendRevenueOnlyForOrderCompleted) {
    if (track.event() === 'Order Completed') {
      eventProperties.revenue = Math.round(eventProperties.revenue * 100);
    } else if (track.event() !== 'Order Completed') {
      delete eventProperties.revenue;
    }
    // This is legacy Segment-Optimizely behavior,
    // which passes revenue whenever it is present
  } else if (
    opts.sendRevenueOnlyForOrderCompleted === false &&
    eventProperties.revenue
  ) {
    eventProperties.revenue = Math.round(eventProperties.revenue * 100);
  }

  // Use the new-style API (which is compatible with Classic and X)
  var eventName = track.event().replace(/:/g, '_'); // can't have colons so replacing with underscores
  var payload = {
    type: 'event',
    eventName: eventName,
    tags: eventProperties
  };

  push(payload);

  var optimizelyClientInstance = window.optimizelyClientInstance;
  if (optimizelyClientInstance && optimizelyClientInstance.track) {
    var optimizelyOptions = track.options('Optimizely');
    var userId =
      optimizelyOptions.userId || track.userId() || this.analytics.user().id();
    var attributes =
      optimizelyOptions.attributes ||
      track.traits() ||
      this.analytics.user().traits();
    if (userId) {
      optimizelyClientInstance.track(
        eventName,
        userId,
        attributes,
        payload.tags
      );
    }
  }
};

/**
 * Page.
 *
 * https://www.optimizely.com/docs/api#track-event
 *
 * @api public
 * @param {Page} page
 */

Optimizely.prototype.page = function(page) {
  var category = page.category();
  var name = page.fullName();
  var opts = this.options;

  // categorized pages
  if (category && opts.trackCategorizedPages) {
    this.track(page.track(category));
  }

  // named pages
  if (name && opts.trackNamedPages) {
    this.track(page.track(name));
  }
};

/**
 * sendClassicDataToSegment (Optimizely Classic)
 *
 * This function is executed for each experiment created in Classic Optimizely that is running on the page.
 * This function will also be executed for any experiments activated at a later stage since initOptimizelyIntegration
 * attached listeners on the page
 *
 * @api private
 * @param {Object} experimentState: contains all information regarding experiments
 * @param {Object} experimentState.experiment: the experiment running on the page
 * @param {String} experimentState.experiment.name: name of the experiment
 * @param {String} experimentState.experiment.id: ID of the experiment
 * @param {String} experimentState.experiment.referrer: available if effective referrer if experiment is a redirect
 * @param {Array} experimentState.variations: the variations the current user on page is seeing
 * @param {String} experimentState.variations[].name: the name of the variation
 * @param {String} experimentState.variations[].id: the ID of the variation
 * @param {Object} experimentState.sections: the sections for the experiment (only defined for multivariate experiments) keyed by sectionId
 * @param {String} experimentState.sections[sectionId].name: the name of section
 * @param {Array} experimentState.sections[sectionId].variation_ids: the IDs of the variations in the section
 *
 */

Optimizely.prototype.sendClassicDataToSegment = function(experimentState) {
  var experiment = experimentState.experiment;
  var variations = experimentState.variations;
  var sections = experimentState.sections;
  var context = { integration: optimizelyContext }; // backward compatibility

  // Reformatting this data structure into hash map so concatenating variation ids and names is easier later
  var variationsMap = foldl(
    function(results, variation) {
      var res = results;
      res[variation.id] = variation.name;
      return res;
    },
    {},
    variations
  );

  // Sorting for consistency across browsers
  var variationIds = keys(variationsMap).sort();
  var variationNames = values(variationsMap).sort();

  // Send data via `.track()`
  if (this.options.listen) {
    var props = {
      experimentId: experiment.id,
      experimentName: experiment.name,
      variationId: variationIds.join(), // eg. '123' or '123,455'
      variationName: variationNames.join(', ') // eg. 'Variation X' or 'Variation 1, Variation 2'
    };

    // If this was a redirect experiment and the effective referrer is different from document.referrer,
    // this value is made available. So if a customer came in via google.com/ad -> tb12.com -> redirect experiment -> Belichickgoat.com
    // `experiment.referrer` would be google.com/ad here NOT `tb12.com`.
    if (experiment.referrer) {
      props.referrer = experiment.referrer;
      context.page = { referrer: experiment.referrer };
    }

    // When there is a multivariate experiment
    if (sections) {
      // Since `sections` include all the possible sections on the page, we need to find the names of the sections
      // if any of its variations were used. Experiments could display variations from multiple sections.
      // The global optimizely data object does not expose a mapping between which section(s) were involved within an experiment.
      // So we will build our own mapping to quickly get the section name(s) and id(s) for any displayed variation.
      var activeSections = {};
      var variationIdsToSectionsMap = foldl(
        function(results, section, sectionId) {
          var res = results;
          each(function(variationId) {
            res[variationId] = { id: sectionId, name: section.name };
          }, section.variation_ids);
          return res;
        },
        {},
        sections
      );
      for (var j = 0; j < variationIds.length; j++) {
        var activeVariation = variationIds[j];
        var activeSection = variationIdsToSectionsMap[activeVariation];
        if (activeSection)
          activeSections[activeSection.id] = activeSection.name;
      }

      // Sorting for consistency across browsers
      props.sectionId = keys(activeSections)
        .sort()
        .join(); // Not adding space for backward compat/consistency reasons since all IDs we've never had spaces
      props.sectionName = values(activeSections)
        .sort()
        .join(', ');
    }

    // For Google's nonInteraction flag
    if (this.options.nonInteraction) props.nonInteraction = 1;

    // If customExperimentProperties is provided overide the props with it.
    // If valid customExperimentProperties present it will override existing props.
    var customExperimentProperties = this.options.customExperimentProperties;
    var customPropsKeys = Object.keys(customExperimentProperties);
    var data = window.optimizely && window.optimizely.data;

    if (data && customPropsKeys.length) {
      for (var index = 0; index < customPropsKeys.length; index++) {
        var segmentProp = customPropsKeys[index];
        var optimizelyProp = customExperimentProperties[segmentProp];
        if (typeof data[optimizelyProp] !== 'undefined') {
          props[segmentProp] = data[optimizelyProp];
        }
      }
    }

    // Send to Segment
    this.analytics.track('Experiment Viewed', props, context);
  }

  // Send data via `.identify()` (not recommended!)
  // TODO: deprecate this feature
  if (this.options.variations) {
    // Note: The only "breaking" behavior is that now there will be an `.identify()` call per active experiment
    // Legacy behavior was that we would look up all active experiments on the page after init and send one `.identify()` call
    // with all experiment/variation data as traits.
    // New behavior will call `.identify()` per active experiment with isolated experiment/variation data for that single experiment
    // However, since traits are cached, subsequent experiments that trigger `.identify()` calls will likely contain previous experiment data
    var traits = {};
    traits['Experiment: ' + experiment.name] = variationNames.join(', '); // eg. 'Variation X' or 'Variation 1, Variation 2'

    // Send to Segment
    this.analytics.identify(traits);
  }
};

/**
 * sendNewDataToSegment (Optimizely X)
 *
 * This function is called for each experiment created in New Optimizely that are running on the page.
 * New Optimizely added a dimension called "Campaigns" that encapsulate over the Experiments. So a campaign can have multiple experiments.
 * Multivariate experiments are no longer supported in New Optimizely.
 * This function will also be executed for any experiments activated at a later stage since initOptimizelyIntegration
 * attached listeners on the page
 *
 * @api private
 * @param {Object} campaignState: contains all information regarding experiments and campaign
 * @param {String} campaignState.id: the ID of the campaign
 * @param {String} campaignState.campaignName: the name of the campaign
 * @param {Array} campaignState.audiences: "Audiences" the visitor is considered part of related to this campaign
 * @param {String} campaignState.audiences[].id: the id of the Audience
 * @param {String} campaignState.audiences[].name: the name of the Audience
 * @param {Object} campaignState.experiment: the experiment the visitor is seeing
 * @param {String} campaignState.experiment.id: the id of the experiment
 * @param {String} campaignState.experiment.name: the name of the experiment
 * @param {String} campaignState.experiment.referrer: the effective referrer of the experiment (only defined for redirect)
 * @param {Object} campaignState.variation: the variation the visitor is seeing
 * @param {String} campaignState.variation.id: the id of the variation
 * @param {String} campaignState.variation.name: the name of the variation
 * @param {String} campaignState.isInCampaignHoldback: whether the visitor is in the Campaign holdback
 */

Optimizely.prototype.sendNewDataToSegment = function(campaignState) {
  var experiment = campaignState.experiment;
  var variation = campaignState.variation;
  var context = { integration: optimizelyContext }; // backward compatibility

  // Reformatting this data structure into hash map so concatenating variation ids and names is easier later
  var audiencesMap = foldl(
    function(results, audience) {
      var res = results;
      res[audience.id] = audience.name;
      return res;
    },
    {},
    campaignState.audiences
  );

  // Sorting for consistency across browsers
  var audienceIds = keys(audiencesMap)
    .sort()
    .join(); // Not adding space for backward compat/consistency reasons since all IDs we've never had spaces
  var audienceNames = values(audiencesMap)
    .sort()
    .join(', ');

  // Send data via `.track()`
  if (this.options.listen) {
    var props = {
      campaignName: campaignState.campaignName,
      campaignId: campaignState.id,
      experimentId: experiment.id,
      experimentName: experiment.name,
      variationName: variation.name,
      variationId: variation.id,
      audienceId: audienceIds, // eg. '7527562222,7527111138'
      audienceName: audienceNames, // eg. 'Peaky Blinders, Trust Tree'
      isInCampaignHoldback: campaignState.isInCampaignHoldback
    };

    // If this was a redirect experiment and the effective referrer is different from document.referrer,
    // this value is made available. So if a customer came in via google.com/ad -> tb12.com -> redirect experiment -> Belichickgoat.com
    // `experiment.referrer` would be google.com/ad here NOT `tb12.com`.
    if (experiment.referrer) {
      props.referrer = experiment.referrer;
      context.page = { referrer: experiment.referrer };
    }

    // For Google's nonInteraction flag
    if (this.options.nonInteraction) props.nonInteraction = 1;

    // If customCampaignProperties is provided overide the props with it.
    // If valid customCampaignProperties present it will override existing props.
    var customCampaignProperties = this.options.customCampaignProperties;
    var customPropsKeys = Object.keys(customCampaignProperties);
    var data = window.optimizely && window.optimizely.newMockData;
    if (data && customPropsKeys.length) {
      for (var index = 0; index < customPropsKeys.length; index++) {
        var segmentProp = customPropsKeys[index];
        var optimizelyProp = customCampaignProperties[segmentProp];
        if (typeof data[optimizelyProp] !== 'undefined') {
          props[segmentProp] = data[optimizelyProp];
        }
      }
    }

    // Send to Segment
    this.analytics.track('Experiment Viewed', props, context);
  }

  // Send data via `.identify()` (not recommended!)
  // TODO: deprecate this feature
  if (this.options.variations) {
    // Legacy: We never sent any experiment Id or variation Id
    // Note: The only "breaking" behavior is that now there will be an `.identify()` per active experiment
    // Legacy behavior was that we would look up all active experiments on the page after init and send one `.identify()` call
    // with all experiment/variation data as traits.
    // New behavior will call `.identify()` per active experiment with isolated experiment/variation data for that single experiment
    var traits = {};
    traits['Experiment: ' + experiment.name] = variation.name;

    // Send to Segment
    this.analytics.identify(traits);
  }
};

/**
 * setEffectiveReferrer
 *
 * This function is called when a redirect experiment changed the effective referrer value where it is different from the `document.referrer`.
 * This is a documented caveat for any mutual customers that are using redirect experiments.
 * We will set this global variable that Segment customers can lookup and pass down in their initial `.page()` call inside
 * their Segment snippet.
 *
 * @apr private
 * @param {string} referrer
 */

Optimizely.prototype.setEffectiveReferrer = function(referrer) {
  if (referrer) {
    window.optimizelyEffectiveReferrer = referrer;
    return referrer;
  }
};

/**
 * initOptimizelyIntegration(handlers)
 *
 * This function was provided by Optimizely's Engineering team. The function below once initialized can detect which version of
 * Optimizely a customer is using and call the appropriate callback functions when an experiment runs on the page.
 * Instead of Segment looking up the experiment data, we can now just bind Segment APIs to their experiment listener/handlers!
 *
 * @api private
 * @param {Object} handlers
 * @param {Function} referrerOverride: called if the effective refferer value differs from the current `document.referrer` due to a
 * invocation of a redirect experiment on the page
 * @param {Function} sendExperimentData: called for every running experiment on the page (Classic)
 * @param {Function} sendCampaignData: called for every running campaign on the page (New)
 */

Optimizely.initOptimizelyIntegration = function(handlers) {
  /**
   * `initClassicOptimizelyIntegration` fetches all the experiment data from the classic Optimizely client
   * and calls the functions provided in the arguments with the data that needs to
   * be used for sending information. It is recommended to leave this function as is
   * and to create your own implementation of the functions referrerOverride and
   * sendExperimentData.
   *
   * @param {Function} referrerOverride - This function is called if the effective referrer value differs from
   *   the current document.referrer value. The only argument provided is the effective referrer value.
   * @param {Function} sendExperimentData - This function is called for every running experiment on the page.
   *   The function is called with all the relevant ids and names.
   */
  var initClassicOptimizelyIntegration = function(
    referrerOverride,
    sendExperimentData
  ) {
    var data = window.optimizely && window.optimizely.data;
    var state = data && data.state;
    if (state) {
      var activeExperiments = state.activeExperiments;
      if (state.redirectExperiment) {
        var redirectExperimentId = state.redirectExperiment.experimentId;
        var index = -1;
        for (var i = 0; i < state.activeExperiments.length; i++) {
          if (state.activeExperiments[i] === redirectExperimentId) {
            index = i;
            break;
          }
        }
        if (index === -1) {
          activeExperiments.push(redirectExperimentId);
        }
        referrerOverride(state.redirectExperiment.referrer);
      }

      for (var k = 0; k < activeExperiments.length; k++) {
        var currentExperimentId = activeExperiments[k];
        var activeExperimentState = {
          experiment: {
            id: currentExperimentId,
            name: data.experiments[currentExperimentId].name
          },
          variations: [],
          /** Segment added code */
          // we need to send sectionName for multivariate experiments
          sections: data.sections
          /**/
        };

        /** Segment added code */
        // for backward compatability since we send referrer with the experiment properties
        if (
          state.redirectExperiment &&
          currentExperimentId === state.redirectExperiment.experimentId &&
          state.redirectExperiment.referrer
        ) {
          activeExperimentState.experiment.referrer =
            state.redirectExperiment.referrer;
        }
        /**/

        var variationIds =
          state.variationIdsMap[activeExperimentState.experiment.id];
        for (var j = 0; j < variationIds.length; j++) {
          var id = variationIds[j];
          var name = data.variations[id].name;
          activeExperimentState.variations.push({
            id: id,
            name: name
          });
        }
        sendExperimentData(activeExperimentState);
      }
    }
  };

  /**
   * This function fetches all the campaign data from the new Optimizely client
   * and calls the functions provided in the arguments with the data that needs to
   * be used for sending information. It is recommended to leave this function as is
   * and to create your own implementation of the functions referrerOverride and
   * sendCampaignData.
   *
   * @param {Function} referrerOverride - This function is called if the effective referrer value differs from
   *   the current document.referrer value. The only argument provided is the effective referrer value.
   * @param {Function} sendCampaignData - This function is called for every running campaign on the page.
   *   The function is called with the campaignState for the activated campaign
   */
  var initNewOptimizelyIntegration = function(
    referrerOverride,
    sendCampaignData
  ) {
    var newActiveCampaign = function(id, referrer) {
      var state = window.optimizely.get && window.optimizely.get('state');
      if (state) {
        var activeCampaigns = state.getCampaignStates({
          isActive: true
        });
        var campaignState = activeCampaigns[id];
        // Segment added code: in case this is a redirect experiment
        if (referrer) campaignState.experiment.referrer = referrer;
        sendCampaignData(campaignState);
      }
    };

    var checkReferrer = function() {
      var state = window.optimizely.get && window.optimizely.get('state');
      if (state) {
        var referrer =
          state.getRedirectInfo() && state.getRedirectInfo().referrer;

        if (referrer) {
          referrerOverride(referrer);
          return referrer; // Segment added code: so I can pass this referrer value in cb
        }
      }
    };

    /**
     * At any moment, a new campaign can be activated (manual or conditional activation).
     * This function registers a listener that listens to newly activated campaigns and
     * handles them.
     */
    var registerFutureActiveCampaigns = function() {
      window.optimizely = window.optimizely || [];
      window.optimizely.push({
        type: 'addListener',
        filter: {
          type: 'lifecycle',
          name: 'campaignDecided'
        },
        handler: function(event) {
          var id = event.data.campaign.id;
          newActiveCampaign(id);
        }
      });
    };

    /**
     * If this code is running after Optimizely on the page, there might already be
     * some campaigns active. This function makes sure all those campaigns are
     * handled.
     */
    var registerCurrentlyActiveCampaigns = function() {
      window.optimizely = window.optimizely || [];
      var state = window.optimizely.get && window.optimizely.get('state');
      if (state) {
        var referrer = checkReferrer();
        var activeCampaigns = state.getCampaignStates({
          isActive: true
        });
        for (var id in activeCampaigns) {
          if ({}.hasOwnProperty.call(activeCampaigns, id)) {
            // Segment modified code: need to pass down referrer in the cb for backward compat reasons
            if (referrer) {
              newActiveCampaign(id, referrer);
            } else {
              newActiveCampaign(id);
            }
          }
        }
      } else {
        window.optimizely.push({
          type: 'addListener',
          filter: {
            type: 'lifecycle',
            name: 'initialized'
          },
          handler: function() {
            checkReferrer();
          }
        });
      }
    };
    registerCurrentlyActiveCampaigns();
    registerFutureActiveCampaigns();
  };

  initClassicOptimizelyIntegration(
    handlers.referrerOverride,
    handlers.sendExperimentData
  );
  initNewOptimizelyIntegration(
    handlers.referrerOverride,
    handlers.sendCampaignData
  );
};



},{"@ndhoule/each":32,"@ndhoule/foldl":36,"@ndhoule/keys":38,"@ndhoule/values":42,"@segment/analytics.js-integration":784,"global-queue":1307,"next-tick":791}],784:[function(require,module,exports){

;
arguments[4][7][0].apply(exports,arguments)
;

},{"./protos":785,"./statics":786,"@ndhoule/defaults":30,"component-bind":1277,"debug":788,"dup":7,"extend":790,"slug-component":1398}],785:[function(require,module,exports){

;
arguments[4][8][0].apply(exports,arguments)
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":787,"to-no-case":1408}],786:[function(require,module,exports){

;
arguments[4][9][0].apply(exports,arguments)
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],787:[function(require,module,exports){

;
arguments[4][391][0].apply(exports,arguments)
;

},{"_process":1273,"dup":391,"timers":1403}],788:[function(require,module,exports){

;
arguments[4][11][0].apply(exports,arguments)
;

},{"./debug":789,"_process":1273,"dup":11}],789:[function(require,module,exports){

;
arguments[4][12][0].apply(exports,arguments)
;

},{"dup":12,"ms":1355}],790:[function(require,module,exports){

;
arguments[4][10][0].apply(exports,arguments)
;

},{"dup":10}],791:[function(require,module,exports){

;
arguments[4][395][0].apply(exports,arguments)
;

},{"_process":1273,"dup":395,"timers":1403}],792:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/foldl":36,"@segment/analytics.js-integration":793,"segmentio-facade":1390,"to-no-case":800}],793:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":794,"./statics":795,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":798,"dup":14,"slug-component":1398}],794:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":797,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":796}],795:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],796:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":460}],797:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],798:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":799,"_process":1273,"dup":11}],799:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],800:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":464}],801:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@segment/analytics.js-integration":802,"@segment/load-script":1202,"component-cookie":1279,"component-querystring":806,"use-https":1419}],802:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":803,"./statics":804,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":808,"dup":14,"slug-component":1398}],803:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":805,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],804:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],805:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],806:[function(require,module,exports){


module.exports = function() {};
;

},{"trim":1413,"type":807}],807:[function(require,module,exports){
/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object Error]': return 'error';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val !== val) return 'nan';
  if (val && val.nodeType === 1) return 'element';

  val = val.valueOf
    ? val.valueOf()
    : Object.prototype.valueOf.apply(val)

  return typeof val;
};

},{}],808:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":809,"_process":1273,"dup":11}],809:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],810:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/defaults":30,"@segment/analytics.js-integration":811,"do-when":1301,"is":818,"json3":1326,"reject":1382}],811:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":812,"./statics":813,"@ndhoule/defaults":30,"component-bind":1277,"debug":815,"dup":7,"extend":817,"slug-component":1398}],812:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":814,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],813:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],814:[function(require,module,exports){
/* globals window, HTMLElement */

'use strict';

/**!
 * is
 * the definitive JavaScript type testing library
 *
 * @copyright 2013-2014 Enrico Marino / Jordan Harband
 * @license MIT
 */

var objProto = Object.prototype;
var owns = objProto.hasOwnProperty;
var toStr = objProto.toString;
var symbolValueOf;
if (typeof Symbol === 'function') {
  symbolValueOf = Symbol.prototype.valueOf;
}
var bigIntValueOf;
if (typeof BigInt === 'function') {
  bigIntValueOf = BigInt.prototype.valueOf;
}
var isActualNaN = function (value) {
  return value !== value;
};
var NON_HOST_TYPES = {
  'boolean': 1,
  number: 1,
  string: 1,
  undefined: 1
};

var base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/;
var hexRegex = /^[A-Fa-f0-9]+$/;

/**
 * Expose `is`
 */

var is = {};

/**
 * Test general.
 */

/**
 * is.type
 * Test if `value` is a type of `type`.
 *
 * @param {*} value value to test
 * @param {String} type type
 * @return {Boolean} true if `value` is a type of `type`, false otherwise
 * @api public
 */

is.a = is.type = function (value, type) {
  return typeof value === type;
};

/**
 * is.defined
 * Test if `value` is defined.
 *
 * @param {*} value value to test
 * @return {Boolean} true if 'value' is defined, false otherwise
 * @api public
 */

is.defined = function (value) {
  return typeof value !== 'undefined';
};

/**
 * is.empty
 * Test if `value` is empty.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is empty, false otherwise
 * @api public
 */

is.empty = function (value) {
  var type = toStr.call(value);
  var key;

  if (type === '[object Array]' || type === '[object Arguments]' || type === '[object String]') {
    return value.length === 0;
  }

  if (type === '[object Object]') {
    for (key in value) {
      if (owns.call(value, key)) {
        return false;
      }
    }
    return true;
  }

  return !value;
};

/**
 * is.equal
 * Test if `value` is equal to `other`.
 *
 * @param {*} value value to test
 * @param {*} other value to compare with
 * @return {Boolean} true if `value` is equal to `other`, false otherwise
 */

is.equal = function equal(value, other) {
  if (value === other) {
    return true;
  }

  var type = toStr.call(value);
  var key;

  if (type !== toStr.call(other)) {
    return false;
  }

  if (type === '[object Object]') {
    for (key in value) {
      if (!is.equal(value[key], other[key]) || !(key in other)) {
        return false;
      }
    }
    for (key in other) {
      if (!is.equal(value[key], other[key]) || !(key in value)) {
        return false;
      }
    }
    return true;
  }

  if (type === '[object Array]') {
    key = value.length;
    if (key !== other.length) {
      return false;
    }
    while (key--) {
      if (!is.equal(value[key], other[key])) {
        return false;
      }
    }
    return true;
  }

  if (type === '[object Function]') {
    return value.prototype === other.prototype;
  }

  if (type === '[object Date]') {
    return value.getTime() === other.getTime();
  }

  return false;
};

/**
 * is.hosted
 * Test if `value` is hosted by `host`.
 *
 * @param {*} value to test
 * @param {*} host host to test with
 * @return {Boolean} true if `value` is hosted by `host`, false otherwise
 * @api public
 */

is.hosted = function (value, host) {
  var type = typeof host[value];
  return type === 'object' ? !!host[value] : !NON_HOST_TYPES[type];
};

/**
 * is.instance
 * Test if `value` is an instance of `constructor`.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is an instance of `constructor`
 * @api public
 */

is.instance = is['instanceof'] = function (value, constructor) {
  return value instanceof constructor;
};

/**
 * is.nil / is.null
 * Test if `value` is null.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is null, false otherwise
 * @api public
 */

is.nil = is['null'] = function (value) {
  return value === null;
};

/**
 * is.undef / is.undefined
 * Test if `value` is undefined.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is undefined, false otherwise
 * @api public
 */

is.undef = is.undefined = function (value) {
  return typeof value === 'undefined';
};

/**
 * Test arguments.
 */

/**
 * is.args
 * Test if `value` is an arguments object.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is an arguments object, false otherwise
 * @api public
 */

is.args = is.arguments = function (value) {
  var isStandardArguments = toStr.call(value) === '[object Arguments]';
  var isOldArguments = !is.array(value) && is.arraylike(value) && is.object(value) && is.fn(value.callee);
  return isStandardArguments || isOldArguments;
};

/**
 * Test array.
 */

/**
 * is.array
 * Test if 'value' is an array.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is an array, false otherwise
 * @api public
 */

is.array = Array.isArray || function (value) {
  return toStr.call(value) === '[object Array]';
};

/**
 * is.arguments.empty
 * Test if `value` is an empty arguments object.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is an empty arguments object, false otherwise
 * @api public
 */
is.args.empty = function (value) {
  return is.args(value) && value.length === 0;
};

/**
 * is.array.empty
 * Test if `value` is an empty array.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is an empty array, false otherwise
 * @api public
 */
is.array.empty = function (value) {
  return is.array(value) && value.length === 0;
};

/**
 * is.arraylike
 * Test if `value` is an arraylike object.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is an arguments object, false otherwise
 * @api public
 */

is.arraylike = function (value) {
  return !!value && !is.bool(value)
    && owns.call(value, 'length')
    && isFinite(value.length)
    && is.number(value.length)
    && value.length >= 0;
};

/**
 * Test boolean.
 */

/**
 * is.bool
 * Test if `value` is a boolean.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is a boolean, false otherwise
 * @api public
 */

is.bool = is['boolean'] = function (value) {
  return toStr.call(value) === '[object Boolean]';
};

/**
 * is.false
 * Test if `value` is false.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is false, false otherwise
 * @api public
 */

is['false'] = function (value) {
  return is.bool(value) && Boolean(Number(value)) === false;
};

/**
 * is.true
 * Test if `value` is true.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is true, false otherwise
 * @api public
 */

is['true'] = function (value) {
  return is.bool(value) && Boolean(Number(value)) === true;
};

/**
 * Test date.
 */

/**
 * is.date
 * Test if `value` is a date.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is a date, false otherwise
 * @api public
 */

is.date = function (value) {
  return toStr.call(value) === '[object Date]';
};

/**
 * is.date.valid
 * Test if `value` is a valid date.
 *
 * @param {*} value value to test
 * @returns {Boolean} true if `value` is a valid date, false otherwise
 */
is.date.valid = function (value) {
  return is.date(value) && !isNaN(Number(value));
};

/**
 * Test element.
 */

/**
 * is.element
 * Test if `value` is an html element.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is an HTML Element, false otherwise
 * @api public
 */

is.element = function (value) {
  return value !== undefined
    && typeof HTMLElement !== 'undefined'
    && value instanceof HTMLElement
    && value.nodeType === 1;
};

/**
 * Test error.
 */

/**
 * is.error
 * Test if `value` is an error object.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is an error object, false otherwise
 * @api public
 */

is.error = function (value) {
  return toStr.call(value) === '[object Error]';
};

/**
 * Test function.
 */

/**
 * is.fn / is.function (deprecated)
 * Test if `value` is a function.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is a function, false otherwise
 * @api public
 */

is.fn = is['function'] = function (value) {
  var isAlert = typeof window !== 'undefined' && value === window.alert;
  if (isAlert) {
    return true;
  }
  var str = toStr.call(value);
  return str === '[object Function]' || str === '[object GeneratorFunction]' || str === '[object AsyncFunction]';
};

/**
 * Test number.
 */

/**
 * is.number
 * Test if `value` is a number.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is a number, false otherwise
 * @api public
 */

is.number = function (value) {
  return toStr.call(value) === '[object Number]';
};

/**
 * is.infinite
 * Test if `value` is positive or negative infinity.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is positive or negative Infinity, false otherwise
 * @api public
 */
is.infinite = function (value) {
  return value === Infinity || value === -Infinity;
};

/**
 * is.decimal
 * Test if `value` is a decimal number.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is a decimal number, false otherwise
 * @api public
 */

is.decimal = function (value) {
  return is.number(value) && !isActualNaN(value) && !is.infinite(value) && value % 1 !== 0;
};

/**
 * is.divisibleBy
 * Test if `value` is divisible by `n`.
 *
 * @param {Number} value value to test
 * @param {Number} n dividend
 * @return {Boolean} true if `value` is divisible by `n`, false otherwise
 * @api public
 */

is.divisibleBy = function (value, n) {
  var isDividendInfinite = is.infinite(value);
  var isDivisorInfinite = is.infinite(n);
  var isNonZeroNumber = is.number(value) && !isActualNaN(value) && is.number(n) && !isActualNaN(n) && n !== 0;
  return isDividendInfinite || isDivisorInfinite || (isNonZeroNumber && value % n === 0);
};

/**
 * is.integer
 * Test if `value` is an integer.
 *
 * @param value to test
 * @return {Boolean} true if `value` is an integer, false otherwise
 * @api public
 */

is.integer = is['int'] = function (value) {
  return is.number(value) && !isActualNaN(value) && value % 1 === 0;
};

/**
 * is.maximum
 * Test if `value` is greater than 'others' values.
 *
 * @param {Number} value value to test
 * @param {Array} others values to compare with
 * @return {Boolean} true if `value` is greater than `others` values
 * @api public
 */

is.maximum = function (value, others) {
  if (isActualNaN(value)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.arraylike(others)) {
    throw new TypeError('second argument must be array-like');
  }
  var len = others.length;

  while (--len >= 0) {
    if (value < others[len]) {
      return false;
    }
  }

  return true;
};

/**
 * is.minimum
 * Test if `value` is less than `others` values.
 *
 * @param {Number} value value to test
 * @param {Array} others values to compare with
 * @return {Boolean} true if `value` is less than `others` values
 * @api public
 */

is.minimum = function (value, others) {
  if (isActualNaN(value)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.arraylike(others)) {
    throw new TypeError('second argument must be array-like');
  }
  var len = others.length;

  while (--len >= 0) {
    if (value > others[len]) {
      return false;
    }
  }

  return true;
};

/**
 * is.nan
 * Test if `value` is not a number.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is not a number, false otherwise
 * @api public
 */

is.nan = function (value) {
  return !is.number(value) || value !== value;
};

/**
 * is.even
 * Test if `value` is an even number.
 *
 * @param {Number} value value to test
 * @return {Boolean} true if `value` is an even number, false otherwise
 * @api public
 */

is.even = function (value) {
  return is.infinite(value) || (is.number(value) && value === value && value % 2 === 0);
};

/**
 * is.odd
 * Test if `value` is an odd number.
 *
 * @param {Number} value value to test
 * @return {Boolean} true if `value` is an odd number, false otherwise
 * @api public
 */

is.odd = function (value) {
  return is.infinite(value) || (is.number(value) && value === value && value % 2 !== 0);
};

/**
 * is.ge
 * Test if `value` is greater than or equal to `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean}
 * @api public
 */

is.ge = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value >= other;
};

/**
 * is.gt
 * Test if `value` is greater than `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean}
 * @api public
 */

is.gt = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value > other;
};

/**
 * is.le
 * Test if `value` is less than or equal to `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} if 'value' is less than or equal to 'other'
 * @api public
 */

is.le = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value <= other;
};

/**
 * is.lt
 * Test if `value` is less than `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} if `value` is less than `other`
 * @api public
 */

is.lt = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value < other;
};

/**
 * is.within
 * Test if `value` is within `start` and `finish`.
 *
 * @param {Number} value value to test
 * @param {Number} start lower bound
 * @param {Number} finish upper bound
 * @return {Boolean} true if 'value' is is within 'start' and 'finish'
 * @api public
 */
is.within = function (value, start, finish) {
  if (isActualNaN(value) || isActualNaN(start) || isActualNaN(finish)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.number(value) || !is.number(start) || !is.number(finish)) {
    throw new TypeError('all arguments must be numbers');
  }
  var isAnyInfinite = is.infinite(value) || is.infinite(start) || is.infinite(finish);
  return isAnyInfinite || (value >= start && value <= finish);
};

/**
 * Test object.
 */

/**
 * is.object
 * Test if `value` is an object.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is an object, false otherwise
 * @api public
 */
is.object = function (value) {
  return toStr.call(value) === '[object Object]';
};

/**
 * is.primitive
 * Test if `value` is a primitive.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is a primitive, false otherwise
 * @api public
 */
is.primitive = function isPrimitive(value) {
  if (!value) {
    return true;
  }
  if (typeof value === 'object' || is.object(value) || is.fn(value) || is.array(value)) {
    return false;
  }
  return true;
};

/**
 * is.hash
 * Test if `value` is a hash - a plain object literal.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is a hash, false otherwise
 * @api public
 */

is.hash = function (value) {
  return is.object(value) && value.constructor === Object && !value.nodeType && !value.setInterval;
};

/**
 * Test regexp.
 */

/**
 * is.regexp
 * Test if `value` is a regular expression.
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is a regexp, false otherwise
 * @api public
 */

is.regexp = function (value) {
  return toStr.call(value) === '[object RegExp]';
};

/**
 * Test string.
 */

/**
 * is.string
 * Test if `value` is a string.
 *
 * @param {*} value value to test
 * @return {Boolean} true if 'value' is a string, false otherwise
 * @api public
 */

is.string = function (value) {
  return toStr.call(value) === '[object String]';
};

/**
 * Test base64 string.
 */

/**
 * is.base64
 * Test if `value` is a valid base64 encoded string.
 *
 * @param {*} value value to test
 * @return {Boolean} true if 'value' is a base64 encoded string, false otherwise
 * @api public
 */

is.base64 = function (value) {
  return is.string(value) && (!value.length || base64Regex.test(value));
};

/**
 * Test base64 string.
 */

/**
 * is.hex
 * Test if `value` is a valid hex encoded string.
 *
 * @param {*} value value to test
 * @return {Boolean} true if 'value' is a hex encoded string, false otherwise
 * @api public
 */

is.hex = function (value) {
  return is.string(value) && (!value.length || hexRegex.test(value));
};

/**
 * is.symbol
 * Test if `value` is an ES6 Symbol
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is a Symbol, false otherise
 * @api public
 */

is.symbol = function (value) {
  return typeof Symbol === 'function' && toStr.call(value) === '[object Symbol]' && typeof symbolValueOf.call(value) === 'symbol';
};

/**
 * is.bigint
 * Test if `value` is an ES-proposed BigInt
 *
 * @param {*} value value to test
 * @return {Boolean} true if `value` is a BigInt, false otherise
 * @api public
 */

is.bigint = function (value) {
  // eslint-disable-next-line valid-typeof
  return typeof BigInt === 'function' && toStr.call(value) === '[object BigInt]' && typeof bigIntValueOf.call(value) === 'bigint';
};

module.exports = is;

},{}],815:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":816,"_process":1273,"dup":11}],816:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],817:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],818:[function(require,module,exports){


module.exports = function() {};
;

},{}],819:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/extend":35,"@segment/analytics.js-integration":820,"obj-case":1365,"segmentio-facade":1390}],820:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":821,"./statics":822,"@ndhoule/defaults":30,"component-bind":1277,"debug":823,"dup":7,"extend":825,"slug-component":1398}],821:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],822:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],823:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":824,"_process":1273,"dup":11}],824:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],825:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],826:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":827,"global-queue":1307}],827:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":828,"./statics":829,"@ndhoule/defaults":30,"component-bind":1277,"debug":830,"dup":7,"extend":832,"slug-component":1398}],828:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],829:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],830:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":831,"_process":1273,"dup":11}],831:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],832:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],833:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@segment/analytics.js-integration":834}],834:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":835,"./statics":836,"@ndhoule/defaults":30,"component-bind":1277,"debug":837,"dup":7,"extend":839,"slug-component":1398}],835:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],836:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],837:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":838,"_process":1273,"dup":11}],838:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],839:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],840:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":841,"json3":1326}],841:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":842,"./statics":843,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":845,"dup":14,"slug-component":1398}],842:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":844,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],843:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],844:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],845:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":846,"_process":1273,"dup":11}],846:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],847:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":848,"global-queue":1307}],848:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":849,"./statics":850,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":852,"dup":14,"slug-component":1398}],849:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":851,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],850:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],851:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],852:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":853,"_process":1273,"dup":11}],853:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],854:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":855,"analytics-events":1257}],855:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":856,"./statics":857,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":859,"dup":14,"slug-component":1398}],856:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":858,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],857:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],858:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],859:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":860,"_process":1273,"dup":11}],860:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],861:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":862,"component-each":1283,"global-queue":1307,"is":1321}],862:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":863,"./statics":864,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":866,"dup":14,"slug-component":1398}],863:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":865,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],864:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],865:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],866:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":867,"_process":1273,"dup":11}],867:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],868:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":869,"do-when":1301,"global-queue":1307,"segmentio-facade":1390}],869:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":870,"./statics":871,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":873,"dup":14,"slug-component":1398}],870:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":872,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],871:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],872:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],873:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":874,"_process":1273,"dup":11}],874:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],875:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":876,"global-queue":1307,"is":1321,"obj-case":1365,"use-https":1419}],876:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":877,"./statics":878,"@ndhoule/defaults":30,"component-bind":1277,"debug":879,"dup":7,"extend":881,"slug-component":1398}],877:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],878:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],879:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":880,"_process":1273,"dup":11}],880:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],881:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],882:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":883,"component-each":1283,"global-queue":1307}],883:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":884,"./statics":885,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":887,"dup":14,"slug-component":1398}],884:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":886,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],885:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],886:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],887:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":888,"_process":1273,"dup":11}],888:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],889:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":890}],890:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":891,"./statics":892,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":894,"dup":14,"slug-component":1398}],891:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":893,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],892:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],893:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],894:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":895,"_process":1273,"dup":11}],895:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],896:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/alias":71,"@segment/analytics.js-integration":897,"@segment/convert-dates":1194,"obj-case":1365}],897:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":898,"./statics":899,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":901,"dup":14,"slug-component":1398}],898:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":900,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],899:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],900:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],901:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":902,"_process":1273,"dup":11}],902:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],903:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":904,"component-each":1283,"segmentio-facade":1390}],904:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":905,"./statics":906,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":908,"dup":14,"slug-component":1398}],905:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":907,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],906:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],907:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],908:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":909,"_process":1273,"dup":11}],909:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],910:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":911,"component-each":1283}],911:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":912,"./statics":913,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":915,"dup":14,"slug-component":1398}],912:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":914,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],913:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],914:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],915:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":916,"_process":1273,"dup":11}],916:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],917:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/extend":35,"@segment/analytics.js-integration":918}],918:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":919,"./statics":920,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":922,"dup":14,"slug-component":1398}],919:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":921,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],920:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],921:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],922:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":923,"_process":1273,"dup":11}],923:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],924:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":925}],925:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":926,"./statics":927,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":929,"dup":14,"slug-component":1398}],926:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":928,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],927:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],928:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],929:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":930,"_process":1273,"dup":11}],930:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],931:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":932,"obj-case":1365}],932:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":933,"./statics":934,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":936,"dup":14,"slug-component":1398}],933:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":935,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],934:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],935:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],936:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":937,"_process":1273,"dup":11}],937:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],938:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":939}],939:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":940,"./statics":941,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":943,"dup":14,"slug-component":1398}],940:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":942,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],941:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],942:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],943:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":944,"_process":1273,"dup":11}],944:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],945:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":946}],946:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":947,"./statics":948,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":950,"dup":14,"slug-component":1398}],947:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":949,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],948:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],949:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],950:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":951,"_process":1273,"dup":11}],951:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],952:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":953,"do-when":1301}],953:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":954,"./statics":955,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":957,"dup":14,"slug-component":1398}],954:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":956,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],955:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],956:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],957:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":958,"_process":1273,"dup":11}],958:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],959:[function(require,module,exports){


'use strict';

/**
 * Module dependencies.
 */

var ads = require('@segment/ad-params');
var clone = require('component-clone');
var cookie = require('component-cookie');
var extend = require('@ndhoule/extend');
var integration = require('@segment/analytics.js-integration');
var json = require('json3');
var keys = require('@ndhoule/keys');
var localstorage = require('yields-store');
var protocol = require('@segment/protocol');
var send = require('@segment/send-json');
var topDomain = require('@segment/top-domain');
var utm = require('@segment/utm-params');
var uuid = require('uuid').v4;
var Queue = require('@segment/localstorage-retry');

/**
 * Cookie options
 */

var cookieOptions = {
  // 1 year
  maxage: 31536000000,
  secure: false,
  path: '/'
};

/**
 * Segment messages can be a maximum of 32kb.
 */
var MAX_SIZE = 32 * 1000;

/**
 * Queue options
 *
 * Attempt with exponential backoff for upto 10 times.
 * Backoff periods are: 1s, 2s, 4s, 8s, 16s, 32s, 64s, 128s (~2m), 256s (~4m),
 * 512s (~8.5m) and 1024s (~17m).
 */

var queueOptions = {
  maxRetryDelay: 360000, // max interval of 1hr. Added as a guard.
  minRetryDelay: 1000, // first attempt (1s)
  backoffFactor: 2,
  maxAttempts: 10,
  maxItems: 100
};

/**
 * Expose `Segment` integration.
 */

var Segment = (exports = module.exports = integration('Segment.io')
  .option('apiKey', '')
  .option('apiHost', 'api.segment.io/v1')
  .option('crossDomainIdServers', [])
  .option('deleteCrossDomainId', false)
  .option('saveCrossDomainIdInLocalStorage', true)
  .option('retryQueue', true)
  .option('addBundledMetadata', false)
  .option('unbundledIntegrations', []));

/**
 * Get the store.
 *
 * @return {Function}
 */

exports.storage = function() {
  return protocol() === 'file:' || protocol() === 'chrome-extension:'
    ? localstorage
    : cookie;
};

/**
 * Expose global for testing.
 */

exports.global = window;

/**
 * Send the given `obj` and `headers` to `url` with the specified `timeout` and
 * `fn(err, req)`. Exported for testing.
 *
 * @param {String} url
 * @param {Object} obj
 * @param {Object} headers
 * @param {long} timeout
 * @param {Function} fn
 * @api private
 */

exports.sendJsonWithTimeout = function(url, obj, headers, timeout, fn) {
  // only proceed with our new code path when cors is supported. this is
  // unlikely to happen in production, but we're being safe to preserve backward
  // compatibility.
  if (send.type !== 'xhr') {
    send(url, obj, headers, fn);
    return;
  }

  var req = new XMLHttpRequest();
  req.onerror = fn;
  req.onreadystatechange = done;

  req.open('POST', url, true);

  req.timeout = timeout;
  req.ontimeout = fn;

  // TODO: Remove this eslint disable
  // eslint-disable-next-line guard-for-in
  for (var k in headers) {
    req.setRequestHeader(k, headers[k]);
  }
  req.send(json.stringify(obj));

  function done() {
    if (req.readyState === 4) {
      // Fail on 429 and 5xx HTTP errors
      if (req.status === 429 || (req.status >= 500 && req.status < 600)) {
        fn(new Error('HTTP Error ' + req.status + ' (' + req.statusText + ')'));
      } else {
        fn(null, req);
      }
    }
  }
};

/**
 * Initialize.
 *
 * https://github.com/segmentio/segmentio/blob/master/modules/segmentjs/segment.js/v1/segment.js
 *
 * @api public
 */

Segment.prototype.initialize = function() {
  var self = this;

  if (this.options.retryQueue) {
    this._lsqueue = new Queue('segmentio', queueOptions, function(elem, done) {
      // apply sentAt at flush time and reset on each retry
      // so the tracking-api doesn't interpret a time skew
      var item = elem;
      item.msg.sentAt = new Date();

      // send with 10s timeout
      Segment.sendJsonWithTimeout(
        item.url,
        item.msg,
        item.headers,
        10 * 1000,
        function(err, res) {
          self.debug('sent %O, received %O', item.msg, [err, res]);
          if (err) return done(err);
          done(null, res);
        }
      );
    });

    this._lsqueue.start();
  }

  this.ready();

  this.analytics.on('invoke', function(msg) {
    var action = msg.action();
    var listener = 'on' + msg.action();
    self.debug('%s %o', action, msg);
    if (self[listener]) self[listener](msg);
    self.ready();
  });

  // Delete cross domain identifiers.
  this.deleteCrossDomainIdIfNeeded();

  // At this moment we intentionally do not want events to be queued while we retrieve the `crossDomainId`
  // so `.ready` will get called right away and we'll try to figure out `crossDomainId`
  // separately
  if (this.isCrossDomainAnalyticsEnabled()) {
    this.retrieveCrossDomainId();
  }
};

/**
 * Loaded.
 *
 * @api private
 * @return {boolean}
 */

Segment.prototype.loaded = function() {
  return true;
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

Segment.prototype.onpage = function(page) {
  this.enqueue('/p', page.json());
};

/**
 * Identify.
 *
 * @api public
 * @param {Identify} identify
 */

Segment.prototype.onidentify = function(identify) {
  this.enqueue('/i', identify.json());
};

/**
 * Group.
 *
 * @api public
 * @param {Group} group
 */

Segment.prototype.ongroup = function(group) {
  this.enqueue('/g', group.json());
};

/**
 * ontrack.
 *
 * TODO: Document this.
 *
 * @api private
 * @param {Track} track
 */

Segment.prototype.ontrack = function(track) {
  var json = track.json();
  // TODO: figure out why we need traits.
  delete json.traits;
  this.enqueue('/t', json);
};

/**
 * Alias.
 *
 * @api public
 * @param {Alias} alias
 */

Segment.prototype.onalias = function(alias) {
  var json = alias.json();
  var user = this.analytics.user();
  json.previousId =
    json.previousId || json.from || user.id() || user.anonymousId();
  json.userId = json.userId || json.to;
  delete json.from;
  delete json.to;
  this.enqueue('/a', json);
};

/**
 * Normalize the given `msg`.
 *
 * @api private
 * @param {Object} msg
 */

Segment.prototype.normalize = function(message) {
  var msg = message;
  this.debug('normalize %o', msg);
  var user = this.analytics.user();
  var global = exports.global;
  var query = global.location.search;
  var ctx = (msg.context = msg.context || msg.options || {});
  delete msg.options;
  msg.writeKey = this.options.apiKey;
  ctx.userAgent = navigator.userAgent;
  var locale = navigator.userLanguage || navigator.language;
  if (typeof ctx.locale === 'undefined' && typeof locale !== 'undefined') {
    ctx.locale = locale;
  }
  if (!ctx.library)
    ctx.library = { name: 'analytics.js', version: this.analytics.VERSION };
  if (this.isCrossDomainAnalyticsEnabled()) {
    var crossDomainId = this.getCachedCrossDomainId();
    if (crossDomainId) {
      if (!ctx.traits) {
        ctx.traits = { crossDomainId: crossDomainId };
      } else if (!ctx.traits.crossDomainId) {
        ctx.traits.crossDomainId = crossDomainId;
      }
    }
  }
  // if user provides campaign via context, do not overwrite with UTM qs param
  if (query && !ctx.campaign) {
    ctx.campaign = utm(query);
  }
  this.referrerId(query, ctx);
  msg.userId = msg.userId || user.id();
  msg.anonymousId = user.anonymousId();
  msg.sentAt = new Date();
  // Add _metadata.
  var failedInitializations = this.analytics.failedInitializations || [];
  if (failedInitializations.length > 0) {
    msg._metadata = { failedInitializations: failedInitializations };
  }
  if (this.options.addBundledMetadata) {
    var bundled = keys(this.analytics.Integrations);
    msg._metadata = msg._metadata || {};
    msg._metadata.bundled = bundled;
    msg._metadata.unbundled = this.options.unbundledIntegrations;
    msg._metadata.bundledConfigIds = this.options.bundledConfigIds;
    msg._metadata.unbundledConfigIds = this.options.unbundledConfigIds;
  }
  this.debug('normalized %o', msg);
  this.ampId(ctx);
  return msg;
};

/**
 * Add amp id if it exists.
 *
 * @param {Object} ctx
 */

Segment.prototype.ampId = function(ctx) {
  var ampId = this.cookie('_ga');
  if (ampId) {
    if (ampId.slice(0, 3) === 'amp') ctx.amp = { id: ampId };
  }
};

/**
 * Send `obj` to `path`.
 *
 * @api private
 * @param {string} path
 * @param {Object} obj
 * @param {Function} fn
 */

Segment.prototype.enqueue = function(path, message, fn) {
  var url = 'https://' + this.options.apiHost + path;
  var headers = { 'Content-Type': 'text/plain' };
  var msg = this.normalize(message);

  // Print a log statement when messages exceed the maximum size. In the future,
  // we may consider dropping this event on the client entirely.
  if (json.stringify(msg).length > MAX_SIZE) {
    this.debug('message must be less than 32kb %O', msg);
  }

  this.debug('enqueueing %O', msg);

  var self = this;
  if (this.options.retryQueue) {
    this._lsqueue.addItem({
      url: url,
      headers: headers,
      msg: msg
    });
  } else {
    send(url, msg, headers, function(err, res) {
      self.debug('sent %O, received %O', msg, [err, res]);
      if (fn) {
        if (err) return fn(err);
        fn(null, res);
      }
    });
  }
};

/**
 * Gets/sets cookies on the appropriate domain.
 *
 * @api private
 * @param {string} name
 * @param {*} val
 */

Segment.prototype.cookie = function(name, val) {
  var store = Segment.storage();
  if (arguments.length === 1) return store(name);
  var global = exports.global;
  var href = global.location.href;
  var domain = '.' + topDomain(href);
  if (domain === '.') domain = '';
  this.debug('store domain %s -> %s', href, domain);
  var opts = clone(cookieOptions);
  opts.domain = domain;
  this.debug('store %s, %s, %o', name, val, opts);
  store(name, val, opts);
  if (store(name)) return;
  delete opts.domain;
  this.debug('fallback store %s, %s, %o', name, val, opts);
  store(name, val, opts);
};

/**
 * Add referrerId to context.
 *
 * TODO: remove.
 *
 * @api private
 * @param {Object} query
 * @param {Object} ctx
 */

Segment.prototype.referrerId = function(query, ctx) {
  var stored = this.cookie('s:context.referrer');
  var ad;

  if (stored) stored = json.parse(stored);
  if (query) ad = ads(query);

  ad = ad || stored;

  if (!ad) return;
  ctx.referrer = extend(ctx.referrer || {}, ad);
  this.cookie('s:context.referrer', json.stringify(ad));
};

/**
 * isCrossDomainAnalyticsEnabled returns true if cross domain analytics is enabled.
 * This field is not directly supplied, so it is inferred by inspecting the
 * `crossDomainIdServers` array in settings. If this array is null or empty,
 * it is assumed that cross domain analytics is disabled.
 *
 * @api private
 */
Segment.prototype.isCrossDomainAnalyticsEnabled = function() {
  if (!this.options.crossDomainIdServers) {
    return false;
  }
  return this.options.crossDomainIdServers.length > 0;
};

/**
 * retrieveCrossDomainId.
 *
 * @api private
 * @param {function) callback => err, {crossDomainId, fromServer, timestamp}
 */
Segment.prototype.retrieveCrossDomainId = function(callback) {
  if (!this.isCrossDomainAnalyticsEnabled()) {
    // Callback is only provided in tests.
    if (callback) {
      callback('crossDomainId not enabled', null);
    }
    return;
  }

  var cachedCrossDomainId = this.getCachedCrossDomainId();
  if (cachedCrossDomainId) {
    // Callback is only provided in tests.
    if (callback) {
      callback(null, {
        crossDomainId: cachedCrossDomainId
      });
    }
    return;
  }

  var self = this;
  var writeKey = this.options.apiKey;

  var domains = [];
  for (var i = 0; i < this.options.crossDomainIdServers.length; i++) {
    var domain = this.options.crossDomainIdServers[i];
    domains.push(domain);
  }

  getCrossDomainIdFromServerList(domains, writeKey, function(err, res) {
    if (err) {
      // Callback is only provided in tests.
      if (callback) {
        callback(err, null);
      }
      // We optimize for no conflicting xid as much as possible. So bail out if there is an
      // error and we cannot be sure that xid does not exist on any other domains.
      return;
    }

    var crossDomainId = null;
    var fromDomain = null;
    if (res) {
      crossDomainId = res.id;
      fromDomain = res.domain;
    } else {
      crossDomainId = uuid();
      fromDomain = window.location.hostname;
    }

    self.saveCrossDomainId(crossDomainId);
    self.analytics.identify({
      crossDomainId: crossDomainId
    });

    // Callback is only provided in tests.
    if (callback) {
      callback(null, {
        crossDomainId: crossDomainId,
        fromDomain: fromDomain
      });
    }
  });
};

/**
 * getCachedCrossDomainId returns the cross domain identifier stored on the client based on the `saveCrossDomainIdInLocalStorage` flag.
 * If `saveCrossDomainIdInLocalStorage` is false, it reads it from the `seg_xid` cookie.
 * If `saveCrossDomainIdInLocalStorage` is true, it reads it from the `seg_xid` key in localStorage.
 *
 * @return {string} crossDomainId
 */
Segment.prototype.getCachedCrossDomainId = function() {
  if (this.options.saveCrossDomainIdInLocalStorage) {
    return localstorage('seg_xid');
  }
  return this.cookie('seg_xid');
};

/**
 * saveCrossDomainId saves the cross domain identifier. The implementation differs based on the `saveCrossDomainIdInLocalStorage` flag.
 * If `saveCrossDomainIdInLocalStorage` is false, it saves it as the `seg_xid` cookie.
 * If `saveCrossDomainIdInLocalStorage` is true, it saves it to localStorage (so that it can be accessed on the current domain)
 * and as a httpOnly cookie (so that can it can be provided to other domains).
 *
 * @api private
 */
Segment.prototype.saveCrossDomainId = function(crossDomainId) {
  if (!this.options.saveCrossDomainIdInLocalStorage) {
    this.cookie('seg_xid', crossDomainId);
    return;
  }

  var self = this;

  // Save the cookie by making a request to the xid server for the current domain.
  var currentTld = getTld(window.location.hostname);
  for (var i = 0; i < this.options.crossDomainIdServers.length; i++) {
    var domain = this.options.crossDomainIdServers[i];
    if (getTld(domain) === currentTld) {
      var writeKey = this.options.apiKey;
      var url =
        'https://' +
        domain +
        '/v1/saveId?writeKey=' +
        writeKey +
        '&xid=' +
        crossDomainId;

      httpGet(url, function(err, res) {
        if (err) {
          self.debug('could not save id on %O, received %O', url, [err, res]);
          return;
        }

        localstorage('seg_xid', crossDomainId);
      });
      return;
    }
  }
};

/**
 * Deletes any state persisted by cross domain analytics.
 * * seg_xid (and metadata) from cookies
 * * seg_xid from localStorage
 * * crossDomainId from traits in localStorage
 *
 * The deletion logic is run only if deletion is enabled for this project, and only
 * deletes the data that actually exists.
 *
 * @api private
 */
Segment.prototype.deleteCrossDomainIdIfNeeded = function() {
  // Only continue if deletion is enabled for this project.
  if (!this.options.deleteCrossDomainId) {
    return;
  }

  // Delete the xid cookie if it exists. We also delete associated metadata.
  if (this.cookie('seg_xid')) {
    this.cookie('seg_xid', null);
    this.cookie('seg_xid_fd', null);
    this.cookie('seg_xid_ts', null);
  }

  // Delete the xid from localStorage if it exists.
  if (localstorage('seg_xid')) {
    localstorage('seg_xid', null);
  }

  // Delete the crossDomainId trait in localStorage if it exists.
  if (this.analytics.user().traits().crossDomainId) {
    // This intentionally uses an internal API, so that
    // we can avoid interacting with lower level localStorage APIs, and instead
    // leverage existing functionality inside analytics.js.

    var traits = this.analytics.user().traits();
    delete traits.crossDomainId;
    this.analytics.user()._setTraits(traits);
  }
};

/**
 * getCrossDomainIdFromServers
 * @param {Array} domains
 * @param {string} writeKey
 * @param {function} callback => err, {domain, id}
 */
function getCrossDomainIdFromServerList(domains, writeKey, callback) {
  // Should not happen but special case
  if (domains.length === 0) {
    callback(null, null);
  }
  var crossDomainIdFound = false;
  var finishedRequests = 0;
  var error = null;
  for (var i = 0; i < domains.length; i++) {
    var domain = domains[i];

    getCrossDomainIdFromSingleServer(domain, writeKey, function(err, res) {
      finishedRequests++;
      if (err) {
        // if request against a particular domain fails, we won't early exit
        // but rather wait and see if requests to other domains succeed
        error = err;
      } else if (res && res.id && !crossDomainIdFound) {
        // If we found an xid from any of the servers, we'll just early exit and callback
        crossDomainIdFound = true;
        callback(null, res);
      }
      if (finishedRequests === domains.length && !crossDomainIdFound) {
        // Error is non-null if we encountered an issue, otherwise error will be null
        // meaning that no domains in the list has an xid for current user
        callback(error, null);
      }
    });
  }
}

/**
 * getCrossDomainId
 * @param {Array} domain
 * @param {string} writeKey
 * @param {function} callback => err, {domain, id}
 */
function getCrossDomainIdFromSingleServer(domain, writeKey, callback) {
  var endpoint = 'https://' + domain + '/v1/id/' + writeKey;
  getJson(endpoint, function(err, res) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, {
        domain: domain,
        id: (res && res.id) || null
      });
    }
  });
}

/**
 * getJson
 * @param {string} url
 * @param {function} callback => err, json
 */
function getJson(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.withCredentials = true;
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status >= 200 && xhr.status < 300) {
        callback(null, xhr.responseText ? json.parse(xhr.responseText) : null);
      } else {
        callback(xhr.statusText || 'Unknown Error', null);
      }
    }
  };
  xhr.send();
}

/**
 * get makes a get request to the given URL.
 * @param {string} url
 * @param {function} callback => err, response
 */
function httpGet(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.withCredentials = true;
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status >= 200 && xhr.status < 300) {
        callback(null, xhr.responseText);
      } else {
        callback(xhr.statusText || xhr.responseText || 'Unknown Error', null);
      }
    }
  };
  xhr.send();
}

/**
 * getTld
 * Get domain.com from subdomain.domain.com, etc.
 * @param {string} domain
 * @return {string} tld
 */
function getTld(domain) {
  return domain
    .split('.')
    .splice(-2)
    .join('.');
}



},{"@ndhoule/extend":35,"@ndhoule/keys":38,"@segment/ad-params":69,"@segment/analytics.js-integration":960,"@segment/localstorage-retry":1204,"@segment/protocol":1216,"@segment/send-json":1217,"@segment/top-domain":1220,"@segment/utm-params":1227,"component-clone":1278,"component-cookie":1279,"json3":1326,"uuid":967,"yields-store":1430}],960:[function(require,module,exports){

;
arguments[4][14][0].apply(exports,arguments)
;

},{"./protos":961,"./statics":962,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":964,"dup":14,"slug-component":1398}],961:[function(require,module,exports){

;
arguments[4][15][0].apply(exports,arguments)
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":963,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],962:[function(require,module,exports){

;
arguments[4][16][0].apply(exports,arguments)
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],963:[function(require,module,exports){

;
arguments[4][17][0].apply(exports,arguments)
;

},{"dup":17}],964:[function(require,module,exports){

;
arguments[4][11][0].apply(exports,arguments)
;

},{"./debug":965,"_process":1273,"dup":11}],965:[function(require,module,exports){

;
arguments[4][12][0].apply(exports,arguments)
;

},{"dup":12,"ms":1355}],966:[function(require,module,exports){

;
(function (global){

var rng;

var crypto = global.crypto || global.msCrypto; // for IE 11
if (crypto && crypto.getRandomValues) {
  // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
  // Moderately fast, high quality
  var _rnds8 = new Uint8Array(16);
  rng = function whatwgRNG() {
    crypto.getRandomValues(_rnds8);
    return _rnds8;
  };
}

if (!rng) {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var  _rnds = new Array(16);
  rng = function() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return _rnds;
  };
}

module.exports = rng;


}).call(this,typeof window !== "undefined" && window.document && window.document.implementation ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {})
;

},{}],967:[function(require,module,exports){

;
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

// Unique ID creation requires a high quality random # generator.  We feature
// detect to determine the best RNG source, normalizing to a function that
// returns 128-bits of randomness, since that's what's usually required
var _rng = require('./rng');

// Maps for number <-> hex string conversion
var _byteToHex = [];
var _hexToByte = {};
for (var i = 0; i < 256; i++) {
  _byteToHex[i] = (i + 0x100).toString(16).substr(1);
  _hexToByte[_byteToHex[i]] = i;
}

// **`parse()` - Parse a UUID into it's component bytes**
function parse(s, buf, offset) {
  var i = (buf && offset) || 0, ii = 0;

  buf = buf || [];
  s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
    if (ii < 16) { // Don't overflow!
      buf[i + ii++] = _hexToByte[oct];
    }
  });

  // Zero out remaining bytes if string was short
  while (ii < 16) {
    buf[i + ii++] = 0;
  }

  return buf;
}

// **`unparse()` - Convert UUID byte array (ala parse()) into a string**
function unparse(buf, offset) {
  var i = offset || 0, bth = _byteToHex;
  return  bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]];
}

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

// random #'s we need to init node and clockseq
var _seedBytes = _rng();

// Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
var _nodeId = [
  _seedBytes[0] | 0x01,
  _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
];

// Per 4.2.2, randomize (14 bit) clockseq
var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

// Previous uuid creation time
var _lastMSecs = 0, _lastNSecs = 0;

// See https://github.com/broofa/node-uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};

  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  var node = options.node || _nodeId;
  for (var n = 0; n < 6; n++) {
    b[i + n] = node[n];
  }

  return buf ? buf : unparse(b);
}

// **`v4()` - Generate random UUID**

// See https://github.com/broofa/node-uuid for API details
function v4(options, buf, offset) {
  // Deprecated - 'format' argument, as supported in v1.2
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options == 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || _rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ii++) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || unparse(rnds);
}

// Export public API
var uuid = v4;
uuid.v1 = v1;
uuid.v4 = v4;
uuid.parse = parse;
uuid.unparse = unparse;

module.exports = uuid;

;

},{"./rng":966}],968:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/foldl":36,"@segment/analytics.js-integration":969,"is":1321}],969:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":970,"./statics":971,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":973,"dup":14,"slug-component":1398}],970:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":972,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],971:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],972:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],973:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":974,"_process":1273,"dup":11}],974:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],975:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":976,"component-each":1283,"segmentio-facade":1390}],976:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":977,"./statics":978,"@ndhoule/defaults":30,"component-bind":1277,"debug":979,"dup":7,"extend":981,"slug-component":1398}],977:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],978:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],979:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":980,"_process":1273,"dup":11}],980:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],981:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],982:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/defaults":30,"@segment/analytics.js-integration":983}],983:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":984,"./statics":985,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":987,"dup":14,"slug-component":1398}],984:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":986,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],985:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],986:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],987:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":988,"_process":1273,"dup":11}],988:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],989:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":990,"component-each":1283}],990:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":991,"./statics":992,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":994,"dup":14,"slug-component":1398}],991:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":993,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],992:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],993:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],994:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":995,"_process":1273,"dup":11}],995:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],996:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":997,"is":1321,"next-tick":1360}],997:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":998,"./statics":999,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1001,"dup":14,"slug-component":1398}],998:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1000,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],999:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1000:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1001:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1002,"_process":1273,"dup":11}],1002:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1003:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1004,"component-bind":1277,"do-when":1301}],1004:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1005,"./statics":1006,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1008,"dup":14,"slug-component":1398}],1005:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1007,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1006:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1007:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1008:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1009,"_process":1273,"dup":11}],1009:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1010:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/foldl":36,"@segment/analytics.js-integration":1011,"component-each":1283,"segmentio-facade":1390}],1011:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1012,"./statics":1013,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1015,"dup":14,"slug-component":1398}],1012:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1014,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1013:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1014:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1015:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1016,"_process":1273,"dup":11}],1016:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1017:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1018,"do-when":1301}],1018:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1019,"./statics":1020,"@ndhoule/defaults":30,"component-bind":1277,"debug":1021,"dup":7,"extend":1023,"slug-component":1398}],1019:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1020:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],1021:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1022,"_process":1273,"dup":11}],1022:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1023:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],1024:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1025}],1025:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1026,"./statics":1027,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1029,"dup":14,"slug-component":1398}],1026:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1028,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1027:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1028:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1029:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1030,"_process":1273,"dup":11}],1030:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1031:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1032}],1032:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1033,"./statics":1034,"@ndhoule/defaults":30,"component-bind":1277,"debug":1035,"dup":7,"extend":1037,"slug-component":1398}],1033:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1034:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],1035:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1036,"_process":1273,"dup":11}],1036:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1037:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],1038:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/keys":38,"@segment/analytics.js-integration":1039,"global-queue":1307,"is":1321}],1039:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1040,"./statics":1041,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1043,"dup":14,"slug-component":1398}],1040:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1042,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1041:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1042:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1043:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1044,"_process":1273,"dup":11}],1044:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1045:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1046,"global-queue":1307,"slug-component":1398}],1046:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1047,"./statics":1048,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1050,"dup":14,"slug-component":1398}],1047:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1049,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1048:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1049:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1050:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1051,"_process":1273,"dup":11}],1051:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1052:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1053,"component-each":1283,"segmentio-facade":1065,"use-https":1419}],1053:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1054,"./statics":1055,"@ndhoule/defaults":30,"component-bind":1277,"debug":1056,"dup":7,"extend":1058,"slug-component":1398}],1054:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1055:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],1056:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1057,"_process":1273,"dup":11}],1057:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1058:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],1059:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":57,"obj-case":1365}],1060:[function(require,module,exports){


module.exports = function() {};
;

},{"./facade":1062,"./utils":1070,"dup":58}],1061:[function(require,module,exports){


module.exports = function() {};
;

},{"./facade":1062,"./utils":1070,"dup":59}],1062:[function(require,module,exports){


module.exports = function() {};
;

},{"./address":1059,"./is-enabled":1066,"./utils":1070,"@segment/isodate-traverse":1200,"dup":60,"new-date":1356,"obj-case":1365}],1063:[function(require,module,exports){


module.exports = function() {};
;

},{"./facade":1062,"./utils":1070,"dup":61,"is-email":1317,"new-date":1356}],1064:[function(require,module,exports){


module.exports = function() {};
;

},{"./facade":1062,"./utils":1070,"dup":62,"is-email":1317,"new-date":1356,"obj-case":1365,"trim":1413}],1065:[function(require,module,exports){


module.exports = function() {};
;

},{"./alias":1060,"./delete":1061,"./facade":1062,"./group":1063,"./identify":1064,"./page":1067,"./screen":1068,"./track":1069,"dup":63}],1066:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":64}],1067:[function(require,module,exports){


module.exports = function() {};
;

},{"./facade":1062,"./track":1069,"./utils":1070,"dup":65,"is-email":1317}],1068:[function(require,module,exports){


module.exports = function() {};
;

},{"./page":1067,"./track":1069,"./utils":1070,"dup":66}],1069:[function(require,module,exports){


module.exports = function() {};
;

},{"./facade":1062,"./identify":1064,"./utils":1070,"dup":67,"is-email":1317,"obj-case":1365}],1070:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/clone":29,"dup":68,"inherits":1313,"type-component":1414}],1071:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/extend":35,"@segment/analytics.js-integration":1072,"@segment/convert-dates":1194,"@segment/to-iso-string":1219,"segmentio-facade":1390}],1072:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1073,"./statics":1074,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1076,"dup":14,"slug-component":1398}],1073:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1075,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1074:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1075:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1076:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1077,"_process":1273,"dup":11}],1077:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1078:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/defaults":30,"@segment/analytics.js-integration":1079,"is":1321}],1079:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1080,"./statics":1081,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1083,"dup":14,"slug-component":1398}],1080:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1082,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1081:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1082:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1083:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1084,"_process":1273,"dup":11}],1084:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1085:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1086,"json3":1326,"use-https":1419}],1086:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1087,"./statics":1088,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1090,"dup":14,"slug-component":1398}],1087:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1089,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1088:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1089:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1090:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1091,"_process":1273,"dup":11}],1091:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1092:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/defaults":30,"@ndhoule/extend":35,"@ndhoule/foldl":36,"@segment/analytics.js-integration":1093,"component-each":1283,"obj-case":1365,"segmentio-facade":1390}],1093:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1094,"./statics":1095,"@ndhoule/defaults":30,"component-bind":1277,"debug":1096,"dup":7,"extend":1098,"slug-component":1398}],1094:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1095:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],1096:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1097,"_process":1273,"dup":11}],1097:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1098:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],1099:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1100,"component-clone":1278,"segmentio-facade":1390}],1100:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1101,"./statics":1102,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1104,"dup":14,"slug-component":1398}],1101:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1103,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1102:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1103:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1104:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1105,"_process":1273,"dup":11}],1105:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1106:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/alias":71,"@segment/analytics.js-integration":1107,"@segment/convert-dates":1194,"global-queue":1307,"to-unix-timestamp":1412}],1107:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1108,"./statics":1109,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1111,"dup":14,"slug-component":1398}],1108:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1110,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1109:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1110:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1111:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1112,"_process":1273,"dup":11}],1112:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1113:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1114,"component-cookie":1279,"global-queue":1307}],1114:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1115,"./statics":1116,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1118,"dup":14,"slug-component":1398}],1115:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1117,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1116:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1117:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1118:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1119,"_process":1273,"dup":11}],1119:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1120:[function(require,module,exports){


/**
 * Module dependencies.
 */
var integration = require('@segment/analytics.js-integration');
var TracktorLib = require('@segment/tracktor');
var when = require('do-when');

/**
 * Expose `Visual Tagger` integration.
 */

var Tracktor = (module.exports = integration('Visual Tagger')
  .global('Tracktor')
  .option('workspaceId', '')
  .option('sourceId', ''));

/**
 * Initialize.
 *
 * @api public
 */

Tracktor.prototype.initialize = function() {
  var tracktor = new TracktorLib(
    this.options.workspaceId,
    this.options.sourceId,
    this.options.instrumentationSpec,
    window.document
  );
  window.Tracktor = TracktorLib;

  when(this.loaded, this.ready);

  tracktor.start();
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Tracktor.prototype.loaded = function() {
  return window.Tracktor.instance.isInitialized();
};



},{"@segment/analytics.js-integration":1185,"@segment/tracktor":1221,"do-when":1301}],1121:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1122,"component-each":1283,"next-tick":1360}],1122:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1123,"./statics":1124,"@ndhoule/defaults":30,"component-bind":1277,"debug":1125,"dup":7,"extend":1127,"slug-component":1398}],1123:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1124:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],1125:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1126,"_process":1273,"dup":11}],1126:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1127:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],1128:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1129,"obj-case":1365,"use-https":1419}],1129:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1130,"./statics":1131,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1133,"dup":14,"slug-component":1398}],1130:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1132,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1131:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1132:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1133:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1134,"_process":1273,"dup":11}],1134:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1135:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1136,"do-when":1301,"reject":1382}],1136:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1137,"./statics":1138,"@ndhoule/defaults":30,"component-bind":1277,"debug":1139,"dup":7,"extend":1141,"slug-component":1398}],1137:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1138:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],1139:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1140,"_process":1273,"dup":11}],1140:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1141:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],1142:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1143}],1143:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1144,"./statics":1145,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1147,"dup":14,"slug-component":1398}],1144:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1146,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1145:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1146:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1147:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1148,"_process":1273,"dup":11}],1148:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1149:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/foldl":36,"@segment/analytics.js-integration":1150,"component-each":1283,"is":1321,"isostring":1323,"json3":1326,"to-snake-case":1409,"unix-time":1416}],1150:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1151,"./statics":1152,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1154,"dup":14,"slug-component":1398}],1151:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1153,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1152:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1153:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1154:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1155,"_process":1273,"dup":11}],1155:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1156:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/foldl":36,"@segment/analytics.js-integration":1185,"is":1321,"omit":1371}],1157:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1158,"component-bind":1277,"do-when":1301,"next-tick":1360}],1158:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1159,"./statics":1160,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1162,"dup":14,"slug-component":1398}],1159:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1161,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1160:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1161:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1162:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1163,"_process":1273,"dup":11}],1163:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1164:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@segment/analytics.js-integration":1165,"to-no-case":1408}],1165:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1166,"./statics":1167,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1169,"dup":14,"slug-component":1398}],1166:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1168,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1167:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1168:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1169:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1170,"_process":1273,"dup":11}],1170:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1171:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1172,"extend":1304,"reject":1382}],1172:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1173,"./statics":1174,"@ndhoule/defaults":30,"component-bind":1277,"debug":1176,"dup":7,"extend":1175,"slug-component":1398}],1173:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1174:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],1175:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],1176:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1177,"_process":1273,"dup":11}],1177:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1178:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1179,"@segment/fmt":1198,"do-when":1301,"reject":1382}],1179:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1180,"./statics":1181,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1183,"dup":14,"slug-component":1398}],1180:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1182,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1181:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1182:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1183:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1184,"_process":1273,"dup":11}],1184:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1185:[function(require,module,exports){

;
arguments[4][7][0].apply(exports,arguments)
;

},{"./protos":1186,"./statics":1187,"@ndhoule/defaults":30,"component-bind":1277,"debug":1188,"dup":7,"extend":1304,"slug-component":1398}],1186:[function(require,module,exports){

;
'use strict';

/**
 * Module dependencies.
 */

var Emitter = require('component-emitter');
var each = require('@ndhoule/each');
var events = require('analytics-events');
var every = require('@ndhoule/every');
var fmt = require('@segment/fmt');
var foldl = require('@ndhoule/foldl');
var is = require('is');
var loadIframe = require('load-iframe');
var loadScript = require('@segment/load-script');
var nextTick = require('next-tick');
var normalize = require('to-no-case');

/**
 * hasOwnProperty reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * No operation.
 */

var noop = function noop() {};

/**
 * Window defaults.
 */

var onerror = window.onerror;
var onload = null;

/**
 * Mixin emitter.
 */

/* eslint-disable new-cap */
Emitter(exports);
/* eslint-enable new-cap */

/**
 * Initialize.
 */

exports.initialize = function() {
  var ready = this.ready;
  nextTick(ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

exports.loaded = function() {
  return false;
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

/* eslint-disable no-unused-vars */
exports.page = function(page) {};
/* eslint-enable no-unused-vars */

/**
 * Track.
 *
 * @api public
 * @param {Track} track
 */

/* eslint-disable no-unused-vars */
exports.track = function(track) {};
/* eslint-enable no-unused-vars */

/**
 * Get values from items in `options` that are mapped to `key`.
 * `options` is an integration setting which is a collection
 * of type 'map', 'array', or 'mixed'
 *
 * Use cases include mapping events to pixelIds (map), sending generic
 * conversion pixels only for specific events (array), or configuring dynamic
 * mappings of event properties to query string parameters based on event (mixed)
 *
 * @api public
 * @param {Object|Object[]|String[]} options An object, array of objects, or
 * array of strings pulled from settings.mapping.
 * @param {string} key The name of the item in options whose metadata
 * we're looking for.
 * @return {Array} An array of settings that match the input `key` name.
 * @example
 *
 * // 'Map'
 * var events = { my_event: 'a4991b88' };
 * .map(events, 'My Event');
 * // => ["a4991b88"]
 * .map(events, 'whatever');
 * // => []
 *
 * // 'Array'
 * * var events = ['Completed Order', 'My Event'];
 * .map(events, 'My Event');
 * // => ["My Event"]
 * .map(events, 'whatever');
 * // => []
 *
 * // 'Mixed'
 * var events = [{ key: 'my event', value: '9b5eb1fa' }];
 * .map(events, 'my_event');
 * // => ["9b5eb1fa"]
 * .map(events, 'whatever');
 * // => []
 */

exports.map = function(options, key) {
  var normalizedComparator = normalize(key);
  var mappingType = getMappingType(options);

  if (mappingType === 'unknown') {
    return [];
  }

  return foldl(function(matchingValues, val, key) {
    var compare;
    var result;

    if (mappingType === 'map') {
      compare = key;
      result = val;
    }

    if (mappingType === 'array') {
      compare = val;
      result = val;
    }

    if (mappingType === 'mixed') {
      compare = val.key;
      result = val.value;
    }

    if (normalize(compare) === normalizedComparator) {
      matchingValues.push(result);
    }

    return matchingValues;
  }, [], options);
};

/**
 * Invoke a `method` that may or may not exist on the prototype with `args`,
 * queueing or not depending on whether the integration is "ready". Don't
 * trust the method call, since it contains integration party code.
 *
 * @api private
 * @param {string} method
 * @param {...*} args
 */

exports.invoke = function(method) {
  if (!this[method]) return;
  var args = Array.prototype.slice.call(arguments, 1);
  if (!this._ready) return this.queue(method, args);

  this.debug('%s with %o', method, args);
  return this[method].apply(this, args);
};

/**
 * Queue a `method` with `args`.
 *
 * @api private
 * @param {string} method
 * @param {Array} args
 */

exports.queue = function(method, args) {
  this._queue.push({ method: method, args: args });
};

/**
 * Flush the internal queue.
 *
 * @api private
 */

exports.flush = function() {
  this._ready = true;
  var self = this;

  each(function(call) {
    self[call.method].apply(self, call.args);
  }, this._queue);

  // Empty the queue.
  this._queue.length = 0;
};

/**
 * Reset the integration, removing its global variables.
 *
 * @api private
 */

exports.reset = function() {
  for (var i = 0; i < this.globals.length; i++) {
    window[this.globals[i]] = undefined;
  }

  window.onerror = onerror;
  window.onload = onload;
};

/**
 * Load a tag by `name`.
 *
 * @param {string} name The name of the tag.
 * @param {Object} locals Locals used to populate the tag's template variables
 * (e.g. `userId` in '<img src="https://whatever.com/{{ userId }}">').
 * @param {Function} [callback=noop] A callback, invoked when the tag finishes
 * loading.
 */

exports.load = function(name, locals, callback) {
  // Argument shuffling
  if (typeof name === 'function') { callback = name; locals = null; name = null; }
  if (name && typeof name === 'object') { callback = locals; locals = name; name = null; }
  if (typeof locals === 'function') { callback = locals; locals = null; }

  // Default arguments
  name = name || 'library';
  locals = locals || {};

  locals = this.locals(locals);
  var template = this.templates[name];
  if (!template) throw new Error(fmt('template "%s" not defined.', name));
  var attrs = render(template, locals);
  callback = callback || noop;
  var self = this;
  var el;

  switch (template.type) {
  case 'img':
    attrs.width = 1;
    attrs.height = 1;
    el = loadImage(attrs, callback);
    break;
  case 'script':
    el = loadScript(attrs, function(err) {
      if (!err) return callback();
      self.debug('error loading "%s" error="%s"', self.name, err);
    });
      // TODO: hack until refactoring load-script
    delete attrs.src;
    each(function(val, key) {
      el.setAttribute(key, val);
    }, attrs);
    break;
  case 'iframe':
    el = loadIframe(attrs, callback);
    break;
  default:
      // No default case
  }

  return el;
};

/**
 * Locals for tag templates.
 *
 * By default it includes a cache buster and all of the options.
 *
 * @param {Object} [locals]
 * @return {Object}
 */

exports.locals = function(locals) {
  locals = locals || {};
  var cache = Math.floor(new Date().getTime() / 3600000);
  if (!locals.hasOwnProperty('cache')) locals.cache = cache;
  each(function(val, key) {
    if (!locals.hasOwnProperty(key)) locals[key] = val;
  }, this.options);
  return locals;
};

/**
 * Simple way to emit ready.
 *
 * @api public
 */

exports.ready = function() {
  this.emit('ready');
};

/**
 * Wrap the initialize method in an exists check, so we don't have to do it for
 * every single integration.
 *
 * @api private
 */

exports._wrapInitialize = function() {
  var initialize = this.initialize;
  this.initialize = function() {
    this.debug('initialize');
    this._initialized = true;
    var ret = initialize.apply(this, arguments);
    this.emit('initialize');
    return ret;
  };
};

/**
 * Wrap the page method to call to noop the first page call if the integration assumes
 * a pageview.
 *
 * @api private
 */

exports._wrapPage = function() {
  var page = this.page;
  var initialPageSkipped = false;
  this.page = function() {
    if (this._assumesPageview && !initialPageSkipped) {
      initialPageSkipped = true;
      return;
    }
    return page.apply(this, arguments);
  };
};

/**
 * Wrap the track method to call other ecommerce methods if available depending
 * on the `track.event()`.
 *
 * @api private
 */

exports._wrapTrack = function() {
  var t = this.track;
  this.track = function(track) {
    var event = track.event();
    var called;
    var ret;

    for (var method in events) {
      if (has.call(events, method)) {
        var regexp = events[method];
        if (!this[method]) continue;
        if (!regexp.test(event)) continue;
        ret = this[method].apply(this, arguments);
        called = true;
        break;
      }
    }

    if (!called) ret = t.apply(this, arguments);
    return ret;
  };
};

/**
 * Determine the type of the option passed to `#map`
 *
 * @api private
 * @param {Object|Object[]} mapping
 * @return {String} mappingType
 */

function getMappingType(mapping) {
  if (is.array(mapping)) {
    return every(isMixed, mapping) ? 'mixed' : 'array';
  }
  if (is.object(mapping)) return 'map';
  return 'unknown';
}

/**
 * Determine if item in mapping array is a valid "mixed" type value
 *
 * Must be an object with properties "key" (of type string)
 * and "value" (of any type)
 *
 * @api private
 * @param {*} item
 * @return {Boolean}
 */

function isMixed(item) {
  if (!is.object(item)) return false;
  if (!is.string(item.key)) return false;
  if (!has.call(item, 'value')) return false;
  return true;
}

/**
 * TODO: Document me
 *
 * @api private
 * @param {Object} attrs
 * @param {Function} fn
 * @return {Image}
 */

function loadImage(attrs, fn) {
  fn = fn || function() {};
  var img = new Image();
  img.onerror = error(fn, 'failed to load pixel', img);
  img.onload = function() { fn(); };
  img.src = attrs.src;
  img.width = 1;
  img.height = 1;
  return img;
}

/**
 * TODO: Document me
 *
 * @api private
 * @param {Function} fn
 * @param {string} message
 * @param {Element} img
 * @return {Function}
 */

function error(fn, message, img) {
  return function(e) {
    e = e || window.event;
    var err = new Error(message);
    err.event = e;
    err.source = img;
    fn(err);
  };
}

/**
 * Render template + locals into an `attrs` object.
 *
 * @api private
 * @param {Object} template
 * @param {Object} locals
 * @return {Object}
 */

function render(template, locals) {
  return foldl(function(attrs, val, key) {
    attrs[key] = val.replace(/\{\{\ *(\w+)\ *\}\}/g, function(_, $1) {
      return locals[$1];
    });
    return attrs;
  }, {}, template.attrs);
}

;

},{"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1187:[function(require,module,exports){

;
arguments[4][9][0].apply(exports,arguments)
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],1188:[function(require,module,exports){

;
arguments[4][11][0].apply(exports,arguments)
;

},{"./debug":1189,"_process":1273,"dup":11}],1189:[function(require,module,exports){

;
arguments[4][12][0].apply(exports,arguments)
;

},{"dup":12,"ms":1355}],1190:[function(require,module,exports){


module.exports = function emptyMiddleware(chain) {
  chain.next(chain.payload)
}


},{"deep-equal":1299}],1191:[function(require,module,exports){


module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var index = typeof fetch=='function' ? fetch.bind() : function(url, options) {
	options = options || {};
	return new Promise( function (resolve, reject) {
		var request = new XMLHttpRequest();

		request.open(options.method || 'get', url, true);

		for (var i in options.headers) {
			request.setRequestHeader(i, options.headers[i]);
		}

		request.withCredentials = options.credentials=='include';

		request.onload = function () {
			resolve(response());
		};

		request.onerror = reject;

		request.send(options.body);

		function response() {
			var keys = [],
				all = [],
				headers = {},
				header;

			request.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm, function (m, key, value) {
				keys.push(key = key.toLowerCase());
				all.push([key, value]);
				header = headers[key];
				headers[key] = header ? (header + "," + value) : value;
			});

			return {
				ok: (request.status/100|0) == 2,		// 200-299
				status: request.status,
				statusText: request.statusText,
				url: request.responseURL,
				clone: response,
				text: function () { return Promise.resolve(request.responseText); },
				json: function () { return Promise.resolve(request.responseText).then(JSON.parse); },
				blob: function () { return Promise.resolve(new Blob([request.response])); },
				headers: {
					keys: function () { return keys; },
					entries: function () { return all; },
					get: function (n) { return headers[n.toLowerCase()]; },
					has: function (n) { return n.toLowerCase() in headers; }
				}
			};
		}
	});
};

/* harmony default export */ __webpack_exports__["default"] = (index);



/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VideoPlugin = function () {
  function VideoPlugin(name, version) {
    _classCallCheck(this, VideoPlugin);

    this.pluginName = name;
  }

  _createClass(VideoPlugin, [{
    key: "track",
    value: function track(event, properties) {
      window.analytics.track(event, properties, {
        integration: {
          name: this.pluginName
        }
      });
    }
  }]);

  return VideoPlugin;
}();

exports.default = VideoPlugin;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.YouTubeAnalytics = exports.VimeoAnalytics = undefined;

var _vimeo = __webpack_require__(3);

var _vimeo2 = _interopRequireDefault(_vimeo);

var _youtube = __webpack_require__(4);

var _youtube2 = _interopRequireDefault(_youtube);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.VimeoAnalytics = _vimeo2.default;
exports.YouTubeAnalytics = _youtube2.default;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _unfetch = __webpack_require__(0);

var _unfetch2 = _interopRequireDefault(_unfetch);

var _plugin = __webpack_require__(1);

var _plugin2 = _interopRequireDefault(_plugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VimeoAnalytics = function (_Plugin) {
  _inherits(VimeoAnalytics, _Plugin);

  function VimeoAnalytics(player, authToken) {
    _classCallCheck(this, VimeoAnalytics);

    var _this = _possibleConstructorReturn(this, (VimeoAnalytics.__proto__ || Object.getPrototypeOf(VimeoAnalytics)).call(this, "VimeoAnalytics"));

    _this.authToken = authToken;
    _this.player = player;
    _this.metadata = {
      content: {},
      playback: { videoPlayer: "Vimeo" }
    };
    _this.mostRecentHeartbeat = 0;
    _this.isPaused = false;
    return _this;
  }

  _createClass(VimeoAnalytics, [{
    key: "initialize",
    value: function initialize() {
      var _this2 = this;

      var events = {
        loaded: this.retrieveMetadata,
        play: this.trackPlay,
        pause: this.trackPause,
        ended: this.trackEnded,
        timeupdate: this.trackHeartbeat
      };

      for (var event in events) {
        this.registerHandler(event, events[event]);
      }

      this.player.getVideoId().then(function (id) {
        _this2.retrieveMetadata({ id: id });
      }).catch(console.error);
    }

    // This is a helper function used to facilitate easier testing.

  }, {
    key: "registerHandler",
    value: function registerHandler(event, handler) {
      var _this3 = this;

      this.player.on(event, function (data) {
        _this3.updateMetadata(data);
        handler.call(_this3, data);
      });
    }
  }, {
    key: "trackPlay",
    value: function trackPlay() {
      if (this.isPaused) {
        this.track("Video Playback Resumed", this.metadata.playback);
        this.isPaused = false;
      } else {
        this.track("Video Playback Started", this.metadata.playback);
        this.track("Video Content Started", this.metadata.content);
      }
    }
  }, {
    key: "trackEnded",
    value: function trackEnded() {
      this.track("Video Playback Completed", this.metadata.playback);
      this.track("Video Content Completed", this.metadata.content);
    }

    // Vimeo provides time updates every 250ms while Segment documents sending heartbeats every 10s.
    // Therefore, we need to do some math to ensure we are not sending 4 heartbeat events when we reach
    // 10 second intervals.

  }, {
    key: "trackHeartbeat",
    value: function trackHeartbeat() {
      var mostRecentHeartbeat = this.mostRecentHeartbeat;
      var currentPosition = this.metadata.playback.position;
      if (currentPosition !== mostRecentHeartbeat && currentPosition - mostRecentHeartbeat >= 10) {
        this.track("Video Content Playing", this.metadata.content);
        this.mostRecentHeartbeat = Math.floor(currentPosition);
      }
    }
  }, {
    key: "trackPause",
    value: function trackPause() {
      this.isPaused = true;
      this.track("Video Playback Paused", this.metadata.playback);
    }

    // retrieve static video metadata from vimeo API

  }, {
    key: "retrieveMetadata",
    value: function retrieveMetadata(data) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        var videoId = data.id;
        (0, _unfetch2.default)("https://api.vimeo.com/videos/" + videoId, {
          headers: {
            Authorization: "Bearer " + _this4.authToken
          }
        }).then(function (res) {
          if (res.ok) {
            return res.json();
          }
          return reject(res);
        }).then(function (json) {
          _this4.metadata.content.title = json.name;
          _this4.metadata.content.description = json.description;
          _this4.metadata.content.publisher = json.user.name;

          _this4.metadata.playback.position = 0;
          _this4.metadata.playback.totalLength = json.duration;
        }).catch(function (err) {
          console.error("Request to Vimeo API Failed with: ", err);
          return reject(err);
        });
      });
    }

    // update dynamic video information

  }, {
    key: "updateMetadata",
    value: function updateMetadata(data) {
      var _this5 = this;

      return new Promise(function (resolve, reject) {
        _this5.player.getVolume().then(function (volume) {
          if (volume) _this5.metadata.playback.sound = volume * 100;
          _this5.metadata.playback.position = data.seconds;
          resolve();
        }).catch(reject);
      });
    }
  }]);

  return VimeoAnalytics;
}(_plugin2.default);

exports.default = VimeoAnalytics;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _unfetch = __webpack_require__(0);

var _unfetch2 = _interopRequireDefault(_unfetch);

var _plugin = __webpack_require__(1);

var _plugin2 = _interopRequireDefault(_plugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SEEK_THRESHOLD = 2000;

var YouTubeAnalytics = function (_VideoPlugin) {
  _inherits(YouTubeAnalytics, _VideoPlugin);

  /**
   * Creates a YouTube video plugin to track events directly from the player.
   *
   * @param {YT.Player} player YouTube IFrame Player (docs: https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player).
   * @param {String} apiKey Youtube Data API key (docs: https://developers.google.com/youtube/registering_an_application).
   */
  function YouTubeAnalytics(player, apiKey) {
    _classCallCheck(this, YouTubeAnalytics);

    var _this = _possibleConstructorReturn(this, (YouTubeAnalytics.__proto__ || Object.getPrototypeOf(YouTubeAnalytics)).call(this, "YoutubeAnalytics"));

    _this.player = player;
    _this.apiKey = apiKey;
    _this.playerLoaded = false;
    _this.playbackStarted = false;
    _this.contentStarted = false;
    _this.isPaused = false;
    _this.isBuffering = false;
    _this.isSeeking = false;
    _this.lastRecordedTime = {
      // updated every event
      timeReported: Date.now(),
      timeElapsed: 0.0
    };
    _this.metadata = [{ playback: { video_player: "youtube" }, content: {} }];
    _this.playlistIndex = 0;
    return _this;
  }

  _createClass(YouTubeAnalytics, [{
    key: "initialize",
    value: function initialize() {
      // Youtube API requires listeners to exist as top-level props on window object
      window.segmentYoutubeOnStateChange = this.onPlayerStateChange.bind(this);
      window.segmentYoutubeOnReady = this.onPlayerReady.bind(this);

      this.player.addEventListener("onReady", "segmentYoutubeOnReady");
      this.player.addEventListener("onStateChange", "segmentYoutubeOnStateChange");
    }
  }, {
    key: "onPlayerReady",
    value: function onPlayerReady(event) {
      // this fires when the player html element loads
      this.retrieveMetadata();
    }

    // yt reports events via state changes in the player rather than explicitly EVENTS like 'play', 'pause', etc

  }, {
    key: "onPlayerStateChange",
    value: function onPlayerStateChange(event) {
      var currentTime = this.player.getCurrentTime();
      if (this.metadata[this.playlistIndex]) {
        this.metadata[this.playlistIndex].playback.position = this.metadata[this.playlistIndex].content.position = currentTime;
        this.metadata[this.playlistIndex].playback.quality = this.player.getPlaybackQuality();
        this.metadata[this.playlistIndex].playback.sound = this.player.isMuted() ? 0 : this.player.getVolume();
      }

      switch (event.data) {
        case -1:
          // this fires when a video or playlist has loaded
          if (this.playerLoaded) break;
          this.retrieveMetadata();
          this.playerLoaded = true;
          break;

        case YT.PlayerState.BUFFERING:
          this.handleBuffer();
          break;

        case YT.PlayerState.PLAYING:
          this.handlePlay();
          break;

        case YT.PlayerState.PAUSED:
          this.handlePause();
          break;

        case YT.PlayerState.ENDED:
          this.handleEnd();
          break;
      }

      this.lastRecordedTime = {
        timeReported: Date.now(),
        timeElapsed: this.player.getCurrentTime() * 1000.0
      };
    }

    /**
     * Retrieves the video metadata from Youtube Data API using user's API Key
     * docs: https://developers.google.com/youtube/v3/docs/videos/list
     *
     * @returns {Promise} A promise that resolves in a metadata object from the video
     * contained in the player.
     */

  }, {
    key: "retrieveMetadata",
    value: function retrieveMetadata() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var videoData = _this2.player.getVideoData();
        var playlist = _this2.player.getPlaylist() || [videoData.video_id];

        var videoIds = playlist.join();

        (0, _unfetch2.default)("https://www.googleapis.com/youtube/v3/videos?id=" + videoIds + "&part=snippet,contentDetails&key=" + _this2.apiKey).then(function (res) {
          if (!res.ok) {
            var err = new Error("Segment request to Youtube API failed (likely due to a bad API Key. Events will still be sent but will not contain video metadata)");
            err.response = res;
            throw err;
          }
          return res.json();
        }).then(function (json) {
          _this2.metadata = [];
          var total_length = 0;
          for (var i = 0; i < playlist.length; i++) {
            var videoInfo = json.items[i];
            _this2.metadata.push({
              content: {
                title: videoInfo.snippet.title,
                description: videoInfo.snippet.description,
                keywords: videoInfo.snippet.tags,
                channel: videoInfo.snippet.channelTitle,
                airdate: videoInfo.snippet.publishedAt
              }
            });
            total_length += YTDurationToSeconds(videoInfo.contentDetails.duration);
          }

          for (var i = 0; i < playlist.length; i++) {
            _this2.metadata[i].playback = {
              total_length: total_length,
              video_player: "youtube"
            };
          }
          resolve();
        }).catch(function (err) {
          _this2.metadata = playlist.map(function (item) {
            return { playback: { video_player: "youtube" }, content: {} };
          });
          reject(err);
        });
      });
    }
  }, {
    key: "handleBuffer",
    value: function handleBuffer() {
      var seekDetected = this.determineSeek();

      if (!this.playbackStarted) {
        this.playbackStarted = true;
        this.track("Video Playback Started", this.metadata[this.playlistIndex].playback);
      }

      // user used keyboard to seek or seeked while video was paused
      if (seekDetected && !this.isSeeking) {
        this.isSeeking = true;
        this.track("Video Playback Seek Started", this.metadata[this.playlistIndex].playback);
      }

      // state changing to BUFFERING denotes seeking has completed
      if (this.isSeeking) {
        this.track("Video Playback Seek Completed", this.metadata[this.playlistIndex].playback);
        this.isSeeking = false;
      }

      // user clicked next video button (not possible in single video playback)
      var playlist = this.player.getPlaylist();
      if (playlist && this.player.getCurrentTime() === 0 && this.player.getPlaylistIndex() !== this.playlistIndex) {
        this.contentStarted = false;
        if (this.playlistIndex === playlist.length - 1 && this.player.getPlaylistIndex() === 0) {
          // user skipped to end of last video in playlist
          this.track("Video Playback Completed", this.metadata[this.player.getPlaylistIndex()].playback);
          this.track("Video Playback Started", this.metadata[this.player.getPlaylistIndex()].playback); // playlist automatically starts from beginning
        }
      }

      this.track("Video Playback Buffer Started", this.metadata[this.playlistIndex].playback);
      this.isBuffering = true;
    }
  }, {
    key: "handlePlay",
    value: function handlePlay() {
      if (!this.contentStarted) {
        this.playlistIndex = this.player.getPlaylistIndex(); // will return -1 if the player has a singular video instead of a playlist
        if (this.playlistIndex === -1) this.playlistIndex = 0;
        this.track("Video Content Started", this.metadata[this.playlistIndex].content);
        this.contentStarted = true;
      }

      if (this.isBuffering) {
        this.track("Video Playback Buffer Completed", this.metadata[this.playlistIndex].playback);
        this.isBuffering = false;
      }

      if (this.isPaused) {
        this.track("Video Playback Resumed", this.metadata[this.playlistIndex].playback);
        this.isPaused = false;
      }
    }
  }, {
    key: "handlePause",
    value: function handlePause() {
      var seekDetected = this.determineSeek();
      // user seeked while video was paused, it buffered, and then finished buffering
      if (this.isBuffering) {
        this.track("Video Playback Buffer Completed", this.metadata[this.playlistIndex].playback);
        this.isBuffering = false;
      }

      if (!this.isPaused) {
        // user seeked while video was playing
        if (seekDetected) {
          this.track("Video Playback Seek Started", this.metadata[this.playlistIndex].playback);
          this.isSeeking = true;
        }
        // user clicked pause while video was playing
        else {
            this.track("Video Playback Paused", this.metadata[this.playlistIndex].playback);
            this.isPaused = true;
          }
      }
    }
  }, {
    key: "handleEnd",
    value: function handleEnd() {
      this.track("Video Content Completed", this.metadata[this.playlistIndex].content);
      this.contentStarted = false;

      var playlistIndex = this.player.getPlaylistIndex();
      var playlist = this.player.getPlaylist();

      if (playlist && playlistIndex === playlist.length - 1 || playlistIndex === -1) {
        this.track("Video Playback Completed", this.metadata[this.playlistIndex].playback);
        this.playbackStarted = false;
      }
    }

    // yt doesn't natively track seeking so we have to manually calculate whether a seek has occurred based on expected vs actual event timestamps

  }, {
    key: "determineSeek",
    value: function determineSeek() {
      var expectedTimeElapsed = this.isPaused || this.isBuffering ? 0 : Date.now() - this.lastRecordedTime.timeReported;
      var actualTimeElapsed = this.player.getCurrentTime() * 1000.0 - this.lastRecordedTime.timeElapsed;

      return Math.abs(expectedTimeElapsed - actualTimeElapsed) > SEEK_THRESHOLD; // if the diff btwn the 2 is > the threshold we can reasonably assume a seek has occurred
    }
  }]);

  return YouTubeAnalytics;
}(_plugin2.default);

// convert from ISO 8601 to seconds


exports.default = YouTubeAnalytics;
function YTDurationToSeconds(duration) {
  var match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  match = match.slice(1).map(function (x) {
    if (x != null) {
      return x.replace(/\D/, "");
    }
  });

  var hours = parseInt(match[0]) || 0;
  var minutes = parseInt(match[1]) || 0;
  var seconds = parseInt(match[2]) || 0;

  return hours * 3600 + minutes * 60 + seconds;
}

/***/ })
/******/ ]);


},{}],1192:[function(require,module,exports){
var utf8Encode = require('utf8-encode');
var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

module.exports = encode;
function encode(input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = utf8Encode(input);

    while (i < input.length) {

        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
            keyStr.charAt(enc1) + keyStr.charAt(enc2) +
            keyStr.charAt(enc3) + keyStr.charAt(enc4);

    }

    return output;
}
},{"utf8-encode":1420}],1193:[function(require,module,exports){
'use strict';

/**
 * Get the current page's canonical URL.
 *
 * @return {string|undefined}
 */
function canonical() {
  var tags = document.getElementsByTagName('link');
  // eslint-disable-next-line no-cond-assign
  for (var i = 0, tag; tag = tags[i]; i++) {
    if (tag.getAttribute('rel') === 'canonical') {
      return tag.getAttribute('href');
    }
  }
}

/*
 * Exports.
 */

module.exports = canonical;

},{}],1194:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/clone":29,"@ndhoule/each":32,"component-type":1291}],1195:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var debug = require('debug')('cookie');

/**
 * Set or get cookie `name` with `value` and `options` object.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @return {Mixed}
 * @api public
 */

module.exports = function(name, value, options) {
  switch (arguments.length) {
    case 3:
    case 2:
      return set(name, value, options);
    case 1:
      return get(name);
    default:
      return all();
  }
};

/**
 * Set cookie `name` to `value`.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @api private
 */

function set(name, value, options) {
  options = options || {};
  var str = encode(name) + '=' + encode(value);

  if (value == null) options.maxage = -1;

  if (options.maxage) {
    options.expires = new Date(+new Date() + options.maxage);
  }

  if (options.path) str += '; path=' + options.path;
  if (options.domain) str += '; domain=' + options.domain;
  if (options.expires) str += '; expires=' + options.expires.toUTCString();
  if (options.sameSite) str += '; SameSite=' + options.sameSite;
  if (options.secure) str += '; secure';

  document.cookie = str;
}

/**
 * Return all cookies.
 *
 * @return {Object}
 * @api private
 */

function all() {
  var str;
  try {
    str = document.cookie;
  } catch (err) {
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error(err.stack || err);
    }
    return {};
  }
  return parse(str);
}

/**
 * Get cookie `name`.
 *
 * @param {String} name
 * @return {String}
 * @api private
 */

function get(name) {
  return all()[name];
}

/**
 * Parse cookie `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parse(str) {
  var obj = {};
  var pairs = str.split(/ *; */);
  var pair;
  if (pairs[0] == '') return obj; // eslint-disable-line eqeqeq
  for (var i = 0; i < pairs.length; ++i) {
    pair = pairs[i].split('=');
    obj[decode(pair[0])] = decode(pair[1]);
  }
  return obj;
}

/**
 * Encode.
 */

function encode(value) {
  try {
    return encodeURIComponent(value);
  } catch (e) {
    debug('error `encode(%o)` - %o', value, e);
  }
}

/**
 * Decode.
 */

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    debug('error `decode(%o)` - %o', value, e);
  }
}

},{"debug":1196}],1196:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"./debug":1197,"_process":1273,"dup":11}],1197:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"dup":12,"ms":1355}],1198:[function(require,module,exports){

;
(function (global){
'use strict';

// Stringifier
var toString = global.JSON && typeof JSON.stringify === 'function' ? JSON.stringify : String;

/**
 * Format the given `str`.
 *
 * @param {string} str
 * @param {...*} [args]
 * @return {string}
 */
function fmt(str) {
  var args = Array.prototype.slice.call(arguments, 1);
  var j = 0;

  return str.replace(/%([a-z])/gi, function(match, f) {
    return fmt[f] ? fmt[f](args[j++]) : match + f;
  });
}

// Formatters
fmt.o = toString;
fmt.s = String;
fmt.d = parseInt;

/*
 * Exports.
 */

module.exports = fmt;

}).call(this,typeof window !== "undefined" && window.document && window.document.implementation ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {})
;

},{}],1199:[function(require,module,exports){
'use strict';

function isMeta(e) {
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
    return true;
  }

  // Logic that handles checks for the middle mouse button, based
  // on [jQuery](https://github.com/jquery/jquery/blob/master/src/event.js#L466).
  var which = e.which;
  var button = e.button;
  if (!which && button !== undefined) {
    // eslint-disable-next-line no-bitwise, no-extra-parens
    return (!button & 1) && (!button & 2) && (button & 4);
  } else if (which === 2) {
    return true;
  }

  return false;
}

/*
 * Exports.
 */

module.exports = isMeta;

},{}],1200:[function(require,module,exports){
'use strict';

var type = require('component-type');
var each = require('component-each');
var isodate = require('@segment/isodate');

/**
 * Expose `traverse`.
 */

module.exports = traverse;

/**
 * Traverse an object or array, and return a clone with all ISO strings parsed
 * into Date objects.
 *
 * @param {Object} obj
 * @return {Object}
 */

function traverse(input, strict) {
  if (strict === undefined) strict = true;

  if (type(input) === 'object') return object(input, strict);
  if (type(input) === 'array') return array(input, strict);
  return input;
}

/**
 * Object traverser.
 *
 * @param {Object} obj
 * @param {Boolean} strict
 * @return {Object}
 */

function object(obj, strict) {
  // 'each' utility uses obj.length to check whether the obj is array. To avoid incorrect classification, wrap call to 'each' with rename of obj.length
  if (obj.length && typeof obj.length === 'number' && !(obj.length - 1 in obj)) { // cross browser compatible way of checking has length and is not array
    obj.lengthNonArray = obj.length;
    delete obj.length;
  }
  each(obj, function(key, val) {
    if (isodate.is(val, strict)) {
      obj[key] = isodate.parse(val);
    } else if (type(val) === 'object' || type(val) === 'array') {
      traverse(val, strict);
    }
  });
  // restore obj.length if it was renamed
  if (obj.lengthNonArray) {
    obj.length = obj.lengthNonArray;
    delete obj.lengthNonArray;
  }
  return obj;
}

/**
 * Array traverser.
 *
 * @param {Array} arr
 * @param {Boolean} strict
 * @return {Array}
 */

function array(arr, strict) {
  each(arr, function(val, x) {
    if (type(val) === 'object') {
      traverse(val, strict);
    } else if (isodate.is(val, strict)) {
      arr[x] = isodate.parse(val);
    }
  });
  return arr;
}

},{"@segment/isodate":1201,"component-each":1283,"component-type":1291}],1201:[function(require,module,exports){
'use strict';

/**
 * Matcher, slightly modified from:
 *
 * https://github.com/csnover/js-iso8601/blob/lax/iso8601.js
 */

var matcher = /^(\d{4})(?:-?(\d{2})(?:-?(\d{2}))?)?(?:([ T])(\d{2}):?(\d{2})(?::?(\d{2})(?:[,\.](\d{1,}))?)?(?:(Z)|([+\-])(\d{2})(?::?(\d{2}))?)?)?$/;

/**
 * Convert an ISO date string to a date. Fallback to native `Date.parse`.
 *
 * https://github.com/csnover/js-iso8601/blob/lax/iso8601.js
 *
 * @param {String} iso
 * @return {Date}
 */

exports.parse = function(iso) {
  var numericKeys = [1, 5, 6, 7, 11, 12];
  var arr = matcher.exec(iso);
  var offset = 0;

  // fallback to native parsing
  if (!arr) {
    return new Date(iso);
  }

  /* eslint-disable no-cond-assign */
  // remove undefined values
  for (var i = 0, val; val = numericKeys[i]; i++) {
    arr[val] = parseInt(arr[val], 10) || 0;
  }
  /* eslint-enable no-cond-assign */

  // allow undefined days and months
  arr[2] = parseInt(arr[2], 10) || 1;
  arr[3] = parseInt(arr[3], 10) || 1;

  // month is 0-11
  arr[2]--;

  // allow abitrary sub-second precision
  arr[8] = arr[8] ? (arr[8] + '00').substring(0, 3) : 0;

  // apply timezone if one exists
  if (arr[4] === ' ') {
    offset = new Date().getTimezoneOffset();
  } else if (arr[9] !== 'Z' && arr[10]) {
    offset = arr[11] * 60 + arr[12];
    if (arr[10] === '+') {
      offset = 0 - offset;
    }
  }

  var millis = Date.UTC(arr[1], arr[2], arr[3], arr[5], arr[6] + offset, arr[7], arr[8]);
  return new Date(millis);
};


/**
 * Checks whether a `string` is an ISO date string. `strict` mode requires that
 * the date string at least have a year, month and date.
 *
 * @param {String} string
 * @param {Boolean} strict
 * @return {Boolean}
 */

exports.is = function(string, strict) {
  if (typeof string !== 'string') {
    return false;
  }
  if (strict && (/^\d{4}-\d{2}-\d{2}/).test(string) === false) {
    return false;
  }
  return matcher.test(string);
};

},{}],1202:[function(require,module,exports){

;
'use strict';

/*
 * Module dependencies.
 */

var onload = require('script-onload');
var tick = require('next-tick');
var type = require('component-type');

/**
 * Loads a script asynchronously.
 *
 * @param {Object} options
 * @param {Function} cb
 */
function loadScript(options, cb) {
  if (!options) {
    throw new Error('Can\'t load nothing...');
  }

  // Allow for the simplest case, just passing a `src` string.
  if (type(options) === 'string') {
    options = { src : options };
  }

  var https = document.location.protocol === 'https:' || document.location.protocol === 'chrome-extension:';

  // If you use protocol relative URLs, third-party scripts like Google
  // Analytics break when testing with `file:` so this fixes that.
  if (options.src && options.src.indexOf('//') === 0) {
    options.src = (https ? 'https:' : 'http:') + options.src;
  }

  // Allow them to pass in different URLs depending on the protocol.
  if (https && options.https) {
    options.src = options.https;
  } else if (!https && options.http) {
    options.src = options.http;
  }

  // Make the `<script>` element and insert it before the first script on the
  // page, which is guaranteed to exist since this Javascript is running.
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = options.src;

  // If we have a cb, attach event handlers. Does not work on < IE9 because
  // older browser versions don't register element.onerror
  if (type(cb) === 'function') {
    onload(script, cb);
  }

  tick(function() {
    // Append after event listeners are attached for IE.
    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  });

  // Return the script element in case they want to do anything special, like
  // give it an ID or attributes.
  return script;
}

/*
 * Exports.
 */

module.exports = loadScript;

;

},{"component-type":1291,"next-tick":1360,"script-onload":1383}],1203:[function(require,module,exports){

;
'use strict';

var keys = require('@ndhoule/keys');
var uuid = require('uuid').v4;

var inMemoryStore = {
  _data: {},
  length: 0,
  setItem: function(key, value) {
    this._data[key] = value;
    this.length = keys(this._data).length;
    return value;
  },
  getItem: function(key) {
    if (key in this._data) {
      return this._data[key];
    }
    return null;
  },
  removeItem: function(key) {
    if (key in this._data) {
      delete this._data[key];
    }
    this.length = keys(this._data).length;
    return null;
  },
  clear: function() {
    this._data = {};
    this.length = 0;
  },
  key: function(index) {
    return keys(this._data)[index];
  }
};

function isSupportedNatively() {
  try {
    if (!window.localStorage) return false;
    var key = uuid();
    window.localStorage.setItem(key, 'test_value');
    var value = window.localStorage.getItem(key);
    window.localStorage.removeItem(key);

    // handle localStorage silently failing
    return value === 'test_value';
  } catch (e) {
    // Can throw if localStorage is disabled
    return false;
  }
}

function pickStorage() {
  if (isSupportedNatively()) {
    return window.localStorage;
  }
  // fall back to in-memory
  return inMemoryStore;
}

// Return a shared instance
module.exports.defaultEngine = pickStorage();
// Expose the in-memory store explicitly for testing
module.exports.inMemoryEngine = inMemoryStore;

;

},{"@ndhoule/keys":38,"uuid":1424}],1204:[function(require,module,exports){

;
'use strict';

var uuid = require('uuid').v4;
var Store = require('./store');
var each = require('@ndhoule/each');
var Schedule = require('./schedule');
var debug = require('debug')('localstorage-retry');
var Emitter = require('component-emitter');

// Some browsers don't support Function.prototype.bind, so just including a simplified version here
function bind(func, obj) {
  return function() {
    return func.apply(obj, arguments);
  };
}

/**
 * @callback processFunc
 * @param {Mixed} item The item added to the queue to process
 * @param {Function} done A function to call when processing is completed.
 *   @param {Error} Optional error parameter if the processing failed
 *   @param {Response} Optional response parameter to emit for async handling
 */

/**
 * Constructs a Queue backed by localStorage
 *
 * @constructor
 * @param {String} name The name of the queue. Will be used to find abandoned queues and retry their items
 * @param {processFunc} fn The function to call in order to process an item added to the queue
 */
function Queue(name, opts, fn) {
  if (typeof opts === 'function') fn = opts;
  this.name = name;
  this.id = uuid();
  this.fn = fn;
  this.maxItems = opts.maxItems || Infinity;
  this.maxAttempts = opts.maxAttempts || Infinity;

  this.backoff = {
    MIN_RETRY_DELAY: opts.minRetryDelay || 1000,
    MAX_RETRY_DELAY: opts.maxRetryDelay || 30000,
    FACTOR: opts.backoffFactor || 2,
    JITTER: opts.backoffJitter || 0
  };

  // painstakingly tuned. that's why they're not "easily" configurable
  this.timeouts = {
    ACK_TIMER: 1000,
    RECLAIM_TIMER: 3000,
    RECLAIM_TIMEOUT: 10000,
    RECLAIM_WAIT: 500
  };

  this.keys = {
    IN_PROGRESS: 'inProgress',
    QUEUE: 'queue',
    ACK: 'ack',
    RECLAIM_START: 'reclaimStart',
    RECLAIM_END: 'reclaimEnd'
  };

  this._schedule = new Schedule();
  this._processId = 0;

  // Set up our empty queues
  this._store = new Store(this.name, this.id, this.keys);
  this._store.set(this.keys.IN_PROGRESS, {});
  this._store.set(this.keys.QUEUE, []);

  // bind recurring tasks for ease of use
  this._ack = bind(this._ack, this);
  this._checkReclaim = bind(this._checkReclaim, this);
  this._processHead = bind(this._processHead, this);

  this._running = false;
}

/**
 * Mix in event emitter
 */

Emitter(Queue.prototype);

/**
 * Starts processing the queue
 */
Queue.prototype.start = function() {
  if (this._running) {
    this.stop();
  }
  this._running = true;
  this._ack();
  this._checkReclaim();
  this._processHead();
};

/**
 * Stops processing the queue
 */
Queue.prototype.stop = function() {
  this._schedule.cancelAll();
  this._running = false;
};

/**
 * Decides whether to retry. Overridable.
 *
 * @param {Object} item The item being processed
 * @param {Number} attemptNumber The attemptNumber (1 for first retry)
 * @param {Error} error The error from previous attempt, if there was one
 * @return {Boolean} Whether to requeue the message
 */
Queue.prototype.shouldRetry = function(_, attemptNumber) {
  if (attemptNumber > this.maxAttempts) return false;
  return true;
};

/**
 * Calculates the delay (in ms) for a retry attempt
 *
 * @param {Number} attemptNumber The attemptNumber (1 for first retry)
 * @return {Number} The delay in milliseconds to wait before attempting a retry
 */
Queue.prototype.getDelay = function(attemptNumber) {
  var ms = this.backoff.MIN_RETRY_DELAY * Math.pow(this.backoff.FACTOR, attemptNumber);
  if (this.backoff.JITTER) {
    var rand =  Math.random();
    var deviation = Math.floor(rand * this.backoff.JITTER * ms);
    if (Math.floor(rand * 10) < 5) {
      ms -= deviation;
    } else {
      ms += deviation;
    }
  }
  return Number(Math.min(ms, this.backoff.MAX_RETRY_DELAY).toPrecision(1));
};

/**
 * Adds an item to the queue
 *
 * @param {Mixed} item The item to process
 */
Queue.prototype.addItem = function(item) {
  this._enqueue({
    item: item,
    attemptNumber: 0,
    time: this._schedule.now()
  });
};

/**
 * Adds an item to the retry queue
 *
 * @param {Mixed} item The item to retry
 * @param {Number} attemptNumber The attempt number (1 for first retry)
 * @param {Error} [error] The error from previous attempt, if there was one
 */
Queue.prototype.requeue = function(item, attemptNumber, error) {
  if (this.shouldRetry(item, attemptNumber, error)) {
    this._enqueue({
      item: item,
      attemptNumber: attemptNumber,
      time: this._schedule.now() + this.getDelay(attemptNumber)
    });
  } else {
    this.emit('discard', item, attemptNumber);
  }
};

Queue.prototype._enqueue = function(entry) {
  var queue = this._store.get(this.keys.QUEUE) || [];
  queue = queue.slice(-(this.maxItems - 1));
  queue.push(entry);
  queue = queue.sort(function(a,b) {
    return a.time - b.time;
  });

  this._store.set(this.keys.QUEUE, queue);

  if (this._running) {
    this._processHead();
  }
};

Queue.prototype._processHead = function() {
  var self = this;
  var store = this._store;

  // cancel the scheduled task if it exists
  this._schedule.cancel(this._processId);

  // Pop the head off the queue
  var queue = store.get(this.keys.QUEUE) || [];
  var inProgress = store.get(this.keys.IN_PROGRESS) || {};
  var now = this._schedule.now();
  var toRun = [];

  function enqueue(el, id) {
    toRun.push({
      item: el.item,
      done: function handle(err, res) {
        var inProgress = store.get(self.keys.IN_PROGRESS) || {};
        delete inProgress[id];
        store.set(self.keys.IN_PROGRESS, inProgress);
        self.emit('processed', err, res, el.item);
        if (err) {
          self.requeue(el.item, el.attemptNumber + 1, err);
        }
      }
    });
  }

  var inProgressSize = Object.keys(inProgress).length;

  while (queue.length && queue[0].time <= now && inProgressSize++ < self.maxItems) {
    var el = queue.shift();
    var id = uuid();

    // Save this to the in progress map
    inProgress[id] = {
      item: el.item,
      attemptNumber: el.attemptNumber,
      time: self._schedule.now()
    };

    enqueue(el, id);
  }

  store.set(this.keys.QUEUE, queue);
  store.set(this.keys.IN_PROGRESS, inProgress);

  each(function(el) {
    // TODO: handle fn timeout
    try {
      self.fn(el.item, el.done);
    } catch (err) {
      debug('Process function threw error: ' + err);
    }
  }, toRun);

  // re-read the queue in case the process function finished immediately or added another item
  queue = store.get(this.keys.QUEUE) || [];
  this._schedule.cancel(this._processId);
  if (queue.length > 0) {
    this._processId = this._schedule.run(this._processHead, queue[0].time - now);
  }
};

// Ack continuously to prevent other tabs from claiming our queue
Queue.prototype._ack = function() {
  this._store.set(this.keys.ACK, this._schedule.now());
  this._store.set(this.keys.RECLAIM_START, null);
  this._store.set(this.keys.RECLAIM_END, null);
  this._schedule.run(this._ack, this.timeouts.ACK_TIMER);
};

Queue.prototype._checkReclaim = function() {
  var self = this;

  function tryReclaim(store) {
    store.set(self.keys.RECLAIM_START, self.id);
    store.set(self.keys.ACK, self._schedule.now());

    self._schedule.run(function() {
      if (store.get(self.keys.RECLAIM_START) !== self.id) return;
      store.set(self.keys.RECLAIM_END, self.id);

      self._schedule.run(function() {
        if (store.get(self.keys.RECLAIM_END) !== self.id) return;
        if (store.get(self.keys.RECLAIM_START) !== self.id) return;
        self._reclaim(store.id);
      }, self.timeouts.RECLAIM_WAIT);
    }, self.timeouts.RECLAIM_WAIT);
  }

  function findOtherQueues(name) {
    var res = [];
    var storage = self._store.engine;
    for (var i = 0; i < storage.length; i++) {
      var k = storage.key(i);
      var parts = k.split('.');
      if (parts.length !== 3) continue;
      if (parts[0] !== name) continue;
      if (parts[2] !== 'ack') continue;
      res.push(new Store(name, parts[1], self.keys));
    }
    return res;
  }

  each(function(store) {
    if (store.id === self.id) return;
    if (self._schedule.now() - store.get(self.keys.ACK) < self.timeouts.RECLAIM_TIMEOUT) return;
    tryReclaim(store);
  }, findOtherQueues(this.name));

  this._schedule.run(this._checkReclaim, this.timeouts.RECLAIM_TIMER);
};

Queue.prototype._reclaim = function(id) {
  var self = this;
  var other = new Store(this.name, id, this.keys);

  var our = {
    queue: this._store.get(this.keys.QUEUE) || []
  };

  var their = {
    inProgress: other.get(this.keys.IN_PROGRESS) || {},
    queue: other.get(this.keys.QUEUE) || []
  };

  // add their queue to ours, resetting run-time to immediate and copying the attempt#
  each(function(el) {
    our.queue.push({
      item: el.item,
      attemptNumber: el.attemptNumber,
      time: self._schedule.now()
    });
  }, their.queue);

  // if the queue is abandoned, all the in-progress are failed. retry them immediately and increment the attempt#
  each(function(el) {
    our.queue.push({
      item: el.item,
      attemptNumber: el.attemptNumber + 1,
      time: self._schedule.now()
    });
  }, their.inProgress);

  our.queue = our.queue.sort(function(a,b) {
    return a.time - b.time;
  });

  this._store.set(this.keys.QUEUE, our.queue);

  // remove all keys
  other.remove(this.keys.ACK);
  other.remove(this.keys.RECLAIM_START);
  other.remove(this.keys.RECLAIM_END);
  other.remove(this.keys.IN_PROGRESS);
  other.remove(this.keys.QUEUE);

  // process the new items we claimed
  this._processHead();
};

module.exports = Queue;

;

},{"./schedule":1205,"./store":1206,"@ndhoule/each":32,"component-emitter":1285,"debug":1207,"uuid":1424}],1205:[function(require,module,exports){

;
'use strict';

var each = require('@ndhoule/each');

var defaultClock = {
  setTimeout: function(fn, ms) {
    return window.setTimeout(fn, ms);
  },
  clearTimeout: function(id) {
    return window.clearTimeout(id);
  },
  Date: window.Date
};

var clock = defaultClock;

function Schedule() {
  this.tasks = {};
  this.nextId = 1;
}

Schedule.prototype.now = function() {
  return +new clock.Date();
};

Schedule.prototype.run = function(task, timeout) {
  var id = this.nextId++;
  this.tasks[id] = clock.setTimeout(this._handle(id, task), timeout);
  return id;
};

Schedule.prototype.cancel = function(id) {
  if (this.tasks[id]) {
    clock.clearTimeout(this.tasks[id]);
    delete this.tasks[id];
  }
};

Schedule.prototype.cancelAll = function() {
  each(clock.clearTimeout, this.tasks);
  this.tasks = {};
};

Schedule.prototype._handle = function(id, callback) {
  var self = this;
  return function() {
    delete self.tasks[id];
    return callback();
  };
};

Schedule.setClock = function(newClock) {
  clock = newClock;
};

Schedule.resetClock = function() {
  clock = defaultClock;
};

module.exports = Schedule;

;

},{"@ndhoule/each":32}],1206:[function(require,module,exports){

;
'use strict';

var defaultEngine = require('./engine').defaultEngine;
var inMemoryEngine = require('./engine').inMemoryEngine;
var each = require('@ndhoule/each');
var keys = require('@ndhoule/keys');
var json = require('json3');

/**
* Store Implementation with dedicated
*/

function Store(name, id, keys, optionalEngine) {
  this.id = id;
  this.name = name;
  this.keys = keys || {};
  this.engine = optionalEngine || defaultEngine;
}

/**
* Set value by key.
*/

Store.prototype.set = function(key, value) {
  var compoundKey = this._createValidKey(key);
  if (!compoundKey) return;
  try {
    this.engine.setItem(compoundKey, json.stringify(value));
  } catch (err) {
    if (isQuotaExceeded(err)) {
      // switch to inMemory engine
      this._swapEngine();
      // and save it there
      this.set(key, value);
    }
  }
};

/**
* Get by Key.
*/

Store.prototype.get = function(key) {
  try {
    var str = this.engine.getItem(this._createValidKey(key));
    if (str === null) {
      return null;
    }
    return json.parse(str);
  } catch (err) {
    return null;
  }
};

/**
* Remove by Key.
*/

Store.prototype.remove = function(key) {
  this.engine.removeItem(this._createValidKey(key));
};

/**
* Ensure the key is valid
*/

Store.prototype._createValidKey = function(key) {
  var name = this.name;
  var id = this.id;

  if (!keys(this.keys).length) return [name, id, key].join('.');

  // validate and return undefined if invalid key
  var compoundKey;
  each(function(value) {
    if (value === key) {
      compoundKey = [name, id, key].join('.');
    }
  }, this.keys);
  return compoundKey;
};

/**
* Switch to inMemoryEngine, bringing any existing data with.
*/

Store.prototype._swapEngine = function() {
  var self = this;

  // grab existing data, but only for this page's queue instance, not all
  // better to keep other queues in localstorage to be flushed later
  // than to pull them into memory and remove them from durable storage
  each(function(key) {
    var value = self.get(key);
    inMemoryEngine.setItem([self.name, self.id, key].join('.'), value);
    self.remove(key);
  }, this.keys);

  this.engine = inMemoryEngine;
};

module.exports = Store;

function isQuotaExceeded(e) {
  var quotaExceeded = false;
  if (e.code) {
    switch (e.code) {
    case 22:
      quotaExceeded = true;
      break;
    case 1014:
      // Firefox
      if (e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        quotaExceeded = true;
      }
      break;
    default:
      break;
    }
  } else if (e.number === -2147024882) {
    // Internet Explorer 8
    quotaExceeded = true;
  }
  return quotaExceeded;
}

;

},{"./engine":1203,"@ndhoule/each":32,"@ndhoule/keys":38,"json3":1326}],1207:[function(require,module,exports){

;

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}

;

},{}],1208:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1209,"./statics":1210,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1212,"dup":14,"slug-component":1398}],1209:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1211,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1210:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1211:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1212:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1213,"_process":1273,"dup":11}],1213:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1214:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1208,"@segment/send-json":1217}],1215:[function(require,module,exports){
'use strict';

/**
 * Prevent default on a given event.
 *
 * @param {Event} e
 * @example
 * anchor.onclick = prevent;
 * anchor.onclick = function(e){
 *   if (something) return prevent(e);
 * };
 */

function preventDefault(e) {
  e = e || window.event;
  return e.preventDefault ? e.preventDefault() : e.returnValue = false;
}

/*
 * Exports.
 */

module.exports = preventDefault;

},{}],1216:[function(require,module,exports){

;
'use strict';

/**
 * Convenience alias
 */

var define = Object.defineProperty;


/**
 *  The base protocol
 */

var initialProtocol = window.location.protocol;

/**
 * Fallback mocked protocol in case Object.defineProperty doesn't exist.
 */

var mockedProtocol;


module.exports = function(protocol) {
  if (arguments.length === 0) {
    return get();
  }
  return set(protocol);
};


/**
 * Sets the protocol to be http:
 */

module.exports.http = function() {
  set('http:');
};


/**
 * Sets the protocol to be https:
 */

module.exports.https = function() {
  set('https:');
};


/**
 * Reset to the initial protocol.
 */

module.exports.reset = function() {
  set(initialProtocol);
};


/**
 * Gets the current protocol, using the fallback and then the native protocol.
 *
 * @return {String} protocol
 */

function get() {
  return mockedProtocol || window.location.protocol;
}


/**
 * Sets the protocol
 *
 * @param {String} protocol
 */

function set(protocol) {
  try {
    define(window.location, 'protocol', {
      get: function() { return protocol; }
    });
  } catch (err) {
    mockedProtocol = protocol;
  }
}

;

},{}],1217:[function(require,module,exports){
'use strict';

/*
 * Module dependencies.
 */

var JSON = require('json3');
var base64encode = require('@segment/base64-encode');
var cors = require('has-cors');
var jsonp = require('jsonp');

/*
 * Exports.
 */

exports = module.exports = cors ? json : base64;

/**
 * Expose `callback`
 */

exports.callback = 'callback';

/**
 * Expose `prefix`
 */

exports.prefix = 'data';

/**
 * Expose `json`.
 */

exports.json = json;

/**
 * Expose `base64`.
 */

exports.base64 = base64;

/**
 * Expose `type`
 */

exports.type = cors ? 'xhr' : 'jsonp';

/**
 * Send the given `obj` to `url` with `fn(err, req)`.
 *
 * @param {String} url
 * @param {Object} obj
 * @param {Object} headers
 * @param {Function} fn
 * @api private
 */

function json(url, obj, headers, fn) {
  if (arguments.length === 3) fn = headers, headers = {};

  var req = new XMLHttpRequest;
  req.onerror = fn;
  req.onreadystatechange = done;
  req.open('POST', url, true);

  // TODO: Remove this eslint disable
  // eslint-disable-next-line guard-for-in
  for (var k in headers) {
    req.setRequestHeader(k, headers[k]);
  }
  req.send(JSON.stringify(obj));

  function done() {
    if (req.readyState === 4) {
      return fn(null, req);
    }
  }
}

/**
 * Send the given `obj` to `url` with `fn(err, req)`.
 *
 * @param {String} url
 * @param {Object} obj
 * @param {Function} fn
 * @api private
 */

function base64(url, obj, _, fn) {
  if (arguments.length === 3) fn = _;

  var prefix = exports.prefix;
  var data = encode(obj);
  url += '?' + prefix + '=' + data;
  jsonp(url, { param: exports.callback }, function(err, obj) {
    if (err) return fn(err);
    fn(null, {
      url: url,
      body: obj
    });
  });
}

/**
 * Encodes `obj`.
 *
 * @param {Object} obj
 */

function encode(obj) {
  var str = '';
  str = JSON.stringify(obj);
  str = base64encode(str);
  str = str.replace(/\+/g, '-').replace(/\//g, '_');
  return encodeURIComponent(str);
}

},{"@segment/base64-encode":1192,"has-cors":1310,"json3":1326,"jsonp":1327}],1218:[function(require,module,exports){
(function (global){
"use strict"

var JSON = require('json3');

module.exports = (function() {
	// Store.js
	var store = {},
		win = (typeof window != 'undefined' ? window : global),
		doc = win.document,
		localStorageName = 'localStorage',
		scriptTag = 'script',
		storage

	store.disabled = false
	store.version = '1.3.20'
	store.set = function(key, value) {}
	store.get = function(key, defaultVal) {}
	store.has = function(key) { return store.get(key) !== undefined }
	store.remove = function(key) {}
	store.clear = function() {}
	store.transact = function(key, defaultVal, transactionFn) {
		if (transactionFn == null) {
			transactionFn = defaultVal
			defaultVal = null
		}
		if (defaultVal == null) {
			defaultVal = {}
		}
		var val = store.get(key, defaultVal)
		transactionFn(val)
		store.set(key, val)
	}
	store.getAll = function() {
		var ret = {}
		store.forEach(function(key, val) {
			ret[key] = val
		})
		return ret
	}
	store.forEach = function() {}
	store.serialize = function(value) {
		return JSON.stringify(value)
	}
	store.deserialize = function(value) {
		if (typeof value != 'string') { return undefined }
		try { return JSON.parse(value) }
		catch(e) { return value || undefined }
	}

	// Functions to encapsulate questionable FireFox 3.6.13 behavior
	// when about.config::dom.storage.enabled === false
	// See https://github.com/marcuswestin/store.js/issues#issue/13
	function isLocalStorageNameSupported() {
		try { return (localStorageName in win && win[localStorageName]) }
		catch(err) { return false }
	}

	if (isLocalStorageNameSupported()) {
		storage = win[localStorageName]
		store.set = function(key, val) {
			if (val === undefined) { return store.remove(key) }
			storage.setItem(key, store.serialize(val))
			return val
		}
		store.get = function(key, defaultVal) {
			var val = store.deserialize(storage.getItem(key))
			return (val === undefined ? defaultVal : val)
		}
		store.remove = function(key) { storage.removeItem(key) }
		store.clear = function() { storage.clear() }
		store.forEach = function(callback) {
			for (var i=0; i<storage.length; i++) {
				var key = storage.key(i)
				callback(key, store.get(key))
			}
		}
	} else if (doc && doc.documentElement.addBehavior) {
		var storageOwner,
			storageContainer
		// Since #userData storage applies only to specific paths, we need to
		// somehow link our data to a specific path.  We choose /favicon.ico
		// as a pretty safe option, since all browsers already make a request to
		// this URL anyway and being a 404 will not hurt us here.  We wrap an
		// iframe pointing to the favicon in an ActiveXObject(htmlfile) object
		// (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
		// since the iframe access rules appear to allow direct access and
		// manipulation of the document element, even for a 404 page.  This
		// document can be used instead of the current document (which would
		// have been limited to the current path) to perform #userData storage.
		try {
			storageContainer = new ActiveXObject('htmlfile')
			storageContainer.open()
			storageContainer.write('<'+scriptTag+'>document.w=window</'+scriptTag+'><iframe src="/favicon.ico"></iframe>')
			storageContainer.close()
			storageOwner = storageContainer.w.frames[0].document
			storage = storageOwner.createElement('div')
		} catch(e) {
			// somehow ActiveXObject instantiation failed (perhaps some special
			// security settings or otherwse), fall back to per-path storage
			storage = doc.createElement('div')
			storageOwner = doc.body
		}
		var withIEStorage = function(storeFunction) {
			return function() {
				var args = Array.prototype.slice.call(arguments, 0)
				args.unshift(storage)
				// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
				// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
				storageOwner.appendChild(storage)
				storage.addBehavior('#default#userData')
				storage.load(localStorageName)
				var result = storeFunction.apply(store, args)
				storageOwner.removeChild(storage)
				return result
			}
		}

		// In IE7, keys cannot start with a digit or contain certain chars.
		// See https://github.com/marcuswestin/store.js/issues/40
		// See https://github.com/marcuswestin/store.js/issues/83
		var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g")
		var ieKeyFix = function(key) {
			return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___')
		}
		store.set = withIEStorage(function(storage, key, val) {
			key = ieKeyFix(key)
			if (val === undefined) { return store.remove(key) }
			storage.setAttribute(key, store.serialize(val))
			storage.save(localStorageName)
			return val
		})
		store.get = withIEStorage(function(storage, key, defaultVal) {
			key = ieKeyFix(key)
			var val = store.deserialize(storage.getAttribute(key))
			return (val === undefined ? defaultVal : val)
		})
		store.remove = withIEStorage(function(storage, key) {
			key = ieKeyFix(key)
			storage.removeAttribute(key)
			storage.save(localStorageName)
		})
		store.clear = withIEStorage(function(storage) {
			var attributes = storage.XMLDocument.documentElement.attributes
			storage.load(localStorageName)
			for (var i=attributes.length-1; i>=0; i--) {
				storage.removeAttribute(attributes[i].name)
			}
			storage.save(localStorageName)
		})
		store.forEach = withIEStorage(function(storage, callback) {
			var attributes = storage.XMLDocument.documentElement.attributes
			for (var i=0, attr; attr=attributes[i]; ++i) {
				callback(attr.name, store.deserialize(storage.getAttribute(attr.name)))
			}
		})
	}

	try {
		var testKey = '__storejs__'
		store.set(testKey, testKey)
		if (store.get(testKey) != testKey) { store.disabled = true }
		store.remove(testKey)
	} catch(e) {
		store.disabled = true
	}
	store.enabled = !store.disabled
	
	return store
}())

}).call(this,typeof window !== "undefined" && window.document && window.document.implementation ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {})
},{"json3":1326}],1219:[function(require,module,exports){


module.exports = function() {};
;

},{}],1220:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var parse = require('component-url').parse;
var cookie = require('component-cookie');

/**
 * Get the top domain.
 *
 * The function constructs the levels of domain and attempts to set a global
 * cookie on each one when it succeeds it returns the top level domain.
 *
 * The method returns an empty string when the hostname is an ip or `localhost`.
 *
 * Example levels:
 *
 *      domain.levels('http://www.google.co.uk');
 *      // => ["co.uk", "google.co.uk", "www.google.co.uk"]
 *
 * Example:
 *
 *      domain('http://localhost:3000/baz');
 *      // => ''
 *      domain('http://dev:3000/baz');
 *      // => ''
 *      domain('http://127.0.0.1:3000/baz');
 *      // => ''
 *      domain('http://segment.io/baz');
 *      // => 'segment.io'
 *
 * @param {string} url
 * @return {string}
 * @api public
 */
function domain(url) {
  var cookie = exports.cookie;
  var levels = exports.levels(url);

  // Lookup the real top level one.
  for (var i = 0; i < levels.length; ++i) {
    var cname = '__tld__';
    var domain = levels[i];
    var opts = { domain: '.' + domain };

    cookie(cname, 1, opts);
    if (cookie(cname)) {
      cookie(cname, null, opts);
      return domain;
    }
  }

  return '';
}

/**
 * Levels returns all levels of the given url.
 *
 * @param {string} url
 * @return {Array}
 * @api public
 */
domain.levels = function(url) {
  var host = parse(url).hostname;
  var parts = host.split('.');
  var last = parts[parts.length - 1];
  var levels = [];

  // Ip address.
  if (parts.length === 4 && last === parseInt(last, 10)) {
    return levels;
  }

  // Localhost.
  if (parts.length <= 1) {
    return levels;
  }

  // Create levels.
  for (var i = parts.length - 2; i >= 0; --i) {
    levels.push(parts.slice(i).join('.'));
  }

  return levels;
};

/**
 * Expose cookie on domain.
 */
domain.cookie = cookie;

/*
 * Exports.
 */

exports = module.exports = domain;

},{"component-cookie":1279,"component-url":1292}],1221:[function(require,module,exports){

;
!function(t,e){if("object"==typeof exports&&"object"==typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n=e();for(var r in n)("object"==typeof exports?exports:t)[r]=n[r]}}(window,(function(){return function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=102)}([function(t,e,n){var r=n(22)("wks"),o=n(18),i=n(1).Symbol,u="function"==typeof i;(t.exports=function(t){return r[t]||(r[t]=u&&i[t]||(u?i:o)("Symbol."+t))}).store=r},function(t,e){var n=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=n)},function(t,e,n){var r=n(6);t.exports=function(t){if(!r(t))throw TypeError(t+" is not an object!");return t}},function(t,e,n){var r=n(1),o=n(9),i=n(10),u=n(7),c=n(13),a=function(t,e,n){var s,f,l,p,h=t&a.F,d=t&a.G,y=t&a.S,v=t&a.P,m=t&a.B,g=d?r:y?r[e]||(r[e]={}):(r[e]||{}).prototype,b=d?o:o[e]||(o[e]={}),w=b.prototype||(b.prototype={});for(s in d&&(n=e),n)l=((f=!h&&g&&void 0!==g[s])?g:n)[s],p=m&&f?c(l,r):v&&"function"==typeof l?c(Function.call,l):l,g&&u(g,s,l,t&a.U),b[s]!=l&&i(b,s,p),v&&w[s]!=l&&(w[s]=l)};r.core=o,a.F=1,a.G=2,a.S=4,a.P=8,a.B=16,a.W=32,a.U=64,a.R=128,t.exports=a},function(t,e,n){t.exports=!n(11)((function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a}))},function(t,e,n){var r=n(2),o=n(40),i=n(30),u=Object.defineProperty;e.f=n(4)?Object.defineProperty:function(t,e,n){if(r(t),e=i(e,!0),r(n),o)try{return u(t,e,n)}catch(t){}if("get"in n||"set"in n)throw TypeError("Accessors not supported!");return"value"in n&&(t[e]=n.value),t}},function(t,e){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},function(t,e,n){var r=n(1),o=n(10),i=n(12),u=n(18)("src"),c=n(60),a=(""+c).split("toString");n(9).inspectSource=function(t){return c.call(t)},(t.exports=function(t,e,n,c){var s="function"==typeof n;s&&(i(n,"name")||o(n,"name",e)),t[e]!==n&&(s&&(i(n,u)||o(n,u,t[e]?""+t[e]:a.join(String(e)))),t===r?t[e]=n:c?t[e]?t[e]=n:o(t,e,n):(delete t[e],o(t,e,n)))})(Function.prototype,"toString",(function(){return"function"==typeof this&&this[u]||c.call(this)}))},function(t,e,n){var r=n(63),o=n(21);t.exports=function(t){return r(o(t))}},function(t,e){var n=t.exports={version:"2.6.10"};"number"==typeof __e&&(__e=n)},function(t,e,n){var r=n(5),o=n(17);t.exports=n(4)?function(t,e,n){return r.f(t,e,o(1,n))}:function(t,e,n){return t[e]=n,t}},function(t,e){t.exports=function(t){try{return!!t()}catch(t){return!0}}},function(t,e){var n={}.hasOwnProperty;t.exports=function(t,e){return n.call(t,e)}},function(t,e,n){var r=n(23);t.exports=function(t,e,n){if(r(t),void 0===e)return t;switch(n){case 1:return function(n){return t.call(e,n)};case 2:return function(n,r){return t.call(e,n,r)};case 3:return function(n,r,o){return t.call(e,n,r,o)}}return function(){return t.apply(e,arguments)}}},function(t,e,n){var r=n(42),o=n(32);t.exports=Object.keys||function(t){return r(t,o)}},function(t,e){var n={}.toString;t.exports=function(t){return n.call(t).slice(8,-1)}},function(t,e){t.exports=!1},function(t,e){t.exports=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}}},function(t,e){var n=0,r=Math.random();t.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++n+r).toString(36))}},function(t,e){t.exports={}},function(t,e,n){var r=n(28),o=Math.min;t.exports=function(t){return t>0?o(r(t),9007199254740991):0}},function(t,e){t.exports=function(t){if(null==t)throw TypeError("Can't call method on  "+t);return t}},function(t,e,n){var r=n(9),o=n(1),i=o["__core-js_shared__"]||(o["__core-js_shared__"]={});(t.exports=function(t,e){return i[t]||(i[t]=void 0!==e?e:{})})("versions",[]).push({version:r.version,mode:n(16)?"pure":"global",copyright:"© 2019 Denis Pushkarev (zloirock.ru)"})},function(t,e){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},function(t,e,n){var r=n(5).f,o=n(12),i=n(0)("toStringTag");t.exports=function(t,e,n){t&&!o(t=n?t:t.prototype,i)&&r(t,i,{configurable:!0,value:e})}},function(t,e,n){var r=n(21);t.exports=function(t){return Object(r(t))}},function(t,e,n){var r=n(42),o=n(32).concat("length","prototype");e.f=Object.getOwnPropertyNames||function(t){return r(t,o)}},function(t,e){e.f={}.propertyIsEnumerable},function(t,e){var n=Math.ceil,r=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?r:n)(t)}},function(t,e,n){var r=n(6),o=n(1).document,i=r(o)&&r(o.createElement);t.exports=function(t){return i?o.createElement(t):{}}},function(t,e,n){var r=n(6);t.exports=function(t,e){if(!r(t))return t;var n,o;if(e&&"function"==typeof(n=t.toString)&&!r(o=n.call(t)))return o;if("function"==typeof(n=t.valueOf)&&!r(o=n.call(t)))return o;if(!e&&"function"==typeof(n=t.toString)&&!r(o=n.call(t)))return o;throw TypeError("Can't convert object to primitive value")}},function(t,e,n){var r=n(22)("keys"),o=n(18);t.exports=function(t){return r[t]||(r[t]=o(t))}},function(t,e){t.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},function(t,e,n){var r=n(15),o=n(0)("toStringTag"),i="Arguments"==r(function(){return arguments}());t.exports=function(t){var e,n,u;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(n=function(t,e){try{return t[e]}catch(t){}}(e=Object(t),o))?n:i?r(e):"Object"==(u=r(e))&&"function"==typeof e.callee?"Arguments":u}},function(t,e){e.f=Object.getOwnPropertySymbols},function(t,e,n){var r=n(27),o=n(17),i=n(8),u=n(30),c=n(12),a=n(40),s=Object.getOwnPropertyDescriptor;e.f=n(4)?s:function(t,e){if(t=i(t),e=u(e,!0),a)try{return s(t,e)}catch(t){}if(c(t,e))return o(!r.f.call(t,e),t[e])}},function(t,e,n){"use strict";var r=n(2);t.exports=function(){var t=r(this),e="";return t.global&&(e+="g"),t.ignoreCase&&(e+="i"),t.multiline&&(e+="m"),t.unicode&&(e+="u"),t.sticky&&(e+="y"),e}},function(t,e,n){var r=n(50),o=n(21);t.exports=function(t,e,n){if(r(e))throw TypeError("String#"+n+" doesn't accept regex!");return String(o(t))}},function(t,e,n){var r=n(0)("match");t.exports=function(t){var e=/./;try{"/./"[t](e)}catch(n){try{return e[r]=!1,!"/./"[t](e)}catch(t){}}return!0}},function(t,e,n){"use strict";var r=n(16),o=n(3),i=n(7),u=n(10),c=n(19),a=n(61),s=n(24),f=n(65),l=n(0)("iterator"),p=!([].keys&&"next"in[].keys()),h=function(){return this};t.exports=function(t,e,n,d,y,v,m){a(n,e,d);var g,b,w,x=function(t){if(!p&&t in j)return j[t];switch(t){case"keys":case"values":return function(){return new n(this,t)}}return function(){return new n(this,t)}},S=e+" Iterator",_="values"==y,O=!1,j=t.prototype,E=j[l]||j["@@iterator"]||y&&j[y],P=E||x(y),T=y?_?x("entries"):P:void 0,A="Array"==e&&j.entries||E;if(A&&(w=f(A.call(new t)))!==Object.prototype&&w.next&&(s(w,S,!0),r||"function"==typeof w[l]||u(w,l,h)),_&&E&&"values"!==E.name&&(O=!0,P=function(){return E.call(this)}),r&&!m||!p&&!O&&j[l]||u(j,l,P),c[e]=P,c[S]=h,y)if(g={values:_?P:x("values"),keys:v?P:x("keys"),entries:T},m)for(b in g)b in j||i(j,b,g[b]);else o(o.P+o.F*(p||O),e,g);return g}},function(t,e,n){t.exports=!n(4)&&!n(11)((function(){return 7!=Object.defineProperty(n(29)("div"),"a",{get:function(){return 7}}).a}))},function(t,e,n){var r=n(2),o=n(62),i=n(32),u=n(31)("IE_PROTO"),c=function(){},a=function(){var t,e=n(29)("iframe"),r=i.length;for(e.style.display="none",n(44).appendChild(e),e.src="javascript:",(t=e.contentWindow.document).open(),t.write("<script>document.F=Object<\/script>"),t.close(),a=t.F;r--;)delete a.prototype[i[r]];return a()};t.exports=Object.create||function(t,e){var n;return null!==t?(c.prototype=r(t),n=new c,c.prototype=null,n[u]=t):n=a(),void 0===e?n:o(n,e)}},function(t,e,n){var r=n(12),o=n(8),i=n(43)(!1),u=n(31)("IE_PROTO");t.exports=function(t,e){var n,c=o(t),a=0,s=[];for(n in c)n!=u&&r(c,n)&&s.push(n);for(;e.length>a;)r(c,n=e[a++])&&(~i(s,n)||s.push(n));return s}},function(t,e,n){var r=n(8),o=n(20),i=n(64);t.exports=function(t){return function(e,n,u){var c,a=r(e),s=o(a.length),f=i(u,s);if(t&&n!=n){for(;s>f;)if((c=a[f++])!=c)return!0}else for(;s>f;f++)if((t||f in a)&&a[f]===n)return t||f||0;return!t&&-1}}},function(t,e,n){var r=n(1).document;t.exports=r&&r.documentElement},function(t,e,n){var r=n(2);t.exports=function(t,e,n,o){try{return o?e(r(n)[0],n[1]):e(n)}catch(e){var i=t.return;throw void 0!==i&&r(i.call(t)),e}}},function(t,e,n){var r=n(19),o=n(0)("iterator"),i=Array.prototype;t.exports=function(t){return void 0!==t&&(r.Array===t||i[o]===t)}},function(t,e,n){"use strict";var r=n(5),o=n(17);t.exports=function(t,e,n){e in t?r.f(t,e,o(0,n)):t[e]=n}},function(t,e,n){var r=n(33),o=n(0)("iterator"),i=n(19);t.exports=n(9).getIteratorMethod=function(t){if(null!=t)return t[o]||t["@@iterator"]||i[r(t)]}},function(t,e,n){var r=n(0)("iterator"),o=!1;try{var i=[7][r]();i.return=function(){o=!0},Array.from(i,(function(){throw 2}))}catch(t){}t.exports=function(t,e){if(!e&&!o)return!1;var n=!1;try{var i=[7],u=i[r]();u.next=function(){return{done:n=!0}},i[r]=function(){return u},t(i)}catch(t){}return n}},function(t,e,n){var r=n(6),o=n(15),i=n(0)("match");t.exports=function(t){var e;return r(t)&&(void 0!==(e=t[i])?!!e:"RegExp"==o(t))}},function(t,e,n){"use strict";var r=n(1),o=n(5),i=n(4),u=n(0)("species");t.exports=function(t){var e=r[t];i&&e&&!e[u]&&o.f(e,u,{configurable:!0,get:function(){return this}})}},function(t,e,n){var r=n(0)("unscopables"),o=Array.prototype;null==o[r]&&n(10)(o,r,{}),t.exports=function(t){o[r][t]=!0}},function(t,e,n){var r=n(1),o=n(9),i=n(16),u=n(54),c=n(5).f;t.exports=function(t){var e=o.Symbol||(o.Symbol=i?{}:r.Symbol||{});"_"==t.charAt(0)||t in e||c(e,t,{value:u.f(t)})}},function(t,e,n){e.f=n(0)},function(t,e,n){"use strict";var r=n(52),o=n(87),i=n(19),u=n(8);t.exports=n(39)(Array,"Array",(function(t,e){this._t=u(t),this._i=0,this._k=e}),(function(){var t=this._t,e=this._k,n=this._i++;return!t||n>=t.length?(this._t=void 0,o(1)):o(0,"keys"==e?n:"values"==e?t[n]:[n,t[n]])}),"values"),i.Arguments=i.Array,r("keys"),r("values"),r("entries")},function(t,e,n){var r,o,i,u=n(13),c=n(94),a=n(44),s=n(29),f=n(1),l=f.process,p=f.setImmediate,h=f.clearImmediate,d=f.MessageChannel,y=f.Dispatch,v=0,m={},g=function(){var t=+this;if(m.hasOwnProperty(t)){var e=m[t];delete m[t],e()}},b=function(t){g.call(t.data)};p&&h||(p=function(t){for(var e=[],n=1;arguments.length>n;)e.push(arguments[n++]);return m[++v]=function(){c("function"==typeof t?t:Function(t),e)},r(v),v},h=function(t){delete m[t]},"process"==n(15)(l)?r=function(t){l.nextTick(u(g,t,1))}:y&&y.now?r=function(t){y.now(u(g,t,1))}:d?(i=(o=new d).port2,o.port1.onmessage=b,r=u(i.postMessage,i,1)):f.addEventListener&&"function"==typeof postMessage&&!f.importScripts?(r=function(t){f.postMessage(t+"","*")},f.addEventListener("message",b,!1)):r="onreadystatechange"in s("script")?function(t){a.appendChild(s("script")).onreadystatechange=function(){a.removeChild(this),g.call(t)}}:function(t){setTimeout(u(g,t,1),0)}),t.exports={set:p,clear:h}},function(t,e,n){"use strict";var r=n(23);function o(t){var e,n;this.promise=new t((function(t,r){if(void 0!==e||void 0!==n)throw TypeError("Bad Promise constructor");e=t,n=r})),this.resolve=r(e),this.reject=r(n)}t.exports.f=function(t){return new o(t)}},function(t,e,n){"use strict";var r=n(59)(!0);n(39)(String,"String",(function(t){this._t=String(t),this._i=0}),(function(){var t,e=this._t,n=this._i;return n>=e.length?{value:void 0,done:!0}:(t=r(e,n),this._i+=t.length,{value:t,done:!1})}))},function(t,e,n){var r=n(28),o=n(21);t.exports=function(t){return function(e,n){var i,u,c=String(o(e)),a=r(n),s=c.length;return a<0||a>=s?t?"":void 0:(i=c.charCodeAt(a))<55296||i>56319||a+1===s||(u=c.charCodeAt(a+1))<56320||u>57343?t?c.charAt(a):i:t?c.slice(a,a+2):u-56320+(i-55296<<10)+65536}}},function(t,e,n){t.exports=n(22)("native-function-to-string",Function.toString)},function(t,e,n){"use strict";var r=n(41),o=n(17),i=n(24),u={};n(10)(u,n(0)("iterator"),(function(){return this})),t.exports=function(t,e,n){t.prototype=r(u,{next:o(1,n)}),i(t,e+" Iterator")}},function(t,e,n){var r=n(5),o=n(2),i=n(14);t.exports=n(4)?Object.defineProperties:function(t,e){o(t);for(var n,u=i(e),c=u.length,a=0;c>a;)r.f(t,n=u[a++],e[n]);return t}},function(t,e,n){var r=n(15);t.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==r(t)?t.split(""):Object(t)}},function(t,e,n){var r=n(28),o=Math.max,i=Math.min;t.exports=function(t,e){return(t=r(t))<0?o(t+e,0):i(t,e)}},function(t,e,n){var r=n(12),o=n(25),i=n(31)("IE_PROTO"),u=Object.prototype;t.exports=Object.getPrototypeOf||function(t){return t=o(t),r(t,i)?t[i]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?u:null}},function(t,e,n){"use strict";var r=n(13),o=n(3),i=n(25),u=n(45),c=n(46),a=n(20),s=n(47),f=n(48);o(o.S+o.F*!n(49)((function(t){Array.from(t)})),"Array",{from:function(t){var e,n,o,l,p=i(t),h="function"==typeof this?this:Array,d=arguments.length,y=d>1?arguments[1]:void 0,v=void 0!==y,m=0,g=f(p);if(v&&(y=r(y,d>2?arguments[2]:void 0,2)),null==g||h==Array&&c(g))for(n=new h(e=a(p.length));e>m;m++)s(n,m,v?y(p[m],m):p[m]);else for(l=g.call(p),n=new h;!(o=l.next()).done;m++)s(n,m,v?u(l,y,[o.value,m],!0):o.value);return n.length=m,n}})},function(t,e,n){var r=n(3),o=n(68),i=n(8),u=n(35),c=n(47);r(r.S,"Object",{getOwnPropertyDescriptors:function(t){for(var e,n,r=i(t),a=u.f,s=o(r),f={},l=0;s.length>l;)void 0!==(n=a(r,e=s[l++]))&&c(f,e,n);return f}})},function(t,e,n){var r=n(26),o=n(34),i=n(2),u=n(1).Reflect;t.exports=u&&u.ownKeys||function(t){var e=r.f(i(t)),n=o.f;return n?e.concat(n(t)):e}},function(t,e,n){var r=n(25),o=n(14);n(70)("keys",(function(){return function(t){return o(r(t))}}))},function(t,e,n){var r=n(3),o=n(9),i=n(11);t.exports=function(t,e){var n=(o.Object||{})[t]||Object[t],u={};u[t]=e(n),r(r.S+r.F*i((function(){n(1)})),"Object",u)}},function(t,e,n){"use strict";n(72);var r=n(2),o=n(36),i=n(4),u=/./.toString,c=function(t){n(7)(RegExp.prototype,"toString",t,!0)};n(11)((function(){return"/a/b"!=u.call({source:"a",flags:"b"})}))?c((function(){var t=r(this);return"/".concat(t.source,"/","flags"in t?t.flags:!i&&t instanceof RegExp?o.call(t):void 0)})):"toString"!=u.name&&c((function(){return u.call(this)}))},function(t,e,n){n(4)&&"g"!=/./g.flags&&n(5).f(RegExp.prototype,"flags",{configurable:!0,get:n(36)})},function(t,e,n){var r=n(1),o=n(74),i=n(5).f,u=n(26).f,c=n(50),a=n(36),s=r.RegExp,f=s,l=s.prototype,p=/a/g,h=/a/g,d=new s(p)!==p;if(n(4)&&(!d||n(11)((function(){return h[n(0)("match")]=!1,s(p)!=p||s(h)==h||"/a/i"!=s(p,"i")})))){s=function(t,e){var n=this instanceof s,r=c(t),i=void 0===e;return!n&&r&&t.constructor===s&&i?t:o(d?new f(r&&!i?t.source:t,e):f((r=t instanceof s)?t.source:t,r&&i?a.call(t):e),n?this:l,s)};for(var y=function(t){t in s||i(s,t,{configurable:!0,get:function(){return f[t]},set:function(e){f[t]=e}})},v=u(f),m=0;v.length>m;)y(v[m++]);l.constructor=s,s.prototype=l,n(7)(r,"RegExp",s)}n(51)("RegExp")},function(t,e,n){var r=n(6),o=n(75).set;t.exports=function(t,e,n){var i,u=e.constructor;return u!==n&&"function"==typeof u&&(i=u.prototype)!==n.prototype&&r(i)&&o&&o(t,i),t}},function(t,e,n){var r=n(6),o=n(2),i=function(t,e){if(o(t),!r(e)&&null!==e)throw TypeError(e+": can't set as prototype!")};t.exports={set:Object.setPrototypeOf||("__proto__"in{}?function(t,e,r){try{(r=n(13)(Function.call,n(35).f(Object.prototype,"__proto__").set,2))(t,[]),e=!(t instanceof Array)}catch(t){e=!0}return function(t,n){return i(t,n),e?t.__proto__=n:r(t,n),t}}({},!1):void 0),check:i}},function(t,e,n){"use strict";var r=n(3),o=n(43)(!0);r(r.P,"Array",{includes:function(t){return o(this,t,arguments.length>1?arguments[1]:void 0)}}),n(52)("includes")},function(t,e,n){"use strict";var r=n(3),o=n(37);r(r.P+r.F*n(38)("includes"),"String",{includes:function(t){return!!~o(this,t,"includes").indexOf(t,arguments.length>1?arguments[1]:void 0)}})},function(t,e,n){"use strict";var r=n(3),o=n(20),i=n(37),u="".endsWith;r(r.P+r.F*n(38)("endsWith"),"String",{endsWith:function(t){var e=i(this,t,"endsWith"),n=arguments.length>1?arguments[1]:void 0,r=o(e.length),c=void 0===n?r:Math.min(o(n),r),a=String(t);return u?u.call(e,a,c):e.slice(c-a.length,c)===a}})},function(t,e,n){"use strict";var r=n(3),o=n(20),i=n(37),u="".startsWith;r(r.P+r.F*n(38)("startsWith"),"String",{startsWith:function(t){var e=i(this,t,"startsWith"),n=o(Math.min(arguments.length>1?arguments[1]:void 0,e.length)),r=String(t);return u?u.call(e,r,n):e.slice(n,n+r.length)===r}})},function(t,e,n){n(53)("asyncIterator")},function(t,e,n){"use strict";var r=n(1),o=n(12),i=n(4),u=n(3),c=n(7),a=n(82).KEY,s=n(11),f=n(22),l=n(24),p=n(18),h=n(0),d=n(54),y=n(53),v=n(83),m=n(84),g=n(2),b=n(6),w=n(25),x=n(8),S=n(30),_=n(17),O=n(41),j=n(85),E=n(35),P=n(34),T=n(5),A=n(14),k=E.f,B=T.f,F=j.f,M=r.Symbol,L=r.JSON,I=L&&L.stringify,R=h("_hidden"),D=h("toPrimitive"),N={}.propertyIsEnumerable,C=f("symbol-registry"),U=f("symbols"),W=f("op-symbols"),q=Object.prototype,G="function"==typeof M&&!!P.f,H=r.QObject,V=!H||!H.prototype||!H.prototype.findChild,z=i&&s((function(){return 7!=O(B({},"a",{get:function(){return B(this,"a",{value:7}).a}})).a}))?function(t,e,n){var r=k(q,e);r&&delete q[e],B(t,e,n),r&&t!==q&&B(q,e,r)}:B,K=function(t){var e=U[t]=O(M.prototype);return e._k=t,e},J=G&&"symbol"==typeof M.iterator?function(t){return"symbol"==typeof t}:function(t){return t instanceof M},X=function(t,e,n){return t===q&&X(W,e,n),g(t),e=S(e,!0),g(n),o(U,e)?(n.enumerable?(o(t,R)&&t[R][e]&&(t[R][e]=!1),n=O(n,{enumerable:_(0,!1)})):(o(t,R)||B(t,R,_(1,{})),t[R][e]=!0),z(t,e,n)):B(t,e,n)},Y=function(t,e){g(t);for(var n,r=v(e=x(e)),o=0,i=r.length;i>o;)X(t,n=r[o++],e[n]);return t},Q=function(t){var e=N.call(this,t=S(t,!0));return!(this===q&&o(U,t)&&!o(W,t))&&(!(e||!o(this,t)||!o(U,t)||o(this,R)&&this[R][t])||e)},$=function(t,e){if(t=x(t),e=S(e,!0),t!==q||!o(U,e)||o(W,e)){var n=k(t,e);return!n||!o(U,e)||o(t,R)&&t[R][e]||(n.enumerable=!0),n}},Z=function(t){for(var e,n=F(x(t)),r=[],i=0;n.length>i;)o(U,e=n[i++])||e==R||e==a||r.push(e);return r},tt=function(t){for(var e,n=t===q,r=F(n?W:x(t)),i=[],u=0;r.length>u;)!o(U,e=r[u++])||n&&!o(q,e)||i.push(U[e]);return i};G||(c((M=function(){if(this instanceof M)throw TypeError("Symbol is not a constructor!");var t=p(arguments.length>0?arguments[0]:void 0),e=function(n){this===q&&e.call(W,n),o(this,R)&&o(this[R],t)&&(this[R][t]=!1),z(this,t,_(1,n))};return i&&V&&z(q,t,{configurable:!0,set:e}),K(t)}).prototype,"toString",(function(){return this._k})),E.f=$,T.f=X,n(26).f=j.f=Z,n(27).f=Q,P.f=tt,i&&!n(16)&&c(q,"propertyIsEnumerable",Q,!0),d.f=function(t){return K(h(t))}),u(u.G+u.W+u.F*!G,{Symbol:M});for(var et="hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),nt=0;et.length>nt;)h(et[nt++]);for(var rt=A(h.store),ot=0;rt.length>ot;)y(rt[ot++]);u(u.S+u.F*!G,"Symbol",{for:function(t){return o(C,t+="")?C[t]:C[t]=M(t)},keyFor:function(t){if(!J(t))throw TypeError(t+" is not a symbol!");for(var e in C)if(C[e]===t)return e},useSetter:function(){V=!0},useSimple:function(){V=!1}}),u(u.S+u.F*!G,"Object",{create:function(t,e){return void 0===e?O(t):Y(O(t),e)},defineProperty:X,defineProperties:Y,getOwnPropertyDescriptor:$,getOwnPropertyNames:Z,getOwnPropertySymbols:tt});var it=s((function(){P.f(1)}));u(u.S+u.F*it,"Object",{getOwnPropertySymbols:function(t){return P.f(w(t))}}),L&&u(u.S+u.F*(!G||s((function(){var t=M();return"[null]"!=I([t])||"{}"!=I({a:t})||"{}"!=I(Object(t))}))),"JSON",{stringify:function(t){for(var e,n,r=[t],o=1;arguments.length>o;)r.push(arguments[o++]);if(n=e=r[1],(b(e)||void 0!==t)&&!J(t))return m(e)||(e=function(t,e){if("function"==typeof n&&(e=n.call(this,t,e)),!J(e))return e}),r[1]=e,I.apply(L,r)}}),M.prototype[D]||n(10)(M.prototype,D,M.prototype.valueOf),l(M,"Symbol"),l(Math,"Math",!0),l(r.JSON,"JSON",!0)},function(t,e,n){var r=n(18)("meta"),o=n(6),i=n(12),u=n(5).f,c=0,a=Object.isExtensible||function(){return!0},s=!n(11)((function(){return a(Object.preventExtensions({}))})),f=function(t){u(t,r,{value:{i:"O"+ ++c,w:{}}})},l=t.exports={KEY:r,NEED:!1,fastKey:function(t,e){if(!o(t))return"symbol"==typeof t?t:("string"==typeof t?"S":"P")+t;if(!i(t,r)){if(!a(t))return"F";if(!e)return"E";f(t)}return t[r].i},getWeak:function(t,e){if(!i(t,r)){if(!a(t))return!0;if(!e)return!1;f(t)}return t[r].w},onFreeze:function(t){return s&&l.NEED&&a(t)&&!i(t,r)&&f(t),t}}},function(t,e,n){var r=n(14),o=n(34),i=n(27);t.exports=function(t){var e=r(t),n=o.f;if(n)for(var u,c=n(t),a=i.f,s=0;c.length>s;)a.call(t,u=c[s++])&&e.push(u);return e}},function(t,e,n){var r=n(15);t.exports=Array.isArray||function(t){return"Array"==r(t)}},function(t,e,n){var r=n(8),o=n(26).f,i={}.toString,u="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[];t.exports.f=function(t){return u&&"[object Window]"==i.call(t)?function(t){try{return o(t)}catch(t){return u.slice()}}(t):o(r(t))}},function(t,e,n){for(var r=n(55),o=n(14),i=n(7),u=n(1),c=n(10),a=n(19),s=n(0),f=s("iterator"),l=s("toStringTag"),p=a.Array,h={CSSRuleList:!0,CSSStyleDeclaration:!1,CSSValueList:!1,ClientRectList:!1,DOMRectList:!1,DOMStringList:!1,DOMTokenList:!0,DataTransferItemList:!1,FileList:!1,HTMLAllCollection:!1,HTMLCollection:!1,HTMLFormElement:!1,HTMLSelectElement:!1,MediaList:!0,MimeTypeArray:!1,NamedNodeMap:!1,NodeList:!0,PaintRequestList:!1,Plugin:!1,PluginArray:!1,SVGLengthList:!1,SVGNumberList:!1,SVGPathSegList:!1,SVGPointList:!1,SVGStringList:!1,SVGTransformList:!1,SourceBufferList:!1,StyleSheetList:!0,TextTrackCueList:!1,TextTrackList:!1,TouchList:!1},d=o(h),y=0;y<d.length;y++){var v,m=d[y],g=h[m],b=u[m],w=b&&b.prototype;if(w&&(w[f]||c(w,f,p),w[l]||c(w,l,m),a[m]=p,g))for(v in r)w[v]||i(w,v,r[v],!0)}},function(t,e){t.exports=function(t,e){return{value:e,done:!!t}}},function(t,e,n){var r=n(3),o=n(89)(!0);r(r.S,"Object",{entries:function(t){return o(t)}})},function(t,e,n){var r=n(4),o=n(14),i=n(8),u=n(27).f;t.exports=function(t){return function(e){for(var n,c=i(e),a=o(c),s=a.length,f=0,l=[];s>f;)n=a[f++],r&&!u.call(c,n)||l.push(t?[n,c[n]]:c[n]);return l}}},function(t,e,n){"use strict";var r,o,i,u,c=n(16),a=n(1),s=n(13),f=n(33),l=n(3),p=n(6),h=n(23),d=n(91),y=n(92),v=n(93),m=n(56).set,g=n(95)(),b=n(57),w=n(96),x=n(97),S=n(98),_=a.TypeError,O=a.process,j=O&&O.versions,E=j&&j.v8||"",P=a.Promise,T="process"==f(O),A=function(){},k=o=b.f,B=!!function(){try{var t=P.resolve(1),e=(t.constructor={})[n(0)("species")]=function(t){t(A,A)};return(T||"function"==typeof PromiseRejectionEvent)&&t.then(A)instanceof e&&0!==E.indexOf("6.6")&&-1===x.indexOf("Chrome/66")}catch(t){}}(),F=function(t){var e;return!(!p(t)||"function"!=typeof(e=t.then))&&e},M=function(t,e){if(!t._n){t._n=!0;var n=t._c;g((function(){for(var r=t._v,o=1==t._s,i=0,u=function(e){var n,i,u,c=o?e.ok:e.fail,a=e.resolve,s=e.reject,f=e.domain;try{c?(o||(2==t._h&&R(t),t._h=1),!0===c?n=r:(f&&f.enter(),n=c(r),f&&(f.exit(),u=!0)),n===e.promise?s(_("Promise-chain cycle")):(i=F(n))?i.call(n,a,s):a(n)):s(r)}catch(t){f&&!u&&f.exit(),s(t)}};n.length>i;)u(n[i++]);t._c=[],t._n=!1,e&&!t._h&&L(t)}))}},L=function(t){m.call(a,(function(){var e,n,r,o=t._v,i=I(t);if(i&&(e=w((function(){T?O.emit("unhandledRejection",o,t):(n=a.onunhandledrejection)?n({promise:t,reason:o}):(r=a.console)&&r.error&&r.error("Unhandled promise rejection",o)})),t._h=T||I(t)?2:1),t._a=void 0,i&&e.e)throw e.v}))},I=function(t){return 1!==t._h&&0===(t._a||t._c).length},R=function(t){m.call(a,(function(){var e;T?O.emit("rejectionHandled",t):(e=a.onrejectionhandled)&&e({promise:t,reason:t._v})}))},D=function(t){var e=this;e._d||(e._d=!0,(e=e._w||e)._v=t,e._s=2,e._a||(e._a=e._c.slice()),M(e,!0))},N=function(t){var e,n=this;if(!n._d){n._d=!0,n=n._w||n;try{if(n===t)throw _("Promise can't be resolved itself");(e=F(t))?g((function(){var r={_w:n,_d:!1};try{e.call(t,s(N,r,1),s(D,r,1))}catch(t){D.call(r,t)}})):(n._v=t,n._s=1,M(n,!1))}catch(t){D.call({_w:n,_d:!1},t)}}};B||(P=function(t){d(this,P,"Promise","_h"),h(t),r.call(this);try{t(s(N,this,1),s(D,this,1))}catch(t){D.call(this,t)}},(r=function(t){this._c=[],this._a=void 0,this._s=0,this._d=!1,this._v=void 0,this._h=0,this._n=!1}).prototype=n(99)(P.prototype,{then:function(t,e){var n=k(v(this,P));return n.ok="function"!=typeof t||t,n.fail="function"==typeof e&&e,n.domain=T?O.domain:void 0,this._c.push(n),this._a&&this._a.push(n),this._s&&M(this,!1),n.promise},catch:function(t){return this.then(void 0,t)}}),i=function(){var t=new r;this.promise=t,this.resolve=s(N,t,1),this.reject=s(D,t,1)},b.f=k=function(t){return t===P||t===u?new i(t):o(t)}),l(l.G+l.W+l.F*!B,{Promise:P}),n(24)(P,"Promise"),n(51)("Promise"),u=n(9).Promise,l(l.S+l.F*!B,"Promise",{reject:function(t){var e=k(this);return(0,e.reject)(t),e.promise}}),l(l.S+l.F*(c||!B),"Promise",{resolve:function(t){return S(c&&this===u?P:this,t)}}),l(l.S+l.F*!(B&&n(49)((function(t){P.all(t).catch(A)}))),"Promise",{all:function(t){var e=this,n=k(e),r=n.resolve,o=n.reject,i=w((function(){var n=[],i=0,u=1;y(t,!1,(function(t){var c=i++,a=!1;n.push(void 0),u++,e.resolve(t).then((function(t){a||(a=!0,n[c]=t,--u||r(n))}),o)})),--u||r(n)}));return i.e&&o(i.v),n.promise},race:function(t){var e=this,n=k(e),r=n.reject,o=w((function(){y(t,!1,(function(t){e.resolve(t).then(n.resolve,r)}))}));return o.e&&r(o.v),n.promise}})},function(t,e){t.exports=function(t,e,n,r){if(!(t instanceof e)||void 0!==r&&r in t)throw TypeError(n+": incorrect invocation!");return t}},function(t,e,n){var r=n(13),o=n(45),i=n(46),u=n(2),c=n(20),a=n(48),s={},f={};(e=t.exports=function(t,e,n,l,p){var h,d,y,v,m=p?function(){return t}:a(t),g=r(n,l,e?2:1),b=0;if("function"!=typeof m)throw TypeError(t+" is not iterable!");if(i(m)){for(h=c(t.length);h>b;b++)if((v=e?g(u(d=t[b])[0],d[1]):g(t[b]))===s||v===f)return v}else for(y=m.call(t);!(d=y.next()).done;)if((v=o(y,g,d.value,e))===s||v===f)return v}).BREAK=s,e.RETURN=f},function(t,e,n){var r=n(2),o=n(23),i=n(0)("species");t.exports=function(t,e){var n,u=r(t).constructor;return void 0===u||null==(n=r(u)[i])?e:o(n)}},function(t,e){t.exports=function(t,e,n){var r=void 0===n;switch(e.length){case 0:return r?t():t.call(n);case 1:return r?t(e[0]):t.call(n,e[0]);case 2:return r?t(e[0],e[1]):t.call(n,e[0],e[1]);case 3:return r?t(e[0],e[1],e[2]):t.call(n,e[0],e[1],e[2]);case 4:return r?t(e[0],e[1],e[2],e[3]):t.call(n,e[0],e[1],e[2],e[3])}return t.apply(n,e)}},function(t,e,n){var r=n(1),o=n(56).set,i=r.MutationObserver||r.WebKitMutationObserver,u=r.process,c=r.Promise,a="process"==n(15)(u);t.exports=function(){var t,e,n,s=function(){var r,o;for(a&&(r=u.domain)&&r.exit();t;){o=t.fn,t=t.next;try{o()}catch(r){throw t?n():e=void 0,r}}e=void 0,r&&r.enter()};if(a)n=function(){u.nextTick(s)};else if(!i||r.navigator&&r.navigator.standalone)if(c&&c.resolve){var f=c.resolve(void 0);n=function(){f.then(s)}}else n=function(){o.call(r,s)};else{var l=!0,p=document.createTextNode("");new i(s).observe(p,{characterData:!0}),n=function(){p.data=l=!l}}return function(r){var o={fn:r,next:void 0};e&&(e.next=o),t||(t=o,n()),e=o}}},function(t,e){t.exports=function(t){try{return{e:!1,v:t()}}catch(t){return{e:!0,v:t}}}},function(t,e,n){var r=n(1).navigator;t.exports=r&&r.userAgent||""},function(t,e,n){var r=n(2),o=n(6),i=n(57);t.exports=function(t,e){if(r(t),o(e)&&e.constructor===t)return e;var n=i.f(t);return(0,n.resolve)(e),n.promise}},function(t,e,n){var r=n(7);t.exports=function(t,e,n){for(var o in e)r(t,o,e[o],n);return t}},function(t,e,n){"use strict";var r=n(33),o={};o[n(0)("toStringTag")]="z",o+""!="[object z]"&&n(7)(Object.prototype,"toString",(function(){return"[object "+r(this)+"]"}),!0)},function(t,e){Element.prototype.matches||(Element.prototype.matches=Element.prototype.matchesSelector||Element.prototype.mozMatchesSelector||Element.prototype.msMatchesSelector||Element.prototype.oMatchesSelector||Element.prototype.webkitMatchesSelector||function(t){for(var e=(this.document||this.ownerDocument).querySelectorAll(t),n=e.length;--n>=0&&e.item(n)!==this;);return n>-1})},function(t,e,n){"use strict";n.r(e);n(58),n(66),n(67),n(69),n(71),n(73),n(76),n(77),n(78),n(79),n(80),n(81),n(86),n(55),n(88),n(90),n(100);var r={searchParams:"URLSearchParams"in self,iterable:"Symbol"in self&&"iterator"in Symbol,blob:"FileReader"in self&&"Blob"in self&&function(){try{return new Blob,!0}catch(t){return!1}}(),formData:"FormData"in self,arrayBuffer:"ArrayBuffer"in self};if(r.arrayBuffer)var o=["[object Int8Array]","[object Uint8Array]","[object Uint8ClampedArray]","[object Int16Array]","[object Uint16Array]","[object Int32Array]","[object Uint32Array]","[object Float32Array]","[object Float64Array]"],i=ArrayBuffer.isView||function(t){return t&&o.indexOf(Object.prototype.toString.call(t))>-1};function u(t){if("string"!=typeof t&&(t=String(t)),/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(t))throw new TypeError("Invalid character in header field name");return t.toLowerCase()}function c(t){return"string"!=typeof t&&(t=String(t)),t}function a(t){var e={next:function(){var e=t.shift();return{done:void 0===e,value:e}}};return r.iterable&&(e[Symbol.iterator]=function(){return e}),e}function s(t){this.map={},t instanceof s?t.forEach((function(t,e){this.append(e,t)}),this):Array.isArray(t)?t.forEach((function(t){this.append(t[0],t[1])}),this):t&&Object.getOwnPropertyNames(t).forEach((function(e){this.append(e,t[e])}),this)}function f(t){if(t.bodyUsed)return Promise.reject(new TypeError("Already read"));t.bodyUsed=!0}function l(t){return new Promise((function(e,n){t.onload=function(){e(t.result)},t.onerror=function(){n(t.error)}}))}function p(t){var e=new FileReader,n=l(e);return e.readAsArrayBuffer(t),n}function h(t){if(t.slice)return t.slice(0);var e=new Uint8Array(t.byteLength);return e.set(new Uint8Array(t)),e.buffer}function d(){return this.bodyUsed=!1,this._initBody=function(t){var e;this._bodyInit=t,t?"string"==typeof t?this._bodyText=t:r.blob&&Blob.prototype.isPrototypeOf(t)?this._bodyBlob=t:r.formData&&FormData.prototype.isPrototypeOf(t)?this._bodyFormData=t:r.searchParams&&URLSearchParams.prototype.isPrototypeOf(t)?this._bodyText=t.toString():r.arrayBuffer&&r.blob&&((e=t)&&DataView.prototype.isPrototypeOf(e))?(this._bodyArrayBuffer=h(t.buffer),this._bodyInit=new Blob([this._bodyArrayBuffer])):r.arrayBuffer&&(ArrayBuffer.prototype.isPrototypeOf(t)||i(t))?this._bodyArrayBuffer=h(t):this._bodyText=t=Object.prototype.toString.call(t):this._bodyText="",this.headers.get("content-type")||("string"==typeof t?this.headers.set("content-type","text/plain;charset=UTF-8"):this._bodyBlob&&this._bodyBlob.type?this.headers.set("content-type",this._bodyBlob.type):r.searchParams&&URLSearchParams.prototype.isPrototypeOf(t)&&this.headers.set("content-type","application/x-www-form-urlencoded;charset=UTF-8"))},r.blob&&(this.blob=function(){var t=f(this);if(t)return t;if(this._bodyBlob)return Promise.resolve(this._bodyBlob);if(this._bodyArrayBuffer)return Promise.resolve(new Blob([this._bodyArrayBuffer]));if(this._bodyFormData)throw new Error("could not read FormData body as blob");return Promise.resolve(new Blob([this._bodyText]))},this.arrayBuffer=function(){return this._bodyArrayBuffer?f(this)||Promise.resolve(this._bodyArrayBuffer):this.blob().then(p)}),this.text=function(){var t,e,n,r=f(this);if(r)return r;if(this._bodyBlob)return t=this._bodyBlob,e=new FileReader,n=l(e),e.readAsText(t),n;if(this._bodyArrayBuffer)return Promise.resolve(function(t){for(var e=new Uint8Array(t),n=new Array(e.length),r=0;r<e.length;r++)n[r]=String.fromCharCode(e[r]);return n.join("")}(this._bodyArrayBuffer));if(this._bodyFormData)throw new Error("could not read FormData body as text");return Promise.resolve(this._bodyText)},r.formData&&(this.formData=function(){return this.text().then(m)}),this.json=function(){return this.text().then(JSON.parse)},this}s.prototype.append=function(t,e){t=u(t),e=c(e);var n=this.map[t];this.map[t]=n?n+", "+e:e},s.prototype.delete=function(t){delete this.map[u(t)]},s.prototype.get=function(t){return t=u(t),this.has(t)?this.map[t]:null},s.prototype.has=function(t){return this.map.hasOwnProperty(u(t))},s.prototype.set=function(t,e){this.map[u(t)]=c(e)},s.prototype.forEach=function(t,e){for(var n in this.map)this.map.hasOwnProperty(n)&&t.call(e,this.map[n],n,this)},s.prototype.keys=function(){var t=[];return this.forEach((function(e,n){t.push(n)})),a(t)},s.prototype.values=function(){var t=[];return this.forEach((function(e){t.push(e)})),a(t)},s.prototype.entries=function(){var t=[];return this.forEach((function(e,n){t.push([n,e])})),a(t)},r.iterable&&(s.prototype[Symbol.iterator]=s.prototype.entries);var y=["DELETE","GET","HEAD","OPTIONS","POST","PUT"];function v(t,e){var n,r,o=(e=e||{}).body;if(t instanceof v){if(t.bodyUsed)throw new TypeError("Already read");this.url=t.url,this.credentials=t.credentials,e.headers||(this.headers=new s(t.headers)),this.method=t.method,this.mode=t.mode,this.signal=t.signal,o||null==t._bodyInit||(o=t._bodyInit,t.bodyUsed=!0)}else this.url=String(t);if(this.credentials=e.credentials||this.credentials||"same-origin",!e.headers&&this.headers||(this.headers=new s(e.headers)),this.method=(n=e.method||this.method||"GET",r=n.toUpperCase(),y.indexOf(r)>-1?r:n),this.mode=e.mode||this.mode||null,this.signal=e.signal||this.signal,this.referrer=null,("GET"===this.method||"HEAD"===this.method)&&o)throw new TypeError("Body not allowed for GET or HEAD requests");this._initBody(o)}function m(t){var e=new FormData;return t.trim().split("&").forEach((function(t){if(t){var n=t.split("="),r=n.shift().replace(/\+/g," "),o=n.join("=").replace(/\+/g," ");e.append(decodeURIComponent(r),decodeURIComponent(o))}})),e}function g(t,e){e||(e={}),this.type="default",this.status=void 0===e.status?200:e.status,this.ok=this.status>=200&&this.status<300,this.statusText="statusText"in e?e.statusText:"OK",this.headers=new s(e.headers),this.url=e.url||"",this._initBody(t)}v.prototype.clone=function(){return new v(this,{body:this._bodyInit})},d.call(v.prototype),d.call(g.prototype),g.prototype.clone=function(){return new g(this._bodyInit,{status:this.status,statusText:this.statusText,headers:new s(this.headers),url:this.url})},g.error=function(){var t=new g(null,{status:0,statusText:""});return t.type="error",t};var b=[301,302,303,307,308];g.redirect=function(t,e){if(-1===b.indexOf(e))throw new RangeError("Invalid status code");return new g(null,{status:e,headers:{location:t}})};var w=self.DOMException;try{new w}catch(t){(w=function(t,e){this.message=t,this.name=e;var n=Error(t);this.stack=n.stack}).prototype=Object.create(Error.prototype),w.prototype.constructor=w}function x(t,e){return new Promise((function(n,o){var i=new v(t,e);if(i.signal&&i.signal.aborted)return o(new w("Aborted","AbortError"));var u=new XMLHttpRequest;function c(){u.abort()}u.onload=function(){var t,e,r={status:u.status,statusText:u.statusText,headers:(t=u.getAllResponseHeaders()||"",e=new s,t.replace(/\r?\n[\t ]+/g," ").split(/\r?\n/).forEach((function(t){var n=t.split(":"),r=n.shift().trim();if(r){var o=n.join(":").trim();e.append(r,o)}})),e)};r.url="responseURL"in u?u.responseURL:r.headers.get("X-Request-URL");var o="response"in u?u.response:u.responseText;n(new g(o,r))},u.onerror=function(){o(new TypeError("Network request failed"))},u.ontimeout=function(){o(new TypeError("Network request failed"))},u.onabort=function(){o(new w("Aborted","AbortError"))},u.open(i.method,i.url,!0),"include"===i.credentials?u.withCredentials=!0:"omit"===i.credentials&&(u.withCredentials=!1),"responseType"in u&&r.blob&&(u.responseType="blob"),i.headers.forEach((function(t,e){u.setRequestHeader(e,t)})),i.signal&&(i.signal.addEventListener("abort",c),u.onreadystatechange=function(){4===u.readyState&&i.signal.removeEventListener("abort",c)}),u.send(void 0===i._bodyInit?null:i._bodyInit)}))}x.polyfill=!0,self.fetch||(self.fetch=x,self.Headers=s,self.Request=v,self.Response=g);n(101);function S(t){return function(t){if(Array.isArray(t)){for(var e=0,n=new Array(t.length);e<t.length;e++)n[e]=t[e];return n}}(t)||function(t){if(Symbol.iterator in Object(t)||"[object Arguments]"===Object.prototype.toString.call(t))return Array.from(t)}(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}function _(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function O(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?_(n,!0).forEach((function(e){P(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):_(n).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function j(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){if(!(Symbol.iterator in Object(t)||"[object Arguments]"===Object.prototype.toString.call(t)))return;var n=[],r=!0,o=!1,i=void 0;try{for(var u,c=t[Symbol.iterator]();!(r=(u=c.next()).done)&&(n.push(u.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t}finally{try{r||null==c.return||c.return()}finally{if(o)throw i}}return n}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}function E(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function P(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}n.d(e,"default",(function(){return R}));var T=["submit"];function A(t){return"event"===t.taggingMethod||void 0===t.taggingMethod}function k(t){return M(t)&&"click"===t.handler}function B(t){return"track"===t.formAction&&"form"===t.taggingMethod}function F(t){return M(t)&&"submit"===t.handler}function M(t){return t.actions&&t.actions.length>0}function L(t){return"identify"===t}var I=function(t,e){return"https://d1wnclalxop6x4.cloudfront.net/instrumentation-spec-".concat(t,"-").concat(e,".json")},R=function(){function t(e,n,r,o){var i=this;if(function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),P(this,"initialized",void 0),P(this,"listenerMap",void 0),P(this,"workspaceId",void 0),P(this,"sourceId",void 0),P(this,"documentNode",void 0),P(this,"instrumentationSpec",void 0),P(this,"load",(function(t){i.setListenerMap(i.toSpecMapByHandlerKey(t)),i.initialized=!0,i.installListeners()})),P(this,"getInstrumentationSpec",(function(){return i.instrumentationSpec?Promise.resolve(i.instrumentationSpec):fetch(I(i.workspaceId,i.sourceId),{headers:{"Cache-Control":"no-cache"}}).then((function(t){return t.ok?t.json():[]}))})),P(this,"setListenerMap",(function(t){i.listenerMap=Object.entries(t).reduce((function(t,e){var n=j(e,2),r=n[0],o=n[1];return O({},t,P({},r,(function(t){var e=o.filter((function(e){return i.testUrl(e.urlRules)&&!!i.findMatch(e,t.target)}));if(0!==e.length){var n=!0,r=!1,u=void 0;try{for(var c,a=e[Symbol.iterator]();!(n=(c=a.next()).done);n=!0){var s=c.value;if(k(s)){var f=!0,l=!1,p=void 0;try{for(var h,d=s.actions[Symbol.iterator]();!(f=(h=d.next()).done);f=!0){var y=h.value;i.handleEventTag(s,t.target,y.event,y.bindings)}}catch(t){l=!0,p=t}finally{try{f||null==d.return||d.return()}finally{if(l)throw p}}}else if(A(s))i.handleEventTag(s,t.target,s.event,s.bindings);else if(F(s)){var v=!0,m=!1,g=void 0;try{for(var b,w=s.actions[Symbol.iterator]();!(v=(b=w.next()).done);v=!0){var x=b.value;"track"===x.type?i.handleTrackFormTag(s,x.event,x.bindings):L(x.type)&&i.handleIdentifyFormTag(s,x.bindings)}}catch(t){m=!0,g=t}finally{try{v||null==w.return||w.return()}finally{if(m)throw g}}}else B(s)&&i.handleTrackFormTag(s,s.event,s.bindings)}}catch(t){r=!0,u=t}finally{try{n||null==a.return||a.return()}finally{if(r)throw u}}}})))}),{})})),!e||!n)throw new Error("workspaceId and sourceId must be specified");if(t.instance)return t.instance;t.instance=this,this.workspaceId=e,this.sourceId=n,this.instrumentationSpec=r,this.documentNode=o}var e,n,r;return e=t,(n=[{key:"start",value:function(){return Promise.resolve().then(this.getInstrumentationSpec).then(this.load)}},{key:"restart",value:function(t){this.removeListeners(),this.load(t)}},{key:"isInitialized",value:function(){return this.initialized}},{key:"toSpecMapByHandlerKey",value:function(t){return t.reduce((function(t,e){return O({},t,P({},e.handler,[].concat(S(t[e.handler]||[]),[e])))}),{})}},{key:"testUrl",value:function(t){if(!t)return!0;var e=window.location.href,n={is:function(t){return t===e},isNot:function(t){return t!==e},startsWith:function(t){return e.startsWith(t)},endsWith:function(t){return e.endsWith(t)},contains:function(t){return e.includes(t)},containsNot:function(t){return!e.includes(t)},regex:function(t){return RegExp(t).test(e)}},r=!0,o=!1,i=void 0;try{for(var u,c=t[Symbol.iterator]();!(r=(u=c.next()).done);r=!0){var a=u.value,s=a.ruleType,f=a.pattern;if(!n[s](f))return!1}}catch(t){o=!0,i=t}finally{try{r||null==c.return||c.return()}finally{if(o)throw i}}return!0}},{key:"findMatch",value:function(t,e){for(var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:8,r=e,o=0;r&&o<n;){if(r.matches(t.selector))return r;r=r.parentElement,o++}}},{key:"handleEventTag",value:function(t,e,n,r){var o=this,i=this.documentNode.querySelectorAll(t.selector),u=this.findMatch(t,e),c=this.splitBindings(r),a=c.dynamicBindings,s=c.staticBindings,f=a.reduce((function(t,e){var n;return u&&(n=u.querySelector(e.selector)),!n&&i.length<2&&(n=o.documentNode.querySelector(e.selector)),O({},t,P({},e.field,n&&(n.value||n.innerText)))}),{}),l=s.reduce((function(t,e){return O({},t,P({},e.field,e.value))}),{}),p=O({},l,{},f);window.analytics.track(n,p,{context:{visual_tagger:!0}})}},{key:"getBindingValuesFromForm",value:function(t,e,n){var r=this,o=e.reduce((function(t,e){var o=n.querySelector(e.selector);if(!o){var i=r.documentNode.querySelector(e.selector);return O({},t,P({},e.field,i&&(i.value||i.innerText)))}return O({},t,P({},e.field,o&&o.value))}),{}),i=t.reduce((function(t,e){return O({},t,P({},e.field,e.value))}),{});return O({},i,{},o)}},{key:"handleTrackFormTag",value:function(t,e,n){var r=this.documentNode.querySelector(t.selector);if(r){var o=this.splitBindings(n),i=o.dynamicBindings,u=o.staticBindings,c=this.getBindingValuesFromForm(u,i,r);window.analytics.track(e,c,{context:{visual_tagger:!0}})}else console.error("form tagged at ".concat(t.selector," cannot be found in the current page "))}},{key:"handleIdentifyFormTag",value:function(t,e){var n=this.documentNode.querySelector(t.selector);if(n){var r=this.splitBindings(e),o=r.dynamicBindings,i=r.staticBindings,u=this.getBindingValuesFromForm(i,o,n);window.analytics.identify(u,{context:{visual_tagger:!0}})}else console.error("form tagged at ".concat(t.selector," cannot be found in the current page "))}},{key:"splitBindings",value:function(t){var e=t.filter((function(t){return t.type&&"static"!==t.type}));return{staticBindings:t.filter((function(t){return t.type&&"static"===t.type})),dynamicBindings:e}}},{key:"installListeners",value:function(){var t=this;Object.entries(this.listenerMap).forEach((function(e){var n=j(e,2),r=n[0],o=n[1],i=!T.includes(r);t.documentNode.addEventListener(r,o,i)}))}},{key:"removeListeners",value:function(){var t=this;Object.entries(this.listenerMap).forEach((function(e){var n=j(e,2),r=n[0],o=n[1],i=!T.includes(r);t.documentNode.removeEventListener(r,o,i)}))}}])&&E(e.prototype,n),r&&E(e,r),t}();P(R,"instance",void 0)}]).default}));

;

},{}],1222:[function(require,module,exports){


module.exports = function() {};
;

},{}],1223:[function(require,module,exports){


module.exports = function() {};
;

},{"./matchers":1224,"./store":1225,"./transformers":1226}],1224:[function(require,module,exports){


module.exports = function() {};
;

},{"lodash.get":1338}],1225:[function(require,module,exports){


module.exports = function() {};
;

},{}],1226:[function(require,module,exports){


module.exports = function() {};
;

},{"js-md5":1324,"lodash.get":1338,"lodash.set":1339,"lodash.unset":1340,"math-float64-ldexp":1350}],1227:[function(require,module,exports){

;
'use strict';

/**
 * Module dependencies.
 */

var foldl = require('@ndhoule/foldl');
var parse = require('component-querystring').parse;

/**
 * hasOwnProperty reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Get all utm params from the given `querystring`
 *
 * @param {String} query
 * @return {Object}
 * @api private
 */

function utm(query) {
  // Remove leading ? if present
  if (query.charAt(0) === '?') {
    query = query.substring(1);
  }

  query = query.replace(/\?/g, '&');

  var param;
  var params = parse(query);
  var results = {};

  for (var key in params) {
    if (has.call(params, key)) {
      if (key.substr(0, 4) === 'utm_') {
        param = key.substr(4);
        if (param === 'campaign') param = 'name';
        results[param] = params[key];
      }
    }
  }

  return results;
}

var allowedKeys = {
  name: true,
  term: true,
  source: true,
  medium: true,
  content: true
};

/**
 * Get strict utm params - from the given `querystring`
 *
 * @param {String} query
 * @return {Object}
 * @api private
 */

function strict(query) {
  return foldl(function(acc, val, key) {
    if (has.call(allowedKeys, key)) acc[key] = val;
    return acc;
  }, {}, utm(query));
}

/*
 * Exports.
 */

module.exports = utm;
module.exports.strict = strict;

;

},{"@ndhoule/foldl":36,"component-querystring":1289}],1228:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1229}],1229:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1230,"./statics":1231,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1233,"dup":14,"slug-component":1398}],1230:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1232,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1231:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1232:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1233:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1234,"_process":1273,"dup":11}],1234:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1235:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@ndhoule/each":32,"@segment/analytics.js-integration":1236,"change-case":1275,"do-when":1301,"is":1321,"obj-case":1365}],1236:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1237,"./statics":1238,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1240,"dup":14,"slug-component":1398}],1237:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1239,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1238:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1239:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1240:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1241,"_process":1273,"dup":11}],1241:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1242:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1243,"@segment/load-script":1202,"isobject":1249}],1243:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1244,"./statics":1245,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1247,"dup":14,"slug-component":1398}],1244:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1246,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1245:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1246:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1247:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1248,"_process":1273,"dup":11}],1248:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1249:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":199,"isarray":1322}],1250:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1251}],1251:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1252,"./statics":1253,"@ndhoule/defaults":30,"component-bind":1277,"debug":1254,"dup":7,"extend":1256,"slug-component":1398}],1252:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1253:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],1254:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1255,"_process":1273,"dup":11}],1255:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1256:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],1257:[function(require,module,exports){

;
'use strict';

/**
 * Module Dependencies
 */

var map = require('@ndhoule/map');
var foldl = require('@ndhoule/foldl');

var eventMap = {
  // Videos
  videoPlaybackStarted: [{
    object: 'video playback',
    action: 'started'
  }],
  videoPlaybackPaused: [{
    object: 'video playback',
    action: 'paused'
  }],
  videoPlaybackInterrupted: [{
    object: 'video playback',
    action: 'interrupted'
  }],
  videoPlaybackResumed: [{
    object: 'video playback',
    action: 'resumed'
  }],
  videoPlaybackCompleted: [{
    object: 'video playback',
    action: 'completed'
  }],
  videoPlaybackBufferStarted: [{
    object: 'video playback buffer',
    action: 'started'
  }],
  videoPlaybackBufferCompleted: [{
    object: 'video playback buffer',
    action: 'completed'
  }],
  videoPlaybackSeekStarted: [{
    object: 'video playback seek',
    action: 'started'
  }],
  videoPlaybackSeekCompleted: [{
    object: 'video playback seek',
    action: 'completed'
  }],
  videoContentStarted: [{
    object: 'video content',
    action: 'started'
  }],
  videoContentPlaying: [{
    object: 'video content',
    action: 'playing'
  }],
  videoContentCompleted: [{
    object: 'video content',
    action: 'completed'
  }],
  videoAdStarted: [{
    object: 'video ad',
    action: 'started'
  }],
  videoAdPlaying: [{
    object: 'video ad',
    action: 'playing'
  }],
  videoAdCompleted: [{
    object: 'video ad',
    action: 'completed'
  }],

  // Promotions
  promotionViewed: [{
    object: 'promotion',
    action: 'viewed'
  }],
  promotionClicked: [{
    object: 'promotion',
    action: 'clicked'
  }],

  // Browsing
  productsSearched: [{
    object: 'products',
    action: 'searched'
  }],
  productListViewed: [{
    object: 'product list',
    action: 'viewed'
  }, {
    object: 'product category',
    action: 'viewed'
  }],
  productListFiltered: [{
    object: 'product list',
    action: 'filtered'
  }],

  // Core Ordering
  productClicked: [{
    object: 'product',
    action: 'clicked'
  }],
  productViewed: [{
    object: 'product',
    action: 'viewed'
  }],
  productAdded: [{
    object: 'product',
    action: 'added'
  }],
  productRemoved: [{
    object: 'product',
    action: 'removed'
  }],
  cartViewed: [{
    object: 'cart',
    action: 'viewed'
  }],
  orderUpdated: [{
    object: 'order',
    action: 'updated'
  }],
  orderCompleted: [{
    object: 'order',
    action: 'completed'
  }],
  orderRefunded: [{
    object: 'order',
    action: 'refunded'
  }],
  orderCancelled: [{
    object: 'order',
    action: 'cancelled'
  }],
  paymentInfoEntered: [{
    object: 'payment info',
    action: 'entered'
  }],
  checkoutStarted: [{
    object: 'checkout',
    action: 'started'
  }],
  checkoutStepViewed: [{
    object: 'checkout step',
    action: 'viewed'
  }],
  checkoutStepCompleted: [{
    object: 'checkout step',
    action: 'completed'
  }],

  // Coupons
  couponEntered: [{
    object: 'coupon',
    action: 'entered'
  }],
  couponApplied: [{
    object: 'coupon',
    action: 'applied'
  }],
  couponDenied: [{
    object: 'coupon',
    action: 'denied'
  }],
  couponRemoved: [{
    object: 'coupon',
    action: 'removed'
  }],

  // Wishlisting
  productAddedToWishlist: [{
    object: 'product',
    action: 'added to wishlist'
  }],
  productRemovedFromWishlist: [{
    object: 'product',
    action: 'removed from wishlist'
  }],
  productAddedFromWishlistToCart: [{
    object: 'product',
    action: 'added to cart from wishlist'
  }, {
    object: 'product',
    action: 'added from wishlist to cart'
  }],

  // Sharing
  productShared: [{
    object: 'product',
    action: 'shared'
  }],
  cartShared: [{
    object: 'cart',
    action: 'shared'
  }],

  // Reviewing
  productReviewed: [{
    object: 'product',
    action: 'reviewed'
  }],

  // App Lifecycle
  applicationInstalled: [{
    object: 'application',
    action: 'installed'
  }],
  applicationUpdated: [{
    object: 'application',
    action: 'updated'
  }],
  applicationOpened: [{
    object: 'application',
    action: 'opened'
  }],
  applicationBackgrounded: [{
    object: 'application',
    action: 'backgrounded'
  }],
  applicationUninstalled: [{
    object: 'application',
    action: 'uninstalled'
  }],
  applicationCrashed: [{
    object: 'application',
    action: 'crashed'
  }],

  // App Campaign and Referral Events
  installAttributed: [{
    object: 'install',
    action: 'attributed'
  }],
  deepLinkOpened: [{
    object: 'deep link',
    action: 'opened'
  }],
  pushNotificationReceived: [{
    object: 'push notification',
    action: 'received'
  }],
  pushNotificationTapped: [{
    object: 'push notification',
    action: 'tapped'
  }],
  pushNotificationBounced: [{
    object: 'push notification',
    action: 'bounced'
  }],

  // Email
  emailBounced: [{
    object: 'email',
    action: 'bounced'
  }],
  emailDelivered: [{
    object: 'email',
    action: 'delivered'
  }],
  emailLinkClicked: [{
    object: 'email link',
    action: 'clicked'
  }],
  emailMarkedAsSpam: [{
    object: 'email',
    action: 'marked as spam'
  }],
  emailOpened: [{
    object: 'email',
    action: 'opened'
  }],
  unsubscribed: [{
    object: '',
    action: 'unsubscribed'
  }]
};

/**
 * Export the event map
 *
 * For each method
 *   - For each of its object:action alias pairs
 *     - For each permutation of that pair
 *       - Create a regex string
 *   - Join them and assign it to its respective method value
 *
 *  [{
 *    object: 'product list',
 *    action: 'viewed'
 *  },{
 *    object: 'product category',
 *    action: 'viewed'
 *  }] => /
 *    ^[ _]?product[ _]?list[ _]?viewed[ _]?
 *   |^[ _]?viewed[ _]?product[ _]?list[ _]?
 *   |^[ _]?product[ _]?category[ _]?viewed[ _]?
 *   |^[ _]?viewed[ _]?product[ _]?category[ _]?
 *   $/i
 *
 *  todo(cs/wj/nh): memoization strategy / build step?
 */

module.exports = foldl(function transform(ret, pairs, method) {
  var values = map(function(pair) {
    return map(function(permutation) {
      var flattened = [].concat.apply([], map(function(words) {
        return words.split(' ');
      }, permutation));
      return '^[ _]?' + flattened.join('[ _]?') + '[ _]?';
    }, [
      [pair.action, pair.object],
      [pair.object, pair.action]
    ]).join('|');
  }, pairs);
  var conjoined = values.join('|') + '$';
  ret[method] = new RegExp(conjoined, 'i');
  return ret;
}, {}, eventMap);

;

},{"@ndhoule/foldl":36,"@ndhoule/map":39}],1258:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1259}],1259:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1260,"./statics":1261,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1263,"dup":14,"slug-component":1398}],1260:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1262,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1261:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1262:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1263:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1264,"_process":1273,"dup":11}],1264:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1265:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1266}],1266:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1267,"./statics":1268,"@ndhoule/clone":29,"@ndhoule/defaults":30,"@ndhoule/extend":35,"component-bind":1277,"debug":1270,"dup":14,"slug-component":1398}],1267:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1269,"component-emitter":1285,"dup":15,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1268:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":16}],1269:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":17}],1270:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1271,"_process":1273,"dup":11}],1271:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1272:[function(require,module,exports){
'use strict';

var bind = require('component-bind');

function bindAll(obj) {
  // eslint-disable-next-line guard-for-in
  for (var key in obj) {
    var val = obj[key];
    if (typeof val === 'function') {
      obj[key] = bind(obj, obj[key]);
    }
  }
  return obj;
}

module.exports = bindAll;

},{"component-bind":1277}],1273:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],1274:[function(require,module,exports){


module.exports = function() {};
;

},{"no-case":1361,"upper-case":1418}],1275:[function(require,module,exports){


module.exports = function() {};
;

},{"camel-case":1274,"constant-case":1296,"dot-case":1303,"header-case":1312,"is-lower-case":1318,"is-upper-case":1320,"lower-case":1342,"lower-case-first":1341,"no-case":1361,"param-case":1374,"pascal-case":1375,"path-case":1376,"sentence-case":1397,"snake-case":1399,"swap-case":1401,"title-case":1405,"upper-case":1418,"upper-case-first":1417}],1276:[function(require,module,exports){


module.exports = function() {};
;

},{}],1277:[function(require,module,exports){
/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

},{}],1278:[function(require,module,exports){

;
/**
 * Module dependencies.
 */

var type;
try {
  type = require('component-type');
} catch (_) {
  type = require('type');
}

/**
 * Module exports.
 */

module.exports = clone;

/**
 * Clones objects.
 *
 * @param {Mixed} any object
 * @api public
 */

function clone(obj){
  switch (type(obj)) {
    case 'object':
      var copy = {};
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          copy[key] = clone(obj[key]);
        }
      }
      return copy;

    case 'array':
      var copy = new Array(obj.length);
      for (var i = 0, l = obj.length; i < l; i++) {
        copy[i] = clone(obj[i]);
      }
      return copy;

    case 'regexp':
      // from millermedeiros/amd-utils - MIT
      var flags = '';
      flags += obj.multiline ? 'm' : '';
      flags += obj.global ? 'g' : '';
      flags += obj.ignoreCase ? 'i' : '';
      return new RegExp(obj.source, flags);

    case 'date':
      return new Date(obj.getTime());

    default: // string, number, boolean, …
      return obj;
  }
}

;

},{"component-type":1291,"type":1291}],1279:[function(require,module,exports){

/**
 * Module dependencies.
 */

var debug = require('debug')('cookie');

/**
 * Set or get cookie `name` with `value` and `options` object.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @return {Mixed}
 * @api public
 */

module.exports = function(name, value, options){
  switch (arguments.length) {
    case 3:
    case 2:
      return set(name, value, options);
    case 1:
      return get(name);
    default:
      return all();
  }
};

/**
 * Set cookie `name` to `value`.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @api private
 */

function set(name, value, options) {
  options = options || {};
  var str = encode(name) + '=' + encode(value);

  if (null == value) options.maxage = -1;

  if (options.maxage) {
    options.expires = new Date(+new Date + options.maxage);
  }

  if (options.path) str += '; path=' + options.path;
  if (options.domain) str += '; domain=' + options.domain;
  if (options.expires) str += '; expires=' + options.expires.toUTCString();
  if (options.secure) str += '; secure';

  document.cookie = str;
}

/**
 * Return all cookies.
 *
 * @return {Object}
 * @api private
 */

function all() {
  var str;
  try {
    str = document.cookie;
  } catch (err) {
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error(err.stack || err);
    }
    return {};
  }
  return parse(str);
}

/**
 * Get cookie `name`.
 *
 * @param {String} name
 * @return {String}
 * @api private
 */

function get(name) {
  return all()[name];
}

/**
 * Parse cookie `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parse(str) {
  var obj = {};
  var pairs = str.split(/ *; */);
  var pair;
  if ('' == pairs[0]) return obj;
  for (var i = 0; i < pairs.length; ++i) {
    pair = pairs[i].split('=');
    obj[decode(pair[0])] = decode(pair[1]);
  }
  return obj;
}

/**
 * Encode.
 */

function encode(value){
  try {
    return encodeURIComponent(value);
  } catch (e) {
    debug('error `encode(%o)` - %o', value, e)
  }
}

/**
 * Decode.
 */

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    debug('error `decode(%o)` - %o', value, e)
  }
}

},{"debug":1280}],1280:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"./debug":1281}],1281:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":1282}],1282:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],1283:[function(require,module,exports){

/**
 * Module dependencies.
 */

try {
  var type = require('type');
} catch (err) {
  var type = require('component-type');
}

var toFunction = require('to-function');

/**
 * HOP reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Iterate the given `obj` and invoke `fn(val, i)`
 * in optional context `ctx`.
 *
 * @param {String|Array|Object} obj
 * @param {Function} fn
 * @param {Object} [ctx]
 * @api public
 */

module.exports = function(obj, fn, ctx){
  fn = toFunction(fn);
  ctx = ctx || this;
  switch (type(obj)) {
    case 'array':
      return array(obj, fn, ctx);
    case 'object':
      if ('number' == typeof obj.length) return array(obj, fn, ctx);
      return object(obj, fn, ctx);
    case 'string':
      return string(obj, fn, ctx);
  }
};

/**
 * Iterate string chars.
 *
 * @param {String} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function string(obj, fn, ctx) {
  for (var i = 0; i < obj.length; ++i) {
    fn.call(ctx, obj.charAt(i), i);
  }
}

/**
 * Iterate object keys.
 *
 * @param {Object} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function object(obj, fn, ctx) {
  for (var key in obj) {
    if (has.call(obj, key)) {
      fn.call(ctx, key, obj[key]);
    }
  }
}

/**
 * Iterate array-ish.
 *
 * @param {Array|Object} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function array(obj, fn, ctx) {
  for (var i = 0; i < obj.length; ++i) {
    fn.call(ctx, obj[i], i);
  }
}

},{"component-type":1284,"to-function":1407,"type":1284}],1284:[function(require,module,exports){

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object String]': return 'string';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val && val.nodeType === 1) return 'element';
  if (val === Object(val)) return 'object';

  return typeof val;
};

},{}],1285:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }

  // Remove event specific arrays for event types that no
  // one is subscribed for to avoid memory leak.
  if (callbacks.length === 0) {
    delete this._callbacks['$' + event];
  }

  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};

  var args = new Array(arguments.length - 1)
    , callbacks = this._callbacks['$' + event];

  for (var i = 1; i < arguments.length; i++) {
    args[i - 1] = arguments[i];
  }

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],1286:[function(require,module,exports){
var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};
},{}],1287:[function(require,module,exports){


module.exports = function() {};
;

},{}],1288:[function(require,module,exports){
/**
 * Global Names
 */

var globals = /\b(Array|Date|Object|Math|JSON)\b/g;

/**
 * Return immediate identifiers parsed from `str`.
 *
 * @param {String} str
 * @param {String|Function} map function or prefix
 * @return {Array}
 * @api public
 */

module.exports = function(str, fn){
  var p = unique(props(str));
  if (fn && 'string' == typeof fn) fn = prefixed(fn);
  if (fn) return map(str, p, fn);
  return p;
};

/**
 * Return immediate identifiers in `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function props(str) {
  return str
    .replace(/\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\//g, '')
    .replace(globals, '')
    .match(/[a-zA-Z_]\w*/g)
    || [];
}

/**
 * Return `str` with `props` mapped with `fn`.
 *
 * @param {String} str
 * @param {Array} props
 * @param {Function} fn
 * @return {String}
 * @api private
 */

function map(str, props, fn) {
  var re = /\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g;
  return str.replace(re, function(_){
    if ('(' == _[_.length - 1]) return fn(_);
    if (!~props.indexOf(_)) return _;
    return fn(_);
  });
}

/**
 * Return unique array.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

function unique(arr) {
  var ret = [];

  for (var i = 0; i < arr.length; i++) {
    if (~ret.indexOf(arr[i])) continue;
    ret.push(arr[i]);
  }

  return ret;
}

/**
 * Map with prefix `str`.
 */

function prefixed(str) {
  return function(_){
    return str + _;
  };
}

},{}],1289:[function(require,module,exports){

/**
 * Module dependencies.
 */

var trim = require('trim');
var type = require('type');

var pattern = /(\w+)\[(\d+)\]/

/**
 * Safely encode the given string
 * 
 * @param {String} str
 * @return {String}
 * @api private
 */

var encode = function(str) {
  try {
    return encodeURIComponent(str);
  } catch (e) {
    return str;
  }
};

/**
 * Safely decode the string
 * 
 * @param {String} str
 * @return {String}
 * @api private
 */

var decode = function(str) {
  try {
    return decodeURIComponent(str.replace(/\+/g, ' '));
  } catch (e) {
    return str;
  }
}

/**
 * Parse the given query `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(str){
  if ('string' != typeof str) return {};

  str = trim(str);
  if ('' == str) return {};
  if ('?' == str.charAt(0)) str = str.slice(1);

  var obj = {};
  var pairs = str.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var parts = pairs[i].split('=');
    var key = decode(parts[0]);
    var m;

    if (m = pattern.exec(key)) {
      obj[m[1]] = obj[m[1]] || [];
      obj[m[1]][m[2]] = decode(parts[1]);
      continue;
    }

    obj[parts[0]] = null == parts[1]
      ? ''
      : decode(parts[1]);
  }

  return obj;
};

/**
 * Stringify the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

exports.stringify = function(obj){
  if (!obj) return '';
  var pairs = [];

  for (var key in obj) {
    var value = obj[key];

    if ('array' == type(value)) {
      for (var i = 0; i < value.length; ++i) {
        pairs.push(encode(key + '[' + i + ']') + '=' + encode(value[i]));
      }
      continue;
    }

    pairs.push(encode(key) + '=' + encode(obj[key]));
  }

  return pairs.join('&');
};

},{"trim":1413,"type":1290}],1290:[function(require,module,exports){
arguments[4][807][0].apply(exports,arguments)
},{"dup":807}],1291:[function(require,module,exports){
/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object Error]': return 'error';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val !== val) return 'nan';
  if (val && val.nodeType === 1) return 'element';

  if (isBuffer(val)) return 'buffer';

  val = val.valueOf
    ? val.valueOf()
    : Object.prototype.valueOf.apply(val);

  return typeof val;
};

// code borrowed from https://github.com/feross/is-buffer/blob/master/index.js
function isBuffer(obj) {
  return !!(obj != null &&
    (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
      (obj.constructor &&
      typeof obj.constructor.isBuffer === 'function' &&
      obj.constructor.isBuffer(obj))
    ))
}

},{}],1292:[function(require,module,exports){

/**
 * Parse the given `url`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(url){
  var a = document.createElement('a');
  a.href = url;
  return {
    href: a.href,
    host: a.host || location.host,
    port: ('0' === a.port || '' === a.port) ? port(a.protocol) : a.port,
    hash: a.hash,
    hostname: a.hostname || location.hostname,
    pathname: a.pathname.charAt(0) != '/' ? '/' + a.pathname : a.pathname,
    protocol: !a.protocol || ':' == a.protocol ? location.protocol : a.protocol,
    search: a.search,
    query: a.search.slice(1)
  };
};

/**
 * Check if `url` is absolute.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isAbsolute = function(url){
  return 0 == url.indexOf('//') || !!~url.indexOf('://');
};

/**
 * Check if `url` is relative.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isRelative = function(url){
  return !exports.isAbsolute(url);
};

/**
 * Check if `url` is cross domain.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isCrossDomain = function(url){
  url = exports.parse(url);
  var location = exports.parse(window.location.href);
  return url.hostname !== location.hostname
    || url.port !== location.port
    || url.protocol !== location.protocol;
};

/**
 * Return default port for `protocol`.
 *
 * @param  {String} protocol
 * @return {String}
 * @api private
 */
function port (protocol){
  switch (protocol) {
    case 'http:':
      return 80;
    case 'https:':
      return 443;
    default:
      return location.port;
  }
}

},{}],1293:[function(require,module,exports){


module.exports = function() {};
;

},{}],1294:[function(require,module,exports){


module.exports = function() {};
;

},{}],1295:[function(require,module,exports){


module.exports = function() {};
;

},{"utils-define-read-only-property":1421}],1296:[function(require,module,exports){


module.exports = function() {};
;

},{"snake-case":1399,"upper-case":1418}],1297:[function(require,module,exports){


module.exports = function() {};
;

},{}],1298:[function(require,module,exports){


module.exports = function() {};
;

},{}],1299:[function(require,module,exports){
var objectKeys = require('object-keys');
var isArguments = require('is-arguments');
var is = require('object-is');
var isRegex = require('is-regex');
var flags = require('regexp.prototype.flags');
var isDate = require('is-date-object');

var getTime = Date.prototype.getTime;

function deepEqual(actual, expected, options) {
  var opts = options || {};

  // 7.1. All identical values are equivalent, as determined by ===.
  if (opts.strict ? is(actual, expected) : actual === expected) {
    return true;
  }

  // 7.3. Other pairs that do not both pass typeof value == 'object', equivalence is determined by ==.
  if (!actual || !expected || (typeof actual !== 'object' && typeof expected !== 'object')) {
    return opts.strict ? is(actual, expected) : actual == expected;
  }

  /*
   * 7.4. For all other Object pairs, including Array objects, equivalence is
   * determined by having the same number of owned properties (as verified
   * with Object.prototype.hasOwnProperty.call), the same set of keys
   * (although not necessarily the same order), equivalent values for every
   * corresponding key, and an identical 'prototype' property. Note: this
   * accounts for both named and indexed properties on Arrays.
   */
  // eslint-disable-next-line no-use-before-define
  return objEquiv(actual, expected, opts);
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer(x) {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') {
    return false;
  }
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') {
    return false;
  }
  return true;
}

function objEquiv(a, b, opts) {
  /* eslint max-statements: [2, 50] */
  var i, key;
  if (typeof a !== typeof b) { return false; }
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) { return false; }

  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) { return false; }

  if (isArguments(a) !== isArguments(b)) { return false; }

  var aIsRegex = isRegex(a);
  var bIsRegex = isRegex(b);
  if (aIsRegex !== bIsRegex) { return false; }
  if (aIsRegex || bIsRegex) {
    return a.source === b.source && flags(a) === flags(b);
  }

  if (isDate(a) && isDate(b)) {
    return getTime.call(a) === getTime.call(b);
  }

  var aIsBuffer = isBuffer(a);
  var bIsBuffer = isBuffer(b);
  if (aIsBuffer !== bIsBuffer) { return false; }
  if (aIsBuffer || bIsBuffer) { // && would work too, because both are true or both false here
    if (a.length !== b.length) { return false; }
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) { return false; }
    }
    return true;
  }

  if (typeof a !== typeof b) { return false; }

  try {
    var ka = objectKeys(a);
    var kb = objectKeys(b);
  } catch (e) { // happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates hasOwnProperty)
  if (ka.length !== kb.length) { return false; }

  // the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  // ~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i]) { return false; }
  }
  // equivalent values for every corresponding key, and ~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) { return false; }
  }

  return true;
}

module.exports = deepEqual;

},{"is-arguments":1314,"is-date-object":1316,"is-regex":1319,"object-is":1367,"object-keys":1369,"regexp.prototype.flags":1379}],1300:[function(require,module,exports){
'use strict';

var keys = require('object-keys');
var hasSymbols = typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol';

var toStr = Object.prototype.toString;
var concat = Array.prototype.concat;
var origDefineProperty = Object.defineProperty;

var isFunction = function (fn) {
	return typeof fn === 'function' && toStr.call(fn) === '[object Function]';
};

var arePropertyDescriptorsSupported = function () {
	var obj = {};
	try {
		origDefineProperty(obj, 'x', { enumerable: false, value: obj });
		// eslint-disable-next-line no-unused-vars, no-restricted-syntax
		for (var _ in obj) { // jscs:ignore disallowUnusedVariables
			return false;
		}
		return obj.x === obj;
	} catch (e) { /* this is IE 8. */
		return false;
	}
};
var supportsDescriptors = origDefineProperty && arePropertyDescriptorsSupported();

var defineProperty = function (object, name, value, predicate) {
	if (name in object && (!isFunction(predicate) || !predicate())) {
		return;
	}
	if (supportsDescriptors) {
		origDefineProperty(object, name, {
			configurable: true,
			enumerable: false,
			value: value,
			writable: true
		});
	} else {
		object[name] = value;
	}
};

var defineProperties = function (object, map) {
	var predicates = arguments.length > 2 ? arguments[2] : {};
	var props = keys(map);
	if (hasSymbols) {
		props = concat.call(props, Object.getOwnPropertySymbols(map));
	}
	for (var i = 0; i < props.length; i += 1) {
		defineProperty(object, props[i], map[props[i]], predicates[props[i]]);
	}
};

defineProperties.supportsDescriptors = !!supportsDescriptors;

module.exports = defineProperties;

},{"object-keys":1369}],1301:[function(require,module,exports){

;
/**
 * Module dependencies.
 */

var nextTick = require('next-tick');

/**
 * Loop on a short interval until `condition()` is true, then call `fn`.
 *
 * @param {Function} condition
 * @param {Function} fn
 * @param {number} [interval=10]
 */

function when(condition, fn, interval) {
  if (typeof condition !== 'function') throw new Error('condition must be a function');
  if (typeof fn !== 'function') throw new Error('fn must be a function');

  if (condition()) return nextTick(fn);

  var ref = setInterval(function () {
    if (!condition()) return;
    nextTick(fn);
    clearInterval(ref);
  }, interval || 10);
}

/**
 * Exports.
 */

module.exports = when;

;

},{"next-tick":1360}],1302:[function(require,module,exports){

;

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Tests for browser support.
 */

var innerHTMLBug = false;
var bugTestDiv;
if (typeof document !== 'undefined') {
  bugTestDiv = document.createElement('div');
  // Setup
  bugTestDiv.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
  // Make sure that link elements get serialized correctly by innerHTML
  // This requires a wrapper element in IE
  innerHTMLBug = !bugTestDiv.getElementsByTagName('link').length;
  bugTestDiv = undefined;
}

/**
 * Wrap map from jquery.
 */

var map = {
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  // for script/link/style tags to work in IE6-8, you have to wrap
  // in a div with a non-whitespace character in front, ha!
  _default: innerHTMLBug ? [1, 'X<div>', '</div>'] : [0, '', '']
};

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

map.polyline =
map.ellipse =
map.polygon =
map.circle =
map.text =
map.line =
map.path =
map.rect =
map.g = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

/**
 * Parse `html` and return a DOM Node instance, which could be a TextNode,
 * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
 * instance, depending on the contents of the `html` string.
 *
 * @param {String} html - HTML string to "domify"
 * @param {Document} doc - The `document` instance to create the Node for
 * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance
 * @api private
 */

function parse(html, doc) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // default to the global `document` object
  if (!doc) doc = document;

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return doc.createTextNode(html);

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = doc.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = doc.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // one element
  if (el.firstChild == el.lastChild) {
    return el.removeChild(el.firstChild);
  }

  // several elements
  var fragment = doc.createDocumentFragment();
  while (el.firstChild) {
    fragment.appendChild(el.removeChild(el.firstChild));
  }

  return fragment;
}

;

},{}],1303:[function(require,module,exports){


module.exports = function() {};
;

},{"no-case":1361}],1304:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var defineProperty = Object.defineProperty;
var gOPD = Object.getOwnPropertyDescriptor;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) { /**/ }

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

// If name is '__proto__', and Object.defineProperty is available, define __proto__ as an own property on target
var setProperty = function setProperty(target, options) {
	if (defineProperty && options.name === '__proto__') {
		defineProperty(target, options.name, {
			enumerable: true,
			configurable: true,
			value: options.newValue,
			writable: true
		});
	} else {
		target[options.name] = options.newValue;
	}
};

// Return undefined instead of __proto__ if '__proto__' is not an own property
var getProperty = function getProperty(obj, name) {
	if (name === '__proto__') {
		if (!hasOwn.call(obj, name)) {
			return void 0;
		} else if (gOPD) {
			// In early versions of node, obj['__proto__'] is buggy when obj has
			// __proto__ as an own property. Object.getOwnPropertyDescriptor() works.
			return gOPD(obj, name).value;
		}
	}

	return obj[name];
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone;
	var target = arguments[0];
	var i = 1;
	var length = arguments.length;
	var deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}
	if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = getProperty(target, name);
				copy = getProperty(options, name);

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						setProperty(target, { name: name, newValue: extend(deep, clone, copy) });

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						setProperty(target, { name: name, newValue: copy });
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};

},{}],1305:[function(require,module,exports){
'use strict';

/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

},{}],1306:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

module.exports = Function.prototype.bind || implementation;

},{"./implementation":1305}],1307:[function(require,module,exports){

;

/**
 * Module dependencies.
 */

var debug = require('debug');

/**
 * Expose `generate`.
 */

module.exports = generate;

/**
 * Generate a global queue pushing method with `name`.
 *
 * @param {String} name
 * @param {Object} options
 *   @property {Boolean} wrap
 * @return {Function}
 */

function generate (name, options) {
  var log = debug('global-queue:' + name);
  options = options || {};

  return function (args) {
    args = [].slice.call(arguments);
    window[name] || (window[name] = []);
    log('%o', args);
    options.wrap === false
      ? window[name].push.apply(window[name], args)
      : window[name].push(args);
  };
}

;

},{"debug":1308}],1308:[function(require,module,exports){

;
arguments[4][11][0].apply(exports,arguments)
;

},{"./debug":1309,"_process":1273,"dup":11}],1309:[function(require,module,exports){

;
arguments[4][12][0].apply(exports,arguments)
;

},{"dup":12,"ms":1355}],1310:[function(require,module,exports){

/**
 * Module exports.
 *
 * Logic borrowed from Modernizr:
 *
 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
 */

try {
  module.exports = typeof XMLHttpRequest !== 'undefined' &&
    'withCredentials' in new XMLHttpRequest();
} catch (err) {
  // if XMLHttp support is disabled in IE then it will throw
  // when trying to create
  module.exports = false;
}

},{}],1311:[function(require,module,exports){
'use strict';

var bind = require('function-bind');

module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);

},{"function-bind":1306}],1312:[function(require,module,exports){


module.exports = function() {};
;

},{"no-case":1361,"upper-case":1418}],1313:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],1314:[function(require,module,exports){
'use strict';

var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
var toStr = Object.prototype.toString;

var isStandardArguments = function isArguments(value) {
	if (hasToStringTag && value && typeof value === 'object' && Symbol.toStringTag in value) {
		return false;
	}
	return toStr.call(value) === '[object Arguments]';
};

var isLegacyArguments = function isArguments(value) {
	if (isStandardArguments(value)) {
		return true;
	}
	return value !== null &&
		typeof value === 'object' &&
		typeof value.length === 'number' &&
		value.length >= 0 &&
		toStr.call(value) !== '[object Array]' &&
		toStr.call(value.callee) === '[object Function]';
};

var supportsStandardArguments = (function () {
	return isStandardArguments(arguments);
}());

isStandardArguments.isLegacyArguments = isLegacyArguments; // for tests

module.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;

},{}],1315:[function(require,module,exports){


module.exports = function() {};
;

},{}],1316:[function(require,module,exports){
'use strict';

var getDay = Date.prototype.getDay;
var tryDateObject = function tryDateObject(value) {
	try {
		getDay.call(value);
		return true;
	} catch (e) {
		return false;
	}
};

var toStr = Object.prototype.toString;
var dateClass = '[object Date]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isDateObject(value) {
	if (typeof value !== 'object' || value === null) { return false; }
	return hasToStringTag ? tryDateObject(value) : toStr.call(value) === dateClass;
};

},{}],1317:[function(require,module,exports){

module.exports = function isEmail (string) {
    return (/.+\@.+\..+/).test(string);
};
},{}],1318:[function(require,module,exports){


module.exports = function() {};
;

},{"lower-case":1342}],1319:[function(require,module,exports){
'use strict';

var has = require('has');
var regexExec = RegExp.prototype.exec;
var gOPD = Object.getOwnPropertyDescriptor;

var tryRegexExecCall = function tryRegexExec(value) {
	try {
		var lastIndex = value.lastIndex;
		value.lastIndex = 0;

		regexExec.call(value);
		return true;
	} catch (e) {
		return false;
	} finally {
		value.lastIndex = lastIndex;
	}
};
var toStr = Object.prototype.toString;
var regexClass = '[object RegExp]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isRegex(value) {
	if (!value || typeof value !== 'object') {
		return false;
	}
	if (!hasToStringTag) {
		return toStr.call(value) === regexClass;
	}

	var descriptor = gOPD(value, 'lastIndex');
	var hasLastIndexDataProperty = descriptor && has(descriptor, 'value');
	if (!hasLastIndexDataProperty) {
		return false;
	}

	return tryRegexExecCall(value);
};

},{"has":1311}],1320:[function(require,module,exports){


module.exports = function() {};
;

},{"upper-case":1418}],1321:[function(require,module,exports){
arguments[4][814][0].apply(exports,arguments)
},{"dup":814}],1322:[function(require,module,exports){


module.exports = function() {};
;

},{}],1323:[function(require,module,exports){


module.exports = function() {};
;

},{}],1324:[function(require,module,exports){


module.exports = function() {};
;

},{"_process":1273}],1325:[function(require,module,exports){


module.exports = function() {};
;

},{"_process":1273}],1326:[function(require,module,exports){
(function (global){
/*! JSON v3.3.2 | https://bestiejs.github.io/json3 | Copyright 2012-2015, Kit Cambridge, Benjamin Tan | http://kit.mit-license.org */
;(function () {
  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof define === "function" && define.amd;

  // A set of types used to distinguish objects from primitives.
  var objectTypes = {
    "function": true,
    "object": true
  };

  // Detect the `exports` object exposed by CommonJS implementations.
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  // Use the `global` object exposed by Node (including Browserify via
  // `insert-module-globals`), Narwhal, and Ringo as the default context,
  // and the `window` object in browsers. Rhino exports a `global` function
  // instead.
  var root = objectTypes[typeof window] && window || this,
      freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;

  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
    root = freeGlobal;
  }

  // Public: Initializes JSON 3 using the given `context` object, attaching the
  // `stringify` and `parse` functions to the specified `exports` object.
  function runInContext(context, exports) {
    context || (context = root.Object());
    exports || (exports = root.Object());

    // Native constructor aliases.
    var Number = context.Number || root.Number,
        String = context.String || root.String,
        Object = context.Object || root.Object,
        Date = context.Date || root.Date,
        SyntaxError = context.SyntaxError || root.SyntaxError,
        TypeError = context.TypeError || root.TypeError,
        Math = context.Math || root.Math,
        nativeJSON = context.JSON || root.JSON;

    // Delegate to the native `stringify` and `parse` implementations.
    if (typeof nativeJSON == "object" && nativeJSON) {
      exports.stringify = nativeJSON.stringify;
      exports.parse = nativeJSON.parse;
    }

    // Convenience aliases.
    var objectProto = Object.prototype,
        getClass = objectProto.toString,
        isProperty = objectProto.hasOwnProperty,
        undefined;

    // Internal: Contains `try...catch` logic used by other functions.
    // This prevents other functions from being deoptimized.
    function attempt(func, errorFunc) {
      try {
        func();
      } catch (exception) {
        if (errorFunc) {
          errorFunc();
        }
      }
    }

    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
    var isExtended = new Date(-3509827334573292);
    attempt(function () {
      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
      // results for certain dates in Opera >= 10.53.
      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
    });

    // Internal: Determines whether the native `JSON.stringify` and `parse`
    // implementations are spec-compliant. Based on work by Ken Snyder.
    function has(name) {
      if (has[name] != null) {
        // Return cached feature test result.
        return has[name];
      }
      var isSupported;
      if (name == "bug-string-char-index") {
        // IE <= 7 doesn't support accessing string characters using square
        // bracket notation. IE 8 only supports this for primitives.
        isSupported = "a"[0] != "a";
      } else if (name == "json") {
        // Indicates whether both `JSON.stringify` and `JSON.parse` are
        // supported.
        isSupported = has("json-stringify") && has("date-serialization") && has("json-parse");
      } else if (name == "date-serialization") {
        // Indicates whether `Date`s can be serialized accurately by `JSON.stringify`.
        isSupported = has("json-stringify") && isExtended;
        if (isSupported) {
          var stringify = exports.stringify;
          attempt(function () {
            isSupported =
              // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
              // serialize extended years.
              stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
              // The milliseconds are optional in ES 5, but required in 5.1.
              stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
              // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
              // four-digit years instead of six-digit years. Credits: @Yaffle.
              stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
              // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
              // values less than 1000. Credits: @Yaffle.
              stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
          });
        }
      } else {
        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
        // Test `JSON.stringify`.
        if (name == "json-stringify") {
          var stringify = exports.stringify, stringifySupported = typeof stringify == "function";
          if (stringifySupported) {
            // A test function object with a custom `toJSON` method.
            (value = function () {
              return 1;
            }).toJSON = value;
            attempt(function () {
              stringifySupported =
                // Firefox 3.1b1 and b2 serialize string, number, and boolean
                // primitives as object literals.
                stringify(0) === "0" &&
                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                // literals.
                stringify(new Number()) === "0" &&
                stringify(new String()) == '""' &&
                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                // does not define a canonical JSON representation (this applies to
                // objects with `toJSON` properties as well, *unless* they are nested
                // within an object or array).
                stringify(getClass) === undefined &&
                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                // FF 3.1b3 pass this test.
                stringify(undefined) === undefined &&
                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                // respectively, if the value is omitted entirely.
                stringify() === undefined &&
                // FF 3.1b1, 2 throw an error if the given value is not a number,
                // string, array, object, Boolean, or `null` literal. This applies to
                // objects with custom `toJSON` methods as well, unless they are nested
                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                // methods entirely.
                stringify(value) === "1" &&
                stringify([value]) == "[1]" &&
                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                // `"[null]"`.
                stringify([undefined]) == "[null]" &&
                // YUI 3.0.0b1 fails to serialize `null` literals.
                stringify(null) == "null" &&
                // FF 3.1b1, 2 halts serialization if an array contains a function:
                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                // elides non-JSON values from objects and arrays, unless they
                // define custom `toJSON` methods.
                stringify([undefined, getClass, null]) == "[null,null,null]" &&
                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                // where character escape codes are expected (e.g., `\b` => `\u0008`).
                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                stringify(null, value) === "1" &&
                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]";
            }, function () {
              stringifySupported = false;
            });
          }
          isSupported = stringifySupported;
        }
        // Test `JSON.parse`.
        if (name == "json-parse") {
          var parse = exports.parse, parseSupported;
          if (typeof parse == "function") {
            attempt(function () {
              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
              // Conforming implementations should also coerce the initial argument to
              // a string prior to parsing.
              if (parse("0") === 0 && !parse(false)) {
                // Simple parsing test.
                value = parse(serialized);
                parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                if (parseSupported) {
                  attempt(function () {
                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                    parseSupported = !parse('"\t"');
                  });
                  if (parseSupported) {
                    attempt(function () {
                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                      // certain octal literals.
                      parseSupported = parse("01") !== 1;
                    });
                  }
                  if (parseSupported) {
                    attempt(function () {
                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                      // points. These environments, along with FF 3.1b1 and 2,
                      // also allow trailing commas in JSON objects and arrays.
                      parseSupported = parse("1.") !== 1;
                    });
                  }
                }
              }
            }, function () {
              parseSupported = false;
            });
          }
          isSupported = parseSupported;
        }
      }
      return has[name] = !!isSupported;
    }
    has["bug-string-char-index"] = has["date-serialization"] = has["json"] = has["json-stringify"] = has["json-parse"] = null;

    if (!has("json")) {
      // Common `[[Class]]` name aliases.
      var functionClass = "[object Function]",
          dateClass = "[object Date]",
          numberClass = "[object Number]",
          stringClass = "[object String]",
          arrayClass = "[object Array]",
          booleanClass = "[object Boolean]";

      // Detect incomplete support for accessing string characters by index.
      var charIndexBuggy = has("bug-string-char-index");

      // Internal: Normalizes the `for...in` iteration algorithm across
      // environments. Each enumerated key is yielded to a `callback` function.
      var forOwn = function (object, callback) {
        var size = 0, Properties, dontEnums, property;

        // Tests for bugs in the current environment's `for...in` algorithm. The
        // `valueOf` property inherits the non-enumerable flag from
        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
        (Properties = function () {
          this.valueOf = 0;
        }).prototype.valueOf = 0;

        // Iterate over a new instance of the `Properties` class.
        dontEnums = new Properties();
        for (property in dontEnums) {
          // Ignore all properties inherited from `Object.prototype`.
          if (isProperty.call(dontEnums, property)) {
            size++;
          }
        }
        Properties = dontEnums = null;

        // Normalize the iteration algorithm.
        if (!size) {
          // A list of non-enumerable properties inherited from `Object.prototype`.
          dontEnums = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
          // properties.
          forOwn = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, length;
            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
            for (property in object) {
              // Gecko <= 1.0 enumerates the `prototype` property of functions under
              // certain conditions; IE does not.
              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                callback(property);
              }
            }
            // Manually invoke the callback for each non-enumerable property.
            for (length = dontEnums.length; property = dontEnums[--length];) {
              if (hasProperty.call(object, property)) {
                callback(property);
              }
            }
          };
        } else {
          // No bugs detected; use the standard `for...in` algorithm.
          forOwn = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
            for (property in object) {
              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                callback(property);
              }
            }
            // Manually invoke the callback for the `constructor` property due to
            // cross-environment inconsistencies.
            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
              callback(property);
            }
          };
        }
        return forOwn(object, callback);
      };

      // Public: Serializes a JavaScript `value` as a JSON string. The optional
      // `filter` argument may specify either a function that alters how object and
      // array members are serialized, or an array of strings and numbers that
      // indicates which properties should be serialized. The optional `width`
      // argument may be either a string or number that specifies the indentation
      // level of the output.
      if (!has("json-stringify") && !has("date-serialization")) {
        // Internal: A map of control characters and their escaped equivalents.
        var Escapes = {
          92: "\\\\",
          34: '\\"',
          8: "\\b",
          12: "\\f",
          10: "\\n",
          13: "\\r",
          9: "\\t"
        };

        // Internal: Converts `value` into a zero-padded string such that its
        // length is at least equal to `width`. The `width` must be <= 6.
        var leadingZeroes = "000000";
        var toPaddedString = function (width, value) {
          // The `|| 0` expression is necessary to work around a bug in
          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
          return (leadingZeroes + (value || 0)).slice(-width);
        };

        // Internal: Serializes a date object.
        var serializeDate = function (value) {
          var getData, year, month, date, time, hours, minutes, seconds, milliseconds;
          // Define additional utility methods if the `Date` methods are buggy.
          if (!isExtended) {
            var floor = Math.floor;
            // A mapping between the months of the year and the number of days between
            // January 1st and the first of the respective month.
            var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
            // Internal: Calculates the number of days between the Unix epoch and the
            // first day of the given month.
            var getDay = function (year, month) {
              return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
            };
            getData = function (value) {
              // Manually compute the year, month, date, hours, minutes,
              // seconds, and milliseconds if the `getUTC*` methods are
              // buggy. Adapted from @Yaffle's `date-shim` project.
              date = floor(value / 864e5);
              for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
              for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
              date = 1 + date - getDay(year, month);
              // The `time` value specifies the time within the day (see ES
              // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
              // to compute `A modulo B`, as the `%` operator does not
              // correspond to the `modulo` operation for negative numbers.
              time = (value % 864e5 + 864e5) % 864e5;
              // The hours, minutes, seconds, and milliseconds are obtained by
              // decomposing the time within the day. See section 15.9.1.10.
              hours = floor(time / 36e5) % 24;
              minutes = floor(time / 6e4) % 60;
              seconds = floor(time / 1e3) % 60;
              milliseconds = time % 1e3;
            };
          } else {
            getData = function (value) {
              year = value.getUTCFullYear();
              month = value.getUTCMonth();
              date = value.getUTCDate();
              hours = value.getUTCHours();
              minutes = value.getUTCMinutes();
              seconds = value.getUTCSeconds();
              milliseconds = value.getUTCMilliseconds();
            };
          }
          serializeDate = function (value) {
            if (value > -1 / 0 && value < 1 / 0) {
              // Dates are serialized according to the `Date#toJSON` method
              // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
              // for the ISO 8601 date time string format.
              getData(value);
              // Serialize extended years correctly.
              value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
              "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
              // Months, dates, hours, minutes, and seconds should have two
              // digits; milliseconds should have three.
              "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
              // Milliseconds are optional in ES 5.0, but required in 5.1.
              "." + toPaddedString(3, milliseconds) + "Z";
              year = month = date = hours = minutes = seconds = milliseconds = null;
            } else {
              value = null;
            }
            return value;
          };
          return serializeDate(value);
        };

        // For environments with `JSON.stringify` but buggy date serialization,
        // we override the native `Date#toJSON` implementation with a
        // spec-compliant one.
        if (has("json-stringify") && !has("date-serialization")) {
          // Internal: the `Date#toJSON` implementation used to override the native one.
          function dateToJSON (key) {
            return serializeDate(this);
          }

          // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
          var nativeStringify = exports.stringify;
          exports.stringify = function (source, filter, width) {
            var nativeToJSON = Date.prototype.toJSON;
            Date.prototype.toJSON = dateToJSON;
            var result = nativeStringify(source, filter, width);
            Date.prototype.toJSON = nativeToJSON;
            return result;
          }
        } else {
          // Internal: Double-quotes a string `value`, replacing all ASCII control
          // characters (characters with code unit values between 0 and 31) with
          // their escaped equivalents. This is an implementation of the
          // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
          var unicodePrefix = "\\u00";
          var escapeChar = function (character) {
            var charCode = character.charCodeAt(0), escaped = Escapes[charCode];
            if (escaped) {
              return escaped;
            }
            return unicodePrefix + toPaddedString(2, charCode.toString(16));
          };
          var reEscape = /[\x00-\x1f\x22\x5c]/g;
          var quote = function (value) {
            reEscape.lastIndex = 0;
            return '"' +
              (
                reEscape.test(value)
                  ? value.replace(reEscape, escapeChar)
                  : value
              ) +
              '"';
          };

          // Internal: Recursively serializes an object. Implements the
          // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
          var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
            var value, type, className, results, element, index, length, prefix, result;
            attempt(function () {
              // Necessary for host object support.
              value = object[property];
            });
            if (typeof value == "object" && value) {
              if (value.getUTCFullYear && getClass.call(value) == dateClass && value.toJSON === Date.prototype.toJSON) {
                value = serializeDate(value);
              } else if (typeof value.toJSON == "function") {
                value = value.toJSON(property);
              }
            }
            if (callback) {
              // If a replacement function was provided, call it to obtain the value
              // for serialization.
              value = callback.call(object, property, value);
            }
            // Exit early if value is `undefined` or `null`.
            if (value == undefined) {
              return value === undefined ? value : "null";
            }
            type = typeof value;
            // Only call `getClass` if the value is an object.
            if (type == "object") {
              className = getClass.call(value);
            }
            switch (className || type) {
              case "boolean":
              case booleanClass:
                // Booleans are represented literally.
                return "" + value;
              case "number":
              case numberClass:
                // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
                // `"null"`.
                return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
              case "string":
              case stringClass:
                // Strings are double-quoted and escaped.
                return quote("" + value);
            }
            // Recursively serialize objects and arrays.
            if (typeof value == "object") {
              // Check for cyclic structures. This is a linear search; performance
              // is inversely proportional to the number of unique nested objects.
              for (length = stack.length; length--;) {
                if (stack[length] === value) {
                  // Cyclic structures cannot be serialized by `JSON.stringify`.
                  throw TypeError();
                }
              }
              // Add the object to the stack of traversed objects.
              stack.push(value);
              results = [];
              // Save the current indentation level and indent one additional level.
              prefix = indentation;
              indentation += whitespace;
              if (className == arrayClass) {
                // Recursively serialize array elements.
                for (index = 0, length = value.length; index < length; index++) {
                  element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                  results.push(element === undefined ? "null" : element);
                }
                result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
              } else {
                // Recursively serialize object members. Members are selected from
                // either a user-specified list of property names, or the object
                // itself.
                forOwn(properties || value, function (property) {
                  var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                  if (element !== undefined) {
                    // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                    // is not the empty string, let `member` {quote(property) + ":"}
                    // be the concatenation of `member` and the `space` character."
                    // The "`space` character" refers to the literal space
                    // character, not the `space` {width} argument provided to
                    // `JSON.stringify`.
                    results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                  }
                });
                result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
              }
              // Remove the object from the traversed object stack.
              stack.pop();
              return result;
            }
          };

          // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
          exports.stringify = function (source, filter, width) {
            var whitespace, callback, properties, className;
            if (objectTypes[typeof filter] && filter) {
              className = getClass.call(filter);
              if (className == functionClass) {
                callback = filter;
              } else if (className == arrayClass) {
                // Convert the property names array into a makeshift set.
                properties = {};
                for (var index = 0, length = filter.length, value; index < length;) {
                  value = filter[index++];
                  className = getClass.call(value);
                  if (className == "[object String]" || className == "[object Number]") {
                    properties[value] = 1;
                  }
                }
              }
            }
            if (width) {
              className = getClass.call(width);
              if (className == numberClass) {
                // Convert the `width` to an integer and create a string containing
                // `width` number of space characters.
                if ((width -= width % 1) > 0) {
                  if (width > 10) {
                    width = 10;
                  }
                  for (whitespace = ""; whitespace.length < width;) {
                    whitespace += " ";
                  }
                }
              } else if (className == stringClass) {
                whitespace = width.length <= 10 ? width : width.slice(0, 10);
              }
            }
            // Opera <= 7.54u2 discards the values associated with empty string keys
            // (`""`) only if they are used directly within an object member list
            // (e.g., `!("" in { "": 1})`).
            return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
          };
        }
      }

      // Public: Parses a JSON source string.
      if (!has("json-parse")) {
        var fromCharCode = String.fromCharCode;

        // Internal: A map of escaped control characters and their unescaped
        // equivalents.
        var Unescapes = {
          92: "\\",
          34: '"',
          47: "/",
          98: "\b",
          116: "\t",
          110: "\n",
          102: "\f",
          114: "\r"
        };

        // Internal: Stores the parser state.
        var Index, Source;

        // Internal: Resets the parser state and throws a `SyntaxError`.
        var abort = function () {
          Index = Source = null;
          throw SyntaxError();
        };

        // Internal: Returns the next token, or `"$"` if the parser has reached
        // the end of the source string. A token may be a string, number, `null`
        // literal, or Boolean literal.
        var lex = function () {
          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
          while (Index < length) {
            charCode = source.charCodeAt(Index);
            switch (charCode) {
              case 9: case 10: case 13: case 32:
                // Skip whitespace tokens, including tabs, carriage returns, line
                // feeds, and space characters.
                Index++;
                break;
              case 123: case 125: case 91: case 93: case 58: case 44:
                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                // the current position.
                value = charIndexBuggy ? source.charAt(Index) : source[Index];
                Index++;
                return value;
              case 34:
                // `"` delimits a JSON string; advance to the next character and
                // begin parsing the string. String tokens are prefixed with the
                // sentinel `@` character to distinguish them from punctuators and
                // end-of-string tokens.
                for (value = "@", Index++; Index < length;) {
                  charCode = source.charCodeAt(Index);
                  if (charCode < 32) {
                    // Unescaped ASCII control characters (those with a code unit
                    // less than the space character) are not permitted.
                    abort();
                  } else if (charCode == 92) {
                    // A reverse solidus (`\`) marks the beginning of an escaped
                    // control character (including `"`, `\`, and `/`) or Unicode
                    // escape sequence.
                    charCode = source.charCodeAt(++Index);
                    switch (charCode) {
                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                        // Revive escaped control characters.
                        value += Unescapes[charCode];
                        Index++;
                        break;
                      case 117:
                        // `\u` marks the beginning of a Unicode escape sequence.
                        // Advance to the first character and validate the
                        // four-digit code point.
                        begin = ++Index;
                        for (position = Index + 4; Index < position; Index++) {
                          charCode = source.charCodeAt(Index);
                          // A valid sequence comprises four hexdigits (case-
                          // insensitive) that form a single hexadecimal value.
                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                            // Invalid Unicode escape sequence.
                            abort();
                          }
                        }
                        // Revive the escaped character.
                        value += fromCharCode("0x" + source.slice(begin, Index));
                        break;
                      default:
                        // Invalid escape sequence.
                        abort();
                    }
                  } else {
                    if (charCode == 34) {
                      // An unescaped double-quote character marks the end of the
                      // string.
                      break;
                    }
                    charCode = source.charCodeAt(Index);
                    begin = Index;
                    // Optimize for the common case where a string is valid.
                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
                      charCode = source.charCodeAt(++Index);
                    }
                    // Append the string as-is.
                    value += source.slice(begin, Index);
                  }
                }
                if (source.charCodeAt(Index) == 34) {
                  // Advance to the next character and return the revived string.
                  Index++;
                  return value;
                }
                // Unterminated string.
                abort();
              default:
                // Parse numbers and literals.
                begin = Index;
                // Advance past the negative sign, if one is specified.
                if (charCode == 45) {
                  isSigned = true;
                  charCode = source.charCodeAt(++Index);
                }
                // Parse an integer or floating-point value.
                if (charCode >= 48 && charCode <= 57) {
                  // Leading zeroes are interpreted as octal literals.
                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                    // Illegal octal literal.
                    abort();
                  }
                  isSigned = false;
                  // Parse the integer component.
                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                  // Floats cannot contain a leading decimal point; however, this
                  // case is already accounted for by the parser.
                  if (source.charCodeAt(Index) == 46) {
                    position = ++Index;
                    // Parse the decimal component.
                    for (; position < length; position++) {
                      charCode = source.charCodeAt(position);
                      if (charCode < 48 || charCode > 57) {
                        break;
                      }
                    }
                    if (position == Index) {
                      // Illegal trailing decimal.
                      abort();
                    }
                    Index = position;
                  }
                  // Parse exponents. The `e` denoting the exponent is
                  // case-insensitive.
                  charCode = source.charCodeAt(Index);
                  if (charCode == 101 || charCode == 69) {
                    charCode = source.charCodeAt(++Index);
                    // Skip past the sign following the exponent, if one is
                    // specified.
                    if (charCode == 43 || charCode == 45) {
                      Index++;
                    }
                    // Parse the exponential component.
                    for (position = Index; position < length; position++) {
                      charCode = source.charCodeAt(position);
                      if (charCode < 48 || charCode > 57) {
                        break;
                      }
                    }
                    if (position == Index) {
                      // Illegal empty exponent.
                      abort();
                    }
                    Index = position;
                  }
                  // Coerce the parsed value to a JavaScript number.
                  return +source.slice(begin, Index);
                }
                // A negative sign may only precede numbers.
                if (isSigned) {
                  abort();
                }
                // `true`, `false`, and `null` literals.
                var temp = source.slice(Index, Index + 4);
                if (temp == "true") {
                  Index += 4;
                  return true;
                } else if (temp == "fals" && source.charCodeAt(Index + 4 ) == 101) {
                  Index += 5;
                  return false;
                } else if (temp == "null") {
                  Index += 4;
                  return null;
                }
                // Unrecognized token.
                abort();
            }
          }
          // Return the sentinel `$` character if the parser has reached the end
          // of the source string.
          return "$";
        };

        // Internal: Parses a JSON `value` token.
        var get = function (value) {
          var results, hasMembers;
          if (value == "$") {
            // Unexpected end of input.
            abort();
          }
          if (typeof value == "string") {
            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
              // Remove the sentinel `@` character.
              return value.slice(1);
            }
            // Parse object and array literals.
            if (value == "[") {
              // Parses a JSON array, returning a new JavaScript array.
              results = [];
              for (;;) {
                value = lex();
                // A closing square bracket marks the end of the array literal.
                if (value == "]") {
                  break;
                }
                // If the array literal contains elements, the current token
                // should be a comma separating the previous element from the
                // next.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "]") {
                      // Unexpected trailing `,` in array literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each array element.
                    abort();
                  }
                } else {
                  hasMembers = true;
                }
                // Elisions and leading commas are not permitted.
                if (value == ",") {
                  abort();
                }
                results.push(get(value));
              }
              return results;
            } else if (value == "{") {
              // Parses a JSON object, returning a new JavaScript object.
              results = {};
              for (;;) {
                value = lex();
                // A closing curly brace marks the end of the object literal.
                if (value == "}") {
                  break;
                }
                // If the object literal contains members, the current token
                // should be a comma separator.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "}") {
                      // Unexpected trailing `,` in object literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each object member.
                    abort();
                  }
                } else {
                  hasMembers = true;
                }
                // Leading commas are not permitted, object property names must be
                // double-quoted strings, and a `:` must separate each property
                // name and value.
                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                  abort();
                }
                results[value.slice(1)] = get(lex());
              }
              return results;
            }
            // Unexpected token encountered.
            abort();
          }
          return value;
        };

        // Internal: Updates a traversed object member.
        var update = function (source, property, callback) {
          var element = walk(source, property, callback);
          if (element === undefined) {
            delete source[property];
          } else {
            source[property] = element;
          }
        };

        // Internal: Recursively traverses a parsed JSON object, invoking the
        // `callback` function for each value. This is an implementation of the
        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
        var walk = function (source, property, callback) {
          var value = source[property], length;
          if (typeof value == "object" && value) {
            // `forOwn` can't be used to traverse an array in Opera <= 8.54
            // because its `Object#hasOwnProperty` implementation returns `false`
            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
            if (getClass.call(value) == arrayClass) {
              for (length = value.length; length--;) {
                update(getClass, forOwn, value, length, callback);
              }
            } else {
              forOwn(value, function (property) {
                update(value, property, callback);
              });
            }
          }
          return callback.call(source, property, value);
        };

        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
        exports.parse = function (source, callback) {
          var result, value;
          Index = 0;
          Source = "" + source;
          result = get(lex());
          // If a JSON string contains multiple tokens, it is invalid.
          if (lex() != "$") {
            abort();
          }
          // Reset the parser state.
          Index = Source = null;
          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
        };
      }
    }

    exports.runInContext = runInContext;
    return exports;
  }

  if (freeExports && !isLoader) {
    // Export for CommonJS environments.
    runInContext(root, freeExports);
  } else {
    // Export for web browsers and JavaScript engines.
    var nativeJSON = root.JSON,
        previousJSON = root.JSON3,
        isRestored = false;

    var JSON3 = runInContext(root, (root.JSON3 = {
      // Public: Restores the original value of the global `JSON` object and
      // returns a reference to the `JSON3` object.
      "noConflict": function () {
        if (!isRestored) {
          isRestored = true;
          root.JSON = nativeJSON;
          root.JSON3 = previousJSON;
          nativeJSON = previousJSON = null;
        }
        return JSON3;
      }
    }));

    root.JSON = {
      "parse": JSON3.parse,
      "stringify": JSON3.stringify
    };
  }

  // Export for asynchronous module loaders.
  if (isLoader) {
    define(function () {
      return JSON3;
    });
  }
}).call(this);

}).call(this,typeof window !== "undefined" && window.document && window.document.implementation ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {})
},{}],1327:[function(require,module,exports){
/**
 * Module dependencies
 */

var debug = require('debug')('jsonp');

/**
 * Module exports.
 */

module.exports = jsonp;

/**
 * Callback index.
 */

var count = 0;

/**
 * Noop function.
 */

function noop(){}

/**
 * JSONP handler
 *
 * Options:
 *  - param {String} qs parameter (`callback`)
 *  - prefix {String} qs parameter (`__jp`)
 *  - name {String} qs parameter (`prefix` + incr)
 *  - timeout {Number} how long after a timeout error is emitted (`60000`)
 *
 * @param {String} url
 * @param {Object|Function} optional options / callback
 * @param {Function} optional callback
 */

function jsonp(url, opts, fn){
  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }
  if (!opts) opts = {};

  var prefix = opts.prefix || '__jp';

  // use the callback name that was passed if one was provided.
  // otherwise generate a unique name by incrementing our counter.
  var id = opts.name || (prefix + (count++));

  var param = opts.param || 'callback';
  var timeout = null != opts.timeout ? opts.timeout : 60000;
  var enc = encodeURIComponent;
  var target = document.getElementsByTagName('script')[0] || document.head;
  var script;
  var timer;


  if (timeout) {
    timer = setTimeout(function(){
      cleanup();
      if (fn) fn(new Error('Timeout'));
    }, timeout);
  }

  function cleanup(){
    if (script.parentNode) script.parentNode.removeChild(script);
    window[id] = noop;
    if (timer) clearTimeout(timer);
  }

  function cancel(){
    if (window[id]) {
      cleanup();
    }
  }

  window[id] = function(data){
    debug('jsonp got', data);
    cleanup();
    if (fn) fn(null, data);
  };

  // add qs component
  url += (~url.indexOf('?') ? '&' : '?') + param + '=' + enc(id);
  url = url.replace('?&', '?');

  debug('jsonp req "%s"', url);

  // create script
  script = document.createElement('script');
  script.src = url;
  target.parentNode.insertBefore(script, target);

  return cancel;
}

},{"debug":1328}],1328:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"./debug":1329,"_process":1273,"dup":11}],1329:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"dup":12,"ms":1355}],1330:[function(require,module,exports){


var integration = require('@segment/analytics.js-integration');
module.exports = function() {};
module.exports.Integration = integration('empty');


},{"@segment/analytics.js-integration":1331}],1331:[function(require,module,exports){


module.exports = function() {};
;

},{"./protos":1332,"./statics":1333,"@ndhoule/defaults":30,"component-bind":1277,"debug":1334,"dup":7,"extend":1336,"slug-component":1398}],1332:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/after":27,"@ndhoule/each":32,"@ndhoule/every":34,"@ndhoule/foldl":36,"@segment/fmt":1198,"@segment/load-script":1202,"analytics-events":1257,"component-emitter":1285,"dup":8,"is":1321,"load-iframe":1337,"next-tick":1360,"to-no-case":1408}],1333:[function(require,module,exports){


module.exports = function() {};
;

},{"@ndhoule/each":32,"@ndhoule/includes":37,"component-emitter":1285,"domify":1302,"dup":9}],1334:[function(require,module,exports){


module.exports = function() {};
;

},{"./debug":1335,"_process":1273,"dup":11}],1335:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":12,"ms":1355}],1336:[function(require,module,exports){


module.exports = function() {};
;

},{"dup":10}],1337:[function(require,module,exports){

;
/**
 * Module dependencies.
 */

var is = require('is');
var onload = require('script-onload');
var tick = require('next-tick');

/**
 * Expose `loadScript`.
 *
 * @param {Object} options
 * @param {Function} fn
 * @api public
 */

module.exports = function loadIframe(options, fn){
  if (!options) throw new Error('Cant load nothing...');

  // Allow for the simplest case, just passing a `src` string.
  if (is.string(options)) options = { src : options };

  var https = document.location.protocol === 'https:' ||
              document.location.protocol === 'chrome-extension:';

  // If you use protocol relative URLs, third-party scripts like Google
  // Analytics break when testing with `file:` so this fixes that.
  if (options.src && options.src.indexOf('//') === 0) {
    options.src = https ? 'https:' + options.src : 'http:' + options.src;
  }

  // Allow them to pass in different URLs depending on the protocol.
  if (https && options.https) options.src = options.https;
  else if (!https && options.http) options.src = options.http;

  // Make the `<iframe>` element and insert it before the first iframe on the
  // page, which is guaranteed to exist since this Javaiframe is running.
  var iframe = document.createElement('iframe');
  iframe.src = options.src;
  iframe.width = options.width || 1;
  iframe.height = options.height || 1;
  iframe.style.display = 'none';

  // If we have a fn, attach event handlers, even in IE. Based off of
  // the Third-Party Javascript script loading example:
  // https://github.com/thirdpartyjs/thirdpartyjs-code/blob/master/examples/templates/02/loading-files/index.html
  if (is.fn(fn)) {
    onload(iframe, fn);
  }

  tick(function(){
    // Append after event listeners are attached for IE.
    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(iframe, firstScript);
  });

  // Return the iframe element in case they want to do anything special, like
  // give it an ID or attributes.
  return iframe;
};

;

},{"is":1321,"next-tick":1360,"script-onload":1383}],1338:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    symbolTag = '[object Symbol]';

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/,
    reLeadingDot = /^\./,
    rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Symbol = root.Symbol,
    splice = arrayProto.splice;

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map'),
    nativeCreate = getNative(Object, 'create');

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = isKey(path, object) ? [path] : castPath(path);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value) {
  return isArray(value) ? value : stringToPath(value);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoize(function(string) {
  string = toString(string);

  var result = [];
  if (reLeadingDot.test(string)) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, string) {
    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result);
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Assign cache to `_.memoize`.
memoize.Cache = MapCache;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

module.exports = get;

}).call(this,typeof window !== "undefined" && window.document && window.document.implementation ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {})
},{}],1339:[function(require,module,exports){


module.exports = function() {};
;

},{}],1340:[function(require,module,exports){


module.exports = function() {};
;

},{}],1341:[function(require,module,exports){


module.exports = function() {};
;

},{"lower-case":1342}],1342:[function(require,module,exports){


module.exports = function() {};
;

},{}],1343:[function(require,module,exports){


module.exports = function() {};
;

},{}],1344:[function(require,module,exports){


module.exports = function() {};
;

},{"math-float64-from-words":1346,"math-float64-get-high-word":1349,"math-float64-to-words":1352}],1345:[function(require,module,exports){


module.exports = function() {};
;

},{"math-float64-get-high-word":1349}],1346:[function(require,module,exports){
'use strict';

// MODULES //

var indices = require( './indices.js' );


// NOTES //

/**
* float64 (64 bits)
* f := fraction (significand/mantissa) (52 bits)
* e := exponent (11 bits)
* s := sign bit (1 bit)
*
* |-------- -------- -------- -------- -------- -------- -------- --------|
* |                                Float64                                |
* |-------- -------- -------- -------- -------- -------- -------- --------|
* |              Uint32               |               Uint32              |
* |-------- -------- -------- -------- -------- -------- -------- --------|
*
* If little endian (more significant bits last):
*                         <-- lower      higher -->
* |   f7       f6       f5       f4       f3       f2    e2 | f1 |s|  e1  |
*
* If big endian (more significant bits first):
*                         <-- higher      lower -->
* |s| e1    e2 | f1     f2       f3       f4       f5        f6      f7   |
*
*
* Note: in which Uint32 should we place the higher order bits? If LE, the second; if BE, the first.
* Refs: http://pubs.opengroup.org/onlinepubs/9629399/chap14.htm
*/


// VARIABLES //

var FLOAT64_VIEW = new Float64Array( 1 );
var UINT32_VIEW = new Uint32Array( FLOAT64_VIEW.buffer );

var HIGH = indices.HIGH;
var LOW = indices.LOW;


// TO FLOAT64 //

/**
* FUNCTION: toFloat64( high, low )
*	Creates a double-precision floating-point number from a higher order word (32-bit integer) and a lower order word (32-bit integer).
*
* @param {Number} high - higher order word (unsigned 32-bit integer)
* @param {Number} low - lower order word (unsigned 32-bit integer)
* @returns {Number} floating-point number
*/
function toFloat64( high, low ) {
	UINT32_VIEW[ HIGH ] = high;
	UINT32_VIEW[ LOW ] = low;
	return FLOAT64_VIEW[ 0 ];
} // end FUNCTION toFloat64()


// EXPORTS //

module.exports = toFloat64;

},{"./indices.js":1347}],1347:[function(require,module,exports){


module.exports = function() {};
;

},{"utils-is-little-endian":1423}],1348:[function(require,module,exports){


module.exports = function() {};
;

},{"utils-is-little-endian":1423}],1349:[function(require,module,exports){
'use strict';

// MODULES //

var HIGH = require( './high.js' );


// NOTES //

/**
* float64 (64 bits)
* f := fraction (significand/mantissa) (52 bits)
* e := exponent (11 bits)
* s := sign bit (1 bit)
*
* |-------- -------- -------- -------- -------- -------- -------- --------|
* |                                Float64                                |
* |-------- -------- -------- -------- -------- -------- -------- --------|
* |              Uint32               |               Uint32              |
* |-------- -------- -------- -------- -------- -------- -------- --------|
*
* If little endian (more significant bits last):
*                         <-- lower      higher -->
* |   f7       f6       f5       f4       f3       f2    e2 | f1 |s|  e1  |
*
* If big endian (more significant bits first):
*                         <-- higher      lower -->
* |s| e1    e2 | f1     f2       f3       f4       f5        f6      f7   |
*
*
* Note: in which Uint32 can we find the higher order bits? If LE, the second; if BE, the first.
* Refs: http://pubs.opengroup.org/onlinepubs/9629399/chap14.htm
*/


// VARIABLES //

var FLOAT64_VIEW = new Float64Array( 1 );
var UINT32_VIEW = new Uint32Array( FLOAT64_VIEW.buffer );


// HIGH WORD //

/**
* FUNCTION: highWord( x )
*	Returns an unsigned 32-bit integer corresponding to the more significant 32 bits of a double-precision floating-point number.
*
* @param {Number} x - input value
* @returns {Number} higher order word
*/
function highWord( x ) {
	FLOAT64_VIEW[ 0 ] = x;
	return UINT32_VIEW[ HIGH ];
} // end FUNCTION highWord()


// EXPORTS //

module.exports = highWord;

},{"./high.js":1348}],1350:[function(require,module,exports){


module.exports = function() {};
;

},{"const-ninf-float64":1293,"const-pinf-float64":1294,"math-float64-copysign":1344,"math-float64-exponent":1345,"math-float64-from-words":1346,"math-float64-normalize":1351,"math-float64-to-words":1352}],1351:[function(require,module,exports){


module.exports = function() {};
;

},{"const-smallest-float64":1295,"math-abs":1343,"validate.io-infinite":1429}],1352:[function(require,module,exports){
'use strict';

// MODULES //

var indices = require( './indices.js' );


// NOTES //

/**
* float64 (64 bits)
* f := fraction (significand/mantissa) (52 bits)
* e := exponent (11 bits)
* s := sign bit (1 bit)
*
* |-------- -------- -------- -------- -------- -------- -------- --------|
* |                                Float64                                |
* |-------- -------- -------- -------- -------- -------- -------- --------|
* |              Uint32               |               Uint32              |
* |-------- -------- -------- -------- -------- -------- -------- --------|
*
* If little endian (more significant bits last):
*                         <-- lower      higher -->
* |   f7       f6       f5       f4       f3       f2    e2 | f1 |s|  e1  |
*
* If big endian (more significant bits first):
*                         <-- higher      lower -->
* |s| e1    e2 | f1     f2       f3       f4       f5        f6      f7   |
*
*
* Note: in which Uint32 can we find the higher order bits? If LE, the second; if BE, the first.
* Refs: http://pubs.opengroup.org/onlinepubs/9629399/chap14.htm
*/


// VARIABLES //

var FLOAT64_VIEW = new Float64Array( 1 );
var UINT32_VIEW = new Uint32Array( FLOAT64_VIEW.buffer );

var HIGH = indices.HIGH;
var LOW = indices.LOW;


// WORDS //

/**
* FUNCTION: words( x )
*	Splits a floating-point number into a higher order word (32-bit integer) and a lower order word (32-bit integer).
*
* @param {Number} x - input value
* @returns {Number[]} two-element array containing a higher order word and a lower order word
*/
function words( x ) {
	FLOAT64_VIEW[ 0 ] = x;
	return [ UINT32_VIEW[ HIGH ], UINT32_VIEW[ LOW ] ];
} // end FUNCTION words()


// EXPORTS //

module.exports = words;

},{"./indices.js":1353}],1353:[function(require,module,exports){


module.exports = function() {};
;

},{"utils-is-little-endian":1423}],1354:[function(require,module,exports){


module.exports = function() {};
;

},{"charenc":1276,"crypt":1297,"is-buffer":1315}],1355:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],1356:[function(require,module,exports){
'use strict';

var is = require('is');
var isodate = require('@segment/isodate');
var milliseconds = require('./milliseconds');
var seconds = require('./seconds');

/**
 * Returns a new Javascript Date object, allowing a variety of extra input types
 * over the native Date constructor.
 *
 * @param {Date|string|number} val
 */
module.exports = function newDate(val) {
  if (is.date(val)) return val;
  if (is.number(val)) return new Date(toMs(val));

  // date strings
  if (isodate.is(val)) {
    return isodate.parse(val);
  }
  if (milliseconds.is(val)) {
    return milliseconds.parse(val);
  }
  if (seconds.is(val)) {
    return seconds.parse(val);
  }

  // fallback to Date.parse
  return new Date(val);
};


/**
 * If the number passed val is seconds from the epoch, turn it into milliseconds.
 * Milliseconds would be greater than 31557600000 (December 31, 1970).
 *
 * @param {number} num
 */
function toMs(num) {
  if (num < 31557600000) return num * 1000;
  return num;
}

},{"./milliseconds":1357,"./seconds":1358,"@segment/isodate":1359,"is":1321}],1357:[function(require,module,exports){
'use strict';

/**
 * Matcher.
 */

var matcher = /\d{13}/;


/**
 * Check whether a string is a millisecond date string.
 *
 * @param {string} string
 * @return {boolean}
 */
exports.is = function(string) {
  return matcher.test(string);
};


/**
 * Convert a millisecond string to a date.
 *
 * @param {string} millis
 * @return {Date}
 */
exports.parse = function(millis) {
  millis = parseInt(millis, 10);
  return new Date(millis);
};

},{}],1358:[function(require,module,exports){
'use strict';

/**
 * Matcher.
 */

var matcher = /\d{10}/;


/**
 * Check whether a string is a second date string.
 *
 * @param {string} string
 * @return {Boolean}
 */
exports.is = function(string) {
  return matcher.test(string);
};


/**
 * Convert a second string to a date.
 *
 * @param {string} seconds
 * @return {Date}
 */
exports.parse = function(seconds) {
  var millis = parseInt(seconds, 10) * 1000;
  return new Date(millis);
};

},{}],1359:[function(require,module,exports){
'use strict';

/**
 * Matcher, slightly modified from:
 *
 * https://github.com/csnover/js-iso8601/blob/lax/iso8601.js
 */

var matcher = /^(\d{4})(?:-?(\d{2})(?:-?(\d{2}))?)?(?:([ T])(\d{2}):?(\d{2})(?::?(\d{2})(?:[,\.](\d{1,}))?)?(?:(Z)|([+\-])(\d{2})(?::?(\d{2}))?)?)?$/;

/**
 * Convert an ISO date string to a date. Fallback to native `Date.parse`.
 *
 * https://github.com/csnover/js-iso8601/blob/lax/iso8601.js
 *
 * @param {String} iso
 * @return {Date}
 */

exports.parse = function(iso) {
  var numericKeys = [1, 5, 6, 7, 11, 12];
  var arr = matcher.exec(iso);
  var offset = 0;

  // fallback to native parsing
  if (!arr) {
    return new Date(iso);
  }

  /* eslint-disable no-cond-assign */
  // remove undefined values
  for (var i = 0, val; val = numericKeys[i]; i++) {
    arr[val] = parseInt(arr[val], 10) || 0;
  }
  /* eslint-enable no-cond-assign */

  // allow undefined days and months
  arr[2] = parseInt(arr[2], 10) || 1;
  arr[3] = parseInt(arr[3], 10) || 1;

  // month is 0-11
  arr[2]--;

  // allow abitrary sub-second precision
  arr[8] = arr[8] ? (arr[8] + '00').substring(0, 3) : 0;

  // apply timezone if one exists
  if (arr[4] === ' ') {
    offset = new Date().getTimezoneOffset();
  } else if (arr[9] !== 'Z' && arr[10]) {
    offset = arr[11] * 60 + arr[12];
    if (arr[10] === '+') {
      offset = 0 - offset;
    }
  }

  var millis = Date.UTC(arr[1], arr[2], arr[3], arr[5], arr[6] + offset, arr[7], arr[8]);
  return new Date(millis);
};


/**
 * Checks whether a `string` is an ISO date string. `strict` mode requires that
 * the date string at least have a year, month and date.
 *
 * @param {String} string
 * @param {Boolean} strict
 * @return {Boolean}
 */

exports.is = function(string, strict) {
  if (strict && (/^\d{4}-\d{2}-\d{2}/).test(string) === false) {
    return false;
  }
  return matcher.test(string);
};

},{}],1360:[function(require,module,exports){
arguments[4][391][0].apply(exports,arguments)
},{"_process":1273,"dup":391,"timers":1403}],1361:[function(require,module,exports){


module.exports = function() {};
;

},{"./vendor/camel-case-regexp":1362,"./vendor/camel-case-upper-regexp":1363,"./vendor/non-word-regexp":1364,"lower-case":1342}],1362:[function(require,module,exports){


module.exports = function() {};
;

},{}],1363:[function(require,module,exports){


module.exports = function() {};
;

},{}],1364:[function(require,module,exports){


module.exports = function() {};
;

},{}],1365:[function(require,module,exports){

var identity = function(_){ return _; };


/**
 * Module exports, export
 */

module.exports = multiple(find);
module.exports.find = module.exports;


/**
 * Export the replacement function, return the modified object
 */

module.exports.replace = function (obj, key, val, options) {
  multiple(replace).call(this, obj, key, val, options);
  return obj;
};


/**
 * Export the delete function, return the modified object
 */

module.exports.del = function (obj, key, options) {
  multiple(del).call(this, obj, key, null, options);
  return obj;
};


/**
 * Compose applying the function to a nested key
 */

function multiple (fn) {
  return function (obj, path, val, options) {
    normalize = options && isFunction(options.normalizer) ? options.normalizer : defaultNormalize;
    path = normalize(path);

    var key;
    var finished = false;

    while (!finished) loop();

    function loop() {
      for (key in obj) {
        var normalizedKey = normalize(key);
        if (0 === path.indexOf(normalizedKey)) {
          var temp = path.substr(normalizedKey.length);
          if (temp.charAt(0) === '.' || temp.length === 0) {
            path = temp.substr(1);
            var child = obj[key];

            // we're at the end and there is nothing.
            if (null == child) {
              finished = true;
              return;
            }

            // we're at the end and there is something.
            if (!path.length) {
              finished = true;
              return;
            }

            // step into child
            obj = child;

            // but we're done here
            return;
          }
        }
      }

      key = undefined;
      // if we found no matching properties
      // on the current object, there's no match.
      finished = true;
    }

    if (!key) return;
    if (null == obj) return obj;

    // the `obj` and `key` is one above the leaf object and key, so
    // start object: { a: { 'b.c': 10 } }
    // end object: { 'b.c': 10 }
    // end key: 'b.c'
    // this way, you can do `obj[key]` and get `10`.
    return fn(obj, key, val);
  };
}


/**
 * Find an object by its key
 *
 * find({ first_name : 'Calvin' }, 'firstName')
 */

function find (obj, key) {
  if (obj.hasOwnProperty(key)) return obj[key];
}


/**
 * Delete a value for a given key
 *
 * del({ a : 'b', x : 'y' }, 'X' }) -> { a : 'b' }
 */

function del (obj, key) {
  if (obj.hasOwnProperty(key)) delete obj[key];
  return obj;
}


/**
 * Replace an objects existing value with a new one
 *
 * replace({ a : 'b' }, 'a', 'c') -> { a : 'c' }
 */

function replace (obj, key, val) {
  if (obj.hasOwnProperty(key)) obj[key] = val;
  return obj;
}

/**
 * Normalize a `dot.separated.path`.
 *
 * A.HELL(!*&#(!)O_WOR   LD.bar => ahelloworldbar
 *
 * @param {String} path
 * @return {String}
 */

function defaultNormalize(path) {
  return path.replace(/[^a-zA-Z0-9\.]+/g, '').toLowerCase();
}

/**
 * Check if a value is a function.
 *
 * @param {*} val
 * @return {boolean} Returns `true` if `val` is a function, otherwise `false`.
 */

function isFunction(val) {
  return typeof val === 'function';
}

},{}],1366:[function(require,module,exports){


module.exports = function() {};
;

},{}],1367:[function(require,module,exports){
"use strict";

/* https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.is */

var NumberIsNaN = function (value) {
	return value !== value;
};

module.exports = function is(a, b) {
	if (a === 0 && b === 0) {
		return 1 / a === 1 / b;
	} else if (a === b) {
		return true;
	} else if (NumberIsNaN(a) && NumberIsNaN(b)) {
		return true;
	}
	return false;
};


},{}],1368:[function(require,module,exports){
'use strict';

var keysShim;
if (!Object.keys) {
	// modified from https://github.com/es-shims/es5-shim
	var has = Object.prototype.hasOwnProperty;
	var toStr = Object.prototype.toString;
	var isArgs = require('./isArguments'); // eslint-disable-line global-require
	var isEnumerable = Object.prototype.propertyIsEnumerable;
	var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
	var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
	var dontEnums = [
		'toString',
		'toLocaleString',
		'valueOf',
		'hasOwnProperty',
		'isPrototypeOf',
		'propertyIsEnumerable',
		'constructor'
	];
	var equalsConstructorPrototype = function (o) {
		var ctor = o.constructor;
		return ctor && ctor.prototype === o;
	};
	var excludedKeys = {
		$applicationCache: true,
		$console: true,
		$external: true,
		$frame: true,
		$frameElement: true,
		$frames: true,
		$innerHeight: true,
		$innerWidth: true,
		$onmozfullscreenchange: true,
		$onmozfullscreenerror: true,
		$outerHeight: true,
		$outerWidth: true,
		$pageXOffset: true,
		$pageYOffset: true,
		$parent: true,
		$scrollLeft: true,
		$scrollTop: true,
		$scrollX: true,
		$scrollY: true,
		$self: true,
		$webkitIndexedDB: true,
		$webkitStorageInfo: true,
		$window: true
	};
	var hasAutomationEqualityBug = (function () {
		/* global window */
		if (typeof window === 'undefined') { return false; }
		for (var k in window) {
			try {
				if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
					try {
						equalsConstructorPrototype(window[k]);
					} catch (e) {
						return true;
					}
				}
			} catch (e) {
				return true;
			}
		}
		return false;
	}());
	var equalsConstructorPrototypeIfNotBuggy = function (o) {
		/* global window */
		if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
			return equalsConstructorPrototype(o);
		}
		try {
			return equalsConstructorPrototype(o);
		} catch (e) {
			return false;
		}
	};

	keysShim = function keys(object) {
		var isObject = object !== null && typeof object === 'object';
		var isFunction = toStr.call(object) === '[object Function]';
		var isArguments = isArgs(object);
		var isString = isObject && toStr.call(object) === '[object String]';
		var theKeys = [];

		if (!isObject && !isFunction && !isArguments) {
			throw new TypeError('Object.keys called on a non-object');
		}

		var skipProto = hasProtoEnumBug && isFunction;
		if (isString && object.length > 0 && !has.call(object, 0)) {
			for (var i = 0; i < object.length; ++i) {
				theKeys.push(String(i));
			}
		}

		if (isArguments && object.length > 0) {
			for (var j = 0; j < object.length; ++j) {
				theKeys.push(String(j));
			}
		} else {
			for (var name in object) {
				if (!(skipProto && name === 'prototype') && has.call(object, name)) {
					theKeys.push(String(name));
				}
			}
		}

		if (hasDontEnumBug) {
			var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

			for (var k = 0; k < dontEnums.length; ++k) {
				if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
					theKeys.push(dontEnums[k]);
				}
			}
		}
		return theKeys;
	};
}
module.exports = keysShim;

},{"./isArguments":1370}],1369:[function(require,module,exports){
'use strict';

var slice = Array.prototype.slice;
var isArgs = require('./isArguments');

var origKeys = Object.keys;
var keysShim = origKeys ? function keys(o) { return origKeys(o); } : require('./implementation');

var originalKeys = Object.keys;

keysShim.shim = function shimObjectKeys() {
	if (Object.keys) {
		var keysWorksWithArguments = (function () {
			// Safari 5.0 bug
			var args = Object.keys(arguments);
			return args && args.length === arguments.length;
		}(1, 2));
		if (!keysWorksWithArguments) {
			Object.keys = function keys(object) { // eslint-disable-line func-name-matching
				if (isArgs(object)) {
					return originalKeys(slice.call(object));
				}
				return originalKeys(object);
			};
		}
	} else {
		Object.keys = keysShim;
	}
	return Object.keys || keysShim;
};

module.exports = keysShim;

},{"./implementation":1368,"./isArguments":1370}],1370:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;

module.exports = function isArguments(value) {
	var str = toStr.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]' &&
			value !== null &&
			typeof value === 'object' &&
			typeof value.length === 'number' &&
			value.length >= 0 &&
			toStr.call(value.callee) === '[object Function]';
	}
	return isArgs;
};

},{}],1371:[function(require,module,exports){


module.exports = function() {};
;

},{}],1372:[function(require,module,exports){


module.exports = function() {};
;

},{}],1373:[function(require,module,exports){


module.exports = function() {};
;

},{"each":1283}],1374:[function(require,module,exports){


module.exports = function() {};
;

},{"no-case":1361}],1375:[function(require,module,exports){


module.exports = function() {};
;

},{"camel-case":1274,"upper-case-first":1417}],1376:[function(require,module,exports){


module.exports = function() {};
;

},{"no-case":1361}],1377:[function(require,module,exports){


module.exports = function() {};
;

},{}],1378:[function(require,module,exports){
'use strict';

var toObject = Object;
var TypeErr = TypeError;

module.exports = function flags() {
	if (this != null && this !== toObject(this)) {
		throw new TypeErr('RegExp.prototype.flags getter called on non-object');
	}
	var result = '';
	if (this.global) {
		result += 'g';
	}
	if (this.ignoreCase) {
		result += 'i';
	}
	if (this.multiline) {
		result += 'm';
	}
	if (this.dotAll) {
		result += 's';
	}
	if (this.unicode) {
		result += 'u';
	}
	if (this.sticky) {
		result += 'y';
	}
	return result;
};

},{}],1379:[function(require,module,exports){
'use strict';

var define = require('define-properties');

var implementation = require('./implementation');
var getPolyfill = require('./polyfill');
var shim = require('./shim');

var flagsBound = Function.call.bind(implementation);

define(flagsBound, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

module.exports = flagsBound;

},{"./implementation":1378,"./polyfill":1380,"./shim":1381,"define-properties":1300}],1380:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

var supportsDescriptors = require('define-properties').supportsDescriptors;
var gOPD = Object.getOwnPropertyDescriptor;
var TypeErr = TypeError;

module.exports = function getPolyfill() {
	if (!supportsDescriptors) {
		throw new TypeErr('RegExp.prototype.flags requires a true ES5 environment that supports property descriptors');
	}
	if (/a/mig.flags === 'gim') {
		var descriptor = gOPD(RegExp.prototype, 'flags');
		if (descriptor && typeof descriptor.get === 'function' && typeof (/a/).dotAll === 'boolean') {
			return descriptor.get;
		}
	}
	return implementation;
};

},{"./implementation":1378,"define-properties":1300}],1381:[function(require,module,exports){
'use strict';

var supportsDescriptors = require('define-properties').supportsDescriptors;
var getPolyfill = require('./polyfill');
var gOPD = Object.getOwnPropertyDescriptor;
var defineProperty = Object.defineProperty;
var TypeErr = TypeError;
var getProto = Object.getPrototypeOf;
var regex = /a/;

module.exports = function shimFlags() {
	if (!supportsDescriptors || !getProto) {
		throw new TypeErr('RegExp.prototype.flags requires a true ES5 environment that supports property descriptors');
	}
	var polyfill = getPolyfill();
	var proto = getProto(regex);
	var descriptor = gOPD(proto, 'flags');
	if (!descriptor || descriptor.get !== polyfill) {
		defineProperty(proto, 'flags', {
			configurable: true,
			enumerable: false,
			get: polyfill
		});
	}
	return polyfill;
};

},{"./polyfill":1380,"define-properties":1300}],1382:[function(require,module,exports){

;

/**
 * Module dependencies.
 */

var type = require('type-component');

/**
 * Expose `reject`
 */

module.exports = reject;

/**
 * Reject `obj`, `fn`.
 *
 * If `fn` is omitted a default function
 * that removes nulls (undefined/null) will
 * be supplied.
 *
 * @param {Object} obj
 * @param {Function} fn
 * @return {Object}
 * @api public
 */

function reject(obj, fn){
  fn = fn || compact;
  return 'array' == type(obj)
    ? reject.array(obj, fn)
    : reject.object(obj, fn);
}

/**
 * Reject `arr`, `fn`.
 *
 * @param {Array|String} arr
 * @param {Function} fn
 * @return {Object}
 * @api public
 */

reject.array = function(arr, fn){
  var ret = [];

  for (var i = 0; i < arr.length; ++i) {
    if (!fn(arr[i], i)) ret[ret.length] = arr[i];
  }

  return ret;
};

/**
 * Reject `obj`, `fn`.
 *
 * @param {Object} obj
 * @param {Function} fn
 * @return {Object}
 * @api public
 */

reject.object = function(obj, fn){
  var ret = {};

  for (var k in obj) {
    if (obj.hasOwnProperty(k) && !fn(obj[k], k)) {
      ret[k] = obj[k]
    }
  }

  return ret;
};

/**
 * Reject `type(s)` of `obj/arr`.
 *
 * @param {Object|Array} obj
 * @param {Array|String} type(s)
 * @return {Object|Array}
 * @api public
 */

reject.types =
reject.type = function(obj, types){
  if (!Array.isArray(types)) types = [types];
  return reject(obj, function(value){
    return -1 != types.indexOf(type(value));
  });
};

/**
 * Reject `value` if it's `null` or `undefined`.
 *
 * @param {Mixed} value
 * @return {Mixed}
 * @api private
 */

function compact(value){
  return null == value;
}

;

},{"type-component":1414}],1383:[function(require,module,exports){

;

// https://github.com/thirdpartyjs/thirdpartyjs-code/blob/master/examples/templates/02/loading-files/index.html

/**
 * Invoke `fn(err)` when the given `el` script loads.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api public
 */

module.exports = function(el, fn){
  return el.addEventListener
    ? add(el, fn)
    : attach(el, fn);
};

/**
 * Add event listener to `el`, `fn()`.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api private
 */

function add(el, fn){
  el.addEventListener('load', function(_, e){ fn(null, e); }, false);
  el.addEventListener('error', function(e){
    var err = new Error('script error "' + el.src + '"');
    err.event = e;
    fn(err);
  }, false);
}

/**
 * Attach event.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api private
 */

function attach(el, fn){
  el.attachEvent('onreadystatechange', function(e){
    if (!/complete|loaded/.test(el.readyState)) return;
    fn(null, e);
  });
  el.attachEvent('onerror', function(e){
    var err = new Error('failed to load the script "' + el.src + '"');
    err.event = e || window.event;
    fn(err);
  });
}

;

},{}],1384:[function(require,module,exports){

;
arguments[4][57][0].apply(exports,arguments)
;

},{"dup":57,"obj-case":1365}],1385:[function(require,module,exports){

;
arguments[4][58][0].apply(exports,arguments)
;

},{"./facade":1387,"./utils":1395,"dup":58}],1386:[function(require,module,exports){

;
arguments[4][59][0].apply(exports,arguments)
;

},{"./facade":1387,"./utils":1395,"dup":59}],1387:[function(require,module,exports){

;
arguments[4][60][0].apply(exports,arguments)
;

},{"./address":1384,"./is-enabled":1391,"./utils":1395,"@segment/isodate-traverse":1200,"dup":60,"new-date":1356,"obj-case":1365}],1388:[function(require,module,exports){

;
arguments[4][61][0].apply(exports,arguments)
;

},{"./facade":1387,"./utils":1395,"dup":61,"is-email":1317,"new-date":1356}],1389:[function(require,module,exports){

;
arguments[4][62][0].apply(exports,arguments)
;

},{"./facade":1387,"./utils":1395,"dup":62,"is-email":1317,"new-date":1356,"obj-case":1365,"trim":1396}],1390:[function(require,module,exports){

;
arguments[4][63][0].apply(exports,arguments)
;

},{"./alias":1385,"./delete":1386,"./facade":1387,"./group":1388,"./identify":1389,"./page":1392,"./screen":1393,"./track":1394,"dup":63}],1391:[function(require,module,exports){

;
arguments[4][64][0].apply(exports,arguments)
;

},{"dup":64}],1392:[function(require,module,exports){

;
arguments[4][65][0].apply(exports,arguments)
;

},{"./facade":1387,"./track":1394,"./utils":1395,"dup":65,"is-email":1317}],1393:[function(require,module,exports){

;
arguments[4][66][0].apply(exports,arguments)
;

},{"./page":1392,"./track":1394,"./utils":1395,"dup":66}],1394:[function(require,module,exports){

;
'use strict';

var inherit = require('./utils').inherit;
var type = require('./utils').type;
var Facade = require('./facade');
var Identify = require('./identify');
var isEmail = require('is-email');
var get = require('obj-case');

/**
 * Initialize a new `Track` facade with a `dictionary` of arguments.
 *
 * @param {Object} dictionary - The object to wrap.
 * @param {string} [dictionary.event] - The name of the event being tracked.
 * @param {string} [dictionary.userId] - The ID of the user being tracked.
 * @param {string} [dictionary.anonymousId] - The anonymous ID of the user.
 * @param {string} [dictionary.properties] - Properties of the track event.
 * @param {Object} opts - Options about what kind of Facade to create.
 *
 * @augments Facade
 */
function Track(dictionary, opts) {
  Facade.call(this, dictionary, opts);
}

inherit(Track, Facade);

/**
 * Return the type of facade this is. This will always return `"track"`.
 *
 * @return {string}
 */
Track.prototype.action = function() {
  return 'track';
};

/**
 * An alias for {@link Track#action}.
 *
 * @function
 * @return {string}
 */
Track.prototype.type = Track.prototype.action;

/**
 * Get the event name from `event`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.event = Facade.field('event');

/**
 * Get the event value, usually the monetary value, from `properties.value`.
 *
 * This *should* be a number, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {number}
 */
Track.prototype.value = Facade.proxy('properties.value');

/**
 * Get the event cateogry from `properties.category`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.category = Facade.proxy('properties.category');

/**
 * Get the event ID from `properties.id`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.id = Facade.proxy('properties.id');

/**
 * Get the product ID from `properties.productId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.productId = function() {
  return this.proxy('properties.product_id') || this.proxy('properties.productId');
};

/**
 * Get the promotion ID from `properties.promotionId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.promotionId = function() {
  return this.proxy('properties.promotion_id') || this.proxy('properties.promotionId');
};

/**
 * Get the cart ID from `properties.cartId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.cartId = function() {
  return this.proxy('properties.cart_id') || this.proxy('properties.cartId');
};

/**
 * Get the checkout ID from `properties.checkoutId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.checkoutId = function() {
  return this.proxy('properties.checkout_id') || this.proxy('properties.checkoutId');
};

/**
 * Get the payment ID from `properties.paymentId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.paymentId = function() {
  return this.proxy('properties.payment_id') || this.proxy('properties.paymentId');
};

/**
 * Get the coupon ID from `properties.couponId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.couponId = function() {
  return this.proxy('properties.coupon_id') || this.proxy('properties.couponId');
};

/**
 * Get the wishlist ID from `properties.wishlistId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.wishlistId = function() {
  return this.proxy('properties.wishlist_id') || this.proxy('properties.wishlistId');
};

/**
 * Get the review ID from `properties.reviewId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.reviewId = function() {
  return this.proxy('properties.review_id') || this.proxy('properties.reviewId');
};

/**
 * Get the order ID from `properties.id` or `properties.orderId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.orderId = function() {
  // doesn't follow above convention since this fallback order was how it used to be
  return this.proxy('properties.id')
    || this.proxy('properties.order_id')
    || this.proxy('properties.orderId');
};

/**
 * Get the SKU from `properties.sku`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.sku = Facade.proxy('properties.sku');

/**
 * Get the amount of tax for this purchase from `properties.tax`.
 *
 * This *should* be a number, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {number}
 */
Track.prototype.tax = Facade.proxy('properties.tax');

/**
 * Get the name of this event from `properties.name`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.name = Facade.proxy('properties.name');

/**
 * Get the price of this purchase from `properties.price`.
 *
 * This *should* be a number, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {number}
 */
Track.prototype.price = Facade.proxy('properties.price');

/**
 * Get the total for this purchase from `properties.total`.
 *
 * This *should* be a number, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {number}
 */
Track.prototype.total = Facade.proxy('properties.total');

/**
 * Whether this is a repeat purchase from `properties.repeat`.
 *
 * This *should* be a boolean, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {boolean}
 */
Track.prototype.repeat = Facade.proxy('properties.repeat');

/**
 * Get the coupon for this purchase from `properties.coupon`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.coupon = Facade.proxy('properties.coupon');

/**
 * Get the shipping for this purchase from `properties.shipping`.
 *
 * This *should* be a number, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {number}
 */
Track.prototype.shipping = Facade.proxy('properties.shipping');

/**
 * Get the discount for this purchase from `properties.discount`.
 *
 * This *should* be a number, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {number}
 */
Track.prototype.discount = Facade.proxy('properties.discount');

/**
 * Get the shipping method for this purchase from `properties.shippingMethod`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.shippingMethod = function() {
  return this.proxy('properties.shipping_method') || this.proxy('properties.shippingMethod');
};

/**
 * Get the payment method for this purchase from `properties.paymentMethod`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.paymentMethod = function() {
  return this.proxy('properties.payment_method') || this.proxy('properties.paymentMethod');
};

/**
 * Get a description for this event from `properties.description`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.description = Facade.proxy('properties.description');

/**
 * Get a plan, as in the plan the user is on, for this event from
 * `properties.plan`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string}
 */
Track.prototype.plan = Facade.proxy('properties.plan');

/**
 * Get the subtotal for this purchase from `properties.subtotal`.
 *
 * If `properties.subtotal` isn't available, then fall back to computing the
 * total from `properties.total` or `properties.revenue`, and then subtracting
 * tax, shipping, and discounts.
 *
 * If neither subtotal, total, nor revenue are available, then return 0.
 *
 * @return {number}
 */
Track.prototype.subtotal = function() {
  var subtotal = get(this.properties(), 'subtotal');
  var total = this.total() || this.revenue();

  if (subtotal) return subtotal;
  if (!total) return 0;

  if (this.total()) {
    var n = this.tax();
    if (n) total -= n;
    n = this.shipping();
    if (n) total -= n;
    n = this.discount();
    if (n) total += n;
  }

  return total;
};

/**
 * Get the products for this event from `properties.products` if it's an
 * array, falling back to an empty array.
 *
 * @return {Array}
 */
Track.prototype.products = function() {
  var props = this.properties();
  var products = get(props, 'products');
  return type(products) === 'array' ? products : [];
};

/**
 * Get the quantity for this event from `properties.quantity`, falling back to
 * a quantity of one.
 *
 * @return {number}
 */
Track.prototype.quantity = function() {
  var props = this.obj.properties || {};
  return props.quantity || 1;
};

/**
 * Get the currency for this event from `properties.currency`, falling back to
 * "USD".
 *
 * @return {string}
 */
Track.prototype.currency = function() {
  var props = this.obj.properties || {};
  return props.currency || 'USD';
};

/**
 * Get the referrer for this event from `context.referrer.url`,
 * `context.page.referrer`, or `properties.referrer`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string}
 */
Track.prototype.referrer = function() {
  // TODO re-examine whether this function is necessary
  return this.proxy('context.referrer.url')
    || this.proxy('context.page.referrer')
    || this.proxy('properties.referrer');
};

/**
 * Get the query for this event from `options.query`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @function
 * @return {string|object}
 */
Track.prototype.query = Facade.proxy('options.query');

/**
 * Get the page's properties. This is identical to how {@link Facade#traits}
 * works, except it looks at `properties.*` instead of `options.traits.*`.
 *
 * Properties are gotten from `properties`.
 *
 * The parameter `aliases` is meant to transform keys in `properties` into new
 * keys. Each alias like `{ "xxx": "yyy" }` will take whatever is at `xxx` in
 * the traits, and move it to `yyy`. If `xxx` is a method of this facade, it'll
 * be called as a function instead of treated as a key into the traits.
 *
 * @example
 * var obj = { properties: { foo: "bar" }, anonymousId: "xxx" }
 * var track = new Track(obj)
 *
 * track.traits() // { "foo": "bar" }
 * track.traits({ "foo": "asdf" }) // { "asdf": "bar" }
 * track.traits({ "sessionId": "rofl" }) // { "rofl": "xxx" }
 *
 * @param {Object} aliases - A mapping from keys to the new keys they should be
 * transformed to.
 * @return {Object}
 */
Track.prototype.properties = function(aliases) {
  var ret = this.field('properties') || {};
  aliases = aliases || {};

  for (var alias in aliases) {
    var value = this[alias] == null ? this.proxy('properties.' + alias) : this[alias]();
    if (value == null) continue;
    ret[aliases[alias]] = value;
    delete ret[alias];
  }

  return ret;
};

/**
 * Get the username of the user for this event from `traits.username`,
 * `properties.username`, `userId`, or `anonymousId`.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string|undefined}
 */
Track.prototype.username = function() {
  return this.proxy('traits.username')
    || this.proxy('properties.username')
    || this.userId()
    || this.sessionId();
};

/**
 * Get the email of the user for this event from `trais.email`,
 * `properties.email`, or `options.traits.email`, falling back to `userId` if
 * it looks like a valid email.
 *
 * This *should* be a string, but may not be if the client isn't adhering to
 * the spec.
 *
 * @return {string|undefined}
 */
Track.prototype.email = function() {
  var email = this.proxy('traits.email')
    || this.proxy('properties.email')
    || this.proxy('options.traits.email');
  if (email) return email;

  var userId = this.userId();
  if (isEmail(userId)) return userId;
};

/**
 * Get the revenue for this event.
 *
 * If this is an "Order Completed" event, this will be the `properties.total`
 * falling back to the `properties.revenue`. For all other events, this is
 * simply taken from `properties.revenue`.
 *
 * If there are dollar signs in these properties, they will be removed. The
 * result will be parsed into a number.
 *
 * @return {number}
 */
Track.prototype.revenue = function() {
  var revenue = this.proxy('properties.revenue');
  var event = this.event();
  var orderCompletedRegExp = /^[ _]?completed[ _]?order[ _]?|^[ _]?order[ _]?completed[ _]?$/i;

  // it's always revenue, unless it's called during an order completion.
  if (!revenue && event && event.match(orderCompletedRegExp)) {
    revenue = this.proxy('properties.total');
  }

  return currency(revenue);
};

/**
 * Get the revenue for this event in "cents" -- in other words, multiply the
 * {@link Track#revenue} by 100, or return 0 if there isn't a numerical revenue
 * for this event.
 *
 * @return {number}
 */
Track.prototype.cents = function() {
  var revenue = this.revenue();
  return typeof revenue !== 'number' ? this.value() || 0 : revenue * 100;
};

/**
 * Convert this event into an {@link Identify} facade.
 *
 * This works by taking this event's underlying object and creating an Identify
 * from it. This event's traits, taken from `options.traits`, will be used as
 * the Identify's traits.
 *
 * @return {Identify}
 */
Track.prototype.identify = function() {
  // TODO: remove me.
  var json = this.json();
  json.traits = this.traits();
  return new Identify(json, this.opts);
};

/**
 * Get float from currency value.
 *
 * @ignore
 * @param {*} val
 * @return {number}
 */
function currency(val) {
  if (!val) return;
  if (typeof val === 'number') {
    return val;
  }
  if (typeof val !== 'string') {
    return;
  }

  val = val.replace(/\$/g, '');
  val = parseFloat(val);

  if (!isNaN(val)) {
    return val;
  }
}

module.exports = Track;

;

},{"./facade":1387,"./identify":1389,"./utils":1395,"is-email":1317,"obj-case":1365}],1395:[function(require,module,exports){

;
arguments[4][68][0].apply(exports,arguments)
;

},{"@ndhoule/clone":29,"dup":68,"inherits":1313,"type-component":1414}],1396:[function(require,module,exports){

;
exports = module.exports = trim;

function trim(str){
  if (str.trim) return str.trim();
  return exports.right(exports.left(str));
}

exports.left = function(str){
  if (str.trimLeft) return str.trimLeft();

  return str.replace(/^\s\s*/, '');
};

exports.right = function(str){
  if (str.trimRight) return str.trimRight();

  var whitespace_pattern = /\s/,
      i = str.length;
  while (whitespace_pattern.test(str.charAt(--i)));

  return str.slice(0, i + 1);
};

;

},{}],1397:[function(require,module,exports){


module.exports = function() {};
;

},{"no-case":1361,"upper-case-first":1417}],1398:[function(require,module,exports){

;

/**
 * Generate a slug from the given `str`.
 *
 * example:
 *
 *        generate('foo bar');
 *        // > foo-bar
 *
 * @param {String} str
 * @param {Object} options
 * @config {String|RegExp} [replace] characters to replace, defaulted to `/[^a-z0-9]/g`
 * @config {String} [separator] separator to insert, defaulted to `-`
 * @return {String}
 */

module.exports = function (str, options) {
  options || (options = {});
  return str.toLowerCase()
    .replace(options.replace || /[^a-z0-9]/g, ' ')
    .replace(/^ +| +$/g, '')
    .replace(/ +/g, options.separator || '-')
};

;

},{}],1399:[function(require,module,exports){


module.exports = function() {};
;

},{"no-case":1361}],1400:[function(require,module,exports){
(function (factory) {
    if (typeof exports === 'object') {
        // Node/CommonJS
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory);
    } else {
        // Browser globals (with support for web workers)
        var glob;

        try {
            glob = window;
        } catch (e) {
            glob = self;
        }

        glob.SparkMD5 = factory();
    }
}(function (undefined) {

    'use strict';

    /*
     * Fastest md5 implementation around (JKM md5).
     * Credits: Joseph Myers
     *
     * @see http://www.myersdaily.org/joseph/javascript/md5-text.html
     * @see http://jsperf.com/md5-shootout/7
     */

    /* this function is much faster,
      so if possible we use it. Some IEs
      are the only ones I know of that
      need the idiotic second function,
      generated by an if clause.  */
    var add32 = function (a, b) {
        return (a + b) & 0xFFFFFFFF;
    },
        hex_chr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];


    function cmn(q, a, b, x, s, t) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
    }

    function ff(a, b, c, d, x, s, t) {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    function gg(a, b, c, d, x, s, t) {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    function hh(a, b, c, d, x, s, t) {
        return cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function ii(a, b, c, d, x, s, t) {
        return cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    function md5cycle(x, k) {
        var a = x[0],
            b = x[1],
            c = x[2],
            d = x[3];

        a = ff(a, b, c, d, k[0], 7, -680876936);
        d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17, 606105819);
        b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897);
        d = ff(d, a, b, c, k[5], 12, 1200080426);
        c = ff(c, d, a, b, k[6], 17, -1473231341);
        b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416);
        d = ff(d, a, b, c, k[9], 12, -1958414417);
        c = ff(c, d, a, b, k[10], 17, -42063);
        b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682);
        d = ff(d, a, b, c, k[13], 12, -40341101);
        c = ff(c, d, a, b, k[14], 17, -1502002290);
        b = ff(b, c, d, a, k[15], 22, 1236535329);

        a = gg(a, b, c, d, k[1], 5, -165796510);
        d = gg(d, a, b, c, k[6], 9, -1069501632);
        c = gg(c, d, a, b, k[11], 14, 643717713);
        b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691);
        d = gg(d, a, b, c, k[10], 9, 38016083);
        c = gg(c, d, a, b, k[15], 14, -660478335);
        b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438);
        d = gg(d, a, b, c, k[14], 9, -1019803690);
        c = gg(c, d, a, b, k[3], 14, -187363961);
        b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467);
        d = gg(d, a, b, c, k[2], 9, -51403784);
        c = gg(c, d, a, b, k[7], 14, 1735328473);
        b = gg(b, c, d, a, k[12], 20, -1926607734);

        a = hh(a, b, c, d, k[5], 4, -378558);
        d = hh(d, a, b, c, k[8], 11, -2022574463);
        c = hh(c, d, a, b, k[11], 16, 1839030562);
        b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060);
        d = hh(d, a, b, c, k[4], 11, 1272893353);
        c = hh(c, d, a, b, k[7], 16, -155497632);
        b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174);
        d = hh(d, a, b, c, k[0], 11, -358537222);
        c = hh(c, d, a, b, k[3], 16, -722521979);
        b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487);
        d = hh(d, a, b, c, k[12], 11, -421815835);
        c = hh(c, d, a, b, k[15], 16, 530742520);
        b = hh(b, c, d, a, k[2], 23, -995338651);

        a = ii(a, b, c, d, k[0], 6, -198630844);
        d = ii(d, a, b, c, k[7], 10, 1126891415);
        c = ii(c, d, a, b, k[14], 15, -1416354905);
        b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571);
        d = ii(d, a, b, c, k[3], 10, -1894986606);
        c = ii(c, d, a, b, k[10], 15, -1051523);
        b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359);
        d = ii(d, a, b, c, k[15], 10, -30611744);
        c = ii(c, d, a, b, k[6], 15, -1560198380);
        b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070);
        d = ii(d, a, b, c, k[11], 10, -1120210379);
        c = ii(c, d, a, b, k[2], 15, 718787259);
        b = ii(b, c, d, a, k[9], 21, -343485551);

        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);
    }

    function md5blk(s) {
        var md5blks = [],
            i; /* Andy King said do it this way. */

        for (i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
    }

    function md5blk_array(a) {
        var md5blks = [],
            i; /* Andy King said do it this way. */

        for (i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
        }
        return md5blks;
    }

    function md51(s) {
        var n = s.length,
            state = [1732584193, -271733879, -1732584194, 271733878],
            i,
            length,
            tail,
            tmp,
            lo,
            hi;

        for (i = 64; i <= n; i += 64) {
            md5cycle(state, md5blk(s.substring(i - 64, i)));
        }
        s = s.substring(i - 64);
        length = s.length;
        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
        }
        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(state, tail);
            for (i = 0; i < 16; i += 1) {
                tail[i] = 0;
            }
        }

        // Beware that the final length might not fit in 32 bits so we take care of that
        tmp = n * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;

        tail[14] = lo;
        tail[15] = hi;

        md5cycle(state, tail);
        return state;
    }

    function md51_array(a) {
        var n = a.length,
            state = [1732584193, -271733879, -1732584194, 271733878],
            i,
            length,
            tail,
            tmp,
            lo,
            hi;

        for (i = 64; i <= n; i += 64) {
            md5cycle(state, md5blk_array(a.subarray(i - 64, i)));
        }

        // Not sure if it is a bug, however IE10 will always produce a sub array of length 1
        // containing the last element of the parent array if the sub array specified starts
        // beyond the length of the parent array - weird.
        // https://connect.microsoft.com/IE/feedback/details/771452/typed-array-subarray-issue
        a = (i - 64) < n ? a.subarray(i - 64) : new Uint8Array(0);

        length = a.length;
        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= a[i] << ((i % 4) << 3);
        }

        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(state, tail);
            for (i = 0; i < 16; i += 1) {
                tail[i] = 0;
            }
        }

        // Beware that the final length might not fit in 32 bits so we take care of that
        tmp = n * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;

        tail[14] = lo;
        tail[15] = hi;

        md5cycle(state, tail);

        return state;
    }

    function rhex(n) {
        var s = '',
            j;
        for (j = 0; j < 4; j += 1) {
            s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
        }
        return s;
    }

    function hex(x) {
        var i;
        for (i = 0; i < x.length; i += 1) {
            x[i] = rhex(x[i]);
        }
        return x.join('');
    }

    // In some cases the fast add32 function cannot be used..
    if (hex(md51('hello')) !== '5d41402abc4b2a76b9719d911017c592') {
        add32 = function (x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF),
                msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        };
    }

    // ---------------------------------------------------

    /**
     * ArrayBuffer slice polyfill.
     *
     * @see https://github.com/ttaubert/node-arraybuffer-slice
     */

    if (typeof ArrayBuffer !== 'undefined' && !ArrayBuffer.prototype.slice) {
        (function () {
            function clamp(val, length) {
                val = (val | 0) || 0;

                if (val < 0) {
                    return Math.max(val + length, 0);
                }

                return Math.min(val, length);
            }

            ArrayBuffer.prototype.slice = function (from, to) {
                var length = this.byteLength,
                    begin = clamp(from, length),
                    end = length,
                    num,
                    target,
                    targetArray,
                    sourceArray;

                if (to !== undefined) {
                    end = clamp(to, length);
                }

                if (begin > end) {
                    return new ArrayBuffer(0);
                }

                num = end - begin;
                target = new ArrayBuffer(num);
                targetArray = new Uint8Array(target);

                sourceArray = new Uint8Array(this, begin, num);
                targetArray.set(sourceArray);

                return target;
            };
        })();
    }

    // ---------------------------------------------------

    /**
     * Helpers.
     */

    function toUtf8(str) {
        if (/[\u0080-\uFFFF]/.test(str)) {
            str = unescape(encodeURIComponent(str));
        }

        return str;
    }

    function utf8Str2ArrayBuffer(str, returnUInt8Array) {
        var length = str.length,
           buff = new ArrayBuffer(length),
           arr = new Uint8Array(buff),
           i;

        for (i = 0; i < length; i += 1) {
            arr[i] = str.charCodeAt(i);
        }

        return returnUInt8Array ? arr : buff;
    }

    function arrayBuffer2Utf8Str(buff) {
        return String.fromCharCode.apply(null, new Uint8Array(buff));
    }

    function concatenateArrayBuffers(first, second, returnUInt8Array) {
        var result = new Uint8Array(first.byteLength + second.byteLength);

        result.set(new Uint8Array(first));
        result.set(new Uint8Array(second), first.byteLength);

        return returnUInt8Array ? result : result.buffer;
    }

    function hexToBinaryString(hex) {
        var bytes = [],
            length = hex.length,
            x;

        for (x = 0; x < length - 1; x += 2) {
            bytes.push(parseInt(hex.substr(x, 2), 16));
        }

        return String.fromCharCode.apply(String, bytes);
    }

    // ---------------------------------------------------

    /**
     * SparkMD5 OOP implementation.
     *
     * Use this class to perform an incremental md5, otherwise use the
     * static methods instead.
     */

    function SparkMD5() {
        // call reset to init the instance
        this.reset();
    }

    /**
     * Appends a string.
     * A conversion will be applied if an utf8 string is detected.
     *
     * @param {String} str The string to be appended
     *
     * @return {SparkMD5} The instance itself
     */
    SparkMD5.prototype.append = function (str) {
        // Converts the string to utf8 bytes if necessary
        // Then append as binary
        this.appendBinary(toUtf8(str));

        return this;
    };

    /**
     * Appends a binary string.
     *
     * @param {String} contents The binary string to be appended
     *
     * @return {SparkMD5} The instance itself
     */
    SparkMD5.prototype.appendBinary = function (contents) {
        this._buff += contents;
        this._length += contents.length;

        var length = this._buff.length,
            i;

        for (i = 64; i <= length; i += 64) {
            md5cycle(this._hash, md5blk(this._buff.substring(i - 64, i)));
        }

        this._buff = this._buff.substring(i - 64);

        return this;
    };

    /**
     * Finishes the incremental computation, reseting the internal state and
     * returning the result.
     *
     * @param {Boolean} raw True to get the raw string, false to get the hex string
     *
     * @return {String} The result
     */
    SparkMD5.prototype.end = function (raw) {
        var buff = this._buff,
            length = buff.length,
            i,
            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ret;

        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= buff.charCodeAt(i) << ((i % 4) << 3);
        }

        this._finish(tail, length);
        ret = hex(this._hash);

        if (raw) {
            ret = hexToBinaryString(ret);
        }

        this.reset();

        return ret;
    };

    /**
     * Resets the internal state of the computation.
     *
     * @return {SparkMD5} The instance itself
     */
    SparkMD5.prototype.reset = function () {
        this._buff = '';
        this._length = 0;
        this._hash = [1732584193, -271733879, -1732584194, 271733878];

        return this;
    };

    /**
     * Gets the internal state of the computation.
     *
     * @return {Object} The state
     */
    SparkMD5.prototype.getState = function () {
        return {
            buff: this._buff,
            length: this._length,
            hash: this._hash
        };
    };

    /**
     * Gets the internal state of the computation.
     *
     * @param {Object} state The state
     *
     * @return {SparkMD5} The instance itself
     */
    SparkMD5.prototype.setState = function (state) {
        this._buff = state.buff;
        this._length = state.length;
        this._hash = state.hash;

        return this;
    };

    /**
     * Releases memory used by the incremental buffer and other additional
     * resources. If you plan to use the instance again, use reset instead.
     */
    SparkMD5.prototype.destroy = function () {
        delete this._hash;
        delete this._buff;
        delete this._length;
    };

    /**
     * Finish the final calculation based on the tail.
     *
     * @param {Array}  tail   The tail (will be modified)
     * @param {Number} length The length of the remaining buffer
     */
    SparkMD5.prototype._finish = function (tail, length) {
        var i = length,
            tmp,
            lo,
            hi;

        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(this._hash, tail);
            for (i = 0; i < 16; i += 1) {
                tail[i] = 0;
            }
        }

        // Do the final computation based on the tail and length
        // Beware that the final length may not fit in 32 bits so we take care of that
        tmp = this._length * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;

        tail[14] = lo;
        tail[15] = hi;
        md5cycle(this._hash, tail);
    };

    /**
     * Performs the md5 hash on a string.
     * A conversion will be applied if utf8 string is detected.
     *
     * @param {String}  str The string
     * @param {Boolean} raw True to get the raw string, false to get the hex string
     *
     * @return {String} The result
     */
    SparkMD5.hash = function (str, raw) {
        // Converts the string to utf8 bytes if necessary
        // Then compute it using the binary function
        return SparkMD5.hashBinary(toUtf8(str), raw);
    };

    /**
     * Performs the md5 hash on a binary string.
     *
     * @param {String}  content The binary string
     * @param {Boolean} raw     True to get the raw string, false to get the hex string
     *
     * @return {String} The result
     */
    SparkMD5.hashBinary = function (content, raw) {
        var hash = md51(content),
            ret = hex(hash);

        return raw ? hexToBinaryString(ret) : ret;
    };

    // ---------------------------------------------------

    /**
     * SparkMD5 OOP implementation for array buffers.
     *
     * Use this class to perform an incremental md5 ONLY for array buffers.
     */
    SparkMD5.ArrayBuffer = function () {
        // call reset to init the instance
        this.reset();
    };

    /**
     * Appends an array buffer.
     *
     * @param {ArrayBuffer} arr The array to be appended
     *
     * @return {SparkMD5.ArrayBuffer} The instance itself
     */
    SparkMD5.ArrayBuffer.prototype.append = function (arr) {
        var buff = concatenateArrayBuffers(this._buff.buffer, arr, true),
            length = buff.length,
            i;

        this._length += arr.byteLength;

        for (i = 64; i <= length; i += 64) {
            md5cycle(this._hash, md5blk_array(buff.subarray(i - 64, i)));
        }

        this._buff = (i - 64) < length ? new Uint8Array(buff.buffer.slice(i - 64)) : new Uint8Array(0);

        return this;
    };

    /**
     * Finishes the incremental computation, reseting the internal state and
     * returning the result.
     *
     * @param {Boolean} raw True to get the raw string, false to get the hex string
     *
     * @return {String} The result
     */
    SparkMD5.ArrayBuffer.prototype.end = function (raw) {
        var buff = this._buff,
            length = buff.length,
            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            i,
            ret;

        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= buff[i] << ((i % 4) << 3);
        }

        this._finish(tail, length);
        ret = hex(this._hash);

        if (raw) {
            ret = hexToBinaryString(ret);
        }

        this.reset();

        return ret;
    };

    /**
     * Resets the internal state of the computation.
     *
     * @return {SparkMD5.ArrayBuffer} The instance itself
     */
    SparkMD5.ArrayBuffer.prototype.reset = function () {
        this._buff = new Uint8Array(0);
        this._length = 0;
        this._hash = [1732584193, -271733879, -1732584194, 271733878];

        return this;
    };

    /**
     * Gets the internal state of the computation.
     *
     * @return {Object} The state
     */
    SparkMD5.ArrayBuffer.prototype.getState = function () {
        var state = SparkMD5.prototype.getState.call(this);

        // Convert buffer to a string
        state.buff = arrayBuffer2Utf8Str(state.buff);

        return state;
    };

    /**
     * Gets the internal state of the computation.
     *
     * @param {Object} state The state
     *
     * @return {SparkMD5.ArrayBuffer} The instance itself
     */
    SparkMD5.ArrayBuffer.prototype.setState = function (state) {
        // Convert string to buffer
        state.buff = utf8Str2ArrayBuffer(state.buff, true);

        return SparkMD5.prototype.setState.call(this, state);
    };

    SparkMD5.ArrayBuffer.prototype.destroy = SparkMD5.prototype.destroy;

    SparkMD5.ArrayBuffer.prototype._finish = SparkMD5.prototype._finish;

    /**
     * Performs the md5 hash on an array buffer.
     *
     * @param {ArrayBuffer} arr The array buffer
     * @param {Boolean}     raw True to get the raw string, false to get the hex one
     *
     * @return {String} The result
     */
    SparkMD5.ArrayBuffer.hash = function (arr, raw) {
        var hash = md51_array(new Uint8Array(arr)),
            ret = hex(hash);

        return raw ? hexToBinaryString(ret) : ret;
    };

    return SparkMD5;
}));

},{}],1401:[function(require,module,exports){


module.exports = function() {};
;

},{"lower-case":1342,"upper-case":1418}],1402:[function(require,module,exports){


module.exports = function() {};
;

},{}],1403:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":1404,"timers":1403}],1404:[function(require,module,exports){
arguments[4][1273][0].apply(exports,arguments)
},{"dup":1273}],1405:[function(require,module,exports){


module.exports = function() {};
;

},{"no-case":1361,"upper-case":1418}],1406:[function(require,module,exports){

;

var space = require('to-space-case')

/**
 * Export.
 */

module.exports = toCamelCase

/**
 * Convert a `string` to camel case.
 *
 * @param {String} string
 * @return {String}
 */

function toCamelCase(string) {
  return space(string).replace(/\s(\w)/g, function (matches, letter) {
    return letter.toUpperCase()
  })
}

;

},{"to-space-case":1410}],1407:[function(require,module,exports){

/**
 * Module Dependencies
 */

var expr;
try {
  expr = require('props');
} catch(e) {
  expr = require('component-props');
}

/**
 * Expose `toFunction()`.
 */

module.exports = toFunction;

/**
 * Convert `obj` to a `Function`.
 *
 * @param {Mixed} obj
 * @return {Function}
 * @api private
 */

function toFunction(obj) {
  switch ({}.toString.call(obj)) {
    case '[object Object]':
      return objectToFunction(obj);
    case '[object Function]':
      return obj;
    case '[object String]':
      return stringToFunction(obj);
    case '[object RegExp]':
      return regexpToFunction(obj);
    default:
      return defaultToFunction(obj);
  }
}

/**
 * Default to strict equality.
 *
 * @param {Mixed} val
 * @return {Function}
 * @api private
 */

function defaultToFunction(val) {
  return function(obj){
    return val === obj;
  };
}

/**
 * Convert `re` to a function.
 *
 * @param {RegExp} re
 * @return {Function}
 * @api private
 */

function regexpToFunction(re) {
  return function(obj){
    return re.test(obj);
  };
}

/**
 * Convert property `str` to a function.
 *
 * @param {String} str
 * @return {Function}
 * @api private
 */

function stringToFunction(str) {
  // immediate such as "> 20"
  if (/^ *\W+/.test(str)) return new Function('_', 'return _ ' + str);

  // properties such as "name.first" or "age > 18" or "age > 18 && age < 36"
  return new Function('_', 'return ' + get(str));
}

/**
 * Convert `object` to a function.
 *
 * @param {Object} object
 * @return {Function}
 * @api private
 */

function objectToFunction(obj) {
  var match = {};
  for (var key in obj) {
    match[key] = typeof obj[key] === 'string'
      ? defaultToFunction(obj[key])
      : toFunction(obj[key]);
  }
  return function(val){
    if (typeof val !== 'object') return false;
    for (var key in match) {
      if (!(key in val)) return false;
      if (!match[key](val[key])) return false;
    }
    return true;
  };
}

/**
 * Built the getter function. Supports getter style functions
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function get(str) {
  var props = expr(str);
  if (!props.length) return '_.' + str;

  var val, i, prop;
  for (i = 0; i < props.length; i++) {
    prop = props[i];
    val = '_.' + prop;
    val = "('function' == typeof " + val + " ? " + val + "() : " + val + ")";

    // mimic negative lookbehind to avoid problems with nested properties
    str = stripNested(prop, str, val);
  }

  return str;
}

/**
 * Mimic negative lookbehind to avoid problems with nested properties.
 *
 * See: http://blog.stevenlevithan.com/archives/mimic-lookbehind-javascript
 *
 * @param {String} prop
 * @param {String} str
 * @param {String} val
 * @return {String}
 * @api private
 */

function stripNested (prop, str, val) {
  return str.replace(new RegExp('(\\.)?' + prop, 'g'), function($0, $1) {
    return $1 ? $0 : val;
  });
}

},{"component-props":1288,"props":1288}],1408:[function(require,module,exports){

;
arguments[4][460][0].apply(exports,arguments)
;

},{"dup":460}],1409:[function(require,module,exports){


module.exports = function() {};
;

},{"to-space-case":1410}],1410:[function(require,module,exports){

;

var clean = require('to-no-case')

/**
 * Export.
 */

module.exports = toSpaceCase

/**
 * Convert a `string` to space case.
 *
 * @param {String} string
 * @return {String}
 */

function toSpaceCase(string) {
  return clean(string).replace(/[\W_]+(.|$)/g, function (matches, match) {
    return match ? ' ' + match : ''
  }).trim()
}

;

},{"to-no-case":1411}],1411:[function(require,module,exports){

;
arguments[4][464][0].apply(exports,arguments)
;

},{"dup":464}],1412:[function(require,module,exports){


module.exports = function() {};
;

},{}],1413:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],1414:[function(require,module,exports){

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val === Object(val)) return 'object';

  return typeof val;
};

},{}],1415:[function(require,module,exports){


module.exports = function() {};
;

},{}],1416:[function(require,module,exports){


module.exports = function() {};
;

},{}],1417:[function(require,module,exports){


module.exports = function() {};
;

},{"upper-case":1418}],1418:[function(require,module,exports){


module.exports = function() {};
;

},{}],1419:[function(require,module,exports){


module.exports = function() {};
;

},{}],1420:[function(require,module,exports){
module.exports = encode;

function encode(string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {

        var c = string.charCodeAt(n);

        if (c < 128) {
            utftext += String.fromCharCode(c);
        }
        else if ((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        }
        else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }

    }

    return utftext;
}
},{}],1421:[function(require,module,exports){


module.exports = function() {};
;

},{}],1422:[function(require,module,exports){


module.exports = function() {};
;

},{}],1423:[function(require,module,exports){
'use strict';

// MODULES //

var ctors = require( './ctors.js' );


// IS LITTLE ENDIAN //

/**
* FUNCTION: isLittleEndian()
*	Returns a boolean indicating if an environment is little endian.
*
* @returns {Boolean} boolean indicating if an environment is little endian
*/
function isLittleEndian() {
	var uint16_view;
	var uint8_view;

	uint16_view = new ctors[ 'uint16' ]( 1 );

	// Set the uint16 view to a value having distinguishable lower and higher order words.
	// 4660 => 0x1234 => 0x12 0x34 => '00010010 00110100' => (0x12,0x34) == (18,52)
	uint16_view[ 0 ] = 0x1234;

	// Create a uint8 view on top of the uint16 buffer:
	uint8_view = new ctors[ 'uint8' ]( uint16_view.buffer );

	// If little endian, the least significant byte will be first...
	return ( uint8_view[ 0 ] === 0x34 );
} // end FUNCTION isLittleEndian()


// EXPORTS //

module.exports = isLittleEndian();

},{"./ctors.js":1422}],1424:[function(require,module,exports){
var v1 = require('./v1');
var v4 = require('./v4');

var uuid = v4;
uuid.v1 = v1;
uuid.v4 = v4;

module.exports = uuid;

},{"./v1":1427,"./v4":1428}],1425:[function(require,module,exports){
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ([
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]]
  ]).join('');
}

module.exports = bytesToUuid;

},{}],1426:[function(require,module,exports){
// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection

// getRandomValues needs to be invoked in a context where "this" is a Crypto
// implementation. Also, find the complete implementation of crypto on IE11.
var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

if (getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

  module.exports = function whatwgRNG() {
    getRandomValues(rnds8);
    return rnds8;
  };
} else {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);

  module.exports = function mathRNG() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}

},{}],1427:[function(require,module,exports){
var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

var _nodeId;
var _clockseq;

// Previous uuid creation time
var _lastMSecs = 0;
var _lastNSecs = 0;

// See https://github.com/uuidjs/uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189
  if (node == null || clockseq == null) {
    var seedBytes = rng();
    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [
        seedBytes[0] | 0x01,
        seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]
      ];
    }
    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  }

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf ? buf : bytesToUuid(b);
}

module.exports = v1;

},{"./lib/bytesToUuid":1425,"./lib/rng":1426}],1428:[function(require,module,exports){
var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;

},{"./lib/bytesToUuid":1425,"./lib/rng":1426}],1429:[function(require,module,exports){


module.exports = function() {};
;

},{}],1430:[function(require,module,exports){

;

/**
 * dependencies.
 */

var unserialize = require('unserialize');
var each = require('each');
var storage;

/**
 * Safari throws when a user
 * blocks access to cookies / localstorage.
 */

try {
  storage = window.localStorage;
} catch (e) {
  storage = null;
}

/**
 * Expose `store`
 */

module.exports = store;

/**
 * Store the given `key`, `val`.
 *
 * @param {String|Object} key
 * @param {Mixed} value
 * @return {Mixed}
 * @api public
 */

function store(key, value){
  var length = arguments.length;
  if (0 == length) return all();
  if (2 <= length) return set(key, value);
  if (1 != length) return;
  if (null == key) return storage.clear();
  if ('string' == typeof key) return get(key);
  if ('object' == typeof key) return each(key, set);
}

/**
 * supported flag.
 */

store.supported = !! storage;

/**
 * Set `key` to `val`.
 *
 * @param {String} key
 * @param {Mixed} val
 */

function set(key, val){
  return null == val
    ? storage.removeItem(key)
    : storage.setItem(key, JSON.stringify(val));
}

/**
 * Get `key`.
 *
 * @param {String} key
 * @return {Mixed}
 */

function get(key){
  return unserialize(storage.getItem(key));
}

/**
 * Get all.
 *
 * @return {Object}
 */

function all(){
  var len = storage.length;
  var ret = {};
  var key;

  while (0 <= --len) {
    key = storage.key(len);
    ret[key] = get(key);
  }

  return ret;
}

;

},{"each":1283,"unserialize":1431}],1431:[function(require,module,exports){

;

/**
 * Unserialize the given "stringified" javascript.
 * 
 * @param {String} val
 * @return {Mixed}
 */

module.exports = function(val){
  try {
    return JSON.parse(val);
  } catch (e) {
    return val || undefined;
  }
};

;

},{}]},{},[3]);
}(window.define));