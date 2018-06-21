define(["require", "exports", "angular", "./module-name"], function (require, exports, angular, module_name_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RegisteredTemplatesController = /** @class */ (function () {
        function RegisteredTemplatesController($scope, $http, $mdDialog, $q, AccessControlService, RestUrlService, PaginationDataService, TableOptionsService, AddButtonService, StateService, RegisterTemplateService) {
            var _this = this;
            this.$scope = $scope;
            this.$http = $http;
            this.$mdDialog = $mdDialog;
            this.$q = $q;
            this.AccessControlService = AccessControlService;
            this.RestUrlService = RestUrlService;
            this.PaginationDataService = PaginationDataService;
            this.TableOptionsService = TableOptionsService;
            this.AddButtonService = AddButtonService;
            this.StateService = StateService;
            this.RegisterTemplateService = RegisterTemplateService;
            /**
             * Indicates if templates are allowed to be edited.
             * @type {boolean}
             */
            this.allowEdit = false;
            /**
             * Indicates if templates are allowed to be exported.
             * @type {boolean}
             */
            this.allowExport = false;
            /**
             * Array of templates
             */
            this.registeredTemplates = [];
            /**
             * The unique page name for the PaginationDataService
             */
            this.pageName = "registered-templates";
            /**
             * The unique id for the PaginationData
             */
            this.paginationId = 'registered-templates';
            this.loading = true;
            this.cardTitle = 'Templates';
            // Register Add button
            this.AccessControlService.getUserAllowedActions()
                .then(function (actionSet) {
                if (_this.AccessControlService.hasAction(_this.AccessControlService.TEMPLATES_IMPORT, actionSet.actions)) {
                    _this.AddButtonService.registerAddButton("registered-templates", function () {
                        _this.RegisterTemplateService.resetModel();
                        _this.StateService.FeedManager().Template().navigateToRegisterNewTemplate();
                    });
                }
            });
            this.paginationData = this.PaginationDataService.paginationData(this.pageName);
            PaginationDataService.setRowsPerPageOptions(this.pageName, ['5', '10', '20', '50']);
            this.currentPage = PaginationDataService.currentPage(this.pageName) || 1;
            this.viewType = PaginationDataService.viewType(this.pageName);
            this.sortOptions = this.loadSortOptions();
            this.filter = PaginationDataService.filter(this.pageName);
        }
        /**
         * Initialize the controller and properties
         */
        RegisteredTemplatesController.prototype.ngOnInit = function () {
            var _this = this;
            this.$scope.$watch(function () {
                return _this.viewType;
            }, function (newVal) {
                _this.onViewTypeChange(newVal);
            });
            this.$scope.$watch(function () {
                return _this.filter;
            }, function (newVal) {
                _this.PaginationDataService.filter(_this.pageName, newVal);
            });
            this.getRegisteredTemplates();
            // Fetch the allowed actions
            this.AccessControlService.getUserAllowedActions()
                .then(function (actionSet) {
                _this.allowEdit = _this.AccessControlService.hasAction(_this.AccessControlService.TEMPLATES_EDIT, actionSet.actions);
                _this.allowExport = _this.AccessControlService.hasAction(_this.AccessControlService.TEMPLATES_EXPORT, actionSet.actions);
            });
        };
        RegisteredTemplatesController.prototype.onViewTypeChange = function (viewType) {
            this.PaginationDataService.viewType(this.pageName, this.viewType);
        };
        RegisteredTemplatesController.prototype.onOrderChange = function (order) {
            this.PaginationDataService.sort(this.pageName, order);
            this.TableOptionsService.setSortOption(this.pageName, order);
        };
        ;
        RegisteredTemplatesController.prototype.onPaginationChange = function (page, limit) {
            this.PaginationDataService.currentPage(this.pageName, null, page);
            this.currentPage = page;
        };
        ;
        /**
         * Called when a user Clicks on a table Option
         * @param option
         */
        RegisteredTemplatesController.prototype.selectedTableOption = function (option) {
            var sortString = this.TableOptionsService.toSortString(option);
            this.PaginationDataService.sort(this.pageName, sortString);
            var updatedOption = this.TableOptionsService.toggleSort(this.pageName, option);
            this.TableOptionsService.setSortOption(this.pageName, sortString);
        };
        /**
         * Build the possible Sorting Options
         * @returns {*[]}
         */
        RegisteredTemplatesController.prototype.loadSortOptions = function () {
            var options = { 'Template': 'templateName', 'Last Modified': 'updateDate' };
            var sortOptions = this.TableOptionsService.newSortOptions(this.pageName, options, 'templateName', 'asc');
            this.TableOptionsService.initializeSortOption(this.pageName);
            return sortOptions;
        };
        /**
         * Displays the details of the specified template.
         *
         * @param event
         * @param template
         */
        RegisteredTemplatesController.prototype.templateDetails = function (event, template) {
            var _this = this;
            if (this.allowEdit && template != undefined) {
                this.RegisterTemplateService.resetModel();
                this.$q.when(this.RegisterTemplateService.hasEntityAccess([this.AccessControlService.ENTITY_ACCESS.TEMPLATE.EDIT_TEMPLATE], template)).then(function (hasAccess) {
                    if (hasAccess) {
                        _this.StateService.FeedManager().Template().navigateToRegisteredTemplate(template.id, template.nifiTemplateId);
                    }
                    else {
                        _this.RegisterTemplateService.accessDeniedDialog();
                    }
                });
            }
            else {
                this.RegisterTemplateService.accessDeniedDialog();
            }
        };
        ;
        RegisteredTemplatesController.prototype.getRegisteredTemplates = function () {
            var _this = this;
            var successFn = function (response) {
                _this.loading = false;
                if (response.data) {
                    var entityAccessControlled = _this.AccessControlService.isEntityAccessControlled();
                    angular.forEach(response.data, function (template) {
                        template.allowExport = !entityAccessControlled || _this.RegisterTemplateService.hasEntityAccess(_this.AccessControlService.ENTITY_ACCESS.TEMPLATE.EXPORT, template);
                        template.exportUrl = _this.RestUrlService.ADMIN_EXPORT_TEMPLATE_URL + "/" + template.id;
                    });
                }
                _this.registeredTemplates = response.data;
            };
            var errorFn = function (err) {
                _this.loading = false;
            };
            var promise = this.$http.get(this.RestUrlService.GET_REGISTERED_TEMPLATES_URL);
            promise.then(successFn, errorFn);
            return promise;
        };
        RegisteredTemplatesController.prototype.exportTemplate = function (event, template) {
            var promise = this.$http.get(this.RestUrlService.ADMIN_EXPORT_TEMPLATE_URL + "/" + template.id);
        };
        /**
         * When the controller is ready, initialize
         */
        RegisteredTemplatesController.prototype.$onInit = function () {
            this.ngOnInit();
        };
        RegisteredTemplatesController.$inject = ["$scope", "$http", "$mdDialog", "$q", "AccessControlService", "RestUrlService", "PaginationDataService", "TableOptionsService", "AddButtonService", "StateService", "RegisterTemplateService"];
        return RegisteredTemplatesController;
    }());
    exports.RegisteredTemplatesController = RegisteredTemplatesController;
    angular.module(module_name_1.moduleName).controller('RegisteredTemplatesController', RegisteredTemplatesController);
});
//# sourceMappingURL=RegisteredTemplatesController.js.map