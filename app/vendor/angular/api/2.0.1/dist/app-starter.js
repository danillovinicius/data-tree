/**
 * angular-timer - v1.0.11 - 2014-01-10 2:05 PM
 * https://github.com/siddii/angular-timer
 *
 * Copyright (c) 2014 Siddique Hameed
 * Licensed MIT <https://github.com/siddii/angular-timer/blob/master/LICENSE.txt>
 */
angular.module('timer', [])
  .directive('timer', ['$compile', function ($compile) {
    return  {
      restrict: 'E',
      replace: false,
      scope: {
        interval: '=interval',
        startTimeAttr: '=startTime',
        endTimeAttr: '=endTime',
        countdownattr: '=countdown',
        autoStart: '&autoStart'
      },
      controller: ['$scope', '$element', '$attrs', '$timeout', function ($scope, $element, $attrs, $timeout) {

        //angular 1.2 doesn't support attributes ending in "-start", so we're
        //supporting both "autostart" and "auto-start" as a solution for
        //backward and forward compatibility.
        $scope.autoStart = $attrs.autoStart || $attrs.autostart;

        if ($element.html().trim().length === 0) {
          $element.append($compile('<span>{{millis}}</span>')($scope));
        } else {
          $element.append($compile($element.contents())($scope));
        }

        $scope.startTime = null;
        $scope.endTime = null;
        $scope.timeoutId = null;
        $scope.countdown = $scope.countdownattr && parseInt($scope.countdownattr, 10) >= 0 ? parseInt($scope.countdownattr, 10) : undefined;
        $scope.isRunning = false;

        $scope.$on('timer-start', function () {
          $scope.start();
        });

        $scope.$on('timer-resume', function () {
          $scope.resume();
        });

        $scope.$on('timer-stop', function () {
          $scope.stop();
        });

        function resetTimeout() {
          if ($scope.timeoutId) {
            clearTimeout($scope.timeoutId);
          }
        }

        $scope.start = $element[0].start = function () {
          $scope.startTime = $scope.startTimeAttr ? new Date($scope.startTimeAttr) : new Date();
          $scope.endTime = $scope.endTimeAttr ? new Date($scope.endTimeAttr) : null;
          $scope.countdown = $scope.countdownattr && parseInt($scope.countdownattr, 10) > 0 ? parseInt($scope.countdownattr, 10) : undefined;
          resetTimeout();
          tick();
        };

        $scope.resume = $element[0].resume = function () {
          resetTimeout();
          if ($scope.countdownattr) {
            $scope.countdown += 1;
          }
          $scope.startTime = new Date() - ($scope.stoppedTime - $scope.startTime);
          tick();
        };

        $scope.stop = $scope.pause = $element[0].stop = $element[0].pause = function () {
          $scope.stoppedTime = new Date();
          resetTimeout();
          $scope.$emit('timer-stopped', {millis: $scope.millis, seconds: $scope.seconds, minutes: $scope.minutes, hours: $scope.hours, days: $scope.days});
          $scope.timeoutId = null;
        };

        $element.bind('$destroy', function () {
          resetTimeout();
        });

        function calculateTimeUnits() {
          $scope.seconds = Math.floor(($scope.millis / 1000) % 60);
          $scope.minutes = Math.floor((($scope.millis / (60000)) % 60));
          $scope.hours = Math.floor((($scope.millis / (3600000)) % 24));
          $scope.days = Math.floor((($scope.millis / (3600000)) / 24));
        }

        //determine initial values of time units and add AddSeconds functionality
        if ($scope.countdownattr) {
          $scope.millis = $scope.countdownattr * 1000;

          $scope.addCDSeconds = $element[0].addCDSeconds = function(extraSeconds){
            $scope.countdown += extraSeconds;
            $scope.$digest();
          };

          $scope.$on('timer-add-cd-seconds', function (e, extraSeconds) {
            $timeout(function (){
              $scope.addCDSeconds(extraSeconds);
            });
          });
        } else {
          $scope.millis = 0;
        }
        calculateTimeUnits();

        var tick = function () {

          $scope.millis = new Date() - $scope.startTime;
          var adjustment = $scope.millis % 1000;

          if ($scope.endTimeAttr) {
            $scope.millis = $scope.endTime - new Date();
            adjustment = $scope.interval - $scope.millis % 1000;
          }


          if ($scope.countdownattr) {
            $scope.millis = $scope.countdown * 1000;
          }

          if ($scope.millis < 0) {
            $scope.stop();
            $scope.millis = 0;
            calculateTimeUnits();
            return;
          }
          calculateTimeUnits();
          if ($scope.countdown > 0) {
            $scope.countdown--;
          }
          else if ($scope.countdown <= 0) {
            $scope.stop();
            return;
          }

          //We are not using $timeout for a reason. Please read here - https://github.com/siddii/angular-timer/pull/5
          $scope.timeoutId = setTimeout(function () {
            tick();
            $scope.$digest();
          }, $scope.interval - adjustment);

          $scope.$emit('timer-tick', {timeoutId: $scope.timeoutId, millis: $scope.millis});
        };

        if ($scope.autoStart === undefined || $scope.autoStart === true) {
          $scope.start();
        }
      }]
    };
  }]);

/**
 * angular-ui-utils - Swiss-Army-Knife of AngularJS tools (with no external dependencies!)
 * @version v0.1.1 - 2014-02-17
 * @link http://angular-ui.github.com
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
'use strict';

angular.module('ui.alias', []).config(['$compileProvider', 'uiAliasConfig', function($compileProvider, uiAliasConfig){
  uiAliasConfig = uiAliasConfig || {};
  angular.forEach(uiAliasConfig, function(config, alias){
    if (angular.isString(config)) {
      config = {
        replace: true,
        template: config
      };
    }
    $compileProvider.directive(alias, function(){
      return config;
    });
  });
}]);

'use strict';

/**
 * General-purpose Event binding. Bind any event not natively supported by Angular
 * Pass an object with keynames for events to ui-event
 * Allows $event object and $params object to be passed
 *
 * @example <input ui-event="{ focus : 'counter++', blur : 'someCallback()' }">
 * @example <input ui-event="{ myCustomEvent : 'myEventHandler($event, $params)'}">
 *
 * @param ui-event {string|object literal} The event to bind to as a string or a hash of events with their callbacks
 */
angular.module('ui.event',[]).directive('uiEvent', ['$parse',
  function ($parse) {
    return function ($scope, elm, attrs) {
      var events = $scope.$eval(attrs.uiEvent);
      angular.forEach(events, function (uiEvent, eventName) {
        var fn = $parse(uiEvent);
        elm.bind(eventName, function (evt) {
          var params = Array.prototype.slice.call(arguments);
          //Take out first paramater (event object);
          params = params.splice(1);
          fn($scope, {$event: evt, $params: params});
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        });
      });
    };
  }]);

'use strict';

/**
 * A replacement utility for internationalization very similar to sprintf.
 *
 * @param replace {mixed} The tokens to replace depends on type
 *  string: all instances of $0 will be replaced
 *  array: each instance of $0, $1, $2 etc. will be placed with each array item in corresponding order
 *  object: all attributes will be iterated through, with :key being replaced with its corresponding value
 * @return string
 *
 * @example: 'Hello :name, how are you :day'.format({ name:'John', day:'Today' })
 * @example: 'Records $0 to $1 out of $2 total'.format(['10', '20', '3000'])
 * @example: '$0 agrees to all mentions $0 makes in the event that $0 hits a tree while $0 is driving drunk'.format('Bob')
 */
angular.module('ui.format',[]).filter('format', function(){
  return function(value, replace) {
    var target = value;
    if (angular.isString(target) && replace !== undefined) {
      if (!angular.isArray(replace) && !angular.isObject(replace)) {
        replace = [replace];
      }
      if (angular.isArray(replace)) {
        var rlen = replace.length;
        var rfx = function (str, i) {
          i = parseInt(i, 10);
          return (i>=0 && i<rlen) ? replace[i] : str;
        };
        target = target.replace(/\$([0-9]+)/g, rfx);
      }
      else {
        angular.forEach(replace, function(value, key){
          target = target.split(':'+key).join(value);
        });
      }
    }
    return target;
  };
});

'use strict';

/**
 * Wraps the
 * @param text {string} haystack to search through
 * @param search {string} needle to search for
 * @param [caseSensitive] {boolean} optional boolean to use case-sensitive searching
 */
angular.module('ui.highlight',[]).filter('highlight', function () {
  return function (text, search, caseSensitive) {
    if (search || angular.isNumber(search)) {
      text = text.toString();
      search = search.toString();
      if (caseSensitive) {
        return text.split(search).join('<span class="ui-match">' + search + '</span>');
      } else {
        return text.replace(new RegExp(search, 'gi'), '<span class="ui-match">$&</span>');
      }
    } else {
      return text;
    }
  };
});

'use strict';

// modeled after: angular-1.0.7/src/ng/directive/ngInclude.js
angular.module('ui.include',[])
.directive('uiInclude', ['$http', '$templateCache', '$anchorScroll', '$compile',
                 function($http,   $templateCache,   $anchorScroll,   $compile) {
  return {
    restrict: 'ECA',
    terminal: true,
    compile: function(element, attr) {
      var srcExp = attr.uiInclude || attr.src,
          fragExp = attr.fragment || '',
          onloadExp = attr.onload || '',
          autoScrollExp = attr.autoscroll;

      return function(scope, element) {
        var changeCounter = 0,
            childScope;

        var clearContent = function() {
          if (childScope) {
            childScope.$destroy();
            childScope = null;
          }

          element.html('');
        };

        function ngIncludeWatchAction() {
          var thisChangeId = ++changeCounter;
          var src = scope.$eval(srcExp);
          var fragment = scope.$eval(fragExp);

          if (src) {
            $http.get(src, {cache: $templateCache}).success(function(response) {
              if (thisChangeId !== changeCounter) { return; }

              if (childScope) { childScope.$destroy(); }
              childScope = scope.$new();

              var contents;
              if (fragment) {
                contents = angular.element('<div/>').html(response).find(fragment);
              }
              else {
                contents = angular.element('<div/>').html(response).contents();
              }
              element.html(contents);
              $compile(contents)(childScope);

              if (angular.isDefined(autoScrollExp) && (!autoScrollExp || scope.$eval(autoScrollExp))) {
                $anchorScroll();
              }

              childScope.$emit('$includeContentLoaded');
              scope.$eval(onloadExp);
            }).error(function() {
              if (thisChangeId === changeCounter) { clearContent(); }
            });
          } else { clearContent(); }
        }

        scope.$watch(fragExp, ngIncludeWatchAction);
        scope.$watch(srcExp, ngIncludeWatchAction);
      };
    }
  };
}]);

'use strict';

/**
 * Provides an easy way to toggle a checkboxes indeterminate property
 *
 * @example <input type="checkbox" ui-indeterminate="isUnkown">
 */
angular.module('ui.indeterminate',[]).directive('uiIndeterminate', [
  function () {
    return {
      compile: function(tElm, tAttrs) {
        if (!tAttrs.type || tAttrs.type.toLowerCase() !== 'checkbox') {
          return angular.noop;
        }

        return function ($scope, elm, attrs) {
          $scope.$watch(attrs.uiIndeterminate, function(newVal) {
            elm[0].indeterminate = !!newVal;
          });
        };
      }
    };
  }]);

'use strict';

/**
 * Converts variable-esque naming conventions to something presentational, capitalized words separated by space.
 * @param {String} value The value to be parsed and prettified.
 * @param {String} [inflector] The inflector to use. Default: humanize.
 * @return {String}
 * @example {{ 'Here Is my_phoneNumber' | inflector:'humanize' }} => Here Is My Phone Number
 *          {{ 'Here Is my_phoneNumber' | inflector:'underscore' }} => here_is_my_phone_number
 *          {{ 'Here Is my_phoneNumber' | inflector:'variable' }} => hereIsMyPhoneNumber
 */
angular.module('ui.inflector',[]).filter('inflector', function () {
  function ucwords(text) {
    return text.replace(/^([a-z])|\s+([a-z])/g, function ($1) {
      return $1.toUpperCase();
    });
  }

  function breakup(text, separator) {
    return text.replace(/[A-Z]/g, function (match) {
      return separator + match;
    });
  }

  var inflectors = {
    humanize: function (value) {
      return ucwords(breakup(value, ' ').split('_').join(' '));
    },
    underscore: function (value) {
      return value.substr(0, 1).toLowerCase() + breakup(value.substr(1), '_').toLowerCase().split(' ').join('_');
    },
    variable: function (value) {
      value = value.substr(0, 1).toLowerCase() + ucwords(value.split('_').join(' ')).substr(1).split(' ').join('');
      return value;
    }
  };

  return function (text, inflector) {
    if (inflector !== false && angular.isString(text)) {
      inflector = inflector || 'humanize';
      return inflectors[inflector](text);
    } else {
      return text;
    }
  };
});

'use strict';

/**
 * General-purpose jQuery wrapper. Simply pass the plugin name as the expression.
 *
 * It is possible to specify a default set of parameters for each jQuery plugin.
 * Under the jq key, namespace each plugin by that which will be passed to ui-jq.
 * Unfortunately, at this time you can only pre-define the first parameter.
 * @example { jq : { datepicker : { showOn:'click' } } }
 *
 * @param ui-jq {string} The $elm.[pluginName]() to call.
 * @param [ui-options] {mixed} Expression to be evaluated and passed as options to the function
 *     Multiple parameters can be separated by commas
 * @param [ui-refresh] {expression} Watch expression and refire plugin on changes
 *
 * @example <input ui-jq="datepicker" ui-options="{showOn:'click'},secondParameter,thirdParameter" ui-refresh="iChange">
 */
angular.module('ui.jq',[]).
  value('uiJqConfig',{}).
  directive('uiJq', ['uiJqConfig', '$timeout', function uiJqInjectingFunction(uiJqConfig, $timeout) {

  return {
    restrict: 'A',
    compile: function uiJqCompilingFunction(tElm, tAttrs) {

      if (!angular.isFunction(tElm[tAttrs.uiJq])) {
        throw new Error('ui-jq: The "' + tAttrs.uiJq + '" function does not exist');
      }
      var options = uiJqConfig && uiJqConfig[tAttrs.uiJq];

      return function uiJqLinkingFunction(scope, elm, attrs) {

        var linkOptions = [];

        // If ui-options are passed, merge (or override) them onto global defaults and pass to the jQuery method
        if (attrs.uiOptions) {
          linkOptions = scope.$eval('[' + attrs.uiOptions + ']');
          if (angular.isObject(options) && angular.isObject(linkOptions[0])) {
            linkOptions[0] = angular.extend({}, options, linkOptions[0]);
          }
        } else if (options) {
          linkOptions = [options];
        }
        // If change compatibility is enabled, the form input's "change" event will trigger an "input" event
        if (attrs.ngModel && elm.is('select,input,textarea')) {
          elm.bind('change', function() {
            elm.trigger('input');
          });
        }

        // Call jQuery method and pass relevant options
        function callPlugin() {
          $timeout(function() {
            elm[attrs.uiJq].apply(elm, linkOptions);
          }, 0, false);
        }

        // If ui-refresh is used, re-fire the the method upon every change
        if (attrs.uiRefresh) {
          scope.$watch(attrs.uiRefresh, function() {
            callPlugin();
          });
        }
        callPlugin();
      };
    }
  };
}]);

'use strict';

angular.module('ui.keypress',[]).
factory('keypressHelper', ['$parse', function keypress($parse){
  var keysByCode = {
    8: 'backspace',
    9: 'tab',
    13: 'enter',
    27: 'esc',
    32: 'space',
    33: 'pageup',
    34: 'pagedown',
    35: 'end',
    36: 'home',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    45: 'insert',
    46: 'delete'
  };

  var capitaliseFirstLetter = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return function(mode, scope, elm, attrs) {
    var params, combinations = [];
    params = scope.$eval(attrs['ui'+capitaliseFirstLetter(mode)]);

    // Prepare combinations for simple checking
    angular.forEach(params, function (v, k) {
      var combination, expression;
      expression = $parse(v);

      angular.forEach(k.split(' '), function(variation) {
        combination = {
          expression: expression,
          keys: {}
        };
        angular.forEach(variation.split('-'), function (value) {
          combination.keys[value] = true;
        });
        combinations.push(combination);
      });
    });

    // Check only matching of pressed keys one of the conditions
    elm.bind(mode, function (event) {
      // No need to do that inside the cycle
      var metaPressed = !!(event.metaKey && !event.ctrlKey);
      var altPressed = !!event.altKey;
      var ctrlPressed = !!event.ctrlKey;
      var shiftPressed = !!event.shiftKey;
      var keyCode = event.keyCode;

      // normalize keycodes
      if (mode === 'keypress' && !shiftPressed && keyCode >= 97 && keyCode <= 122) {
        keyCode = keyCode - 32;
      }

      // Iterate over prepared combinations
      angular.forEach(combinations, function (combination) {

        var mainKeyPressed = combination.keys[keysByCode[keyCode]] || combination.keys[keyCode.toString()];

        var metaRequired = !!combination.keys.meta;
        var altRequired = !!combination.keys.alt;
        var ctrlRequired = !!combination.keys.ctrl;
        var shiftRequired = !!combination.keys.shift;

        if (
          mainKeyPressed &&
          ( metaRequired === metaPressed ) &&
          ( altRequired === altPressed ) &&
          ( ctrlRequired === ctrlPressed ) &&
          ( shiftRequired === shiftPressed )
        ) {
          // Run the function
          scope.$apply(function () {
            combination.expression(scope, { '$event': event });
          });
        }
      });
    });
  };
}]);

/**
 * Bind one or more handlers to particular keys or their combination
 * @param hash {mixed} keyBindings Can be an object or string where keybinding expression of keys or keys combinations and AngularJS Exspressions are set. Object syntax: "{ keys1: expression1 [, keys2: expression2 [ , ... ]]}". String syntax: ""expression1 on keys1 [ and expression2 on keys2 [ and ... ]]"". Expression is an AngularJS Expression, and key(s) are dash-separated combinations of keys and modifiers (one or many, if any. Order does not matter). Supported modifiers are 'ctrl', 'shift', 'alt' and key can be used either via its keyCode (13 for Return) or name. Named keys are 'backspace', 'tab', 'enter', 'esc', 'space', 'pageup', 'pagedown', 'end', 'home', 'left', 'up', 'right', 'down', 'insert', 'delete'.
 * @example <input ui-keypress="{enter:'x = 1', 'ctrl-shift-space':'foo()', 'shift-13':'bar()'}" /> <input ui-keypress="foo = 2 on ctrl-13 and bar('hello') on shift-esc" />
 **/
angular.module('ui.keypress').directive('uiKeydown', ['keypressHelper', function(keypressHelper){
  return {
    link: function (scope, elm, attrs) {
      keypressHelper('keydown', scope, elm, attrs);
    }
  };
}]);

angular.module('ui.keypress').directive('uiKeypress', ['keypressHelper', function(keypressHelper){
  return {
    link: function (scope, elm, attrs) {
      keypressHelper('keypress', scope, elm, attrs);
    }
  };
}]);

angular.module('ui.keypress').directive('uiKeyup', ['keypressHelper', function(keypressHelper){
  return {
    link: function (scope, elm, attrs) {
      keypressHelper('keyup', scope, elm, attrs);
    }
  };
}]);

'use strict';

/*
 Attaches input mask onto input element
 */
