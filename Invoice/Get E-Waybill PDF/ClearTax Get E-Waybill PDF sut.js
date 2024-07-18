/*----------------------------------------------------------------------------------------------
        Company Name 	:	Nuvista Technologies Pvt Ltd
        Script Name 	:	ClearTax Get E-Invoice PDF sut
        Author 			:  	NVT Employee
        Date            :   16-07-2024
        Description		:   

------------------------------------------------------------------------------------------------*/
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
// START SUITELET FUNCTION  =====================================================================
define(['N/ui/serverWidget', 'N/render', 'N/search', 'N/file', 'N/encode', 'N/format', 'N/url', 'N/config', 'N/xml', 'N/render', 'N/record', 'N/https', 'N/redirect', 'N/runtime', './ClearTax Library File.js'],
    function (serverWidget, render, search, file, encode, format, url, config, xmlobj, render, record, https, redirect, runtime, ClearTax_Library_File) {
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

                    var ctax_ewb_pdf_url = Invoice_obj.getValue({
                        fieldId: 'custbody_logitax_eway_bill_pdf_url'
                    });

                    var accountId = runtime.accountId; // return the accountId
                    var environment = runtime.envType; // PRODUCTION, SANDBOX, etc.
                    //log.debug("environment", environment)
                    var Configuration_data = ClearTax_Library_File.ClearTax_Einvoice_library()
                    //log.debug("Configuration_data", Configuration_data)
                    var get_environment_name = Configuration_data[environment]
                    // log.debug("get_environment_name", get_environment_name)
                    var printfolderid = get_environment_name["PRINT_EWAYBILL_FOLDER_ID"]
                    // log.debug("printfolderid", printfolderid)

                    if (nullCheck(ctax_ewb_pdf_url)) {

                        // ctax_ewb_pdf_url = 'https://uat.logitax.in/GP/CP?id=41464447388461';

                        var headerObj = {
                            "Content-Type": "application/pdf",
                            "accept": "application/pdf",
                        }

                        var response = https.get({
                            url: ctax_ewb_pdf_url,
                            headers: headerObj
                        });

                        log.debug('response.body eway', response.body);

                        var hexEncodedString = encode.convert({
                            string: response.body,
                            inputEncoding: encode.Encoding.UTF_8,
                            outputEncoding: encode.Encoding.BASE_64
                        });
                        log.debug("hexEncodedString", hexEncodedString);

                        var fileObj = file.create({ // create response to pdf
                            name: 'E-Waybill Print' + getRecId + '.pdf',
                            fileType: file.Type.PDF,
                            contents: hexEncodedString,
                            isOnline: true
                        });

                        // fileObj.encoding = file.Encoding.BASE_64;
                        fileObj.folder = printfolderid;
                        var file_id = fileObj.save(); // save the file in filecabinet 
                        log.debug("file_id eway", file_id);


                        if (file_id) {
                            Invoice_obj.setValue({
                                fieldId: 'custbody_ctax_print_ewaybill',
                                value: file_id
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
                    });

                }
            } catch (ex) {
                log.debug("error in onRequest() function", ex.toString());

            }
        }
        function nullCheck(value) {
            if (value != 'null' && value != '' && value != undefined && value != 'NaN') {
                return true;
            } else {
                return false;
            }
        }

        function base64UrlDecode(base64Url) {
            base64Url = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            var decodedData = atob(base64Url);
            return decodedData;
        }

        return {
            onRequest: onRequest
        }
    });
// END SUITELET FUNCTION  ============================================================================