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
!function() {
    'use strict';
    return angular.module('msSpinner', []);		
}();
   
!function() {
		
    'use strict';

    var msSpinner = angular.module('msSpinner');

    msSpinner.directive('msLoadingSpinner', [function () {
        return {
            restrict: "EA",
            link: function (scope, element, attrs) {

                var loadingContent = angular.element('<div class="loading-content"></div>');
                var loadingLayer = angular.element('<div class="loading"></div>');
                element.append(loadingLayer);

                if(attrs.loaderContent) {
                    loadingLayer.append(loadingContent);
                }

                element.addClass('loading-container');
                scope.$watch(attrs.loader, function(value) {
                    loadingLayer.toggleClass('ng-hide', !value);
                });
            }
        };
    }]);

    return msSpinner;
		
}();


!function() {
    'use strict';
    var msSpinner = angular.module('msSpinner');

    msSpinner.factory('msRequestSpinner', ['$rootScope', function($rootScope){

        var _START_REQUEST_ = '_START_REQUEST_';
        var _END_REQUEST_ = '_END_REQUEST_';

        var requestStarted = function() {
            $rootScope.$broadcast(_START_REQUEST_);
        };

        var requestEnded = function() {
            $rootScope.$broadcast(_END_REQUEST_);
        };

        var onRequestStarted = function($scope, handler){
            $scope.$on(_START_REQUEST_, function(event){

                if(handler)
                    handler();

                $rootScope.$msNotify.loading();
            });
        };

        var onRequestEnded = function($scope, handler){
            $scope.$on(_END_REQUEST_, function(event){
                if(handler)
                    handler();
                $rootScope.$msNotify.close();
            });
        };

        return {
            requestStarted:  requestStarted,
            requestEnded: requestEnded,
            onRequestStarted: onRequestStarted,
            onRequestEnded: onRequestEnded
        };
    }]);

    return msSpinner;
			
}();
!function () {
    'use strict';
    var msSeguranca = angular.module('msSeguranca', ['ngCookies']);

    msSeguranca.run(['$rootScope', 'msSegurancaService', '$state', 'msAutenticacaoService',
        function ($rootScope, msSegurancaService, $state, msAutenticacaoService) {


            $rootScope.$on('timer-stopped', function (event, data) {
                if (msSegurancaService.isUsuarioAutenticado()) {
                    msAutenticacaoService.sair().then(function (result) {
                        $state.go('login');
                        $rootScope.$msAlert.error('Seu tempo de sessão expirou', true);
                    });
                }
            });

            $rootScope.$on('$stateChangeError', function (ev, to, toParams, from, fromParams, error) {
                if (error.status === 401 && msSegurancaService.isUsuarioAutenticado() && msSegurancaService.getToken()) {
                    msSegurancaService.setUsuarioAutenticado(false);
                    $state.go('login');
                }
            });


            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

                $rootScope.isUsuarioAutenticado = msSegurancaService.isUsuarioAutenticado();

                if (toState.roles) {
                    if (msSegurancaService.isUsuarioAutenticado()) {

                        $rootScope.limite = msSegurancaService.contador();

                        $rootScope.$on('UsuarioAutenticado', function (event, data) {
                            $rootScope.usuarioAutenticado = data;
                        });

                        msAutenticacaoService.recuperarDadosUsuario().then(function (usuario) {

                            if (toState.name == 'login') {
                                if ($state.get(appConfig.login.sucesso))
                                    $state.go(appConfig.login.sucesso);
                            }
                            else {

                                msSegurancaService.possuiAcesso(toState.roles).then(function (result) {

                                    $state.go(toState.name, toParams, {notify: false}).then(function () {
                                        $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                                    });

                                }, function (reason) {
                                    $rootScope.$msNotify.info(reason);
                                    if ($state.get(appConfig.login.sucesso))
                                        $state.go(appConfig.login.sucesso);
                                    else {
                                        $rootScope.$msNotify.error('A rota de acesso não foi encontrada');
                                    }
                                });
                            }


                        }, function (erro) {
                            $rootScope.$msNotify.error('Não foi possível acessar a rota.');
                        });

                    }
                    else {
                        $rootScope.$msNotify.info('É necessário estar logado para acessar essa funcionalidade.');
                        event.preventDefault();
                        if (appConfig.defaultRoute) {
                            $state.go(appConfig.defaultRoute);
                        }
                        else {
                            $rootScope.$msNotify.info('Não foi informada uma rota pública padrão.');
                        }
                    }
                }
                else {
                    var goTo = toState.name;

                    if (msSegurancaService.isUsuarioAutenticado()) {
                        if (toState.name == 'login') {
                            goTo = appConfig.login.sucesso;
                        }
                        else {
                            $rootScope.$msNotify.info('A funcionalidade requerida só pode ser acessada publicamente');
                            event.preventDefault();
                            return;
                        }
                    }

                    $state.go(goTo, toParams, {notify: false}).then(function () {
                        $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                    });
                }

            });
        }]);
    return msSeguranca;

}();
   
