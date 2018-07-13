/* eslint prefer-arrow-callback: 0, func-names: 0, no-undef: 0 */

angular.module('mean.system')
  .controller('AuthController',
    ['$scope', '$http', '$location', 'Upload', 'cloudinary',
      function ($scope, $http, $location, Upload, cloudinary) {
        $scope.submitting = false;
        /**
         * signup method to handle signup button click
         * calls server api for authentication
         * save jwt token received in local storage
         *
         * @returns {undefined} undefineds
         */
        $scope.signup = function () {
          const {
            email, username, password, confirmPassword, profilePic
          } = $scope;
          // check if passwords are the same
          if (password === confirmPassword) {
            $scope.submitting = true;
            const cloudName = cloudinary.config().cloud_name;

            Upload.upload({
              url: `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
              data: {
                upload_preset: cloudinary.config().upload_preset,
                file: profilePic
              }
            }).success(function (res) {
              $http({
                url: '/api/auth/signup',
                method: 'POST',
                data: {
                  email,
                  username,
                  name: username,
                  password,
                  profileImage: res.url
                },
              }).then((response) => {
                if (response.status === 201) {
                  localStorage.setItem('token', response.data.token);

                  // redirect to homepage
                  $location.path('/home');
                }
              }, (err) => {
                $scope.submitting = false;
                $scope.emailError = err.data.errors.email || '';
                $scope.usernameError = err.data.errors.username || '';
                $scope.passwordError = err.data.errors.hashedPassword || '';
              });
            }).error(function (data) {
              $scope.submitting = false;
              $scope.signupError = data.error.message;
            });
          }
        };

        /**
         * signin method to handle signin click
         * calls server api to for authentication
         * saves jwt token received in the local storage
         *
         * @returns {undefined} undefined
         */
        $scope.signin = function () {
          const { email, password } = $scope;
          $scope.signinError = '';
          const requestData = {
            email,
            password
          };
          $http({
            url: '/api/auth/login',
            method: 'POST',
            data: requestData,
          }).then((response) => {
            if (response.status === 200) {
              localStorage.setItem('token', response.data.token);

              // redirect to homepage
              $location.path('/home');
            }
          }, (err) => {
            $scope.signinError = err.data.message || 'An error occurred';
          });
        };
      }
    ]);
