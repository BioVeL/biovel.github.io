generateID = ->
    alpha = "abcdefghijklmnopqrstuvwxyz";
    (alpha[Math.floor(Math.random() * 26)] for i in [0..7]).join('')

# Separate function to create event handler, outside calling
# function to create separate closure
createUpdateHandler = (tr, recruited, reproductive, exclude) ->
    return ->
        if exclude.prop('checked')
            tr.css('background-color': '#999999')
        else
            if recruited.prop('checked')
                if reproductive.prop('checked')
                    tr.css('background-color': '#ccff99')
                else
                    tr.css('background-color': '#99ff99')
            else
                if reproductive.prop('checked')
                    tr.css('background-color': '#ffcc99')
                else
                    tr.css('background-color': '#66cc66')

class StagesDialog

    constructor: (@dataRepository, @content, @messageBar) ->

    run: =>
        @messageBar.text("Fetching data...")
        @dataRepository.getInputData(@getInputDataSuccess, @dataRepositoryFailure)

    getInputDataSuccess: (inputData) =>
        stages = inputData.unsortedStages
        table = $("tbody#content")
        rowFromId = {}
        for stage in stages
            rowId = 'content_' + generateID()
            tr = $("<tr id='#{rowId}' style='background-color:#66cc66;padding-top:3px;padding-bottom:3px'><td width='20%' align='right'>#{stage}</td></tr>'")
            recruitedCheckbox = $("<input type='checkbox'>")
            reproductiveCheckbox = $("<input type='checkbox'>")
            excludedCheckbox = $("<input type='checkbox'>")
            rowFromId[rowId] =
                stage: stage
                recruitedCheckbox: recruitedCheckbox
                reproductiveCheckbox: reproductiveCheckbox
                excludedCheckbox: excludedCheckbox
            for checkbox in [recruitedCheckbox, reproductiveCheckbox, excludedCheckbox]
                td = $("<td align='center'></td>")
                td.append(checkbox)
                tr.append(td)
                checkbox.change createUpdateHandler(tr, recruitedCheckbox, reproductiveCheckbox, excludedCheckbox)
            table.append(tr)
        table.sortable()
        submitButton = $("<input type='button' value='Confirm'>")
        submitButton.button()
        submitButton.click =>
            submitButton.button("disable")
            includedRows = (rowFromId[rowId] for rowId in table.sortable('toArray') when not rowFromId[rowId].excludedCheckbox.prop('checked'))
            sortedStages = (row.stage for row in includedRows)
            recruitStages = (row.stage for row in includedRows when row.recruitedCheckbox.prop('checked'))
            reproductiveStages = (row.stage for row in includedRows when row.reproductiveCheckbox.prop('checked'))
            @userSubmitsStages(
                sortedStages: sortedStages
                recruitedStages: recruitStages
                reproductiveStages: reproductiveStages
            )
        $('#submit').html(submitButton)
        @messageBar.text(inputData.message)

    dataRepositoryFailure: (message) =>
        @messageBar.text(message)

    userSubmitsStages: (result) =>
        @dataRepository.putOutputData(result, (->), @dataRepositoryFailure)
        @messageBar.text("Stages submitted")


class TestDataRepository
    getInputData: (onSuccess, onFailure) ->
        onSuccess {"unsortedStages": ["S", "x", "D", "G", "J", "V"]}

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
stagesDialog = new StagesDialog(dataRepository, $('#content'), $('#message'))

$(document).ready stagesDialog.run