/*Global primitives*/
'use strict';
angular.module('BasicPrimitives', [], function ($compileProvider) {
    $compileProvider.directive('bpOrgDiagram', function ($compile) {
        function link(scope, element, attrs) {

            var itemScopes = [];
            var config = new primitives.orgdiagram.Config();
            var chart = {};

            scope.$on('TreeConfigurationCompleted', function (ev, args) {

                angular.extend(config, scope.$parent.tree);
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
                        var itemScope = data.element.contents().scope();
                        itemScope.itemConfig = itemConfig;
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

    .constant("StatusTreeEnum", {
        ENCAMINHADO: {id: 1, descricao: 'Encaminhado', color: "#0288D1"},
        RENCAMINHADO: {id: 2, descricao: 'Reencaminhado', color: "#F57C00"},
        EM_ANALISE: {id: 3, descricao: 'Em Análise', color: "#FFD600"},
        DEVOLVIDO: {id: 4, descricao: 'Devolvido', color: "#D50000"},
        RESPONDIDO: {id: 5, descricao: 'Respondido', color: "#388E3C"},
        CONCLUIDO: {id: 6, descricao: 'Concluído', color: "#303F9F"}
    })

    .factory('treeService', ['$filter', '$q', '$rootScope', function ($filter, $q, $rootScope) {

        function getCursorTemplate() {
            var result = new primitives.orgdiagram.TemplateConfig();
            result.name = "CursorTemplate";

            result.itemSize = new primitives.common.Size(120, 100);
            result.minimizedItemSize = new primitives.common.Size(3, 3);
            result.highlightPadding = new primitives.common.Thickness(2, 2, 2, 2);
            result.cursorPadding = new primitives.common.Thickness(3, 3, 50, 8);

            var cursorTemplate = jQuery("<div></div>")
                .css({
                    position: "absolute",
                    overflow: "hidden",
                    width: (result.itemSize.width + result.cursorPadding.left + result.cursorPadding.right) + "px",
                    height: (result.itemSize.height + result.cursorPadding.top + result.cursorPadding.bottom) + "px"
                });

            var cursorBorder = jQuery("<div></div>")
                .css({
                    width: (result.itemSize.width + result.cursorPadding.left + 1) + "px",
                    height: (result.itemSize.height + result.cursorPadding.top + 1) + "px"
                }).addClass("bp-item bp-corner-all bp-cursor-frame");
            cursorTemplate.append(cursorBorder);

            var bootStrapVerticalButtonsGroup = jQuery("<div></div>")
                .css({
                    position: "absolute",
                    overflow: "hidden",
                    top: result.cursorPadding.top + "px",
                    left: (result.itemSize.width + result.cursorPadding.left + 10) + "px",
                    width: "35px",
                    height: (result.itemSize.height + 1) + "px"
                }).addClass("btn-group btn-group-vertical");

            bootStrapVerticalButtonsGroup.append('<button class="btn btn-small" data-buttonname="info" type="button"><i class="icon-info-sign"></i></button>');
            bootStrapVerticalButtonsGroup.append('<button class="btn btn-small" data-buttonname="edit" type="button"><i class="icon-edit"></i></button>');
            bootStrapVerticalButtonsGroup.append('<button class="btn btn-small" data-buttonname="remove" type="button"><i class="icon-remove"></i></button>');

            cursorTemplate.append(bootStrapVerticalButtonsGroup);

            result.cursorTemplate = cursorTemplate.wrap('<div>').parent().html();

            return result;
        }

        function onMouseClick(event, data) {
            var target = jQuery(event.originalEvent.target);
            if (target.hasClass("btn") || target.parent(".btn").length > 0) {
                var button = target.hasClass("btn") ? target : target.parent(".btn");
                var buttonname = button.data("buttonname");

                var message = "User clicked '" + buttonname + "' button for item '" + data.context.title + "'.";
                message += (data.parentItem != null ? " Parent item '" + data.parentItem.title + "'" : "");
                alert(message);

                data.cancel = true;
            }
        }

        function getTemplate() {
            var result = new primitives.orgdiagram.TemplateConfig();
            result.name = "contactTemplate";

            result.itemSize = new primitives.common.Size(500, 100);
            result.minimizedItemSize = new primitives.common.Size(5, 5);
            result.minimizedItemCornerRadius = 5;
            result.highlightPadding = new primitives.common.Thickness(2, 2, 2, 2);

            var itemTemplate = jQuery(
                '<div class="bp-item bp-corner-all bt-item-frame">'
                + '<div name="titleBackground" class="bp-item bp-corner-all bp-title-frame" style="background:{{itemTitleColor}};top: 2px; left: 2px; width: 216px; height: 20px;">'
                + '<div name="title" class="bp-item bp-title" style="top: 3px; left: 6px; width: 208px; height: 18px;">{{itemConfig.title}}</div>'
                + '</div>'
                + '<div class="bp-item bp-photo-frame" style="top: 26px; left: 2px; width: 50px; height: 60px;">'
                + '</div>'
                + '<div><button ng-click="onButtonClick()"></button></div>'
                + '<div name="phone" class="bp-item" style="top: 26px; left: 56px; width: 162px; height: 18px; font-size: 12px;">{{itemConfig.phone}}</div>'
                + '<div class="bp-item" style="top: 44px; left: 56px; width: 162px; height: 18px; font-size: 12px;"><a name="email" href="mailto::{{itemConfig.email}}" target="_top">{{itemConfig.email}}</a></div>'
                + '<div class="bp-item" style="top: 44px; left: 56px; width: 162px; height: 18px; font-size: 12px;"><a ng-click= "onButtonClick()" name="email">--- Link ---</a></div>'
                + '<div name="description" class="bp-item" style="top: 62px; left: 56px; width: 162px; height: 36px; font-size: 10px;">{{itemConfig.description}}</div>'
                + '</div>'
            ).css({
                width: result.itemSize.width + "px",
                height: result.itemSize.height + "px"
            }).addClass("bp-item bp-corner-all bt-item-frame");
            result.itemTemplate = itemTemplate.wrap('<div>').parent().html();
            return result;
        }

        function montarEncaminhamento(array) {
            var tree = [];

            //TODO configurar ROOT
            tree.push(new primitives.orgdiagram.ItemConfig({
                id: 4,
                parent: null,
                title: "DOGES",
                description: "Departamento Geral do SUS",
                image: "bower_components/basic-primitive-demo/images/photos/d.png",
                itemTitleColor: $filter('treeColor')("root")
            }));

            //TODO refatorar criaçao nodes
            angular.forEach(array, function (item, idx) {
                var letter = item.redeDestino.sigla[0];
                tree.push(new primitives.orgdiagram.ItemConfig({
                    id: item.id,
                    parent: item.co_encaminhamento_anterior,
                    title: item.redeDestino.sigla,
                    description: item.redeDestino.nome,
                    email: "email@saude.gov.com",
                    image: "bower_components/basic-primitive-demo/images/photos/" + letter.toLowerCase() + ".png",
                    itemTitleColor: $filter('treeColor')(item.statusEncaminhamentoDemanda.descricao)
                }))
            });

            return tree;
        }

        function setupTree(encaminhamentos) {
            var options = new primitives.orgdiagram.Config();
            options.items = montarEncaminhamento(encaminhamentos);
            options.cursorItem = 0;
            options.highlightItem = 0;
            options.templates = [getCursorTemplate()];

            options.onMouseClick = onMouseClick;
            options.defaultTemplateName = "CursorTemplate";
            return options;
        }

        return {
            setupTree: function (encaminhamentos) {
                var deferred = $q.defer();

                if (encaminhamentos) {
                    // setTimeout(function () {
                    var tree = setupTree(encaminhamentos);
                    deferred.resolve(tree);
                    $rootScope.$broadcast('TreeConfigurationCompleted', {data: '$rootScope.broadcast'});
                    // }, 5000);
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
