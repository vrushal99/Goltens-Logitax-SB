/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax Get E-CreditMemo PDF cli
		Author 			:  	NVT Employee 
		Date            :   18-07-2024
		Description		:  1. This Script is created for E-CreditMemo Print
		                    (When E-CreditMemo print button is triggered, script is invoked to display a message "Wait for sometime, system is Processing")

------------------------------------------------------------------------------------------------*/
/**
	@NApiVersion 2.1
	@NScriptType ClientScript
*/
define(["N/record", "N/currentRecord", "N/format", 'N/search', 'N/ui/message', 'N/url'], function(record, currentRecord, format, search, message, url) {
	//Begin: callTaxCreditMemo functionality
	function callTaxCreditMemo() {
		try {
			var currentRec = currentRecord.get(); // return current record obj
			var recordId = currentRec.id;   // return record ID
			var recordType = currentRec.type;  // return record Type
			var myMsg2 = message.create({    // return information msg
				title: 'System processing your request please wait for sometime....',
				type: message.Type.INFORMATION
			    });
			myMsg2.show();
			var s_sut_url = url.resolveScript({    // call suitelet script
			scriptId: "customscript_cleartax_get_ecrdmempdf_sut",
			deploymentId: "customdeploy_cleartax_get_ecrdmempdf_sut"
			});
			s_sut_url += '&custpage_recId=' + recordId + '&custpage_recType=' + recordType;
			window.open(s_sut_url, "_self")  // reload the same page
		} catch (ex) {
			alert(ex)
		}
	}
    //End: callTaxCreditMemo functionality
	
	//Begin: pageInit functionality
	function pageInit(scriptContext) {
		try {

		} catch (ex) {
			alert(JSON.stringify(ex))
		}
	}
	//End: pageInit functionality
	return {
		pageInit: pageInit,
		callTaxCreditMemo: callTaxCreditMemo
	}
	
	//Begin: nullCheck functionality
	function nullCheck(value) {
		if (value != null && value != '' && value != undefined)
			return true;
		else
			return false;
	}
	//End: nullCheck functionality
})