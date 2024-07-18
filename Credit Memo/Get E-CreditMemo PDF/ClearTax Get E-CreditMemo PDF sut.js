/*----------------------------------------------------------------------------------------------
        Company Name 	:	Nuvista Technologies Pvt Ltd
        Script Name 	:	ClearTax Get E-CreditMemo PDF sut
        Author 			:  	NVT Employee
        Date            :   18-07-2024
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

                var ctax_ecredit_pdf_url = creditmemo_obj.getValue({
                    fieldId: 'custbody_logitax_einvoice_pdf_url'
                });

                if (nullCheck(ctax_ecredit_pdf_url)) {

                    var accountId = runtime.accountId; // return the accountId
                    var environment = runtime.envType; // PRODUCTION, SANDBOX, etc.
                    log.debug("environment", environment)
                    var Configuration_data = ClearTax_Library_File.ClearTax_Einvoice_library()
                    log.debug("Configuration_data", Configuration_data)
                    var get_environment_name = Configuration_data[environment]
                    log.debug("get_environment_name", get_environment_name)
                    var printfolderid = get_environment_name["PRINT_EINVOICE_FOLDER_ID"]
                    log.debug("printfolderid", printfolderid)

                    var headerObj = {
                        "Content-Type": "application/pdf",
                        "accept": "application/pdf",
                    }
                    var response = https.get({
                        url: ctax_ecredit_pdf_url,
                        headers: headerObj
                    });

                    var fileContent = response.body;
                    log.debug('fileContent', fileContent);

                    var fileObj = file.create({                        // create response to pdf
                        name: 'E-CreditMemo print' + getRecId + '.pdf',
                        fileType: file.Type.PDF,
                        contents: fileContent,
                    });
                    fileObj.encoding = file.Encoding.UTF_8;
                    fileObj.folder = printfolderid;
                    var file_id = fileObj.save();    // save the file in filecabinet 
                    log.debug("file_id", file_id);

                    if (nullCheck(file_id)) {

                        creditmemo_obj.setValue({
                            fieldId: 'custbody_ctax_ecreditnote_print',
                            value: file_id
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

        return {
            onRequest: onRequest
        }
    });
// END SUITELET FUNCTION  ============================================================================