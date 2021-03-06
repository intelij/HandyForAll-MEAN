angular.module('handyforall.accounts').controller('accountsCtrl', accountsCtrl);

accountsCtrl.$inject = ['$scope', '$rootScope', 'MainService', 'accountService', 'accountServiceResolve', '$filter', '$uibModal', '$location', 'toastr', '$timeout', 'Slug', '$state', '$window', '$anchorScroll', 'AuthenticationService', 'sweet', '$stateParams', '$translate', 'NgMap', 'socket', 'notify', '$q'];
function accountsCtrl($scope, $rootScope, MainService, accountService, accountServiceResolve, $filter, $uibModal, $location, toastr, $timeout, Slug, $state, $window, $anchorScroll, AuthenticationService, sweet, $stateParams, $translate, NgMap, socket, notify, $q) {
  var acc = this;
  var account_status = $stateParams.status;
  var user = AuthenticationService.GetCredentials();

  acc.radiusby = $rootScope.settings ? $rootScope.settings.distanceby : "";
  acc.radiusval = acc.radiusby === "km" ? 1000 : 1609.34;
  acc.taskervariable = user;

  acc.getTimeStamp = function () {
    return Date.now();
  };

  if (accountServiceResolve[0]) {
    acc.user = accountServiceResolve[0] || {};
  }

  $scope.visibleValue = false;

  $q.all([
    MainService.getDefaultCurrency(),
    accountService.getsettings()
  ]).then(function(responses) {
    acc.DefaultCurrency = responses[0];
    acc.getsettings = responses[1];

    acc.inter = parseInt(acc.getsettings.settings.wallet.amount.maximum) + parseInt(acc.getsettings.settings.wallet.amount.minimum);
    acc.interamount = acc.inter / 2;
    acc.walletMinAmt = (acc.getsettings.settings.wallet.amount.minimum * $scope.DefaultCurrency[0].value).toFixed(2);
    acc.walletMaxAmt = (acc.getsettings.settings.wallet.amount.maximum * $scope.DefaultCurrency[0].value).toFixed(2);
    acc.walletMidAmt = ((acc.getsettings.settings.wallet.amount.maximum / 2) * $scope.DefaultCurrency[0].value).toFixed(2);
  }).catch(function(error) {
    console.error('Failed to load basic data', error);
  });

  console.log("acc.user", acc.user);

  if (acc.user) {
    if (acc.user.gender) {
      acc.user.gender = acc.user.gender.toLowerCase().replace(/\s+/g, '');
    }

    acc.availabilityvalue = acc.user.availability == 1;

    if (acc.user.role == "user" && (!acc.user.location || !acc.user.location.lat)) {
      console.log('initializing user location...');
      var objUserAddress = acc.user.addressList.find(function(item) {
        return item.status == 3;
      });

      if (!objUserAddress)
        objUserAddress = acc.user.addressList.find(function(item) {
          return item.status == 1;
        });

      if (objUserAddress && objUserAddress.location) {
        acc.user.location = objUserAddress.location;
        acc.user.availability_address = objUserAddress.land1;
      }
    }

    if (acc.user.location) {
      var latlng = new google.maps.LatLng(acc.user.location.lat, acc.user.location.lng);
      var geocoder = geocoder = new google.maps.Geocoder();
      geocoder.geocode({ 'latLng': latlng }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          if (results[1]) {
            if (acc.user.availability_address) {
              acc.taskerareaaddress = acc.user.availability_address;
              acc.tempTaskAddress = acc.user.availability_address;
            } else {
              acc.taskerareaaddress = results[1].formatted_address;
              acc.tempTaskAddress = results[1].formatted_address;
            }
            acc.dummyAddress = 1;
          }
        }
      });
    }
  }

  // Croping
  $scope.myImage = '';
  acc.myCroppedImage = '';
  $scope.imageChangeValue = false;
  $scope.handleFileSelect = function (evt) {
    $scope.imageChangeValue = true;
    $scope.visibleValue = true;
    var file = evt.currentTarget.files[0];
    var reader = new FileReader();
    reader.onload = function (evt) {
      $scope.$apply(function ($scope) {
        $scope.myImage = evt.target.result;
      });
    };
    reader.readAsDataURL(file);
  };
  // End Croping

  $scope.maps = [];
  $scope.$on('mapInitialized', function (evt, evtMap) {
    console.log('map initialized...');
    $scope.maps.push(evtMap);
  });

  function Availability() {
    this.init = function () {
      $timeout(function () {
        google.maps.event.trigger($scope.maps[0], 'resize');

        if (acc.user.location && acc.user.location.lat && acc.user.location.lng)
          $scope.maps[0].setCenter(new google.maps.LatLng(acc.user.location.lat, acc.user.location.lng));
      }, 100);
    }
  }

  acc.mapToInput = function (event) {
    if ($scope.maps[0]) {
      acc.user.radius = parseInt($scope.maps[0].shapes.circle.radius / acc.radiusval);
      var lat = $scope.maps[0].shapes.circle.center.lat();
      var lng = $scope.maps[0].shapes.circle.center.lng();
      var latlng = new google.maps.LatLng(lat, lng);
      var geocoder = geocoder = new google.maps.Geocoder();
      geocoder.geocode({ 'latLng': latlng }, function (results, status) {
        if (status == 'OK') {
          $scope.$apply(function () {
            acc.taskerareaaddress = results[0].formatted_address;
            acc.user.availability_address = results[0].formatted_address;
            acc.user.location.lng = lng;
            acc.user.location.lat = lat;
          })
        }
      });
    }
  };

  acc.valueChange = function () {
    var user = AuthenticationService.GetCredentials();
    if (user.currentUser.username) {
      if (user.currentUser.user_type == 'user') {
        MainService.getCurrentUsers(user.currentUser.username).then(function (response) {
          acc.user = response[0];
          $scope.visibleValue = false;
        }, function (err) {

        });
      } else if (user.currentUser.user_type == 'tasker') {
        return MainService.getCurrentTaskers(user.currentUser.username).then(function (response) {
          acc.user = response[0];
          $scope.visibleValue = false;
        }, function (err) {

        });
      }
    }
  };

  $scope.fileupload = function fileupload($files, $event, $rejectedFiles) {
    if ($files) {

      console.log("files", $files)

      if ($files.length && $files[0].size < 2097152) {
        for (var i = 0; i < $files.length; i++) {
          $scope.avatar = $files[i];
          acc.user.avatar = $scope.avatar;
        }
      }
      else if (!$files[0]) {
        $translate('Please check the image Size or format').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
      } else {
        $translate('IMAGE SIZE IS SHOULD NOT BE LARGER THEN 1 MB').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
      }
    }
  };

  acc.filter = $location.$$search;
  acc.accountMenu = [
    {
      "heading": "ACCOUNT",
      "template": "app/site/modules/accounts/views/account.tab.html",
      "type": "common",
      "active": true
    },
    {
      "heading": "PASSWORD",
      "template": "app/site/modules/accounts/views/password.tab.html",
      "type": "common",
    },
    {
      "heading": "TASK DETAILS",
      "template": "app/site/modules/accounts/views/task-details.tab.html",
      "type": "user",
      "active": true
    },
    {
      "heading": "INVITE FRIENDS",
      "template": "app/site/modules/accounts/views/invitefriend.tab.html",
      "type": "user"
    },
    {
      "heading": "WALLET",
      "template": "app/site/modules/accounts/views/wallet.tab.html",
      "type": "user",
      "function": new wallet()
    },
    {
      "heading": "TRANSACTION",
      "template": "app/site/modules/accounts/views/user-transaction.tab.html",
      "type": "user"
    },

    //tasker
    {
      "heading": "ACCOUNT_INFO",
      "template": "app/site/modules/accounts/views/accountinfo.tab.html",
      "type": "tasker",
    },
    {
      "heading": "CATEGORY",
      "template": "app/site/modules/accounts/views/category.tab.html",
      "type": "common"
    },
    {
      "heading": "AVAILABILITY",
      "template": "app/site/modules/accounts/views/availability.tab.html",
      "type": "common",
      "function": new Availability()

    },
    {
      "heading": "PROFILE DETAILS",
      "template": "app/site/modules/accounts/views/profileinfo.tab.html",
      "type": "tasker"
    },
    {
      "heading": "JOB DETAILS",
      "type": "tasker",
      "template": "app/site/modules/accounts/views/task-invitation.tab.html"
    },
    {
      "heading": "TRANSACTION",
      "type": "tasker",
      "template": "app/site/modules/accounts/views/transaction.tab.html"
    }, {
      "heading": "REVIEWS",
      "template": "app/site/modules/accounts/views/reviews.tab.html",
      "type": "common"
    }, {
      "heading": "DEACTIVATE",
      "template": "app/site/modules/accounts/views/deactivate.tab.html",
      "type": "common"
    }
  ];

  acc.SettingsTab = acc.accountMenu.filter(function (menu) {
    if (acc.user) {
      if (acc.user.role === 'user') {
        if (acc.user.type === 'facebook') {
          if ((menu.type === 'common') || (menu.type === 'user')) {
            if (menu.heading !== 'PASSWORD') {
              if (account_status === undefined) {
                if (menu.heading === 'TASK DETAILS') {
                  menu.active = false;
                }
                if (menu.heading === 'ACCOUNT') {
                  menu.active = true;
                }
              } else {
                if (menu.heading === 'ACCOUNT') {
                  menu.active = true;
                }
              }
              return menu
            }
          }
        } else {
          if ((menu.type === 'common') || (menu.type === 'user')) {
            if (account_status === undefined) {
              if (menu.heading === 'TASK DETAILS') {
                menu.active = false;
              }
              if (menu.heading === 'ACCOUNT') {
                menu.active = true;
              }
            } else {
              if (menu.heading === 'ACCOUNT') {
                menu.active = true;
              }
            }
            return menu
          }
        }
      }
      else {
        if ((menu.type === 'common') || (menu.type === 'tasker')) {
          if (account_status === undefined) {
            if (menu.heading === 'JOB DETAILS') {
              menu.active = false;
            }
            if (menu.heading === 'ACCOUNT') {
              menu.active = true;
            }
          } else {
            if (menu.heading === 'JOB DETAILS') {
              menu.active = true;
            }
          }
          return menu
        }
      }
    }

  });

  acc.go = function go(route) {
    $state.go(route);
  };

  acc.accountMode = true;
  acc.saveAccount = function saveAccount(isValid) {
    if ($scope.imageChangeValue === true) {
      if (isValid) {
        acc.user.avatarBase64 = acc.myCroppedImage;
        accountService.saveAccount(acc.user).then(function (response) {
          $translate('SAVED SUCCESSFULLY').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error); });
          $scope.imageChangeValue = false;
          acc.accountMode = false;
          $location.hash('editaccountdiv');
          $anchorScroll();
          $location.url($location.path());
          var user = AuthenticationService.GetCredentials();
          if (user.currentUser.username) {
            if (user.currentUser.user_type === 'user') {
              MainService.getCurrentUsers(user.currentUser.username).then(function (response) {
                acc.user = response[0];
                $scope.visibleValue = false;
              }, function (err) {

              });
            }
          }
        }, function (err) {
          if (err.msg) {
            toastr.error(err.msg);
          } else {
            $translate('UNABLE TO SAVE YOUR DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
          }
        });
      } else {
        $translate('UNABLE TO SAVE YOUR DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
      }
    } else {
      if (acc.temp_address) {
        acc.user.avatarBase64 = acc.myCroppedImage;
        accountService.saveAccount(acc.user).then(function (response) {
          $translate('SAVED SUCCESSFULLY').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error); });
          acc.accountMode = false;
          $scope.imageChangeValue = false;
          $location.hash('editaccountdiv');
          $anchorScroll();
          $location.url($location.path());
          var user = AuthenticationService.GetCredentials();
          if (user.currentUser.username) {
            if (user.currentUser.user_type == 'user') {
              MainService.getCurrentUsers(user.currentUser.username).then(function (response) {
                acc.user = response[0];
                $scope.visibleValue = false;

              }, function (err) {

              });
            }
          }
        }, function (err) {
          if (err.msg) {
            toastr.error(err.msg);
          } else {
            $translate('UNABLE TO SAVE YOUR DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
          }
        });
      } else {
        $translate('PLEASE FILL ALL MANDATORY FIELDS').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
      }
    }
  };

  acc.placeChanged = function () {
    acc.user.address.line1 = "";
    acc.user.address.line2 = "";
    acc.user.address.city = "";
    acc.user.address.state = "";
    acc.user.address.country = "";
    acc.user.address.zipcode = "";

    acc.place = this.getPlace();
    var UserDetails = {};
    UserDetails.location = {};
    UserDetails.location.lng = acc.place.geometry.location.lng();
    UserDetails.location.lat = acc.place.geometry.location.lat();
    acc.user.lat = UserDetails.location.lat;
    acc.user.lng = UserDetails.location.lng;

    var locationa = acc.place;
    acc.user.address.line1 = acc.place.formatted_address;

    if (locationa.name) {
      acc.user.address.line1 = locationa.name;
    }

    for (var i = 0; i < locationa.address_components.length; i++) {
      for (var j = 0; j < locationa.address_components[i].types.length; j++) {
        if (locationa.address_components[i].types[j] == 'neighborhood') {
          if (acc.user.address.line1 != locationa.address_components[i].long_name) {
            if (acc.user.address.line1 != '') {
              acc.user.address.line1 = acc.user.address.line1 + ',' + locationa.address_components[i].long_name;
            } else {
              acc.user.address.line1 = locationa.address_components[i].long_name;
            }
          }
        }
        if (locationa.address_components[i].types[j] == 'route') {
          if (acc.user.address.line1 != locationa.address_components[i].long_name) {
            if (acc.user.address.line2 != '') {
              acc.user.address.line2 = acc.user.address.line2 + ',' + locationa.address_components[i].long_name;
            } else {
              acc.user.address.line2 = locationa.address_components[i].long_name;
            }
          }

        }
        if (locationa.address_components[i].types[j] == 'street_number') {
          if (acc.user.address.line2 != '') {
            acc.user.address.line2 = acc.user.address.line2 + ',' + locationa.address_components[i].long_name;
          } else {
            acc.user.address.line2 = locationa.address_components[i].long_name;
          }

        }
        if (locationa.address_components[i].types[j] == 'sublocality_level_1') {
          if (acc.user.address.line2 != '') {
            acc.user.address.line2 = acc.user.address.line2 + ',' + locationa.address_components[i].long_name;
          } else {
            acc.user.address.line2 = locationa.address_components[i].long_name;
          }

        }
        if (locationa.address_components[i].types[j] == 'locality') {

          acc.user.address.city = locationa.address_components[i].long_name;
        }
        if (locationa.address_components[i].types[j] == 'country') {

          acc.user.address.country = locationa.address_components[i].long_name;
        }
        if (locationa.address_components[i].types[j] == 'postal_code') {

          acc.user.address.zipcode = locationa.address_components[i].long_name;
        }
        if (locationa.address_components[i].types[j] == 'administrative_area_level_1' || locationa.address_components[i].types[j] == 'administrative_area_level_2') {
          acc.user.address.state = locationa.address_components[i].long_name;
        }
      }
    }
  };

  // Password Tab
  acc.password = {};
  acc.password.userId = acc.user._id;

  acc.savePassword = function savePassword(isvalid, data) {
    if (isvalid) {
      if (data.newpassword == data.new_confirmed) {
        accountService.savePassword(data).then(function (response) {
          $translate('SAVED SUCCESSFULLY').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error); });
          $state.go('account');
        }, function (err) {
          if (err.message) {
            toastr.error(err.message);
          } else {
            $translate('PLEASE TYPE A DIFFERENT PASSWORD').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
          }
        });
      } else {
        $translate('CONFIRM PASSWORD IS NOT MATCH').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });

      }
    } else {
      $translate('FORM IS INVALID').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
    }
  };

  acc.banking = {};
  acc.banking = acc.user.banking;
  acc.saveaccountinfo = function saveaccountinfo(isvalid, data) {
    acc.banking.userId = acc.user._id;
    if (isvalid) {
      accountService.saveaccountinfo(data).then(function (response) {
        $translate('SAVED SUCCESSFULLY').then(function (headline) {
          toastr.success(headline);
        }, function (translationId) {
          toastr.success(headline);
        });
        $state.go('account');
      }, function (err) {
        if (err.message) {
          //toastr.error(err.message);
        } else {
          //$translate('PLEASE TYPE A DIFFERENT PASSWORD').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        }
      });
    } else {
      $translate('please fill all mandatory fileds').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
    }
  };


  acc.FacebookInviteFriends = function FacebookInviteFriends() {
    accountService.getsettings().then(function (response) {
      acc.getsettingdata = response;
      accountService.getseosetting().then(function (seoresponse) {
        acc.getseosetting = seoresponse;
        var invite = {};
        invite.name = "Signup with my code - " + acc.getsettingdata.settings.site_title;
        invite.link = acc.getsettingdata.settings.site_url;
        invite.description = "Signup with my code " + acc.user.unique_code + " to earn " + $scope.DefaultCurrency[0].symbol + acc.getsettings.settings.referral.amount.referral + " on your " + acc.getsettingdata.settings.site_title + " wallet";
        invite.picture = acc.getsettingdata.settings.site_url + "uploads/default/facebook-share.jpg";
        if (acc.getsettingdata) {
          FB.ui({ method: 'send', name: invite.name, link: invite.link, description: invite.description, picture: invite.picture });
        }
      })
    })
  };

  acc.addReview = function addReview(taskdetails) {
    accountService.gettaskreview(taskdetails._id).then(function (response) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/site/modules/accounts/views/userreview.modal.tab.html',
        controller: 'addReviewModal',
        controllerAs: 'ARM',
        resolve: {
          TaskDetails: function () {
            return taskdetails;
          }
        }
      });

      modalInstance.result.then(function (data) {
        accountService.addUserReview(data).then(function (respo) {
          acc.reviewdata = respo;
          acc.GetTaskList("completed");
        });
      });

    });
  }


  $scope.$watchCollection('DefaultCurrency', function (newNames, oldNames) {
    if (acc.getsettings.settings) {
      acc.walletMinAmt = (acc.getsettings.settings.wallet.amount.minimum * newNames[0].value).toFixed(2);
      acc.walletMaxAmt = (acc.getsettings.settings.wallet.amount.maximum * newNames[0].value).toFixed(2);
      acc.walletMidAmt = ((acc.getsettings.settings.wallet.amount.maximum / 2) * newNames[0].value).toFixed(2);
    }
  });

  acc.changeWalletAmt = function changeWalletAmt(value) {
    acc.walletMinAmt = (acc.getsettings.settings.wallet.amount.minimum * $scope.DefaultCurrency[0].value).toFixed(2);
    acc.walletMaxAmt = (acc.getsettings.settings.wallet.amount.maximum * $scope.DefaultCurrency[0].value).toFixed(2);
    acc.walletMidAmt = ((acc.getsettings.settings.wallet.amount.maximum / 2) * $scope.DefaultCurrency[0].value).toFixed(2);
  }

  acc.changeWallet = function changeWallet(value) {
    console.log("changeWallet");
    acc.walletAamount = (parseFloat(value)).toFixed(2);
  }

  acc.savewallet = function savewallet(data, savewallet) {

    acc.walletMinAmt = (acc.getsettings.settings.wallet.amount.minimum * $scope.DefaultCurrency[0].value).toFixed(2);
    acc.walletMaxAmt = (acc.getsettings.settings.wallet.amount.maximum * $scope.DefaultCurrency[0].value).toFixed(2);
    acc.walletMidAmt = ((acc.getsettings.settings.wallet.amount.maximum / 2) * $scope.DefaultCurrency[0].value).toFixed(2);

    var detaileddata = {};
    detaileddata.data = data.amount;
    detaileddata.currencyvalue = savewallet;

    if (detaileddata.data) {
      if (!((parseFloat(data.amount) >= acc.walletMinAmt) && (parseFloat(data.amount) <= acc.walletMaxAmt))) {
        $translate('PLEASE ENTER THE AMOUNT TO ADD TO THE WALLET').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
      } else {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'app/site/modules/accounts/views/wallet.modal.tab.html',
          controller: 'WalletRechargeModal',
          controllerAs: 'WRM',
          resolve: {
            Rechargeamount: function () {
              return detaileddata;
            }
          }
        });

        modalInstance.result.then(function (data) {
          user = acc.user._id;
          accountService.updatewalletdata(data, user).then(function (response) {
            if (response.statusCode == 402) {
              toastr.error(response.message);
            } else {
              $translate('WALLET MONEY HAS BEEN UPDATED SUCCESSFULLY').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error); });
              acc.getwalletdetails = response.wallet;
              wallet.amount = "";
            }
          }, function (err) {
          });
        }, function () { });
      }
    } else {
      $translate('PLEASE ENTER THE AMOUNT TO ADD TO THE WALLET').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
    }
  };


  acc.savewalletpaypal = function savewalletpaypal(data, savewallet) {

    acc.walletMinAmt = (acc.getsettings.settings.wallet.amount.minimum * $scope.DefaultCurrency[0].value).toFixed(2);
    acc.walletMaxAmt = (acc.getsettings.settings.wallet.amount.maximum * $scope.DefaultCurrency[0].value).toFixed(2);
    acc.walletMidAmt = ((acc.getsettings.settings.wallet.amount.maximum / 2) * $scope.DefaultCurrency[0].value).toFixed(2);
    var detaileddata = {};
    detaileddata.data = data.amount;
    detaileddata.currencyvalue = savewallet;

    if (detaileddata.data) {
      if (!((parseFloat(data.amount) >= acc.walletMinAmt) && (parseFloat(data.amount) <= acc.walletMaxAmt))) {
        $translate('PLEASE ENTER THE AMOUNT TO ADD TO THE WALLET').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
      } else {
        user = acc.user._id;
        accountService.updatewalletdatapaypal(data, user).then(function (response) {
          if (response.status == 1 && response.payment_mode == 'paypal') {
            $window.location.href = response.redirectUrl;
          } else {
            $translate('UNABLE PROCESS YOUR PAYMENT').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
          }
        }, function (err) {
        });
      }
    } else {
      $translate('PLEASE ENTER THE AMOUNT TO ADD TO THE WALLET').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
    }
  };

  //Category
  accountService.getPaymentdetails().then(function (respo) {
    acc.paymentgateway = respo;
  });
  accountService.getCategories().then(function (respo) {
    acc.categories = respo;
  });

  accountService.getCategoriesofuser(acc.user._id, acc.user.role).then(function (respo) {
    acc.usercategories = respo;
    acc.updatecat = function () {
      console.log(">>>>updatecat");

      accountService.getCategoriesofuser(acc.user._id, acc.user.role).then(function (respo) {
        acc.usercategories = respo;
      });
    };
    accountService.getExperience().then(function (respo) {
      acc.experiences = respo;
    });
    accountService.getExperienceYearList().then(function (respo) {
      acc.experience_years = respo;
    });
    accountService.getTravelArrangement().then(function (respo) {
      acc.travel_arrangements = respo;
    });
    accountService.getBrandList().then(function (respo) {
      acc.brands = respo;
    });
  });

  // Payment
  acc.payment = function payment(isValid, formdata) {
    if (isValid) {
      accountService.confirmtask(acc.taskPayment).then(function (err, response) {
        $translate('SAVED SUCCESSFULLY').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error); });
      }, function (err) {
        if (err.msg) {
          toastr.error(err.msg);
        } else {
          $translate('UNABLE TO SAVE YOUR DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        }
      });
    } else {
      $translate('PLEASE ENTER THE VALID DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
    }
  };

  acc.imageModal = function (category) {
    console.log('image modal', category);
    if (category.demand_images && category.demand_images.length > 0) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/site/modules/accounts/views/show_images.modal.tab.html',
        controller: 'CategoryDemandImageModalInstanceCtrl',
        controllerAs: 'CDIM',
        resolve: {
          images: function () {
            return category.demand_images;
          }
        }
      });

      modalInstance.result.then(function (imageData) {}, function () {});
    } else {
      toastr.error('There is no images');
    }
  };

  acc.categoryModal = function (category) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/accounts/views/category.modal.tab.html',
      controller: 'CategoriesModalInstanceCtrl',
      controllerAs: 'ACM',
      resolve: {
        experiences: function () {
          return acc.experiences;
        },
        experience_years: function () {
          return acc.experience_years;
        },
        travel_arrangements: function () {
          return acc.travel_arrangements;
        },
        brands: function () {
          return acc.brands;
        },
        defaultcurrency: function () {
          return $scope.DefaultCurrency;
        },
        user: function (accountService) {
          return accountService.edit(acc.user._id, acc.user.role ? acc.user.role : "user");
        },
        categories: function () {
          return acc.categories;
        },
        category: function () {
          return category;
        }
      }
    });

    modalInstance.result.then(function (selectedCategoryData, isValid) {
      selectedCategoryData.hour_rate = selectedCategoryData.hour_rate / $scope.DefaultCurrency[0].value;
      selectedCategoryData.type = acc.user.role;

      accountService.updateCategory(selectedCategoryData).then(function (response) {
        $translate('UPDATED SUCCESSFULLY').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error); });
        acc.updatecat();
      }, function (err) {
        if (err.msg) {
          toastr.error(err.msg);
        } else {
          $translate('PLEASE ENTER THE VALID DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        }
      });
    });
  }

  acc.deletecategory = function (category, catname) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/accounts/views/deletecategory.modal.tab.html',
      controller: 'DeleteCategoriesModalInstanceCtrl',
      controllerAs: 'DACM',
      resolve: {
        user: function () {
          return acc.user;
        },
        category: function () {
          return category;
        },
        categoryname: function () {
          return catname;
        }
      }
    });

    modalInstance.result.then(function (deletecategorydata) {
      deletecategorydata.type = acc.user.role;

      accountService.deleteCategory(deletecategorydata).then(function (response) {
        $translate('CATEGORY DELETED SUCCESSFULLY').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error); });
        acc.updatecat();
      }, function () {
      });
    }, function () {
    });
  };

  accountService.getQuestion().then(function (respo) {
    acc.getQuestion = respo;
  });

  if (acc.user.profile_details) {
    if (acc.user.profile_details.length > 0) {
      acc.profileDetails = acc.user.profile_details.reduce(function (total, current) {
        total[current.question] = current.answer;
        return total;
      }, {});
    } else {
      acc.profileDetails = [];
      acc.user.profile_details = [];
    }
  }
  acc.saveProfile = function saveProfile() {
    var i = 0;
    for (var key in acc.profileDetails) {
      if (acc.user.profile_details.filter(function (obj) { return obj.question === key; })[0]) {
        acc.user.profile_details[i].answer = acc.profileDetails[key];
      } else {
        acc.user.profile_details.push({ 'question': key, 'answer': acc.profileDetails[key] });
      }
      i++;
    }
    accountService.saveProfile(acc.user).then(function (response) {
      $translate('UPDATED SUCCESSFULLY').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error); });
    }, function (err) {
      if (err.msg) {
        $scope.addAlert(err.msg);
      } else {
        $translate('UNABLE TO SAVE YOUR DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
      }
    });
  }

  acc.taskitemsPerPage = 2;
  acc.tasktotalItem = 0;
  acc.taskInvitation = [];
  acc.getwalletdetails = {};
  acc.getsettings = {};
  acc.taskInvitationDetails = [];
  acc.tasker = [];
  acc.getTaskDetailsByStausResponse = false;

  acc.getTaskDetailsByStaus = function getTaskDetailsByStaus(status, page) {
    acc.taskInvitation = [];
    acc.getTaskDetailsByStausResponse = false;
    acc.tasktotalItem = 0;

    if (status == '6' || status == '7') {
      status = 'completed';
    }
    else if (status == '8') {
      status = 'cancelled';
    }
    else if (status == '2' || status == '3' || status == '4' || status == '5') {
      status = 'ongoing';
    }
    else if (status == '1') {
      status = 'assigned';
    }

    if (page == undefined) {
      acc.CurrentPage = 1;
    } else {
      acc.CurrentPage = page;
    }

    acc.currentStatus = status;
    accountService.getTaskDetailsByStaus(acc.user._id, acc.currentStatus, page, acc.taskitemsPerPage).then(function (response) {
      if (response.length > 0) {
        acc.taskInvitationDetails = response;
        acc.taskInvitation = response[0].TaskDetails;
        acc.tasktotalItem = response[0].count;
      }
      acc.getTaskDetailsByStausResponse = true;
    });
  }


  acc.getUserTaskDetailsByStaus = function getUserTaskDetailsByStaus(status, page) {
    acc.taskInvitation = [];
    acc.getUserTaskDetailsByStaus = false;
    acc.tasktotalItem = 0;
    if (status == '6' || status == '7') {
      status = 'completed';
    }
    else if (status == '8') {
      status = 'cancelled';
    }
    else if (status == '2' || status == '3' || status == '4' || status == '5') {
      status = 'ongoing';
    }
    else if (status == '1') {
      status = 'assigned';
    }
    acc.currentStatus = status;
    accountService.getUserTaskDetailsByStaus(acc.user._id, acc.currentStatus, page, acc.taskitemsPerPage).then(function (response) {
      if (response.length > 0) {
        acc.taskInvitationDetails = response;
        acc.taskInvitation = response[0].TaskDetails;
        acc.tasktotalItem = response[0].count;
      }
      acc.getTaskDetailsByStausResponse = true;
    });
  }



  acc.getWalleDetailsTemp = function getWalleDetailsTemp(status) {
    console.log(":......");
    acc.index = status;
    if (status == 0) {
      accountService.getwalletdetails(acc.user._id).then(function (response) {
        if (response) {
          acc.getwalletdetails = response;
        } else {
          acc.getwalletdetails.total = 0;
        }
      });
    } else {
      accountService.getUserWalletTransaction(acc.user._id, acc.walletListCurrentPage, acc.walletListitemsPerPage).then(function (response) {
        if (response) {
          acc.currentPage = 1;
          acc.numPerPage = 10;
          acc.totalitems = response.transaction.length;
          acc.totalitem = response.transaction;
          CategoryList(0, 10);
          function CategoryList(from, perPage) {
            acc.SubCategoryList = [];
            for (var i = from; i < perPage; i++) {
              if (i === acc.totalitem.length) return false;
              console.log('acc.totalitem', acc.totalitem)
              if (acc.totalitem[i].type != "") {
                acc.SubCategoryList.push(acc.totalitem[i]);
              }
            }
          }
          acc.getUserWalletTransaction = function (value) {
            if (acc.currentPage) {
              var spliceFrom = (acc.currentPage - 1) * acc.numPerPage;
              var offset = spliceFrom + acc.numPerPage;
              CategoryList(spliceFrom, offset);
            }
          }
        }
      });
    }
  }

  function wallet() {
    accountService.getwalletdetails(acc.user._id).then(function (response) {
      if (response) {
        acc.getwalletdetails = response;
      } else {
        acc.getwalletdetails.total = 0;
      }
    });
  }

  acc.getTasker = function getTasker() {
    acc.tasker = [];
    accountService.getTasker(acc.user._id).then(function (response) {
      if (response.length > 0) {
        acc.tasker = response[0].TaskDetails;
      }
    });
  }

  acc.taskertransitemsPerPage = 5;
  acc.taskertranstotalItem = 0;
  acc.taskertransCurrentPage = 1;
  acc.getTransactionHis = function getTransactionHis(page) {
    accountService.getTransactionHis(acc.user._id, page, acc.taskertransitemsPerPage).then(function (response) {
      if (response) {
        acc.transcationhis = response.result;
        acc.taskertranstotalItem = response.count;
      }
    });
  }
  acc.transitemsPerPage = 5;
  acc.transtotalItem = 0;
  acc.transCurrentPage = 1;
  acc.getUserTransaction = function getUserTransaction(page) {
    accountService.getUserTransaction(acc.user._id, page, acc.transitemsPerPage).then(function (response) {
      if (response) {
        acc.usertranscation = response.result;
        acc.transtotalItem = response.count;
      }
    });
  }

  accountService.getcancelreason(acc.user.role).then(function (response) {
    if (response.length > 0) {
      acc.getcancelreason = response;
    }
  });

  acc.updatetaskstatus = function updatetaskstatus(taskid, status, currentpage) {
    var data = {};
    data.taskid = taskid;
    data.status = status;
    accountService.updatetaskstatus(data).then(function (response) {
      if (response.error) {
        $translate(response.error).then(function (headline) { toastr.error(headline); }, function (error) { console.error(error); });
      } else {
        if (response.status == 3 || response.status == 3.1 || response.status == 3.2) {
          $translate('YOU START-OFF THE TASK').then(function (headline) { toastr.info(headline); }, function (error) { console.error(error); });
        } else if (response.status == 4) {
          $translate('YOU ARRIVED TO THE TASK LOCATION').then(function (headline) { toastr.info(headline); }, function (error) { console.error(error); });
        } else if (response.status == 6) {
          $translate('YOUR REQUEST FOR CASH').then(function (headline) { toastr.info(headline); }, function (error) { console.error(error); });
        } else {
          $translate('YOU STARTED TASK').then(function (headline) { toastr.info(headline); }, function (error) { console.error(error); });
        }
      }

      if (!currentpage ) {
        acc.taskCurrentPage = 1;
        acc.GetTaskList('ongoing');
      } else {
        acc.getTaskDetailsByStaus("ongoing", currentpage);
        if (response.status == 6) {
          acc.getTaskDetailsByStaus("completed");
        }
        acc.currentPage = currentpage;
      }
    });
  }

  acc.updatetaskstatuscash = function updatetaskstatus(taskid, status) {
    var data = {};
    data.taskid = taskid;
    data.status = status;
    accountService.updatetaskstatuscash(data).then(function (response) {
      if (response.error) {
        $translate(response.error).then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
      } else {
        $translate('PAYMENT_COMPLETED').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error); });
      }
      acc.getTaskDetailsByStaus("completed");
    });
  }

  acc.TaskTranscationViewModal = function (index, catid) {
    var tasktranscationhis = acc.transcationhis[index];
    var transcation = {};
    transcation.date = tasktranscationhis.updatedAt;

    console.log("transactiondate", transcation.date)

    transcation.invoice = tasktranscationhis.invoice;
    transcation.bookingid = tasktranscationhis._id;
    if (tasktranscationhis.transactions) {
      transcation.transcationid = tasktranscationhis.transactions[0];
    }
    transcation.categoryname = tasktranscationhis.category.name;
    var skills = tasktranscationhis.tasker.skills;
    angular.forEach(skills, function (key, value) {
      if (key.childid == tasktranscationhis.category._id) {
        transcation.perHour = key.hour_rate;
      }
    });
    transcation.worked_hours = tasktranscationhis.invoice.worked_hours;
    transcation.username = tasktranscationhis.user.username;
    transcation.addresss = tasktranscationhis.billing_address.city;
    transcation.tasker_earn = tasktranscationhis.invoice.amount.admin_commission;
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/accounts/views/model/transaction.modal.html',
      controller: 'TaskTranscationViewModal',
      controllerAs: 'TTEMS',
      size: 'lg',
      resolve: {
        TaskDetails: function () {
          return transcation;
        },
        task: function () {
          return acc.transcationhis[index];
        },
        defaultcurrency: function () {
          return $scope.DefaultCurrency;
        },
        getsettings: function () {
          return acc.getsettings;
        },
        getmaincatname: function () {
          return accountService.getmaincatname(catid);
        }
      }
    });

    modalInstance.result.then(function (data) {
    }, function () {
    });
  }


  acc.TaskUserTranscationViewModal = function (index, catid) {
    var tasktranscationhis = acc.usertranscation[index];
    var transcation = {};
    transcation.date = tasktranscationhis.updatedAt;
    transcation.invoice = tasktranscationhis.invoice;
    transcation.bookingid = tasktranscationhis._id;
    if (tasktranscationhis.transactions) {
      transcation.transcationid = tasktranscationhis.transactions[0];
    }
    transcation.categoryname = tasktranscationhis.category.name;
    var skills = tasktranscationhis.tasker.skills;
    angular.forEach(skills, function (key, value) {
      if (key.childid == tasktranscationhis.category._id) {
        transcation.perHour = key.hour_rate;
      }
    });
    transcation.worked_hours = tasktranscationhis.invoice.worked_hours;
    transcation.username = tasktranscationhis.user.username;
    transcation.addresss = tasktranscationhis.billing_address.city;
    transcation.tasker_earn = tasktranscationhis.invoice.amount.admin_commission;
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/accounts/views/model/usertransaction.modal.html',
      controller: 'TaskUserTranscationViewModal',
      controllerAs: 'TTEMS',
      size: 'lg',
      resolve: {
        TaskDetails: function () {
          return transcation;
        },
        task: function () {
          return acc.usertranscation[index];
        },
        defaultcurrency: function () {
          return $scope.DefaultCurrency;
        },
        getsettings: function () {
          return acc.getsettings;
        },
        getmaincatname: function () {
          return accountService.getmaincatname(catid);
        }
      }
    });

    modalInstance.result.then(function (data) {
    }, function () {
    });
  }

  acc.getmaincatname = function (catid) {
    accountService.getmaincatname(catid).then(function (response) {
      acc.maincategoryname = response.name;
    });
  };

  acc.taskerareaChanged = function () {
    acc.place = this.getPlace();
    acc.user.location = {};
    acc.user.location.lng = acc.place.geometry.location.lng();
    acc.user.location.lat = acc.place.geometry.location.lat();
    acc.user.availability_address = acc.place.formatted_address;
    var locationa = acc.place;

    var dummy = locationa.address_components.filter(function (value) {
      return value.types[0] == "locality";
    }).map(function (data) {
      return data;
    });
    acc.dummyAddress = dummy.length;
  };

  acc.taskerconfirmpay = function (taskid, status) {

    var data = {};
    data.taskid = taskid;
    data.status = status;
    accountService.updateTaskcompletion(data).then(function (response) {
      if (response.status == 6) {
        $translate('TASK_COMPLETED').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error); });
      }
      else {
        $translate('UNABLE TO SAVE YOUR DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
      }
      acc.getTaskDetailsByStaus("ongoing");
    });

  }

  acc.savewalletpaypal = function savewalletpaypal(data, savewallet) {

    acc.walletMinAmt = (acc.getsettings.settings.wallet.amount.minimum * $scope.DefaultCurrency[0].value).toFixed(2);
    acc.walletMaxAmt = (acc.getsettings.settings.wallet.amount.maximum * $scope.DefaultCurrency[0].value).toFixed(2);
    acc.walletMidAmt = ((acc.getsettings.settings.wallet.amount.maximum / 2) * $scope.DefaultCurrency[0].value).toFixed(2);
    var detaileddata = {};
    detaileddata.data = data.amount;
    detaileddata.currencyvalue = savewallet;

    if (detaileddata.data) {
      if (!((parseFloat(data.amount) >= acc.walletMinAmt) && (parseFloat(data.amount) <= acc.walletMaxAmt))) {
        $translate('PLEASE ENTER THE AMOUNT TO ADD TO THE WALLET').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
      } else {
        user = acc.user._id;
        accountService.updatewalletdatapaypal(data, user).then(function (response) {
          if (response.status == 1 && response.payment_mode == 'paypal') {
            $window.location.href = response.redirectUrl;
          } else {
            $translate('UNABLE PROCESS YOUR PAYMENT').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
          }
        }, function (err) {
        });
      }
    } else {
      $translate('PLEASE ENTER THE AMOUNT TO ADD TO THE WALLET').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
    }
  };

  acc.updateModalTask = function (index, status) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/accounts/views/task-dispute.modal.html',
      controller: 'DisputeReviewModalInstanceCtrl',
      controllerAs: 'DNM',
      resolve: {
        TaskDetails: function () {
          return acc.taskList[index];
        },
        status: function () {
          return status;
        }
      }
    });

    modalInstance.result.then(function (data) {
      if (acc.taskInvitation.length > 0 && angular.isDefined(acc.taskInvitation[index]._id)) {
        accountService.updateTask(acc.taskInvitation[index]._id, status).then(function (response) {
          acc.taskInvitation.splice(index, 1);
        }, function (err) {
        });
      }
    }, function () {
    });

  }

  acc.TaskReviewModalSave = function (index) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/accounts/views/task-review.modal.tab.html',
      controller: 'TaskReviewModalSave',
      controllerAs: 'TREMS',
      resolve: {
        TaskDetails: function () {
          return acc.taskList[index];
        }
      }
    });


    var userdata = acc.taskList[index];

    modalInstance.result.then(function (data) {
      var reviewdata = {};
      reviewdata.rating = data.rating;
      reviewdata.comments = data.comments;
      reviewdata.user = userdata.user;
      reviewdata.tasker = userdata.tasker._id;
      reviewdata.task = userdata._id;
      reviewdata.type = 'tasker';

      accountService.setReview(reviewdata).then(function (response) {
        acc.getreviewdetails;
      });
    });

  };

  acc.TaskReviewModal = function (index) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/accounts/views/task-review.modal.html',
      controller: 'TaskReviewModalCtrl',
      controllerAs: 'TREM',
      resolve: {
        TaskDetails: function () {
          return acc.taskInvitation[index];
        }
      }
    });

    var userdata = acc.taskInvitation[index];
    modalInstance.result.then(function (data) {

      var reviewdata = {};
      reviewdata.rating = data.rating;
      reviewdata.comments = data.comments;
      reviewdata.user = userdata.user._id;
      reviewdata.tasker = userdata.tasker;
      reviewdata.task = userdata._id;
      reviewdata.type = "tasker";

      accountService.inserttaskerreview(reviewdata).then(function (response) {
        accountService.getReview(acc.user._id, acc.reviewListCurrentPage, acc.reviewListitemsPerPage).then(function (respo) {
        });
        //acc.getTaskDetailsByStaus("completed");
        acc.taskInvitation[index].taskrating = [];
        acc.taskInvitation[index].taskrating.push(reviewdata);
      }, function (err) {
      });

    }, function () {
    });
  };

  acc.TaskInviteViewModal = function (index) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/accounts/views/taskinvite.view.modal.tab.html',
      controller: 'TaskInviteViewModalInstanceCtrl',
      controllerAs: 'TVMI',
      resolve: {
        TaskInvite: function () {
          return acc.taskInvitation[index];
        },
        DefaultCurrency: function () {
          return $scope.DefaultCurrency;
        },
        getsettings: function () {
          return acc.getsettings;
        }
      }
    });
    modalInstance.result.then(function (data) {
    }, function () {
    });
  };

  acc.TaskInviteAddCourierModal = function (index) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/accounts/views/taskinvite.add_courier.modal.tab.html',
      controller: 'TaskInviteAddCourierModalInstanceCtrl',
      controllerAs: 'TVMI',
      resolve: {
        TaskDetail: function () {
          return acc.taskInvitation[index];
        },
        DefaultCurrency: function () {
          return $scope.DefaultCurrency;
        },
        getsettings: function () {
          return acc.getsettings;
        }
      }
    });
    modalInstance.result.then(function (data) {
      console.log('data', data);
      const courierData = {
        taskid: data._id,
        courier_type: data.courier_type,
        courier_waybill: data.courier_waybill,
      };
      accountService.updateTaskCourier(courierData)
        .then(function (response) {
          toastr.success('Task updated successfully');
          }, function (err) {
        });
    }, function () {
    });
  };

  acc.TaskDetailsParcelMonitorModal = function (index) {
    if (!acc.taskInvitation[index].courier_waybill) {
      toastr.error('Did not add waybill still.');
      return;
    }
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/accounts/views/taskinvite.track_parcel.modal.tab.html',
      controller: 'TaskInviteTrackParcelModalInstanceCtrl',
      controllerAs: 'TVMI',
      resolve: {
        TaskDetail: function () {
          return acc.taskInvitation[index];
        },
        DefaultCurrency: function () {
          return $scope.DefaultCurrency;
        },
        getsettings: function () {
          return acc.getsettings;
        }
      }
    });
    modalInstance.result.then(function (data) {
    }, function () {
    });
  };


  acc.TaskerextrapriceModal = function (taskid, status) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/accounts/views/taskerextraprice.view.modal.tab.html',
      controller: 'TaskerExtraViewModalInstanceCtrl',
      controllerAs: 'TEVMI',
      resolve: {
        Taskid: function () {
          return taskid;
        },
        status: function () {
          return status;
        },
        DefaultCurrency: function () {
          return $scope.DefaultCurrency;
        }
      }
    });
    modalInstance.result.then(function (data) {
      accountService.updateTaskcompletion(data).then(function (response) {
        if (response.status == 6) {
          $translate('TASK_COMPLETED').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error); });
        }
        else {
          $translate('UNABLE TO SAVE YOUR DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        }
        acc.getTaskDetailsByStaus("ongoing");
        acc.currentPage = 1;
      }, function () {
      });
    }, function () {
    });
  };

