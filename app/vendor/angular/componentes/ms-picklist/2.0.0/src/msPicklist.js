!function() {
    'use strict';
    var msPicklist =  angular.module('msPicklist', []);

    /*
    * Configurando o modulo para permitir LazyLoading de providers
    */
    msPicklist.config(['$provide', '$compileProvider',
                       function($provide, $compileProvider){

           msPicklist.directive = function( name, constructor ) {
               $compileProvider.directive( name, constructor );
               return( this );

           };      

           msPicklist.service = function( name, constructor ) {
               $provide.service( name, constructor );
               return( this );

           };    

           msPicklist.factory = function( name, constructor ) {
               $provide.factory( name, constructor );
               return( this );

           };
    }]);

    return msPicklist;
			
}();
   