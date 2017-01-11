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