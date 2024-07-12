/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax Cancel E-Waybill ues
		Author 			:  	NVT Employee 
		Date            :   03-07-2024
		Description		:   This script is use to show 'Cancel E-Waybill' button.

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

					var getInvStatus = invoice_obj.getValue({
						fieldId: 'status'
					});

					if (getInvStatus !== "Voided") {

						if (_logValidation(ewaybill_ack_date) && ewaybill_status != 2) {

							var ackAndTodayDateHrs = calculateHoursFromAckAndTodayDate(ewaybill_ack_date, config)
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