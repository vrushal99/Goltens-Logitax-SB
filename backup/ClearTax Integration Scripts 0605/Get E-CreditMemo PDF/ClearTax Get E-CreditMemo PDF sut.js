/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax Get E-CreditMemo PDF sut
		Author 			:  	NVT Employee
		Date            :   24-05-2022
		Description		:   1. This Script is created for E-CreditMemo Print.
		                    This script is invoked through E-CreditMemo print button. Then request is sent for PDF print and we will receive response, so that we can generate PDF.

------------------------------------------------------------------------------------------------*/
/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
// START SUITELET FUNCTION  =====================================================================
define(['N/ui/serverWidget', 'N/search', 'N/file', 'N/encode', 'N/format', 'N/url', 'N/config', 'N/xml', 'N/render', 'N/record', 'N/https', 'N/redirect','N/runtime','/SuiteScripts/ClearTax Integration Scripts/ClearTax Library File.js'],
	function(serverWidget, search, file, encode, format, url, config, xmlobj, render, record, https,redirect,runtime,ClearTax_Library_File) {
		//Begin: onRequest functionality
		function onRequest(context) {
			try {
				var getRecType = context.request.parameters.custpage_recType; // return the record type
				log.debug("getRecType", getRecType)
				var getRecId = context.request.parameters.custpage_recId; // return the current record id
				log.debug("getRecId", getRecId)
				var creditmemo_obj = record.load({  // return the record obj
					type: getRecType,
					id: getRecId,
					isDynamic: true
				});
				var subsidiaryId = creditmemo_obj.getValue({
					fieldId: 'subsidiary'
				});
				var irns = creditmemo_obj.getValue({
					fieldId: 'custbody_ctax_creditnote_irn'
				});
				log.debug("irns", irns)
				if (subsidiaryId) {
					var subsidiary_obj = record.load({  // return the subsidiary record obj
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

				//var _url = "http://einvoicing.internal.cleartax.co/v2/eInvoice/download?irns=" + irns
				var _url = print_einvoice_url + "irns=" + irns // return the url in Dynamicly
				log.debug("_url", _url)
				var headerObj = {
					"X-Cleartax-Auth-Token": auth_token,  // return the Auth-Token in Dynamicly
					// "owner_id": '9abeb2db-955c-49c6-99b9-e2589314896b',//08.04.2024 - commented
					"gstin": subsidiary_obj_gst_no, // return the gst no in Dynamicly
					// "x-cleartax-product": 'EInvoice',//08.04.2024 - commented
					"Content-Type": "application/pdf"
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
				var fileObj = file.create({           // create response to pdf
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
				var file_id = fileObj.save();  // save the file in filecabinet
				log.debug("file_id", file_id);
				var paramfileId = false;
				if (file_id) {
					paramfileId = true
					creditmemo_obj.setValue({
						fieldId: 'custbody_ctax_ecreditnote_print',
						value : file_id
					    });					
			    var recordId = creditmemo_obj.save({   // return the save record Id
				enableSourcing: true,
				ignoreMandatoryFields: true
			    });
				log.debug("recordId", recordId);				
				}
				   redirect.toRecord({
					type: getRecType,
					id: getRecId,
					parameters: {
					'custparam_fileId':paramfileId
					}
				});
				

			} catch (ex) {
				log.debug("error", ex)

			}
		}
        //End: onRequest functionality
		
		//Begin: _logValidation functionality
		function _logValidation(value) {
			if (value != 'null' && value != '' && value != undefined && value != 'NaN') {
				return true;
			} else {
				return false;
			}
		}
        //End: _logValidation functionality
		
		//Begin: _nullValidation functionality
		function _nullValidation(val) {
			if (val == null || val == undefined || val == '' || val.toString() == "undefined" || val.toString() == "NaN" || val.toString() == "null") {
				return true;
			} else {
				return false;
			}
		}
        //End: _nullValidation functionality
		
		return {
			onRequest: onRequest
		}
	});
// END SUITELET FUNCTION  ============================================================================