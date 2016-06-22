generateID = ->
    alpha = "abcdefghijklmnopqrstuvwxyz";
    (alpha[Math.floor(Math.random() * 26)] for i in [0..7]).join('')


class AbundanceDialog

    constructor: (@dataRepository, @content) ->

    run: =>
        @content.text("Fetching data...")
        @dataRepository.getInputData(@getInputDataSuccess, @dataRepositoryFailure)

    getInputDataSuccess: (inputData) =>
        $('#title').text(inputData.title)
        $('#message').text(inputData.message)
        stages = inputData.stages
        @content.empty()
        maxStageChars = Math.max(stage.length for stage in stages...)
        abundanceFields = []
        for stage, i in stages
            initial = if inputData.abundances? then inputData.abundances[i].toString() else "0"
            elemId = generateID()
            label = $("<label>").attr(for:elemId).css(float:'left',paddingRight:'5px',width:"#{maxStageChars}em").text(stage)
            # on focus, select the existing value, so it is overwritten by
            # the newly entered value. Otherwise, the added digits are
            # appended or prepended (depending on the browser) to the current
            # value (initially 0)
            field = $("<input>").attr(id:elemId, value:initial).css(width:'10em').focus((event) -> $(event.currentTarget).select())
            abundanceFields.push(field)
            row = $("<div style='clear:both;padding-top:3px;padding-bottom:3px'></div>'").append(label).append(field)
            @content.append(row)
        # input focus on first field
        abundanceFields[0].focus()
        submitButton = $("<input type='button' value='Confirm' style='clear:both'>")
        submitButton.button() # turn HTML button into JQuery UI button
        submitButton.click =>
            submitButton.button("disable")
            @userSubmitsStages(
                abundances: (parseInt(field.val()) for field in abundanceFields)
            )
        @content.append(submitButton)

    dataRepositoryFailure: (message) =>
        $('#message').text(message)

    userSubmitsStages: (result) =>
        @dataRepository.putOutputData(result, (->), @dataRepositoryFailure)
        $('#message').text("Submitted")


class TestDataRepository
    getInputData: (onSuccess, onFailure) ->
        onSuccess {"stages": ["S", "J", "V", "G", "D"]}

    putOutputData: (data, onSuccess, onFailure) ->
        alert JSON.stringify data
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
abundanceDialog = new AbundanceDialog(dataRepository, $('#content'))

$(document).ready abundanceDialog.run
