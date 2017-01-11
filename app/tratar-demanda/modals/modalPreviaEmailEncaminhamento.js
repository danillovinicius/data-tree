/*global define*/
define(['app', 'ckeditor'], function (app) {

    "use strict";

    app.factory("modalPreviaEmailEncaminhamento", ['$modal', 'demandaService', '$filter', '$state', 'ngTableParams', 'ResourcesService',
        '$rootScope', 'encaminhamentoDemandaService', 'arquivosUtils', 'comumService',
        function ($modal, demandaService, $filter, $state, ngTableParams, ResourcesService, $rootScope,
        encaminhamentoDemandaService, arquivosUtils, comumService) {

            var abrir = function (encaminhamento, demanda, filtroRedeSemAcesso, isEditar, callback) {
                $modal.open({
                    windowClass: 'tamanho-tela',
                    templateUrl: 'app/pages/tratar-demanda/views/modalPreviaEmailEncaminhamento.tpl.html',
                    size: 'xm',
                    controller: function ($scope, $modalInstance) {
                        
                        $scope.editandoEmail = isEditar;
                        
                        
                        $scope.filtro = angular.copy(encaminhamento);
                        
                        
                        $scope.getUrlDownload = function(idArquivo){
                            return '/'+ResourcesService.resourceUrls.comum+'/arquivo/'+idArquivo;
                        };
                        
                        $scope.downloadArquivo = function(arquivo){
                            comumService.downloadBlobFromBase64(arquivo);
                        };
                        
                        $scope.fechar = function () {
                            $modalInstance.close();
                        };
                        
                        $scope.cancelar = function () {
                            callback();
                            $scope.fechar();
                        };
                        
                        $scope.removerArquivoDoEmail = function (arquivo) {
                            var index =  $scope.filtro.arquivos.indexOf(arquivo);
                            $scope.filtro.arquivos.splice(index, 1);
                        };
                        
                        $scope.ckOptions = {
                            toolbar: [
                                {
                                    name: 'basicstyles',
                                    items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat']
                                },

                                {
                                    name: 'paragraph',
                                    items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv',
                                        '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl']
                                },
                                {name: 'editing', items: ['Find', 'Replace', '-', 'SelectAll', '-', 'SpellChecker', 'Scayt']},

                                {name: 'links', items: ['Link', 'Unlink']},
                                
                                {name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize']},

                                {name: 'colors', items: ['TextColor', 'BGColor']},

                                {name: 'tools', items: ['Maximize']}
                            ],
                            filebrowserUploadUrl: 'api/comum/uploadImagem'
                         };
                        
                         $scope.filtro.conteudoEmail = $filter('translate')('conteudo-email');
                         $scope.filtro.conteudoEmail = $scope.filtro.conteudoEmail.replace('{TiPO_ENCAMINHAMENTO}', (encaminhamento.tipoEncaminhamento == 'P') ? $filter('translate')('providencia') : $filter('translate')('conhecimento'));
                         
                         $scope.filtro.conteudoEmail = $scope.filtro.conteudoEmail.replace('{REDE_DESTINO}', (encaminhamento.redeDestino.ouvidoria.nome) ? encaminhamento.redeDestino.ouvidoria.nome : '');
                         $scope.filtro.conteudoEmail = $scope.filtro.conteudoEmail.replace('{NUMERO_DEMANDA}', (demanda.numeroProtocolo) ? demanda.numeroProtocolo : '');
                         $scope.filtro.conteudoEmail = $scope.filtro.conteudoEmail.replace('{TIPO_DOCUMENTO}', (filtroRedeSemAcesso.tipoDocumentoOficial) ? filtroRedeSemAcesso.tipoDocumentoOficial.descricao : '');
                         $scope.filtro.conteudoEmail = $scope.filtro.conteudoEmail.replace('{NUMERO_DOCUMENTO}', (filtroRedeSemAcesso.numeroDocumento) ? filtroRedeSemAcesso.numeroDocumento : '' );
                         $scope.filtro.conteudoEmail = $scope.filtro.conteudoEmail.replace('{DOCUMENTO_RECUPERADO}', (encaminhamento.documentoOficial && encaminhamento.documentoOficial.nome) ? encaminhamento.documentoOficial.nome : '');
                         $scope.filtro.conteudoEmail = $scope.filtro.conteudoEmail.replace('{REDE_ORIGEM}', $rootScope.usuarioAutenticado.redeSelecionada.ouvidoria.nome);
                         $scope.filtro.conteudoEmail = $scope.filtro.conteudoEmail.replace('{PARECER}', (encaminhamento.comentarioParecer) ? encaminhamento.comentarioParecer : '');
                         
                        $scope.editarEmail = function(){
                          $scope.fechar();
                          callback('EDITAR');
                        };
                        
                        $scope.enviarEmail = function(){
                            
                            var parametros = {
                                 destino: (filtroRedeSemAcesso.email) ? filtroRedeSemAcesso.email : "",
                                 conteudoEmail: ($scope.filtro.conteudoEmail) ? $scope.filtro.conteudoEmail : "",
                                 anexos: $scope.filtro.arquivos
                            };
                            
                            encaminhamentoDemandaService.enviarEmail(parametros)
                                .then(function(resposta){
                                    var documento = resposta.resultado;
                                    /* padronizar nomes */
                                    documento.arquivoBinario.encode = documento.arquivoBinario.binario;
                                    documento.binario = undefined;
                                    
                                    encaminhamento.arquivos.push(documento);
                                    
                                    $scope.fechar();
                                    callback();
                            });
                        };
                        
                    }
                });
            };

            return {
                abrir: abrir
            };
        }]);
});
