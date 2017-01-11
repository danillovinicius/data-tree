//define([
//        //'componentes/ms-notify/services/msNotifyProvider'
//        ], 
		!function() {
		
		'use strict';
                
                var msNotify = angular.module('msNotify');
	    
		msNotify.factory('$msAlertService', ['$rootScope', '$log', function($rootScope, $log) {
                    
                    var _container = [];
                    var _messages = {};
                    
                    var setContainer = function(containerId) {
                        _container.push(containerId);
                    }
                    
                    var getActiveContainer = function() {
						
                        var _containerTmp = [];
						
                        _containerTmp = _containerTmp.concat(_container);
                   
                        angular.forEach(_containerTmp, function(containerId, index) {
                            if(typeof angular.element('#'+ containerId) == "undefined" || angular.element('#'+ containerId).length  == 0) {
                                var indiceRemove = _container.indexOf(containerId);
                                _container.splice(indiceRemove, 1);
                                delete _messages[containerId];
                            }
                        });
                        
                        return _.last(_container);
                    }

					
                    var setMessages = function($message, $type, $default, $persist) {
                        var messageContainer = getActiveContainer();
                        
                         var messageGroup = '<ul>';
                        
                        _messages[messageContainer] = [];
                        
                        /**
                         * $message deve sempre vir envelopado no modelo de objeto:
                         * messages: [{
                         *  code: 123,
                         *  texto: 'Mensagem'
                         * }]
                         */
                        if($message instanceof Array) {
                            if($message.length) {
                                angular.forEach($message, function(message) {
                                    messageGroup += "<li>";
                                    messageGroup += (message.texto) ? message.texto : $default;
                                    messageGroup += "</li>";
                                });
                            }
                        }
                        else {
                            
                            messageGroup += "<li>";
                            messageGroup += ($message) ? $message : $default;
                            messageGroup += "</li>";
                        }
                        
                        messageGroup += "</ul>";
                        
                        _messages[messageContainer].push({
                           message: messageGroup,
                           type: $type,
                           persist: $persist
                       });
                        
                        $rootScope.$broadcast('_START_ALERT_', _messages[messageContainer], messageContainer);
                    };
                        
                    var clear = function() {
                        _messages = {};
                        $rootScope.$broadcast('_STOP_ALERT_');
                    };
                    
	            return {
                        setContainer: setContainer,
                        clear: clear,
	                success: function($message, $persist) {
                            return setMessages($message, "success", "<strong>Sucesso!</strong> Operação efetuada com sucesso.", $persist);
	                },
	                info : function($message, $persist) {
                            return setMessages($message, "info", "<strong>Observação.</strong> Verifique os dados.", $persist);
	                },
	                warning : function($message, $persist) {
                            return setMessages($message, "warning", "<strong>Atenção!</strong> Verifique as informações.", $persist);
	                },
	                error : function($message, $persist) {
                            return setMessages($message, "danger", "<strong>Erro!</strong> Ocorreu um erro.", $persist);
	                }
	            };
	    }]);
		
		return msNotify;
		
}();