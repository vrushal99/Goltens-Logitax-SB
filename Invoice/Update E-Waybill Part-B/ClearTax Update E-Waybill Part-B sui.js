/*----------------------------------------------------------------------------------------------
        Company Name 	:	Nuvista Technologies Pvt Ltd
        Script Name 	:	ClearTax Update E-Waybill Part-B sui
        Author 			:  	NVT Employee
        Date            :   08/07/2024
        Description		:   

------------------------------------------------------------------------------------------------*/
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
// START SUITELET FUNCTION  =====================================================================
define(['N/ui/serverWidget', 'N/config', 'N/search', 'N/file', 'N/encode', 'N/format', 'N/url', 'N/config', 'N/xml', 'N/render', 'N/record', 'N/https', 'N/redirect', 'N/runtime', './ClearTax Library File.js'],
    function (serverWidget, config, search, file, encode, format, url, config, xmlobj, render, record, https, redirect, runtime, ClearTax_Library_File) {
        function onRequest(context) {
            try {
                var getRecType = context.request.parameters.custpage_recType;  // return the record type
                // log.debug("getRecType", getRecType)
                var getRecId = context.request.parameters.custpage_recId;  // return the current record id
                // log.debug("getRecId", getRecId)
                var invoice_obj = record.load({   // return the record obj
                    type: getRecType,
                    id: getRecId,
                    isDynamic: true
                });

                var ewaybill_reason_code = invoice_obj.getValue({
                    fieldId: 'custbody_ctax_res_to_update_ewb'
                });

                var ewaybill_reason_remark = invoice_obj.getValue({
                    fieldId: 'custbody_ctax_reason_remark'
                });



                var accountId = runtime.accountId; // return the accountId
                var environment = runtime.envType; // PRODUCTION, SANDBOX, etc.
                // log.debug("environment", environment)
                var Configuration_data = ClearTax_Library_File.ClearTax_Einvoice_library()
                // log.debug("Configuration_data", Configuration_data)
                var get_environment_name = Configuration_data[environment]
                // log.debug("get_environment_name", get_environment_name)
                var auth_token = get_environment_name["AUTH_TOKEN"]
                // log.debug("auth_token", auth_token)
                // var ewaybll_download_status_url = get_environment_name["GET_EWAYBILL_DOWNLOAD_STATUS_URL"]
                var ewaybll_update_partb_url = get_environment_name["UPDATE_EWAYBILL_PARTB_URL"]
                log.debug("ewaybll_update_partb_url", ewaybll_update_partb_url)
                var get_client_code = get_environment_name["CLIENT_CODE"]
                var get_user_code = get_environment_name["USER_CODE"]
                var get_password = get_environment_name["PASSWORD"]

                // if (nullCheck(ewaybill_reason_code) && nullCheck(ewaybill_reason_remark)) {

                // var myMsg2 = message.create({  // return information msg
                // title: 'System processing your request please wait for sometime....',
                // type: message.Type.INFORMATION
                // });
                // myMsg2.show();

                var gst_number = gstNoFromSubsidiaryOrCompanyInfo(invoice_obj);

                var ewaybill_no = invoice_obj.getValue({
                    fieldId: 'custbody_ctax_ewb_number'
                });
                log.debug("ewaybill_no", ewaybill_no)

                var locationId = invoice_obj.getValue({
                    fieldId: 'location'
                });
                if (nullCheck(locationId)) {
                    var location_obj = record.load({ // get the location obj
                        type: 'location',
                        id: locationId,
                        isDynamic: true
                    });

                    var location_obj_gststatecode = location_obj.getValue({
                        fieldId: 'custrecord_indgst_locatio_gststatecode'
                    });
                    //log.debug("location_obj_gststatecode", location_obj_gststatecode)
                    if (nullCheck(location_obj_gststatecode)) {
                        var lookup_location_obj_gststatecode = search.lookupFields({  // get location record to placeofsupply record get gststatecode
                            type: 'customrecord_indgst_placeofsupplylist',
                            id: location_obj_gststatecode,
                            columns: ['custrecord_indgst_pos_gststatecode']
                        });
                        if (nullCheck(lookup_location_obj_gststatecode)) {
                            var loc_state_code_value = lookup_location_obj_gststatecode.custrecord_indgst_pos_gststatecode;
                        } else {
                            loc_state_code_value = ""
                        }
                    }
                    var location_subrecord = location_obj.getSubrecord({
                        fieldId: 'mainaddress'
                    });
                    var location_obj_city = location_subrecord.getValue({
                        fieldId: 'city'
                    })
                    if (location_obj_city) {
                        location_obj_city = location_obj_city
                    } else {
                        location_obj_city = ""
                    }

                }


                var transport_doc_no = invoice_obj.getValue({
                    fieldId: 'custbody_trans_docno'
                });

                var transport_doc_date = invoice_obj.getValue({
                    fieldId: 'custbody_trans_doc_date'
                });

                if (nullCheck(transport_doc_date)) {

                    var month = transport_doc_date.getMonth() + 1
                    if (month < 10) {
                        month = "0" + month
                    }
                    var date = transport_doc_date.getDate()
                    if (date < 10) {
                        date = "0" + date
                    }
                    var formatted_transport_doc_date = date + '/' + month + '/' + transport_doc_date.getFullYear()

                    formatted_transport_doc_date = String(formatted_transport_doc_date).trim();

                }

                var transport_mode = invoice_obj.getValue({
                    fieldId: 'custbody_modeofshipping'
                });

                // var transport_mode_text = '';

                // if (nullCheck(transport_mode)) {

                //     if (transport_mode == 1) { //by road

                //         transport_mode_text = 'ROAD'
                //     }
                //     else if (transport_mode == 2) { //	By Rail

                //         transport_mode_text = 'RAIL'
                //     }
                //     else if (transport_mode == 3) { //	By Air

                //         transport_mode_text = 'AIR'
                //     }
                //     else if (transport_mode == 4) { //	By Ship

                //         transport_mode_text = 'SHIP'
                //     }
                // }

                var inv_doc_no = invoice_obj.getValue({
                    fieldId: 'tranid'
                });

                var inv_doc_date = invoice_obj.getValue({
                    fieldId: 'trandate'
                });

                if (nullCheck(inv_doc_date)) {

                    var month = inv_doc_date.getMonth() + 1
                    if (month < 10) {
                        month = "0" + month
                    }
                    var date = inv_doc_date.getDate()
                    if (date < 10) {
                        date = "0" + date
                    }
                    var formatted_inv_doc_date = date + '/' + month + '/' + inv_doc_date.getFullYear()

                    formatted_inv_doc_date = String(formatted_inv_doc_date).trim();

                }

                var transport_vehicle_no = invoice_obj.getValue({
                    fieldId: 'custbody_ctax_vehicle_no'
                });

                var transport_vehicle_type = invoice_obj.getText({
                    fieldId: 'custbody_vehicle_type'
                });

                if (nullCheck(ewaybill_no)) {

                    var _url = ewaybll_update_partb_url;

                    var headerObj = {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    }
                    var body_data = {
                        "CLIENTCODE": get_client_code,
                        "USERCODE": get_user_code,
                        "PASSWORD": get_password,
                        "vehicleupdatelist": [
                            {
                                "ewbNo": ewaybill_no,
                                "vehicleNo": transport_vehicle_no,
                                "fromPlace": location_obj_city,
                                "fromState": loc_state_code_value,
                                "reasonCode": ewaybill_reason_code,
                                "reasonRem": ewaybill_reason_remark,
                                "transDocNo": transport_doc_no,
                                "transDocDate": formatted_transport_doc_date,
                                "transMode": transport_mode,
                                // "DocumentNumber": inv_doc_no,
                                // "DocumentType": "INV",
                                // "DocumentDate": formatted_inv_doc_date,
                                "vehicleType": transport_vehicle_type,
                            }
                        ]

                    };

                    var response = https.post({
                        body: JSON.stringify(body_data),
                        url: _url,
                        headers: headerObj
                    });
                    log.debug('_url', _url);
                    log.debug('body_data', JSON.stringify(body_data));
                    log.debug('response.code', response.code);
                    log.debug('response.body', response.body);

                    invoice_obj.setValue({
                        fieldId: 'custbody_ctax_request',
                        value: JSON.stringify(body_data)
                    });

                    invoice_obj.setValue({
                        fieldId: 'custbody_ctax_response',
                        value: response.body
                    });

                    if (response.code == 200) {

                        var IrnResponse = JSON.parse(response.body)
                        log.debug("response", IrnResponse);

                        if (nullCheck(IrnResponse[0])) {

                            var error = IrnResponse[0]["flag"];
                            log.debug("error", error)

                            if (error == false || error == 'false') {

                                log.debug('EWB Update Status:', 'Ewaybill Not Updated.');

                            }
                            else if (error == "true" || error == true) {

                                if (nullCheck(IrnResponse[0]["validUpto"])) {

                                    var validUptoDate = IrnResponse[0]["validUpto"];

                                    if (nullCheck(validUptoDate)) {

                                        invoice_obj.setValue({
                                            fieldId: 'custbody_ctax_ewaybill_validtill',
                                            value: String(validUptoDate)
                                        });
                                    }
                                }


                                var IrnResponse_Vehicle_Update_Date = IrnResponse[0]["vehUpdDate"];
                                log.debug("IrnResponse_Vehicle_Update_Date", IrnResponse_Vehicle_Update_Date)

                                if (nullCheck(IrnResponse_Vehicle_Update_Date)) {

                                    invoice_obj.setValue({
                                        fieldId: 'custbody_logitax_ewb_validity_vechile',
                                        value: String(IrnResponse_Vehicle_Update_Date)
                                    });

                                }
                            }
                        }
                    }
                }

                var recordId = invoice_obj.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });

                redirect.toRecord({
                    type: getRecType,
                    id: getRecId,
                });
                log.debug("recordId", recordId)
                // location.reload();




            } catch (ex) {
                log.debug("error in onRequest() function", ex.toString());

            }
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

        function nullCheck(value) {
            if (value != 'null' && value != '' && value != undefined && value != 'NaN') {
                return true;
            } else {
                return false;
            }
        }


        return {
            onRequest: onRequest
        }
    });
// END SUITELET FUNCTION  ============================================================================