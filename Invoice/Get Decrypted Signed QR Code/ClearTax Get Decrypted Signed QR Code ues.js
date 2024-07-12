/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax Get Decrypted Sign QR Code ues
		Author 			:  	NVT Employee 
		Date            :   05-07-2024
		Description		:	

------------------------------------------------------------------------------------------------*/
/**
	@NApiVersion 2.1
	@NScriptType UserEventScript
*/
define(["N/record", "N/search", "N/ui/serverWidget", 'N/url','./ClearTax Library File.js'], function(record, search, serverWidget, url,ClearTax_Library) {
	function beforeLoad(context) {
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

					var ctax_einvoice_qr_code = record_obj.getValue({
						fieldId: 'custbody_ctax_einvoice_qrcode'
					});
                        
					var getInvStatus = record_obj.getValue({
						fieldId: 'status'
					});
							
					if (getInvStatus !== "Voided") {
						var form = context.form; //return the form obj
						if (_logValidation(ctax_einvoice_qr_code)) {
							
							form.addButton({
								id: 'custpage_einvoice_qr_code',
								label: 'Get Decrypted Signed QR Code',
								functionName: "ClearTax_Get_Decrypted_QR_Code"
							});
							
						}
              					
					}
					//form.clientScriptFileId = 5948
					form.clientScriptModulePath = './ClearTax Get Decrypted Signed QR Code cli.js';
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
		beforeLoad: beforeLoad
	}
})