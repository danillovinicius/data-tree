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
   
!function() {
    'use strict';
    var msMask = angular.module('msMask');

    msMask.directive('msCurrencyMask', [ function() {
            return {
                require: '?ngModel',
                link: function (scope, elem, attrs, ctrl) {

                    if (!ctrl) return;

                    var format = {
                            prefix: '',
                            centsSeparator: ',',
                            thousandsSeparator: '.'
                        };

                    ctrl.$parsers.unshift(function (value) {
                        elem.priceFormat(format);
                        return elem[0].value;
                    });

                    ctrl.$formatters.unshift(function (value) {
                        elem[0].value = ctrl.$modelValue * 100 ;
                        elem.priceFormat(format);
                        return elem[0].value ;
                    })
                }
            };
    }]);

    return msMask;
            
}();
!function() {
    'use strict';

    var msMask = angular.module('msMask');

    msMask.directive('msDatepickerMask', ['msValidatorService', function(msValidatorService) {
            return {
            require: 'ngModel',
            link:function ($scope, element, attrs, controller) {
                
                var patternValidaData = /^(((0[1-9]|[12][0-9]|3[01])([-.\/])(0[13578]|10|12)([-.\/])(\d{4}))|(([0][1-9]|[12][0-9]|30)([-.\/])(0[469]|11)([-.\/])(\d{4}))|((0[1-9]|1[0-9]|2[0-8])([-.\/])(02)([-.\/])(\d{4}))|((29)(\.|-|\/)(02)([-.\/])([02468][048]00))|((29)([-.\/])(02)([-.\/])([13579][26]00))|((29)([-.\/])(02)([-.\/])([0-9][0-9][0][48]))|((29)([-.\/])(02)([-.\/])([0-9][0-9][2468][048]))|((29)([-.\/])(02)([-.\/])([0-9][0-9][13579][26])))$/;

                function formataData(v){
                    
                    if(v) {
                        if(angular.isDate(v)) {
                            return moment(v).format('dd/MM/yyyy');
                        } else {
                            v = v.replace(/\D/g,""); 
                            v = v.replace(/(\d{2})(\d)/,"$1/$2"); 
                            v = v.replace(/(\d{2})(\d)/,"$1/$2");
                            return v;
                        }
                    }
                } 
                
                $scope.$watch(attrs.ngModel, function(value) {   
                    
                    if (value == '' || value && angular.isDate(value) && patternValidaData.test(value)){
                        msValidatorService.removeError(element.parent(), attrs);
                    }
                    
                });
               
                element.bind("keyup", function() {
                    
                    function isDatePtBr(elementValue, modelValue) {
                        
                        var dateSplit = elementValue.split('/');
                        var stringDate = "'" + dateSplit[2] + '-' + dateSplit[1] + '-' + dateSplit[0] + "'";
                        return angular.isDate(modelValue) && patternValidaData.test(elementValue);
                    }
                    
                    var formatado = formataData(controller.$viewValue);                    

                    if(formatado && formatado.length > element.attr('maxlength')) {
                        var diff = element.attr('maxlength') - formatado.length;

                        formatado = formatado.substring(12, diff);
                    }

                    element.val(formatado);

                    controller.$setViewValue(formatado);
                    
                    if(controller.$viewValue && controller.$viewValue.length == 10) {
                        if(angular.isString(element.val())) {
                            if(!isDatePtBr(element.val(), controller.$modelValue)) {
                                msValidatorService.showError(element.parent(), attrs, 'A data informada: ' + element.val() +  ' é inválida.');
                                controller.$setValidity(false);
                                element.val('');
                            }
                            else {
                                msValidatorService.removeError(element.parent(), attrs);
                                controller.$setValidity(true);                                
                            }
                        }
                    }
                    else {
                        msValidatorService.removeError(element.parent(), attrs);
                    }
                });
                
                
                element.bind("blur", function() {
                    if (controller.$viewValue && controller.$viewValue.length < 10) {
                        controller.$viewValue = undefined;
                        controller.$render();
                    }
                    msValidatorService.removeError(element.parent(), attrs);
                });
            }
          };
    }]);

    return msMask;
            
}();
!function(msMask) {
    'use stric';
    
    var msMask = angular.module('msMask');

    msMask.directive('msMask', ['msMaskService', '$compile', function(msMaskService, $compile) {
        return {
            priority:1001, // compiles first
            terminal:true, // prevent lower priority directives to compile after it
            compile: function(element, attrs) {
                return {
                    pre: function(scope, element, attributes, controller){

                    },
                    post: function(scope, element, attributes, controller){
                        var mask = msMaskService.getMask(attrs.msMask);
                        element.removeAttr('ms-mask');
                            
                        if(attrs.msMask != 'currency') {
                            element.attr('maxlength', mask.length);
                            element.attr('placeholder', mask.replace(/[0-9]/g, '_'));
                        }

                        if(attrs.msMask == 'currency') {
                            element.attr('ms-currency-mask', '');
                        }
                        else if(attrs.msMask == 'date' && attrs.datepickerPopup) {
                            element.attr('ms-datepicker-mask', '');
                        }
                        else {
                            element.attr('ui-mask', mask);
                        }

                        $compile(element)(scope);
                    }
                }
            }
        }
    }]);

    return msMask;        
}();
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