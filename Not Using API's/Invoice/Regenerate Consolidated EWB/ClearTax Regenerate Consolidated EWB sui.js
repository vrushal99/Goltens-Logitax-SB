/*----------------------------------------------------------------------------------------------
    Company Name :  Nuvista Technologies Pvt Ltd
    Script Name : 	ClearTax Regenerate Consolidated EWB sui
    Author : 		NVT Employee
    Date : 			22/04/2024
    description : 	

------------------------------------------------------------------------------------------------*/

/**
 * @NApiVersion 2.1
 * @NScriptType suitelet
 */
define(['N/search', 'N/config', 'N/record', 'N/ui/serverWidget', 'N/http', 'N/url', 'N/redirect', 'N/xml', 'N/runtime', 'N/ui/dialog', 'N/https', 'N/format', './ClearTax Library File.js'], function (search, config, record, serverWidget, http, url, redirect, xml, runtime, dialog, https, format, ClearTax_Library_File) {

    function onRequest(context) {

        try {

            
            var form = serverWidget.createForm({
                title: 'Regenerate Consolidated EWB'
            });

            if (context.request.method === 'GET') {

                var transport_doc_date_param = context.request.parameters.custpage_doc_date;
                var vehicle_no_param = context.request.parameters.custpage_vehicle_no;
                var consolidateEwaybillNum = context.request.parameters.custpage_consolidated_ewaybillno;


                var sublist = createSublist(form, transport_doc_date_param, vehicle_no_param, consolidateEwaybillNum);

                sublist.addMarkAllButtons();

                var transportDocDateField = form.addField({
                    id: 'custpage_ctax_transport_date_fil',
                    type: serverWidget.FieldType.DATE,
                    label: 'Transport Doc Date'
                });
                transportDocDateField.defaultValue = transport_doc_date_param;

                var vehicleNumberField = form.addField({
                    id: 'custpage_ctax_vehicle_no_fil',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Vehicle Number'
                });
                vehicleNumberField.defaultValue = vehicle_no_param;

                var consolidatedEwbField = form.addField({
                    id: 'custpage_ctax_consolidated_ewb_fil',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Consolidated EWB Number'
                });
                consolidatedEwbField.defaultValue = consolidateEwaybillNum;

                var regenerateReasonCode = form.addField({
                    id: 'custpage_ctax_rege_reason_code',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Reason Code',
                    source: 'customlist_ctax_regen_con_ewb_res_code'
                });
                regenerateReasonCode.isMandatory = true;

                var regenerateReasonRemark = form.addField({
                    id: 'custpage_ctax_rege_reason_remark',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Reason Remark'
                });
                regenerateReasonRemark.isMandatory = true;

                form.addSubmitButton({
                    id: "custpage_ctax_submit",
                    label: 'Submit'
                });

                form.addButton({
                    id: 'custpage_refresh_reg_consolidated_page',
                    label: 'Refresh',
                    functionName: "refresh_rege_consolidated_ewb_page"
                })


                form.clientScriptModulePath = './ClearTax Regenerate Consolidated EWB cli.js';

                context.response.writePage(form);
            }

            else {

                var regenerateReasonCode = context.request.parameters.custpage_ctax_rege_reason_code;
                var regenerateReasonRemark = context.request.parameters.custpage_ctax_rege_reason_remark;
                // log.debug('regenerateReasonCode', regenerateReasonCode);
                // log.debug('regenerateReasonRemark', regenerateReasonRemark);

                var regenerate_reason_code_text = '';

                if (nullCheck(regenerateReasonCode)) {

                    if (regenerateReasonCode == 1) {

                        regenerate_reason_code_text = 'BREAKDOWN'
                    }
                    else if (regenerateReasonCode == 2) {

                        regenerate_reason_code_text = 'TRANSSHIPMENT'
                    }
                    else if (regenerateReasonCode == 3) {

                        regenerate_reason_code_text = 'OTHERS'
                    }
                    else if (regenerateReasonCode == 4) {

                        regenerate_reason_code_text = 'FIRST_TIME'
                    }
                    else if (regenerateReasonCode == 5) {

                        regenerate_reason_code_text = 'NATURAL_CALAMITY'
                    }
                    else if (regenerateReasonCode == 6) {

                        regenerate_reason_code_text = 'LAW_ORDER_SITUATION'
                    }
                    else if (regenerateReasonCode == 7) {

                        regenerate_reason_code_text = 'ACCIDENT'
                    }
                }

                var selectedInvoiceDataArr = [];

                var lineCount = context.request.getLineCount('custpage_ctax_invoices');

                for (var line = 0; line < lineCount; line++) {

                    var checkboxValue = context.request.getSublistValue({
                        group: 'custpage_ctax_invoices',
                        name: 'custpage_ctax_checkbox',
                        line: line
                    });

                    if (checkboxValue == "T") {

                        var invoiceIdValue = context.request.getSublistValue({
                            group: 'custpage_ctax_invoices',
                            name: 'custpage_ctax_internal_id',
                            line: line
                        });
                        log.debug('invoiceIdValue', invoiceIdValue);

                        var invoiceDocumentNum = context.request.getSublistValue({
                            group: 'custpage_ctax_invoices',
                            name: 'custpage_ctax_invoice_doc_no',
                            line: line
                        });

                        var invoiceVehiclNumValue = context.request.getSublistValue({
                            group: 'custpage_ctax_invoices',
                            name: 'custpage_ctax_vehicle_number',
                            line: line
                        });

                        var invoiceFromPlaceValue = context.request.getSublistValue({
                            group: 'custpage_ctax_invoices',
                            name: 'custpage_ctax_from_place',
                            line: line
                        });

                        var invoiceFromStateValue = context.request.getSublistValue({
                            group: 'custpage_ctax_invoices',
                            name: 'custpage_ctax_from_state',
                            line: line
                        });

                        var invoiceFromStateIdValue = context.request.getSublistValue({
                            group: 'custpage_ctax_invoices',
                            name: 'custpage_ctax_from_state_id',
                            line: line
                        });

                        var invoiceTransDocNoValue = context.request.getSublistValue({
                            group: 'custpage_ctax_invoices',
                            name: 'custpage_ctax_trans_doc_no',
                            line: line
                        });

                        var invoiceTransDocDateValue = context.request.getSublistValue({
                            group: 'custpage_ctax_invoices',
                            name: 'custpage_ctax_trans_doc_date',
                            line: line
                        });

                        var invoiceTransModeValue = context.request.getSublistValue({
                            group: 'custpage_ctax_invoices',
                            name: 'custpage_ctax_mode_transport',
                            line: line
                        });

                        var invoiceTransModeIdValue = context.request.getSublistValue({
                            group: 'custpage_ctax_invoices',
                            name: 'custpage_ctax_mode_transport_id',
                            line: line
                        });

                        var invoiceEwaybillNumValue = context.request.getSublistValue({
                            group: 'custpage_ctax_invoices',
                            name: 'custpage_ctax_ewaybill_number',
                            line: line
                        });

                        var invoiceEwaybillConsolidatedNumValue = context.request.getSublistValue({
                            group: 'custpage_ctax_invoices',
                            name: 'custpage_ctax_ewaybill_consolidated_number',
                            line: line
                        });

                        selectedInvoiceDataArr.push({
                            internalId: invoiceIdValue,
                            invoiceDocumentNum: invoiceDocumentNum,
                            invoiceVehiclNumValue: invoiceVehiclNumValue,
                            invoiceFromPlaceValue: invoiceFromPlaceValue,
                            invoiceFromStateValue: invoiceFromStateValue,
                            invoiceFromStateIdValue: invoiceFromStateIdValue,
                            invoiceTransDocNoValue: invoiceTransDocNoValue,
                            invoiceTransDocDateValue: invoiceTransDocDateValue,
                            invoiceTransModeValue: invoiceTransModeValue,
                            invoiceTransModeIdValue: invoiceTransModeIdValue,
                            invoiceEwaybillNumValue: invoiceEwaybillNumValue,
                            invoiceEwaybillConsolidatedNumValue: invoiceEwaybillConsolidatedNumValue
                        });

                    }
                }

                if (nullCheck(selectedInvoiceDataArr)) {

                    var invoice_internal_id = selectedInvoiceDataArr[0].internalId;

                    var loadInvoice = record.load({
                        type: 'invoice',
                        id: invoice_internal_id
                    });

                    var ewaybill_vehicle_number = selectedInvoiceDataArr[0].invoiceVehiclNumValue;

                    var ewaybill_from_place = selectedInvoiceDataArr[0].invoiceFromPlaceValue;

                    var ewaybill_from_state = selectedInvoiceDataArr[0].invoiceFromStateIdValue;

                    var ewaybill_doc_no = selectedInvoiceDataArr[0].invoiceTransDocNoValue;

                    var consolidated_ewaybill_no = selectedInvoiceDataArr[0].invoiceEwaybillConsolidatedNumValue;

                    var ewaybill_doc_date = loadInvoice.getValue({
                        fieldId: 'custbody_trans_doc_date'
                    });

                    if (nullCheck(ewaybill_doc_date)) {

                        var shipmonth = ewaybill_doc_date.getMonth() + 1
                        if (shipmonth < 10) {
                            shipmonth = "0" + shipmonth
                        }
                        var shipdate = ewaybill_doc_date.getDate()
                        if (shipdate < 10) {
                            shipdate = "0" + shipdate
                        }
                        var ewaybill_doc_date_format = shipdate + '/' + shipmonth + '/' + ewaybill_doc_date.getFullYear()
                        //log.debug("formatteddate", formatteddate)
                        ewaybill_doc_date_format = String(ewaybill_doc_date_format).trim();
                    }

                    var ewaybill_trans_mode = selectedInvoiceDataArr[0].invoiceTransModeIdValue;

                    var transport_mode_text = '';

                    if (nullCheck(ewaybill_trans_mode)) {

                        if (ewaybill_trans_mode == 1) { //by road

                            transport_mode_text = 'ROAD'
                        }
                        else if (ewaybill_trans_mode == 2) { //	By Rail

                            transport_mode_text = 'RAIL'
                        }
                        else if (ewaybill_trans_mode == 3) { //	By Air

                            transport_mode_text = 'AIR'
                        }
                        else if (ewaybill_trans_mode == 4) { //	By Ship

                            transport_mode_text = 'SHIP'
                        }
                    }

                    // var ewaybill_numbers = [];

                    // for (var invcnt = 0; invcnt < selectedInvoiceDataArr.length; invcnt++) {

                    //     var ewaybill_ind_num = selectedInvoiceDataArr[invcnt].invoiceEwaybillNumValue;

                    //     ewaybill_numbers.push(ewaybill_ind_num);

                    // }

                    var Invoice_obj = record.load({
                        type: 'invoice',
                        id: invoice_internal_id,
                        isDynamic: true
                    });

                    var subsidiary_obj_gst_no = gstNoFromSubsidiaryOrCompanyInfo(Invoice_obj);

                    var accountId = runtime.accountId; // return the accountId
                    var environment = runtime.envType; // PRODUCTION, SANDBOX, etc.
                    var Configuration_data = ClearTax_Library_File.ClearTax_Einvoice_library()
                    var get_environment_name = Configuration_data[environment]
                    var auth_token = get_environment_name["AUTH_TOKEN"]
                    var regenerate_consolidated_ewb_url = get_environment_name["REGENERATE_CONSOLIDATED_EWB_URL"]
                    // log.debug("regenerate_consolidated_ewb_url", regenerate_consolidated_ewb_url)


                    var _url = regenerate_consolidated_ewb_url;
                    // log.debug("_url", _url)
                    var headerObj = {
                        "X-Cleartax-Auth-Token": auth_token,
                        "gstin": subsidiary_obj_gst_no,
                        "Content-Type": "application/json",
                        "accept": "application/json",

                    }

                    var body_data = {

                        "VehNo": ewaybill_vehicle_number,
                        "FromPlace": ewaybill_from_place,
                        "FromState": ewaybill_from_state,
                        "ReasonCode": regenerate_reason_code_text,
                        "ReasonRemark": regenerateReasonRemark,
                        "TransDocNo": ewaybill_doc_no,
                        "TransDocDt": ewaybill_doc_date_format,
                        "TransMode": transport_mode_text,
                        // "EwbNumbers": ewaybill_numbers,
                        "ConsolidatedEwbNumber": consolidated_ewaybill_no
                    };

                    log.debug('request body_data', body_data);

                    var response = https.post({
                        url: _url,
                        body: JSON.stringify(body_data),
                        headers: headerObj
                    });

                    // log.debug('response', response);
                    log.debug('response.code', response.code);
                    log.debug('response.body', response.body);

                    var invoiceIdArr = [];

                    var responseBodyParse = JSON.parse(response.body);
                    log.debug('responseBodyParse', responseBodyParse);

                    var suiteletURL = url.resolveScript({
                        scriptId: 'customscript_cleartax_regen_cons_ewb_sui',
                        deploymentId: 'customdeploy_cleartax_regen_cons_ewb_sui',
                    });


                    var resultField = form.addField({
                        id: 'custpage_result',
                        type: serverWidget.FieldType.INLINEHTML,
                        label: 'Result',
                    });

                    if (response.code == 200) {  //if response code got 200 then this code will execute

                        if (nullCheck(responseBodyParse.errors) || nullCheck(responseBodyParse.error_message)) { //if errors is coming in response then set only request and response on selected invoices

                            for (var billcnt = 0; billcnt < selectedInvoiceDataArr.length; billcnt++) {

                                var invoiceRec = record.load({
                                    type: 'invoice',
                                    id: selectedInvoiceDataArr[billcnt].internalId,
                                    isDynamic: true
                                });

                                invoiceRec.setValue({
                                    fieldId: 'custbody_ctax_regen_conso_ewb_reg',
                                    value: JSON.stringify(body_data)
                                });

                                invoiceRec.setValue({
                                    fieldId: 'custbody_ctax_regen_conso_ewb_res',
                                    value: JSON.stringify(responseBodyParse)
                                });

                                var recordId = invoiceRec.save({
                                    enableSourcing: true,
                                    ignoreMandatoryFields: true
                                });

                                invoiceIdArr.push(selectedInvoiceDataArr[billcnt].invoiceDocumentNum);

                            }


                            // context.response.write('Consolidated Ewaybill not generated for this invoices - ' + JSON.stringify(invoiceIdArr) + ' Error is - ' + responseBodyParse.errors.error_message);


                            if (nullCheck(responseBodyParse.errors)) {
                                var resmsg = 'Consolidated Ewaybill not re-generated for this invoices - ' + JSON.stringify(invoiceIdArr) + ' Error - ' + responseBodyParse.errors.error_message;
                            }
                            if (nullCheck(responseBodyParse.error_message)) {

                                var resmsg = 'Consolidated Ewaybill not re-generated for this invoices - ' + JSON.stringify(invoiceIdArr) + ' Error - ' + responseBodyParse.error_message;
                            }

                            var tableMarkup = '<p style="text-align:left; font-size:20px;">Error - ' + resmsg + '</p>';
                            tableMarkup += '<p style="text-align:left; font-size:15px;">Navigate To Regenerate Consolidated EWB Page -> Please <a href= ' + suiteletURL + '>Click Here</p>';

                            resultField.defaultValue = tableMarkup;

                            context.response.writePage(form);

                        }
                        else {

                            var consolidatedEwbNumber = responseBodyParse.ConsolidatedEwbNumber;
                            log.debug('consolidatedEwbNumber', consolidatedEwbNumber);

                            var consolidateEwbDate = responseBodyParse.ConsolidateEwbDate;

                            // if (nullCheck(consolidateEwbDate)) {

                                // var consolidateEwbDateFormat = new Date(String(consolidateEwbDate))

                                // var consolidateEwbDateFormatted = format.parse({
                                    // value: consolidateEwbDate,
                                    // type: format.Type.DATETIME,
                                    // timezone: format.Timezone.ETC_GMT_MINUS_1
                                // })
                            // }


                            for (var billcnt = 0; billcnt < selectedInvoiceDataArr.length; billcnt++) {

                                var invoiceRec = record.load({
                                    type: 'invoice',
                                    id: selectedInvoiceDataArr[billcnt].internalId,
                                    isDynamic: true
                                });

                                invoiceRec.setValue({
                                    fieldId: 'custbody_ctax_regen_conso_ewb_reg',
                                    value: JSON.stringify(body_data)
                                });

                                invoiceRec.setValue({
                                    fieldId: 'custbody_ctax_regen_conso_ewb_res',
                                    value: JSON.stringify(responseBodyParse)
                                });

                                invoiceRec.setValue({
                                    fieldId: 'custbody_ctax_con_ewb_no',
                                    value: String(consolidatedEwbNumber)
                                });

                                invoiceRec.setValue({
                                    fieldId: 'custbody_ctax_con_ewb_date',
                                    value: String(consolidateEwbDate)
                                });

                                invoiceRec.setValue({
                                    fieldId: 'custbody_ctax_reg_con_ewb_reason',
                                    value: regenerateReasonCode
                                });

                                invoiceRec.setValue({
                                    fieldId: 'custbody_ctax_ewaybill_rege_remark',
                                    value: regenerateReasonRemark
                                });

                                var recordId = invoiceRec.save({
                                    enableSourcing: true,
                                    ignoreMandatoryFields: true
                                });

                                invoiceIdArr.push(selectedInvoiceDataArr[billcnt].invoiceDocumentNum);
                            }

                            // context.response.write('Please wait for sometime.....System is generating consolidated EWaybill for this Selected Invoices - ' + JSON.stringify(invoiceIdArr));


                            var resmsg = 'Consolidated Ewaybill re-generated for this invoices - ' + JSON.stringify(invoiceIdArr) + '. Regenerate Consolidated Ewaybill Number is - ' + String(consolidatedEwbNumber);

                            var tableMarkup = '<p style="text-align:left; font-size:20px;">Success - ' + resmsg + '</p>';
                            tableMarkup += '<p style="text-align:left; font-size:15px;">Navigate To Regenerate Consolidated EWB Page -> Please <a href= ' + suiteletURL + '>Click Here</p>';

                            resultField.defaultValue = tableMarkup;

                            context.response.writePage(form);
                        }
                    }
                    else {

                        //if response code is not 200 then below code will execute

                        for (var billcnt = 0; billcnt < selectedInvoiceDataArr.length; billcnt++) {

                            var invoiceRec = record.load({
                                type: 'invoice',
                                id: selectedInvoiceDataArr[billcnt].internalId,
                                isDynamic: true
                            });

                            invoiceRec.setValue({
                                fieldId: 'custbody_ctax_regen_conso_ewb_reg',
                                value: JSON.stringify(body_data)
                            });

                            invoiceRec.setValue({
                                fieldId: 'custbody_ctax_regen_conso_ewb_res',
                                value: JSON.stringify(responseBodyParse)
                            });

                            var recordId = invoiceRec.save({
                                enableSourcing: true,
                                ignoreMandatoryFields: true
                            });

                            invoiceIdArr.push(selectedInvoiceDataArr[billcnt].invoiceDocumentNum);

                        }


                        // context.response.write('Consolidated Ewaybill not generated for this invoices - ' + JSON.stringify(invoiceIdArr) + ' Error is - ' + responseBodyParse.errors.error_message);

                        if (nullCheck(responseBodyParse.errors)) {
                            var resmsg = 'Consolidated Ewaybill not re-generated for this invoices - ' + JSON.stringify(invoiceIdArr) + ' Error is - ' + responseBodyParse.errors.error_message;
                        }
                        if (nullCheck(responseBodyParse.error_message)) {

                            var resmsg = 'Consolidated Ewaybill not re-generated for this invoices - ' + JSON.stringify(invoiceIdArr) + ' Error - ' + responseBodyParse.error_message;
                        }

                        var tableMarkup = '<p style="text-align:left; font-size:20px;">Error - ' + resmsg + '</p>';
                        tableMarkup += '<p style="text-align:left; font-size:15px;">Navigate To Regenerate Consolidated EWB Page -> Please <a href= ' + suiteletURL + '>Click Here</p>';

                        resultField.defaultValue = tableMarkup;

                        context.response.writePage(form);
                    }
                }
            }
        }
        catch (e) {

            log.error('error in onRequest() function', e.toString());
        }
    }

    function createSublist(form, transport_doc_date_param, vehicle_no_param, consolidateEwaybillNum) {

        try {

            // Get the search results
            var searchResults = getSearchResults(transport_doc_date_param, vehicle_no_param, consolidateEwaybillNum);

            // Create the sublist
            var sublist = form.addSublist({
                id: 'custpage_ctax_invoices',
                type: serverWidget.SublistType.LIST,
                label: 'Invoice Data'
            });

            sublist.addField({
                id: 'custpage_ctax_checkbox',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Select'
            });
            sublist.addField({
                id: 'custpage_ctax_invoice_url',
                type: serverWidget.FieldType.TEXTAREA,
                label: 'View Invoice'
            });
            //Add columns to the sublist
            sublist.addField({
                id: 'custpage_ctax_internal_id',
                type: serverWidget.FieldType.TEXT,
                label: 'Internal ID'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            sublist.addField({
                id: 'custpage_ctax_invoice_doc_no',
                type: serverWidget.FieldType.TEXT,
                label: 'Invoice Doc No'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            sublist.addField({
                id: 'custpage_ctax_vehicle_number',
                type: serverWidget.FieldType.TEXT,
                label: 'Vehicle Number'
            });
            sublist.addField({
                id: 'custpage_ctax_from_place',
                type: serverWidget.FieldType.TEXT,
                label: 'From Place'
            });
            sublist.addField({
                id: 'custpage_ctax_from_state',
                type: serverWidget.FieldType.TEXT,
                label: 'From State'
            });
            sublist.addField({
                id: 'custpage_ctax_from_state_id',
                type: serverWidget.FieldType.TEXT,
                label: 'From State Id'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            sublist.addField({
                id: 'custpage_ctax_trans_doc_no',
                type: serverWidget.FieldType.TEXT,
                label: 'Transport Doc No'
            });
            sublist.addField({
                id: 'custpage_ctax_trans_doc_date',
                type: serverWidget.FieldType.TEXT,
                label: 'Transport Doc Date'
            });
            sublist.addField({
                id: 'custpage_ctax_mode_transport',
                type: serverWidget.FieldType.TEXT,
                label: 'Mode of Transport'
            });
            sublist.addField({
                id: 'custpage_ctax_mode_transport_id',
                type: serverWidget.FieldType.TEXT,
                label: 'Mode of Transport Id'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            sublist.addField({
                id: 'custpage_ctax_ewaybill_number',
                type: serverWidget.FieldType.TEXT,
                label: 'E-Waybill Number'
            });
            sublist.addField({
                id: 'custpage_ctax_ewaybill_consolidated_number',
                type: serverWidget.FieldType.TEXT,
                label: 'E-Waybill Consolidated Number'
            });

            var accountHost = url.resolveDomain({
                hostType: url.HostType.APPLICATION,
            });

            var accountId = runtime.accountId;

            // Loop through the search results and add them to the sublist
            for (var invc_i = 0; invc_i < searchResults.length; invc_i++) {

                var result = searchResults[invc_i];
                // log.debug("result", result)

                var invid = result.getValue({
                    name: "internalid",
                    label: "Internal ID"
                });

                var invoice_doc_no = result.getValue({
                    name: "tranid", label: "Document Number"
                });

                var invURL = 'https://' + accountHost + "/app/accounting/transactions/custinvc.nl?id=" + invid + "&compid=" + accountId + "&whence=";

                sublist.setSublistValue({
                    id: 'custpage_ctax_invoice_url',
                    line: invc_i,
                    value: '<a href="' + invURL + '">' + invoice_doc_no + '</a>'
                });

                sublist.setSublistValue({
                    id: 'custpage_ctax_internal_id',
                    line: invc_i,
                    value: invid || 0
                });

                sublist.setSublistValue({
                    id: 'custpage_ctax_invoice_doc_no',
                    line: invc_i,
                    value: invoice_doc_no || 0
                });

                var vehicleNo = result.getValue({
                    name: "custbody_ctax_vehicle_no", label: "Vehicle Number"
                });

                sublist.setSublistValue({
                    id: 'custpage_ctax_vehicle_number',
                    line: invc_i,
                    value: vehicleNo || 0
                });

                var fromPlace = result.getValue({
                    name: "city",
                    join: "location",
                    label: "From Place"
                });

                sublist.setSublistValue({
                    id: 'custpage_ctax_from_place',
                    line: invc_i,
                    value: fromPlace || ""
                });

                var fromState = result.getText({
                    name: "custrecord_indgst_locatio_gststatecode",
                    join: "location",
                    label: "From State"
                });

                sublist.setSublistValue({
                    id: 'custpage_ctax_from_state',
                    line: invc_i,
                    value: fromState || ""
                });

                var fromStateId = result.getValue({
                    name: "custrecord_indgst_locatio_gststatecode",
                    join: "location",
                    label: "From State Id"
                });

                sublist.setSublistValue({
                    id: 'custpage_ctax_from_state_id',
                    line: invc_i,
                    value: fromStateId || 0
                });

                var transDocNo = result.getValue({
                    name: "custbody_trans_docno", label: "Trans Doc No."
                });

                sublist.setSublistValue({
                    id: 'custpage_ctax_trans_doc_no',
                    line: invc_i,
                    value: transDocNo || 0
                });

                var transDocDate = result.getValue({
                    name: "custbody_trans_doc_date", label: "Trans Doc Date"
                });

                sublist.setSublistValue({
                    id: 'custpage_ctax_trans_doc_date',
                    line: invc_i,
                    value: transDocDate || 0
                });

                var transportMode = result.getText({
                    name: "custbody_modeofshipping", label: "Mode Of Transport"
                });

                sublist.setSublistValue({
                    id: 'custpage_ctax_mode_transport',
                    line: invc_i,
                    value: transportMode || 0
                });

                var transportModeId = result.getValue({
                    name: "custbody_modeofshipping", label: "Mode Of Transport"
                });

                sublist.setSublistValue({
                    id: 'custpage_ctax_mode_transport_id',
                    line: invc_i,
                    value: transportModeId || 0
                });

                var ewaybillNum = result.getValue({
                    name: "custbody_ctax_ewb_number", label: "CLEARTAX E-WAYBILL NUMBER"
                });

                sublist.setSublistValue({
                    id: 'custpage_ctax_ewaybill_number',
                    line: invc_i,
                    value: ewaybillNum || 0
                });

                var eaybillConsolidatedNumber = result.getValue({
                    name: "custbody_ctax_con_ewb_no", label: "Consolidated Ewb Number"
                });

                sublist.setSublistValue({
                    id: 'custpage_ctax_ewaybill_consolidated_number',
                    line: invc_i,
                    value: eaybillConsolidatedNumber || 0
                });


            }

            return sublist;
        }
        catch (e) {

            log.error('error in createSublist() function', e.toString());
        }
    }

    function getSearchResults(transport_doc_date_param, vehicle_no_param, consolidateEwaybillNum) {

        try {

            var invoiceSearchObj = search.load({
                id: 'customsearch_ctax_regenerate_consoli_ewb'
            });

            if (nullCheck(transport_doc_date_param)) {

                invoiceSearchObj.filters.push(
                    search.createFilter({
                        name: 'custbody_trans_doc_date',
                        operator: 'on',
                        values: transport_doc_date_param
                    }));
            }


            if (nullCheck(vehicle_no_param)) {

                invoiceSearchObj.filters.push(
                    search.createFilter({
                        name: 'custbody_ctax_vehicle_no',
                        operator: 'is',
                        values: vehicle_no_param
                    }));
            }

            if (nullCheck(consolidateEwaybillNum)) {

                invoiceSearchObj.filters.push(
                    search.createFilter({
                        name: 'custbody_ctax_con_ewb_no',
                        operator: 'is',
                        values: consolidateEwaybillNum
                    }));
            }

            // Run the saved search
            var searchResults = getAllResults(invoiceSearchObj);

            // Return the search results
            return searchResults;

        }
        catch (e) {

            log.error('error in getSearchResults() function', e.toString());
        }
    }

    function nullCheck(value) {
        if (value != 'null' && value != '' && value != undefined && value != 'NaN') {
            return true;
        } else {
            return false;
        }
    }

    function getAllResults(s) {
        var results = s.run();
        var searchResults = [];
        var searchid = 0;
        do {
            var resultslice = results.getRange({
                start: searchid,
                end: searchid + 1000
            });
            resultslice.forEach(function (slice) {
                searchResults.push(slice);
                searchid++;
            });
        } while (resultslice.length >= 1000);
        return searchResults;
    }

    function gstNoFromSubsidiaryOrCompanyInfo(invoice_obj) {

        try {
            
            var isOneWorldAcct = runtime.isFeatureInEffect({ feature: 'SUBSIDIARIES' });
            if (isOneWorldAcct == true) {

                var invoice_obj_subsidiary = invoice_obj.getValue({
                    fieldId: 'subsidiary'
                });
                if (nullCheck(invoice_obj_subsidiary)) {
                    var subsidiary_obj = record.load({
                        type: "subsidiary",
                        id: invoice_obj_subsidiary,
                        isDynamic: true
                    });
                    var gst_number = subsidiary_obj.getValue({
                        fieldId: 'federalidnumber'
                    });
                    if (nullCheck(gst_number)) {
                        gst_number = gst_number;
                    } else {
                        gst_number = "";
                    }
                    log.debug("gst_number", gst_number);
                }

            }
            else {

                var subsidiary_obj = config.load({
                    type: config.Type.COMPANY_INFORMATION
                });

                var gst_number = subsidiary_obj.getValue({
                    fieldId: 'employerid'
                });
                if (nullCheck(gst_number)) {
                    gst_number = gst_number;
                } else {
                    gst_number = "";
                }
                log.debug("gst_number", gst_number);

            }
            return gst_number;
        }
        catch (e) {
            
            log.error('error in gstNoFromSubsidiaryOrCompanyInfo() function', e.toString());
        }
    }

    return {
        onRequest: onRequest
    };

});
