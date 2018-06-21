define(["require", "exports", "angular", "underscore", "../../services/UserService", "../../module-name"], function (require, exports, angular, _, UserService_1, module_name_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GroupDetailsController = /** @class */ (function () {
        function GroupDetailsController($scope, $mdDialog, $mdToast, $transition$, AccessControlService, UserService, StateService) {
            var _this = this;
            this.$scope = $scope;
            this.$mdDialog = $mdDialog;
            this.$mdToast = $mdToast;
            this.$transition$ = $transition$;
            this.AccessControlService = AccessControlService;
            this.UserService = UserService;
            this.StateService = StateService;
            this.$error = { duplicateName: false, missingName: false };
            /**
             * Indicates that admin operations are allowed.
             * @type {boolean}
             */
            this.allowAdmin = false;
            /**
             * User model for the edit view.
             * @type {UserPrincipal}
             */
            this.editModel = {};
            /**
             * Map of group system names to group objects.
             * @type {Object.<string, GroupPrincipal>}
             */
            this.groupMap = {};
            /**
             * Indicates if the edit view is displayed.
             * @type {boolean}
             */
            this.isEditable = false;
            /**
             * Indicates if the edit form is valid.
             * @type {boolean}
             */
            this.isValid = false;
            this.groupId = this.$transition$.params().groupId;
            /**
             * Indicates that the user is currently being loaded.
             * @type {boolean}
             */
            this.loading = true;
            /**
             * User model for the read-only view.
             * @type {UserPrincipal}
             */
            this.model = { description: null, memberCount: 0, systemName: null, title: null };
            this.actions = []; // List of actions allowed to the group. //  @type {Array.<Action>}
            this.allowUsers = false; // Indicates that user operations are allowed. //boolean
            this.editActions = []; // Editable list of actions allowed to the group. //@type {Array.<Action>}
            this.isPermissionsEditable = false; //Indicates if the permissions edit view is displayed.// @type {boolean}
            this.users = []; // Users in the group. // @type {Array.<UserPrincipal>}
            /**
           * Navigates to the details page for the specified user.
           *
           * @param user the user
           */
            this.onUserClick = function (user) {
                this.StateService.Auth().navigateToUserDetails(user.systemName);
            };
            // Update isValid when $error is updated
            $scope.$watch(function () { return _this.$error; }, function () {
                _this.isValid = _.reduce(_this.$error, function (memo, value) {
                    return memo && !value;
                }, true);
            }, true);
            // Update $error when thes system name changes
            $scope.$watch(function () { return _this.editModel.systemName; }, function () {
                _this.$error.duplicateName = (angular.isString(_this.editModel.systemName) && _this.groupMap[_this.editModel.systemName]);
                _this.$error.missingName = (!angular.isString(_this.editModel.systemName) || _this.editModel.systemName.length === 0);
            });
            this.onLoad();
        }
        GroupDetailsController.prototype.ngOnInit = function () {
        };
        /**
         * Gets the display name of the specified user. Defaults to the system name if the display name is blank.
         * @param user the user
         * @returns {string} the display name
         */
        GroupDetailsController.prototype.getUserName = function (user) {
            return (angular.isString(user.displayName) && user.displayName.length > 0) ? user.displayName : user.systemName;
        };
        ;
        /**
         * Indicates if the user can be deleted. The main requirement is that the user exists.
         *
         * @returns {boolean} {@code true} if the user can be deleted, or {@code false} otherwise
         */
        GroupDetailsController.prototype.canDelete = function () {
            return (this.model.systemName !== null);
        };
        ;
        /**
         * Cancels the current edit operation. If a new user is being created then redirects to the users page.
         */
        GroupDetailsController.prototype.onCancel = function () {
            if (this.model.systemName === null) {
                this.StateService.Auth().navigateToGroups();
            }
        };
        ;
        /**
         * Deletes the current user.
         */
        GroupDetailsController.prototype.onDelete = function () {
            var _this = this;
            var name = (angular.isString(this.model.title) && this.model.title.length > 0) ? this.model.title : this.model.systemName;
            this.UserService.deleteGroup(encodeURIComponent(this.$transition$.params().groupId))
                .then(function () {
                _this.$mdToast.show(_this.$mdToast.simple()
                    .textContent("Successfully deleted the group " + name)
                    .hideDelay(3000));
                _this.StateService.Auth().navigateToGroups();
            }, function () {
                _this.$mdDialog.show(_this.$mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title("Delete Failed")
                    .textContent("The group " + name + " could not be deleted. ") //+ err.data.message
                    .ariaLabel("Failed to delete group")
                    .ok("Got it!"));
            });
        };
        ;
        /**
        //  * Creates a copy of the user model for editing.
         */
        GroupDetailsController.prototype.onEdit = function () {
            this.editModel = angular.copy(this.model);
        };
        ;
        /**
             * Creates a copy of the permissions for editing.
             */
        GroupDetailsController.prototype.onEditPermissions = function () {
            this.editActions = angular.copy(this.actions);
        };
        ;
        /**
         * Loads the user details.
         */
        GroupDetailsController.prototype.onLoad = function () {
            var _this = this;
            // Load allowed permissions
            this.AccessControlService.getUserAllowedActions()
                .then(function (actionSet) {
                _this.allowAdmin = _this.AccessControlService.hasAction(_this.AccessControlService.GROUP_ADMIN, actionSet.actions);
                _this.allowUsers = _this.AccessControlService.hasAction(_this.AccessControlService.USERS_ACCESS, actionSet.actions);
            });
            // Fetch group details
            if (angular.isString(this.$transition$.params().groupId)) {
                this.UserService.getGroup(this.$transition$.params().groupId)
                    .then(function (group) {
                    _this.model = group;
                    _this.loading = false; // _this
                });
                this.UserService.getUsersByGroup(this.$transition$.params().groupId)
                    .then(function (users) {
                    _this.users = users;
                });
                this.AccessControlService.getAllowedActions(null, null, this.$transition$.params().groupId)
                    .then(function (actionSet) {
                    _this.actions = actionSet.actions;
                });
            }
            else {
                this.onEdit();
                this.isEditable = true;
                this.loading = false;
                this.UserService.getGroups()
                    .then(function (groups) {
                    this.groupMap = {};
                    angular.forEach(groups, function (group) {
                        this.groupMap[group.systemName] = true;
                    });
                });
            }
        };
        ;
        /**
         * Saves the current group.
         */
        GroupDetailsController.prototype.onSave = function () {
            var _this = this;
            var model = angular.copy(this.editModel);
            this.UserService.saveGroup(model)
                .then(function () {
                _this.model = model;
                _this.groupId = _this.model.systemName;
            });
        };
        ;
        /**
        * Saves the current permissions.
        */
        GroupDetailsController.prototype.onSavePermissions = function () {
            var _this = this;
            var actions = angular.copy(this.editActions);
            this.AccessControlService.setAllowedActions(null, null, this.model.systemName, actions)
                .then(function (actionSet) {
                _this.actions = actionSet.actions;
            });
        };
        ;
        return GroupDetailsController;
    }());
    exports.default = GroupDetailsController;
    angular.module(module_name_1.moduleName)
        .service("UserService", ['$http',
        'CommonRestUrlService',
        'UserGroupService', UserService_1.UserService])
        .controller('GroupDetailsController', ["$scope", "$mdDialog", "$mdToast", "$transition$", "AccessControlService", "UserService", "StateService", GroupDetailsController]);
});
//# sourceMappingURL=GroupDetailsController.js.map