
# Display the wait cursor for 10 seconds - this provides feedback to the
# user after they have clicked to submit the interaction page
# We reset the cursor after 10 seconds, in case the user views the page
# again (the user can perform most interactions after submission, except
# the Submit.
displayWait = ->
    $('body').css(cursor: 'wait')
    setTimeout((-> $('body').css(cursor: 'auto')), 10000)

class SurvivalTab

    explanatoryVariables = ['1', 'size', 'size+size2', 'size+size2+size3']

    constructor: (@submitTab) ->
        $('#survivalControlSubmit').button()
        $('#survivalControlCompare').button()

    start: (@openCPU, @workspace, @params, @palette) =>
        $('#survivalInitialPlot').html(@openCPU.image({height: 400, width: 400}).setSource workspace.plot.survivalInitialPlot)
        $('#survivalControlCompare').click @survivalCompare
        $('#survivalControlCompare').button('enable')
        @comparisonImage = @openCPU.image().appendTo $('#survivalComparisonPlot')

    survivalCompare: =>
        $('#survivalControlCompare').button('disable')
        $('#srvl').css(cursor: 'wait')
        $('#srvlload').html $('<img>').attr(src: 'ajax-loader.gif')
        $('#survivalComparisonChoice').empty()
        expVars = "c(#{(('surv~' + ev) for ev in explanatoryVariables).join()})"
        @params.testType = $('#survivalControlTestType').val()
        testType = @openCPU.quote(@params.testType)
        task = @openCPU.callFunction('IPMpack', 'survModelComp', {
                dataf: @workspace.data
                expVars: expVars,
                testType: testType
            })
        .then (result) =>
            @survComparison = result.object
            @openCPU.callScript('''
                library(IPMpack)
                summaryTable <- sc$summaryTable
                plotSurvModelComp(sc$survObjects, summaryTable, dataf,
                    expVars, testType=testType, plotLegend=FALSE)
                sprintf("%s: %s=%.1f", levels(summaryTable[,1]), testType, as.numeric(as.vector(summaryTable[,2])))
                ''', {
                    sc: @survComparison
                    dataf: @workspace.data
                    expVars: expVars
                    testType: testType
                })
        @comparisonImage.updateSource(task.then (result) -> result.graphs[0])
        task.then (result) =>
            @openCPU.getObject(result.object, type='json', dataType='json')
        .always =>
            $('#survivalControlCompare').button('enable')
            $('#srvl').css(cursor: 'auto')
            $('#srvlload').empty()
        .fail(@openCPU.showErrorIn($('#survivalComparisonChoice')))
        .done (result) =>
            submit = $('#survivalControlSubmit')
            form = $('<form>')
            for legend, i in result
                $('<input>').attr(
                    type: 'radio'
                    name: 'surv'
                    value: "#{i}"
                ).appendTo(form).click ->
                    submit.button('enable')
                form.append $('<span>').css(color: @palette[i+1]).html(' &mdash;&mdash; ')
                form.append $('<span>').css(fontSize: 'small').text(legend)
                form.append $('<br>')
            # get survComparison now, in case user starts another comparison
            survComparison = @survComparison
            submit.click =>
                submit.button('disable')
                val = parseInt $('input[name=surv]:radio:checked').val()
                task = @openCPU.callScript('''
                    sc$survObjects[[i]]
                    ''', {
                        sc: survComparison
                        i: val + 1
                    })
                .done (result) =>
                    @workspace.survivalObject = result.object
                    @params.explanatoryVariables = explanatoryVariables[val]
                @submitTab.updateSurvival(task)
            $('#survivalComparisonChoice').html form
        
