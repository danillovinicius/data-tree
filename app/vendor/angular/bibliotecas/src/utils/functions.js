function ucFirst(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function resolve(names) {
    return {
        load: ['$q', '$rootScope', function ($q, $rootScope) {
            var defer = $q.defer();
            require(names, function () {
                defer.resolve();
                $rootScope.$apply();
            });
            return defer.promise;
        }]
    }
};

function retira_acentos(palavra) { 
    com_acento = "áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÖÔÚÙÛÜÇ"; 
    sem_acento = "aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC"; 
    nova=""; 
    for(i=0;i<palavra.length;i++) { 
        if (com_acento.search(palavra.substr(i,1))>=0) { 
            nova += sem_acento.substr(com_acento.search(palavra.substr(i,1)),1); 
        } 
        else { 
            nova+=palavra.substr(i,1); 
        } 
    } 
    return nova; 
}

