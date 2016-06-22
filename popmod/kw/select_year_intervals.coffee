
toggleyear = (years, year, visibleElement) ->
    () ->
        if year of years
            # remove year
            delete years[year]
            visibleElement.html('&nbsp; ')
        else
            years[year] = true
            visibleElement.html('&nbsp;|<br/>|&nbsp;')


class YearIntervalSelection

    constructor: (@dataRepository) ->

    run: =>
        $('#message').text("Fetching data...")
        @dataRepository.getInputData(@getInputDataSuccess, @dataRepositoryFailure)

    getInputDataSuccess: (inputData) =>
        first = inputData.firstYear
        final = inputData.finalYear
        years = {}
        content = $('#content')
        content.append $('<span>').css(fontSize: '200%').html('|&nbsp;')
        for year in [first..final-1]
            clickElement = $('<span>')
            clickElement.append $('<span>').text(year)
            visibleElement = $('<span>').css(fontSize: '200%').html('&nbsp; ').appendTo(clickElement)
            clickElement.click toggleyear(years, year, visibleElement)
            content.append clickElement
        content.append $('<span>').text(final)
        content.append $('<span>').css(fontSize: '200%').html('&nbsp;|')
        submitButton = $("<input type='button' value='Confirm'>")
        submitButton.button()
        submitButton.click =>
            submitButton.button("disable")
            ranges = []
            start = null
            for year in [first..final]
                if !start?
                    start = year
                if year of years
                    range = [start, year]
                    ranges.push range
                    start = null
            if start?
                range = [start, final]
                ranges.push range
            $('#message').text("Complete")
            @dataRepository.putOutputData({yearIntervals: ranges}, (->), @dataRepositoryFailure)
        $('#submit').html(submitButton)
        $('#message').text("Click between years to add or remove a partition, then click Confirm to submit years for restrospective analyses")

    dataRepositoryFailure: (message) =>
        $('#message').text(message)


class TestDataRepository
    getInputData: (onSuccess, onFailure) ->
        onSuccess {"firstYear": 1987, "finalYear": 2011} 

    putOutputData: (data, onSuccess, onFailure) ->
        alert(JSON.stringify(data))
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
page = new YearIntervalSelection(dataRepository)

$(document).ready page.run
