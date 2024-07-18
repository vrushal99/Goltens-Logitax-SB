/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	
		Author 			:  	NVT Employee 
		Date            :  
		Description		:   

------------------------------------------------------------------------------------------------*/
/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 *@NModuleScope Public
 */
//This function is used to add button and virtual fields
define(['N/record', 'N/file', 'N/config', 'N/xml', 'N/search', 'N/render', 'N/format', 'N/task', 'N/http', 'N/runtime', 'N/https', './ClearTax Library File.js'],
    function(record, file, config, xml, search, render, format, task, http, runtime, https, ClearTax_Library_File) {
        //Begin: beforeLoad_ClearTax_Cancel_IRN_ues functionality
        function beforeLoad_ClearTax_Cancel_IRN_ues(context) {
            try {
                if (context.type == context.UserEventType.EDIT) {
                    var Formobj = context.form; // return form obj
                    var currentRec = context.newRecord; // return current obj
                    var invoice_obj = record.load({ // return current record obj
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

                    if (logValidation(invoice_ack_date) && logValidation(invoice_irn)) {

                        var ackAndTodayDateHrs = calculateHoursFromAckAndTodayDate(invoice_ack_date);
                        ackAndTodayDateHrs = parseInt(ackAndTodayDateHrs);
                        log.debug('ackAndTodayDateHrs', ackAndTodayDateHrs);

                        if (ackAndTodayDateHrs < 24) {

                            if (!logValidation(cleartax_cancel_irn) && logValidation(cleartax_ewaybill_num) && !_logValidation(cleartax_ewaybill_cancel_irn)) {

                                Formobj.addButton({
                                    id: "custpage_void",
                                    label: 'void',
                                    functionName: "cancel_irn_cli"
                                });

                            } else if (!_logValidation(cleartax_cancel_irn)) {

                                Formobj.addButton({
                                    id: "custpage_void",
                                    label: 'void',
                                    functionName: "cancel_irn_cli"
                                });

                            }
                        }
                    }
                    form.clientScriptModulePath = './ClearTax Cancel IRN Manual cli.js'; // this path is call to client script
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
            } catch (e) {

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
            beforeLoad: beforeLoad_ClearTax_Cancel_IRN_ues

        };
    });