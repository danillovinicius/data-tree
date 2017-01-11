//define([
//        //'angular'
//        ], 
		!function() {
			'use strict';
			try {
				var msNotify = angular.module('msNotify', []);
                                
                                /*
                                 * Injecting into $rootScope
                                 */
                                msNotify.run(['$rootScope', '$msNotifyService', '$msAlertService', function($rootScope, $msNotifyService, $msAlertService) {
                                        $rootScope.$msNotify = $msNotifyService;
                                        $rootScope.$msAlert = $msAlertService;
                                        
                                        $rootScope.closeAlert = function(messages, index) {
                                            messages.splice(index, 1);
                                        };
                                        
                                }]);
                            
                            return msNotify;
			}
			catch(e) {
				$log.error(e);
			}
		
}();
   