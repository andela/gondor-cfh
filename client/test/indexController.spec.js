/* eslint prefer-arrow-callback: 0,
func-names: 0, no-undef: 0, no-unused-vars: 0, no-var: 0, object-shorthand: 0 */

describe('Landing Page: IndexController', function () {
  var $controller, $rootScope, $scope, $location;

  beforeEach(function () {
    module('mean.system');

    GlobalMock = {
      getUser: function () {
        return {
          then: function (success, err) {
            success({
              user: user,
              authenticated: true
            });
          }
        };
      }
    };

    gameMock = {
      joinGame: function () {
        return true;
      }
    };

    inject(function (_$controller_, _$rootScope_, _$location_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $location = _$location_;
    });

    $scope = $rootScope.$new();
    IndexController = $controller('IndexController', {
      $scope: $scope,
      $location: $location,
      Global: GlobalMock,
      game: gameMock
    });
  });

  it('changes location when playAsGuest function is called', function () {
    $scope.playAsGuest();

    expect($location.path()).toBe('/app');
  });

  it('signs user out of app', function () {
    $scope.sideNav = true;

    $scope.signout();

    expect($location.path()).toBe('/');
  });
});