class GrowthTab

    explanatoryVariables = ['1', 'size', 'size+size2', 'size+size2+size3']

    constructor: (@submitTab) ->
        $('#growthControlSubmit').button()
        $('#growthControlCompare').button()

    start: (@openCPU, @workspace, @params, @palette) =>
        $('#growthInitialPlot').html(@openCPU.image({width: 400, height:400}).setSource @workspace.plot.growthInitialPlot)
        $('#growthControlCompare').click @growthCompare
        $('#growthControlCompare').button('enable')
        @comparisonImage = @openCPU.image().appendTo $('#growthComparisonPlot')


    growthCompare: =>
        $('#growthControlCompare').button('disable')
        $('#grow').css(cursor: 'wait')
        $('#growload').html $('<img>').attr(src: 'ajax-loader.gif')
        $('#growthComparisonChoice').empty()
        expVars = "c(#{(('sizeNext~' + ev) for ev in explanatoryVariables).join()})"
        @params.testType = $('#growthControlTestType').val()
        testType = @openCPU.quote(@params.testType)
        task = @openCPU.callFunction('IPMpack', 'growthModelComp', {
                dataf: @workspace.data
                expVars: expVars,
                regressionType: @openCPU.quote('constantVar')
                testType: testType
            })
        .then (result) =>
            @growComparison = result.object
            @openCPU.callScript('''
                library(IPMpack)
                summaryTable <- gc$summaryTable
                plotGrowthModelComp(gc$growthObjects, summaryTable, dataf,
                    expVars, testType=testType, plotLegend=FALSE)
                sprintf("%s: %s=%.1f", levels(summaryTable[,1]), testType, as.numeric(as.vector(summaryTable[,3])))
                ''', {
                    gc: @growComparison
                    dataf: @workspace.data
                    expVars: expVars
                    testType: testType
                })
        @comparisonImage.updateSource(task.then (result) -> result.graphs[0])
        task.then (result) =>
            @openCPU.getObject(result.object, type='json', dataType='json')
        .always =>
            $('#growthControlCompare').button('enable')
            $('#grow').css(cursor: 'auto')
            $('#growload').empty()
        .fail(@openCPU.showErrorIn($('#growthComparisonChoice')))
        .done (result) =>
            submit = $('#growthControlSubmit')
            form = $('<form>')
            for legend, i in result
                $('<input>').attr(
                    type: 'radio'
                    name: 'grow'
                    value: "#{i}"
                ).appendTo(form).click ->
                    submit.button('enable')
                form.append $('<span>').css(color: @palette[i+1]).html(' &mdash;&mdash; ')
                form.append $('<span>').css(fontSize: 'small').text(legend)
                form.append $('<br>')
            growComparison = @growComparison
            submit.click =>
                submit.button('disable')
                val = parseInt $('input[name=grow]:radio:checked').val()
                task = @openCPU.callScript('''
                    gc$growthObjects[[i]]
                    ''', {
                        gc: growComparison
                        i: val + 1
                    })
                .done (result) =>
                    @workspace.growthObject = result.object
                    @params.explanatoryVariables = explanatoryVariables[val]
                @submitTab.updateGrowth(task)
            $('#growthComparisonChoice').html form

