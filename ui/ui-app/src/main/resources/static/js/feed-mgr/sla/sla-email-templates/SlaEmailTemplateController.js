define(["require", "exports", "angular", "../module-name", "underscore", "./SlaEmailTemplateService"], function (require, exports, angular, module_name_1, _, SlaEmailTemplateService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var controller = /** @class */ (function () {
        function controller($transition$, $mdDialog, $mdToast, $http, SlaEmailTemplateService, StateService, AccessControlService) {
            var _this = this;
            this.$transition$ = $transition$;
            this.$mdDialog = $mdDialog;
            this.$mdToast = $mdToast;
            this.$http = $http;
            this.SlaEmailTemplateService = SlaEmailTemplateService;
            this.StateService = StateService;
            this.AccessControlService = AccessControlService;
            this.allowEdit = false;
            /**
             * The current template we are editing
             * @type {null}
             */
            this.template = this.SlaEmailTemplateService.template;
            this.emailAddress = '';
            this.isDefault = false;
            /**
             * the list of available sla actions the template(s) can be assigned to
             * @type {Array}
             */
            this.availableSlaActions = [];
            this.templateVariables = this.SlaEmailTemplateService.getTemplateVariables();
            this.relatedSlas = [];
            this.validate = function () {
                _this.SlaEmailTemplateService.validateTemplate(_this.template.subject, _this.template.template).then(function (response) {
                    response.data.sendTest = false;
                    this.showTestDialog(response.data);
                });
            };
            this.sendTestEmail = function () {
                _this.SlaEmailTemplateService.sendTestEmail(_this.emailAddress, _this.template.subject, _this.template.template).then(function (response) {
                    response.data.sendTest = true;
                    if (response.data.success) {
                        this.$mdToast.show(this.$mdToast.simple()
                            .textContent('Successfully sent the template')
                            .hideDelay(3000));
                    }
                    else {
                        this.$mdToast.show(this.$mdToast.simple()
                            .textContent('Error sending the template ')
                            .hideDelay(3000));
                        this.showTestDialog(response.data);
                    }
                });
            };
            this.saveTemplate = function () {
                _this.showDialog("Saving", "Saving template. Please wait...");
                var successFn = function (response) {
                    _this.hideDialog();
                    if (response.data) {
                        _this.$mdToast.show(_this.$mdToast.simple()
                            .textContent('Successfully saved the template')
                            .hideDelay(3000));
                    }
                };
                var errorFn = function (err) {
                    _this.hideDialog();
                    _this.$mdToast.show(_this.$mdToast.simple()
                        .textContent('Error saving template ')
                        .hideDelay(3000));
                };
                _this.SlaEmailTemplateService.save(_this.template).then(successFn, errorFn);
            };
            this.exampleTemplate = function () {
                _this.template.subject = 'SLA Violation for $sla.name';
                _this.template.template = '<html>\n<body> \n' +
                    '\t<table>\n' +
                    '\t\t<tr>\n' +
                    '\t\t\t<td align="center" style="background-color:rgb(43,108,154);">\n' +
                    '\t\t\t\t<img src="https://kylo.io/assets/Kylo-Logo-REV.png" height="50%" width="50%">\n' +
                    '\t\t\t</td>\n' +
                    '\t\t</tr>\n' +
                    '\t\t<tr>\n' +
                    '\t\t\t<td>\n' +
                    '\t\t\t\t<table>\n' +
                    '\t\t\t\t\t<tr>\n' +
                    '\t\t\t\t\t\t<td>$sla.name</td>\n' +
                    '\t\t\t\t\t </tr>\n' +
                    '\t\t\t\t\t<tr>\n' +
                    '\t\t\t\t\t\t<td>$sla.description</td>\n' +
                    '\t\t\t\t\t</tr>\n' +
                    '\t\t\t\t\t<tr>\n' +
                    '\t\t\t\t\t\t<td colspan="2">\n' +
                    '\t\t\t\t\t\t\t<h3>Assessment Description</h3>\n' +
                    '\t\t\t\t\t\t</td>\n' +
                    '\t\t\t\t\t</tr>\n' +
                    '\t\t\t\t\t<tr>\n' +
                    '\t\t\t\t\t\t<td colspan="2" style="white-space:pre-wrap;">$assessmentDescription</td>\n' +
                    '\t\t\t\t\t</tr>\n' +
                    '\t\t\t\t</table>\n' +
                    '\t\t\t</td>\n' +
                    '\t\t</tr>\n' +
                    '\t</table>\n' +
                    '</body>\n</html>';
                '</html>';
            };
            this.getAvailableActionItems = function () {
                _this.SlaEmailTemplateService.getAvailableActionItems().then(function (response) {
                    _this.availableSlaActions = response;
                });
            };
            this.navigateToSla = function (slaId) {
                _this.StateService.FeedManager().Sla().navigateToServiceLevelAgreement(slaId);
            };
            this.getRelatedSlas = function () {
                _this.relatedSlas = [];
                if (_this.template != null && angular.isDefined(_this.template) && angular.isDefined(_this.template.id)) {
                    _this.SlaEmailTemplateService.getRelatedSlas(_this.template.id).then(function (response) {
                        _.each(response.data, function (sla) {
                            _this.relatedSlas.push(sla);
                            _this.template.enabled = true;
                        });
                    });
                }
            };
            this.showTestDialog = function (resolvedTemplate) {
                _this.$mdDialog.show({
                    controller: 'VelocityTemplateTestController',
                    templateUrl: 'js/feed-mgr/sla/sla-email-templates/test-velocity-dialog.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    fullscreen: true,
                    locals: {
                        resolvedTemplate: resolvedTemplate,
                        emailAddress: _this.emailAddress
                    }
                })
                    .then(function (answer) {
                    //do something with result
                }, function () {
                    //cancelled the dialog
                });
            };
            this.showDialog = function (title, message) {
                _this.$mdDialog.show(_this.$mdDialog.alert()
                    .parent(angular.element(document.body))
                    .clickOutsideToClose(false)
                    .title(title)
                    .textContent(message)
                    .ariaLabel(title));
            };
            this.hideDialog = function () {
                _this.$mdDialog.hide();
            };
            this.templateId = this.$transition$.params().emailTemplateId;
            if (angular.isDefined(this.templateId) && this.templateId != null && (this.template == null || angular.isUndefined(this.template))) {
                this.queriedTemplate = null;
                this.SlaEmailTemplateService.getExistingTemplates().then(function () {
                    _this.template = SlaEmailTemplateService.getTemplate(_this.templateId);
                    if (angular.isUndefined(_this.template)) {
                        ///WARN UNABLE TO FNID TEMPLATE
                        _this.showDialog("Unable to find template", "Unable to find the template for " + _this.templateId);
                    }
                    else {
                        _this.queriedTemplate = angular.copy(_this.template);
                        _this.isDefault = _this.queriedTemplate.default;
                        _this.getRelatedSlas();
                    }
                });
            }
            else if ((this.template != null && angular.isDefined(this.template))) {
                this.queriedTemplate = angular.copy(this.template);
                this.isDefault = this.queriedTemplate.default;
            }
            else {
                //redirect back to email template list page
                StateService.FeedManager().Sla().navigateToEmailTemplates();
            }
            this.getAvailableActionItems();
            this.getRelatedSlas();
            // Fetch the allowed actions
            AccessControlService.getUserAllowedActions()
                .then(function (actionSet) {
                _this.allowEdit = AccessControlService.hasAction(AccessControlService.EDIT_SERVICE_LEVEL_AGREEMENT_EMAIL_TEMPLATE, actionSet.actions);
            });
        }
        return controller;
    }());
    exports.controller = controller;
    var testDialogController = /** @class */ (function () {
        function testDialogController($scope, $sce, $mdDialog, resolvedTemplate, emailAddress) {
            var _this = this;
            this.$scope = $scope;
            this.$sce = $sce;
            this.$mdDialog = $mdDialog;
            this.resolvedTemplate = resolvedTemplate;
            this.emailAddress = emailAddress;
            this.trustAsHtml = function (string) {
                return _this.$sce.trustAsHtml(string);
            };
            $scope.resolvedTemplateSubject = $sce.trustAsHtml(resolvedTemplate.subject);
            $scope.resolvedTemplateBody = $sce.trustAsHtml(resolvedTemplate.body);
            $scope.resolvedTemplate = resolvedTemplate;
            $scope.emailAddress = emailAddress;
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }
        return testDialogController;
    }());
    exports.testDialogController = testDialogController;
    angular.module(module_name_1.moduleName)
        .controller('VelocityTemplateTestController', ["$scope", "$sce", "$mdDialog", "resolvedTemplate", testDialogController]);
    angular.module(module_name_1.moduleName)
        .service('SlaEmailTemplateService', ["$http", "$q", "$mdToast", "$mdDialog", "RestUrlService", SlaEmailTemplateService_1.default])
        .controller('SlaEmailTemplateController', ['$transition$', '$mdDialog', '$mdToast', '$http',
        'SlaEmailTemplateService', 'StateService', 'AccessControlService',
        controller]);
});
//# sourceMappingURL=SlaEmailTemplateController.js.map