//acc.taskListCurrentPage = 1;
  acc.taskListitemsPerPage = 2;
  acc.taskListtotalItem = 0;
  acc.taskList = [];
  acc.taskinfobyid = [];
  acc.getTaskListResponse = false;

  acc.taskinfobyid = function taskinfobyid(taskid) {
    accountService.gettaskinfobyid(taskid).then(function (response) {
      if (response.length > 0) {

      }
    });
  };

  acc.GetTaskList = function GetTaskList(status, page) {
    acc.status = status;
    acc.taskList = [];
    acc.getTaskListResponse = false;
    acc.taskListtotalItem = 0;
    if (page == undefined) {
      acc.taskListCurrentPage = 1;
    } else {
      acc.taskListCurrentPage = page;
    }
    accountService.taskListService(acc.user._id, status, acc.taskListCurrentPage, acc.taskListitemsPerPage).then(function (response) {
      if (response.length > 0) {
        acc.taskList = response[0].TaskDetails;
        acc.taskListtotalItem = response[0].count;
        accountService.getTaskDetails(acc.user._id).then(function (respo) {
          acc.taskList.review = respo;
        });
      }
      acc.getTaskListResponse = true;
    });
  };

  acc.updateTaskDetails = function (index, status) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/accounts/views/task-confirm.modal.html',
      controller: 'TaskReviewModalInstanceCtrl',
      controllerAs: 'TRM',
      resolve: {
        TaskDetails: function () {
          return acc.taskList[index];
        }
      }
    });

    modalInstance.result.then(function (data) {
      user = acc.user._id;
      task = acc.taskList[index]._id;
      type = 'user';
      if (acc.taskList.length > 0 && angular.isDefined(acc.taskList[index]._id)) {

        accountService.updateTask(acc.taskList[index]._id, status)
          .then(function (response) {
              acc.taskList.splice(index, 1);
            }, function (err) {
          });
      }

    }, function () {
    });
  };

  acc.TaskDetailsViewModal = function (index) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/accounts/views/taskdetails.view.modal.tab.html',
      controller: 'TaskDetailsViewModalInstanceCtrl',
      controllerAs: 'TDVMI',
      resolve: {
        TaskDetails: function () {
          return acc.taskList[index];
        },
        DefaultCurrency: function () {
          return $scope.DefaultCurrency;
        }
      }
    });
    modalInstance.result.then(function (data) {
    }, function () {
    });
  };

  acc.TaskDetailsViewModalforstatus = function (index) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/accounts/views/taskdetailsforstatus.modal.tab.html',
      controller: 'TaskDetailsViewforstatusModalInstanceCtrl',
      controllerAs: 'TDVSMI',
      resolve: {
        TaskDetails: function () {
          return acc.taskList[index];
        },
        defaultcurrency: function () {
          return $scope.DefaultCurrency;
        }

      }
    });
    modalInstance.result.then(function (data) {
    }, function () {
    });
  };



  acc.reviewModal = function (data, task) {

    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/accounts/views/reviewdetails.view.modal.tab.html',
      controller: 'reviewModelCtrl',
      controllerAs: 'RMC',
      resolve: {
        data: function () {
          return data;
        },
        role: function () {
          return acc.user.role;
        }
      }
    });
  }

  acc.TaskDetailsViewModal = function (index) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/accounts/views/taskdetails.view.modal.tab.html',
      controller: 'TaskDetailsViewModalInstanceCtrl',
      controllerAs: 'TDVMI',
      resolve: {
        TaskDetails: function () {
          return acc.taskList[index];
        },
        DefaultCurrency: function () {
          return $scope.DefaultCurrency;
        }

      }
    });
    modalInstance.result.then(function (data) {
    }, function () {
    });
  };

  acc.TaskDetailsIgnoreModal = function (id, status) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/accounts/views/task-cancel.modal.tab.html',
      controller: 'TaskDetailsIgnoreModalInstanceCtrl',
      controllerAs: 'TDIMI',
      resolve: {
        userid: function () {
          return id;
        },
        status: function () {
          return status;
        },
        cancelreason: function () {
          return acc.getcancelreason;
        }

      }
    });

    modalInstance.result.then(function (taskignoredata) {
      accountService.usercanceltask(taskignoredata).then(function (response) {
        //acc.GetTaskList("assigned");
        acc.taskCurrentPage = 1;
        acc.GetTaskList('cancelled');
        acc.tabFourActive = true;
      }, function () {
        if (err.msg) {
          toastr.error(err.msg);
        } else {
          $translate('UNABLE TO SAVE YOUR DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        }
      });
    }, function () {
    });

  };

  acc.ignoreTask = function (id, status) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/accounts/views/task-cancel.modal.tab.html',
      controller: 'TaskDetailsIgnoreModalInstanceCtrl',
      controllerAs: 'TDIMI',
      resolve: {
        userid: function () {
          return id;
        },
        status: function () {
          return status;
        },
        cancelreason: function () {
          return acc.getcancelreason;
        }
      }
    });
    modalInstance.result.then(function (taskignoredata) {
      accountService.ignoreTask(taskignoredata).then(function (response) {
        acc.currentPage = 1;
        acc.getTaskDetailsByStaus('cancelled');
        acc.tabFourActive = true;
      }, function () {
        if (err.msg) {
          $scope.addAlert(err.msg);
        } else {
          $translate('UNABLE TO SAVE YOUR DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        }
      });
    }, function () {
    });
  };

  acc.taskerconfirmtask = function (id, taskerid, status) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/accounts/views/tasker-taskconfirm.modal.tab.html',
      controller: 'TaskDetailsconfirmModalInstanceCtrl',
      controllerAs: 'TDCMI',
      resolve: {
        taskid: function () {
          return id;
        },
        taskerid: function () {
          return taskerid;
        },
        status: function () {
          return status;
        }
      }
    });
    modalInstance.result.then(function (taskconfirmdata) {
        accountService.taskerconfirmTask(taskconfirmdata).then(function (response) {
          if (response.error) {
            toastr.error(response.error);
          } else if (response == "You have already booked a job in the chosen time, please choose a different time slot to perform job.") {
            toastr.warning(response);
          }
          acc.getTaskDetailsByStaus("assigned");
        }, function (err) {
          if (err.msg) {
            toastr.error(err.msg);
          } else {
            $translate('UNABLE TO SAVE YOUR DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
          }
        });
      },
      function () {
      });
  };

  // ---------- Availability Tab Start ------------------
  acc.availability = {};
  acc.availability.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


  /*acc.workingDays = [{ day: "Sunday", hour: { "morning": false, "afternoon": false, "evening": false }, not_working: true }, { day: "Monday", hour: { "morning": false, "afternoon": false, "evening": false }, not_working: true }, { day: "Tuesday", hour: { "morning": false, "afternoon": false, "evening": false }, not_working: true }, { day: "Wednesday", hour: { "morning": false, "afternoon": false, "evening": false }, not_working: true }, { day: "Thursday", hour: { "morning": false, "afternoon": false, "evening": false }, not_working: true }, { day: "Friday", hour: { "morning": false, "afternoon": false, "evening": false }, not_working: true }, { day: "Saturday", hour: { "morning": false, "afternoon": false, "evening": false }, not_working: true }];*/


  var workingDays = [{ day: "Sunday", hour: { "morning": false, "afternoon": false, "evening": false }, not_working: true },
    { day: "Monday", hour: { "morning": false, "afternoon": false, "evening": false }, not_working: true },
    { day: "Tuesday", hour: { "morning": false, "afternoon": false, "evening": false }, not_working: true },
    { day: "Wednesday", hour: { "morning": false, "afternoon": false, "evening": false }, not_working: true },
    { day: "Thursday", hour: { "morning": false, "afternoon": false, "evening": false }, not_working: true },
    { day: "Friday", hour: { "morning": false, "afternoon": false, "evening": false }, not_working: true },
    { day: "Saturday", hour: { "morning": false, "afternoon": false, "evening": false }, not_working: true }];

  var workingTimes = {};
  if ($scope.date) {
    if ($scope.date.timezone) {
      workingTimes.morning = {
        from: moment.tz(new Date(99, 5, 24, 8, 0, 0, 0), $scope.date.timezone).format($scope.date.time_format),
        to: moment.tz(new Date(99, 5, 24, 12, 0, 0, 0), $scope.date.timezone).format($scope.date.time_format)
      };
      workingTimes.afternoon = {
        from: moment.tz(new Date(99, 5, 24, 12, 0, 0, 0), $scope.date.timezone).format($scope.date.time_format),
        to: moment.tz(new Date(99, 5, 24, 16, 0, 0, 0), $scope.date.timezone).format($scope.date.time_format)
      };
      workingTimes.evening = {
        from: moment.tz(new Date(99, 5, 24, 16, 0, 0, 0), $scope.date.timezone).format($scope.date.time_format),
        to: moment.tz(new Date(99, 5, 24, 20, 0, 0, 0), $scope.date.timezone).format($scope.date.time_format)
      };
    }
  }

  acc.workingDays = workingDays;
  var DaysData = [{ Morning: "MORNING", afternoon: "AFTERNOON", evening: "EVENING", Save: "SAVE" }];

  angular.forEach(acc.workingDays, function (workingDays, key) {
    angular.forEach(acc.user.working_days, function (UserWorkingdays) {
      if (UserWorkingdays.day == workingDays.day) {
        if (UserWorkingdays.hour.morning == true || UserWorkingdays.hour.afternoon == true || UserWorkingdays.hour.evening == true) {
          UserWorkingdays.not_working = false;
          acc.workingDays[key] = UserWorkingdays;
        }
      }
    })
  });

  acc.availabilityModal = function (size, index) {
    var modalInstance = $uibModal.open({
      animation: true,
      backdrop: 'static',
      keyboard: false,
      templateUrl: 'app/site/modules/accounts/views/availability.modal.tab.html',
      controller: 'AvailabilityModalInstanceCtrl',
      //controllerAs: 'AAM',
      size: size,
      resolve: {
        /*data: function () {
        return { 'day': day, 'days': acc.availability.days };
      },*/
        workingDays: function () {
          return acc.workingDays;
        },
        workingTimes: function () {
          return workingTimes;
        },
        DaysData: function () {
          return DaysData;
        },
        selectedIndex: function () {
          return index;
        }
      }
    });
    modalInstance.result.then(function (data) {
      console.log('Availability Response', data);
      acc.user.working_days[data.index] = data.working_day;
      acc.user.working_days = $filter('filter')(acc.workingDays, { "not_working": false });
    }, function () {
    });
  };

  acc.emptyLatLng = function (temp_address) {
    if (temp_address != acc.taskerareaaddress) {
      acc.user.location.lat = '';
      acc.user.location.lng = '';
    }
  };

  acc.saveAvailability = function () {
    if (acc.user.location.lat == '' || acc.user.location.lng == '') {
      toastr.error('Invalid Address');
      return;
    } else {
      accountService.saveAvailability(acc.user).then(function (response) {
        $translate('UPDATED SUCCESSFULLY').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error); });
      }, function (err) {
        if (err.msg) {
          toastr.error(err.msg);
        } else {
          $translate('UNABLE TO SAVE YOUR DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        }
      });
    }

  }
  // ---------- Availability Tab End ------------------


  acc.availabilityChange = function (value) {
    acc.data = {
      _id: acc.user._id,
      availability: !value ? 0 : 1,
      usertype: acc.user.role
    };

    accountService.updateAvailability(acc.data).then(function (response) {
      $translate('AVAILABILITY UPDATED SUCCESSFULLY').then(function (headline) { toastr.info(headline); }, function (error) { console.error(error); });
    }, function (err) {
      if (err.msg) {
        toastr.error(err.msg);
      } else {
        $translate('UNABLE TO SAVE YOUR DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
      }
    });
  };

  acc.deactivate = function (deactivateAcc) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/accounts/views/deactivate.modal.tab.html',
      controller: 'DeactivateCtrl',
      controllerAs: 'DECM',
      resolve: {
        user: function () {
          return acc.user;
        }
      }
    });

    modalInstance.result.then(function (userid) {
      accountService.deactivateAccount(userid).then(function (response) {
        $translate('YOUR ACCOUNT DEACTIVATED SUCCESSFULLY').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error); });
      }, function () {
        if (err.msg) {
          toastr.error(err.msg);
        } else {
          $translate('UNABLE TO SAVE YOUR DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        }
      });
    });

  };


