//define([
////        'componentes/ms-notify/msNotify',
////        'msControllers/msAlertController',
////        'componentes/ms-notify/services/msAlertService'
//        ], 
		!function() {
		
		'use strict';
                
		var msNotify = angular.module('msNotify');
		
		msNotify.directive('msAlert', ['$msAlertService', '$compile', '$timeout',  function($msAlertService, $compile, $timeout) {
                    return {
                        restrict:'EA',
                        controller: 'msAlertController',
                        /*
                        template:"<div class='alert' ng-class='\"alert-\" + (type || \"warning\")'>\n" +
                                        "    <button ng-show='closeable' type='button' class='close' ng-click='close()'>&times;</button>\n" +
                                        "    <div ng-transclude></div>\n" +
                                        "</div>\n",
                                        */
                        //transclude:true,
                        replace:true,
                        scope: true,
                        link: function(scope, element, attrs, ctrl) {
                            
                            //Atribuindo o ID do scope atual ao ELEMENTO
                            attrs.$set('id', scope.$id);
                            
                            //Setando o container para o serviço de mensageria
                            $msAlertService.setContainer(scope.$id);
                            
                            /**
                             * Quando o evento de mensageria for disparado, executo a exibição das 
                             * mensagens no respectivo container/scope
                             */
                            
                            scope.$on('_START_ALERT_', function(object, msgs, container) {
                                //Atribuindo as mensagens apenas ao respectivo scope.
                                if(scope.$id == container) {
                                    if (scope.messages == null){
                                        scope.messages= [];
                                    }
                                    
                                    msgs.push.apply(msgs, scope.messages);
                                    
                                    var newMsgs = [];
                                    
                                    angular.forEach(msgs, function(message) {
                                        newMsgs[message.type] = message;
                                    });
                                    
                                    scope.messages = _.values(newMsgs) ;
                                }
                                
                                var container = angular.element('#' + container);
                                
		                var template = angular.element("<div ng-repeat='alert in messages' class='alert' ng-class='\"alert-\" + (alert.type || \"warning\")'>\n" +
                                                                "    <button type='button' class='close' ng-click='closeAlert(messages, $index)'>&times;</button>\n" +
                                                                "    <span ms-compile='alert.message'></span>\n" +
                                                                "</div>\n");
		                
		                $compile(template)(scope);
		                container.html(null).append( template );
                            });
                            
                            /*
                             * Limpando todos os alerts
                             */
                            scope.$on('_STOP_ALERT_', function() {
                            	scope.messages = [];
                            });
                        }
                    };
		}]);
		
		return msNotify;
		
}();
