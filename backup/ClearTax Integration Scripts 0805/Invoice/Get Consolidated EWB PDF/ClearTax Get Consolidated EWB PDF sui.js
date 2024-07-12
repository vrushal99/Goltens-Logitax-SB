/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax Get Consolidated EWB PDF sui
		Author 			:  	NVT Employee
		Date            :   15/04/2024
		Description		:   You can print a consolidated EWB by sending a GET request to E-Invoicing API.

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

				var ctax_ewaybill_consolidated_num = Invoice_obj.getValue({
					fieldId: 'custbody_ctax_con_ewb_no'
				});
				// log.debug("ctax_ewaybill_consolidated_num", ctax_ewaybill_consolidated_num)

				if (nullCheck(ctax_ewaybill_consolidated_num)) {

					var ewaybill_inv_consolidatednum_arr = ewaybill_consolidated_pdf_search(ctax_ewaybill_consolidated_num);
				}


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
				var printfolderid = get_environment_name["PRINT_EWAYBILL_FOLDER_ID"]
				// log.debug("printfolderid", printfolderid)
				var consolidatedEwbPDFURL = get_environment_name["GET_CONSOLIDATED_EWB_PDF_URL"]


				var _url = consolidatedEwbPDFURL + ctax_ewaybill_consolidated_num; // return the url in Dynamicly
				// log.debug("_url", _url)
				var headerObj = {
					"X-Cleartax-Auth-Token": auth_token,
					"gstin": subsidiary_obj_gst_no,
					"Content-Type": "application/pdf",
				}
				var response = https.get({   // return the response and request
					url: _url,
					headers: headerObj
				});
				// log.debug({
				// title: 'response.code',
				// details: response.code
				// });
				// log.debug({
				// title: 'response.body',
				// details: response.body
				// });
				if (response.code == 200) {

					var fileObj = file.create({                        // create response to pdf
						name: 'E-Waybill Consolidated print' + getRecId + '.pdf',
						fileType: file.Type.PDF,
						contents: response.body,
					});
					fileObj.encoding = file.Encoding.UTF_8;

					fileObj.folder = printfolderid;
					var file_id = fileObj.save();    // save the file in filecabinet 
					// log.debug("file_id", file_id);
					var paramfileId = false;
					if (file_id) {
						paramfileId = true
						Invoice_obj.setValue({
							fieldId: 'custbody_ctax_store_con_pdf',
							value: file_id
						});
						var recordId = Invoice_obj.save({      // return the save record Id
							enableSourcing: true,
							ignoreMandatoryFields: true
						});
						// log.debug("recordId", recordId);

						if (nullCheck(ewaybill_inv_consolidatednum_arr)) {

							// log.debug('ewaybill_inv_consolidatednum_arr', ewaybill_inv_consolidatednum_arr);

							for (var arrcnt = 0; arrcnt < ewaybill_inv_consolidatednum_arr.length; arrcnt++) {

								var invInternalId = ewaybill_inv_consolidatednum_arr[arrcnt].invoiceId;

								var consolidatedPDFStore = ewaybill_inv_consolidatednum_arr[arrcnt].consolidatedPdf;

								if (!nullCheck(consolidatedPDFStore)) {

									if (invInternalId != getRecId) { //except current invoice it will update for another invoices

										// log.debug("invInternalId in condition", invInternalId);

										var Invoice_Rec = record.load({
											type: 'invoice',
											id: parseInt(invInternalId),
											isDynamic: true
										});

										Invoice_Rec.setValue({
											fieldId: 'custbody_ctax_store_con_pdf',
											value: file_id
										});

										var recordId = Invoice_Rec.save({
											enableSourcing: true,
											ignoreMandatoryFields: true
										});

									}
								}
							}
						}
					}
				}
				redirect.toRecord({
					type: getRecType,
					id: getRecId,
					parameters: {
						'custparam_fileId': paramfileId
					}
				});


			} catch (ex) {
				log.debug("error", ex)

			}
		}

		function ewaybill_consolidated_pdf_search(ctax_ewaybill_consolidated_num) {

			try {

				var ewaybill_consolidated_search = search.load({
					id: 'customsearch_ctax_get_consoli_ewb_pdf'
				});

				if (nullCheck(ctax_ewaybill_consolidated_num)) {

					ewaybill_consolidated_search.filters.push(
						search.createFilter({
							name: 'custbody_ctax_con_ewb_no',
							operator: 'is',
							values: ctax_ewaybill_consolidated_num
						}));
				}

				var ewaybill_consolidated_search_result = getAllResults(ewaybill_consolidated_search);

				// log.debug('ewaybill_consolidated_search_result', ewaybill_consolidated_search_result);

				var ewaybill_inv_consolidatednum_arr = [];

				for (var invcnt = 0; invcnt < ewaybill_consolidated_search_result.length; invcnt++) {

					var invoiceId = ewaybill_consolidated_search_result[invcnt].getValue({
						name: "internalid", label: "Internal ID"
					});

					var consolidatedPdf = ewaybill_consolidated_search_result[invcnt].getValue({
						name: "custbody_ctax_store_con_pdf", label: "Store Consolidated pdf"
					});

					ewaybill_inv_consolidatednum_arr.push({
						invoiceId: invoiceId,
						consolidatedPdf: consolidatedPdf
					});

				}
				// log.debug('ewaybill_inv_consolidatednum_arr', ewaybill_inv_consolidatednum_arr);

				return ewaybill_inv_consolidatednum_arr;
			}
			catch (e) {

				log.error('error in ewaybill_consolidated_pdf_search() search', e.toString());
			}
		}

		function nullCheck(value) {
			if (value != 'null' && value != '' && value != undefined && value != 'NaN') {
				return true;
			} else {
				return false;
			}
		}

		function getAllResults(s) {
			var results = s.run();
			var searchResults = [];
			var searchid = 0;
			do {
				var resultslice = results.getRange({
					start: searchid,
					end: searchid + 1000
				});
				resultslice.forEach(function (slice) {
					searchResults.push(slice);
					searchid++;
				});
			} while (resultslice.length >= 1000);
			return searchResults;
		}


		return {
			onRequest: onRequest
		}
	});
// END SUITELET FUNCTION  ============================================================================