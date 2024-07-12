/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax Get E-Waybill PDF cli
		Author 			:  	NVT Employee 
		Date            :   11-05-2022
		Description		:   1. This Script is created for E-Invoice Print
		                    (When E-Invoice print button is triggered, script is invoked to display a message "Wait for sometime, system is Processing")

------------------------------------------------------------------------------------------------*/
/**
	@NApiVersion 2.x
	@NScriptType ClientScript
*/
define(["N/record", "N/currentRecord", "N/format", 'N/search', 'N/ui/message', 'N/url'], function(record, currentRecord, format, search, message, url) {
	//Begin: callClearTaxWaybill functionality
	function callClearTaxWaybill() {
		try {
			var currentRec = currentRecord.get(); // return current record obj
			var recordId = currentRec.id; // return record ID
			var recordType = currentRec.type; // return record Type
			var myMsg2 = message.create({  // return information msg
				title: 'System processing your request please wait for sometime....',
				type: message.Type.INFORMATION
			});
			myMsg2.show();

			var s_sut_url = url.resolveScript({   // call suitelet script
				scriptId: "customscript_cleartax_get_ewaybillpdfsut",
				deploymentId: "customdeploy_cleartax_get_ewaybillpdfsut"
			    });
			s_sut_url += '&custpage_recId=' + recordId + '&custpage_recType=' + recordType;
			window.open(s_sut_url, "_self")  // reload the same page


		} catch (ex) {
			alert(ex)
		}
	}
    //End: callClearTaxWaybill functionality 
	
	//Begin: pageInit functionality
	function pageInit(scriptContext) {
		try {
		 var fileId = getNS_url_param('custparam_fileId', window.location.href);
		 // alert(fileId)

		} catch (ex) {
			alert(JSON.stringify(ex))
		}
	}
	return {
		pageInit: pageInit,
		callClearTaxWaybill: callClearTaxWaybill
	}
    	//End: pageInit functionality
		
	//Begin: getNS_url_param functionality
	function getNS_url_param(name, url) {
		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regexS = "[\\?&]" + name + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(url);
		if (results == null)
			return "";
		else
			return results[1];
	}
 
    //End: getNS_url_param functionality
	function nullCheck(value) {
		if (value != null && value != '' && value != undefined)
			return true;
		else
			return false;
	}
})