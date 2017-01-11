!function() {
    'use strict';
    
    var msModal =  angular.module('msModal', ['ui.bootstrap']);

    /*
     * Configurando o modulo para permitir LazyLoading de providers
     */
    msModal.config(['$controllerProvider', '$provide', '$compileProvider',
                        function($provide, $compileProvider){

            msModal.directive = function( name, constructor ) {
                $compileProvider.directive( name, constructor );
                return( this );

            };      

            msModal.service = function( name, constructor ) {
                $provide.service( name, constructor );
                return( this );

            };
    }]);

    return msModal;
}();
   
!function () {
    'use strict';

    var msModal = angular.module('msModal', ['ui.bootstrap']);

    /*
     * Configurando o modulo para permitir LazyLoading de providers
     */
    msModal.config(['$controllerProvider', '$provide', '$compileProvider',
        function ($provide, $compileProvider) {

            msModal.directive = function (name, constructor) {
                $compileProvider.directive(name, constructor);
                return ( this );

            };

            msModal.service = function (name, constructor) {
                $provide.service(name, constructor);
                return ( this );

            };
        }]);

    return msModal;
}();

!function () {

    'use strict';

    var msModal = angular.module('msModal');

    msModal.service('msModalService', ['$modal', '$http', '$compile', '$templateCache', '$log',
        function ($modal, $http, $compile, $templateCache, $log) {

            'use strict';

            /**
             * Method to change de default template.
             * It can be set as an object, passing the name and the content.
             * The template will be assigned to a cache named with the name passed to.
             * The default template is the twitter bootstrap template and uses the ms-compile directive, forcing the modal to inheirt the scope and to not create one new,
             * so we can control forms and validations within the actual control.
             * @param object template
             * @returns this
             */
            this.setTemplate = function (template) {
                if (template) {
                    if (template.name && template.content) {
                        $templateCache.put(template.name, template.content);
                        this.config.templateUrl = template.name;
                    }
                    else {
                        $log.info('Não foi infomado um template com nome e conteúdo {name: "", content: ""}')
                    }
                }
                else {

                    var templateDefault = '<div class="modal-content">' +
                        '<div class="modal-header">' +
                        '<button type="button" class="close" ng-click="$close()" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                        '<h4 class="modal-title">{{ msModalOptions.title }}</h4>' +
                        '</div>' +
                        '<ms-alert></ms-alert>' +
                        '<div class="modal-body" ng-if="msModalOptions.content" ms-compile="msModalOptions.content" keep-scope="true"></div>' +
                        '<div class="modal-body" ng-if="msModalOptions.templateUrl" ng-include="msModalOptions.templateUrl"></div>' +
                        '<div class="modal-footer">' +
                        '<button type="button" class="{{ button.style }}" ng-click="button.ngClick()" ng-repeat="button in msModalOptions.buttons">{{ button.name }}</button>' +
                        '</div>' +
                        '</div>';

                    $templateCache.put('/modal/default.html', templateDefault);
                    this.config.templateUrl = '/modal/default.html';
                }

                return this;
            }

            /**
             * Default configuration.
             * It can be reseted or have new parameters added (according to angular ui bootstrap)
             * using setConfig method
             */
            this.config = {
                backdrop: true,
                keyboard: true,
                modalFade: true,
                size: ''
            };

            /**
             * Default options.
             * It can be reseted using setConfig method
             */
            this.options = {
                title: 'Modal title',
                content: '',
                size: '',
                resolve: {},
                buttons: {}
            };

            /**
             * set options
             * @param object options
             * @returns this
             */
            this.setOptions = function (options) {

                this.options = options;
                return this;
            };

            /**
             * get options
             * @returns this.options
             */
            this.getOptions = function () {
                return this.options;
            };


            /**
             * set config
             * @param object config
             * @returns this
             */
            this.setConfig = function (config) {
                angular.extend(this.config, config);
                return this;
            };

            this.modalInstance = '';

            /**
             * Allows to instantiate the modalInstance within this service, validating all the contents passed by
             * @param objectconfig
             * @param object options
             * @returns modalInstance
             */
            this.init = function (config, options) {

                var modalOptions = this.options;

                var $this = this;

                if (this.options.content) {
                    if ($this.options.content.match(/^#/g)) {
                        var element = angular.element($this.options.content);
                        if (angular.isElement(element)) {

                            //$this.setTemplateBodyType($this.options.content.replace(/^#/g, ''));
                            var scope = element.scope();
                            modalOptions.content = $compile(element.html())(scope);

                            this.setOptions(modalOptions);
                        }
                    }
                }

                if (modalOptions.controller) {
                    $this.config.controller = modalOptions.controller;
                }

                if (!$this.config.controller) {
                    $this.config.controller = function ($scope, $modalInstance) {
                        $scope.msModalOptions = $this.options;
                    };
                }

                this.config.size = modalOptions.size;
                this.config.resolve = modalOptions.resolve;

                this.setTemplate(modalOptions.template);

                return this.modalInstance = $modal.open(this.config);
            };

            /**
             * Allows to open a modal
             * @returns modalInstance promise
             */
            this.open = function () {
                return this.init().result;
            }

            /**
             * Allows to close the modalInstance
             * @returns modalInstance promise
             */
            this.close = function (arg) {
                return this.modalInstance.close(arg);
            }


            /**
             * Allows to dismiss the modalInstance
             * @returns modalInstance promise
             */
            this.dismiss = function (arg) {
                return this.modalInstance.dismiss(arg);
            }

        }]);

    return msModal;

}();