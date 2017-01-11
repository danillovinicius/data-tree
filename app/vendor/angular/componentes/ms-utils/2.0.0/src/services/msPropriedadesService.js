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