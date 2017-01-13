/*Global primitives*/
'use strict';
angular.module('BasicPrimitives', [], function ($compileProvider) {
    $compileProvider.directive('bpOrgDiagram', function ($compile) {
        function link(scope, element, attrs) {

            var itemScopes = [];
            var config = new primitives.orgdiagram.Config();
            var chart = {};

            scope.$on('TreeConfigurationCompleted', function (ev, args) {

                // angular.extend(config, scope.$parent.tree);
                angular.extend(config, args.options);
                config.onItemRender = onTemplateRender;
                config.onCursorChanged = onCursorChanged;
                config.onHighlightChanged = onHighlightChanged;

                chart = jQuery(element).orgDiagram(config);

                scope.$watch('options.highlightItem', function (newValue, oldValue) {
                    var highlightItem = chart.orgDiagram("option", "highlightItem");
                    if (highlightItem != newValue) {
                        chart.orgDiagram("option", {highlightItem: newValue});
                        chart.orgDiagram("update", primitives.orgdiagram.UpdateMode.PositonHighlight);
                    }
                });

                scope.$watch('options.cursorItem', function (newValue, oldValue) {
                    var cursorItem = chart.orgDiagram("option", "cursorItem");
                    if (cursorItem != newValue) {
                        chart.orgDiagram("option", {cursorItem: newValue});
                        chart.orgDiagram("update", primitives.orgdiagram.UpdateMode.Refresh);
                    }
                });

                scope.$watchCollection('options.items', function (items) {
                    chart.orgDiagram("option", {items: items});
                    chart.orgDiagram("update", primitives.orgdiagram.UpdateMode.Refresh);
                });

            });

            function onTemplateRender(event, data) {
                console.log("onTemplateRender");
                var itemConfig = data.context;

                switch (data.renderingMode) {
                    case primitives.common.RenderingMode.Create:
                        /* Initialize widgets here */
                        var itemScope = scope.$new();
                        itemScope.itemConfig = itemConfig;
                        $compile(data.element.contents())(itemScope);
                        if (!scope.$parent.$$phase) {
                            itemScope.$apply();
                        }
                        itemScopes.push(itemScope);
                        break;
                    case primitives.common.RenderingMode.Update:
                        /* Update widgets here */
                        // var itemScope = data.element.contents().scope();
                        var itemScope = data.element.contents();
                        // itemScope.itemConfig = itemConfig;
                        break;
                }
            }

            function onCursorChanged(e, data) {
                scope.options.cursorItem = data.context ? data.context.id : null;
                scope.onCursorChanged();
                scope.$apply();
            }

            function onHighlightChanged(e, data) {
                scope.options.highlightItem = data.context ? data.context.id : null;
                scope.onHighlightChanged();
                scope.$apply();
            }

            element.on('$destroy', function () {
                /* destroy items scopes */
                for (var index = 0; index < scope.length; index++) {
                    itemScopes[index].$destroy();
                }

                /* destory jQuery UI widget instance */
                chart.remove();
            });
        }

        return {
            scope: {
                options: '=options',
                onCursorChanged: '&onCursorChanged',
                onHighlightChanged: '&onHighlightChanged'
            },
            link: link
        };
    });
});

