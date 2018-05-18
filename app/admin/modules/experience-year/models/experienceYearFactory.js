var app = angular.module('handyforall.experience-year');

app.factory('ExperienceYearService', ExperienceYearService);

ExperienceYearService.$inject = ['$http', '$q', 'Upload'];

function ExperienceYearService($http, $q) {
  var object = {
    getExperienceYearList: getExperienceYearList,
    getExperienceYear: getExperienceYear,
    save: save
  };

  return object;

  function getExperienceYearList(limit, skip, sort, search) {
    var deferred = $q.defer();
    var data = {};
    data.sort = sort;
    data.search = search;
    data.limit = limit;
    data.skip = skip;
    $http({
      method: 'POST',
      url: '/experience-year/list',
      data: data
    }).success(function (response) {
      deferred.resolve(response);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function getExperienceYear(id) {
    var data = { id: id };
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/experience-year/edit/',
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
      url: '/experience-year/save',
      data: data
    }).then(function (response) {
      deferred.resolve(response);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }
}
