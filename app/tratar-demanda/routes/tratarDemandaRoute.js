define([], function () {
    var routes = [{
        module: 'tratar-demanda',
        text: 'Tratar Demanda',
        view: 'tratarDemanda',
        controller: 'tratarDemandaController',
        state: {
            name: 'tratar-demanda',
            url: 'tratar-demanda'
        },
        roles: ['ROLE_RA']
    },{
        module: 'tratar-demanda',
        text: 'Encaminhar / Analisar Demanda',
        view: 'encaminharAnalisarDemanda',
        controller: 'encaminharAnalisarDemandaController',
        state: {
            name: 'encaminhar-analisar-demanda',
            url: 'encaminhar-analisar-demanda/:idDemanda?protocolo&encaminhado'
        },
        roles: ['ROLE_RA']
    }, {
        module: 'tratar-demanda',
        text: 'Responder Encaminhamento Demanda',
        view: 'responderFecharDemanda',
        controller: 'responderFecharDemandaController',
        state: {
            name: 'tratar-demanda-tramitada',
            url: 'tratar-demanda-tramitada/:idDemanda'
        },
        roles: ['ROLE_RA']
    }, {
        module: 'tratar-demanda',
        text: 'Fechar Encaminhamento Demanda',
        view: 'responderFecharDemanda',
        controller: 'responderFecharDemandaController',
        state: {
            name: 'fechar-demanda',
            url: 'fechar-demanda/:idDemanda'
        },
        roles: ['ROLE_RA']
    },{
        module: 'tratar-demanda',
        text: 'Encaminhar / Analisar Demanda',
        view: 'encaminharAnalisarDemanda',
        controller: 'encaminharAnalisarDemandaController',
        state: {
            name: 'tratar-demanda-tramitada.reencaminhar-demanda',
            url: 'reencaminhar-demanda/:idRedeDestino/:isOrigem'
        },
        roles: ['ROLE_RA']
    }];
    return routes;
});
