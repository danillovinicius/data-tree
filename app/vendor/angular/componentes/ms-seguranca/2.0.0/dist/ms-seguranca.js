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
            $rootScope.$broadcast('USER_AUTHENTICATED', usuarioAutenticado);
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
                        if(angular.isArray(rolesPermitidas)){

                            angular.forEach(rolesPermitidas, function(rolePermitida){

                                if(rolePermitida == val){
                                    possui = true;
                                    return;
                                }

                            });

                        }
                        else if(rolesPermitidas == val) {
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

    msSeguranca.factory('msAutenticacaoService', ['$rootScope',  '$q', 'msSegurancaService', '$http', 'Restangular', '$msAlertService',
        function($rootScope, $q, msSegurancaService, $http, Restangular) {

            var getUserData = function(deferred, token) {
                if(!msSegurancaService.getUsuario()) {


                    Restangular.one(appConfig.login.url_usuario).get().then(function(response) {
                        msSegurancaService.setUsuario(response.resultado.usuario);
                        $rootScope.$broadcast('USER_LOGGED_IN', response.resultado.usuario);
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

                var tempStr = credentials.client_id + ':' +  credentials.client_secret;
                /**
                 * Convertendo para formData
                 */
                credentials = $.param(credentials);

                var basicToken = base64_encode(tempStr);

                $http.defaults.headers.common['Authorization'] = 'Basic ' + basicToken;

                Restangular.all(appConfig.login.url).customPOST(credentials, null, null, {'Content-Type':'application/x-www-form-urlencoded'}).then(function(response) {
                    var token = response.access_token;
                    msSegurancaService.setToken(token);
                    $rootScope.$msAlert.clear();
                    $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
                    getUserData(deferred, token);
                }, function(reason) {
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

                    Restangular.all(appConfig.logout.url).post(params).then(function(response) {
                        msSegurancaService.setUsuarioAutenticado(false);
                        msSegurancaService.setUsuario(false);
                        delete $http.defaults.headers.common.Authorization;
                        //Parando o contador
                        $rootScope.$broadcast('timer-stop');
                        deferred.resolve(msSegurancaService);
                    }, function(reason) {
                        deferred.reject(reason);
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
                        var template = angular.element('<timer end-time="limite">{{mminutes}}:{{sseconds}}</timer>');
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


                scope.$on('USER_AUTHENTICATED', function(event, usuario) {
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
/*
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

                            var template = angular.element('<a ng-click="editUsuario()">' +
                                                            '<span class="ms-icone-usuario"></span></a>' +
                                                            '<div class="box-usuario">' +
                                                            '<span class="usuarioLogado">' + usuario.nome + '</span> ' +
                                                            '<span class="perfilUsuario ng-scope">' + usuario.perfil.nome + '</span>' +
                                                            '</div>');
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

