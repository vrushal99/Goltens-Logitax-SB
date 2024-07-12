/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax Initiate mjulti-Vehicle E-waybills ues
		Author 			:  	NVT Employee 
		Date            :   22-04-20224
		Description		:	1. This Script is created for Initiate mjulti-vehicle ewaybill
------------------------------------------------------------------------------------------------*/
/**
	@NApiVersion 2.1
	@NScriptType UserEventScript
*/
define(["N/record", "N/search", "N/ui/serverWidget", 'N/url'], function (record, search, serverWidget, url) {
	//Begin: ClearTax_Get_E_Waybill_PDF_ues functionality
	function beforeLoad(context) {
		try {
			var newRecord = context.newRecord; //return record obj
			var recordType = newRecord.type; //return record type
			var recordId = newRecord.id; //return record id
			var typeOdMode = context.type //mode of record 
			if (typeOdMode == "view") {
				var record_obj = record.load({ //return the record obj data
					type: recordType,
					id: recordId,
					isDynamic: true
				})
				var form = context.form; //return the form obj

				var eway_bill_irn = record_obj.getValue({
					fieldId: 'custbody_ctax_ewaybill_irn'
				});
				log.debug("eway_bill_irn", eway_bill_irn)
				var ctax_ewaybill_ack_no = record_obj.getValue({
					fieldId: 'custbody_cleartax_ewaybill_number'
				});
				var getInvStatus = record_obj.getValue({
					fieldId: 'status'
				});

				if (getInvStatus !== "Voided") {

					if (_logValidation(eway_bill_irn)) { // if checkbox is true, einvoice_ack_no, einvoice_irn, einvoice_qrcode and printeinvoice is empty then Button will show
						form.addButton({
							id: 'custpage_crebuttion',
							label: 'Initiate Multi-Vehicle E-Waybills',
							functionName: "callClearTaxMultiVehicleEwaybill"
						})
					}
				}
				//form.clientScriptFileId = 5953
				form.clientScriptModulePath = './ClearTax Initiate Multi-Vehicle E-Waybills cli.js';  // this path is call to client script
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
		beforeLoad: beforeLoad
	}
})