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
//
define(['N/record', 'N/file', 'N/config', 'N/xml', 'N/search', 'N/render', 'N/format', 'N/task', 'N/http', 'N/runtime', 'N/https', './ClearTax Library File.js'],
    function(record, file, config, xml, search, render, format, task, http, runtime, https, ClearTax_Library_File) {
        //Begin: beforeLoad_ClearTax_Cancel_IRN_CreditMemo_ues functionality
        function beforeLoad_ClearTax_Cancel_IRN_CreditMemo_ues(context) {
            try {
                var newRecord = context.newRecord; //return record obj
                //log.debug("newRecord",newRecord)
                var recordType = newRecord.type; //return record type
                //log.debug("recordType",recordType)
                var recordId = newRecord.id; //return record id
                //log.debug("recordId",recordId)
                var typeOdMode = context.type //mode of record 
                if (typeOdMode == "view") {
                    var Formobj = context.form; // return form obj
                    // var currentRec = context.newRecord; // return current obj
                    var creditmemo_obj = record.load({ // return current record obj
                        type: recordType,
                        id: recordId,
                        isDynamic: true
                    });
                    var creditmemo_status = creditmemo_obj.getValue({
                        fieldId: 'status'
                    });
                    var creditmemo_irn = creditmemo_obj.getValue({
                        fieldId: 'custbody_ctax_creditnote_irn'
                    });
                    var creditmemo_cancel_irn = creditmemo_obj.getValue({
                        fieldId: 'custbody_ctax_ecreditnote_canceli'
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

                    // if (_logValidation(creditmemo_ack_date)) { // if ack_date have then condition will execute
                    if (_logValidation(creditmemo_ack_date) && _logValidation(creditmemo_irn)) {

                        var ackAndTodayDateHrs = calculateHoursFromAckAndTodayDate(creditmemo_ack_date);
                        ackAndTodayDateHrs = parseInt(ackAndTodayDateHrs);
                        log.debug('ackAndTodayDateHrs', ackAndTodayDateHrs);
                        if (ackAndTodayDateHrs < 24) {

                            if (_logValidation(creditmemo_irn) && !_logValidation(cleartax_ewaybill_num) && !_logValidation(creditmemo_cancel_irn)) {

                                Formobj.addButton({
                                    id: "custpage_void",
                                    label: 'Void',
                                    functionName: "cancel_irn_credit_memo_cli"
                                });

                            } else if (_logValidation(creditmemo_irn) && !_logValidation(creditmemo_cancel_irn) && _logValidation(cleartax_ewaybill_cancel_irn)) {

                                Formobj.addButton({
                                    id: "custpage_void",
                                    label: 'Void',
                                    functionName: "cancel_irn_credit_memo_cli"
                                });

                            }
                        }
                    }
                    Formobj.clientScriptModulePath = './ClearTax Cancel IRN Credit Memo Manual cli.js'; // this path is call to client script
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
            beforeLoad: beforeLoad_ClearTax_Cancel_IRN_CreditMemo_ues

        };
    });