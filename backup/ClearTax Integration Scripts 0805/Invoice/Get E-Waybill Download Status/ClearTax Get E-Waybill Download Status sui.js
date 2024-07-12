/*----------------------------------------------------------------------------------------------
        Company Name 	:	Nuvista Technologies Pvt Ltd
        Script Name 	:	
        Author 			:  	NVT Employee
        Date            :   22/04/2024
        Description		:   

------------------------------------------------------------------------------------------------*/
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
                var getRecId = context.request.parameters.custpage_recId;  // return the current record id
                // log.debug("getRecId", getRecId)
                var Invoice_obj = record.load({   // return the record obj
                    type: getRecType,
                    id: getRecId,
                    isDynamic: true
                });
                var subsidiaryId = Invoice_obj.getValue({
                    fieldId: 'subsidiary'
                });

                var ctax_ewaybill_workflowid = Invoice_obj.getValue({
                    fieldId: 'custbody_ctax_wk_id_ewb_other'
                });


                if (subsidiaryId) {
                    var subsidiary_obj = record.load({   // // return the subsidiary record obj
                        type: "subsidiary",
                        id: subsidiaryId,
                        isDynamic: true
                    });
                    var subsidiary_obj_gst_no = subsidiary_obj.getValue({
                        fieldId: 'federalidnumber'
                    });
                }
                var accountId = runtime.accountId; // return the accountId
                var environment = runtime.envType; // PRODUCTION, SANDBOX, etc.
                // log.debug("environment", environment)
                var Configuration_data = ClearTax_Library_File.ClearTax_Einvoice_library()
                // log.debug("Configuration_data", Configuration_data)
                var get_environment_name = Configuration_data[environment]
                // log.debug("get_environment_name", get_environment_name)
                var auth_token = get_environment_name["AUTH_TOKEN"]
                // log.debug("auth_token", auth_token)
                var ewaybll_download_status_url = get_environment_name["GET_EWAYBILL_DOWNLOAD_STATUS_URL"]

                if (nullCheck(ctax_ewaybill_workflowid)) {

                    var _url = ewaybll_download_status_url + ctax_ewaybill_workflowid + '/otherparty_ewb_download_status';
                    // log.debug("_url", _url)
                    var headerObj = {
                        "X-Cleartax-Auth-Token": auth_token,
                        "gstin": subsidiary_obj_gst_no,
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    }
                    var response = https.get({   // return the response and request
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

                        var parseResponseBody = JSON.parse(response.body);

                        if (nullCheck(parseResponseBody.status == "PROCESSED")) {

                            Invoice_obj.setValue({
                                fieldId: 'custbody_ctax_ewb_down_stat_api_res',
                                value: JSON.stringify(parseResponseBody)
                            });

                        }
                        else {

                            Invoice_obj.setValue({
                                fieldId: 'custbody_ctax_ewb_down_stat_api_res',
                                value: JSON.stringify(parseResponseBody)
                            });

                        }

                    }
                    else {

                        Invoice_obj.setValue({
                            fieldId: 'custbody_ctax_ewb_down_stat_api_res',
                            value: JSON.stringify(parseResponseBody)
                        });

                    }
                }

                var recordId = Invoice_obj.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });

                redirect.toRecord({
                    type: getRecType,
                    id: getRecId,
                });


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


        return {
            onRequest: onRequest
        }
    });
// END SUITELET FUNCTION  ============================================================================