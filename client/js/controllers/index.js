/* eslint prefer-arrow-callback: 0,
func-names: 0, no-undef: 0, no-unused-vars: 0, no-var: 0,
object-shorthand: 0, vars-on-top: 0, prefer-template: 0 */

angular.module('mean.system')
  .controller(
    'IndexController',
    ['$scope', 'Global', '$location', 'socket',
      'game', 'AvatarService',
      function ($scope, Global, $location, socket, game, AvatarService) {
        Global.getUser().then(function (authUser) {
          $scope.global = authUser;

          $scope.showOptions = true;

          if (authUser && authUser.authenticated === true) {
            $scope.showOptions = false;
          }

          $scope.playAsGuest = function () {
            game.joinGame();
            $location.path('/app');
          };

          $scope.showError = function () {
            if ($location.search().error) {
              return $location.search().error;
            }
            return false;
          };

          $scope.avatars = [];
          AvatarService.getAvatars()
            .then(function (data) {
              $scope.avatars = data;
            });
        });

        $scope.signout = function () {
          localStorage.removeItem('token');
          $location.path('/signout');
        };
      }]
  );
