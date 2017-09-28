//////////////////////////////////////
// App : Coupon
// Owner  : Ishara Gunathilaka
// Last changed date : 2017/09/28
// Version : 6.1.0.14
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
								//if ($rootScope.isBaseSet2) {
									resolve(function () {
										var entitledStatesReturn = mesentitlement.stateDepResolver('coupon');

										mesentitlementProvider.setStateCheck("coupon");

										if(entitledStatesReturn !== true){
											return $q.reject("unauthorized");
										}
									});
								//} else {
								//	return $location.path('/guide');
								//}
							});
						});
					}]
				},
				bodyClass: 'coupon'
			});

		msNavigationServiceProvider.saveItem('coupon', {
			title    : 'Coupon',
			state    : 'app.coupon',
			weight   : 9
		});
	}
})();