//review tab
  acc.reviewListCurrentPage = 1;
  acc.reviewListitemsPerPage = 5;
  acc.reviewListtotalItem = 0;
  acc.getreviewdetails = function (status) {
    acc.index = 0;
    accountService.getReview(acc.user._id, acc.reviewListCurrentPage, acc.reviewListitemsPerPage, acc.user.role).then(function (respo) {
      $scope.truefalse = "true";
      acc.reviewListtotalItem = respo.count;
      acc.getReview = respo.result;
      acc.finalResult = [];
      angular.forEach(acc.getReview, function (value, key) {
        if (value.task) {
          acc.finalResult.push(value);
        }
      });

    });
  }

  acc.getuserreviewdetails = function (status) {
    acc.index = 1;
    accountService.getuserReview(acc.user._id, acc.reviewListCurrentPage, acc.reviewListitemsPerPage, acc.user.role).then(function (respo) {
      $scope.truefalse = "true";
      acc.reviewListtotalItem = respo.count;
      acc.getReview = respo.result;
      acc.finalResult = [];
      angular.forEach(acc.getReview, function (value, key) {
        if (value.task) {
          acc.finalResult.push(value);
        }
      });
    });
  }

//tasker table

  acc.accountMode = true;
  if (acc.user.address) {
    if (typeof acc.user.address.line1 != 'undefined') {
      acc.temp_address = acc.user.address.line1;
    } else {
      acc.temp_address = '';
    }
  }

  acc.saveTaskerAccount = function saveTaskerAccount(isValid) {
    if ($scope.imageChangeValue == true) {
      if (isValid) {
        acc.user.avatarBase64 = acc.myCroppedImage;
        if (acc.temp_address != acc.user.address.line1 && typeof acc.place == 'undefined') {
          acc.temp_address = '';
          $translate('INVALID ADDRESS').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
          return
        } else {
          acc.user.address.line1 = acc.temp_address;
          accountService.saveTaskerAccount(acc.user).then(function (response) {
            $translate('UPDATED SUCCESSFULLY').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error); });
            $scope.imageChangeValue = false;
            $location.hash('editaccountdiv');
            $anchorScroll();
            var user = AuthenticationService.GetCredentials();
            if (user.currentUser.username) {
              if (user.currentUser.user_type == 'tasker') {
                return MainService.getCurrentTaskers(user.currentUser.username).then(function (response) {
                  acc.user = response[0];
                  $scope.visibleValue = false;
                  acc.accountMode = false;
                }, function (err) {

                });
              }
            }
          }, function (err) {
            if (err.msg) {
              toastr.error(err.msg);
            } else {
              $translate('UNABLE TO SAVE YOUR DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
            }
          });
        }
      } else {
        $translate('PLEASE ENTER THE VALID DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
      }
    } else {
      if (acc.temp_address) {
        acc.user.avatarBase64 = acc.myCroppedImage;
        if (acc.temp_address != acc.user.address.line1 && typeof acc.place == 'undefined') {
          acc.temp_address = '';
          $translate('INVALID ADDRESS').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
          return
        } else {
          acc.user.address.line1 = acc.temp_address;
          accountService.saveTaskerAccount(acc.user).then(function (response) {
            $translate('UPDATED SUCCESSFULLY').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error); });
            $scope.imageChangeValue = false;
            $location.hash('editaccountdiv');
            $anchorScroll();
            var user = AuthenticationService.GetCredentials();
            if (user.currentUser.username) {
              if (user.currentUser.user_type == 'tasker') {
                return MainService.getCurrentTaskers(user.currentUser.username).then(function (response) {
                  acc.user = response[0];
                  $scope.visibleValue = false;
                  acc.accountMode = false;
                }, function (err) {

                });
              }
            }
          }, function (err) {
            if (err.msg) {
              toastr.error(err.msg);
            } else {
              $translate('UNABLE TO SAVE YOUR DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
            }
          });
        }
      } else {
        $translate('PLEASE FILL ALL MANDATORY FIELDS').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
      }

    }
  };

  acc.password = {};
  acc.password.userId = acc.user._id;
  acc.saveTaskerPassword = function saveTaskerPassword(isvalid) {
    if (isvalid) {
      accountService.saveTaskerPassword(acc.password).then(function (response) {
        $translate('UPDATED SUCCESSFULLY').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error); });
        $state.go('account');
      }, function (err) {
        if (err.msg) {
          toastr.error(err.msg);
        } else {
          $translate('PLEASE TYPE A DIFFERENT PASSWORD').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        }
      });
    } else {
      $translate('FORM IS INVALID').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
    }

  };
  acc.deactivateTasker = function (deactivateTaskerAcc) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/accounts/views/deactivate.modal.tab.html',
      controller: 'DeactivateCtrl',
      controllerAs: 'DECM',
      resolve: {
        user: function () {
          return acc.user;
        }
      }
    });

    modalInstance.result.then(function (userid) {
      accountService.deactivateTaskerAccount(userid).then(function (response) {
        $translate('YOUR ACCOUNT DEACTIVATED SUCCESSFULLY').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error); });
      }, function () {
        if (err.msg) {
          toastr.error(err.msg);
        } else {
          $translate('UNABLE TO SAVE YOUR DATA').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        }
      });
    });
  };

  acc.livetracking = function (data) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'app/site/modules/accounts/views/model/liveTracking.html',
      controller: 'liveTrackingModelCtrl',
      controllerAs: 'LTC',
      size: 'lg',
      scope: $scope,
      resolve: {
        TaskDetails: function () {
          return data;
        },
        currentUser: function () {
          return AuthenticationService.GetCredentials();
        }
      }
    });
    modalInstance.result.then(function (selectedItem) {
    });
  };
}

