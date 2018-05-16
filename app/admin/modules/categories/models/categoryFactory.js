var app = angular.module('handyforall.categories');

app.factory('CategoryService', CategoryService);

CategoryService.$inject = ['$http', '$q', 'Upload'];

function CategoryService($http, $q, Upload) {
  var classification = "";

  var CategoryService = {
    getCategoryList: getCategoryList,
    CategoryList: CategoryList,
    getsubCategoryList: getsubCategoryList,
    subCategoryList: subCategoryList,
    getCategory: getCategory,
    getsubCategory: getsubCategory,
    savecategory: savecategory,
    savesubcategory: savesubcategory,
    getSetting: getSetting,
    getCategoryTree: getCategoryTree
  };

  return CategoryService;

  function getCategoryList(params) {
    if (!params) {
      params = {};
      classification = "";
    } else {
      classification = params.classification;
    }

    var deferred = $q.defer();
    $http({
      method: 'GET',
      url: '/categories/list/?' + $.param(params || {})
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function CategoryList(limit, skip, sort, search) {
    var deferred = $q.defer();
    var data = {};
    data.sort = sort;
    data.search = search;
    data.limit = limit;
    data.skip = skip;
    data.classification = classification;

    $http({
      method: 'POST',
      url: '/admin/categories/lists',
      data: data
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }
  function getsubCategoryList(params) {
    classification = params.classification;

    var deferred = $q.defer();
    $http({
      method: 'GET',
      url: '/subcategories/list/?' + $.param(params || {})
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function subCategoryList(limit, skip, sort, search) {
    var deferred = $q.defer();
    var data = {};
    data.sort = sort;
    data.search = search;
    data.limit = limit;
    data.skip = skip;
    data.classification = classification;

    $http({
      method: 'POST',
      url: '/admin/subCategories/lists',
      data: data
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function getCategory(id) {
    const data = { id: id };

    const deferred1 = $q.defer();
    $http({
      method: 'GET',
      url: '/categories/getcatlistdropdown'
    }).success(function (data) {
      deferred1.resolve(data);
    }).error(function (err) {
      deferred1.reject(err);
    });
    const promise1 = deferred1.promise;

    const deferred2 = $q.defer();

    $http({
      method: 'POST',
      url: '/categories/edit/',
      data: data
    }).success(function (data) {
      deferred2.resolve(data);
    }).error(function (err) {
      deferred2.reject(err);
    });
    const promise2 = deferred2.promise;

    const deferred3 = $q.defer();

    $http({
      method: 'GET',
      url: '/categories/get_tree',
    }).success(function (data) {
      deferred3.resolve(data);
    }).error(function (err) {
      deferred3.reject(err);
    });
    const promise3 = deferred3.promise;

    return $q.all([promise1, promise2, promise3]);
  }

  function getsubCategory(data) {
    const deferred2 = $q.defer();

    $http({
      method: 'POST',
      url: '/categories/edit/',
      data: data,
    }).success(function (response) {
      deferred2.resolve(response);
    }).error(function (err) {
      deferred2.reject(err);
    });
    const promise2 = deferred2.promise;

    const deferred1 = $q.defer();

    $http({
      method: 'GET',
      url: '/categories/get_tree',
    }).success(function (response) {
      deferred1.resolve(response);
    }).error(function (err) {
      deferred1.reject(err);
    });
    const promise1 = deferred1.promise;

    return $q.all([promise1, promise2]);
  }

  function getCategoryTree(classification) {
    const deferred = $q.defer();

    $http({
      method: 'GET',
      url: '/categories/get_tree?classification=' + classification
    }).success(function (response) {
      deferred.resolve(response);
    }).error(function (err) {
      deferred.reject(err);
    });

    return deferred.promise;
  }

  function savecategory(data) {
    const deferred = $q.defer();
    Upload.upload({
      url: '/categories/savecategory',
      data: data,
    }).then(function (data) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function savesubcategory(data) {
    const deferred = $q.defer();
    Upload.upload({
      url: '/categories/savesubcategory',
      data: data,
    }).then(function (data) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function getSetting() {
    const deferred = $q.defer();
    $http({
      method: 'GET',
      url: '/subcategories/getSetting'
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }
}
