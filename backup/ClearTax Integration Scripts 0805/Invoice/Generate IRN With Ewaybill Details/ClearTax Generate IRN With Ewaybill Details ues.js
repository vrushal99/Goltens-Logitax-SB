/*----------------------------------------------------------------------------------------------
        Company Name 	:	Nuvista Technologies Pvt Ltd
        Script Name 	:	
        Author 			:  	NVT Employee 
        Date            :   25-04-2024
        Description		:   

------------------------------------------------------------------------------------------------*/
/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 *@NModuleScope Public
 */

define(['N/record'],
    function (record) {

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
                    var ctax_einvoice_supplytypecode = invoice_obj.getValue({
                        fieldId: 'custbody_indgst_inv_supplytypecode'
                    });
                    var ctax_einvoice_customerregtype = invoice_obj.getValue({
                        fieldId: 'custbody_indgst_sales_customerregtype'
                    });
                    var ctax_einvoice_custtinno = invoice_obj.getValue({
                        fieldId: 'custbody_indgst_sale_custtinno'
                    });
                    var form = context.form; //return the form obj
                    if (ctax_einvoice_supplytypecode == "7" && ctax_einvoice_customerregtype == "4" && ctax_einvoice_custtinno == "") { // if supplytypecode is B2C, customerregtype is Unregistered and not available GST no than button will hidden

                        form.addButton({
                            id: 'custpage_generate_irn_ewaybill',
                            label: 'Generate IRN With E-Waybill Details',
                            functionName: "ClearTax_Generate_IRN_With_Ewaybill_Cli"
                        }).isHidden = true;

                    } else {
                        var ctax_einvoice_transfer_checkbox = invoice_obj.getValue({
                            fieldId: 'custbody_ctax_einvoice_transfer'
                        });
                        var ctax_einvoice_ack_no = invoice_obj.getValue({
                            fieldId: 'custbody_ctax_einvoice_ack_no'
                        });
                        if (ctax_einvoice_transfer_checkbox == false) { // if checkbox is false then button will show
                            form.addButton({
                                id: 'custpage_generate_irn_ewaybill',
                                label: 'Generate IRN With E-Waybill Details',
                                functionName: "ClearTax_Generate_IRN_With_Ewaybill_Cli"
                            });
                        } else {  // if checkbox is true then button will hidden
                            form.addButton({
                                id: 'custpage_generate_irn_ewaybill',
                                label: 'Generate IRN With E-Waybill Details',
                                functionName: "ClearTax_Generate_IRN_With_Ewaybill_Cli"
                            }).isHidden = true;
                        }
                    }

                    form.clientScriptModulePath = './ClearTax Generate IRN With Ewaybill Details cli.js';
                }
            } catch (e) {

                log.debug('error in beforeLoad() function', e.toString());
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
            beforeLoad: beforeLoad,
        };
    });