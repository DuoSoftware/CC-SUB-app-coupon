//////////////////////////////////////
// App : Coupon
// Owner  : Ishara Gunathilaka
// Last changed date : 2017/08/24
// Version : 6.1.0.13
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
        function gst(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            //debugger;
            return null;
        }
        /** Check for Super admin */
        var isSuperAdmin = gst('isSuperAdmin');
        /** Check for Super admin - END */

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
					security: ['$q','mesentitlement','$timeout','$rootScope','$state','$location', function($q,mesentitlement,$timeout,$rootScope,$state, $location){
						return $q(function(resolve, reject) {
							$timeout(function() {
                $rootScope.isBaseSet2 = true;
								if ($rootScope.isBaseSet2 && isSuperAdmin != 'true') {
									resolve(function () {
										var entitledStatesReturn = mesentitlement.stateDepResolver('coupon');

										mesentitlementProvider.setStateCheck("coupon");

										if(entitledStatesReturn !== true){
											return $q.reject("unauthorized");
										}
									});
								} else {
									return $location.path('/guide');
								}
							});
						});
                    }]
                },
                bodyClass: 'coupon'
            });

        if(isSuperAdmin != 'true'){
            msNavigationServiceProvider.saveItem('coupon', {
                title    : 'Coupon',
                state    : 'app.coupon',
                weight   : 11
            });
        };
    }
})();
