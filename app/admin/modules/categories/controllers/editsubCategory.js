angular.module('handyforall.categories').controller('editsubCategoryCtrl', editsubCategoryCtrl);

editsubCategoryCtrl.$inject = ['categoryEditReslove', 'CategoryService', 'toastr', '$state', '$stateParams', '$location', 'Slug'];

function editsubCategoryCtrl(categoryEditReslove, CategoryService, toastr, $state, $stateParams, $location, Slug) {
  var escatc = this;

  escatc.mainPagesList = categoryEditReslove[0];
  escatc.parentPagesList = categoryEditReslove[2];
  escatc.editCategoryData = {};
  escatc.editCategoryData = categoryEditReslove[1];
  console.log('categoryEditReslove', categoryEditReslove);

  escatc.createTreeView = (level, name) => {
    return `${'&nbsp;&nbsp;'.repeat(level)} ${name}`;
  };

  CategoryService.getSetting()
    .then(function (response) {
      escatc.editsettingData = response[0].settings.site_url;
    })
    .catch(err => {});

  if ($stateParams.id) {
    escatc.action = 'edit';
    escatc.breadcrumb = 'SubMenu.EDIT_SUBCATEGORY';
  } else {
    escatc.action = 'add';
    escatc.breadcrumb = 'SubMenu.ADD_SUBCATEGORY';
  }
  escatc.disbledValue = false;
  escatc.submit = function submit(isValid, data) {
    if (isValid) {
      escatc.disbledValue = true;
      // saving parent and level
      const parent = JSON.parse(data.parent);
      data.level = parent.level + 1;
      data.parent = parent._id;
      data.slug = Slug.slugify(data.slug);
      CategoryService.savesubcategory(data).then(function (response) {
        toastr.success('Category Added Successfully');
        $state.go('app.categories.subcategorylist', { page: $stateParams.page, items: $stateParams.items });
      }, function (err) {
        toastr.error('Unable to process your request');
      });
    } else {
      toastr.error('form is invalid');
    }

  };

}
