/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

var jpdbBaseURL = 'http://api.login2explore.com:5577';
var jpdbIRL = '/api/irl';
var jpbdIML = '/api/iml';
var deliveryDatabaseName = 'DELIVERY-DB';
var shipmentRelationName = 'SHIPMENT-TABLE';
var connectionToken = '90931809|-31949306942217902|90960666';

$('#shipmentNo').focus();

// Function for return alert HTML code according to the status of the response
function alertHandlerHTML(status, message) {
    // 1--> Success , 0--> Warning
    if (status === 1) {
        return `<div class="alert  alert-primary d-flex align-items-center alert-dismissible " role="alert">
                <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use xlink:href="#info-fill"/></svg>
                <div>
                  <strong>Success!</strong> ${message}
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>`;
    } else {
        return `<div class="alert  alert-warning d-flex align-items-center alert-dismissible" role="alert">
        <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg>
        <div>
          <strong>Warning!</strong> ${message}
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`;
    }
}

// Function for append alert message into alert div
function alertHandler(status, message) {
    var alertHTML = alertHandlerHTML(status, message);
    let alertDiv = document.createElement('div');
    alertDiv.innerHTML = alertHTML;
    $('#disposalAlertContainer').append(alertDiv);
}

// Function for save record number into local storage
function saveRecNoToLocalStorage(jsonObject) {
    var lvData = JSON.parse(jsonObject.data);
    localStorage.setItem('recordNo', lvData.rec_no);
}

// Function for disable all elements on the page except shipment number input field
function disableAllFeildExceptShipmentNo() {
    $('#description').prop('disabled', true);
    $('#source').prop('disabled', true);
    $('#shippingDate').prop('disabled', true);
    $('#expectedDeliveryDate').prop('disabled', true);
    $('#saveBtn').prop('disabled', true);
    $('#updateBtn').prop('disabled', true);
    $('#resetBtn').prop('disabled', true);
}

// Function for reset form data and disable all other fields except shipment number
function resetForm() {
    $('#shipmentNo').val("");
    $('#description').val("");
    $('#source').val("");
    $('#shippingDate').val("");
    $('#expectedDeliveryDate').val("");

    $('#shipmentNo').prop('disabled', false);
    disableAllFeildExceptShipmentNo();
    $('#shipmentNo').focus();
}

// Function for fill data if shipment already exists in the database
function fillData(jsonObject) {
    if (jsonObject === "") {
        $('#description').val("");
        $('#source').val("");
        $('#shippingDate').val("");
        $('#expectedDeliveryDate').val("");
    } else {
        // Shipment record number saved to local storage
        saveRecNoToLocalStorage(jsonObject);

        // Parse JSON object into JavaScript object
        var data = JSON.parse(jsonObject.data).record;

        $('#description').val(data.description);
        $('#source').val(data.source);
        $('#shippingDate').val(data.shippingDate);
        $('#expectedDeliveryDate').val(data.expectedDeliveryDate);
    }
}

// Function to check the validity of Shipping Date and Expected Delivery Date
function validateDates() {
    var inputShippingDate = $('#shippingDate').val();
    var inputExpectedDeliveryDate = $('#expectedDeliveryDate').val();
    inputShippingDate = new Date(inputShippingDate);
    inputExpectedDeliveryDate = new Date(inputExpectedDeliveryDate);

    // Expected Delivery Date should be greater than Shipping Date
    return inputShippingDate.getTime() < inputExpectedDeliveryDate.getTime();
}

// Function to check the validity of user input data
function validateFormData() {
    var shipmentNo, description, source, shippingDate, expectedDeliveryDate;
    shipmentNo = $('#shipmentNo').val();
    description = $('#description').val();
    source = $('#source').val();
    shippingDate = $('#shippingDate').val();
    expectedDeliveryDate = $('#expectedDeliveryDate').val();

    if (shipmentNo === '') {
        alertHandler(0, 'Shipment No. Missing');
        $('#shipmentNo').focus();
        return "";
    }

    if (shipmentNo <= 0) {
        alertHandler(0, 'Invalid Shipment No.');
        $('#shipmentNo').focus();
        return "";
    }

    if (description === '') {
        alertHandler(0, 'Description is Missing');
        $('#description').focus();
        return "";
    }

    if (source === '') {
        alertHandler(0, 'Source is Missing');
        $('#source').focus();
        return "";
    }

    if (shippingDate === '') {
        alertHandler(0, 'Shipping Date is Missing');
        $('#shippingDate').focus();
        return "";
    }

    if (expectedDeliveryDate === '') {
        alertHandler(0, 'Expected Delivery Date is Missing');
        $('#expectedDeliveryDate').focus();
        return "";
    }

    if (!validateDates()) {
        alertHandler(0, 'Invalid Dates (i.e Expected Delivery Date should be greater than Shipping Date)');
        $('#expectedDeliveryDate').focus();
        return "";
    }

    // If data is valid, create a JSON object, otherwise return an empty string (denoting that data is not valid)
    var jsonObj = {
        shipmentNo: shipmentNo,
        description: description,
        source: source,
        shippingDate: shippingDate,
        expectedDeliveryDate: expectedDeliveryDate
    };

    // Convert JavaScript object into a JSON string
    return JSON.stringify(jsonObj);
}

