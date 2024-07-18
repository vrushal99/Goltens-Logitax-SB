/*----------------------------------------------------------------------------------------------
        Company Name 	:	Nuvista Technologies Pvt Ltd
        Script Name 	:	ClearTax Generate E-Waybil By IRN CM cli
        Author 			:  	NVT Employee
        Date            :   03-05-2024 
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

    function ClearTax_Generate_Ewaybill_by_irn() {
        try {

            var currentRec = currentRecord.get(); // return current record obj
            var recordId = currentRec.id;   // return record ID
            var recordType = currentRec.type;  // return record Type

            if (nullCheck(recordId) && nullCheck(recordType)) {
                
                var myMsg2 = message.create({    // return information msg
                    title: 'System processing your request please wait for sometime....',
                    type: message.Type.INFORMATION
                });
                myMsg2.show();
                var s_sut_url = url.resolveScript({    // call suitelet script
                    scriptId: "customscript_cleartax_gen_ewaybil_cm_sui",
                    deploymentId: "customdeploy_cleartax_gen_ewaybil_cm_sui"
                });
                s_sut_url += '&custpage_recId=' + recordId + '&custpage_recType=' + recordType;
                window.open(s_sut_url, "_self")  // reload the same page

            }
            
        } catch (e) {

        log.error('error in ClearTax_Generate_Ewaybill_by_irn() function', e.toString());

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
    ClearTax_Generate_Ewaybill_by_irn: ClearTax_Generate_Ewaybill_by_irn
}
});