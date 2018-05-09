angular.module('handyforall.settings').controller('generalSettingsCtrl', generalSettingsCtrl);

generalSettingsCtrl.$inject = ['GeneralSettingsServiceResolve', 'TimeZoneSettingsServiceResolve', 'toastr', 'SettingsService'];
function generalSettingsCtrl(GeneralSettingsServiceResolve, TimeZoneSettingsServiceResolve, toastr, SettingsService) {
    var gsc = this;
    gsc.generalSettings = GeneralSettingsServiceResolve[0];
    gsc.generalSettings.timenow = new Date().getTime();
    gsc.timezone = TimeZoneSettingsServiceResolve;
    if(gsc.generalSettings.minaccepttime || gsc.generalSettings.accepttime){
        gsc.generalSettings.accepttime = parseInt(gsc.generalSettings.accepttime)
        gsc.generalSettings.minaccepttime = parseInt(gsc.generalSettings.minaccepttime)
    }


    gsc.time_format = ['hh:mm a', 'HH:mm'];
    gsc.date_format = ['MMMM Do, YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY'];

    if (gsc.time_format.indexOf(gsc.generalSettings.time_format) < 0) {
        gsc.customtime = gsc.generalSettings.time_format;
    }

    if (gsc.date_format.indexOf(gsc.generalSettings.date_format) < 0) {
        gsc.customdate = gsc.generalSettings.date_format;
    }

    gsc.clockFunc = function clockFunc() {
        gsc.generalSettings.timezone = gsc.generalSettings.time_zone;
        gsc.generalSettings.format = gsc.generalSettings.date_format;
    }

    gsc.datekeyFunc = function datekeyFunc() {
        gsc.generalSettings.datekeyformat = gsc.generalSettings.date_format;
    }

    gsc.submitGeneralSettings = function submitGeneralSettings(isValid, data) {
        if (isValid) {
            /*if(gsc.generalSettings.minaccepttime >= gsc.generalSettings.accepttime){
                      toastr.error('Pending task alert time less then job left alert time');
                  }
                  else
                  {*/
            SettingsService.editGeneralSettings(gsc.generalSettings).then(function (response) {
                if (response.code == 11000) {
                    toastr.error('Setting Not Added Successfully');
                } else {
                    toastr.success('General Settings Saved Successfully');
                }
            }, function (err) {
                toastr.error('Your credentials are gone' + err.data[0].msg + '--' + err.data[0].param);
            });

        }
        else {
            toastr.error('form is invalid');
        }
    };

    console.log("GeneralSettingsServiceResolve[0]", GeneralSettingsServiceResolve[0]);

    //wallet setting
    gsc.walletStatus = GeneralSettingsServiceResolve[0].wallet && GeneralSettingsServiceResolve[0].wallet.status;

    gsc.walletStatusChange = function (value) {
        gsc.generalSettings.wallet = gsc.generalSettings.wallet || {};

        if (!value) {
            gsc.generalSettings.wallet.status = 0;
        } else {
            gsc.generalSettings.wallet.status = 1;
        }
    };

    //cash Setting
    gsc.cashStatus = GeneralSettingsServiceResolve[0].pay_by_cash && GeneralSettingsServiceResolve[0].pay_by_cash.status;

    gsc.cashStatusChange = function (value) {
        gsc.generalSettings.pay_by_cash = gsc.generalSettings.pay_by_cash || {};

        if (!value) {
            gsc.generalSettings.pay_by_cash.status = 0;
        } else {
            gsc.generalSettings.pay_by_cash.status = 1;
        }
    };

    //Referral Setting
    gsc.referralStatus = GeneralSettingsServiceResolve[0].referral && GeneralSettingsServiceResolve[0].referral.status;

    gsc.referralStatusChange = function (value) {
        gsc.generalSettings.referral = gsc.generalSettings.referral || {};

        if (!value) {
            gsc.generalSettings.referral.status = 0;
        } else {
            gsc.generalSettings.referral.status = 1;
        }
    };

    gsc.categorycomStatus = GeneralSettingsServiceResolve[0].categorycommission && GeneralSettingsServiceResolve[0].categorycommission.status;

    gsc.categoryStatusChange = function (value) {
        gsc.generalSettings.categorycommission = gsc.generalSettings.categorycommission || {};

        if (!value) {
            gsc.generalSettings.categorycommission.status = 0;
        } else {
            gsc.generalSettings.categorycommission.status = 1;
        }
    };


    gsc.placechange = function () {

        gsc.place = this.getPlace();
        //gsc.tasker.location = {};
        // var locationalng = gsc.place.geometry.location.lng();
        // var locationalat = gsc.place.geometry.location.lat();

        var locationa = gsc.place;

        gsc.validlocation = gsc.place ? true : false;

        gsc.generalSettings.location = gsc.place.formatted_address;

        // var dummy = locationa.address_components.filter(function (value) {
        //     return value.types[0] == "sublocality_level_1";
        // }).map(function (data) {
        //     return data;
        // });
    };
}
