class OpenCPULog

    constructor: (openCPU, log) ->
        if log?
            if log.opencpu != openCPU.base
                throw "different openCPU instance in log (#{log.opencpu} != #{openCPU.base}"
            @log = log
        else
            @log = {
                opencpu: openCPU.base
                libraries: {}
                commands: []
                names: {}
                rname: {}
            }

    library: (library) =>
        @log.libraries[library] = true

    command: (func, args, result) =>
        @log.commands.push arguments
        #assign = if result?.object? then "#{result.object} <- " else ""
        #console.log("#{assign}#{func}(#{(name + '=' + value for name,value of args).join()})")

    name: (name, result) =>
        if name of @log.names
            base = name
            i = 1
            loop
                name = "#{base}.#{i}"
                break unless name of @log.names
                i = i + 1
        @log.names[name] = result.object
        @log.rname[result.object] = name

class OpenCPU

    constructor: (@base, @log=new OpenCPULog(@)) ->

    getLog: => @log.log

    image: (options) =>
        openCPU = @
        span = $('<div>').css(position:'relative', height:"#{(if options?.height? then options.height else 480)}px",
            width:"#{(if options?.width? then options.width else 640)}px")
        main = $('<span>').appendTo(span)
        icon = $('<span>').appendTo(span).css(position:'absolute', top:'50%', left:'50%')
        $.extend span, {
            setBusy: ->
                main.css(opacity:'0.4', filter:'alpha(opacity=40)')
                icon.html $('<img>').attr(src: 'ajax-loader.gif')
            setIdle: ->
                icon.empty()
                main.css(opacity:'1', filter:'alpha(opacity=100)')
            loadImage: (handle) ->
                d = $.Deferred()
                image = new Image()
                image.onload = ->
                    d.resolve(image)
                image.onerror = ->
                    d.reject(null, 'Invalid image: #{handle}')
                image.src = openCPU.getPngUrl(handle, options)
                d.promise()
                .done (img) ->
                    main.html img
                .fail(openCPU.showErrorIn main)
                .always ->
                    span.setIdle()
            setSource: (handle) ->
                span.setBusy()
                span.loadImage(handle)
                span
            updateSource: (task) ->
                span.setBusy()
                task
                .then (handle) ->
                    span.loadImage(handle)
        }
        span

    # Display Ajax error message inside the _parent_ element
    # The contents of parent are completely replaced by the error message
    showErrorIn: (parent) ->
        (jqXHR, textStatus, errorThrown) ->
            message = if errorThrown? then errorThrown else textStatus
            if jqXHR.responseText? then message = message + ': ' + jqXHR.responseText
            parent.html $('<p>').css(color: '#cc0000').text(message)
        
    callFunction: (package, func, args='', type="save", dataType="json") =>
        config = {
            type: "POST"
            data: args
            dataType: dataType
        }
        $.ajax(@base + "R/pub/" + package + "/" + func + "/" + type, config)
        .done (result) =>
            @log.library(package)
            value = if type == 'save' then result else undefined
            @log.command(func, args, value)

    callObject: (object, args='', type="save", dataType="json") =>
        config = {
            type: "POST"
            data: args
            dataType: dataType
        }
        $.ajax(@getUrl(object) + "/" + type, config)
        .done (result) =>
            value = if type == 'save' then result else undefined
            @log.command(object, args, value)

    getObject: (object, type="print", dataType="text") =>
        config = {
            type: "GET"
            dataType: dataType
        }
        $.ajax(@getUrl(object) + "/" + type, config)

    getObjectAsText: (object) =>
        @getObject(object)

    getObjectAsJson: (object) =>
        @getObject(object, 'json', 'json')

    callScript: (script, args='', type="save", dataType="json") =>
        # Empty POST bodies do not work, so if no args, include a dummy
        # argument, so the POST body contains something. Note, OpenCPU
        # provides an error if unused arguments are provided, so we can 
        # only do this here, where we are defining the function and
        # calling it.
        if !args then args = {'dummy123': 1}
        prefix = "function(" + (param for param of args).join() + ") {\n"
        suffix = "\n}"
        stored = prefix + script + suffix
        @callFunction("base", "identity", {x: stored})
        .then (result) =>
            @callObject(result.object, args, type, dataType)

    getUrl: (object) => @base + "R/tmp/" + object

    getPngUrl: (object, options) =>
        params = if options? then '?' + ("!#{name}=#{value}" for name, value of options).join('&') else ''
        @getUrl("#{object}/png#{params}")

    quote: (s) -> '"' + s.replace(/"/g, '\\"') + '"'

this.OpenCPU = OpenCPU