!function() {
    'use strict';

    var msSeguranca = angular.module('msSeguranca');

    msSeguranca.factory('msSegurancaService', ['$cookieStore', '$q', '$rootScope', function($cookieStore, $q, $rootScope) {

        var _usuarioAutenticado, _token;

        var setUsuario = function(usuarioAutenticado) {
            $rootScope.usuarioAutenticado = usuarioAutenticado;
            _usuarioAutenticado = usuarioAutenticado; 
            //$rootScope.usuarioAutenticado = usuarioAutenticado;
        };

        var getUsuario = function() {
            return _usuarioAutenticado; 
            //return $rootScope.usuarioAutenticado;
        };

        var setUsuarioAutenticado = function(value){

            if(true === value) {
                $cookieStore.put('isUsuarioAutenticado', value);
                contador();
            }
            else {
                destruirSessao();
            }
        };


        var setTempoLimite = function(value) {
            try{
                var tempoLimite = new Date(getTempoInicial() + value*60000);
                $cookieStore.put('tempoLimite', tempoLimite.getTime());
            }
            catch(e) {
                $rootScope.$msNotify.error(e);
            }
        };

        var getTempoLimite = function() {
            return $cookieStore.get('tempoLimite');
        };

        var isUsuarioAutenticado = function(){
            return $cookieStore.get('isUsuarioAutenticado');
        };

        var possuiAcesso = function(rolesPermitidas, usuario) {
            var deferred = $q.defer();
            var usuario = (!usuario) ? getUsuario() : usuario;

            if(typeof usuario != 'undefined') {

                var possui = false;
                if(rolesPermitidas) {
                    angular.forEach(usuario.roles, function(val) {
                        if(rolesPermitidas.indexOf(val) != -1) {
                            possui = true;
                        }
                    });

                    if(rolesPermitidas.indexOf('*') != -1) {
                        possui = true;
                    }
                }

                if(possui) {
                    deferred.resolve(this);
                }
                else {
                    if(rolesPermitidas)
                        deferred.reject('Usuário sem permissão de acesso');
                    else
                        deferred.reject('A funcionalidade requerida só pode ser acessada publicamente.');
                }

                return deferred.promise;
            }

            return deferred.promise;
        };


        var setTempoInicial = function(value) {
            $cookieStore.put('tempoInicial', value);
        };

        var getTempoInicial = function() {
            return $cookieStore.get('tempoInicial');
        };

        var destruirSessao = function() {
            $cookieStore.remove('tempoInicial');
            $cookieStore.remove('tempoLimite');
            $cookieStore.remove('isUsuarioAutenticado');
            $cookieStore.remove('msToken');
        };


        var contador = function() {

            if(isUsuarioAutenticado()) {
                var date = new Date();
                var tempoAtual = date.getTime();
                var totalTimeOn = (getTempoLimite()) ? (tempoAtual - getTempoLimite())/1000 : 0;

                if(totalTimeOn > 0) {
                    setUsuarioAutenticado(false);
                }
                else {
                    setTempoInicial(date.getTime());
                    setTempoLimite(appConfig.login.limite);
                }
                return getTempoLimite();
            }
        };

        var setToken = function(token) { 
            if(typeof token != 'undefined') {
                $cookieStore.put('msToken', token);
                setUsuarioAutenticado(true); 
            }
        };

        var getToken = function() {
            return $cookieStore.get('msToken'); 
        };

        return {
            contador: contador,
            possuiAcesso: possuiAcesso,
            isUsuarioAutenticado: isUsuarioAutenticado,
            setUsuarioAutenticado: setUsuarioAutenticado,
            setUsuario: setUsuario,
            setToken: setToken,
            getToken: getToken,
            getUsuario: getUsuario
        }

    }]);

    return msSeguranca;
		
}();
!function() {	
    'use strict';

    var msSeguranca = angular.module('msSeguranca');

    msSeguranca.factory('msAutenticacaoService', ['$rootScope',  '$q', 'msSegurancaService', '$http', 
        function($rootScope, $q, msSegurancaService, $http) {

        var getUserData = function(deferred, token) {
            if(!msSegurancaService.getUsuario()) {
                $http.get(
                    appConfig.login.url_usuario,{token: token}
                ).then(function(response){
                    msSegurancaService.setUsuario(response.data.resultado.usuario);
                    $rootScope.$broadcast('USER_LOGGED_IN', response.data.resultado.usuario);
                    deferred.resolve(msSegurancaService.getUsuario());
                }, function(reason) {
                    deferred.reject(reason);
                });
            }
            else {
                deferred.resolve(msSegurancaService.getUsuario());
            }
        }

        var recuperarDadosUsuario = function() {
            var deferred = $q.defer();
            var token = msSegurancaService.getToken();
            if(msSegurancaService.isUsuarioAutenticado()) { 
                $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
                getUserData(deferred, token);
            }
            else {
                deferred.reject('Não foi possível recuperar os dados do usuário.');
            }

            return deferred.promise;

        };

        var autenticar = function(credentials) {
            var deferred = $q.defer();

            $http({
                    method  : 'POST',
                    url     : appConfig.login.url,
                    data    : credentials
                }).then(function(response) {
                    var token = response.data.access_token;
                    msSegurancaService.setToken(token);
                    $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
                    getUserData(deferred, token);
                    
            }, function(reason){
                deferred.reject(reason);
            });

            return deferred.promise;
        };

        var sair = function() {
            try{
                var deferred = $q.defer();

                var params = {
                    token : msSegurancaService.getToken()
                };

                $http({
                    url     : appConfig.logout.url,
                    method  : 'POST',
                    data    : params
                }).success(function(data, status, headers, config) {
                    msSegurancaService.setUsuarioAutenticado(false);
                    msSegurancaService.setUsuario(false);
                    delete $http.defaults.headers.common.Authorization;
                    //Parando o contador
                    $rootScope.$broadcast('timer-stop');
                    deferred.resolve(msSegurancaService);
                });

                return deferred.promise;
            }
            catch(e) {
                $rootScope.$msAlert.error(e);
            }
        };

        return {
            autenticar: autenticar,
            sair: sair,
            recuperarDadosUsuario: recuperarDadosUsuario
        }

    }]);

    return msSeguranca;
		
}();
!function() {
		
    'use strict';

    var msSeguranca = angular.module('msSeguranca');

    msSeguranca.directive('msContador', ['$compile', function($compile) {

        return {
            restrict: 'E',
            link: function(scope, element, attrs, ctrl) {
                try {
                    scope.$watch(attrs.limite, function(content) {
                        var template = angular.element('<timer end-time="limite">{{minutes}}:{{seconds}}</timer>');
                        element.html( template );
                        $compile(element.contents())(scope);
                    });

                }
                catch(e) {
                    scope.$msNotify.error(e);
                }
            }
        };
    }]);

    return msSeguranca;
		
}();


