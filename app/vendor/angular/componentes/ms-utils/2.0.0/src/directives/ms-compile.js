!function() {
    'use strict';
    var msUtils = angular.module('msUtils');

    msUtils.directive('msCompile', function($compile) {

        return {
            restrict: 'A',
            link:function(scope, element, attrs) {
                scope.$watch( function(scope) {
                                return scope.$eval(attrs.msCompile);
                            },
                            function(value) {
                                element.html(value);

                                if(!attrs.keepScope)
                                    $compile(element.contents())(scope);
                            }
                );
            }
        }
      });

    return msUtils;
			
}();