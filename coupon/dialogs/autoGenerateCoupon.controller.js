(function ()
{
  'use strict';

  angular
    .module('app.coupon')
    .controller('autoGenerateCouponController', autoGenerateCouponController);

  /** @ngInject */
  function autoGenerateCouponController($mdDialog, $scope,$charge,notifications,coupon)
  {
    var vm = this;
    $scope.couponCount = 1;

    $scope.submitCouponCount = function () {
       // debugger;
      if($scope.couponCountForm.$valid){

        coupon.generateCount = $scope.couponCount;
        coupon.isDirectFromInsert = "false";

        $charge.coupon().store(coupon).success(function (data) {
          //
          //alert(data.error);
          if (data.error == "00000") {
            //
            notifications.toast("Record Saved, Auto generate Coupon(s) Added", 'success');


           $mdDialog.hide();

          }
        }).error(function (data) {

          // console.log(data);

          $scope.isSaveClicked = false;

          notifications.toast("Error adding record, " + data['error'], "error");
        })

      }
    }

    $scope.closeDialog = function () {
      $mdDialog.hide();
    }
  }
})();
