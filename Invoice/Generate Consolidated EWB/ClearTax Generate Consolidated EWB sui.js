/*----------------------------------------------------------------------------------------------
    Company Name :  Nuvista Technologies Pvt Ltd
    Script Name : 	ClearTax Generate Consolidated EWB sui
    Author : 		NVT Employee
    Date : 			09/07/2024
    description : 	

------------------------------------------------------------------------------------------------*/

/**
 * @NApiVersion 2.1
 * @NScriptType suitelet
 */
define(['N/search', 'N/record', 'N/ui/serverWidget', 'N/http', 'N/url', 'N/redirect', 'N/xml', 'N/runtime', 'N/ui/dialog', 'N/https', 'N/format', './ClearTax Library File.js'], function (search, record, serverWidget, http, url, redirect, xml, runtime, dialog, https, format, ClearTax_Library_File) {

    function onRequest(context) {

        try {

            var form = serverWidget.createForm({
                title: 'Generate Consolidated EWB'
            });

            if (context.request.method === 'GET') {

                var transport_doc_date_param = context.request.parameters.custpage_doc_date;
                var vehicle_no_param = context.request.parameters.custpage_vehicle_no;

                var sublist = createSublist(form, transport_doc_date_param, vehicle_no_param);

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

                form.addSubmitButton({
                    id: "custpage_ctax_submit",
                    label: 'Submit'
                });

                form.addButton({
                    id: 'custpage_refresh_consolidated_page',
                    label: 'Refresh',
                    functionName: "refresh_consolidated_ewb_page"
                })


                form.clientScriptModulePath = './ClearTax Generate Consolidated EWB cli.js';



                context.response.writePage(form);
            }
            else {

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
                            invoiceEwaybillNumValue: invoiceEwaybillNumValue
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

                    // var transport_mode_text = '';

                    // if (nullCheck(ewaybill_trans_mode)) {

                    //     if (ewaybill_trans_mode == 1) { //by road

                    //         transport_mode_text = 'ROAD'
                    //     }
                    //     else if (ewaybill_trans_mode == 2) { //	By Rail

                    //         transport_mode_text = 'RAIL'
                    //     }
                    //     else if (ewaybill_trans_mode == 3) { //	By Air

                    //         transport_mode_text = 'AIR'
                    //     }
                    //     else if (ewaybill_trans_mode == 4) { //	By Ship

                    //         transport_mode_text = 'SHIP'
                    //     }
                    // }


                    var ewaybill_numbers = [];

                    for (var invcnt = 0; invcnt < selectedInvoiceDataArr.length; invcnt++) {

                        var ewaybill_ind_num = selectedInvoiceDataArr[invcnt].invoiceEwaybillNumValue;

                        ewaybill_numbers.push(
                            {
                                "ewbNo": ewaybill_ind_num
                            }
                        );

                    }

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
                    var generate_consolidated_ewb_url = get_environment_name["Consolidate_E_way_Bill_API_URL"];
                    var get_client_code = get_environment_name["CLIENT_CODE"]
                    var get_user_code = get_environment_name["USER_CODE"]
                    var get_password = get_environment_name["PASSWORD"]

                    var _url = generate_consolidated_ewb_url;
                    log.debug("_url", _url)
                    var headerObj = {
                        "Content-Type": "application/json",
                        "accept": "application/json",
                    }

                    var body_data = {
                        "CLIENTCODE": get_client_code,
                        "USERCODE": get_user_code,
                        "PASSWORD": get_password,
                        "cewb_datalist": [
                            {
                                "fromPlace": ewaybill_from_place,
                                "fromState": ewaybill_from_state,
                                "vehicleNo": ewaybill_vehicle_number,
                                "transMode": ewaybill_trans_mode,
                                "transDocNo": ewaybill_doc_no,
                                "transDocDate": ewaybill_doc_date_format,
                                "tripSheetEwbBills": ewaybill_numbers
                            }
                        ]
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

                    var responseBodyParse = JSON.parse(response.body);

                    var invoiceIdArr = [];

                    var suiteletURL = url.resolveScript({
                        scriptId: 'customscript_cleartax_generat_conewb_sui',
                        deploymentId: 'customdeploy_cleartax_generat_conewb_sui',
                    });

                    var resultField = form.addField({
                        id: 'custpage_result',
                        type: serverWidget.FieldType.INLINEHTML,
                        label: 'Result',
                    });

                    if (response.code == 200) {  //if response code got 200 then this code will execute

                        if (nullCheck(responseBodyParse[0])) {
                            
                            var error = responseBodyParse[0]["flag"];
                            log.debug("error", error)
    
                            if (error == "true" || error == true) {

                                var consolidatedEwbNumber = responseBodyParse[0]["cEwbNo"];
                                log.debug('consolidatedEwbNumber', consolidatedEwbNumber);

                                var consolidateEwbDate = responseBodyParse[0]["cEwbDate"];

                                for (var billcnt = 0; billcnt < selectedInvoiceDataArr.length; billcnt++) {

                                    var invoiceRec = record.load({
                                        type: 'invoice',
                                        id: selectedInvoiceDataArr[billcnt].internalId,
                                        isDynamic: true
                                    });

                                    invoiceRec.setValue({
                                        fieldId: 'custbody_ctax_con_ewb_request',
                                        value: JSON.stringify(body_data)
                                    });

                                    invoiceRec.setValue({
                                        fieldId: 'custbody_ctax_con_ewb_response',
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

                                    var recordId = invoiceRec.save({
                                        enableSourcing: true,
                                        ignoreMandatoryFields: true
                                    });

                                    invoiceIdArr.push(selectedInvoiceDataArr[billcnt].invoiceDocumentNum);
                                }

                                // context.response.write('Please wait for sometime.....System is generating consolidated EWaybill for this Selected Invoices - ' + JSON.stringify(invoiceIdArr));

                                var resmsg = 'Consolidated Ewaybill generated for this invoices - ' + JSON.stringify(invoiceIdArr) + '. Generated Consolidated Ewaybill Number is - ' + String(consolidatedEwbNumber);

                                var tableMarkup = '<p style="text-align:left; font-size:20px;">Success - ' + resmsg + '</p>';
                                tableMarkup += '<p style="text-align:left; font-size:15px;">Navigate To Generate Consolidated EWB Page -> Please <a href= ' + suiteletURL + '>Click Here</p>';

                                resultField.defaultValue = tableMarkup;

                                context.response.writePage(form);

                            }
                            else {

                                for (var billcnt = 0; billcnt < selectedInvoiceDataArr.length; billcnt++) {

                                    var invoiceRec = record.load({
                                        type: 'invoice',
                                        id: selectedInvoiceDataArr[billcnt].internalId,
                                        isDynamic: true
                                    });

                                    invoiceRec.setValue({
                                        fieldId: 'custbody_ctax_con_ewb_request',
                                        value: JSON.stringify(body_data)
                                    });

                                    invoiceRec.setValue({
                                        fieldId: 'custbody_ctax_con_ewb_response',
                                        value: JSON.stringify(responseBodyParse)
                                    });

                                    var recordId = invoiceRec.save({
                                        enableSourcing: true,
                                        ignoreMandatoryFields: true
                                    });

                                    invoiceIdArr.push(selectedInvoiceDataArr[billcnt].invoiceDocumentNum);

                                }


                                //     suiteletURL += '&custpage_status=error' + '&custpage_inv=' + JSON.stringify(invoiceIdArr) + '&custpage_msg=' + responseBodyParse.errors.error_message;
                                //     redirect.redirect({ url: suiteletURL });

                                var errmessage = responseBodyParse[0]["message"];

                                if (nullCheck(errmessage)) {

                                    var resmsg = 'Consolidated Ewaybill not generated for this invoices - ' + JSON.stringify(invoiceIdArr) + ' Error is - ' + errmessage;

                                }

                                var tableMarkup = '<p style="text-align:left; font-size:20px;">Error - ' + resmsg + '</p>';
                                tableMarkup += '<p style="text-align:left; font-size:15px;">Navigate To Generate Consolidated EWB Page -> Please <a href= ' + suiteletURL + '>Click Here</p>';

                                resultField.defaultValue = tableMarkup;

                                context.response.writePage(form);

                            }
                        }
                        else {

                            for (var billcnt = 0; billcnt < selectedInvoiceDataArr.length; billcnt++) {

                                var invoiceRec = record.load({
                                    type: 'invoice',
                                    id: selectedInvoiceDataArr[billcnt].internalId,
                                    isDynamic: true
                                });

                                invoiceRec.setValue({
                                    fieldId: 'custbody_ctax_con_ewb_request',
                                    value: JSON.stringify(body_data)
                                });

                                invoiceRec.setValue({
                                    fieldId: 'custbody_ctax_con_ewb_response',
                                    value: JSON.stringify(responseBodyParse)
                                });

                                var recordId = invoiceRec.save({
                                    enableSourcing: true,
                                    ignoreMandatoryFields: true
                                });

                                invoiceIdArr.push(selectedInvoiceDataArr[billcnt].invoiceDocumentNum);

                            }


                            //     suiteletURL += '&custpage_status=error' + '&custpage_inv=' + JSON.stringify(invoiceIdArr) + '&custpage_msg=' + responseBodyParse.errors.error_message;
                            //     redirect.redirect({ url: suiteletURL });

                            var errmessage = responseBodyParse.data;

                            if (nullCheck(errmessage)) {

                                var resmsg = 'Consolidated Ewaybill not generated for this invoices - ' + JSON.stringify(invoiceIdArr) + ' Error is - ' + errmessage;

                            }

                            var tableMarkup = '<p style="text-align:left; font-size:20px;">Error - ' + resmsg + '</p>';
                            tableMarkup += '<p style="text-align:left; font-size:15px;">Navigate To Generate Consolidated EWB Page -> Please <a href= ' + suiteletURL + '>Click Here</p>';

                            resultField.defaultValue = tableMarkup;

                            context.response.writePage(form);

                        }
                    }
                    // else {

                    //     //if response code is not 200 then below code will execute

                    //     for (var billcnt = 0; billcnt < selectedInvoiceDataArr.length; billcnt++) {

                    //         var invoiceRec = record.load({
                    //             type: 'invoice',
                    //             id: selectedInvoiceDataArr[billcnt].internalId,
                    //             isDynamic: true
                    //         });

                    //         invoiceRec.setValue({
                    //             fieldId: 'custbody_ctax_con_ewb_request',
                    //             value: JSON.stringify(body_data)
                    //         });

                    //         invoiceRec.setValue({
                    //             fieldId: 'custbody_ctax_con_ewb_response',
                    //             value: JSON.stringify(responseBodyParse)
                    //         });

                    //         var recordId = invoiceRec.save({
                    //             enableSourcing: true,
                    //             ignoreMandatoryFields: true
                    //         });

                    //         invoiceIdArr.push(selectedInvoiceDataArr[billcnt].invoiceDocumentNum);

                    //     }


                    //     // context.response.write('Consolidated Ewaybill not generated for this invoices - ' + JSON.stringify(invoiceIdArr) + ' Error is - ' + responseBodyParse.errors.error_message);

                    //     if (nullCheck(responseBodyParse.errors)) {

                    //         var resmsg = 'Consolidated Ewaybill not generated for this invoices - ' + JSON.stringify(invoiceIdArr) + ' Error is - ' + responseBodyParse.errors.error_message;

                    //     }
                    //     if (nullCheck(responseBodyParse.error_message)) {

                    //         var resmsg = 'Consolidated Ewaybill not generated for this invoices - ' + JSON.stringify(invoiceIdArr) + ' Error is - ' + responseBodyParse.error_message;
                    //     }

                    //     var tableMarkup = '<p style="text-align:left; font-size:20px;">Error - ' + resmsg + '</p>';
                    //     tableMarkup += '<p style="text-align:left; font-size:15px;">Navigate To Generate Consolidated EWB Page -> Please <a href= ' + suiteletURL + '>Click Here</p>';

                    //     resultField.defaultValue = tableMarkup;

                    //     context.response.writePage(form);
                    // }
                }
            }
        }
        catch (e) {

            log.error('error in onRequest() function', e.toString());
        }
    }

    function createSublist(form, transport_doc_date_param, vehicle_no_param) {

        try {

            // Get the search results
            var searchResults = getSearchResults(transport_doc_date_param, vehicle_no_param);

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

            var accountHost = url.resolveDomain({
                hostType: url.HostType.APPLICATION,
            });

            var accountId = runtime.accountId;

            // Loop through the search results and add them to the sublist
            for (var invc_i = 0; invc_i < searchResults.length; invc_i++) {
                var result = searchResults[invc_i];

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
                    value: fromPlace || 0
                });

                var fromState = result.getText({
                    name: "custrecord_indgst_locatio_gststatecode",
                    join: "location",
                    label: "From State"
                });

                sublist.setSublistValue({
                    id: 'custpage_ctax_from_state',
                    line: invc_i,
                    value: fromState || 0
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

            }

            return sublist;
        }
        catch (e) {

            log.error('error in createSublist() function', e.toString());
        }
    }

    function getSearchResults(transport_doc_date_param, vehicle_no_param) {

        try {

            var invoiceSearchObj = search.load({
                id: 'customsearch_ctax_gen_reg_consoli_ewb'
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
