!function() {
		
    'use strict';

    var msSeguranca = angular.module('msSeguranca');

    msSeguranca.directive('msSeguranca',  ['msSegurancaService', 'msAutenticacaoService', '$parse', '$animate', '$rootScope',
        function(msSegurancaService, msAutenticacaoService, $parse, $animate, $rootScope) {

        return {
            restrict: 'EA',
            transclude: 'element',
            priority: 600,
            link: function(scope, element, attrs, ctrl, $transclude) {

                var rolesPermissaoArray, block, childScope;

                /*
                 * Recuperando as roles do objeto.
                 */

                if(attrs.roles.match(/,/g)) {
                    var trimmed = attrs.roles.replace(/\s+/g, '');
                    rolesPermissaoArray = trimmed.split(",");
                }
                else if(attrs.roles.match(/\*/g)) {
                     rolesPermissaoArray = attrs.roles;
                }
                else {
                    var roles = $parse(attrs.roles)(scope);
                    if(typeof roles == 'undefined') {
                        rolesPermissaoArray = attrs.roles.match(/\./g) ? null : attrs.roles;
                    }
                    else {
                        rolesPermissaoArray = roles;
                    }
                }

                /*
                 * Function para recuperação de elementos clonados
                 */
                function getBlockElements(nodes) {
                    var startNode = nodes[0],
                        endNode = nodes[nodes.length - 1];
                    if (startNode === endNode) {
                      return jQuery(startNode);
                    }

                    var element = startNode;
                    var elements = [element];

                    do {
                      element = element.nextSibling;
                      if (!element) break;
                      elements.push(element);
                    } while (element !== endNode);

                    return jQuery(elements);
                  }

                /*
                 * Clone de elementos que não serão exibidos.
                 * Remoção/reinserção dos elementos
                 */
                function transcluder(value) {
                    if(value) {
                        if (!childScope) {
                            childScope = scope.$new();
                            $transclude(scope, function (clone) {
                                clone[clone.length++] = document.createComment(' end msSeguranca: ' + attrs.msSeguranca + ' ');
                                block = {
                                    clone: clone
                                };
                                $animate.enter(clone, element.parent(), element);
                            });
                        }
                    }
                    else {
                        if (childScope) {
                            childScope.$destroy();
                            childScope = null;
                        }

                        if (block) {
                            $animate.leave(getBlockElements(block.clone));
                            block = null;
                        }
                    }
                };


                scope.$on('USER_AUTHENTICATED', function(event, usuario) {
                    msSegurancaService.possuiAcesso(rolesPermissaoArray, usuario).then(function(result) {
                        transcluder(true);
                    }, function(reason) {
                        transcluder(false);
                    });
                })
                /*
                 * Watch sobre usuario logado.
                 * Aqui informamos se há ou não acesso ao elemento
                 */
                scope.$watch(function(){
                    return msSegurancaService.isUsuarioAutenticado();
                }, function(val) {
                    if(val == true) {
                        msSegurancaService.possuiAcesso(rolesPermissaoArray, msSegurancaService.getUsuario()).then(function(result) {
                            transcluder(true);
                        }, function(reason) {
                            transcluder(false);
                        });
                    }
                    else {
                        (rolesPermissaoArray) ?  transcluder(false) : transcluder(true);
                    }
                });
            }
        };
    }]);

    return msSeguranca;
		
}();

