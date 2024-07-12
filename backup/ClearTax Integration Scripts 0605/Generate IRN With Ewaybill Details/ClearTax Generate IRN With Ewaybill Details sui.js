/*----------------------------------------------------------------------------------------------
        Company Name 	:	Nuvista Technologies Pvt Ltd
        Script Name 	:	
        Author 			:  	NVT Employee
        Date            :   25-04-2024
        Description		:	
------------------------------------------------------------------------------------------------*/
/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(['N/record', 'N/search', 'N/http', 'N/xml', 'N/runtime', 'N/ui/dialog', 'N/https', 'N/format', 'N/redirect', '/SuiteScripts/ClearTax Integration Scripts/ClearTax Library File.js'], function (record, search, http, xml, runtime, dialog, https, format, redirect, ClearTax_Library_File) {


    function onRequest(context) {
        try {

            var getRecType = context.request.parameters.custpage_recType; // return the record type
            // log.debug("getRecType", getRecType)
            var getRecId = context.request.parameters.custpage_recId; // return the current record id
            // log.debug("getRecId", getRecId)

            var loadRecord = record.load({ // this is load the current record
                type: getRecType,
                id: parseInt(getRecId),
                isDynamic: true
            });

            //Get the fields details from invoice 
            var tranid = loadRecord.getValue({
                fieldId: 'tranid'
            });
            var trandate = loadRecord.getValue({
                fieldId: 'trandate'
            });
            var supplytypecode = loadRecord.getText({
                fieldId: 'custbody_indgst_inv_supplytypecode'
            });
            if (nullCheck(supplytypecode)) { //If supplytypecode is avelable then set value or not avelable then set '0' 
                supplytypecode = supplytypecode
            } else {
                supplytypecode = 0
            }
            var customername = loadRecord.getValue({
                fieldId: 'entity'
            });
            if (nullCheck(customername)) { //If customername is avelable then set value or not avelable then set '0'
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
            if (subtotal) { //If subtotal is avelable then set value or not avelable then set '0'
                subtotal = parseFloat(subtotal)
            } else {
                subtotal = 0
            }
            var discounttotal = loadRecord.getValue({
                fieldId: 'discounttotal'
            });
            if (discounttotal) { //If discounttotal is avelable then set value or not avelable then set '0'
                discounttotal = Math.abs(discounttotal)
            } else {
                discounttotal = 0
            }
            var taxtotal = loadRecord.getValue({
                fieldId: 'taxtotal'
            });
            if (taxtotal) { //If taxtotal is avelable then set value or not avelable then set '0'
                taxtotal = parseFloat(taxtotal)
            } else {
                taxtotal = 0
            }
            var total = loadRecord.getValue({
                fieldId: 'total'
            });
            if (total) { //If total is avelable then set value or not avelable then set '0'
                total = parseFloat(total)
            } else {
                total = 0
            }
            var afterdisamt = parseFloat(subtotal) - parseFloat(discounttotal)
            if (afterdisamt) { //If afterdisamt is avelable then set value or not avelable then set '0'
                afterdisamt = parseFloat(afterdisamt)
            } else {
                afterdisamt = 0
            }
            var totalamt = loadRecord.getValue({
                fieldId: 'total'
            });
            if (totalamt) { //If totalamt is avelable then set value or not avelable then set '0'
                totalamt = totalamt
            } else {
                totalamt = 0
            }
            totalamt.toFixed(0)
            var exchangerate = loadRecord.getValue({
                fieldId: 'exchangerate'
            });
            // var exchangeamount = parseFloat(totalamt) * parseFloat(exchangerate)
            // if (exchangeamount) {
            // exchangeamount = exchangeamount
            // } else {
            // exchangeamount = 0
            // }
            //exchangeamount = exchangeamount.toFixed(1)
            //log.debug("exchangeamount", exchangeamount)
            var shippingcost = loadRecord.getValue({
                fieldId: 'shippingcost'
            });
            if (shippingcost) {  //If shippingcost is avelable then set value or not avelable then set '0'
                shippingcost = parseFloat(shippingcost)
            } else {
                shippingcost = 0
            }
            var handlingcost = loadRecord.getValue({
                fieldId: 'handlingcost'
            });
            if (handlingcost) { //If handlingcost is avelable then set value or not avelable then set '0'
                handlingcost = parseFloat(handlingcost)
            } else {
                handlingcost = 0
            }
            var handling_and_shippingcost = parseFloat(shippingcost) + parseFloat(handlingcost)
            if (handling_and_shippingcost) {   //If handling_and_shippingcost is avelable then set value or not avelable then set '0'
                handling_and_shippingcost = parseFloat(handling_and_shippingcost)
            } else {
                handling_and_shippingcost = 0
            }
            var igsttotal = loadRecord.getValue({
                fieldId: 'custbody_indgst_einvoiceigsttotal'
            });
            if (igsttotal) {  //If igsttotal is avelable then set value or not avelable then set '0'
                igsttotal = parseFloat(igsttotal)
            } else {
                igsttotal = 0
            }
            var sgsttotal = loadRecord.getValue({
                fieldId: 'custbody_invoice_einvoicingsgst'//custbody_indgst_invoice_einvoicingcgst
            });
            if (sgsttotal) {  //If sgsttotal is avelable then set value or not avelable then set '0'
                sgsttotal = parseFloat(sgsttotal)
            } else {
                sgsttotal = 0
            }
            var cgsttotal = loadRecord.getValue({
                fieldId: 'custbody_indgst_invoice_einvoicingcgst'//custbody_indgst_invoiceeinvoiceinggstt
            });
            if (cgsttotal) {  //If cgsttotal is avelable then set value or not avelable then set '0'
                cgsttotal = parseFloat(cgsttotal)
            } else {
                cgsttotal = 0
            }
            var itemtotalamt = loadRecord.getValue({
                fieldId: 'custbody_indgst_einvoice_itemtotalamt'
            });
            if (itemtotalamt) {  //If itemtotalamt is avelable then set value or not avelable then set '0'
                itemtotalamt = parseFloat(itemtotalamt)
            } else {
                itemtotalamt = ""
            }
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
                var subsidiary_obj = record.load({  // get subsidiary obj
                    type: 'subsidiary',
                    id: subsidiaryId,
                    isDynamic: true
                });
                var subsidiary_obj_supplytypecode = subsidiary_obj.getValue({
                    fieldId: 'custrecord_indgst_subsi_supplytypecode'
                });
                //log.debug("subsidiary_obj_supplytypecode", subsidiary_obj_supplytypecode)
                if (nullCheck(subsidiary_obj_supplytypecode)) {
                    var lookup_state_code = search.lookupFields({   // get placeofsupply obj to gststatecode
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
                var subsidiaryaddr_obj = subsidiarySearchObj(subsidiaryId)
                if (nullCheck(subsidiaryaddr_obj)) {
                    var subsidiary_obj_addr1 = subsidiaryaddr_obj.subsidiary_obj_addr1
                    if (!nullCheck(subsidiary_obj_addr1)) {
                        subsidiary_obj_addr1 = ""
                    }
                    log.debug("subsidiary_obj_addr1", subsidiary_obj_addr1)
                    var subsidiary_obj_addr2 = subsidiaryaddr_obj.subsidiary_obj_addr2
                    if (!nullCheck(subsidiary_obj_addr2)) {
                        subsidiary_obj_addr2 = ""
                    }
                    var subsidiary_obj_city = subsidiaryaddr_obj.subsidiary_obj_city
                    if (!nullCheck(subsidiary_obj_city)) {
                        subsidiary_obj_city = ""
                    }
                    var subsidiary_obj_zip = subsidiaryaddr_obj.subsidiary_obj_zip
                    if (!nullCheck(subsidiary_obj_zip)) {
                        subsidiary_obj_zip = ""
                    }
                    var subsidiary_obj_addrphone = subsidiaryaddr_obj.subsidiary_obj_addrphone
                    if (!nullCheck(subsidiary_obj_addrphone)) {
                        subsidiary_obj_addrphone = ""
                    }
                }
                // add comment for get data from saved Search(sublistFieldValue)
                /*var sublistFieldValue = subsidiary_obj.getSubrecord({
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
                }*/

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
                var customer_obj = record.load({  // get the customer obj
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
                //log.debug("placeofsuppl", placeofsuppl)
                if (nullCheck(placeofsuppl)) {
                    var lookup_placeofsupply = search.lookupFields({    // get placeofsupply obj to gststatecode
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
                //log.debug("state_code_cust", state_code_cust)
                var customer_obj_email = customer_obj.getValue({
                    fieldId: 'email'
                });
                if (customer_obj_email) {
                    customer_obj_email = customer_obj_email
                } else {
                    customer_obj_email = ""
                }
                var lineCount = customer_obj.getLineCount({ // get customer address count
                    sublistId: 'addressbook'
                });
                //log.debug("lineCount", lineCount);

                //Begin: customer addres get for-loop functionality
                if (lineCount > 0) {
                    for (var customer_addres_y = 0; customer_addres_y < lineCount; customer_addres_y++) {
                        var customer_obj_defaultbilling = customer_obj.getSublistValue({
                            sublistId: 'addressbook',
                            fieldId: 'defaultbilling',
                            line: customer_addres_y
                        });
                        if (customer_obj_defaultbilling == true) {
                            var customer_obj_addr1 = customer_obj.getSublistValue({
                                sublistId: 'addressbook',
                                fieldId: 'addr1_initialvalue',
                                line: customer_addres_y
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
                                line: customer_addres_y
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
                                line: customer_addres_y
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
                                line: customer_addres_y
                            });
                            if (customer_obj_zip) {
                                customer_obj_zip = customer_obj_zip
                            } else {
                                customer_obj_zip = ""
                            }
                            var customer_obj_state = customer_obj.getSublistValue({
                                sublistId: 'addressbook',
                                fieldId: 'state_initialvalue',
                                line: customer_addres_y
                            });
                            if (customer_obj_state) {
                                customer_obj_state = customer_obj_state
                            } else {
                                customer_obj_state = ""
                            }
                            var customer_obj_phone = customer_obj.getSublistValue({
                                sublistId: 'addressbook',
                                fieldId: 'phone_initialvalue',
                                line: customer_addres_y
                            });
                            if (customer_obj_phone) {
                                customer_obj_phone = customer_obj_phone
                            } else {
                                customer_obj_phone = ""
                            }
                        }
                    }
                }
                //End: customer addres get for-loop functionality
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
                var printbankdetail_obj = record.load({ // this is load the current record
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
            var itemArr = []  // created array for ItemList
            var itemCount = loadRecord.getLineCount({
                sublistId: 'item'
            });
            //log.debug("itemCount", itemCount);

            //Begin: get Invoice Line item values for-loop functionality
            if (itemCount > 0) {
                var totalqty = 0
                for (var invoice_lineitems_k = 0; invoice_lineitems_k < itemCount; invoice_lineitems_k++) {
                    var k_quantity = loadRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: invoice_lineitems_k
                    });
                    if (k_quantity) {
                        k_quantity = parseFloat(k_quantity)
                    } else {
                        k_quantity = 0
                    }
                    totalqty = k_quantity + totalqty
                }
                //log.debug("totalqty", totalqty)
                var item_charges = parseFloat(handling_and_shippingcost) / parseFloat(totalqty)
                if (item_charges) {
                    item_charges = parseFloat(item_charges)
                } else {
                    item_charges = 0;
                }
                //log.debug("item_charges", item_charges)

                var total_value_in_ValDtls = 0;
                var total_item_charges_in_qty = 0;
                for (var invoice_lineitems_m = 0; invoice_lineitems_m < itemCount; invoice_lineitems_m++) {
                    var description = loadRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'description',
                        line: invoice_lineitems_m
                    });
                    if (description) {
                        description = description
                    } else {
                        description = ""
                    }
                    var invoice_goodorservice = loadRecord.getSublistText({
                        sublistId: 'item',
                        fieldId: 'custcol_indgst_invoice_goodorservice',
                        line: invoice_lineitems_m
                    });
                    if (invoice_goodorservice) {
                        invoice_goodorservice = invoice_goodorservice
                    } else {
                        invoice_goodorservice = ""
                    }
                    var bill_hsnsaccode = loadRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_indgst_bill_hsnsaccode',
                        line: invoice_lineitems_m
                    });
                    if (bill_hsnsaccode) {
                        bill_hsnsaccode = bill_hsnsaccode
                    } else {
                        bill_hsnsaccode = ""
                    }
                    var Item_grossamt = loadRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'grossamt',
                        line: invoice_lineitems_m
                    });
                    if (Item_grossamt) {
                        Item_grossamt = Item_grossamt
                    } else {
                        Item_grossamt = 0
                    }
                    if (nullCheck(bill_hsnsaccode)) {
                        var lookup_hsncode = search.lookupFields({    // get indiataxhsnandsaccod obj to hsnsacode
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
                        line: invoice_lineitems_m
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
                        line: invoice_lineitems_m
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
                        line: invoice_lineitems_m
                    });
                    if (units) {
                        units = units
                    } else {
                        units = ''
                    }
                    var rate = loadRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        line: invoice_lineitems_m
                    });
                    if (rate) {
                        rate = parseFloat(rate).toFixed(2)
                    } else {
                        rate = 0
                    }
                    var amount = loadRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: invoice_lineitems_m
                    });
                    if (amount) {
                        amount = parseFloat(amount)
                    } else {
                        amount = 0
                    }
                    var discounton_sale = loadRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_indgst_discounton_sale',
                        line: invoice_lineitems_m
                    });
                    if (discounton_sale) {
                        discounton_sale = parseFloat(discounton_sale)
                    } else {
                        discounton_sale = 0
                    }
                    var taxable_value = loadRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_indgst_taxable_value',
                        line: invoice_lineitems_m
                    });
                    if (taxable_value) {
                        taxable_value = parseFloat(taxable_value)
                    } else {
                        taxable_value = 0
                    }
                    var ass_amount = parseFloat(amount) - parseFloat(discounton_sale)

                    var taxrate1 = loadRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'taxrate1',
                        line: invoice_lineitems_m
                    });
                    if (taxrate1) {
                        taxrate1 = parseFloat(taxrate1)
                    } else {
                        taxrate1 = 0
                    }
                    var cgstamtforeinv = loadRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_indgst_invoice_cgstamtforeinv',
                        line: invoice_lineitems_m
                    });
                    if (cgstamtforeinv) {
                        cgstamtforeinv = parseFloat(cgstamtforeinv)
                    } else {
                        cgstamtforeinv = 0
                    }
                    var sgstamountforeinvoicin = loadRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_indgst_sgstamountforeinvoicin',
                        line: invoice_lineitems_m
                    });
                    if (sgstamountforeinvoicin) {
                        sgstamountforeinvoicin = parseFloat(sgstamountforeinvoicin)
                    } else {
                        sgstamountforeinvoicin = 0
                    }
                    var igsteinvoice = loadRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_indgst_invoice_igsteinvoice',
                        line: invoice_lineitems_m
                    });
                    if (igsteinvoice) {
                        igsteinvoice = parseFloat(igsteinvoice)
                    } else {
                        igsteinvoice = 0
                    }
                    var item_totItemVal = (parseFloat(amount) + parseFloat(igsteinvoice) + parseFloat(cgstamtforeinv) + parseFloat(sgstamountforeinvoicin) + parseFloat(item_charges_in_qty)) - parseFloat(discounton_sale)
                    itemArr.push({
                        "SlNo": invoice_lineitems_m + 1,
                        "PrdDesc": description,
                        "IsServc": invoice_goodorservice, // getting error
                        "HsnCd": hsncode_value, // getting error
                        "Barcde": '',
                        "Qty": quantity,
                        "FreeQty": 0,
                        "Unit": units,
                        "UnitPrice": rate,
                        "TotAmt": amount,
                        "Discount": discounton_sale,
                        "PreTaxVal": 0,
                        "AssAmt": ass_amount, //, taxable_value
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
                        "TotItemVal": item_totItemVal, //grossamt_charges_total,
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
            }
            //End: get Invoice Line item values for-loop functionality	

            // var Configuration_data = cleartax_library.ClearTax_Einvoice_library()
            // log.debug("Configuration_data", Configuration_data)

            //Begin: get shipping address saved-search functionality
            var shipping_obj = shippingAdressDetails(getRecId)
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
            // else
            // {
            // var shipto_satecode = state_code_cust
            // }
            //log.debug("shipto_satecode",shipto_satecode)

            //CR:start:08.04.2024 - get export details

            var shippingBillNumber = loadRecord.getValue({
                fieldId: 'custbody_vg_ewaybill_number'
            });

            shippingBillNumber = nullCheck(shippingBillNumber) ? shippingBillNumber : "";

            var shippingDate = loadRecord.getValue({
                fieldId: 'custbody_vg_inv_shipping_date'
            });

            if (nullCheck(shippingDate)) {

                var shipmonth = shippingDate.getMonth() + 1
                if (shipmonth < 10) {
                    shipmonth = "0" + shipmonth
                }
                var shipdate = shippingDate.getDate()
                if (shipdate < 10) {
                    shipdate = "0" + shipdate
                }
                var shippingformatteddate = shipdate + '/' + shipmonth + '/' + shippingDate.getFullYear()
                //log.debug("formatteddate", formatteddate)
                shippingformatteddate = String(shippingformatteddate).trim();
            }

            shippingDate = nullCheck(shippingDate) ? shippingDate : "";

            var shippingPortCode = loadRecord.getValue({
                fieldId: 'custbody_vg_shipping_port_code'
            });

            shippingPortCode = nullCheck(shippingPortCode) ? shippingPortCode : "";

            var exportCountryCode = loadRecord.getValue({
                fieldId: 'custbody_ctax_einvoice_coun_code'
            });

            var countryCodeName = "";

            if (nullCheck(exportCountryCode)) {

                var loadCountryRec = record.load({
                    type: 'customrecord_einvoice_country_master',
                    id: parseInt(exportCountryCode)
                });

                var countryCodeName = loadCountryRec.getText({
                    fieldId: 'custrecord_country_code'
                });

                countryCodeName = nullCheck(countryCodeName) ? countryCodeName : "";
            }


            //CR:end:08.04.2024 - get export details

            //start:Ewbdetl:25/04/2024 - adding ewaybill details

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


            //end:Ewbdetl:25/04/2024 - adding ewaybill details

            var accountId = runtime.accountId; // return the accountId
            var environment = runtime.envType; // PRODUCTION, SANDBOX, etc.
            // log.debug("environment", environment)
            var Configuration_data = ClearTax_Library_File.ClearTax_Einvoice_library()
            // log.debug("Configuration_data", Configuration_data)
            var get_environment_name = Configuration_data[environment]
            // log.debug("get_environment_name", get_environment_name)
            var auth_token = get_environment_name["AUTH_TOKEN"]
            // log.debug("auth_token", auth_token)
            var generate_irn_url = get_environment_name["GENERATE_IRN_URL"]
            // log.debug("generate_irn_url", generate_irn_url)

            var total_value = parseFloat(afterdisamt) + parseFloat(cgsttotal) + parseFloat(sgsttotal) + parseFloat(igsttotal) + parseFloat(handling_and_shippingcost)
            var total_exchangerate = parseFloat(total_value) * parseFloat(exchangerate)
            // start Invoice to ClearTax process
            var url = generate_irn_url;
            //log.debug("url", url)
            var headers = {
                "X-Cleartax-Auth-Token": auth_token,
                "gstin": subsidiary_obj_gstnum,
                "Content-Type": "application/json",
                "accept": "application/json",
            }
            var body_data = {};
            body_data = [{
                "transaction": {
                    "Version": "1.1", // hardcode
                    "TranDtls": {
                        "TaxSch": "GST", // hardcode
                        "SupTyp": supplytypecode,
                        "RegRev": '',
                        "EcmGstin": null,
                        "IgstOnIntra": ''
                    },
                    "DocDtls": {
                        "Typ": "INV", // hardcode
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
                        "Stcd": state_code_cust, //customer_obj_state, 
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
                    "ShipDtls": {
                        "Gstin": customer_obj_gst,
                        "LglNm": customer_obj_companyname,
                        "TrdNm": customername,
                        "Addr1": shipToAddressLine1,
                        "Addr2": shipToAddressLine2,
                        "Loc": shipToAddressCity,
                        "Pin": shipToAddressZip,
                        "Stcd": shipto_satecode, //shipToAddressState //state_code_cust
                    },
                    "ItemList": itemArr,
                    "ValDtls": {
                        "AssVal": afterdisamt, //, subtotal
                        "CgstVal": cgsttotal,
                        "SgstVal": sgsttotal,
                        "IgstVal": igsttotal,
                        "CesVal": 0,
                        "StCesVal": 0,
                        "Discount": 0, //discounttotal, //total_item_charges_in_qty
                        "OthChrg": 0, //,handling_and_shippingcost
                        "RndOffAmt": 0,
                        "TotInvVal": total_value, //total_value_in_ValDtls,
                        "TotInvValFc": total_exchangerate //_exchangeamount 
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
                        "Url": "https://einv-apisandbox.nic.in", // hardcode
                        "Docs": '',
                        "Info": ''
                    }],
                    "ExpDtls": {
                        "ShipBNo": shippingBillNumber, //CR:08.04.2024 - add shippingBillNumber
                        "ShipBDt": shippingformatteddate, //CR:08.04.2024 - add shippingDate
                        "Port": shippingPortCode,//CR:08.04.2024 - add shippingPortCode
                        "RefClm": '',
                        "ForCur": '',
                        "CntCode": countryCodeName//CR:08.04.2024 - add countryCodeName
                    },
                    "EwbDtls": {
                        "TransId": transport_id,
                        "TransName": transport_name,
                        "Distance": transport_distance,
                        "TransDocNo": transport_doc_no,
                        "TransDocDt": formattedtransportdate,
                        "VehNo": transport_vehicle_no,
                        "VehType": transport_vehicle_type,
                        "TransMode": transport_mode
                    }
                },
                "custom_fields": {
                    "customfieldLable1": "CustomFieldValue1", // hardcode
                    "customfieldLable2": "CustomFieldValue2", // hardcode
                    "customfieldLable3": "CustomFieldValue3"  // hardcode
                }
            }]
            log.debug({
                title: 'bodyResp1',
                details: JSON.stringify(body_data)
            });
            var response_irn = https.put({
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
                fieldId: 'custbody_ctax_einvoice_response',
                value: response_irn.body
            });
            loadRecord.setValue({
                fieldId: 'custbody_ctax_einvoice_request',
                value: JSON.stringify(body_data)
            });
            if (response_irn.code == 200) {  //if response code got 200 then this code will execute
                var parseObdy = JSON.parse(response_irn.body)
                var error = parseObdy[0]["govt_response"]["Success"]
                //log.debug("error", error)
                if (nullCheck(error) && error == "N") {  //if response code got 200 and success got 'N' then this code will execute
                    var get_error = parseObdy[0]["govt_response"]["ErrorDetails"][0]["error_message"]
                } else if (nullCheck(error) && error == "Y") { //if response code got 200 and success get 'Y' then this code will execut
                    var parseObdy_AckNo = parseObdy[0]["govt_response"]["AckNo"]
                    var parseObdy_SignedQRCode = parseObdy[0]["govt_response"]["SignedQRCode"]
                    var parseObdy_Irn = parseObdy[0]["govt_response"]["Irn"]
                    var parseObdy_Status = parseObdy[0]["govt_response"]["Status"]
                    var parseObdy_AckDt = parseObdy[0]["govt_response"]["AckDt"]
                    var dateformat = new Date(String(parseObdy_AckDt))
                    /*var month = dateformat.getMonth() + 1
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
                    var str_date_Time = month + '/' + date + '/' + fyllyear + ' ' + hours + ':' + minutes + ':' + seconds + ' ' + ampm;*/
                    //str_date_Time = String(str_date_Time)
                    //log.debug("str_date_Time", str_date_Time)
                    var formattedTime = format.parse({
                        value: dateformat,
                        type: format.Type.DATETIMETZ
                    })
                    //log.debug("formattedTime", formattedTime)
                    loadRecord.setValue({
                        fieldId: 'custbody_ctax_einvoice_transfer',
                        value: true
                    });
                    loadRecord.setValue({
                        fieldId: 'custbody_ctax_einvoice_ack_no',
                        value: parseObdy_AckNo
                    });
                    loadRecord.setValue({
                        fieldId: 'custbody_ctax_einvoice_qrcode',
                        value: parseObdy_SignedQRCode
                    });
                    loadRecord.setValue({
                        fieldId: 'custbody_ctax_einvoice_irn',
                        value: parseObdy_Irn
                    });
                    loadRecord.setValue({
                        fieldId: 'custbody_ctax_einvoice_status',
                        value: parseObdy_Status
                    });
                    loadRecord.setValue({
                        fieldId: 'custbody_ctax_einvoice_ack_date',
                        value: formattedTime
                    });


                    //start:Ewbdetl:25/04/2024 - storing ewaybill details

                    var parseObdy_BillNo = parseObdy[0]["govt_response"]["EwbNo"]
                    var parseObdy_Irn = parseObdy[0]["govt_response"]["Irn"]
                    var parseObdy_AckDt = parseObdy[0]["govt_response"]["EwbDt"]
                    if (nullCheck(parseObdy_AckDt)) {

                        // var dateformat = new Date(String(parseObdy_AckDt))

                        // var formattedTime = format.parse({
                        //     value: parseObdy_AckDt,
                        //     type: format.Type.DATETIME,
                        //     timezone: format.Timezone.ETC_GMT_MINUS_1
                        // })
                        // log.debug("formattedTime", formattedTime);

                        var formattedTime = format.format({
                            value: parseObdy_AckDt,
                            type: format.Type.DATETIME,
                            timezone: format.Timezone.ETC_GMT_MINUS_1
                        })

                        loadRecord.setValue({
                            fieldId: 'custbody_ctax_ewaybill_ack_date',
                            value: new Date(formattedTime)
                        });
                    }

                    var parseObdy_ewaybill_valid_date = parseObdy[0]["govt_response"]["EwbValidTill"]

                    if (nullCheck(parseObdy_ewaybill_valid_date)) {

                        // var parseObdy_ewaybill_valid_dateformat = new Date(String(parseObdy_ewaybill_valid_date))

                        var formattedTime_valid = format.parse({
                            value: parseObdy_ewaybill_valid_date,
                            type: format.Type.DATETIMETZ,
                            timezone: format.Timezone.ETC_GMT_MINUS_1
                        });

                        loadRecord.setValue({
                            fieldId: 'custbody_ctax_ewaybill_validtill',
                            value: new Date(String(formattedTime_valid))
                        });
                    }

                    if (nullCheck(parseObdy_BillNo)) {

                        loadRecord.setValue({
                            fieldId: 'custbody_ctax_ewb_number',
                            value: String(parseObdy_BillNo)
                        });
                        // log.debug("parseObdy_BillNo", parseObdy_BillNo)

                        loadRecord.setValue({
                            fieldId: 'custbody_ctax_ewaybill_transfer',
                            value: true
                        });

                        if (nullCheck(parseObdy_Irn)) {

                            loadRecord.setValue({
                                fieldId: 'custbody_ctax_ewaybill_irn',
                                value: parseObdy_Irn
                            });
                            // log.debug("parseObdy_Irn", parseObdy_Irn)
                        }

                        loadRecord.setValue({
                            fieldId: 'custbody_ctax_ewb_status',
                            value: 1 //Generated
                        });
                        // log.debug("parseObdy_Status", parseObdy_Status)
                    }

                    //end:Ewbdetl:25/04/2024 - storing ewaybill details

                }
            }
            // End Invoice to ClearTax process

            var recordId = loadRecord.save({    //submit loadRecord obj
                enableSourcing: true,
                ignoreMandatoryFields: true
            });

            redirect.toRecord({
                type: getRecType,
                id: getRecId,
            });

        } catch (err) {
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
    //End: ClearTax_Generate_IRN_Cli functionality

    //Begin: shippingAdressDetails functionality
    function shippingAdressDetails(getRecId) {
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
                ["internalid", "anyof", getRecId]
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

    //Begin: subsidiarySearchObj functionality	-- add on 17-06-2022
    function subsidiarySearchObj(subsidiaryId) {
        var subsidiary_obj_addr1 = "";
        var subsidiary_obj_addr2 = "";
        var subsidiary_obj_city = "";
        var subsidiary_obj_zip = "";
        var subsidiary_obj_addrphone = "";
        var obj = {};
        var subsidiarySearchObj = search.create({
            type: "subsidiary",
            filters:
                [
                    ["isinactive", "is", "F"],
                    "AND",
                    ["internalid", "anyof", subsidiaryId]
                ],
            columns:
                [
                    search.createColumn({ name: "address1", label: "Address 1" }),
                    search.createColumn({ name: "address2", label: "Address 2" }),
                    search.createColumn({ name: "city", label: "City" }),
                    search.createColumn({ name: "zip", label: "Zip" }),
                    search.createColumn({ name: "phone", label: "Phone" })
                ]
        });
        var searchResultCount = subsidiarySearchObj.runPaged().count;
        log.debug("subsidiarySearchObj result count", searchResultCount);
        subsidiarySearchObj.run().each(function (result) {
            subsidiary_obj_addr1 = result.getValue("address1")
            subsidiary_obj_addr2 = result.getValue("address2")
            subsidiary_obj_city = result.getValue("city")
            subsidiary_obj_zip = result.getValue("zip")
            subsidiary_obj_addrphone = result.getValue("phone")
            return true;
        });
        obj.subsidiary_obj_addr1 = subsidiary_obj_addr1;
        obj.subsidiary_obj_addr2 = subsidiary_obj_addr2;
        obj.subsidiary_obj_city = subsidiary_obj_city;
        obj.subsidiary_obj_zip = subsidiary_obj_zip;
        obj.subsidiary_obj_addrphone = subsidiary_obj_addrphone;
        return obj;
    }
    //Begin: subsidiarySearchObj functionality

    //Begin: nullCheck functionality
    function nullCheck(value) {
        if (value != 'null' && value != '' && value != undefined && value != 'NaN') {
            return true;
        } else {
            return false;
        }
    }
    //End: nullCheck functionality
    return {
        onRequest: onRequest
    }
});