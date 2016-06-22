
# Display the wait cursor for 10 seconds - this provides feedback to the
# user after they have clicked to submit the interaction page
# We reset the cursor after 10 seconds, in case the user views the page
# again (the user can perform most interactions after submission, except
# the Submit.
displayWait = ->
    $('body').css(cursor: 'wait')
    setTimeout((-> $('body').css(cursor: 'auto')), 10000)

class Interaction

    constructor: (@dataRepository) ->

    display: =>
        $('#tabs').tabs()
        $('button').button()
        @dataRepository.getInputData()
        .fail (message) ->
            alert('getInputData failed: #{message}')
        .done(@getInputDataSuccess)

    getInputDataSuccess: (inputData) =>
        params = {}
        workspace = $.parseJSON inputData.workspace
        openCPU = new OpenCPU(workspace.openCPU)
        ipmModel = workspace.IPM
        $('#ipmlambda').html $('<p>').text("Lambda: #{inputData.lambda}")
        Pmatrix = workspace.Pmatrix
        $('#continue').click =>
            $('#continue').button('disable')
            @dataRepository.putOutputData({
                    workspace: JSON.stringify workspace
                    params: JSON.stringify params
                })
            .done(displayWait)
            .fail (message) ->
                $('#message').html $('<p>').text(message)
                $('#continue').button('enable')

        $('#message').empty()
        $('#ipmLoad').html $('<img>').attr(src: 'ajax-loader.gif')
        new MatrixView($('#ipmgraph'), ipmModel, workspace.PmatrixMeshpoints, "Kernel IPM", openCPU).display()
        .then (result) ->
            workspace.plot.ipmContourPlot = result.contourPlot
            workspace.plot.ipmWireframePlot = result.wireframePlot
        .always ->
            $('#ipmLoad').empty()
        .fail(openCPU.showErrorIn $('#ipmprint'))
        $('#sensLoad').html $('<img>').attr(src: 'ajax-loader.gif')
        sens = openCPU.callFunction('IPMpack', 'sens', {A: ipmModel})
        .fail(openCPU.showErrorIn $('#sens'))
        .then (result) =>
            workspace.ipmSensistivity = result.object
            new MatrixView($('#sens'), result.object, workspace.PmatrixMeshpoints, "Kernel IPM Sensitivity", openCPU).display()
        .then (result) ->
            workspace.plot.ipmSensitivityContourPlot = result.contourPlot
            workspace.plot.ipmSensitivityWireframePlot = result.wireframePlot
        .always ->
            $('#sensLoad').empty()
        $('#elasLoad').html $('<img>').attr(src: 'ajax-loader.gif')        
        elas = openCPU.callFunction('IPMpack', 'elas', {A: ipmModel})
        .fail(openCPU.showErrorIn $('#elas'))
        .then (result) =>
            workspace.ipmElasticity = result.object
            new MatrixView($('#elas'), result.object, workspace.PmatrixMeshpoints, "Kernel IPM Elasticity", openCPU).display()
        .then (result) ->
            workspace.plot.ipmElasticityContourPlot = result.contourPlot
            workspace.plot.ipmElasticityWireframePlot = result.wireframePlot
        .always ->
            $('#elasLoad').empty()
        $('#selsLoad').html $('<img>').attr(src: 'ajax-loader.gif')        
        sels = openCPU.callScript('''
            par(mfrow=c(1,1), xpd=T, mar=c(8,4,4,4))
            barplot(sens$elam, 
                main = expression("Parameter elasticity of population growth rate "* lambda), 
                las = 2, cex.names = 0.7, col = "yellowgreen", border = par("fg"))
            barplot(sens$slam, 
                main = expression("Parameter sensitivity of population growth rate "* lambda), 
                las = 2, cex.names = 0.7, col = "turquoise2", border = par("fg"))
            barplot(Ro$elam, main = expression("Parameter elasticity of Ro"), 
                las = 2, cex.names = 0.7, col = "darkolivegreen1", border = par("fg"))
            barplot(Ro$slam, main = expression("Parameter sensitivity of Ro"), 
                las = 2, cex.names = 0.7, col = "steelblue1", border = par("fg"))
            barplot(LE$elam, 
                main = expression("Parameter elasticity of Life expectancy"), 
                las = 2, cex.names = 0.7, col =  "lightskyblue", border = par("fg"))
            barplot(LE$slam, 
                main = expression("Parameter sensitivity of Life expectancy"), 
                las = 2, cex.names = 0.7, col = "springgreen1", border = par("fg"))
            ''', {
                sens: workspace.LambdaSensitivity
                Ro: workspace.R0sensitivity
                LE: workspace.LifeExpectancySensitivity
            })
        .fail(openCPU.showErrorIn $('#sels'))
        .done (result) =>
            $('#sels .lambda .elas').html $('<img>').attr(src: openCPU.getPngUrl(result.graphs[0]))
            $('#sels .lambda .sens').html $('<img>').attr(src: openCPU.getPngUrl(result.graphs[1]))
            $('#sels .Ro .elas').html $('<img>').attr(src: openCPU.getPngUrl(result.graphs[2]))
            $('#sels .Ro .sens').html $('<img>').attr(src: openCPU.getPngUrl(result.graphs[3]))
            $('#sels .lifeexpect .elas').html $('<img>').attr(src: openCPU.getPngUrl(result.graphs[4]))
            $('#sels .lifeexpect .sens').html $('<img>').attr(src: openCPU.getPngUrl(result.graphs[5]))
        .always ->
            $('#selsLoad').empty()
        $('#survLoc').val(inputData.maxSize)
        $('#survMaxAge').val(inputData.maxAge)
        $('#survSubmit').button('enable')
        survPlot = openCPU.image().appendTo($('#survPlot'))
        $('#survSubmit').click ->
            $('#survSubmit').button('disable')
            $('#survLoad').html $('<img>').attr(src: 'ajax-loader.gif')
            params.survivorship = {
                loc: $('#survLoc').val()
                maxAge: $('#survMaxAge').val()
            }
            # Create a deferred task, and update the survivorship plot with the result of the deferred.
            # The .then at the end assigns the OpenCPU handle for the graph to the output workspace, but also 
            # returns the handle. Passing the deferred to OpenCPU.Image.updateSource causes the existing 
            # plot to fade with a wait symbol at the start of the task, and to display the new result graph
            # at the end of the task.
            task = openCPU.callScript("""
                library(IPMpack)
                su <- survivorship(Pmatrix, loc=loc, maxAge=maxAge)
                par(mfrow=c(1,1), xpd=TRUE, mar=c(5,5,5,8))
                plot(su$surv.curv, type="l", col="green", ylab="survivorship", 
                    xlab="age", ylim=c(0,1), main="Surviving across stages")
                points(su$mortality, type="l", col="red", lty=2)
                legend(maxAge+0.5, 0.98, c("survivorship", "mortality"), cex=0.7, lty=c(1,2),
                    col=c("green", "red"))
                su
                """, {
                    Pmatrix: Pmatrix
                    loc: params.survivorship.loc
                    maxAge: params.survivorship.maxAge
                    })
            .then (result) ->
                workspace.plot.survivorshipPlot = result.graphs[0]
            survPlot.updateSource(task)
            .always ->
                $('#survLoad').empty()
                $('#survSubmit').button('enable')
        $('#mlet').empty().text('Loading Mean Life Expectancy & Passage Time...')
        $('#mletLoad').html $('<img>').attr(src: 'ajax-loader.gif')
        mlet = openCPU.callScript("""
            library(IPMpack)
            mLE <- meanLifeExpect(Pmatrix)
            vLE <- varLifeExpect(Pmatrix)
            plot(mLE, ylab = "Mean life expectancy", xlab = "Size", type = "l", col="cornflowerblue",
                ylim = c(0, max(mLE)))
            targetSize <- 100
            pTime <- passageTime(targetSize, Pmatrix)
            plot(Pmatrix@meshpoints, pTime, ylab = "Passage time", xlab = "Size stage", type = "l",
                col = "darkviolet", ylim = c(0, max(pTime)), xlim=c(Pmatrix@meshpoints[1], targetSize+1))
            abline(v=targetSize, col="red")
            """, {
                Pmatrix: Pmatrix
                })
        .always ->
            $('#mletLoad').empty()
        .fail(openCPU.showErrorIn $('#mlet'))
        .done (result) ->
            workspace.plot.meanLifeExpectancyPlot = result.graphs[0]
            workspace.plot.passageTimePlot = result.graphs[1]
            $('#mlet').html $('<img>').attr(src: openCPU.getPngUrl(result.graphs[0]))
            $('#mlet').append $('<img>').attr(src: openCPU.getPngUrl(result.graphs[1]))
        sens.always ->
            elas.always ->
                sels.always ->
                    mlet.always ->
                        $('#continue').button('enable')
        

dataRepository = new PmrpcDataRepository("publish")
interaction = new Interaction(dataRepository)
$(document).ready interaction.display()
