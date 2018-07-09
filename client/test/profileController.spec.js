/* eslint prefer-arrow-callback: 0,
func-names: 0, no-undef: 0, no-unused-vars: 0, no-var: 0, object-shorthand: 0 */

describe('User Profile', function () {
  var $controller, $rootScope, $scope, $location, controller, Global;

  beforeEach(function () {
    module('mean.system');

    // mock out materialize function
    $.fn.sidenav = function () { return false; };

    // mock out materialize function
    M.toast = function () { return false; };

    ServiceMock = {
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

    inject(function (_$controller_, _$rootScope_, _$location_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $location = _$location_;
    });

    $scope = $rootScope.$new();
    ProfileController = $controller('ProfileController', {
      $scope: $scope,
      $location: $location,
      Global: ServiceMock
    });
  });

  it('changes navtab', function () {
    $scope.setTab(2);

    expect($scope.tab).toEqual(2);
  });

  it('checks if tab is active', function () {
    var check = $scope.tabIsActive(3);

    $scope.setTab(2);

    expect(check).toEqual(false);
  });

  it('opens sideNav', function () {
    $scope.openSideNav();

    expect($scope.sideNav).toEqual(true);
  });

  it('closes sideNav and navigates to provided link', function () {
    $scope.sideNavLinkClick('/');

    expect($scope.sideNav).toEqual(false);
    expect($location.path()).toBe('/');
  });

  it('signs user out of app', function () {
    $scope.sideNav = true;

    $scope.signout('/');

    expect($scope.sideNav).toEqual(false);

    expect($location.path()).toBe('/signout');
  });

  it('checks length', function () {
    expect($scope.checkLength(2)).toEqual(true);
    expect($scope.checkLength(0)).toEqual(false);
  });

  it('gets leaderboard', function () {
    GlobalServiceMock = {
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

    LeaderboardServiceMock = {
      getLeaderboard: function () {
        return {
          then: function (success, err) {
            success({ users: [user] });
          }
        };
      }
    };

    ProfileController = $controller('ProfileController', {
      $scope: $scope,
      $location: $location,
      Global: ServiceMock,
      LeaderboardService: LeaderboardServiceMock
    });

    expect($scope.leaderBoard.length).toBe(1);
    expect($scope.leaderBoard[0].username).toBe('test');
  });

  it('redirects if user is not authenticated', function () {
    ServiceMock = {
      getUser: function () {
        return {
          then: function (success, err) {
            success({
              user: null,
              authenticated: false
            });
          }
        };
      }
    };

    ProfileController = $controller('ProfileController', {
      $scope: $scope,
      $location: $location,
      Global: ServiceMock
    });

    expect($location.path()).toBe('/#!/');
  });

  it('increases donation count', function () {
    GlobalServiceMock = {
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

    DonationServiceMock = {
      userDonated: function () {
        return {
          then: function (success, err) {
            success({
              date: 'April 25, 2018'
            });
          }
        };
      }
    };

    ProfileController = $controller('ProfileController', {
      $scope: $scope,
      $location: $location,
      Global: ServiceMock,
      DonationService: DonationServiceMock
    });

    $scope.donate();

    expect($scope.donationCount).toBe(1);
  });
});
