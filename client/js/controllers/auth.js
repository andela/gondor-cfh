angular.module('mean.system')
.controller('AuthController', function ($scope, $http, $location) {
    /**
     * signup method to handle signup button click
     * calls server api for authentication
     * save jwt token received in local storage
     */
    $scope.signup = function() {
      var email = $scope.email;
      var username = $scope.username;
      var password = $scope.password;
      var confirmPassword = $scope.confirmpassword;

      // check if passwords are the same
      if (password === confirmPassword) {
        var requestData = {
          email: $scope.email,
          username: $scope.username,
          name: $scope.username,
          password: $scope.password
        }
        return $http({
          url: '/api/auth/signup',
          method: "POST",
          data: requestData,
        }).then(function(response) {
          if (response.status === 201) {
            localStorage.setItem('token', response.data.token);

            // redirect to homepage
            $location.path('/home');
          }
        }, function(err) {
          $scope.emailError = err.data.errors.email || '';
          $scope.usernameError = err.data.errors.username || '';
          $scope.passwordError = err.data.errors.hashedPassword || '';
        });
      }
    }

    /**
     * signin method to handle signin click
     * calls server api to for authentication
     * saves jwt token received in the local storage
     */
    $scope.signin = function() {
      var email = $scope.email;
      var password = $scope.password;
      $scope.signinError = '';
      var requestData = {
        email: $scope.email,
        password: $scope.password
      };
      $http({
        url: '/api/auth/login',
        method: "POST",
        data: requestData,
      }).then(function(response) {
        if (response.status === 200) {
          localStorage.setItem('token', response.data.token);

          // redirect to homepage
          $location.path('/home');
        }
      }, function(err) {
        $scope.signinError = err.data.message || 'An error occurred';
      });
    }
});
