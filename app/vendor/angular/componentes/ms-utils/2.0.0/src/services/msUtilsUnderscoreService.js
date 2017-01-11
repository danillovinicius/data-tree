!function() {
		
    'use strict';

    var msUtils = angular.module('msUtils');
    msUtils.factory('_', function() {
        return window._; 
    });

    return msUtils;
		
}();