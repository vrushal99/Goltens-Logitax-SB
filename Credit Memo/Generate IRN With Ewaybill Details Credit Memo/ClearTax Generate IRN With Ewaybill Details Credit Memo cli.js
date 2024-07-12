/*----------------------------------------------------------------------------------------------
        Company Name 	:	Nuvista Technologies Pvt Ltd
        Script Name 	:	
        Author 			:  	NVT Employee 
        Date            :   13-05-2024
        Description		:   

------------------------------------------------------------------------------------------------*/
/**
    @NApiVersion 2.1
    @NScriptType ClientScript
*/
define(["N/record", "N/currentRecord", "N/format", 'N/search', 'N/ui/message', 'N/url'], function (record, currentRecord, format, search, message, url) {

    function ClearTax_Generate_IRN_With_Ewaybill_Cli() {
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
                scriptId: "customscript_cleartax_gen_irn_ewb_cm_sui",
                deploymentId: "customdeploy_cleartax_gen_irn_ewb_cm_sui"
            });
            s_sut_url += '&custpage_recId=' + recordId + '&custpage_recType=' + recordType;
            window.open(s_sut_url, "_self")  // reload the same page


        } catch (ex) {
            alert(ex)
        }
    }

    //Begin: pageInit functionality
    function pageInit(scriptContext) {
        try {

        } catch (ex) {
            alert(JSON.stringify(ex))
        }
    }
    return {
        pageInit: pageInit,
        ClearTax_Generate_IRN_With_Ewaybill_Cli: ClearTax_Generate_IRN_With_Ewaybill_Cli
    }
    //End: pageInit functionality
})