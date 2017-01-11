define(['app'], function (app) {

        'use strict';

        app.service('encaminhamentoDemandaService', ['ResourcesService', function (ResourcesService) {

            var resource = ResourcesService.encaminhamentoDemanda;

            this.pesquisarPelaDemanda = function (demandaId) {
                return resource.one('recuperar-encaminhamentos/origem/' + demandaId).getList();
            };

            this.obterRedesVinculadas = function () {
                return resource.one('obter-redes-vinculadas').getList();
            };

            this.totalArquivoAnexoAtendimento = function (demandaId) {
                return resource.one('total-arquivos/demanda/' + demandaId).get();
            };

            this.pesquisarArquivosNaoCompartilhados = function (demandaId) {
                return resource.one('pesquisar-arquivos-encaminhamentos/nao-compartilhados/' + demandaId).getList();
            };

            this.compartilharArquivos = function (filtro) {
                return resource.one('compartilharArquivo').customPOST(filtro);
            };

            this.validarEncaminhamento = function (filtro) {
                return resource.one('validar-encaminhamento').customPOST(filtro);
            };

            this.retornaResponsavel = function (idRede) {
                return resource.one('retorna-responsavel/' + idRede).get();
            };

            this.salvar = function (filtro) {
                return resource.one('salvar-encaminhamento').customPOST(filtro);
            };

            this.fecharDemandaAtualizarSituacaoRespostaEncaminhamento = function (filtro) {
                return resource.one('fechar-demanda-atualizar-situacao-resposta-encaminhamento').customPOST(filtro);
            };

            this.ouvidorPossuiAcesso = function (idOuvidoria) {
                return resource.one('ouvidoria-possui-acesso-internet/' + idOuvidoria).get();
            };

            this.gerarDocumentoOficial = function (filtro) {
                return resource.one('gerar-documento-oficial').customPOST(filtro);
            };

            this.recuperaEmailRedeDestino = function (id) {
                return resource.one('recupera-email/' + id).get();
            };

            this.enviarEmail = function (email) {
                return resource.one('enviar-email').customPOST(email);
            };

            this.downloadArquivo = function (arquivo) {
                return resource.one('/download/base64').customPOST(arquivo);
            };

            this.listarEncaminhamento = function (id) {
                return resource.one('listar-arquivos/' + id).get();
            };

            this.emAnalise = function (id) {
                return resource.one('em-analise/' + id).get();
            };

            this.pesquisar = function (filtro) {
                return resource.all("pesquisar").customPOST(filtro);
            };

            this.aprovarNaoAprovar = function (encaminhamentos) {
                return resource.all('aprovar-nao-aprovar').customPUT(encaminhamentos);
            };

            this.buscarEncaminhamentosPorDemanda = function (id) {
                return resource.one("buscarEncaminhamentosPorDemanda", id).get();
            };

            this.isDemandaEncaminhada = function (id) {
                return resource.one('demanda-encaminahda/' + id).get();
            };

            this.pesquisarRedesParticipantes = function (tipo, filtro) {
                return resource.all('pesquisar/redes/' + tipo).customPOST(filtro);
            };

            this.tratarEncaminhamentoDemanda = function (tratarEncaminhamentoDTO) {
                return resource.all('tratarEncaminhamentoDemanda').customPUT(tratarEncaminhamentoDTO);
            };

            this.adicionarEncaminhamentoEmAnalise = function (idEncaminhamento) {
                var tratarEncaminhamento = {'idEncaminhamento': idEncaminhamento};
                return resource.all('adicionarEncaminhamentoEmAnalise').customPUT(tratarEncaminhamento);
            };

            this.listarHistoricoEncaminhamentos = function (filtro) {
                return resource.all('listar-historicos-encaminhamento').customPOST(filtro);
            };

            this.ativarInativarEncaminhamento = function (encaminhamento) {
                return resource.all('ativarInativarEncaminhamento').customPUT(encaminhamento);
            };

            this.carregarArquivosDemadaEncaminhamento = function (id, idDemanda) {
                return resource.one('carregarArquivosDemadaEncaminhamento', id).one("/", idDemanda).getList();
            };

            this.carregarArquivosEmailFechamentoDemada = function (idDemanda) {
                return resource.one('carregarArquivosEmailFechamentoDemada', idDemanda).getList();
            };

            this.montarPreviaEmailFecharDemanda = function (idDemanda, idRedeOrigem) {
                return resource.one('montarPreviaEmailFecharDemanda', idDemanda).one("/", idRedeOrigem).getList();
            };

        }]);

        return app;

    }
);
