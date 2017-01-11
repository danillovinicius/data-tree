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

