/*----------------------------------------------------------------------------------------------
        Company Name 	:	Nuvista Technologies Pvt Ltd
        Script Name 	:	ClearTax Extend Eway Bill Validity cli
        Author 			:  	NVT Employee
        Date            :   09-07-2024
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

    function ClearTax_Extend_Ewaybill_Validity() {
        try {

            var currentRec = currentRecord.get(); // return current record obj
            var recordId = currentRec.id;   // return record ID
            var recordType = currentRec.type;  // return record Type

            if (nullCheck(recordId) && nullCheck(recordType)) {
                
                var loadInvoice = record.load({
                    type: recordType,
                    id: recordId
                });

                var ewaybill_reason_code = loadInvoice.getValue({
                    fieldId: 'custbody_logitax_extended_ewb_validay'
                });

                var ewaybill_reason_remark = loadInvoice.getValue({
                    fieldId: 'custbody_logitax_ewb_validity_reason_r'
                });

                var transport_mode = loadInvoice.getValue({
                    fieldId: 'custbody_logitax_extens_ewb_mode_trans'
                });

                if ((!nullCheck(ewaybill_reason_code) && !nullCheck(ewaybill_reason_remark) && !nullCheck(transport_mode))) {

                    alert('Please select EXTEND EWB VALIDITY REASON CODE, EXTEND EWB VALIDITY REASON REMARK and EXTEND EWB VALIDITY MODE OF TRANSPORT.')

                }
                else if (!nullCheck(ewaybill_reason_code)) {

                    alert('Please select EXTEND EWB VALIDITY REASON CODE.')
                }
                else if (!nullCheck(ewaybill_reason_remark)) {

                    alert('Please enter EXTEND EWB VALIDITY REASON REMARK.')

                }
                else if (!nullCheck(transport_mode)) {

                    alert('Please select EXTEND EWB VALIDITY MODE OF TRANSPORT.')

                }
                else {

                    var myMsg2 = message.create({    // return information msg
                        title: 'System processing your request please wait for sometime....',
                        type: message.Type.INFORMATION
                    });
                    myMsg2.show();
                    var s_sut_url = url.resolveScript({    // call suitelet script
                        scriptId: "customscript_cleartax_ext_ewb_valid_sui",
                        deploymentId: "customdeploy_cleartax_ext_ewb_valid_sui"
                    });
                    s_sut_url += '&custpage_recId=' + recordId + '&custpage_recType=' + recordType;
                    window.open(s_sut_url, "_self")  // reload the same page

                }
            }
            
        } catch (e) {

        log.error('error in ClearTax_Extend_Ewaybill_Validity() function', e.toString());

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
    ClearTax_Extend_Ewaybill_Validity: ClearTax_Extend_Ewaybill_Validity
}
});