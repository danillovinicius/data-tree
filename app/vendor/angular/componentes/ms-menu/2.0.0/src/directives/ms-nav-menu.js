!function() {
		
    'use strict';

    var msMenu = angular.module('msMenu');

    msMenu.directive('msNavMenu', ['$compile', 'msRouteService', '$parse',
        function($compile, msRouteService, $parse) {

            return {
            restrict: 'E', //Element
            scope:true,
            replace: true,
            link: function (scope, element, attrs)
            { 
                try {

                    scope.$watch( attrs.menuData, function(val)
                    { 
                        msRouteService.create(val).then(function(result) {
                            var menuData = 'menuData';
                            $parse(menuData).assign(scope, result);

                            var template = angular.element(
                             '<ul class="nav navbar-nav">' +
                                '<li ng-repeat="node in ' + menuData + '" ms-seguranca roles="node.roles" ng-class="node.css.li" dropdown ms-sub-nav-menu nav-menu-content="node"> ' +
                               ' </li>' +
                            '</ul>');

                            $compile(template)(scope);
                            element.html(null).append( template );

                        }, function(reason) {
                            scope.$msAlert.error('Não foi possível renderizar o menu.');
                        });
                    }, true );

                    }
                    catch(e) {
                        scope.$msNotify.error(e);
                    }
            }
        };
    }]);

    return msMenu;
		
		
}();