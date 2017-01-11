//define([
//        //'angular'
//        ], 
		!function() {
			'use strict';
			try {
				var msNotify = angular.module('msNotify', []);
                                
                                /*
                                 * Injecting into $rootScope
                                 */
                                msNotify.run(['$rootScope', '$msNotifyService', '$msAlertService', function($rootScope, $msNotifyService, $msAlertService) {
                                        $rootScope.$msNotify = $msNotifyService;
                                        $rootScope.$msAlert = $msAlertService;
                                        $rootScope.closeAlert = function(messages, index) {
                                            messages.splice(index, 1);
                                        };
                                        
                                }]);
                            
                            return msNotify;
			}
			catch(e) {
				$log.error(e);
			}
		
}();

//define([
////      'componentes/ms-notify/msNotify',
////      'msControllers/msAlertController',
////      'componentes/ms-notify/services/msAlertService'
//      ], 
		!function() {
		
		'use strict';
              
		var msNotify = angular.module('msNotify');
		
		msNotify.directive('msAlert', ['$msAlertService', '$compile', '$timeout',  function($msAlertService, $compile, $timeout) {
                  return {
                      restrict:'EA',
                      controller: 'msAlertController',
                      /*
                      template:"<div class='alert' ng-class='\"alert-\" + (type || \"warning\")'>\n" +
                                      "    <button ng-show='closeable' type='button' class='close' ng-click='close()'>&times;</button>\n" +
                                      "    <div ng-transclude></div>\n" +
                                      "</div>\n",
                                      */
                      //transclude:true,
                      replace:true,
                      scope: true,
                      link: function(scope, element, attrs, ctrl) {
                          
                          //Atribuindo o ID do scope atual ao ELEMENTO
                          attrs.$set('id', scope.$id);
                          
                          //Setando o container para o serviço de mensageria
                          $msAlertService.setContainer(scope.$id);
                          
                          /**
                           * Quando o evento de mensageria for disparado, executo a exibição das 
                           * mensagens no respectivo container/scope
                           */
                          
                          scope.$on('_START_ALERT_', function(object, msgs, container) {
                              //Atribuindo as mensagens apenas ao respectivo scope.
                              if(scope.$id == container) {
                                  if (scope.messages == null){
                                      scope.messages= [];
                                  }
                                  
                                  msgs.push.apply(msgs, scope.messages);
                                  
                                  var newMsgs = [];
                                  
                                  angular.forEach(msgs, function(message) {
                                      newMsgs[message.type] = message;
                                  });
                                  
                                  scope.messages = _.values(newMsgs) ;
                              }
                              
                              var container = angular.element('#' + container);
                              
		                var template = angular.element("<div ng-repeat='alert in messages' class='alert' ng-class='\"alert-\" + (alert.type || \"warning\")'>\n" +
                                                              "    <button type='button' class='close' ng-click='closeAlert(messages, $index)'>&times;</button>\n" +
                                                              "    <span ms-compile='alert.message'></span>\n" +
                                                              "</div>\n");
		                
		                $compile(template)(scope);
		                container.html(null).append( template );
                          });
                          
                          /*
                           * Limpando todos os alerts
                           */
                          scope.$on('_STOP_ALERT_', function() {
                          	scope.messages = {};
                          });

                      }
                  };
		}]);
		
		return msNotify;
		
}();


//define([
//      //'componentes/ms-notify/services/msNotifyProvider'
//      ], 
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
//define([
//      //'componentes/ms-notify/msNotify'
//      ], 
		!function() {
		
		'use strict';
              
              var msNotify = angular.module('msNotify');
	    
		msNotify.factory('$msNotifyProvider', function() {
	        try {
	           return function(){
	               return noty(arguments[0]);
	           };
	        }
	        catch(e) {
	        	$log.error(e);
	        }
	    });
		
		return msNotify;
		
}();
//define([
//      //'componentes/ms-notify/services/msNotifyProvider'
//      ], 
		!function() {
		
		'use strict';
              
              var msNotify = angular.module('msNotify');
	    
		msNotify.factory('$msNotifyService', ['$msNotifyProvider', '$log', function($msNotifyProvider, $log) {
			return {
                          init: function($message, $type, $config) {
                              
                              if($message instanceof Array) {
                                 
                                  if($message.length) {
                                      angular.forEach($message, function(message) {
                                          $config.text = (message.texto) ? message.texto : $config.text;
                                          $msNotifyProvider($config);
                                      });
                                  }
                              }
                              else {
                                  $config.text = ($message) ? $message : $config.text;
                                  $msNotifyProvider($config);
                              }
                          },
                          error : function($message) {
                              try {
                                  var config = {
                                      text: '<h5>Oops, ocorreu um erro.</h5>',
                                      type: 'error',
                                      layout: 'topCenter',
                                      //modal:true,
                                      timeout: 20000,
                                      force: true,
                                      dismissQueue: true,
                                      closeWith: ['button'] // ['click', 'button', 'hover']
                                  };
                                  return this.init($message, 'error', config);
                              }
                              catch(e) {
                                      $log.error(e);
                              }
                          },
                          success : function($message) {
                              try{
                                  var config = {
                                      text: '<h5>Operação efetuada com sucesso.</h5>',
                                      type: 'success',
                                      layout: 'topCenter',
                                      timeout: 2000
                                  };

                                  return this.init($message, 'success', config);
                              }
                              catch(e) {
                                  this.error(e);
                              }
                          },
                          warning : function($message) {
                              try{
                                  var config = {
                                      text: '<h5>Atenção!</h5>',
                                      type: 'alert',
                                      layout: 'topCenter',
                                      timeout: 2000,
                                      force: true,
                                      dismissQueue: true
                                  };

                                  return this.init($message, 'warning', config);
                              }
                              catch(e) {
                                  this.error(e);
                              }
                          },
                          info : function($message) {
                              try{

                                  var config = {
                                      text: '<h5>Verifique as seguintes informações:</h5>',
                                      type: 'information',
                                      layout: 'topCenter',
                                      timeout: 2000
                                  };
                                  return this.init($message, 'information', config);
                              }
                              catch(e) {
                                  this.error(e);
                              }
                          },
                          loading : function($message) {
                              try {

                                  var config = {
                                      text: '<h5>Aguarde</h5>',
                                      layout: 'center',
                                      modal:true,
                                      force: true,
                                      maxVisible: 1,
                                      animation: {
                                          open: {height: 'toggle'},
                                          close: {height: 'toggle'},
                                          easing: 'swing',
                                          speed: 100 // opening & closing animation speed
                                      },
                                  };

                                  return this.init($message, 'warning', config);

                              }
                              catch(e) {
                                  this.error(e);
                              } finally{
                              	$rootScope.$broadcast('_STOP_ALERT_');
                              }
                          },
                          close: function() {
                              jQuery.noty.closeAll();
                          }
	        };
	    }]);
		
		return msNotify;
		
}();