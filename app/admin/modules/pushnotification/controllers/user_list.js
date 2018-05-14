angular.module('handyforall.pushnotification').controller('UserListCtrl', UserListCtrl);
UserListCtrl.$inject = ['UsernotificationServiceResolve', 'UsernotificationService', 'emailEditResolve', 'emailService', 'messageEditResolve', '$window', '$modal', '$scope','$rootScope'];

function UserListCtrl(UsernotificationServiceResolve, UsernotificationService, emailEditResolve, emailService, messageEditResolve, $window, $modal, $scope, $rootScope) {

    var ulc = this;
    ulc.permission = $scope.privileges.filter(function (menu) {
        return (menu.alias === "notification");
    }).map(function (menu) {
        return menu.status;
    })[0];
    var layout = [
        {
            name: $rootScope.user,
            variable: 'email',
            template: '{{content.email}}',
            sort: 1
        }
    ];


    var ulc = this;
    ulc.table = {};
    ulc.table.name = 'User';
    ulc.table.layout = layout;
    ulc.table.module = 'earnings';
    ulc.table.maildata = emailEditResolve[0];
    ulc.table.messagedata = messageEditResolve[0];
    ulc.table.data = UsernotificationServiceResolve[0];
    ulc.table.count = UsernotificationServiceResolve[1] || 0;
    ulc.table.delete = {
        'permission': ulc.permission, service: '/newsletter/subscriber/delete', getData: function (currentPage, itemsPerPage, sort, status, search) {
            var skip = (parseInt(currentPage) - 1) * itemsPerPage;
            UsernotificationService.getUserList(itemsPerPage, skip, sort, status, search).then(function (respo) {
                ulc.table.data = respo[0];
                ulc.table.count = respo[1];
            });
        }
    };


}
