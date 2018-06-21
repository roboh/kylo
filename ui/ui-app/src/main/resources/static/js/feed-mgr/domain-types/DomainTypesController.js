define(["require", "exports", "angular", "underscore", "./module-name"], function (require, exports, angular, _, module_name_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Identifier for this page.
     * @type {string}
     */
    var PAGE_NAME = "domain-types";
    var DomainTypesController = /** @class */ (function () {
        /**
         * Controller for the domain-types page.
         *
         * @constructor
         */
        function DomainTypesController(AddButtonService, DomainTypesService, FeedFieldPolicyRuleService, StateService, $mdToast) {
            this.AddButtonService = AddButtonService;
            this.DomainTypesService = DomainTypesService;
            this.FeedFieldPolicyRuleService = FeedFieldPolicyRuleService;
            this.StateService = StateService;
            this.$mdToast = $mdToast;
            var self = this;
            /**
             * List of domain types.
             * @type {DomainType[]}
             */
            self.domainTypes = [];
            /**
             * Indicates that the table data is being loaded.
             * @type {boolean}
             */
            self.loading = true;
            /**
             * Query for filtering categories.
             * @type {string}
             */
            self.searchQuery = "";
            /**
             * Navigates to the domain type details page for the specified domain type.
             */
            self.editDomainType = function (domainType) {
                StateService.FeedManager().DomainType().navigateToDomainTypeDetails(domainType.id);
            };
            /**
             * Gets a list of all field policies for the specified domain type.
             */
            self.getAllFieldPolicies = function (domainType) {
                var rules = FeedFieldPolicyRuleService.getAllPolicyRules(domainType.fieldPolicy);
                return (rules.length > 0) ? rules.map(_.property("name")).join(", ") : "No rules";
            };
            /**
             * Indicates if the specified domain type has any field policies.
             */
            self.hasFieldPolicies = function (domainType) {
                return (domainType.fieldPolicy.standardization.length > 0 || domainType.fieldPolicy.validation.length > 0);
            };
            // Register Add button
            AddButtonService.registerAddButton(PAGE_NAME, function () {
                StateService.FeedManager().DomainType().navigateToDomainTypeDetails();
            });
            // Fetch domain types
            DomainTypesService.findAll()
                .then(function (domainTypes) {
                self.domainTypes = domainTypes;
                self.loading = false;
            }, function () {
                $mdToast.show($mdToast.simple()
                    .textContent("Unable to load domain types.")
                    .hideDelay(3000));
            });
        }
        return DomainTypesController;
    }());
    exports.DomainTypesController = DomainTypesController;
    // Register the controller
    angular.module(module_name_1.moduleName).controller("DomainTypesController", ["AddButtonService", "DomainTypesService", "FeedFieldPolicyRuleService", "StateService", "$mdToast", DomainTypesController]);
});
//# sourceMappingURL=DomainTypesController.js.map