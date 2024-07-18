/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax Get E-Invoice PDF ues
		Author 			:  	NVT Employee 
		Date            :   15-07-2024 
		Description		:	
------------------------------------------------------------------------------------------------*/
/**
	@NApiVersion 2.1
	@NScriptType UserEventScript
*/
define(["N/record", "N/search", "N/ui/serverWidget", 'N/url'], function (record, search, serverWidget, url) {
	//Begin: ClearTax_Get_E_Invoice_PDF_ues functionality
	function ClearTax_Get_E_Invoice_PDF_ues(context) {
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

				var ctax_einvoice_transfer_checkbox = record_obj.getValue({
					fieldId: 'custbody_ctax_einvoice_transfer'
				});
				//log.debug("ctax_einvoice_transfer_checkbox", ctax_einvoice_transfer_checkbox)
	
				var ctax_einvoice_irn = record_obj.getValue({
					fieldId: 'custbody_ctax_einvoice_irn'
				});
				var getInvStatus = record_obj.getValue({
					fieldId: 'status'
				});
				var ctax_einvoice_pdf_url = record_obj.getValue({
					fieldId: 'custbody_logitax_einvoice_pdf_url'
				});

				var ctax_print_invoice = record_obj.getValue({
					fieldId: 'custbody_ctax_einvoice_printeinvoice'
				});

				if (getInvStatus !== "Voided") {

					if (ctax_einvoice_transfer_checkbox == true && _logValidation(ctax_einvoice_irn) && _logValidation(ctax_einvoice_pdf_url) && !_logValidation(ctax_print_invoice)) { // if checkbox is true, einvoice_irn and printeinvoice is empty then Button will show
						form.addButton({
							id: 'custpage_print_invoice_btn',
							label: 'E-Invoice Print',
							functionName: "callClearTaxInvoice"
						})
					}
				}
				//form.clientScriptFileId = 5953
				form.clientScriptModulePath = './ClearTax Get E-Invoice PDF cli.js';  // this path is call to client script
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
		beforeLoad: ClearTax_Get_E_Invoice_PDF_ues
	}
})