!function() {
		
    'use strict';

    var msSeguranca = angular.module('msSeguranca');

    msSeguranca.directive('msSeguranca',  ['msSegurancaService', 'msAutenticacaoService', '$parse', '$animate', '$rootScope',
        function(msSegurancaService, msAutenticacaoService, $parse, $animate, $rootScope) {

        return {
            restrict: 'EA',
            transclude: 'element',
            priority: 600,
            link: function(scope, element, attrs, ctrl, $transclude) {

                var rolesPermissaoArray, block, childScope;

                /*
                 * Recuperando as roles do objeto.
                 */

                if(attrs.roles.match(/,/g)) {
                    var trimmed = attrs.roles.replace(/\s+/g, '');
                    rolesPermissaoArray = trimmed.split(",");
                }
                else if(attrs.roles.match(/\*/g)) {
                     rolesPermissaoArray = attrs.roles;
                }
                else {
                    var roles = $parse(attrs.roles)(scope);
                    if(typeof roles == 'undefined') {
                        rolesPermissaoArray = attrs.roles.match(/\./g) ? null : attrs.roles;
                    }
                    else {
                        rolesPermissaoArray = roles;
                    }
                }

                /*
                 * Function para recuperação de elementos clonados
                 */
                function getBlockElements(nodes) {
                    var startNode = nodes[0],
                        endNode = nodes[nodes.length - 1];
                    if (startNode === endNode) {
                      return jQuery(startNode);
                    }

                    var element = startNode;
                    var elements = [element];

                    do {
                      element = element.nextSibling;
                      if (!element) break;
                      elements.push(element);
                    } while (element !== endNode);

                    return jQuery(elements);
                  }

                /*
                 * Clone de elementos que não serão exibidos.
                 * Remoção/reinserção dos elementos
                 */
                function transcluder(value) {
                    if(value) {
                        if (!childScope) {
                            childScope = scope.$new();
                            $transclude(scope, function (clone) {
                                clone[clone.length++] = document.createComment(' end msSeguranca: ' + attrs.msSeguranca + ' ');
                                block = {
                                    clone: clone
                                };
                                $animate.enter(clone, element.parent(), element);
                            });
                        }
                    }
                    else {
                        if (childScope) {
                            childScope.$destroy();
                            childScope = null;
                        }

                        if (block) {
                            $animate.leave(getBlockElements(block.clone));
                            block = null;
                        }
                    }
                };


                scope.$on('USER_LOGGED_IN', function(event, usuario) {
                    msSegurancaService.possuiAcesso(rolesPermissaoArray, usuario).then(function(result) {
                        transcluder(true);
                    }, function(reason) {
                        transcluder(false);
                    });
                })
                /*
                 * Watch sobre usuario logado.
                 * Aqui informamos se há ou não acesso ao elemento
                 */
                scope.$watch(function(){
                    return msSegurancaService.isUsuarioAutenticado();
                }, function(val) {
                    if(val == true) {
                        msSegurancaService.possuiAcesso(rolesPermissaoArray, msSegurancaService.getUsuario()).then(function(result) {
                            transcluder(true);
                        }, function(reason) {
                            transcluder(false);
                        });
                    }
                    else {
                        (rolesPermissaoArray) ?  transcluder(false) : transcluder(true);
                    }
                });
            }
        };
    }]);

    return msSeguranca;
		
}();


