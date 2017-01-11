!function() {
    'use strict';
                        
    var msUtils =  angular.module('msUtils', []);

    /*
     * Configurando o modulo para permitir LazyLoading de providers
     */
    msUtils.config(['$provide', '$compileProvider',
                        function($provide, $compileProvider){

            msUtils.directive = function( name, constructor ) {
                $compileProvider.directive( name, constructor );
                return( this );

            };      

            msUtils.factory = function( name, constructor ) {
                $provide.factory( name, constructor );
                return( this );

            };
    }]);


    msUtils.run(['$rootScope', 'msPropriedadesService', function($rootScope, msPropriedadesService) {
            $rootScope.msPropriedades = msPropriedadesService.get();
    }]);

    return msUtils;
			
}();
   
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
!function() {
		
    'use strict';

    var msUtils = angular.module('msUtils');
    msUtils.factory('msPropriedadesService', ['$http', '$log', '$q', function($http, $log, $q) {

        var _resource;

        var init = function() {
            try {
                if(!getResource() || typeof getResource() == 'undefined') {

                    if(appConfig.ambiente.propriedades) {
                        _resource = $http.get(appConfig.ambiente.propriedades);
                    }
                }

                return getResource();
            }
            catch(e) {
                $log.error(e);
            }
        };

        var getResource = function() {
            return _resource;
        }

        var get = function() {
            if(typeof init() != 'undefined') {
                return init().then(function(response) {
                    return response.data.resultado;
                }, function(reason){
                    throw reason;
                });
            }
            else {
                var defer = $q.defer();
                return defer.promise;
            }
        };


        return {
            get: get
        }
    }]);

    return msUtils;
		
}();
!function() {
		
    'use strict';

    var msUtils = angular.module('msUtils');
    msUtils.factory('_', function() {
        return window._; 
    });

    return msUtils;
		
}();