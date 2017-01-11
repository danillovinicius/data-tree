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
   