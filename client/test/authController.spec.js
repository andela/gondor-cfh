/* eslint prefer-arrow-callback: 0, func-names: 0, no-undef: 0 */

// mock localStorage
window.localStorage = function () {
  let localStorage;
  return {
    setItem(key, value) {
      localStorage[key] = value;
    },
    getItem(key) {
      return localStorage[key];
    },
    removeItem(key) {
      delete localStorage[key];
    },
    clear() {
      localStorage = {};
    }
  };
};

const uploadMock = {
  upload() {
    return {
      success(successCallback) {
        successCallback({ url: 'test' });
        return {
          error(errorCallback) {
            errorCallback({ error: { message: 'fake error' } });
          }
        };
      },

    };
  }
};

const cloudinaryMock = {
  config() {
    return {
      cloud_name: 'defxlxmvc',
      secure: true,
      upload_preset: 'omt58t2n'
    };
  }
};

describe('AuthController Test Suite', () => {
  beforeEach(module('mean.system'));
  describe('Signup Method Test Suite', () => {
    let $scope, $location, createController, httpBackend;

    // inject controller
    beforeEach(inject((
      $rootScope, $controller, _$location_, $httpBackend, $http
    ) => {
      $location = _$location_;
      httpBackend = $httpBackend;
      $scope = $rootScope.$new();

      createController = function () {
        return $controller('AuthController', {
          $scope,
          $http,
          $location,
          Upload: uploadMock,
          cloudinary: cloudinaryMock
        });
      };
    }));

    afterEach(() => {
      // clean up httpBackend mock after each function
      httpBackend.verifyNoOutstandingRequest();
    });

    it('should return error if signup failed', () => {
      const authController = createController();
      const response = {
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
      $scope.confirmPassword = 'qwertyuiop';

      $scope.signup();
      httpBackend.flush();

      expect(authController).toBeDefined();
      expect($scope.emailError).toBe(response.errors.email);
      expect($scope.usernameError).toBe(response.errors.username);
      expect($scope.passwordError).toBe(response.errors.hashedPassword);
    });

    it('should signup successfully, save token in ls and redirect', () => {
      const authController = createController();
      const response = {
        token: '1234567890qwertyuiop'
      };

      // mock http call
      httpBackend.whenPOST('/api/auth/signup').respond(201, response, {});

      $scope.email = 'stephen@yahoo.com';
      $scope.username = 'stephen';
      $scope.password = 'qwertyuiop';
      $scope.confirmPassword = 'qwertyuiop';

      $scope.signup();
      httpBackend.flush();

      expect(authController).toBeDefined();
      expect($location.url()).toBe('/home');
      expect(localStorage.getItem('token')).toBe(response.token);
    });
  });

  describe('Signin Method Test Suite', () => {
    let $scope, $location, createController, httpBackend;

    // inject controller
    beforeEach(inject((
      $rootScope, $controller, _$location_, $httpBackend, $http
    ) => {
      $location = _$location_;
      httpBackend = $httpBackend;
      $scope = $rootScope.$new();

      createController = function () {
        return $controller('AuthController', {
          $scope,
          $http,
          $location,
          Upload: uploadMock,
          cloudinary: cloudinaryMock
        });
      };
    }));

    afterEach(() => {
      // clean up httpBackend mock after each function
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    it('should return error if signin request fails', () => {
      const authController = createController();
      const response = {
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

    it('should return token, save token in ls and redirect on signin', () => {
      const authController = createController();
      const response = {
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
