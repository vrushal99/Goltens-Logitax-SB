/*----------------------------------------------------------------------------------------------
        Company Name 	:	Nuvista Technologies Pvt Ltd
        Script Name 	:	
        Author 			:  	NVT Employee 
        Date            :   08-05-2024
        Description		:   

------------------------------------------------------------------------------------------------*/
/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 *@NModuleScope Public
 */
//This function is used to add button and virtual fields
define(['N/record', 'N/format', 'N/config'],
    function (record, format, config) {

        function afterSubmit(context) {

            try {

                if (context.type == context.UserEventType.EDIT) {

                    var Formobj = context.form; // return form obj
                    var currentRec = context.newRecord; // return current obj
                    var invoice_obj = record.load({  // return current record obj
                        type: currentRec.type,
                        id: currentRec.id,
                        isDynamic: true
                    });
                    var ewaybillValidTillDate = invoice_obj.getValue({
                        fieldId: 'custbody_ctax_ewaybill_validtill'
                    });
                    log.debug('ewaybillValidTillDate', ewaybillValidTillDate);

                    if (nullCheck(ewaybillValidTillDate)) {
                        
                        var d = new Date(ewaybillValidTillDate);

                        var yyyy = d.getFullYear().toString();
                        var mm = (d.getMonth() + 1).toString();
                        var dd = d.getDate().toString();

                        var time = (d.getHours() % 12 || 12) + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() + ':' +
                        (d.getSeconds() < 10 ? '0' : '') + d.getSeconds() + ' ' + (d.getHours() >= 12 ? 'pm' : 'am');

                        var conf = config.load({
                            type: config.Type.USER_PREFERENCES
                        });

                        var dateFormat = conf.getValue({ fieldId: 'DATEFORMAT' });
                        
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

                        var tz = conf.getValue({
                            fieldId: 'TIMEZONE'
                        });
                        var tme = format.format({
                            value: val,
                            type: format.Type.DATETIME,
                            timezone: tz
                        });

                        var ewaybillValidTillDateParse = format.parse({
                            value: tme,
                            type: format.Type.DATETIME,
                        });

                        invoice_obj.setValue({
                            fieldId: 'custbody_ctax_ewaybill_validtill_searc',
                            value: ewaybillValidTillDateParse
                        });

                        invoice_obj.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });
                    }
                }
            }
            catch (e) {

                log.error('error in afterSubmit() function', e.toString());
            }
        }


        function nullCheck(value) {
            if (value != 'null' && value != null && value != null && value != '' && value != undefined && value != undefined && value != 'undefined' && value != 'undefined' && value != 'NaN' && value != NaN) {
                return true;
            } else {
                return false;
            }
        }

        return {
            afterSubmit: afterSubmit,
        };
    });