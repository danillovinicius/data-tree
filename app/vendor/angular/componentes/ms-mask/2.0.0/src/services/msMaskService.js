!function() {
    'use strict';

    var msMask = angular.module('msMask');  
    msMask.factory('msMaskService', [function() {

        var maskObj = {
            cpf: '999.999.999-99',
            date: '99/99/9999',
            cnpj: '99.999.999/9999-99',
            telefone: '(99)9999-9999'
        }

        var getMask = function(mask){
            return maskObj[mask];
        }

        var setMask = function(obj) {
            angular.forEach(obj, function(val, index) {
               maskObj[index] = val;
            });
        }

        return {
            setMask: setMask,
            getMask: getMask
        }

    }]);

    return msMask;
		
}();