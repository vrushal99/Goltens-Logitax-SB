/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax Library File	
		Author 			:  	NVT Employee 
		Date            :   01-07-2024
		Description		:   1.This Script is get the data from Cleartax E-invoice Configuration record
------------------------------------------------------------------------------------------------*/
/**
 *ClearTax Library File.js
 *@NApiVersion 2.1
 *@NModuleScope Public
 */
define(['N/record', 'N/file', 'N/config', 'N/xml', 'N/search', 'N/render', 'N/format', 'N/task', 'N/http', 'N/runtime', 'N/https',],
	function (record, file, config, xml, search, render, format, task, http, runtime, https) {
		//Begin: ClearTax_Einvoice_library functionality
		function ClearTax_Einvoice_library() {
			var lib_obj = {}  // create obj to get the data
			var _ctax_einvoice_configurationSearchObj = search.create({
				type: "customrecord_ctax_einvoice_configuration",
				filters: [
					["isinactive", "is", "F", null, '']
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
					}),
					search.createColumn({
						name: "custrecord_ctax_einvoice_url",
						label: "GET E-INVOICE URL"
					}),
					search.createColumn({
						name: "custrecord_ctax_rege_ewb_url",
						label: "REGENERATED EWB URL"
					}),
					search.createColumn({
						name: "custrecord_ctax_gener_ewb_url",
						label: "GENERATED EWB URL"
					}),
					search.createColumn({
						name: "custrecord_ctax_ewaybill_printfolderid",
						label: "GET E-waybill Folderid"
					}),
					search.createColumn({
						name: "custrecord_ctax_ewb_download_sta_rul",
						label: "GET E-WAYBILL DOWNLOAD STATUS URL"
					}),
					search.createColumn({
						name: "custrecord_ctax_multiveh_web_",
						label: "GET MULTI-VEHICLE E_WAYBILL URL"
					}),
					search.createColumn({
						name: "custrecord_ctax_ewb_cancel_url",
						label: "CANCEL EWAYBILL URL"
					}),
					search.createColumn({
						name: "custrecord_ctax_ewb_get_pdf_url",
						label: "GET EWAYBILL PDF URL"
					}),
					search.createColumn({
						name: "custrecord_ctax_ewb_gener_irn_url",
						label: "GENERATE EWAYBILL BY IRN URL"
					}),
					search.createColumn({
						name: "custrecord_ctax_ewb_get_conso_pdf_url",
						label: "GET CONSOLIDATED EWB PDF URL"
					}),
					search.createColumn({
						name: "custrecord_ctax_ewb_update_partb_url",
						label: "UPDATE EWAYBILL PART-B URL"
					}),
					search.createColumn({
						name: "custrecord_ctax_ewb_update_trans_id_url",
						label: "UPDATE EWAYBILL TRANSPORTER ID URL"
					}),
					search.createColumn({
						name: "custrecord_ctax_print_template",
						label: "PRINT TEMPLATE"
					}),
					search.createColumn({
						name: "custrecord_ctax_client_code",
						label: "CLIENT CODE"
					}),
					search.createColumn({
						name: "custrecord_ctax_user_code",
						label: "USER CODE"
					}),
					search.createColumn({
						name: "custrecord_ctax_password",
						label: "PASSWORD"
					}),
					search.createColumn({
						name: "custrecord_ctax_get_ewb_det_by_irn_url",
						label: "GET EWAY BILL DETAILS BY IRN"
					}),
					search.createColumn({
						name: "custrecord_ctax_cancel_ewaybill_and_irn_",
						label: "CANCEL EWAY BILL AND IRN URL"
					}),
					search.createColumn({
						name: "custrecord_ctax_get_irn_by_doc_number_ur",
						label: "GET IRN DETAILS BY DOCUMENT NUMBER URL"
					}),
					search.createColumn({
						name: "custrecord_ctax_get_decrypt_signed_qr_co",
						label: "GET DECRYPTED SIGNED QR CODE URL"
					}),
					search.createColumn({
						name: "custrecord_ctax_get_ewaybill_by_number_u",
						label: "GET EWAY BILL BY NUMBER"
					}),
					search.createColumn({
						name: "custrecord_ctax_extend_ewaybill_validity",
						label: "EXTEND EWAY BILL VALIDITY"
					}),
					search.createColumn({
						name: "custrecord_ctax_generate_consolidated_ew",
						label: "CONSOLIDATE EWAY BILL API"
					}),
					search.createColumn({
						name: "custrecord_ctax_get_gstin_details_url",
						label: "GET GSTIN DETAILS"
					}),
					search.createColumn({
						name: "custrecord_ctax_get_hsn_details_url",
						label: "GET HSN DETAILS"
					}),
					search.createColumn({
						name: "custrecord_ctax_pin_to_pin_distance_url",
						label: "GET PIN TO PIN DISTANCE"
					}),
					search.createColumn({
						name: "custrecord_ctax_get_transporter_details_",
						label: "GET TRANSPORTER DETAILS"
					}),
				]
			});
			var searchResultCount = _ctax_einvoice_configurationSearchObj.runPaged().count;
			log.debug("_ctax_einvoice_configurationSearchObj result count", searchResultCount);
			_ctax_einvoice_configurationSearchObj.run().each(function (result) {
				lib_obj[result.getValue("name")] = {
					NAME: result.getValue("name"),
					GENERATE_IRN_URL: result.getValue("custrecord_ctax_einvoice_generate_irnurl"),
					CANCEL_IRN_URL: result.getValue("custrecord_ctax_einvoice_cancel_irnurl"),
					PRINT_E_INVOICE_URL: result.getValue("custrecord_ctax_einvoice_printinvoiceurl"),
					EWAYBILL_URL: result.getValue("custrecord_ctax_einvoice_ewaybillurl"),
					PRINT_EINVOICE_FOLDER_ID: result.getValue("custrecord_ctax_einvoice_printfolderid"),
					HOST_NAME: result.getValue("custrecord_ctax_einvoice_host_name"),
					AUTH_TOKEN: result.getValue("custrecord_ctax_einvoice_authtoken"),
					GET_INVOICE_URL: result.getValue("custrecord_ctax_einvoice_url"),
					REGENERATE_CONSOLIDATED_EWB_URL: result.getValue("custrecord_ctax_rege_ewb_url"),
					GENERATE_CONSOLIDATED_EWB_URL: result.getValue("custrecord_ctax_gener_ewb_url"),
					PRINT_EWAYBILL_FOLDER_ID: result.getValue("custrecord_ctax_ewaybill_printfolderid"),
					GET_EWAYBILL_DOWNLOAD_STATUS_URL: result.getValue("custrecord_ctax_ewb_download_sta_rul"),
					GET_MULTIVEHICLE_EWAYBILL_URL: result.getValue("custrecord_ctax_multiveh_web_"),
					CANCEL_EWAYBILL_URL: result.getValue("custrecord_ctax_ewb_cancel_url"),
					GET_EWAYBILL_PDF_URL: result.getValue("custrecord_ctax_ewb_get_pdf_url"),
					GENERATE_EWAYBILL_BY_IRN_URL: result.getValue("custrecord_ctax_ewb_gener_irn_url"),
					GET_CONSOLIDATED_EWB_PDF_URL: result.getValue("custrecord_ctax_ewb_get_conso_pdf_url"),
					UPDATE_EWAYBILL_PARTB_URL: result.getValue("custrecord_ctax_ewb_update_partb_url"),
					UPDATE_EWAYBILL_TRANSPORTER_ID_URL: result.getValue("custrecord_ctax_ewb_update_trans_id_url"),
					IRN_PRINT_TEMPLATE: result.getValue("custrecord_ctax_print_template"),
					CLIENT_CODE: result.getValue("custrecord_ctax_client_code"),
					USER_CODE: result.getValue("custrecord_ctax_user_code"),
					PASSWORD: result.getValue("custrecord_ctax_password"),
					GET_EWAYBILL_BY_IRN_URL: result.getValue("custrecord_ctax_get_ewb_det_by_irn_url"),
					CANCEL_EWAYBILL_AND_IRN_URL: result.getValue("custrecord_ctax_cancel_ewaybill_and_irn_"),
					GET_IRN_BY_DOC_NUM_URL: result.getValue("custrecord_ctax_get_irn_by_doc_number_ur"),
					GET_DECRYPTED_SIGNED_QR_CODE_URL: result.getValue("custrecord_ctax_get_decrypt_signed_qr_co"),
					GET_EWAYBILL_BY_NUMBER_URL: result.getValue("custrecord_ctax_get_ewaybill_by_number_u"),
					Extend_Eway_Bill_Validity_URL: result.getValue("custrecord_ctax_extend_ewaybill_validity"),
					Consolidate_E_way_Bill_API_URL: result.getValue("custrecord_ctax_generate_consolidated_ew"),
					GET_GSTIN_DETAILS_URL: result.getValue("custrecord_ctax_get_gstin_details_url"),
					GET_HSN_DETAILS_URL: result.getValue("custrecord_ctax_get_hsn_details_url"),
					GET_PIN_TO_PIN_DISTANCE_URL: result.getValue("custrecord_ctax_pin_to_pin_distance_url"),
					GET_TRANSPORTER_DETAILS_URL: result.getValue("custrecord_ctax_get_transporter_details_"),

				}

				return true;
			});

			return lib_obj

		}
		//End: ClearTax_Einvoice_library functionality
		return {
			ClearTax_Einvoice_library: ClearTax_Einvoice_library
		}
	})