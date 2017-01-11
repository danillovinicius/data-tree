!function () {
    'use strict';
    var msScroll = angular.module('msScroll', []);

    msScroll.config(['$provide', '$compileProvider', '$validatorProvider',
        function ($provide, $compileProvider, $validatorProvider) {


            msScroll._directive = msScroll.directive;
            msScroll.directive = function (name, constructor) {
                $compileProvider.directive(name, constructor);
                return ( this );

            };

            msScroll._factory = msScroll.factory;
            msScroll.factory = function (name, constructor) {
                $provide.factory(name, constructor);
                return ( this );

            };


        }]);

    return msScroll;
}();
   