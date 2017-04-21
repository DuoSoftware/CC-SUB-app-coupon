(function ()
{
  'use strict';

  angular
    .module('app.coupon')
    .controller('CouponController', CouponController);

  /** @ngInject */
  function CouponController($scope,  $timeout, $charge,notifications)
  {
    var vm = this;

    vm.appInnerState = "default";
    vm.pageTitle="Create New";
    vm.checked = [];
    vm.colors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg'];

    $scope.selectedCoupon = {};

    vm.responsiveReadPane = undefined;
    vm.activeCouponPaneIndex = 0;
    vm.dynamicHeight = false;

    vm.scrollPos = 0;
    vm.scrollEl = angular.element('#content');

    vm.selectedMailShowDetails = false;

    vm.addButtonDisplayText = "CREATE NEW";

    $scope.content={};
    $scope.content.associateplan = true;
    $scope.content.discounttype = "0"; // default selected 'flat'
    $scope.couponPlan = [];

    //if(!$scope.NoEndDate)
    //  $scope.NoEndDate = false;

    $scope.isSpinnerShown = true;
    $scope.content.startdate = new Date();
    $scope.content.enddate=new Date();

    $scope.currentDate = moment(new Date().toISOString()).format('LL');

    $scope.rows=[];


    //$charge.commondata().getDuobaseValuesByTableName("CTS_GeneralAttributes").success(function(data) {
    //  $scope.decimalPoint=parseInt(data[6].RecordFieldData);
    //
    //}).error(function(data) {
    //});

    $scope.skip=0;
    $scope.take = 100;
    $scope.data = [];

    $scope.loadCoupons = function() {
      vm.listLoaded = false;

      $charge.coupon().all($scope.skip, $scope.take, "desc").success(function (data) {
        console.log(data);
        for (var i = 0; i < data.length; i++) {

          var stat = "Active";

          if ( moment(data[i]["enddate"]).format('L') < moment(new Date().toISOString()).format('L')) {

            stat = "Expired";
          }

          if (data[i]["noofoccurence"] <= data[i]["currentuse"]) {
            stat = "Expired";
          }

          $scope.data.push(data[i]);


        }

        $scope.skip += $scope.take;

        if($scope.skip > $scope.data.length)
        {
          $scope.showMoreButton = false;
        }

        vm.couponLocalList = $scope.data;

        vm.coupons = $scope.data;
        vm.listLoaded = true;

        // $scope.isLoading = false;
      }).error(function (data) {
        vm.listLoaded = true;
        $scope.showMoreButton = false;
        console.log(data);
      })

    }

    $scope.loadCoupons();


    $scope.planList = [];
    $scope.loadPlans = function() {
      vm.listPlanLoaded = false;

      $charge.plan().allPlans($scope.skip, $scope.take, "desc").success(function (data) {
        console.log(data);
        for (var i = 0; i < data.length; i++) {

          $scope.planList.push(data[i]);
        }

        vm.listPlanLoaded = true;

        // $scope.isLoading = false;
      }).error(function (data) {
        vm.listPlanLoaded = true;
        console.log(data);
      })

    }

    $scope.loadPlans();


    $scope.isSaveClicked = false;

    $scope.submit = function() {

      if (angular.isUndefined( $scope.content.couponcode)) {
        $scope.isSaveClicked = false;
        notifications.toast('Please add valid coupon code','error');
        return;
      }

      //
      //console.log($scope.content);

      $scope.isSaveClicked = true;


      if(moment($scope.content.enddate).format('L') < moment($scope.content.startdate).format('L'))
      {
        $scope.isSaveClicked = false;
        notifications.toast('End date should be greater than start date','error');

        return;
      }


      if(!vm.couponAdd.$valid)
      {
        angular.element(document.querySelector('#couponForm')).find('.ng-invalid:visible:first').focus();
        $scope.isSaveClicked = false;
        return;

      }


      if ((!$scope.content.associateplan) ) {

        if ($scope.couponPlan.length < 1) {
          $scope.isSaveClicked = false;
          // notifications.toast('Please add coupon products.');
          notifications.toast('Please select plan(s).', 'error');
          return;
        }
      }

      var redemptionCount = -999; //if redemption count -999 it means apply this coupon forever
    if(!$scope.content.noRedemptionCount){
      redemptionCount = $scope.content.couponRedemption;
    }

        // main table details and promo product details
        $scope.content = {
          "startdate": $scope.content.startdate,
          "enddate": $scope.content.enddate,
          "couponcode": $scope.content.couponcode,
          "noofoccurence": $scope.content.noofoccurence,
          "associateplan":$scope.content.associateplan ? 1 : 0,
          "redemption": redemptionCount,
          "discounttype": $scope.content.discounttype,
          "discountamount": $scope.content.couponDiscount
        };


        if(!$scope.content.associateplan){
          $scope.content.couponDetails=[];

          for(var i =0;i<$scope.couponPlan.length;i++){
            $scope.content.couponDetails.push({"guplanid" : $scope.couponPlan[i]});
          }

        }


      $scope.content.associateplan=!$scope.content.associateplan;// in db associatePlan true means there are plans, in app associatePlan === true means apply to all plans

          // Header deatil saves here.
          $charge.coupon().store($scope.content).success(function (data) {
            //
            //alert(data.error);
            if (data.error == "00000") {
              //
              notifications.toast("Record Saved, Coupon " + $scope.content.couponcode + " Added", 'success');

              $scope.loadCoupons();

              vm.appInnerState = "default";
              vm.addButtonDisplayText = "CREATE NEW";

              $scope.isSaveClicked = false;

            }
          }).error(function (data) {

            console.log(data);

            $scope.isSaveClicked = false;

            notifications.toast("Error adding record, " + data['error'], "error");
          })



    }


    $scope.changeView = function()
    {
      if(vm.appInnerState === "default"){
        vm.appInnerState = "add";
        vm.addButtonDisplayText = "VIEW COUPON";
        vm.pageTitle="View Coupon";
      }else{
        vm.appInnerState = "default";
        vm.addButtonDisplayText = "CREATE NEW";
        vm.pageTitle="Create New";
      }
    }


    $scope.selectCoupon = function(coupon)
    {
      console.log(coupon);

      $scope.editOff = true;

      $scope.selectedCoupon = [];

      $scope.changeCoupon=coupon;
      $scope.selectedCoupon = coupon;

      $scope.selectedCoupon.enddate = new Date($scope.selectedCoupon.enddate);
      $scope.selectedCoupon.startdate = new Date($scope.selectedCoupon.startdate);

      $scope.selectedCoupon.associateplan =  $scope.selectedCoupon.associateplan === 1 ? true : false;
      $scope.selectedCoupon.associateplan =  !$scope.selectedCoupon.associateplan;
      // in db associatePlan true means there are plans, in app associatePlan === true means apply to all plans

      $timeout(function ()
      {
        vm.activeCouponPaneIndex = 1;

        // Store the current scrollPos
        vm.scrollPos = vm.scrollEl.scrollTop();

        // Scroll to the top
        vm.scrollEl.scrollTop(0);
      });

    $scope.couponPlan = [];

      if(!$scope.selectedCoupon.associateplan) {
        $charge.coupon().getDetailsByCouponId(coupon.gucouponid).success(function (data) {

          console.log(data);

          for (var i = 0; i < data.length; i++) {
            $scope.couponPlan.push(data[i].guplanid);
          }


        }).error(function (data) {
          $scope.couponPlan = [];
          console.log(data);
        })
      }
      vm.addButtonDisplayText = "EDIT COUPON";


    }


    $scope.saveEdit = function(model)
    {
      var promCont = document.getElementById('editPromContainer');

      $scope.isSaveClicked = true;
      //
      var editReq=$scope.selectedCoupon;


      if(moment($scope.selectedCoupon.enddate).format('L') < moment($scope.selectedCoupon.startdate).format('L'))
      {
        $scope.isSaveClicked = false;
        notifications.toast('End date should be greater than start date','error');
        promCont.scrollTop=0;

        return;
      }
      else  if($scope.selectedCoupon.noofoccurence < 0)
      {
        $scope.isSaveClicked = false;
        //notifications.toast('Occurrence count cannot be less than 0.','error');
        promCont.scrollTop=0;

        return;
      }

      if(!vm.couponEdit.$valid){
        $scope.isSaveClicked = false;
        angular.element(document.querySelector('#couponEditForm')).find('.ng-invalid:visible:first').focus();
        return;
      }

      if ((!$scope.content.associateplan) ) {

        if ($scope.couponPlan.length < 1) {
          $scope.isSaveClicked = false;
          // notifications.toast('Please add coupon products.');
          notifications.toast('Please select plan(s).', 'error');
          return;
        }

      }



      editReq ={
          "gucouponid":$scope.selectedCoupon.gucouponid,
          "startdate":$scope.selectedCoupon.startdate,
          "enddate":$scope.selectedCoupon.enddate,
          "couponcode":$scope.selectedCoupon.couponcode,
          "noofoccurence":$scope.selectedCoupon.noofoccurence,
          "associateplan": $scope.selectedCoupon.associateplan ? 1 : 0,
          "redemption":$scope.selectedCoupon.redemption,
          "discounttype":$scope.selectedCoupon.discounttype,
          "discountamount":$scope.selectedCoupon.discountamount
        }



      if(!$scope.selectedCoupon.associateplan){
        editReq.couponDetails=[];

        for(var i =0;i<$scope.couponPlan.length;i++){
          editReq.couponDetails.push({"guplanid" : $scope.couponPlan[i]});
        }

      }

      editReq.associateplan= editReq.associateplan? 0 : 1;// in db associatePlan true means there are plans, in app associatePlan === true means apply to all plans


        $charge.coupon().update(editReq).success(function (data) {
          //
          if (data.error == "00000") {
            $scope.editOff = !$scope.editOff; $scope.editStyle ="";
            $scope.isSaveClicked = false;

            notifications.toast("Record Updated, coupon code " + editReq.couponcode, "success");

            editReq.associateplan = !editReq.associateplan;
            selectCoupon(editReq);

            $scope.toggleControllText = "EDIT COUPON";
            promCont.scrollTop=0;
          }
        }).error(function (data) {
          console.log(data);
          $scope.isSaveClicked = false;
          promCont.scrollTop=0;
          notifications.toast("Error when updating record", "error");
        })

    }

    $scope.closeReadPane= function()
    {


      vm.addButtonDisplayText = "CREATE NEW";
      $scope.toggleControllText = "EDIT COUPON";


      $scope.editOff = true;

      //vm.appInnerState = "add";
      $timeout(function ()
      {
        vm.scrollEl.scrollTop(vm.scrollPos);
        vm.selectedCouponTab = 0;

      }, 650);
    }


    $scope.toggleControllText = "EDIT COUPON";

    $scope.toggleEdit = function (ctrlText) {
      var promCont = document.getElementById('editPromContainer');

      if($scope.editOff){
        $scope.toggleControllText = 'VIEW COUPON';
      }else{
        $scope.toggleControllText = "EDIT COUPON";
      }

      if($scope.editOff==true)
      {
        $scope.editOff = false;
        promCont.scrollTop=0;

      }
      else
      {
        $scope.editOff = true;
        promCont.scrollTop=0;

      }

    }

    // toggle selection for a given fruit by name
    $scope.toggleSelection = function toggleSelection(code) {
      var idx = $scope.couponPlan.indexOf(code);

      // is currently selected
      if (idx > -1) {
        $scope.couponPlan.splice(idx, 1);
      }

      // is newly selected
      else {
        $scope.couponPlan.push(code);
      }
    };


  }
})();
