/*global define*/
define(['app'], function(app) {

  "use strict";

  app.factory("modalEditarEmailController", ['$modal', '$filter', '$q',
                                             'encaminhamentoDemandaService','ResourcesService',
                                             '$confirmar', 'comumService', 'demandaService',
                                           function($modal, $filter, $q, encaminhamentoDemandaService,
                                                    ResourcesService, $confirmar, comumService, demandaService) {

      var abrir = function(idDemanda, idRedeOrigem, idUltimoEncaminhamento, callBack) {

        $modal.open({
          windowClass : 'modal-editar-email',
          templateUrl: 'app/pages/tratar-demanda/views/modalEditarEmail.tpl.html',
          size : 'lg',
          controller : function($scope, $modalInstance) {

            $scope.arquivos = [];
            $scope.email = {};

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
                          {name: 'tools', items: ['Maximize']},
                          {name: 'insert', items : [ 'Image','Table','HorizontalRule','Smiley','SpecialChar','PageBreak' ] },
                ],
                filebrowserUploadUrl: 'api/comum/uploadImagem'
            };

            $scope.init = function () {
              $q.all([carregarRespostas(idDemanda, idRedeOrigem), carregarArquivos(idUltimoEncaminhamento, idDemanda)]).then(function (resposta) {
                if (resposta[0]) {
                  $scope.email.resposta = resposta[0].resultado;
                }

                if (resposta[1]) {
                  $scope.arquivos = resposta[1].resultado;
                }
              });
            };

            var carregarRespostas = function (idDemanda, idRedeOrigem) {
              return encaminhamentoDemandaService.montarPreviaEmailFecharDemanda(idDemanda, idRedeOrigem);
            };

            var carregarArquivos = function (idUltimoEncaminhamento, idDemanda) {
              return encaminhamentoDemandaService.carregarArquivosDemadaEncaminhamento(idUltimoEncaminhamento, idDemanda);
            };

            $scope.getUrlDownload = function(idArquivo){
                return '/'+ResourcesService.resourceUrls.comum+'/arquivo/'+idArquivo;
            };

            $scope.removerArquivo = function (arquivo) {
              var indice = $scope.arquivos.findIndex(function (elem) {
                return elem.id = arquivo.id;
              })
              $scope.arquivos.splice(indice, 1);
            };

            $scope.enviar = function () {            
              if ($scope.email.resposta == undefined || $scope.email.resposta == '' ) {
                comumService.exibirMensagemErro($filter('translate')('ME077'), $scope.$msAlert);
              } else {
                var demanda = {'id': idDemanda, 'corpoEmail': $scope.email.resposta, 'arquivos': obterIdsArquivosEnvio()};
                demandaService.enviarEmailFechamentoDemandaEmailEditado(demanda).then(function (resposta) {
                  $modalInstance.close();
                });
              }
            };

            var obterIdsArquivosEnvio = function () {
              var idsArquivos = [];
              angular.forEach($scope.arquivos, function (elem) {
                idsArquivos.push({'id': elem.id});
              });
              return idsArquivos;
            };

            $scope.cancelar = function () {
              $confirmar($filter('translate')('MC013')).then(function () {

   					  });
            };

            $scope.fechar = function () {
              var resposta = {'reabrir': true};
              callBack(resposta);
              $modalInstance.close();
            };

          }
        });
      };

      return {
        abrir : abrir
      };
    }]);
  });
