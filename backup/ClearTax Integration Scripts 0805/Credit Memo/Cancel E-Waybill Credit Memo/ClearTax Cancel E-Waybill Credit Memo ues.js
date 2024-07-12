/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	
		Author 			:  	NVT Employee 
		Date            :   03-05-2024
		Description		:   This script is use to show 'Cancel E-Waybill' button.

------------------------------------------------------------------------------------------------*/
/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 *@NModuleScope Public
 */
//This function is used to add button and virtual fields
define(['N/record', 'N/format'],
	function (record, format) {

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
					// log.debug("ewaybill_ack_date", ewaybill_ack_date)

					var getInvStatus = invoice_obj.getValue({
						fieldId: 'status'
					});

					if (getInvStatus !== "Voided") {

						if (_logValidation(ewaybill_ack_date) && ewaybill_status != 2) {

							var ackAndTodayDateHrs = calculateHoursFromAckAndTodayDate(ewaybill_ack_date)
							ackAndTodayDateHrs = parseInt(ackAndTodayDateHrs);
							log.debug('ackAndTodayDateHrs', ackAndTodayDateHrs);

							if (ewaybill_no && ewaybill_ack_date && (ackAndTodayDateHrs < 24)) {  // if ewaybill_no, ewaybill_ack_date is present and also ack-date time is greterthan 24 hour then button will show
								Formobj.addButton({
									id: 'custpage_cancel_ewaybill',
									label: 'Cancel E-Waybill',
									functionName: "ClearTax_cancel_ewaybill"
								});
							}
						}

						Formobj.clientScriptModulePath = './ClearTax Cancel E-Waybill cli.js';

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