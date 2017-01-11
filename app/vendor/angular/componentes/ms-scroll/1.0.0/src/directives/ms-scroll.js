!function () {

    'use strict';

    var msScroll = angular.module('msScroll');

    msScroll.directive('msScroll', ['$window', function ($window) {
        return {
            restrict: 'EA', //Element
            link: function (scope, element, attrs) {

                scope.applyFixedScroll = false;

                angular.element($window).bind("scroll", function () {
                    if (this.pageYOffset >= attrs.topOffset) {
                        scope.applyFixedScroll = true;
                    } else {
                        scope.applyFixedScroll = false;
                    }
                    scope.$apply();
                });
            }
        };
    }]);

    return msScroll;

}();

