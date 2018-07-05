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

      /**
       *  using form to retrieve value below because the custom directive used
       * on the input field is preventing scope from finding the model directly.
       */
      var confirmPassword = $scope.signupForm.confirmPassword.$viewValue;
      
      var samePassword = password === confirmPassword;
      $scope.signupForm.confirmPassword.$setValidity('samePassword', samePassword);
      if (samePassword) {
        var requestData = {
          email: $scope.email,
          username: $scope.username,
          name: $scope.username,
          password: $scope.password
        }
        $http({
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

      if ($scope.signinForm.$valid) {
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
          $scope.signinError = err.data.message || '';
        });
      } else {
        $scope.signinError = 'Email and password are required';
      }
    }
});
