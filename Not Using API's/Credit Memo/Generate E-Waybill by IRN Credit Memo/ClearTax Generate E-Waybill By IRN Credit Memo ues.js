/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax Generate E-Waybil By IRN CM ues
		Author 			:  	NVT Employee 
		Date            :   03-05-2024 
		Description		:	

------------------------------------------------------------------------------------------------*/
/**
	@NApiVersion 2.1
	@NScriptType UserEventScript
*/
define(["N/record", "N/search", "N/ui/serverWidget", 'N/url'], function(record, search, serverWidget, url) {
	function ClearTax_Get_CreditMemo_IRN_ues(context) {
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
					if (_logValidation(record_obj)) 
					{
						 var ctax_einvoice_irn = record_obj.getValue({
					      fieldId: 'custbody_ctax_creditnote_irn'
						 });
						
						 var ctax_einvoice_cancel_irn = record_obj.getValue({
							fieldId: 'custbody_ctax_ecreditnote_canceli'
						 });
						
						 var ctax_ewaybill_check = record_obj.getValue({
							fieldId: 'custbody_ctax_ewaybill_transfer'
						 });
						 
						var ctax_ewaybill_status = record_obj.getValue({
							fieldId: 'custbody_ctax_ewb_status'
						 });
        
						var form = context.form; //return the form obj
						if(_logValidation(ctax_einvoice_irn) && ctax_ewaybill_check == false && !_logValidation(ctax_einvoice_cancel_irn)){ //if cleartax einvoice irn present and ewaybill transfer is checked then button will display
							
                            form.addButton({
                                id: 'custpage_generate_ewaybill_by_irn',
                                label: 'Generate E-Waybill By IRN',
                                functionName: "ClearTax_Generate_Ewaybill_by_irn"
                            });
							
						}
						else if (_logValidation(ctax_einvoice_irn) && ctax_ewaybill_check == true && ctax_ewaybill_status == 2) { //if invoice irn present and ewaybill transfer checkbox is checked and ewaybill status is cancel.
							
							form.addButton({
                                id: 'custpage_generate_ewaybill_by_irn',
                                label: 'Generate E-Waybill By IRN',
                                functionName: "ClearTax_Generate_Ewaybill_by_irn"
                            });
							
						}
              					
					}
					//form.clientScriptFileId = 5948
                    form.clientScriptModulePath = './ClearTax Generate E-Waybill By IRN Credit Memo cli.js';					
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
		beforeLoad: ClearTax_Get_CreditMemo_IRN_ues
	}
})