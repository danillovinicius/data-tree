!function() {
    'use strict';

    var msSeguranca = angular.module('msSeguranca');

    msSeguranca.factory('msSegurancaService', ['$cookieStore', '$q', '$rootScope', 'EscopoCompartilhadoService', function($cookieStore, $q, $rootScope, EscopoCompartilhadoService) {

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
                EscopoCompartilhadoService.limparEscopo();
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
