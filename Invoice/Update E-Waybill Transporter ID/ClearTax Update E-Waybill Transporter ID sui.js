/*----------------------------------------------------------------------------------------------
        Company Name 	:	Nuvista Technologies Pvt Ltd
        Script Name 	:	ClearTax Update EWaybil Transport ID sui
        Author 			:  	NVT Employee
        Date            :   08-07-2024
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
                // log.debug("getRecId", getRecId)
                var invoice_obj = record.load({   // return the record obj
                    type: getRecType,
                    id: getRecId,
                    isDynamic: true
                });
                var gst_number = gstNoFromSubsidiaryOrCompanyInfo(invoice_obj);

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
                log.debug("ewaybll_update_transportid_url", ewaybll_update_transportid_url)
                var get_client_code = get_environment_name["CLIENT_CODE"]
                var get_user_code = get_environment_name["USER_CODE"]
                var get_password = get_environment_name["PASSWORD"]

                if (nullCheck(ctax_ewaybill_transporterid) && nullCheck(ctax_ewaybill_number)) {

                    // var _url = "https://api-sandbox.clear.in/einv/v1/ewaybill/update?action=UPDATE_TRANSPORTER_ID"; 
                    var _url = ewaybll_update_transportid_url;

                    var headerObj = {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    }
                    var body_data =
                    {
                        "CLIENTCODE": get_client_code,
                        "USERCODE": get_user_code,
                        "PASSWORD": get_password,
                        "transporteridlist": [
                            {
                                "ewbNo": ctax_ewaybill_number,
                                "transporterId": ctax_ewaybill_transporterid
                            }
                        ]
                    };

                    var response = https.post({
                        body: JSON.stringify(body_data),
                        url: _url,
                        headers: headerObj
                    });
                    log.debug('body_data', JSON.stringify(body_data));
                    log.debug('response.code', response.code);
                    log.debug('response.body', response.body);

                    invoice_obj.setValue({
                        fieldId: 'custbody_logitax_tranporter_id_request',
                        value: JSON.stringify(body_data)
                    });

                    if (response.code == 200) {

                        var IrnResponse = JSON.parse(response.body)

                        var error = IrnResponse[0]["flag"];
                        log.debug("error", error)

                        invoice_obj.setValue({
                            fieldId: 'custbody_ctax_web_update_trans_id_res',
                            value: response.body
                        });

                        if (error == "true" || error == true) {

                            var parseObdy_updated_date = IrnResponse[0]["transUpdateDate"];
                            log.debug("parseObdy_updated_date", parseObdy_updated_date)

                            if (nullCheck(parseObdy_updated_date)) {

                                invoice_obj.setValue({
                                    fieldId: 'custbody_ctax_update_trans_id_date',
                                    value: String(parseObdy_updated_date)
                                });

                            }
                        }
                    }
                        else {
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