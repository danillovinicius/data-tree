!function() {
		
    'use strict';

    var msSeguranca = angular.module('msSeguranca');

    msSeguranca.directive('msContador', ['$compile', function($compile) {

        return {
            restrict: 'E',
            link: function(scope, element, attrs, ctrl) {
                try {
                    scope.$watch(attrs.limite, function(content) {
                        var template = angular.element('<timer end-time="limite">{{mminutes}}:{{sseconds}}</timer>');
                        element.html( template );
                        $compile(element.contents())(scope);
                    });

                }
                catch(e) {
                    scope.$msNotify.error(e);
                }
            }
        };
    }]);

    return msSeguranca;
		
}();

