//'use strict';

// Angular Module's Initializations
angular.module('Authentication', []);
angular.module('handyforall.contactus', []);
angular.module('handyforall.page', []);
angular.module('handyforall.faq', []);
angular.module('handyforall.becometasker', []);
angular.module('handyforall.category', []);
angular.module('handyforall.task', []);
angular.module('handyforall.accounts', []);
angular.module('handyforall.messages', []);
angular.module('handyforall.carddetail', []);
angular.module('handyforall.forgotpassword', []);
angular.module('handyforall.notifications', []);

//Main module
angular.module('handyforall.site', ['Authentication',
  'ngAnimate',
  'ngSanitize',
  'ngCookies',
  'ui.calendar',
  'ui.validate',
  'ui.bootstrap',
  'ui.router',
  'toastr',
  'pascalprecht.translate',
  'ngFileUpload',
  'ngMap',
  'ngImgCrop',
  'slugifier',
  'checklist-model',
  'ngIntlTelInput',
  'hSweetAlert',
  'ui.select',
  'ngMeta',
  'ui.slider',
  'afkl.lazyImage',
  'handyforall.contactus',
  'handyforall.faq',
  'handyforall.becometasker',
  'handyforall.category',
  'handyforall.task',
  'handyforall.page',
  'handyforall.accounts',
  'handyforall.messages',
  'handyforall.carddetail',
  'handyforall.notifications',
  'handyforall.forgotpassword',
  'slickCarousel'
]).run(['$rootScope', '$state', '$location', '$http', '$stateParams', 'AuthenticationService', 'toastr', 'MainService', '$window', 'socket', 'ngMeta', '$cookieStore', 'AppService', function ($rootScope, $state, $location, $http, $stateParams, AuthenticationService, toastr, MainService, $window, socket, ngMeta, $cookieStore, AppService) {
  ngMeta.init();
  $rootScope.$state = $state;
  $rootScope.siteglobals = $cookieStore.get('siteglobals') || {};

  $rootScope.opensidenav = function () {
    $(".sidenav-wrap").css('right', '0');
    $("body").addClass("sidenavoverlay");
    $(".sidenav-wrap").addClass("active");
    $(".navbar-toggle").addClass("collapsed");
  };

  $rootScope.closesidenav = function () {
    $(".sidenav-wrap").css('right', '-150%');
    $("body").removeClass("sidenavoverlay");
    $(".sidenav-wrap").removeClass("active");
    $(".navbar-toggle").removeClass("collapsed");
  };

  $(document).on("click", function (e) {
    if ($('.navbar-toggle:not(.collapsed)').is(e.target) || $('.navbar-toggle:not(.collapsed)').has(e.target).length !== 0) {
      $rootScope.opensidenav();
    } else if (!$('.sidenav-wrap').is(e.target) || !$('.sidenav-wrap').has(e.target)) {
      $rootScope.closesidenav();
    }
  });

  if ($rootScope.siteglobals.currentUser) {
    $http.defaults.headers.common['Authorization'] = $rootScope.siteglobals.currentUser.authdata;
    MainService.getCurrentUsers($rootScope.siteglobals.currentUser.username)
      .then(function (result) {
        if (typeof $rootScope.currentUser === 'wrong') {
          $window.location.href = '/login';
        } else {
          MainService.setCurrentUserValue(result[0]);
        }
      }, function (error) {
        toastr.error('Server Down !');
      });
  } else {
    AuthenticationService.checkLogin(function (response) {
      if (response) {
        AuthenticationService.SetCredentials(response.user, response.user_id, response.token, response.user_type, response.tasker_status);
        $cookieStore.remove('TaskerData');
        $rootScope.$emit('notification', { user: response.user_id, type: response.user_type });
        $rootScope.$emit('webNotification', { user: response.user_id, type: response.user_type });

        if ($rootScope.currentState) {
          $state.go($rootScope.currentState.name, $rootScope.currentparams, { reload: true });
        } else {
          $state.go('landing', {}, { reload: true });
        }
      }
    });
  }

  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    console.log('state change', toState);
    var userdata = AuthenticationService.GetCredentials();

    if (toState.name === "hirestep1" || toState.name === "chat") {
      if (!$rootScope.siteglobals.currentUser) {
        $state.transitionTo("login");
        event.preventDefault();
      }
    }

    if (toState.authenticate && !AuthenticationService.isAuthenticated()) {
      $state.transitionTo("login");
      event.preventDefault();
    }

    if (toState.registerauthenticate && !((toParams.type === 'user' || toParams.type === 'tasker') && !AuthenticationService.isAuthenticated())) {
      if (AuthenticationService.isAuthenticated()) {
        $state.transitionTo("landing");
      } else {
        $state.transitionTo("signup");
      }
      event.preventDefault();
    }

    if (toState.taskerauthenticate && AuthenticationService.isTaskerAuthenticated()) {
      $state.transitionTo("landing");
      event.preventDefault();
    }

    if (toState.loginauthenticate && AuthenticationService.isAuthenticated()) {
      $state.transitionTo("landing");
      event.preventDefault();
    }
    $rootScope.currentStateHTML = toState; // For Designs
    // Store state history
    if (toState.name !== 'login' && toState.name !== 'social' && toState.name !== 'register' && toState.name !== 'userlogin' && toState.name !== 'taskerlogin' && toState.name !== 'hirestep1' && toState.name !== 'signup') {
      $rootScope.PreviousState = fromState;
      $rootScope.Previousparams = fromParams;
      $rootScope.currentState = toState;
      $rootScope.currentparams = toParams;

      // Clear selected category
      if ($rootScope.PreviousState.name !== 'userlogin' && $rootScope.currentState.name === 'landing') {
        $rootScope.selectedCategory = {};
      }
    }

    if (toState.name === 'landing') {
      if (AppService.checkMobile()) {
        // ref: https://stackoverflow.com/questions/35878977/redirection-on-statechangestart-with-angularjs-ui-router
        event.preventDefault();
        $state.go('mobile');
      }
    }
  });
}])
  .factory('myHttpInterceptor', function ($q, $location, $rootScope, $cookieStore) {
    var timestampMarker = {
      response: function (response) {
        $rootScope.imgSrc = false;
        if (response.status === 404) {
          $location.path('/404');
        }
        return response;
      },
      'responseError': function (rejection) {
        if (rejection.status === 401) {
          $cookieStore.remove('siteglobals')
          $location.path('/login');
        }
        return $q.reject(rejection);
      },
      request: function (config) {
        $rootScope.imgSrc = "/app/site/public/images/loader.gif";
        return config || $q.when(config);
      }
    };
    return timestampMarker;
  })
  .config(function (ngMetaProvider, ngIntlTelInputProvider, toastrConfig) {
    ngMetaProvider.useTitleSuffix(true);
    ngIntlTelInputProvider.set({ defaultCountry: '' });
    angular.extend(toastrConfig, {
      autoDismiss: true,
      maxOpened: 1,
      tapToDismiss: true,
      closeButton: true,
      closeHtml: '<i class="fa fa-times"></i>'
    });
  })
  .config(['slickCarouselConfig', function (slickCarouselConfig) {
    slickCarouselConfig.dots = true;
    slickCarouselConfig.autoplay = false;
  }])
  .config(['$translateProvider', '$urlMatcherFactoryProvider', function ($translateProvider, $urlMatcherFactoryProvider) {
    $translateProvider.useStaticFilesLoader({
      prefix: '/uploads/languages/',
      suffix: '.json'
    });
    $translateProvider.useLocalStorage();
    $translateProvider.preferredLanguage('en');
    $translateProvider.useSanitizeValueStrategy(null);
    $translateProvider.fallbackLanguage('en');
    $urlMatcherFactoryProvider.caseInsensitive(false);
    $urlMatcherFactoryProvider.strictMode(true);
  }])
  .factory('PreviousState', ['$rootScope', '$state',
    function ($rootScope, $state) {
      var lastHref = "/",
        lastStateName = "landing",
        lastParams = {},
        event = "";
      $rootScope.$on("$stateChangeSuccess", function (events, toState, toParams, fromState, fromParams) {
        event = events;
        lastStateName = fromState.name;
        lastParams = fromParams;
        lastHref = $state.href(lastStateName, lastParams)
      });
      return {
        getLastHref: function () { return lastHref; },
        goToLastState: function () {
          return $state.go(lastStateName, lastParams);
        }
      }
    }])
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/404');
    $httpProvider.interceptors.push('myHttpInterceptor');
    $stateProvider
      .state('landing', {
        url: '/',
        views: {
          "content": {
            templateUrl: "app/site/modules/common/views/landing.html",
            controller: "MainCtrl",
            controllerAs: 'MAC'
          },

        },
        data: {
          meta: {
            'title': 'Home'
          }
        },
        resolve: {
          MainserviceResolve: function (MainService) {
            return MainService.landingdata();
          }
        }
      })


      .state('mobile', {
        url: '/mobile',
        views: {
          "content": {
            templateUrl: "app/site/modules/common/views/mobile-home.html",
            controller: "MainCtrl",
            controllerAs: 'MAC'
          }
        },
        resolve: {
          MainserviceResolve: function (MainService) {
            return MainService.landingdata();
          }
        }
      })

      .state('morecategories', {
        url: '/morecategories/:slug',
        views: {
          "content": {
            templateUrl: "app/site/modules/common/views/morecategories.html",
            controller: "MorecategoryCtrl",
            controllerAs: 'MOC'
          }
        },
        resolve: {
          MorecategoryserviceResolve: function (MainService, $stateParams) {
            return MainService.getmorecategory($stateParams.slug);
          }
        }
      })
      .state('category', {
        url: '/category/:slug',
        views: {
          "content": {
            templateUrl: "/app/site/modules/category/views/category.html",
            controller: "categoryCtrl",
            controllerAs: 'CAC'
          }
        },
        data: {
          meta: {
            'title': 'Category'
          }
        },
        resolve: {
          CategoryserviceResolve: function (CategoryService, $stateParams) {
            return CategoryService.getcategory($stateParams.slug, 0, 6);
          }
        }
      })
      .state('forgotpwd', {
        url: '/forgot_passwrd',
        controller: "pwdloginCtrl",
        controllerAs: 'PWC',
        loginauthenticate: true,
        views: {
          specialview: {
            templateUrl: "app/site/modules/common/views/forgetpassword.html",
            controller: "pwdloginCtrl",
            controllerAs: 'PWC'
          },
          commonview: { template: "<div></div>" }
        },
        data: {
          meta: {
            'title': 'Forgot Your Password'
          }
        },
        resolve: {
          ForgotpasswordServiceResolve: function (ForgotpasswordService) {
            return true;
          }
        }
      })
      .state('forgotpwduser', {
        url: '/forgot_passwrduser',
        controller: "pwduserCtrl",
        controllerAs: 'PWUC',
        loginauthenticate: true,
        views: {
          specialview: {
            templateUrl: "app/site/modules/common/views/forgetpassworduser.html",
            controller: "pwduserCtrl",
            controllerAs: 'PWUC'
          },
          commonview: { template: "<div></div>" }
        },
        data: {
          meta: {
            'title': 'Forgot Your Password'
          }
        },
        resolve: {
          ForgotpwduserServiceResolve: function (ForgotpwduserService) {
            return true;
          }
        }
      })
      .state('signupotp', {
        url: '/userverfication/:id',
        views: {
          commonview: {
            templateUrl: "app/site/modules/common/views/OTPSignup_model.html",
            controller: "otploginCtrl",
            controllerAs: 'OTPC'
          }
        }
      })
      /*.state('accountRecovery', {
        url: '/accountRecovery/:id',
        views: {
          commonview: {
                templateUrl: "app/site/modules/common/views/accountRecovery.html",
                controller: "otploginCtrl",
                controllerAs: 'OTPC'
            }
        }
    })*/
      .state('forgotpwdusermail', {
        url: '/forgotpwdusermail/:userid/:resetid',
        controller: "pwdmailCtrl",
        controllerAs: 'PWMC',
        loginauthenticate: true,
        views: {
          specialview: {
            templateUrl: "app/site/modules/common/views/forgetpwdemaillink.html",
            controller: "pwdmailCtrl",
            controllerAs: 'PWMC'
          },
          commonview: { template: "<div></div>" }
        },
        data: {
          meta: {
            'title': 'Forgot Your Password'
          }
        }

      })
      .state('emergency', {
        url: '/emergency/:userid',
        controller: "emergencyCtrl",
        controllerAs: 'EMRG',
        loginauthenticate: true,
        views: {
          specialview: {
            templateUrl: "app/site/modules/common/views/emergencycontact.html",
            controller: "emergencyCtrl",
            controllerAs: 'EMRG'
          },
          commonview: { template: "<div></div>" }
        },
        data: {
          meta: {
            'title': 'Emergency Contact'
          }
        }

      })
      .state('forgotpwdtaskermail', {
        url: '/forgotpwdtaskermail/:userid/:resetid',
        controller: "pwdmailtskrCtrl",
        controllerAs: 'PWMTC',
        loginauthenticate: true,
        views: {
          specialview: {
            templateUrl: "app/site/modules/common/views/forgetpwdemaillinktasker.html",
            controller: "pwdmailtskrCtrl",
            controllerAs: 'PWMTC'
          },
          commonview: { template: "<div></div>" }
        },
        data: {
          meta: {
            'title': 'Forgot Your Password'
          }
        }
      })
      .state('page', {
        url: '/page/:slug',
        views: {
          "content": {
            templateUrl: "/app/site/modules/pages/views/pages.html",
            controller: "pagesCtrl",
            controllerAs: 'PAC'
          }
        },
        data: {
          meta: {
            'title': 'Page'
          }
        },
        resolve: {

          PagesserviceResolve: function (PageService, $stateParams, $rootScope, $cookieStore, MainService) {
            var languageUpdateValue = $cookieStore.get('language');
            if ($rootScope.language === undefined) {
              $rootScope.language = languageUpdateValue;
            }
            return PageService.getpage($stateParams, $rootScope.language);
          }
        }
      })
      .state('login', {
        url: '/login',
        loginauthenticate: true,
        views: {
          specialview: {
            templateUrl: "app/site/modules/common/views/login.html",
          },
          commonview: {
            template: "<div></div>"
          }
        },
        data: {
          meta: {
            'title': 'Login'
          }
        }

      })
      .state('userlogin', {
        url: '/user_login',
        controller: "userloginCtrl",
        controllerAs: 'ULGC',
        loginauthenticate: true,
        views: {
          specialview: {
            templateUrl: "app/site/modules/common/views/user-login.html",
            controller: "userloginCtrl",
            controllerAs: 'ULGC'
          },
          commonview: {
            template: "<div></div>"
          }
        },
        data: {
          meta: {
            'title': 'User Login'
          }
        }
      })
      .state('taskerlogin', {
        url: '/tasker_login',
        controller: "taskerloginCtrl",
        controllerAs: 'TLGC',
        loginauthenticate: true,
        views: {
          specialview: {
            templateUrl: "app/site/modules/common/views/tasker-login.html",
            controller: "taskerloginCtrl",
            controllerAs: 'TLGC'
          },
          commonview: {
            template: "<div></div>"
          }
        },
        data: {
          meta: {
            'title': 'Tasker Login'
          }
        }
      })
      .state('become_tasker', {
        url: '/become_tasker',
        views: {
          "content": {
            templateUrl: "app/site/modules/common/views/taker.html"
          }
        },
        data: {
          meta: {
            'title': 'Become Tasker'
          }
        }
      })
      .state('contact_us', {
        url: '/contact_us',
        views: {
          "content": {
            templateUrl: "app/site/modules/common/views/contactus.html",
            controller: "contactCtrl",
            controllerAs: 'CTTC'
          },
        },
        data: {
          meta: {
            'title': 'Contact Us'
          }
        }
      })
      .state('faq', {
        url: '/faq',
        views: {
          "content": {
            templateUrl: "/app/site/modules/common/views/faq.html",
            controller: "faqCtrl",
            controllerAs: 'FAC'
          }
        },
        data: {
          meta: {
            'title': 'FAQ'
          }
        },
        resolve: {
          FaqserviceResolve: function (FaqService) {
            return FaqService.getfaq();

          }
        }
      })
      .state('registertasker', {
        url: '/register-tasker',
        views: {
          "content": {
            template: '<div ui-view="registertasker"></div>',
            controller: "registerTaskerCtrl",
            controllerAs: 'RTTC'
          }
        },
        data: {
          meta: {
            'title': 'Tasker SignUp'
          }
        }
      })
      .state('signup', {
        url: '/signup',
        loginauthenticate: true,
        views: {
          specialview: {
            templateUrl: "app/site/modules/common/views/signup.html"
          },
          commonview: { template: "<div></div>" }
        },
        data: {
          meta: {
            'title': 'SignUp'
          }
        }
      })
      .state('social', {
        url: '/social/:type',
        registerauthenticate: true,
        views: {
          specialview: {
            templateUrl: "app/site/modules/common/views/social.html",
            controller: "userloginCtrl",
            controllerAs: 'ULGC'
          },
          commonview: { template: "<div></div>" }
        },
        data: {
          meta: {
            'title': 'SignUp'
          }
        }
      })
      .state('messages', {
        url: '/messages',
        authenticate: true,
        views: {
          "content": {
            templateUrl: "app/site/modules/messages/views/messages.html",
            controller: "messagesCtrl",
            controllerAs: 'MSG'
          }
        },
        data: {
          meta: {
            'title': 'Messages'
          }
        },
        resolve: {
          MessageserviceResolve: function (AuthenticationService, MessageService) {
            var user = AuthenticationService.GetCredentials();
            return MessageService.getMessage(user.currentUser.user_id, user.currentUser.user_type, 0, 3);
          },
          CurrentuserResolve: function (AuthenticationService) {
            var user = AuthenticationService.GetCredentials();
            return user.currentUser;
          }
        }
      })
      .state('notifications', {
        url: '/notifications',
        authenticate: true,
        views: {
          "content": {
            templateUrl: "app/site/modules/notifications/views/notifications.html",
            controller: "notificationCtrl",
            controllerAs: 'NC'
          }
        },
        data: {
          meta: {
            'title': 'Notifications'
          }
        },
        resolve: {
          NotificationsResolve: function (AuthenticationService, NotificationService) {
            var user = AuthenticationService.GetCredentials();
            var data = {};
            data.user = user.currentUser.user_id;
            data.type = user.currentUser.user_type;
            return NotificationService.getMessage(data, 0, 3);
          }
        }
      })
      .state('404', {
        url: '/404',
        views: {
          specialview: {
            templateUrl: "app/site/modules/common/views/404.html"
          },
          commonview: { template: "<div></div>" }
        },
        data: {
          meta: {
            'title': 'PageNotFound'
          }
        }
      })


      .state('chat', {
        url: '/chat/:task/:user/:tasker',
        views: {
          "content": {
            templateUrl: "app/site/modules/messages/views/chat.html",
            controller: "chatCtrl",
            controllerAs: 'CHAT'
          }
        },
        data: {
          meta: {
            'title': 'Messenger'
          }
        },
        resolve: {
          ChatServiceResolve: function (AuthenticationService, MessageService, $stateParams, socket) {
            var user = AuthenticationService.GetCredentials();
            var data = {};
            data.task = $stateParams.task;
            data.user = $stateParams.user;
            data.tasker = $stateParams.tasker;
            data.type = user.currentUser.user_type;
            return MessageService.chatHistory(data);
          },
          TaskServiceResolve: function (TaskService, $stateParams) {
            return TaskService.getTaskDetailsbyid($stateParams.task);
          },
          TaskProfileResolve: function (TaskService, $stateParams) {
            return TaskService.taskprofileinfo({id: $stateParams.tasker});
          },
          CurrentuserResolve: function (AuthenticationService) {
            var user = AuthenticationService.GetCredentials();
            return user.currentUser;
          }
        }
      })

      .state('register', {
        url: '/register/:type',
        registerauthenticate: true,
        views: {
          "specialview": {
            templateUrl: "app/site/modules/common/views/user-register.html",
            controller: "registerCtrl",
            controllerAs: 'RGC'
          },
          "commonview": { template: "<div></div>" }
        },
        data: {
          meta: {
            'title': 'User SignUp'
          }
        }
      })
      .state('becometasker', {
        url: '/become-tasker',
        views: {
          "content": {
            template: '<div ui-view="becometasker"></div>',
            controller: "becomeTaskerCtrl",
            controllerAs: 'BTC'
          }

        },
        data: {
          meta: {
            'title': 'Tasker SignUp'
          }
        },
        resolve: {
          CategoryserviceResolve: function (CategoryService) {
            return CategoryService.getcategoryList();
          }
        }
      })

      .state('becometasker.step0', {
        url: '/basicinfo',
        views: {
          "becometasker": {
            templateUrl: "app/site/modules/tasker/views/basicinfo-step0.html"
          }
        },
        data: {
          meta: {
            'title': 'Tasker SignUp'
          }
        }
      })
      .state('becometasker.step1', {
        url: '/basicinfo',
        taskerauthenticate: true,
        views: {
          "becometasker": {
            templateUrl: "app/site/modules/tasker/views/addressInfo-step1.html"
          }
        },
        data: {
          meta: {
            'title': 'Tasker SignUp'
          }
        }
      })
      .state('becometasker.step3', {
        url: '/basicinfo',
        taskerauthenticate: true,
        views: {
          "becometasker": {
            templateUrl: "app/site/modules/tasker/views/availabiltyInfo-step3.html"
          }
        },
        data: {
          meta: {
            'title': 'Tasker SignUp'
          }
        }
      })
      .state('becometasker.step7', {
        url: '/basicinfo',
        taskerauthenticate: true,
        views: {
          "becometasker": {
            templateUrl: "app/site/modules/tasker/views/imageInfo-step7.html"
          }
        },
        data: {
          meta: {
            'title': 'Tasker SignUp'
          }
        }
      })
      .state('becometasker.step8', {
        url: '/basicinfo',
        taskerauthenticate: true,
        views: {
          "becometasker": {
            templateUrl: "app/site/modules/tasker/views/hoursInfo-step8.html"
          }
        },
        data: {
          meta: {
            'title': 'Tasker SignUp'
          }
        }
      })
      .state('becometasker.success', {
        url: '/basicinfo',
        views: {
          "becometasker": {
            templateUrl: "app/site/modules/tasker/views/post_step8.html"
          }
        },
        data: {
          meta: {
            'title': 'Tasker SignUp'
          }
        }
      })
      .state('hirestep1', {
        url: '/hirestep1/:slug',
        views: {
          content: {
            templateUrl: "app/site/modules/task-step/views/hire-step1.html",
            controller: "taskCtrl",
            controllerAs: 'TAC'
          }
        },
        data: {
          meta: {
            'title': 'Task'
          }
        },
        resolve: {
          TaskserviceResolve: function (TaskService, $stateParams) {
            return TaskService.taskbaseinfo($stateParams.slug);
          },
          CurrentUserResolve: function (MainService, AuthenticationService) {
            var user = AuthenticationService.GetCredentials();

            return MainService.getCurrentUsers(user.currentUser.username, user.currentUser.user_type);
          }
        }
      })
      .state('search', {
        //url: '/search/:slug?&task/date',
        url: '/search/:slug?&task/date/minprice/maxprice/kmmaxvalue/kmminvalue/time/day/hour/current_page',
        views: {
          content: {
            templateUrl: "app/site/modules/task-step/views/search-results.html",
            controller: "taskFilterCtrl",
            controllerAs: 'TFC'
          }
        },
        data: {
          meta: {
            'title': 'Task'
          }
        },
        resolve: {
          SearchResolve: function (TaskService, $stateParams, AuthenticationService) {
            var user = AuthenticationService.GetCredentials();

            if ($stateParams.task) {
              return TaskService.searchTasker($stateParams.task, user.currentUser.user_type);
            } else {
              return {};
            }
          },
          TaskserviceResolve: function (TaskService, $stateParams) {
            return TaskService.taskbaseinfo($stateParams.slug);
          },
          /*CurrentUserTaskserviceResolve: function (MainService, AuthenticationService) {
            var user = AuthenticationService.GetCredentials();
            if (user.currentUser.username) {
              return MainService.getCurrentUsers(user.currentUser.username, user.currentUser.user_type);
            }
          },*/
          TaskServiceNewResolve: function (TaskService, $stateParams) {
            if ($stateParams.task) {
              return TaskService.getTaskDetailsbyid($stateParams.task);
            } else {
              return {};
            }
          },
          TaskerCountResolve: function (TaskService, $stateParams) {
            if ($stateParams.task) {
              return TaskService.taskerCount($stateParams.task, 0, 5);
            } else {
              return {};
            }
          },
          BrandListResolve: function (accountService) {
            return accountService.getBrandList();
          }
        }
      })
      .state('account', {
        url: '/account',
        authenticate: true,
        views: {
          "content": {
            templateUrl: "app/site/modules/accounts/views/accounts.html",
            controller: "accountsCtrl",
            controllerAs: 'ACC'
          }
        },
        data: {
          meta: {
            'title': 'My Account'
          }
        },
        resolve: {
          accountServiceResolve: function (AuthenticationService, MainService) {
            var user = AuthenticationService.GetCredentials();
            if (user.currentUser.username) {
              if (user.currentUser.user_type === 'user') {
                return MainService.getCurrentUsers(user.currentUser.username);
              } else if (user.currentUser.user_type === 'tasker') {
                return MainService.getCurrentTaskers(user.currentUser.username);
              }
            }
          }
        }
      })
      .state('notifyaccount', {
        url: '/notifyaccount/:status',
        views: {
          "content": {
            templateUrl: "app/site/modules/accounts/views/accounts.html",
            controller: "accountsCtrl",
            controllerAs: 'ACC'
          }
        },
        data: {
          meta: {
            'title': 'My Account'
          }
        },
        resolve: {
          accountServiceResolve: function (AuthenticationService, MainService, $stateParams) {
            var user = AuthenticationService.GetCredentials();
            if (user.currentUser.username) {
              if (user.currentUser.user_type === 'user') {
                return MainService.getCurrentUsers(user.currentUser.username);
              } else if (user.currentUser.user_type === 'tasker') {
                return MainService.getCurrentTaskers(user.currentUser.username);
              }
            }
          }
        }
      })
      .state('carddetail', {
        url: '/carddetail/:slug',
        authenticate: true,
        views: {
          "content": {
            templateUrl: "app/site/modules/carddetail/views/carddetail.html",
            controller: "carddetailCtrl",
            controllerAs: 'CDC'
          }
        },
        data: {
          meta: {
            'title': 'Payment'
          }
        },
        resolve: {
          CarddetailResolve: function (CarddetailService, $stateParams) {
            return CarddetailService.gettaskbyid($stateParams.slug);
          },
          CurrentUserResolve: function (MainService, AuthenticationService) {
            var user = AuthenticationService.GetCredentials();
            if (user.currentUser.username) {
              return MainService.getCurrentUsers(user.currentUser.username);
            }
          }
        }
      })
      .state('paymentsuccess', {
        url: '/payment-success',
        authenticate: true,
        views: {
          "content": {
            templateUrl: "app/site/modules/carddetail/views/carddetailsuccess.html"
          }
        },
        data: {
          meta: {
            'title': 'Payment'
          }
        }
      })
      .state('walletsuccess', {
        url: '/wallet-success',
        authenticate: true,
        views: {
          "content": {
            templateUrl: "app/site/modules/carddetail/views/walletsuccess.html"
          }
        },
        data: {
          meta: {
            'title': 'Payment'
          }
        }
      })
      .state('paymentfailed', {
        url: '/payment-failed/:task',
        authenticate: true,
        views: {
          "content": {
            templateUrl: "app/site/modules/carddetail/views/carddetailfailed.html",
            controller: "paypalfaileddetailCtrl",
            controllerAs: 'PPDC'
          }
        },
        data: {
          meta: {
            'title': 'Payment'
          }
        },
        resolve: {
          paypaltaskid: function ($stateParams) {
            return $stateParams;
          }
        }
      })
      .state('paymentfaileduser', {
        url: '/walletpayment-failed',
        authenticate: true,
        views: {
          "content": {
            templateUrl: "app/site/modules/carddetail/views/carddetailfaileduser.html",
            controller: "paypalfaileddetailCtrl",
            controllerAs: 'PPDC'
          }
        },
        data: {
          meta: {
            'title': 'Payment'
          }
        },
        resolve: {
          paypaltaskid: function ($stateParams) {
            return $stateParams;
          }
        }
      })

      .state('logout', {
        url: '/logout',
        views: {
          "content": {
            controller: "LogoutController",
            controllerAs: 'DBC'
          }
        },
        data: {
          meta: {
            'title': 'Logout'
          }
        }
      })

      .state('Deactivate', {
        //url: '/logout',
        views: {
          "content": {
            controller: "DeactivateController",
            controllerAs: 'DBC'
          }
        },
        data: {
          meta: {
            'title': 'Logout'
          }
        }
      })
      .state('taskerProfile', {
        url: '/tasker/:taskerId/:sub_id?slug/date/minprice/maxprice/kmmaxvalue/kmminvalue/time/task/hour/day/current_page',
        views: {
          content: {
            templateUrl: "app/site/modules/task-step/views/tasker_profile.html",
            controller: "taskProfileCtrl",
            controllerAs: 'TPC'
          }
        },
        data: {
          meta: {
            'title': 'Tasker Details'
          }
        },
        resolve: {
          TaskProfileResolve: function (TaskService, $stateParams) {
            return TaskService.taskprofileinfo({id: $stateParams.taskerId});
          }
        }
      })
  }])
  .controller('rootCtrl', function ($window, $scope, $rootScope, $state, AuthenticationService, MainService, socket, notify, $translate, toastr, $cookieStore, ngMeta, $sce, $interval, accountService) {
    var rc = this;

    $rootScope.$state = $state;
    MainService.getMainData().then(function (results) {
      rc.title = results.response[0].settings.site_title;
      rc.getsetting = results.response[0].settings;
      $rootScope.settings = results.response[0].settings;
      $rootScope.siteurl = results.response[0].settings.site_url;
      $rootScope.tasker = results.response[0].tasker;
      $rootScope.user = results.response[0].user;
      $scope.cashOption = rc.getsetting.pay_by_cash ? rc.getsetting.pay_by_cash.status : "";
      rc.favicon = results.response[0].settings.site_url + results.response[0].settings.favicon;

      ngMeta.setDefaultTag('title', results.response[1].seo.seo_title);
      ngMeta.setDefaultTag('titleSuffix', ' | ' + rc.title);
      ngMeta.setDefaultTag('keyword', results.response[1].seo.focus_keyword);
      ngMeta.setDefaultTag('description', results.response[1].seo.meta_description);

      if (results.response[1].seo.webmaster)
        $window.ga('create', results.response[1].seo.webmaster.google_analytics, 'auto');

      rc.socialNetworks = results.response[2].social;
      rc.language = results.response[3].languages;
      rc.widgets = results.response[4].widgets;
      rc.signupimg = results.response[5].images[0];
      rc.loginimage = results.response[5].images[3];
      rc.bgimage = results.response[5].images[1];
      rc.tpimg = results.response[5].images[4];
      rc.Currency = results.response[6].currencies;
      rc.sociallinks = results.response[7].social;
      rc.pages = results.response[8].pages;
      rc.pagescount = results.response[8].pages.length;

      rc.social = [];
      rc.appstore = [];

      if (rc.sociallinks[0].settings.link) {
        rc.sociallinks[0].settings.link.filter(function (data) {
          if (data.status === 1) {
            rc.social.push(data);
          }
        });
      }

      if (rc.sociallinks[0].settings.mobileapp) {
        rc.sociallinks[0].settings.mobileapp.filter(function (data) {
          if (data.status === 1) {
            rc.appstore.push(data);
          }
        });
      }

      rc.copyrightYear = new Date();

      $scope.date = {
        'format': results.response[0].settings.date_format + ' ' + results.response[0].settings.time_format,
        'timezone': results.response[0].settings.time_zone,
        'date_format': results.response[0].settings.time_format,
        'time_format': results.response[0].settings.time_format
      };
    });

    MainService.getDefaultCurrency().then(function (response) {
      if ($cookieStore.get('Currency')) {
        rc.DefaultCurrency = $cookieStore.get('Currency');
        $scope.DefaultCurrency = $cookieStore.get('Currency');
      }
      else {
        rc.DefaultCurrency = response;
        $scope.DefaultCurrency = response;
      }
    });

    rc.setDefaultCurrency = function setDefaultCurrency(data) {
      MainService.getDefaultCurrency(data).then(function (response) {
        rc.DefaultCurrency = response;
        $scope.DefaultCurrency = response;
        $cookieStore.put('Currency', response);
        document.body.scrollTop = document.documentElement.scrollTop = 0;

      });
    };
    rc.otpverifications = function otpverifications(data) {
      if (!data) {
        $translate('ENTER USER NAME').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error) });
      } else {
        MainService.otpverifications(data).then(function (response) {
          rc.userdata = response;
          if (data === rc.userdata.username) {
            $state.go('signupotp', { 'id': rc.userdata._id }, { reload: false });
          } else {
            $translate('USERNAME ALREADY ACTIVATED').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error) });
          }
        }, function (err) {
          $translate(err.message).then(function (headline) { toastr.error(headline); }, function (error) { console.error(error) });
        });
      }
    };

    MainService.getDefaultLanguage().then(function (response) {
      if ($cookieStore.get('language')) {
        rc.language_code = $cookieStore.get('language_code');
        rc.DefaultLanguage = $cookieStore.get('language');
        $rootScope.language = $cookieStore.get('language');
        $translate.proposedLanguage(rc.language_code) || $translate.use(rc.language_code);
      } else if (response && response.length) {
        rc.DefaultLanguage = response[0].name
        $rootScope.language = response[0].name;
        $translate.proposedLanguage(response[0].code) || $translate.use(response[0].code);
      }
    });

    rc.setDefaultLanguage = function setDefaultLanguage(data) {
      MainService.getDefaultLanguage(data).then(function (response) {
        if (!response || !response.length)
          return;

        $cookieStore.put('language', response[0].name);
        $rootScope.language = response[0].name;
        $cookieStore.put('language_code', response[0].code);
        $translate.proposedLanguage(response[0].code) || $translate.use(response[0].code);
        //language
        if (rc.DefaultLanguage) {
          MainService.getTransalatePage($rootScope.pageId, rc.DefaultLanguage).then(function (response) {
            if (response.length !== 0) {
              $scope.html = response[0].description;
              $rootScope.trustedHtml = $sce.trustAsHtml($scope.html);
            } else {
              $rootScope.translatepage = "Translate language is not available";
            }
          });
          MainService.getTransalatePageNames(rc.DefaultLanguage).then(function (response) {
            var translatepages = response;
            var matchid;

            if (rc.pages && rc.pages.length) {
              angular.forEach(rc.pages[0].categoryname, function (data, key) {
                angular.forEach(translatepages, function (data1) {
                  if (data.parent) {
                    currentid = data.parent;
                  } else {
                    currentid = data._id;
                  }
                  if (data1.parent) {
                    matchid = data1.parent;
                  } else {
                    matchid = data1._id;
                  }
                  if (currentid === matchid) {
                    rc.pages[0].categoryname[key] = data1;
                  }
                });
              });

              if (rc.pages.length > 1) {
                angular.forEach(rc.pages[1].categoryname, function (data, key) {
                  angular.forEach(translatepages, function (data1) {
                    if (data1.parent) {
                      matchid = data1.parent;
                    } else {
                      matchid = data1._id;
                    }
                    if (data._id === matchid) {
                      rc.pages[1].categoryname[key] = data1;
                    }
                  });
                });
              }
            }
          });
        }
      });
    };

    $rootScope.$on('notification', function (event, data) {
      AuthenticationService.currentmsgcount(data).then(function (response) {
        $scope.chatCount = response;
      });
    });

    $rootScope.$on('webNotification', function (event, data) {
      MainService.getNotificationsCount(data).then(function (response) {
        $scope.notifyCount = response;
      });
    });

    $rootScope.$on('unreadmsg', function (event, data) {
      AuthenticationService.unreadmsg(data).then(function (response) {
        $scope.unreadmsgs = response;
      });
    });
    //logic
    $rootScope.$on('track', function (event, data) {
      if ($rootScope.usertype === 'tasker') {
        $interval(function () {
          var latLng = {}
          navigator.geolocation.getCurrentPosition(function (pos, error) {
            latLng = { lat: pos.coords.latitude, lng: pos.coords.longitude }
            if (latLng.lat) {
              $scope.schedulingForTimeout(latLng);
            }
          }, function(failure) {
            // console.log("failure", failure);
            $.getJSON('https://ipinfo.io/geo', function(response) {
              var loc = response.loc.split(',');
              latLng = { lat: loc[0], lng: loc[1] }
              console.log();
              $scope.schedulingForTimeout(latLng);
            });
          }, function error(err) {

          })
        }, 3000);
      }
    })

    $scope.currentUserCredentials = AuthenticationService.GetCredentials();
    if ($scope.currentUserCredentials === '' || Object.keys($scope.currentUserCredentials).length === 0) {
      $rootScope.userId = '';
      $rootScope.username = '';
      $rootScope.usertype = '';
      $rootScope.taskerStatus = '';
    } else {
      $rootScope.userId = $scope.currentUserCredentials.currentUser.user_id;
      $rootScope.username = $scope.currentUserCredentials.currentUser.username;
      $rootScope.usertype = $scope.currentUserCredentials.currentUser.user_type;
      $rootScope.taskerStatus = $scope.currentUserCredentials.currentUser.tasker_status;
      socket.emit('create room', { user: $rootScope.userId });
      notify.emit('join network', { user: $rootScope.userId });
      $rootScope.$emit('notification', { user: $rootScope.userId, type: $rootScope.usertype });
      $rootScope.$emit('webNotification', { user: $rootScope.userId, type: $rootScope.usertype });
      $rootScope.$emit('unreadmsg', { user: $rootScope.userId, type: $rootScope.usertype });
      //logic
      $rootScope.$emit('track', { user: $rootScope.userId, type: $rootScope.usertype });
      accountService.edit($rootScope.userId, $rootScope.usertype).then(function (response) {
        console.log("response",response.avatar);
        $rootScope.avatar = response.avatar;
      })
    }
    // accountService.edit($rootScope.userId, $rootScope.usertype).then(function (response) {
    //     $rootScope.avatar = response.avatar;
    // })

    //logic
    $scope.schedulingForTimeout = function (latLng) {
      notify.emit('tasker tracking', { user: $rootScope.userId, latLng: latLng }); //location
    };







    // });

    $scope.tinymceOptions = {
      plugins: 'link image code',
      toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code'
    };

    //--------------------- Socket ---------------------

    socket.on('roomcreated', function (data) {
      $scope.socket = data;
    });

    socket.on('webupdatechat', function (data) {
      if ($state.current.name !== 'chat') {
        $rootScope.$emit('notification', { user: $rootScope.userId, type: $rootScope.usertype });
      }
    });

    notify.on('network created', function (data) {
      $scope.socket = data;
    });

    notify.on('web notification', function (data) {
      $rootScope.$emit('webNotification', { user: $rootScope.userId, type: $rootScope.usertype });
      toastr.info(data.message.message, 'Notification');
    });


    // --------------------- Alert ---------------------
    $scope.alerts = [];
    $scope.alertTimeout = 5000;
    $scope.addAlert = function (type, msg) {
      var alert = {};
      alert.type = type;
      alert.msg = msg;
      $scope.alerts.push(alert);
    };
    $scope.closeAlert = function (index) {
      $scope.alerts.splice(index, 1);
    }
    // --------------------- /Alert ---------------------

    $rootScope.$on('eventName', function (event, args) {
      $scope.currentUserCredentials = AuthenticationService.GetCredentials();
      $scope.cartcount = args.count;
      if ($scope.currentUserCredentials === '' || Object.keys($scope.currentUserCredentials).length === 0) {
        $rootScope.userId = '';
        $rootScope.username = '';
        $rootScope.usertype = '';
        $rootScope.taskerStatus = '';
      } else {
        $rootScope.userId = $scope.currentUserCredentials.currentUser.user_id;
        $rootScope.username = $scope.currentUserCredentials.currentUser.username;
        $rootScope.usertype = $scope.currentUserCredentials.currentUser.user_type;
        $rootScope.taskerStatus = $scope.currentUserCredentials.currentUser.tasker_status;
      }
    });
  })
  .controller('MainCtrl', function ($scope, $location, $rootScope, $http, toastr, MainserviceResolve, MainService, $state, $translate, $cookieStore, AppService) {
    var mac = this;
    // If current device is mobile, then redirect to mobile site forcibly
    // move to event hook (into run function)
    // if (AppService.checkMobile()) {
    //   $state.go('mobile');
    // }
    mac.myInterval = 9000;

    mac.filtered_service_categories = MainserviceResolve.filtered_service_categories;
    mac.service_categories = MainserviceResolve.service_categories;
    mac.product_categories = MainserviceResolve.product_categories;
    mac.event_categories = MainserviceResolve.event_categories;
    mac.career_categories = MainserviceResolve.career_categories;

    mac.postheader = MainserviceResolve.PostHeader;
    mac.paymentprice = MainserviceResolve.Paymentprice;
    mac.peoplecomment = MainserviceResolve.Peoplecomment;
    mac.banner = MainserviceResolve.slider;

    mac.lan_backgroundimg = mac.banner[0].image;
    mac.lan_bannername = mac.banner[0].name;
    mac.lan_bannerdes = mac.banner[0].description;

    mac.searchData = {
      service: {},
      product: {},
      event: {},
      career: {}
    };

    mac.sub_categories = {
      service: [],
      product: [],
      event: [],
      career: []
    };

    /**
    $scope.getLocation = function getLocation(data) {
      return (MainService.searchSuggestions(data).then(function (response) {
        return response;
      }, function (error) {
        return error;
      }));
    };
    //*/

    mac.subscription = function (subscriptionForm, data) {
      function clearSubscribe() {
        mac.email = "";
        subscriptionForm.$setPristine();
        subscriptionForm.$setUntouched();
        subscriptionForm.email.$setValidity();
        subscriptionForm.email.$setDirty();
        subscriptionForm.email.$pattern();
      }

      if (data) {
        return (MainService.subscription(data).then(function (response) {
          $translate('SUBSCRIBED SUCCESSFULLY').then(function (headline) { toastr.success(headline); }, function (translationId) { toastr.success(headline); });
          clearSubscribe();
        }, function (error) {
          $translate('EMAIL ALREADY SUBSCRIBED').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error) });
          clearSubscribe();
        }));
      } else {
        $translate('INVALID EMAIL').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error) });
      }
    };

    /*if ($rootScope.selectedCategory) {
      mac.searchData.parent = $rootScope.selectedCategory.parent;
      mac.searchData.child = $rootScope.selectedCategory.child
    }*/

    mac.getsubcategory = function (parentid, classification) {
      return (MainService.getsubcategory(parentid).then(function (response) {
        mac.searchData[classification].child = null;
        mac.sub_categories[classification] = response;
        return response;
      }, function (error) {
        return error;
      }));
    };

    mac.onfocusSubCat = function (classification) {
      if (mac.searchData[classification].parent) {
        if (!mac.sub_categories[classification][0]) {
          $translate('NO SUB CATEGORY FOUND FOR THIS CATEGORY').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error) });
        }
      } else {
        $scope.$broadcast('UiSelectParentCategory');
        $translate('PLEASE CHOOSE A CATEGORY').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error) });
      }
    };

    mac.search = function (data) {
      var ca = $cookieStore.get('text');

      // $rootScope.selectedCategory = data; // Store data for history

      if (ca) {
        $cookieStore.remove('text');
      }

      if (data.parent) {
        if (data.child) {
          $state.go('hirestep1', { 'slug': data.child.slug });
        } else {
          $state.go('category', { 'slug': data.parent.slug });
        }
      } else {
        $translate('PLEASE CHOOSE A CATEGORY').then(function (headline) { toastr.error(headline); }, function (error) { console.error(error) });
      }
    };

    mac.createTreeView = (objSubCategory) => {
      if (!objSubCategory.level || objSubCategory.level <= 1)
        return objSubCategory.name;

      return `${'&nbsp;&nbsp;'.repeat(objSubCategory.level - 1)} ${objSubCategory.name}`;
    };
  })
  .controller('MorecategoryCtrl', function (MorecategoryserviceResolve) {
    var moc = this;
    moc.count = 4;
    moc.data = MorecategoryserviceResolve;
  })
  .controller('DatepickerDemoCtrl', function ($scope) {
    $scope.today = function () {
      $scope.dt = new Date();
    };

    $scope.today();

    $scope.clear = function () {
      $scope.dt = null;
    };

    // Disable weekend selection
    $scope.disabled = function (date, mode) {
      return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
    };

    $scope.toggleMin = function () {
      $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();

    $scope.open = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.opened = true;
    };

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1,
      'class': 'datepicker'
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];

    $scope.format = $scope.formats[0];
  })
  .controller('SlickController', function ($scope, $rootScope, $timeout) {

    $scope.slickbrand = {
      method: {},
      dots: false,
      infinite: false,
      slidesToShow: 2,
      slidesToScroll: 1,
      speed: 300,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: true,
            dots: true
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    };

    $timeout(function () {
      $rootScope.viewLoaded = true;
    });

  })

  .controller('DatepickerDobCtrl', function ($scope) {
    $scope.today = function () {
      $scope.dt = new Date();
    };

    $scope.today();

    // Disable weekend selection
    $scope.disabled = function (date, mode) {
      return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
    };

    $scope.toggleMin = function () {
      $scope.minDate = $scope.minDate ? null : new Date(1945, 1, 1);
    };
    $scope.toggleMin();

    $scope.open = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.opened = true;
    };

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1,
      'class': 'datepicker'
    };

    $scope.formats = ['dd-MM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];

    $scope.format = $scope.formats[0];
  })
  .filter('clock', function () {
    return function (timestamp, date) {
      return moment.tz(timestamp, date.timezone).format(date.format);
    }
  })
  .filter('money', ['$filter', function (filter) {
    var currencyFilter = filter('currency');
    return function (amount, data) {
      var calAmount = amount * data.value;
      var fractionSize = 2;
      return currencyFilter(calAmount, data.symbol + ' ', fractionSize);
    }
  }])
  .filter('clocksettings', function () {
    return function (timestamp, format, timezone) {
      return moment.tz(timestamp, timezone).format(format);
    }
  })
  .directive('submitValidate', function () {
    return {
      require: 'form',
      restrict: 'A',
      link: function (scope, element, attributes) {
        var $element = angular.element(element);
        $element.on('submit', function (e) {
          $element.find('.ng-pristine').removeClass('ng-pristine').addClass('ng-dirty');
          var form = scope[attributes.name];
          angular.forEach(form, function (formElement, fieldName) {
            if (fieldName[0] === '$') {
              return;
            }
            formElement.$pristine = false;
            formElement.$dirty = true;
          }, this);
          form.$setDirty();
          scope.$apply();
        });
      }
    };
  })
  .directive('taskAction', function () {
    return {
      restrict: 'EA',
      link: function (scope, element, attributes) {
        var $element = angular.element(element);
        $element.on('click', function (e) {
          $('.action-space').not($element.parents('.slidetd').find('.action-space')).hide().removeClass('clickd');
          if (!$element.parents('.slidetd').find('.action-space').hasClass('clickd')) {
            $element.parents('.slidetd').find('.action-space').show().addClass('clickd');
          } else {
            $element.parents('.slidetd').find('.action-space').hide().removeClass('clickd');
          }
          e.preventDefault();
        });
      }
    };
  })
  .directive('stringToNumber', function () {
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {
        ngModel.$parsers.push(function (value) {
          return '' + value;
        });
        ngModel.$formatters.push(function (value) {
          if (value) {
            return parseFloat(value.replace(',', ''));
          }
        });
      }
    };
  })
  .directive('errSrc', function () {
    return {
      link: function (scope, element, attrs) {
        element.bind('error', function () {
          if (attrs.src !== attrs.errSrc) {
            attrs.errSrc = "uploads/images/categories/noimage.jpg";
            attrs.$set('src', attrs.errSrc);
          }
        });
      }
    }
  })
  .directive('checkFileSize', function () {
    return {
      link: function (scope, elem, attr, ctrl) {
        $(elem).bind('change', function () {
          alert('File size:' + this.files[0].size);
        });
      }
    }
  })
  .filter('encodeURIComponent', function ($window) {
    return $window.encodeURIComponent;
  })
  .filter('decodeURIComponent', function ($window) {
    return $window.decodeURIComponent;
  })
  .directive('numbersOnly', function () {
    return {
      require: 'ngModel',
      link: function (scope, element, attr, ngModelCtrl) {
        function fromUser(text) {
          if (text) {
            var transformedInput = text.replace(/[^0-9]/g, '');
            if (transformedInput !== text) {
              ngModelCtrl.$setViewValue(transformedInput);
              ngModelCtrl.$render();
            }
            return transformedInput;
          }
          return undefined;
        }
        ngModelCtrl.$parsers.push(fromUser);
      }
    };
  })
  .directive('allowOnlyNumbers', function () {
    return {
      restrict: 'A',
      link: function (scope, elm, attrs, ctrl) {
        elm.on('keydown', function (event) {
          if (event.which === 64 || event.which === 16) {
            // to allow numbers
            return false;
          } else if (event.which >= 48 && event.which <= 57) {
            // to allow numbers
            return true;
          } else if (event.which >= 96 && event.which <= 105) {
            // to allow numpad number
            return true;
          } else if ([8, 13, 27, 37, 38, 39, 40, 9, 190, 110].indexOf(event.which) > -1) {
            // to allow backspace, enter, escape, arrows
            return true;
          } else {
            event.preventDefault();
            // to stop others
            return false;
          }
        });
      }
    }
  })
  .directive('scroll', function ($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        scope.$watchCollection(attr.scroll, function (newVal) {
          $timeout(function () {
            element[0].scrollTop = element[0].scrollHeight;
          });
        });
      }
    }
  })
  .directive('lazyerr', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        return attrs.$observe("afklLazyImageLoaded", function (value) { });
      }
    };
  })
  .directive('tooltip', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        $(element).hover(function () {
          // on mouseenter
          //    $(element).tooltip('show');
        }, function () {
          // on mouseleave
          //    $(element).tooltip('hide');
        });
      }
    };
  })
  .directive('disallowSpaces', function () {
    return {
      restrict: 'A',
      link: function ($scope, $element) {
        $element.bind('input', function () {
          $(this).val($(this).val().replace(/ /g, ''));
        });
      }
    };
  });
