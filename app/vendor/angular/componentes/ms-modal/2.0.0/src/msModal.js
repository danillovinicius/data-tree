!function() {
    'use strict';
    
    var msModal =  angular.module('msModal', ['ui.bootstrap']);

    /*
     * Configurando o modulo para permitir LazyLoading de providers
     */
    msModal.config(['$controllerProvider', '$provide', '$compileProvider',
                        function($provide, $compileProvider){

            msModal.directive = function( name, constructor ) {
                $compileProvider.directive( name, constructor );
                return( this );

            };      

            msModal.service = function( name, constructor ) {
                $provide.service( name, constructor );
                return( this );

            };
    }]);

    return msModal;
}();
   