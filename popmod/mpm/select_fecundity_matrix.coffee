# Separate function to create event handler, outside calling
# function to create separate closure
createUpdateHandler = (td, checkbox) ->
    return ->
        if checkbox.prop('checked')
            td.css(backgroundColor:'#99ff99')
        else
            td.css(backgroundColor:'#cccccc')

class StagesDialog

    constructor: (@dataRepository, @content, @messageBar) ->

    run: =>
        @messageBar.text("Fetching data...")
        @dataRepository.getInputData(@getInputDataSuccess, @dataRepositoryFailure)

    getInputDataSuccess: (inputData) =>
        $('#title').text(inputData.title)
        stages = inputData.stages
        rows = []
        header = $('thead#head')
        headerRow = $('<tr>').append $('<th>')
        for stage in stages
            headerRow.append $('<th>').text(stage)
        header.html headerRow
        table = $("tbody#content")
        for stageRow, row in stages
            tr = $('<tr>').css(paddingTop:'3px', paddingBottom:'3px')
            tr.append $('<th>').attr(align:'right').text(stageRow)
            for stageCol, col in stages
                checkbox = $('<input>').attr(type:'checkbox', value:"#{row+1}#{col+1}")
                td = $('<td>').attr(align:'center').css(backgroundColor:'#cccccc').append(checkbox)
                checkbox.change createUpdateHandler(td, checkbox)
                tr.append(td)
            table.append(tr)
        submitButton = $('<input>').attr(type:'button', value:'Confirm')
        submitButton.button()
        submitButton.click =>
            submitButton.button("disable")
            fecundity = $('input:checkbox:checked').map(-> $(this).val()).get() || []
            @userSubmits({
                fecundityIndices: fecundity
            }
            )
        $('#submit').html(submitButton)
        @messageBar.text(inputData.message)

    dataRepositoryFailure: (message) =>
        @messageBar.text(message)

    userSubmits: (result) =>
        console.log(result)
        @dataRepository.putOutputData(result, (->), @dataRepositoryFailure)
        @messageBar.text("Submitted")


class TestDataRepository
    getInputData: (onSuccess, onFailure) ->
        onSuccess {
            'title': 'Select fecundity transitions'
            'message': 'Select fecundity stage transitions, and click the Confirm button'
            "stages": ["S", "J", "V", "G", "D"]
        }

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