!function() {
		
    'use strict';

    var msSeguranca = angular.module('msSeguranca');

    msSeguranca.directive('msUsuarioInfo', ['$compile', function($compile) {
        return {
            restrict: 'E',
            link: function(scope, element, attrs, ctrl) {
                try {
                    scope.$watch(attrs.usuarioAutenticado, function(usuario) {
                        if(typeof usuario != 'undefined'&& typeof usuario.perfil != 'undefined'){

                            var template = angular.element('\n\
                                                        <a ng-click="editUsuario()" role="button" class="configuracao">\n\
                                                            <span class="icone icone-cog"></span>\n\
                                                            <span class="usuarioLogado">' + usuario.nome + '</span>\n\
                                                        </a>, \n\
                                                        <span class="perfilUsuario">' + usuario.perfil.nome + '</span>');

/*
                            var template = angular.element('\n\
                                            <a ng-click="editUsuario()" role="button" class="configuracao">\n\
                                                <span class="ms-icone-usuario"></span>\n\
                                                <div class="box-user">\n\
                                                <span class="usuarioLogado">' + usuario.nome + '</span>\n\
                                                <span class="perfilUsuario">' + usuario.perfil.nome + '</span> \n\
                                                </div>\n\
                                            </a>');
                                            */
                            element.html( template );
                            $compile(element.contents())(scope);
                        }
                    }, true);
                }
                catch(e) {
                    scope.$msNotify.error(e);
                }
            }
        };
    }]);
		
    return msSeguranca;
		
}();


!function() {
    'use strict';

    var msRoute = angular.module('msRoute', ['pascalprecht.translate', 'ui.router']);
    
    msRoute.run(['$rootScope', '$state', '$translate', '$translatePartialLoader', 
        function($rootScope, $state, $translate, $translatePartialLoader){
            $rootScope.reloadState = function(state) {
                $state.go(state, {}, {reload:true});
            };

            $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
                
                if(!$translatePartialLoader.isPartAvailable(toState.module)) {
                    $translatePartialLoader.addPart(toState.module);
                }
                
                $translate.refresh();
                $state.reload();
                $rootScope.$msNotify.close();
            });

            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

                if(fromState.module) {
                    if($translatePartialLoader.isPartAvailable(fromState.module)) {
                        $translatePartialLoader.deletePart(fromState.module, true);
                    };
                }

                $rootScope.$msNotify.loading();
            });

    }]);


    msRoute.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
          msRoute.$stateProvider = $stateProvider;  
          msRoute.$urlRouterProvider = $urlRouterProvider;
    }]);

    msRoute.createRoute = function(routes) {
        try{
            var elem = angular.element('body');
            var injector = elem.injector();
            var myService = injector.get('msRouteService');
            myService.create(routes);
            elem.scope().$apply();
        }
        catch(e) {
            console.log(e);
        }
    }