class FecundityTab

    constructor: (@submitTab) ->
        $('#fecundityControlPlot').button()
        $('#fecundityControlSubmit').button()
        @path = []

    start: (@openCPU, @workspace, params, @palette, fecundityFields, fecundityPlotsInitial, fecundityHistsInitial, @fieldLabels, x, x0) =>
        @completeControls(fecundityFields)
        @showInitialPlots(fecundityFields, fecundityPlotsInitial, fecundityHistsInitial)
        fecundityPlot = @openCPU.image().appendTo($('#fecundityPlot'))
        $('#fecundityControlPlot').click =>
            $('#fecundityControlPlot').button('disable')
            $('#fecundityControlSubmit').button('disable')
            @makeFecundityObjects(fecundityPlot, x, x0)
        $('#fecundityControlSubmit').click =>
            $('#fecundityControlSubmit').button('disable')
            params.fecundity = for f in @path
                {
                    field: f.field
                    family: f.family
                    transform: f.transform
                    explanatoryVar: f.explanatoryVar
                }
            @workspace.fecundityObject = @path[@path.length-1].fecundityObject
            @submitTab.updateFecundity(@path)

    showInitialPlots: (fields, plots, hists) =>
        for i in [0...fields.length]
            div = $('<div>').appendTo $('#fecundityInitial')
            div.append $('<h2>').text(fields[i])
            div.append $('<img>').attr(src: @openCPU.getPngUrl(plots[i], {width: 400, height:400}))
            div.append $('<img>').attr(src: @openCPU.getPngUrl(hists[i], {width: 400, height:400}))
 
    completeControls: (fields) =>
        select = $('#fecundityControlField')
        select.empty()
        for field in fields
            select.append $('<option>').attr(value: field).text(field)
        select.attr(disabled: false)
        $('#fecundityControlPlot').button('enable')

    makeFecundityObjects: (fecundityPlot, x, x0) =>
        $('#fcnd').css(cursor: 'wait')
        $('#fcndload').html $('<img>').attr(src: 'ajax-loader.gif')
        $('#fecundityChoice').empty()
        args = {
            dataf: @workspace.data
            fecConstants: 'data.frame(NA)'
            meanOffspringSize: 'NA'
            sdOffspringSize: 'NA'
            vitalRatesPerOffspringType: 'data.frame(NA)'
            Formula: 'c('
            Family: 'c('
            Transform: 'c('
        }
        # add previous frames
        for frame in @path
            args.Formula = args.Formula + frame.formula + ','
            args.Family = args.Family + '"' + frame.family + '",'
            args.Transform = args.Transform + '"' + frame.transform + '",'
        # add new frame
        frame = {
            field: $('#fecundityControlField').val()
            family: $('#fecundityControlFamily').val()
            transform: $('#fecundityControlTransform').val()
            formulae: ['1', 'size', 'size+size2']
        }
        args.Formula = args.Formula + frame.field
        args.Family = args.Family + '"' + frame.family + '")'
        args.Transform = args.Transform + '"' + frame.transform + '")'
        tasks = for formula in frame.formulae
            data = $.extend({}, args)
            data.Formula = data.Formula + '~' + formula + ')'
            @openCPU.callFunction('IPMpack', 'makeFecObj', data)
        fecundityPlot.setBusy()
        $.when(tasks...)
        .fail(@openCPU.showErrorIn $('#fecundityChoice'))
        .fail ->
            $('#fcnd').css(cursor: 'auto')
            $('#fcndload').empty()            
            $('#fecundityControlPlot').button('enable')
            fecundityPlot.setIdle()
        .done (responses...) =>
            @fecundityObjects = for doneArgs in responses
                doneArgs[0].object
            data = {
                Sp: @workspace.data
                field: @openCPU.quote(frame.field)
                x: x
                x0: x0
            }
            script = ['''
                fs <- order(Sp$size, na.last=NA)
                fs.fec <- (Sp[,field])[fs]
                fs.size <- (Sp$size)[fs]
                levels <- as.numeric(cut(fs.size, 50))
                pfz <- tapply(fs.size, levels, mean, na.rm=TRUE)
                ps <- tapply(fs.fec, levels, mean, na.rm=TRUE)
                pfz <- pfz[!is.na(pfz)]
                ps <- ps[!is.na(pfz)]
                plot(as.numeric(pfz), as.numeric(ps), pch = 19, cex=1, col='black', xlab='size', ylab=field)
               ''']
            legend = for formula in frame.formulae
                '"' + frame.field + '~' + formula + '"'
            n = @path.length + 1
            aic = []
            for fo, i in @fecundityObjects
                varName = 'fo' + i
                data[varName] = fo
                script.push("""
                    y0 <- predict(#{varName}@fitFec[[#{n}]], newdata=x0)
                    y0 <- #{if frame.family=='binomial' then 'exp(y0)/(exp(y0)+1)' else 'exp(y0)+1'}
                    lines(x, y0, col=#{i+2})
                    """)
                aic.push("AIC(#{varName}@fitFec[[#{n}]])")
            script.push("""sprintf("%s: %s = %.1f", c(#{legend.join()}), "AIC", c(#{aic.join()}))""")
            task = @openCPU.callScript(script.join('\n'), data)
            fecundityPlot.updateSource(task.then (result) -> result.graphs[0])
            task
            .then (result) =>
                @openCPU.getObjectAsJson(result.object)
            .always ->
                $('#fcnd').css(cursor: 'auto')
                $('#fcndload').empty()            
                $('#fecundityControlPlot').button('enable')
            .fail(@openCPU.showErrorIn($('#fecundityChoice')))
            .done (legends) =>
                form = $('<form>')
                addButton = $('<button>').attr(type: 'button').text('Add').button()
                addButton.button('disable')
                for legend, i in legends
                    $('<input>').attr(
                        type: 'radio'
                        name: 'fec'
                        value: "#{i}"
                    ).appendTo(form).click ->
                        addButton.button('enable')
                    form.append $('<span>').css(color: @palette[i+1]).html(' &mdash;&mdash; ')
                    form.append $('<span>').css(fontSize: 'small').text(legend)
                    form.append $('<br>')
                fecundityObjects = @fecundityObjects
                addButton.appendTo(form).click =>
                    addButton.button('disable')
                    val = parseInt $('input[name=fec]:radio:checked').val()
                    field = frame.field
                    label = if @fieldLabels[field]? then "#{@fieldLabels[field]} (#{field})" else field
                    frame.explanatoryVar = frame.formulae[val]
                    frame.formula = field + '~' + frame.explanatoryVar
                    frame.fecundityObject = fecundityObjects[val]
                    @path.push(frame)
                    frame.task = @openCPU.callScript("""
                        fs <- order(Sp$size, na.last=NA)
                        fs.fec <- (Sp[,field])[fs]
                        fs.size <- (Sp$size)[fs]
                        levels <- as.numeric(cut(fs.size, 50))
                        pfz <- tapply(fs.size, levels, mean, na.rm=TRUE)
                        ps <- tapply(fs.fec, levels, mean, na.rm=TRUE)
                        pfz <- pfz[!is.na(pfz)]
                        ps <- ps[!is.na(pfz)]
                        plot(as.numeric(pfz), as.numeric(ps), pch = 19, cex=1, col='black', xlab='size', ylab=field)
                        y0 <- predict(fo@fitFec[[i]], newdata=x0)
                        y0 <- #{if frame.family=='binomial' then 'exp(y0)/(exp(y0)+1)' else 'exp(y0)+1'}
                        lines(x, y0, col="green")
                        """, {
                            Sp: @workspace.data
                            fo: frame.fecundityObject
                            i: @path.length
                            x: x
                            x0: x0
                            field: @openCPU.quote(field)
                            label: @openCPU.quote(label)
                            })
                    $('#fecundityPath').empty()
                    for f in @path
                        $('#fecundityPath').append $('<p>').css(fontSize: 'small').text("#{f.formula} (family=#{f.family}, transform=#{f.transform})")
                    $('#fecundityControlSubmit').button('enable')
                $('#fecundityChoice').html(form)

