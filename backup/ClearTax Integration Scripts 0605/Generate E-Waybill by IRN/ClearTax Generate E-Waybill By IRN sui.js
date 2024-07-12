/*----------------------------------------------------------------------------------------------
    Company Name :  Nuvista Technologies Pvt Ltd
    Script Name : 	ClearTax Generate Consolidated EWB sui
    Author : 		NVT Employee
    Date : 			02/05/2024
    description : 	

------------------------------------------------------------------------------------------------*/

/**
 * @NApiVersion 2.1
 * @NScriptType suitelet
 */
 
define(['N/search', 'N/record', 'N/ui/serverWidget', 'N/http', 'N/url', 'N/redirect', 'N/xml', 'N/runtime', 'N/ui/dialog', 'N/https', 'N/format', '/SuiteScripts/ClearTax Integration Scripts/ClearTax Library File.js'], function (search, record, serverWidget, http, url, redirect, xml, runtime, dialog, https, format, ClearTax_Library_File) {
	 
    function onRequest(context) {
       
      try{
          
           var get_recordId = context.request.parameters.custpage_recId;
              var get_recordType = context.request.parameters.custpage_recType;
              
                var loadRecord = record.load({   // return the record obj
                  type: get_recordType,
                  id: get_recordId,
                  isDynamic: true
              });
          var cleartax_irn = loadRecord.getValue({
              fieldId: 'custbody_ctax_einvoice_irn'
          });
          var transport_distance = loadRecord.getValue({
              fieldId: 'custbody_trans_distance'
          });
          var transport_mode = loadRecord.getValue({
              fieldId: 'custbody_modeofshipping'
          });
          var transport_id = loadRecord.getValue({
              fieldId: 'custbody_ctax_trans_gstn_no'
          });
          var transport_name = loadRecord.getValue({
              fieldId: 'custbody_ctax_trans_name'
          });
          var transport_doc_date = loadRecord.getValue({
              fieldId: 'custbody_trans_doc_date'
          });
          
           if (nullCheck(transport_doc_date)) {

              var month = transport_doc_date.getMonth() + 1
              if (month < 10) {
                  month = "0" + month
              }
              var date = transport_doc_date.getDate()
              if (date < 10) {
                  date = "0" + date
              }
              var formattedtransportdate = date + '/' + month + '/' + transport_doc_date.getFullYear()
              //log.debug("formatteddate", formatteddate)
              formattedtransportdate = String(formattedtransportdate).trim();

          }
          
           var transport_doc_no = loadRecord.getValue({
              fieldId: 'custbody_trans_docno'
          });
          var transport_vehicle_no = loadRecord.getValue({
              fieldId: 'custbody_ctax_vehicle_no'
          });
          var transport_vehicle_type = loadRecord.getText({
              fieldId: 'custbody_vehicle_type'
          });

           var shipping_obj = shippingAdressDetails(get_recordId)
          var shipToAddressLine1 = shipping_obj.shipToAddressLine1
          var shipToAddressLine2 = shipping_obj.shipToAddressLine2;
          var shipToAddressCity = shipping_obj.shipToAddressCity;
          var shipToAddressZip = shipping_obj.shipToAddressZip;
          var shipToAddressState = shipping_obj.shipToAddressState
          //End: get shipping address saved-search functionality
          if (nullCheck(shipToAddressState)) {
              var shipto_satecode_obj = indgst_placeofsupplylistSearchObj(shipToAddressState)
              var shipto_satecode = shipto_satecode_obj.shiptogststatecode
          }
          
          // getting the location value
           var locationId = loadRecord.getValue({
              fieldId: 'location'
          });
          if (nullCheck(locationId)) {
              var location_obj = record.load({ // get the location obj
                  type: 'location',
                  id: locationId,
                  isDynamic: true
              });
              var location_obj_gststatecode = location_obj.getValue({
                  fieldId: 'custrecord_indgst_locatio_gststatecode'
              });
              //log.debug("location_obj_gststatecode", location_obj_gststatecode)
              if (nullCheck(location_obj_gststatecode)) {
                  var lookup_location_obj_gststatecode = search.lookupFields({  // get location record to placeofsupply record get gststatecode
                      type: 'customrecord_indgst_placeofsupplylist',
                      id: location_obj_gststatecode,
                      columns: ['custrecord_indgst_pos_gststatecode']
                  });
                  if (nullCheck(lookup_location_obj_gststatecode)) {
                      var loc_state_code_value = lookup_location_obj_gststatecode.custrecord_indgst_pos_gststatecode;
                  } else {
                      loc_state_code_value = ""
                  }
              }
              var location_subrecord = location_obj.getSubrecord({
                  fieldId: 'mainaddress'
              });
              var location_obj_addr1 = location_subrecord.getValue({
                  fieldId: 'addr1'
              });
              if (location_obj_addr1) {
                  location_obj_addr1 = location_obj_addr1
              } else {
                  location_obj_addr1 = ""
              }
              //log.debug("location_obj_addr1", location_obj_addr1)
              var location_obj_name = location_obj.getValue({
                  fieldId: 'name'
              });
              if (location_obj_name) {
                  location_obj_name = location_obj_name
              } else {
                  location_obj_name = ""
              }
              var location_obj_addr2 = location_subrecord.getValue({
                  fieldId: 'addr2'
              });
              if (location_obj_addr2) {
                  location_obj_addr2 = location_obj_addr2
              } else {
                  location_obj_addr2 = ""
              }
              //log.debug("location_obj_addr2", location_obj_addr2)
              var location_obj_city = location_subrecord.getValue({
                  fieldId: 'city'
              })
              if (location_obj_city) {
                  location_obj_city = location_obj_city
              } else {
                  location_obj_city = ""
              }
              //log.debug("location_obj_city", location_obj_city)
              var location_obj_zip = location_subrecord.getValue({
                  fieldId: 'zip'
              })
              if (location_obj_zip) {
                  location_obj_zip = location_obj_zip
              } else {
                  location_obj_zip = ""
              }

          }
          
          // getting the subsidiary value
          var subsidiaryId = loadRecord.getValue({
              fieldId: 'subsidiary'
          });

          if (subsidiaryId) {
              var subsidiary_obj = record.load({  // get subsidiary obj
                  type: 'subsidiary',
                  id: subsidiaryId,
                  isDynamic: true
              });

              var subsidiary_obj_gstnum = subsidiary_obj.getValue({
                  fieldId: 'federalidnumber'
              });
              if (subsidiary_obj_gstnum) {
                  subsidiary_obj_gstnum = subsidiary_obj_gstnum
              } else {
                  subsidiary_obj_gstnum = ""
              }

          }
          
              var accountId = runtime.accountId; // return the accountId
                  var environment = runtime.envType; // PRODUCTION, SANDBOX, etc.
                  //log.debug("environment", environment)
                  var Configuration_data = ClearTax_Library_File.ClearTax_Einvoice_library()
                  //log.debug("Configuration_data", Configuration_data)
                  var get_environment_name = Configuration_data[environment]
                  //log.debug("get_environment_name", get_environment_name)
                  var auth_token = get_environment_name["AUTH_TOKEN"]
                  //log.debug("auth_token", auth_token)
                  var GENERATE_EWAYBILL_BY_IRN_URL = get_environment_name["GENERATE_EWAYBILL_BY_IRN_URL"]
                  
                  var url = GENERATE_EWAYBILL_BY_IRN_URL    // return the url in dynamic
                  
                   var headers = {
                      //"X-Cleartax-Auth-Token": '1.76072d27-911c-4bd8-b735-9d62cba7cc30_f01ffe1cf997b71ac8113afee72d1ce81a44fa79c133e63f564383865a8abaf8',   // static value
                      "X-Cleartax-Auth-Token": auth_token,   // added on 03/05/2024
                      "gstin": subsidiary_obj_gstnum,
                      "Content-Type": "application/json",
                      "accept": "application/json",
              }
          
           var body_data = {};
          
           body_data = [
              {
                  "Irn": cleartax_irn,
                  "Distance": transport_distance,
                  "TransMode": transport_mode,
                  "TransId": transport_id,
                  "TransName": transport_name,
                  "TransDocDt": formattedtransportdate,
                  "TransDocNo": transport_doc_no,
                  "VehNo": transport_vehicle_no,
                  "VehType": transport_vehicle_type,
                  "ExpShipDtls": {
                      "Addr1": shipToAddressLine1,
                      "Addr2": shipToAddressLine2,
                      "Loc": shipToAddressCity,
                      "Pin": shipToAddressZip,
                      "Stcd": shipto_satecode,
                  },
                  "DispDtls": {
                      "Nm": location_obj_name,
                      "Addr1": location_obj_addr1,
                      "Addr2": location_obj_addr2,
                      "Loc": location_obj_city,
                      "Pin": location_obj_zip,
                      "Stcd": loc_state_code_value,
                  }
              }];

          log.debug({
              title: 'request body',
              details: JSON.stringify(body_data)
          });
          var response_irn = https.post({
              url: url,
              body: JSON.stringify(body_data),
              headers: headers,
          });
          log.debug({
              title: 'response.code',
              details: response_irn.code
          });
          log.debug({
              title: 'response.body',
              details: response_irn.body
          });
          loadRecord.setValue({
              fieldId: 'custbody_ctax_ewaybill_respons',
              value: response_irn.body
          });
          loadRecord.setValue({
              fieldId: 'custbody_ctax_ewaybill_request',
              value: JSON.stringify(body_data)
          });
            if (response_irn.code == 200) {  //if response code got 200 then this code will execute
              var parseObdy = JSON.parse(response_irn.body)
              var error = parseObdy[0]["govt_response"]["Success"]
              //log.debug("error", error)
              if (nullCheck(error) && error == "N") {  //if response code got 200 and success got 'N' then this code will execute
                  var get_error = parseObdy[0]["govt_response"]["ErrorDetails"][0]["error_message"]
                 
              } else if (nullCheck(error) && error == "Y") { //if response code got 200 and success get 'Y' then this code will execute

                  var parseObdy_BillNo = parseObdy[0]["govt_response"]["EwbNo"]
                  var parseObdy_Irn = parseObdy[0]["govt_response"]["Irn"]
                  var parseObdy_Status = parseObdy[0]["govt_response"]["Status"]
                  var parseObdy_AckDt = parseObdy[0]["govt_response"]["EwbDt"]
                  if (nullCheck(parseObdy_AckDt)) {

                      var dateformat = new Date(String(parseObdy_AckDt))

                      var formattedTime = format.parse({
                          value: dateformat,
                          type: format.Type.DATETIMETZ
                      })
                      log.debug("formattedTime", formattedTime);

                      loadRecord.setValue({
                          fieldId: 'custbody_ctax_ewaybill_ack_date',
                          value: formattedTime
                      });
                  }

                  var parseObdy_ewaybill_valid_date = parseObdy[0]["govt_response"]["EwbValidTill"]

                  if (nullCheck(parseObdy_ewaybill_valid_date)) {

                      var parseObdy_ewaybill_valid_dateformat = new Date(String(parseObdy_ewaybill_valid_date))

                      var formattedTime_valid = format.parse({
                          value: parseObdy_ewaybill_valid_dateformat,
                          type: format.Type.DATETIMETZ
                      });

                      loadRecord.setValue({
                          fieldId: 'custbody_ctax_ewaybill_validtill',
                          value: formattedTime_valid
                      });
                  }

                  if (nullCheck(parseObdy_BillNo)) {

                      loadRecord.setValue({
                          fieldId: 'custbody_ctax_ewb_number',
                          value: parseObdy_BillNo.toString()
                      });
                      // log.debug("parseObdy_BillNo", parseObdy_BillNo)

                      loadRecord.setValue({
                          fieldId: 'custbody_ctax_ewaybill_transfer',
                          value: true
                      });

                      loadRecord.setValue({
                          fieldId: 'custbody_ctax_ewaybill_irn',
                          value: parseObdy_Irn
                      });
                      // log.debug("parseObdy_Irn", parseObdy_Irn)

                      if (parseObdy_Status == 'GENERATED' || parseObdy_Status == 'PARTA_GENERATED') {

                          loadRecord.setValue({
                              fieldId: 'custbody_ctax_ewb_status',
                              value: 1 //Generated
                          });
                          // log.debug("parseObdy_Status", parseObdy_Status)
  
                      }

                      loadRecord.setValue({
                          fieldId: 'custbody_ctax_ewaybill_cancelurn',
                          value: ""
                      });

                      loadRecord.setValue({
                          fieldId: 'custbody_ctax_cancel_reas_remark',
                          value: ""
                      });

                      loadRecord.setValue({
                          fieldId: 'custbody_ctax_cancel_reas_code',
                          value: ""
                      });
                  }

              
                //  alert("E-Waybill generated successfully.")
              }
          }else {   // if clearTax end server down then this msg will print 

            //  alert("E-invoice is not generated Please retry after some time.")
          }
          // End Invoice to ClearTax process

          var recordId = loadRecord.save({    //submit loadRecord obj
              enableSourcing: true,
              ignoreMandatoryFields: true
          });
                  
              redirect.toRecord({
                  type: get_recordType,
                  id: get_recordId
              });
              
             // context.response.writePage(form);
              
      }catch (err) {
          log.debug({
              title: 'err',
              details: err
          });
          if (err.details) {
              return {
                  "statuscode": "406",
                  "success": "false",
                  "message": err.details
              }
          } else if (err.code) {
              return {
                  "statuscode": "407",
                  "success": "false",
                  "message": err.code
              }
          } else if (err.message) {
              return {
                  "statuscode": "408",
                  "success": "false",
                  "message": err.message
              }
          }
      }
         
          
          
               
    }
   
   
     //Begin: shippingAdressDetails functionality
  function shippingAdressDetails(get_recordId) {
      var shipToAddressLine1 = ""
      var shipToAddressLine2 = ""
      var shipToAddressCity = ""
      var shipToAddressZip = ""
      var shipToAddressState = ""
      var obj = {};
      var invoiceSearchObj = search.create({
          type: "invoice",
          filters: [
              ["type", "anyof", "CustInvc"],
              "AND",
              ["mainline", "is", "T"],
              "AND",
              ["internalid", "anyof", get_recordId]
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
              })
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
          return true;
      });
      obj.shipToAddressLine1 = shipToAddressLine1;
      obj.shipToAddressLine2 = shipToAddressLine2;
      obj.shipToAddressCity = shipToAddressCity;
      obj.shipToAddressZip = shipToAddressZip;
      obj.shipToAddressState = shipToAddressState;
      return obj;
  }
  //End: shippingAdressDetails functionality
  
  
    //Begin: indgst_placeofsupplylistSearchObj functionality
  function indgst_placeofsupplylistSearchObj(shipToAddressState) {
      var shiptogststatecode = "";
      var obj = {};
      var customrecord_indgst_placeofsupplylistSearchObj = search.create({
          type: "customrecord_indgst_placeofsupplylist",
          filters:
              [
                  ["isinactive", "is", "F"],
                  "AND",
                  ["custrecord_state_name_pos", "is", shipToAddressState]
              ],
          columns:
              [
                  search.createColumn({
                      name: "custrecord_indgst_pos_gststatecode",
                      sort: search.Sort.ASC,
                      label: "GST State Code"
                  }),
                  search.createColumn({
                      name: "custrecord_state_name_pos",
                      sort: search.Sort.ASC,
                      label: "State Name"
                  })
              ]
      });
      var searchResultCount = customrecord_indgst_placeofsupplylistSearchObj.runPaged().count;
      //log.debug("customrecord_indgst_placeofsupplylistSearchObj result count",searchResultCount);
      customrecord_indgst_placeofsupplylistSearchObj.run().each(function (result) {
          shiptogststatecode = result.getValue("custrecord_indgst_pos_gststatecode")
          return true;
      });
      obj.shiptogststatecode = shiptogststatecode;
      return obj;
  }
  //End: indgst_placeofsupplylistSearchObj functionality
  
   
    function nullCheck(value) {
      if (value != 'null' && value != '' && value != undefined && value != 'NaN') {
          return true;
      } else {
          return false;
      }
  }
  
     return {
      onRequest: onRequest
  };

});