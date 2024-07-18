/*----------------------------------------------------------------------------------------------
        Company Name 	:	Nuvista Technologies Pvt Ltd
        Script Name 	:	ClearTax Get E-Invoice By IRN CM sui
        Author 			:  	NVT Employee
        Date            :   17-07-2024
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
                var getRecType = context.request.parameters.custpage_recType; // return the record type
                // log.debug("getRecType", getRecType)
                var getRecId = context.request.parameters.custpage_recId; // return the current record id
                // log.debug("getRecId", getRecId)
                var loadRecord = record.load({ // return the record obj
                    type: getRecType,
                    id: getRecId,
                    isDynamic: true
                });

                var ctax_einvoice_irn = loadRecord.getValue({
                    fieldId: 'custbody_ctax_creditnote_irn'
                });

                var subsidiary_obj_gstnum = gstNoFromSubsidiaryOrCompanyInfo(loadRecord);

                var accountId = runtime.accountId; // return the accountId
                var environment = runtime.envType; // PRODUCTION, SANDBOX, etc.
                log.debug("environment", environment)
                var Configuration_data = ClearTax_Library_File.ClearTax_Einvoice_library()
                log.debug("Configuration_data", Configuration_data)
                var get_environment_name = Configuration_data[environment]
                log.debug("get_environment_name", get_environment_name)
                var get_invoice_url = get_environment_name["GET_INVOICE_URL"]
                log.debug("get_invoice_url", get_invoice_url)
                var get_client_code = get_environment_name["CLIENT_CODE"]
                var get_user_code = get_environment_name["USER_CODE"]
                var get_password = get_environment_name["PASSWORD"]

                var url = get_invoice_url;
                //log.debug("url", url)
                var headers = {
                    "Content-Type": "application/json",
                    "accept": "application/json",
                }

                var body_data = {
                    "USERCODE": get_user_code,
                    "CLIENTCODE": get_client_code,
                    "PASSWORD": get_password,
                    "RequestorGSTIN": subsidiary_obj_gstnum,
                    "irnlist": [
                        {
                            "irn": ctax_einvoice_irn
                        }
                    ]
                }

                var response_irn = https.post({
                    url: url,
                    body: JSON.stringify(body_data),
                    headers: headers,
                });

                log.debug('response.code', response_irn.code);
                log.debug('response.body', response_irn.body);

                loadRecord.setValue({
                    fieldId: 'custbody_logitax_irn_details_request',
                    value: JSON.stringify(body_data)
                });

                loadRecord.setValue({
                    fieldId: 'custbody_ctax_geteinvoice_url',
                    value: response_irn.body
                });


                var recordId = loadRecord.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });

                redirect.toRecord({
                    type: getRecType,
                    id: getRecId,
                });
                log.debug("recordId", recordId)

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