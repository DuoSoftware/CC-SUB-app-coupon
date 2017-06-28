//////////////////////////////////////
// App : Coupon
// Owner  : Ishara Gunathilaka
// Last changed date : 2017/06/28
// Version : 6.1.0.7
// Modified By : Kasun
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
            title    : 'Coupon',
            state    : 'app.coupon',
            weight   : 11
        });
    }
})();
