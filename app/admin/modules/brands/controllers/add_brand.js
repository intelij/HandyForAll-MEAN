angular.module('handyforall.brands').controller('editBrandCtrl', editBrandCtrl);

editBrandCtrl.$inject = ['brandEditReslove', 'BrandService', 'toastr', '$state', '$stateParams'];

function editBrandCtrl(brandEditReslove, BrandService, toastr, $state, $stateParams) {
  var ctrl = this;

  ctrl.mainPagesList = brandEditReslove[0];

  if (!brandEditReslove[1]) {
    ctrl.editBrandData = {
      status: "1"
    };
  } else {
    ctrl.editBrandData = brandEditReslove[1];
  }

  if ($stateParams.id) {
    ctrl.action = 'edit';
    ctrl.breadcrumb = 'SubMenu.EDIT_BRAND';
  } else {
    ctrl.action = 'add';
    ctrl.breadcrumb = 'SubMenu.ADD_BRAND';
  }

  ctrl.disbledValue = false;
  ctrl.submit = function submit(isValid, data) {
    if (isValid) {
      ctrl.disbledValue = true;

      BrandService.saveBrand(data).then(function (response) {
        console.log('response', response);
        toastr.success('Brand Added Successfully');
        $state.go('app.brands.list', { page: $stateParams.page, items: $stateParams.items });
      }, function (err) {
        console.error('Failed to add/edit brand.', err);
        toastr.error('Unable to process your request');
      });
    } else {
      toastr.error('form is invalid');
    }
  };
}
