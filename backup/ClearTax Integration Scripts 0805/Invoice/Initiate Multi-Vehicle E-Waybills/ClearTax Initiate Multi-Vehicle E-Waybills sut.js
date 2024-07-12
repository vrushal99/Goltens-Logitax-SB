/*----------------------------------------------------------------------------------------------
    Company Name :  Nuvista Technologies Pvt Ltd
    Script Name : 	ClearTax Regenerate Consolidated EWB sui
    Author : 		NVT Employee
    Date : 			22/04/2024
    description : 	

------------------------------------------------------------------------------------------------*/

/**
 * @NApiVersion 2.1
 * @NScriptType suitelet
 */
define(['N/search', 'N/record', 'N/ui/serverWidget', 'N/http', 'N/url', 'N/redirect', 'N/xml', 'N/runtime', 'N/ui/dialog', 'N/https', 'N/format', '/SuiteScripts/ClearTax Integration Scripts/ClearTax Library File.js'], function (search, record, serverWidget, http, url, redirect, xml, runtime, dialog, https, format, ClearTax_Library_File) {

    function onRequest(context) {

        try {

            if (context.request.method === 'GET') {
				var getRecType = context.request.parameters.custpage_recType;  // return the record type
				var getRecId = context.request.parameters.custpage_recId;  // return the current record id
				var Invoice_obj = record.load({   // return the record obj
					type: getRecType,
					id: getRecId,
					isDynamic: true
				});
				var itemlineCount = Invoice_obj.getLineCount({ sublistId:'item'});
				var total_quantity = 0;
				if(nullCheck(itemlineCount)){
					for(var j=0;j<itemlineCount;j++){
						Invoice_obj.selectLine({ sublistId: 'item',line:j });
						var quantity = Invoice_obj.getCurrentSublistValue({sublistId: 'item',fieldId: 'quantity'});
						total_quantity = Number(total_quantity)	+ Number(quantity);
					}
					
				}
				log.debug("total_quantity",total_quantity);
				var ewb_number = Invoice_obj.getValue({fieldId: 'custbody_ctax_ewb_number'});
				var form = serverWidget.createForm({title: 'Initiate Multi-Vehicle E-Waybills'});
				var invoice_details = get_invoice_details_search(getRecId);
				log.debug("invoice_details::::::::::",invoice_details);
                var sublist = createSublist(form);

                var ewbNumber = form.addField({
                    id: 'custpage_ctax_ewb_number',
                    type: serverWidget.FieldType.TEXT,
                    label: 'EWB Number'
                });
                ewbNumber.defaultValue = ewb_number;
				ewbNumber.updateDisplayType({
					displayType: serverWidget.FieldDisplayType.DISABLED
				});
				
				var invoiceId = form.addField({
                    id: 'custpage_ctax_invoice_id',
                    type: serverWidget.FieldType.TEXT,
                    label: 'EWB Number'
                });
                invoiceId.defaultValue = getRecId;
				invoiceId.updateDisplayType({
					displayType: serverWidget.FieldDisplayType.HIDDEN
				});

                var fromPlace = form.addField({
                    id: 'custpage_ctax_from_place',
                    type: serverWidget.FieldType.TEXT,
                    label: 'From Place'
                });
				
				fromPlace.defaultValue = invoice_details.FromPlace;
				fromPlace.updateDisplayType({
					displayType: serverWidget.FieldDisplayType.DISABLED
				});
                var fromState = form.addField({
                    id: 'custpage_ctax_from_state',
                    type: serverWidget.FieldType.TEXT,
                    label: 'From State'
                });
				fromState.defaultValue = invoice_details.FromState;
				fromState.updateDisplayType({
					displayType: serverWidget.FieldDisplayType.DISABLED
				});
				var toPlace = form.addField({
                    id: 'custpage_ctax_to_place',
                    type: serverWidget.FieldType.TEXT,
                    label: 'To Place'
                });
				toPlace.defaultValue = invoice_details.ToPlace;
				toPlace.updateDisplayType({
					displayType: serverWidget.FieldDisplayType.DISABLED
				});
				var toState = form.addField({
                    id: 'custpage_ctax_to_state',
                    type: serverWidget.FieldType.TEXT,
                    label: 'To State'
                });
				
				toState.defaultValue = invoice_details.ToState;
				toState.updateDisplayType({
					displayType: serverWidget.FieldDisplayType.DISABLED
				});
                var regenerateReasonCode = form.addField({
                    id: 'custpage_ctax_reason_code',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Reason Code',
                    source: 'customlist_ctax_regen_con_ewb_res_code'
                });
                regenerateReasonCode.isMandatory = true;

                var regenerateReasonRemark = form.addField({
                    id: 'custpage_ctax_rege_reason_remark',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Reason Remark'
                });
				
				// regenerateReasonRemark.isMandatory = true;
				
				log.debug('invoice_details.TransMode', invoice_details.TransMode);

                var transportMode = form.addField({
                    id: 'custpage_ctax_trans_mode',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Transport Mode',
                });
				transportMode.defaultValue = invoice_details.TransMode;
				transportMode.updateDisplayType({
					displayType: serverWidget.FieldDisplayType.HIDDEN
				});

				var transportModeText = form.addField({
                    id: 'custpage_ctax_trans_mode_text',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Transport Mode',
                });
				transportModeText.defaultValue = invoice_details.TransModeStr;
				transportModeText.updateDisplayType({
					displayType: serverWidget.FieldDisplayType.DISABLED
				});

				// transportMode.isMandatory = true;
				var totalQuantity = form.addField({
                    id: 'custpage_ctax_total_quantity',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Total Quantity'
                });
				totalQuantity.defaultValue = total_quantity;
				totalQuantity.updateDisplayType({
					displayType: serverWidget.FieldDisplayType.DISABLED
				});
				// totalQuantity.isMandatory = true;
				var uom = form.addField({
                    id: 'custpage_ctax_uom',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Unit of measurement'
                });
				uom.defaultValue = invoice_details.UnitOfMeasurement;
				uom.updateDisplayType({
					displayType: serverWidget.FieldDisplayType.DISABLED
				});
				// uom.isMandatory = true;
				 var groupNumber = form.addField({
                    id: 'custpage_ctax_group_number',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Group number'
                });
				groupNumber.defaultValue = 0;
				groupNumber.updateDisplayType({
					displayType: serverWidget.FieldDisplayType.DISABLED
				});
				// groupNumber.isMandatory = true;
                form.addSubmitButton({
                    id: "custpage_ctax_submit",
                    label: 'Submit'
                });
				form.clientScriptModulePath = './ClearTax Initiate Multi-Vehicle E-Waybills cli.js';

                context.response.writePage(form);
            }

				else {
					try{
						//log.debug("context::::::::::::::::::",context);
						var ewbNumber = context.request.parameters.custpage_ctax_ewb_number;
						var fromPlace = context.request.parameters.custpage_ctax_from_place;
						var fromState = context.request.parameters.custpage_ctax_from_state;
						var toPlace = context.request.parameters.custpage_ctax_to_place;
						var toState = context.request.parameters.custpage_ctax_to_state;
						var regenerateReasonCode = context.request.parameters.custpage_ctax_reason_code;
						var regenerateReasonRemark = context.request.parameters.custpage_ctax_rege_reason_remark;
						var transportMode = context.request.parameters.custpage_ctax_trans_mode;
						var totalQuantity = context.request.parameters.custpage_ctax_total_quantity;
						var uom = context.request.parameters.custpage_ctax_uom;
						var groupNumber = context.request.parameters.custpage_ctax_group_number;
						var invoiceId = context.request.parameters.custpage_ctax_invoice_id;
						
							
					   var regenerate_reason_code_text = '';

							if (nullCheck(regenerateReasonCode)) {

								if (regenerateReasonCode == 1) { 

									regenerate_reason_code_text = 'BREAKDOWN'
								}
								else if (regenerateReasonCode == 2) { 

									regenerate_reason_code_text = 'TRANSSHIPMENT'
								}
								else if (regenerateReasonCode == 3) { 

									regenerate_reason_code_text = 'OTHERS'
								}
								else if (regenerateReasonCode == 4) { 

									regenerate_reason_code_text = 'FIRST_TIME'
								}
								else if (regenerateReasonCode == 5) {

									regenerate_reason_code_text = 'NATURAL_CALAMITY'
								}
								else if (regenerateReasonCode == 6) { 

									regenerate_reason_code_text = 'LAW_ORDER_SITUATION'
								}
								else if (regenerateReasonCode == 7) { 

									regenerate_reason_code_text = 'ACCIDENT'
								}
							}
							log.debug("regenerate_reason_code_text", regenerate_reason_code_text)
						var vehicle_detailsarr = [];

						var lineCount = context.request.getLineCount('custpage_ctax_vehicle_list');
						
						
						var line_lvl_quantity = 0;
						for (var line = 0; line < lineCount; line++) {

								var vehicle_number_ = context.request.getSublistValue({
									group: 'custpage_ctax_vehicle_list',
									name: 'custpage_ctax_vehicle_number',
									line: line
								});
								log.debug('vehicle_number_', vehicle_number_);

								var trans_doc_number_ = context.request.getSublistValue({
									group: 'custpage_ctax_vehicle_list',
									name: 'custpage_ctax_trans_doc_no',
									line: line
								});

								var trans_doc_date = context.request.getSublistValue({
									group: 'custpage_ctax_vehicle_list',
									name: 'custpage_ctax_doc_date',
									line: line
								});

								var vehicle_quantity = context.request.getSublistValue({
									group: 'custpage_ctax_vehicle_list',
									name: 'custpage_ctax_quantity',
									line: line
								});
								line_lvl_quantity = Number(line_lvl_quantity)+Number(vehicle_quantity);
								vehicle_detailsarr.push({
									VehicleNo: vehicle_number_,
									DocumentNumber: trans_doc_number_,
									DocumentDate: trans_doc_date,
									Quantity: vehicle_quantity,
								});

							
						}
						log.debug("vehicle_detailsarr:::::::", vehicle_detailsarr);
						log.debug("line_lvl_quantity:::::::", line_lvl_quantity);
						
						if(Number(totalQuantity)<Number(line_lvl_quantity)){
							alert("Sum of vehicle quantity below total quantity");
							return true;
						}
						if (nullCheck(transportMode)) {

							 var transport_mode_text = '';

							if (nullCheck(transportMode)) {

								if (transportMode == 1) { //by road

									transport_mode_text = 'ROAD'
								}
								else if (transportMode == 2) { //	By Rail

									transport_mode_text = 'RAIL'
								}
								else if (transportMode == 3) { //	By Air

									transport_mode_text = 'AIR'
								}
								else if (transportMode == 4) { //	By Ship

									transport_mode_text = 'SHIP'
								}
							}
							var Invoice_obj = record.load({
								type: 'invoice',
								id: invoiceId,
								isDynamic: true
							});

							var subsidiaryId = Invoice_obj.getValue({
								fieldId: 'subsidiary'
							});

							if (subsidiaryId) {

								var subsidiary_obj = record.load({
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
							var Configuration_data = ClearTax_Library_File.ClearTax_Einvoice_library()
							var get_environment_name = Configuration_data[environment]
							var auth_token = get_environment_name["AUTH_TOKEN"]
							var HOST_NAME = get_environment_name["HOST_NAME"]
							var print_multivehicle_ewaybill_url = get_environment_name["GET_MULTIVEHICLE_EWAYBILL_URL"]
							// log.debug("regenerate_consolidated_ewb_url", regenerate_consolidated_ewb_url)


							var _url = print_multivehicle_ewaybill_url;
							var headerObj = {
								"X-Cleartax-Auth-Token": auth_token,
								"gstin": subsidiary_obj_gst_no,
								"Content-Type":"application/json",
								"Accept":"application/json"
							}
							var body_data = {
								"EwbNumber": ewbNumber,
								"FromPlace": fromPlace,
								"FromState": fromState,
								"ToPlace": toPlace,
								"ToState": toState,
								"ReasonCode": regenerate_reason_code_text,
								"ReasonRemark": regenerateReasonRemark,
								"TransMode": transport_mode_text,
								"TotalQuantity": totalQuantity,
								"UnitOfMeasurement": uom,
								"GroupNumber": groupNumber
							};
							body_data.VehicleListDetails = vehicle_detailsarr;
							log.debug("body_data:::::::::",body_data);
							var response = https.put({ // return the response and request
								url: _url,
								headers:headerObj,
								body: JSON.stringify(body_data)
							});
						   
							//log.debug("response::::::::",JSON.stringify(response));
							log.debug({
								title: 'response.body eway',
								details: response.body
							});

							
							var responseBodyParse = JSON.parse(response.body);
							log.debug('responseBodyParse', responseBodyParse);
							Invoice_obj.setValue({
								fieldId: 'custbody_ctax_ewb_multiveh_res',value:JSON.stringify(responseBodyParse)
							});
							Invoice_obj.setValue({
								fieldId: 'custbody_ctax_ewb_multiveh_req',value:JSON.stringify(body_data)
							});
							var params_ = ''
							if(response.code == 200){  //if response code got 200 then this code will execute

								if (nullCheck(responseBodyParse.errors) || nullCheck(responseBodyParse.error_message)) { //if errors is coming in response then set only request and response on selected invoices
										//params_ = '&custpage_multi_error'+ responseBodyParse.errors[0].error_message;
										var s_sut_url = url.resolveScript({   // call suitelet script
											scriptId: "customscript_cleartax_multivehicle_esut",
											deploymentId: "customdeploy_cleartax_multivehicle_ebsut"
											});
										s_sut_url += '&custpage_recId=' + invoiceId + '&custpage_recType=invoice&custpage_multi_error='+ responseBodyParse.errors[0].error_message ;
										redirect.redirect({
											url: s_sut_url
										});
										

								}
								else {
									//params_ = '&custpage_multi_success'+JSON.stringify(responseBodyParse);
									for (var v = 0; v < vehicle_detailsarr.length; v++) {
										log.debug("line_date",vehicle_detailsarr[v].DocumentDate);
										var formatted_from = format.parse({value:vehicle_detailsarr[v].DocumentDate, type: format.Type.DATE})
										log.debug("formatted_from",formatted_from);
										Invoice_obj.selectNewLine({sublistId: 'recmachcustrecord_ctax_web_ref_to_inv_rec'});
										Invoice_obj.setCurrentSublistValue({sublistId: 'recmachcustrecord_ctax_web_ref_to_inv_rec',fieldId: 'custrecord_ctax_ewb_vehicle_no',value: vehicle_detailsarr[v].VehicleNo });
										Invoice_obj.setCurrentSublistValue({sublistId: 'recmachcustrecord_ctax_web_ref_to_inv_rec',fieldId: 'custrecord_ctax_ewb_doc_no',value: vehicle_detailsarr[v].DocumentNumber});
										Invoice_obj.setCurrentSublistValue({sublistId: 'recmachcustrecord_ctax_web_ref_to_inv_rec',fieldId: 'custrecord_ctax_ewb_doc_date',value: new Date(formatted_from)});
										Invoice_obj.setCurrentSublistValue({sublistId: 'recmachcustrecord_ctax_web_ref_to_inv_rec',fieldId: 'custrecord_ctax_web_qty',value:   vehicle_detailsarr[v].Quantity});
										Invoice_obj.commitLine({sublistId: 'recmachcustrecord_ctax_web_ref_to_inv_rec'});

									}
									var s_sut_url = url.resolveScript({   // call suitelet script
											scriptId: "customscript_cleartax_multivehicle_esut",
											deploymentId: "customdeploy_cleartax_multivehicle_ebsut"
											});
										s_sut_url += '&custpage_recId=' + invoiceId + '&custpage_recType=invoice&custpage_multi_success='+JSON.stringify(responseBodyParse);
									redirect.redirect({
										url: s_sut_url
									});
									var groupNumber = responseBodyParse.GroupNumber;
									var UpdatedDate = responseBodyParse.UpdatedDate;
									
									Invoice_obj.setValue({
										fieldId: 'custbody_ctax_ewaybill_group_number',value:groupNumber
									});
									// var EwbDateFormatted = format.parse({
										// value: UpdatedDate,
										// type: format.Type.DATETIME,
										// timezone: format.Timezone.ETC_GMT_MINUS_1
									// })
									Invoice_obj.setValue({
										fieldId: 'custbody_ctax_ewb_multiveh_updatedate',
										value: String(UpdatedDate)
									});

									

								}
							}
							else {
								
								context.response.write(JSON.stringify(responseBodyParse))

							}
					
							Invoice_obj.save({
								enableSourcing: true,
								ignoreMandatoryFields: true
							});

						}
					}
					catch (e) {

						log.error('errorororor', e);
					}
				}
        }
        catch (e) {

            log.error('error in onRequest() function', e.toString());
        }
    }

    function createSublist(form) {

        try {

            var sublist = form.addSublist({
                id: 'custpage_ctax_vehicle_list',
                type: serverWidget.SublistType.INLINEEDITOR,
                label: 'Vehicle List Details'
            });
			var vehicle_num = sublist.addField({
                id: 'custpage_ctax_vehicle_number',
                type: serverWidget.FieldType.TEXT,
                label: 'Vehicle Number'
            });
			vehicle_num.isMandatory = true;
			var doc_number = sublist.addField({
                id: 'custpage_ctax_trans_doc_no',
                type: serverWidget.FieldType.TEXT,
                label: 'Document Number'
            });
			doc_number.isMandatory = true;
			var doc_date = sublist.addField({
                id: 'custpage_ctax_doc_date',
                type: serverWidget.FieldType.DATE,
                label: 'Document Date'
            });
			doc_date.isMandatory = true;
			var quantity_ = sublist.addField({
                id: 'custpage_ctax_quantity',
                type: serverWidget.FieldType.TEXT,
                label: 'Quantity'
            });
			quantity_.isMandatory = true;
			
            return sublist;
        }
        catch (e) {

            log.error('error in createSublist() function', e.toString());
        }
    }

     function nullCheck(value) {
        if (value != 'null' && value != '' && value != undefined && value != 'NaN') {
            return true;
        } else {
            return false;
        }
    }
	function get_invoice_details_search(getRecId){
		
		var body_obj = {};
		var ContactSearchLoad = search.load({
			id: 'customsearch_ctax_multiewaybill_tran_dtl'
		});
		var contactColum = ContactSearchLoad.columns;
		ContactSearchLoad.filters.push(search.createFilter({
			name: 'internalid',
			operator: search.Operator.ANYOF,
			values: getRecId
		}))
		var contactSearchResult = ContactSearchLoad.runPaged({
				pageSize: 1000
		});

		for(var contIndex = 0; contIndex < contactSearchResult.pageRanges.length; contIndex++){
				var pageRange = contactSearchResult.pageRanges[contIndex];
				//log.debug('pageRange', pageRange);
				if (pageRange) {
					var currentPage = contactSearchResult.fetch({ index: pageRange.index })
					//log.debug('currentPage', currentPage);
					for (var j = 0; j < currentPage.data.length; j++) {
						var result = currentPage.data[j];
						//log.debug('load>>>>result', result);
						if (result) {
							body_obj.EwbNumber = result.getValue(contactColum[1]);
							body_obj.FromPlace = result.getValue(contactColum[2]);
							var FromState = result.getText(contactColum[3]);
							if(nullCheck(FromState)){
								body_obj.FromState = get_state_gstcode_search(FromState,"");
							}else{
								body_obj.FromState = '';
							}
							
							body_obj.ToPlace = result.getValue(contactColum[4]);
							var ToState = result.getValue(contactColum[5]);
							log.debug("ToState:::::::",ToState);
							if(nullCheck(ToState)){
								body_obj.ToState = get_state_gstcode_search("",ToState);
							}else{
								body_obj.ToState = '';
							}
							body_obj.TransMode = result.getValue(contactColum[8]);
							log.debug('body_obj.TransMode', body_obj.TransMode);
							body_obj.TransModeStr = result.getText(contactColum[8]);
							body_obj.UnitOfMeasurement = result.getValue(contactColum[10]);
							
						}

					}
				}
		}
		return body_obj;
	}
	function get_state_gstcode_search(state_name,sname_){
		log.debug("from satte:::::::",state_name);
		log.debug("to state:::::::",sname_);
		var filter = [];
		if(nullCheck(sname_)){
			var sname = JSON.stringify(sname_);
			var state_name_ = sname.toUpperCase();
			log.debug("state_name_:::::::",state_name_);
			filter.push(["custrecord_state_name_pos","is",JSON.parse(state_name_)])
		}

		if(nullCheck(state_name)){
			filter.push(["name","is",state_name])
		}
		log.debug("filter:::::::",filter);
		
		var state_details = search.create({
							type: 'customrecord_indgst_placeofsupplylist',
							filters: filter,
							columns: [
										search.createColumn({name: "internalid", label: "Internal ID"}),
										  search.createColumn({name: "custrecord_state_name_pos", label: "State Name"}),
										  search.createColumn({name: "custrecord_indgst_pos_gststatecode", label: "GST State Code"}),
										  search.createColumn({name: "name", label: "Name"})

									]
						});
						var state_gst_code = '';
						state_details.run().each(function(results_) {
							state_gst_code = results_.getValue({name: "custrecord_indgst_pos_gststatecode", label: "Copies Released"});
							return true;
						});
						
						log.debug("state_gst_code:::::::",state_gst_code);
						return state_gst_code;
		
	}

   
    return {
        onRequest: onRequest
    };

});
