// mock localStorage
window.localStorage = function() {
  var localStorage;
  return {
    setItem: function(key, value) {
      return localStorage[key] = value;
    },
    getItem: function(key) {
      return localStorage[key];
    },
    removeItem: function(key) {
      delete localStorage[key];
    },
    clear: function() {
      localStorage = {};
    }
  };
}

describe('AuthController Test Suite', function() {
  beforeEach(module('mean.system'));
  describe('Signup Method Test Suite', function() {
    var $scope, $location, createController, httpBackend;

    // inject controller
    beforeEach(inject(function($rootScope, $controller, _$location_, $httpBackend, $http) {
      $location = _$location_;
      httpBackend = $httpBackend;
      $scope = $rootScope.$new();

      createController = function() {
        return $controller('AuthController', {
          '$scope': $scope,
          '$http': $http,
          '$location': $location
        });
      };
    }));

    afterEach(function() {
      // clean up httpBackend mock after each function
      httpBackend.verifyNoOutstandingRequest();
    });

    it('should return error if signup failed', function() {
      var authController = createController();
      var response = {
        errors: {
          username: 'Username already exists',
          email: 'Email already exists',
          hashedPassword: 'Password is invalid'
        }
      };

      // mock http call
      httpBackend.whenPOST('/api/auth/signup').respond(400, response, {});
      
      $scope.email = 'stephen@yahoo.com';
      $scope.username = 'stephen';
      $scope.password = 'qwertyuiop';
      $scope.confirmpassword = 'qwertyuiop';

      $scope.signup();
      httpBackend.flush();

      expect(authController).toBeDefined();
      expect($scope.emailError).toBe(response.errors.email);
      expect($scope.usernameError).toBe(response.errors.username);
      expect($scope.passwordError).toBe(response.errors.hashedPassword);
    });

    it('should signup successfully, save token in localStorage and redirect to home page', function() {
      var authController = createController();
      var response = {
        token: '1234567890qwertyuiop'
      };

      // mock http call
      httpBackend.whenPOST('/api/auth/signup').respond(201, response, {});

      $scope.email = 'stephen@yahoo.com';
      $scope.username = 'stephen';
      $scope.password = 'qwertyuiop';
      $scope.confirmpassword = 'qwertyuiop';

      $scope.signup();
      httpBackend.flush();

      expect(authController).toBeDefined();
      expect($location.url()).toBe('/home');
      expect(localStorage.getItem('token')).toBe(response.token);
    });
  });

  describe('Signin Method Test Suite', function() {
    var $scope, $location, createController, httpBackend;

    // inject controller
    beforeEach(inject(function($rootScope, $controller, _$location_, $httpBackend, $http) {
      $location = _$location_;
      httpBackend = $httpBackend;
      $scope = $rootScope.$new();

      createController = function() {
        return $controller('AuthController', {
          '$scope': $scope,
          '$http': $http,
          '$location': $location
        });
      };
    }));

    afterEach(function() {
      // clean up httpBackend mock after each function
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    it('should return error if signin request fails', function() {
      var authController = createController();
      var response = {
        message: 'Email or password is incorrect'
      };

      // mock http call
      httpBackend.whenPOST('/api/auth/login').respond(400, response, {});
      
      $scope.email = 'stephen@yahoo.com';
      $scope.password = 'qwertyuiop';

      $scope.signin();
      httpBackend.flush();

      expect(authController).toBeDefined();
      expect($scope.signinError).toBe(response.message);
    });

    it('should return token, save token in local storage and redirect to home page if signin passes', function() {
      var authController = createController();
      var response = {
        token: '1234567890qwertyuiop'
      };

      // mock http call
      httpBackend.whenPOST('/api/auth/login').respond(200, response, {});

      $scope.email = 'stephen@yahoo.com';
      $scope.password = 'qwertyuiop';

      $scope.signin();
      httpBackend.flush();

      expect(authController).toBeDefined();
      expect($location.url()).toBe('/home');
      expect(localStorage.getItem('token')).toBe(response.token);
    });
  });
});
