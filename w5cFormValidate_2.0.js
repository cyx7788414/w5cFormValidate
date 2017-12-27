define(['initConfig',
    ], function(app) {
    'use strict';
    app.register.provider('w5cValidator', [function () {
        var defaultRules = {
                required      : "{validateName}不能为空",
                email         : "输入邮件的格式不正确",
                repeat        : "两次输入不一致",
                pattern       : "{validateName}输入格式不正确",
                number        : "必须输入数字",
                w5cUniqueCheck: "该输入值已经存在，请重新输入",
                url           : "输入URL格式不正确",
                max           : "{validateName}输入值不能大于{max}",//经验证，只在type="number"时生效，且带有浏览器自带数字步进样式，不建议使用
                min           : "{validateName}输入值不能小于{min}",//经验证，只在type="number"时生效，且带有浏览器自带数字步进样式，不建议使用
                minlength     : "{validateName}输入值长度不能小于{minLength}",
                w5cMaxlength     : "{validateName}输入值长度不能大于{maxLength}",
                w5cMax : "{validateName}输入值不能大于{maxEqual}{maxNum}",//配合w5c-max-equal来判断能否等于
                w5cMin : "{validateName}输入值不能小于{minEqual}{minNum}",//配合w5c-min-equal来判断能否等于
                w5cCheck: "{validateName}输入值不符合要求",//增强判断，接收回调函数，回调参数value，返回值为false触发报错
            };
        var defaultReplaceMapHandle = {
            equal: function(value) {
                var result = '';
                if (value === 'false') {
                    result = '等于';
                }
                return result;
            }
        };
        var defaultReplaceMap = {
            max: 'max',
            min: 'min',
            minLength: 'minlength',
            maxLength: 'w5c-maxlength',
            validateName: 'w5c-validate-name',
            maxEqual: {
                flag: 'w5c-max-equal',
                handle: defaultReplaceMapHandle.equal
            },
            minEqual: {
                flag: 'w5c-min-equal',
                handle: defaultReplaceMapHandle.equal
            },
            maxNum: 'w5c-max',
            minNum: 'w5c-min',
        };
        var defaultReplaceValue = {
            validateName: '该选项',
        };
        var elemTypes = ['text', 'password', 'email', 'number', 'url', 'tel', 'hidden', ['textarea'], ['select'], ['select-multiple'], ['select-one'], 'radio', 'checkbox'];
        var defaultOption = {
            blurTrigCheck: false,
            editTrigRemove: true,
            showError: function($elemItem, errorMessages, $scope) {
                var $group = $elemItem.parents('form[name="' + $scope.formName + '"] .form_tr');
                if ($group[0] && !$($group[0]).hasClass("has-error")) {
                    $($group[0]).addClass("has-error");
                }
                var $next = $elemItem.next();
                if (!$next || !$next.hasClass("w5c_form_error")) {
                    $elemItem.after('<span class="w5c_form_error">' + errorMessages[0] + '</span>');
                }
            },
            removeError: function($elemItem, $scope) {
                var $group = $elemItem.parents('form[name="' + $scope.formName + '"] .form_tr');
                if ($group[0] && $($group[0]).hasClass("has-error")) {
                    $($group[0]).removeClass("has-error");
                }
                var $next = $elemItem.next();
                if ($next.hasClass && $next.hasClass("w5c_form_error")) {
                    $next.remove();
                }
            },
        };

        var init = function() {
            this.rules = defaultRules;
            this.replaceMap = defaultReplaceMap;
            this.replaceValue = defaultReplaceValue;
            this.elemTypes = elemTypes;
            this.option = defaultOption;
        };
        init.prototype.setConfig = function(config) {
            angular.forEach(config, function(value, index) {
                if ($.type(value) === 'object') {
                    this[index] = angular.extend(this[index], value);
                } else {
                    this[index] = value;
                }
            });
        };

        var w5cValidator = new init();
        this.$get = function () {//angular define provider required, after remove this, no error show, but stop handel js, trigger the white page.
            return w5cValidator;
        };
    }]);
    app.register.directive('w5cFormValidate', ['w5cValidator', '$timeout', 
        function(w5cValidator, $timeout) {
            return {
                restrict: 'A',
                require: ['w5cFormValidate', '?^form'],
                scope: {
                    config: '=w5cFormValidate',
                    action: '=action',
                },
                controller: ['$scope', 
                    function($scope) {
                        var childDirectiveInitFuncList = [];
                        var startExecFlag = false;
                        $scope.registChildDirectiveInitFunc = function(content) {
                            if ($.type(content) === 'array') {
                                childDirectiveInitFuncList = childDirectiveInitFuncList.concat(content);
                            } else {
                                childDirectiveInitFuncList.push(content);
                            }
                            if (startExecFlag) {
                                $scope.execChildDirectiveInitFunc();
                            }
                        };
                        $scope.getChildDirectiveInitFunc = function() {
                            return childDirectiveInitFuncList.splice(0);
                        };
                        $scope.execChildDirectiveInitFunc = function(setFlag) {
                            if (setFlag === 'init') {
                                startExecFlag = true;
                            } 
                            var array = $scope.getChildDirectiveInitFunc();
                            angular.forEach(array, function(value, index) {
                                value();
                            });
                        };
                        this.scope = $scope;
                    }
                ],
                link: function($scope, $element, $attrs, ctrls) {
                    var allErrorObj = {};

                    var matchConfig = function(item) {
                        return ($scope.config && $scope.config.option && ($scope.config.option[item] || $scope.config.option[item] === false))?$scope.config.option[item]:w5cValidator.option[item];
                    };
                    var extendConfig = function(item) {
                        return angular.extend({}, w5cValidator[item], ($scope.config && $scope.config[item])?$scope.config[item]:{});
                    };

                    var getSingelErrorMessage = function(errorName, elemName, $elemItem) {
                        var msgTpl = ($scope.config && $scope.config.rules && $scope.config.rules[elemName] && $scope.config.rules[elemName][errorName])?$scope.config.rules[elemName][errorName]:w5cValidator.rules[errorName];
                        if (!msgTpl) {
                            throw new Error("no default rule for error type (" + errorName + ")！");
                        }
                        var replaceMap = extendConfig('replaceMap');
                        var replaceValue = extendConfig('replaceValue');
                        angular.forEach(replaceMap, function(value, index) {
                            var attr = value;
                            var handle;
                            if ($.type(value) === 'object') {
                                attr = value.flag;
                                handle = value.handle;
                            }
                            var attrValue = $elemItem.attr(attr);
                            var content = handle?handle(attrValue):(attrValue?attrValue:replaceValue[index]);
                            msgTpl = msgTpl.replace('{' + index + '}', content);
                        });
                        return msgTpl;
                    };

                    var getErrorMessages = function($elemItem, elemName, errors) {
                        var elementErrors = [];
                        angular.forEach(errors, function(value, index) {
                            if (value) {
                                var msg = getSingelErrorMessage(index, elemName, $elemItem);
                                elementErrors.push(msg);
                            }
                        });
                        return elementErrors;
                    };

                    $scope.getError = function(elemName) {
                        if (elemName) {
                            return allErrorObj[elemName]?allErrorObj[elemName]:[];
                        }
                        return allErrorObj;
                    };

                    $scope.getErrorIndex = function(elemName) {
                        if (elemName) {
                            return $scope.formCtrl[elemName]?$scope.formCtrl[elemName].$error:{};
                        } else {
                            var tempObj = {};
                            angular.forEach($scope.registElementNameList, function(value, index) {
                                tempObj[value] = $scope.formCtrl[value]?$scope.formCtrl[value].$error:{};
                            }); 
                            return tempObj;
                        }
                    };

                    $scope.showErrorSingle = function(elemName, errorMessage) {
                        var errorMessages = [errorMessage];
                        allErrorObj[elemName] = errorMessages;
                        var showError = matchConfig('showError');
                        if (showError) {
                            var $elemItem = $scope.registElementObj[elemName];
                            $elemItem.removeClass("valid").addClass("error");
                            showError($elemItem, errorMessages, $scope);
                        }
                    };

                    $scope.showError = function($elemItem, elemName) {
                        var errorMessages = getErrorMessages($elemItem, elemName, $scope.formCtrl[elemName].$error);
                        allErrorObj[elemName] = errorMessages;
                        var showError = matchConfig('showError');
                        if (showError) {
                            $elemItem.removeClass("valid").addClass("error");
                            showError($elemItem, errorMessages, $scope);
                        }
                    };

                    $scope.removeError = function($elemItem, elemName) {
                        delete allErrorObj[elemName];
                        var removeError = matchConfig('removeError');
                        if (removeError) {
                            $elemItem.removeClass("error").addClass("valid");
                            removeError($elemItem, $scope);
                        }
                    };

                    $scope.validateSingle = function(elemName) {
                        var formItem = $scope.formCtrl[elemName];
                        var $elemItem = $scope.registElementObj[elemName];
                        $scope.removeError($elemItem, elemName);
                        if ($elemItem.attr('disabled')) {
                            return true;
                        }
                        if (!formItem.$valid) {
                            $scope.showError($elemItem, elemName);
                        }
                        return formItem.$valid;
                    };

                    $scope.validate = function() {
                        angular.forEach($scope.registElementNameList, function(value, index) {
                            $scope.validateSingle(value);
                        });
                        return $scope.formCtrl.$valid;
                    };

                    $scope.reset = function() {
                        allErrorObj = {};
                        $scope.formCtrl.$setPristine();
                        angular.forEach($scope.registElementNameList, function(value, index) {
                            $scope.removeError($scope.registElementObj[value], value);
                        });
                    };

                    $scope.removeRegist = function(elemName) {
                        if ($scope.registElementWatchObj[elemName]) {
                            $scope.registElementWatchObj[elemName]();
                            delete $scope.registElementWatchObj[elemName];
                        }
                        var index = $scope.registElementNameList.indexOf(elemName);
                        $scope.registElementNameList.splice(index, 1);
                        $scope.registElementObj[elemName].unbind('blur');
                        delete $scope.registElementObj[elemName];
                    };

                    var registerElementSingle = function(elemTypes, elemName, $elemItem) {
                        if (elemTypes.indexOf($elemItem[0].type) > -1 && !(!elemName || elemName.length === 0) && $scope.registElementNameList.indexOf(elemName) < 0) {// temp remove  !/^\d/.test(elemName)
                            $scope.registElementObj[elemName] = $elemItem;
                            $scope.registElementNameList.push(elemName);
                        }
                    };
                    var bindEditTrigRemove = function(elemName, target) {
                        $scope.registElementWatchObj[elemName] = $scope.$watch('formCtrl.' + elemName + target, function() {
                            $scope.removeError($scope.registElementObj[elemName], elemName);
                        }, true);
                    };
                    var bindBlurTrigCheck = function($elemItem, elemName) {
                        var blurTrigCheck = function() {
                            if (!($scope.config && $scope.config.option && $scope.config.option.blurTrigCheck)) {
                                return;
                            }
                            $timeout(function() {
                                if ($scope.formCtrl[elemName].$valid) {
                                    $scope.removeError($elemItem, elemName);
                                } else {
                                    $scope.showError($elemItem, elemName);
                                }
                            }, 50);
                        };
                        $elemItem.bind("blur", blurTrigCheck);
                    };

                    $scope.initElementSingle = function(elemName, $elemItem) {
                        var elemTypes = (($scope.config && $scope.config.elemTypes)?$scope.config.elemTypes:w5cValidator.elemTypes).toString();
                        registerElementSingle(elemTypes, elemName, $elemItem);
                        var editTrigRemove = matchConfig('editTrigRemove');
                        if (editTrigRemove) {
                            var target = editTrigRemove === 'valid'?'.$valid':'.$viewValue';
                            bindEditTrigRemove(elemName, target);
                        }
                        var blurTrigCheck = matchConfig('blurTrigCheck');
                        if (blurTrigCheck) {
                            bindBlurTrigCheck($elemItem, elemName);
                        }
                    };

                    var initElement = function() {
                        var elemTypes = (($scope.config && $scope.config.elemTypes)?$scope.config.elemTypes:w5cValidator.elemTypes).toString();
                        for (var i = 0; i < $element[0].elements.length; i++) {
                            var elemItem = $element[0].elements[i];
                            var $elemItem = angular.element(elemItem);
                            var elemName = elemItem.name;
                            registerElementSingle(elemTypes, elemName, $elemItem);
                        }
                        var editTrigRemove = matchConfig('editTrigRemove');
                        if (editTrigRemove) {
                            var target = editTrigRemove === 'valid'?'.$valid':'.$viewValue';
                            angular.forEach($scope.registElementNameList, function(value, index) {
                                bindEditTrigRemove(value, target);
                            });
                        }
                        var blurTrigCheck = matchConfig('blurTrigCheck');
                        if (blurTrigCheck) {
                            angular.forEach($scope.registElementObj, function(value, index) {
                                bindBlurTrigCheck(value, index);
                            });
                        }
                    };

                    var init = function() {
                        $scope.registElementObj = {};
                        $scope.registElementNameList = [];
                        $scope.registElementWatchObj = {};
                        $scope.formName = $attrs.name;
                        $scope.formCtrl = ctrls[1]?ctrls[1]:null;

                        if (!$scope.formName) {
                            throw Error("form must has name when use w5cFormValidate");
                        }
                        if (!$scope.formCtrl) {
                            throw Error("some error cause that w5cFormValidate can not get the controller of current form");
                        }

                        initElement();

                        if ($scope.action) {
                            $scope.action.reset = $scope.reset;
                            $scope.action.validate = $scope.validate;
                            $scope.action.validateSingle = $scope.validateSingle;
                            $scope.action.getError = $scope.getError;
                            $scope.action.getErrorIndex = $scope.getErrorIndex;
                            $scope.action.showErrorSingle = $scope.showErrorSingle;
                        }

                        $scope.execChildDirectiveInitFunc('init');
                    };

                    init();
                }
            }
        }
    ]);

    app.register.directive('w5cFormSubmit', ['$parse', 
        function($parse) {
            return {
                restrict: 'A',
                require: ['?^w5cFormValidate'],
                link: function($scope, $element, $attrs, ctrls) {
                    var $w5c;
                    var initFunc = function() {
                        var callback = $parse($attrs.w5cFormSubmit);
                        $element.bind("click", function ($event) {
                            if ($w5c.validate()) {
                                callback($scope, {$event: $event});
                            }
                        });
                    };
                    var init = function() { 
                        if (!ctrls[0]) {
                            return;
                        }
                        $w5c = ctrls[0].scope;
                        $w5c.registChildDirectiveInitFunc(initFunc);
                    };
                    init();
                }
            }
        }
    ]);

    app.register.directive('w5cDynamicElement', [
        function() {
            return {
                restrict: 'A',
                require: ['?^w5cFormValidate', '?ngModel'],
                link: function($scope, $element, $attrs, ctrls) {
                    var $w5c, $ngModel;
                    var initFunc = function() {
                        $ngModel = ctrls[1];
                        var dynamicName = $scope.$eval($attrs.w5cDynamicElement);

                        $ngModel.$name = dynamicName;
                        $element.attr('name', dynamicName);
                        $w5c.formCtrl.$addControl($ngModel);

                        $element.on('$destroy', function() {
                            $w5c.removeRegist(dynamicName);
                        });
                        $w5c.initElementSingle(dynamicName, $element);
                    };
                    var init = function() {
                        if (!ctrls[0] || !ctrls[1] || !$attrs.w5cDynamicElement) {
                            return;
                        }
                        $w5c = ctrls[0].scope;
                        $w5c.registChildDirectiveInitFunc(initFunc);
                    };
                    init();
                }
            };
        }
    ]);

    app.register.directive('w5cRepeat', ['$parse',
        function($parse) {
            return {
                restrict: 'A',
                require: ['?^w5cFormValidate', '?ngModel'],
                link: function($scope, $element, $attrs, ctrls) {
                    var $w5c, $ngModel;
                    var initFunc = function() {
                        $ngModel = ctrls[1];
                        var targetName = $scope.$eval($attrs.w5cRepeat);
                        var target = $w5c.formCtrl[targetName];
                        $ngModel.$parsers.push(function(value) {
                            $ngModel.$setValidity('repeat', value === target.$viewValue);
                            return value;
                        });
                        target.$parsers.push(function(value) {
                            target.$setValidity('repeat', value === $ngModel.$viewValue);
                            return value;
                        });
                    };
                    var init = function() {
                        if (!ctrls[0] || !ctrls[1] || !$attrs.w5cRepeat) {
                            return;
                        }
                        $w5c = ctrls[0].scope;
                        $w5c.registChildDirectiveInitFunc(initFunc);
                    };
                    init();
                }
            };
        }
    ]);

    app.register.directive('w5cCheck', ['$parse', 
        function($parse) {
            return {
                restrict: 'A',
                require: ['?^w5cFormValidate', '?ngModel'],
                link: function($scope, $element, $attrs, ctrls) {
                    var $w5c, $ngModel;
                    var initFunc = function() {
                        $ngModel = ctrls[1];
                        var callback = $parse($attrs.w5cCheck);
                        $ngModel.$parsers.push(function(value) {
                            $ngModel.$setValidity('w5cCheck', callback($scope, {value: value}));
                            return value;
                        });
                    };
                    var init = function() {
                        if (!ctrls[0] || !ctrls[1] || !$attrs.w5cCheck) {
                            return;
                        }
                        $w5c = ctrls[0].scope;
                        $w5c.registChildDirectiveInitFunc(initFunc);
                    };
                    init();
                }
            }
        }
    ]);

    app.register.directive('w5cMaxlength', [
        function() {
            return {
                restrict: 'A',
                require: ['?^w5cFormValidate', '?ngModel'],
                link: function($scope, $element, $attrs, ctrls) {
                    var $w5c, $ngModel;
                    var initFunc = function() {
                        $ngModel = ctrls[1];
                        $ngModel.$parsers.push(function(value) {
                            var max = $scope.$eval($attrs.w5cMaxlength);
                            $ngModel.$setValidity('w5cMaxlength', (value + '').length <= max);
                            return value;
                        });
                    };
                    var init = function() {
                        if (!ctrls[0] || !ctrls[1] || !$attrs.w5cMaxlength) {
                            return;
                        }
                        $w5c = ctrls[0].scope;
                        $w5c.registChildDirectiveInitFunc(initFunc);
                    };
                    init();
                }
            }
        }
    ]);

    app.register.directive('w5cMax', [
        function() {
            return {
                restrict: 'A',
                require: ['?^w5cFormValidate', '?ngModel'],
                link: function($scope, $element, $attrs, ctrls) {
                    var $w5c, $ngModel;
                    var initFunc = function() {
                        $ngModel = ctrls[1];
                        $ngModel.$parsers.push(function(value) {
                            var max = $scope.$eval($attrs.w5cMax);
                            var canEqual = $attrs.w5cMaxEqual?$scope.$eval($attrs.w5cMaxEqual):true;
                            $ngModel.$setValidity('w5cMax', canEqual?(value - 0 <= max):(value - 0 < max));
                            return value;
                        });
                    };
                    var init = function() {
                        if (!ctrls[0] || !ctrls[1] || !$attrs.w5cMax) {
                            return;
                        }
                        $w5c = ctrls[0].scope;
                        $w5c.registChildDirectiveInitFunc(initFunc);
                    };
                    init();
                }
            }
        }
    ]);

    app.register.directive('w5cMin', [
        function() {
            return {
                restrict: 'A',
                require: ['?^w5cFormValidate', '?ngModel'],
                link: function($scope, $element, $attrs, ctrls) {
                    var $w5c, $ngModel;
                    var initFunc = function() {
                        $ngModel = ctrls[1];
                        $ngModel.$parsers.push(function(value) {
                            var min = $scope.$eval($attrs.w5cMin);
                            var canEqual = $attrs.w5cMinEqual?$scope.$eval($attrs.w5cMinEqual):true;
                            $ngModel.$setValidity('w5cMin', canEqual?(value - 0 >= min):(value - 0 > min));
                            return value;
                        });
                    };
                    var init = function() {
                        if (!ctrls[0] || !ctrls[1] || !$attrs.w5cMin) {
                            return;
                        }
                        $w5c = ctrls[0].scope;
                        $w5c.registChildDirectiveInitFunc(initFunc);
                    };
                    init();
                }
            }
        }
    ]);

});