class SubmitTab

    constructor: (@dataRepository) ->
        $('#submitButton').button()
        $('#submitSurvivalMessage').html $('<p>').css(color: '#cc0000', cursor: 'pointer').text('Click here to create a Survival Object').click -> $('#tabs').tabs('select', 1)
        $('#submitGrowthMessage').html $('<p>').css(color: '#cc0000', cursor: 'pointer').text('Click here to create a Growth Object').click -> $('#tabs').tabs('select', 2)
        $('#submitFecundityMessage').html $('<p>').css(color: '#cc0000', cursor: 'pointer').text('Click here to create a Fecundity Object').click -> $('#tabs').tabs('select', 3)

    start: (@openCPU, @workspace, @params) =>
        @checkReady()
        $('#submitButton').click =>
            $('#submitMessage').empty()
            $('#submitButton').button('disable')
            @dataRepository.putOutputData({
                workspace: JSON.stringify(@workspace)
                params: JSON.stringify(@params)
            })
            .done(displayWait)
            .fail (message) ->
                $('#submitMessage').html $('<p>').text(message)
                $('#submitButton').button('enable')

    checkReady: =>
        if @workspace.survivalObject? and @workspace.growthObject? and @workspace.fecundityObject?
            $('#submitMessage').html $('<p>').text('Ready to submit')
            $('#submitButton').button('enable')
        else
            $('#submitMessage').html $('<p>').text('Not ready to submit:')
            $('#submitButton').button('disable')

    updateSurvival: (task) =>
        $('#submitSurvivalMessage').html $('<p>').css(color: '#999999').text('Creating Survival Objects...')
        $('#submitSurvivalMessage p').append $('<img>').attr(src: 'ajax-loader.gif')
        $('#tabs').tabs('select', 4)
        task
        .then =>
            # we have successully replaced any previous survivalObject, so remove out-of-date plots
            $('#submitSurvival .plot').empty()
            $('#submitSurvival .text').html $('<img>').attr(src: 'ajax-loader.gif')
            @openCPU.callScript('''
                    library(IPMpack)
                    picSurv(data, survivalObject, ncuts=100)
                ''', {
                    data: @workspace.data
                    survivalObject: @workspace.survivalObject
                })
        .then (result) =>
            fitPlot = result.graphs[0]
            @workspace.plot.survivalObjectFitPlot = fitPlot
            $('#submitSurvival .plot').html $('<img>').attr(src: @openCPU.getPngUrl(fitPlot))
            @openCPU.getObjectAsText(@workspace.survivalObject)
        .done (result) ->
            $('#submitSurvival .text').html $('<pre>').text(result)
            $('#submitSurvivalMessage').empty()
        .fail(@openCPU.showErrorIn $('#submitSurvival .text'))
        .fail =>
            if @workspace.survivalObject?
                $('#submitSurvivalMessage').empty()
            else
                $('#submitSurvivalMessage').html $('<p>').css(color: '#cc0000', cursor: 'pointer').text('Click here to create a Survival Object').click -> $('#tabs').tabs('select', 1)
        .always @checkReady

    updateGrowth: (task) =>
        $('#submitGrowthMessage').html $('<p>').css(color: '#999999').text('Creating Growth Objects...')
        $('#submitGrowthMessage p').append $('<img>').attr(src: 'ajax-loader.gif')
        $('#tabs').tabs('select', 4)
        task
        .then =>
            $('#submitGrowth .plot').empty()
            $('#submitGrowth .text').html $('<img>').attr(src: 'ajax-loader.gif')
            @openCPU.callScript('''
                    library(IPMpack)
                    picGrow(data, growthObject)
                ''', {
                    data: @workspace.data
                    growthObject: @workspace.growthObject
                })
        .then (result) =>
            fitPlot = result.graphs[0]
            @workspace.plot.growthObjectFitPlot = fitPlot
            $('#submitGrowth .plot').html $('<img>').attr(src: @openCPU.getPngUrl(fitPlot))
            @openCPU.getObjectAsText(@workspace.growthObject)
        .done (result) ->
            $('#submitGrowth .text').html $('<pre>').text(result)
            $('#submitGrowthMessage').empty()
        .fail(@openCPU.showErrorIn $('#submitGrowth .text'))
        .fail =>
            if @workspace.growthObject?
                $('#submitGrowthMessage').empty()
            else
                $('#submitGrowthMessage').html $('<p>').css(color: '#cc0000', cursor: 'pointer').text('Click here to create a Growth Object').click -> $('#tabs').tabs('select', 2)
        .always @checkReady

    updateFecundity: (fecundityPath) =>
        $('#submitFecundityMessage').html $('<p>').css(color: '#999999').text('Creating Fecundity Objects...')
        $('#submitFecundityMessage p').append $('<img>').attr(src: 'ajax-loader.gif')
        $('#submitFecundity .content').empty()
        $('#tabs').tabs('select', 4)
        formulae = []
        tasks = []
        @workspace.plot.fecundityObjectFitPlots = []
        content = $('#submitFecundity .content')
        handleFrameTask = (frame, i) =>
            div = $('<div>').appendTo(content)
            div.html $('<img>').attr(src: 'ajax-loader.gif')
            frame.task
            .then (result) =>
                plot = result.graphs[0]
                @workspace.plot.fecundityObjectFitPlots[i] = plot
                div.html $('<img>').attr(src: @openCPU.getPngUrl(plot))
                @openCPU.getObjectAsText(frame.fecundityObject)
            .done (text) =>
                div.append $('<pre>').text(text)
            .fail(@openCPU.showErrorIn div)
        tasks = for frame, i in fecundityPath
            formulae.push frame.formula
            content.append $('<h3>').text(formulae.join(', '))
            # Deferred tasks within a for loop need to be in a function to "lock" the
            # iterated values by creating a new closure.
            handleFrameTask(frame, i)
        $.when(tasks...)
        .always ->
            $('#submitFecundityMessage').empty()
        .always(@checkReady)

