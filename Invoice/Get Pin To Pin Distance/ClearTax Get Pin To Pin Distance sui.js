/*----------------------------------------------------------------------------------------------
        Company Name 	:	Nuvista Technologies Pvt Ltd
        Script Name 	:	ClearTax Get Pin To Pin Distance sui
        Author 			:  	NVT Employee
        Date            :   10-07-2024
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
                var getRecType = context.request.parameters.custpage_recType; // return the record type
                // log.debug("getRecType", getRecType)
                var getRecId = context.request.parameters.custpage_recId; // return the current record id
                // log.debug("getRecId", getRecId)
                var loadRecord = record.load({ // return the record obj
                    type: getRecType,
                    id: getRecId,
                    isDynamic: true
                });

                var locationId = loadRecord.getValue({
                    fieldId: 'location'
                });
                if (nullCheck(locationId)) {
                    var location_obj = record.load({ // get the location obj
                        type: 'location',
                        id: locationId,
                        isDynamic: true
                    });

                    var location_subrecord = location_obj.getSubrecord({
                        fieldId: 'mainaddress'
                    });

                    var location_pincode = location_subrecord.getValue({
                        fieldId: 'zip'
                    });
                    log.debug('location_pincode', location_pincode);
                }

                var shipping_obj = shippingAdressDetails(getRecId)
                var shipToAddressZip = shipping_obj.shipToAddressZip;
                
                var subsidiary_obj_gstnum = gstNoFromSubsidiaryOrCompanyInfo(loadRecord);

                var accountId = runtime.accountId; // return the accountId
                var environment = runtime.envType; // PRODUCTION, SANDBOX, etc.
                // log.debug("environment", environment)
                var Configuration_data = ClearTax_Library_File.ClearTax_Einvoice_library()
                // log.debug("Configuration_data", Configuration_data)
                var get_environment_name = Configuration_data[environment]
                // log.debug("get_environment_name", get_environment_name)
                var get_pin_distance_url = get_environment_name["GET_PIN_TO_PIN_DISTANCE_URL"]
                log.debug("get_pin_distance_url", get_pin_distance_url)
                var get_client_code = get_environment_name["CLIENT_CODE"]
                var get_user_code = get_environment_name["USER_CODE"]
                var get_password = get_environment_name["PASSWORD"]

                var url = get_pin_distance_url;
                // log.debug("url", url)

                var headers = {
                    "Content-Type": "application/json",
                    "accept": "application/json",
                }

                var body_data = {
                    "USERCODE": get_user_code,
                    "CLIENTCODE": get_client_code,
                    "PASSWORD": get_password,
                    "topincode": shipToAddressZip,
                    "frompincode": location_pincode
                }

                log.debug('body_data', JSON.stringify(body_data));

                loadRecord.setValue({
                    fieldId: 'custbody_logitax_pin_pin_dis_request',
                    value: JSON.stringify(body_data)
                });

                var response_irn = https.post({
                    url: url,
                    body: JSON.stringify(body_data),
                    headers: headers,
                });

                log.debug('response.code', response_irn.code);
                log.debug('response.body', response_irn.body);


                loadRecord.setValue({
                    fieldId: 'custbody_logitax_pin_pin_dis_response',
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

            } catch (ex) {
                log.debug("error in onRequest() function", ex.toString());

            }
        }

        function shippingAdressDetails(recID) {
			var shipToAddressLine1 = ""
			var shipToAddressLine2 = ""
			var shipToAddressCity = ""
			var shipToAddressZip = ""
			var shipToAddressState = ""
			var shipToAddressee = ""

			var obj = {};
			var invoiceSearchObj = search.create({
				type: "invoice",
				filters: [
					["type", "anyof", "CustInvc"],
					"AND",
					["mainline", "is", "T"],
					"AND",
					["internalid", "anyof", recID]
				],
				columns: [
					search.createColumn({
						name: "shipaddress",
						label: "Shipping Address"
					}),
					search.createColumn({
						name: "shipaddress1",
						label: "Shipping Address 1"
					}),
					search.createColumn({
						name: "shipaddress2",
						label: "Shipping Address 2"
					}),
					search.createColumn({
						name: "shipcity",
						label: "Shipping City"
					}),
					search.createColumn({
						name: "shipcountry",
						label: "Shipping Country"
					}),
					search.createColumn({
						name: "shipphone",
						label: "Shipping Phone"
					}),
					search.createColumn({
						name: "shipstate",
						label: "Shipping State/Province"
					}),
					search.createColumn({
						name: "shipzip",
						label: "Shipping Zip"
					}),
					search.createColumn({
						name: "shipname",
						label: "Shipping Label"
					}),
					search.createColumn({
						name: "shipaddressee",
						label: "Shipping Addressee"
					})//CR:10.06.2024 - getting shipto addressee
				]
			});
			var searchResultCount = invoiceSearchObj.runPaged().count;
			//log.debug("invoiceSearchObj result count", searchResultCount);
			invoiceSearchObj.run().each(function (result) {
				shipToAddressLine1 = result.getValue("shipaddress1")
				shipToAddressLine2 = result.getValue("shipaddress2")
				shipToAddressCity = result.getValue("shipcity")
				shipToAddressZip = result.getValue("shipzip")
				shipToAddressState = result.getValue("shipstate")
				shipToAddressee = result.getValue('shipaddressee') //CR:10.06.2024 - getting shipto addressee

				return true;
			});
			obj.shipToAddressLine1 = shipToAddressLine1;
			obj.shipToAddressLine2 = shipToAddressLine2;
			obj.shipToAddressCity = shipToAddressCity;
			obj.shipToAddressZip = shipToAddressZip;
			obj.shipToAddressState = shipToAddressState;
			obj.shipToAddressee = shipToAddressee; //CR:10.06.2024 - getting shipto addressee

			return obj;
		}

        function nullCheck(value) {
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