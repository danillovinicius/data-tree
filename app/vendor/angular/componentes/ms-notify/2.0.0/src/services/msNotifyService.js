//define([
//        //'componentes/ms-notify/services/msNotifyProvider'
//        ], 
		!function() {
		
		'use strict';
                
                var msNotify = angular.module('msNotify');
	    
		msNotify.factory('$msNotifyService', ['$msNotifyProvider', '$log', function($msNotifyProvider, $log) {
			return {
                            init: function($message, $type, $config) {
                                
                                if($message instanceof Array) {
                                   
                                    if($message.length) {
                                        angular.forEach($message, function(message) {
                                            $config.text = (message.texto) ? message.texto : $config.text;
                                            $msNotifyProvider($config);
                                        });
                                    }
                                }
                                else {
                                    $config.text = ($message) ? $message : $config.text;
                                    $msNotifyProvider($config);
                                }
                            },
                            error : function($message) {
                                try {
                                    var config = {
                                        text: '<h5>Oops, ocorreu um erro.</h5>',
                                        type: 'error',
                                        layout: 'topCenter',
                                        //modal:true,
                                        timeout: 20000,
                                        force: true,
                                        dismissQueue: true,
                                        closeWith: ['button'] // ['click', 'button', 'hover']
                                    };
                                    return this.init($message, 'error', config);
                                }
                                catch(e) {
                                        $log.error(e);
                                }
                            },
                            success : function($message) {
                                try{
                                    var config = {
                                        text: '<h5>Operação efetuada com sucesso.</h5>',
                                        type: 'success',
                                        layout: 'topCenter',
                                        timeout: 2000
                                    };

                                    return this.init($message, 'success', config);
                                }
                                catch(e) {
                                    this.error(e);
                                }
                            },
                            warning : function($message) {
                                try{
                                    var config = {
                                        text: '<h5>Atenção!</h5>',
                                        type: 'alert',
                                        layout: 'topCenter',
                                        timeout: 2000,
                                        force: true,
                                        dismissQueue: true
                                    };

                                    return this.init($message, 'warning', config);
                                }
                                catch(e) {
                                    this.error(e);
                                }
                            },
                            info : function($message) {
                                try{

                                    var config = {
                                        text: '<h5>Verifique as seguintes informações:</h5>',
                                        type: 'information',
                                        layout: 'topCenter',
                                        timeout: 2000
                                    };
                                    return this.init($message, 'information', config);
                                }
                                catch(e) {
                                    this.error(e);
                                }
                            },
                            loading : function($message) {
                                try {

                                    var config = {
                                        text: '<h5>Aguarde</h5>',
                                        layout: 'center',
                                        modal:true,
                                        force: true,
                                        maxVisible: 1,
                                        animation: {
                                            open: {height: 'toggle'},
                                            close: {height: 'toggle'},
                                            easing: 'swing',
                                            speed:  100 // opening & closing animation speed
                                        },
                                        
                                    };
                                    
                                    return this.init($message, 'warning', config);
                                }
                                catch(e) {
                                    this.error(e);
                                } finally{
                                	$rootScope.$broadcast('_STOP_ALERT_');
                                }
                                
                            },
                            close: function() {
                                jQuery.noty.closeAll();
                            }
	        };
	    }]);
		
		return msNotify;
		
}();