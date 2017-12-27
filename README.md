# w5cFormValidate
rewrite why520crazy/angular-w5c-validator , to fit my project

rewrite from https://github.com/why520crazy/angular-w5c-validator

# 使用方式

加载w5cFormValidate服务，form元素w5c-form-validate属性传入配置触发，action属性接受方法注入，form元素要求有name，配置novalidate属性，通过w5c_validate_form样式获得样式

全局配置可通过w5cValidator来进行

# 参数列表

## w5cFormValidate指令

### 指令参数 

| html属性 | 必填 | 描述 |
| -------- | --- | --- |
| w5c-form-validate | true | 触发指令，可传入配置，内容见子参数 |
| action | false | 向外暴露指令内部的方法，配置action为空对象，指令会在初始化时向其中注入属性，子属性见下表 |
| name | true | 表单name |
| class | false | 配合样式 |
| novalidate | false | 取消浏览器自带的提示效果 |
| autocomplete | false | 取消浏览器自带的自动补全效果 |

### w5c-form-validate子参数  

| 参数 | 子参数 | 必填 | 描述 | 默认值 |
| --- | ----| --- | ----- | ----- |
| rules |     | false | 对象，key为元素name，value为错误名对应错误提示语的对象 |   |
| replaceMap |  | false | 对象，key为提示语里花括号内的标记，value为字符串时，表示从该元素属性取值，为对象时，从对象的flag属性值指定的元素属性里取值，但传到对象的handle属性指定的函数里处理并取返回值 |   |
| replaceValue |  | false | 对象，如果replaceMap中没有取到值，会从此处取默认值 |   |
| elemTypes |  | false | 数组，支持的元素类型 |  |
| option |  | false | 对象 |  |
|   | blurTrigCheck | false | 布尔值，是否开启失焦触发检查 | false |
|   | editTrigRemove | false | 布尔值或字符串‘valid’，是否开启编辑触发取消报错，如果为‘valid’，则在验证通过时取消报错 | true |
|   | showError | false | false或函数，是否显示报错，如果为false，则不显示，如果为函数，则接受$elemItem, errorMessages, $scope参数执行，$elemItem为jquery元素，errorMessages为错误字符串数组，$scope为指令内部scope | function |
|   | removeError | false | false或函数，是否移除报错，如果为false，则不移除，如果为函数，则接受$elemItem, $scope参数执行，$elemItem为jquery元素，$scope为指令内部scope | function |

### action子属性  

| 属性 | 子属性 | 参数 | 描述 |
| --- | ----| --- | ----- |
| reset |      |  | 重置表单状态，遍历调用所有removeError |
| validate |      |  | 验证整个表单，返回布尔值 |
| validateSingle |      | elemName，必填，待验证元素name | 验证单个元素 |
| getError |      | elemName，非必填，指定元素name | 获取指定元素或整个表单的错误信息 |
| getErrorIndex |      | elemName，非必填，指定元素name | 获取指定元素或整个表单的angular表单验证$error错误索引 |
| showErrorSingle |      | elemName，必填，指定元素name，errorMessage，必填，错误信息字符串 | 在指定元素上显示错误状态，无法覆盖angular表单验证错误 |

## w5cValidator Provider

### Provider方法 

| 方法 | 参数 | 描述 |
| -------- | --- | --- |
| setConfig | config | 全局配置，等同于w5c-form-validate子参数 |

## w5cFormSubmit指令

### 指令参数 

| html属性 | 必填 | 描述 |
| -------- | --- | --- |
| w5c-form-submit | true | 传入函数()，验证通过后执行 |

## w5cDynamicElement指令

### 指令参数 

| html属性 | 必填 | 描述 |
| -------- | --- | --- |
| w5c-dynamic-element | true | 传入表达式，动态生成name注册，在ng-if与ng-repeat等后续生成元素场景应用 |

## w5cRepeat指令

### 指令参数 

| html属性 | 必填 | 描述 |
| -------- | --- | --- |
| w5c-repeat | true | 传入表达式，主元素的name，两者值相等时通过验证 |

