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