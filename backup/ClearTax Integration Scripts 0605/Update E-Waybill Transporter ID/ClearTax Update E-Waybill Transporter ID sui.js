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
                var invoice_obj = record.load({   // return the record obj
                    type: getRecType,
                    id: getRecId,
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
                    // log.debug("gst_number", gst_number)
                }
				 var ctax_ewaybill_transporterid = invoice_obj.getValue({
                    fieldId: 'custbody_ctax_trans_gstn_no'
                });

                var ctax_ewaybill_number = invoice_obj.getValue({
                    fieldId: 'custbody_ctax_ewb_number'
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
                // var ewaybll_download_status_url = get_environment_name["GET_EWAYBILL_DOWNLOAD_STATUS_URL"]
				var ewaybll_update_transportid_url = get_environment_name["UPDATE_EWAYBILL_TRANSPORTER_ID_URL"]
				log.debug("ewaybll_update_transportid_url",ewaybll_update_transportid_url)

				 if (nullCheck(ctax_ewaybill_transporterid) && nullCheck(ctax_ewaybill_number)) {

                    // var _url = "https://api-sandbox.clear.in/einv/v1/ewaybill/update?action=UPDATE_TRANSPORTER_ID"; 
					var _url = ewaybll_update_transportid_url;

                    var headerObj = {
						"X-Cleartax-Auth-Token": auth_token,
                        "gstin": gst_number,
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    }
                    var body_data =
                    {
                        "EwbNumber": ctax_ewaybill_number,
                        "TransporterId": ctax_ewaybill_transporterid
                    };

                    var response = https.post({
                        body: JSON.stringify(body_data),
                        url: _url,
                        headers: headerObj
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

                        var parseObdy_updated_date = parseObdy.UpdatedDate;

                        invoice_obj.setValue({
                            fieldId: 'custbody_ctax_web_update_trans_id_res',
                            value: response.body
                        });

                        if (nullCheck(parseObdy_updated_date)) {

                            // var dateformat_updated_date = new Date(String(parseObdy_updated_date));

                            var formattedTime_updated_date = format.parse({
                                value: parseObdy_updated_date,
                                type: format.Type.DATETIME,
                                timezone: format.Timezone.ETC_GMT_MINUS_1
                            });

                            log.debug('formattedTime_updated_date', formattedTime_updated_date);

                            invoice_obj.setValue({
                                fieldId: 'custbody_ctax_update_trans_id_date',
                                value: formattedTime_updated_date
                            });

                        }
                    }
					else{
						 invoice_obj.setValue({
                            fieldId: 'custbody_ctax_web_update_trans_id_res',
                            value: response.body
                        });
					}
                }

                var recordId = invoice_obj.save({
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