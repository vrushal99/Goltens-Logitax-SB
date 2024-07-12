/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
// START SUITELET FUNCTION  =====================================================================
define(['N/ui/serverWidget', 'N/search', 'N/file', 'N/encode', 'N/format', 'N/url', 'N/config', 'N/xml', 'N/render', 'N/record', 'N/https', 'N/redirect', 'N/runtime', '/SuiteScripts/ClearTax Integration Scripts/ClearTax Library File.js'],
    function (serverWidget, search, file, encode, format, url, config, xmlobj, render, record, https, redirect, runtime, ClearTax_Library_File) {
        function onRequest(context) {
            try {
                var getRecType = context.request.parameters.custpage_recType;  // return the record type
                // log.debug("getRecType", getRecType)
                var recID = context.request.parameters.custpage_recId;  // return the current record id

                var invoice_obj = record.load({   // return current record obj
                    type: getRecType,
                    id: recID,
                    isDynamic: true
                });

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
                        gst_number = gst_number
                    } else {
                        gst_number = ""
                    }
                    log.debug("gst_number", gst_number)
                }

                var ewaybill_no = invoice_obj.getValue({
                    fieldId: 'custbody_ctax_ewb_number'
                });
                log.debug("ewaybill_no", ewaybill_no)

                var ewaybill_cancel_irn = invoice_obj.getValue({
                    fieldId: 'custbody_ctax_ewaybill_cancelurn'
                });
                log.debug("ewaybill_cancel_irn", ewaybill_cancel_irn)

                var ewaybill_cancel_reason_code = invoice_obj.getText({
                    fieldId: 'custbody_ctax_cancel_reas_code'
                });

                var ewaybill_cancel_remark = invoice_obj.getText({
                    fieldId: 'custbody_ctax_cancel_reas_remark'
                });

                var ewaybill_pdf_print_type = invoice_obj.getText({
                    fieldId: 'custbody_ctax_ewb_get_pdf'
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
                var printfolderid = get_environment_name["PRINT_EWAYBILL_FOLDER_ID"]
                // log.debug("printfolderid", printfolderid)
                var ewaybillCancelURL = get_environment_name["CANCEL_EWAYBILL_URL"]
                var ewaybillPdfUrl = get_environment_name["GET_EWAYBILL_PDF_URL"]


                if (nullCheck(ewaybill_no) && !nullCheck(ewaybill_cancel_irn)) {

                    var _url = ewaybillCancelURL;

                    var headerObj = {
                        "X-Cleartax-Auth-Token": auth_token,
                        "gstin": gst_number,
                        "Content-Type": "application/json",
                        "accept": "application/json"
                    }
                    var body_data = {
                        "ewbNo": ewaybill_no,
                        "cancelRsnCode": ewaybill_cancel_reason_code,
                        "cancelRmrk": ewaybill_cancel_remark
                    };

                    var response = https.post({
                        body: JSON.stringify(body_data),
                        url: _url,
                        headers: headerObj
                    });
                    log.debug({
                        title: '_url',
                        details: _url
                    });
                    log.debug({
                        title: 'body_data',
                        details: JSON.stringify(body_data)
                    });
                    log.debug({
                        title: 'response.code',
                        details: response.code
                    });
                    log.debug({
                        title: 'response.body',
                        details: response.body
                    });
                    if (response.code == 200) {

                        var parseObdy = JSON.parse(response.body)

                        var parseObdy_cancelIrn = parseObdy.irn;
                        var parseObdy_ewaybillStatus = parseObdy.ewbStatus;

                        invoice_obj.setValue({
                            fieldId: 'custbody_ctax_ewaybill_cancelurn',
                            value: parseObdy_cancelIrn
                        });

                        if (parseObdy_ewaybillStatus == 'CANCELLED') {

                            invoice_obj.setValue({
                                fieldId: 'custbody_ctax_ewb_status',
                                value: 2 //cancel
                            });

                        }

                        //start:print cancel ewaybill pdf code

                        if (nullCheck(parseObdy_cancelIrn) && nullCheck(ewaybill_no)) {

                            var pdfurl = ewaybillPdfUrl;
                            // log.debug("_url", _url);

                            var pdfheaderObj = {
                                "X-Cleartax-Auth-Token": auth_token,
                                "gstin": gst_number,
                                "Content-Type": "application/json",
                            }

                            var pdfbodyData = {
                                "ewb_numbers": [
                                    ewaybill_no
                                ],
                                "print_type": ewaybill_pdf_print_type || ""
                            }
                            log.debug("pdfbodyData", JSON.stringify(pdfbodyData));

                            var pdfresponse = https.post({   // return the response and request
                                url: pdfurl,
                                headers: pdfheaderObj,
                                body: JSON.stringify(pdfbodyData)
                            });
                            log.debug("pdfresponse", JSON.stringify(pdfresponse));
                            log.debug({
                                title: 'pdfresponse.body eway',
                                details: pdfresponse.body
                            });

                            if (pdfresponse.code == 200) {

                                log.debug("pdfresponse.code ", pdfresponse.code);

                                var fileObj = file.create({                        // create response to pdf
                                    name: 'E-Waybill Cancel Print' + recID + '.pdf',
                                    fileType: file.Type.PDF,
                                    contents: pdfresponse.body,
                                });
                                log.debug("fileObj ", fileObj);

                                fileObj.encoding = file.Encoding.UTF_8;
                                fileObj.folder = printfolderid;
                                var file_id = fileObj.save();    // save the file in filecabinet 
                                log.debug("file_id eway", file_id);

                                if (file_id) {

                                    invoice_obj.setValue({
                                        fieldId: 'custbody_ctax_print_ewaybill',
                                        value: file_id
                                    });

                                }
                            }
                            //end:print cancel ewaybill pdf code

                        }
                    }
                }

                var recordId = invoice_obj.save({    //submit loadRecord obj
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });


                redirect.toRecord({
                    type: getRecType,
                    id: recID,
                });


            } catch (ex) {
                log.debug("error", ex)

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