angular.module('ui.mask', [])
  .value('uiMaskConfig', {
    'maskDefinitions': {
      '9': /\d/,
      'A': /[a-zA-Z]/,
      '*': /[a-zA-Z0-9]/
    }
  })
  .directive('uiMask', ['uiMaskConfig', function (maskConfig) {
    return {
      priority: 100,
      require: 'ngModel',
      restrict: 'A',
      compile: function uiMaskCompilingFunction(){
        var options = maskConfig;

        return function uiMaskLinkingFunction(scope, iElement, iAttrs, controller){
          var maskProcessed = false, eventsBound = false,
            maskCaretMap, maskPatterns, maskPlaceholder, maskComponents,
          // Minimum required length of the value to be considered valid
            minRequiredLength,
            value, valueMasked, isValid,
          // Vars for initializing/uninitializing
            originalPlaceholder = iAttrs.placeholder,
            originalMaxlength = iAttrs.maxlength,
          // Vars used exclusively in eventHandler()
            oldValue, oldValueUnmasked, oldCaretPosition, oldSelectionLength;

          function initialize(maskAttr){
            if (!angular.isDefined(maskAttr)) {
              return uninitialize();
            }
            processRawMask(maskAttr);
            if (!maskProcessed) {
              return uninitialize();
            }
            initializeElement();
            bindEventListeners();
            return true;
          }

          function initPlaceholder(placeholderAttr) {
            if(! angular.isDefined(placeholderAttr)) {
              return;
            }

            maskPlaceholder = placeholderAttr;

            // If the mask is processed, then we need to update the value
            if (maskProcessed) {
              eventHandler();
            }
          }

          function formatter(fromModelValue){
            if (!maskProcessed) {
              return fromModelValue;
            }
            value = unmaskValue(fromModelValue || '');
            isValid = validateValue(value);
            controller.$setValidity('mask', isValid);
            return isValid && value.length ? maskValue(value) : undefined;
          }

          function parser(fromViewValue){
            if (!maskProcessed) {
              return fromViewValue;
            }
            value = unmaskValue(fromViewValue || '');
            isValid = validateValue(value);
            // We have to set viewValue manually as the reformatting of the input
            // value performed by eventHandler() doesn't happen until after
            // this parser is called, which causes what the user sees in the input
            // to be out-of-sync with what the controller's $viewValue is set to.
            controller.$viewValue = value.length ? maskValue(value) : '';
            controller.$setValidity('mask', isValid);
            if (value === '' && controller.$error.required !== undefined) {
              controller.$setValidity('required', false);
            }
            return isValid ? value : undefined;
          }

          var linkOptions = {};

          if (iAttrs.uiOptions) {
            linkOptions = scope.$eval('[' + iAttrs.uiOptions + ']');
            if (angular.isObject(linkOptions[0])) {
              // we can't use angular.copy nor angular.extend, they lack the power to do a deep merge
              linkOptions = (function(original, current){
                for(var i in original) {
                  if (Object.prototype.hasOwnProperty.call(original, i)) {
                    if (!current[i]) {
                      current[i] = angular.copy(original[i]);
                    } else {
                      angular.extend(current[i], original[i]);
                    }
                  }
                }
                return current;
              })(options, linkOptions[0]);
            }
          } else {
            linkOptions = options;
          }

          iAttrs.$observe('uiMask', initialize);
          iAttrs.$observe('placeholder', initPlaceholder);
          controller.$formatters.push(formatter);
          controller.$parsers.push(parser);

          function uninitialize(){
            maskProcessed = false;
            unbindEventListeners();

            if (angular.isDefined(originalPlaceholder)) {
              iElement.attr('placeholder', originalPlaceholder);
            } else {
              iElement.removeAttr('placeholder');
            }

            if (angular.isDefined(originalMaxlength)) {
              iElement.attr('maxlength', originalMaxlength);
            } else {
              iElement.removeAttr('maxlength');
            }

            iElement.val(controller.$modelValue);
            controller.$viewValue = controller.$modelValue;
            return false;
          }

          function initializeElement(){
            value = oldValueUnmasked = unmaskValue(controller.$modelValue || '');
            valueMasked = oldValue = maskValue(value);
            isValid = validateValue(value);
            var viewValue = isValid && value.length ? valueMasked : '';
            if (iAttrs.maxlength) { // Double maxlength to allow pasting new val at end of mask
              iElement.attr('maxlength', maskCaretMap[maskCaretMap.length - 1] * 2);
            }
            iElement.attr('placeholder', maskPlaceholder);
            iElement.val(viewValue);
            controller.$viewValue = viewValue;
            // Not using $setViewValue so we don't clobber the model value and dirty the form
            // without any kind of user interaction.
          }

          function bindEventListeners(){
            if (eventsBound) {
              return;
            }
            iElement.bind('blur', blurHandler);
            iElement.bind('mousedown mouseup', mouseDownUpHandler);
            iElement.bind('input keyup click focus', eventHandler);
            eventsBound = true;
          }

          function unbindEventListeners(){
            if (!eventsBound) {
              return;
            }
            iElement.unbind('blur', blurHandler);
            iElement.unbind('mousedown', mouseDownUpHandler);
            iElement.unbind('mouseup', mouseDownUpHandler);
            iElement.unbind('input', eventHandler);
            iElement.unbind('keyup', eventHandler);
            iElement.unbind('click', eventHandler);
            iElement.unbind('focus', eventHandler);
            eventsBound = false;
          }

          function validateValue(value){
            // Zero-length value validity is ngRequired's determination
            return value.length ? value.length >= minRequiredLength : true;
          }

          function unmaskValue(value){
            var valueUnmasked = '',
              maskPatternsCopy = maskPatterns.slice();
            // Preprocess by stripping mask components from value
            value = value.toString();
            angular.forEach(maskComponents, function (component){
              value = value.replace(component, '');
            });
            angular.forEach(value.split(''), function (chr){
              if (maskPatternsCopy.length && maskPatternsCopy[0].test(chr)) {
                valueUnmasked += chr;
                maskPatternsCopy.shift();
              }
            });
            return valueUnmasked;
          }

          function maskValue(unmaskedValue){
            var valueMasked = '',
                maskCaretMapCopy = maskCaretMap.slice();

            angular.forEach(maskPlaceholder.split(''), function (chr, i){
              if (unmaskedValue.length && i === maskCaretMapCopy[0]) {
                valueMasked  += unmaskedValue.charAt(0) || '_';
                unmaskedValue = unmaskedValue.substr(1);
                maskCaretMapCopy.shift();
              }
              else {
                valueMasked += chr;
              }
            });
            return valueMasked;
          }

          function getPlaceholderChar(i) {
            var placeholder = iAttrs.placeholder;

            if (typeof placeholder !== 'undefined' && placeholder[i]) {
              return placeholder[i];
            } else {
              return '_';
            }
          }

          // Generate array of mask components that will be stripped from a masked value
          // before processing to prevent mask components from being added to the unmasked value.
          // E.g., a mask pattern of '+7 9999' won't have the 7 bleed into the unmasked value.
          // If a maskable char is followed by a mask char and has a mask
          // char behind it, we'll split it into it's own component so if
          // a user is aggressively deleting in the input and a char ahead
          // of the maskable char gets deleted, we'll still be able to strip
          // it in the unmaskValue() preprocessing.
          function getMaskComponents() {
            return maskPlaceholder.replace(/[_]+/g, '_').replace(/([^_]+)([a-zA-Z0-9])([^_])/g, '$1$2_$3').split('_');
          }

          function processRawMask(mask){
            var characterCount = 0;

            maskCaretMap    = [];
            maskPatterns    = [];
            maskPlaceholder = '';

            if (typeof mask === 'string') {
              minRequiredLength = 0;

              var isOptional = false,
                  splitMask  = mask.split('');

              angular.forEach(splitMask, function (chr, i){
                if (linkOptions.maskDefinitions[chr]) {

                  maskCaretMap.push(characterCount);

                  maskPlaceholder += getPlaceholderChar(i);
                  maskPatterns.push(linkOptions.maskDefinitions[chr]);

                  characterCount++;
                  if (!isOptional) {
                    minRequiredLength++;
                  }
                }
                else if (chr === '?') {
                  isOptional = true;
                }
                else {
                  maskPlaceholder += chr;
                  characterCount++;
                }
              });
            }
            // Caret position immediately following last position is valid.
            maskCaretMap.push(maskCaretMap.slice().pop() + 1);

            maskComponents = getMaskComponents();
            maskProcessed  = maskCaretMap.length > 1 ? true : false;
          }

          function blurHandler(){
            oldCaretPosition = 0;
            oldSelectionLength = 0;
            if (!isValid || value.length === 0) {
              valueMasked = '';
              iElement.val('');
              scope.$apply(function (){
                controller.$setViewValue('');
              });
            }
          }

          function mouseDownUpHandler(e){
            if (e.type === 'mousedown') {
              iElement.bind('mouseout', mouseoutHandler);
            } else {
              iElement.unbind('mouseout', mouseoutHandler);
            }
          }

          iElement.bind('mousedown mouseup', mouseDownUpHandler);

          function mouseoutHandler(){
            /*jshint validthis: true */
            oldSelectionLength = getSelectionLength(this);
            iElement.unbind('mouseout', mouseoutHandler);
          }

          function eventHandler(e){
            /*jshint validthis: true */
            e = e || {};
            // Allows more efficient minification
            var eventWhich = e.which,
              eventType = e.type;

            // Prevent shift and ctrl from mucking with old values
            if (eventWhich === 16 || eventWhich === 91) { return;}

            var val = iElement.val(),
              valOld = oldValue,
              valMasked,
              valUnmasked = unmaskValue(val),
              valUnmaskedOld = oldValueUnmasked,
              valAltered = false,

              caretPos = getCaretPosition(this) || 0,
              caretPosOld = oldCaretPosition || 0,
              caretPosDelta = caretPos - caretPosOld,
              caretPosMin = maskCaretMap[0],
              caretPosMax = maskCaretMap[valUnmasked.length] || maskCaretMap.slice().shift(),

              selectionLenOld = oldSelectionLength || 0,
              isSelected = getSelectionLength(this) > 0,
              wasSelected = selectionLenOld > 0,

            // Case: Typing a character to overwrite a selection
              isAddition = (val.length > valOld.length) || (selectionLenOld && val.length > valOld.length - selectionLenOld),
            // Case: Delete and backspace behave identically on a selection
              isDeletion = (val.length < valOld.length) || (selectionLenOld && val.length === valOld.length - selectionLenOld),
              isSelection = (eventWhich >= 37 && eventWhich <= 40) && e.shiftKey, // Arrow key codes

              isKeyLeftArrow = eventWhich === 37,
            // Necessary due to "input" event not providing a key code
              isKeyBackspace = eventWhich === 8 || (eventType !== 'keyup' && isDeletion && (caretPosDelta === -1)),
              isKeyDelete = eventWhich === 46 || (eventType !== 'keyup' && isDeletion && (caretPosDelta === 0 ) && !wasSelected),

            // Handles cases where caret is moved and placed in front of invalid maskCaretMap position. Logic below
            // ensures that, on click or leftward caret placement, caret is moved leftward until directly right of
            // non-mask character. Also applied to click since users are (arguably) more likely to backspace
            // a character when clicking within a filled input.
              caretBumpBack = (isKeyLeftArrow || isKeyBackspace || eventType === 'click') && caretPos > caretPosMin;

            oldSelectionLength = getSelectionLength(this);

            // These events don't require any action
            if (isSelection || (isSelected && (eventType === 'click' || eventType === 'keyup'))) {
              return;
            }

            // Value Handling
            // ==============

            // User attempted to delete but raw value was unaffected--correct this grievous offense
            if ((eventType === 'input') && isDeletion && !wasSelected && valUnmasked === valUnmaskedOld) {
              while (isKeyBackspace && caretPos > caretPosMin && !isValidCaretPosition(caretPos)) {
                caretPos--;
              }
              while (isKeyDelete && caretPos < caretPosMax && maskCaretMap.indexOf(caretPos) === -1) {
                caretPos++;
              }
              var charIndex = maskCaretMap.indexOf(caretPos);
              // Strip out non-mask character that user would have deleted if mask hadn't been in the way.
              valUnmasked = valUnmasked.substring(0, charIndex) + valUnmasked.substring(charIndex + 1);
              valAltered = true;
            }

            // Update values
            valMasked = maskValue(valUnmasked);

            oldValue = valMasked;
            oldValueUnmasked = valUnmasked;
            iElement.val(valMasked);
            if (valAltered) {
              // We've altered the raw value after it's been $digest'ed, we need to $apply the new value.
              scope.$apply(function (){
                controller.$setViewValue(valUnmasked);
              });
            }

            // Caret Repositioning
            // ===================

            // Ensure that typing always places caret ahead of typed character in cases where the first char of
            // the input is a mask char and the caret is placed at the 0 position.
            if (isAddition && (caretPos <= caretPosMin)) {
              caretPos = caretPosMin + 1;
            }

            if (caretBumpBack) {
              caretPos--;
            }

            // Make sure caret is within min and max position limits
            caretPos = caretPos > caretPosMax ? caretPosMax : caretPos < caretPosMin ? caretPosMin : caretPos;

            // Scoot the caret back or forth until it's in a non-mask position and within min/max position limits
            while (!isValidCaretPosition(caretPos) && caretPos > caretPosMin && caretPos < caretPosMax) {
              caretPos += caretBumpBack ? -1 : 1;
            }

            if ((caretBumpBack && caretPos < caretPosMax) || (isAddition && !isValidCaretPosition(caretPosOld))) {
              caretPos++;
            }
            oldCaretPosition = caretPos;
            setCaretPosition(this, caretPos);
          }

          function isValidCaretPosition(pos){ return maskCaretMap.indexOf(pos) > -1; }

          function getCaretPosition(input){
            if (!input) return 0;
            if (input.selectionStart !== undefined) {
              return input.selectionStart;
            } else if (document.selection) {
              // Curse you IE
              input.focus();
              var selection = document.selection.createRange();
              selection.moveStart('character', -input.value.length);
              return selection.text.length;
            }
            return 0;
          }

          function setCaretPosition(input, pos){
            if (!input) return 0;
            if (input.offsetWidth === 0 || input.offsetHeight === 0) {
              return; // Input's hidden
            }
            if (input.setSelectionRange) {
              input.focus();
              input.setSelectionRange(pos, pos);
            }
            else if (input.createTextRange) {
              // Curse you IE
              var range = input.createTextRange();
              range.collapse(true);
              range.moveEnd('character', pos);
              range.moveStart('character', pos);
              range.select();
            }
          }

          function getSelectionLength(input){
            if (!input) return 0;
            if (input.selectionStart !== undefined) {
              return (input.selectionEnd - input.selectionStart);
            }
            if (document.selection) {
              return (document.selection.createRange().text.length);
            }
            return 0;
          }

          // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf
          if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function (searchElement /*, fromIndex */){
              if (this === null) {
                throw new TypeError();
              }
              var t = Object(this);
              var len = t.length >>> 0;
              if (len === 0) {
                return -1;
              }
              var n = 0;
              if (arguments.length > 1) {
                n = Number(arguments[1]);
                if (n !== n) { // shortcut for verifying if it's NaN
                  n = 0;
                } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
                  n = (n > 0 || -1) * Math.floor(Math.abs(n));
                }
              }
              if (n >= len) {
                return -1;
              }
              var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
              for (; k < len; k++) {
                if (k in t && t[k] === searchElement) {
                  return k;
                }
              }
              return -1;
            };
          }

        };
      }
    };
  }
]);

'use strict';

/**
 * Add a clear button to form inputs to reset their value
 */
angular.module('ui.reset',[]).value('uiResetConfig',null).directive('uiReset', ['uiResetConfig', function (uiResetConfig) {
  var resetValue = null;
  if (uiResetConfig !== undefined){
      resetValue = uiResetConfig;
  }
  return {
    require: 'ngModel',
    link: function (scope, elm, attrs, ctrl) {
      var aElement;
      aElement = angular.element('<a class="ui-reset" />');
      elm.wrap('<span class="ui-resetwrap" />').after(aElement);
      aElement.bind('click', function (e) {
        e.preventDefault();
        scope.$apply(function () {
          if (attrs.uiReset){
            ctrl.$setViewValue(scope.$eval(attrs.uiReset));
          }else{
            ctrl.$setViewValue(resetValue);
          }
          ctrl.$render();
        });
      });
    }
  };
}]);

'use strict';

/**
 * Set a $uiRoute boolean to see if the current route matches
 */
angular.module('ui.route', []).directive('uiRoute', ['$location', '$parse', function ($location, $parse) {
  return {
    restrict: 'AC',
    scope: true,
    compile: function(tElement, tAttrs) {
      var useProperty;
      if (tAttrs.uiRoute) {
        useProperty = 'uiRoute';
      } else if (tAttrs.ngHref) {
        useProperty = 'ngHref';
      } else if (tAttrs.href) {
        useProperty = 'href';
      } else {
        throw new Error('uiRoute missing a route or href property on ' + tElement[0]);
      }
      return function ($scope, elm, attrs) {
        var modelSetter = $parse(attrs.ngModel || attrs.routeModel || '$uiRoute').assign;
        var watcher = angular.noop;

        // Used by href and ngHref
        function staticWatcher(newVal) {
          var hash = newVal.indexOf('#');
          if (hash > -1){
            newVal = newVal.substr(hash + 1);
          }
          watcher = function watchHref() {
            modelSetter($scope, ($location.path().indexOf(newVal) > -1));
          };
          watcher();
        }
        // Used by uiRoute
        function regexWatcher(newVal) {
          var hash = newVal.indexOf('#');
          if (hash > -1){
            newVal = newVal.substr(hash + 1);
          }
          watcher = function watchRegex() {
            var regexp = new RegExp('^' + newVal + '$', ['i']);
            modelSetter($scope, regexp.test($location.path()));
          };
          watcher();
        }

        switch (useProperty) {
          case 'uiRoute':
            // if uiRoute={{}} this will be undefined, otherwise it will have a value and $observe() never gets triggered
            if (attrs.uiRoute){
              regexWatcher(attrs.uiRoute);
            }else{
              attrs.$observe('uiRoute', regexWatcher);
            }
            break;
          case 'ngHref':
            // Setup watcher() every time ngHref changes
            if (attrs.ngHref){
              staticWatcher(attrs.ngHref);
            }else{
              attrs.$observe('ngHref', staticWatcher);
            }
            break;
          case 'href':
            // Setup watcher()
            staticWatcher(attrs.href);
        }

        $scope.$on('$routeChangeSuccess', function(){
          watcher();
        });

        //Added for compatibility with ui-router
        $scope.$on('$stateChangeSuccess', function(){
          watcher();
        });
      };
    }
  };
}]);

'use strict';

angular.module('ui.scroll.jqlite', ['ui.scroll']).service('jqLiteExtras', [
  '$log', '$window', function(console, window) {
    return {
      registerFor: function(element) {
        var convertToPx, css, getMeasurements, getStyle, getWidthHeight, isWindow, scrollTo;
        css = angular.element.prototype.css;
        element.prototype.css = function(name, value) {
          var elem, self;
          self = this;
          elem = self[0];
          if (!(!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style)) {
            return css.call(self, name, value);
          }
        };
        isWindow = function(obj) {
          return obj && obj.document && obj.location && obj.alert && obj.setInterval;
        };
        scrollTo = function(self, direction, value) {
          var elem, method, preserve, prop, _ref;
          elem = self[0];
          _ref = {
            top: ['scrollTop', 'pageYOffset', 'scrollLeft'],
            left: ['scrollLeft', 'pageXOffset', 'scrollTop']
          }[direction], method = _ref[0], prop = _ref[1], preserve = _ref[2];
          if (isWindow(elem)) {
            if (angular.isDefined(value)) {
              return elem.scrollTo(self[preserve].call(self), value);
            } else {
              if (prop in elem) {
                return elem[prop];
              } else {
                return elem.document.documentElement[method];
              }
            }
          } else {
            if (angular.isDefined(value)) {
              return elem[method] = value;
            } else {
              return elem[method];
            }
          }
        };
        if (window.getComputedStyle) {
          getStyle = function(elem) {
            return window.getComputedStyle(elem, null);
          };
          convertToPx = function(elem, value) {
            return parseFloat(value);
          };
        } else {
          getStyle = function(elem) {
            return elem.currentStyle;
          };
          convertToPx = function(elem, value) {
            var core_pnum, left, result, rnumnonpx, rs, rsLeft, style;
            core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
            rnumnonpx = new RegExp('^(' + core_pnum + ')(?!px)[a-z%]+$', 'i');
            if (!rnumnonpx.test(value)) {
              return parseFloat(value);
            } else {
              style = elem.style;
              left = style.left;
              rs = elem.runtimeStyle;
              rsLeft = rs && rs.left;
              if (rs) {
                rs.left = style.left;
              }
              style.left = value;
              result = style.pixelLeft;
              style.left = left;
              if (rsLeft) {
                rs.left = rsLeft;
              }
              return result;
            }
          };
        }
        getMeasurements = function(elem, measure) {
          var base, borderA, borderB, computedMarginA, computedMarginB, computedStyle, dirA, dirB, marginA, marginB, paddingA, paddingB, _ref;
          if (isWindow(elem)) {
            base = document.documentElement[{
              height: 'clientHeight',
              width: 'clientWidth'
            }[measure]];
            return {
              base: base,
              padding: 0,
              border: 0,
              margin: 0
            };
          }
          _ref = {
            width: [elem.offsetWidth, 'Left', 'Right'],
            height: [elem.offsetHeight, 'Top', 'Bottom']
          }[measure], base = _ref[0], dirA = _ref[1], dirB = _ref[2];
          computedStyle = getStyle(elem);
          paddingA = convertToPx(elem, computedStyle['padding' + dirA]) || 0;
          paddingB = convertToPx(elem, computedStyle['padding' + dirB]) || 0;
          borderA = convertToPx(elem, computedStyle['border' + dirA + 'Width']) || 0;
          borderB = convertToPx(elem, computedStyle['border' + dirB + 'Width']) || 0;
          computedMarginA = computedStyle['margin' + dirA];
          computedMarginB = computedStyle['margin' + dirB];
          marginA = convertToPx(elem, computedMarginA) || 0;
          marginB = convertToPx(elem, computedMarginB) || 0;
          return {
            base: base,
            padding: paddingA + paddingB,
            border: borderA + borderB,
            margin: marginA + marginB
          };
        };
        getWidthHeight = function(elem, direction, measure) {
          var computedStyle, measurements, result;
          measurements = getMeasurements(elem, direction);
          if (measurements.base > 0) {
            return {
              base: measurements.base - measurements.padding - measurements.border,
              outer: measurements.base,
              outerfull: measurements.base + measurements.margin
            }[measure];
          } else {
            computedStyle = getStyle(elem);
            result = computedStyle[direction];
            if (result < 0 || result === null) {
              result = elem.style[direction] || 0;
            }
            result = parseFloat(result) || 0;
            return {
              base: result - measurements.padding - measurements.border,
              outer: result,
              outerfull: result + measurements.padding + measurements.border + measurements.margin
            }[measure];
          }
        };
        return angular.forEach({
          before: function(newElem) {
            var children, elem, i, parent, self, _i, _ref;
            self = this;
            elem = self[0];
            parent = self.parent();
            children = parent.contents();
            if (children[0] === elem) {
              return parent.prepend(newElem);
            } else {
              for (i = _i = 1, _ref = children.length - 1; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
                if (children[i] === elem) {
                  angular.element(children[i - 1]).after(newElem);
                  return;
                }
              }
              throw new Error('invalid DOM structure ' + elem.outerHTML);
            }
          },
          height: function(value) {
            var self;
            self = this;
            if (angular.isDefined(value)) {
              if (angular.isNumber(value)) {
                value = value + 'px';
              }
              return css.call(self, 'height', value);
            } else {
              return getWidthHeight(this[0], 'height', 'base');
            }
          },
          outerHeight: function(option) {
            return getWidthHeight(this[0], 'height', option ? 'outerfull' : 'outer');
          },
          offset: function(value) {
            var box, doc, docElem, elem, self, win;
            self = this;
            if (arguments.length) {
              if (value === void 0) {
                return self;
              } else {
                return value;

              }
            }
            box = {
              top: 0,
              left: 0
            };
            elem = self[0];
            doc = elem && elem.ownerDocument;
            if (!doc) {
              return;
            }
            docElem = doc.documentElement;
            if (elem.getBoundingClientRect) {
              box = elem.getBoundingClientRect();
            }
            win = doc.defaultView || doc.parentWindow;
            return {
              top: box.top + (win.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0),
              left: box.left + (win.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || 0)
            };
          },
          scrollTop: function(value) {
            return scrollTo(this, 'top', value);
          },
          scrollLeft: function(value) {
            return scrollTo(this, 'left', value);
          }
        }, function(value, key) {
          if (!element.prototype[key]) {
            return element.prototype[key] = value;
          }
        });
      }
    };
  }
]).run([
  '$log', '$window', 'jqLiteExtras', function(console, window, jqLiteExtras) {
    if (!window.jQuery) {
      return jqLiteExtras.registerFor(angular.element);
    }
  }
]);

'use strict';
/*

 List of used element methods available in JQuery but not in JQuery Lite

 element.before(elem)
 element.height()
 element.outerHeight(true)
 element.height(value) = only for Top/Bottom padding elements
 element.scrollTop()
 element.scrollTop(value)
 */

