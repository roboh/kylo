import * as angular from 'angular';
import {moduleName} from '../module-name';
import * as _ from 'underscore';
import SlaEmailTemplateService from "./SlaEmailTemplateService";

export class controller implements ng.IComponentController{
   templateId: any;
   allowEdit: boolean = false;
    /**
     * The current template we are editing
     * @type {null}
     */
    template: any = this.SlaEmailTemplateService.template;
    emailAddress: string = '';
    queriedTemplate: any;
    isDefault: any = false;
    /**
     * the list of available sla actions the template(s) can be assigned to
     * @type {Array}
     */
    availableSlaActions: any[] = [];

    templateVariables: any= this.SlaEmailTemplateService.getTemplateVariables();

    relatedSlas: any[] = [];
   constructor(private $transition$: any,
               private $mdDialog: any,
                private $mdToast: any,
                private $http: any,
                private SlaEmailTemplateService: any,
                private StateService: any,
                private AccessControlService: any){
        this.templateId = this.$transition$.params().emailTemplateId;
        if(angular.isDefined(this.templateId) && this.templateId != null && (this.template == null || angular.isUndefined(this.template))){
            this.queriedTemplate = null;
            this.SlaEmailTemplateService.getExistingTemplates().then(()=> {
                this.template = SlaEmailTemplateService.getTemplate(this.templateId);
                if(angular.isUndefined(this.template)) {
                    ///WARN UNABLE TO FNID TEMPLATE
                    this.showDialog("Unable to find template","Unable to find the template for "+this.templateId);
                }
                else {
                    this.queriedTemplate = angular.copy(this.template);
                    this.isDefault = this.queriedTemplate.default;
                    this.getRelatedSlas();
                }
            })
        }
        else if((this.template != null && angular.isDefined(this.template))){
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
            .then((actionSet: any) =>{
                this.allowEdit = AccessControlService.hasAction(AccessControlService.EDIT_SERVICE_LEVEL_AGREEMENT_EMAIL_TEMPLATE, actionSet.actions);
            });
    }

      


        validate =  () =>{
            this.SlaEmailTemplateService.validateTemplate(this.template.subject,this.template.template).then(function (response: any) {
                response.data.sendTest = false;
                this.showTestDialog(response.data);
            });

        }

        sendTestEmail = ()=> {
            this.SlaEmailTemplateService.sendTestEmail(this.emailAddress, this.template.subject, this.template.template).then(function(response: any){
                response.data.sendTest = true;
                if(response.data.success){
                    this.$mdToast.show(
                        this.$mdToast.simple()
                            .textContent('Successfully sent the template')
                            .hideDelay(3000)
                    );
                }
                else {
                    this.$mdToast.show(
                        this.$mdToast.simple()
                            .textContent('Error sending the template ')
                            .hideDelay(3000)
                    );
                    this.showTestDialog(response.data);
                }
            })
        }


        saveTemplate =  ()=> {
            this.showDialog("Saving", "Saving template. Please wait...");

           var successFn =  (response: any)=> {
                this.hideDialog();
                if (response.data) {
                    this.$mdToast.show(
                        this.$mdToast.simple()
                            .textContent('Successfully saved the template')
                            .hideDelay(3000)
                    );
                }
            }
            var errorFn = (err: any)=> {
                this.hideDialog();
                this.$mdToast.show(
                    this.$mdToast.simple()
                        .textContent('Error saving template ')
                        .hideDelay(3000)
                );
            }

           this.SlaEmailTemplateService.save(this.template).then(successFn, errorFn);
        }


        exampleTemplate = ()=>{
            this.template.subject = 'SLA Violation for $sla.name';
            this.template.template = '<html>\n<body> \n'+
                                     '\t<table>\n'+
                                     '\t\t<tr>\n'+
                                     '\t\t\t<td align="center" style="background-color:rgb(43,108,154);">\n'+
                                     '\t\t\t\t<img src="https://kylo.io/assets/Kylo-Logo-REV.png" height="50%" width="50%">\n'+
                                     '\t\t\t</td>\n'+
                                     '\t\t</tr>\n'+
                                     '\t\t<tr>\n'+
                                     '\t\t\t<td>\n'+
                                     '\t\t\t\t<table>\n'+
                                     '\t\t\t\t\t<tr>\n'+
                                     '\t\t\t\t\t\t<td>$sla.name</td>\n'+
                                     '\t\t\t\t\t </tr>\n'+
                                     '\t\t\t\t\t<tr>\n'+
                                     '\t\t\t\t\t\t<td>$sla.description</td>\n'+
                                     '\t\t\t\t\t</tr>\n'+
                                     '\t\t\t\t\t<tr>\n'+
                                     '\t\t\t\t\t\t<td colspan="2">\n'+
                                     '\t\t\t\t\t\t\t<h3>Assessment Description</h3>\n'+
                                     '\t\t\t\t\t\t</td>\n'+
                                     '\t\t\t\t\t</tr>\n'+
                                     '\t\t\t\t\t<tr>\n'+
                                     '\t\t\t\t\t\t<td colspan="2" style="white-space:pre-wrap;">$assessmentDescription</td>\n'+
                                     '\t\t\t\t\t</tr>\n'+
                                     '\t\t\t\t</table>\n'+
                                     '\t\t\t</td>\n'+
                                     '\t\t</tr>\n'+
                                     '\t</table>\n'+
                                     '</body>\n</html>';
            '</html>';
        };

        getAvailableActionItems= ()=> {
            this.SlaEmailTemplateService.getAvailableActionItems().then((response: any)=>{
                    this.availableSlaActions = response;
            });
        }

        navigateToSla=(slaId: any)=>{
            this.StateService.FeedManager().Sla().navigateToServiceLevelAgreement(slaId);
        }

         getRelatedSlas =()=>{
            this.relatedSlas = [];
            if(this.template != null && angular.isDefined(this.template) && angular.isDefined(this.template.id)) {
                this.SlaEmailTemplateService.getRelatedSlas(this.template.id).then((response: any)=>{
                    _.each(response.data,(sla: any)=>{
                        this.relatedSlas.push(sla)
                        this.template.enabled = true;
                    })
                })
            }
        }

        showTestDialog= (resolvedTemplate: any)=>{
            this.$mdDialog.show({
                controller: 'VelocityTemplateTestController',
                templateUrl: 'js/feed-mgr/sla/sla-email-templates/test-velocity-dialog.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                fullscreen: true,
                locals: {
                    resolvedTemplate: resolvedTemplate,
                    emailAddress: this.emailAddress
                }
            })
                .then( (answer: any)=> {
                    //do something with result
                },  ()=> {
                    //cancelled the dialog
                });
        };

        showDialog = (title: any, message: any) =>{
            this.$mdDialog.show(
                this.$mdDialog.alert()
                    .parent(angular.element(document.body))
                    .clickOutsideToClose(false)
                    .title(title)
                    .textContent(message)
                    .ariaLabel(title)
            );
        }

       hideDialog= ()=> {
            this.$mdDialog.hide();
        }

}


export class testDialogController implements ng.IComponentController{
   constructor(private $scope: any,
                private $sce: any,
                private $mdDialog: any,
                private resolvedTemplate: any,
                private emailAddress: any){

                $scope.resolvedTemplateSubject = $sce.trustAsHtml(resolvedTemplate.subject);
                $scope.resolvedTemplateBody = $sce.trustAsHtml(resolvedTemplate.body);
                $scope.resolvedTemplate = resolvedTemplate;
                $scope.emailAddress = emailAddress;
                    $scope.hide =  ()=> {
                            $mdDialog.hide();
                    };

                    $scope.cancel =  ()=> {
                        $mdDialog.cancel();
                    };
                    
                }



        trustAsHtml = (string: any)=> {
            return this.$sce.trustAsHtml(string);
        };

       
}
angular.module(moduleName)
.controller('VelocityTemplateTestController',["$scope", "$sce", "$mdDialog", "resolvedTemplate", testDialogController]);
angular.module(moduleName)
.service('SlaEmailTemplateService',["$http","$q","$mdToast","$mdDialog","RestUrlService",SlaEmailTemplateService])
.controller('SlaEmailTemplateController', 
                                    ['$transition$', '$mdDialog', '$mdToast', '$http',
                                    'SlaEmailTemplateService','StateService','AccessControlService', 
                                    controller]);
