!function() {
    'use strict';

    var msRoute = angular.module('msRoute', ['pascalprecht.translate', 'ui.router']);
    
    msRoute.run(['$rootScope', '$state', '$translate', '$translatePartialLoader', 
        function($rootScope, $state, $translate, $translatePartialLoader){
            $rootScope.reloadState = function(state) {
                $state.go(state, {}, {reload:true});
            };

            $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
                
                if(!$translatePartialLoader.isPartAvailable(toState.module)) {
                    $translatePartialLoader.addPart(toState.module);
                }
                
                $translate.refresh();
                $state.reload();
                $rootScope.$msNotify.close();
            });

            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

                if(fromState.module) {
                    if($translatePartialLoader.isPartAvailable(fromState.module)) {
                        $translatePartialLoader.deletePart(fromState.module, true);
                    };
                }

                $rootScope.$msNotify.loading();
            });

    }]);


    msRoute.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
          msRoute.$stateProvider = $stateProvider;  
          msRoute.$urlRouterProvider = $urlRouterProvider;
    }]);

    msRoute.createRoute = function(routes) {
        try{
            var elem = angular.element('body');
            var injector = elem.injector();
            var myService = injector.get('msRouteService');
            myService.create(routes);
            elem.scope().$apply();
        }
        catch(e) {
            console.log(e);
        }
    }
return msRoute;
                
}();