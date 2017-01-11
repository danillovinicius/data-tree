!function() {
    'use strict';
    var msUtils = angular.module('msUtils');

    msUtils.directive('msIdentificadorAmbiente', function($compile) {

        return {
                restrict: 'E',
                scope: true,
                link: function(scope, element, attrs) {
                    try {
                        scope.$watch(attrs.ambiente, function(content) {

                            var configAmbiente = {
                                    dev: {
                                        estilo : 'statusprojeto alert alert-warning ativo',
                                        nome : 'Desenvolvimento',
                                        icone: 'ms-icone-desenvolvimento'
                                    },
                                    hmg: {
                                        estilo : 'statusprojeto alert alert-danger ativo',
                                        nome : 'Homologação',
                                        icone: 'ms-icone-homologacao'
                                    },
                                    prototipo: {
                                        estilo : 'statusprojeto alert alert-info ativo',
                                        nome : 'Protótipo',
                                        icone: 'ms-icone-prototipo'
                                    }
                            };

                            var template = angular.element('<div class="' + configAmbiente[content.nome].estilo + '">\n\
                                                                <h4><span class="' + configAmbiente[content.nome].icone + '"></span>' + configAmbiente[content.nome].nome + '</h4>\n\
                                                            </div>');
                            element.html( template );
                            $compile(element.contents())(scope);
                        });

                    }
                    catch(e) {
                        scope.$msNotify.error(e);
                    }
                }
            };
      });

    return msUtils;
			
}();