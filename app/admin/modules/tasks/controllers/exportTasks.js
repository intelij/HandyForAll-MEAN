angular.module('handyforall.tasks').controller('exportTasksCtrl', exportTasksCtrl);

exportTasksCtrl.$inject = ['TasksExportResolve', 'TasksService', 'toastr', '$state', '$window'];

function exportTasksCtrl(TasksExportResolve, TasksService, toastr, $state, $window) {
    var edttc = this;
    edttc.editTasksData = TasksExportResolve[0];
    $state.go('app.tasks.viewsTasks');
    $window.location.href = TasksExportResolve;
}
