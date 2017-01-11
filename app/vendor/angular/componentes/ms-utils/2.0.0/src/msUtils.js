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
   