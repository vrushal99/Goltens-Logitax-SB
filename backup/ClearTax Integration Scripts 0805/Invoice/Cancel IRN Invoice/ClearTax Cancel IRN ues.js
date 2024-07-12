/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax Cancel IRN ues
		Author 			:  	NVT Employee 
		Date            :   12-05-2022
		Description		:   1.This Script is created to cancel the IRN process
							Script triggers when Void button is invoked. Void button will be visible only for 24 Hrs to request for cancellation and it is disabled after 24 Hrs.
							Once script triggers,request will be sent for cancellation of invoice due to invalid data or item cancellation.

------------------------------------------------------------------------------------------------*/
/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 *@NModuleScope Public
 */
//This function is used to add button and virtual fields
define(['N/record', 'N/file', 'N/config', 'N/xml', 'N/search', 'N/render', 'N/format', 'N/task', 'N/http', 'N/runtime', 'N/https', '/SuiteScripts/ClearTax Integration Scripts/ClearTax Library File.js'],
	function (record, file, config, xml, search, render, format, task, http, runtime, https, ClearTax_Library_File) {
		//Begin: beforeLoad_ClearTax_Cancel_IRN_ues functionality
		function beforeLoad_ClearTax_Cancel_IRN_ues(context) {
			try {
				if (context.type == context.UserEventType.EDIT) {
					var Formobj = context.form; // return form obj
					var currentRec = context.newRecord; // return current obj
					var invoice_obj = record.load({  // return current record obj
						type: currentRec.type,
						id: currentRec.id,
						isDynamic: true
					});
					var invoice_irn = invoice_obj.getValue({
						fieldId: 'custbody_ctax_einvoice_irn'
					});
					var invoice_ack_date = invoice_obj.getValue({
						fieldId: 'custbody_ctax_einvoice_ack_date'
					});
					// log.debug("invoice_ack_date", invoice_ack_date)

					var cleartax_ewaybill_num = invoice_obj.getValue({
						fieldId: 'custbody_ctax_ewb_number'
					});
					var cleartax_ewaybill_cancel_irn = invoice_obj.getValue({
						fieldId: 'custbody_ctax_ewaybill_cancelurn'
					});

					if (_logValidation(invoice_ack_date)) {  // if ack_date have then condition will execute

						var ackAndTodayDateHrs = calculateHoursFromAckAndTodayDate(invoice_ack_date);
						ackAndTodayDateHrs = parseInt(ackAndTodayDateHrs);
						log.debug('ackAndTodayDateHrs', ackAndTodayDateHrs);

						if (!_logValidation(invoice_irn)) { //voidfix:16.04.2024 - add condition to remove button if irn is not present

							Formobj.removeButton({
								id: "void"
							});
						}
						else if (_logValidation(invoice_irn) && _logValidation(cleartax_ewaybill_num) && !_logValidation(cleartax_ewaybill_cancel_irn)) {

							Formobj.removeButton({
								id: "void"
							});

						}
						else {

							if (invoice_irn && invoice_ack_date && (ackAndTodayDateHrs > 24)) {  // if invoice_irn, invoice_ack_date is todaytime greterthan 24 hour then button will remove
								Formobj.removeButton({
									id: "void"
								});

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
		//End: beforeLoad_ClearTax_Cancel_IRN_ues functionality


		//Begin: afterSubmit_ClearTax_Cancel_IRN_ues functionality
		function afterSubmit_ClearTax_Cancel_IRN_ues(context) {
			try {
				if (context.type != context.UserEventType.DELETE) {
					var currentRec = context.newRecord;

					var invoice_obj = record.load({   // return current record obj
						type: currentRec.type,
						id: currentRec.id,
						isDynamic: true
					});

					//log.debug("invoice_obj", invoice_obj)
					var invoice_obj_subsidiary = invoice_obj.getValue({
						fieldId: 'subsidiary'
					});
					if (_logValidation(invoice_obj_subsidiary)) {
						var subsidiary_obj = record.load({
							type: "subsidiary",
							id: invoice_obj_subsidiary,
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
					var invoice_obj_printeinvoice = invoice_obj.getValue({
						fieldId: 'custbody_ctax_einvoice_printeinvoice'
					});
					var invoice_obj_status = invoice_obj.getValue({
						fieldId: 'status'
					});
					log.debug("invoice_obj_status", invoice_obj_status)
					var invoice_obj_irn = invoice_obj.getValue({
						fieldId: 'custbody_ctax_einvoice_irn'
					});
					log.debug("invoice_obj_irn", invoice_obj_irn)
					var invoice_obj_cancelirn = invoice_obj.getValue({
						fieldId: 'custbody_ctax_einvoice_cancelirn'
					});
					log.debug("invoice_obj_cancelirn", invoice_obj_cancelirn)

					var invoice_obj_cancel_code = invoice_obj.getValue({
						fieldId: 'custbody_ctax_einvoice_cancel_irn'
					});

					var invoice_obj_cancel_remark = invoice_obj.getValue({
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
					if (invoice_obj_status == 'Voided' && _logValidation(invoice_obj_irn) && !_logValidation(invoice_obj_cancelirn)) {  // if status is void then condition will execute
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

						if (_logValidation(invoice_obj_cancel_code) && _logValidation(invoice_obj_cancel_remark)) {
							
							var body_data = [{
								"irn": invoice_obj_irn,
								"CnlRsn": invoice_obj_cancel_code,
								"CnlRem": invoice_obj_cancel_remark
							}]
						}
						else {
							
							var body_data = [{
								"irn": invoice_obj_irn,
								"CnlRsn": "4",
								"CnlRem": "Cancelled by User"
							}]
						}
			
						// cancel IRN integration end
						var response = https.put({
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
								invoice_obj.setValue({
									fieldId: 'custbody_ctax_einvoice_cancelirn',
									value: parseObdy_cancelIrn
								});
								if (_logValidation(invoice_obj_printeinvoice) && _logValidation(invoice_obj_irn)) {
									var print_url = print_einvoice_url + "template=6e351b87-35b4-48a5-bc5f-d085685410f7&irns=" + invoice_obj_irn
									log.debug("print_url", print_url)
									var print_headerObj = {
										"X-Cleartax-Auth-Token": auth_token,
										// "owner_id": '9abeb2db-955c-49c6-99b9-e2589314896b',//08.04.2024 - commented
										"gstin": gst_number,
										// "x-cleartax-product": 'EInvoice',//08.04.2024 - commented
										"Content-Type": "application/pdf",
										// "accept": "application/json"
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
										name: 'E-Invoice print' + currentRec.id + '.pdf',
										fileType: file.Type.PDF,
										contents: pdf_response.body,
									});
									fileObj.encoding = file.Encoding.UTF_8;
									fileObj.folder = printfolderid;
									var file_id = fileObj.save();
									log.debug("file_id", file_id);
									if (file_id) {
										invoice_obj.setValue({
											fieldId: 'custbody_ctax_einvoice_printeinvoice',
											value: file_id
										});
									}
								}
							}
							var recordId = invoice_obj.save({  //return the save record obj
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
		//End: afterSubmit_ClearTax_Cancel_IRN_ues functionality

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
			afterSubmit: afterSubmit_ClearTax_Cancel_IRN_ues
		};
	});