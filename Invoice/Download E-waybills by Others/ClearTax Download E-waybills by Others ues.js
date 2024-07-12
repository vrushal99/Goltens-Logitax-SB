/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	
		Author 			:  	NVT Employee 
		Date            :   11-05-2022 
		Description		:	
------------------------------------------------------------------------------------------------*/
/**
	@NApiVersion 2.1
	@NScriptType UserEventScript
*/
define(["N/record", "N/search", "N/ui/serverWidget", 'N/url'], function (record, search, serverWidget, url) {
	//Begin: ClearTax_ewb_status_from_nic_ues functionality
	function ClearTax_download_ewaybills_by_others_ues(context) {
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

				var ctax_ewaybill_transfer_checkbox = record_obj.getValue({
					fieldId: 'custbody_ctax_ewaybill_transfer'
				});
				log.debug("ctax_ewaybill_transfer_checkbox", ctax_ewaybill_transfer_checkbox)
				var ctax_ewaybill_ack_no = record_obj.getValue({
					fieldId: 'custbody_ctax_ewb_number'
				});
				log.debug("ctax_ewaybill_ack_no", ctax_ewaybill_ack_no)
				var ctax_ewaybill_irn = record_obj.getValue({
					fieldId: 'custbody_ctax_ewaybill_irn'
				});
				log.debug("ctax_ewaybill_irn", ctax_ewaybill_irn)

				if (ctax_ewaybill_transfer_checkbox == true && _logValidation(ctax_ewaybill_ack_no) && _logValidation(ctax_ewaybill_irn)) {
					var form = context.form; //return the form obj

					form.addButton({
						id: 'custpage_dwd_ewb_by_others',
						label: 'Download E-waybills by Others',
						functionName: "callClearTaxDownloadEwaybillOthers"
					})
				}
				log.debug("ClearTax Download E-waybills by Others cli.js", typeOdMode);
				//form.clientScriptFileId = 22625
				form.clientScriptModulePath = './ClearTax Download E-waybills by Others cli.js';  // this path is call to client script
			}
		} catch (ex) {
			log.debug({
				title: 'ex:',
				details: ex
			});
		}
	}
	//End: ClearTax_download_ewaybills_by_others_ues functionality

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
		beforeLoad: ClearTax_download_ewaybills_by_others_ues
	}
})