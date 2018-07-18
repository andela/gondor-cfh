/* eslint prefer-arrow-callback: 0, prefer-destructuring: 0,
func-names: 0, no-undef: 0, no-unused-vars: 0, no-var: 0,
object-shorthand: 0, vars-on-top: 0, prefer-template: 0 */

angular.module('mean.system')
  .controller(
    'IndexController',
    ['$scope', '$routeParams', 'Global', '$location', 'game', '$window',
      function ($scope, $routeParams, Global, $location, game, $window) {
        $scope.token = $routeParams.token;
        if ($scope.token) {
          localStorage.setItem('token', $scope.token);
          $location.path('/#!/');
        }

        Global.getUser().then(function (authUser) {
          $scope.global = authUser;
          $scope.showOptions = authUser && authUser.authenticated;
          const elems = document.querySelectorAll('.slider');
          M.Slider.init(elems, { indicators: false });

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
        });

        $('.sidenav').sidenav();

        $scope.signout = function () {
          localStorage.removeItem('token');
          $scope.showOptions = false;
          $location.path('/');
        };
      }]
  );
