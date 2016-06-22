
# Display the wait cursor for 10 seconds - this provides feedback to the
# user after they have clicked to submit the interaction page
# We reset the cursor after 10 seconds, in case the user views the page
# again (the user can perform most interactions after submission, except
# the Submit.
displayWait = ->
    $('body').css(cursor: 'wait')
    setTimeout((-> $('body').css(cursor: 'auto')), 10000)

filterFirstGraph = (result) ->
    result.graphs[0]

class Interaction

    constructor: (@dataRepository) ->

    display: =>
        $('button').button()
        @dataRepository.getInputData()
        .fail (message) ->
            alert('getInputData failed: #{message}')
        .done(@getInputDataSuccess)

    getInputDataSuccess: (inputData) =>
        params = {}
        workspace = $.parseJSON inputData.workspace
        openCPU = new OpenCPU(workspace.openCPU)
        $('#continue').click =>
            $('#continue').button('disable')
            @dataRepository.putOutputData({
                    workspace: JSON.stringify workspace
                })
            .done(displayWait)
            .fail (message) ->
                $('#message').html $('<p>').text(message)
                $('#continue').button('enable')

        $('#message').html $('<img>').attr(src: 'ajax-loader.gif')
        $('#baye').css(cursor: 'wait')
        res = inputData.ipmBayesian
        workspace.bayesianIPM = res
        openCPU.callScript('''
            plot(res$meshpoints, res$LE[1,], xlab="Stage", ylab="Life expectancy",
                type="l", ylim=range(res$LE, na.rm=TRUE))
            for (j in 1:nrow(res$LE)) points(res$meshpoints, res$LE[j,], col=j, type="l")
            ''', {
                res: res
            })
        .then(filterFirstGraph)
        .then (graph) ->
            $('#baye').html $('<img>').attr(src: openCPU.getPngUrl(graph))
            workspace.plot.bayesianLifeExpectancy = graph
            openCPU.callScript('''
                plot(res$meshpoints, res$pTime[1,], xlab="Stage", ylab="Passage time",
                    type="l", ylim=range(res$pTime, na.rm=TRUE))
                for (j in 1:nrow(res$pTime)) points(res$meshpoints, res$pTime[j,], col=j, type="l")
                ''', {
                    res: res
                })
        .then(filterFirstGraph)
        .then (graph) ->
            $('#baye').append $('<img>').attr(src: openCPU.getPngUrl(graph))
            workspace.plot.bayesianPassageTime = graph
            openCPU.callScript('''
                plot(res$meshpoints, Re(res$stableStage[1,]), xlab="Stage", 
                    ylab="Stable distribution", type="l", ylim=range(Re(res$stableStage), na.rm=TRUE))
                for (j in 1:nrow(res$stableStage))
                    points(res$meshpoints, Re(res$stableStage[j,]), col=j, type="l")
                ''', {
                    res: res
                })
        .then(filterFirstGraph)
        .then (graph) ->
            $('#baye').append $('<img>').attr(src: openCPU.getPngUrl(graph))
            workspace.plot.bayesianStableDistribution = graph
            openCPU.callScript('''
                ci <- quantile(res$lambda, c(0.025, 0.975), na.rm=TRUE)
                hist(res$lambda, xlab=expression(lambda), main="Histogram of lambda", col="darkorange2")
                abline(v=ci, lty=3)
                ''', {
                    res: res
                })
        .then(filterFirstGraph)
        .done (graph) ->
            $('#baye').append $('<img>').attr(src: openCPU.getPngUrl(graph))
            workspace.plot.bayesianLambda = graph
        .always ->
            $('#baye').css(cursor: 'auto')
            $('#message').empty()
            $('#continue').button('enable')
        .fail (x, y, z) ->
            div = $('<div>')
            @openCPU.showErrorIn(div)(x, y, z)
            $('#baye').append div

dataRepository = new PmrpcDataRepository("publish")
interaction = new Interaction(dataRepository)
$(document).ready interaction.display()
