/*----------------------------------------------------------------------------------------------
        Company Name 	:	Nuvista Technologies Pvt Ltd
        Script Name 	:	
        Author 			:  	NVT Employee
        Date            :   19-04-2024
        Description		:	
------------------------------------------------------------------------------------------------*/
/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(["N/record", "N/currentRecord", "N/format", 'N/search', 'N/ui/message', 'N/url'], function (record, currentRecord, format, search, message, url) {

    function pageInit(context) {
        var record = context.currentRecord;
    }

    function call_update_ewaybill_partb_cli() {
        try {

            var currentRec = currentRecord.get(); // return current record obj
            var recordId = currentRec.id;   // return record ID
            var recordType = currentRec.type;  // return record Type
			
			 var recID = currentRec.id
                var invoice_obj = record.load({   // return current record obj
                    type: 'invoice',
                    id: recID,
                    isDynamic: true
                });

                var ewaybill_reason_code = invoice_obj.getText({
                    fieldId: 'custbody_ctax_res_to_update_ewb'
                });
				// alert(ewaybill_reason_code)

                var ewaybill_reason_remark = invoice_obj.getValue({
                    fieldId: 'custbody_ctax_reason_remark'
                     });
              if(nullCheck(ewaybill_reason_code) && nullCheck(ewaybill_reason_remark)) {
                
                var myMsg2 = message.create({    // return information msg
                    title: 'System processing your request please wait for sometime....',
                    type: message.Type.INFORMATION
                });
                myMsg2.show();
                var s_sut_url = url.resolveScript({    // call suitelet script
                    scriptId: "customscript_cleartax_update_bill_b_sui",
                    deploymentId: "customdeploy_cleartax_update_bill_b_sui"
                });
                s_sut_url += '&custpage_recId=' + recordId + '&custpage_recType=' + recordType;
                window.open(s_sut_url, "_self")  // reload the same page

            }
			else {

                    if ((!nullCheck(ewaybill_reason_code) && !nullCheck(ewaybill_reason_remark))) {

                        alert('Please fill REASONS TO UPDATE EWB and REASONREMARK details.')

                    }
                    else if (!nullCheck(ewaybill_reason_code)) {

                        alert('Please select REASONS TO UPDATE EWB.')
                    }
                    else if (!nullCheck(ewaybill_reason_remark)) {

                        alert('Please enter REASONREMARK.')

                    }
                }
            
        } catch (e) {

        log.error('error in call_update_ewaybill_partb_cli() function', e.toString());

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
    call_update_ewaybill_partb_cli: call_update_ewaybill_partb_cli
}
});