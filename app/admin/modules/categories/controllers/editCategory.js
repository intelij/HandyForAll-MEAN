angular.module('handyforall.categories').controller('editCategoryCtrl', editCategoryCtrl);

editCategoryCtrl.$inject = ['categoryEditResolve', 'CategoryService', 'toastr', '$state', '$stateParams', 'Slug'];

function editCategoryCtrl(categoryEditResolve, CategoryService, toastr, $state, $stateParams, Slug) {
  var ecatc = this;

  ecatc.mainPagesList = categoryEditResolve[0];

  if ($stateParams.id) {
    ecatc.action = 'edit';
    ecatc.breadcrumb = 'SubMenu.EDIT_CATEGORY';
    ecatc.editCategoryData = categoryEditResolve[1];
  } else {
    ecatc.action = 'add';
    ecatc.breadcrumb = 'SubMenu.ADD_CATEGORY';
    ecatc.editCategoryData = {
      status: "1",
      classification: "service"
    };
  }

  CategoryService.getSetting().then(function (response) {
    ecatc.editsettingData = response[0].settings.site_url;
  })
  ecatc.disbledValue = false;
  ecatc.submit = function submit(isValid, data) {
    if (isValid) {
      ecatc.disbledValue = true;
      data.slug = Slug.slugify(data.slug);
      data.level = 1;
      CategoryService.savecategory(data).then(function (response) {
        toastr.success('Category Added Successfully');
        $state.go('app.categories.list', { page: $stateParams.page, items: $stateParams.items });
      }, function (err) {
        toastr.error('Unable to process your request');
      });
    } else {
      toastr.error('form is invalid');
    }

  };

}
