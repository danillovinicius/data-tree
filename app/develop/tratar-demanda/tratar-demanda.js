define([
        'services/comumService',
        'pages/tratar-demanda/controllers/tratarDemandaController',
        'pages/tratar-demanda/controllers/encaminharAnalisarDemandaController',
        'pages/tratar-demanda/controllers/responderFecharDemandaController',

        'pages/tratar-demanda/modals/modalPreviaEmailEncaminhamento',
        'pages/tratar-demanda/modals/modalLocaisEncaminhamento',
        'pages/tratar-demanda/modals/modalReaproveitarAnexo',
        'pages/tratar-demanda/modals/modalHistoricoDeTramite',
        'pages/tratar-demanda/modals/modalEncaminharDemanda',
        'pages/tratar-demanda/modals/modalEncaminhamentoRedeSemAcesso',
        'pages/tratar-demanda/modals/modalPreviaEmailFecharDemanda',
        'pages/tratar-demanda/modals/modalEditarEmailController',
        'pages/tratar-demanda/modals/modalPreviaEmailController',
        'pages/tratar-demanda/modals/modalConfirmacaoController',
        'pages/tratar-demanda/modals/modalConfirmacaoEncaminhamentoPendenteRespostaController',
        'pages/tratar-demanda/service/tratarDemandaService',
        'pages/tratar-demanda/service/encaminhamentoDemandaService',
        'pages/tratar-demanda/service/arquivosUtils',
        'pages/tratar-demanda/service/arvoreUtils',
        'pages/tratar-demanda/service/tramiteUtils',

        'pages/tratar-demanda/modals/modalAnexarArquivos',


        'pages/registrar-atendimento/services/demandaService',
        'pages/registrar-atendimento/modals/modalCadastroReferido',
        'pages/registrar-atendimento/services/tipoTelefoneService',
        'pages/registrar-atendimento/services/validadorCamposService',
        'pages/registrar-atendimento/services/referidoService',
        'pages/registrar-atendimento/services/classificacaoDemandaService',
        'pages/registrar-atendimento/services/registrarDadosComplementaresDemandaService',
        'pages/registrar-atendimento/modals/modalRegistrarDemanda',
        'pages/registrar-atendimento/modals/modalCartaSUS',
        'pages/registrar-atendimento/services/cartaSUSService',
        'pages/registrar-atendimento/modals/modalConfirmacao',
        'pages/configurar-prazo-demanda/services/configurarPrazoDemandaService',

        'pages/manter-daps/services/consultarDapsService',
        'pages/manter-rede/services/manterRedeService',
        'pages/gerar-modelo-documento-oficial/services/modeloDocumentoOficialService',

        'pages/registrar-atendimento/modals/modalGerarEspelhoDemanda',
        'pages/registrar-atendimento/services/espelhoDemandaService',
        'pages/registrar-atendimento/modals/modalGerarEspelhoDemandaRedeDestino',

        'pages/manter-rede/services/manterRedeService',
        'pages/manter-sub-rede/services/subRedeService',

        'pages/configurar-pesquisa-satisfacao/services/pesquisaSatisfacaoService',
        'pages/configurar-pesquisa-satisfacao/services/perguntaPesquisaService',
        'pages/configurar-pesquisa-satisfacao/services/regraPerguntaService',
        'pages/configurar-pesquisa-satisfacao/services/pesquisaUtils',
        'pages/questionario-satisfacao/services/perguntaService'

    ], function (app) {
        'use strict';
        return app;
    }
);
