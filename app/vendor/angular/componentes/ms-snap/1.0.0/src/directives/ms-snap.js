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