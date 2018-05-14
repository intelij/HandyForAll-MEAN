var app = angular.module('handyforall.brands');

app.factory('BrandService', BrandService);

BrandService.$inject = ['$http', '$q', 'Upload'];

function BrandService($http, $q, Upload) {
  var BrandService = {
    getBrandList: getBrandList,
    BrandList: BrandList,
    getBrand: getBrand,
    saveBrand: saveBrand
  };

  return BrandService;

  function getBrandList(limit, skip, sort, status, search) {
    var deferred = $q.defer();
    $http({
      method: 'GET',
      url: '/brands/list/?sort=' + sort + '&status=' + status + '&search=' + search + '&limit=' + limit + '&skip=' + skip
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function BrandList(limit, skip, sort, search) {
    var deferred = $q.defer();
    var data = {};
    data.sort = sort;
    data.search = search;
    data.limit = limit;
    data.skip = skip;

    $http({
      method: 'POST',
      url: '/admin/brands/lists',
      data: data
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function getBrand(id) {

    var data = { id: id };

    var deferred1 = $q.defer();
    $http({
      method: 'GET',
      url: '/brands/getcatlistdropdown'
    }).success(function (data) {
      deferred1.resolve(data);
    }).error(function (err) {
      deferred1.reject(err);
    });
    var promise1 = deferred1.promise;

    var deferred2 = $q.defer();

    $http({
      method: 'POST',
      url: '/brands/edit/',
      data: data
    }).success(function (data) {
      deferred2.resolve(data);
    }).error(function (err) {
      deferred2.reject(err);
    });
    var promise2 = deferred2.promise;

    return $q.all([promise1, promise2]);
  }

  function saveBrand(data) {
    var deferred = $q.defer();
    Upload.upload({
      url: '/brands/savebrand',
      data: data,
    }).then(function (data) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }
}
