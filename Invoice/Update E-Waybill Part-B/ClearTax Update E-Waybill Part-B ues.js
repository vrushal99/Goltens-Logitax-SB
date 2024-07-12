/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax Update E-Waybill Part-B ues
		Author 			:  	NVT Employee 
		Date            :   08-07-2024
		Description		:	
------------------------------------------------------------------------------------------------*/
/**
	@NApiVersion 2.1
	@NScriptType UserEventScript
*/
define(["N/record", "N/search", "N/ui/serverWidget", 'N/url'], function (record, search, serverWidget, url) {
	//Begin: ClearTax_Get_E_Invoice_PDF_ues functionality
	function ClearTax_Update_E_Waybill_ues(context) {
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

				var ctax_ewaybill_number = record_obj.getValue({
					fieldId: 'custbody_ctax_ewb_number'
				});

				var ctax_ewaybill_transport_mode = record_obj.getValue({
					fieldId: 'custbody_modeofshipping'
				});

				var ctax_ewaybill_status = record_obj.getValue({
					fieldId: 'custbody_ctax_ewb_status'
				});


				if (_logValidation(ctax_ewaybill_number) && _logValidation(ctax_ewaybill_transport_mode) && (ctax_ewaybill_status != 2)) {
					form.addButton({
						id: 'custpage_update_ewaybill_partb',
						label: 'Update E-Waybill Part-B',
						functionName: "call_update_ewaybill_partb_cli"
					})
				}

				//form.clientScriptFileId = 5953
				form.clientScriptModulePath = './ClearTax Update E-Waybill Part-B cli.js';  // this path is call to client script
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
		beforeLoad: ClearTax_Update_E_Waybill_ues
	}
})