
class YearDialog

    constructor: (@dataRepository, @content, @messageBar) ->

    run: =>
        @messageBar.text("Fetching data...")
        @dataRepository.getInputData(@getInputDataSuccess, @dataRepositoryFailure)

    getInputDataSuccess: (inputData) =>
        years = inputData.years
        yearSelector = $("<select />")
            .append("<option selected value=''>Select...</option>")
        for year in years
            yearSelector.append("<option value='#{year}'>#{year}</option>")
        submitButton = $("<input type='button' value='Confirm' disabled='true'>")
        yearField = $("<fieldset><label>Start Year: </label></fieldset>")
        yearField.css("background-color", "#ff9999")
        yearField.append(yearSelector)
        form = $("<form />").append(yearField).append(submitButton)
        yearSelector.change =>
            if yearSelector.val() is ''
                submitButton.attr('disabled', true)
                yearField.css("background-color", "#ff9999")
                @messageBar.text("Complete all fields")
            else
                submitButton.attr('disabled', false)
                yearField.css("background-color", "transparent")
                @messageBar.text("Click Confirm to submit selection to workflow")
        submitButton.click =>
            submitButton.attr('disabled', true)
            yearSelector.attr('disabled', true)
            @userSubmitsYear yearSelector.val()
        @messageBar.text("Complete all fields")
        @content.html(form)

    dataRepositoryFailure: (message) =>
        @messageBar.text(message)

    userSubmitsYear: (year) =>
        @messageBar.text("Submitting selection to workflow...")
        yearSubmitted = =>
            @messageBar.text("Year #{year} submitted")
        @dataRepository.putOutputData({year: year}, yearSubmitted, @dataRepositoryFailure)


class TestDataRepository
    getInputData: (onSuccess, onFailure) ->
        onSuccess {"years": [1987, 1988, 1989]}

    putOutputData: (data, onSuccess, onFailure) ->
        onSuccess {}

class PmrpcDataRepository
    constructor: (@destination) ->

    getInputData: (onSuccess, onFailure) ->
        pmrpc.call(
            destination: @destination
            publicProcedureName: "getInputData"
            params: []
            onSuccess: (callResult) -> onSuccess callResult.returnValue
            onFailure: (callResult) -> onFailure callResult.message
        )

    putOutputData: (data, onSuccess, onFailure) ->
        pmrpc.call(
            destination : @destination
            publicProcedureName : "reply"
            params : ["OK", data]
            onSuccess: (callResult) -> onSuccess callResult.returnValue
            onFailure: (callResult) -> onFailure callResult.message
        )

# add "?test" to URL to invoke test
dataRepository = if $(location).attr('search') is "?test" then new TestDataRepository() else new PmrpcDataRepository("publish")
yearDialog = new YearDialog(dataRepository, $('#content'), $('#message'))

$(document).ready yearDialog.run
