angular.module('handyforall.travel-arrangement').controller('editTravelArrangementCtrl', editTravelArrangementCtrl);

editTravelArrangementCtrl.$inject = ['TravelArrangementService', 'toastr', 'TravelArrangementEditReslove', '$state', '$stateParams'];
function editTravelArrangementCtrl(TravelArrangementService, toastr, TravelArrangementEditReslove, $state, $stateParams) {
  var ctrl = this;

  ctrl.editTravelArrangementData = TravelArrangementEditReslove;

  if ($stateParams.id) {
    ctrl.action = 'edit';
    ctrl.breadcrumb = 'SubMenu.EDIT_TRAVEL_ARRANGEMENT';
  } else {
    ctrl.action = 'add';
    ctrl.breadcrumb = 'SubMenu.ADD_TRAVEL_ARRANGEMENT';
  }

  ctrl.submit = function (isValid) {
    if (isValid) {
      TravelArrangementService.save(ctrl.editTravelArrangementData).then(function () {
        var action = ctrl.action === 'edit' ? "edited" : "added";
        toastr.success('TravelArrangement ' + action + ' Successfully');
        $state.go('app.tasker_management.travel-arrangement.list');
      }, function () {
        toastr.error('Unable to process your request');
      });
    } else {
      toastr.error('form is invalid');
    }
  };
}
