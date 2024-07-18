/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax Get Consolidated EWB PDF sui
		Author 			:  	NVT Employee
		Date            :   18-07-2024
		Description		:   You can print a consolidated EWB by sending a GET request to E-Invoicing API.

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
				var Invoice_obj = record.load({ // return the record obj
					type: getRecType,
					id: getRecId,
					isDynamic: true
				});

				var ctax_ewaybill_consolidated_num = Invoice_obj.getValue({
					fieldId: 'custbody_ctax_con_ewb_no'
				});
				// log.debug("ctax_ewaybill_consolidated_num", ctax_ewaybill_consolidated_num)

				if (nullCheck(ctax_ewaybill_consolidated_num)) {

					var ewaybill_inv_consolidatednum_arr = ewaybill_consolidated_pdf_search(ctax_ewaybill_consolidated_num);
				}

				var ctax_ewaybill_consolidated_pdf_url = Invoice_obj.getValue({
					fieldId: 'custbody_logitax_con_ewb_pdf_url'
				});

				var accountId = runtime.accountId; // return the accountId
				var environment = runtime.envType; // PRODUCTION, SANDBOX, etc.
				// log.debug("environment", environment)
				var Configuration_data = ClearTax_Library_File.ClearTax_Einvoice_library()
				// log.debug("Configuration_data", Configuration_data)
				var get_environment_name = Configuration_data[environment]
				// log.debug("get_environment_name", get_environment_name)
				var printfolderid = get_environment_name["PRINT_EWAYBILL_FOLDER_ID"]
				// log.debug("printfolderid", printfolderid)

				var headerObj = {
					"Content-Type": "application/pdf",
					"accept": "application/pdf",
				}
				var response = https.get({ // return the response and request
					url: ctax_ewaybill_consolidated_pdf_url,
					headers: headerObj
				});

				log.debug('response.body', response.body);

				var hexEncodedString = encode.convert({
					string: response.body,
					inputEncoding: encode.Encoding.UTF_8,
					outputEncoding: encode.Encoding.BASE_64
				});

				var fileObj = file.create({ // create response to pdf
					name: 'E-Waybill Consolidated print' + getRecId + '.pdf',
					fileType: file.Type.PDF,
					contents: hexEncodedString,
				});
				fileObj.encoding = file.Encoding.UTF_8;

				fileObj.folder = printfolderid;
				var file_id = fileObj.save(); // save the file in filecabinet 
				// log.debug("file_id", file_id);

				if (file_id) {

					Invoice_obj.setValue({
						fieldId: 'custbody_ctax_store_con_pdf',
						value: file_id
					});

					var recordId = Invoice_obj.save({ // return the save record Id
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

				redirect.toRecord({
					type: getRecType,
					id: getRecId,
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
						name: "internalid",
						label: "Internal ID"
					});

					var consolidatedPdf = ewaybill_consolidated_search_result[invcnt].getValue({
						name: "custbody_ctax_store_con_pdf",
						label: "Store Consolidated pdf"
					});

					ewaybill_inv_consolidatednum_arr.push({
						invoiceId: invoiceId,
						consolidatedPdf: consolidatedPdf
					});

				}
				// log.debug('ewaybill_inv_consolidatednum_arr', ewaybill_inv_consolidatednum_arr);

				return ewaybill_inv_consolidatednum_arr;
			} catch (e) {

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