define(['app'], function (app) {

    "use strict";

    app.factory("modalAnexarArquivos", ['$modal',
        function ($modal) {

            var abrir = function (encaminhamento, callBack) {
                $modal.open({
                    windowClass: 'tamanho-tela',
                    templateUrl: 'app/pages/tratar-demanda/views/modalAnexarArquivos.tpl.html',
                    size: 'xm',
                    controller: function ($scope, $modalInstance) {

                      $scope.fechar = function () {
                        $modalInstance.close();
                      };


                    }
                });
            };

            return {
                abrir: abrir
            };
        }]);
});