angular.module('ui.scroll', []).directive('ngScrollViewport', [
		'$log', function() {
			return {
				controller: [
					'$scope', '$element', function(scope, element) {
						return element;
					}
				]
			};
		}
	]).directive('ngScroll', [
		'$log', '$injector', '$rootScope', '$timeout', function(console, $injector, $rootScope, $timeout) {
			return {
				require: ['?^ngScrollViewport'],
				transclude: 'element',
				priority: 1000,
				terminal: true,
				compile: function(elementTemplate, attr, linker) {
					return function($scope, element, $attr, controllers) {
						var adapter, adjustBuffer, adjustRowHeight, bof, bottomVisiblePos, buffer, bufferPadding, bufferSize, clipBottom, clipTop, datasource, datasourceName, enqueueFetch, eof, eventListener, fetch, finalize, first, insert, isDatasource, isLoading, itemName, loading, match, next, pending, reload, removeFromBuffer, resizeHandler, scrollHandler, scrollHeight, shouldLoadBottom, shouldLoadTop, tempScope, topVisiblePos, viewport;
						match = $attr.ngScroll.match(/^\s*(\w+)\s+in\s+(\w+)\s*$/);
						if (!match) {
							throw new Error('Expected ngScroll in form of "item_ in _datasource_" but got "' + $attr.ngScroll + '"');
						}
						itemName = match[1];
						datasourceName = match[2];
						isDatasource = function(datasource) {
							return angular.isObject(datasource) && datasource.get && angular.isFunction(datasource.get);
						};
						datasource = $scope[datasourceName];
						if (!isDatasource(datasource)) {
							datasource = $injector.get(datasourceName);
							if (!isDatasource(datasource)) {
								throw new Error(datasourceName + ' is not a valid datasource');
							}
						}
						bufferSize = Math.max(3, +$attr.bufferSize || 10);
						bufferPadding = function() {
							return viewport.height() * Math.max(0.1, +$attr.padding || 0.1);
						};
						scrollHeight = function(elem) {
							return elem[0].scrollHeight || elem[0].document.documentElement.scrollHeight;
						};
						adapter = null;
						linker(tempScope = $scope.$new(), function(template) {
							var bottomPadding, createPadding, padding, repeaterType, topPadding, viewport;
							repeaterType = template[0].localName;
							if (repeaterType === 'dl') {
								throw new Error('ng-scroll directive does not support <' + template[0].localName + '> as a repeating tag: ' + template[0].outerHTML);
							}
							if (repeaterType !== 'li' && repeaterType !== 'tr') {
								repeaterType = 'div';
							}
							viewport = controllers[0] || angular.element(window);
							viewport.css({
								'overflow-y': 'auto',
								'display': 'block'
							});
							padding = function(repeaterType) {
								var div, result, table;
								switch (repeaterType) {
									case 'tr':
										table = angular.element('<table><tr><td><div></div></td></tr></table>');
										div = table.find('div');
										result = table.find('tr');
										result.paddingHeight = function() {
											return div.height.apply(div, arguments);
										};
										return result;
									default:
										result = angular.element('<' + repeaterType + '></' + repeaterType + '>');
										result.paddingHeight = result.height;
										return result;
								}
							};
							createPadding = function(padding, element, direction) {
								element[{
									top: 'before',
									bottom: 'after'
								}[direction]](padding);
								return {
									paddingHeight: function() {
										return padding.paddingHeight.apply(padding, arguments);
									},
									insert: function(element) {
										return padding[{
											top: 'after',
											bottom: 'before'
										}[direction]](element);
									}
								};
							};
							topPadding = createPadding(padding(repeaterType), element, 'top');
							bottomPadding = createPadding(padding(repeaterType), element, 'bottom');
							tempScope.$destroy();
							return adapter = {
								viewport: viewport,
								topPadding: topPadding.paddingHeight,
								bottomPadding: bottomPadding.paddingHeight,
								append: bottomPadding.insert,
								prepend: topPadding.insert,
								bottomDataPos: function() {
									return scrollHeight(viewport) - bottomPadding.paddingHeight();
								},
								topDataPos: function() {
									return topPadding.paddingHeight();
								}
							};
						});
						viewport = adapter.viewport;
						first = 1;
						next = 1;
						buffer = [];
						pending = [];
						eof = false;
						bof = false;
						loading = datasource.loading || function() {};
						isLoading = false;
						removeFromBuffer = function(start, stop) {
							var i, _i;
							for (i = _i = start; start <= stop ? _i < stop : _i > stop; i = start <= stop ? ++_i : --_i) {
								buffer[i].scope.$destroy();
								buffer[i].element.remove();
							}
							return buffer.splice(start, stop - start);
						};
						reload = function() {
							first = 1;
							next = 1;
							removeFromBuffer(0, buffer.length);
							adapter.topPadding(0);
							adapter.bottomPadding(0);
							pending = [];
							eof = false;
							bof = false;
							return adjustBuffer(false);
						};
						bottomVisiblePos = function() {
							return viewport.scrollTop() + viewport.height();
						};
						topVisiblePos = function() {
							return viewport.scrollTop();
						};
						shouldLoadBottom = function() {
							return !eof && adapter.bottomDataPos() < bottomVisiblePos() + bufferPadding();
						};
						clipBottom = function() {
							var bottomHeight, i, itemHeight, overage, _i, _ref;
							bottomHeight = 0;
							overage = 0;
							for (i = _i = _ref = buffer.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
								itemHeight = buffer[i].element.outerHeight(true);
								if (adapter.bottomDataPos() - bottomHeight - itemHeight > bottomVisiblePos() + bufferPadding()) {
									bottomHeight += itemHeight;
									overage++;
									eof = false;
								} else {
									break;
								}
							}
							if (overage > 0) {
								adapter.bottomPadding(adapter.bottomPadding() + bottomHeight);
								removeFromBuffer(buffer.length - overage, buffer.length);
								next -= overage;
								return console.log('clipped off bottom ' + overage + ' bottom padding ' + (adapter.bottomPadding()));
							}
						};
						shouldLoadTop = function() {
							return !bof && (adapter.topDataPos() > topVisiblePos() - bufferPadding());
						};
						clipTop = function() {
							var item, itemHeight, overage, topHeight, _i, _len;
							topHeight = 0;
							overage = 0;
							for (_i = 0, _len = buffer.length; _i < _len; _i++) {
								item = buffer[_i];
								itemHeight = item.element.outerHeight(true);
								if (adapter.topDataPos() + topHeight + itemHeight < topVisiblePos() - bufferPadding()) {
									topHeight += itemHeight;
									overage++;
									bof = false;
								} else {
									break;
								}
							}
							if (overage > 0) {
								adapter.topPadding(adapter.topPadding() + topHeight);
								removeFromBuffer(0, overage);
								first += overage;
								return console.log('clipped off top ' + overage + ' top padding ' + (adapter.topPadding()));
							}
						};
						enqueueFetch = function(direction, scrolling) {
							if (!isLoading) {
								isLoading = true;
								loading(true);
							}
							if (pending.push(direction) === 1) {
								return fetch(scrolling);
							}
						};
						insert = function(index, item) {
							var itemScope, toBeAppended, wrapper;
							itemScope = $scope.$new();
							itemScope[itemName] = item;
							toBeAppended = index > first;
							itemScope.$index = index;
							if (toBeAppended) {
								itemScope.$index--;
							}
							wrapper = {
								scope: itemScope
							};
							linker(itemScope, function(clone) {
								wrapper.element = clone;
								if (toBeAppended) {
									if (index === next) {
										adapter.append(clone);
										return buffer.push(wrapper);
									} else {
										buffer[index - first].element.after(clone);
										return buffer.splice(index - first + 1, 0, wrapper);
									}
								} else {
									adapter.prepend(clone);
									return buffer.unshift(wrapper);
								}
							});
							return {
								appended: toBeAppended,
								wrapper: wrapper
							};
						};
						adjustRowHeight = function(appended, wrapper) {
							var newHeight;
							if (appended) {
								return adapter.bottomPadding(Math.max(0, adapter.bottomPadding() - wrapper.element.outerHeight(true)));
							} else {
								newHeight = adapter.topPadding() - wrapper.element.outerHeight(true);
								if (newHeight >= 0) {
									return adapter.topPadding(newHeight);
								} else {
									return viewport.scrollTop(viewport.scrollTop() + wrapper.element.outerHeight(true));
								}
							}
						};
						adjustBuffer = function(scrolling, newItems, finalize) {
							var doAdjustment;
							doAdjustment = function() {
								console.log('top {actual=' + (adapter.topDataPos()) + ' visible from=' + (topVisiblePos()) + ' bottom {visible through=' + (bottomVisiblePos()) + ' actual=' + (adapter.bottomDataPos()) + '}');
								if (shouldLoadBottom()) {
									enqueueFetch(true, scrolling);
								} else {
									if (shouldLoadTop()) {
										enqueueFetch(false, scrolling);
									}
								}
								if (finalize) {
									return finalize();
								}
							};
							if (newItems) {
								return $timeout(function() {
									var row, _i, _len;
									for (_i = 0, _len = newItems.length; _i < _len; _i++) {
										row = newItems[_i];
										adjustRowHeight(row.appended, row.wrapper);
									}
									return doAdjustment();
								});
							} else {
								return doAdjustment();
							}
						};
						finalize = function(scrolling, newItems) {
							return adjustBuffer(scrolling, newItems, function() {
								pending.shift();
								if (pending.length === 0) {
									isLoading = false;
									return loading(false);
								} else {
									return fetch(scrolling);
								}
							});
						};
						fetch = function(scrolling) {
							var direction;
							direction = pending[0];
							if (direction) {
								if (buffer.length && !shouldLoadBottom()) {
									return finalize(scrolling);
								} else {
									return datasource.get(next, bufferSize, function(result) {
										var item, newItems, _i, _len;
										newItems = [];
										if (result.length === 0) {
											eof = true;
											adapter.bottomPadding(0);
											console.log('appended: requested ' + bufferSize + ' records starting from ' + next + ' recieved: eof');
										} else {
											clipTop();
											for (_i = 0, _len = result.length; _i < _len; _i++) {
												item = result[_i];
												newItems.push(insert(++next, item));
											}
											console.log('appended: requested ' + bufferSize + ' received ' + result.length + ' buffer size ' + buffer.length + ' first ' + first + ' next ' + next);
										}
										return finalize(scrolling, newItems);
									});
								}
							} else {
								if (buffer.length && !shouldLoadTop()) {
									return finalize(scrolling);
								} else {
									return datasource.get(first - bufferSize, bufferSize, function(result) {
										var i, newItems, _i, _ref;
										newItems = [];
										if (result.length === 0) {
											bof = true;
											adapter.topPadding(0);
											console.log('prepended: requested ' + bufferSize + ' records starting from ' + (first - bufferSize) + ' recieved: bof');
										} else {
											clipBottom();
											for (i = _i = _ref = result.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
												newItems.unshift(insert(--first, result[i]));
											}
											console.log('prepended: requested ' + bufferSize + ' received ' + result.length + ' buffer size ' + buffer.length + ' first ' + first + ' next ' + next);
										}
										return finalize(scrolling, newItems);
									});
								}
							}
						};
						resizeHandler = function() {
							if (!$rootScope.$$phase && !isLoading) {
								adjustBuffer(false);
								return $scope.$apply();
							}
						};
						viewport.bind('resize', resizeHandler);
						scrollHandler = function() {
							if (!$rootScope.$$phase && !isLoading) {
								adjustBuffer(true);
								return $scope.$apply();
							}
						};
						viewport.bind('scroll', scrollHandler);
						$scope.$watch(datasource.revision, function() {
							return reload();
						});
						if (datasource.scope) {
							eventListener = datasource.scope.$new();
						} else {
							eventListener = $scope.$new();
						}
						$scope.$on('$destroy', function() {
							eventListener.$destroy();
							viewport.unbind('resize', resizeHandler);
							return viewport.unbind('scroll', scrollHandler);
						});
						eventListener.$on('update.items', function(event, locator, newItem) {
							var wrapper, _fn, _i, _len, _ref;
							if (angular.isFunction(locator)) {
								_fn = function(wrapper) {
									return locator(wrapper.scope);
								};
								for (_i = 0, _len = buffer.length; _i < _len; _i++) {
									wrapper = buffer[_i];
									_fn(wrapper);
								}
							} else {
								if ((0 <= (_ref = locator - first - 1) && _ref < buffer.length)) {
									buffer[locator - first - 1].scope[itemName] = newItem;
								}
							}
							return null;
						});
						eventListener.$on('delete.items', function(event, locator) {
							var i, item, temp, wrapper, _fn, _i, _j, _k, _len, _len1, _len2, _ref;
							if (angular.isFunction(locator)) {
								temp = [];
								for (_i = 0, _len = buffer.length; _i < _len; _i++) {
									item = buffer[_i];
									temp.unshift(item);
								}
								_fn = function(wrapper) {
									if (locator(wrapper.scope)) {
										removeFromBuffer(temp.length - 1 - i, temp.length - i);
										return next--;
									}
								};
								for (i = _j = 0, _len1 = temp.length; _j < _len1; i = ++_j) {
									wrapper = temp[i];
									_fn(wrapper);
								}
							} else {
								if ((0 <= (_ref = locator - first - 1) && _ref < buffer.length)) {
									removeFromBuffer(locator - first - 1, locator - first);
									next--;
								}
							}
							for (i = _k = 0, _len2 = buffer.length; _k < _len2; i = ++_k) {
								item = buffer[i];
								item.scope.$index = first + i;
							}
							return adjustBuffer(false);
						});
						return eventListener.$on('insert.item', function(event, locator, item) {
							var i, inserted, temp, wrapper, _fn, _i, _j, _k, _len, _len1, _len2, _ref;
							inserted = [];
							if (angular.isFunction(locator)) {
								temp = [];
								for (_i = 0, _len = buffer.length; _i < _len; _i++) {
									item = buffer[_i];
									temp.unshift(item);
								}
								_fn = function(wrapper) {
									var j, newItems, _k, _len2, _results;
									if (newItems = locator(wrapper.scope)) {
										insert = function(index, newItem) {
											insert(index, newItem);
											return next++;
										};
										if (angular.isArray(newItems)) {
											_results = [];
											for (j = _k = 0, _len2 = newItems.length; _k < _len2; j = ++_k) {
												item = newItems[j];
												_results.push(inserted.push(insert(i + j, item)));
											}
											return _results;
										} else {
											return inserted.push(insert(i, newItems));
										}
									}
								};
								for (i = _j = 0, _len1 = temp.length; _j < _len1; i = ++_j) {
									wrapper = temp[i];
									_fn(wrapper);
								}
							} else {
								if ((0 <= (_ref = locator - first - 1) && _ref < buffer.length)) {
									inserted.push(insert(locator, item));
									next++;
								}
							}
							for (i = _k = 0, _len2 = buffer.length; _k < _len2; i = ++_k) {
								item = buffer[i];
								item.scope.$index = first + i;
							}
							return adjustBuffer(false, inserted);
						});
					};
				}
			};
		}
	]);

'use strict';

/**
 * Adds a 'ui-scrollfix' class to the element when the page scrolls past it's position.
 * @param [offset] {int} optional Y-offset to override the detected offset.
 *   Takes 300 (absolute) or -300 or +300 (relative to detected)
 */
angular.module('ui.scrollfix',[]).directive('uiScrollfix', ['$window', function ($window) {
  return {
    require: '^?uiScrollfixTarget',
    link: function (scope, elm, attrs, uiScrollfixTarget) {
      var top = elm[0].offsetTop,
          $target = uiScrollfixTarget && uiScrollfixTarget.$element || angular.element($window);

      if (!attrs.uiScrollfix) {
        attrs.uiScrollfix = top;
      } else if (typeof(attrs.uiScrollfix) === 'string') {
        // charAt is generally faster than indexOf: http://jsperf.com/indexof-vs-charat
        if (attrs.uiScrollfix.charAt(0) === '-') {
          attrs.uiScrollfix = top - parseFloat(attrs.uiScrollfix.substr(1));
        } else if (attrs.uiScrollfix.charAt(0) === '+') {
          attrs.uiScrollfix = top + parseFloat(attrs.uiScrollfix.substr(1));
        }
      }

      function onScroll() {
        // if pageYOffset is defined use it, otherwise use other crap for IE
        var offset;
        if (angular.isDefined($window.pageYOffset)) {
          offset = $window.pageYOffset;
        } else {
          var iebody = (document.compatMode && document.compatMode !== 'BackCompat') ? document.documentElement : document.body;
          offset = iebody.scrollTop;
        }
        if (!elm.hasClass('ui-scrollfix') && offset > attrs.uiScrollfix) {
          elm.addClass('ui-scrollfix');
        } else if (elm.hasClass('ui-scrollfix') && offset < attrs.uiScrollfix) {
          elm.removeClass('ui-scrollfix');
        }
      }

      $target.on('scroll', onScroll);

      // Unbind scroll event handler when directive is removed
      scope.$on('$destroy', function() {
        $target.off('scroll', onScroll);
      });
    }
  };
}]).directive('uiScrollfixTarget', [function () {
  return {
    controller: ['$element', function($element) {
      this.$element = $element;
    }]
  };
}]);

'use strict';

/**
 * uiShow Directive
 *
 * Adds a 'ui-show' class to the element instead of display:block
 * Created to allow tighter control  of CSS without bulkier directives
 *
 * @param expression {boolean} evaluated expression to determine if the class should be added
 */
angular.module('ui.showhide',[])
.directive('uiShow', [function () {
  return function (scope, elm, attrs) {
    scope.$watch(attrs.uiShow, function (newVal) {
      if (newVal) {
        elm.addClass('ui-show');
      } else {
        elm.removeClass('ui-show');
      }
    });
  };
}])

/**
 * uiHide Directive
 *
 * Adds a 'ui-hide' class to the element instead of display:block
 * Created to allow tighter control  of CSS without bulkier directives
 *
 * @param expression {boolean} evaluated expression to determine if the class should be added
 */
.directive('uiHide', [function () {
  return function (scope, elm, attrs) {
    scope.$watch(attrs.uiHide, function (newVal) {
      if (newVal) {
        elm.addClass('ui-hide');
      } else {
        elm.removeClass('ui-hide');
      }
    });
  };
}])

/**
 * uiToggle Directive
 *
 * Adds a class 'ui-show' if true, and a 'ui-hide' if false to the element instead of display:block/display:none
 * Created to allow tighter control  of CSS without bulkier directives. This also allows you to override the
 * default visibility of the element using either class.
 *
 * @param expression {boolean} evaluated expression to determine if the class should be added
 */
.directive('uiToggle', [function () {
  return function (scope, elm, attrs) {
    scope.$watch(attrs.uiToggle, function (newVal) {
      if (newVal) {
        elm.removeClass('ui-hide').addClass('ui-show');
      } else {
        elm.removeClass('ui-show').addClass('ui-hide');
      }
    });
  };
}]);

'use strict';

/**
 * Filters out all duplicate items from an array by checking the specified key
 * @param [key] {string} the name of the attribute of each object to compare for uniqueness
 if the key is empty, the entire object will be compared
 if the key === false then no filtering will be performed
 * @return {array}
 */
angular.module('ui.unique',[]).filter('unique', ['$parse', function ($parse) {

  return function (items, filterOn) {

    if (filterOn === false) {
      return items;
    }

    if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
      var newItems = [],
        get = angular.isString(filterOn) ? $parse(filterOn) : function (item) { return item; };

      var extractValueToCompare = function (item) {
        return angular.isObject(item) ? get(item) : item;
      };

      angular.forEach(items, function (item) {
        var isDuplicate = false;

        for (var i = 0; i < newItems.length; i++) {
          if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          newItems.push(item);
        }

      });
      items = newItems;
    }
    return items;
  };
}]);

'use strict';

/**
 * General-purpose validator for ngModel.
 * angular.js comes with several built-in validation mechanism for input fields (ngRequired, ngPattern etc.) but using
 * an arbitrary validation function requires creation of a custom formatters and / or parsers.
 * The ui-validate directive makes it easy to use any function(s) defined in scope as a validator function(s).
 * A validator function will trigger validation on both model and input changes.
 *
 * @example <input ui-validate=" 'myValidatorFunction($value)' ">
 * @example <input ui-validate="{ foo : '$value > anotherModel', bar : 'validateFoo($value)' }">
 * @example <input ui-validate="{ foo : '$value > anotherModel' }" ui-validate-watch=" 'anotherModel' ">
 * @example <input ui-validate="{ foo : '$value > anotherModel', bar : 'validateFoo($value)' }" ui-validate-watch=" { foo : 'anotherModel' } ">
 *
 * @param ui-validate {string|object literal} If strings is passed it should be a scope's function to be used as a validator.
 * If an object literal is passed a key denotes a validation error key while a value should be a validator function.
 * In both cases validator function should take a value to validate as its argument and should return true/false indicating a validation result.
 */
angular.module('ui.validate',[]).directive('uiValidate', function () {

  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, elm, attrs, ctrl) {
      var validateFn, validators = {},
          validateExpr = scope.$eval(attrs.uiValidate);

      if (!validateExpr){ return;}

      if (angular.isString(validateExpr)) {
        validateExpr = { validator: validateExpr };
      }

      angular.forEach(validateExpr, function (exprssn, key) {
        validateFn = function (valueToValidate) {
          var expression = scope.$eval(exprssn, { '$value' : valueToValidate });
          if (angular.isObject(expression) && angular.isFunction(expression.then)) {
            // expression is a promise
            expression.then(function(){
              ctrl.$setValidity(key, true);
            }, function(){
              ctrl.$setValidity(key, false);
            });
            return valueToValidate;
          } else if (expression) {
            // expression is true
            ctrl.$setValidity(key, true);
            return valueToValidate;
          } else {
            // expression is false
            ctrl.$setValidity(key, false);
            return valueToValidate;
          }
        };
        validators[key] = validateFn;
        ctrl.$formatters.push(validateFn);
        ctrl.$parsers.push(validateFn);
      });

      function apply_watch(watch)
      {
          //string - update all validators on expression change
          if (angular.isString(watch))
          {
              scope.$watch(watch, function(){
                  angular.forEach(validators, function(validatorFn){
                      validatorFn(ctrl.$modelValue);
                  });
              });
              return;
          }

          //array - update all validators on change of any expression
          if (angular.isArray(watch))
          {
              angular.forEach(watch, function(expression){
                  scope.$watch(expression, function()
                  {
                      angular.forEach(validators, function(validatorFn){
                          validatorFn(ctrl.$modelValue);
                      });
                  });
              });
              return;
          }

          //object - update appropriate validator
          if (angular.isObject(watch))
          {
              angular.forEach(watch, function(expression, validatorKey)
              {
                  //value is string - look after one expression
                  if (angular.isString(expression))
                  {
                      scope.$watch(expression, function(){
                          validators[validatorKey](ctrl.$modelValue);
                      });
                  }

                  //value is array - look after all expressions in array
                  if (angular.isArray(expression))
                  {
                      angular.forEach(expression, function(intExpression)
                      {
                          scope.$watch(intExpression, function(){
                              validators[validatorKey](ctrl.$modelValue);
                          });
                      });
                  }
              });
          }
      }
      // Support for ui-validate-watch
      if (attrs.uiValidateWatch){
          apply_watch( scope.$eval(attrs.uiValidateWatch) );
      }
    }
  };
});

angular.module('ui.utils',  [
  'ui.event',
  'ui.format',
  'ui.highlight',
  'ui.include',
  'ui.indeterminate',
  'ui.inflector',
  'ui.jq',
  'ui.keypress',
  'ui.mask',
  'ui.reset',
  'ui.route',
  'ui.scrollfix',
  'ui.scroll',
  'ui.scroll.jqlite',
  'ui.showhide',
  'ui.unique',
  'ui.validate'
]);
/**
 * angular-translate - v2.0.0 - 2014-02-16
 * http://github.com/PascalPrecht/angular-translate
 * Copyright (c) 2014 ; Licensed 
 */
