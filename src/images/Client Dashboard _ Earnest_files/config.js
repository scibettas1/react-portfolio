// This auth configuration is not secret

(function () {
  'use strict';

  angular.module('clientWww.config', []) // eslint-disable-line
    .constant('CONFIG', {
      apiBaseUrl: 'https://api.earnest.com',
      sloBaseUrl: 'https://connect.earnest.com/slo',
      sloDashboardUrl: 'https://www.earnest.com/_/student-loans/dashboard/',
      servicingBaseUrl: 'https://earnest.com/_/servicing',
      host: 'https://www.earnest.com',
      californiaPrivacyRightsUrl: 'https://www.navient.com/privacy-act/earnest',
      pricingService: 'https://connect.earnest.com',
      hosts: {
        my: 'https://my.earnest.com',
        slo: 'https://www.earnest.com/_/student-loans',
        questionnaire: 'https://www.earnest.com/_/questionnaire'
      },
      my: {
        host: 'https://my.earnest.com',
        referralsDashboardPath: '/dashboard/referrals',
        referralsShareCardPath: '/external/referrals-share'
      },
      sso: {
        authHost: 'https://accounts.www.earnest.com',
        loginPath: '/service-auth-chain/login',
        logoutPath: '/service-auth-chain/logout'
      },
      switches: {
        debug: false
      },
      linkedIn: {
        clientId: '75cke5jmzlzgjs'
      },
      segmentio: {
        apiKey: 'i49svebw12',
        snippetVersion: '2.11.1'
      },
      bugsnag: {
        apiKey: '053899256d5447b86ca6998f02e2cfeb',
        releaseStage: 'production',
        notifyReleaseStages:  ['production']
      },
      olark: {
        apiKey: '5518-778-10-9868'
      },
      inMaintenanceMode: false,
      googleMaps: {
        apiKey: 'AIzaSyByoL19ObzDuLDYfTV0rMn1Qy6sDZijg1s'
      },
      featureFlags: {
        additionalInformationURLEnabled: true,
        rateCheckExpirationEnabled: true,
        synchronousAI: true,
        referralLiteEnabled: true,
        referralDashboardEnabled: true,
        migrateBannerEnabled: false,
        appsLandingPageEnabled: true,
        sso: true,
        shortPassword: false,
        hideIDUploadEnabled: true,
        medicalResidencyEnabled: true,
        reCaptcha: true,
        largerPersonalLoans: true,
        sloURLEnabled: true,
        enableZendeskChat: true
      },
      plaidLink: {
        env: 'production',
        clientName: 'Earnest',
        webhook: 'https://api.earnest.com/web-hooks/plaid/connect',
        apiKey: '96938e4a921cfbe9a3c4194469d363',
        connectEndpoint: '/users/me/plaid_link/connect',
        errorEndpoint: '/users/me/plaid_link/connection_failure',
        apiVersion: 'v2'
      },
      reCaptcha: {
        siteKey: '6Led008UAAAAAIUbbbM2iafLVl4KyIyWKc58h41X'
      },
      slrConversionDates: {
        preventChangingAutopayStartDate: '2018-10-18',
        demographicDataRestrictionStartDate: '2018-10-24',
        demographicDataRestrictionEndDate: '2018-10-29',
        displayDeadEndCardStartDate: '2018-10-25',
        displayDeadEndCardEndDate: '2018-10-30'
      },
      apiConnectUrl: 'https://connect.earnest.com'
    })
  ;
})();
