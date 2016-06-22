# showErrorIn
# Display Ajax error message inside the _parent_ element
# The contents of parent are completely replaced by the error message
showErrorIn = (parent) ->
    (jqXHR, textStatus, errorThrown) ->
        parent.empty()
        message = if errorThrown? then errorThrown else textStatus
        if jqXHR.responseText? then message = message + ': ' + jqXHR.responseText
        parent.append $('<p>').css(color: '#cc0000').text(message)

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
        @params = {}

    display: =>
        $('button').button()
        $('#tabs').tabs()

        @dataRepository.getInputData()
        .fail (message) ->
            $('#message').html $('<p>').text(message)
        .done(@getInputDataOK)

    getInputDataOK: (inputData) =>
        workspace = $.parseJSON inputData.workspace
        openCPU = new OpenCPU(workspace.openCPU)
        $('#minSize').attr(value: inputData.initialMinSize)
        $('#maxSize').attr(value: inputData.initialMaxSize)
        $('#matrixDim').attr(value: inputData.initialMaxSize - inputData.initialMinSize + 1)
        pMatrixContour = openCPU.image().appendTo($('#pmatrix .contour'))
        fMatrixContour = openCPU.image().appendTo($('#fmatrix .contour'))
        $('#createButton').click =>
            $('#createButton').button('disable')
            $('#nextButton').button('disable')
            $('#pmatrixUpdateButton').button('disable')
            $('#fmatrixUpdateButton').button('disable')
            $('body').css(cursor: 'wait')
            @params = {
                matrixDim: $('#matrixDim').val()
                chosenMinSize: $('#minSize').val()
                chosenMaxSize: $('#maxSize').val()
                integrateType: $('#integrateType').val()
                correction: $('#correction').val()
                preCensus: $('#preCensus').prop('checked')
            }
            pm = @createPmatrix(openCPU, workspace, @params, pMatrixContour)
            fm = @createFmatrix(openCPU, workspace, @params, fMatrixContour)
            pm.always ->
                fm.always ->
                    $('body').css(cursor: 'auto')
                    $('#createButton').button('enable')
                    if workspace.Pmatrix and workspace.Fmatrix
                        $('#nextButton').button('enable')
        $('#createButton').button('enable')
        $('#nextButton').click =>
            $('#nextButton').button('disable')
            @dataRepository.putOutputData({
                workspace: JSON.stringify(workspace)
                params: JSON.stringify(@params)
            })
            .done(displayWait)
            .fail (message) ->
                $('#message').html $('<p>').text(message)
                $('#nextButton').button('enable')
        $('#pmatrixUpdateButton').click =>
            $('#pmatrixUpdateButton').button('disable')
            @updateContour(openCPU, pMatrixContour, workspace.Pmatrix, @params.chosenMaxSize,
                'Kernel Pmatrix', $('#pmatrixColours').val())
            .always ->
                $('#pmatrixUpdateButton').button('enable')
        $('#fmatrixUpdateButton').click =>
            $('#fmatrixUpdateButton').button('disable')
            @updateContour(openCPU, fMatrixContour, workspace.Fmatrix, @params.chosenMaxSize,
                'Kernel Fmatrix', $('#fmatrixColours').val())
            .always ->
                $('#fmatrixUpdateButton').button('enable')

    createPmatrix: (openCPU, workspace, params, pMatrixContour) =>
        $('#pload').html $('<img>').attr(src: 'ajax-loader.gif')
        openCPU.callFunction('IPMpack', 'createIPMPmatrix', {
                nEnvClass: 1
                nBigMatrix: @params.matrixDim
                minSize: @params.chosenMinSize
                maxSize: @params.chosenMaxSize
                chosenCov: 'data.frame(NA)'
                survObj: workspace.survivalObject
                growObj: workspace.growthObject
                integrateType: openCPU.quote @params.integrateType
                correction: openCPU.quote @params.correction
            })
        .then (result) =>
            workspace.Pmatrix = result.object
            openCPU.getObjectAsText(workspace.Pmatrix)
            .done (result) ->
                $('#pmatrix .text').html $('<pre>').text(result)
            .fail(openCPU.showErrorIn $('#pmatrix .text'))
            openCPU.callScript("""
                library(lattice)
                print(wireframe(Pmatrix, xlab=list('Size at t+1', rot=90),
                    ylab='Size at t', zlab='Pmatrix',
                    scales=list(col='royalblue2'),
                    screen=list(z=30, x=-60), shade=FALSE, drape=TRUE,
                    colorkey=TRUE))
                """, {
                    Pmatrix: workspace.Pmatrix
                })
        .done (result) ->
            workspace.plot.PmatrixWireframePlot = result.graphs[0]
            $('#pmatrix .wireframe').html $('<img>').attr(src: openCPU.getPngUrl(result.graphs[0])) 
        .then =>
            @updateContour(openCPU, pMatrixContour, workspace.Pmatrix, @params.chosenMaxSize,
                'Kernel Pmatrix', $('#pmatrixColours').val())
        .done (result) =>
            workspace.PmatrixMeshpoints = result.object
            workspace.plot.PmatrixContourPlot = result.graphs[0]
            $('#pmatrixUpdateButton').button('enable')
        .then ->
            openCPU.callFunction('IPMpack', 'diagnosticsPmatrix', {
                Pmatrix: workspace.Pmatrix
                growObj: workspace.growthObject
                survObj: workspace.survivalObject
                dff: workspace.data
                integrateType: openCPU.quote params.integrateType
                correction: openCPU.quote params.correction
            })
        .done (result) ->
            workspace.plot.PmatrixDiagnostics = result.graphs
            $('#pmatrix .diagnostics').empty()
            for graph in result.graphs
                $('#pmatrix .diagnostics').append $('<img>').attr(src: openCPU.getPngUrl(graph))
        .fail(showErrorIn($('#pmatrix .diagnostics')))
        .always ->
            $('#pload').empty()

    createFmatrix: (openCPU, workspace, params, fMatrixContour) =>
        $('#fload').html $('<img>').attr(src: 'ajax-loader.gif')
        openCPU.callFunction('IPMpack', 'createIPMFmatrix', {
                nEnvClass: 1
                nBigMatrix: @params.matrixDim
                minSize: @params.chosenMinSize
                maxSize: @params.chosenMaxSize
                chosenCov: 'data.frame(NA)'
                survObj: workspace.survivalObject
                growObj: workspace.growthObject
                fecObj: workspace.fecundityObject
                integrateType: openCPU.quote @params.integrateType
                correction: openCPU.quote @params.correction
                preCensus: if @params.preCensus then 'TRUE' else 'FALSE'
            })
        .then (result) =>
            workspace.Fmatrix = result.object
            openCPU.getObjectAsText(workspace.Fmatrix)
            .done (result) ->
                $('#fmatrix .text').html $('<pre>').text(result)
            .fail(openCPU.showErrorIn $('#pmatrix .text'))
            openCPU.callScript("""
                library(lattice)
                print(wireframe(Fmatrix, xlab=list('Size at t+1', rot=90),
                    ylab='Size at t', zlab='Fmatrix',
                    scales=list(col='royalblue2'),
                    screen=list(z=-90, x=0), shade=FALSE, drape=TRUE,
                    colorkey=TRUE))
                """, {
                    Fmatrix: workspace.Fmatrix
                })
        .done (result) ->
            workspace.plot.FmatrixWireframePlot = result.graphs[0]
            $('#fmatrix .wireframe').html $('<img>').attr(src: openCPU.getPngUrl(result.graphs[0]))
        .fail(showErrorIn($('#fmatrix .wireframe')))     
        .then =>
            @updateContour(openCPU, fMatrixContour, workspace.Fmatrix, @params.chosenMaxSize,
                'Kernel Fmatrix', $('#fmatrixColours').val())
        .done (result) =>
            workspace.plot.FmatrixContourPlot = result.graphs[0]
        .always ->
            $('#fmatrixUpdateButton').button('enable')
            $('#fload').empty()

    updateContour: (openCPU, image, matrix, maxSize, title, color) ->
        task = openCPU.callScript("""
            M <- t(matrix)
            meshpts <- matrix@meshpoints
            q <- sum(meshpts <= maxSize)
            meshpoints <- meshpts[1:q]
            filled.contour(meshpoints, meshpoints, M[1:q,1:q], zlim=c(max(matrix),0),
              xlab="size at time t", ylab="size at time t+1",
              color=color, nlevels=100, cex.lab=0.8);
            title(plotTitle)
            meshpoints
            """, {
                matrix: matrix
                maxSize: maxSize
                plotTitle: openCPU.quote title
                color: color
            })
        image.updateSource(task.then (result) -> result.graphs[0])
        task

dataRepository = new PmrpcDataRepository('publish')
interaction = new Interaction(dataRepository)
$(document).ready ->
    $('#tabs').tabs()
    interaction.display()
