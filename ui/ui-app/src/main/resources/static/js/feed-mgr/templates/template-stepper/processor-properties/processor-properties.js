define(["require", "exports", "angular", "underscore", "../../module-name"], function (require, exports, angular, _, module_name_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var directive = function () {
        return {
            restrict: "EA",
            bindToController: {
                stepIndex: '@',
                cardTitle: '@',
                processorPropertiesFieldName: '@'
            },
            scope: {},
            controllerAs: 'vm',
            templateUrl: 'js/feed-mgr/templates/template-stepper/processor-properties/processor-properties.html',
            controller: "RegisterProcessorPropertiesController",
            link: function ($scope, element, attrs, controller) {
            }
        };
    };
    var RegisterProcessorPropertiesController = /** @class */ (function () {
        function RegisterProcessorPropertiesController($scope, $element, $http, $q, $mdToast, $location, $window, RestUrlService, RegisterTemplateService, FeedService, UiComponentsService) {
            this.$scope = $scope;
            this.$element = $element;
            this.$http = $http;
            this.$q = $q;
            this.$mdToast = $mdToast;
            this.$location = $location;
            this.$window = $window;
            this.RestUrlService = RestUrlService;
            this.RegisterTemplateService = RegisterTemplateService;
            this.FeedService = FeedService;
            this.UiComponentsService = UiComponentsService;
            var self = this;
            this.model = RegisterTemplateService.model;
            this.isValid = true;
            /**
             * List of available expression properties.
             * @type {Object[]}
             */
            self.availableExpressionProperties = RegisterTemplateService.propertyList;
            /**
             * Expression properties for auto-complete.
             * @type {Object[]}
             */
            self.expressionProperties = self.availableExpressionProperties;
            //BroadcastService.subscribe($scope,StepperService.ACTIVE_STEP_EVENT,onActiveStep)
            //Filter attrs
            this.stepNumber = parseInt(this.stepIndex) + 1;
            this.propertiesThatNeedAttention = false;
            this.showOnlySelected = false;
            this.filterString = null;
            self.propertyRenderTypes = [];
            self.processors = [];
            self.visiblePropertyCount = 0;
            self.allProperties = [];
            function transformPropertiesToArray() {
                var propertiesKey = self.processorPropertiesFieldName + "Properties";
                var processorsKey = self.processorPropertiesFieldName + "Processors";
                self.allProperties = _.filter(self.model[propertiesKey], function (prop) { return prop.hidden == undefined || prop.hidden == false; });
                // Find controller services
                _.chain(self.allProperties).filter(function (property) {
                    return angular.isObject(property.propertyDescriptor) && angular.isString(property.propertyDescriptor.identifiesControllerService);
                })
                    .each(FeedService.findControllerServicesForProperty);
                self.processors = self.model[processorsKey];
                if (self.showOnlySelected) {
                    showSelected();
                }
            }
            function showSelected() {
                var selectedProperties = [];
                angular.forEach(self.allProperties, function (property) {
                    if (property.selected) {
                        selectedProperties.push(property);
                    }
                });
                //sort them by processor name and property key
                var propertiesAndProcessors = RegisterTemplateService.sortPropertiesForDisplay(selectedProperties);
                self.allProperties = propertiesAndProcessors.properties;
                self.processors = propertiesAndProcessors.processors;
            }
            this.onShowOnlySelected = function () {
                transformPropertiesToArray();
            };
            this.changedPropertyInput = function (property) {
                property.changed = true;
            };
            this.keydownPropertyInput = function (property) {
                if (!property.changed && property.sensitive) {
                    property.value = "";
                }
            };
            this.onRenderTypeChange = function (property) {
                if (property.renderType == 'select' && (property.propertyDescriptor.allowableValues == undefined || property.propertyDescriptor.allowableValues == null || property.propertyDescriptor.allowableValues.length == 0)) {
                    if (property.selectOptions == undefined) {
                        property.selectOptions = [];
                    }
                    property.renderOptions['selectCustom'] = 'true';
                }
                else {
                    property.renderOptions['selectCustom'] = 'false';
                    property.selectOptions = undefined;
                    if (property.renderType == 'password') {
                        property.sensitive = true;
                    }
                }
            };
            this.customSelectOptionChanged = function (property) {
                var str = JSON.stringify(property.selectOptions);
                property.renderOptions['selectOptions'] = str;
            };
            function initializeRenderTypes() {
                angular.forEach(RegisterTemplateService.codemirrorTypes, function (label, type) {
                    self.propertyRenderTypes.push({ type: type, label: label, codemirror: true });
                });
            }
            $scope.$watch(function () {
                return RegisterTemplateService.codemirrorTypes;
            }, function (newVal) {
                initializeRenderTypes();
            });
            $scope.$watchCollection(function () {
                return self.model[self.processorPropertiesFieldName];
            }, function () {
                transformPropertiesToArray();
                //  self.processors = filterProcessors(self.propertiesThatNeedAttention, self.showOnlySelected);
                //  countVisibleProperties();
            });
            // $anchorScroll.yOffset = 200;
            this.searchExpressionProperties = function (term) {
                self.expressionProperties = self.availableExpressionProperties.filter(function (property) {
                    return (property.key.toUpperCase().indexOf(term.toUpperCase()) >= 0);
                });
                return $q.when(self.expressionProperties);
            };
            this.getExpressionPropertyTextRaw = function (item) {
                return '${' + item.key + '}';
            };
            this.inputProcessorSelectionInvalid = function () {
                var selectedList = _.filter(self.model.inputProcessors, function (processor) {
                    return processor.selected;
                });
                if (selectedList == null || selectedList.length == 0) {
                    self.isValid = false;
                    return true;
                }
                else {
                    self.isValid = true;
                    return false;
                }
            };
            this.minProcessorItems = function () {
                var windowHeight = angular.element($window).height();
                var newHeight = windowHeight - 450;
                var processorHeight = 48;
                var minItems = Math.round(newHeight / processorHeight);
                return minItems;
            };
            this.scrollToProcessor = function (processor) {
                var topIndex = processor.topIndex;
                self.topIndex = topIndex;
            };
            // Update expression properties when table option changes
            $scope.$watch(function () {
                return self.model.templateTableOption;
            }, function () {
                if (self.model.templateTableOption !== "NO_TABLE" && angular.isArray(RegisterTemplateService.propertyList)) {
                    UiComponentsService.getTemplateTableOptionMetadataProperties(self.model.templateTableOption)
                        .then(function (tableOptionMetadataProperties) {
                        self.availableExpressionProperties = RegisterTemplateService.propertyList.concat(tableOptionMetadataProperties);
                    });
                }
                else {
                    self.availableExpressionProperties = RegisterTemplateService.propertyList;
                }
            });
        }
        ;
        return RegisterProcessorPropertiesController;
    }());
    exports.RegisterProcessorPropertiesController = RegisterProcessorPropertiesController;
    angular.module(module_name_1.moduleName).controller('RegisterProcessorPropertiesController', ["$scope", "$element", "$http", "$q", "$mdToast", "$location", "$window", "RestUrlService", "RegisterTemplateService", "FeedService", "UiComponentsService", RegisterProcessorPropertiesController]);
    angular.module(module_name_1.moduleName)
        .directive('thinkbigRegisterProcessorProperties', directive);
});
//# sourceMappingURL=processor-properties.js.map