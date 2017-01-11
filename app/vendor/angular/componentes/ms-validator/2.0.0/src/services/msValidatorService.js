!function() {
    'use strict';

    var msValidator = angular.module('msValidator');
    
    msValidator.factory('msValidatorService', ['$log', '$validator',  
        function($log, $validator){

           'use strict';

           var setErrorMessage = function setErrorMessage(rules) {
               try{
                   if(typeof rules == 'string') {
                       throw 'As mensagens de validação devem ser informadas em um objeto no formato {regra: mensagem}';
                   }

                   angular.forEach(rules, function(message, rule) {

                       var validatorRule = $validator.getRule(rule);

                       msValidator.$validatorProvider.register(rule, {
                           invoke: validatorRule.invoke,
                           validator: msValidator._validators[rule],
                           error: function(value, scope, element, attrs){
                               msValidator.showError(element, attrs, message);
                           },
                           success: validatorRule.success
                       });

                   });

               }
               catch(e) {
                   $log.error(e);
               }
           }

           var register = function(obj) {
               msValidator.$validatorProvider.register(obj.rule, {
                   invoke: obj.invoke,
                   validator: obj.validator,
                   error: function(value, scope, element, attrs){
                       msValidator.showError(element, attrs, obj.message);
                   },
                   success: function(value, scope, element, attrs){
                       msValidator.removeError(element, attrs);
                   }
               });
           }

           return {
               setErrorMessage: setErrorMessage,
               register: register,
               validate: $validator.validate,
               reset: $validator.reset,
               getRule: $validator.getRule,
               showError: msValidator.showError,
               removeError: msValidator.removeError
           };
   }]);

    return msValidator;
		
}();