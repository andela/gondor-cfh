describe('AuthController Test Suite', function() {
  /*
  beforeEach(module('mean.system'));
  describe('Signup Method Test Suite', function() {
    var $scope, $location, createController, authController, httpBackend;

    // inject controller
    beforeEach(inject(function($rootScope, $controller, _$location_, $httpBackend) {
      $location = _$location_;
      httpBackend = $httpBackend;
      $scope = $rootScope.$new();

      createController = function() {
        return $controller('AuthController', {
          '$scope': $scope
        });
      };

      authController = createController();
    }));

    afterEach(function() {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    it('should return error if signup form is invalid', function() {
      expect(1).toBe(1);
      var response = {
        errors: {
          username: 'Username already exists',
          email: 'Email already exists',
          password: 'Password is invalid'
        }
      };

      httpBackend.whenGET('/api/auth/signup').respond(400, response, {});
      
      $scope.email = 'stephen@yahoo.com';
      $scope.username = 'stephen';
      $scope.password = 'qwertyuiop';
      $scope.signupForm.confirmPassword = {
        viewValue: 'qwertyuiop'
      };
      // $scope.signupForm = {
      //   confirmPassword: {
      //     $viewValue: 'qwertyuiop'
      //   }
      // };
      var result = $scope.signup();
      console.log('auth:', $scope.isActive());
      console.log('result:', result);
      console.log('error:', $scope.signupError);
      expect(authController.test).toBe('test');

      httpBackend.flush();
    });

    it('should return error if passwords dont match');
  });

  */
});
