/*----------------------------------------------------------------------------------------------
        Company Name 	:	Nuvista Technologies Pvt Ltd
        Script Name 	:	ClearTax Get E-Invoice PDF sut
        Author 			:  	NVT Employee
        Date            :   10-05-2022
        Description		:   1. This Script is created for E-Invoice Print.
                            This script is invoked through E-Invoice print button. Then request is sent for PDF print and we will receive response, so that we can generate PDF.

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
                var getRecType = context.request.parameters.custpage_recType; // return the record type
                log.debug("getRecType", getRecType)
                var getRecId = context.request.parameters.custpage_recId; // return the current record id
                log.debug("getRecId", getRecId)

                if (nullCheck(getRecId) && nullCheck(getRecType)) {

                    var Invoice_obj = record.load({ // return the record obj
                        type: getRecType,
                        id: getRecId,
                        isDynamic: true
                    });
        
                    var irns = Invoice_obj.getValue({
                        fieldId: 'custbody_ctax_ewaybill_irn'
                    });
                    var ewb_number = Invoice_obj.getValue({
                        fieldId: 'custbody_ctax_ewb_number'
                    });
                    var print_type = Invoice_obj.getText({
                        fieldId: 'custbody_ctax_ewb_get_pdf'
                    });

                    log.debug("irns", irns)

                  
                    var subsidiary_obj_gst_no = gstNoFromSubsidiaryOrCompanyInfo(Invoice_obj);

                    var accountId = runtime.accountId; // return the accountId
                    var environment = runtime.envType; // PRODUCTION, SANDBOX, etc.
                    //log.debug("environment", environment)
                    var Configuration_data = ClearTax_Library_File.ClearTax_Einvoice_library()
                    //log.debug("Configuration_data", Configuration_data)
                    var get_environment_name = Configuration_data[environment]
                    log.debug("get_environment_name", get_environment_name)
                    var auth_token = get_environment_name["AUTH_TOKEN"]
                    //log.debug("auth_token", auth_token)
                    var print_ewaybill_url = get_environment_name["EWAYBILL_URL"]
                    //log.debug("print_ewaybill_url", print_ewaybill_url)
                    var printfolderid = get_environment_name["PRINT_EWAYBILL_FOLDER_ID"]
                    log.debug("printfolderid", printfolderid)

                    //var _url = "http://einvoicing.internal.cleartax.co/v2/eInvoice/download?template=62cfd0a9-d1ed-47b0-b260-fe21f57e9c5e&irns="+irns

                    if (nullCheck(print_ewaybill_url)) {

                        var _url = print_ewaybill_url + "/print?format=PDF";
                        log.debug("_url", _url);
                        var headerObj = {
                            "X-Cleartax-Auth-Token": auth_token,
                            "gstin": subsidiary_obj_gst_no,
                            "Content-Type": "application/json"
                        }
                        var bodyData = {
                            "ewb_numbers": [
                                ewb_number
                            ],
                            "print_type": print_type
                        }
                        // var requestBody = JSON.stringify(bodyData);
                        // log.debug("requestBody", requestBody)
                        var response = https.post({ // return the response and request
                            url: _url,
                            headers: headerObj,
                            body: JSON.stringify(bodyData)
                        });
                        log.debug("response::::::::", JSON.stringify(response));
                        log.debug({
                            title: 'response.body eway',
                            details: response.body
                        });

                        if (response.code == 200) {

                            var fileObj = file.create({ // create response to pdf
                                name: 'E-Waybill Print' + getRecId + '.pdf',
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
                            log.debug("file_id eway", file_id);
                            var paramfileId = false;
                            if (file_id) {
                                paramfileId = true
                                Invoice_obj.setValue({
                                    fieldId: 'custbody_ctax_print_ewaybill',
                                    value: file_id
                                });
                                // var recordId = Invoice_obj.save({ // return the save record Id
                                // enableSourcing: true,
                                // ignoreMandatoryFields: true
                                // });
                                // log.debug("recordId", recordId);
                            }

                        }
                        else {
                            Invoice_obj.setValue({
                                fieldId: 'custbody_ctax_print_ewb_res',
                                value: response.body
                            });
                        }

                    }

                    var recordId = Invoice_obj.save({ // return the save record Id
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                    log.debug("recordId", recordId);

                    redirect.toRecord({
                        type: getRecType,
                        id: getRecId,
                        parameters: {
                            'custparam_fileId': paramfileId
                        }
                    });

                }
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