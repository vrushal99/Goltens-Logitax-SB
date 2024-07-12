/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax Cancel E-Waybill ues
		Author 			:  	NVT Employee 
		Date            :   10-04-2024
		Description		:   This script is use to show 'Cancel E-Waybill' button.

------------------------------------------------------------------------------------------------*/
/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 *@NModuleScope Public
 */
//This function is used to add button and virtual fields
define(['N/record', 'N/file', 'N/config', 'N/xml', 'N/search', 'N/render', 'N/format', 'N/task', 'N/http', 'N/runtime', 'N/https', '/SuiteScripts/ClearTax Integration Scripts/ClearTax Library File.js'],
	function(record, file, config, xml, search, render, format, task, http, runtime, https, ClearTax_Library_File) {

		function beforeLoad_ClearTax_Cancel_IRN_ues(context) {
			try {
				if (context.type == context.UserEventType.VIEW) {
					var Formobj = context.form; // return form obj
					var currentRec = context.newRecord; // return current obj
					var invoice_obj = record.load({  // return current record obj
						type: currentRec.type,
						id: currentRec.id,
						isDynamic: true
					});
                    var ewaybill_status = invoice_obj.getValue({
						fieldId: 'custbody_ctax_ewb_status'
					});
					var ewaybill_no = invoice_obj.getValue({
						fieldId: 'custbody_ctax_ewb_number'
					});
					var ewaybill_ack_date = invoice_obj.getValue({
						fieldId: 'custbody_ctax_ewaybill_ack_date'
					});
					log.debug("ewaybill_ack_date", ewaybill_ack_date)
					var ewaybill_cancel_reason_code = invoice_obj.getText({
						fieldId: 'custbody_ctax_cancel_reas_code'
					});
	
					var ewaybill_cancel_remark = invoice_obj.getText({
						fieldId: 'custbody_ctax_cancel_reas_remark'
					});

					// if (_logValidation(ewaybill_ack_date) && ewaybill_status != 2 && _logValidation(ewaybill_cancel_reason_code) && _logValidation(ewaybill_cancel_remark)) {  // if ack_date present and ewaybill status is not cancel then button will show

						if (_logValidation(ewaybill_ack_date) && ewaybill_status != 2) { 

						var parsedDateStringAsRawDateObject = format.parse({
							value: ewaybill_ack_date,
							type: format.Type.DATETIME
						});
						log.debug("parsedDateStringAsRawDateObject", parsedDateStringAsRawDateObject)
						var dateobj = parsedDateStringAsRawDateObject.setDate(parsedDateStringAsRawDateObject.getDate() + 1)
						var d_date = new Date(dateobj)
						log.debug("d_date", d_date)
						var todaytime = new Date().getTime();
						if (ewaybill_no && ewaybill_ack_date && (d_date.getTime() > todaytime)) {  // if ewaybill_no, ewaybill_ack_date is present and also ack-date time is greterthan 24 hour then button will show
                            Formobj.addButton({
                                id: 'custpage_cancel_ewaybill',
                                label: 'Cancel E-Waybill',
                                functionName: "ClearTax_cancel_ewaybill"
                            });
						}
                    }
                    
                    Formobj.clientScriptModulePath = './ClearTax Cancel E-Waybill cli.js';				

				}
			} catch (err) {
				log.debug({
					title: 'err',
					details: err
				});
			}
		}
		 
		 //Begin: _logValidation functionality
		function _logValidation(value) {
			if (value != 'null' && value != null && value != null && value != '' && value != undefined && value != undefined && value != 'undefined' && value != 'undefined' && value != 'NaN' && value != NaN) {
				return true;
			} else {
				return false;
			}
		}
		//End: _logValidation functionality
		return {
			beforeLoad: beforeLoad_ClearTax_Cancel_IRN_ues,
		};
	});