angular.module('handyforall.accounts').controller('TaskPayModalInstanceCtrl', function ($scope, $filter, $uibModalInstance, Taskinfobyid, updatingstatus) {

  var tpm = this;
  var total = 0;
  tpm.user = Taskinfobyid.taskdata[0].user;
  tpm.taskid = Taskinfobyid.taskdata[0]._id;
  tpm.status = updatingstatus;
  tpm.bookingid = Taskinfobyid.taskdata[0].booking_id;
  tpm.taskname = Taskinfobyid.taskdata[0].category.name;
  tpm.admincommision = Taskinfobyid.settingsdata.settings.admin_commission;
  tpm.servicetax = Taskinfobyid.settingsdata.settings.service_tax;
  tpm.minimumamount = Taskinfobyid.settingsdata.settings.minimum_amount;
  tpm.taskdescription = Taskinfobyid.taskdata[0].task_description;
  tpm.hourlyrate = $filter('filter')(Taskinfobyid.taskdata[0].tasker.skills, { "childid": Taskinfobyid.taskdata[0].category._id });

  tpm.totalhour1 = function () {

    tpm.total = tpm.hourlyrate[0].hour_rate;

    if (tpm.totalhour > 1) {
      tpm.newtotal = ((parseInt(tpm.minimumamount)) + (parseInt(tpm.total) * (parseInt(tpm.totalhour) - 1)));
      tpm.taxamount = parseInt(tpm.newtotal) * (parseInt(tpm.servicetax) / 100);
      tpm.adminamount = parseInt(tpm.newtotal) * (parseInt(tpm.admincommision) / 100);
      tpm.commisionamount = parseInt(tpm.adminamount) + parseInt(tpm.taxamount);
      tpm.grandtotal = parseInt(tpm.newtotal) + parseInt(tpm.commisionamount);
    }
    else if (tpm.totalhour <= 1) {
      tpm.newtotal = parseInt(tpm.minimumamount);
      tpm.taxamount = parseInt(tpm.minimumamount) * (parseInt(tpm.servicetax) / 100);
      tpm.adminamount = parseInt(tpm.minimumamount) * (parseInt(tpm.admincommision) / 100);
      tpm.commisionamount = parseInt(tpm.adminamount) + parseInt(tpm.taxamount);
      tpm.grandtotal = parseInt(tpm.minimumamount) + parseInt(tpm.commisionamount);
    } else {
      tpm.grandtotal = parseInt(tpm.total);
    }
  };

  tpm.ok = function () {
    $uibModalInstance.close(tpm);
  };

  tpm.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

});

