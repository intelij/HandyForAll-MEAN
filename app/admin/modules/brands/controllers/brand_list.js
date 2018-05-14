angular.module('handyforall.brands').controller('brandListCtrl', brandListCtrl);

brandListCtrl.$inject = ['BrandServiceResolve', 'BrandService', '$scope','$stateParams'];

function brandListCtrl(BrandServiceResolve, BrandService, $scope, $stateParams) {
  var ctrl = this;

  ctrl.permission = $scope.privileges.filter(function (menu) {
    return (menu.alias === "brands");
  }).map(function (menu) {
    return menu.status;
  })[0];

  var layout = [
    {
      name: 'Brand Name',
      variable: 'name',
      template: '{{content.name}}',
      sort: 1
    },
    { name: 'Brand Image', template: '<img ng-src="{{content.image}}" alt="" class="size-50x50" style="border-radius: 0%;">' },
    {
      name: 'Status', template: '<span ng-switch="content.status">' +
      '<span  ng-switch-when="1">Publish</span>' +
      '<span  ng-switch-when="2">UnPublish</span>' +
      '</span>'
    },
    {
      name: 'Actions',
      template: '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.edit != false" ui-sref="app.brands.edit({id:content._id,page:currentpage,items:entrylimit})"><i class="fa fa-edit"></i> <span>Edit</span></button>' +
      '<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false" ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Delete</span></button>'

    }
  ];

  ctrl.table = {};
  ctrl.table.layout = layout;
  ctrl.table.data = BrandServiceResolve[0];
  ctrl.table.page = $stateParams.page || 0;
  ctrl.table.entryLimit = $stateParams.items || 10;
  ctrl.table.count = BrandServiceResolve[1] || 0;
  ctrl.table.delete = {
    'permission': ctrl.permission, service: '/brand/deletebrand', getData: function (currentPage, itemsPerPage, sort, status, search) {
      if (currentPage >= 1) {
        var skip = (parseInt(currentPage) - 1) * itemsPerPage;
        BrandService.BrandList(itemsPerPage, skip, sort, status, search).then(function (respo) {
          ctrl.table.data = respo[0];
          ctrl.table.count = respo[1];
        });
      }
    }
  };
}