class Interaction

    constructor: (@dataRepository) ->

    display: =>
        submitTab = new SubmitTab(@dataRepository)
        survivalTab = new SurvivalTab(submitTab)
        growthTab = new GrowthTab(submitTab)
        fecundityTab = new FecundityTab(submitTab)
        $('#dataload').html $('<img>').attr(src: 'ajax-loader.gif')
        params = {
            survival: {}
            growth: {}
        }
        @dataRepository.getInputData()
        .fail (message) ->
            $('#data').html $('<p>').text('getInputData failed: #{message}')
            $('#dataload').empty()
        .done (inputData) =>
            workspace = $.parseJSON inputData.workspace
            openCPU = new OpenCPU(workspace.openCPU)
            data = workspace.data
            openCPU.getObject(workspace.data)
            .done (result) =>
                $('#data').html $('<pre>').text(result)
            .fail(openCPU.showErrorIn $('#data'))
            .always ->
                $('#dataload').empty()
            openCPU.callFunction('grDevices', 'rgb', {
                    red: 't(col2rgb(palette()))'
                    alpha: 255
                    maxColorValue: 255
                }, 'json')
            .done (result) =>
                palette = for rgba in result
                    rgba.substr(0, 7) # first 7 chars are #RRGGBB, exluding alpha
                survivalTab.start(openCPU, workspace, params.survival, palette)
                growthTab.start(openCPU, workspace, params.growth, palette)
                fecundityTab.start(openCPU, workspace, params, palette, inputData.fecundityFields,
                    inputData.fecundityPlotsInitial, inputData.fecundityHistsInitial, inputData.fieldLabels,
                    inputData.x, inputData.x0)
            submitTab.start(openCPU, workspace, params)

dataRepository = new PmrpcDataRepository('publish')
interaction = new Interaction(dataRepository)
$(document).ready ->
    $('#tabs').tabs()
    interaction.display()
