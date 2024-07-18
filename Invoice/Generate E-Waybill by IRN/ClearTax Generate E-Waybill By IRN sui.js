/*----------------------------------------------------------------------------------------------
    Company Name :  Nuvista Technologies Pvt Ltd
    Script Name : 	ClearTax Generate E-Waybill By IRN sui
    Author : 		NVT Employee
    Date : 			01-07-2024
    description : 	

------------------------------------------------------------------------------------------------*/

/**
 * @NApiVersion 2.1
 * @NScriptType suitelet
 */

define(['N/search', 'N/config', 'N/record', 'N/ui/serverWidget', 'N/http', 'N/url', 'N/redirect', 'N/xml', 'N/runtime', 'N/ui/dialog', 'N/https', 'N/format', './ClearTax Library File.js'], function (search, config, record, serverWidget, http, url, redirect, xml, runtime, dialog, https, format, ClearTax_Library_File) {

    function onRequest(context) {

        try {

            var get_recordId = context.request.parameters.custpage_recId;
            var get_recordType = context.request.parameters.custpage_recType;

            if (nullCheck(get_recordId) && nullCheck(get_recordType)) {

                var loadRecord = record.load({   // return the record obj
                    type: get_recordType,
                    id: get_recordId,
                    isDynamic: true
                });
                var cleartax_irn = loadRecord.getValue({
                    fieldId: 'custbody_ctax_einvoice_irn'
                });
                var transport_distance = loadRecord.getValue({
                    fieldId: 'custbody_trans_distance'
                });
                var transport_mode = loadRecord.getValue({
                    fieldId: 'custbody_modeofshipping'
                });
                var transport_id = loadRecord.getValue({
                    fieldId: 'custbody_ctax_trans_gstn_no'
                });
                var transport_name = loadRecord.getText({
                    fieldId: 'custbody_ctax_trans_name'
                });
                var transport_doc_date = loadRecord.getValue({
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
                    var formattedtransportdate = date + '/' + month + '/' + transport_doc_date.getFullYear()
                    //log.debug("formatteddate", formatteddate)
                    formattedtransportdate = String(formattedtransportdate).trim();

                }

                var transport_doc_no = loadRecord.getValue({
                    fieldId: 'custbody_trans_docno'
                });
                var transport_vehicle_no = loadRecord.getValue({
                    fieldId: 'custbody_ctax_vehicle_no'
                });
                var transport_vehicle_type = loadRecord.getText({
                    fieldId: 'custbody_vehicle_type'
                });

                var shipping_obj = shippingAdressDetails(get_recordId)
                var shipToAddressLine1 = shipping_obj.shipToAddressLine1
                var shipToAddressLine2 = shipping_obj.shipToAddressLine2;
                var shipToAddressCity = shipping_obj.shipToAddressCity;
                var shipToAddressZip = shipping_obj.shipToAddressZip;
                var shipToAddressState = shipping_obj.shipToAddressState
                //End: get shipping address saved-search functionality
                if (nullCheck(shipToAddressState)) {
                    var shipto_satecode_obj = indgst_placeofsupplylistSearchObj(shipToAddressState)
                    var shipto_satecode = shipto_satecode_obj.shiptogststatecode
                }

                // getting the location value
                var locationId = loadRecord.getValue({
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
                    var location_obj_addr1 = location_subrecord.getValue({
                        fieldId: 'addr1'
                    });
                    if (location_obj_addr1) {
                        location_obj_addr1 = location_obj_addr1
                    } else {
                        location_obj_addr1 = ""
                    }
                    //log.debug("location_obj_addr1", location_obj_addr1)
                    var location_obj_name = location_obj.getValue({
                        fieldId: 'name'
                    });
                    if (location_obj_name) {
                        location_obj_name = location_obj_name
                    } else {
                        location_obj_name = ""
                    }
                    var location_obj_addr2 = location_subrecord.getValue({
                        fieldId: 'addr2'
                    });
                    if (location_obj_addr2) {
                        location_obj_addr2 = location_obj_addr2
                    } else {
                        location_obj_addr2 = ""
                    }
                    //log.debug("location_obj_addr2", location_obj_addr2)
                    var location_obj_city = location_subrecord.getValue({
                        fieldId: 'city'
                    })
                    if (location_obj_city) {
                        location_obj_city = location_obj_city
                    } else {
                        location_obj_city = ""
                    }
                    //log.debug("location_obj_city", location_obj_city)
                    var location_obj_zip = location_subrecord.getValue({
                        fieldId: 'zip'
                    })
                    if (location_obj_zip) {
                        location_obj_zip = location_obj_zip
                    } else {
                        location_obj_zip = ""
                    }

                }

                var subsidiary_obj_gstnum = gstNoFromSubsidiaryOrCompanyInfo(loadRecord);

                var accountId = runtime.accountId; // return the accountId
                var environment = runtime.envType; // PRODUCTION, SANDBOX, etc.
                //log.debug("environment", environment)
                var Configuration_data = ClearTax_Library_File.ClearTax_Einvoice_library()
                //log.debug("Configuration_data", Configuration_data)
                var get_environment_name = Configuration_data[environment]
                //log.debug("get_environment_name", get_environment_name)
                var GENERATE_EWAYBILL_BY_IRN_URL = get_environment_name["GENERATE_EWAYBILL_BY_IRN_URL"]
                var get_client_code = get_environment_name["CLIENT_CODE"]
                var get_user_code = get_environment_name["USER_CODE"]
                var get_password = get_environment_name["PASSWORD"]

                if (nullCheck(GENERATE_EWAYBILL_BY_IRN_URL)) {

                    var url = GENERATE_EWAYBILL_BY_IRN_URL    // return the url in dynamic

                    var headers = {
                        "Content-Type": "application/json",
                        "accept": "application/json",
                    }

                    var body_data =
                    {
                        "CLIENTCODE": get_client_code,
                        "USERCODE": get_user_code,
                        "PASSWORD": get_password,
                        "ewbeinvoicelist": [
                            {
                                "Irn": cleartax_irn,
                                "Distance": transport_distance,
                                "TransMode": transport_mode,
                                "TransId": transport_id,
                                "TransName": transport_name,
                                "TransDocDt": formattedtransportdate,
                                "TransDocNo": transport_doc_no,
                                "VehNo": transport_vehicle_no,
                                "VehType": transport_vehicle_type,
                                "ExpShipDtls": {
                                    "Addr1": shipToAddressLine1 || "",
                                    "Addr2": shipToAddressLine2 || "",
                                    "Loc": shipToAddressCity || "",
                                    "Pin": shipToAddressZip || "",
                                    "Stcd": shipto_satecode || "",
                                },
                                "DispDtls": {
                                    "Nm": location_obj_name || "",
                                    "Addr1": location_obj_addr1 || "",
                                    "Addr2": location_obj_addr2 || "",
                                    "Loc": location_obj_city || "",
                                    "Pin": location_obj_zip || "",
                                    "Stcd": loc_state_code_value || "",
                                }
                            }
                        ]
                    }



                    log.debug('request body', JSON.stringify(body_data));

                    var response_irn = https.post({
                        url: url,
                        body: JSON.stringify(body_data),
                        headers: headers,
                    });
                    log.debug('response.code', response_irn.code);
                    log.debug('response.body', response_irn.body);

                    loadRecord.setValue({
                        fieldId: 'custbody_ctax_ewaybill_respons',
                        value: response_irn.body
                    });
                    loadRecord.setValue({
                        fieldId: 'custbody_ctax_ewaybill_request',
                        value: JSON.stringify(body_data)
                    });

                    if (response_irn.code == 200) {
                        //if response code got 200 then this code will execute
                        var parseObdy = JSON.parse(response_irn.body)
                        var error = parseObdy[0]["flag"];
                        //log.debug("error", error)

                        if (error == "false" || error == false) {

                            log.debug('Ewaybill Status:', 'Ewaybill is not generated.');

                        } else if (error == "true" || error == true) {

                            var parseObdy_BillNo = parseObdy[0]["EwbNo"]
                            var parseObdy_Irn = parseObdy[0]["Irn"]
                            // var parseObdy_Status = parseObdy[0]["Status"] //03.07.2024 - no status is coming in response
                            var parseObdy_AckDt = parseObdy[0]["EwbDt"]

                            if (nullCheck(parseObdy_AckDt)) {

                                loadRecord.setValue({
                                    fieldId: 'custbody_ctax_ewaybill_ack_date',
                                    value: String(parseObdy_AckDt)
                                });
                            }

                            var parseObdy_ewaybill_valid_date = parseObdy[0]["EwbValidTill"]

                            if (nullCheck(parseObdy_ewaybill_valid_date)) {

                                loadRecord.setValue({
                                    fieldId: 'custbody_ctax_ewaybill_validtill',
                                    value: String(parseObdy_ewaybill_valid_date)
                                });

                                var ewaybillValidTillDateParse = conversionOfEWBVALIDTILLDateToUserPreference(parseObdy_ewaybill_valid_date, config);

                                if (nullCheck(ewaybillValidTillDateParse)) {
                                    loadRecord.setValue({
                                        fieldId: 'custbody_ctax_ewaybill_validtill_searc',
                                        value: ewaybillValidTillDateParse
                                    });
                                }

                            }

                            if (nullCheck(parseObdy_BillNo)) {

                                loadRecord.setValue({
                                    fieldId: 'custbody_ctax_ewb_number',
                                    value: parseObdy_BillNo.toString()
                                });
                                // log.debug("parseObdy_BillNo", parseObdy_BillNo)

                                loadRecord.setValue({
                                    fieldId: 'custbody_ctax_ewaybill_transfer',
                                    value: true
                                });

                                loadRecord.setValue({
                                    fieldId: 'custbody_ctax_ewaybill_irn',
                                    value: parseObdy_Irn
                                });
                                // log.debug("parseObdy_Irn", parseObdy_Irn)

                                // if (parseObdy_Status == 'GENERATED' || parseObdy_Status == 'PARTA_GENERATED') {

                                loadRecord.setValue({
                                    fieldId: 'custbody_ctax_ewb_status',
                                    value: 1 //Generated
                                });
                                // log.debug("parseObdy_Status", parseObdy_Status)

                                // }

                                loadRecord.setValue({
                                    fieldId: 'custbody_ctax_ewaybill_cancelurn',
                                    value: ""
                                });

                                loadRecord.setValue({
                                    fieldId: 'custbody_ctax_cancel_reas_remark',
                                    value: ""
                                });

                                loadRecord.setValue({
                                    fieldId: 'custbody_ctax_cancel_reas_code',
                                    value: ""
                                });
                            }

                            var ewb_pdf_url = parseObdy[0]["detailedpdfUrl"];

                            if (nullCheck(ewb_pdf_url)) {

                                loadRecord.setValue({
                                    fieldId: 'custbody_logitax_eway_bill_pdf_url',
                                    value: ewb_pdf_url
                                });
                            }
                        }
                    }
                }

                var recordId = loadRecord.save({    //submit loadRecord obj
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });

                redirect.toRecord({
                    type: get_recordType,
                    id: get_recordId
                });

            }

        } catch (err) {
            log.debug({
                title: 'err',
                details: err
            });
            if (err.details) {
                return {
                    "statuscode": "406",
                    "success": "false",
                    "message": err.details
                }
            } else if (err.code) {
                return {
                    "statuscode": "407",
                    "success": "false",
                    "message": err.code
                }
            } else if (err.message) {
                return {
                    "statuscode": "408",
                    "success": "false",
                    "message": err.message
                }
            }
        }




    }


    function conversionOfEWBVALIDTILLDateToUserPreference(parseObdy_ewaybill_valid_date, config) {

        try {

            if (nullCheck(parseObdy_ewaybill_valid_date)) {

                var d = new Date(parseObdy_ewaybill_valid_date);

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

                return ewaybillValidTillDateParse;
            }
        }
        catch (e) {

            log.error('error in conversionOfEWBVALIDTILLDateToUserPreference() function', e.toString());
        }
    }

    //Begin: shippingAdressDetails functionality
    function shippingAdressDetails(get_recordId) {
        var shipToAddressLine1 = ""
        var shipToAddressLine2 = ""
        var shipToAddressCity = ""
        var shipToAddressZip = ""
        var shipToAddressState = ""
        var obj = {};
        var invoiceSearchObj = search.create({
            type: "invoice",
            filters: [
                ["type", "anyof", "CustInvc"],
                "AND",
                ["mainline", "is", "T"],
                "AND",
                ["internalid", "anyof", get_recordId]
            ],
            columns: [
                search.createColumn({
                    name: "shipaddress",
                    label: "Shipping Address"
                }),
                search.createColumn({
                    name: "shipaddress1",
                    label: "Shipping Address 1"
                }),
                search.createColumn({
                    name: "shipaddress2",
                    label: "Shipping Address 2"
                }),
                search.createColumn({
                    name: "shipcity",
                    label: "Shipping City"
                }),
                search.createColumn({
                    name: "shipcountry",
                    label: "Shipping Country"
                }),
                search.createColumn({
                    name: "shipphone",
                    label: "Shipping Phone"
                }),
                search.createColumn({
                    name: "shipstate",
                    label: "Shipping State/Province"
                }),
                search.createColumn({
                    name: "shipzip",
                    label: "Shipping Zip"
                }),
                search.createColumn({
                    name: "shipname",
                    label: "Shipping Label"
                })
            ]
        });
        var searchResultCount = invoiceSearchObj.runPaged().count;
        //log.debug("invoiceSearchObj result count", searchResultCount);
        invoiceSearchObj.run().each(function (result) {
            shipToAddressLine1 = result.getValue("shipaddress1")
            shipToAddressLine2 = result.getValue("shipaddress2")
            shipToAddressCity = result.getValue("shipcity")
            shipToAddressZip = result.getValue("shipzip")
            shipToAddressState = result.getValue("shipstate")
            return true;
        });
        obj.shipToAddressLine1 = shipToAddressLine1;
        obj.shipToAddressLine2 = shipToAddressLine2;
        obj.shipToAddressCity = shipToAddressCity;
        obj.shipToAddressZip = shipToAddressZip;
        obj.shipToAddressState = shipToAddressState;
        return obj;
    }
    //End: shippingAdressDetails functionality


    //Begin: indgst_placeofsupplylistSearchObj functionality
    function indgst_placeofsupplylistSearchObj(shipToAddressState) {
        var shiptogststatecode = "";
        var obj = {};
        var customrecord_indgst_placeofsupplylistSearchObj = search.create({
            type: "customrecord_indgst_placeofsupplylist",
            filters:
                [
                    ["isinactive", "is", "F"],
                    "AND",
                    ["custrecord_state_name_pos", "is", shipToAddressState]
                ],
            columns:
                [
                    search.createColumn({
                        name: "custrecord_indgst_pos_gststatecode",
                        sort: search.Sort.ASC,
                        label: "GST State Code"
                    }),
                    search.createColumn({
                        name: "custrecord_state_name_pos",
                        sort: search.Sort.ASC,
                        label: "State Name"
                    })
                ]
        });
        var searchResultCount = customrecord_indgst_placeofsupplylistSearchObj.runPaged().count;
        //log.debug("customrecord_indgst_placeofsupplylistSearchObj result count",searchResultCount);
        customrecord_indgst_placeofsupplylistSearchObj.run().each(function (result) {
            shiptogststatecode = result.getValue("custrecord_indgst_pos_gststatecode")
            return true;
        });
        obj.shiptogststatecode = shiptogststatecode;
        return obj;
    }
    //End: indgst_placeofsupplylistSearchObj functionality


    function nullCheck(value) {
        if (value != 'null' && value != '' && value != undefined && value != 'NaN') {
            return true;
        } else {
            return false;
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

    return {
        onRequest: onRequest
    };

});