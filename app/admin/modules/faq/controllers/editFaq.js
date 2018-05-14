angular.module('handyforall.faq').controller('editFaqCtrl', editFaqCtrl);

editFaqCtrl.$inject = ['faqEditResolve', 'FaqService', 'toastr', '$state', '$stateParams'];

function editFaqCtrl(faqEditResolve, FaqService, toastr, $state, $stateParams) {
    var efc = this;

    efc.editFaqData = {};
    efc.editFaqData = faqEditResolve;
    if ($stateParams.id) {
        efc.action = 'edit';
        efc.breadcrumb = 'SubMenu.EDIT_FAQ';
    } else {
        efc.action = 'add';
        efc.breadcrumb = 'SubMenu.ADD_FAQ';
    }
    efc.submit = function submit(isValid) {
        if (isValid) {
            FaqService.save(efc.editFaqData).then(function (response) {
                toastr.success('Faq Added Successfully');
                $state.go('app.faq.list');
            }, function (err) {
                toastr.error('Your credentials are gone' + err[0].msg + '--' + err[0].param);
            });
        } else {
            toastr.error('form is invalid');
        }

    };

}
