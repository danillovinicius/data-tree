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
   
!function() {
    'use strict';

    var msCkeditor = angular.module('msCkeditor');

    msCkeditor.directive('msCkeditor', ['$parse', function($parse) {
        return {
            require: '?ngModel',
            link: function(scope, elm, attr, ngModel) {
                if(typeof CKEDITOR != 'undefined') {
					var ckGetter = $parse(attr.msCkeditor);
					var ck = CKEDITOR.replace(elm[0], ckGetter(scope));

					if (!ngModel) return;

					ck.on('instanceReady', function() {
					  ck.setData(ngModel.$viewValue);
					});

                    var updateModel = function () {
                        scope.$apply(function() {
                            ngModel.$setViewValue(ck.getData());
                        });
                    }

					ck.on('change', updateModel);
					ck.on('key keyup keypress', updateModel);

					ngModel.$render = function(value) {
					  ck.setData(ngModel.$viewValue);
					};
				}
            }
          };
    }]);
    return msCkeditor;
			
}();