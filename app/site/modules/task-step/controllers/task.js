angular.module('handyforall.task').controller('taskCtrl', taskCtrl);

taskCtrl.$inject = ['$scope', '$rootScope', '$location', '$stateParams', '$uibModal', 'TaskService', 'TaskserviceResolve', 'toastr', '$state', 'AuthenticationService', 'CurrentUserResolve', 'MainService', '$translate', 'ngMeta','$cookieStore'];
function taskCtrl($scope, $rootScope, $location, $stateParams, $uibModal, TaskService, TaskserviceResolve, toastr, $state, AuthenticationService, CurrentUserResolve, MainService, $translate, ngMeta, $cookieStore) {
  var tac = this;
  var user = AuthenticationService.GetCredentials();

  if (!TaskserviceResolve || !TaskserviceResolve.length) {
    $translate('WE ARE LOOKING FOR THIS TROUBLE SORRY UNABLE TO FETCH DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
    $state.go('landing', {}, { reload: false });
  }

  tac.taskbaseinfo = {
    SubCategoryInfo: TaskserviceResolve[0].SubCategoryInfo
  };
  tac.filter = {
    user_address_index: 0,
    delivery_address_index: 0,
    description: $cookieStore.get('text')
  };
  tac.isAvailableAtUserLocation = -1; // It's unknown yet
  tac.isAvailableAtDeliveryLocation = -1; // It's unknown yet
  tac.userAddressList = [];
  tac.deliveryAddressList = [];

  tac.onUserAddressChanged = fnOnUserAddressChanged;
  tac.onDeliveryAddressChanged = fnOnDeliveryAddressChanged;
  tac.changeCategory = fnChangeCategory;
  tac.updateAddressStatus = fnUpdateAddressStatus;
  tac.deleteAddress = fnDeleteAddress;
  tac.editAddress = fnEditAddress;
  tac.editDeliveryAddress = fnEditDeliveryAddress;
  tac.searchTasker = fnSearchTasker;

  if (TaskserviceResolve[0].SubCategoryInfo.name) {
    ngMeta.setTitle(TaskserviceResolve[0].SubCategoryInfo.name);
  }

  if (CurrentUserResolve[0]) {
    tac.currentuserid = CurrentUserResolve[0]._id;

    if (CurrentUserResolve[0].addressList && CurrentUserResolve[0].addressList.length > 0) {
      tac.userAddressList = CurrentUserResolve[0].addressList;

      // look for default address
      for (var i = 0, len = tac.userAddressList.length; i < len; i++) {
        if (tac.userAddressList[i].status === 3) {
          tac.filter.user_address_index = i;
          break;
        }
      }

      tac.onUserAddressChanged(tac.filter.user_address_index);
    }

    if (CurrentUserResolve[0].deliveryAddressList && CurrentUserResolve[0].deliveryAddressList.length > 0) {
      tac.deliveryAddressList = CurrentUserResolve[0].deliveryAddressList;

      // look for default address
      for (var i = 0, len = tac.deliveryAddressList.length; i < len; i++) {
        if (tac.deliveryAddressList[i].status === 3) {
          tac.filter.delivery_address_index = i;
          break;
        }
      }

      tac.onDeliveryAddressChanged(tac.filter.delivery_address_index);
    }
  } else {
    tac.currentuserid = "";
  }

  function fnChangeCategory() {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/task-step/views/change-category.html',
      controller: 'changeCategoryModalInstanceCtrl',
      controllerAs: 'CCM'
    });

    modalInstance.result.then(function () {
      $state.go('landing', {}, { reload: false });
    }, function () { });
  }

  function fnOnUserAddressChanged(newVal) {
    if (newVal === -1 ||  !tac.userAddressList || tac.userAddressList.length < newVal) {
      tac.isAvailableAtUserLocation = -1;
      return;
    }

    tac.isAvailableAtUserLocation = -1;

    if (tac.filter.delivery_address_index == -1) {
      tac.onDeliveryAddressChanged(-1);
    }

    TaskService.checktaskeravailability(tac.userAddressList[newVal].location, tac.taskbaseinfo.SubCategoryInfo._id, user.currentUser.user_type).then(function (response) {
      if (angular.isDefined(response)) {
        if (response.count > 0) {
          tac.isAvailableAtUserLocation = 1;
        } else {
          tac.isAvailableAtUserLocation = 0;
        }
      }
    }, function (error) {
      tac.isAvailableAtUserLocation = 0;
    });
  }

  function fnOnDeliveryAddressChanged(newVal) {
    var location = null;

    if (parseInt(newVal, 10) === -1 && tac.userAddressList && tac.userAddressList.length >= tac.filter.user_address_index) {
      location = tac.userAddressList[tac.filter.user_address_index].location;
    } else if (parseInt(newVal, 10) > -1 && tac.deliveryAddressList && tac.deliveryAddressList.length >= newVal) {
      location = tac.deliveryAddressList[newVal].location;
    }

    if (!location) {
      tac.isAvailableAtDeliveryLocation = -1;
      return;
    }

    tac.isAvailableAtDeliveryLocation = -1;

    TaskService.checktaskeravailability(location, tac.taskbaseinfo.SubCategoryInfo._id, user.currentUser.user_type)
      .then(function (response) {
        if (angular.isDefined(response)) {
          if (response.count > 0) {
            tac.isAvailableAtDeliveryLocation = 1;
          } else {
            tac.isAvailableAtDeliveryLocation = 0;
          }
        }
      }, function (error) {
        tac.isAvailableAtDeliveryLocation = 0;
      });
  }

  function fnDeleteAddress (index, isDeliveryAddress) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/task-step/views/delete-confirm-model.html',
      controller: 'DeleteAddress',
      controllerAs: 'DATA',
      resolve: {
        user: function () {
          return tac.user;
        }
      }
    });

    modalInstance.result.then(function () {
      TaskService.deleteaddress({
        userid: user.currentUser.user_id,
        id: index,
        isDeliveryAddress: isDeliveryAddress
      }).then(function () {
        MainService.getCurrentUsers(user.currentUser.username, user.currentUser.user_type).then(function (refdata) {
          tac.userAddressList = refdata[0].addressList;
          tac.deliveryAddressList = refdata[0].deliveryAddressList;
        });
      });
    });
  }

  function fnUpdateAddressStatus (id, isDeliveryAddress) {
    TaskService.addressStatus({
      userid: user.currentUser.user_id,
      add_id: id,
      isDeliveryAddress: isDeliveryAddress
    }).then(function () {
      MainService.getCurrentUsers(user.currentUser.username, user.currentUser.user_type).then(function (refdata) {
        tac.userAddressList = refdata[0].addressList;
        tac.deliveryAddressList = refdata[0].deliveryAddressList;
      });
    });

    $translate('PREFERRED ADDRESS ADDED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
  }

  function fnEditAddress (index) {
    if (index >= 0) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/site/modules/task-step/views/addaddressmodel.html',
        controller: 'AddAddress',
        controllerAs: 'ATA',
        resolve: {
          user: function () {
            return angular.copy(tac.userAddressList[index]);
          }
        }
      });

      modalInstance.result.then(function (data) {
        if (!data.addressList || !data.addressList.location || !data.addressList.location.lat || !data.addressList.location.lat) {
          $translate('PLEASE ENTER VALID LOCATION').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        } else {
          TaskService.AddAddress(user.currentUser.user_id, data, user.currentUser.user_type).then(function (response) {
            $translate('ADDRESS ADDED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });

            MainService.getCurrentUsers(user.currentUser.username, user.currentUser.user_type).then(function (refdata) {
              tac.userAddressList = refdata[0].addressList;
            })
          });
        }
      });
    } else if (CurrentUserResolve[0].addressList.length < 5) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/site/modules/task-step/views/addaddressmodel.html',
        controller: 'AddAddress',
        controllerAs: 'ATA',
        resolve: {
          user: function () {
            return tac.userAddressList[index];
          }
        }
      });

      modalInstance.result.then(function (data) {
        if (!data.addressList || !data.addressList.location || !data.addressList.location.lat || !data.addressList.location.lat) {
          $translate('PLEASE ENTER VALID LOCATION').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        } else {
          TaskService.AddAddress(user.currentUser.user_id, data, user.currentUser.user_type).then(function (response) {
            if (response.status == 0) {
              $translate('ADDRESS ALREADY ON YOUR LIST').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
            } else {
              $translate('ADDRESS ADDED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });

              MainService.getCurrentUsers(user.currentUser.username, user.currentUser.user_type).then(function (refdata) {
                tac.userAddressList = refdata[0].addressList;
              })
            }
          });
        }
      });
    } else {
      $translate('SORRY MORE THAN 5 ADDRESS COULD NOT BE ADDED').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
    }
  }

  function fnEditDeliveryAddress (index) {
    if (index >= 0) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/site/modules/task-step/views/addaddressmodel.html',
        controller: 'AddAddress',
        controllerAs: 'ATA',
        resolve: {
          user: function () {
            return angular.copy(tac.deliveryAddressList[index]);
          }
        }
      });

      modalInstance.result.then(function (data) {
        if (!data.addressList || !data.addressList.location || !data.addressList.location.lat || !data.addressList.location.lat) {
          $translate('PLEASE ENTER VALID LOCATION').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        } else {
          TaskService.AddDeliveryAddress(user.currentUser.user_id, data, user.currentUser.user_type).then(function (response) {
            $translate('ADDRESS ADDED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });

            MainService.getCurrentUsers(user.currentUser.username, user.currentUser.user_type).then(function (refdata) {
              tac.deliveryAddressList = refdata[0].deliveryAddressList;
            })
          });
        }
      });
    } else if (CurrentUserResolve[0].deliveryAddressList.length < 5) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/site/modules/task-step/views/addaddressmodel.html',
        controller: 'AddAddress',
        controllerAs: 'ATA',
        resolve: {
          user: function () {
            return tac.deliveryAddressList[index];
          }
        }
      });

      modalInstance.result.then(function (data) {
        if (!data.addressList || !data.addressList.location || !data.addressList.location.lat || !data.addressList.location.lat) {
          $translate('PLEASE ENTER VALID LOCATION').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        } else {
          TaskService.AddDeliveryAddress(user.currentUser.user_id, data, user.currentUser.user_type).then(function (response) {
            if (response.status == 0) {
              $translate('ADDRESS ALREADY ON YOUR LIST').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
            } else {
              $translate('ADDRESS ADDED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });

              MainService.getCurrentUsers(user.currentUser.username, user.currentUser.user_type).then(function (refdata) {
                tac.deliveryAddressList = refdata[0].deliveryAddressList;
              })
            }
          });
        }
      });
    } else {
      $translate('SORRY MORE THAN 5 ADDRESS COULD NOT BE ADDED').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
    }
  }

  function fnSearchTasker() {
    $cookieStore.put('text', tac.filter.description);

    if (tac.isAvailableAtDeliveryLocation != 1) {
      $translate('THE TASKER IS UN AVAILABLE ON SELECTED ADDRESS').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
      return;
    }

    var objAddress = null;

    if (parseInt(tac.filter.delivery_address_index, 10) === -1 && tac.userAddressList && tac.userAddressList.length >= tac.filter.user_address_index) {
      objAddress = tac.userAddressList[tac.filter.user_address_index];
    } else if (parseInt(tac.filter.delivery_address_index, 10) > -1 && tac.deliveryAddressList && tac.deliveryAddressList.length >= tac.filter.delivery_address_index) {
      objAddress = tac.deliveryAddressList[tac.filter.delivery_address_index];
    }

    if (!objAddress) {
      toastr.error("Click on the address to check provider availability and proceed");
      return;
    }

    var data = {};

    data.categoryid = tac.taskbaseinfo.SubCategoryInfo._id;

    if (CurrentUserResolve[0].address) {
      data.billing_address = {
        'zipcode': CurrentUserResolve[0].address.zipcode || "",
        'country': CurrentUserResolve[0].address.country || "",
        'state': CurrentUserResolve[0].address.state || "",
        'city': CurrentUserResolve[0].address.city || "",
        'line2': CurrentUserResolve[0].address.line2 || "",
        'line1': CurrentUserResolve[0].address.line1 || ""
      };
    } else {
      data.billing_address = {
        'zipcode': objAddress.zipcode || "",
        'country': objAddress.country || "",
        'state': objAddress.state || "",
        'city': objAddress.city || "",
        'line2': objAddress.street || "",
        'line1': objAddress.line1 || ""
      };
    }

    data.userid = tac.currentuserid;
    data.categoryid = tac.taskbaseinfo.SubCategoryInfo._id;
    data.task_description = tac.filter.description;

    data.location = { 'lat': objAddress.location.lat, 'log': objAddress.location.lng };
    data.task_address = {
      'zipcode': objAddress.zipcode || "",
      'country': objAddress.country || "",
      'state': objAddress.state || "",
      'city': objAddress.city || "",
      'landmark': objAddress.landmark || "",
      'line2': objAddress.street || "",
      'line1': objAddress.line1 || "",
      'lat': objAddress.location.lat || "",
      'lng': objAddress.location.lng || ""
    };

    TaskService.addtask(data).then(function (result) {
      tac.booking_id = result.booking_id;

      var option = {
        slug: tac.taskbaseinfo.SubCategoryInfo.slug,
        task: result._id
      };

      $state.go('search', option, { reload: false });
    }, function (error) {
      toastr.error(error);
    });
  }
}






