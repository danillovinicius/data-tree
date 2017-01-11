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

