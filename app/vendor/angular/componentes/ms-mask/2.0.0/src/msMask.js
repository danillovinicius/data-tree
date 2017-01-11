!function() {
    'use strict';
                        
    var msMask =  angular.module('msMask', []);

    /*
     * Configurando o modulo para permitir LazyLoading de providers
     */
    msMask.config(['$compileProvider',
                        function($compileProvider){

            msMask.directive = function( name, constructor ) {
                $compileProvider.directive( name, constructor );
                return( this );

            };       

            msMask.factory = function( name, constructor ) {
                $provide.factory( name, constructor );
                return( this );

            };
    }]);

    return msMask;
			
}();
   