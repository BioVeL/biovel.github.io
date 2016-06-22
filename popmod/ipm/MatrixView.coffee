class MatrixView

    constructor: (@parent, @matrix, @meshPoints, @title, @openCPU) ->
        @matrixCache = {}

    display: =>
        left = $('<div>').attr(style: 'float:left')
        right = $('<div>').attr(style: 'float:left')
        clear = $('<div>').attr(style: 'clear:both')
        bottom = $('<div>')
        @wireframe = $('<div>').appendTo(left).html $('<img>').attr(src: 'ajax-loader.gif')
        control = $('<div>').appendTo(right)
        @contour = @openCPU.image().appendTo(right)
        control.append($('<br>'), $('<label>').text('Colors'))
        @colorSelect = $('<select>').appendTo(control).append(
            $('<option>').attr(value: 'rainbow').text('rainbow'),
            $('<option>').attr(value: 'heat.colors').text('heat'),
            $('<option>').attr(value: 'terrain.colors').text('terrain'),
            $('<option>').attr(value: 'topo.colors', selected: 'true').text('topo'),
            $('<option>').attr(value: 'cm.colors').text('cm')
        )
        control.append($('<br>'))
        @update = $('<button>').attr(type: 'button', disabled: false).text('Update').appendTo(control)
        @update.button()
        @update.click @updateContour
        @parent.empty().append(left, right, clear, bottom)
        @openCPU.getObjectAsText(@matrix)
        .then (result) =>
            bottom.html $('<pre>').text(result)
            @updateWireframe()
        .then (wireframePlot) =>
            @updateContour()
            .then (contourPlot) ->
                { wireframePlot: wireframePlot, contourPlot: contourPlot }

    updateContour: =>
        @update.button('disable')
        task = @openCPU.callScript("""
            library(graphics)
            library(grDevices)
            M = t(matrix)
            q <- length(meshpts)
            filled.contour(meshpts, meshpts, M[1:q,1:q],
                           zlim=c(max(matrix),0), xlab="size at time t",
                           ylab="size at time t+1", color=colorRange,
                           nlevels=100, cex.lab=0.8)
            title(plotTitle)
            """, {
                matrix: @matrix
                meshpts: @meshPoints
                colorRange: @colorSelect.val()
                plotTitle: @openCPU.quote(@title)
            })
        .then (result) ->
            result.graphs[0]
        @contour.updateSource(task)
        .always =>
            @update.button('enable')
        task

    updateWireframe: =>
        @openCPU.callScript("""
            library(lattice)
            print(wireframe(matrix, xlab=xlab, ylab=ylab, zlab=zlab,
                  scales=scales, screen=screen, shade=shade, drape=drape,
                  colorkey=colorkey))
            """, {
                matrix: @matrix
                xlab: 'list("Size at t+1", rot=90)'
                ylab: @openCPU.quote('Size at t')
                zlab: @openCPU.quote("                 #{@title}")
                scales: 'list(col="royalblue2")'
                screen: 'list(z=-90, x=0)'
                shade: 'FALSE'
                drape: 'TRUE'
                colorkey: 'TRUE'
            })
        .then (result) ->
            result.graphs[0]
        .done (graph) =>
            @wireframe.html $('<img>').attr(src: @openCPU.getPngUrl(graph))
        .fail(@openCPU.showErrorIn(@wireframe))

this.MatrixView = MatrixView
