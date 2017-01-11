//!function() {
//		
//    'use strict';
//
//    var msSeguranca = angular.module('msSeguranca');
//
//    msSeguranca.provider('msAutenticacaoProvider', ['$cookies', function($cookies) {
//
//        var userIsAuthenticated = false;
//
//        this.setUserAuthenticated = function(value){
//            userIsAuthenticated = value;
//        };
//
//        this.getUserAuthenticated = function(){
//            return userIsAuthenticated;
//        };
//
//        this.$get = function() {
//            return this;
//        };
//
//    }]);
//
//    return msSeguranca;
//		
//}();