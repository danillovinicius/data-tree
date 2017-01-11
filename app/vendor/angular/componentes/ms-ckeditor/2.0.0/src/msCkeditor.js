!function() {
    'use strict';
                        
    var msCkeditor =  angular.module('msCkeditor', []);

    /*
     * Configurando o modulo para permitir LazyLoading de providers
     */
    msCkeditor.config(['$compileProvider',
                        function($compileProvider){

            msCkeditor.directive = function( name, constructor ) {
                $compileProvider.directive( name, constructor );
                return( this );

            };    
    }]);

    return msCkeditor;
			
}();
   