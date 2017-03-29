/*global define*/
define(['app'], function (app) {

    "use strict";

    app.factory("modalConfirmacaoEncaminhamentoPendenteRespostaController", ['$modal', '$filter',
        function ($modal, $filter) {

            var abrir = function (callBack) {

                $modal.open({
                    windowClass: 'modal-confirmacao',
                    templateUrl: 'app/pages/tratar-demanda/views/modalConfirmacaoEncaminhamentoPendenteResposta.tpl.html',
                    size: 'lg',
                    controller: function ($scope, $modalInstance) {

                        $scope.mensagem = $filter('translate')('MC042');

                        $scope.fechar = function () {
                            $modalInstance.close();
                        };

                        $scope.confirmar = function () {
                            if(callBack){
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
