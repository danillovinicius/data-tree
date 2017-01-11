!function() {

    'use strict';

    var msBreadcrumb = angular.module('msBreadcrumb');

    msBreadcrumb.provider('$breadcrumb', function() {

        try {
            var options = {};

            this.setPrefixState = function(prefixStateName) {
                options.prefixStateName = prefixStateName;
            };

            var _pushNonexistentState = function(array, state) {
                var stateAlreadyInArray = false;
                angular.forEach(array, function(value) {
                    if(!stateAlreadyInArray && angular.equals(value, state)) {
                        stateAlreadyInArray = true;
                    }
                });
                if(!stateAlreadyInArray) {
                    array.push(state);
                }
                return stateAlreadyInArray;
            };

            this.$get = ['$state', function($state) {
                    
                return {
                    getStatesChain : function() {
                        var chain = [];

                        // Prefix state
                        if(options.prefixStateName) {
                            var prefixState = $state.get(options.prefixStateName);
                            if(prefixState) {
                                _pushNonexistentState(chain, prefixState);
                            } else {
                                throw 'Bad configuration : prefixState "' + options.prefixStateName + '" unknown';
                            }
                        }

                        angular.forEach($state.$current.path, function(value) {
                            _pushNonexistentState(chain, value.self);
                        });

                        return chain;
                    }
                };
            }];
            }
            catch(e) {
                    $rootScope.$msNotify.error(e);
            }

    });

    return msBreadcrumb;
}();