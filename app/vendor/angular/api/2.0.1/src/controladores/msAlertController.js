//define([
//        'msControllers/msAppController'
//        ], 
        !function() {
            'use strict';
            try {
                var msAppController = angular.module('msAppController');
                msAppController.controller('msAlertController', ['$scope', '$attrs', function ($scope, $attrs) {
                    $scope.closeable = 'close' in $attrs;
                }]);
            }
            catch(e) {
                    console.log(e);
            }
            
            return msAppController;
			
}();