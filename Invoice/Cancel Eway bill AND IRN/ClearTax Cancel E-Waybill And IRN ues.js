/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax Cancel EWaybill And IRN ues
		Author 			:  	NVT Employee 
		Date            :   03-07-2024
		Description		:   This script is use to show 'Cancel E-Waybill And IRN' button.

------------------------------------------------------------------------------------------------*/
/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 *@NModuleScope Public
 */

define(['N/record', 'N/format', 'N/config'],
	function (record, format, config) {

		function beforeLoad(context) {
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
					var invoice_irn = invoice_obj.getValue({
						fieldId: 'custbody_ctax_einvoice_irn'
					});

					var cancel_irn_date = invoice_obj.getValue({
						fieldId: 'custbody_ctax_cancel_inv_irn_date'
					});

					var getInvStatus = invoice_obj.getValue({
						fieldId: 'status'
					});

					var invoice_ack_date = invoice_obj.getValue({
						fieldId: 'custbody_ctax_einvoice_ack_date'
					});

					if (getInvStatus !== "Voided") {

						if (_logValidation(ewaybill_no) && ewaybill_status != 2 && _logValidation(invoice_irn) && !_logValidation(cancel_irn_date)) {

							var ackAndTodayDateHrs = calculateHoursFromAckAndTodayDate(ewaybill_ack_date, config)
							ackAndTodayDateHrs = parseInt(ackAndTodayDateHrs);
							log.debug('ackAndTodayDateHrs', ackAndTodayDateHrs);

							var ackAndTodayDateHrsIRN = calculateHoursFromAckAndTodayDate(invoice_ack_date,config);
							ackAndTodayDateHrsIRN = parseInt(ackAndTodayDateHrsIRN);
							log.debug('ackAndTodayDateHrsIRN', ackAndTodayDateHrsIRN);

							if ((ackAndTodayDateHrs < 24) && (ackAndTodayDateHrsIRN < 24)) {  // if ewaybill ack-date time is less than 24 hour and invoice ack date time is less than 24 hour then button will show
								Formobj.addButton({
									id: 'custpage_cancel_ewaybill_and_irn',
									label: 'Cancel E-Waybill And IRN',
									functionName: "ClearTax_cancel_ewaybill_and_irn"
								});
							}
						}

						Formobj.clientScriptModulePath = './ClearTax Cancel E-Waybill And IRN cli.js';

					}
				}
			} catch (err) {
				log.debug({
					title: 'err',
					details: err
				});
			}
		}

		function calculateHoursFromAckAndTodayDate(invoice_ack_date, config) {

			try {

				var configRec = config.load({
					type: config.Type.USER_PREFERENCES
				});

				var userTimeZone = configRec.getValue({
					fieldId: 'TIMEZONE'
				});

				var d = new Date(invoice_ack_date);

				var yyyy = d.getFullYear().toString();
				var mm = (d.getMonth() + 1).toString();
				var dd = d.getDate().toString();

				var time = (d.getHours() % 12 || 12) + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() + ':' +
					(d.getSeconds() < 10 ? '0' : '') + d.getSeconds() + ' ' + (d.getHours() >= 12 ? 'pm' : 'am');

				var dateFormat = configRec.getValue({ fieldId: 'DATEFORMAT' });

				if (dateFormat == 'D/M/YYYY') {

					var val = (dd[1] ? dd : dd[0]) + '/' + (mm[1] ? mm : mm[0]) + '/' + yyyy + " " + time;

				}
				else if (dateFormat == 'M/D/YYYY') {

					var val = (mm[1] ? mm : mm[0]) + '/' + (dd[1] ? dd : dd[0]) + '/' + yyyy + " " + time;

				}
				else if (dateFormat == 'DD/MM/YYYY') {

					var val = (dd[1] ? dd : dd[0]) + '/' + (mm[1] ? mm : mm[0]) + '/' + yyyy + " " + time;

				}
				else if (dateFormat == 'MM/DD/YYYY') {

					var val = (mm[1] ? mm : mm[0]) + '/' + (dd[1] ? dd : dd[0]) + '/' + yyyy + " " + time;

				}

				var tme = format.format({
					value: val,
					type: format.Type.DATETIME,
					timezone: userTimeZone
				});
				log.debug('tme', tme);

				var ewaybillValidTillDateParse = format.parse({
					value: tme,
					type: format.Type.DATETIME,
				});
				log.debug('ewaybillValidTillDateParse', ewaybillValidTillDateParse);

				var todayDate = new Date();
				log.debug('todayDate', todayDate);

				var todayDateFormat = format.format({
					value: todayDate,
					type: format.Type.DATETIME,
					timezone: userTimeZone
				});
				log.debug('todayDateFormat', todayDateFormat);

				// Convert the date and time to the user's timezone
				var userTimezoneDate = format.parse({
					value: todayDateFormat,
					type: format.Type.DATETIME,
					timezone: userTimeZone
				});
				log.debug('userTimezoneDate', userTimezoneDate);

				var date1 = userTimezoneDate;
				var date2 = ewaybillValidTillDateParse;

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

		function _logValidation(value) {
			if (value != 'null' && value != null && value != null && value != '' && value != undefined && value != undefined && value != 'undefined' && value != 'undefined' && value != 'NaN' && value != NaN) {
				return true;
			} else {
				return false;
			}
		}

		return {
			beforeLoad: beforeLoad,
		};
	});