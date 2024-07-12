/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
 define(['N/record', 'N/search', 'N/config', 'N/format', 'N/error', 'N/runtime'],
	function(record, search, config, format, error, runtime) {
		function UES_Invoice_get_taxamt_and_set_gst_amt(context) {
			if (context.type != "delete") {
				try {
					var newRecord = context.newRecord; //return record obj
					//log.debug("newRecord", newRecord)
					var recordType = newRecord.type; //return record type
					//log.debug("recordType", recordType)
					var recordId = newRecord.id; //return record id
					//log.debug("recordId", recordId)
					var Invoice_obj = record.load({
						type: recordType,
						id: recordId,
						isDynamic: true
					});
					log.debug("Invoice_obj", Invoice_obj)
					var sales_classification = Invoice_obj.getValue({
						fieldId: 'custbody_indgst_sales_classificationof'
					})
					var linecount = Invoice_obj.getLineCount({
						sublistId: 'item'
					});
					var discountrate = Invoice_obj.getValue({
						fieldId: 'discountrate'
					})
					if (nullCheck(discountrate)) {
						var _discountrate = Math.abs(discountrate)
						log.debug("_discountrate", _discountrate)
						if (sales_classification == 1) {
							if (linecount > 0) {
								for (var x = 0; x < linecount; x++) {
									Invoice_obj.selectLine({
										sublistId: "item",
										line: x
									})
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_invoice_serialno',
										value: x + 1
									});
									var amount = Invoice_obj.getCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'amount',
									});
									if (amount) {
										var discount_value = parseFloat(amount) * parseFloat(_discountrate) / 100
										var after_discount_amount = parseFloat(amount) - parseFloat(discount_value)
									} else {
										discount_value = 0;
										after_discount_amount = 0;
									}
									log.debug("discount_value", discount_value)
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcolcustcol_indgst_discounton_sale',
										value: discount_value
									});
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcolcustcol_indgst_taxable_value',
										value: after_discount_amount
									});
									var taxable_value = Invoice_obj.getCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcolcustcol_indgst_taxable_value',
									});
									if (nullCheck(taxable_value)) {
										var taxrate1 = Invoice_obj.getCurrentSublistValue({
											sublistId: 'item',
											fieldId: 'taxrate1',
										});
										// var taxrate_split = taxrate1.split("%")
										    // taxrate_split = parseFloat(taxrate_split[0])
										var igst_value = parseFloat(taxable_value) * parseFloat(taxrate1) / 100
									}
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_invoice_igsteinvoice',
										value: igst_value
									});
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_invoice_cgstamtforeinv',
										value: ""
									}); //CR:10.06.2024 - put blank
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_sgstamountforeinvoicin',
										value: ""
									}); //CR:10.06.2024 - put blank
									Invoice_obj.commitLine({
										sublistId: 'item'
									})
								}
							}
						} 
						else if (sales_classification == 2) {
							if (linecount > 0) {
								for (var x = 0; x < linecount; x++) {

									Invoice_obj.selectLine({
										sublistId: "item",
										line: x
									})
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_invoice_serialno',
										value: x + 1
									});
									var amount = Invoice_obj.getCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'amount',
									});
									if (amount) {
										var discount_value = parseFloat(amount) * parseFloat(_discountrate) / 100
										var after_discount_amount = parseFloat(amount) - parseFloat(discount_value)
									} else {
										discount_value = 0;
										after_discount_amount = 0;
									}
									log.debug("discount_value", discount_value)
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcolcustcol_indgst_discounton_sale',
										value: discount_value
									});
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcolcustcol_indgst_taxable_value',
										value: after_discount_amount
									});
									var taxable_value = Invoice_obj.getCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcolcustcol_indgst_taxable_value',
									});
									if (nullCheck(taxable_value)) {
										var taxrate1 = Invoice_obj.getCurrentSublistValue({
											sublistId: 'item',
											fieldId: 'taxrate1',
										});
										// var taxrate_split = taxrate1.split("%")
										    // taxrate_split = parseFloat(taxrate_split[0])
										var igst_value = parseFloat(taxable_value) * parseFloat(taxrate1) / 100
									}
									if (igst_value) {
										igst_value = parseFloat(igst_value) / 2
									}
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_invoice_cgstamtforeinv',
										value: igst_value
									});

									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_sgstamountforeinvoicin',
										value: igst_value
									});

									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_invoice_igsteinvoice',
										value: ""
									}); //CR:10.06.2024 - put blank

									Invoice_obj.commitLine({
										sublistId: 'item'
									})
								}

							}
						} else {

							if (linecount > 0) {
								for (var x = 0; x < linecount; x++) {

									Invoice_obj.selectLine({
										sublistId: "item",
										line: x
									})
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_invoice_serialno',
										value: x + 1
									});
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_invoice_igsteinvoice',
										value: ""
									});
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_invoice_cgstamtforeinv',
										value: ""
									});
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_sgstamountforeinvoicin',
										value: ""
									});
									Invoice_obj.commitLine({
										sublistId: 'item'
									})

								}
							}
						}
					} else {
						if (sales_classification == 1) {
							if (linecount > 0) {
								for (var x = 0; x < linecount; x++) {

									Invoice_obj.selectLine({
										sublistId: "item",
										line: x
									})
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_invoice_serialno',
										value: x + 1
									});
									var tax_amt = Invoice_obj.getCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'tax1amt',
									});
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_invoice_igsteinvoice',
										value: tax_amt
									});
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_invoice_cgstamtforeinv',
										value: ""
									}); //CR:10.06.2024 - put blank
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_sgstamountforeinvoicin',
										value: ""
									}); //CR:10.06.2024 - put blank
									Invoice_obj.commitLine({
										sublistId: 'item'
									})
								}
							}
						} else if (sales_classification == 2) {
							if (linecount > 0) {
								for (var x = 0; x < linecount; x++) {

									Invoice_obj.selectLine({
										sublistId: "item",
										line: x
									})
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_invoice_serialno',
										value: x + 1
									});
									var tax_amt = Invoice_obj.getCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'tax1amt',
									});
									if (tax_amt) {
										tax_amt = parseFloat(tax_amt) / 2
									}
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_invoice_cgstamtforeinv',
										value: tax_amt
									});
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_sgstamountforeinvoicin',
										value: tax_amt
									});
									
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_invoice_igsteinvoice',
										value: ""
									}); //CR:10.06.2024 - put blank
									Invoice_obj.commitLine({
										sublistId: 'item'
									})
								}
							}
						} else {

							if (linecount > 0) {
								for (var x = 0; x < linecount; x++) {

									Invoice_obj.selectLine({
										sublistId: "item",
										line: x
									})
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_invoice_serialno',
										value: x + 1
									});
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_invoice_igsteinvoice',
										value: ""
									});
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_invoice_cgstamtforeinv',
										value: ""
									});
									Invoice_obj.setCurrentSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_indgst_sgstamountforeinvoicin',
										value: ""
									});
									Invoice_obj.commitLine({
										sublistId: 'item'
									})
								}
							}
						}
					}
				 var recordId = Invoice_obj.save({
								enableSourcing: true,
								ignoreMandatoryFields: true
								});
				log.debug("recordId", recordId)
				
				} catch (ex) {
					log.debug("error", ex)
				}
			}
		}
		return {
			afterSubmit: UES_Invoice_get_taxamt_and_set_gst_amt
		};

		function nullCheck(value) {
			if (value != null && value != '' && value != undefined)
				return true;
			else
				return false;
		}

	});