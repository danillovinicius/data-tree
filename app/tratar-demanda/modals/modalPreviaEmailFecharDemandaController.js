/*global define*/
define(['app'], function (app) {

    "use strict";

    app.factory("modalPreviaEmailFecharDemandaController", ['$modal', 'demandaService', '$filter', '$state', 'ngTableParams', 'ResourcesService', 'msModalService', 'comumService',
        function ($modal, demandaService, $filter, $state, ngTableParams, ResourcesService, msModalService, comumService) {

            var abrir = function (demanda, corpoEmail, arquivos, callBack) {
                $modal.open({
                    windowClass: 'modal-previa-email-fechar-demanda',
                    templateUrl: 'app/pages/tratar-demanda/views/modalPreviaEmailFecharDemanda.tpl.html',
                    size: 'xm',
                    controller: function ($scope, $modalInstance) {
                        var parametros = {
                            page: 1,
                            count: 10
                        };

                        $scope.getUrlDownload = function (file) {
                            return '/' + ResourcesService.resourceUrls.comum + '/arquivo/' + file.id;
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

                                //{ name: 'insert', items : [ 'Image','Table','HorizontalRule','Smiley','SpecialChar','PageBreak' ] },

                                {name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize']},

                                {name: 'colors', items: ['TextColor', 'BGColor']},

                                {name: 'tools', items: ['Maximize']}
                            ],
                            filebrowserUploadUrl: 'api/comum/uploadImagem'
                        };


                        $scope.demanda = demanda;
                        $scope.corpoEmail = corpoEmail;
                        $scope.arquivos = angular.copy($scope.demanda.arquivos);

                        $scope.editandoEmail = false;

                        $scope.removerArquivo = callBack.removerArquivo;

                        $scope.tituloModal = $filter('translate')('previa-email');

                        $scope.arquivosEmail = new ngTableParams(parametros, {
                            total: 0,
                            getData: function ($defer, params) {
                                params.total($scope.arquivos != undefined ? $scope.arquivos.length : 0);
                                $defer.resolve($scope.arquivos);
                            },
                            $scope: {$data: {}}
                        });

                        $scope.fechar = function () {
                            if(!$scope.editandoEmail){
                                $modalInstance.close();
                            }else{
                                $scope.fecharEditar();
                            }
                        };


                        $scope.voltar = function(){
                            if(!$scope.editandoEmail){
                                $modalInstance.close();
                            }else{
                               $scope.editandoEmail = false;
                            }
                        };


                        $scope.fecharDemanda = function () {

                            if(demanda.emailAoCidadao === ""){
                                 comumService.enviaMensagemSobreCampo('enviar', $filter('translate')('ME077'));
                            }else{
                              $scope.demanda.arquivos = $scope.arquivos;
                                demandaService.fecharDemanda($scope.demanda).then(function (result) {
                                    $modalInstance.close();
                                    $scope.$msAlert.success($filter('translate')('MI175'));
                                }, function (reason) {
                                    $scope.$msAlert.error(reason.data.mensagens);
                                });
                            }
                        };

                        $scope.editarEmail = function () {
                            $scope.editandoEmail = true;
                            $scope.demanda.emailAoCidadao = corpoEmail;
                        };

                        $scope.removerArquivoDoEmail = function (arquivo) {

                            var arquivos = $scope.arquivos;
                            angular.forEach(arquivos, function (file, index) {
                                if (file.nomeArquivo === arquivo.nomeArquivo) {
                                    $scope.arquivos.splice(index, 1);
                                    $scope.arquivosEmail.reload();
                                }
                            });
                        };


                        $scope.fecharEditar = function(){
                          msModalService.setOptions({
                                            title: $filter('translate')('MH057'),
                                            content: $filter('translate')('MC013'),
                                            buttons: {
                                                'Sim': {
                                                    name: 'Sim',
                                                    ngClick: function () {

                                                        msModalService.close();

                                                        $modalInstance.close();
                                                    },
                                                    style: 'btn btn-primary'
                                                },
                                                'Nao': {
                                                    name: 'Cancelar',
                                                    ngClick: function () {
                                                        msModalService.close();
                                                    },
                                                    style: 'btn btn-default'
                                                }
                                            }

                            }).init();
                        };


                    }
                });
            };

            return {
                abrir: abrir
            };
        }]);
});
