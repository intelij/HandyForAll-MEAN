var app = angular.module('handyforall.travel-arrangement');

app.factory('TravelArrangementService', TravelArrangementService);

TravelArrangementService.$inject = ['$http', '$q', 'Upload'];

function TravelArrangementService($http, $q) {
  var object = {
    getTravelArrangementList: getTravelArrangementList,
    getTravelArrangement: getTravelArrangement,
    save: save
  };

  return object;

  function getTravelArrangementList(limit, skip, sort, search) {
    var deferred = $q.defer();
    var data = {};
    data.sort = sort;
    data.search = search;
    data.limit = limit;
    data.skip = skip;
    $http({
      method: 'POST',
      url: '/travel-arrangement/list',
      data: data
    }).success(function (response) {
      deferred.resolve(response);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function getTravelArrangement(id) {
    var data = { id: id };
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/travel-arrangement/edit/',
      data: data
    }).success(function (response) {
      deferred.resolve(response);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function save(data) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/travel-arrangement/save',
      data: data
    }).then(function (response) {
      deferred.resolve(response);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }
}
