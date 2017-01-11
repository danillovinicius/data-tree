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
   