## w5cCheck指令

### 指令参数 

| html属性 | 必填 | 描述 |
| -------- | --- | --- |
| w5c-check | true | 传入接收value参数的函数(value)，返回false报错，返回true通过 |

## w5cMaxlength指令

### 指令参数 

| html属性 | 必填 | 描述 |
| -------- | --- | --- |
| w5c-max-length | true | 接收表达式或数字，解决maxlength属性直接阻止输入超出部分且无报错的问题 |

## w5cMax指令

### 指令参数 

| html属性 | 必填 | 描述 |
| -------- | --- | --- |
| w5c-max | true | 接收表达式或数字，解决number有箭头且无法限制“不等于”的问题，默认可以等于 |
| w5c-max-equal | false | 接收返回布尔值的表达式，为false时如果相等会报错 |

## w5cMin指令

### 指令参数 

| html属性 | 必填 | 描述 |
| -------- | --- | --- |
| w5c-min | true | 接收表达式或数字，解决number有箭头且无法限制“不等于”的问题，默认可以等于 |
| w5c-min-equal | false | 接收返回布尔值的表达式，为false时如果相等会报错 |

# 注意事项

本示例使用了button、text、form_table、w5cFormValidate样式。

form和表单元素需要name。

# 使用效果

</div>

<div ng-controller="w5cFormValidateDemoController">
    <form w5c-form-validate="config" action="action" name="w5cdemo" class="w5c_validate_form" novalidate>
        <div class="form_table">
            <div class="form_tr">
                <div class="form_td title" style="width: 200px;">
                    <label>普通输入框</label>
                </div>
                <div class="form_td content" style="width: 500px;">
                    <input class="text" type="text" name="demoinput" required ng-pattern="/^\d+$/" w5c-maxlength="5" minlength="2" ng-model="demoinput" style="width: 100%;">
                </div>
                <div class="form_td annotate">
                    普通输入框，必填，数字，最大长度5，最小长度2
                </div>
            </div>
            <div class="form_tr">
                <div class="form_td title" style="width: 200px;">
                    <label>普通输入框1</label>
                </div>
                <div class="form_td content" style="width: 500px;">
                    <input class="text" type="text" name="demoinput1" required ng-pattern="/^\d+$/" ng-model="demoinput1" w5c-validate-name="普通输入框1" style="width: 100%;">
                </div>
                <div class="form_td annotate">
                    普通输入框，必填，数字，w5c-validate-name
                </div>
            </div>
            <div class="form_tr">
                <div class="form_td title" style="width: 200px;">
                    <label>重复普通输入框1</label>
                </div>
                <div class="form_td content" style="width: 500px;">
                    <input class="text" type="text" name="demoinputrepeat" required w5c-repeat="'demoinput1'" ng-model="demoinputrepeat" style="width: 100%;">
                </div>
                <div class="form_td annotate">
                    重复普通输入框1
                </div>
            </div>
            <div class="form_tr">
                <div class="form_td title" style="width: 200px;">
                    <label>数字输入框</label>
                </div>
                <div class="form_td content" style="width: 500px;">
                    <input class="text" type="number" name="demoinput2" required max="10" min="5" ng-model="demoinput2" style="width: 100%;">
                </div>
                <div class="form_td annotate">
                    数字输入框，必填，5-10之间
                </div>
            </div>
            <div class="form_tr" ng-repeat="item in repeat">
                <div class="form_td title" style="width: 200px;">
                    <label>循环生成输入框-{{$index}}</label>
                </div>
                <div class="form_td content" style="width: 500px;">
                    <input class="text" type="text" w5c-dynamic-element="'repeatName' + $index" required ng-model="demoinputdynamic[$index]" style="width: 100%;">
                </div>
                <div class="form_td annotate">
                    循环生成的普通输入框，必填
                </div>
            </div>
            <div class="form_tr">
                <div class="form_td title" style="width: 200px;">
                    <label>ng-if输入框</label>
                </div>
                <div class="form_td content" style="width: 500px;">
                    <input class="text" type="text" w5c-dynamic-element="'ngifdemo'" ng-if="!ngifswitch" required ng-model="demoinputngif" style="width: 100%;">
                </div>
                <div class="form_td annotate">
                    <div class="btn" ng-click="ngifswitch = !ngifswitch">ng-if切换</div>
                    ng-if控制的输入框
                </div>
            </div>
            <div class="form_tr">
                <div class="form_td title" style="width: 200px;">
                    <label>采用自定义验证的输入框</label>
                </div>
                <div class="form_td content" style="width: 500px;">
                    <input class="text" type="text" name="demoinputcheck" required w5c-check="w5cCheck(value)" ng-model="demoinputcheck" style="width: 100%;">
                </div>
                <div class="form_td annotate">
                    采用自定义验证的输入框，必填，奇数
                </div>
            </div>
            <div class="form_tr">
                <div class="form_td title" style="width: 200px;">
                    <label>文本输入数字</label>
                </div>
                <div class="form_td content" style="width: 500px;">
                    <input class=text" type="text" name="demoinputnumber" required w5c-max="10" w5c-max-equal="false" w5c-min="5" ng-model="demoinputnumber" style="width: 100%;">
                </div>
                <div class="form_td annotate">
                    文本输入数字，避免type=number导致的上下箭头，允许判断是否等于，5-10之间，可以等于五，不能等于10，必填
                </div>
            </div>
            <div class="form_tr">
                <div class="form_td title">
                    <label>提交按钮</label>
                </div>
                <div class="form_td content">
                    <div class="btn" w5c-form-submit="ok($event)">提交</div>
                </div>
                <div class="form_td annotate">
                    提交按钮
                </div>
            </div>
            <div class="form_tr">
                <div class="form_td title">
                    <label>重置</label>
                </div>
                <div class="form_td content">
                    <div class="btn" ng-click="action.reset()">重置</div>
                </div>
                <div class="form_td annotate">
                    重置表单状态
                </div>
            </div>
            <div class="form_tr">
                <div class="form_td title">
                    <label>验证</label>
                </div>
                <div class="form_td content">
                    <div class="btn" ng-click="action.validate()">触发验证</div>
                </div>
                <div class="form_td annotate">
                    触发验证
                </div>
            </div>
            <div class="form_tr">
                <div class="form_td title">
                    <label>获取错误</label>
                </div>
                <div class="form_td content">
                    <div class="btn" ng-click="errors = action.getError()">获取错误</div>
                    <div class="btn" ng-click="errors = action.getError('demoinput1')">获取特定元素错误</div>
                    <div>{{errors}}</div>
                </div>
                <div class="form_td annotate">
                    获取当前错误列表或特定元素错误
                </div>
            </div>
            <div class="form_tr">
                <div class="form_td title">
                    <label>获取错误</label>
                </div>
                <div class="form_td content">
                    <div class="btn" ng-click="errorsIndex = action.getErrorIndex()">获取错误索引</div>
                    <div class="btn" ng-click="errorsIndex = action.getErrorIndex('demoinput1')">获取特定元素错误索引</div>
                    <div>{{errorsIndex}}</div>
                </div>
                <div class="form_td annotate">
                    从angular表单验证部分获取当前错误索引列表或特定元素错误索引
                </div>
            </div>
            <div class="form_tr">
                <div class="form_td title">
                    <label>单独验证</label>
                </div>
                <div class="form_td content">
                    <div class="btn" ng-click="action.validateSingle('demoinput1')">单独验证</div>
                </div>
                <div class="form_td annotate">
                    单独验证某个元素
                </div>
            </div>
            <div class="form_tr">
                <div class="form_td title">
                    <label>强行置错</label>
                </div>
                <div class="form_td content">
                    <div class="btn" ng-click="action.showErrorSingle('demoinput1', '强行置错示例')">强行置错</div>
                </div>
                <div class="form_td annotate">
                    在一个元素上显示错误提示与错误效果，但不涉及到angular自身表单验证
                </div>
            </div>
        </div>
    </form>
</div>

