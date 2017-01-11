!function() {
    'use strict';
    var msSpinner = angular.module('msSpinner');

    msSpinner.factory('msRequestSpinner', ['$rootScope', function($rootScope){

        var _START_REQUEST_ = '_START_REQUEST_';
        var _END_REQUEST_ = '_END_REQUEST_';

        var requestStarted = function() {
            $rootScope.$broadcast(_START_REQUEST_);
        };

        var requestEnded = function() {
            $rootScope.$broadcast(_END_REQUEST_);
        };

        var onRequestStarted = function($scope, handler){
            $scope.$on(_START_REQUEST_, function(event){

                if(handler)
                    handler();

                $rootScope.$msNotify.loading();
            });
        };

        var onRequestEnded = function($scope, handler){
            $scope.$on(_END_REQUEST_, function(event){
                if(handler)
                    handler();
                $rootScope.$msNotify.close();
            });
        };

        return {
            requestStarted:  requestStarted,
            requestEnded: requestEnded,
            onRequestStarted: onRequestStarted,
            onRequestEnded: onRequestEnded
        };
    }]);

    return msSpinner;
			
}();