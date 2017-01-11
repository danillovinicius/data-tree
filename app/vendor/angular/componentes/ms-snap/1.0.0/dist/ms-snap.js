!function () {
    'use strict';
    var msSnap = angular.module('msSnap', []);

    msSnap.config(['$provide', '$compileProvider', '$validatorProvider',
        function ($provide, $compileProvider, $validatorProvider) {


            msSnap._directive = msSnap.directive;
            msSnap.directive = function (name, constructor) {
                $compileProvider.directive(name, constructor);
                return ( this );

            };

            msSnap._factory = msSnap.factory;
            msSnap.factory = function (name, constructor) {
                $provide.factory(name, constructor);
                return ( this );

            };


        }]);

    return msSnap;
}();
   
!function () {

    'use strict';

    var msSnap = angular.module('msSnap');

    msSnap.directive('msSnap', [function () {
        return {
            restrict: 'E', //Element
            scope: {
                buttonTextDefault: '@',
                buttonTextClose: '@',
                buttonClass: '@'
            },
            //replace: true,
            transclude: true,
            template: '<div class="row"><div class="snap">' +
            '<div class="col-md-12">' +
            '<div class="snapper" ng-class="{\'abre\': snapOpen, \'fecha\': !snapOpen}">' +
            '<div ng-transclude></div>' +
            '</div>' +
            '<button type="button" class="botao pull-right" ng-class="buttonClass" ng-click="snapOpen = !snapOpen" ng-bind-html="bindHtml()"></button>' +
            '</div>' +
            '</div></div>',

            link: function (scope, element, attrs) {
                scope.bindHtml = function () {
                    if (scope.buttonTextDefault && !scope.snapOpen) {
                        return scope.buttonTextDefault;
                    }
                    else if (scope.snapOpen && scope.buttonTextClose) {
                        return scope.buttonTextClose;
                    }
                }
            }
        };
    }]);

    return msSnap;

}();
!function() {
    'use strict';

    var msSnap = angular.module('msSnap');

    msSnap.factory('msSnapService', ['$log',
        function($log){

           'use strict';

           return {

           }
   }]);

    return msSnap;
		
}();