angular.module('pascalprecht.translate', ['ng']).run([
  '$translate',
  function ($translate) {
    var key = $translate.storageKey(), storage = $translate.storage();
    if (storage) {
      if (!storage.get(key)) {
        if (angular.isString($translate.preferredLanguage())) {
          $translate.use($translate.preferredLanguage());
        } else {
          storage.set(key, $translate.use());
        }
      } else {
        $translate.use(storage.get(key));
      }
    } else if (angular.isString($translate.preferredLanguage())) {
      $translate.use($translate.preferredLanguage());
    }
  }
]);
angular.module('pascalprecht.translate').provider('$translate', [
  '$STORAGE_KEY',
  function ($STORAGE_KEY) {
    var $translationTable = {}, $preferredLanguage, $availableLanguageKeys = [], $languageKeyAliases, $fallbackLanguage, $fallbackWasString, $uses, $nextLang, $storageFactory, $storageKey = $STORAGE_KEY, $storagePrefix, $missingTranslationHandlerFactory, $interpolationFactory, $interpolatorFactories = [], $interpolationSanitizationStrategy = false, $loaderFactory, $cloakClassName = 'translate-cloak', $loaderOptions, $notFoundIndicatorLeft, $notFoundIndicatorRight, $postCompilingEnabled = false, NESTED_OBJECT_DELIMITER = '.';
    var getLocale = function () {
      var nav = window.navigator;
      return (nav.language || nav.browserLanguage || nav.systemLanguage || nav.userLanguage || '').split('-').join('_');
    };
    var negotiateLocale = function (preferred) {
      var avail = [], locale = angular.lowercase(preferred), i = 0, n = $availableLanguageKeys.length;
      for (; i < n; i++) {
        avail.push(angular.lowercase($availableLanguageKeys[i]));
      }
      if (avail.indexOf(locale) > -1) {
        return locale;
      }
      if ($languageKeyAliases) {
        if ($languageKeyAliases[preferred]) {
          var alias = $languageKeyAliases[preferred];
          if (avail.indexOf(angular.lowercase(alias)) > -1) {
            return alias;
          }
        }
      }
      var parts = preferred.split('_');
      if (parts.length > 1 && avail.indexOf(angular.lowercase(parts[0])) > 1) {
        return parts[0];
      }
    };
    var translations = function (langKey, translationTable) {
      if (!langKey && !translationTable) {
        return $translationTable;
      }
      if (langKey && !translationTable) {
        if (angular.isString(langKey)) {
          return $translationTable[langKey];
        }
      } else {
        if (!angular.isObject($translationTable[langKey])) {
          $translationTable[langKey] = {};
        }
        angular.extend($translationTable[langKey], flatObject(translationTable));
      }
      return this;
    };
    this.translations = translations;
    this.cloakClassName = function (name) {
      if (!name) {
        return $cloakClassName;
      }
      $cloakClassName = name;
      return this;
    };
    var flatObject = function (data, path, result, prevKey) {
      var key, keyWithPath, keyWithShortPath, val;
      if (!path) {
        path = [];
      }
      if (!result) {
        result = {};
      }
      for (key in data) {
        if (!data.hasOwnProperty(key)) {
          continue;
        }
        val = data[key];
        if (angular.isObject(val)) {
          flatObject(val, path.concat(key), result, key);
        } else {
          keyWithPath = path.length ? '' + path.join(NESTED_OBJECT_DELIMITER) + NESTED_OBJECT_DELIMITER + key : key;
          if (path.length && key === prevKey) {
            keyWithShortPath = '' + path.join(NESTED_OBJECT_DELIMITER);
            result[keyWithShortPath] = '@:' + keyWithPath;
          }
          result[keyWithPath] = val;
        }
      }
      return result;
    };
    this.addInterpolation = function (factory) {
      $interpolatorFactories.push(factory);
      return this;
    };
    this.useMessageFormatInterpolation = function () {
      return this.useInterpolation('$translateMessageFormatInterpolation');
    };
    this.useInterpolation = function (factory) {
      $interpolationFactory = factory;
      return this;
    };
    this.useSanitizeValueStrategy = function (value) {
      $interpolationSanitizationStrategy = value;
      return this;
    };
    this.preferredLanguage = function (langKey) {
      if (langKey) {
        $preferredLanguage = langKey;
        return this;
      }
      return $preferredLanguage;
    };
    this.translationNotFoundIndicator = function (indicator) {
      this.translationNotFoundIndicatorLeft(indicator);
      this.translationNotFoundIndicatorRight(indicator);
      return this;
    };
    this.translationNotFoundIndicatorLeft = function (indicator) {
      if (!indicator) {
        return $notFoundIndicatorLeft;
      }
      $notFoundIndicatorLeft = indicator;
      return this;
    };
    this.translationNotFoundIndicatorRight = function (indicator) {
      if (!indicator) {
        return $notFoundIndicatorRight;
      }
      $notFoundIndicatorRight = indicator;
      return this;
    };
    this.fallbackLanguage = function (langKey) {
      fallbackStack(langKey);
      return this;
    };
    var fallbackStack = function (langKey) {
      if (langKey) {
        if (angular.isString(langKey)) {
          $fallbackWasString = true;
          $fallbackLanguage = [langKey];
        } else if (angular.isArray(langKey)) {
          $fallbackWasString = false;
          $fallbackLanguage = langKey;
        }
        if (angular.isString($preferredLanguage)) {
          $fallbackLanguage.push($preferredLanguage);
        }
        return this;
      } else {
        if ($fallbackWasString) {
          return $fallbackLanguage[0];
        } else {
          return $fallbackLanguage;
        }
      }
    };
    this.use = function (langKey) {
      if (langKey) {
        if (!$translationTable[langKey] && !$loaderFactory) {
          throw new Error('$translateProvider couldn\'t find translationTable for langKey: \'' + langKey + '\'');
        }
        $uses = langKey;
        return this;
      }
      return $uses;
    };
    var storageKey = function (key) {
      if (!key) {
        if ($storagePrefix) {
          return $storagePrefix + $storageKey;
        }
        return $storageKey;
      }
      $storageKey = key;
    };
    this.storageKey = storageKey;
    this.useUrlLoader = function (url) {
      return this.useLoader('$translateUrlLoader', { url: url });
    };
    this.useStaticFilesLoader = function (options) {
      return this.useLoader('$translateStaticFilesLoader', options);
    };
    this.useLoader = function (loaderFactory, options) {
      $loaderFactory = loaderFactory;
      $loaderOptions = options || {};
      return this;
    };
    this.useLocalStorage = function () {
      return this.useStorage('$translateLocalStorage');
    };
    this.useCookieStorage = function () {
      return this.useStorage('$translateCookieStorage');
    };
    this.useStorage = function (storageFactory) {
      $storageFactory = storageFactory;
      return this;
    };
    this.storagePrefix = function (prefix) {
      if (!prefix) {
        return prefix;
      }
      $storagePrefix = prefix;
      return this;
    };
    this.useMissingTranslationHandlerLog = function () {
      return this.useMissingTranslationHandler('$translateMissingTranslationHandlerLog');
    };
    this.useMissingTranslationHandler = function (factory) {
      $missingTranslationHandlerFactory = factory;
      return this;
    };
    this.usePostCompiling = function (value) {
      $postCompilingEnabled = !!value;
      return this;
    };
    this.determinePreferredLanguage = function (fn) {
      var locale = fn && angular.isFunction(fn) ? fn() : getLocale();
      if (!$availableLanguageKeys.length) {
        $preferredLanguage = locale;
        return this;
      } else {
        $preferredLanguage = negotiateLocale(locale);
      }
    };
    this.registerAvailableLanguageKeys = function (languageKeys, aliases) {
      if (languageKeys) {
        $availableLanguageKeys = languageKeys;
        if (aliases) {
          $languageKeyAliases = aliases;
        }
        return this;
      }
      return $availableLanguageKeys;
    };
    this.$get = [
      '$log',
      '$injector',
      '$rootScope',
      '$q',
      function ($log, $injector, $rootScope, $q) {
        var Storage, defaultInterpolator = $injector.get($interpolationFactory || '$translateDefaultInterpolation'), pendingLoader = false, interpolatorHashMap = {}, langPromises = {}, fallbackIndex, startFallbackIteration;
        var $translate = function (translationId, interpolateParams, interpolationId) {
          var deferred = $q.defer();
          translationId = translationId.trim();
          var promiseToWaitFor = function () {
              var promise = $preferredLanguage ? langPromises[$preferredLanguage] : langPromises[$uses];
              fallbackIndex = 0;
              if ($storageFactory && !promise) {
                var langKey = Storage.get($storageKey);
                promise = langPromises[langKey];
                if ($fallbackLanguage && $fallbackLanguage.length) {
                  var index = indexOf($fallbackLanguage, langKey);
                  fallbackIndex = index > -1 ? index += 1 : 0;
                  $fallbackLanguage.push($preferredLanguage);
                }
              }
              return promise;
            }();
          if (!promiseToWaitFor) {
            determineTranslation(translationId, interpolateParams, interpolationId).then(deferred.resolve, deferred.reject);
          } else {
            promiseToWaitFor.then(function () {
              determineTranslation(translationId, interpolateParams, interpolationId).then(deferred.resolve, deferred.reject);
            }, deferred.reject);
          }
          return deferred.promise;
        };
        var indexOf = function (array, searchElement) {
          for (var i = 0, len = array.length; i < len; i++) {
            if (array[i] === searchElement) {
              return i;
            }
          }
          return -1;
        };
        var applyNotFoundIndicators = function (translationId) {
          if ($notFoundIndicatorLeft) {
            translationId = [
              $notFoundIndicatorLeft,
              translationId
            ].join(' ');
          }
          if ($notFoundIndicatorRight) {
            translationId = [
              translationId,
              $notFoundIndicatorRight
            ].join(' ');
          }
          return translationId;
        };
        var useLanguage = function (key) {
          $uses = key;
          $rootScope.$emit('$translateChangeSuccess');
          if ($storageFactory) {
            Storage.set($translate.storageKey(), $uses);
          }
          defaultInterpolator.setLocale($uses);
          angular.forEach(interpolatorHashMap, function (interpolator, id) {
            interpolatorHashMap[id].setLocale($uses);
          });
          $rootScope.$emit('$translateChangeEnd');
        };
        var loadAsync = function (key) {
          if (!key) {
            throw 'No language key specified for loading.';
          }
          var deferred = $q.defer();
          $rootScope.$emit('$translateLoadingStart');
          pendingLoader = true;
          $injector.get($loaderFactory)(angular.extend($loaderOptions, { key: key })).then(function (data) {
            var translationTable = {};
            $rootScope.$emit('$translateLoadingSuccess');
            if (angular.isArray(data)) {
              angular.forEach(data, function (table) {
                angular.extend(translationTable, flatObject(table));
              });
            } else {
              angular.extend(translationTable, flatObject(data));
            }
            pendingLoader = false;
            deferred.resolve({
              key: key,
              table: translationTable
            });
            $rootScope.$emit('$translateLoadingEnd');
          }, function (key) {
            $rootScope.$emit('$translateLoadingError');
            deferred.reject(key);
            $rootScope.$emit('$translateLoadingEnd');
          });
          return deferred.promise;
        };
        if ($storageFactory) {
          Storage = $injector.get($storageFactory);
          if (!Storage.get || !Storage.set) {
            throw new Error('Couldn\'t use storage \'' + $storageFactory + '\', missing get() or set() method!');
          }
        }
        if (angular.isFunction(defaultInterpolator.useSanitizeValueStrategy)) {
          defaultInterpolator.useSanitizeValueStrategy($interpolationSanitizationStrategy);
        }
        if ($interpolatorFactories.length) {
          angular.forEach($interpolatorFactories, function (interpolatorFactory) {
            var interpolator = $injector.get(interpolatorFactory);
            interpolator.setLocale($preferredLanguage || $uses);
            if (angular.isFunction(interpolator.useSanitizeValueStrategy)) {
              interpolator.useSanitizeValueStrategy($interpolationSanitizationStrategy);
            }
            interpolatorHashMap[interpolator.getInterpolationIdentifier()] = interpolator;
          });
        }
        var getTranslationTable = function (langKey) {
          var deferred = $q.defer();
          if ($translationTable.hasOwnProperty(langKey)) {
            deferred.resolve($translationTable[langKey]);
            return deferred.promise;
          } else {
            langPromises[langKey].then(function (data) {
              translations(data.key, data.table);
              deferred.resolve(data.table);
            }, deferred.reject);
          }
          return deferred.promise;
        };
        var getFallbackTranslation = function (langKey, translationId, interpolateParams, Interpolator) {
          var deferred = $q.defer();
          getTranslationTable(langKey).then(function (translationTable) {
            if (translationTable.hasOwnProperty(translationId)) {
              Interpolator.setLocale(langKey);
              deferred.resolve(Interpolator.interpolate(translationTable[translationId], interpolateParams));
              Interpolator.setLocale($uses);
            } else {
              deferred.reject();
            }
          }, deferred.reject);
          return deferred.promise;
        };
        var getFallbackTranslationInstant = function (langKey, translationId, interpolateParams, Interpolator) {
          var result, translationTable = $translationTable[langKey];
          if (translationTable.hasOwnProperty(translationId)) {
            Interpolator.setLocale(langKey);
            result = Interpolator.interpolate(translationTable[translationId], interpolateParams);
            Interpolator.setLocale($uses);
          }
          return result;
        };
        var resolveForFallbackLanguage = function (fallbackLanguageIndex, translationId, interpolateParams, Interpolator) {
          var deferred = $q.defer();
          if (fallbackLanguageIndex < $fallbackLanguage.length) {
            var langKey = $fallbackLanguage[fallbackLanguageIndex];
            getFallbackTranslation(langKey, translationId, interpolateParams, Interpolator).then(function (translation) {
              deferred.resolve(translation);
            }, function () {
              var nextFallbackLanguagePromise = resolveForFallbackLanguage(fallbackLanguageIndex + 1, translationId, interpolateParams, Interpolator);
              deferred.resolve(nextFallbackLanguagePromise);
            });
          } else {
            deferred.resolve(translationId);
          }
          return deferred.promise;
        };
        var resolveForFallbackLanguageInstant = function (fallbackLanguageIndex, translationId, interpolateParams, Interpolator) {
          var result;
          if (fallbackLanguageIndex < $fallbackLanguage.length) {
            var langKey = $fallbackLanguage[fallbackLanguageIndex];
            result = getFallbackTranslationInstant(langKey, translationId, interpolateParams, Interpolator);
            if (!result) {
              result = resolveForFallbackLanguageInstant(fallbackLanguageIndex + 1, translationId, interpolateParams, Interpolator);
            }
          }
          return result;
        };
        var fallbackTranslation = function (translationId, interpolateParams, Interpolator) {
          return resolveForFallbackLanguage(startFallbackIteration > 0 ? startFallbackIteration : fallbackIndex, translationId, interpolateParams, Interpolator);
        };
        var fallbackTranslationInstant = function (translationId, interpolateParams, Interpolator) {
          return resolveForFallbackLanguageInstant(startFallbackIteration > 0 ? startFallbackIteration : fallbackIndex, translationId, interpolateParams, Interpolator);
        };
        var determineTranslation = function (translationId, interpolateParams, interpolationId) {
          var deferred = $q.defer();
          var table = $uses ? $translationTable[$uses] : $translationTable, Interpolator = interpolationId ? interpolatorHashMap[interpolationId] : defaultInterpolator;
          if (table && table.hasOwnProperty(translationId)) {
            var translation = table[translationId];
            if (translation.substr(0, 2) === '@:') {
              $translate(translation.substr(2), interpolateParams, interpolationId).then(deferred.resolve, deferred.reject);
            } else {
              deferred.resolve(Interpolator.interpolate(translation, interpolateParams));
            }
          } else {
            if ($missingTranslationHandlerFactory && !pendingLoader) {
              $injector.get($missingTranslationHandlerFactory)(translationId, $uses);
            }
            if ($uses && $fallbackLanguage && $fallbackLanguage.length) {
              fallbackTranslation(translationId, interpolateParams, Interpolator).then(function (translation) {
                deferred.resolve(translation);
              }, function (_translationId) {
                deferred.reject(applyNotFoundIndicators(_translationId));
              });
            } else {
              deferred.reject(applyNotFoundIndicators(translationId));
            }
          }
          return deferred.promise;
        };
        var determineTranslationInstant = function (translationId, interpolateParams, interpolationId) {
          var result, table = $uses ? $translationTable[$uses] : $translationTable, Interpolator = interpolationId ? interpolatorHashMap[interpolationId] : defaultInterpolator;
          if (table && table.hasOwnProperty(translationId)) {
            var translation = table[translationId];
            if (translation.substr(0, 2) === '@:') {
              result = determineTranslationInstant(translation.substr(2), interpolateParams, interpolationId);
            } else {
              result = Interpolator.interpolate(translation, interpolateParams);
            }
          } else {
            if ($missingTranslationHandlerFactory && !pendingLoader) {
              $injector.get($missingTranslationHandlerFactory)(translationId, $uses);
            }
            if ($uses && $fallbackLanguage && $fallbackLanguage.length) {
              fallbackIndex = 0;
              result = fallbackTranslationInstant(translationId, interpolateParams, Interpolator);
            } else {
              result = applyNotFoundIndicators(translationId);
            }
          }
          return result;
        };
        $translate.preferredLanguage = function () {
          return $preferredLanguage;
        };
        $translate.cloakClassName = function () {
          return $cloakClassName;
        };
        $translate.fallbackLanguage = function (langKey) {
          if (langKey !== undefined && langKey !== null) {
            fallbackStack(langKey);
            if ($loaderFactory) {
              if ($fallbackLanguage && $fallbackLanguage.length) {
                for (var i = 0, len = $fallbackLanguage.length; i < len; i++) {
                  if (!langPromises[$fallbackLanguage[i]]) {
                    langPromises[$fallbackLanguage[i]] = loadAsync($fallbackLanguage[i]);
                  }
                }
              }
            }
            $translate.use($translate.use());
          }
          if ($fallbackWasString) {
            return $fallbackLanguage[0];
          } else {
            return $fallbackLanguage;
          }
        };
        $translate.useFallbackLanguage = function (langKey) {
          if (langKey !== undefined && langKey !== null) {
            if (!langKey) {
              startFallbackIteration = 0;
            } else {
              var langKeyPosition = indexOf($fallbackLanguage, langKey);
              if (langKeyPosition > -1) {
                startFallbackIteration = langKeyPosition;
              }
            }
          }
        };
        $translate.proposedLanguage = function () {
          return $nextLang;
        };
        $translate.storage = function () {
          return Storage;
        };
        $translate.use = function (key) {
          if (!key) {
            return $uses;
          }
          var deferred = $q.defer();
          $rootScope.$emit('$translateChangeStart');
          if (!$translationTable[key] && $loaderFactory) {
            $nextLang = key;
            langPromises[key] = loadAsync(key).then(function (translation) {
              $nextLang = undefined;
              translations(translation.key, translation.table);
              deferred.resolve(translation.key);
              useLanguage(translation.key);
            }, function (key) {
              $nextLang = undefined;
              $rootScope.$emit('$translateChangeError');
              deferred.reject(key);
              $rootScope.$emit('$translateChangeEnd');
            });
          } else {
            deferred.resolve(key);
            useLanguage(key);
          }
          return deferred.promise;
        };
        $translate.storageKey = function () {
          return storageKey();
        };
        $translate.isPostCompilingEnabled = function () {
          return $postCompilingEnabled;
        };
        $translate.refresh = function (langKey) {
          if (!$loaderFactory) {
            throw new Error('Couldn\'t refresh translation table, no loader registered!');
          }
          var deferred = $q.defer();
          function resolve() {
            deferred.resolve();
            $rootScope.$emit('$translateRefreshEnd');
          }
          function reject() {
            deferred.reject();
            $rootScope.$emit('$translateRefreshEnd');
          }
          $rootScope.$emit('$translateRefreshStart');
          if (!langKey) {
            var tables = [];
            if ($fallbackLanguage && $fallbackLanguage.length) {
              for (var i = 0, len = $fallbackLanguage.length; i < len; i++) {
                tables.push(loadAsync($fallbackLanguage[i]));
              }
            }
            if ($uses) {
              tables.push(loadAsync($uses));
            }
            $q.all(tables).then(function (tableData) {
              angular.forEach(tableData, function (data) {
                if ($translationTable[data.key]) {
                  delete $translationTable[data.key];
                }
                translations(data.key, data.table);
              });
              resolve();
            });
          } else if ($translationTable[langKey]) {
            loadAsync(langKey).then(function (data) {
              translations(data.key, data.table);
              if (langKey === $uses) {
                useLanguage($uses);
              }
              resolve();
            }, reject);
          } else {
            reject();
          }
          return deferred.promise;
        };
        $translate.instant = function (translationId, interpolateParams, interpolationId) {
          translationId = translationId.trim();
          var result, possibleLangKeys = [];
          if ($preferredLanguage) {
            possibleLangKeys.push($preferredLanguage);
          }
          if ($uses) {
            possibleLangKeys.push($uses);
          }
          if ($fallbackLanguage && $fallbackLanguage.length) {
            possibleLangKeys = possibleLangKeys.concat($fallbackLanguage);
          }
          for (var i = 0, c = possibleLangKeys.length; i < c; i++) {
            var possibleLangKey = possibleLangKeys[i];
            if ($translationTable[possibleLangKey]) {
              if ($translationTable[possibleLangKey][translationId]) {
                result = determineTranslationInstant(translationId, interpolateParams, interpolationId);
              }
            }
          }
          if (!result) {
            result = translationId;
          }
          return result;
        };
        if ($loaderFactory) {
          if (angular.equals($translationTable, {})) {
            $translate.use($translate.use());
          }
          if ($fallbackLanguage && $fallbackLanguage.length) {
            for (var i = 0, len = $fallbackLanguage.length; i < len; i++) {
              langPromises[$fallbackLanguage[i]] = loadAsync($fallbackLanguage[i]);
            }
          }
        }
        return $translate;
      }
    ];
  }
]);
angular.module('pascalprecht.translate').factory('$translateDefaultInterpolation', [
  '$interpolate',
  function ($interpolate) {
    var $translateInterpolator = {}, $locale, $identifier = 'default', $sanitizeValueStrategy = null, sanitizeValueStrategies = {
        escaped: function (params) {
          var result = {};
          for (var key in params) {
            if (params.hasOwnProperty(key)) {
              result[key] = angular.element('<div></div>').text(params[key]).html();
            }
          }
          return result;
        }
      };
    var sanitizeParams = function (params) {
      var result;
      if (angular.isFunction(sanitizeValueStrategies[$sanitizeValueStrategy])) {
        result = sanitizeValueStrategies[$sanitizeValueStrategy](params);
      } else {
        result = params;
      }
      return result;
    };
    $translateInterpolator.setLocale = function (locale) {
      $locale = locale;
    };
    $translateInterpolator.getInterpolationIdentifier = function () {
      return $identifier;
    };
    $translateInterpolator.useSanitizeValueStrategy = function (value) {
      $sanitizeValueStrategy = value;
      return this;
    };
    $translateInterpolator.interpolate = function (string, interpolateParams) {
      if ($sanitizeValueStrategy) {
        interpolateParams = sanitizeParams(interpolateParams);
      }
      return $interpolate(string)(interpolateParams);
    };
    return $translateInterpolator;
  }
]);
angular.module('pascalprecht.translate').constant('$STORAGE_KEY', 'NG_TRANSLATE_LANG_KEY');
angular.module('pascalprecht.translate').directive('translate', [
  '$translate',
  '$q',
  '$interpolate',
  '$compile',
  '$parse',
  '$rootScope',
  function ($translate, $q, $interpolate, $compile, $parse, $rootScope) {
    return {
      restrict: 'AE',
      scope: true,
      compile: function (tElement, tAttr) {
        var translateValuesExist = tAttr.translateValues ? tAttr.translateValues : undefined;
        var translateInterpolation = tAttr.translateInterpolation ? tAttr.translateInterpolation : undefined;
        var translateValueExist = tElement[0].outerHTML.match(/translate-value-+/i);
        return function linkFn(scope, iElement, iAttr) {
          scope.interpolateParams = {};
          iAttr.$observe('translate', function (translationId) {
            if (angular.equals(translationId, '') || !angular.isDefined(translationId)) {
              scope.translationId = $interpolate(iElement.text().replace(/^\s+|\s+$/g, ''))(scope.$parent);
            } else {
              scope.translationId = translationId;
            }
          });
          if (translateValuesExist) {
            iAttr.$observe('translateValues', function (interpolateParams) {
              if (interpolateParams) {
                scope.$parent.$watch(function () {
                  angular.extend(scope.interpolateParams, $parse(interpolateParams)(scope.$parent));
                });
              }
            });
          }
          if (translateValueExist) {
            var fn = function (attrName) {
              iAttr.$observe(attrName, function (value) {
                scope.interpolateParams[angular.lowercase(attrName.substr(14))] = value;
              });
            };
            for (var attr in iAttr) {
              if (iAttr.hasOwnProperty(attr) && attr.substr(0, 14) === 'translateValue' && attr !== 'translateValues') {
                fn(attr);
              }
            }
          }
          var applyElementContent = function (value, scope) {
            iElement.html(value);
            var globallyEnabled = $translate.isPostCompilingEnabled();
            var locallyDefined = typeof tAttr.translateCompile !== 'undefined';
            var locallyEnabled = locallyDefined && tAttr.translateCompile !== 'false';
            if (globallyEnabled && !locallyDefined || locallyEnabled) {
              $compile(iElement.contents())(scope);
            }
          };
          var updateTranslationFn = function () {
              if (!translateValuesExist && !translateValueExist) {
                return function () {
                  var unwatch = scope.$watch('translationId', function (value) {
                      if (scope.translationId && value) {
                        $translate(value, {}, translateInterpolation).then(function (translation) {
                          applyElementContent(translation, scope);
                          unwatch();
                        }, function (translationId) {
                          applyElementContent(translationId, scope);
                          unwatch();
                        });
                      }
                    }, true);
                };
              } else {
                return function () {
                  scope.$watch('interpolateParams', function (value) {
                    if (scope.translationId && value) {
                      $translate(scope.translationId, value, translateInterpolation).then(function (translation) {
                        applyElementContent(translation, scope);
                      }, function (translationId) {
                        applyElementContent(translationId, scope);
                      });
                    }
                  }, true);
                };
              }
            }();
          var unbind = $rootScope.$on('$translateChangeSuccess', updateTranslationFn);
          updateTranslationFn();
          scope.$on('$destroy', unbind);
        };
      }
    };
  }
]);
angular.module('pascalprecht.translate').directive('translateCloak', [
  '$rootScope',
  '$translate',
  function ($rootScope, $translate) {
    return {
      compile: function (tElement) {
        $rootScope.$on('$translateLoadingSuccess', function () {
          tElement.removeClass($translate.cloakClassName());
        });
        tElement.addClass($translate.cloakClassName());
      }
    };
  }
]);
angular.module('pascalprecht.translate').filter('translate', [
  '$parse',
  '$translate',
  function ($parse, $translate) {
    return function (translationId, interpolateParams, interpolation) {
      if (!angular.isObject(interpolateParams)) {
        interpolateParams = $parse(interpolateParams)();
      }
      return $translate.instant(translationId, interpolateParams, interpolation);
    };
  }
]);
angular.module('pascalprecht.translate').provider('$translatePartialLoader', function () {
  function Part(name) {
    this.name = name;
    this.isActive = true;
    this.tables = {};
  }
  Part.prototype.parseUrl = function (urlTemplate, targetLang) {
    return urlTemplate.replace(/\{part\}/g, this.name).replace(/\{lang\}/g, targetLang);
  };
  Part.prototype.getTable = function (lang, $q, $http, urlTemplate, errorHandler) {
    var deferred = $q.defer();
    if (!this.tables[lang]) {
      var self = this;
      $http({
        method: 'GET',
        url: this.parseUrl(urlTemplate, lang)
      }).success(function (data) {
        self.tables[lang] = data;
        deferred.resolve(data);
      }).error(function () {
        if (errorHandler) {
          errorHandler(self.name, lang).then(function (data) {
            self.tables[lang] = data;
            deferred.resolve(data);
          }, function () {
            deferred.reject(self.name);
          });
        } else {
          deferred.reject(self.name);
        }
      });
    } else {
      deferred.resolve(this.tables[lang]);
    }
    return deferred.promise;
  };
  var parts = {};
  function hasPart(name) {
    return parts.hasOwnProperty(name);
  }
  function isStringValid(str) {
    return angular.isString(str) && str !== '';
  }
  function isPartAvailable(name) {
    if (!isStringValid(name)) {
      throw new TypeError('Invalid type of a first argument, a non-empty string expected.');
    }
    return hasPart(name) && parts[name].isActive;
  }
  function deepExtend(dst, src) {
    for (var property in src) {
      if (src[property] && src[property].constructor && src[property].constructor === Object) {
        dst[property] = dst[property] || {};
        arguments.callee(dst[property], src[property]);
      } else {
        dst[property] = src[property];
      }
    }
    return dst;
  }
  this.addPart = function (name) {
    if (!isStringValid(name)) {
      throw new TypeError('Couldn\'t add part, part name has to be a string!');
    }
    if (!hasPart(name)) {
      parts[name] = new Part(name);
    }
    parts[name].isActive = true;
    return this;
  };
  this.setPart = function (lang, part, table) {
    if (!isStringValid(lang)) {
      throw new TypeError('Couldn\'t set part.`lang` parameter has to be a string!');
    }
    if (!isStringValid(part)) {
      throw new TypeError('Couldn\'t set part.`part` parameter has to be a string!');
    }
    if (typeof table !== 'object' || table === null) {
      throw new TypeError('Couldn\'t set part. `table` parameter has to be an object!');
    }
    if (!hasPart(part)) {
      parts[part] = new Part(part);
      parts[part].isActive = false;
    }
    parts[part].tables[lang] = table;
    return this;
  };
  this.deletePart = function (name) {
    if (!isStringValid(name)) {
      throw new TypeError('Couldn\'t delete part, first arg has to be string.');
    }
    if (hasPart(name)) {
      parts[name].isActive = false;
    }
    return this;
  };
  this.isPartAvailable = isPartAvailable;
  this.$get = [
    '$rootScope',
    '$injector',
    '$q',
    '$http',
    function ($rootScope, $injector, $q, $http) {
      var service = function (options) {
        if (!isStringValid(options.key)) {
          throw new TypeError('Unable to load data, a key is not a non-empty string.');
        }
        if (!isStringValid(options.urlTemplate)) {
          throw new TypeError('Unable to load data, a urlTemplate is not a non-empty string.');
        }
        var errorHandler = options.loadFailureHandler;
        if (errorHandler !== undefined) {
          if (!angular.isString(errorHandler)) {
            throw new Error('Unable to load data, a loadFailureHandler is not a string.');
          } else
            errorHandler = $injector.get(errorHandler);
        }
        var loaders = [], tables = [], deferred = $q.defer();
        function addTablePart(table) {
          tables.push(table);
        }
        for (var part in parts) {
          if (hasPart(part) && parts[part].isActive) {
            loaders.push(parts[part].getTable(options.key, $q, $http, options.urlTemplate, errorHandler).then(addTablePart));
          }
        }
        if (loaders.length) {
          $q.all(loaders).then(function () {
            var table = {};
            for (var i = 0; i < tables.length; i++) {
              deepExtend(table, tables[i]);
            }
            deferred.resolve(table);
          }, function () {
            deferred.reject(options.key);
          });
        } else {
          deferred.resolve({});
        }
        return deferred.promise;
      };
      service.addPart = function (name) {
        if (!isStringValid(name)) {
          throw new TypeError('Couldn\'t add part, first arg has to be a string');
        }
        if (!hasPart(name)) {
          parts[name] = new Part(name);
          $rootScope.$emit('$translatePartialLoaderStructureChanged', name);
        } else if (!parts[name].isActive) {
          parts[name].isActive = true;
          $rootScope.$emit('$translatePartialLoaderStructureChanged', name);
        }
        return service;
      };
      service.deletePart = function (name, removeData) {
        if (!isStringValid(name)) {
          throw new TypeError('Couldn\'t delete part, first arg has to be string');
        }
        if (removeData === undefined) {
          removeData = false;
        } else if (typeof removeData !== 'boolean') {
          throw new TypeError('Invalid type of a second argument, a boolean expected.');
        }
        if (hasPart(name)) {
          var wasActive = parts[name].isActive;
          if (removeData) {
            delete parts[name];
          } else {
            parts[name].isActive = false;
          }
          if (wasActive) {
            $rootScope.$emit('$translatePartialLoaderStructureChanged', name);
          }
        }
        return service;
      };
      service.isPartAvailable = isPartAvailable;
      return service;
    }
  ];
});
/**
 * State-based routing for AngularJS
 * @version v0.2.7
 * @link http://angular-ui.github.com/
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

/* commonjs package manager support (eg componentjs) */
if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
  module.exports = 'ui.router';
}

