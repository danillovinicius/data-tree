!function() {
    'use strict';
    try {
        var msMenu = angular.module('msMenu', ['msRoute']);

        /*
         * Configurando o modulo para permitir LazyLoading de providers
         */
        msMenu.config(['$provide', '$compileProvider',
                            function($provide, $compileProvider){

                msMenu.directive = function( name, constructor ) {
                    $compileProvider.directive( name, constructor );
                    return( this );

                };      

                msMenu.service = function( name, constructor ) {
                    $provide.service( name, constructor );
                    return( this );

                };
        }]);

        return msMenu;
    }
    catch(e) {
            //$log.error(e);
    }
		
}();
   

!function () {

    'use strict';

    var msMenu = angular.module('msMenu');

    msMenu.directive('msNavMenu', ['$compile', 'msRouteService', '$parse',
        function ($compile, msRouteService, $parse) {

            return {
                restrict: 'E', //Element
                scope: true,
                replace: true,
                link: function (scope, element, attrs) {
                    try {

                        scope.$watch(attrs.menuData, function (val) {
                            msRouteService.create(val).then(function (result) {
                                var menuData = 'menuData';
                                $parse(menuData).assign(scope, result);

                                var template = angular.element(
                                    '<ul>' +
                                    '<li ng-repeat="node in ' + menuData + '" ms-seguranca roles="node.roles" ng-class="node.css.li" ms-sub-nav-menu nav-menu-content="node"> ' +
                                    ' </li>' +
                                    '</ul>');

                                $compile(template)(scope);
                                element.html(null).append(template);

                            }, function (reason) {
                                scope.$msAlert.error('Não foi possível renderizar o menu.');
                            });
                        }, true);

                    }
                    catch (e) {
                        scope.$msNotify.error(e);
                    }
                }
            };
        }]);

    return msMenu;


}();
!function () {

    'use strict';

    var msMenu = angular.module('msMenu');

    msMenu.directive('msSubNavMenu', ['$compile', function ($compile) {

        return {
            restrict: 'EA', //Element
            replace: true,
            link: function (scope, element, attrs) {
                try {
                    /**
                     * Melhorando a distribuição performática com o evalAsync(temporal) para vários submenus.
                     * Isso permite melhor controle do DOM de maneira organizada e consumindo menos memoria.
                     */
                    scope.$evalAsync(function() {
                        var template = angular.element(
                            '<a ng-if="!node.children && !node.css.span" ng-click="reloadState((node.state && node.state.name) ? node.state.name : (node.text | msRemoverAcentuacao | msHifenizar))" ms-compile="node.text"></a>' +
                            '<a ng-if="!node.children && node.css.span" ng-click="reloadState((node.state && node.state.name) ? node.state.name : (node.text | msRemoverAcentuacao | msHifenizar))">' +
                            '<span ng-class="node.css.span"></span><span class="menu-text">{{node.text}}</span></a>' +
                            '<a ng-if="node.children && !node.css.span" role="menu" class="sub_menu-toggle">' +
                            '{{node.text}} <span class="ms-icone-seta-unica-baixo"></span>' +
                            '</a>' +
                            '<a ng-if="node.children && node.css.span" role="menu" class="sub_menu-toggle">' +
                            '<span ng-class="node.css.span"></span><span class="menu-text">{{node.text}}</span> <span class="ms-icone-seta-unica-baixo"></span>' +
                            '</a>' +
                            '<ul ng-if="node.children" class="sub_menu-box">' +
                            '<li ng-repeat="node in node.children" node-id={{node.' + attrs.nodeId + '}} ms-seguranca roles="node.roles" ms-sub-nav-menu>' +
                            '</li>' +
                            '</ul>'
                        );

                        $compile(template)(scope);
                        element.html(null).append( template );
                    });
                }
                catch (e) {
                    scope.$msNotify.error(e);
                }
            }
        };
    }]);

    return msMenu;
}();