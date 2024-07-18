/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax Download E-waybills by Others sut
		Author 			:  	NVT Employee
		Date            :   10-05-2022
		Description		:   1. This Script is created for Download E-waybills by Others.
							This script is invoked through Download E-waybills by Others button. Then request is sent for PDF print and we will receive response, so that we can generate PDF.

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
				//log.debug("getRecType", getRecType)
				var getRecId = context.request.parameters.custpage_recId;  // return the current record id
				//log.debug("getRecId", getRecId)
				var Invoice_obj = record.load({   // return the record obj
					type: getRecType,
					id: getRecId,
					isDynamic: true
				});
				var irns = Invoice_obj.getValue({
					fieldId: 'custbody_ctax_ewaybill_irn'
				});
				var ewb_number = Invoice_obj.getValue({
					fieldId: 'custbody_cleartax_ewaybill_number'
				});

				var from_date = Invoice_obj.getValue({
					fieldId: 'custbody_ctax_fromdate_ewb_other'
				});
				log.debug("from_date", from_date)
				var till_date = Invoice_obj.getValue({
					fieldId: 'custbody_ctax_tilldate_ewb_other'
				});
				/*if(!_logValidation() || !_logValidation(till_date)){
					alert("Please enter data for Till Date and From Date");
					return true;
				}*/
				var formatted_from = format.format({ value: from_date, type: format.Type.DATE })
				log.debug("formatted_from", formatted_from)

				var formatted_till = format.format({ value: till_date, type: format.Type.DATE })
				log.debug("formatted_till", formatted_till)

				var subsidiary_obj_gst_no = gstNoFromSubsidiaryOrCompanyInfo(Invoice_obj);

				var accountId = runtime.accountId; // return the accountId
				var environment = runtime.envType; // PRODUCTION, SANDBOX, etc.
				//log.debug("environment", environment)
				var Configuration_data = ClearTax_Library_File.ClearTax_Einvoice_library()
				//log.debug("Configuration_data", Configuration_data)
				var get_environment_name = Configuration_data[environment]
				//log.debug("get_environment_name", get_environment_name)
				var auth_token = get_environment_name["AUTH_TOKEN"]
				//log.debug("auth_token", auth_token)
				var DOWNLOAD_EWAYBILL_BY_OTHERS = get_environment_name["DOWNLOAD_EWAYBILL_BY_OTHERS"]
				//log.debug("print_ewaybill_url", print_ewaybill_url)
				//var printfolderid = get_environment_name["PRINT_EWAYBILL_FOLDER_ID"]
				//log.debug("printfolderid", printfolderid)

				var _url = DOWNLOAD_EWAYBILL_BY_OTHERS// + "template=6e351b87-35b4-48a5-bc5f-d085685410f7&&irns=" + irns  // return the url in Dynamicly
				log.debug("_url", _url);

				var headerObj = {
					"X-Cleartax-Auth-Token": auth_token,
					"gstin": subsidiary_obj_gst_no,
					"Content-Type": "application/json",
					"Accept": "application/json"
				}
				var rawData = {
					"from_date": formatted_from,
					"till_date": formatted_till
				}
				var response = https.post({   // return the response and request
					url: _url,
					headers: headerObj,
					body: JSON.stringify(rawData)

				});
				log.debug("response::::::::", JSON.stringify(response));
				log.debug({
					title: 'response.body by others',
					details: response.body
				});
				log.debug("response.code::::::::", JSON.stringify(response.code));
				if (response.code == 200) {

					var parseObdy = JSON.parse(response.body)
					log.debug("response::::::::", parseObdy.workflow_id);
					// var parseObdy_cancelIrn = parseObdy.irn;
					Invoice_obj.setValue({
						fieldId: 'custbody_ctax_wk_id_ewb_other',
						value: parseObdy.workflow_id
					});
					Invoice_obj.setValue({
						fieldId: 'custbody_ctax_ewb_status_other',
						value: parseObdy.status
					});

				}
				Invoice_obj.setValue({
					fieldId: 'custbody_ctax_ewb_download_other_req',
					value: JSON.stringify(rawData)
				});
				Invoice_obj.setValue({
					fieldId: 'custbody_ctax_ewb_download_other_res',
					value: JSON.stringify(parseObdy)
				});
				var recordId = Invoice_obj.save({      // return the save record Id
					enableSourcing: true,
					ignoreMandatoryFields: true
				});
				log.debug("recordId", recordId);

				redirect.toRecord({
					type: getRecType,
					id: getRecId
				});


			} catch (ex) {
				log.debug("error", ex)

			}
		}

		function _logValidation(value) {
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