(function (window, angular, undefined) {
/*jshint globalstrict:true*/
/*global angular:false*/
'use strict';

var isDefined = angular.isDefined,
    isFunction = angular.isFunction,
    isString = angular.isString,
    isObject = angular.isObject,
    isArray = angular.isArray,
    forEach = angular.forEach,
    extend = angular.extend,
    copy = angular.copy;

function inherit(parent, extra) {
  return extend(new (extend(function() {}, { prototype: parent }))(), extra);
}

function merge(dst) {
  forEach(arguments, function(obj) {
    if (obj !== dst) {
      forEach(obj, function(value, key) {
        if (!dst.hasOwnProperty(key)) dst[key] = value;
      });
    }
  });
  return dst;
}

/**
 * Finds the common ancestor path between two states.
 *
 * @param {Object} first The first state.
 * @param {Object} second The second state.
 * @return {Array} Returns an array of state names in descending order, not including the root.
 */
function ancestors(first, second) {
  var path = [];

  for (var n in first.path) {
    if (first.path[n] === "") continue;
    if (!second.path[n]) break;
    path.push(first.path[n]);
  }
  return path;
}

/**
 * IE8-safe wrapper for `Object.keys()`.
 *
 * @param {Object} object A JavaScript object.
 * @return {Array} Returns the keys of the object as an array.
 */
function keys(object) {
  if (Object.keys) {
    return Object.keys(object);
  }
  var result = [];

  angular.forEach(object, function(val, key) {
    result.push(key);
  });
  return result;
}

/**
 * IE8-safe wrapper for `Array.prototype.indexOf()`.
 *
 * @param {Array} array A JavaScript array.
 * @param {*} value A value to search the array for.
 * @return {Number} Returns the array index value of `value`, or `-1` if not present.
 */
function arraySearch(array, value) {
  if (Array.prototype.indexOf) {
    return array.indexOf(value, Number(arguments[2]) || 0);
  }
  var len = array.length >>> 0, from = Number(arguments[2]) || 0;
  from = (from < 0) ? Math.ceil(from) : Math.floor(from);

  if (from < 0) from += len;

  for (; from < len; from++) {
    if (from in array && array[from] === value) return from;
  }
  return -1;
}

/**
 * Merges a set of parameters with all parameters inherited between the common parents of the
 * current state and a given destination state.
 *
 * @param {Object} currentParams The value of the current state parameters ($stateParams).
 * @param {Object} newParams The set of parameters which will be composited with inherited params.
 * @param {Object} $current Internal definition of object representing the current state.
 * @param {Object} $to Internal definition of object representing state to transition to.
 */
function inheritParams(currentParams, newParams, $current, $to) {
  var parents = ancestors($current, $to), parentParams, inherited = {}, inheritList = [];

  for (var i in parents) {
    if (!parents[i].params || !parents[i].params.length) continue;
    parentParams = parents[i].params;

    for (var j in parentParams) {
      if (arraySearch(inheritList, parentParams[j]) >= 0) continue;
      inheritList.push(parentParams[j]);
      inherited[parentParams[j]] = currentParams[parentParams[j]];
    }
  }
  return extend({}, inherited, newParams);
}

/**
 * Normalizes a set of values to string or `null`, filtering them by a list of keys.
 *
 * @param {Array} keys The list of keys to normalize/return.
 * @param {Object} values An object hash of values to normalize.
 * @return {Object} Returns an object hash of normalized string values.
 */
function normalize(keys, values) {
  var normalized = {};

  forEach(keys, function (name) {
    var value = values[name];
    normalized[name] = (value != null) ? String(value) : null;
  });
  return normalized;
}

/**
 * Performs a non-strict comparison of the subset of two objects, defined by a list of keys.
 *
 * @param {Object} a The first object.
 * @param {Object} b The second object.
 * @param {Array} keys The list of keys within each object to compare. If the list is empty or not specified,
 *                     it defaults to the list of keys in `a`.
 * @return {Boolean} Returns `true` if the keys match, otherwise `false`.
 */
function equalForKeys(a, b, keys) {
  if (!keys) {
    keys = [];
    for (var n in a) keys.push(n); // Used instead of Object.keys() for IE8 compatibility
  }

  for (var i=0; i<keys.length; i++) {
    var k = keys[i];
    if (a[k] != b[k]) return false; // Not '===', values aren't necessarily normalized
  }
  return true;
}

/**
 * Returns the subset of an object, based on a list of keys.
 *
 * @param {Array} keys
 * @param {Object} values
 * @return {Boolean} Returns a subset of `values`.
 */
function filterByKeys(keys, values) {
  var filtered = {};

  forEach(keys, function (name) {
    filtered[name] = values[name];
  });
  return filtered;
}

angular.module('ui.router.util', ['ng']);
angular.module('ui.router.router', ['ui.router.util']);
angular.module('ui.router.state', ['ui.router.router', 'ui.router.util']);
angular.module('ui.router', ['ui.router.state']);
angular.module('ui.router.compat', ['ui.router']);


/**
 * Service (`ui-util`). Manages resolution of (acyclic) graphs of promises.
 * @module $resolve
 * @requires $q
 * @requires $injector
 */
$Resolve.$inject = ['$q', '$injector'];
function $Resolve(  $q,    $injector) {
  
  var VISIT_IN_PROGRESS = 1,
      VISIT_DONE = 2,
      NOTHING = {},
      NO_DEPENDENCIES = [],
      NO_LOCALS = NOTHING,
      NO_PARENT = extend($q.when(NOTHING), { $$promises: NOTHING, $$values: NOTHING });
  

  /**
   * Studies a set of invocables that are likely to be used multiple times.
   *      $resolve.study(invocables)(locals, parent, self)
   * is equivalent to
   *      $resolve.resolve(invocables, locals, parent, self)
   * but the former is more efficient (in fact `resolve` just calls `study` internally).
   * See {@link module:$resolve/resolve} for details.
   * @function
   * @param {Object} invocables
   * @return {Function}
   */
  this.study = function (invocables) {
    if (!isObject(invocables)) throw new Error("'invocables' must be an object");
    
    // Perform a topological sort of invocables to build an ordered plan
    var plan = [], cycle = [], visited = {};
    function visit(value, key) {
      if (visited[key] === VISIT_DONE) return;
      
      cycle.push(key);
      if (visited[key] === VISIT_IN_PROGRESS) {
        cycle.splice(0, cycle.indexOf(key));
        throw new Error("Cyclic dependency: " + cycle.join(" -> "));
      }
      visited[key] = VISIT_IN_PROGRESS;
      
      if (isString(value)) {
        plan.push(key, [ function() { return $injector.get(value); }], NO_DEPENDENCIES);
      } else {
        var params = $injector.annotate(value);
        forEach(params, function (param) {
          if (param !== key && invocables.hasOwnProperty(param)) visit(invocables[param], param);
        });
        plan.push(key, value, params);
      }
      
      cycle.pop();
      visited[key] = VISIT_DONE;
    }
    forEach(invocables, visit);
    invocables = cycle = visited = null; // plan is all that's required
    
    function isResolve(value) {
      return isObject(value) && value.then && value.$$promises;
    }
    
    return function (locals, parent, self) {
      if (isResolve(locals) && self === undefined) {
        self = parent; parent = locals; locals = null;
      }
      if (!locals) locals = NO_LOCALS;
      else if (!isObject(locals)) {
        throw new Error("'locals' must be an object");
      }       
      if (!parent) parent = NO_PARENT;
      else if (!isResolve(parent)) {
        throw new Error("'parent' must be a promise returned by $resolve.resolve()");
      }
      
      // To complete the overall resolution, we have to wait for the parent
      // promise and for the promise for each invokable in our plan.
      var resolution = $q.defer(),
          result = resolution.promise,
          promises = result.$$promises = {},
          values = extend({}, locals),
          wait = 1 + plan.length/3,
          merged = false;
          
      function done() {
        // Merge parent values we haven't got yet and publish our own $$values
        if (!--wait) {
          if (!merged) merge(values, parent.$$values); 
          result.$$values = values;
          result.$$promises = true; // keep for isResolve()
          resolution.resolve(values);
        }
      }
      
      function fail(reason) {
        result.$$failure = reason;
        resolution.reject(reason);
      }
      
      // Short-circuit if parent has already failed
      if (isDefined(parent.$$failure)) {
        fail(parent.$$failure);
        return result;
      }
      
      // Merge parent values if the parent has already resolved, or merge
      // parent promises and wait if the parent resolve is still in progress.
      if (parent.$$values) {
        merged = merge(values, parent.$$values);
        done();
      } else {
        extend(promises, parent.$$promises);
        parent.then(done, fail);
      }
      
      // Process each invocable in the plan, but ignore any where a local of the same name exists.
      for (var i=0, ii=plan.length; i<ii; i+=3) {
        if (locals.hasOwnProperty(plan[i])) done();
        else invoke(plan[i], plan[i+1], plan[i+2]);
      }
      
      function invoke(key, invocable, params) {
        // Create a deferred for this invocation. Failures will propagate to the resolution as well.
        var invocation = $q.defer(), waitParams = 0;
        function onfailure(reason) {
          invocation.reject(reason);
          fail(reason);
        }
        // Wait for any parameter that we have a promise for (either from parent or from this
        // resolve; in that case study() will have made sure it's ordered before us in the plan).
        forEach(params, function (dep) {
          if (promises.hasOwnProperty(dep) && !locals.hasOwnProperty(dep)) {
            waitParams++;
            promises[dep].then(function (result) {
              values[dep] = result;
              if (!(--waitParams)) proceed();
            }, onfailure);
          }
        });
        if (!waitParams) proceed();
        function proceed() {
          if (isDefined(result.$$failure)) return;
          try {
            invocation.resolve($injector.invoke(invocable, self, values));
            invocation.promise.then(function (result) {
              values[key] = result;
              done();
            }, onfailure);
          } catch (e) {
            onfailure(e);
          }
        }
        // Publish promise synchronously; invocations further down in the plan may depend on it.
        promises[key] = invocation.promise;
      }
      
      return result;
    };
  };
  
  /**
   * Resolves a set of invocables. An invocable is a function to be invoked via `$injector.invoke()`,
   * and can have an arbitrary number of dependencies. An invocable can either return a value directly,
   * or a `$q` promise. If a promise is returned it will be resolved and the resulting value will be
   * used instead. Dependencies of invocables are resolved (in this order of precedence)
   *
   * - from the specified `locals`
   * - from another invocable that is part of this `$resolve` call
   * - from an invocable that is inherited from a `parent` call to `$resolve` (or recursively
   *   from any ancestor `$resolve` of that parent).
   *
   * The return value of `$resolve` is a promise for an object that contains (in this order of precedence)
   *
   * - any `locals` (if specified)
   * - the resolved return values of all injectables
   * - any values inherited from a `parent` call to `$resolve` (if specified)
   *
   * The promise will resolve after the `parent` promise (if any) and all promises returned by injectables
   * have been resolved. If any invocable (or `$injector.invoke`) throws an exception, or if a promise
   * returned by an invocable is rejected, the `$resolve` promise is immediately rejected with the same error.
   * A rejection of a `parent` promise (if specified) will likewise be propagated immediately. Once the
   * `$resolve` promise has been rejected, no further invocables will be called.
   * 
   * Cyclic dependencies between invocables are not permitted and will caues `$resolve` to throw an
   * error. As a special case, an injectable can depend on a parameter with the same name as the injectable,
   * which will be fulfilled from the `parent` injectable of the same name. This allows inherited values
   * to be decorated. Note that in this case any other injectable in the same `$resolve` with the same
   * dependency would see the decorated value, not the inherited value.
   *
   * Note that missing dependencies -- unlike cyclic dependencies -- will cause an (asynchronous) rejection
   * of the `$resolve` promise rather than a (synchronous) exception.
   *
   * Invocables are invoked eagerly as soon as all dependencies are available. This is true even for
   * dependencies inherited from a `parent` call to `$resolve`.
   *
   * As a special case, an invocable can be a string, in which case it is taken to be a service name
   * to be passed to `$injector.get()`. This is supported primarily for backwards-compatibility with the
   * `resolve` property of `$routeProvider` routes.
   *
   * @function
   * @param {Object.<string, Function|string>} invocables  functions to invoke or `$injector` services to fetch.
   * @param {Object.<string, *>} [locals]  values to make available to the injectables
   * @param {Promise.<Object>} [parent]  a promise returned by another call to `$resolve`.
   * @param {Object} [self]  the `this` for the invoked methods
   * @return {Promise.<Object>}  Promise for an object that contains the resolved return value
   *    of all invocables, as well as any inherited and local values.
   */
  this.resolve = function (invocables, locals, parent, self) {
    return this.study(invocables)(locals, parent, self);
  };
}

angular.module('ui.router.util').service('$resolve', $Resolve);


/**
 * Service. Manages loading of templates.
 * @constructor
 * @name $templateFactory
 * @requires $http
 * @requires $templateCache
 * @requires $injector
 */
$TemplateFactory.$inject = ['$http', '$templateCache', '$injector'];
function $TemplateFactory(  $http,   $templateCache,   $injector) {

  /**
   * Creates a template from a configuration object. 
   * @function
   * @name $templateFactory#fromConfig
   * @methodOf $templateFactory
   * @param {Object} config  Configuration object for which to load a template. The following
   *    properties are search in the specified order, and the first one that is defined is
   *    used to create the template:
   * @param {string|Function} config.template  html string template or function to load via
   *    {@link $templateFactory#fromString fromString}.
   * @param {string|Function} config.templateUrl  url to load or a function returning the url
   *    to load via {@link $templateFactory#fromUrl fromUrl}.
   * @param {Function} config.templateProvider  function to invoke via
   *    {@link $templateFactory#fromProvider fromProvider}.
   * @param {Object} params  Parameters to pass to the template function.
   * @param {Object} [locals] Locals to pass to `invoke` if the template is loaded via a
   *      `templateProvider`. Defaults to `{ params: params }`.
   * @return {string|Promise.<string>}  The template html as a string, or a promise for that string,
   *      or `null` if no template is configured.
   */
  this.fromConfig = function (config, params, locals) {
    return (
      isDefined(config.template) ? this.fromString(config.template, params) :
      isDefined(config.templateUrl) ? this.fromUrl(config.templateUrl, params) :
      isDefined(config.templateProvider) ? this.fromProvider(config.templateProvider, params, locals) :
      null
    );
  };

  /**
   * Creates a template from a string or a function returning a string.
   * @function
   * @name $templateFactory#fromString
   * @methodOf $templateFactory
   * @param {string|Function} template  html template as a string or function that returns an html
   *      template as a string.
   * @param {Object} params  Parameters to pass to the template function.
   * @return {string|Promise.<string>}  The template html as a string, or a promise for that string.
   */
  this.fromString = function (template, params) {
    return isFunction(template) ? template(params) : template;
  };

  /**
   * Loads a template from the a URL via `$http` and `$templateCache`.
   * @function
   * @name $templateFactory#fromUrl
   * @methodOf $templateFactory
   * @param {string|Function} url  url of the template to load, or a function that returns a url.
   * @param {Object} params  Parameters to pass to the url function.
   * @return {string|Promise.<string>}  The template html as a string, or a promise for that string.
   */
  this.fromUrl = function (url, params) {
    if (isFunction(url)) url = url(params);
    if (url == null) return null;
    else return $http
        .get(url, { cache: $templateCache })
        .then(function(response) { return response.data; });
  };

  /**
   * Creates a template by invoking an injectable provider function.
   * @function
   * @name $templateFactory#fromUrl
   * @methodOf $templateFactory
   * @param {Function} provider Function to invoke via `$injector.invoke`
   * @param {Object} params Parameters for the template.
   * @param {Object} [locals] Locals to pass to `invoke`. Defaults to `{ params: params }`.
   * @return {string|Promise.<string>} The template html as a string, or a promise for that string.
   */
  this.fromProvider = function (provider, params, locals) {
    return $injector.invoke(provider, null, locals || { params: params });
  };
}

angular.module('ui.router.util').service('$templateFactory', $TemplateFactory);

/**
 * Matches URLs against patterns and extracts named parameters from the path or the search
 * part of the URL. A URL pattern consists of a path pattern, optionally followed by '?' and a list
 * of search parameters. Multiple search parameter names are separated by '&'. Search parameters
 * do not influence whether or not a URL is matched, but their values are passed through into
 * the matched parameters returned by {@link UrlMatcher#exec exec}.
 * 
 * Path parameter placeholders can be specified using simple colon/catch-all syntax or curly brace
 * syntax, which optionally allows a regular expression for the parameter to be specified:
 *
 * * ':' name - colon placeholder
 * * '*' name - catch-all placeholder
 * * '{' name '}' - curly placeholder
 * * '{' name ':' regexp '}' - curly placeholder with regexp. Should the regexp itself contain
 *   curly braces, they must be in matched pairs or escaped with a backslash.
 *
 * Parameter names may contain only word characters (latin letters, digits, and underscore) and
 * must be unique within the pattern (across both path and search parameters). For colon 
 * placeholders or curly placeholders without an explicit regexp, a path parameter matches any
 * number of characters other than '/'. For catch-all placeholders the path parameter matches
 * any number of characters.
 * 
 * ### Examples
 * 
 * * '/hello/' - Matches only if the path is exactly '/hello/'. There is no special treatment for
 *   trailing slashes, and patterns have to match the entire path, not just a prefix.
 * * '/user/:id' - Matches '/user/bob' or '/user/1234!!!' or even '/user/' but not '/user' or
 *   '/user/bob/details'. The second path segment will be captured as the parameter 'id'.
 * * '/user/{id}' - Same as the previous example, but using curly brace syntax.
 * * '/user/{id:[^/]*}' - Same as the previous example.
 * * '/user/{id:[0-9a-fA-F]{1,8}}' - Similar to the previous example, but only matches if the id
 *   parameter consists of 1 to 8 hex digits.
 * * '/files/{path:.*}' - Matches any URL starting with '/files/' and captures the rest of the
 *   path into the parameter 'path'.
 * * '/files/*path' - ditto.
 *
 * @constructor
 * @param {string} pattern  the pattern to compile into a matcher.
 *
 * @property {string} prefix  A static prefix of this pattern. The matcher guarantees that any
 *   URL matching this matcher (i.e. any string for which {@link UrlMatcher#exec exec()} returns
 *   non-null) will start with this prefix.
 */
function UrlMatcher(pattern) {

  // Find all placeholders and create a compiled pattern, using either classic or curly syntax:
  //   '*' name
  //   ':' name
  //   '{' name '}'
  //   '{' name ':' regexp '}'
  // The regular expression is somewhat complicated due to the need to allow curly braces
  // inside the regular expression. The placeholder regexp breaks down as follows:
  //    ([:*])(\w+)               classic placeholder ($1 / $2)
  //    \{(\w+)(?:\:( ... ))?\}   curly brace placeholder ($3) with optional regexp ... ($4)
  //    (?: ... | ... | ... )+    the regexp consists of any number of atoms, an atom being either
  //    [^{}\\]+                  - anything other than curly braces or backslash
  //    \\.                       - a backslash escape
  //    \{(?:[^{}\\]+|\\.)*\}     - a matched set of curly braces containing other atoms
  var placeholder = /([:*])(\w+)|\{(\w+)(?:\:((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g,
      names = {}, compiled = '^', last = 0, m,
      segments = this.segments = [],
      params = this.params = [];

  function addParameter(id) {
    if (!/^\w+(-+\w+)*$/.test(id)) throw new Error("Invalid parameter name '" + id + "' in pattern '" + pattern + "'");
    if (names[id]) throw new Error("Duplicate parameter name '" + id + "' in pattern '" + pattern + "'");
    names[id] = true;
    params.push(id);
  }

  function quoteRegExp(string) {
    return string.replace(/[\\\[\]\^$*+?.()|{}]/g, "\\$&");
  }

  this.source = pattern;

  // Split into static segments separated by path parameter placeholders.
  // The number of segments is always 1 more than the number of parameters.
  var id, regexp, segment;
  while ((m = placeholder.exec(pattern))) {
    id = m[2] || m[3]; // IE[78] returns '' for unmatched groups instead of null
    regexp = m[4] || (m[1] == '*' ? '.*' : '[^/]*');
    segment = pattern.substring(last, m.index);
    if (segment.indexOf('?') >= 0) break; // we're into the search part
    compiled += quoteRegExp(segment) + '(' + regexp + ')';
    addParameter(id);
    segments.push(segment);
    last = placeholder.lastIndex;
  }
  segment = pattern.substring(last);

  // Find any search parameter names and remove them from the last segment
  var i = segment.indexOf('?');
  if (i >= 0) {
    var search = this.sourceSearch = segment.substring(i);
    segment = segment.substring(0, i);
    this.sourcePath = pattern.substring(0, last+i);

    // Allow parameters to be separated by '?' as well as '&' to make concat() easier
    forEach(search.substring(1).split(/[&?]/), addParameter);
  } else {
    this.sourcePath = pattern;
    this.sourceSearch = '';
  }

  compiled += quoteRegExp(segment) + '$';
  segments.push(segment);
  this.regexp = new RegExp(compiled);
  this.prefix = segments[0];
}

/**
 * Returns a new matcher for a pattern constructed by appending the path part and adding the
 * search parameters of the specified pattern to this pattern. The current pattern is not
 * modified. This can be understood as creating a pattern for URLs that are relative to (or
 * suffixes of) the current pattern.
 *
 * ### Example
 * The following two matchers are equivalent:
 * ```
 * new UrlMatcher('/user/{id}?q').concat('/details?date');
 * new UrlMatcher('/user/{id}/details?q&date');
 * ```
 *
 * @param {string} pattern  The pattern to append.
 * @return {UrlMatcher}  A matcher for the concatenated pattern.
 */
UrlMatcher.prototype.concat = function (pattern) {
  // Because order of search parameters is irrelevant, we can add our own search
  // parameters to the end of the new pattern. Parse the new pattern by itself
  // and then join the bits together, but it's much easier to do this on a string level.
  return new UrlMatcher(this.sourcePath + pattern + this.sourceSearch);
};

UrlMatcher.prototype.toString = function () {
  return this.source;
};

/**
 * Tests the specified path against this matcher, and returns an object containing the captured
 * parameter values, or null if the path does not match. The returned object contains the values
 * of any search parameters that are mentioned in the pattern, but their value may be null if
 * they are not present in `searchParams`. This means that search parameters are always treated
 * as optional.
 *
 * ### Example
 * ```
 * new UrlMatcher('/user/{id}?q&r').exec('/user/bob', { x:'1', q:'hello' });
 * // returns { id:'bob', q:'hello', r:null }
 * ```
 *
 * @param {string} path  The URL path to match, e.g. `$location.path()`.
 * @param {Object} searchParams  URL search parameters, e.g. `$location.search()`.
 * @return {Object}  The captured parameter values.
 */
UrlMatcher.prototype.exec = function (path, searchParams) {
  var m = this.regexp.exec(path);
  if (!m) return null;

  var params = this.params, nTotal = params.length,
    nPath = this.segments.length-1,
    values = {}, i;

  if (nPath !== m.length - 1) throw new Error("Unbalanced capture group in route '" + this.source + "'");

  for (i=0; i<nPath; i++) values[params[i]] = m[i+1];
  for (/**/; i<nTotal; i++) values[params[i]] = searchParams[params[i]];

  return values;
};

/**
 * Returns the names of all path and search parameters of this pattern in an unspecified order.
 * @return {Array.<string>}  An array of parameter names. Must be treated as read-only. If the
 *    pattern has no parameters, an empty array is returned.
 */
UrlMatcher.prototype.parameters = function () {
  return this.params;
};

/**
 * Creates a URL that matches this pattern by substituting the specified values
 * for the path and search parameters. Null values for path parameters are
 * treated as empty strings.
 *
 * ### Example
 * ```
 * new UrlMatcher('/user/{id}?q').format({ id:'bob', q:'yes' });
 * // returns '/user/bob?q=yes'
 * ```
 *
 * @param {Object} values  the values to substitute for the parameters in this pattern.
 * @return {string}  the formatted URL (path and optionally search part).
 */
UrlMatcher.prototype.format = function (values) {
  var segments = this.segments, params = this.params;
  if (!values) return segments.join('');

  var nPath = segments.length-1, nTotal = params.length,
    result = segments[0], i, search, value;

  for (i=0; i<nPath; i++) {
    value = values[params[i]];
    // TODO: Maybe we should throw on null here? It's not really good style to use '' and null interchangeabley
    if (value != null) result += encodeURIComponent(value);
    result += segments[i+1];
  }
  for (/**/; i<nTotal; i++) {
    value = values[params[i]];
    if (value != null) {
      result += (search ? '&' : '?') + params[i] + '=' + encodeURIComponent(value);
      search = true;
    }
  }

  return result;
};

/**
 * Service. Factory for {@link UrlMatcher} instances. The factory is also available to providers
 * under the name `$urlMatcherFactoryProvider`.
 * @constructor
 * @name $urlMatcherFactory
 */
function $UrlMatcherFactory() {
  /**
   * Creates a {@link UrlMatcher} for the specified pattern.
   * @function
   * @name $urlMatcherFactory#compile
   * @methodOf $urlMatcherFactory
   * @param {string} pattern  The URL pattern.
   * @return {UrlMatcher}  The UrlMatcher.
   */
  this.compile = function (pattern) {
    return new UrlMatcher(pattern);
  };

  /**
   * Returns true if the specified object is a UrlMatcher, or false otherwise.
   * @function
   * @name $urlMatcherFactory#isMatcher
   * @methodOf $urlMatcherFactory
   * @param {Object} o
   * @return {boolean}
   */
  this.isMatcher = function (o) {
    return isObject(o) && isFunction(o.exec) && isFunction(o.format) && isFunction(o.concat);
  };

  this.$get = function () {
    return this;
  };
}

// Register as a provider so it's available to other providers
angular.module('ui.router.util').provider('$urlMatcherFactory', $UrlMatcherFactory);


$UrlRouterProvider.$inject = ['$urlMatcherFactoryProvider'];
function $UrlRouterProvider(  $urlMatcherFactory) {
  var rules = [], 
      otherwise = null;

  // Returns a string that is a prefix of all strings matching the RegExp
  function regExpPrefix(re) {
    var prefix = /^\^((?:\\[^a-zA-Z0-9]|[^\\\[\]\^$*+?.()|{}]+)*)/.exec(re.source);
    return (prefix != null) ? prefix[1].replace(/\\(.)/g, "$1") : '';
  }

  // Interpolates matched values into a String.replace()-style pattern
  function interpolate(pattern, match) {
    return pattern.replace(/\$(\$|\d{1,2})/, function (m, what) {
      return match[what === '$' ? 0 : Number(what)];
    });
  }

  this.rule =
    function (rule) {
      if (!isFunction(rule)) throw new Error("'rule' must be a function");
      rules.push(rule);
      return this;
    };

  this.otherwise =
    function (rule) {
      if (isString(rule)) {
        var redirect = rule;
        rule = function () { return redirect; };
      }
      else if (!isFunction(rule)) throw new Error("'rule' must be a function");
      otherwise = rule;
      return this;
    };


  function handleIfMatch($injector, handler, match) {
    if (!match) return false;
    var result = $injector.invoke(handler, handler, { $match: match });
    return isDefined(result) ? result : true;
  }

  this.when =
    function (what, handler) {
      var redirect, handlerIsString = isString(handler);
      if (isString(what)) what = $urlMatcherFactory.compile(what);

      if (!handlerIsString && !isFunction(handler) && !isArray(handler))
        throw new Error("invalid 'handler' in when()");

      var strategies = {
        matcher: function (what, handler) {
          if (handlerIsString) {
            redirect = $urlMatcherFactory.compile(handler);
            handler = ['$match', function ($match) { return redirect.format($match); }];
          }
          return extend(function ($injector, $location) {
            return handleIfMatch($injector, handler, what.exec($location.path(), $location.search()));
          }, {
            prefix: isString(what.prefix) ? what.prefix : ''
          });
        },
        regex: function (what, handler) {
          if (what.global || what.sticky) throw new Error("when() RegExp must not be global or sticky");

          if (handlerIsString) {
            redirect = handler;
            handler = ['$match', function ($match) { return interpolate(redirect, $match); }];
          }
          return extend(function ($injector, $location) {
            return handleIfMatch($injector, handler, what.exec($location.path()));
          }, {
            prefix: regExpPrefix(what)
          });
        }
      };

      var check = { matcher: $urlMatcherFactory.isMatcher(what), regex: what instanceof RegExp };

      for (var n in check) {
        if (check[n]) {
          return this.rule(strategies[n](what, handler));
        }
      }

      throw new Error("invalid 'what' in when()");
    };

  this.$get =
    [        '$location', '$rootScope', '$injector',
    function ($location,   $rootScope,   $injector) {
      // TODO: Optimize groups of rules with non-empty prefix into some sort of decision tree
      function update(evt) {
        if (evt && evt.defaultPrevented) return;
        function check(rule) {
          var handled = rule($injector, $location);
          if (handled) {
            if (isString(handled)) $location.replace().url(handled);
            return true;
          }
          return false;
        }
        var n=rules.length, i;
        for (i=0; i<n; i++) {
          if (check(rules[i])) return;
        }
        // always check otherwise last to allow dynamic updates to the set of rules
        if (otherwise) check(otherwise);
      }

      $rootScope.$on('$locationChangeSuccess', update);

      return {
        sync: function () {
          update();
        }
      };
    }];
}

angular.module('ui.router.router').provider('$urlRouter', $UrlRouterProvider);

$StateProvider.$inject = ['$urlRouterProvider', '$urlMatcherFactoryProvider', '$locationProvider'];
function $StateProvider(   $urlRouterProvider,   $urlMatcherFactory,           $locationProvider) {

  var root, states = {}, $state, queue = {}, abstractKey = 'abstract';

  // Builds state properties from definition passed to registerState()
  var stateBuilder = {

    // Derive parent state from a hierarchical name only if 'parent' is not explicitly defined.
    // state.children = [];
    // if (parent) parent.children.push(state);
    parent: function(state) {
      if (isDefined(state.parent) && state.parent) return findState(state.parent);
      // regex matches any valid composite state name
      // would match "contact.list" but not "contacts"
      var compositeName = /^(.+)\.[^.]+$/.exec(state.name);
      return compositeName ? findState(compositeName[1]) : root;
    },

    // inherit 'data' from parent and override by own values (if any)
    data: function(state) {
      if (state.parent && state.parent.data) {
        state.data = state.self.data = extend({}, state.parent.data, state.data);
      }
      return state.data;
    },

    // Build a URLMatcher if necessary, either via a relative or absolute URL
    url: function(state) {
      var url = state.url;

      if (isString(url)) {
        if (url.charAt(0) == '^') {
          return $urlMatcherFactory.compile(url.substring(1));
        }
        return (state.parent.navigable || root).url.concat(url);
      }

      if ($urlMatcherFactory.isMatcher(url) || url == null) {
        return url;
      }
      throw new Error("Invalid url '" + url + "' in state '" + state + "'");
    },

    // Keep track of the closest ancestor state that has a URL (i.e. is navigable)
    navigable: function(state) {
      return state.url ? state : (state.parent ? state.parent.navigable : null);
    },

    // Derive parameters for this state and ensure they're a super-set of parent's parameters
    params: function(state) {
      if (!state.params) {
        return state.url ? state.url.parameters() : state.parent.params;
      }
      if (!isArray(state.params)) throw new Error("Invalid params in state '" + state + "'");
      if (state.url) throw new Error("Both params and url specicified in state '" + state + "'");
      return state.params;
    },

    // If there is no explicit multi-view configuration, make one up so we don't have
    // to handle both cases in the view directive later. Note that having an explicit
    // 'views' property will mean the default unnamed view properties are ignored. This
    // is also a good time to resolve view names to absolute names, so everything is a
    // straight lookup at link time.
    views: function(state) {
      var views = {};

      forEach(isDefined(state.views) ? state.views : { '': state }, function (view, name) {
        if (name.indexOf('@') < 0) name += '@' + state.parent.name;
        views[name] = view;
      });
      return views;
    },

    ownParams: function(state) {
      if (!state.parent) {
        return state.params;
      }
      var paramNames = {}; forEach(state.params, function (p) { paramNames[p] = true; });

      forEach(state.parent.params, function (p) {
        if (!paramNames[p]) {
          throw new Error("Missing required parameter '" + p + "' in state '" + state.name + "'");
        }
        paramNames[p] = false;
      });
      var ownParams = [];

      forEach(paramNames, function (own, p) {
        if (own) ownParams.push(p);
      });
      return ownParams;
    },

    // Keep a full path from the root down to this state as this is needed for state activation.
    path: function(state) {
      return state.parent ? state.parent.path.concat(state) : []; // exclude root from path
    },

    // Speed up $state.contains() as it's used a lot
    includes: function(state) {
      var includes = state.parent ? extend({}, state.parent.includes) : {};
      includes[state.name] = true;
      return includes;
    },

    $delegates: {}
  };

  function isRelative(stateName) {
    return stateName.indexOf(".") === 0 || stateName.indexOf("^") === 0;
  }

  function findState(stateOrName, base) {
    var isStr = isString(stateOrName),
        name  = isStr ? stateOrName : stateOrName.name,
        path  = isRelative(name);

    if (path) {
      if (!base) throw new Error("No reference point given for path '"  + name + "'");
      var rel = name.split("."), i = 0, pathLength = rel.length, current = base;

      for (; i < pathLength; i++) {
        if (rel[i] === "" && i === 0) {
          current = base;
          continue;
        }
        if (rel[i] === "^") {
          if (!current.parent) throw new Error("Path '" + name + "' not valid for state '" + base.name + "'");
          current = current.parent;
          continue;
        }
        break;
      }
      rel = rel.slice(i).join(".");
      name = current.name + (current.name && rel ? "." : "") + rel;
    }
    var state = states[name];

    if (state && (isStr || (!isStr && (state === stateOrName || state.self === stateOrName)))) {
      return state;
    }
    return undefined;
  }

  function queueState(parentName, state) {
    if (!queue[parentName]) {
      queue[parentName] = [];
    }
    queue[parentName].push(state);
  }

  function registerState(state) {
    // Wrap a new object around the state so we can store our private details easily.
    state = inherit(state, {
      self: state,
      resolve: state.resolve || {},
      toString: function() { return this.name; }
    });

    var name = state.name;
    if (!isString(name) || name.indexOf('@') >= 0) throw new Error("State must have a valid name");
    if (states.hasOwnProperty(name)) throw new Error("State '" + name + "'' is already defined");

    // Get parent name
    var parentName = (name.indexOf('.') !== -1) ? name.substring(0, name.lastIndexOf('.'))
        : (isString(state.parent)) ? state.parent
        : '';

    // If parent is not registered yet, add state to queue and register later
    if (parentName && !states[parentName]) {
      return queueState(parentName, state.self);
    }

    for (var key in stateBuilder) {
      if (isFunction(stateBuilder[key])) state[key] = stateBuilder[key](state, stateBuilder.$delegates[key]);
    }
    states[name] = state;

    // Register the state in the global state list and with $urlRouter if necessary.
    if (!state[abstractKey] && state.url) {
      $urlRouterProvider.when(state.url, ['$match', '$stateParams', function ($match, $stateParams) {
        if ($state.$current.navigable != state || !equalForKeys($match, $stateParams)) {
          $state.transitionTo(state, $match, { location: false });
        }
      }]);
    }

    // Register any queued children
    if (queue[name]) {
      for (var i = 0; i < queue[name].length; i++) {
        registerState(queue[name][i]);
      }
    }

    return state;
  }


  // Implicit root state that is always active
  root = registerState({
    name: '',
    url: '^',
    views: null,
    'abstract': true
  });
  root.navigable = null;


  // .decorator()
  // .decorator(name)
  // .decorator(name, function)
  this.decorator = decorator;
  function decorator(name, func) {
    /*jshint validthis: true */
    if (isString(name) && !isDefined(func)) {
      return stateBuilder[name];
    }
    if (!isFunction(func) || !isString(name)) {
      return this;
    }
    if (stateBuilder[name] && !stateBuilder.$delegates[name]) {
      stateBuilder.$delegates[name] = stateBuilder[name];
    }
    stateBuilder[name] = func;
    return this;
  }

  // .state(state)
  // .state(name, state)
  this.state = state;
  function state(name, definition) {
    /*jshint validthis: true */
    if (isObject(name)) definition = name;
    else definition.name = name;
    registerState(definition);
    return this;
  }

  // $urlRouter is injected just to ensure it gets instantiated
  this.$get = $get;
  $get.$inject = ['$rootScope', '$q', '$view', '$injector', '$resolve', '$stateParams', '$location', '$urlRouter'];
  function $get(   $rootScope,   $q,   $view,   $injector,   $resolve,   $stateParams,   $location,   $urlRouter) {

    var TransitionSuperseded = $q.reject(new Error('transition superseded'));
    var TransitionPrevented = $q.reject(new Error('transition prevented'));
    var TransitionAborted = $q.reject(new Error('transition aborted'));
    var TransitionFailed = $q.reject(new Error('transition failed'));
    var currentLocation = $location.url();

    function syncUrl() {
      if ($location.url() !== currentLocation) {
        $location.url(currentLocation);
        $location.replace();
      }
    }

    root.locals = { resolve: null, globals: { $stateParams: {} } };
    $state = {
      params: {},
      current: root.self,
      $current: root,
      transition: null
    };

    $state.reload = function reload() {
      $state.transitionTo($state.current, $stateParams, { reload: true, inherit: false, notify: false });
    };

    $state.go = function go(to, params, options) {
      return this.transitionTo(to, params, extend({ inherit: true, relative: $state.$current }, options));
    };

    $state.transitionTo = function transitionTo(to, toParams, options) {
      toParams = toParams || {};
      options = extend({
        location: true, inherit: false, relative: null, notify: true, reload: false, $retry: false
      }, options || {});

      var from = $state.$current, fromParams = $state.params, fromPath = from.path;
      var evt, toState = findState(to, options.relative);

      if (!isDefined(toState)) {
        // Broadcast not found event and abort the transition if prevented
        var redirect = { to: to, toParams: toParams, options: options };
        evt = $rootScope.$broadcast('$stateNotFound', redirect, from.self, fromParams);
        if (evt.defaultPrevented) {
          syncUrl();
          return TransitionAborted;
        }

        // Allow the handler to return a promise to defer state lookup retry
        if (evt.retry) {
          if (options.$retry) {
            syncUrl();
            return TransitionFailed;
          }
          var retryTransition = $state.transition = $q.when(evt.retry);
          retryTransition.then(function() {
            if (retryTransition !== $state.transition) return TransitionSuperseded;
            redirect.options.$retry = true;
            return $state.transitionTo(redirect.to, redirect.toParams, redirect.options);
          }, function() {
            return TransitionAborted;
          });
          syncUrl();
          return retryTransition;
        }

        // Always retry once if the $stateNotFound was not prevented
        // (handles either redirect changed or state lazy-definition)
        to = redirect.to;
        toParams = redirect.toParams;
        options = redirect.options;
        toState = findState(to, options.relative);
        if (!isDefined(toState)) {
          if (options.relative) throw new Error("Could not resolve '" + to + "' from state '" + options.relative + "'");
          throw new Error("No such state '" + to + "'");
        }
      }
      if (toState[abstractKey]) throw new Error("Cannot transition to abstract state '" + to + "'");
      if (options.inherit) toParams = inheritParams($stateParams, toParams || {}, $state.$current, toState);
      to = toState;

      var toPath = to.path;

      // Starting from the root of the path, keep all levels that haven't changed
      var keep, state, locals = root.locals, toLocals = [];
      for (keep = 0, state = toPath[keep];
           state && state === fromPath[keep] && equalForKeys(toParams, fromParams, state.ownParams) && !options.reload;
           keep++, state = toPath[keep]) {
        locals = toLocals[keep] = state.locals;
      }

      // If we're going to the same state and all locals are kept, we've got nothing to do.
      // But clear 'transition', as we still want to cancel any other pending transitions.
      // TODO: We may not want to bump 'transition' if we're called from a location change that we've initiated ourselves,
      // because we might accidentally abort a legitimate transition initiated from code?
      if (shouldTriggerReload(to, from, locals, options) ) {
        if ( to.self.reloadOnSearch !== false )
          syncUrl();
        $state.transition = null;
        return $q.when($state.current);
      }

      // Normalize/filter parameters before we pass them to event handlers etc.
      toParams = normalize(to.params, toParams || {});

      // Broadcast start event and cancel the transition if requested
      if (options.notify) {
        evt = $rootScope.$broadcast('$stateChangeStart', to.self, toParams, from.self, fromParams);
        if (evt.defaultPrevented) {
          syncUrl();
          return TransitionPrevented;
        }
      }

      // Resolve locals for the remaining states, but don't update any global state just
      // yet -- if anything fails to resolve the current state needs to remain untouched.
      // We also set up an inheritance chain for the locals here. This allows the view directive
      // to quickly look up the correct definition for each view in the current state. Even
      // though we create the locals object itself outside resolveState(), it is initially
      // empty and gets filled asynchronously. We need to keep track of the promise for the
      // (fully resolved) current locals, and pass this down the chain.
      var resolved = $q.when(locals);
      for (var l=keep; l<toPath.length; l++, state=toPath[l]) {
        locals = toLocals[l] = inherit(locals);
        resolved = resolveState(state, toParams, state===to, resolved, locals);
      }

      // Once everything is resolved, we are ready to perform the actual transition
      // and return a promise for the new state. We also keep track of what the
      // current promise is, so that we can detect overlapping transitions and
      // keep only the outcome of the last transition.
      var transition = $state.transition = resolved.then(function () {
        var l, entering, exiting;

        if ($state.transition !== transition) return TransitionSuperseded;

        // Exit 'from' states not kept
        for (l=fromPath.length-1; l>=keep; l--) {
          exiting = fromPath[l];
          if (exiting.self.onExit) {
            $injector.invoke(exiting.self.onExit, exiting.self, exiting.locals.globals);
          }
          exiting.locals = null;
        }

        // Enter 'to' states not kept
        for (l=keep; l<toPath.length; l++) {
          entering = toPath[l];
          entering.locals = toLocals[l];
          if (entering.self.onEnter) {
            $injector.invoke(entering.self.onEnter, entering.self, entering.locals.globals);
          }
        }

        // Run it again, to catch any transitions in callbacks
        if ($state.transition !== transition) return TransitionSuperseded;

        // Update globals in $state
        $state.$current = to;
        $state.current = to.self;
        $state.params = toParams;
        copy($state.params, $stateParams);
        $state.transition = null;

        // Update $location
        var toNav = to.navigable;
        if (options.location && toNav) {
          $location.url(toNav.url.format(toNav.locals.globals.$stateParams));

          if (options.location === 'replace') {
            $location.replace();
          }
        }

        if (options.notify) {
          $rootScope.$broadcast('$stateChangeSuccess', to.self, toParams, from.self, fromParams);
        }
        currentLocation = $location.url();

        return $state.current;
      }, function (error) {
        if ($state.transition !== transition) return TransitionSuperseded;

        $state.transition = null;
        $rootScope.$broadcast('$stateChangeError', to.self, toParams, from.self, fromParams, error);
        syncUrl();

        return $q.reject(error);
      });

      return transition;
    };

    $state.is = function is(stateOrName, params) {
      var state = findState(stateOrName);

      if (!isDefined(state)) {
        return undefined;
      }

      if ($state.$current !== state) {
        return false;
      }

      return isDefined(params) ? angular.equals($stateParams, params) : true;
    };

    $state.includes = function includes(stateOrName, params) {
      var state = findState(stateOrName);
      if (!isDefined(state)) {
        return undefined;
      }

      if (!isDefined($state.$current.includes[state.name])) {
        return false;
      }

      var validParams = true;
      angular.forEach(params, function(value, key) {
        if (!isDefined($stateParams[key]) || $stateParams[key] !== value) {
          validParams = false;
        }
      });
      return validParams;
    };

    $state.href = function href(stateOrName, params, options) {
      options = extend({ lossy: true, inherit: false, absolute: false, relative: $state.$current }, options || {});
      var state = findState(stateOrName, options.relative);
      if (!isDefined(state)) return null;

      params = inheritParams($stateParams, params || {}, $state.$current, state);
      var nav = (state && options.lossy) ? state.navigable : state;
      var url = (nav && nav.url) ? nav.url.format(normalize(state.params, params || {})) : null;
      if (!$locationProvider.html5Mode() && url) {
        url = "#" + $locationProvider.hashPrefix() + url;
      }
      if (options.absolute && url) {
        url = $location.protocol() + '://' + 
              $location.host() + 
              ($location.port() == 80 || $location.port() == 443 ? '' : ':' + $location.port()) + 
              (!$locationProvider.html5Mode() && url ? '/' : '') + 
              url;
      }
      return url;
    };

    $state.get = function (stateOrName, context) {
      if (!isDefined(stateOrName)) {
        var list = [];
        forEach(states, function(state) { list.push(state.self); });
        return list;
      }
      var state = findState(stateOrName, context);
      return (state && state.self) ? state.self : null;
    };

    function resolveState(state, params, paramsAreFiltered, inherited, dst) {
      // Make a restricted $stateParams with only the parameters that apply to this state if
      // necessary. In addition to being available to the controller and onEnter/onExit callbacks,
      // we also need $stateParams to be available for any $injector calls we make during the
      // dependency resolution process.
      var $stateParams = (paramsAreFiltered) ? params : filterByKeys(state.params, params);
      var locals = { $stateParams: $stateParams };

      // Resolve 'global' dependencies for the state, i.e. those not specific to a view.
      // We're also including $stateParams in this; that way the parameters are restricted
      // to the set that should be visible to the state, and are independent of when we update
      // the global $state and $stateParams values.
      dst.resolve = $resolve.resolve(state.resolve, locals, dst.resolve, state);
      var promises = [ dst.resolve.then(function (globals) {
        dst.globals = globals;
      }) ];
      if (inherited) promises.push(inherited);

      // Resolve template and dependencies for all views.
      forEach(state.views, function (view, name) {
        var injectables = (view.resolve && view.resolve !== state.resolve ? view.resolve : {});
        injectables.$template = [ function () {
          return $view.load(name, { view: view, locals: locals, params: $stateParams, notify: false }) || '';
        }];

        promises.push($resolve.resolve(injectables, locals, dst.resolve, state).then(function (result) {
          // References to the controller (only instantiated at link time)
          if (isFunction(view.controllerProvider) || isArray(view.controllerProvider)) {
            var injectLocals = angular.extend({}, injectables, locals);
            result.$$controller = $injector.invoke(view.controllerProvider, null, injectLocals);
          } else {
            result.$$controller = view.controller;
          }
          // Provide access to the state itself for internal use
          result.$$state = state;
          dst[name] = result;
        }));
      });

      // Wait for all the promises and then return the activation object
      return $q.all(promises).then(function (values) {
        return dst;
      });
    }

    return $state;
  }

  function shouldTriggerReload(to, from, locals, options) {
    if ( to === from && ((locals === from.locals && !options.reload) || (to.self.reloadOnSearch === false)) ) {
      return true;
    }
  }
}

angular.module('ui.router.state')
  .value('$stateParams', {})
  .provider('$state', $StateProvider);


$ViewProvider.$inject = [];
function $ViewProvider() {

  this.$get = $get;
  $get.$inject = ['$rootScope', '$templateFactory'];
  function $get(   $rootScope,   $templateFactory) {
    return {
      // $view.load('full.viewName', { template: ..., controller: ..., resolve: ..., async: false, params: ... })
      load: function load(name, options) {
        var result, defaults = {
          template: null, controller: null, view: null, locals: null, notify: true, async: true, params: {}
        };
        options = extend(defaults, options);

        if (options.view) {
          result = $templateFactory.fromConfig(options.view, options.params, options.locals);
        }
        if (result && options.notify) {
          $rootScope.$broadcast('$viewContentLoading', options);
        }
        return result;
      }
    };
  }
}

angular.module('ui.router.state').provider('$view', $ViewProvider);


$ViewDirective.$inject = ['$state', '$compile', '$controller', '$injector', '$anchorScroll'];
function $ViewDirective(   $state,   $compile,   $controller,   $injector,   $anchorScroll) {
  var $animator = $injector.has('$animator') ? $injector.get('$animator') : false;
  var viewIsUpdating = false;

  var directive = {
    restrict: 'ECA',
    terminal: true,
    priority: 1000,
    transclude: true,
    compile: function (element, attr, transclude) {
      return function(scope, element, attr) {
        var viewScope, viewLocals,
            name = attr[directive.name] || attr.name || '',
            onloadExp = attr.onload || '',
            animate = $animator && $animator(scope, attr),
            initialView = transclude(scope);

        // Returns a set of DOM manipulation functions based on whether animation
        // should be performed
        var renderer = function(doAnimate) {
          return ({
            "true": {
              remove: function(element) { animate.leave(element.contents(), element); },
              restore: function(compiled, element) { animate.enter(compiled, element); },
              populate: function(template, element) {
                var contents = angular.element('<div></div>').html(template).contents();
                animate.enter(contents, element);
                return contents;
              }
            },
            "false": {
              remove: function(element) { element.html(''); },
              restore: function(compiled, element) { element.append(compiled); },
              populate: function(template, element) {
                element.html(template);
                return element.contents();
              }
            }
          })[doAnimate.toString()];
        };

        // Put back the compiled initial view
        element.append(initialView);

        // Find the details of the parent view directive (if any) and use it
        // to derive our own qualified view name, then hang our own details
        // off the DOM so child directives can find it.
        var parent = element.parent().inheritedData('$uiView');
        if (name.indexOf('@') < 0) name  = name + '@' + (parent ? parent.state.name : '');
        var view = { name: name, state: null };
        element.data('$uiView', view);

        var eventHook = function() {
          if (viewIsUpdating) return;
          viewIsUpdating = true;

          try { updateView(true); } catch (e) {
            viewIsUpdating = false;
            throw e;
          }
          viewIsUpdating = false;
        };

        scope.$on('$stateChangeSuccess', eventHook);
        scope.$on('$viewContentLoading', eventHook);
        updateView(false);

        function updateView(doAnimate) {
          var locals = $state.$current && $state.$current.locals[name];
          if (locals === viewLocals) return; // nothing to do
          var render = renderer(animate && doAnimate);

          // Remove existing content
          render.remove(element);

          // Destroy previous view scope
          if (viewScope) {
            viewScope.$destroy();
            viewScope = null;
          }

          if (!locals) {
            viewLocals = null;
            view.state = null;

            // Restore the initial view
            return render.restore(initialView, element);
          }

          viewLocals = locals;
          view.state = locals.$$state;

          var link = $compile(render.populate(locals.$template, element));
          viewScope = scope.$new();

          if (locals.$$controller) {
            locals.$scope = viewScope;
            var controller = $controller(locals.$$controller, locals);
            element.children().data('$ngControllerController', controller);
          }
          link(viewScope);
          viewScope.$emit('$viewContentLoaded');
          if (onloadExp) viewScope.$eval(onloadExp);

          // TODO: This seems strange, shouldn't $anchorScroll listen for $viewContentLoaded if necessary?
          // $anchorScroll might listen on event...
          $anchorScroll();
        }
      };
    }
  };
  return directive;
}

angular.module('ui.router.state').directive('uiView', $ViewDirective);

function parseStateRef(ref) {
  var parsed = ref.replace(/\n/g, " ").match(/^([^(]+?)\s*(\((.*)\))?$/);
  if (!parsed || parsed.length !== 4) throw new Error("Invalid state ref '" + ref + "'");
  return { state: parsed[1], paramExpr: parsed[3] || null };
}

function stateContext(el) {
  var stateData = el.parent().inheritedData('$uiView');

  if (stateData && stateData.state && stateData.state.name) {
    return stateData.state;
  }
}

$StateRefDirective.$inject = ['$state', '$timeout'];
function $StateRefDirective($state, $timeout) {
  return {
    restrict: 'A',
    require: '?^uiSrefActive',
    link: function(scope, element, attrs, uiSrefActive) {
      var ref = parseStateRef(attrs.uiSref);
      var params = null, url = null, base = stateContext(element) || $state.$current;
      var isForm = element[0].nodeName === "FORM";
      var attr = isForm ? "action" : "href", nav = true;

      var update = function(newVal) {
        if (newVal) params = newVal;
        if (!nav) return;

        var newHref = $state.href(ref.state, params, { relative: base });

        if (!newHref) {
          nav = false;
          return false;
        }
        element[0][attr] = newHref;
        if (uiSrefActive) {
          uiSrefActive.$$setStateInfo(ref.state, params);
        }
      };

      if (ref.paramExpr) {
        scope.$watch(ref.paramExpr, function(newVal, oldVal) {
          if (newVal !== params) update(newVal);
        }, true);
        params = scope.$eval(ref.paramExpr);
      }
      update();

      if (isForm) return;

      element.bind("click", function(e) {
        var button = e.which || e.button;

        if ((button === 0 || button == 1) && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
          // HACK: This is to allow ng-clicks to be processed before the transition is initiated:
          $timeout(function() {
            scope.$apply(function() {
              $state.go(ref.state, params, { relative: base });
            });
          });
          e.preventDefault();
        }
      });
    }
  };
}

$StateActiveDirective.$inject = ['$state', '$stateParams', '$interpolate'];
function $StateActiveDirective($state, $stateParams, $interpolate) {
  return {
    restrict: "A",
    controller: function($scope, $element, $attrs) {
      var state, params, activeClass;

      // There probably isn't much point in $observing this
      activeClass = $interpolate($attrs.uiSrefActive || '', false)($scope);

      // Allow uiSref to communicate with uiSrefActive
      this.$$setStateInfo = function(newState, newParams) {
        state = $state.get(newState, stateContext($element));
        params = newParams;
        update();
      };

      $scope.$on('$stateChangeSuccess', update);

      // Update route state
      function update() {
        if ($state.$current.self === state && matchesParams()) {
          $element.addClass(activeClass);
        } else {
          $element.removeClass(activeClass);
        }
      }

      function matchesParams() {
        return !params || equalForKeys(params, $stateParams);
      }
    }
  };
}

angular.module('ui.router.state')
  .directive('uiSref', $StateRefDirective)
  .directive('uiSrefActive', $StateActiveDirective);

$RouteProvider.$inject = ['$stateProvider', '$urlRouterProvider'];
function $RouteProvider(  $stateProvider,    $urlRouterProvider) {

  var routes = [];

  onEnterRoute.$inject = ['$$state'];
  function onEnterRoute(   $$state) {
    /*jshint validthis: true */
    this.locals = $$state.locals.globals;
    this.params = this.locals.$stateParams;
  }

  function onExitRoute() {
    /*jshint validthis: true */
    this.locals = null;
    this.params = null;
  }

  this.when = when;
  function when(url, route) {
    /*jshint validthis: true */
    if (route.redirectTo != null) {
      // Redirect, configure directly on $urlRouterProvider
      var redirect = route.redirectTo, handler;
      if (isString(redirect)) {
        handler = redirect; // leave $urlRouterProvider to handle
      } else if (isFunction(redirect)) {
        // Adapt to $urlRouterProvider API
        handler = function (params, $location) {
          return redirect(params, $location.path(), $location.search());
        };
      } else {
        throw new Error("Invalid 'redirectTo' in when()");
      }
      $urlRouterProvider.when(url, handler);
    } else {
      // Regular route, configure as state
      $stateProvider.state(inherit(route, {
        parent: null,
        name: 'route:' + encodeURIComponent(url),
        url: url,
        onEnter: onEnterRoute,
        onExit: onExitRoute
      }));
    }
    routes.push(route);
    return this;
  }

  this.$get = $get;
  $get.$inject = ['$state', '$rootScope', '$routeParams'];
  function $get(   $state,   $rootScope,   $routeParams) {

    var $route = {
      routes: routes,
      params: $routeParams,
      current: undefined
    };

    function stateAsRoute(state) {
      return (state.name !== '') ? state : undefined;
    }

    $rootScope.$on('$stateChangeStart', function (ev, to, toParams, from, fromParams) {
      $rootScope.$broadcast('$routeChangeStart', stateAsRoute(to), stateAsRoute(from));
    });

    $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
      $route.current = stateAsRoute(to);
      $rootScope.$broadcast('$routeChangeSuccess', stateAsRoute(to), stateAsRoute(from));
      copy(toParams, $route.params);
    });

    $rootScope.$on('$stateChangeError', function (ev, to, toParams, from, fromParams, error) {
      $rootScope.$broadcast('$routeChangeError', stateAsRoute(to), stateAsRoute(from), error);
    });

    return $route;
  }
}

angular.module('ui.router.compat')
  .provider('$route', $RouteProvider)
  .directive('ngView', $ViewDirective);
})(window, window.angular);
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

//define([
////      'componentes/ms-notify/msNotify',
////      'msControllers/msAlertController',
////      'componentes/ms-notify/services/msAlertService'
//      ], 
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
                          	
                        	  var path = window.location.hash;
                          	
                              var _messagesTmp = [];
                              _messagesTmp = _messagesTmp.concat(scope.messages);
                              if(_messagesTmp.length > 0 && _messagesTmp[0] != undefined){

                                  angular.forEach(_messagesTmp, function(message, index) {
                                      var indiceRemove = scope.messages.indexOf(message);
                                      
                                      if(path.indexOf(message.path) <= 0 || (scope.$root.cleaned != null && scope.$root.cleaned[message.path]) ) {
                                    	  scope.messages.splice(indiceRemove, 1);
                                            if(angular.isArray(scope.$root.cleaned)){
                                                  delete scope.$root.cleaned[message.path];
                                            }
                                      }
                                          
                                  });
                              }
                              
                          });

                      }
                  };
		}]);
		
		return msNotify;
		
}();