angular.module('handyforall.accounts').controller('DeactivateCtrl', function ($uibModalInstance, user, $state) {
  var decm = this;
  decm.user = user;
  decm.userid = decm.user._id;
  decm.ok = function () {
    $uibModalInstance.close(decm.userid);
    $state.go('Deactivate');
  };
  decm.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('handyforall.accounts').controller('CategoriesModalInstanceCtrl', function (accountService, $uibModalInstance, experiences, experience_years, travel_arrangements, brands, user, toastr, categories, category, defaultcurrency, $translate) {

  var acm = this;
  acm.isTasker = false;
  acm.demandImagesMaxLimit = false;
  if (category) {
    acm.role = 'Edit';
  }
  else {
    acm.role = 'New';
  }
  acm.user = user;
  if (user.role === 'tasker') {
    acm.isTasker = true;
  }
  acm.defaultcurrency = defaultcurrency;

  acm.categories = categories;
  acm.experiences = experiences;
  acm.experience_years = experience_years;
  acm.travel_arrangements = travel_arrangements;
  acm.brands = brands;
  acm.category = acm.categories.filter(function (obj) {

    return obj._id === category;
  })[0];

  acm.selectedCategoryData = {};
  acm.selectedCategoryData.skills = [];
  acm.selectedCategoryData.hour_rate = 0;
  if (acm.category) {
    acm.mode = 'EDIT';
  } else {
    acm.mode = 'ADD';
  }

  for (var i = 0; i < acm.user.skills.length; i++) {
    if (acm.user.skills[i].childid == category) {
      acm.selectedCategoryData = acm.user.skills[i];
    }
  }

  acm.selectedCategoryData.userid = acm.user._id;
  acm.onChangeCategory = function (category) {
    acm.category = acm.categories.filter(function (obj) {
      return obj._id === category;
    })[0];
  };

  acm.onDemandImages = (input) => {
    console.log('demand images change', input);
    if (input && input.length > 4) {
      acm.demandImagesMaxLimit = true;
      // acm.selectedCategoryData.demand_images.slice(0, 4);
      // $("[name='demand_images']").files;
      angular.element("input[name=demand_images]").val(null);
    } else {
      acm.demandImagesMaxLimit = false;
    }
  };

  acm.onChangeCategoryChild = function (category) {
    accountService.getChild(category).then(function (response) {
      acm.MinimumAmount = response.commision;
    });

    acm.user.skills.forEach(function (obj) {
      if (obj.childid === category) {
        $translate('ALREADY THE CATEGORY IS EXISTS').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
        $uibModalInstance.dismiss('cancel');
      }
    });
  };

  if (acm.selectedCategoryData.childid) {
    accountService.getChild(acm.selectedCategoryData.childid).then(function (response) {
      acm.MinimumAmount = response.commision;
    });
  }

  if (!acm.selectedCategoryData.hour_rate)
    acm.selectedCategoryData.hour_rate = 0;
  if (!acm.selectedCategoryData.km_rate)
    acm.selectedCategoryData.km_rate = 0;
  if (!acm.selectedCategoryData.unit_price)
    acm.selectedCategoryData.unit_price = 0;
  if (!acm.selectedCategoryData.salary)
    acm.selectedCategoryData.salary = 0;

  acm.selectedCategoryData.hour_rate = parseFloat((acm.selectedCategoryData.hour_rate * (!acm.defaultcurrency || !acm.defaultcurrency.length ? 1 : acm.defaultcurrency[0].value)).toFixed(2));
  acm.selectedCategoryData.km_rate = parseFloat((acm.selectedCategoryData.km_rate * (!acm.defaultcurrency || !acm.defaultcurrency.length ? 1 : acm.defaultcurrency[0].value)).toFixed(2));
  acm.selectedCategoryData.unit_price = parseFloat((acm.selectedCategoryData.unit_price * (!acm.defaultcurrency || !acm.defaultcurrency.length ? 1 : acm.defaultcurrency[0].value)).toFixed(2));
  acm.selectedCategoryData.salary = parseFloat((acm.selectedCategoryData.salary * (!acm.defaultcurrency || !acm.defaultcurrency.length ? 1 : acm.defaultcurrency[0].value)).toFixed(2));

  acm.ok = function (valid) {
    if (valid) {
      $uibModalInstance.close(acm.selectedCategoryData);
    } else {
      $translate('FORM IS INVALID').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
    }
  };
  acm.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('handyforall.accounts').controller('CategoryDemandImageModalInstanceCtrl', function (accountService, $uibModalInstance, toastr, images, $translate) {
  const cdim = this;

  cdim.images = [];

  cdim.images = images;
  console.log('images', images);

  cdim.ok = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('handyforall.accounts').controller('AvailabilityModalInstanceCtrl', function ($scope, $uibModalInstance, workingDays, workingTimes, DaysData, selectedIndex, accountService) {
  $scope.WorkingDays = workingDays[selectedIndex];
  $scope.workingTimes = workingTimes;
  $scope.days = DaysData;
  $scope.availabilities = accountService.getAvailabilities();
  $scope.WorkingDays.hours = [];
  // $scope.WorkingDays.value = 28371;

  // console.log('selected index', selectedIndex);
  // console.log($scope.WorkingDays.value);

  function init() {
    // decimal to boolean array
    const availabilityLength = $scope.availabilities.length;
    for (const [key, value] of $scope.availabilities.entries()) {
      let isTrue = false;
      if ($scope.WorkingDays.value) {
        // changed direction
        if ($scope.WorkingDays.value & Math.pow(2, availabilityLength - key - 1)) {
          isTrue = true;
        }
      } else {
        isTrue = true;
      }
      $scope.WorkingDays.hours[key] = isTrue;
    }
  }
  init();

  $scope.ok = function () {
    let binaryStr = '';
    for (const value of $scope.WorkingDays.hours) {
      binaryStr += (value)? '1' : '0';
    }

    $scope.WorkingDays.value = parseInt(binaryStr, 2);

    $scope.WorkingDays.not_working = !$scope.WorkingDays.value;

    $scope.WorkingDays.hour.morning = ($scope.WorkingDays.value & 31744) > 0; //0111110000000000
    $scope.WorkingDays.hour.afternoon = ($scope.WorkingDays.value & 960) > 0; //01111000000
    $scope.WorkingDays.hour.evening = ($scope.WorkingDays.value & 63) > 0; //0111111

    delete $scope.WorkingDays.hours;

    $uibModalInstance.close({
      index: selectedIndex,
      working_day: $scope.WorkingDays
    });
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('handyforall.accounts').controller('TaskInviteViewModalInstanceCtrl', function ($uibModalInstance, TaskInvite, DefaultCurrency, getsettings, accountService) {
  var tvmi = this;
  tvmi.TaskInvite = TaskInvite;
  tvmi.DefaultCurrency = DefaultCurrency;
  tvmi.getsettings = getsettings;
  tvmi.timeline = tvmi.TaskInvite.history;
  tvmi.flow = [];
  function init() {
    let flowIndex = 1;
    const flow = [];
    const secondFlowCategories = accountService.getSecondFlowCagetories();
    const categoryName = tvmi.TaskInvite.category.name;
    if (secondFlowCategories.includes(categoryName)) {
      flowIndex = 2;
    }
    switch(flowIndex) {
      case 1:
      {
        const flowList = accountService.getFirstFlowList();
        for (const item of flowList) {
          flow.push({name: `first_provider_${item}`, value: tvmi.timeline[item]});
        }
      }
        break;
      case 2:
      {
        const flowList = accountService.getSecondFlowList();
        for (const item of flowList) {
          flow.push({name: `second_provider_${item}`, value: tvmi.timeline[item]});
        }
      }
        break;
    }

    flow.sort((a, b) => b.value - a.value);
    tvmi.flow = flow;
  }
  init();

  tvmi.ok = function (working_day, index) {
    var data = {};
    $uibModalInstance.close(data);
  };
  tvmi.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('handyforall.accounts').controller('TaskInviteAddCourierModalInstanceCtrl', function ($uibModalInstance, TaskDetail, DefaultCurrency, getsettings, accountService, toastr, $translate) {
  var tvmi = this;
  tvmi.taskDetail = TaskDetail;
  tvmi.DefaultCurrency = DefaultCurrency;
  tvmi.getsettings = getsettings;
  function init() {
    console.log('TaskInvite', tvmi.taskDetail);
    tvmi.courierList = accountService.getCourierList();
  }
  init();

  tvmi.ok = function (valid) {
    if (valid) {
      $uibModalInstance.close(tvmi.taskDetail);
    } else {
      $translate('FORM IS INVALID').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
    }
  };

  tvmi.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('handyforall.accounts').controller('TaskInviteTrackParcelModalInstanceCtrl', function ($uibModalInstance, TaskDetail, DefaultCurrency, getsettings, accountService) {
  var tvmi = this;
  tvmi.taskDetail = TaskDetail;
  tvmi.DefaultCurrency = DefaultCurrency;
  tvmi.getsettings = getsettings;
  tvmi.courierList = accountService.getCourierList();
  tvmi.entity = {};
  function init() {
    console.log(tvmi.taskDetail.courier_type);
    console.log(tvmi.courierList[0].value);
    console.log(tvmi.taskDetail.courier_waybill);
    if (tvmi.taskDetail.courier_type === tvmi.courierList[0].value.toString()) {
      const data = {
        waybill: tvmi.taskDetail.courier_waybill,
      };
      accountService.getCourierGuy(data)
        .then(function (response) {
          console.log('response', response);
          tvmi.entity = response;
          }, function (err) {
        });
    }
  }
  init();

  tvmi.ok = function () {
    $uibModalInstance.close();
  };
  tvmi.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('handyforall.accounts').controller('TaskerExtraViewModalInstanceCtrl', function ($uibModalInstance, $translate, Taskid, status, DefaultCurrency, accountService, toastr) {

  var tevmi = this;
  tevmi.defaultcurrency = DefaultCurrency;
  tevmi.addmaterial = false;
  tevmi.total = 0;
  tevmi.choices = [];
  tevmi.addNewChoice = function () {
    var newItemNo = tevmi.choices.length + 1;
    tevmi.choices.push({ 'id': 'choice' + newItemNo });
    tevmi.calculateChoice();
  };

  tevmi.calculateChoice = function () {
    tevmi.total = 0;
    if (tevmi.newchoice) {
      for (var i = 0; i < tevmi.choices.length; i++) {
        if (tevmi.newchoice.value[i]) {
          tevmi.total = tevmi.total + parseFloat(tevmi.newchoice.value[i])
        }
      }
    }
  };

  tevmi.removeChoice = function () {
    var lastItem = tevmi.choices.length - 1;
    if (lastItem != 0) {
      tevmi.newchoice.value[lastItem] = '';
      tevmi.newchoice.name[lastItem] = '';
      tevmi.choices.pop({ 'id': 'choice' + lastItem });
    } else {
      tevmi.addmaterial = false;
      tevmi.newchoice.value[lastItem] = '';
      tevmi.newchoice.name[lastItem] = '';
      tevmi.choices.pop({ 'id': 'choice' + lastItem });
    }
    tevmi.calculateChoice();
  };


  tevmi.taskid = Taskid;
  tevmi.defaultCurrency = DefaultCurrency;
  tevmi.status = status;
  var newdata = [];


  tevmi.ok = function (test, valid) {
    if (!valid && (test.newchoice == undefined && tevmi.addmaterial == false)) {
      $translate('PLEASE ENTER ALL FEILD').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
    } else {
      if (test.newchoice && tevmi.addmaterial) {
        for (var i = 0; i < test.choices.length; i++) {
          var data = {};
          data.name = test.newchoice.name[i];
          data.price = parseFloat((test.newchoice.value[i] / tevmi.defaultcurrency[0].value).toFixed(2));
          newdata.push(data);
        }
        tevmi.newdata = newdata;
        $uibModalInstance.close(tevmi);
      } else {
        var data = {};
        data.taskid = test.taskid;
        data.status = test.status;
        $uibModalInstance.close(data);
      }
    }
  };

  tevmi.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

});

angular.module('handyforall.accounts').controller('TaskDetailsViewModalInstanceCtrl', function ($uibModalInstance, TaskDetails, DefaultCurrency, accountService) {
  var tdvmi = this;
  tdvmi.TaskDetails = TaskDetails;
  tdvmi.DefaultCurrency = DefaultCurrency;

  tdvmi.taskdescription = TaskDetails.task_description;
  tdvmi.timeline = tdvmi.TaskDetails.history;
  tdvmi.flow = [];
  function init() {
    let flowIndex = 1;
    const flow = [];
    const secondFlowCategories = accountService.getSecondFlowCagetories();
    const categoryName = tdvmi.TaskDetails.category.name;
    if (secondFlowCategories.includes(categoryName)) {
      flowIndex = 2;
    }
    switch(flowIndex) {
      case 1:
      {
        const flowList = accountService.getFirstFlowList();
        for (const item of flowList) {
          flow.push({name: `first_user_${item}`, value: tdvmi.timeline[item]});
        }
      }
      break;
      case 2:
      {
        const flowList = accountService.getSecondFlowList();
        for (const item of flowList) {
          flow.push({name: `second_user_${item}`, value: tdvmi.timeline[item]});
        }
      }
      break;
    }

    flow.sort((a, b) => b.value - a.value);
    tdvmi.flow = flow;
  }
  init();
  tdvmi.ok = function () {
    $uibModalInstance.close();
  };
  tdvmi.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});


angular.module('handyforall.accounts').controller('TaskDetailsViewforstatusModalInstanceCtrl', function ($uibModalInstance, TaskDetails, defaultcurrency) {
  var tdvsmi = this;
  tdvsmi.defaultcurrency = defaultcurrency;
  tdvsmi.TaskDetails = TaskDetails;
  var a = TaskDetails.invoice.worked_hours;
  var hours = Math.trunc(a / 60);
  var minutes = a % 60;

  if (hours == 0) {
    if (minutes == 0.1) {
      tdvsmi.Task_time = minutes + " min";
    } else {
      tdvsmi.Task_time = minutes + " mins";
    }

  } else {
    tdvsmi.Task_time = hours + " hours " + minutes + " mins";
  }

  tdvsmi.taskdescription = TaskDetails.task_description;
  tdvsmi.ok = function () {
    $uibModalInstance.close();
  };
  tdvsmi.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('handyforall.accounts').controller('TaskDetailsIgnoreModalInstanceCtrl', function ($translate, $uibModalInstance, $state, userid, status, toastr, cancelreason) {
  var tdimi = this;
  tdimi.userid = userid;
  tdimi.taskstatus = status;
  tdimi.cancelreason = cancelreason;
  tdimi.other = 0;
  tdimi.ok = function (data) {
    if (data.reason) {
      $uibModalInstance.close(tdimi);

    } else {
      $translate('REASON FIELD IS EMPTY').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });
    }
  };
  tdimi.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
  tdimi.otherclick = function (other) {
    tdimi.other = 1;
  };
  tdimi.click = function (other) {
    tdimi.other = 0;
  };


});

angular.module('handyforall.accounts').controller('WalletRechargeModal', function ($uibModalInstance, $state, $translate, Rechargeamount, toastr) {
  var wrm = this;
  wrm.rechargeamount = Rechargeamount;
  var walletamount = wrm.rechargeamount.data.replace(/,/g, '');
  var currencyvalue = wrm.rechargeamount.currencyvalue;
  var result = parseFloat(walletamount) / parseFloat(currencyvalue);
  var walletamount = "";
  wrm.walletamount = result.toFixed(2);
  wrm.ok = function (isValid) {
    if (isValid == true) {
      $uibModalInstance.close(wrm);
    }
    else {
      $translate('FORM IS INVALID').then(function (headline) { toastr.error(headline); }, function (translationId) { toastr.error(headline); });

    }

  };
  wrm.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('handyforall.accounts').controller('TaskDetailsconfirmModalInstanceCtrl', function ($uibModalInstance, $state, sweet, taskid, status, taskerid) {
  var tdcmi = this;
  tdcmi.taskid = taskid;
  tdcmi.taskstatus = status;
  tdcmi.taskerid = taskerid;
  tdcmi.ok = function () {
    $uibModalInstance.close(tdcmi);
  };
  tdcmi.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

});

angular.module('handyforall.accounts').controller('DeleteCategoriesModalInstanceCtrl', function ($uibModalInstance, user, category, categoryname, $translate, toastr) {
  var dacm = this;
  dacm.category = category;
  dacm.user = user;
  var categoryinfo = {};
  categoryinfo.userid = user._id;
  categoryinfo.categoryid = category;
  categoryinfo.categoryname = categoryname;
  dacm.ok = function () {
    $uibModalInstance.close(categoryinfo);
    $translate('CATEGORY DELETED SUCCESSFULLY').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error); });
  };
  dacm.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('handyforall.accounts').controller('DisputeReviewModalInstanceCtrl', function ($uibModalInstance, TaskDetails, accountService, status, $state) {
  var dnm = this;
  dnm.indexValue = TaskDetails._id;
  dnm.ststusvalue = status;
  dnm.ok = function () {
    accountService.disputeUpdateTask(dnm.indexValue, dnm.ststusvalue).then(function (response) {
      $state.reload();
    }, function (err) {
    });
    $uibModalInstance.close(dnm.review);
  };
  dnm.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

});

angular.module('handyforall.accounts').controller('TaskReviewModalCtrl', function ($uibModalInstance, TaskDetails) {
  var trem = this;
  trem.TaskDetails = TaskDetails;
  trem.ok = function () {
    $uibModalInstance.close(trem.review);
  };
  trem.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

});

angular.module('handyforall.accounts').controller('TaskReviewModalSave', function ($uibModalInstance) {
  var trem = this;
  trem.ok = function () {

    $uibModalInstance.close(trem.review);
  };
  trem.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

});

angular.module('handyforall.accounts').controller('TaskTranscationViewModal', function ($scope, task, $uibModalInstance, accountService, TaskDetails, defaultcurrency, getsettings, getmaincatname) {
  var trems = this;
  trems.TaskDetails = TaskDetails;
  trems.task = task;
  trems.maincategoryname = getmaincatname.name;
  trems.defaultcurrency = defaultcurrency;
  trems.getsettings = getsettings;
  trems.downloadPdf = function () {
    accountService.downloadPdf(trems.TaskDetails.bookingid).then(function (response) {
    });
  }
  trems.ok = function () {
    $uibModalInstance.close(trems.review);
  };
  trems.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

});

angular.module('handyforall.accounts').controller('TaskUserTranscationViewModal', function ($scope, task, $uibModalInstance, accountService, TaskDetails, defaultcurrency, getsettings, getmaincatname) {
  var trems = this;
  trems.TaskDetails = TaskDetails;
  trems.task = task;
  trems.maincategoryname = getmaincatname.name;
  trems.defaultcurrency = defaultcurrency;
  trems.getsettings = getsettings;
  if (((trems.TaskDetails.invoice.amount.total + trems.TaskDetails.invoice.amount.service_tax) * trems.defaultcurrency[0].value) > (trems.TaskDetails.invoice.amount.coupon * trems.defaultcurrency[0].value)) {
    trems.checkvalue = "big";
    trems.total = ((((trems.TaskDetails.invoice.amount.total + trems.TaskDetails.invoice.amount.service_tax + trems.TaskDetails.invoice.amount.extra_amount) * trems.defaultcurrency[0].value) - trems.TaskDetails.invoice.amount.coupon) * trems.defaultcurrency[0].value).toFixed(2);
  } else {
    trems.checkvalue = "small";
    trems.total = ((trems.TaskDetails.invoice.amount.extra_amount + trems.TaskDetails.invoice.amount.service_tax) * trems.defaultcurrency[0].value).toFixed(2);
  }

  trems.downloadPdf = function () {
    accountService.downloadPdf(trems.TaskDetails.bookingid).then(function (response) {
    });
  }
  trems.ok = function () {
    $uibModalInstance.close(trems.review);
  };
  trems.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
angular.module('handyforall.accounts').controller('addReviewModal', function ($uibModalInstance, TaskDetails, $scope, $state) {
  var arm = this;
  arm.user = TaskDetails.user;
  arm.tasker = TaskDetails.tasker._id;
  arm.task = TaskDetails._id;
  arm.type = 'user';
  arm.ok = function () {
    $uibModalInstance.close(arm);
    $state.go('account');
  };
  arm.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
angular.module('handyforall.accounts').controller('reviewModelCtrl', function ($uibModalInstance, data, role) {
  var rmc = this;
  rmc.reviewData = data;
  rmc.role = role;
  rmc.ok = function () {
    $uibModalInstance.close(rmc);
  };
  rmc.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
})
angular.module('handyforall.accounts').directive('cropImgChange', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeHandler = scope.$eval(attrs.cropImgChange);
      element.bind('change', onChangeHandler);
    }
  };
});


/*angular.module('handyforall.accounts').controller('liveTrackingModelCtrl', function ($scope, $modalInstance, NgMap, TaskDetails, socket, $translate, toastr, notify, $rootScope, currentUser, $timeout) {
var rmc = this;
rmc.role = 'user';
$scope.map = [];
rmc.data = { tasker: {} };
$scope.render = true;
//Live tracking
NgMap.getMap({ id: "map" }).then(function (map) {
$scope.map = map;
})
rmc.data.booking_information = TaskDetails.booking_information;
rmc.data.tasker.location = TaskDetails.tasker.location; // origin
rmc.data.location = { 'lat': TaskDetails.location.lat, 'lng': TaskDetails.location.log } //destination
rmc.wayPoints = [{ location: { lat: TaskDetails.tasker.location.lat, lng: TaskDetails.tasker.location.lng }, stopover: true }]; //wayPoints
if (currentUser.currentUser.user_type == 'tasker') {
rmc.role = 'tasker';
rmc.tasker_id = TaskDetails.tasker._id.toString();
} else {
rmc.tasker_id = TaskDetails.tasker._id.toString();
}
notify.on('webtaskertracking', function (data) {
if (data.user.toString() == rmc.tasker_id) {
console.log("data.latLng", data.latLng);
rmc.data.tasker.location = TaskDetails.tasker.location; // origin
rmc.data.location = { 'lat': TaskDetails.location.lat, 'lng': TaskDetails.location.log } //destination
rmc.wayPoints = [{ location: { lat: parseFloat(data.latLng.lat), lng: parseFloat(data.latLng.lng) }, stopover: true }];
// rmc.data.tasker.location = data.latLng;
// rmc.data.booking_information = TaskDetails.booking_information;
// rmc.data.location = data.latLng;
}
});
// end
$scope.ok = function () {
$scope.$on('$destroy', function (event) {
console.log(">>>", event);
})
$modalInstance.close();
};
});*/

angular.module('handyforall.accounts').controller('liveTrackingModelCtrl', function ($scope, $modalInstance, NgMap, TaskDetails, socket, $translate, toastr, notify, $rootScope, currentUser, $timeout) {
  var rmc = this;
  rmc.role = 'user';
  $scope.map = [];
  rmc.data = { tasker: {} };
  $scope.render = true;
  //Live tracking
  rmc.data.booking_information = TaskDetails.booking_information;
  rmc.data.tasker.location = TaskDetails.tasker.location; // origin
  rmc.data.location = { 'lat': TaskDetails.location.lat, 'lng': TaskDetails.location.log } //destination
  rmc.wayPoints = [{ location: { lat: TaskDetails.tasker.location.lat, lng: TaskDetails.tasker.location.lng }, stopover: true }]; //wayPoints
  if (currentUser.currentUser.user_type == 'tasker') {
    rmc.role = 'tasker';
    rmc.tasker_id = TaskDetails.tasker._id.toString();
  } else {
    rmc.tasker_id = TaskDetails.tasker._id.toString();
  }
  var car = "M17.402,0H5.643C2.526,0,0,3.467,0,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759c3.116,0,5.644-2.527,5.644-5.644 V6.584C23.044,3.467,20.518,0,17.402,0z M22.057,14.188v11.665l-2.729,0.351v-4.806L22.057,14.188z M20.625,10.773 c-1.016,3.9-2.219,8.51-2.219,8.51H4.638l-2.222-8.51C2.417,10.773,11.3,7.755,20.625,10.773z M3.748,21.713v4.492l-2.73-0.349 V14.502L3.748,21.713z M1.018,37.938V27.579l2.73,0.343v8.196L1.018,37.938z M2.575,40.882l2.218-3.336h13.771l2.219,3.336H2.575z M19.328,35.805v-7.872l2.729-0.355v10.048L19.328,35.805z";

  var icon = { path: car, scale: .7, strokeColor: 'white', strokeWeight: .10, fillOpacity: 1, rotation: 0,  fillColor: '#404040',	offset: '5%',  anchor: new google.maps.Point(10, 25) };
  var map;

  $rootScope.directionsDisplay = '';
  var directionsService = new google.maps.DirectionsService;
  $rootScope.markers = [];
  var icons = { start: new google.maps.MarkerImage('app/site/public/images/pickup_marker.png', new google.maps.Size(44, 32), new google.maps.Point(0, 0), new google.maps.Point(22, 32)), end: new google.maps.MarkerImage('app/site/public/images/drop_marker.png', new google.maps.Size(44, 32), new google.maps.Point(0, 0), new google.maps.Point(22, 32)) };
  notify.on('webtaskertracking', webtaskertracking);
  var myOptions = {
    zoom: 10,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: 'greedy',
    center: new google.maps.LatLng(13.0827, 80.2707),
  };
  $timeout(function () {
    $rootScope.map = new google.maps.Map(document.getElementById('tracking'), myOptions);
    var directionsService = new google.maps.DirectionsService;
    $rootScope.directionsDisplay = new google.maps.DirectionsRenderer({ map: $rootScope.map, suppressMarkers: true, preserveViewport: true });
    $rootScope.map_marker = new google.maps.Marker({
      position: { lat: rmc.wayPoints[0].location.lat, lng:  rmc.wayPoints[0].location.lng },
      map: $rootScope.map,
      icon: icon
    });
    var pointA = new google.maps.LatLng(TaskDetails.tasker.location.lat, TaskDetails.tasker.location.lng),
      pointB = new google.maps.LatLng(TaskDetails.location.lat, TaskDetails.location.log );
    $rootScope.map.setCenter({lat: rmc.wayPoints[0].location.lat, lng:  rmc.wayPoints[0].location.lng  })
    directionsService.route({
      origin: pointA,
      destination: pointB,
      travelMode: google.maps.TravelMode.DRIVING
    }, function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        $rootScope.directionsDisplay.setDirections(response);
        var leg = response.routes[0].legs[0];
        var icon = {url:  "uploads/default/start.png", scaledSize: new google.maps.Size(30,30)};
        var icon1 = {url:  "uploads/default/end.png",scaledSize: new google.maps.Size(30,30)};
        var marker = new google.maps.Marker({ position: leg.start_location, map: $rootScope.map,  icon:icon, title: 'Tasker' });
        var marker1 = new google.maps.Marker({ position: leg.end_location, map: $rootScope.map, icon: icon1, title: 'User' });
      }
    })
  })

  var pts = [];
  var glb_previndx = -1;
  var snaproadarray = "";
  var snappedCoordinates = [];
  var animationdata = [];
  var apiKey = "AIzaSyDGmV4buRAdXsVzMtE-y8q4z1G81-d0RO4"; // google api for Live tracking
  var redraw = function (pt) {
    pt.lat = parseFloat(pt.lat);
    pt.lng = parseFloat(pt.lng);
    if (pts.length >= 1) {
      var ln = pts.length;
      var lstptindx = ln - 1;
      var d = getDistanceFromLatLonInmeter(pts[lstptindx].lat, pts[lstptindx].lng, pt.lat, pt.lng);
      if (d < 3) {
        return false;
      }
    }
    pts.push(pt);
    if (pts.length == 1) {
      $rootScope.map_marker.setPosition({ lat: parseFloat(pt.lat), lng: parseFloat(pt.lng), alt: 0 });
      $rootScope.markers.push($rootScope.map_marker)
      position = [pt.lat, pt.lng]
      snaproadarray = pt.lat + "," + pt.lng;
      writePath(pt)
    } else {
      if (pts.length >= 2) {
        var ln = pts.length;
        var lstptindx = ln - 1;
        var previndx = glb_previndx == -1 ? ln - 2 : glb_previndx;
        var d = getDistanceFromLatLonInmeter(pts[previndx].lat, pts[previndx].lng, pts[lstptindx].lat, pts[lstptindx].lng);
        if (d > 10) {
          glb_previndx = lstptindx;
          snaproadarray += "|" + pt.lat + "," + pt.lng;
          var limitedValues = snaproadarray.split('|').reverse().slice(0, 100).reverse();
          snaproadarray = pt.lat + "," + pt.lng;
          $.get('https://roads.googleapis.com/v1/snapToRoads', {
            interpolate: true,
            key: apiKey,
            path: limitedValues.join('|')
          }, function (data) {
            if (typeof data.snappedPoints != 'undefined') {
              drawSnappedPolyline(data);
              for (var ind = 0; ind < data.snappedPoints.length; ind++) {
                snappedCoordinates.push(
                  {
                    lat: data.snappedPoints[ind].location.latitude,
                    lng: data.snappedPoints[ind].location.longitude
                  }
                )
              }
            } else {
              drawPolyline(pt)
            }
          });
        } else {
          glb_previndx = previndx;
          if (d > 2) {
            snaproadarray += "|" + pt.lat + "," + pt.lng;
            writePath(pt)
          }
        }
      }
    }
  }
  function writePath(pt) {
    var pointA = new google.maps.LatLng(TaskDetails.location.lat,  TaskDetails.location.log);
    var pointB = new google.maps.LatLng(pt.lat, pt.lng);
    directionsService.route({
      origin: pointA,
      destination: pointB,
      travelMode: google.maps.TravelMode.DRIVING
    }, function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        $scope.directionsDisplay.setDirections(response);
      } else {
        //console.log('Directions request failed due to ' + status)
      }
    });
  }
  function drawPolyline(pt) {
    var lastPosn = $rootScope.map_marker.getPosition();
    var result = [parseFloat(pt.lat), parseFloat(pt.lng)];
    var currentLatLong = { lat: lat, lng: lng };
    animateMap(currentLatLong, lastPosn);
  }

  function drawSnappedPolyline(data) {
    var snappedPolyline = new google.maps.Polyline({
      path: snappedCoordinates,
      strokeColor: 'black',
      strokeWeight: 3
    });
    k = data.snappedPoints.length;
    lat = data.snappedPoints[k - 1].location.latitude;
    lng = data.snappedPoints[k - 1].location.longitude;
    var lastPosn = $rootScope.map_marker.getPosition();
    var result = [parseFloat(lat), parseFloat(lng)];
    var currentLatLong = { lat: lat, lng: lng };
    animateMap(currentLatLong, lastPosn)
  }
  function animateMap(currentLatLong, lastPosn) {
    frames = [];
    var fromLat = lastPosn.lat();
    var fromLng = lastPosn.lng();
    var toLat = currentLatLong.lat;
    var toLng = currentLatLong.lng;
    bounds = new google.maps.LatLngBounds();
    for (var percent = 0; percent < 1; percent += 0.01) {
      curLat = fromLat + percent * (toLat - fromLat);
      curLng = fromLng + percent * (toLng - fromLng);
      frames.push(new google.maps.LatLng(curLat, curLng));
    }
    move = function (latlngs, index, wait, newDestination) {
      $rootScope.map_marker.setPosition(latlngs[index]);
      if (index != latlngs.length - 1) {
        // call the next "frame" of the animation
        setTimeout(function () {
          move(latlngs, index + 1, wait, newDestination);
        }, wait);
      }
      else {
        writePath({ lat: parseFloat(toLat), lng: parseFloat(toLng) })
        if ($rootScope.map.getBounds().contains($rootScope.map_marker.getPosition())) {
        } else {
          $rootScope.map.setCenter({ lat: toLat, lng: toLng })
        }
      }
    }
    move(frames, 0, 20, $rootScope.map_marker.position);
    var p = new google.maps.LatLng(toLat, toLng);
    var heading = google.maps.geometry.spherical.computeHeading(lastPosn, p);
    icon.rotation = heading;
    $rootScope.map_marker.setIcon(icon);
  }
  function getDistanceFromLatLonInmeter(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c * 1000; // Distance in m
    return d;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180)
  }
  function webtaskertracking(data) {
    if (data.user.toString() == rmc.tasker_id) {
      lat = data.latLng.lat;
      lng = data.latLng.lng;
      rmc.wayPoints = [{ location: { lat: parseFloat(data.latLng.lat), lng: parseFloat(data.latLng.lng) }, stopover: true }];
      var pt = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        time: new Date(),
      }
      redraw(pt);
    }
  }
  // end
  $scope.ok = function () {
    $scope.$on('$destroy', function (event) {
    })
    $modalInstance.close();
  };
});
