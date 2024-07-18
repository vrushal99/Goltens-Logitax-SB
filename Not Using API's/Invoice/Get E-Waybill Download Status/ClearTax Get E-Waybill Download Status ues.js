/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	
		Author 			:  	NVT Employee 
		Date            :   19/04/2024
		Description		:	
------------------------------------------------------------------------------------------------*/
/**
	@NApiVersion 2.1
	@NScriptType UserEventScript
*/
define(["N/record", "N/search", "N/ui/serverWidget", 'N/url'], function (record, search, serverWidget, url) {

	function ClearTax_Get_Ewaybill_Download_Status_ues(context) {
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
				var form = context.form; //return the form obj

				var ctax_ewaybill_workflowid = record_obj.getValue({
					fieldId: 'custbody_ctax_wk_id_ewb_other'
				});

				var ctax_ewaybill_number = record_obj.getValue({
					fieldId: 'custbody_ctax_ewb_number'
				});

				var ctax_ewaybill_status = record_obj.getValue({
					fieldId: 'custbody_ctax_ewb_status'
				});

				if (_logValidation(ctax_ewaybill_workflowid) && _logValidation(ctax_ewaybill_number) && ctax_ewaybill_status != 2) { //ewaybill status is not equal to cancel and workflow id not empty and ewaybill number not empty
					form.addButton({
						id: 'custpage_get_ewaybill_download_status',
						label: 'Get E-Waybill Download Status',
						functionName: "get_ewaybill_download_status_cli"
					});
				}

				//form.clientScriptFileId = 5953
				form.clientScriptModulePath = './ClearTax Get E-Waybill Download Status cli.js';  // this path is call to client script
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
		beforeLoad: ClearTax_Get_Ewaybill_Download_Status_ues
	}
})