//define([
//      //'componentes/ms-notify/services/msNotifyProvider'
//      ], 
		!function() {
		
		'use strict';
              
              var msNotify = angular.module('msNotify');
	    
		msNotify.factory('$msAlertService', ['$rootScope', '$log', function($rootScope, $log) {
                  
                  var _container = [];
                  var _messages = {};
                  
                  var setContainer = function(containerId) {
                      _container.push(containerId);
                  }
                  
                  var getActiveContainer = function() {
						
                      var _containerTmp = [];
						
                      _containerTmp = _containerTmp.concat(_container);
                 
                      angular.forEach(_containerTmp, function(containerId, index) {
                          if(typeof angular.element('#'+ containerId) == "undefined" || angular.element('#'+ containerId).length  == 0) {
                              var indiceRemove = _container.indexOf(containerId);
                              _container.splice(indiceRemove, 1);
                              delete _messages[containerId];
                          }
                      });
                      
                      return _.last(_container);
                  }

					
                  var setMessages = function($message, $type, $default, $urlPersist, $persist) {
                      var messageContainer = getActiveContainer();
                      
                       var messageGroup = '<ul>';
                      
                      _messages[messageContainer] = [];
                      
                      /**
                       * $message deve sempre vir envelopado no modelo de objeto:
                       * messages: [{
                       *  code: 123,
                       *  texto: 'Mensagem'
                       * }]
                       */
                      if($message instanceof Array) {
                          if($message.length) {
                              angular.forEach($message, function(message) {
                                  messageGroup += "<li>";
                                  messageGroup += (message.texto) ? message.texto : $default;
                                  messageGroup += "</li>";
                              });
                          }
                      }
                      else {
                          
                          messageGroup += "<li>";
                          messageGroup += ($message) ? $message : $default;
                          messageGroup += "</li>";
                      }
                      
                      messageGroup += "</ul>";
                      
                      var hashPath = window.location.hash;
                      
                      _messages[messageContainer].push({
                         message: messageGroup,
                         type: $type,
                         persist: $persist,
                         path: $urlPersist
                     });
                      
                      $rootScope.$broadcast('_START_ALERT_', _messages[messageContainer], messageContainer);
                  };
                      
                  var clear = function(clearName) {
                      _messages = {};
                      if (clearName) {

                    	$rootScope.cleaned = {};
                  		$rootScope.cleaned[clearName] = true;
                      }
                      $rootScope.$broadcast('_STOP_ALERT_');
                  };
                  
	            return {
                      setContainer: setContainer,
                      clear: clear,
	                success: function($message, $urlPersist, $persist) {
                          return setMessages($message, "success", "<strong>Sucesso!</strong> Operação efetuada com sucesso.", $urlPersist, $persist);
	                },
	                info : function($message, $persist) {
                          return setMessages($message, "info", "<strong>Observação.</strong> Verifique os dados.", $persist);
	                },
	                warning : function($message, $persist) {
                          return setMessages($message, "warning", "<strong>Atenção!</strong> Verifique as informações.", $persist);
	                },
	                error : function($message, $persist) {
                          return setMessages($message, "danger", "<strong>Erro!</strong> Ocorreu um erro.", $persist);
	                }
	            };
	    }]);
		
		return msNotify;
		
}();
//define([
//      //'componentes/ms-notify/msNotify'
//      ], 
		!function() {
		
		'use strict';
              
              var msNotify = angular.module('msNotify');
	    
		msNotify.factory('$msNotifyProvider', function() {
	        try {
	           return function(){
	               return noty(arguments[0]);
	           };
	        }
	        catch(e) {
	        	$log.error(e);
	        }
	    });
		
		return msNotify;
		
}();
//define([
//      //'componentes/ms-notify/services/msNotifyProvider'
//      ], 
		!function() {
		
		'use strict';
              
              var msNotify = angular.module('msNotify');
              
		msNotify.factory('$msNotifyService', ['$msNotifyProvider', '$log', '$rootScope', function($msNotifyProvider, $log, $rootScope) {
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
                                          speed: 100 // opening & closing animation speed
                                      },
                                  };

                                  return this.init($message, 'warning', config);

                              } catch(e) {
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
!function() {
  'use strict';
  return angular.module('msSpinner', []);		
}();
 
!function() {
		
  'use strict';

  var msSpinner = angular.module('msSpinner');

  msSpinner.directive('msLoadingSpinner', [function () {
      return {
          restrict: "EA",
          link: function (scope, element, attrs) {

              var loadingContent = angular.element('<div class="loading-content"></div>');
              var loadingLayer = angular.element('<div class="loading"></div>');
              element.append(loadingLayer);

              if(attrs.loaderContent) {
                  loadingLayer.append(loadingContent);
              }

              element.addClass('loading-container');
              scope.$watch(attrs.loader, function(value) {
                  loadingLayer.toggleClass('ng-hide', !value);
              });
          }
      };
  }]);

  return msSpinner;
		
}();

!function() {
    'use strict';
    var msSpinner = angular.module('msSpinner');

    msSpinner.factory('msRequestSpinner', ['$rootScope', function($rootScope){

        var _START_REQUEST_ = '_START_REQUEST_';
        var _END_REQUEST_ = '_END_REQUEST_';

        var requestStarted = function() {
            $rootScope.$broadcast(_START_REQUEST_);
        };

        var requestEnded = function() {
            $rootScope.$broadcast(_END_REQUEST_);
        };

        var onRequestStarted = function($scope, handler){
            $scope.$on(_START_REQUEST_, function(event){

                if(handler)
                    handler();

                $rootScope.$msNotify.loading();
            });
        };

        var onRequestEnded = function($scope, handler){
            $scope.$on(_END_REQUEST_, function(event){
                if(handler)
                    handler();
                $rootScope.$msNotify.close();
            });
        };

        return {
            requestStarted:  requestStarted,
            requestEnded: requestEnded,
            onRequestStarted: onRequestStarted,
            onRequestEnded: onRequestEnded
        };
    }]);

    return msSpinner;
			
}();
!function () {
    'use strict';
    var msSeguranca = angular.module('msSeguranca', ['ngCookies']);

    msSeguranca.run(['$rootScope', 'msSegurancaService', '$state', 'msAutenticacaoService',
        function ($rootScope, msSegurancaService, $state, msAutenticacaoService) {


            $rootScope.$on('timer-stopped', function (event, data) {
                if (msSegurancaService.isUsuarioAutenticado()) {
                    msAutenticacaoService.sair().then(function (result) {
                        $state.go('login');
                        $rootScope.$msAlert.error('Seu tempo de sessão expirou', true);
                    });
                }
            });

            $rootScope.$on('$stateChangeError', function (ev, to, toParams, from, fromParams, error) {
                if (error.status === 401 && msSegurancaService.isUsuarioAutenticado() && msSegurancaService.getToken()) {
                    msSegurancaService.setUsuarioAutenticado(false);
                    $state.go('login');
                }
            });


            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

                $rootScope.isUsuarioAutenticado = msSegurancaService.isUsuarioAutenticado();

                if (toState.roles) {
                    if (msSegurancaService.isUsuarioAutenticado()) {

                        $rootScope.limite = msSegurancaService.contador();

                        $rootScope.$on('UsuarioAutenticado', function (event, data) {
                            $rootScope.usuarioAutenticado = data;
                        });

                        msAutenticacaoService.recuperarDadosUsuario().then(function (usuario) {

                            if (toState.name == 'login') {
                                if ($state.get(appConfig.login.sucesso))
                                    $state.go(appConfig.login.sucesso);
                            }
                            else {

                                msSegurancaService.possuiAcesso(toState.roles).then(function (result) {

                                    $state.go(toState.name, toParams, {notify: false}).then(function () {
                                        $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                                    });

                                }, function (reason) {
                                    $rootScope.$msNotify.info(reason);
                                    if ($state.get(appConfig.login.sucesso))
                                        $state.go(appConfig.login.sucesso);
                                    else {
                                        $rootScope.$msNotify.error('A rota de acesso não foi encontrada');
                                    }
                                });
                            }


                        }, function (erro) {
                            $rootScope.$msNotify.error('Não foi possível acessar a rota.');
                        });

                    }
                    else {
                        $rootScope.$msNotify.info('É necessário estar logado para acessar essa funcionalidade.');
                        event.preventDefault();
                        if (appConfig.defaultRoute) {
                            $state.go(appConfig.defaultRoute);
                        }
                        else {
                            $rootScope.$msNotify.info('Não foi informada uma rota pública padrão.');
                        }
                    }
                }
                else {
                    var goTo = toState.name;

                    if (msSegurancaService.isUsuarioAutenticado()) {
                        if (toState.name == 'login') {
                            goTo = appConfig.login.sucesso;
                        }
                        else {
                            $rootScope.$msNotify.info('A funcionalidade requerida só pode ser acessada publicamente');
                            event.preventDefault();
                            return;
                        }
                    }

                    $state.go(goTo, toParams, {notify: false}).then(function () {
                        $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                    });
                }

            });
        }]);
    return msSeguranca;

}();
   
