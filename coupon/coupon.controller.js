(function ()
{
	'use strict';

	angular
		.module('app.coupon')
		.controller('CouponController', CouponController);

	/** @ngInject */
	function CouponController($scope,  $timeout, $charge,notifications, $filter,$mdDialog,logHelper)
	{
		var vm = this;

		vm.appInnerState = "default";
		vm.pageTitle="Create New";
		vm.checked = [];
		vm.colors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg'];

		vm.selectedCoupon = {};

		vm.responsiveReadPane = undefined;
		vm.activeCouponPaneIndex = 0;
		vm.dynamicHeight = false;

		vm.scrollPos = 0;
		vm.scrollEl = angular.element('#content');

		vm.selectedMailShowDetails = false;

		vm.addButtonDisplayText = "CREATE NEW";

//////////////
    /////////
    //////// // application use for invoice or subscription
    ///////
    //////////////

    $scope.issubscriptionappuse = false;//"invoice";


		$scope.content={};
		$scope.content.associateplan = true;
		$scope.content.discounttype = "0"; // default selected 'flat'
		$scope.content.generateCoupon = 0; // default set as 1
		$scope.couponDetail = [];

		//if(!$scope.NoEndDate)
		//  $scope.NoEndDate = false;

		$scope.isSpinnerShown = true;
		$scope.content.startdate = new Date();
		$scope.content.enddate=new Date();
		$scope.content.coupontype=0;

		$scope.currentDate = moment(new Date().toISOString()).format('LL');

		$scope.rows=[];

		var tempEditCoupon = {};

		//$charge.commondata().getDuobaseValuesByTableName("CTS_GeneralAttributes").success(function(data) {
		//  $scope.decimalPoint=parseInt(data[6].RecordFieldData);
		//
		//}).error(function(data) {
		//});

  try{

		$scope.skip=0;
		$scope.take = 100;
		vm.coupons = [];
		// Kasun_WIjeratne_5_5_2017
		$scope.showInpageReadpane = false;
		$scope.editOff = false;
		$charge.settingsapp().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_GeneralAttributes","BaseCurrency").success(function(data) {
			$scope.baseCurrency=data[0].RecordFieldData;
		}).error(function(data) {
			// console.log(data);
			//$scope.BaseCurrency="USD";
			//$scope.selectedCurrency = $scope.BaseCurrency;
		})

  }catch(ex){
    ex.app = "coupon";
    logHelper.error(ex);
  }

		$scope.switchInfoPane = function (state, coupon) {
			if(state=='show'){
				$scope.showInpageReadpane = true;
				// $scope.$watch(function () {
				// 	//vm.selectedPlan = plan;
				// });
				$scope.selectCoupon(coupon);
			}else if(state=='close'){
				if(!$scope.editOff){
					// $scope.cancelEdit();
					vm.selectedCoupon = tempEditCoupon;
					$scope.editOff=true;
				}else{
					$scope.showInpageReadpane = false;
					$scope.editOff=false;
				}
			}
		}
		$scope.sortBy = function(propertyName,status,property) {
			try{

        vm.coupons=$filter('orderBy')(vm.coupons, propertyName, $scope.reverse);
        $scope.reverse =!$scope.reverse;

        if(status!=null) {
          if(property=='Coupon')
          {
            $scope.showName = status;
            $scope.showStart = false;
            $scope.showEnd = false;
            $scope.showOcc = false;
            $scope.showState = false;
          }
          if(property=='Start')
          {
            $scope.showName = false;
            $scope.showStart = status;
            $scope.showEnd = false;
            $scope.showOcc = false;
            $scope.showState = false;
          }
          if(property=='End')
          {
            $scope.showName = false;
            $scope.showStart = false;
            $scope.showEnd = status;
            $scope.showOcc = false;
            $scope.showState = false;
          }
          if(property=='Occurrences')
          {
            $scope.showName = false;
            $scope.showStart = false;
            $scope.showEnd = false;
            $scope.showOcc = status;
            $scope.showState = false;
          }
          if(property=='Status')
          {
            $scope.showName = false;
            $scope.showStart = false;
            $scope.showEnd = false;
            $scope.showOcc = false;
            $scope.showState = status;
          }
        }
      }catch(ex){
        ex.app = "coupon";
        logHelper.error(ex);
      }
		};
		// / Kasun_WIjeratne_5_5_2017



		$scope.loadCoupons = function() {
      try{
          vm.listLoaded = false;
          $charge.coupon().all($scope.skip, $scope.take, "desc").success(function (data) {
            // console.log(data);
            for (var i = 0; i < data.length; i++) {

              var stat = "Active";

              if ( moment(data[i]["enddate"]).format('L') < moment(new Date().toISOString()).format('L')) {

                stat = "Expired";
                data[i].status = stat;
              }else if (data[i]["noofoccurence"] <= data[i]["currentuse"]) {
                stat = "Expired";
                data[i].status = stat;
              }else{
                data[i].status = stat;
              }
              vm.coupons.push(data[i]);


            }

            $scope.skip += $scope.take;

            if($scope.skip >vm.coupons.length)
            {
              $scope.showMoreButton = false;
            }

            // vm.coupons = $scope.data;
            vm.listLoaded = true;

            // $scope.isLoading = false;
          }).error(function (data) {
            vm.listLoaded = true;
            $scope.showMoreButton = false;
            // console.log(data);
          })

      }catch(ex){

        vm.listLoaded = true;
        $scope.showMoreButton = false;

        ex.app = "coupon";
        logHelper.error(ex);
      }

		}

    $scope.loadByKeywordCoupon = function(keyword) {

      try{

        if(keyword.length > 2) {
          vm.coupons=[];
          vm.listLoaded = false;
          $charge.coupon().GetcouponsForKeyword(0, 1000, keyword).success(function (data) {
            // console.log(data);
            for (var i = 0; i < data.length; i++) {

              var stat = "Active";

              if (moment(data[i]["enddate"]).format('L') < moment(new Date().toISOString()).format('L')) {

                stat = "Expired";
                data[i].status = stat;
              } else if (data[i]["noofoccurence"] <= data[i]["currentuse"]) {
                stat = "Expired";
                data[i].status = stat;
              } else {
                data[i].status = stat;
              }
              vm.coupons.push(data[i]);


            }

            //$scope.skip += $scope.take;
            //
            //if($scope.skip >vm.coupons.length)
            //{
            $scope.showMoreButton = false;
            //}

            // vm.coupons = $scope.data;
            vm.listLoaded = true;

            // $scope.isLoading = false;
          }).error(function (data) {
            vm.listLoaded = true;
            $scope.showMoreButton = false;
            // console.log(data);
          })
        }
        else if(keyword.length === 0){
          $scope.skip = 0;
          vm.coupons = [];
          $scope.loadCoupons();
        }
      }catch(ex){

        vm.listLoaded = true;
        $scope.showMoreButton = false;

        ex.app = "coupon";
        logHelper.error(ex);
      }

    }



		$scope.loadCoupons();

		$scope.loadCouponsByType = function(type) {

      try{
          vm.listLoaded = false;
          $charge.coupon().getCouponsByType($scope.skip, $scope.take,type, "desc").success(function (data) {
            // console.log(data);
            for (var i = 0; i < data.length; i++) {

              var stat = "Active";

              if ( moment(data[i]["enddate"]).format('L') < moment(new Date().toISOString()).format('L')) {
                stat = "Expired";
                data[i].status = stat;
                vm.coupons.push(data[i]);
              }else if (data[i]["noofoccurence"] <= data[i]["currentuse"]) {
                stat = "Expired";
                data[i].status = stat;
                vm.coupons.push(data[i]);
              }else{
                data[i].status = stat;
                vm.coupons.push(data[i]);
              }
            }

            $scope.skip += $scope.take;

            if($scope.skip >vm.coupons.length)
            {
              $scope.showMoreButton = false;
            }

            // vm.coupons = $scope.data;
            vm.listLoaded = true;

            // $scope.isLoading = false;
          }).error(function (data) {
            vm.listLoaded = true;
            $scope.showMoreButton = false;
            // console.log(data);
          })

      }catch(ex){

        vm.listLoaded = true;
        $scope.showMoreButton = false;

        ex.app = "coupon";
        logHelper.error(ex);
      }

		}

    $scope.detailList = [];
  if($scope.issubscriptionappuse) {
      $scope.loadPlans = function () {

        try {
          vm.listDetailLoaded = false;

          $charge.plan().allPlans($scope.skip, $scope.take, "desc").success(function (data) {
            // console.log(data);
            for (var i = 0; i < data.length; i++) {
                data[i].detailId = data[i].guPlanID;
              $scope.detailList.push(data[i]);
            }

            vm.listDetailLoaded = true;

            // $scope.isLoading = false;
          }).error(function (data) {
            vm.listDetailLoaded = true;
            // console.log(data);
          })

        } catch (ex) {
          ex.app = "coupon";
          logHelper.error(ex);

          vm.listDetailLoaded = true;
        }

      }

      $scope.loadPlans();
  }else{
    $scope.loadPlans = function () {

      try {
        vm.listDetailLoaded = false;

        $charge.product().all($scope.skip, $scope.take, "desc").success(function (data) {
          // console.log(data);
          for (var i = 0; i < data.length; i++) {
            data[i].detailId = data[i].guproductID;
            $scope.detailList.push(data[i]);
          }

          vm.listDetailLoaded = true;

          // $scope.isLoading = false;
        }).error(function (data) {
          vm.listDetailLoaded = true;
          // console.log(data);
        })

      } catch (ex) {
        ex.app = "coupon";
        logHelper.error(ex);

        vm.listDetailLoaded = true;
      }

    }

    $scope.loadPlans();
  }


		$scope.isSaveClicked = false;

		$scope.submit = function() {

      try{
          if(!vm.couponAdd.$valid)
          {
            angular.element(document.querySelector('#couponForm')).find('.ng-invalid:visible:first').focus();
            $scope.isSaveClicked = false;
            return;

          }else{
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

            if(parseInt($scope.content.coupontype) === 1)
            {
              $scope.content.associateplan = true;
            }

            if ((!$scope.content.associateplan) ) {

              if ($scope.couponDetail.length < 1) {
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

            var generateCount = $scope.content.generateCoupon;

            // main table details and promo product details
            $scope.content = {
              "startdate": $scope.content.startdate,
              "enddate": $scope.content.enddate,
              "couponcode": $scope.content.couponcode,
              "noofoccurence": $scope.content.noofoccurence,
              "associateplan":$scope.content.associateplan ? 1 : 0,
              "redemption": redemptionCount,
              "discounttype": $scope.content.discounttype,
              "discountamount": $scope.content.couponDiscount,
              "coupontype": $scope.content.coupontype,
              "issubscription" : $scope.issubscriptionappuse ? "1" : "0"   // if app been use for subscription this is true
            };

            if(parseInt($scope.content.coupontype) === 1)
            {
              $scope.content.generateCount = generateCount;
            }

            $scope.content.isDirectFromInsert = "true";

            if(!$scope.content.associateplan){
              $scope.content.couponDetails=[];

              for(var i =0;i<$scope.couponDetail.length;i++){
                $scope.content.couponDetails.push({"guDetailid" : $scope.couponDetail[i]});
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


                //===== load related coupons====================


                $charge.coupon().getAutoGeneratedCoupons($scope.content.couponcode).success(function (data) {

                  $("#myTable tr").remove();

                  for (var i = 0; i < data.length; i++) {
                    var table = document.getElementById("myTable");
                    var row = table.insertRow(i);
                    var cell1 = row.insertCell(0);
                    cell1.innerHTML = data[i].couponcode;
                  }

                  var report = new Blob([document.getElementById('mainDiv').innerHTML], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
                  });

                  saveAs(report, "CloudCharge.xls");

                }).error(function (data) {

                })



                $scope.skip=0; vm.coupons = [];$scope.content={};
                vm.appInnerState = "default";
                vm.addButtonDisplayText = "CREATE NEW";
                // vm.couponAdd.$setDirty();
                vm.couponAdd.$setPristine();
                vm.couponAdd.$setUntouched();
                vm.activePlanPaneIndex = 0;
                $scope.loadCoupons();
                $scope.isSaveClicked = false;

              }
            }).error(function (data) {

              // console.log(data);

              $scope.isSaveClicked = false;

              notifications.toast("Error adding record, " + data['error'], "error");
            })
          }

      }catch(ex){
        ex.app = "coupon";
        logHelper.error(ex);

        $scope.isSaveClicked = false;
        notifications.toast("Error adding record, Please check and submit ", "error");
      }
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

		$scope.isReadLoaded = true;
		$scope.activeCoupon = {
			couponcode:null
		};

		$scope.selectCoupon = function(coupon)
		{
			// console.log(coupon);
    try{
          $scope.isReadLoaded = false;
          $scope.editOff = true;
          $scope.activeCoupon.couponcode = coupon.couponcode;

          vm.selectedCoupon = {};

          $scope.changeCoupon=coupon;
          vm.selectedCoupon = angular.copy(coupon);
          vm.selectedCoupon.editedRedemption = vm.selectedCoupon.redemption;

          vm.selectedCoupon.noRedemptionCount = false;
          if(vm.selectedCoupon.redemption === -999)
          {
            vm.selectedCoupon.noRedemptionCount = true;
            vm.selectedCoupon.editedRedemption = 1;
          }

          vm.selectedCoupon.enddate = new Date(vm.selectedCoupon.enddate);
          vm.selectedCoupon.startdate = new Date(vm.selectedCoupon.startdate);

          // vm.selectedCoupon.associateplan =  vm.selectedCoupon.associateplan === 1 ? true : false;
          if(vm.selectedCoupon.associateplan === 1){
            vm.selectedCoupon.associateplan=false;
          }else if(vm.selectedCoupon.associateplan === 0){
            vm.selectedCoupon.associateplan=true;
          }
          //vm.selectedCoupon.associateplan =  !vm.selectedCoupon.associateplan;
          // in db associatePlan true means there are plans, in app associatePlan === true means apply to all plans

          $timeout(function ()
          {
            vm.activeCouponPaneIndex = 1;

            // Store the current scrollPos
            vm.scrollPos = vm.scrollEl.scrollTop();

            // Scroll to the top
            vm.scrollEl.scrollTop(0);
          });

          $scope.couponDetail = [];

          if(!vm.selectedCoupon.associateplan) {
            $charge.coupon().getDetailsByCouponId(coupon.gucouponid).success(function (data) {
              // console.log(data);

              for (var i = 0; i < data.length; i++) {
                $scope.couponDetail.push(data[i].guDetailid);
              }

              $scope.isReadLoaded = true;
            }).error(function (data) {
              $scope.couponDetail = [];
              // console.log(data);
              $scope.isReadLoaded = true;
            })
          }else{
            $scope.isReadLoaded = true;
          }
          vm.addButtonDisplayText = "EDIT COUPON";


          //===== load related coupons====================

            if(coupon.coupontype === 1 && coupon.relatedcoupon === null){

                    $charge.coupon().getAutoGeneratedCoupons(coupon.couponcode).success(function (data) {

                       console.log(data);

                      //for (var i = 0; i < data.length; i++) {
                      //  $scope.couponDetail.push(data[i].guDetailid);
                      //}

                    }).error(function (data) {

                    })
              }
    }catch(ex){
      ex.app = "coupon";
      logHelper.error(ex);
    }

		}


		$scope.saveEdit = function(model)
		{
			 //var promCont = document.getElementById('editPromContainer');
      try{
            $scope.isSaveClicked = true;
            //
            var editReq=vm.editableCoupon;

            if(moment(vm.editableCoupon.enddate).format('L') < moment(vm.editableCoupon.startdate).format('L'))
            {
              $scope.isSaveClicked = false;
              notifications.toast('End date should be greater than start date','error');
              //promCont.scrollTop=0;

              return;
            }
            else if(vm.editableCoupon.noofoccurence < 0)
            {
              $scope.isSaveClicked = false;
              //notifications.toast('Occurrence count cannot be less than 0.','error');
             // promCont.scrollTop=0;

              return;
            }

            if(!vm.couponEdit.$valid){
              $scope.isSaveClicked = false;
              angular.element(document.querySelector('#couponEditForm')).find('.ng-invalid:visible:first').focus();
              return;
            }

            if(parseInt(vm.editableCoupon.coupontype) === 1)
            {
              vm.editableCoupon.associateplan = true;
            }

            if ((!vm.editableCoupon.associateplan) ) {

              if ($scope.couponDetail.length < 1) {
                $scope.isSaveClicked = false;
                // notifications.toast('Please add coupon products.');
                notifications.toast('Please select plan(s).', 'error');
                return;
              }

            }

            if(vm.editableCoupon.noRedemptionCount)
            {
              vm.editableCoupon.redemption = -999;
            }else{
              vm.editableCoupon.redemption = vm.selectedCoupon.editedRedemption;
            }



            editReq ={
              "gucouponid":vm.editableCoupon.gucouponid,
              "startdate":$filter('date')(vm.editableCoupon.startdate, 'dd-MM-yyyy'),
              "enddate":$filter('date')(vm.editableCoupon.enddate, 'dd-MM-yyyy'),
              "couponcode":vm.editableCoupon.couponcode,
              "noofoccurence":vm.editableCoupon.noofoccurence,
              "associateplan": vm.editableCoupon.associateplan ? 1 : 0,
              "redemption":vm.editableCoupon.redemption,
              "discounttype":vm.editableCoupon.discounttype,
              "discountamount":vm.editableCoupon.discountamount,
              "coupontype":vm.editableCoupon.coupontype,
              "issubscription" : $scope.issubscriptionappuse ? "1" : "0"    // if app been use for subscription this is true
            }

            if(!vm.editableCoupon.associateplan){
              editReq.couponDetails=[];

              for(var i =0;i<$scope.couponDetail.length;i++){
                editReq.couponDetails.push({"guDetailid" : $scope.couponDetail[i]});
              }

            }
            editReq.associateplan= editReq.associateplan? 0 : 1;// in db associatePlan true means there are plans, in app associatePlan === true means apply to all plans


            $charge.coupon().update(editReq).success(function (data) {

              if (data.error == "00000") {
                $scope.editOff = !$scope.editOff; $scope.editStyle ="";
                $scope.isSaveClicked = false;

                notifications.toast("Record Updated, coupon code " + editReq.couponcode, "success");

                vm.editableCoupon.coupontype = parseInt(vm.editableCoupon.coupontype);

                editReq.associateplan = !editReq.associateplan;
                // editReq.redemptionUse = vm.selectedCoupon.redemptionUse;						//
                // editReq.currentuse = vm.selectedCoupon.currentuse;
                // editReq.coupontype = parseInt(vm.selectedCoupon.coupontype);
                $scope.selectCoupon(vm.editableCoupon);

                $scope.skip=0; vm.coupons = [];
                $scope.loadCoupons();

                $scope.toggleControllText = "EDIT COUPON";
                //promCont.scrollTop=0;
              }
            }).error(function (data) {
              // console.log(data);
              $scope.isSaveClicked = false;
             // promCont.scrollTop=0;
              notifications.toast("Error when updating record", "error");
            })

      }catch(ex){
        ex.app = "coupon";
        logHelper.error(ex);

        $scope.isSaveClicked = false;
       // promCont.scrollTop=0;
        notifications.toast("Error when updating record", "error");

      }

		}

		$scope.toggleReadPane = function () {
			$scope.editOff = true;
			$scope.content.coupontype = 0;
			vm.activePlanPaneIndex = 1;
			$scope.couponDetail=[];
			$scope.showInpageReadpane = false;
		}

		$scope.closeReadPane= function()
		{
			// vm.addButtonDisplayText = "CREATE NEW";
			// $scope.toggleControllText = "EDIT COUPON";

			$scope.content={};
			vm.couponAdd.$setPristine;
			vm.couponAdd.$setDirty;

			$scope.editOff = true;
			$timeout(function () {
				vm.selectedCoupon = tempEditCoupon;
			});
			vm.activePlanPaneIndex = 0;

			//vm.appInnerState = "add";
			// $timeout(function ()
			// {
			// 	vm.scrollEl.scrollTop(vm.scrollPos);
			// 	vm.selectedCouponTab = 0;
			//
			// }, 650);
		}


		$scope.toggleControllText = "EDIT COUPON";

		$scope.toggleEdit = function (ctrlText, coupon) {
			var promCont = document.getElementById('editPromContainer');

			// if($scope.editOff){
			// 	$scope.toggleControllText = 'VIEW COUPON';
			// }else{
			// 	$scope.toggleControllText = "EDIT COUPON";
			// }

			if($scope.editOff==true)
			{
				tempEditCoupon = angular.copy(coupon);
				vm.editableCoupon = coupon;
				$scope.editOff = false;
				promCont.scrollTop=0;
			}
			else
			{
				$scope.editOff = true;
				promCont.scrollTop=0;

			}
		};

    $scope.generateMoreCoupon = function(ev,coupon){

      $mdDialog.show({
        controller: 'autoGenerateCouponController',
        templateUrl: 'app/main/coupon/dialogs/autoGenerateCoupon.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:false,
        locals:{
          coupon : coupon
        }
      })
        .then(function(answer) {

          $scope.skip=0; vm.coupons = [];$scope.content={};
          vm.appInnerState = "default";
          vm.addButtonDisplayText = "CREATE NEW";
          // vm.couponAdd.$setDirty();
          vm.couponAdd.$setPristine();
          vm.couponAdd.$setUntouched();
          vm.activePlanPaneIndex = 0;
          $scope.loadCoupons();
          $scope.isSaveClicked = false;

        }, function() {

        });
    }

		// toggle selection for a given fruit by name
		$scope.toggleSelection = function toggleSelection(code) {

      try{
          var idx = $scope.couponDetail.indexOf(code);

          // is currently selected
          if (idx > -1) {
            $scope.couponDetail.splice(idx, 1);
          }

          // is newly selected
          else {
            $scope.couponDetail.push(code);
          }
      }catch(ex){
        ex.app = "coupon";
        logHelper.error(ex);
      }
		};


		$scope.applyFilters = function (filter){
			$scope.skip=0;
			vm.coupons=[];

			if(filter === '')
			{
				$scope.loadCoupons();

			}else{
				$scope.loadCouponsByType(filter);
			}
		}


	}
})();
