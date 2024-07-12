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
	  
	  
	function onRequest(context){
		
		try{	
		
		 var get_recordId = context.request.parameters.custpage_recId;
		 var get_recordType = context.request.parameters.custpage_recType;
		 
		 var loadRecord = record.load({ // this is load the current record
				  type: get_recordType,
				  id: get_recordId,
				  isDynamic: true
			  });
			  var tranid = loadRecord.getValue({ // this is get the tranid
			  fieldId: 'tranid'
		  });
		  var trandate = loadRecord.getValue({ // this is get the date
			  fieldId: 'trandate'
		  });
		  var supplytypecode = loadRecord.getText({
			  fieldId: 'custbody_indgst_inv_supplytypecode'
		  });
		  if (supplytypecode) {
			  supplytypecode = supplytypecode
		  } else {
			  supplytypecode = 0
		  }
		  var customername = loadRecord.getValue({
			  fieldId: 'entity'
		  });
		  if (customername) {
			  customername = customername
		  } else {
			  customername = 0
		  }
		  var shipaddresslistId = loadRecord.getValue({
			  fieldId: 'shipaddresslist'
		  });
		  if (nullCheck(shipaddresslistId)) {
			  var shipaddress = loadRecord.getValue({
				  fieldId: 'shipaddress'
			  });
			  if (nullCheck(shipaddress)) {
				  shipaddress = shipaddress
			  }
		  }
		  //log.debug("shipaddress", shipaddress)
		  var subtotal = loadRecord.getValue({
			  fieldId: 'subtotal'
		  });
		  if (subtotal) {
			  subtotal = parseFloat(subtotal)
		  } else {
			  subtotal = 0
		  }
		  var discounttotal = loadRecord.getValue({
			  fieldId: 'discounttotal'
		  });
		  if (discounttotal) {
			  discounttotal = Math.abs(discounttotal)
		  } else {
			  discounttotal = 0
		  }
		  var taxtotal = loadRecord.getValue({
			  fieldId: 'taxtotal'
		  });
		  if (taxtotal) {
			  taxtotal = parseFloat(taxtotal)
		  } else {
			  taxtotal = 0
		  }
		  var total = loadRecord.getValue({
			  fieldId: 'total'
		  });
		  if (total) {
			  total = parseFloat(total)
		  } else {
			  total = 0
		  }
		  var afterdisamt = parseFloat(subtotal) - parseFloat(discounttotal)
		  if (afterdisamt) {
			  afterdisamt = parseFloat(afterdisamt)
		  } else {
			  afterdisamt = 0
		  }
		  var totalamt = loadRecord.getValue({
			  fieldId: 'total'
		  });
		  if (totalamt) {
			  totalamt = totalamt
		  } else {
			  totalamt = ""
		  }
		  totalamt.toFixed(0)
		  var exchangerate = loadRecord.getValue({
			  fieldId: 'exchangerate'
		  });
		  var exchangeamount = parseFloat(totalamt) * parseFloat(exchangerate)
		  if (exchangeamount) {
			  exchangeamount = exchangeamount
		  } else {
			  exchangeamount = ''
		  }
		  //exchangeamount = exchangeamount.toFixed(1)
		  //log.debug("exchangeamount", exchangeamount)
		  var shippingcost = loadRecord.getValue({
			  fieldId: 'shippingcost'
		  });
		  if (shippingcost) {
			  shippingcost = parseFloat(shippingcost)
		  } else {
			  shippingcost = 0
		  }
		  var handlingcost = loadRecord.getValue({
			  fieldId: 'handlingcost'
		  });
		  if (handlingcost) {
			  handlingcost = parseFloat(handlingcost)
		  } else {
			  handlingcost = 0
		  }
		  var handling_and_shippingcost = parseFloat(shippingcost) + parseFloat(handlingcost)
		  if (handling_and_shippingcost) {
			  handling_and_shippingcost = parseFloat(handling_and_shippingcost)
		  } else {
			  handling_and_shippingcost = 0
		  }
		  var igsttotal = loadRecord.getValue({
			  fieldId: 'custbody_indgst_einvoiceigsttotal'
		  });
		  if (igsttotal) {
			  igsttotal = igsttotal.toFixed(1)
		  } else {
			  igsttotal = 0
		  }
		  var sgsttotal = loadRecord.getValue({
			  fieldId: 'custbody_invoice_einvoicingsgst'
		  });
		  if (sgsttotal) {
			  sgsttotal = parseFloat(sgsttotal)
		  } else {
			  sgsttotal = 0
		  }
		  var cgsttotal = loadRecord.getValue({
			  fieldId: 'custbody_indgst_invoice_einvoicingcgst'
		  });
		  if (cgsttotal) {
			  cgsttotal = parseFloat(cgsttotal)
		  } else {
			  cgsttotal = 0
		  }
		  var itemtotalamt = loadRecord.getValue({
			  fieldId: 'custbody_indgst_einvoice_itemtotalamt'
		  });
		  if (itemtotalamt) {
			  itemtotalamt = parseFloat(itemtotalamt)
		  } else {
			  itemtotalamt = ""
		  }
		  var locationId = loadRecord.getValue({
			  fieldId: 'location'
		  });
		  if (nullCheck(locationId)) {
			  var location_obj = record.load({ // this is load the location record
				  type: 'location',
				  id: locationId,
				  isDynamic: true
			  });
			  var location_obj_gststatecode = location_obj.getValue({
				  fieldId: 'custrecord_indgst_locatio_gststatecode'
			  });
			  log.debug("location_obj_gststatecode", location_obj_gststatecode)
			  if (nullCheck(location_obj_gststatecode)) {
				  var lookup_location_obj_gststatecode = search.lookupFields({
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
			  //log.debug("location_obj_zip", location_obj_zip)
			  // var location_obj_state = location_subrecord.getValue({
			  // fieldId: 'state'
			  // })
			  // if (location_obj_state) {
			  // location_obj_state = location_obj_state
			  // } else {
			  // location_obj_state = ""
			  // }
			  //log.debug("location_obj_state", location_obj_state)

		  }
		  var month = trandate.getMonth() + 1
		  if (month < 10) {
			  month = "0" + month
		  }
		  var date = trandate.getDate()
		  if (date < 10) {
			  date = "0" + date
		  }
		  var formatteddate = date + '/' + month + '/' + trandate.getFullYear()
		  //log.debug("formatteddate", formatteddate)
		  formatteddate = String(formatteddate).trim();
		  // formatteddate = xml.escape({xmlText : formatteddate});
		  var subsidiaryId = loadRecord.getValue({
			  fieldId: 'subsidiary'
		  });
		  if (subsidiaryId) {
			  var subsidiary_obj = record.load({  // return the subsidiary obj
				  type: 'subsidiary',
				  id: subsidiaryId,
				  isDynamic: true
			  });
			  var subsidiary_obj_supplytypecode = subsidiary_obj.getValue({
				  fieldId: 'custrecord_indgst_subsi_supplytypecode'
			  });
			  log.debug("subsidiary_obj_supplytypecode", subsidiary_obj_supplytypecode)
			  if (nullCheck(subsidiary_obj_supplytypecode)) {
				  var lookup_state_code = search.lookupFields({
					  type: 'customrecord_indgst_placeofsupplylist',
					  id: subsidiary_obj_supplytypecode,
					  columns: ['custrecord_indgst_pos_gststatecode']
				  });
				  if (nullCheck(lookup_state_code)) {
					  var state_code_value = lookup_state_code.custrecord_indgst_pos_gststatecode;
				  } else {
					  state_code_value = ""
				  }
			  }
			  var subsidiary_obj_name = subsidiary_obj.getValue({
				  fieldId: 'name'
			  });
			  if (subsidiary_obj_name) {
				  subsidiary_obj_name = subsidiary_obj_name
			  } else {
				  subsidiary_obj_name = ""
			  }
			  var subsidiary_obj_legalname = subsidiary_obj.getText({
				  fieldId: 'legalname'
			  });
			  if (subsidiary_obj_legalname) {
				  subsidiary_obj_legalname = subsidiary_obj_legalname
			  } else {
				  subsidiary_obj_legalname = ""
			  }
			  var subsidiary_obj_gstnum = subsidiary_obj.getValue({
				  fieldId: 'federalidnumber'
			  });
			  if (subsidiary_obj_gstnum) {
				  subsidiary_obj_gstnum = subsidiary_obj_gstnum
			  } else {
				  subsidiary_obj_gstnum = ""
			  }
			  var subsidiary_obj_email = subsidiary_obj.getValue({
				  fieldId: 'email'
			  });
			  if (subsidiary_obj_email) {
				  subsidiary_obj_email = subsidiary_obj_email
			  } else {
				  subsidiary_obj_email = ""
			  }
			  var sublistFieldValue = subsidiary_obj.getSubrecord({
				  fieldId: 'mainaddress'
			  });
			  var subsidiary_obj_addr1 = sublistFieldValue.getValue({
				  fieldId: 'addr1'
			  });
			  if (subsidiary_obj_addr1) {
				  subsidiary_obj_addr1 = subsidiary_obj_addr1
			  } else {
				  subsidiary_obj_addr1 = ""
			  }
			  //log.debug("subsidiary_obj_addr1", subsidiary_obj_addr1)
			  var subsidiary_obj_addr2 = sublistFieldValue.getValue({
				  fieldId: 'addr2'
			  });
			  if (subsidiary_obj_addr2) {
				  subsidiary_obj_addr2 = subsidiary_obj_addr2
			  } else {
				  subsidiary_obj_addr2 = ""
			  }
			  //log.debug("subsidiary_obj_addr2", subsidiary_obj_addr2)
			  var subsidiary_obj_city = sublistFieldValue.getValue({
				  fieldId: 'city'
			  })
			  if (subsidiary_obj_city) {
				  subsidiary_obj_city = subsidiary_obj_city
			  } else {
				  subsidiary_obj_city = ""
			  }
			  //log.debug("subsidiary_obj_city", subsidiary_obj_city)
			  var subsidiary_obj_zip = sublistFieldValue.getValue({
				  fieldId: 'zip'
			  })
			  if (subsidiary_obj_zip) {
				  subsidiary_obj_zip = subsidiary_obj_zip
			  } else {
				  subsidiary_obj_zip = ""
			  }
			  //log.debug("subsidiary_obj_zip", subsidiary_obj_zip)
			  var subsidiary_obj_addrphone = sublistFieldValue.getValue({
				  fieldId: 'addrphone'
			  })
			  if (subsidiary_obj_addrphone) {
				  subsidiary_obj_addrphone = subsidiary_obj_addrphone
			  } else {
				  subsidiary_obj_addrphone = ""
			  }
			  //log.debug("subsidiary_obj_addrphone", subsidiary_obj_addrphone)
			  // var subsidiary_obj_state = sublistFieldValue.getValue({
			  // fieldId: 'state'
			  // })
			  // if (subsidiary_obj_state) {
			  // subsidiary_obj_state = subsidiary_obj_state
			  // } else {
			  // subsidiary_obj_state = ""
			  // }
			  //log.debug("subsidiary_obj_state", subsidiary_obj_state)
		  }
		  var customerId = loadRecord.getValue({
			  fieldId: 'entity'
		  });
		  if (customerId) {
			  var customer_obj = record.load({   // return the customer obj
				  type: 'customer',
				  id: customerId,
				  isDynamic: true
			  });
			  var customer_obj_gst = customer_obj.getValue({
				  fieldId: 'custentity_indgst_cusven_gstin'
			  });
			  if (customer_obj_gst) {
				  customer_obj_gst = customer_obj_gst
			  } else {
				  customer_obj_gst = "URP"
			  }
			  var customer_obj_legalname = customer_obj.getValue({
				  fieldId: 'custentity_indgst_customer_legal_name'
			  });
			  if (customer_obj_legalname) {
				  customer_obj_legalname = customer_obj_legalname
			  } else {
				  customer_obj_legalname = ""
			  }
			  var customer_obj_companyname = customer_obj.getValue({
				  fieldId: 'companyname'
			  });
			  if (customer_obj_companyname) {
				  customer_obj_companyname = customer_obj_companyname
			  } else {
				  customer_obj_companyname = ""
			  }
			  var placeofsuppl = customer_obj.getValue({
				  fieldId: 'custentity_indgst_placeofsuppl'
			  });
			  log.debug("placeofsuppl", placeofsuppl)
			  if (nullCheck(placeofsuppl)) {
				  var lookup_placeofsupply = search.lookupFields({
					  type: 'customrecord_indgst_placeofsupplylist',
					  id: placeofsuppl,
					  columns: ['custrecord_indgst_pos_gststatecode']
				  });
				  if (nullCheck(lookup_placeofsupply)) {
					  var state_code_cust = lookup_placeofsupply.custrecord_indgst_pos_gststatecode;
				  } else {
					  state_code_cust = ""
				  }
			  }
			  log.debug("state_code_cust", state_code_cust)
			  var customer_obj_email = customer_obj.getValue({
				  fieldId: 'email'
			  });
			  if (customer_obj_email) {
				  customer_obj_email = customer_obj_email
			  } else {
				  customer_obj_email = ""
			  }
			  var lineCount = customer_obj.getLineCount({
				  sublistId: 'addressbook'
			  });
			  //log.debug("lineCount", lineCount);			
			  if (lineCount > 0) {
				  //Begin:Get customer address details in for-loop 
				  for (var cust_address_lines = 0; cust_address_lines < lineCount; cust_address_lines++) {
					  var customer_obj_defaultbilling = customer_obj.getSublistValue({
						  sublistId: 'addressbook',
						  fieldId: 'defaultbilling',
						  line: cust_address_lines
					  });
					  if (customer_obj_defaultbilling == true) {
						  var customer_obj_addr1 = customer_obj.getSublistValue({
							  sublistId: 'addressbook',
							  fieldId: 'addr1_initialvalue',
							  line: cust_address_lines
						  });
						  if (customer_obj_addr1) {
							  customer_obj_addr1 = customer_obj_addr1
						  } else {
							  customer_obj_addr1 = ""
						  }
						  //log.debug("customer_obj_addr1", customer_obj_addr1);
						  var customer_obj_addr2 = customer_obj.getSublistValue({
							  sublistId: 'addressbook',
							  fieldId: 'addr2_initialvalue',
							  line: cust_address_lines
						  });
						  if (customer_obj_addr2) {
							  customer_obj_addr2 = customer_obj_addr2
						  } else {
							  customer_obj_addr2 = ""
						  }
						  //log.debug("customer_obj_addr2", customer_obj_addr2);

						  var customer_obj_city = customer_obj.getSublistValue({
							  sublistId: 'addressbook',
							  fieldId: 'city_initialvalue',
							  line: cust_address_lines
						  });
						  if (customer_obj_city) {
							  customer_obj_city = customer_obj_city
						  } else {
							  customer_obj_city = ""
						  }
						  //log.debug("customer_obj_city", customer_obj_city)
						  var customer_obj_zip = customer_obj.getSublistValue({
							  sublistId: 'addressbook',
							  fieldId: 'zip_initialvalue',
							  line: cust_address_lines
						  });
						  if (customer_obj_zip) {
							  customer_obj_zip = customer_obj_zip
						  } else {
							  customer_obj_zip = ""
						  }
						  var customer_obj_state = customer_obj.getSublistValue({
							  sublistId: 'addressbook',
							  fieldId: 'state_initialvalue',
							  line: cust_address_lines
						  });
						  if (customer_obj_state) {
							  customer_obj_state = customer_obj_state
						  } else {
							  customer_obj_state = ""
						  }
						  var customer_obj_phone = customer_obj.getSublistValue({
							  sublistId: 'addressbook',
							  fieldId: 'phone_initialvalue',
							  line: cust_address_lines
						  });
						  if (customer_obj_phone) {
							  customer_obj_phone = customer_obj_phone
						  } else {
							  customer_obj_phone = ""
						  }

					  }
				  }
				  //End:Get customer address details in for-loop
			  }
		  }
		  var item_batchno = loadRecord.getValue({
			  fieldId: 'custbody_item_batchno'
		  });
		  if (item_batchno) {
			  item_batchno = item_batchno
		  } else {
			  item_batchno = ""
		  }
		  var printbankdetailId = loadRecord.getValue({
			  fieldId: 'custbody_printbankdetail'
		  });
		  if (printbankdetailId) {
			  var printbankdetail_obj = record.load({ // this is load the bank details record
				  type: 'customrecord_bank_details_qoutation',
				  id: printbankdetailId,
				  isDynamic: true
			  });
			  var printbankdetail_obj_bank_details = printbankdetail_obj.getValue({
				  fieldId: 'custrecord_ac_name_bank_details'
			  });
			  if (printbankdetail_obj_bank_details) {
				  printbankdetail_obj_bank_details = printbankdetail_obj_bank_details
			  } else {
				  printbankdetail_obj_bank_details = ""
			  }
			  var printbankdetail_obj_acno_details = printbankdetail_obj.getValue({
				  fieldId: 'custrecord_ac_no_bank_details'
			  });
			  if (printbankdetail_obj_acno_details) {
				  printbankdetail_obj_acno_details = printbankdetail_obj_acno_details
			  } else {
				  printbankdetail_obj_acno_details = ""
			  }
			  var printbankdetail_obj_code_bank_details = printbankdetail_obj.getValue({
				  fieldId: 'custrecord_rtgs_code_bank_details'
			  });
			  if (printbankdetail_obj_code_bank_details) {
				  printbankdetail_obj_code_bank_details = printbankdetail_obj_code_bank_details
			  } else {
				  printbankdetail_obj_code_bank_details = ""
			  }
		  }
		  var itemArr = []   // return the item datails this array
		  var itemCount = loadRecord.getLineCount({    // get item count
			  sublistId: 'item'
		  });
		  //log.debug("itemCount", itemCount);

		  if (itemCount > 0) 
		  {   
			  //Begin:Get creditmemo line item quantity in for-loop 
			  var totalqty = 0
			  for (var creditmemo_lineitems_k = 0; creditmemo_lineitems_k < itemCount; creditmemo_lineitems_k++) {
				  var k_quantity = loadRecord.getSublistValue({
					  sublistId: 'item',
					  fieldId: 'quantity',
					  line: creditmemo_lineitems_k
				  });
				  if (k_quantity) {
					  k_quantity = parseFloat(k_quantity)
				  } else {
					  k_quantity = 0
				  }
				  totalqty = k_quantity + totalqty
			  }
			  //End:Get creditmemo line item quantity in for-loop
			  
			  //log.debug("totalqty", totalqty)
			  var item_charges = parseFloat(handling_and_shippingcost) / parseFloat(totalqty)
			  if (item_charges) {
				  item_charges = parseFloat(item_charges)
			  }
			  else{
				  item_charges =0;
			  }
			  //log.debug("item_charges", item_charges)

			  var total_value_in_ValDtls = 0;
			  var total_item_charges_in_qty = 0;
			  
			  //Begin:Get creditmemo line item  details in for-loop
			  for (var creditmemo_lineitems_m = 0; creditmemo_lineitems_m < itemCount; creditmemo_lineitems_m++) {
				  var description = loadRecord.getSublistValue({
					  sublistId: 'item',
					  fieldId: 'description',
					  line: creditmemo_lineitems_m
				  });
				  if (description) {
					  description = description
				  } else {
					  description = ""
				  }
				  var invoice_goodorservice = loadRecord.getSublistText({
					  sublistId: 'item',
					  fieldId: 'custcol_indgst_invoice_goodorservice',
					  line: creditmemo_lineitems_m
				  });
				  if (invoice_goodorservice) {
					  invoice_goodorservice = invoice_goodorservice
				  } else {
					  invoice_goodorservice = ""
				  }
				  var bill_hsnsaccode = loadRecord.getSublistValue({
					  sublistId: 'item',
					  fieldId: 'custcol_indgst_bill_hsnsaccode',
					  line: creditmemo_lineitems_m
				  });
				  if (bill_hsnsaccode) {
					  bill_hsnsaccode = bill_hsnsaccode
				  } else {
					  bill_hsnsaccode = ""
				  }
				  var Item_grossamt = loadRecord.getSublistValue({
					  sublistId: 'item',
					  fieldId: 'grossamt',
					  line: creditmemo_lineitems_m
				  });
				  if (Item_grossamt) {
					  Item_grossamt = Item_grossamt
				  } else {
					  Item_grossamt = 0
				  }
				  if (nullCheck(bill_hsnsaccode)) {
					  var lookup_hsncode = search.lookupFields({     //return the snandsaccode value
						  type: 'customrecord_indgst_indiataxhsnandsaccod',
						  id: bill_hsnsaccode,
						  columns: ['custrecord_indgst_indtaxhsnsac_hsnsacode']
					  });
					  if (nullCheck(lookup_hsncode)) {
						  var hsncode_value = lookup_hsncode.custrecord_indgst_indtaxhsnsac_hsnsacode;
					  } else {
						  hsncode_value = ""
					  }
				  }
				  var quantity = loadRecord.getSublistValue({
					  sublistId: 'item',
					  fieldId: 'quantity',
					  line: creditmemo_lineitems_m
				  });
				  if (quantity) {
					  quantity = parseFloat(quantity).toFixed(2)
				  } else {
					  quantity = 0
				  }
				  var item_charges_in_qty = parseFloat(item_charges) * parseFloat(quantity)
				  item_charges_in_qty = parseFloat(item_charges_in_qty)
				  //log.debug("item_charges_in_qty", item_charges_in_qty)
				  total_item_charges_in_qty = parseFloat(item_charges_in_qty) + parseFloat(total_item_charges_in_qty)
				  var Item_grossamt = loadRecord.getSublistValue({
					  sublistId: 'item',
					  fieldId: 'grossamt',
					  line: creditmemo_lineitems_m
				  });
				  if (Item_grossamt) {
					  Item_grossamt = parseFloat(Item_grossamt)
				  } else {
					  Item_grossamt = 0
				  }
				  var grossamt_charges_total = parseFloat(Item_grossamt) + parseFloat(item_charges_in_qty)
				  //grossamt_charges_total = grossamt_charges_total.toFixed(1)
				  //log.debug("grossamt_charges_total", grossamt_charges_total)
				  total_value_in_ValDtls = parseFloat(grossamt_charges_total) + parseFloat(total_value_in_ValDtls)

				  var units = loadRecord.getSublistText({
					  sublistId: 'item',
					  fieldId: 'units',
					  line: creditmemo_lineitems_m
				  });
				  if (units) {
					  units = units
				  } else {
					  units = ''
				  }
				  var rate = loadRecord.getSublistValue({
					  sublistId: 'item',
					  fieldId: 'rate',
					  line: creditmemo_lineitems_m
				  });
				  if (rate) {
					  rate = parseFloat(rate).toFixed(2)
				  } else {
					  rate = 0
				  }
				  var amount = loadRecord.getSublistValue({
					  sublistId: 'item',
					  fieldId: 'amount',
					  line: creditmemo_lineitems_m
				  });
				  if (amount) {
					  amount = parseFloat(amount).toFixed(2)
				  } else {
					  amount = 0
				  }
				  var discounton_sale = loadRecord.getSublistValue({
					  sublistId: 'item',
					  fieldId: 'custcolcustcol_indgst_discounton_sale',
					  line: creditmemo_lineitems_m
				  });
				  if (discounton_sale) {
					  discounton_sale = parseFloat(discounton_sale)
				  } else {
					  discounton_sale = 0
				  }
				  var taxable_value = loadRecord.getSublistValue({
					  sublistId: 'item',
					  fieldId: 'custcolcustcol_indgst_taxable_value',
					  line: creditmemo_lineitems_m
				  });
				  if (taxable_value) {
					  taxable_value = parseFloat(taxable_value).toFixed(2)
				  } else {
					  taxable_value = 0
				  }
				  var ass_amount = parseFloat(amount)-parseFloat(discounton_sale)
				  var taxrate1 = loadRecord.getSublistValue({
					  sublistId: 'item',
					  fieldId: 'taxrate1',
					  line: creditmemo_lineitems_m
				  });
				  if (taxrate1) {
					  taxrate1 = parseFloat(taxrate1)
				  } else {
					  taxrate1 = 0
				  }
				  var cgstamtforeinv = loadRecord.getSublistValue({
					  sublistId: 'item',
					  fieldId: 'custcol_indgst_invoice_cgstamtforeinv',
					  line: creditmemo_lineitems_m
				  });
				  if (cgstamtforeinv) {
					  cgstamtforeinv = parseFloat(cgstamtforeinv)
				  } else {
					  cgstamtforeinv = 0
				  }
				  var sgstamountforeinvoicin = loadRecord.getSublistValue({
					  sublistId: 'item',
					  fieldId: 'custcol_indgst_sgstamountforeinvoicin',
					  line: creditmemo_lineitems_m
				  });
				  if (sgstamountforeinvoicin) {
					  sgstamountforeinvoicin = parseFloat(sgstamountforeinvoicin)
				  } else {
					  sgstamountforeinvoicin = 0
				  }
				  var igsteinvoice = loadRecord.getSublistValue({
					  sublistId: 'item',
					  fieldId: 'custcol_indgst_invoice_igsteinvoice',
					  line: creditmemo_lineitems_m
				  });
				  if (igsteinvoice) {
					  igsteinvoice = parseFloat(igsteinvoice)
				  } else {
					  igsteinvoice = 0
				  }
				  var item_totItemVal = (parseFloat(amount)+parseFloat(igsteinvoice)+parseFloat(cgstamtforeinv)+parseFloat(sgstamountforeinvoicin)+parseFloat(item_charges_in_qty))-parseFloat(discounton_sale)
				  itemArr.push({
					  "SlNo": creditmemo_lineitems_m + 1,
					  "PrdDesc": description,
					  "IsServc": invoice_goodorservice, 
					  "HsnCd": hsncode_value, // getting error
					  "Barcde": '',
					  "Qty": quantity,
					  "FreeQty": 0,
					  "Unit": units,
					  "UnitPrice": rate,
					  "TotAmt": amount,
					  "Discount": discounton_sale, 
					  "PreTaxVal": 0,
					  "AssAmt": ass_amount, //taxable_value,
					  "GstRt": taxrate1,
					  "IgstAmt": igsteinvoice,
					  "CgstAmt": cgstamtforeinv,
					  "SgstAmt": sgstamountforeinvoicin,
					  "CesRt": 0,
					  "CesAmt": 0,
					  "CesNonAdvlAmt": 0,
					  "StateCesRt": 0,
					  "StateCesAmt": 0,
					  "StateCesNonAdvlAmt": 0,
					  "OthChrg": item_charges_in_qty,
					  "TotItemVal": item_totItemVal,//grossamt_charges_total,
					  "OrdLineRef": '',
					  "OrgCntry": '',
					  "PrdSlNo": '',
					  "BchDtls": {
						  "Nm": item_batchno,
						  "ExpDt": '',
						  "WrDt": ''
					  },
					  "AttribDtls": [{
						  "Nm": '',
						  "Val": ''
					  }]
				  })
			  }
		  //End:Get creditmemo line item  details in for-loop
		  }
		  //var _exchangeamount = parseFloat(total_value_in_ValDtls) * (exchangerate)
		  var total_value = parseFloat(afterdisamt) + parseFloat(cgsttotal) + parseFloat(sgsttotal) + parseFloat(igsttotal) + parseFloat(handling_and_shippingcost)
		  var total_exchangerate = parseFloat(total_value) * parseFloat(exchangerate)			
		  //alert("CreditMemo to ClearTax");
		  var accountId = runtime.accountId; // return the accountId
				  var environment = runtime.envType; // PRODUCTION, SANDBOX, etc.
				  //log.debug("environment", environment)
				  var Configuration_data = ClearTax_Library_File.ClearTax_Einvoice_library()
				  //log.debug("Configuration_data", Configuration_data)
				  var get_environment_name = Configuration_data[environment]
				  //log.debug("get_environment_name", get_environment_name)
				  var auth_token = get_environment_name["AUTH_TOKEN"]
				  //log.debug("auth_token", auth_token)
				  var GENERATE_IRN_URL = get_environment_name["GENERATE_IRN_URL"]
				  
				  var url = GENERATE_IRN_URL    // return the url in dynamic
		  // start send data on invoice to cleartax
		  //var url = 'https://api-sandbox.clear.in/einv/v2/eInvoice/generate';  
		  log.debug("url", url)
		  var headers = {
			  
			  //"X-Cleartax-Auth-Token": '1.76072d27-911c-4bd8-b735-9d62cba7cc30_f01ffe1cf997b71ac8113afee72d1ce81a44fa79c133e63f564383865a8abaf8',   // static value
			  "X-Cleartax-Auth-Token": auth_token,   // added on 03/05/2024
			  // "owner_id": '9abeb2db-955c-49c6-99b9-e2589314896b',//08.04.2024 - commented
			  "gstin": subsidiary_obj_gstnum,
			  // "x-cleartax-product": 'EInvoice',//08.04.2024 - commented
			  "Content-Type": "application/json",
			  "accept": "application/json"
		  }
		  var body_data = {};
		  body_data = [{
			  "transaction": {
				  "Version": "1.1",
				  "TranDtls": {
					  "TaxSch": "GST",
					  "SupTyp": supplytypecode,
					  "RegRev": '',
					  "EcmGstin": null,
					  "IgstOnIntra": ''
				  },
				  "DocDtls": {
					  "Typ": "CRN", // hardcode
					  "No": tranid,
					  "Dt": formatteddate
				  },
				  "SellerDtls": {
					  "Gstin": subsidiary_obj_gstnum,
					  "LglNm": subsidiary_obj_legalname,
					  "TrdNm": subsidiary_obj_name,
					  "Addr1": subsidiary_obj_addr1,
					  "Addr2": subsidiary_obj_addr2,
					  "Loc": subsidiary_obj_city,
					  "Pin": subsidiary_obj_zip,
					  "Stcd": state_code_value, //subsidiary_obj_state, 
					  "Ph": subsidiary_obj_addrphone,
					  "Em": subsidiary_obj_email
				  },
				  "BuyerDtls": {
					  "Gstin": customer_obj_gst,
					  "LglNm": customer_obj_legalname,
					  "TrdNm": customer_obj_companyname,
					  "Pos": state_code_cust, //placeofsuppl
					  "Addr1": customer_obj_addr1,
					  "Addr2": customer_obj_addr2,
					  "Loc": customer_obj_city,
					  "Pin": customer_obj_zip,
					  "Stcd": state_code_cust, //customer_obj_state, // getting error
					  "Ph": customer_obj_phone,
					  "Em": customer_obj_email
				  },
				  "DispDtls": {
					  "Nm": location_obj_name,
					  "Addr1": location_obj_addr1,
					  "Addr2": location_obj_addr2,
					  "Loc": location_obj_city,
					  "Pin": location_obj_zip,
					  "Stcd": loc_state_code_value,
				  },
				  // "ShipDtls": {
					  // "Gstin": customer_obj_gst,
					  // "LglNm": customer_obj_companyname,
					  // "TrdNm": customername,
					  // "Addr1": shipToAddressLine1,  // getting error
					  // "Addr2": shipToAddressLine2,
					  // "Loc": shipToAddressCity,
					  // "Pin": shipToAddressZip,
					  // "Stcd": state_code_cust, //shipToAddressState 
				  // },
				  "ShipDtls": {
					  "Gstin": customer_obj_gst,
					  "LglNm": customer_obj_companyname, // customer_obj_legalname
					  "TrdNm": customer_obj_legalname,
					  "Addr1": customer_obj_addr1,  
					  "Addr2": customer_obj_addr2,
					  "Loc": customer_obj_city,
					  "Pin": customer_obj_zip,
					  "Stcd": state_code_cust,  
				  },
				  "ItemList": itemArr,
				  "ValDtls": {
					  "AssVal": afterdisamt, //subtotal,
					  "CgstVal": cgsttotal,
					  "SgstVal": sgsttotal,
					  "IgstVal": igsttotal,
					  "CesVal": 0,
					  "StCesVal": 0,
					  "Discount": 0, //discounttotal, //total_item_charges_in_qty
					  "OthChrg": 0, //handling_and_shippingcost
					  "RndOffAmt": 0,
					  "TotInvVal": total_value, //total,//total_value_in_ValDtls,
					  "TotInvValFc": total_exchangerate  //_exchangeamount 
				  },
				  "PayDtls": {
					  "Nm": printbankdetail_obj_bank_details,
					  "AccDet": printbankdetail_obj_acno_details,
					  "Mode": '',
					  "FinInsBr": printbankdetail_obj_code_bank_details,
					  "PayTerm": '',
					  "PayInstr": '',
					  "CrTrn": '',
					  "DirDr": '',
					  "CrDay": '',
					  "PaidAmt": '',
					  "PaymtDue": ''
				  },
				  "RefDtls": {
					  "InvRm": '',
					  "DocPerdDtls": {
						  "InvStDt": '',
						  "InvEndDt": ''
					  },
					  "PrecDocDtls": [{
						  "InvNo": '',
						  "InvDt": '',
						  "OthRefNo": ''
					  }],
					  "ContrDtls": [{
						  "RecAdvRefr": '',
						  "RecAdvDt": '',
						  "TendRefr": '',
						  "ContrRefr": '',
						  "ExtRefr": '',
						  "ProjRefr": '',
						  "PORefr": '',
						  "PORefDt": ''
					  }]
				  },
				  "AddlDocDtls": [{
					  "Url": "https://einv-apisandbox.nic.in",
					  "Docs": '',
					  "Info": ''
				  }],
				  "ExpDtls": {
					  "ShipBNo": '',
					  "ShipBDt": '',
					  "Port": '',
					  "RefClm": '',
					  "ForCur": '',
					  "CntCode": ''
				  },
				  "EwbDtls": {
					  "TransId": '',
					  "TransName": '',
					  "Distance": '',
					  "TransDocNo": '',
					  "TransDocDt": '',
					  "VehNo": '',
					  "VehType": '',
					  "TransMode": ''
				  }
			  },
			  "custom_fields": {
				  "customfieldLable1": "CustomFieldValue1",
				  "customfieldLable2": "CustomFieldValue2",
				  "customfieldLable3": "CustomFieldValue3"
			  }
		  }]
		  // end send data on invoice to cleartax
		  log.debug({
			  title: 'bodyResp1',
			  details: JSON.stringify(body_data)
		  });
		  var response_irn = https.put({    // return the request and response
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
			  fieldId: 'custbody_ctax_creditnote_response',
			  value: response_irn.body
		  });
		  loadRecord.setValue({
			  fieldId: 'custbody_ctax_creditnote_request',
			  value: JSON.stringify(body_data)
		  });
		  if (response_irn.code == 200) {   // if response code get 200 then condition will execute
			  var parseObdy = JSON.parse(response_irn.body)
			  var error = parseObdy[0]["govt_response"]["Success"]
			  //log.debug("error", error)
			  if (nullCheck(error) && error == "N")  // if if response code get 200 and success get 'N' then condition will execute
			  {
				  var get_error = parseObdy[0]["govt_response"]["ErrorDetails"][0]["error_message"]
				  log.debug("get_error....",get_error)
			  //	alert(get_error)
			  } 
			  else if (nullCheck(error) && error == "Y")  // if if response code get 200 and success get 'Y' then condition will execute
			  {
				  var parseObdy_AckNo = parseObdy[0]["govt_response"]["AckNo"]
				  var parseObdy_SignedQRCode = parseObdy[0]["govt_response"]["SignedQRCode"]
				  var parseObdy_Irn = parseObdy[0]["govt_response"]["Irn"]
				  var parseObdy_Status = parseObdy[0]["govt_response"]["Status"]
				  var parseObdy_AckDt = parseObdy[0]["govt_response"]["AckDt"]
				  var dateformat = new Date(String(parseObdy_AckDt))
				  var month = dateformat.getMonth() + 1
				  var date = dateformat.getDate()
				  var fyllyear = dateformat.getFullYear()
				  var hours = dateformat.getHours();
				  var minutes = dateformat.getMinutes();
				  if (minutes < 10) {
					  minutes = "0" + minutes
				  }
				  var seconds = dateformat.getSeconds();
				  if (seconds < 10) {
					  seconds = "0" + seconds
				  }
				  var ampm = hours >= 12 ? 'pm' : 'am';
				  hours = hours % 12;
				  hours = hours ? hours : 12; // the hour '0' should be '12'
				  minutes = minutes < 10 ? '0' + minutes : minutes;
				  var str_date_Time = month + '/' + date + '/' + fyllyear + ' ' + hours + ':' + minutes + ':' + seconds + ' ' + ampm;
				  //str_date_Time = String(str_date_Time)
				  //log.debug("str_date_Time", str_date_Time)
				  var formattedTime = format.parse({
					  value: str_date_Time,
					  type: format.Type.DATETIMETZ
				  })
				  //log.debug("formattedTime", formattedTime)
				  loadRecord.setValue({
					  fieldId: 'custbody_ctax_creditnote_transfer',
					  value: true
				  });
				  loadRecord.setValue({
					  fieldId: 'custbody_ctax_creditnote_ack_no',
					  value: parseObdy_AckNo
				  });
				  loadRecord.setValue({
					  fieldId: 'custbody_ctax_creditnote_qrcode',
					  value: parseObdy_SignedQRCode
				  });
				  loadRecord.setValue({
					  fieldId: 'custbody_ctax_creditnote_irn',
					  value: parseObdy_Irn
				  });
				  loadRecord.setValue({
					  fieldId: 'custbodycustbody_ctax_ecreditno_status',
					  value: parseObdy_Status
				  });
				  loadRecord.setValue({
					  fieldId: 'custbody_ctax_creditnote_ack_date',
					  value: formattedTime
				  });
			  }
		  }
		  
		  var recordId = loadRecord.save({  // return the save record ID
			  enableSourcing: true,
			  ignoreMandatoryFields: true
		  });
		  
		  redirect.toRecord({
				  type: get_recordType,
				  id: get_recordId
			  });
			  
		  
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