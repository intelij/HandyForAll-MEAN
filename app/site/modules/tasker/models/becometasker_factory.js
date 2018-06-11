var app = angular.module('handyforall.becometasker');
app.factory('BecomeTaskerService', BecomeTaskerService);

function BecomeTaskerService($http, $q) {
  var BecomeTaskerService = {
    checkemail: checkemail,
    getCategories: getCategories,
    addCategory: addCategory,
    defaultCurrency: defaultCurrency,
    getExperience: getExperience
  };

  return BecomeTaskerService;

  function checkemail(email) {
    var deferred = $q.defer();
    $http({
      method: 'post',
      url: '/site/users/checktaskeremail',
      data: {email: email}
    }).success(function (response) {

      deferred.resolve(response);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };

  function defaultCurrency(value) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/settings/currency/default',
      data: value
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function addCategory(data) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/taskers/addcategory',
      data: data,
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function getCategories() {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/site/account/categories/get'
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function getExperience() {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/site/account/categories/get-experience'
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function getAvailabilities() {
    return [{
      name: 'am_7_8',
    },
      {
        name: 'am_8_9',
      },
      {
        name: 'am_9_10',
      },
      {
        name: 'am_10_11',
      },
      {
        name: 'am_11_12',
      },
      {
        name: 'pm_0_1',
      },
      {
        name: 'pm_1_2',
      },
      {
        name: 'pm_2_3',
      },
      {
        name: 'pm_3_4',
      },
      {
        name: 'pm_4_5',
      },
      {
        name: 'pm_5_6',
      },
      {
        name: 'pm_6_7',
      },
      {
        name: 'pm_7_8',
      },
      {
        name: 'pm_8_9',
      },
      {
        name: 'pm_9_10',
      }
    ];
  }
}
