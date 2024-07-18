/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax Generate IRN Credit Memo ues
		Author 			:  	NVT Employee 
		Date            :   15-07-2024
		Description		:	

------------------------------------------------------------------------------------------------*/
/**
	@NApiVersion 2.1
	@NScriptType UserEventScript
*/

define(["N/record", "N/search", "N/ui/serverWidget", 'N/url'], function (record, search, serverWidget, url) {

	function ClearTax_Generate_IRN_CreditMemo_ues(context) {
		try {
			var newRecord = context.newRecord; //return record obj
			//log.debug("newRecord",newRecord)
			var recordType = newRecord.type; //return record type
			log.debug("recordType", recordType)
			var recordId = newRecord.id; //return record id
			//log.debug("recordId",recordId)
			var typeOdMode = context.type //mode of record 
			//log.debug("typeOdMode",typeOdMode)
			if (typeOdMode == "view") {

				var form = context.form; //return the form obj

				var record_obj = record.load({  //return the current record obj
					type: recordType,
					id: recordId,
					isDynamic: true
				})
				log.debug("record_obj", JSON.stringify(record_obj))
				if (_logValidation(record_obj)) {
					var ctax_einvoice_supplytypecode = record_obj.getValue({
						fieldId: 'custbody_indgst_inv_supplytypecode'
					});
					log.debug("ctax_einvoice_supplytypecode", ctax_einvoice_supplytypecode)
					var ctax_einvoice_customerregtype = record_obj.getValue({
						fieldId: 'custbody_indgst_sales_customerregtype'
					});
					var ctax_einvoice_custtinno = record_obj.getValue({
						fieldId: 'custbody_indgst_sale_custtinno'
					});
					if (ctax_einvoice_supplytypecode == "7" && ctax_einvoice_customerregtype == "4" && ctax_einvoice_custtinno == "") {  // if supplytypecode is B2C , customerregtype is 	Unregistered then button will hidden
						form.addButton({
							id: 'custpage_crebuttion',
							label: 'E-CreditMemo Generation',
							functionName: "ClearTax_Generate_IRN_CreditMemo_cli"
						}).isHidden = true;

					}
					else {
						var ctax_einvoice_transfer_checkbox = record_obj.getValue({
							fieldId: 'custbody_ctax_creditnote_transfer'
						});
						var ctax_einvoice_ack_no = record_obj.getValue({
							fieldId: 'custbody_ctax_creditnote_ack_no'
						});
						if (ctax_einvoice_transfer_checkbox == false) {  // if check box is false then button will showcase 
							var form = context.form; //return the form obj	
							form.addButton({
								id: 'custpage_crebuttion',
								label: 'E-CreditMemo Generation',
								functionName: "ClearTax_Generate_IRN_CreditMemo_cli"
							});
						} else {  // if check box is true then button will Hidden

							form.addButton({
								id: 'custpage_crebuttion',
								label: 'E-CreditMemo Generation',
								functionName: "ClearTax_Generate_IRN_CreditMemo_cli"
							}).isHidden = true;
						}
					}
				}
				form.clientScriptModulePath = './ClearTax Generate IRN Credit Memo cli.js';	 // this is path is call client script				
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
		beforeLoad: ClearTax_Generate_IRN_CreditMemo_ues
	}
})