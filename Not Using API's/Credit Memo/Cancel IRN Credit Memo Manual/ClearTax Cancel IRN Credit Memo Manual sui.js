/*----------------------------------------------------------------------------------------------
        Company Name 	:	Nuvista Technologies Pvt Ltd
        Script Name 	:	
        Author 			:  	NVT Employee
        Date            :   
        Description		:  

------------------------------------------------------------------------------------------------*/
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
// START SUITELET FUNCTION  =====================================================================
define(['N/ui/serverWidget', 'N/search', 'N/file', 'N/encode', 'N/format', 'N/url', 'N/config', 'N/xml', 'N/render', 'N/record', 'N/https', 'N/redirect', 'N/runtime', './ClearTax Library File.js'],
    function (serverWidget, search, file, encode, format, url, config, xmlobj, render, record, https, redirect, runtime, ClearTax_Library_File) {
        function onRequest(context) {
            try {
                var getRecType = context.request.parameters.custpage_recType;  // return the record type
                // log.debug("getRecType", getRecType)
                var getRecId = context.request.parameters.custpage_recId;  // return the current record id
                var creditmemo_obj = record.load({ // return current record obj
                    type: getRecType,
                    id: getRecId,
                    isDynamic: true
                });
                //log.debug("invoice_obj", invoice_obj)
                var gst_number = gstNoFromSubsidiaryOrCompanyInfo(creditmemo_obj);

                var creditmemo_obj_printeinvoice = creditmemo_obj.getValue({
                    fieldId: 'custbody_ctax_ecreditnote_print'
                });
                var creditmemo_obj_status = creditmemo_obj.getValue({
                    fieldId: 'status'
                });
                log.debug("creditmemo_obj_status", creditmemo_obj_status)
                var creditmemo_obj_irn = creditmemo_obj.getValue({
                    fieldId: 'custbody_ctax_creditnote_irn'
                });
                log.debug("creditmemo_obj_irn", creditmemo_obj_irn)
                var creditmemo_obj_cancelirn = creditmemo_obj.getValue({
                    fieldId: 'custbody_ctax_ecreditnote_canceli'
                });
                log.debug("creditmemo_obj_cancelirn", creditmemo_obj_cancelirn)

                var creditmemo_obj_cancel_code = creditmemo_obj.getValue({
                    fieldId: 'custbody_ctax_einvoice_cancel_irn'
                });

                var creditmemo_obj_cancel_remark = creditmemo_obj.getValue({
                    fieldId: 'custbody_ctax_cancel__irn_remark'
                });

                var accountId = runtime.accountId; // return accountId
                var environment = runtime.envType; // PRODUCTION, SANDBOX, etc.
                log.debug("environment", environment)
                var Configuration_data = ClearTax_Library_File.ClearTax_Einvoice_library()
                log.debug("Configuration_data", Configuration_data)
                var get_environment_name = Configuration_data[environment]
                log.debug("get_environment_name", get_environment_name)
                var cancel_irn_url = get_environment_name["CANCEL_IRN_URL"]
                log.debug("cancel_irn_url", cancel_irn_url)
                var auth_token = get_environment_name["AUTH_TOKEN"]
                log.debug("auth_token", auth_token)
                var print_einvoice_url = get_environment_name["PRINT_E_INVOICE_URL"]
                log.debug("print_einvoice_url", print_einvoice_url)
                var printfolderid = get_environment_name["PRINT_EINVOICE_FOLDER_ID"]
                log.debug("printfolderid", printfolderid)
                var printTemplate = get_environment_name["IRN_PRINT_TEMPLATE"]
                log.debug("printTemplate", printTemplate)

                if (_logValidation(creditmemo_obj_irn) && !_logValidation(creditmemo_obj_cancelirn)) {
                    // cancel IRN integration start
                    var _url = cancel_irn_url
                    var headerObj = {
                        "X-Cleartax-Auth-Token": auth_token,
                        // "owner_id": '9abeb2db-955c-49c6-99b9-e2589314896b',//08.04.2024 - commented
                        "gstin": gst_number,
                        // "x-cleartax-product": 'EInvoice',//08.04.2024 - commented
                        "Content-Type": "application/json",
                        "accept": "application/json"
                    }
                    // var body_data = {};

                    if (_logValidation(creditmemo_obj_cancel_code) && _logValidation(creditmemo_obj_cancel_remark)) {

                        var body_data = [{
                            "irn": creditmemo_obj_irn,
                            "CnlRsn": creditmemo_obj_cancel_code,
                            "CnlRem": creditmemo_obj_cancel_remark
                        }]
                    } else {

                        var body_data = [{
                            "irn": creditmemo_obj_irn,
                            "CnlRsn": "4",
                            "CnlRem": "Cancelled by User"
                        }]
                    }

                    var response = https.put({ //return the request and response
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
                        var error = parseObdy[0]["govt_response"]["Success"]
                        log.debug("error", error)
                        if (_logValidation(error) && error == "N") {
                            var get_error = parseObdy[0]["govt_response"]["ErrorDetails"][0]["error_message"]
                        } else if (_logValidation(error) && error == "Y") {
                            var parseObdy_cancelIrn = parseObdy[0]["govt_response"]["Irn"]
                            creditmemo_obj.setValue({
                                fieldId: 'custbody_ctax_ecreditnote_canceli',
                                value: parseObdy_cancelIrn
                            });
                            if (_logValidation(creditmemo_obj_printeinvoice) && _logValidation(creditmemo_obj_irn)) {
                                var print_url = print_einvoice_url + "template=" + printTemplate + "&irns=" + creditmemo_obj_irn
                                log.debug("print_url", print_url)
                                var print_headerObj = {
                                    "X-Cleartax-Auth-Token": auth_token,
                                    // "owner_id": '9abeb2db-955c-49c6-99b9-e2589314896b',
                                    "gstin": gst_number,
                                    // "x-cleartax-product": 'EInvoice',
                                    "Content-Type": "application/pdf",
                                    "accept": "application/pdf"
                                }
                                var pdf_response = https.get({ // return request and response
                                    url: print_url,
                                    headers: print_headerObj
                                });
                                log.debug({
                                    title: 'pdf_response.code',
                                    details: pdf_response.code
                                });
                                log.debug({
                                    title: 'pdf_response.body',
                                    details: pdf_response.body
                                });
                                var fileObj = file.create({
                                    name: 'E-CreditMemo print' + getRecId + '.pdf',
                                    fileType: file.Type.PDF,
                                    contents: pdf_response.body,
                                });
                                fileObj.encoding = file.Encoding.UTF_8;
                                fileObj.folder = printfolderid;
                                var file_id = fileObj.save();
                                log.debug("file_id", file_id);
                                var paramfileId = false;
                                if (file_id) {
                                    paramfileId = true
                                    creditmemo_obj.setValue({
                                        fieldId: 'custbody_ctax_ecreditnote_print',
                                        value: file_id
                                    });
                                }
                            }
                        }
                    } else {
                        creditmemo_obj.setValue({
                            fieldId: 'custbody_ctax_cancel_irn_res',
                            value: response.body
                        });
                    }
                    var recordId = creditmemo_obj.save({ //return the save record obj
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                    log.debug("recordId", recordId)

                }
                redirect.toRecord({
                    type: getRecType,
                    id: getRecId,
                    parameters: {
                        'custparam_fileId': paramfileId
                    }
                });

            } catch (err) {
                log.debug({
                    title: 'err',
                    details: err
                });
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
        }
    });
// END SUITELET FUNCTION  ============================================================================