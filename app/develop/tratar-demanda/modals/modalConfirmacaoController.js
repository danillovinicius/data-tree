/*global define*/
define(['app'], function (app) {

    "use strict";

    app.factory("modalConfirmacaoController", ['$modal', '$filter', function ($modal, $filter) {

        var abrir = function (callBack) {
            $modal.open({
                windowClass: 'modal-confirmacao',
                templateUrl: 'app/pages/tratar-demanda/views/modalConfirmacao.tpl.html',
                size: 'lg',
                controller: function ($scope, $modalInstance) {

                    $scope.mensagem = $filter('translate')('MC043');

                    $scope.fechar = function () {
                        $modalInstance.close();
                    };

                    $scope.confirmar = function () {
                        if (callBack) {
                            callBack();
                        }
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
