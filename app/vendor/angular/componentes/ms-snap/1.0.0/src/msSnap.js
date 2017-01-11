!function () {
    'use strict';
    var msSnap = angular.module('msSnap', []);

    msSnap.config(['$provide', '$compileProvider', '$validatorProvider',
        function ($provide, $compileProvider, $validatorProvider) {


            msSnap._directive = msSnap.directive;
            msSnap.directive = function (name, constructor) {
                $compileProvider.directive(name, constructor);
                return ( this );

            };

            msSnap._factory = msSnap.factory;
            msSnap.factory = function (name, constructor) {
                $provide.factory(name, constructor);
                return ( this );

            };


        }]);

    return msSnap;
}();
   