!function() {
		
    'use strict';

    var msMenu = angular.module('msMenu');

    msMenu.directive('msSubNavMenu', ['$compile', function($compile) {

            return {
            restrict: 'EA', //Element
            replace: true,
            link: function (scope, element, attrs)
            {
                try {
                        var template = angular.element(
                            '<a ng-if="!node.children && !node.css.span" ng-click="reloadState((node.state && node.state.url) ? node.state.url : (node.text | msRemoverAcentuacao | msHifenizar))" ms-compile="node.text"></a>' +
                            '<a ng-if="!node.children && node.css.span" ng-click="reloadState((node.state && node.state.url) ? node.state.url : (node.text | msRemoverAcentuacao | msHifenizar))">' + 
                            '<span ng-class="node.css.span"></span><span>{{node.text}}</span></a>' +
                            '<a ng-if="node.children" role="menu" class="dropdown-toggle">' +
                                    '{{node.text}} <span class="ms-icone-seta-unica-baixo"></span>' +
                            '</a>' +
                            '<ul ng-if="node.children" class="dropdown-menu">' +
                                '<li ng-repeat="node in node.children" node-id={{node.' + attrs.nodeId + '}} ms-seguranca roles="node.roles" ms-sub-nav-menu>' + 
                                '</li>' +
                            '</ul>'
                        );

                        $compile(template)(scope);
                        element.html(null).append( template );
                    }
                    catch(e) {
                            scope.$msNotify.error(e);
                    }
            }
         };
    }]);

    return msMenu;	
}();