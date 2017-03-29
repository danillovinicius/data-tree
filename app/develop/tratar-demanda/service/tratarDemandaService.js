define(['app'], function (app) {

    'use strict';

    app.service('tratarDemandaService',  ['ResourcesService', function(ResourcesService) {

      var resource = ResourcesService.tratarDemandaResources;

      this.pesquisarAssuntoTipificacao = function(idClassificacao) {
    	  return resource.one('assunto/tipificacao/'+idClassificacao).get();
      };

      this.pesquisarSubAssuntoTipificacao = function (idAssunto, nivel) {
          return resource.one('subassunto/tipificacao/' + idAssunto + '/' + nivel).get();
      };
      
      this.pesquisarCampoNomeTipificacaoComplementar = function(filtro){
    	  return resource.one('autocomplete/tipificacao-complementar').get(filtro);
      };
      
      this.isPossuiCampoTipificacaoComplementar = function(){
    	  return resource.one('possui-campo-tipificacao').get();
      };
      
      this.buscarCamposTipificacaoComplementar = function(idDemanda){
    	  return resource.one('buscar-campos-tipificacao-complementar/' + idDemanda).get();
      };
      
      this.adicionarValorCampoNome = function(valor){
    	  return resource.one('adicionar-novo-nome').customPUT(valor);
      };
      
      this.salvarTipificacaoDaDemanda = function(valor){
    	  return resource.one('salvar-tipificacao-demanda').customPOST(valor);
      };
      
      this.recuperarTipificacoes = function(idDemanda){
    	  return resource.one('recuperar-dados-tipificacao/' + idDemanda).get();
      };
      
      this.recuperarValoresCampoCompl = function(idDemanda){
    	  return resource.one('recuperar-valores-campo-compl/' + idDemanda).get();
      };
    }]);

    return app;

  }
);
