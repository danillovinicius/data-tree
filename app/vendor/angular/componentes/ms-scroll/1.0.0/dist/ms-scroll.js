!function () {
    'use strict';
    var msScroll = angular.module('msScroll', []);

    msScroll.config(['$provide', '$compileProvider', '$validatorProvider',
        function ($provide, $compileProvider, $validatorProvider) {


            msScroll._directive = msScroll.directive;
            msScroll.directive = function (name, constructor) {
                $compileProvider.directive(name, constructor);
                return ( this );

            };

            msScroll._factory = msScroll.factory;
            msScroll.factory = function (name, constructor) {
                $provide.factory(name, constructor);
                return ( this );

            };


        }]);

    return msScroll;
}();
   
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

