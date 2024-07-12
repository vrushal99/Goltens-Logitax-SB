/*----------------------------------------------------------------------------------------------
		Company Name 	:	Nuvista Technologies Pvt Ltd
		Script Name 	:	ClearTax Initiate Multi-Vehicle E-Waybills cli
		Author 			:  	NVT Employee 
		Date            :   11-05-2022
		Description		:   1. This Script is created for Initiate Multi-Vehicle E-Waybills Print
		                    (When E-Invoice print button is triggered, script is invoked to display a message "Wait for sometime, system is Processing")

------------------------------------------------------------------------------------------------*/
/**
	@NApiVersion 2.x
	@NScriptType ClientScript
*/
define(["N/record", "N/currentRecord", "N/format", 'N/search', 'N/ui/message', 'N/url','N/ui/dialog',], function(record, currentRecord, format, search, message, url,dialog) {
	//Begin: callClearTaxMultiVehicleEwaybill functionality
	function callClearTaxMultiVehicleEwaybill() {
		try {
			var currentRec = currentRecord.get(); // return current record obj
			var recordId = currentRec.id; // return record ID
			var recordType = currentRec.type; // return record Type
			var myMsg2 = message.create({  // return information msg
				title: 'System processing your request please wait for sometime....',
				type: message.Type.INFORMATION
			});
			myMsg2.show();

			var s_sut_url = url.resolveScript({   // call suitelet script
				scriptId: "customscript_cleartax_multivehicle_esut",
				deploymentId: "customdeploy_cleartax_multivehicle_ebsut"
			    });
			s_sut_url += '&custpage_recId=' + recordId + '&custpage_recType=' + recordType;
			window.open(s_sut_url, "_self")  // reload the same page


		} catch (ex) {
			alert(ex)
		}
	}
    //End: callClearTaxWaybill functionality 
	
	//Begin: pageInit functionality
	 function pageInit(context) {
			//alert("HIII")
        try {
            
            var url = new URL(document.location.href);
			//alert(url.searchParams)
            var page_pass = url.searchParams.get('custpage_multi_success');
			var page_fail = url.searchParams.get('custpage_multi_error');
			var getRecType = url.searchParams.get('getRecType');
			var getRecId = url.searchParams.get('custpage_recId');
			
						//alert(page_pass)
						//alert(page_fail)
            if (nullCheck(page_fail) || nullCheck(page_pass)) {
				var message = '';
				if(nullCheck(page_fail)){
					message = page_fail;
				}
				
				if(nullCheck(page_pass)){
					message = page_pass;
				}
				
				var options = {
					title: "Alert",
					  message: message,
					  buttons: [
						{ label: "OK", value: 1 }
					  ],
				};
				function success(result) {
					if(result === 1){ 
						/*alert(getRecId);
						var output = url.resolveRecord({
							recordType: 'invoice',
							recordId: getRecId,
							isEditMode: false
						});
						 window.location.href = output;*/
						 var s_sut_url = url.resolveScript({   // call suitelet script
							scriptId: "customscript_cleartax_multivehicle_esut",
							deploymentId: "customdeploy_cleartax_multivehicle_ebsut"
							});
						s_sut_url += '&custpage_recId=' + recordId + '&custpage_recType=' + recordType;
						window.open(s_sut_url, "_self") 
						//window.open(output, '_self');
					}
				}  
				function failure(reason) {
					console.log("Failure: " + reason);
				}
				dialog.create(options).then(success).catch(failure);
				return true;
				

            }

           

        }
        catch (e) {
            
            console.log('error in pageInit() function', e.toString());
        }
    }
	 function saveRecord(context) {

        var currentRec = currentRecord.get();

            var lineCount = currentRec.getLineCount({
                sublistId: 'custpage_ctax_vehicle_list'
            });
			
			if(!nullCheck(lineCount)){
				alert("Enter Atlest one line");
				return false;
			}
			var totalQuantity = currentRec.getValue({fieldId:"custpage_ctax_total_quantity"})
            // alert("totalQuantity");
            var line_lvl_quantity = 0;
			for (var line = 0; line < lineCount; line++) {

					var vehicle_number_ = currentRec.getSublistValue({
						sublistId: 'custpage_ctax_vehicle_list',
						fieldId: 'custpage_ctax_vehicle_number',
						line: line
					});
					log.debug('vehicle_number_', vehicle_number_);

					var trans_doc_number_ = currentRec.getSublistValue({
						sublistId: 'custpage_ctax_vehicle_list',
						fieldId: 'custpage_ctax_trans_doc_no',
						line: line
					});

					var trans_doc_date = currentRec.getSublistValue({
						sublistId: 'custpage_ctax_vehicle_list',
						fieldId: 'custpage_ctax_doc_date',
						line: line
					});

					var vehicle_quantity = currentRec.getSublistValue({
						sublistId: 'custpage_ctax_vehicle_list',
						fieldId: 'custpage_ctax_quantity',
						line: line
					});
					line_lvl_quantity = Number(line_lvl_quantity)+Number(vehicle_quantity);
					

				
			}
		//	log.debug("vehicle_detailsarr:::::::", vehicle_detailsarr);
		//	log.debug("line_lvl_quantity:::::::", line_lvl_quantity);
			//alert("line_lvl_quantity");
			if(Number(totalQuantity)<Number(line_lvl_quantity)){
				alert("Sum of vehicle quantity below total quantity");
				return false;
			}
      // alert("saverec");
        return true;
    }
	return {
		pageInit: pageInit,
		callClearTaxMultiVehicleEwaybill: callClearTaxMultiVehicleEwaybill,
		saveRecord:saveRecord
	}
    	//End: pageInit functionality
		
	//Begin: getNS_url_param functionality
	function getNS_url_param(name, url) {
		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regexS = "[\\?&]" + name + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(url);
		if (results == null)
			return "";
		else
			return results[1];
	}
 
    //End: getNS_url_param functionality
	function nullCheck(value) {
		if (value != null && value != '' && value != undefined)
			return true;
		else
			return false;
	}
})