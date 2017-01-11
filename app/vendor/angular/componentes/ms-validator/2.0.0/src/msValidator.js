!function() {
    'use strict';
    var msValidator =  angular.module('msValidator', ['validator']);

    msValidator.config(['$provide', '$compileProvider', '$validatorProvider', 
                        function( $provide, $compileProvider, $validatorProvider){


            msValidator._directive = msValidator.directive;
            msValidator.directive = function( name, constructor ) {
                $compileProvider.directive( name, constructor );
                return( this );

            };  

            msValidator._factory = msValidator.factory;
            msValidator.factory = function( name, constructor ) {
                $provide.factory( name, constructor );
                return( this );

            };

            msValidator.$validatorProvider = $validatorProvider;


            msValidator.showError = function (element, attrs, message) {

                if(attrs.type == 'radio' || attrs.type == 'checkbox') {
                    element = angular.element(element[0].parentElement);
                }

                if(attrs.validatorParent) {
                   element = angular.element('#' + attrs.validatorParent); 
                }

                var id = element[0].id;
                var newElement = angular.element('<div id="' + id + '-error-message" class="alert alert-danger">' + message + '</div>');

                if(element.hasClass('has-error')) {
                    angular.element('#' + id + '-error-message').remove();
                }
                else {
                    element.addClass('has-error');
                }

                element.after(newElement);
            }

            msValidator.removeError = function (element, attrs) {
                if(attrs.type == 'radio' || attrs.type == 'checkbox') {
                    element = angular.element(element[0].parentElement);
                }

                if(attrs.validatorParent) {
                   element = angular.element('#' + attrs.validatorParent); 
                }

                var id = element[0].id;
                angular.element('#' + id + '-error-message').remove();
            }

            /*
             * Regras de validação padrões
             */
            msValidator._validators = {
                cpf: function(value, scope, element, attrs, $injector) {
                    return (!value) ? true : window.CPF.isValid(value);
                },
                required: /.+/,
                email: function(value) {
                    if (!value || value.trim() == '') {
                        return true;
                    }
                    return (/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(value);
                }, 
                number: /^[-+]?[0-9]*[\.]?[0-9]*$/,
                url: /^((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_\#]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)*$/,
                cnpj: function(value, scope, element, attrs, $injector) {
                    return (!value) ? true : window.CNPJ.isValid(value);
                },
                date: function(value, scope, element, attrs, $injector) {
                    
                    return (!value) ? true : angular.isDate(value);
                },
                dateGte: function(value, scope, element, attrs, $injector) {

                    if (!value || typeof value === 'string' || !typeof value.getMonth === 'function') {
                        return true;
                    } 
                    if(attrs.min) {
                        if(typeof value != 'undefined') {
                            var date = moment(value);
                            scope.dateGte = parseDate(scope, attrs.min, $injector);

                            if(angular.isDate(scope.dateGte)) {
                                scope.dateGte.setHours(0,0,0,0);
                                var limit = moment(scope.dateGte);
                                return  (date.diff(limit, 'days', true) >= 0);
                            }
                            else
                                return true;
                        }
                        else
                            return true;
                    }
                    else
                    {
                        throw 'Não foi informada uma data de início para validação "maior ou igual a - (dateGte)".';
                    }
                },
                dateLte: function(value, scope, element, attrs, $injector) {
                    if (!value || typeof value === 'string' || !typeof value.getMonth === 'function') {
                        return true;
                    }
                    if(attrs.max) {
                        if(typeof value != 'undefined') {
                            value.setHours(0,0,0,0);
                            var date = moment(value);
                            scope.dateLte = parseDate(scope, attrs.max, $injector);

                            if(angular.isDate(scope.dateLte)) {
                                scope.dateLte.setHours(0,0,0,0);
                                var limit = moment(scope.dateLte);
                                return  (date.diff(limit, 'days', true) <= 0);
                            }
                            else
                                return true;
                        }
                        else {
                            return true;
                        }
                    }
                    else
                    {
                        throw 'Não foi informada uma data fim para validação "menor ou igual a - (dateLte)".';
                    }
                },
                dateGt: function(value, scope, element, attrs, $injector) {

                    if (!value || typeof value === 'string' || !typeof value.getMonth === 'function') {
                        return true;
                    }
                    if(attrs.min) {
                        if(typeof value != 'undefined') {
                            var date = moment(value);
                            scope.dateGt = parseDate(scope, attrs.min, $injector);

                            if(angular.isDate(scope.dateGt)) {
                                scope.dateGt.setHours(0,0,0,0);

                                var limit = moment(scope.dateGt);
                                return  (date.diff(limit, 'days', true) > 0);
                            }
                            else
                                return true;
                        }
                        else {
                            return true;
                        }
                    }
                    else
                    {
                        throw 'Não foi informada uma data de início para validação "maior que - (dateGte)".';
                    }
                },
                dateLt: function(value, scope, element, attrs, $injector) {

                    if (!value || typeof value === 'string' || !typeof value.getMonth === 'function') {
                        return true;
                    } 
                    if(attrs.max) {
                        if(typeof value != 'undefined') {
                            value.setHours(0,0,0,0);
                            var date = moment(value);
                            scope.dateLt = parseDate(scope, attrs.max, $injector);

                            if(angular.isDate(scope.dateLt)) {
                                scope.dateLt.setHours(0,0,0,0);

                                var limit = moment(scope.dateLt);
                                return  (date.diff(limit, 'days', true) < 0);
                            }
                            else
                                return true;
                        }
                        else {
                            return true;
                        }
                    }
                    else
                    {
                        throw 'Não foi informada uma data inicial para validação "menor que - (dateLt)".';
                    }
                },
                dateBtw: function(value, scope, element, attrs, $injector) {

                    if(typeof value != 'undefined') {
                        var date = moment(value);
                    }
                    else {
                        return true;
                    }

                    if(attrs.min) {
                        scope.dateBtwGte = parseDate(scope, attrs.min, $injector);

                        if(angular.isDate(scope.dateBtwGte)) 
                            scope.dateBtwGte.setHours(0,0,0,0);

                        var gte = moment(scope.dateBtwGte);
                    }
                    else
                    {
                        throw 'Não foi informada uma data inicial para validação "entre X e Y - (dateBtw)".';
                    }

                    if(attrs.max) {
                        scope.dateBtwLte = parseDate(scope, attrs.max, $injector);

                        if(angular.isDate(scope.dateBtwLte))
                            scope.dateBtwLte.setHours(0,0,0,0);

                        var lte = moment(scope.dateBtwLte);
                    }
                    else
                    {
                        throw 'Não foi informada uma data fim para validação "entre X e Y - (dateBtw)".';
                    }
                    if(angular.isDate(scope.dateBtwLte) && angular.isDate(scope.dateBtwGte)) 
                        return  ((date.valueOf() <= lte.valueOf()) && (date.valueOf() >= gte.valueOf()));
                    else
                        return true;
                }
            }

            /**
             * REQUIRED
             */

            $validatorProvider.register('required', {
                invoke: 'blur',
                validator: msValidator._validators.required,
                error: function(value, scope, element, attrs, $injector){
                    msValidator.showError(element, attrs,'Este campo é obrigatório');
                },
                success: function(value, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });


            /**
             * NUMBER
             */
            $validatorProvider.register('number', {
                invoke: 'watch',
                validator: msValidator._validators.number,
                error: function(value, scope, element, attrs){
                    msValidator.showError(element, attrs,'Este campo só aceita números');
                },
                success: function(value, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });

            /**
             * EMAIL
             */
            $validatorProvider.register('email', {
                invoke: 'blur',
                validator: msValidator._validators.email,
                error: function(x, scope, element, attrs){
                    msValidator.showError(element, attrs,'Informe um email correto');
                },
                success: function(x, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });

            /*
             * URL
             */
            $validatorProvider.register('url', {
                invoke: 'watch',
                validator: msValidator._validators.url,
                error: function(value, scope, element, attrs){
                    msValidator.showError(element, attrs,'Informe uma URL válida');
                },
                success: function(value, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });

            /*
             * CPF
             */
            $validatorProvider.register('cpf', {
                invoke: 'blur',
                validator: msValidator._validators.cpf,
                error: function(value, scope, element, attrs){
                    msValidator.showError(element, attrs, 'Informe um CPF válido');
                },
                success: function(value, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });

            /*
             * CNPJ
             */
            $validatorProvider.register('cnpj', {
                invoke: 'blur',
                validator: msValidator._validators.cnpj,
                error: function(value, scope, element, attrs){
                    msValidator.showError(element, attrs, 'Informe um CNPJ válido.');
                },
                success: function(value, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });

            /*
             * Função de parser de data
             */

            function parseDate(scope, toParse, $injector) {
                var $parse = $injector.get('$parse');
                var parseGetter = $parse(toParse);
                return parseGetter(scope);
            }




            /**
             * Date
             */

            $validatorProvider.register('date', {
                invoke: 'watch',
                validator: msValidator._validators.date,
                error: function(value, scope, element, attrs, $injector){
                    msValidator.showError(element, attrs,'A data informada nao é válida.');
                },
                success: function(value, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });


            /*
             * DateLte
             * Deve-se informar o valor limite com o atributo end-date
             */
            $validatorProvider.register('dateLte', {
                invoke: 'blur',
                validator: msValidator._validators.dateLte,
                error: function(value, scope, element, attrs, $injector){
                    var dateLte = parseDate(scope, attrs.min, $injector);
                    var message = (attrs.validatorMessage) ? attrs.validatorMessage : 'Informe uma data menor ou igual a ' + moment(dateLte).format('DD/MM/YYYY'); 
                    msValidator.showError(element, attrs, message);
                },
                success: function(value, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });

            /*
             * Dategte
             * Deve-se informar o valor limite com o atributo init-date
             */
            $validatorProvider.register('dateGte', {
                invoke: 'blur',
                validator: msValidator._validators.dateGte,
                error: function(value, scope, element, attrs, $injector){
                    var dateGte = parseDate(scope, attrs.min, $injector);
                    var message = (attrs.validatorMessage) ? attrs.validatorMessage : 'Informe uma data maior ou igual a ' + moment(dateGte).format('DD/MM/YYYY'); 
                    msValidator.showError(element, attrs, message);
                },
                success: function(value, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });



            /*
             * DateGt
             * Deve-se informar o valor limite com o atributo init-date
             */
            $validatorProvider.register('dateGt', {
                invoke: 'blur',
                validator: msValidator._validators.dateGt,
                error: function(value, scope, element, attrs, $injector){
                    var dateGt = parseDate(scope, attrs.min, $injector);
                    var message = (attrs.validatorMessage) ? attrs.validatorMessage : 'Informe uma data maior que ' + moment(dateGt).format('DD/MM/YYYY'); 
                    msValidator.showError(element, attrs, message);
                },
                success: function(value, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });



            /*
             * DateLt
             * Deve-se informar o valor limite com o atributo init-date
             */
            $validatorProvider.register('dateLt', {
                invoke: 'blur',
                validator: msValidator._validators.dateLt,
                error: function(value, scope, element, attrs, $injector){
                    var dateLt = parseDate(scope, attrs.min, $injector);
                    var message = (attrs.validatorMessage) ? attrs.validatorMessage : 'Informe uma data menor que ' + moment(dateLt).format('DD/MM/YYYY'); 
                    msValidator.showError(element, attrs, message);
                },
                success: function(value, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });

            /*
             * DateBtw (Between)
             * Deve-se informar o valor inicial com o atributo min(padrão do datepicker) e o final com o atributo max(padrão datepicker)
             */
            $validatorProvider.register('dateBtw', {
                invoke: 'watch',
                validator: msValidator._validators.dateBtw,
                error: function(value, scope, element, attrs, $injector){
                    var dateBtwGte = parseDate(scope, attrs.min, $injector);
                    var dateBtwLte = parseDate(scope, attrs.max, $injector);
                    var message = (attrs.validatorMessage) ? attrs.validatorMessage : 'Informe uma data maior ou igual a ' + moment(dateBtwGte).format('DD/MM/YYYY') + ' e menor ou igual que ' + moment(dateBtwLte).format('DD/MM/YYYY'); 
                    msValidator.showError(element, attrs, message);
                },
                success: function(value, scope, element, attrs) {
                    msValidator.removeError(element, attrs);
                }
            });

    }]);

    return msValidator;		
}();
   