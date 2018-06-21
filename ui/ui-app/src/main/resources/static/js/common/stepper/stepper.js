define(["require", "exports", "angular", "../module-name", "underscore"], function (require, exports, angular, module_name_1, _) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var controller = /** @class */ (function () {
        function controller($scope, $attrs, $element, StepperService, Utils, BroadcastService, WindowUnloadService) {
            var _this = this;
            this.$scope = $scope;
            this.$attrs = $attrs;
            this.$element = $element;
            this.StepperService = StepperService;
            this.Utils = Utils;
            this.BroadcastService = BroadcastService;
            this.WindowUnloadService = WindowUnloadService;
            this.initialize = function () {
                _this.$scope.templateUrl = _this.templateUrl;
                _this.$scope.stepperName = _this.stepperName;
                _this.$scope.totalSteps = _this.totalSteps;
                _this.Utils.waitForDomElementReady('md-tab-item', function () {
                    _this.$element.find('md-tab-item:not(:last)').addClass('arrow-tab');
                });
                _this.previousStepIndex = null;
                if (_this.stepperName == undefined || _this.stepperName == '') {
                    _this.stepperName = _this.StepperService.newStepperName();
                }
                _this.StepperService.registerStepper(_this.stepperName, _this.totalSteps);
                _this.steps = _this.StepperService.getSteps(_this.stepperName);
                //set the pre-steps
                if (angular.isDefined(_this.coreDataModel) && angular.isDefined(_this.coreDataModel.totalPreSteps) && _this.coreDataModel.totalPreSteps > 0) {
                    _this.preSteps = _this.steps.slice(0, _this.coreDataModel.totalPreSteps);
                }
                if (angular.isNumber(_this.selectedStepIndex) || angular.isString(_this.selectedStepIndex)) {
                    // Complete previous steps
                    for (var i = 0; i < _this.selectedStepIndex; ++i) {
                        _this.steps[i].complete = true;
                        _this.steps[i].disabled = false;
                        _this.steps[i].visited = true;
                        _this.steps[i].updateStepType();
                    }
                    // Active current step
                    _this.steps[_this.selectedStepIndex].disabled = false;
                    _this.steps[_this.selectedStepIndex].visited = true;
                    _this.steps[_this.selectedStepIndex].updateStepType();
                }
                else {
                    _this.selectedStepIndex = 0;
                }
            };
            this.getCountOfActiveSteps = function () {
                return _.filter(_this.StepperService.getSteps(_this.stepperName), function (step) { return step.active; }).length;
            };
            this.goToFirstStep = function () {
                _this.selectedStepIndex = 0;
            };
            this.onStepSelect = function (index) {
            };
            this.resetAndGoToFirstStep = function () {
                angular.forEach(_this.steps, function (step) {
                    step.reset();
                });
                _this.selectedStepIndex = 0;
            };
            this.deactivateStep = function (index) {
                _this.StepperService.deactivateStep(_this.stepperName, index);
            };
            this.activateStep = function (index) {
                _this.StepperService.activateStep(_this.stepperName, index);
            };
            this.resetStep = function (index) {
                var step = _this.StepperService.getStep(_this.stepperName, index);
                if (angular.isDefined(step)) {
                    step.reset();
                    _this.BroadcastService.notify(_this.StepperService.STEP_STATE_CHANGED_EVENT, index);
                }
            };
            this.stepDisabled = function (index) {
                _this.StepperService.stepDisabled(_this.stepperName, index);
                _this.BroadcastService.notify(_this.StepperService.STEP_STATE_CHANGED_EVENT, index);
            };
            this.stepEnabled = function (index) {
                _this.StepperService.stepEnabled(_this.stepperName, index);
                _this.BroadcastService.notify(_this.StepperService.STEP_STATE_CHANGED_EVENT, index);
            };
            this.getStep = function (index) {
                if (typeof index == 'string') {
                    index = parseInt(index);
                }
                return _this.StepperService.getStep(_this.stepperName, index);
            };
            this.nextActiveStep = function (index) {
                return _this.StepperService.nextActiveStep(_this.stepperName, index);
            };
            this.previousActiveStep = function (index) {
                return _this.StepperService.previousActiveStep(_this.stepperName, index);
            };
            this.arePreviousStepsDisabled = function (index) {
                return _this.StepperService.arePreviousStepsDisabled(_this.stepperName, index);
            };
            this.arePreviousStepsComplete = function (index) {
                return _this.StepperService.arePreviousStepsComplete(_this.stepperName, index);
            };
            this.cancelStepper = function () {
                if (_this.onCancelStepper) {
                    _this.onCancelStepper();
                }
            };
            this.showCancel = function () {
                return (_this.showCancelButton != undefined ? _this.showCancelButton : true);
            };
            this.assignStepName = function (step, name) {
                step.stepName = name;
                _this.StepperService.assignedStepName(_this.stepperName, step);
            };
            this.getStepByName = function (stepName) {
                return _this.StepperService.getStepByName(_this.stepperName, stepName);
            };
            this.completeStep = function (index) {
                var step = _this.getStep(index);
                step.complete = true;
                step.updateStepType();
            };
            this.incompleteStep = function (index) {
                var step = _this.getStep(index);
                step.complete = false;
                step.updateStepType();
            };
            this.showProgress = false;
            this.height = 80;
            /**
             * Array of all steps for the stepper
             * @type {Array}
             */
            this.steps = [];
            /**
             * Any steps to be rendered at the beginning
             * @type {Array}
             */
            this.preSteps = [];
            this.getStartingIndex = function (index) {
                return index + this.preSteps.length;
            };
            $scope.$watch(function () {
                return _this.selectedStepIndex;
            }, function (current, old) {
                //Broadcast that we changed steps
                BroadcastService.notify(StepperService.STEP_CHANGED_EVENT, { newStep: current, oldStep: old });
                WindowUnloadService.clear();
                _this.previousStepIndex = old;
                // Update step
                var step = _this.getStep(current);
                if (step != null) {
                    var shouldSkip = (step.skip && !step.visited);
                    step.visited = true;
                    step.updateStepType();
                    BroadcastService.notify(StepperService.ACTIVE_STEP_EVENT, current);
                    // Skip if necessary
                    if (shouldSkip) {
                        _this.stepEnabled(step.nextActiveStepIndex);
                        _this.completeStep(step.index);
                        ++_this.selectedStepIndex;
                    }
                }
            });
            if (this.onInitialized && angular.isFunction(this.onInitialized())) {
                this.onInitialized()(this);
            }
            this.initialize();
            $scope.$on('$destroy', function () {
                StepperService.deRegisterStepper(_this.stepperName);
                _this.steps = [];
            });
        }
        return controller;
    }());
    exports.default = controller;
    angular.module(module_name_1.moduleName).controller('StepperController', ["$scope", "$attrs", "$element", "StepperService", "Utils", "BroadcastService", "WindowUnloadService", controller]);
    angular.module(module_name_1.moduleName).directive("thinkbigStepper", ['$compile', '$templateRequest', function ($compile, $templateRequest) {
            return {
                restrict: "EA",
                bindToController: {
                    totalSteps: '@',
                    stepperName: '@',
                    onCancelStepper: '&?',
                    showCancelButton: '@',
                    coreDataModel: '=?',
                    templateUrl: '@',
                    selectedStepIndex: '@',
                    onInitialized: '&?'
                },
                controllerAs: 'vm',
                require: ['thinkbigStepper'],
                scope: {},
                controller: "StepperController",
                compile: function (element, attrs) {
                    return {
                        pre: function preLink($scope, $element, iAttrs, controller) {
                        },
                        post: function postLink($scope, $element, iAttrs, controller) {
                            $templateRequest(iAttrs.templateUrl).then(function (html) {
                                // Convert the html to an actual DOM node
                                var template = angular.element(html);
                                // Append it to the directive element
                                $element.append(template);
                                // And let Angular $compile it
                                $compile(template)($scope);
                                $element.find('md-tabs-wrapper:first').append('  <div class="step-progressbar"  style="display:block;"></div>');
                                var progressBar = $compile('<md-progress-linear md-mode="indeterminate" ng-if="vm.showProgress"></md-progress-linear>')($scope);
                                $element.find('.step-progressbar').append(progressBar);
                            });
                        }
                    };
                }
            };
        }
    ]);
});
//# sourceMappingURL=stepper.js.map