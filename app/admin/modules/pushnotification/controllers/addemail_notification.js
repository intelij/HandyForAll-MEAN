angular.module('handyforall.pushnotification').controller('NotificationemailCtrl', NotificationemailCtrl);

NotificationemailCtrl.$inject = ['emailEditResolve', 'toastr', 'emailService', '$state', '$stateParams'];

function NotificationemailCtrl(emailEditResolve, toastr, emailService, $state, $stateParams) {
    var nelc = this;
    nelc.templateData = emailEditResolve[0];

    if ($stateParams.id) {
        nelc.action = 'edit';
        nelc.breadcrumb = 'SubMenu.EMAILTEMPLATE_EDIT';
    } else {
        nelc.action = 'add';
        nelc.breadcrumb = 'SubMenu.EMAILTEMPLATE_ADD';
    }

    nelc.submitTemplateEditData = function submitTemplateEditData(isValid, data) {
        if (isValid) {
            emailService.editnotificationTemplate(data).then(function (response) {
                if (response.code == 11000) {
                    toastr.error('Notification Not Added Successfully');
                } else {
                    toastr.success('Notification Updated Successfully');
                    $state.go('app.pushnotifications.templates');
                }
            }, function (err) {
                toastr.error('Your credentials are gone' + err[0].msg);
            });
        }
        else {
            toastr.error('Please fill all mandatory fields');
        }
    };

    /*
    nelc.onchangenotification = function (notificationtype) {
        // console.log('notificationtype',notificationtype);
    };
    */

}
