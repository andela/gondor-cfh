/* eslint prefer-arrow-callback: 0,
func-names: 0, no-undef: 0, no-unused-vars: 0, no-var: 0,
object-shorthand: 0, vars-on-top: 0, prefer-template: 0, max-len: 0 */

angular.module('mean.system')
  .controller(
    'ProfileController',
    ['$scope', '$location', '$window', 'Global', 'LeaderboardService', 'DonationService', 'GamesService',
      function ($scope, $location, $window, Global, LeaderboardService, DonationService, GamesService) {
        const monthList = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];

        Global.getUser().then(function (authUser) {
          if (!authUser.user) {
            return $location.path('#!/');
          }

          $scope.global = authUser;
          $scope.gamesWon = authUser.user.gamesWon;

          GamesService.getHistory().then(function (response) {
            $scope.gamesPlayed = response.games.map((item) => {
              const date = new Date(item.createdAt);
              item.datePlayed = monthList[date.getMonth()] + ' '
              + date.getDate() + ', ' + date.getFullYear();

              return item;
            });
            $scope.gamesPlayedCount = response.games.length;
          });

          LeaderboardService.getLeaderboard().then(function (leaderBoard) {
            $scope.leaderBoard = leaderBoard.players;
          });

          DonationService.getDonations().then(function (response) {
            $scope.donations = response.user.donations.map((item) => {
              const date = new Date(item.date);
              item.date = monthList[date.getMonth()] + ' '
              + date.getDate() + ', ' + date.getFullYear();

              return item;
            });
            $scope.donationCount = response.user.donations.length;
          });
        });

        $('.sidenav').sidenav();
        // $(document).ready(function () {
        $('.collapsible').collapsible();
        // });

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
          return number > 1 || number === 0;
        };

        $scope.donate = function () {
          var now = new Date();
          var donation = {
            date: monthList[now.getMonth()] + ' '
            + now.getDate() + ', ' + now.getFullYear(),
            amount: 5
          };

          DonationService.donate(donation).then(function (success) {
            $scope.donations.push(donation);
            $scope.donationCount += 1;
            $window.location.href = 'https://www.crowdrise.com/cfhio/fundraiser/cards4humanity';
          });
        };
      }]
  );
