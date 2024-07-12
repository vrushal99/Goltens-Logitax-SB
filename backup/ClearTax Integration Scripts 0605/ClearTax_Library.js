/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax_Einvoice_library	
		Author 			:  	NVT Employee 

------------------------------------------------------------------------------------------------*/
/**
 *ClearTax Library File.js
 *@NApiVersion 2.0
 *@NModuleScope Public
 */
define(['N/record', 'N/file', 'N/config', 'N/xml', 'N/search', 'N/render', 'N/format', 'N/task', 'N/http', 'N/runtime', 'N/https'],
	function(record, file, config, xml, search, render, format, task, http, runtime, https) {
		function ClearTax_Einvoice_library() {
			var lib_obj = {}
			var _ctax_einvoice_configurationSearchObj = search.create({
				type: "customrecord_ctax_einvoice_configuration",
				filters: [
					["isinactive", "is", "F"]
				],
				columns: [
					search.createColumn({
						name: "name",
						sort: search.Sort.ASC,
						label: "Name"
					}),
					search.createColumn({
						name: "custrecord_ctax_einvoice_generate_irnurl",
						label: "Generate IRN URL"
					}),
					search.createColumn({
						name: "custrecord_ctax_einvoice_printfolderid",
						label: "Print E-invoice Folder ID"
					}),
					search.createColumn({
						name: "custrecord_ctax_einvoice_host_name",
						label: "Host Name"
					}),
					search.createColumn({
						name: "custrecord_ctax_einvoice_cancel_irnurl",
						label: "Cancel IRN URL"
					}),
					search.createColumn({
						name: "custrecord_ctax_einvoice_ewaybillurl",
						label: "Ewaybill URL"
					}),
					search.createColumn({
						name: "custrecord_ctax_einvoice_printinvoiceurl",
						label: "Print E-invoice URl"
					}),
					search.createColumn({
						name: "custrecord_ctax_einvoice_authtoken",
						label: "Auth Token"
					})
				]
			});
			var searchResultCount = _ctax_einvoice_configurationSearchObj.runPaged().count;
			log.debug("_ctax_einvoice_configurationSearchObj result count", searchResultCount);
			_ctax_einvoice_configurationSearchObj.run().each(function(result) {
				lib_obj[result.getValue("name")] = {
					NAME: result.getValue("name"),
					GENERATE_IRN_URL: result.getValue("custrecord_ctax_einvoice_generate_irnurl"),
					CANCEL_IRN_URL: result.getValue("custrecord_ctax_einvoice_cancel_irnurl"),
					PRINT_E_INVOICE_URL: result.getValue("custrecord_ctax_einvoice_printinvoiceurl"),
					EWAYBILL_URL: result.getValue("custrecord_ctax_einvoice_ewaybillurl"),
					PRINT_EINVOICE_FOLDER_ID: result.getValue("custrecord_ctax_einvoice_printfolderid"),
					HOST_NAME: result.getValue("custrecord_ctax_einvoice_host_name"),
					AUTH_TOKEN: result.getValue("custrecord_ctax_einvoice_authtoken")
				}

				return true;
			});

			return lib_obj

		}

		return {
			ClearTax_Einvoice_library: ClearTax_Einvoice_library
		}
	})