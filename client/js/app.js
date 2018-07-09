/* eslint prefer-arrow-callback: 0,
func-names: 0, no-undef: 0, no-unused-vars: 0, no-var: 0,
object-shorthand: 0, vars-on-top: 0, prefer-template: 0 */

angular.module(
  'mean',
  ['ngCookies', 'ngResource', 'ui.bootstrap', 'ui.route',
    'mean.system', 'mean.directives']
)
  .config(['$routeProvider',
    function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'views/index.html'
        })
        .when('/app', {
          templateUrl: '/views/app.html',
        })
        .when('/privacy', {
          templateUrl: '/views/privacy.html',
        })
        .when('/bottom', {
          templateUrl: '/views/bottom.html'
        })
        .when('/signin', {
          templateUrl: '/views/signin.html'
        })
        .when('/signup', {
          templateUrl: '/views/signup.html'
        })
        .when('/choose-avatar', {
          templateUrl: '/views/choose-avatar.html'
        })
        .when('/profile', {
          templateUrl: '/views/profile.html'
        })
        .otherwise({
          redirectTo: '/'
        });
    }
  ]).config(['$locationProvider',
    function ($locationProvider) {
      $locationProvider.hashPrefix('!');
    }
  ]).run(['$rootScope', function ($rootScope) {
    $rootScope.safeApply = function (fn) {
      const phase = this.$root.$$phase;
      if (phase == '$apply' || phase == '$digest') { //eslint-disable-line
        if (fn && (typeof (fn) === 'function')) {
          fn();
        }
      } else {
        this.$apply(fn);
      }
    };
  }])
  .run(['DonationService', function (DonationService) {
    window.userDonationCb = function (donationObject) {
      DonationService.userDonated(donationObject);
    };
  }]);

angular.module('mean.system', []);
angular.module('mean.directives', []);