angular.module('handyforall.task').controller('RegisterModalInstanceCtrl', function ($modalInstance, $filter, toastr, $scope, AuthenticationService, $cookieStore, $state, $translate) {
  var rcm = this;
  rcm.registerUser = function () {
    $modalInstance.close(rcm);
  };

  rcm.registerUser = function (isValid, formData) {
    rcm.Error = '';
    var today = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
    if (isValid) {
      rcm.UserDetails.today = today;
      rcm.UserDetails.role = rcm.type;
      rcm.UserDetails.location = $scope.location;
      AuthenticationService.Register(rcm.UserDetails, function (err, response) {
        if (err) {
          for (var i = 0; i < err.length; i++) {
            toastr.error('Your credentials are wrong ' + err[i].msg + '--' + err[i].param);
          }
        } else {
          if (response.user == rcm.UserDetails.username) {
            AuthenticationService.SetCredentials(response.user, response.user_id, response.token, response.user_type, response.tasker_status);
            $cookieStore.remove('TaskerData');
            if (rcm.type == 'user') {
              $location.path('/');
            } else {
              $state.reload();
            }

          } else {
            $translate('EMAIL ID ALREADY EXISTS OR USER NAME EXISTS').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
          }
        }
      });
    } else {
      $translate('INVALID DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
    }
  };
});

angular.module('handyforall.task').controller('changeCategoryModalInstanceCtrl', function ($uibModalInstance) {
  var ccm = this;
  ccm.ok = function () {
    $uibModalInstance.close('ok');
  };
  ccm.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});


angular.module('handyforall.task').controller('AddAddress', function ($uibModalInstance, toastr, user, $location, $state, $scope, $translate) {
  var ata = this;
  ata.editaddressdata = user;
  $scope.location = {};
  ata.addressList = {};
  ata.addressList.location = { lat: '', lng: '' };
  ata.placeChanged = function () {
    ata.test={};
    ata.place = this.getPlace();
    console.log(ata.place);
    ata.addressList.location.lat = ata.place.geometry.location.lat();
    ata.addressList.location.lng = ata.place.geometry.location.lng();
    ata.availability = 2;
    var locationa = ata.place;

    for (var i = 0; i < locationa.address_components.length; i++) {
      for (var j = 0; j < locationa.address_components[i].types.length; j++) {
        if (locationa.address_components[i].types[j] == 'sublocality_level_1') {
          ata.editaddressdata.line1 = locationa.address_components[i].long_name;
        }
        if (locationa.address_components[i].types[j] == 'route' || locationa.address_components[i].types[j] == 'street_number') {
          ata.editaddressdata.street = locationa.address_components[i].long_name;
        }
        if (locationa.address_components[i].types[j] == 'sublocality_level_2') {
          ata.editaddressdata.city = locationa.address_components[i].long_name;
        }
        if (locationa.address_components[i].types[j] == 'locality') {

          ata.editaddressdata.locality = locationa.address_components[i].long_name;
        }
        if (locationa.address_components[i].types[j] == 'country') {


          ata.editaddressdata.country = locationa.address_components[i].long_name;
        }
        if (locationa.address_components[i].types[j] == 'postal_code') {


          ata.editaddressdata.zipcode = locationa.address_components[i].long_name;
        }
        if (locationa.address_components[i].types[j] == 'administrative_area_level_1' || locationa.address_components[i].types[j] == 'administrative_area_level_2') {
          ata.editaddressdata.state = locationa.address_components[i].long_name;
        }
      }
    }


  };
  ata.ok = function (isValid) {
    console.log(isValid);
    console.log(user);
    console.log(ata.test);
    if(user && ata.test == undefined){
      ata.availability = 2;
      ata.addressList.location.lat = user.location.lat;
      ata.addressList.location.lng = user.location.lng;
      ata.editaddressdata.sat =1;
      console.log("sucess");
      console.log(ata);
      if (ata.addressList.location.lat == '' || ata.addressList.location.lng == ''||user.line1=='') {
        $translate('PLEASE ENTER VALID LOCATION').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
      } else {
        if (isValid == true) {
          $uibModalInstance.close(ata);
        } else {
          $translate('INVALID DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        }
      }
    }
    else{
      console.log(ata,"hhhhh");
      if (ata.addressList.location.lat == '' || ata.addressList.location.lng == '') {
        $translate('PLEASE ENTER VALID LOCATION').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
      } else {
        if (isValid == true) {console.log(ata);
          $uibModalInstance.close(ata);
        } else {
          $translate('INVALID DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        }
      }
    }
  };
  ata.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('handyforall.task').controller('DeleteAddress', function ($uibModalInstance, user, $state) {
  var data = this;
  data.ok = function () {
    $uibModalInstance.close();
  };
  data.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('handyforall.task').directive('setClassWhenAtTop', function ($window) {
  var $win = angular.element($window);

  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var topClass = attrs.setClassWhenAtTop
      offsetTop = element.offset().top;
      $win.on('scroll', function (e) {
        if ($win.scrollTop() >= offsetTop) {
          element.addClass(topClass);
        } else {
          element.removeClass(topClass);
        }
      });
    }
  };
});
