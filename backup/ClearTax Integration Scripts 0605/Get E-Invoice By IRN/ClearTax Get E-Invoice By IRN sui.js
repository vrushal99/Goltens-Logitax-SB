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
                var loadRecord = record.load({   // return the record obj
                    type: getRecType,
                    id: getRecId,
                    isDynamic: true
                });
                
                 var ctax_einvoice_irn = loadRecord.getValue({
                    fieldId: 'custbody_ctax_einvoice_irn'
                });

                var subsidiaryId = loadRecord.getValue({
                    fieldId: 'subsidiary'
                });

                if (subsidiaryId) {
                    var subsidiary_obj = record.load({  // get subsidiary obj
                        type: 'subsidiary',
                        id: subsidiaryId,
                        isDynamic: true
                    });

                    var subsidiary_obj_gstnum = subsidiary_obj.getValue({
                        fieldId: 'federalidnumber'
                    });
                    if (subsidiary_obj_gstnum) {
                        subsidiary_obj_gstnum = subsidiary_obj_gstnum
                    } else {
                        subsidiary_obj_gstnum = ""
                    }

                }


                
                var accountId = runtime.accountId; // return the accountId
                var environment = runtime.envType; // PRODUCTION, SANDBOX, etc.
                // log.debug("environment", environment)
                var Configuration_data = ClearTax_Library_File.ClearTax_Einvoice_library()
                // log.debug("Configuration_data", Configuration_data)
                var get_environment_name = Configuration_data[environment]
                // log.debug("get_environment_name", get_environment_name)
                var auth_token = get_environment_name["AUTH_TOKEN"]
                log.debug("auth_token", auth_token)
                // var ewaybll_download_status_url = get_environment_name["GET_EWAYBILL_DOWNLOAD_STATUS_URL"]
				var ewaybll_get_invoice_url = get_environment_name["GET_INVOICE_URL"]
				log.debug("ewaybll_get_invoice_url",ewaybll_get_invoice_url)
				
				
                // var url = 'https://api-sandbox.clear.in/einv/v2/eInvoice/get?irn=' + ctax_einvoice_irn;
                var url = ewaybll_get_invoice_url+ctax_einvoice_irn;
                //log.debug("url", url)
                var headers = {
                     "X-Cleartax-Auth-Token": auth_token,
                    "gstin": subsidiary_obj_gstnum,
                    "Content-Type": "application/json",
                    "accept": "application/json",
                }

            	var response_irn = https.get({   // return the response and request
					url: url,
					headers: headers
				});
                log.debug({
                    title: 'response.code',
                    details: response_irn.code
                });
                log.debug({
                    title: 'response.body',
                    details: response_irn.body
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
                    // location.reload();

                


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