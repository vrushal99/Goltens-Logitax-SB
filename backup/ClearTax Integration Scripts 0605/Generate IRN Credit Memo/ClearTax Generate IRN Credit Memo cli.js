/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax Generate IRN Credit Memo cli
		Author 			:  	NVT Employee
		Date            :   02-05-2024
		Description		:	1. This Script is generated for creditmemo to ClearTax system
		                      (This client script invokes through 'e-generation creditmemo' button. Once it is invoked, 
							   data will be send to Clear tax system. Then after receiving the response, data will be set in the body fields)
------------------------------------------------------------------------------------------------*/
/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/currentRecord', 'N/record', 'N/search', 'N/http', 'N/xml', 'N/runtime', 'N/ui/dialog', 'N/https', 'N/format'], function(currentRecord, record, search, http, xml, runtime, dialog, https, format) {
	//Begin: pageInit functionality
	function pageInit(context) {
	}
	//End: pageInit functionality
	
	//Begin: ClearTax_Generate_IRN_CreditMemo_cli functionality
	  function ClearTax_Generate_IRN_CreditMemo_cli() {
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
                    scriptId: "customscript_cleartax_generate_irn_credi",
                    deploymentId: "customdeploy_cleartax_generate_irn_credi"
                });
                s_sut_url += '&custpage_recId=' + recordId + '&custpage_recType=' + recordType;
                window.open(s_sut_url, "_self")  // reload the same page

            }
            
        } catch (e) {

        log.error('error in ClearTax_Generate_IRN_CreditMemo_cli() function', e.toString());

    }
}
	//End: ClearTax_Generate_IRN_CreditMemo_cli functionality
	
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
		ClearTax_Generate_IRN_CreditMemo_cli: ClearTax_Generate_IRN_CreditMemo_cli
	}
});