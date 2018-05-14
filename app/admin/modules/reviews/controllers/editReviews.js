angular.module('handyforall.reviews').controller('editReviewsCtrl', editReviewsCtrl);

editReviewsCtrl.$inject = ['ReviewsEditResolve', 'ReviewsService', 'toastr', '$state'];
function editReviewsCtrl(ReviewsEditResolve, ReviewsService, toastr, $state) {
    var edrc = this;
    edrc.editReviewData = ReviewsEditResolve[0];

    edrc.submit = function submit(isValid) {
        
        if (isValid) {
            ReviewsService.save(edrc.editReviewData).then(function (response) {
                toastr.success('Review Added Successfully');
                $state.go('app.reviews.list');
            }, function (err) {
               // toastr.error(err[0].msg);
            });
        } else {
            toastr.error('form is invalid');
        }
    };
}

