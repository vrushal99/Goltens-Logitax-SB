/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax Generate IRN ues
		Author 			:  	NVT Employee 
		Date            :   02-05-2022 
		Description		:	1. This Script is generated for invoice to ClearTax system
		                    E-Invoice generation button is created through this script and it is invoked only for regular and GST registered Users.

------------------------------------------------------------------------------------------------*/
/**
	@NApiVersion 2.x
	@NScriptType UserEventScript
*/
define(["N/record", "N/search", "N/ui/serverWidget", 'N/url','/SuiteScripts/ClearTax Integration Scripts/ClearTax Library File.js'], function(record, search, serverWidget, url,ClearTax_Library) {
	function ClearTax_Generate_IRN_ues(context) {
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
						 var ctax_einvoice_supplytypecode = record_obj.getValue({
					      fieldId: 'custbody_indgst_inv_supplytypecode'
				        });
						 var ctax_einvoice_customerregtype = record_obj.getValue({
					      fieldId: 'custbody_indgst_sales_customerregtype'
				        });
						var ctax_einvoice_custtinno = record_obj.getValue({
					      fieldId: 'custbody_indgst_sale_custtinno'
				        });
						var form = context.form; //return the form obj
						if(ctax_einvoice_supplytypecode == "7" && ctax_einvoice_customerregtype == "4" && ctax_einvoice_custtinno == ""){ // if supplytypecode is B2C, customerregtype is Unregistered and not available GST no than button will hidden
							
							form.addButton({
								id: 'custpage_crebuttion',
								label:'E-Invoice generation',
							   functionName: "ClearTax_Generate_IRN_Cli"
							}).isHidden = true;
							
						}else{
						var ctax_einvoice_transfer_checkbox = record_obj.getValue({
					      fieldId: 'custbody_ctax_einvoice_transfer'
				        });
						var ctax_einvoice_ack_no = record_obj.getValue({
					      fieldId: 'custbody_ctax_einvoice_ack_no'
				        });
						if(ctax_einvoice_transfer_checkbox == false){ // if checkbox is false then button will show
							form.addButton({
								id: 'custpage_crebuttion',
								label:'E-Invoice generation',
							   functionName: "ClearTax_Generate_IRN_Cli"
							});	
						}else{  // if checkbox is true then button will hidden
							form.addButton({
								id: 'custpage_crebuttion',
								label:'E-Invoice generation',
							   functionName: "ClearTax_Generate_IRN_Cli"
							}).isHidden = true;
						}
					 }						
					}
					//form.clientScriptFileId = 5948
                    form.clientScriptModulePath = '/SuiteScripts/ClearTax Integration Scripts/ClearTax Generate IRN cli.js';					
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
		beforeLoad: ClearTax_Generate_IRN_ues
	}
})