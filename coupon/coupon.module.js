//////////////////////////////////////
// App : Coupon
// Owner  : Ishara Gunathilaka
// Last changed date : 2017/04/25
// Version : 6.1.0.2
// Modified By : Ishara
/////////////////////////////////

(function ()
{
    'use strict';

    angular
        .module('app.coupon', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, msNavigationServiceProvider, mesentitlementProvider)
    {
        mesentitlementProvider.setStateCheck("coupon");

        $stateProvider
            .state('app.coupon', {
                url    : '/coupon',
                views  : {
                    'coupon@app': {
                        templateUrl: 'app/main/coupon/coupon.html',
                        controller : 'CouponController as vm'
                    }
                },
                resolve: {
                    security: ['$q','mesentitlement', function($q,mesentitlement){
                        var entitledStatesReturn = mesentitlement.stateDepResolver('coupon');

                        if(entitledStatesReturn !== true){
                              return $q.reject("unauthorized");
                        };
                    }]
                },
                bodyClass: 'coupon'
            });

        msNavigationServiceProvider.saveItem('coupon', {
            title    : 'coupon',
            state    : 'app.coupon',
            weight   : 11
        });
    }
})();
