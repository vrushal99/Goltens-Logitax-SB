/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax Get IRN Details By Doc Num ues
		Author 			:  	NVT Employee 
		Date            :   04-07-2024
		Description		:	

------------------------------------------------------------------------------------------------*/
/**
	@NApiVersion 2.1
	@NScriptType UserEventScript
*/
define(["N/record", "N/search", "N/ui/serverWidget", 'N/url','./ClearTax Library File.js'], function(record, search, serverWidget, url,ClearTax_Library) {
	function ClearTax_Get_IRN_Details_By_Doc_Num_ues(context) {
		try {
			var newRecord = context.newRecord; //return record obj
			//log.debug("newRecord",newRecord)
			var recordType = newRecord.type; //return record type
			//log.debug("recordType",recordType)
			var recordId = newRecord.id; //return record id
			//log.debug("recordId",recordId)
			var typeOdMode = context.type //mode of record 
			//log.debug("typeOdMode",typeOdMode)
			if (typeOdMode == "view") // only it will execute "view" mode
			{
					var record_obj = record.load({ //return record obj data 
						type: recordType,
						id: recordId,
						isDynamic: true
					})
				if (_logValidation(record_obj)) {
					var ctax_einvoice_irn = record_obj.getValue({
						fieldId: 'custbody_ctax_einvoice_irn'
					});
                        
					//  var ctax_get_invoice_response = record_obj.getValue({
					//     fieldId: 'custbody_ctax_geteinvoice_url'
					//   });
					var getInvStatus = record_obj.getValue({
						fieldId: 'status'
					});
							
					if (getInvStatus !== "Voided") {
						var form = context.form; //return the form obj
						if (_logValidation(ctax_einvoice_irn)) { //if cleartax einvoice irn present then button will display
							
							form.addButton({
								id: 'custpage_get_irn_by_doc',
								label: 'Get IRN Details By Doc',
								functionName: "ClearTax_Get_IRN_Det_By_Doc"
							});
							
						}
              					
					}
					//form.clientScriptFileId = 5948
					form.clientScriptModulePath = './ClearTax Get IRN Details by Document Number cli.js';
				}	
			}
		} catch (ex) {
			log.debug({
				title: 'ex:',
				details: ex
			});
		}
	}

	function _logValidation(value) {
		if (value != 'null' && value != '' && value != undefined && value != 'NaN') {
			return true;
		} else {
			return false;
		}
	}
	return {
		beforeLoad: ClearTax_Get_IRN_Details_By_Doc_Num_ues
	}
})