!function() {
    'use strict';

    var msSeguranca = angular.module('msSeguranca');

    msSeguranca.factory('msSegurancaService', ['$cookieStore', '$q', '$rootScope', function($cookieStore, $q, $rootScope) {

        var _usuarioAutenticado, _token;

        var setUsuario = function(usuarioAutenticado) {
            $rootScope.usuarioAutenticado = usuarioAutenticado;
            _usuarioAutenticado = usuarioAutenticado; 
            //$rootScope.usuarioAutenticado = usuarioAutenticado;
        };

        var getUsuario = function() {
            return _usuarioAutenticado; 
            //return $rootScope.usuarioAutenticado;
        };

        var setUsuarioAutenticado = function(value){

            if(true === value) {
                $cookieStore.put('isUsuarioAutenticado', value);
                contador();
            }
            else {
                destruirSessao();
            }
        };


        var setTempoLimite = function(value) {
            try{
                var tempoLimite = new Date(getTempoInicial() + value*60000);
                $cookieStore.put('tempoLimite', tempoLimite.getTime());
            }
            catch(e) {
                $rootScope.$msNotify.error(e);
            }
        };

        var getTempoLimite = function() {
            return $cookieStore.get('tempoLimite');
        };

        var isUsuarioAutenticado = function(){
            return $cookieStore.get('isUsuarioAutenticado');
        };

        var possuiAcesso = function(rolesPermitidas, usuario) {
            var deferred = $q.defer();
            var usuario = (!usuario) ? getUsuario() : usuario;

            if(typeof usuario != 'undefined') {

                var possui = false;
                if(rolesPermitidas) {
                    angular.forEach(usuario.roles, function(val) {
                        if(rolesPermitidas.indexOf(val) != -1) {
                            possui = true;
                        }
                    });

                    if(rolesPermitidas.indexOf('*') != -1) {
                        possui = true;
                    }
                }

                if(possui) {
                    deferred.resolve(this);
                }
                else {
                    if(rolesPermitidas)
                        deferred.reject('Usuário sem permissão de acesso');
                    else
                        deferred.reject('A funcionalidade requerida só pode ser acessada publicamente.');
                }

                return deferred.promise;
            }

            return deferred.promise;
        };


        var setTempoInicial = function(value) {
            $cookieStore.put('tempoInicial', value);
        };

        var getTempoInicial = function() {
            return $cookieStore.get('tempoInicial');
        };

        var destruirSessao = function() {
            $cookieStore.remove('tempoInicial');
            $cookieStore.remove('tempoLimite');
            $cookieStore.remove('isUsuarioAutenticado');
            $cookieStore.remove('msToken');
        };


        var contador = function() {

            if(isUsuarioAutenticado()) {
                var date = new Date();
                var tempoAtual = date.getTime();
                var totalTimeOn = (getTempoLimite()) ? (tempoAtual - getTempoLimite())/1000 : 0;

                if(totalTimeOn > 0) {
                    setUsuarioAutenticado(false);
                }
                else {
                    setTempoInicial(date.getTime());
                    setTempoLimite(appConfig.login.limite);
                }
                return getTempoLimite();
            }
        };

        var setToken = function(token) { 
            if(typeof token != 'undefined') {
                $cookieStore.put('msToken', token);
                setUsuarioAutenticado(true); 
            }
        };

        var getToken = function() {
            return $cookieStore.get('msToken'); 
        };

        return {
            contador: contador,
            possuiAcesso: possuiAcesso,
            isUsuarioAutenticado: isUsuarioAutenticado,
            setUsuarioAutenticado: setUsuarioAutenticado,
            setUsuario: setUsuario,
            setToken: setToken,
            getToken: getToken,
            getUsuario: getUsuario
        }

    }]);

    return msSeguranca;
		
}();
!function() {	
    'use strict';

    var msSeguranca = angular.module('msSeguranca');

    msSeguranca.factory('msAutenticacaoService', ['$rootScope',  '$q', 'msSegurancaService', '$http', 
        function($rootScope, $q, msSegurancaService, $http) {

        var getUserData = function(deferred, token) {
            if(!msSegurancaService.getUsuario()) {
                $http.get(
                    appConfig.login.url_usuario,{token: token}
                ).then(function(response){
                    msSegurancaService.setUsuario(response.data.resultado.usuario);
                    $rootScope.$broadcast('USER_LOGGED_IN', response.data.resultado.usuario);
                    deferred.resolve(msSegurancaService.getUsuario());
                }, function(reason) {
                    deferred.reject(reason);
                });
            }
            else {
                deferred.resolve(msSegurancaService.getUsuario());
            }
        }

        var recuperarDadosUsuario = function() {
            var deferred = $q.defer();
            var token = msSegurancaService.getToken();
            if(msSegurancaService.isUsuarioAutenticado()) { 
                $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
                getUserData(deferred, token);
            }
            else {
                deferred.reject('Não foi possível recuperar os dados do usuário.');
            }

            return deferred.promise;

        };

        var autenticar = function(credentials) {
            var deferred = $q.defer();

            $http({
                    method  : 'POST',
                    url     : appConfig.login.url,
                    params    : credentials
                }).then(function(response) {
                    var token = response.data.access_token;
                    msSegurancaService.setToken(token);
                    $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
                    getUserData(deferred, token);
                    
            }, function(reason){
                deferred.reject(reason);
            });

            return deferred.promise;
        };

        var sair = function() {
            function resetDadosLogin() {
                msSegurancaService.setUsuarioAutenticado(false);
                msSegurancaService.setUsuario(false);
                delete $http.defaults.headers.common.Authorization;
                //Parando o contador
                $rootScope.$broadcast('timer-stop');
                deferred.resolve(msSegurancaService);
            }

            try{
                var deferred = $q.defer();

                var params = {
                    token : msSegurancaService.getToken()
                };

                $http({
                    url     : appConfig.logout.url,
                    method  : 'POST',
                    params    : params
                }).success(function(data, status, headers, config) {
                    //remove token e realiza logout
                    resetDadosLogin();
                }).error(function (data) {
                    //Token invalido ou expirado
                    /**
                     * "error":"invalid_token",
                     * "error_description":"Invalid access token: {TOKEN}"
                     */
                    resetDadosLogin();
                });

                return deferred.promise;
            }
            catch(e) {
                $rootScope.$msAlert.error(e);
            }
        };

        return {
            autenticar: autenticar,
            sair: sair,
            recuperarDadosUsuario: recuperarDadosUsuario
        }

    }]);

    return msSeguranca;
		
}();
!function() {
		
    'use strict';

    var msSeguranca = angular.module('msSeguranca');

    msSeguranca.directive('msContador', ['$compile', function($compile) {

        return {
            restrict: 'E',
            link: function(scope, element, attrs, ctrl) {
                try {
                    scope.$watch(attrs.limite, function(content) {
                        var template = angular.element('<timer end-time="limite">{{minutes}}:{{seconds}}</timer>');
                        element.html( template );
                        $compile(element.contents())(scope);
                    });

                }
                catch(e) {
                    scope.$msNotify.error(e);
                }
            }
        };
    }]);

    return msSeguranca;
		
}();


!function() {
		
    'use strict';

    var msSeguranca = angular.module('msSeguranca');

    msSeguranca.directive('msSeguranca',  ['msSegurancaService', 'msAutenticacaoService', '$parse', '$animate', '$rootScope',
        function(msSegurancaService, msAutenticacaoService, $parse, $animate, $rootScope) {

        return {
            restrict: 'EA',
            transclude: 'element',
            priority: 600,
            link: function(scope, element, attrs, ctrl, $transclude) {

                var rolesPermissaoArray, block, childScope;

                /*
                 * Recuperando as roles do objeto.
                 */

                if(attrs.roles.match(/,/g)) {
                    var trimmed = attrs.roles.replace(/\s+/g, '');
                    rolesPermissaoArray = trimmed.split(",");
                }
                else if(attrs.roles.match(/\*/g)) {
                     rolesPermissaoArray = attrs.roles;
                }
                else {
                    var roles = $parse(attrs.roles)(scope);
                    if(typeof roles == 'undefined') {
                        rolesPermissaoArray = attrs.roles.match(/\./g) ? null : attrs.roles;
                    }
                    else {
                        rolesPermissaoArray = roles;
                    }
                }

                /*
                 * Function para recuperação de elementos clonados
                 */
                function getBlockElements(nodes) {
                    var startNode = nodes[0],
                        endNode = nodes[nodes.length - 1];
                    if (startNode === endNode) {
                      return jQuery(startNode);
                    }

                    var element = startNode;
                    var elements = [element];

                    do {
                      element = element.nextSibling;
                      if (!element) break;
                      elements.push(element);
                    } while (element !== endNode);

                    return jQuery(elements);
                  }

                /*
                 * Clone de elementos que não serão exibidos.
                 * Remoção/reinserção dos elementos
                 */
                function transcluder(value) {
                    if(value) {
                        if (!childScope) {
                            childScope = scope.$new();
                            $transclude(scope, function (clone) {
                                clone[clone.length++] = document.createComment(' end msSeguranca: ' + attrs.msSeguranca + ' ');
                                block = {
                                    clone: clone
                                };
                                $animate.enter(clone, element.parent(), element);
                            });
                        }
                    }
                    else {
                        if (childScope) {
                            childScope.$destroy();
                            childScope = null;
                        }

                        if (block) {
                            $animate.leave(getBlockElements(block.clone));
                            block = null;
                        }
                    }
                };


                scope.$on('USER_LOGGED_IN', function(event, usuario) {
                    msSegurancaService.possuiAcesso(rolesPermissaoArray, usuario).then(function(result) {
                        transcluder(true);
                    }, function(reason) {
                        transcluder(false);
                    });
                })
                /*
                 * Watch sobre usuario logado.
                 * Aqui informamos se há ou não acesso ao elemento
                 */
                scope.$watch(function(){
                    return msSegurancaService.isUsuarioAutenticado();
                }, function(val) {
                    if(val == true) {
                        msSegurancaService.possuiAcesso(rolesPermissaoArray, msSegurancaService.getUsuario()).then(function(result) {
                            transcluder(true);
                        }, function(reason) {
                            transcluder(false);
                        });
                    }
                    else {
                        (rolesPermissaoArray) ?  transcluder(false) : transcluder(true);
                    }
                });
            }
        };
    }]);

    return msSeguranca;
		
}();


