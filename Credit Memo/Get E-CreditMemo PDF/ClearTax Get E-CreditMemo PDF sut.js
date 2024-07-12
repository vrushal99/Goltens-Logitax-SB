/*----------------------------------------------------------------------------------------------
        Company Name 	:	Nuvista Technologies Pvt Ltd
        Script Name 	:	ClearTax Get E-CreditMemo PDF sut
        Author 			:  	NVT Employee
        Date            :   24-05-2022
        Description		:   1. This Script is created for E-CreditMemo Print.
                            This script is invoked through E-CreditMemo print button. Then request is sent for PDF print and we will receive response, so that we can generate PDF.

------------------------------------------------------------------------------------------------*/
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
// START SUITELET FUNCTION  =====================================================================
define(['N/ui/serverWidget', 'N/search', 'N/file', 'N/encode', 'N/format', 'N/url', 'N/config', 'N/xml', 'N/render', 'N/record', 'N/https', 'N/redirect', 'N/runtime', './ClearTax Library File.js'],
    function (serverWidget, search, file, encode, format, url, config, xmlobj, render, record, https, redirect, runtime, ClearTax_Library_File) {
        //Begin: onRequest functionality
        function onRequest(context) {
            try {
                var getRecType = context.request.parameters.custpage_recType; // return the record type
                log.debug("getRecType", getRecType)
                var getRecId = context.request.parameters.custpage_recId; // return the current record id
                log.debug("getRecId", getRecId)
                var creditmemo_obj = record.load({ // return the record obj
                    type: getRecType,
                    id: getRecId,
                    isDynamic: true
                });
                var irns = creditmemo_obj.getValue({
                    fieldId: 'custbody_ctax_creditnote_irn'
                });
                log.debug("irns", irns)

                var subsidiary_obj_gst_no = gstNoFromSubsidiaryOrCompanyInfo(creditmemo_obj);

                var accountId = runtime.accountId; // return the accountId
                var environment = runtime.envType; // PRODUCTION, SANDBOX, etc.
                log.debug("environment", environment)
                var Configuration_data = ClearTax_Library_File.ClearTax_Einvoice_library()
                log.debug("Configuration_data", Configuration_data)
                var get_environment_name = Configuration_data[environment]
                log.debug("get_environment_name", get_environment_name)
                var auth_token = get_environment_name["AUTH_TOKEN"]
                log.debug("auth_token", auth_token)
                var print_einvoice_url = get_environment_name["PRINT_E_INVOICE_URL"]
                log.debug("print_einvoice_url", print_einvoice_url)
                var printfolderid = get_environment_name["PRINT_EINVOICE_FOLDER_ID"]
                log.debug("printfolderid", printfolderid)
                var printTemplate = get_environment_name["IRN_PRINT_TEMPLATE"]
                log.debug("printTemplate", printTemplate)

                //var _url = "http://einvoicing.internal.cleartax.co/v2/eInvoice/download?irns=" + irns
                if (nullCheck(print_einvoice_url) && nullCheck(irns)) {

                    var _url = print_einvoice_url + "template=" + printTemplate + "&irns=" + irns; // return the url in Dynamicly
                    log.debug("_url", _url)
                    var headerObj = {
                        "X-Cleartax-Auth-Token": auth_token,
                        "gstin": subsidiary_obj_gst_no,
                        "Content-Type": "application/pdf",
                        "accept": "application/pdf"
                    }
                    var response = https.get({ // return the response and request
                        url: _url,
                        headers: headerObj
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
                        var fileObj = file.create({ // create response to pdf
                            name: 'E-CreditMemo print' + getRecId + '.pdf',
                            fileType: file.Type.PDF,
                            contents: response.body,
                        });
                        fileObj.encoding = file.Encoding.UTF_8;
                        // context.response.writeFile({
                        // file: fileObj,
                        // isInline: true
                        // });
                        fileObj.folder = printfolderid;
                        var file_id = fileObj.save(); // save the file in filecabinet
                        log.debug("file_id", file_id);
                        var paramfileId = false;
                        if (file_id) {
                            paramfileId = true
                            creditmemo_obj.setValue({
                                fieldId: 'custbody_ctax_ecreditnote_print',
                                value: file_id
                            });

                        }
                    } else {
                        creditmemo_obj.setValue({
                            fieldId: 'custbody_ctax_print_einv_res',
                            value: response.body
                        });
                    }
                    var recordId = creditmemo_obj.save({ // return the save record Id
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                    log.debug("recordId", recordId);
                }

                redirect.toRecord({
                    type: getRecType,
                    id: getRecId,
                    parameters: {
                        'custparam_fileId': paramfileId
                    }
                });



            } catch (ex) {
                log.debug("error", ex)

            }
        }
        //End: onRequest functionality

        //Begin: _logValidation functionality
        function nullCheck(value) {
            if (value != 'null' && value != '' && value != undefined && value != 'NaN') {
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