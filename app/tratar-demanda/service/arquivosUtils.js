define(['app'], function (app) {

    'use strict';

    app.service('arquivosUtils',  ['comumService', '$rootScope', '$upload', '$filter',
            function(comumService, $rootScope, $upload, $filter) {

        var URL = 'api/encaminhamento-demanda/upload';

        var selecionaArquivo = 'file-input';

        var TAMANHO_MAXIMO_20_MEGA = 20971520;

        var TAMANHO_MAXIMO_2_MEGA = 2097152;


        this.isExisteArquivo = function(arquivo, arquivosSelecionados){
            for(var i=0; i<arquivosSelecionados.length; i++) {
                if (arquivo.name == arquivosSelecionados[i].nomeArquivoComExtensao) {
                    return true;
                }
            }
            return false;
        };

        var validarTamanho = function(tamanhoUtilizado){
            return tamanhoUtilizado <= TAMANHO_MAXIMO_20_MEGA;
        };

        this.validaMaximo2Mega = function(tamanhoUtilizado){
            return tamanhoUtilizado <= TAMANHO_MAXIMO_2_MEGA;
        }

        this.formatarArquivo = function(file, arquivosSelecionados, tamanhoUtilizado, callBackSucess, callBackError) {

                comumService.limpaMensagensDeObrigatoriedadePorIds([selecionaArquivo]);

                if(!validarTamanho(tamanhoUtilizado)){
                    console.log('tamanho maximo da demanda atingido');
                    return;
                }

                if(this.isExisteArquivo(file, arquivosSelecionados)){
                    callBackError({data: {mensagem: $filter('translate')('MI096')}});
                    return;
                }

                var nome = file.name.split(".");
                var fileExtensao = nome[nome.length - 1];

                var fileFormatado = {
                    extensao: fileExtensao,
                    decricaoPalavraChave: file.name,
                    dataUpload: file.lastModifiedDate,
                    nomeArquivo: file.name,
                    tamanho: file.size,
                    tipoArquivo: file.type
                };

                var validarExtensao = comumService.verificarExtensaoArquivoValida(fileFormatado);

                if (validarExtensao) {
                    callBackError({data: {mensagem: validarExtensao}});
                    return;
                }

                $rootScope.$msNotify.loading();

                $upload.upload({
                    url: URL,
                    file: file
                }).then(callBackSucess, callBackError);
      };



    }]);

    return app;

  }
);
