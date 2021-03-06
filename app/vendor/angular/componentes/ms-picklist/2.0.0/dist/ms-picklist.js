!function() {
    'use strict';
    var msPicklist =  angular.module('msPicklist', []);

    /*
    * Configurando o modulo para permitir LazyLoading de providers
    */
    msPicklist.config(['$provide', '$compileProvider',
                       function($provide, $compileProvider){

           msPicklist.directive = function( name, constructor ) {
               $compileProvider.directive( name, constructor );
               return( this );

           };      

           msPicklist.service = function( name, constructor ) {
               $provide.service( name, constructor );
               return( this );

           };    

           msPicklist.factory = function( name, constructor ) {
               $provide.factory( name, constructor );
               return( this );

           };
    }]);

    return msPicklist;
			
}();
   
!function() {
    'use strict';

    var msPicklist = angular.module('msPicklist');

    msPicklist.directive('msPicklist', ['$compile', 'msPicklistService', '$log',  function($compile, msPicklistService, $log) {
                       
        return {
            restrict: 'E', //Element
            scope: {
                ngModelFrom:    '=',
                ngModelTo:      '=ngModel'
            },
            link: function (scope, element, attrs)
            { 

                try {

                    scope.$watch('ngModelFrom', function(val) {

                        scope.pickModelFrom = val;
                        scope.pickModelTo   = scope.ngModelTo;

                        scope.pickModelFrom = _.filter(scope.pickModelFrom, function(obj){ return !_.findWhere(scope.pickModelTo, obj); });

                        var dataFrom        = [];
                        var dataTarget      = [];

                        scope.addFrom = function(item) {
                            msPicklistService
                                    .setTarget(dataFrom)
                                    .setFrom(scope.pickModelFrom)
                                    .add(scope.pickModelFrom.indexOf(item))
                                    .then(
                                        function(result){
                                           dataFrom             = result.getTarget();
                                           scope.pickModelFrom  = result.getFrom();
                                           dataTarget           = [];
                                           angular.forEach(scope.pickModelTo, function(content, index) {
                                                content.active = false;
                                            });
                                       },
                                        function(error) {
                                            $log.log(error);
                                        }
                                    );
                        }

                        scope.addTarget = function(item) {
                            msPicklistService
                                    .setTarget(dataTarget)
                                    .setFrom(scope.pickModelTo)
                                    .add(scope.pickModelTo.indexOf(item))
                                    .then(
                                        function(result){
                                           dataTarget         = result.getTarget();
                                           scope.pickModelTo  = result.getFrom();
                                           dataFrom           = [];

                                           angular.forEach(scope.pickModelFrom, function(content, index) {
                                                content.active = false;
                                            });
                                        },
                                        function(error) {
                                            $log.log(error);
                                        }
                                    );
                        }

                        scope.moveToTarget = function() {
                            msPicklistService
                                    .setFrom(dataFrom)
                                    .setTarget(dataTarget)
                                    .move()
                                    .then(
                                        function(result){
                                            if(dataFrom.length) {
                                                scope.pickModelFrom     = _.difference(scope.pickModelFrom, dataFrom);

                                                scope.pickModelTo       = scope.pickModelTo.concat(result.getTarget());
                                                dataFrom                = [];
                                                dataTarget              = [];
                                                scope.ngModelTo         = scope.pickModelTo;
                                            }
                                        },
                                        function(error) {
                                            $log.log(error);
                                        }
                                    );
                        }

                        scope.moveToFrom = function() {
                            msPicklistService
                                    .setFrom(dataTarget)
                                    .setTarget(dataFrom)
                                    .move()
                                    .then(
                                        function(result){
                                            if(dataTarget.length) {
                                                scope.pickModelTo    = _.difference(scope.pickModelTo, dataTarget);
                                                scope.pickModelFrom  = scope.pickModelFrom.concat(result.getTarget());
                                                dataTarget           = [];
                                                dataFrom             = [];
                                            }
                                        },
                                        function(error) {
                                            $log.log(error);
                                        }
                                    );
                        }

                        scope.moveAllToFrom = function() {
                            scope.pickModelFrom     = scope.pickModelFrom.concat(scope.pickModelTo);
                            scope.pickModelTo       = [];
                            dataTarget              = [];
                            dataFrom                = [];
                            msPicklistService.setFrom(dataFrom).setTarget(dataTarget);
                            angular.forEach(scope.pickModelFrom, function(content, index) {
                                content.active = false;
                            });
                        }

                        scope.moveAllToTarget = function() {
                            scope.pickModelTo     = scope.pickModelTo.concat(scope.pickModelFrom);
                            scope.pickModelFrom   = [];
                            dataTarget              = [];
                            dataFrom              = [];
                            msPicklistService.setFrom(dataFrom).setTarget(dataTarget);
                            angular.forEach(scope.pickModelTo, function(content, index) {
                                content.active = false;
                            });
                        }


                        var template = angular.element(
                                '<div class="ms-picklist">\n\
                                    <div class="ms-picklist-box">\n\
                                      <ul class="nav nav-pills nav-stacked">\n\
                                        <li ng-class="{active: from.active}" ng-repeat="from in pickModelFrom | orderBy:\'descricao\'">\n\
                                          <a href="javascript:void(0);"  ng-click="addFrom(from)">{{ from.descricao }}</a>\n\
                                        </li>\n\
                                      </ul>\n\
                                    </div>\n\
                                    <div class="ms-picklist-buttons">\n\
                                      <button class="btn btn-sm" ng-click="moveToTarget()"><span class="ms-icone-seta-unica-direita"></span></button>\n\
                                      <button class="btn btn-sm" ng-click="moveToFrom()"><span class="ms-icone-seta-unica-esquerda"></span></button>\n\
                                      <button class="btn btn-sm" ng-click="moveAllToTarget()"><span class="ms-icone-setas-duplas-direita"></span></button>\n\
                                      <button class="btn btn-sm" ng-click="moveAllToFrom()"><span class="ms-icone-setas-duplas-esquerda"></span></button>\n\
                                    </div>\n\
                                    <div class="ms-picklist-box">\n\
                                      <ul class="nav nav-pills nav-stacked">\n\
                                        <li ng-class="{active: target.active}" ng-repeat="target in pickModelTo | orderBy:\'descricao\'">\n\
                                          <a href="javascript:void(0);" ng-click="addTarget(target)">{{ target.descricao }}</a>\n\
                                        </li>\n\
                                      </ul>\n\
                                    </div>\n\
                                  </div>\n\
                                '
                        );

                        $compile(template)(scope);
                        element.html(null).append(template);
                    });

                }
                catch(e) {
                    $log.log(e);
                }
            }
    };
    }]);

    return msPicklist;
		
		
}();
!function() {
    'use strict';

    var msPicklist = angular.module('msPicklist');

    msPicklist.factory('msPicklistService', ['$q', function($q){
            'use strict';

            var pickListContent = {};

            var _from;
            var _target;

            var setFrom = function(from) {
                _from = from;
                return this;
            }

            var getFrom = function() {
                return _from;
            }

            var setTarget = function(target) {
                _target  = target;
                return this;
            }

            var getTarget = function() {
                return _target;
            }

            var add = function(index) {
                var deferred = $q.defer();

                var target      = getTarget();
                var from        = getFrom();

                try {
                    if(target.indexOf(from[index]) == -1) {
                        target.push(from[index]);
                        from[index].active = true;
                    }
                    else {
                        from[index].active = false;
                        target.splice(index, 1);
                    }

                    setTarget(target);
                    setFrom(from);

                    deferred.resolve(this);
                }
                catch(e) {
                    deferred.reject(e);
                }

                return deferred.promise;
            }

            var move = function() {

                var deferred = $q.defer();
                var target      = getTarget();
                var from        = getFrom();

                try {
                    angular.forEach(from, function(content, index) {
                        content.active = false;
                        target.push(content);
                    });

                    setTarget(target);
                    setFrom([]);

                    deferred.resolve(this);
                }
                catch(e) {
                    deferred.reject(e);
                }

                return deferred.promise;
            }


            return {
                add: add,
                move: move,
                setFrom: setFrom,
                setTarget: setTarget,
                getFrom: getFrom,
                getTarget: getTarget
            };
    }]);

    return msPicklist;
		
}();