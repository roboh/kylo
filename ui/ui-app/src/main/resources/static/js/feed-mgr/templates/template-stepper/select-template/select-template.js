define(["require", "exports", "angular", "underscore", "../../module-name"], function (require, exports, angular, _, module_name_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var directive = function () {
        return {
            restrict: "EA",
            require: ['thinkbigRegisterSelectTemplate', '^thinkbigStepper'],
            bindToController: {
                stepIndex: '@',
                nifiTemplateId: '=?',
                registeredTemplateId: "=?"
            },
            scope: {},
            controllerAs: 'vm',
            templateUrl: 'js/feed-mgr/templates/template-stepper/select-template/select-template.html',
            controller: "RegisterSelectTemplateController",
            link: function ($scope, element, attrs, controllers) {
                var thisController = controllers[0];
                var stepperController = controllers[1];
                thisController.stepperController = stepperController;
                if (thisController && thisController.isLoading()) {
                    stepperController.showProgress = true;
                }
            }
        };
    };
    var RegisterSelectTemplateController = /** @class */ (function () {
        function RegisterSelectTemplateController($scope, $http, $mdDialog, $mdToast, $timeout, $q, $state, RestUrlService, RegisterTemplateService, StateService, AccessControlService, EntityAccessControlService, UiComponentsService, AngularModuleExtensionService, BroadcastService) {
            this.$scope = $scope;
            this.$http = $http;
            this.$mdDialog = $mdDialog;
            this.$mdToast = $mdToast;
            this.$timeout = $timeout;
            this.$q = $q;
            this.$state = $state;
            this.RestUrlService = RestUrlService;
            this.RegisterTemplateService = RegisterTemplateService;
            this.StateService = StateService;
            this.AccessControlService = AccessControlService;
            this.EntityAccessControlService = EntityAccessControlService;
            this.UiComponentsService = UiComponentsService;
            this.AngularModuleExtensionService = AngularModuleExtensionService;
            this.BroadcastService = BroadcastService;
            var self = this;
            this.templates = [];
            this.model = RegisterTemplateService.model;
            this.stepNumber = parseInt(this.stepIndex) + 1;
            this.template = null;
            this.stepperController = null;
            this.registeredTemplateId = this.model.id;
            this.nifiTemplateId = this.model.nifiTemplateId;
            this.isValid = this.registeredTemplateId !== null;
            /**
             * Error message to be displayed if {@code isValid} is false
             * @type {null}
             */
            this.errorMessage = null;
            /**
             * Indicates if admin operations are allowed.
             * @type {boolean}
             */
            self.allowAdmin = false;
            /**
             * Indicates if edit operations are allowed.
             * @type {boolean}
             */
            self.allowEdit = false;
            /**
             * Flag to indicate the template is loading
             * Used for PRogress
             * @type {boolean}
             */
            self.loadingTemplate = false;
            /**
             * Flag to indicate the select template list is loading
             * @type {boolean}
             */
            self.fetchingTemplateList = false;
            this.templateNavigationLinks = AngularModuleExtensionService.getTemplateNavigation();
            /**
             * The possible options to choose how this template should be displayed in the Feed Stepper
             * @type {Array.<TemplateTableOption>}
             */
            self.templateTableOptions = [{ type: 'NO_TABLE', displayName: 'No table customization', description: 'User will not be given option to customize destination table' }];
            UiComponentsService.getTemplateTableOptions()
                .then(function (templateTableOptions) {
                Array.prototype.push.apply(self.templateTableOptions, templateTableOptions);
            });
            // setup the Stepper types
            var initTemplateTableOptions = function () {
                if (self.model.templateTableOption == null) {
                    if (self.model.defineTable) {
                        self.model.templateTableOption = 'DEFINE_TABLE';
                    }
                    else if (self.model.dataTransformation) {
                        self.model.templateTableOption = 'DATA_TRANSFORMATION';
                    }
                    else if (self.model.reusableTemplate) {
                        self.model.templateTableOption = 'COMMON_REUSABLE_TEMPLATE';
                    }
                    else {
                        self.model.templateTableOption = 'NO_TABLE';
                    }
                }
            };
            function showProgress() {
                if (self.stepperController) {
                    self.stepperController.showProgress = true;
                }
            }
            function hideProgress() {
                if (self.stepperController && !self.isLoading()) {
                    self.stepperController.showProgress = false;
                }
            }
            function findSelectedTemplate() {
                if (self.nifiTemplateId != undefined) {
                    return _.find(self.templates, function (template) {
                        return template.id == self.nifiTemplateId;
                    });
                }
                else {
                    return null;
                }
            }
            this.isLoading = function () {
                return self.loadingTemplate || self.fetchingTemplateList || self.model.loading;
            };
            /**
             * Navigate the user to the state
             * @param link
             */
            this.templateNavigationLink = function (link) {
                var templateId = self.registeredTemplateId;
                var templateName = self.model.templateName;
                $state.go(link.sref, { templateId: templateId, templateName: templateName, model: self.model });
            };
            /**
             * Gets the templates for the select dropdown
             * @returns {HttpPromise}
             */
            this.getTemplates = function () {
                self.fetchingTemplateList = true;
                showProgress();
                RegisterTemplateService.getTemplates().then(function (response) {
                    self.templates = response.data;
                    self.fetchingTemplateList = false;
                    matchNiFiTemplateIdWithModel();
                    hideProgress();
                });
            };
            /**
             * Ensure that the value for the select list matches the model(if a model is selected)
             */
            function matchNiFiTemplateIdWithModel() {
                if (!self.isLoading() && self.model.nifiTemplateId != self.nifiTemplateId) {
                    var matchingTemplate = self.templates.find(function (template) {
                        var found = angular.isDefined(template.templateDto) ? template.templateDto.id == self.model.nifiTemplateId : template.id == self.model.nifiTemplateId;
                        if (!found) {
                            //check on template name
                            found = self.model.templateName == template.name;
                        }
                        return found;
                    });
                    if (angular.isDefined(matchingTemplate)) {
                        self.nifiTemplateId = matchingTemplate.templateDto.id;
                    }
                }
            }
            /**
             * Called either after the the template has been selected from the previous screen, or after the template select list is loaded
             */
            function onRegisteredTemplateLoaded() {
                matchNiFiTemplateIdWithModel();
            }
            /**
             * Get notified when a already registered template is selected and loaded from the previous screen
             */
            BroadcastService.subscribe($scope, "REGISTERED_TEMPLATE_LOADED", onRegisteredTemplateLoaded);
            this.changeTemplate = function () {
                self.errorMessage = null;
                self.loadingTemplate = true;
                showProgress();
                //Wait for the properties to come back before allowing hte user to go to the next step
                var selectedTemplate = findSelectedTemplate();
                var templateName = null;
                if (selectedTemplate != null && selectedTemplate != undefined) {
                    templateName = selectedTemplate.name;
                }
                RegisterTemplateService.loadTemplateWithProperties(null, self.nifiTemplateId, templateName).then(function (response) {
                    RegisterTemplateService.warnInvalidProcessorNames();
                    $q.when(RegisterTemplateService.checkTemplateAccess()).then(function (accessResponse) {
                        self.isValid = accessResponse.isValid;
                        self.allowAdmin = accessResponse.allowAdmin;
                        self.allowEdit = accessResponse.allowEdit;
                        self.allowAccessControl = accessResponse.allowAccessControl;
                        if (!accessResponse.isValid) {
                            //PREVENT access
                            self.errorMessage = "Access Denied.  You are unable to edit the template. ";
                        }
                        else {
                            if (!self.allowAccessControl) {
                                //deactivate the access control step
                                self.stepperController.deactivateStep(3);
                            }
                            else {
                                self.stepperController.activateStep(3);
                            }
                        }
                        self.loadingTemplate = false;
                        hideProgress();
                    });
                }, function (err) {
                    RegisterTemplateService.resetModel();
                    self.errorMessage = (angular.isDefined(err.data) && angular.isDefined(err.data.message)) ? err.data.message : "An Error was found loading this template.  Please ensure you have access to edit this template.";
                    self.loadingTemplate = false;
                    hideProgress();
                });
            };
            this.disableTemplate = function () {
                if (self.model.id) {
                    RegisterTemplateService.disableTemplate(self.model.id);
                }
            };
            this.enableTemplate = function () {
                if (self.model.id) {
                    RegisterTemplateService.enableTemplate(self.model.id);
                }
            };
            function deleteTemplateError(errorMsg) {
                // Display error message
                var msg = "<p>The template cannot be deleted at this time.</p><p>";
                msg += angular.isString(errorMsg) ? _.escape(errorMsg) : "Please try again later.";
                msg += "</p>";
                $mdDialog.hide();
                $mdDialog.show($mdDialog.alert()
                    .ariaLabel("Error deleting the template")
                    .clickOutsideToClose(true)
                    .htmlContent(msg)
                    .ok("Got it!")
                    .parent(document.body)
                    .title("Error deleting the template"));
            }
            this.deleteTemplate = function () {
                if (self.model.id) {
                    RegisterTemplateService.deleteTemplate(self.model.id).then(function (response) {
                        if (response.data && response.data.status == 'success') {
                            self.model.state = "DELETED";
                            $mdToast.show($mdToast.simple()
                                .textContent('Successfully deleted the template ')
                                .hideDelay(3000));
                            RegisterTemplateService.resetModel();
                            StateService.FeedManager().Template().navigateToRegisteredTemplates();
                        }
                        else {
                            deleteTemplateError(response.data.message);
                        }
                    }, function (response) {
                        deleteTemplateError(response.data.message);
                    });
                }
            };
            /**
             * Displays a confirmation dialog for deleting the feed.
             */
            this.confirmDeleteTemplate = function () {
                var $dialogScope = $scope.$new();
                $dialogScope.dialog = $mdDialog;
                $dialogScope.vm = self;
                $mdDialog.show({
                    escapeToClose: false,
                    fullscreen: true,
                    parent: angular.element(document.body),
                    scope: $dialogScope,
                    templateUrl: "js/feed-mgr/templates/template-stepper/select-template/template-delete-dialog.html"
                });
            };
            /**
             * Called when the user changes the radio buttons
             */
            this.onTableOptionChange = function () {
                if (self.model.templateTableOption === 'DEFINE_TABLE') {
                    self.model.defineTable = true;
                    self.model.dataTransformation = false;
                }
                else if (self.model.templateTableOption === 'DATA_TRANSFORMATION') {
                    self.model.defineTable = false;
                    self.model.dataTransformation = true;
                }
                else {
                    self.model.defineTable = false;
                    self.model.dataTransformation = false;
                }
            };
            $scope.$watch(function () {
                return self.model.loading;
            }, function (newVal) {
                if (newVal === false) {
                    initTemplateTableOptions();
                    hideProgress();
                }
            });
            this.getTemplates();
            AccessControlService.getUserAllowedActions()
                .then(function (actionSet) {
                self.allowEdit = AccessControlService.hasAction(AccessControlService.TEMPLATES_EDIT, actionSet.actions);
                self.allowAdmin = AccessControlService.hasAction(AccessControlService.TEMPLATES_ADMIN, actionSet.actions);
                self.allowExport = AccessControlService.hasAction(AccessControlService.TEMPLATES_EXPORT, actionSet.actions);
            });
        }
        ;
        return RegisterSelectTemplateController;
    }());
    exports.RegisterSelectTemplateController = RegisterSelectTemplateController;
    angular.module(module_name_1.moduleName).controller('RegisterSelectTemplateController', ["$scope", "$http", "$mdDialog", "$mdToast", "$timeout", "$q", "$state", "RestUrlService", "RegisterTemplateService", "StateService",
        "AccessControlService", "EntityAccessControlService", "UiComponentsService", "AngularModuleExtensionService", "BroadcastService", RegisterSelectTemplateController]);
    angular.module(module_name_1.moduleName)
        .directive('thinkbigRegisterSelectTemplate', directive);
});
//# sourceMappingURL=select-template.js.map