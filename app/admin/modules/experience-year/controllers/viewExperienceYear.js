angular.module('handyforall.experience-year').controller('experienceYearListCtrl', experienceYearListCtrl);

experienceYearListCtrl.$inject = ['experienceYearServiceResolve', 'ExperienceYearService', '$scope'];

function experienceYearListCtrl(experienceYearServiceResolve, ExperienceYearService, $scope) {
  var ctrl = this;

  ctrl.permission = $scope.privileges.filter(function (menu) {
    return (menu.alias === "tasker_management");
  }).map(function (menu) {
    return menu.status;
  })[0];

  var layout = [
    {
      name: 'Name',
      variable: 'name',
      template: '{{content.name}}',
      sort: 1
    },
    {
      name: 'Status ',
      template:
      '<span  ng-switch="content.status">' +
      '<span  ng-switch-when="1">Publish</span>' +
      '<span  ng-switch-when="2">UnPublish</span>' +
      '<span  ng-switch-when="3">Pending</span>' +
      '</span>'
    },
    { name: 'Date', template: '{{content.updatedAt| clock : options.date }}' },
    {
      name: 'Actions',
      template: '<button class="btn btn-info btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.edit != false" ui-sref="app.tasker_management.experience-year.edit({id:content._id})"><i class="fa fa-edit"></i> <span>Edit</span></button>' +
      '<button class="btn btn-danger btn-rounded btn-ef btn-ef-5 btn-ef-5b" ng-if="options.permission.delete != false" ng-click="CCC.openDeleteModal(small, content, options)" ><i class="fa fa-trash"></i> <span>Delete</span></button>'
    }
  ];

  ctrl.table = {};
  ctrl.table.layout = layout;
  ctrl.table.data = experienceYearServiceResolve[0];
  ctrl.table.count = experienceYearServiceResolve[1] || 0;
  ctrl.table.delete = {
    'permission': ctrl.permission, 'date': $scope.date, service: '/experience-year/delete', getData: function (currentPage, itemsPerPage, sort, status, search) {
      if (currentPage >= 1) {
        var skip = (parseInt(currentPage, 10) - 1) * itemsPerPage;
        ExperienceYearService.getExperienceYearList(itemsPerPage, skip, sort, status, search).then(function (respo) {
          ctrl.table.data = respo[0];
          ctrl.table.count = respo[1];
        });
      }
    }
  };
}
