/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	
		Author 			:  	NVT Employee 
		Date            :   
		Description		:	
------------------------------------------------------------------------------------------------*/
/**
	@NApiVersion 2.1
	@NScriptType UserEventScript
*/
define(["N/record", "N/search", "N/ui/serverWidget", 'N/url'], function(record, search, serverWidget, url) {
	//Begin: ClearTax_Get_E_Invoice_PDF_ues functionality
	function ClearTax_Get_Consolidated_EWB_PDF_ues(context) {
		try {
			var newRecord = context.newRecord; //return record obj
			//log.debug("newRecord",newRecord)
			var recordType = newRecord.type; //return record type
			//log.debug("recordType",recordType)
			var recordId = newRecord.id; //return record id
			//log.debug("recordId",recordId)
			var typeOdMode = context.type //mode of record 
			//log.debug("typeOdMode",typeOdMode)
			if (typeOdMode == "view") {
				var record_obj = record.load({ //return the record obj data
					type: recordType,
					id: recordId,
					isDynamic: true
				})
				if (recordType == "invoice") {
					var form = context.form; //return the form obj

					var ctax_ewaybill_consolidated_num = record_obj.getValue({
						fieldId: 'custbody_ctax_con_ewb_no'
					});

					var ctax_ewaybill_consolidated_pdf = record_obj.getValue({
						fieldId: 'custbody_ctax_store_con_pdf'
					});
		
					var getInvStatus = record_obj.getValue({
						fieldId: 'status'
					});
						
					if (getInvStatus !== "Voided") {

						if (_logValidation(ctax_ewaybill_consolidated_num) && !_logValidation(ctax_ewaybill_consolidated_pdf)) {
							form.addButton({
								id: 'custpage_consolidated_ewb_no',
								label: 'Get Consolidated EWB PDF',
								functionName: "get_consolidated_pdf_cli"
							})
						}
					}
					//form.clientScriptFileId = 5953
					form.clientScriptModulePath = './ClearTax Get Consolidated EWB PDF cli.js';  // this path is call to client script
				}
			}
		} catch (ex) {
			log.debug({
				title: 'ex:',
				details: ex
			});
		}
	}
	//End: ClearTax_Get_E_Invoice_PDF_ues functionality

	//Begin: _logValidation functionality
	function _logValidation(value) {
		if (value != 'null' && value != '' && value != undefined && value != 'NaN') {
			return true;
		} else {
			return false;
		}
	}
	//End: _logValidation functionality

	return {
		beforeLoad: ClearTax_Get_Consolidated_EWB_PDF_ues
	}
})