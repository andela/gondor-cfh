describe('Test Suite for directives', function() {
  beforeEach(module('mean.directives'));
  describe('Test Suite for comparePassword', function() {
    var $scope, content, form;
    beforeEach(inject(function($compile, $rootScope) {
      $scope = $rootScope.$new();
      compile = $compile;
      var content = angular.element(
        '<form name="signupForm">' +
        '<input ng-model="password" name="password" compare-password />' +
        '<input ng-model="confirmpassword" name="confirmPassword" compare-password />' +
        '</form>'
      );
      $scope.password = '';
      $scope.confirmpassword = '';
      $compile(content)($scope);
      $scope.$digest();
      form = $scope.signupForm;
    }));

    it('should invalidate form if passwords don\t match', function() {
      form.password.$setViewValue('qwertyuiop');
      form.confirmPassword.$setViewValue('asdfghjkl');
      expect(form.password.$viewValue).toBe('qwertyuiop');
      expect(form.confirmPassword.$viewValue).toBe('asdfghjkl');
      expect(form.confirmPassword.$valid).toBe(false);
    });

    it('should validate form if passwords match', function() {
      form.password.$setViewValue('qwertyuiop');
      form.confirmPassword.$setViewValue('qwertyuiop');
      expect(form.password.$viewValue).toBe('qwertyuiop');
      expect(form.confirmPassword.$viewValue).toBe('qwertyuiop');
      expect(form.confirmPassword.$valid).toBe(true);
    })
  })
})
