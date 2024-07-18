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
    //Begin: cancel_irn_cli functionality
    function cancel_irn_cli() {
        try {
            var currentRec = currentRecord.get(); // return current record obj
            var recordId = currentRec.id; // return record ID
            var recordType = currentRec.type; // return record Type
            var myMsg2 = message.create({ // return information msg
                title: 'System processing your request please wait for sometime....',
                type: message.Type.INFORMATION
            });
            myMsg2.show();

            var s_sut_url = url.resolveScript({ // call suitelet script
                scriptId: "customscript_cleartaxcancl_irn_manualsui",
                deploymentId: "customdeploy_cleartaxcancl_irn_manualsui"
            });
            s_sut_url += '&custpage_recId=' + recordId + '&custpage_recType=' + recordType;
            window.open(s_sut_url, "_self") // reload the same page


        } catch (ex) {
            alert(ex)
        }
    }
    //End: cancel_irn_cli functionality 

    //Begin: pageInit functionality
    function pageInit(context) {
        var record = context.currentRecord;
    }
    //end: pageInit functionality
    return {
        pageInit: pageInit,
        cancel_irn_cli: cancel_irn_cli
    }

    function nullCheck(value) {
        if (value != null && value != '' && value != undefined)
            return true;
        else
            return false;
    }
})