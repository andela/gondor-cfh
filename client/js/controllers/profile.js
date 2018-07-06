/* eslint prefer-arrow-callback: 0,
func-names: 0, no-undef: 0, no-unused-vars: 0, no-var: 0,
object-shorthand: 0, vars-on-top: 0, prefer-template: 0, max-len: 0 */

angular.module('mean.system')
  .controller('ProfileController',
    ['$scope', '$location', 'Global', 'LeaderboardService', 'DonationService',
      function ($scope, $location, Global, LeaderboardService, DonationService) {
        Global.getUser().then(function (authUser) {
          if (!authUser.user) {
            return $location.path('#!/');
          }

          $scope.global = authUser;
          $scope.gamesPlayed = authUser.user.gamesPlayed;
          $scope.gamesPlayedCount = authUser.user.gamesPlayed.length;
          $scope.gamesWon = authUser.user.gamesWon;
          $scope.donations = authUser.user.donations;
          $scope.donationCount = authUser.user.donations.length;

          LeaderboardService.getLeaderboard().then(function (leaderBoard) {
            $scope.leaderBoard = leaderBoard.users;
          });
        });

        $('.sidenav').sidenav();

        $scope.tab = 1;
        $scope.sideNav = false;

        $scope.setTab = function (newTab) {
          $scope.tab = newTab;
        };

        $scope.tabIsActive = function (tabNum) {
          return $scope.tab === tabNum;
        };

        $scope.openSideNav = function () {
          $scope.sideNav = true;
          $('.sidenav').sidenav('open');
        };

        $scope.sideNavLinkClick = function (route) {
          $scope.sideNav = false;
          $('.sidenav').sidenav('close');
          if (route) return $location.path(route);
        };

        $scope.signout = function () {
          $scope.sideNav = false;
          $('.sidenav').sidenav('close');

          localStorage.removeItem('token');
          return $location.path('/signout');
        };

        $scope.checkLength = function (number) {
          return number > 1;
        };

        $scope.donate = function () {
          const monthList = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          var now = new Date();
          var donation = {
            date: monthList[now.getMonth()] + ' '
            + now.getDate() + ', ' + now.getFullYear()
          };

          DonationService.userDonated(donation).then(function (success) {
            $scope.donations.push(donation);
            $scope.donationCount += 1;
          });
        };
      }]);
