!function() {
    'use strict';
    return angular.module('msSpinner', []);		
}();
   
!function() {
		
    'use strict';

    var msSpinner = angular.module('msSpinner');

    msSpinner.directive('msLoadingSpinner', [function () {
        return {
            restrict: "EA",
            link: function (scope, element, attrs) {

                var loadingContent = angular.element('<div class="loading-content"></div>');
                var loadingLayer = angular.element('<div class="loading"></div>');
                element.append(loadingLayer);

                if(attrs.loaderContent) {
                    loadingLayer.append(loadingContent);
                }

                element.addClass('loading-container');
                scope.$watch(attrs.loader, function(value) {
                    loadingLayer.toggleClass('ng-hide', !value);
                });
            }
        };
    }]);

    return msSpinner;
		
}();


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