return msRoute;
                
}();
!function() {
    'use strict';
    var msRoute = angular.module('msRoute');

    msRoute.factory('msRouteService', [ '$log', '$http', '$q', '$state', '$rootScope', 'msSegurancaService', 
         function($log, $http, $q, $state, $rootScope, msSegurancaService){

            'use strict';

            var appBaseUrl = (typeof appConfig.appBaseUrl != "undefined") ? appConfig.appBaseUrl : 'app';

            var setState = function(content) {
                angular.forEach(content, function(object, key) {
                    try{
                        if(object.children) {
                            setState(object.children);
                        }

                        if(object.inner) {
                            setState(object.inner);
                        }

                        var tpl = (object.view) ? object.view : retira_acentos(object.text.toLowerCase()).replace(/\s/g, "-");
                        var url = retira_acentos(object.text.toLowerCase()).replace(/\s/g, "-");
                        var state = url;


                        var textClean = retira_acentos(object.text);
                        var tpl = (object.view) ? object.view : retira_acentos(object.text.toLowerCase()).replace(/\s/g, "-");
                        var url = textClean.toLowerCase().replace(/\s/g, "-");

                        var state = url;

                        var wordsControl = (object.module) ? object.module.split('-') : new Array();
                        var secondName = '';
                        if(wordsControl.length > 1) {
                            for (var i=1;i<wordsControl.length;i++)
                            { 
                                secondName += wordsControl[i].charAt(0).toUpperCase() + wordsControl[i].slice(1);
                            }
                        }

                        var control = (wordsControl.length) ? wordsControl[0].toLowerCase() + secondName + 'Controller' : null;
                        //console.log(control);
                        if(object.state) {
                            if(object.state.url) {
                                url = object.state.url;
                            }
                            if(object.state.name) {
                                state = object.state.name;
                            }
                        }

                        var bootstrapJs = (object.resolve) ? object.resolve : object.module;
                        var bust = (new Date()).getTime();
                        if(!$state.get(state)) {
                            msRoute.$stateProvider
                                .state(state, {
                                        url: "/" + url ,
                                        templateUrl: appBaseUrl + '/pages/' + object.module + '/views/' + tpl + '.tpl.html?t=' + bust,
                                        resolve: resolve(['pages/' + object.module + '/' + bootstrapJs]),
                                        controller: (object.controller) ? object.controller : control ,
                                        breadcrumb: object.breadcrumb ? object.breadcrumb : object.text,
                                        roles: object.roles ? object.roles : false,
                                        module: object.module
                                        ,onEnter: (object.onEnter) ? object.onEnter() : function(){}
                                 });
                         }


                    }
                    catch(e) {
                        $log.error(e);
                    }
                });
            }

            var create = function(content) {

                var deferred = $q.defer();

                var defaultRoute = 'login';

                angular.forEach(arguments, function(content) {

                    if(msSegurancaService.isUsuarioAutenticado()) {
                        defaultRoute = (typeof appConfig.login.sucesso != "undefined") ? appConfig.login.sucesso : 'login';
                    }
                    else {
                        defaultRoute = (typeof appConfig.defaultRoute != "undefined") ? appConfig.defaultRoute : 'home';
                    }

                    msRoute.$urlRouterProvider.otherwise(defaultRoute);

                    if(typeof content == 'string') {
                        $http.get(content).then(function(success) {
                            setState(success.data);
                            deferred.resolve(success.data);
                        }, function(reason){
                            $rootScope.$msAlert.error('Erro na criação de rotas : ' + reason);
                        });
                    }
                    else {
                        setState(content);
                        deferred.resolve(content);
                    }
                });
                return deferred.promise;
            }

            return {
                create: create
            };
    }]);

    return msRoute;
		
}();
!function() {
    'use strict';
                        
    var msUtils =  angular.module('msUtils', []);

    /*
     * Configurando o modulo para permitir LazyLoading de providers
     */
    msUtils.config(['$provide', '$compileProvider',
                        function($provide, $compileProvider){

            msUtils.directive = function( name, constructor ) {
                $compileProvider.directive( name, constructor );
                return( this );

            };      

            msUtils.factory = function( name, constructor ) {
                $provide.factory( name, constructor );
                return( this );

            };
    }]);


    msUtils.run(['$rootScope', 'msPropriedadesService', function($rootScope, msPropriedadesService) {
            $rootScope.msPropriedades = msPropriedadesService.get();
    }]);

    return msUtils;
			
}();
   
