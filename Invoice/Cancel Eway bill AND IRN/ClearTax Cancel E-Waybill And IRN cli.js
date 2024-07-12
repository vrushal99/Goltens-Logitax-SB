/*----------------------------------------------------------------------------------------------
        Company Name 	:	Nuvista Technologies Pvt Ltd
        Script Name 	:	ClearTax Cancel EWaybill And IRN cli
        Author 			:  	NVT Employee
        Date            :   03-07-2024
        Description		:	This script will execute once 'Cancel E-waybill and IRN' button clicked by user.
------------------------------------------------------------------------------------------------*/
/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(["N/record", "N/currentRecord", "N/format", 'N/search', 'N/ui/message', 'N/url'], function (record, currentRecord, format, search, message, url) {
    //Begin: pageInit functionality
    function pageInit(context) {
        var record = context.currentRecord;
    }
    //end: pageInit functionality

    function ClearTax_cancel_ewaybill_and_irn() {
        try {

            var currentRec = currentRecord.get();
            if (nullCheck(currentRec)) //If record is created then only all validation will work
            {
                var recID = currentRec.id;
                var recType = currentRec.type;

                var loadInvoice = record.load({
                    type: recType,
                    id: recID
                });

                var ewaybill_reason_code = loadInvoice.getValue({
                    fieldId: 'custbody_ctax_cancel_reas_code'
                });

                var ewaybill_reason_remark = loadInvoice.getValue({
                    fieldId: 'custbody_ctax_cancel_reas_remark'
                });

                if ((!nullCheck(ewaybill_reason_code) && !nullCheck(ewaybill_reason_remark))) {

                    alert('Please select CANCEL REASON CODE and CANCEL REASON REMARK.')

                }
                else if (!nullCheck(ewaybill_reason_code)) {

                    alert('Please select CANCEL REASON CODE.')
                }
                else if (!nullCheck(ewaybill_reason_remark)) {

                    alert('Please enter CANCEL REASON REMARK.')

                }
                else {

                    var myMsg2 = message.create({  // return information msg
                        title: 'System processing your request please wait for sometime....',
                        type: message.Type.INFORMATION
                    });
                    myMsg2.show();

                    var s_sut_url = url.resolveScript({   // call suitelet script
                        scriptId: "customscript_cleartax_can_ewb_n_irn_sui",
                        deploymentId: "customdeploy_cleartax_can_ewb_n_irn_sui"
                    });
                    s_sut_url += '&custpage_recId=' + recID + '&custpage_recType=' + recType;
                    window.open(s_sut_url, "_self")  // reload the same page

                }
            }
        }

        catch (e) {

            log.error('error in ClearTax_cancel_ewaybill_and_irn() function', e.toString());
        }
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
        pageInit: pageInit,
        ClearTax_cancel_ewaybill_and_irn: ClearTax_cancel_ewaybill_and_irn
    }
});