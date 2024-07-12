/*----------------------------------------------------------------------------------------------
        Company Name 	:	Nuvista Technologies Pvt Ltd
        Script Name 	:	ClearTax Generate Consolidated EWB cli
        Author 			:  	NVT Employee 
        Date            :   17/04/2024
        Description		:  

------------------------------------------------------------------------------------------------*/
/**
    @NApiVersion 2.1
    @NScriptType ClientScript
*/
define(["N/record", "N/currentRecord", "N/format", 'N/search', 'N/ui/message', 'N/url', 'N/runtime', 'N/ui/dialog'], function (record, currentRecord, format, search, message, url, runtime, dialog) {

    function pageInit(context) {

        try {

            var currentrecord = currentRecord.get();

            var url = new URL(document.location.href);
            var page_status = url.searchParams.get('custpage_status');
            // log.debug('page_status', page_status);
            var invoiceList = url.searchParams.get('custpage_inv');
            var postMessage = url.searchParams.get('custpage_msg');

            let params = new URLSearchParams(url.search); 

            if (page_status == 'error') {

                dialog.alert({
                    title: 'Error',
                    message: 'Consolidated Ewaybill not generated for this invoices - ' + invoiceList + '. Error is - ' + postMessage
                });

                // params.set('custpage_status', 'blank'); 

                // setInterval(function () {
                    
                //     location.href = params;

                // },20000)
                
                currentrecord.setValue({
                    fieldId: 'custpage_ctax_result',
                    value: postMessage
                })

            }

            if (page_status == 'pass') {

                dialog.alert({
                    title: 'Success',
                    message: 'Consolidated Ewaybill generated for this invoices - ' + invoiceList + '. Generated Consolidated Ewaybill Number is - ' + postMessage
                });

            }


        }
        catch (e) {

            log.error('error in pageInit() function', e.toString());
        }
    }

    function fieldChanged(context) {

        try {

            var currentRec = currentRecord.get(); // return current record obj

            if (context.fieldId == 'custpage_ctax_transport_date_fil' || context.fieldId == 'custpage_ctax_vehicle_no_fil') {

                var transport_doc_date = currentRec.getValue({
                    fieldId: 'custpage_ctax_transport_date_fil'
                });

                if (nullCheck(transport_doc_date)) {

                    transport_doc_date = format.format({
                        value: transport_doc_date,
                        type: format.Type.DATE
                    });
                }
                var vehicle_no = currentRec.getValue({
                    fieldId: 'custpage_ctax_vehicle_no_fil'
                });

                // alert(transport_doc_date);
                // alert(vehicle_no);

                var s_sut_url = url.resolveScript({    // call suitelet script
                    scriptId: "customscript_cleartax_generat_conewb_sui",
                    deploymentId: "customdeploy_cleartax_generat_conewb_sui"
                });
                s_sut_url += '&custpage_doc_date=' + transport_doc_date + '&custpage_vehicle_no=' + vehicle_no;
                window.onbeforeunload = null;

                window.open(s_sut_url, "_self")  // reload the same page

            }
        }
        catch (e) {

            log.error('error in fieldChanged() function', e.toString())
        }
    }

    function saveRecord(context) {

        try {

            var currentRec = currentRecord.get();

            var getInvoiceListCnt = currentRec.getLineCount({
                sublistId: 'custpage_ctax_invoices'
            });

            var invCheckboxCount = 0;
            var selectedInvListArr = [];

            for (var invcnt = 0; invcnt < getInvoiceListCnt; invcnt++) {

                var invSelectCheck = currentRec.getSublistValue({
                    sublistId: 'custpage_ctax_invoices',
                    fieldId: 'custpage_ctax_checkbox',
                    line: invcnt
                });
                // alert(invSelectCheck)

                if (invSelectCheck == false) {

                    invCheckboxCount++;
                }
                else {

                    var invVehicleNumber = currentRec.getSublistValue({
                        sublistId: 'custpage_ctax_invoices',
                        fieldId: 'custpage_ctax_vehicle_number',
                        line: invcnt
                    });

                    var invFromPlace = currentRec.getSublistValue({
                        sublistId: 'custpage_ctax_invoices',
                        fieldId: 'custpage_ctax_from_place',
                        line: invcnt
                    });

                    var invFromState = currentRec.getSublistValue({
                        sublistId: 'custpage_ctax_invoices',
                        fieldId: 'custpage_ctax_from_state',
                        line: invcnt
                    });

                    var invTransportDocNo = currentRec.getSublistValue({
                        sublistId: 'custpage_ctax_invoices',
                        fieldId: 'custpage_ctax_trans_doc_no',
                        line: invcnt
                    });

                    var invTransportDocDate = currentRec.getSublistValue({
                        sublistId: 'custpage_ctax_invoices',
                        fieldId: 'custpage_ctax_trans_doc_date',
                        line: invcnt
                    });

                    var invTransportModeTransport = currentRec.getSublistValue({
                        sublistId: 'custpage_ctax_invoices',
                        fieldId: 'custpage_ctax_mode_transport',
                        line: invcnt
                    });

                    selectedInvListArr.push({
                        invVehicleNumber: invVehicleNumber,
                        invFromPlace: invFromPlace,
                        invFromState: invFromState,
                        invTransportDocNo: invTransportDocNo,
                        invTransportDocDate: invTransportDocDate,
                        invTransportModeTransport: invTransportModeTransport
                    });
                }
            }

            if (invCheckboxCount == getInvoiceListCnt) {

                alert('Please select at least one invoice from the line-level data.');

                return false;
            }
            else {

                if (nullCheck(selectedInvListArr) && selectedInvListArr.length > 1) {

                    // alert(JSON.stringify(selectedInvListArr[0]));
                    // alert(JSON.stringify(selectedInvListArr));

                    var obj2 = selectedInvListArr;
                    var invfirstobj = selectedInvListArr[0];

                    var obj1 = [];
                    obj1.push(invfirstobj);
                    // alert(JSON.stringify(obj1));

                    var invDataSameCheck = obj2.filter(o1 => !obj1.some(o2 => o1.invVehicleNumber === o2.invVehicleNumber && o1.invFromPlace === o2.invFromPlace && o1.invFromState === o2.invFromState && o1.invTransportDocNo === o2.invTransportDocNo && o1.invTransportDocDate === o2.invTransportDocDate && o1.invTransportModeTransport === o2.invTransportModeTransport));

                    // alert(JSON.stringify(invDataSameCheck));

                    if (nullCheck(invDataSameCheck)) {

                        // alert(invDataSameCheck);

                        alert('You must select the same Invoices or E-Waybill data from line-level.');
                        return false;

                    }
                    else {

                        return true;
                    }

                }
                else {

                    return true;
                }
            }
        }
        catch (e) {

            log.error('error in saveRecord() function', e.toString());
        }

    }

    function refresh_consolidated_ewb_page() {

        try {

            var currentRec = currentRecord.get();

            var suiteletUrl = url.resolveScript({
                scriptId: 'customscript_cleartax_generat_conewb_sui',
                deploymentId: 'customdeploy_cleartax_generat_conewb_sui',
            });

            if (nullCheck(suiteletUrl)) {

                location.href = suiteletUrl;

            }

        }
        catch (e) {

            log.error('error in refresh_consolidated_ewb_page() function', e.toString());
        }
    }
    return {
       // pageInit: pageInit,
        fieldChanged: fieldChanged,
        saveRecord: saveRecord,
        refresh_consolidated_ewb_page: refresh_consolidated_ewb_page
    }



    //Begin: nullCheck functionality
    function nullCheck(value) {
        if (value != null && value != '' && value != undefined)
            return true;
        else
            return false;
    }
    //End: nullCheck functionality
})