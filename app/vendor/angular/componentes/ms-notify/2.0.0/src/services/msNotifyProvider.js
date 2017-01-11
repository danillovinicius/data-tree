//define([
//        //'componentes/ms-notify/msNotify'
//        ], 
		!function() {
		
		'use strict';
                
                var msNotify = angular.module('msNotify');
	    
		msNotify.factory('$msNotifyProvider', function() {
	        try {
	           return function(){
	               return noty(arguments[0]);
	           };
	        }
	        catch(e) {
	        	$log.error(e);
	        }
	    });
		
		return msNotify;
		
}();