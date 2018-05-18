angular.module('handyforall.experience-year').controller('editExperienceYearCtrl', editExperienceYearCtrl);

editExperienceYearCtrl.$inject = ['ExperienceYearService', 'toastr', 'ExperienceYearEditResolve', '$state', '$stateParams'];
function editExperienceYearCtrl(ExperienceYearService, toastr, ExperienceYearEditResolve, $state, $stateParams) {
  var ctrl = this;

  ctrl.editExperienceYearData = ExperienceYearEditResolve;

  if ($stateParams.id) {
    ctrl.action = 'edit';
    ctrl.breadcrumb = 'SubMenu.EDIT_EXPERIENCE_YEAR';
  } else {
    ctrl.action = 'add';
    ctrl.breadcrumb = 'SubMenu.ADD_EXPERIENCE_YEAR';
  }

  ctrl.submit = function (isValid) {
    if (isValid) {
      ExperienceYearService.save(ctrl.editExperienceYearData).then(function () {
        var action = ctrl.action === 'edit' ? "edited" : "added";
        toastr.success('ExperienceYear ' + action + ' Successfully');
        $state.go('app.tasker_management.experience-year.list');
      }, function () {
        toastr.error('Unable to process your request');
      });
    } else {
      toastr.error('form is invalid');
    }
  };
}
