/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax Cancel IRN CreditMemo ues	
		Author 			:  	NVT Employee 
		Date            :   24-05-2022
		Description		:   1.This Script is created to cancel the IRN process
		                    Script triggers when Void button is invoked. Void button will be visible only for 24 Hrs to request for cancellation and it is disabled after 24 Hrs.
                            Once script triggers,request will be sent for cancellation of invoice due to invalid data or item cancellation.

------------------------------------------------------------------------------------------------*/
/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 *@NModuleScope Public
 */
//
define(['N/record', 'N/file', 'N/config', 'N/xml', 'N/search', 'N/render', 'N/format', 'N/task', 'N/http', 'N/runtime', 'N/https', '/SuiteScripts/ClearTax Integration Scripts/ClearTax Library File.js'],
	function(record, file, config, xml, search, render, format, task, http, runtime, https, ClearTax_Library_File) {
		//Begin: beforeLoad_ClearTax_Cancel_IRN_CreditMemo_ues functionality
		function beforeLoad_ClearTax_Cancel_IRN_CreditMemo_ues(context) {
			try {
				if (context.type == context.UserEventType.EDIT) {
					var Formobj = context.form; // return form obj
					var currentRec = context.newRecord; // return current obj
					var creditmemo_obj = record.load({  // return current record obj
						type: currentRec.type,
						id: currentRec.id,
						isDynamic: true
					});
					var creditmemo_status = creditmemo_obj.getValue({
						fieldId: 'status'
					});
					var creditmemo_irn = creditmemo_obj.getValue({
						fieldId: 'custbody_ctax_creditnote_irn'
					});
					var creditmemo_ack_date = creditmemo_obj.getValue({
						fieldId: 'custbody_ctax_creditnote_ack_date'
					});
					log.debug("creditmemo_ack_date", creditmemo_ack_date)

					var cleartax_ewaybill_num = creditmemo_obj.getValue({
						fieldId: 'custbody_ctax_ewb_number'
					});
					var cleartax_ewaybill_cancel_irn = creditmemo_obj.getValue({
						fieldId: 'custbody_ctax_ewaybill_cancelurn'
					});

					if (_logValidation(creditmemo_ack_date)) {  // if ack_date have then condition will execute

						var ackAndTodayDateHrs = calculateHoursFromAckAndTodayDate(creditmemo_ack_date);
						ackAndTodayDateHrs = parseInt(ackAndTodayDateHrs);
						log.debug('ackAndTodayDateHrs', ackAndTodayDateHrs);

						if (!_logValidation(creditmemo_irn)) { //voidfix:16.04.2024 - add condition to remove button if irn is not present

							Formobj.removeButton({
								id: "void"
							});
						}
						else if (_logValidation(creditmemo_irn) && _logValidation(cleartax_ewaybill_num) && !_logValidation(cleartax_ewaybill_cancel_irn)) {

							Formobj.removeButton({
								id: "void"
							});

						}
						else {
							if (creditmemo_irn && creditmemo_ack_date && (ackAndTodayDateHrs > 24)) {  // if invoice_irn, invoice_ack_date is todaytime greterthan 24 hour then button will remove
								Formobj.removeButton({
									id: "void"
								})
							}
						}
					}
					else { //voidfix:16.04.2024 - add condition to remove button if acknowledge date is not present

						Formobj.removeButton({
							id: "void"
						});

					}
				}
			} catch (err) {
				log.debug({
					title: 'err',
					details: err
				});
			}
		}
		//End: beforeLoad_ClearTax_Cancel_IRN_CreditMemo_ues functionality
		
		function calculateHoursFromAckAndTodayDate(invoice_ack_date) {

			try {

				var invoiceAckDateParse = format.parse({
					value: invoice_ack_date,
					type: format.Type.DATETIMETZ,
					timezone: format.Timezone.ASIA_CALCUTTA
				});
				invoiceAckDateParse = format.format({
					value: invoiceAckDateParse,
					type: format.Type.DATETIMETZ,
					timezone: format.Timezone.ASIA_CALCUTTA
				});
				// log.debug('invoiceAckDateParse', invoiceAckDateParse);

				var todayDate = new Date();

				var todayDateFormat = format.format({
					value: todayDate,
					type: format.Type.DATETIMETZ,
					timezone: format.Timezone.ASIA_CALCUTTA
				});

				// log.debug('todayDateFormat', todayDateFormat);

				var inputDateString = String(todayDateFormat); // Example input date string
				var inputDate = new Date(inputDateString); // Parse the input date string


				// Extract date components
				var year = inputDate.getFullYear();
				var month = String(inputDate.getMonth() + 1).padStart(2, '0'); // Month is zero-based
				var day = String(inputDate.getDate()).padStart(2, '0');
				var hours = String(inputDate.getHours()).padStart(2, '0');
				var minutes = String(inputDate.getMinutes()).padStart(2, '0');
				var seconds = String(inputDate.getSeconds()).padStart(2, '0');

				// Construct the desired output format
				var todayOutputDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
				// log.debug('todayOutputDate', todayOutputDate);

				// Parse the input date strings into Date objects
				var date1 = new Date(todayOutputDate);
				var date2 = new Date(invoiceAckDateParse);

				// Calculate the difference in milliseconds
				var differenceInMilliseconds = Math.abs(date2 - date1);

				// Convert milliseconds to hours
				var differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
				// log.debug('differenceInHours', differenceInHours);

				return differenceInHours;
			}
			catch (e) {

				log.error('error in calculateHoursFromAckAndTodayDate() function', e.toString());
			}
		}


		//Begin: afterSubmit_ClearTax_Cancel_IRN_CreditMemo_ues functionality
		function afterSubmit_ClearTax_Cancel_IRN_CreditMemo_ues(context) {
			try {
				if (context.type != context.UserEventType.DELETE) {
					var currentRec = context.newRecord;
					//Load Invoice group record
					var creditmemo_obj = record.load({  // return current record obj
						type: currentRec.type,
						id: currentRec.id,
						isDynamic: true
					});
					//log.debug("invoice_obj", invoice_obj)
					var creditmemo_obj_subsidiary = creditmemo_obj.getValue({
						fieldId: 'subsidiary'
					});
					if (_logValidation(creditmemo_obj_subsidiary)) {
						var subsidiary_obj = record.load({
							type: "subsidiary",
							id: creditmemo_obj_subsidiary,
							isDynamic: true
						});
						var gst_number = subsidiary_obj.getValue({
							fieldId: 'federalidnumber'
						});
						if (_logValidation(gst_number)) {
							gst_number = gst_number
						} else {
							gst_number = ""
						}
						log.debug("gst_number", gst_number)
					}
					var creditmemo_obj_printeinvoice = creditmemo_obj.getValue({
						fieldId: 'custbody_ctax_ecreditnote_print'
					});
					var creditmemo_obj_status = creditmemo_obj.getValue({
						fieldId: 'status'
					});
					log.debug("creditmemo_obj_status", creditmemo_obj_status)
					var creditmemo_obj_irn = creditmemo_obj.getValue({
						fieldId: 'custbody_ctax_creditnote_irn'
					});
					log.debug("creditmemo_obj_irn", creditmemo_obj_irn)
					var creditmemo_obj_cancelirn = creditmemo_obj.getValue({
						fieldId: 'custbody_ctax_ecreditnote_canceli'
					});
					log.debug("creditmemo_obj_cancelirn", creditmemo_obj_cancelirn)

					var creditmemo_obj_cancel_code = creditmemo_obj.getValue({
						fieldId: 'custbody_ctax_einvoice_cancel_irn'
					});

					var creditmemo_obj_cancel_remark = creditmemo_obj.getValue({
						fieldId: 'custbody_ctax_cancel__irn_remark'
					});

					var accountId = runtime.accountId; // return accountId
					var environment = runtime.envType; // PRODUCTION, SANDBOX, etc.
					log.debug("environment", environment)
					var Configuration_data = ClearTax_Library_File.ClearTax_Einvoice_library()
					log.debug("Configuration_data", Configuration_data)
					var get_environment_name = Configuration_data[environment]
					log.debug("get_environment_name", get_environment_name)
					var cancel_irn_url = get_environment_name["CANCEL_IRN_URL"]
					log.debug("cancel_irn_url", cancel_irn_url)
					var auth_token = get_environment_name["AUTH_TOKEN"]
					log.debug("auth_token", auth_token)
					var print_einvoice_url = get_environment_name["PRINT_E_INVOICE_URL"]
					log.debug("print_einvoice_url", print_einvoice_url)
					var printfolderid = get_environment_name["PRINT_EINVOICE_FOLDER_ID"]
					log.debug("printfolderid", printfolderid)
					if (creditmemo_obj_status == 'Voided' && _logValidation(creditmemo_obj_irn) && !_logValidation(creditmemo_obj_cancelirn)) {
						// cancel IRN integration start
						var _url = cancel_irn_url
						var headerObj = {
							"X-Cleartax-Auth-Token": auth_token,
							// "owner_id": '9abeb2db-955c-49c6-99b9-e2589314896b',//08.04.2024 - commented
							"gstin": gst_number,
							// "x-cleartax-product": 'EInvoice',//08.04.2024 - commented
							"Content-Type": "application/json",
							"accept": "application/json"
						}
						// var body_data = {};

						if (_logValidation(creditmemo_obj_cancel_code) && _logValidation(creditmemo_obj_cancel_remark)) {
							
							var body_data = [{
								"irn": creditmemo_obj_irn,
								"CnlRsn": creditmemo_obj_cancel_code,
								"CnlRem": creditmemo_obj_cancel_remark
							}]
						}
						else {
							
							var body_data = [{
								"irn": creditmemo_obj_irn,
								"CnlRsn": "4",
								"CnlRem": "Cancelled by User"
							}]
						}
						
						var response = https.put({   //return the request and response
							body: JSON.stringify(body_data),
							url: _url,
							headers: headerObj
						});
						log.debug({
							title: '_url',
							details: _url
						});
						log.debug({
							title: 'body_data',
							details: JSON.stringify(body_data)
						});
						log.debug({
							title: 'response.code',
							details: response.code
						});
						log.debug({
							title: 'response.body',
							details: response.body
						});
						if (response.code == 200) {
							var parseObdy = JSON.parse(response.body)
							var error = parseObdy[0]["govt_response"]["Success"]
							log.debug("error", error)
							if (_logValidation(error) && error == "N") {
								var get_error = parseObdy[0]["govt_response"]["ErrorDetails"][0]["error_message"]
							} else if (_logValidation(error) && error == "Y") {
								var parseObdy_cancelIrn = parseObdy[0]["govt_response"]["Irn"]
								creditmemo_obj.setValue({
									fieldId: 'custbody_ctax_ecreditnote_canceli',
									value: parseObdy_cancelIrn
								});
								if (_logValidation(creditmemo_obj_printeinvoice) && _logValidation(creditmemo_obj_irn)) {
									var print_url = print_einvoice_url + creditmemo_obj_irn
									log.debug("print_url", print_url)
									var print_headerObj = {
										"X-Cleartax-Auth-Token": auth_token,
										// "owner_id": '9abeb2db-955c-49c6-99b9-e2589314896b',
										"gstin": gst_number,
										// "x-cleartax-product": 'EInvoice',
										"Content-Type": "application/pdf"
									}
									var pdf_response = https.get({   // return request and response
										url: print_url,
										headers: print_headerObj
									});
									log.debug({
										title: 'pdf_response.code',
										details: pdf_response.code
									});
									log.debug({
										title: 'pdf_response.body',
										details: pdf_response.body
									});
									var fileObj = file.create({
										name: 'E-CreditMemo print' + currentRec.id + '.pdf',
										fileType: file.Type.PDF,
										contents: pdf_response.body,
									});
									fileObj.encoding = file.Encoding.UTF_8;
									fileObj.folder = printfolderid;
									var file_id = fileObj.save();
									log.debug("file_id", file_id);
									if (file_id) {
										creditmemo_obj.setValue({
											fieldId: 'custbody_ctax_ecreditnote_print',
											value: file_id
										});
									}
								}
							}
							var recordId = creditmemo_obj.save({  //return the save record obj
								enableSourcing: true,
								ignoreMandatoryFields: true
							});
							log.debug("recordId", recordId)
						}

					}
				}
			} catch (err) {
				log.debug({
					title: 'err',
					details: err
				});
			}
		}
        //End: afterSubmit_ClearTax_Cancel_IRN_CreditMemo_ues functionality
		
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
			beforeLoad: beforeLoad_ClearTax_Cancel_IRN_CreditMemo_ues,
			afterSubmit: afterSubmit_ClearTax_Cancel_IRN_CreditMemo_ues
		};
	});