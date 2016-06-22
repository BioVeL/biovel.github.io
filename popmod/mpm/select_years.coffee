
class YearDialog

    constructor: (@dataRepository, @content, @messageBar) ->

    run: =>
        @messageBar.text("Fetching data...")
        @dataRepository.getInputData(@getInputDataSuccess, @dataRepositoryFailure)

    getInputDataSuccess: (inputData) =>
        years = inputData.years
        submitButton = $("<input type='button' value='Confirm' disabled='true'>")
        yearField = $("<fieldset><label>Generate Stage Matrices for: </label></fieldset>")
        checkboxes = for year, i in years.slice(0, -1)
            p = yearField
            p.append $('<br>')
            checkbox = $("<input type='checkbox' name='year' value='#{year}'>").appendTo(p)
            p.append $('<span>').text("#{year} - #{years[i+1]}")
            checkbox
        form = $("<form />").append(yearField).append(submitButton)
        submitButton.attr('disabled', false)
        submitButton.click =>
            submitButton.attr('disabled', true)
            selected = (checkbox.val() for checkbox in checkboxes when checkbox.prop('checked'))
            @userSubmitsYear selected
        @messageBar.text("Select year range to generate stage matrices for transition. Click Confirm when done.")
        @content.html(form)

    dataRepositoryFailure: (message) =>
        @messageBar.text(message)

    userSubmitsYear: (years) =>
        @messageBar.text("Submitting selection to workflow...")
        yearSubmitted = =>
            @messageBar.text("Years #{years} submitted")
        @dataRepository.putOutputData({years: years}, yearSubmitted, @dataRepositoryFailure)


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
