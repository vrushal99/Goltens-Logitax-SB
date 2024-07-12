/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	
		Author 			:  	NVT Employee 
		Date            :   
		Description		:   

------------------------------------------------------------------------------------------------*/
/**
	@NApiVersion 2.1
	@NScriptType ClientScript
*/
define(["N/record", "N/currentRecord", "N/format", 'N/search', 'N/ui/message', 'N/url'], function(record, currentRecord, format, search, message, url) {
	//Begin: pageInit functionality
    function pageInit(context) {
        var record = context.currentRecord;
    }
    //end: pageInit functionality
    //Begin: cancel_irn_credit_memo_cli functionality
    function cancel_irn_credit_memo_cli() {
        try {
            var currentRec = currentRecord.get(); // return current record obj
            var recordId = currentRec.id; // return record ID
            var recordType = currentRec.type; // return record Type

            var loadCreditMemo = record.load({
                type: recordType,
                id: recordId
            });

            var cancel_reason_code = loadCreditMemo.getValue({
                fieldId: 'custbody_ctax_einvoice_cancel_irn'
            });

            var cancel_reason_remark = loadCreditMemo.getValue({
                fieldId: 'custbody_ctax_cancel__irn_remark'
            });

            if ((!nullCheck(cancel_reason_code) && !nullCheck(cancel_reason_remark))) {

                alert('Please select CANCEL IRN CODE and CANCEL REASON REMARK.')

            }
            else if (!nullCheck(cancel_reason_code)) {

                alert('Please select CANCEL IRN CODE.')
            }
            else if (!nullCheck(cancel_reason_remark)) {

                alert('Please enter CANCEL REASON REMARK.')

            }
            else {


                var myMsg2 = message.create({ // return information msg
                    title: 'System processing your request please wait for sometime....',
                    type: message.Type.INFORMATION
                });
                myMsg2.show();

                var s_sut_url = url.resolveScript({ // call suitelet script
                    scriptId: "customscript_cleartax_canlirn_cm_mul_sui",
                    deploymentId: "customdeploy_cleartax_canlirn_cm_mul_sui"
                });
                s_sut_url += '&custpage_recId=' + recordId + '&custpage_recType=' + recordType;
                window.open(s_sut_url, "_self") // reload the same page
            }

        } catch (ex) {
            alert(ex)
        }
    }
    //End: cancel_irn_credit_memo_cli functionality 

    
    return {
        pageInit: pageInit,
        cancel_irn_credit_memo_cli: cancel_irn_credit_memo_cli
    }

    function nullCheck(value) {
        if (value != null && value != '' && value != undefined)
            return true;
        else
            return false;
    }
})