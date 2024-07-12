/*----------------------------------------------------------------------------------------------
        Company Name 	:	Nuvista Technologies Pvt Ltd
        Script Name 	:	
        Author 			:  	NVT Employee
        Date            :   
        Description		:	
------------------------------------------------------------------------------------------------*/
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define([], function () {

    function showAlertOnVoidButtonClickPI(context) {

        var voidButton = document.querySelector('input[name="void"]');

        if (voidButton) {
             
            var currentrecord = context.currentRecord;

            var cancelReasonCode = currentrecord.getValue({
                fieldId: "custbody_ctax_einvoice_cancel_irn"
            });

            var cancelReasonRemark = currentrecord.getValue({
                fieldId: "custbody_ctax_cancel__irn_remark"
            });

            if (!nullCheck(cancelReasonCode) || !nullCheck(cancelReasonRemark)) {
                alert('in page initi')

                voidButton.addEventListener('click', function (event) {

                    alert('Please enter cancel irn reason code and reason remark.');

                    event.preventDefault();
                    event.stopPropagation();

                });
            }

        }
        return true;
    }


    function showAlertOnVoidButtonClickFC(context) {
        // Get reference to the void button
        var voidButton = document.querySelector('input[name="void"]');

        if (voidButton) {
             
            var currentrecord = context.currentRecord;


            if (context.fieldId == "custbody_ctax_einvoice_cancel_irn" || context.fieldId == "custbody_ctax_cancel__irn_remark") {


                var cancelReasonCode = currentrecord.getValue({
                    fieldId: "custbody_ctax_einvoice_cancel_irn"
                });

                var cancelReasonRemark = currentrecord.getValue({
                    fieldId: "custbody_ctax_cancel__irn_remark"
                });
                alert('cancelReasonCode' +cancelReasonCode)
                alert('cancelReasonRemark' +cancelReasonRemark)

                if (!nullCheck(cancelReasonCode) || !nullCheck(cancelReasonRemark)) {

                    alert('in field change')
                    voidButton.addEventListener('click', function (event1) {

                        alert('Please enter cancel irn reason code and reason remark.');

                        event1.preventDefault();
                        // event1.stopPropagation();
                       // return true;
                    });
                }
            }
        }
       // return true;
    }



    //Begin: nullCheck functionality
    function nullCheck(value) {
        if (value != 'null' && value != '' && value != undefined && value != 'NaN') {
            return true;
        } else {
            return false;
        }
    }
    //End: nullCheck functionality

    return {

        pageInit: function (context) {
            showAlertOnVoidButtonClickPI(context);
        },

        fieldChanged: function (context) {
            showAlertOnVoidButtonClickFC(context);
        }

    };
});