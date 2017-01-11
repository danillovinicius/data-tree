!function() {
    'use strict';

    var msMask = angular.module('msMask');

    msMask.directive('msDatepickerMask', ['msValidatorService', function(msValidatorService) {
            return {
            require: 'ngModel',
            link:function ($scope, element, attrs, controller) {

                function formataData(v){
                    if(v) {
                        v = v.replace(/\D/g,"") 
                        v = v.replace(/(\d{2})(\d)/,"$1/$2") 
                        v = v.replace(/(\d{2})(\d)/,"$1/$2") 
                        return v;
                    }
                }


                element.bind("keyup keydown", function() {
                    var formatado = formataData(controller.$viewValue);

                    if(formatado && formatado.length > element.attr('maxlength')) {
                        var diff = element.attr('maxlength') - formatado.length;

                        formatado = formatado.substring(12, diff);
                    }

                    element.val(formatado);

                    controller.$setViewValue(formatado);

                    if(controller.$viewValue && controller.$viewValue.length == 10) {
                        if(angular.isString(element.val())) {
                            if(!angular.isDate(controller.$modelValue)) {
                                msValidatorService.showError(element, attrs, 'A data informada é inválida.');
                                controller.$setValidity(false);
                            }
                            else {
                                msValidatorService.removeError(element, attrs);
                                controller.$setValidity(true);
                            }
                        }
                    }
                    else {
                        msValidatorService.removeError(element, attrs);
                    }
                });
            }
          };
    }]);

    return msMask;
			
}();