!function() {
    'use strict';
    var msUtils = angular.module('msUtils');

    msUtils.directive('msCompile', function($compile) {

        return {
            restrict: 'A',
            link:function(scope, element, attrs) {
                scope.$watch( function(scope) {
                                return scope.$eval(attrs.msCompile);
                            },
                            function(value) {
                                element.html(value);

                                if(!attrs.keepScope)
                                    $compile(element.contents())(scope);
                            }
                );
            }
        }
      });

    return msUtils;
			
}();
!function() {
    'use strict';
    var msUtils = angular.module('msUtils');

    msUtils.directive('msIdentificadorAmbiente', function($compile) {

        return {
                restrict: 'E',
                scope: true,
                link: function(scope, element, attrs) {
                    try {
                        scope.$watch(attrs.ambiente, function(content) {

                            var configAmbiente = {
                                    dev: {
                                        estilo : 'statusprojeto alert alert-warning ativo',
                                        nome : 'Desenvolvimento',
                                        icone: 'ms-icone-desenvolvimento'
                                    },
                                    hmg: {
                                        estilo : 'statusprojeto alert alert-danger ativo',
                                        nome : 'Homologação',
                                        icone: 'ms-icone-homologacao'
                                    },
                                    prototipo: {
                                        estilo : 'statusprojeto alert alert-info ativo',
                                        nome : 'Protótipo',
                                        icone: 'ms-icone-prototipo'
                                    }
                            };

                            var template = angular.element('<div class="' + configAmbiente[content.nome].estilo + '">\n\
                                                                <h4><span class="' + configAmbiente[content.nome].icone + '"></span>' + configAmbiente[content.nome].nome + '</h4>\n\
                                                            </div>');
                            element.html( template );
                            $compile(element.contents())(scope);
                        });

                    }
                    catch(e) {
                        scope.$msNotify.error(e);
                    }
                }
            };
      });

    return msUtils;
			
}();
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
!function() {
		
    'use strict';

    var msUtils = angular.module('msUtils');
    msUtils.factory('_', function() {
        return window._; 
    });

    return msUtils;
		
}();
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(h,s){var f={},t=f.lib={},g=function(){},j=t.Base={extend:function(a){g.prototype=this;var c=new g;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
q=t.WordArray=j.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=s?c:4*a.length},toString:function(a){return(a||u).stringify(this)},concat:function(a){var c=this.words,d=a.words,b=this.sigBytes;a=a.sigBytes;this.clamp();if(b%4)for(var e=0;e<a;e++)c[b+e>>>2]|=(d[e>>>2]>>>24-8*(e%4)&255)<<24-8*((b+e)%4);else if(65535<d.length)for(e=0;e<a;e+=4)c[b+e>>>2]=d[e>>>2];else c.push.apply(c,d);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
32-8*(c%4);a.length=h.ceil(c/4)},clone:function(){var a=j.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],d=0;d<a;d+=4)c.push(4294967296*h.random()|0);return new q.init(c,a)}}),v=f.enc={},u=v.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++){var e=c[b>>>2]>>>24-8*(b%4)&255;d.push((e>>>4).toString(16));d.push((e&15).toString(16))}return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b+=2)d[b>>>3]|=parseInt(a.substr(b,
2),16)<<24-4*(b%8);return new q.init(d,c/2)}},k=v.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++)d.push(String.fromCharCode(c[b>>>2]>>>24-8*(b%4)&255));return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b++)d[b>>>2]|=(a.charCodeAt(b)&255)<<24-8*(b%4);return new q.init(d,c)}},l=v.Utf8={stringify:function(a){try{return decodeURIComponent(escape(k.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return k.parse(unescape(encodeURIComponent(a)))}},
x=t.BufferedBlockAlgorithm=j.extend({reset:function(){this._data=new q.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=l.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,d=c.words,b=c.sigBytes,e=this.blockSize,f=b/(4*e),f=a?h.ceil(f):h.max((f|0)-this._minBufferSize,0);a=f*e;b=h.min(4*a,b);if(a){for(var m=0;m<a;m+=e)this._doProcessBlock(d,m);m=d.splice(0,a);c.sigBytes-=b}return new q.init(m,b)},clone:function(){var a=j.clone.call(this);
a._data=this._data.clone();return a},_minBufferSize:0});t.Hasher=x.extend({cfg:j.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){x.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(c,d){return(new a.init(d)).finalize(c)}},_createHmacHelper:function(a){return function(c,d){return(new w.HMAC.init(a,
d)).finalize(c)}}});var w=f.algo={};return f}(Math);
(function(h){for(var s=CryptoJS,f=s.lib,t=f.WordArray,g=f.Hasher,f=s.algo,j=[],q=[],v=function(a){return 4294967296*(a-(a|0))|0},u=2,k=0;64>k;){var l;a:{l=u;for(var x=h.sqrt(l),w=2;w<=x;w++)if(!(l%w)){l=!1;break a}l=!0}l&&(8>k&&(j[k]=v(h.pow(u,0.5))),q[k]=v(h.pow(u,1/3)),k++);u++}var a=[],f=f.SHA256=g.extend({_doReset:function(){this._hash=new t.init(j.slice(0))},_doProcessBlock:function(c,d){for(var b=this._hash.words,e=b[0],f=b[1],m=b[2],h=b[3],p=b[4],j=b[5],k=b[6],l=b[7],n=0;64>n;n++){if(16>n)a[n]=
c[d+n]|0;else{var r=a[n-15],g=a[n-2];a[n]=((r<<25|r>>>7)^(r<<14|r>>>18)^r>>>3)+a[n-7]+((g<<15|g>>>17)^(g<<13|g>>>19)^g>>>10)+a[n-16]}r=l+((p<<26|p>>>6)^(p<<21|p>>>11)^(p<<7|p>>>25))+(p&j^~p&k)+q[n]+a[n];g=((e<<30|e>>>2)^(e<<19|e>>>13)^(e<<10|e>>>22))+(e&f^e&m^f&m);l=k;k=j;j=p;p=h+r|0;h=m;m=f;f=e;e=r+g|0}b[0]=b[0]+e|0;b[1]=b[1]+f|0;b[2]=b[2]+m|0;b[3]=b[3]+h|0;b[4]=b[4]+p|0;b[5]=b[5]+j|0;b[6]=b[6]+k|0;b[7]=b[7]+l|0},_doFinalize:function(){var a=this._data,d=a.words,b=8*this._nDataBytes,e=8*a.sigBytes;
d[e>>>5]|=128<<24-e%32;d[(e+64>>>9<<4)+14]=h.floor(b/4294967296);d[(e+64>>>9<<4)+15]=b;a.sigBytes=4*d.length;this._process();return this._hash},clone:function(){var a=g.clone.call(this);a._hash=this._hash.clone();return a}});s.SHA256=g._createHelper(f);s.HmacSHA256=g._createHmacHelper(f)})(Math);

function ucFirst(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function resolve(names) {
    return {
        load: ['$q', '$rootScope', function ($q, $rootScope) {
            var defer = $q.defer();
            require(names, function () {
                defer.resolve();
                $rootScope.$apply();
            });
            return defer.promise;
        }]
    }
};

function retira_acentos(palavra) { 
    com_acento = "áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÖÔÚÙÛÜÇ"; 
    sem_acento = "aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC"; 
    nova=""; 
    for(i=0;i<palavra.length;i++) { 
        if (com_acento.search(palavra.substr(i,1))>=0) { 
            nova += sem_acento.substr(com_acento.search(palavra.substr(i,1)),1); 
        } 
        else { 
            nova+=palavra.substr(i,1); 
        } 
    } 
    return nova; 
}


function setaCookieContraste(b){var a=new Date,c=a.getTime()+6048E5;a.setTime(c);document.cookie="ativo"==b?"Contraste=Sim; expires="+a.toGMTString():"Contraste=Nao; expires="+a.toGMTString()}function atribuirContraste(){!0==$("body").hasClass("acessibilidade")?($("body").removeClass("acessibilidade"),setaCookieContraste("inativo")):($("body").addClass("acessibilidade"),setaCookieContraste("ativo"))}var results=document.cookie.match("(^|;) ?Contraste=([^;]*)(;|$)");
$(this).load(function(){null!=results&&"Sim"==results[2]&&atribuirContraste("ativo")});
/*
 *  Project: RV Font Size jQuery Plugin
 *  Description: An easy and flexible jquery plugin to give font size accessibility control.
 *  URL: https://github.com/ramonvictor/rv-jquery-fontsize/
 *  Author: Ramon Victor (https://github.com/ramonvictor/)
 *  License: Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 *  Any and all use of this script must be accompanied by this copyright/license notice in its present form.
 */
(function(e,d,a,g){var b="rvFontsize",f={targetSection:"body",store:false,storeIsDefined:!(typeof store==="undefined"),variations:7,controllers:{append:true,appendTo:"body",showResetButton:false,template:""}};function c(j,i){var h=this;h.element=j;h.options=e.extend({},f,i);h._defaults=f;h._name=b;h.init()}c.prototype={init:function(){var h=this,i=function(){h.defineElements();h.getDefaultFontSize()};i();if(h.options.store===true&&!(h.options.storeIsDefined)){h.dependencyWarning()}},dependencyWarning:function(){console.warn('When you difine "store: true", store script is required (https://github.com/ramonvictor/rv-jquery-fontsize/blob/master/js/store.min.js)')},bindControlerHandlers:function(){var h=this;h.$decreaseButton=e(".rvfs-decrease");if(h.$decreaseButton.length>0){h.$decreaseButton.on("click",function(j){j.preventDefault();var i=e(this);if(!i.hasClass("disabled")){var k=h.getCurrentVariation();if(k>1){h.$target.removeClass("rvfs-"+k);h.$target.attr("data-rvfs",k-1);if(h.options.store===true){h.storeCurrentSize()}h.fontsizeChanged()}}})}h.$increaseButton=e(".rvfs-increase");if(h.$increaseButton.length>0){h.$increaseButton.on("click",function(j){j.preventDefault();var i=e(this);if(!i.hasClass("disabled")){var k=h.getCurrentVariation();if(k<h.options.variations){h.$target.removeClass("rvfs-"+k);h.$target.attr("data-rvfs",k+1);if(h.options.store===true){h.storeCurrentSize()}h.fontsizeChanged()}}})}h.$resetButton=e(".rvfs-reset");if(h.$resetButton.length>0){h.$resetButton.on("click",function(j){j.preventDefault();var i=e(this);if(!i.hasClass("disabled")){var k=h.getCurrentVariation();h.$target.removeClass("rvfs-"+k);h.$target.attr("data-rvfs",h.defaultFontsize);if(h.options.store===true){h.storeCurrentSize()}h.fontsizeChanged()}})}},defineElements:function(){var h=this;h.$target=e(h.options.targetSection);if(h.options.controllers.append!==false){var i=h.options.controllers.showResetButton?'<a href="#" class="rvfs-reset btn" title="Default font size">A</a>':"";var k=h.options.controllers.template,j="";h.$appendTo=e(h.options.controllers.appendTo);if(e.trim(k).length>0){j=k}else{j='<div class="btn-group"><a href="#" class="rvfs-decrease btn" title="Decrease font size">A<sup>-</sup></a></li>'+i+'<a href="#" class="rvfs-increase btn" title="Increase font size">A<sup>+</sup></a></li></div>'}h.$appendTo.html(j);h.bindControlerHandlers()}},getDefaultFontSize:function(){var h=this,i=h.options.variations;h.defaultFontsize=0;if(i%2===0){h.defaultFontsize=(i/2)+1}else{h.defaultFontsize=parseInt((i/2)+1,10)}h.setDefaultFontSize()},setDefaultFontSize:function(){var h=this;if(h.options.store===true&&h.options.storeIsDefined){var i=store.get("rvfs")||h.defaultFontsize;h.$target.attr("data-rvfs",i)}else{h.$target.attr("data-rvfs",h.defaultFontsize)}h.fontsizeChanged()},storeCurrentSize:function(){var h=this;if(h.options.storeIsDefined){store.set("rvfs",h.$target.attr("data-rvfs"))}else{h.dependencyWarning()}},getCurrentVariation:function(){return parseInt(this.$target.attr("data-rvfs"),10)},fontsizeChanged:function(){var h=this,i=h.getCurrentVariation();h.$target.addClass("rvfs-"+i);if(i===h.defaultFontsize){h.$resetButton.addClass("disabled")}else{h.$resetButton.removeClass("disabled")}if(i===h.options.variations){h.$increaseButton.addClass("disabled")}else{h.$increaseButton.removeClass("disabled")}if(i===1){h.$decreaseButton.addClass("disabled")}else{h.$decreaseButton.removeClass("disabled")}}};e.fn[b]=function(i){var h=this;return h.each(function(){if(!e.data(h,"plugin_"+b)){e.data(h,"plugin_"+b,new c(h,i))}})};e[b]=function(){var h=e(d);return h.rvFontsize.apply(h,Array.prototype.slice.call(arguments,0))}})(jQuery,window,document);