// Function to return stringified JSON object which contains the shipment number
function getShipmentNoAsJsonObj() {
    var shipmentNo = $('#shipmentNo').val();
    var jsonStr = {
        shipmentNo: shipmentNo
    };
    return JSON.stringify(jsonStr);
}

// Function to query details of an existing shipment
function getShipmentData() {
    if ($('#shipmentNo').val() === "") { // if shipment number is not given then disable all fields
        disableAllFeildExceptShipmentNo();
    } else if ($('#shipmentNo').val() < 1) { // if shipment number is not valid (i.e shipment-no <1)
        disableAllFeildExceptShipmentNo();
        alertHandler(0, 'Invalid Shipment No.');
        $('#shipmentNo').focus();
    } else { // if shipment number is valid
        var shipmentNoJsonObj = getShipmentNoAsJsonObj();

        // create GET Request object
        var getRequest = createGET_BY_KEYRequest(connectionToken, deliveryDatabaseName, shipmentRelationName, shipmentNoJsonObj);

        jQuery.ajaxSetup({
            async: false
        });
        // make GET request
        var resJsonObj = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, jpdbIRL);
        jQuery.ajaxSetup({
            async: true
        });

        // Enable all fields
        $('#shipmentNo').prop('disabled', false);
        $('#description').prop('disabled', false);
        $('#source').prop('disabled', false);
        $('#shippingDate').prop('disabled', false);
        $('#expectedDeliveryDate').prop('disabled', false);

        if (resJsonObj.status === 400) { // if shipment is not exist already with the same shipment number then enable save and reset btn
            $('#resetBtn').prop('disabled', false);
            $('#saveBtn').prop('disabled', false);
            $('#updateBtn').prop('disabled', true);
            fillData("");
            $('#description').focus();
        } else if (resJsonObj.status === 200) { // if shipment is exist already with the same shipment number then enable update and reset btn
            $('#shipmentNo').prop('disabled', true);
            fillData(resJsonObj);
            $('#resetBtn').prop('disabled', false);
            $('#updateBtn').prop('disabled', false);
            $('#saveBtn').prop('disabled', true);
            $('#description').focus();
        }
    }
}

// Function to make PUT request to save data into the database
function saveData() {
    var jsonObj = validateFormData();

    // If form data is not valid
    if (jsonObj === '')
        return '';

    // create PUT Request object
    var putRequest = createPUTRequest(connectionToken, jsonObj, deliveryDatabaseName, shipmentRelationName);
    jQuery.ajaxSetup({
        async: false
    });

    // Make PUT Request for saving data into the database
    var resJsonObj = executeCommandAtGivenBaseUrl(putRequest, jpdbBaseURL, jpbdIML);
    jQuery.ajaxSetup({
        async: true
    });

    if (resJsonObj.status === 400) { // If data is not saved
        alertHandler(0, 'Data Is Not Saved ( Message: ' + resJsonObj.message + " )");
    } else if (resJsonObj.status === 200) { // If data is successfully saved
        alertHandler(1, 'Data Saved successfully');
    }
    // After saving to database reset form data
    resetForm();
    $('#shipmentNo').focus();
}

// Function used to make UPDATE Request
function updateData() {
    $('#updateBtn').prop('disabled', true);
    var jsonChg = validateFormData(); // Before making UPDATE Request validate form data

    // Create UPDATE Request object
    var updateRequest = createUPDATERecordRequest(connectionToken, jsonChg, deliveryDatabaseName, shipmentRelationName, localStorage.getItem("recordNo"));
    jQuery.ajaxSetup({
        async: false
    });

    // Make UPDATE Request
    var resJsonObj = executeCommandAtGivenBaseUrl(updateRequest, jpdbBaseURL, jpbdIML);
    jQuery.ajaxSetup({
        async: true
    });

    if (resJsonObj.status === 400) { // If data is not saved
        alertHandler(0, 'Data Is Not Update ( Message: ' + resJsonObj.message + " )");
    } else if (resJsonObj.status === 200) { // If data is successfully saved
        alertHandler(1, 'Data Update successfully');
    }

    // After updating to database reset form data
    resetForm();
    $('#shipmentNo').focus();
}