!function() {
		
    'use strict';

    var msSeguranca = angular.module('msSeguranca');

    msSeguranca.directive('msUsuarioInfo', ['$compile', function($compile) {
        return {
            restrict: 'E',
            link: function(scope, element, attrs, ctrl) {
                try {
                    scope.$watch(attrs.usuarioAutenticado, function(usuario) {
                        if(typeof usuario != 'undefined'&& typeof usuario.perfil != 'undefined'){

                            var template = angular.element('\n\
                                                        <a ng-click="editUsuario()" role="button" class="configuracao">\n\
                                                            <span class="icone icone-cog"></span>\n\
                                                            <span class="usuarioLogado">' + usuario.nome + '</span>\n\
                                                        </a> \n\
                                                        <span class="perfilUsuario">' + usuario.perfil.nome + '</span>');

/*
                            var template = angular.element('\n\
                                            <a ng-click="editUsuario()" role="button" class="configuracao">\n\
                                                <span class="ms-icone-usuario"></span>\n\
                                                <div class="box-user">\n\
                                                <span class="usuarioLogado">' + usuario.nome + '</span>\n\
                                                <span class="perfilUsuario">' + usuario.perfil.nome + '</span> \n\
                                                </div>\n\
                                            </a>');
                                            */
                            element.html( template );
                            $compile(element.contents())(scope);
                        }
                    }, true);
                }
                catch(e) {
                    scope.$msNotify.error(e);
                }
            }
        };
    }]);
		
    return msSeguranca;
		
}();


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
!function() {
    'use strict';
    var msRoute = angular.module('msRoute');

    msRoute.factory('msRouteService', [ '$log', '$http', '$q', '$state', '$rootScope', 'msSegurancaService', 
         function($log, $http, $q, $state, $rootScope, msSegurancaService){

            'use strict';

            var appBaseUrl = (typeof appConfig.appBaseUrl != "undefined") ? appConfig.appBaseUrl : 'app';

            var setState = function(content) {
                angular.forEach(content, function(object, key) {
                    try{
                        if(object.children) {
                            setState(object.children);
                        }

                        if(object.inner) {
                            setState(object.inner);
                        }

                        var textClean = angular.isUndefined(object.text) ? "" : retira_acentos(object.text).toLowerCase().replace(/\s/g, "-");
                        var tpl = (object.view) ? object.view : textClean;
                        var url = textClean;

                        var state = url;

                        var wordsControl = (object.module) ? object.module.split('-') : new Array();
                        var secondName = '';
                        if(wordsControl.length > 1) {
                            for (var i=1;i<wordsControl.length;i++)
                            { 
                                secondName += wordsControl[i].charAt(0).toUpperCase() + wordsControl[i].slice(1);
                            }
                        }

                        var control = (wordsControl.length) ? wordsControl[0].toLowerCase() + secondName + 'Controller' : null;
                        //console.log(control);
                        if(object.state) {
                            if(object.state.url) {
                                url = object.state.url;
                            }
                            if(object.state.name) {
                                state = object.state.name;
                            }
                        }

                        var bootstrapJs = (object.resolve) ? object.resolve : object.module;
                        var bust = (new Date()).getTime();
                        if(!$state.get(state)) {
                            msRoute.$stateProvider
                                .state(state, {
                                        url: "/" + url ,
                                        templateUrl: appBaseUrl + '/pages/' + object.module + '/views/' + tpl + '.tpl.html?t=' + bust,
                                        resolve: resolve(['pages/' + object.module + '/' + bootstrapJs]),
                                        controller: (object.controller) ? object.controller : control ,
                                        breadcrumb: object.breadcrumb ? object.breadcrumb : object.text,
                                        roles: object.roles ? object.roles : false,
                                        module: object.module
                                        ,onEnter: (object.onEnter) ? object.onEnter() : function(){}
                                 });
                         }


                    }
                    catch(e) {
                        $log.error(e);
                    }
                });
            }

            var create = function(content) {

                var deferred = $q.defer();

                var defaultRoute = 'login';

                angular.forEach(arguments, function(content) {

                    if(msSegurancaService.isUsuarioAutenticado()) {
                        defaultRoute = (typeof appConfig.login.sucesso != "undefined") ? appConfig.login.sucesso : 'login';
                    }
                    else {
                        defaultRoute = (typeof appConfig.defaultRoute != "undefined") ? appConfig.defaultRoute : 'home';
                    }

                    msRoute.$urlRouterProvider.otherwise(defaultRoute);

                    if(typeof content == 'string') {
                        $http.get(content).then(function(success) {
                            setState(success.data);
                            deferred.resolve(success.data);
                        }, function(reason){
                            $rootScope.$msAlert.error('Erro na criação de rotas : ' + reason);
                        });
                    }
                    else {
                        setState(content);
                        deferred.resolve(content);
                    }
                });
                return deferred.promise;
            }

            return {
                create: create
            };
    }]);

    return msRoute;
		
}();
!function() {
    'use strict';
                        
    var msUtils =  angular.module('msUtils', []);

    /*
     * Configurando o modulo para permitir LazyLoading de providers
     */
    msUtils.config(['$provide', '$compileProvider',
                        function($provide, $compileProvider){

            msUtils.directive = function( name, constructor ) {
                $compileProvider.directive( name, constructor );
                return( this );

            };      

            msUtils.factory = function( name, constructor ) {
                $provide.factory( name, constructor );
                return( this );

            };
    }]);


    msUtils.run(['$rootScope', 'msPropriedadesService', function($rootScope, msPropriedadesService) {
            $rootScope.msPropriedades = msPropriedadesService.get();
    }]);

    return msUtils;
			
}();
   
!function() {
    'use strict';
    var msUtils = angular.module('msUtils');

    msUtils.directive('msCompile', function($compile) {

        return {
            restrict: 'A',
            link:function(scope, element, attrs) {
                scope.$watch( function(scope) {
                                return scope.$eval(attrs.msCompile);
                            },
                            function(value) {
                                element.html(value);

                                if(!attrs.keepScope)
                                    $compile(element.contents())(scope);
                            }
                );
            }
        }
      });

    return msUtils;
			
}();
!function() {
    'use strict';
    var msUtils = angular.module('msUtils');

    msUtils.directive('msIdentificadorAmbiente', function($compile) {

        return {
                restrict: 'E',
                scope: true,
                link: function(scope, element, attrs) {
                    try {
                        scope.$watch(attrs.ambiente, function(content) {

                            var configAmbiente = {
                                    dev: {
                                        estilo : 'statusprojeto alert alert-warning ativo',
                                        nome : 'Desenvolvimento',
                                        icone: 'ms-icone-desenvolvimento'
                                    },
                                    hmg: {
                                        estilo : 'statusprojeto alert alert-danger ativo',
                                        nome : 'Homologação',
                                        icone: 'ms-icone-homologacao'
                                    },
                                    prototipo: {
                                        estilo : 'statusprojeto alert alert-info ativo',
                                        nome : 'Protótipo',
                                        icone: 'ms-icone-prototipo'
                                    }
                            };

                            var template = angular.element('<div class="' + configAmbiente[content.nome].estilo + '">\n\
                                                                <h4><span class="' + configAmbiente[content.nome].icone + '"></span>' + configAmbiente[content.nome].nome + '</h4>\n\
                                                            </div>');
                            element.html( template );
                            $compile(element.contents())(scope);
                        });

                    }
                    catch(e) {
                        scope.$msNotify.error(e);
                    }
                }
            };
      });

    return msUtils;
			
}();
!function() {
		
    'use strict';

    var msUtils = angular.module('msUtils');
    msUtils.factory('msPropriedadesService', ['$http', '$log', '$q', function($http, $log, $q) {

        var _resource;

        var init = function() {
            try {
                if(!getResource() || typeof getResource() == 'undefined') {

                    if(appConfig.ambiente.propriedades) {
                        _resource = $http.get(appConfig.ambiente.propriedades);
                    }
                }

                return getResource();
            }
            catch(e) {
                $log.error(e);
            }
        };

        var getResource = function() {
            return _resource;
        }

        var get = function() {
            if(typeof init() != 'undefined') {
                return init().then(function(response) {
                    return response.data.resultado;
                }, function(reason){
                    throw reason;
                });
            }
            else {
                var defer = $q.defer();
                return defer.promise;
            }
        };


        return {
            get: get
        }
    }]);

    return msUtils;
		
}();
!function() {
		
    'use strict';

    var msUtils = angular.module('msUtils');
    msUtils.factory('_', function() {
        return window._; 
    });

    return msUtils;
		
}();
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(h,s){var f={},t=f.lib={},g=function(){},j=t.Base={extend:function(a){g.prototype=this;var c=new g;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
q=t.WordArray=j.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=s?c:4*a.length},toString:function(a){return(a||u).stringify(this)},concat:function(a){var c=this.words,d=a.words,b=this.sigBytes;a=a.sigBytes;this.clamp();if(b%4)for(var e=0;e<a;e++)c[b+e>>>2]|=(d[e>>>2]>>>24-8*(e%4)&255)<<24-8*((b+e)%4);else if(65535<d.length)for(e=0;e<a;e+=4)c[b+e>>>2]=d[e>>>2];else c.push.apply(c,d);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
32-8*(c%4);a.length=h.ceil(c/4)},clone:function(){var a=j.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],d=0;d<a;d+=4)c.push(4294967296*h.random()|0);return new q.init(c,a)}}),v=f.enc={},u=v.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++){var e=c[b>>>2]>>>24-8*(b%4)&255;d.push((e>>>4).toString(16));d.push((e&15).toString(16))}return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b+=2)d[b>>>3]|=parseInt(a.substr(b,
2),16)<<24-4*(b%8);return new q.init(d,c/2)}},k=v.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++)d.push(String.fromCharCode(c[b>>>2]>>>24-8*(b%4)&255));return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b++)d[b>>>2]|=(a.charCodeAt(b)&255)<<24-8*(b%4);return new q.init(d,c)}},l=v.Utf8={stringify:function(a){try{return decodeURIComponent(escape(k.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return k.parse(unescape(encodeURIComponent(a)))}},
x=t.BufferedBlockAlgorithm=j.extend({reset:function(){this._data=new q.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=l.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,d=c.words,b=c.sigBytes,e=this.blockSize,f=b/(4*e),f=a?h.ceil(f):h.max((f|0)-this._minBufferSize,0);a=f*e;b=h.min(4*a,b);if(a){for(var m=0;m<a;m+=e)this._doProcessBlock(d,m);m=d.splice(0,a);c.sigBytes-=b}return new q.init(m,b)},clone:function(){var a=j.clone.call(this);
a._data=this._data.clone();return a},_minBufferSize:0});t.Hasher=x.extend({cfg:j.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){x.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(c,d){return(new a.init(d)).finalize(c)}},_createHmacHelper:function(a){return function(c,d){return(new w.HMAC.init(a,
d)).finalize(c)}}});var w=f.algo={};return f}(Math);
(function(h){for(var s=CryptoJS,f=s.lib,t=f.WordArray,g=f.Hasher,f=s.algo,j=[],q=[],v=function(a){return 4294967296*(a-(a|0))|0},u=2,k=0;64>k;){var l;a:{l=u;for(var x=h.sqrt(l),w=2;w<=x;w++)if(!(l%w)){l=!1;break a}l=!0}l&&(8>k&&(j[k]=v(h.pow(u,0.5))),q[k]=v(h.pow(u,1/3)),k++);u++}var a=[],f=f.SHA256=g.extend({_doReset:function(){this._hash=new t.init(j.slice(0))},_doProcessBlock:function(c,d){for(var b=this._hash.words,e=b[0],f=b[1],m=b[2],h=b[3],p=b[4],j=b[5],k=b[6],l=b[7],n=0;64>n;n++){if(16>n)a[n]=
c[d+n]|0;else{var r=a[n-15],g=a[n-2];a[n]=((r<<25|r>>>7)^(r<<14|r>>>18)^r>>>3)+a[n-7]+((g<<15|g>>>17)^(g<<13|g>>>19)^g>>>10)+a[n-16]}r=l+((p<<26|p>>>6)^(p<<21|p>>>11)^(p<<7|p>>>25))+(p&j^~p&k)+q[n]+a[n];g=((e<<30|e>>>2)^(e<<19|e>>>13)^(e<<10|e>>>22))+(e&f^e&m^f&m);l=k;k=j;j=p;p=h+r|0;h=m;m=f;f=e;e=r+g|0}b[0]=b[0]+e|0;b[1]=b[1]+f|0;b[2]=b[2]+m|0;b[3]=b[3]+h|0;b[4]=b[4]+p|0;b[5]=b[5]+j|0;b[6]=b[6]+k|0;b[7]=b[7]+l|0},_doFinalize:function(){var a=this._data,d=a.words,b=8*this._nDataBytes,e=8*a.sigBytes;
d[e>>>5]|=128<<24-e%32;d[(e+64>>>9<<4)+14]=h.floor(b/4294967296);d[(e+64>>>9<<4)+15]=b;a.sigBytes=4*d.length;this._process();return this._hash},clone:function(){var a=g.clone.call(this);a._hash=this._hash.clone();return a}});s.SHA256=g._createHelper(f);s.HmacSHA256=g._createHmacHelper(f)})(Math);

function ucFirst(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function resolve(names) {
    return {
        load: ['$q', '$rootScope', function ($q, $rootScope) {
            var defer = $q.defer();
            require(names, function () {
                defer.resolve();
                $rootScope.$apply();
            });
            return defer.promise;
        }]
    }
}

function retira_acentos(palavra) { 
    var com_acento = "áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÖÔÚÙÛÜÇ";
    var sem_acento = "aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC";
    var nova="";
    for(i=0;i<palavra.length;i++) { 
        if (com_acento.search(palavra.substr(i,1))>=0) { 
            nova += sem_acento.substr(com_acento.search(palavra.substr(i,1)),1); 
        } 
        else { 
            nova+=palavra.substr(i,1); 
        } 
    } 
    return nova; 
}


function setaCookieContraste(b){var a=new Date,c=a.getTime()+6048E5;a.setTime(c);document.cookie="ativo"==b?"Contraste=Sim; expires="+a.toGMTString():"Contraste=Nao; expires="+a.toGMTString()}function atribuirContraste(){!0==$("body").hasClass("acessibilidade")?($("body").removeClass("acessibilidade"),setaCookieContraste("inativo")):($("body").addClass("acessibilidade"),setaCookieContraste("ativo"))}var results=document.cookie.match("(^|;) ?Contraste=([^;]*)(;|$)");
$(this).load(function(){null!=results&&"Sim"==results[2]&&atribuirContraste("ativo")});
/*
 *  Project: RV Font Size jQuery Plugin
 *  Description: An easy and flexible jquery plugin to give font size accessibility control.
 *  URL: https://github.com/ramonvictor/rv-jquery-fontsize/
 *  Author: Ramon Victor (https://github.com/ramonvictor/)
 *  License: Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 *  Any and all use of this script must be accompanied by this copyright/license notice in its present form.
 */
(function(e,d,a,g){var b="rvFontsize",f={targetSection:"body",store:false,storeIsDefined:!(typeof store==="undefined"),variations:7,controllers:{append:true,appendTo:"body",showResetButton:false,template:""}};function c(j,i){var h=this;h.element=j;h.options=e.extend({},f,i);h._defaults=f;h._name=b;h.init()}c.prototype={init:function(){var h=this,i=function(){h.defineElements();h.getDefaultFontSize()};i();if(h.options.store===true&&!(h.options.storeIsDefined)){h.dependencyWarning()}},dependencyWarning:function(){console.warn('When you difine "store: true", store script is required (https://github.com/ramonvictor/rv-jquery-fontsize/blob/master/js/store.min.js)')},bindControlerHandlers:function(){var h=this;h.$decreaseButton=e(".rvfs-decrease");if(h.$decreaseButton.length>0){h.$decreaseButton.on("click",function(j){j.preventDefault();var i=e(this);if(!i.hasClass("disabled")){var k=h.getCurrentVariation();if(k>1){h.$target.removeClass("rvfs-"+k);h.$target.attr("data-rvfs",k-1);if(h.options.store===true){h.storeCurrentSize()}h.fontsizeChanged()}}})}h.$increaseButton=e(".rvfs-increase");if(h.$increaseButton.length>0){h.$increaseButton.on("click",function(j){j.preventDefault();var i=e(this);if(!i.hasClass("disabled")){var k=h.getCurrentVariation();if(k<h.options.variations){h.$target.removeClass("rvfs-"+k);h.$target.attr("data-rvfs",k+1);if(h.options.store===true){h.storeCurrentSize()}h.fontsizeChanged()}}})}h.$resetButton=e(".rvfs-reset");if(h.$resetButton.length>0){h.$resetButton.on("click",function(j){j.preventDefault();var i=e(this);if(!i.hasClass("disabled")){var k=h.getCurrentVariation();h.$target.removeClass("rvfs-"+k);h.$target.attr("data-rvfs",h.defaultFontsize);if(h.options.store===true){h.storeCurrentSize()}h.fontsizeChanged()}})}},defineElements:function(){var h=this;h.$target=e(h.options.targetSection);if(h.options.controllers.append!==false){var i=h.options.controllers.showResetButton?'<a href="#" class="rvfs-reset btn" title="Default font size">A</a>':"";var k=h.options.controllers.template,j="";h.$appendTo=e(h.options.controllers.appendTo);if(e.trim(k).length>0){j=k}else{j='<div class="btn-group"><a href="#" class="rvfs-decrease btn" title="Decrease font size">A<sup>-</sup></a></li>'+i+'<a href="#" class="rvfs-increase btn" title="Increase font size">A<sup>+</sup></a></li></div>'}h.$appendTo.html(j);h.bindControlerHandlers()}},getDefaultFontSize:function(){var h=this,i=h.options.variations;h.defaultFontsize=0;if(i%2===0){h.defaultFontsize=(i/2)+1}else{h.defaultFontsize=parseInt((i/2)+1,10)}h.setDefaultFontSize()},setDefaultFontSize:function(){var h=this;if(h.options.store===true&&h.options.storeIsDefined){var i=store.get("rvfs")||h.defaultFontsize;h.$target.attr("data-rvfs",i)}else{h.$target.attr("data-rvfs",h.defaultFontsize)}h.fontsizeChanged()},storeCurrentSize:function(){var h=this;if(h.options.storeIsDefined){store.set("rvfs",h.$target.attr("data-rvfs"))}else{h.dependencyWarning()}},getCurrentVariation:function(){return parseInt(this.$target.attr("data-rvfs"),10)},fontsizeChanged:function(){var h=this,i=h.getCurrentVariation();h.$target.addClass("rvfs-"+i);if(i===h.defaultFontsize){h.$resetButton.addClass("disabled")}else{h.$resetButton.removeClass("disabled")}if(i===h.options.variations){h.$increaseButton.addClass("disabled")}else{h.$increaseButton.removeClass("disabled")}if(i===1){h.$decreaseButton.addClass("disabled")}else{h.$decreaseButton.removeClass("disabled")}}};e.fn[b]=function(i){var h=this;return h.each(function(){if(!e.data(h,"plugin_"+b)){e.data(h,"plugin_"+b,new c(h,i))}})};e[b]=function(){var h=e(d);return h.rvFontsize.apply(h,Array.prototype.slice.call(arguments,0))}})(jQuery,window,document);
//define([
//        'angular'
//        ], 
        !function() {
            'use strict';
            try {
                return angular.module('msAppController', []);;
            }
            catch(e) {
                    console.log(e);
            }
			
}();
//define([
//        'msControllers/msAppController'
//        ], 
        !function() {
            'use strict';
            try {
                var msAppController = angular.module('msAppController');
                msAppController.controller('msAlertController', ['$scope', '$attrs', function ($scope, $attrs) {
                    $scope.closeable = 'close' in $attrs;
                }]);
            }
            catch(e) {
                    console.log(e);
            }
            
            return msAppController;
			
}();
define([
        //'msControllers/msAppController'
    ],
    function () {
        'use strict';
        try {

            var msAppController = angular.module('msAppController');
            msAppController.controller('msController', ['$rootScope', '$scope', 'msAutenticacaoService', 'msRouteService',
                function ($rootScope, $scope, msAutenticacaoService, msRouteService) {

                    $scope.app = appConfig;

                    $scope.edit = function () {
                        $scope.$msNotify.info('Editando');
                    };

                    $scope.remove = function (url) {
                        $scope.$msNotify.error('Remoção');
                    };

                    $scope.view = function () {
                        $scope.$msNotify.error('Visualizando');
                    };


                    /**
                     * Controlador de MENU.
                     * Escopo GLOBAL da aplicação.
                     */
                    $scope.menu = [];

                    $scope.alterarMenu = function (data) {
                        if (data)
                            $scope.menu = data;
                    };

                    var loginModule = (typeof appConfig.login != 'undefined' && typeof appConfig.login.module != 'undefined') ? appConfig.login.module : 'login';

                    var loginRoutes = [{
                        module: loginModule,
                        view: 'login',
                        resolve: 'login',
                        controller: 'loginController',
                        text: 'Login'
                    },
                        {
                            module: loginModule,
                            text: 'logout',
                            resolve: 'login',
                            controller: 'loginController',
                            view: 'login'
                        }];

                    msRouteService.create(loginRoutes);

                    /*
                     * Edição de usuário logado
                     */
                    $scope.editUsuario = function () {
                    }

                    /*
                     * Atualização de grid do ngTable
                     */

                    $scope.reloadNgTable = function (ngTable, filtro) {
                        ngTable.$params.filtro = {};
                        angular.forEach(filtro, function (value, indice) {
                            if (value == null) {
                                if (ngTable.$params.filtro[indice]) {
                                    delete ngTable.$params.filtro[indice];
                                }
                            }
                            else {
                                if (typeof value == 'object') {
                                    ngTable.$params.filtro[indice] = new Array(value);
                                } else {
                                    if (value != 'null')
                                        ngTable.$params.filtro[indice] = value
                                }
                            }
                        });
                    }

                    $scope.ngTableOrderClick = function (ngTable, column) {
                        if (column.order)
                            ngTable.sorting(column.field, ngTable.isSortBy(column.field, 'asc') ? 'desc' : 'asc');
                    }

                    msAutenticacaoService.recuperarDadosUsuario().then(function (resultado) {
                    });

                }]);
        }
        catch (e) {
            console.log(e);
        }

        return msAppController;

    });
//define([
//        'msControllers/msAppController',
//        'componentes/ms-seguranca/services/msAutenticacaoService',
//        ], 
        !function() {
            'use strict';
            try {
                var msAppController = angular.module('msAppController');
                msAppController.controller('msLoginController',  ['$scope', '$state', 'msAutenticacaoService', '$rootScope','$timeout',
                    function($scope, $state, msAutenticacaoService, $rootScope, $timeout) {                        
 
                        if(typeof $scope.formLogin == 'undefined') {
                            $scope.formLogin = {
                                email: '',
                                password: '',
                                client_id: '',
                                client_secret: ''
                            }
                        }
                        
                         $scope.login = function() {
                            try {
                                
                                if(!appConfig.login) {
                                    throw 'Não foi informada uma configuração de login para a aplicação. Vide appConfig(main.js)';
                                }

                               if($scope.msLoginForm.$valid) {
                                   
                                    var senhaCrypto = CryptoJS.SHA256($scope.formLogin.password).toString();
                                    
                                    var credentials = {
                                        grant_type : 'password',
                                        client_id : $scope.formLogin.client_id,
                                        client_secret : $scope.formLogin.client_secret,
                                        username : $scope.formLogin.email,
                                        password : senhaCrypto
                                    };
                                    
                                    msAutenticacaoService.autenticar(credentials).then(function(result) {
                                        $state.go(appConfig.login.sucesso);
                                        
                                    }, function(reason) {
                                        $scope.$msNotify.error(reason.data.mensagens);
                                    }) ;
                                }
                                else {                                    
                                    throw 'Os dados informados não conferem';
                                }
                            }
                            catch(e) {
                                $scope.$msNotify.error(e, true);
                            }
                        };

                        $scope.logout = function() {
                            try {
                                msAutenticacaoService.sair().then(function(result) {
                                    $state.go('login');
                                });
                            }
                            catch(e) {
                                $scope.$msNotify.error(e);
                            }
                        };
                    
                }]);
            }
            catch(e) {
                    console.log(e);
            }
            
            return msAppController;
			
}();