angular.module('myApp.view1', ['ngRoute', 'BasicPrimitives'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view1', {
            templateUrl: 'tratar-demanda/views/encaminharAnalisarDemanda.tpl.html',
            controller: 'View1Ctrl'
        });
    }])

    .constant('path', "tratar-demanda/mock/")

    .controller('View1Ctrl', ['$scope', 'demandaService', 'treeService', '$log',
        function ($scope, demandaService, treeService, $log) {

            $scope.demanda = {};
            $scope.index = 10;
            $scope.Message = "";
            $scope.tree = {};

            demandaService.get('500').success(function (response) {
                treeService.setupTree(response.resultado)
                    .then(function (tree) {
                        $scope.tree = tree;
                    }, function (reason) {
                        $log.warn(reason);
                    });
            });

            $scope.onButtonClick = function (e, data) {
                console.log(e);
                console.log(data);
            };

            $scope.setCursorItem = function (item) {
                $scope.tree.cursorItem = item;
            };

            $scope.setHighlightItem = function (item) {
                $scope.tree.highlightItem = item;
            };

            $scope.deleteItem = function (index) {
                $scope.tree.items.splice(index, 1);
            };

            $scope.addItem = function (index, parent) {
                var id = $scope.index++;
                $scope.tree.items.splice(index, 0, new primitives.orgdiagram.ItemConfig({
                    id: id,
                    parent: parent,
                    title: "New title " + id,
                    description: "New description " + id,
                    image: "bower_components/basic-primitive-demo/images/photos/b.png"
                }));
            };

            $scope.onMyCursorChanged = function () {
                $scope.Message = "onMyCursorChanged";
            };

            $scope.onMyHighlightChanged = function () {
                $scope.Message = "onMyHighlightChanged";
            };

        }])

    .factory('demandaService', function ($http, path) {
        return {
            get: function (id) {
                return $http.get(path + id + '.json');
            }
        };
    })

    .filter('treeColor', ["StatusTreeEnum", function (StatusTreeEnum) {
        return function (status) {
            switch (status) {
                case StatusTreeEnum.ENCAMINHADO.descricao :
                    return StatusTreeEnum.ENCAMINHADO.color;
                    break;
                case StatusTreeEnum.RENCAMINHADO.descricao:
                    return StatusTreeEnum.RENCAMINHADO.color;
                    break;
                case StatusTreeEnum.EM_ANALISE.descricao:
                    return StatusTreeEnum.EM_ANALISE.color;
                    break;
                case StatusTreeEnum.DEVOLVIDO.descricao:
                    return StatusTreeEnum.DEVOLVIDO.color;
                    break;
                case StatusTreeEnum.RESPONDIDO.descricao:
                    return StatusTreeEnum.RESPONDIDO.color;
                    break;
                case StatusTreeEnum.CONCLUIDO.descricao:
                    return StatusTreeEnum.CONCLUIDO.color;
                    break;
                default:
                    return "#000000";
            }
        };
    }])

    .filter('treeSrcImageNode', function () {
        return function (letter) {
            var l = letter.toLowerCase() || "a";
            return "bower_components/basic-primitive-demo/images/photos/" + l + ".png"
        }
    })

    .constant("StatusTreeEnum", {
        ENCAMINHADO: {id: 1, descricao: 'Encaminhado', color: "#0288D1"},
        RENCAMINHADO: {id: 2, descricao: 'Reencaminhado', color: "#F57C00"},
        EM_ANALISE: {id: 3, descricao: 'Em Análise', color: "#FFD600"},
        DEVOLVIDO: {id: 4, descricao: 'Devolvido', color: "#D50000"},
        RESPONDIDO: {id: 5, descricao: 'Respondido', color: "#388E3C"},
        CONCLUIDO: {id: 6, descricao: 'Concluído', color: "#303F9F"}
    })

    .factory('treeService', ['$filter', '$q', '$rootScope', function ($filter, $q, $rootScope) {

        /** ===================================================================================
         *                      Array Nodes Tree
         * ====================================================================================
         */

        /**
         * Monta o NODE da arvore conforme object esperado pelo compoente.
         * @param node {encaminhamento realizad}
         * @param idParent {id da rede que realizou os primeiros encaminhamentos na arvore}
         * @returns {primitives.famdiagram.ItemConfig|primitives.orgdiagram.ItemConfig}
         */
        function obterNodeTree(node, idParent) {
            return new primitives.orgdiagram.ItemConfig({
                id: node.id,
                parent: node.encaminhamentoAnterior || idParent,
                title: node.redeDestino.sigla,
                description: node.redeDestino.nome,
                image: $filter('treeSrcImageNode')(node.redeDestino.sigla[0]),
                itemTitleColor: $filter('treeColor')(node.statusEncaminhamentoDemanda.descricao),
                encaminhamento: node,
                templateName: "nodeTemplate"
            });
        }

        /**
         * Obtem do primeiro lancamento sem encaminhamento anterior [primeiro nivel da arvore]
         * a informaçao da rede origem [rede que inclue os primeiros niveis da arvore]
         * @param array
         * @returns {{id, parent: null, title: *, description: (string|string|*|string|string), image: *, itemTitleColor: *}}
         */
        function obterRootNodeTree(array) {
            var root = _.findWhere(array, {encaminhamentoAnterior: null});
            return {
                id: root.redeOrigem.id,
                parent: null,
                title: root.redeOrigem.sigla,
                description: root.redeOrigem.nome,
                image: $filter('treeSrcImageNode')(root.redeOrigem.sigla[0]),
                itemTitleColor: $filter('treeColor')("ROOT"),
                templateName: "rootTemplate"
            };
        }

        /**
         * Recebe a lista de encaminhamentos processando inicialmente o root da arvore
         * @param array
         * @returns {Array}
         */
        function montarEncaminhamento(array) {
            var tree = [];
            var root = obterRootNodeTree(array);
            tree.push(root);

            angular.forEach(array, function (item) {
                tree.push(obterNodeTree(item, root.id));
            });
            return tree;
        }


        /** ===================================================================================
         *                      Templates Tree
         * ====================================================================================
         */

        //TODO implementar
        function getConnectorAnnotationConfig() {
            return new primitives.orgdiagram.ConnectorAnnotationConfig({
                fromItem: 481,
                toItem: 522,
                label: "<div class='bp-badge' style='width:20px; height:20px;background-color:red; color: white;'>1</div>",
                labelSize: new primitives.common.Size(80, 30),
                connectorShapeType: primitives.common.ConnectorShapeType.BothWay,
                color: primitives.common.Colors.Red,
                offset: 0,
                lineWidth: 2,
                lineType: primitives.common.LineType.Dashed,
                selectItems: false
            })
        }


        /** ===================================================================================
         *                      Templates Tree
         * ====================================================================================
         */
        function getNodeTemplate() {
            var result = new primitives.orgdiagram.TemplateConfig();
            result.name = "nodeTemplate";
            result.itemSize = new primitives.common.Size(180, 120);
            result.minimizedItemSize = new primitives.common.Size(3, 3);
            result.highlightPadding = new primitives.common.Thickness(2, 2, 2, 2);

            var itemTemplate = jQuery(''
                + '<div class="bp-item bp-corner-all bt-item-frame">'
                + ' <div name="titleBackground" class="bp-item bp-corner-all bp-title-frame node-title-frame" style="background:{{itemConfig.itemTitleColor}};">'
                + '     <div name="title" class="bp-item bp-title node-title-item" >{{itemConfig.title}}</div>'
                + ' </div>'
                + ' <div class="bp-item bp-photo-frame node-photo-frame">'
                + '     <img name="photo" class="node-photo" src="{{itemConfig.image}}"/>'
                + ' </div>'
                + '<div class="bp-item node-info-name">{{itemConfig.description}}</div>'
                + '<div class="bp-item node-info-name">{{itemConfig.description}}</div>'
                + '</div>'
            ).css({
                width: result.itemSize.width + "px",
                height: result.itemSize.height + "px"
            }).addClass("bp-item bp-corner-all bt-item-frame");

            result.itemTemplate = itemTemplate.wrap('<div>').parent().html();

            return result;
        }

        function getRootTemplate() {
            var result = new primitives.orgdiagram.TemplateConfig();
            result.name = "rootTemplate";
            result.itemSize = new primitives.common.Size(280, 100);
            result.minimizedItemSize = new primitives.common.Size(5, 5);
            result.minimizedItemCornerRadius = 5;
            result.highlightPadding = new primitives.common.Thickness(2, 2, 2, 2);

            var itemTemplate = jQuery(''
                + '<div class="bp-item bp-corner-all bt-item-frame">'
                + ' <div name="titleBackgrond" class="bp-item bp-corner-all bp-title-frame root-title-frame">'
                + '     <div name="title" class="bp-item bp-title root-title-item">{{itemConfig.title}}</div>'
                + ' </div>'
                + ' <div class="bp-item bp-photo-frame root-photo-frame">'
                + '     <img name="photo" class="root-photo" src="{{itemConfig.image}}"/>'
                + ' </div>'
                + ' <div class="bp-item root-info-nome">{{itemConfig.description}}</div>'
                + '</div>'
            ).css({
                width: result.itemSize.width + "px",
                height: result.itemSize.height + "px"
            }).addClass("bp-item bp-corner-all bt-item-frame");
            result.itemTemplate = itemTemplate.wrap('<div>').parent().html();
            return result;
        }

        /** ===================================================================================
         *                      Config Options TREE
         * ====================================================================================
         */
        function setupTree(encaminhamentos) {
            var options = new primitives.orgdiagram.Config();
            options.items = montarEncaminhamento(encaminhamentos);
            options.cursorItem = 0;
            options.highlightItem = 0;
            options.templates = [getNodeTemplate(), getRootTemplate()];
            options.defaultTemplateName = "nodeTemplate";
            options.hasSelectorCheckbox = primitives.common.Enabled.False;
            options.arrowsDirection = primitives.common.GroupByType.Children;
            options.annotations = [getConnectorAnnotationConfig()];

            return options;
        }

        //$compile(markup)($scope).appendTo(angular.element("#appendHere"));

        return {
            setupTree: function (encaminhamentos) {
                var deferred = $q.defer();

                if (encaminhamentos) {
                    var options = setupTree(encaminhamentos);
                    deferred.resolve(options);
                    $rootScope.$broadcast('TreeConfigurationCompleted', {options: options});
                } else {
                    deferred.reject("Lista encaminhamentos invalida:\n " + encaminhamentos);
                }

                return deferred.promise;
            }
        }
    }]);

/**
 * TODO supportsSVG supportsCanvas
 */
