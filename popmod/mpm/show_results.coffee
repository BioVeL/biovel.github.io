
class ResultsPage

    constructor: (@dataRepository, @content) ->

    run: =>
        @content.text("Fetching data...")
        @dataRepository.getInputData(@getInputDataSuccess, @dataRepositoryFailure)

    getCITable: (confidenceIntervalJSON) ->
        confidenceInterval = $.parseJSON(confidenceIntervalJSON)
        table = $('<table>')
        topRow = $('<tr>').attr(class: 'ui-widget-header')
        botRow = $('<tr>').attr(class: 'ui-widget-content')
        for k,v of confidenceInterval
            topRow.append($('<th>').text(k))
            botRow.append($('<td>').text(v))
        table.append(topRow).append(botRow)

    getInputDataSuccess: (inputData) =>
        $('#header').text(inputData.speciesName)
        @content.text("")
        @content.append $("<h2>").text("Stage Matrix")
        @content.append $("<pre>").text(inputData.stageMatrix)
        @content.append $("<h2>").text("Eigenanalysis")
        @content.append $("<pre>").text(inputData.eigenanalysis)
        @content.append $("<h2>").text("Projection Matrix")
        @content.append $('<img>').attr(src: inputData.projectionMatrix)
        @content.append $("<h2>").text("Bar Plot")
        @content.append $('<img>').attr(src: inputData.barPlot)
        @content.append $("<h2>").text("Elasticity Matrix")
        @content.append $('<img>').attr(src: inputData.elasticityMatrix)
        @content.append $("<h2>").text("Sensitivity Matrix 1")
        @content.append $('<img>').attr(src: inputData.sensitivityMatrix1)
        @content.append $("<h2>").text("Sensitivity Matrix 2")
        @content.append $('<img>').attr(src: inputData.sensitivityMatrix2)
        @content.append $('<h2>').text("Confidence Interval")
        @content.append(@getCITable(inputData.confidenceIntervalJSON))
        @content.append $('<img>').attr(src: inputData.ciHistogram)
        # need to send response to allow workflow to finish
        @dataRepository.putOutputData({}, (->), (->))

    dataRepositoryFailure: (message) =>
        @content.text(message)


class TestDataRepository
    getInputData: (onSuccess, onFailure) ->
        onSuccess
            speciesName: "Dicia taba"
            stageMatrix: "Lot's of text"
            eigenanalysis: "Lot's of text"
            projectionMatrix: "http://www.statmethods.net/graphs/images/barplot1.jpg"
            barPlot: "http://www.statmethods.net/graphs/images/barplot1.jpg"
            elasticityMatrix: "http://www.statmethods.net/graphs/images/barplot1.jpg"
            sensitivityMatrix1: "http://www.statmethods.net/graphs/images/barplot1.jpg"
            sensitivityMatrix2: "http://www.statmethods.net/graphs/images/barplot1.jpg"
            confidenceIntervalJSON: '{"2.5%": 0.89, "97.5%": 1.47}'
            ciHistogram: "http://www.statmethods.net/graphs/images/barplot1.jpg"

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
resultsPage = new ResultsPage(dataRepository, $('#content'))

$(document).ready resultsPage.run
