angular.module('handyforall.categories').controller('categoryListCtrl', categoryListCtrl);

categoryListCtrl.$inject = ['CategoryServiceResolve', 'CategoryService', '$scope', '$stateParams', '$state'];

function categoryListCtrl(CategoryServiceResolve, CategoryService, $scope, $stateParams, $state) {
  var tlc = this;

  tlc.permission = $scope.privileges.filter(function (menu) {
    return (menu.alias === "categories");
  }).map(function (menu) {
    return menu.status;
  })[0];

  tlc.filter = {
    classification: !$stateParams.classification ? "" : $stateParams.classification
  };

  var layout = [
    {
      name: 'Classification',
      variable: 'classification',
      template: '<span ng-if="!content.classification">Service</span><span ng-if="content.classification">{{content.classification | capitalize}}</span>',
      sort: 1
    },
    {
      name: 'Category Name',
      variable: 'name',
      template: '{{content.name}}',
      sort: 1
    },
    { name: 'Category Image', template: '<img ng-src="{{content.image}}" alt="" class="size-50x50" style="border-radius: 0%;">' },
    {
      name: 'Status', template: '<span ng-switch="content.status">' +
      '<span  ng-switch-when="1">Publish</span>' +
      '<span  ng-switch-when="2">UnPublish</span>' +
      '</span>'
    },
    {
      name: 'Actions',
      template: '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.edit != false" ui-sref="app.categories.edit({id:content._id,page:currentpage,items:entrylimit})"><i class="fa fa-edit"></i> <span>Edit</span></button>' +
      '<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false" ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Delete</span></button>'

    }
  ];

  if ($stateParams.classification)
    layout.splice(0, 1);

  tlc.table = {};
  tlc.table.layout = layout;
  tlc.table.data = CategoryServiceResolve[0];
  tlc.table.page = $stateParams.page || 0;
  tlc.table.entryLimit = $stateParams.items || 10;
  tlc.table.count = CategoryServiceResolve[1] || 0;
  tlc.table.delete = {
    'permission': tlc.permission, service: '/category/deleteMaincategory', getData: function (currentPage, itemsPerPage, sort, search) {
      if (currentPage >= 1) {
        var skip = (parseInt(currentPage) - 1) * itemsPerPage;
        CategoryService.CategoryList(itemsPerPage, skip, sort, search).then(function (respo) {
          tlc.table.data = respo[0];
          tlc.table.count = respo[1];
        });
      }
    }
  };

  tlc.filterByClassification = function(classification) {
    if (!classification)
      $state.go('app.categories.list', {}, {reload: true});
    else
      $state.go('app.categories.list', {page: 0, items: 10, classification: classification}, {reload: true});
  };
}
