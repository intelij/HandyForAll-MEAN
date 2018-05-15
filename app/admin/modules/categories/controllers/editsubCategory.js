angular.module('handyforall.categories').controller('editsubCategoryCtrl', editsubCategoryCtrl);

editsubCategoryCtrl.$inject = ['categoryEditResolve', 'CategoryService', 'toastr', '$state', '$stateParams', '$location', 'Slug'];

function editsubCategoryCtrl(categoryEditResolve, CategoryService, toastr, $state, $stateParams, $location, Slug) {
  var ctrl = this;

  ctrl.parentPagesList = categoryEditResolve[0];

  ctrl.createTreeView = (level, name) => {
    return `${'&nbsp;&nbsp;'.repeat(level - 1)} ${name}`;
  };

  CategoryService.getSetting()
    .then(function (response) {
      ctrl.editsettingData = response[0].settings.site_url;
    })
    .catch(err => {});

  if ($stateParams.id) {
    ctrl.action = 'edit';
    ctrl.breadcrumb = 'SubMenu.EDIT_SUBCATEGORY';

    ctrl.editCategoryData = categoryEditResolve[1];
  } else {
    ctrl.action = 'add';
    ctrl.breadcrumb = 'SubMenu.ADD_SUBCATEGORY';

    ctrl.editCategoryData = {
      status: "1"
    };
  }
  ctrl.disbledValue = false;
  ctrl.submit = function submit(isValid, data) {
    if (isValid) {
      ctrl.disbledValue = true;
      data.level = !parent.level ? 2 : (parent.level + 1);
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

  ctrl.loadCategoryTree = function (classification) {
    CategoryService.getCategoryTree(!classification ? "" : classification).then(function(response) {
      ctrl.parentPagesList = response;

      ctrl.editCategoryData.parent = "";
    }).catch(function (error) {
      console.error('Failed to load the category tree.', error);
    });
  };

  ctrl.updateClassification = function (parent_id) {
    if (!parent_id)
      return;

    var objParent = ctrl.parentPagesList.find(function(item) {
      return item._id == parent_id;
    });
    ctrl.editCategoryData.classification = objParent.classification;
  };
}
