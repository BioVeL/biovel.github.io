# Load a file and return a JQuery promise
# If file is read successfully, promise returns contents of file
# If an error occurs, a FileReader error object is returned
loadFile = (file) ->
    d = $.Deferred()
    reader = new FileReader()
    reader.onload = (event) ->
        d.resolve reader.result
    reader.onerror = (event) ->
        d.reject reader.error
    reader.readAsText(file)
    d.promise()

loadFileErrorMessage = (error) ->
    switch error.code
        when error.NOT_FOUND_ERR then 'File not found'
        when error.NOT_READABLE_ERR then 'File not readable'
        when error.ABORT_ERR then 'Read operation was aborted'
        when error.SECURITY_ERR then 'File is in a locked state'
        when error.ENCODING_ERR then 'The file is too long to encode in a "data://" URL'
        else 'File read error'

createMatrixPromise = (file, span) ->
    loadFile(file)
    .done (result) ->
        span.html $('<pre>').css(border: '2px solid black').text(result)
    .fail (error) ->
        span.empty().css(border: '2px solid red').text(loadFileErrorMessage(error))


class MatrixSelectionPage

    constructor: (@dataRepository, @messageBar) ->

    run: =>
        @messageBar.text("Fetching data...")
        @dataRepository.getInputData(@getInputDataSuccess, @dataRepositoryFailure)

    handleFileChange: (index, contents) =>
        (evt) =>
            contents.empty()
            matrixList = for file in evt.target.files
                span = $('<div>').appendTo(contents).html $('<img>').attr(src: 'ajax-loader.gif')
                createMatrixPromise(file, span)
            $.when(matrixList...)
            .done (matrices...) =>
                @matrices[index] = matrices

    getInputDataSuccess: (inputData) =>
        $('#title').text(inputData.title)
        $("#field").text(inputData.field)
        values = inputData.values
        multiple = if inputData.multiple == 'true' then true else false
        forceEqualNumberMatricesPerField = if inputData.forceEqualNumberMatricesPerField == 'true' then true else false
        minMatricesPerField = if inputData.minMatricesPerField then inputData.minMatricesPerField else 1
        maxMatricesPerField = if inputData.maxMatricesPerField then inputData.maxMatricesPerField else -1
        extraValidationMessage = if inputData.extraValidationMessage then " " + inputData.extraValidationMessage else ".";
        @matrices = for element in values
            []
        table = $("tbody#content")
        color1 = '#ccffcc'
        color2 = '#99ff99'
        background = color1
        for value, i in values
            tr = $('<tr>').css(background: background, paddingTop: '3px', paddingBottom: '3px')
            background = if background == color1 then color2 else color1
            tr.append $('<td>').text(value)
            fileinput = $('<input>').attr(type: 'file').prop(multiple: multiple)
            tr.append $('<td>').append(fileinput)
            contents = $('<td>').appendTo(tr)
            matrixPromises = []
            fileinput.change @handleFileChange(i, contents)
            table.append(tr)
        submitButton = $("<input type='button' value='Confirm'>")
        submitButton.button()
        submitButton.click =>
            errMessage = ""
            filesPerField = 0
            arrFileFields = $('input[type="file"]')

            for element, index in arrFileFields
                if (multiple)
                    if (element.files.length < minMatricesPerField)
                      errMessage = "Please, make sure that each " + inputData.field.toLowerCase() + " has "
                      if (maxMatricesPerField<minMatricesPerField)
                         errMessage = errMessage + minMatricesPerField + " or more matrices"
                      else if (maxMatricesPerField>minMatricesPerField)
                         errMessage = errMessage + "between " + minMatricesPerField + " and " + maxMatricesPerField  + " matrices"
                      else errMessage = errMessage + minMatricesPerField + " matri" + `(minMatricesPerField==1 ? "x" : "ces")`
                      errMessage = errMessage + extraValidationMessage
                      break
                    else if (element.files.length > maxMatricesPerField && maxMatricesPerField>0) 
                      errMessage = "Please, make sure that each " + inputData.field.toLowerCase() + " hasn't got more than " + maxMatricesPerField +  " matri" + `(maxMatricesPerField==1 ? "x" : "ces")`
                      break
                    else if (filesPerField != 0 && element.files.length != filesPerField && forceEqualNumberMatricesPerField)
                      errMessage = "Please, make sure that all the elements have the same numbers of matrices"
                      break
                    else
                      filesPerField = element.files.length
                else if (element.files.length == 0)
                    errMessage = "Please, make sure that each " + inputData.field.toLowerCase() + " has 1 matrix."
                    break

            if (errMessage!="")
                alert(errMessage)
                return

            submitButton.button("disable")
            @userSubmits(@matrices)
        $('#submit').html(submitButton)
        @messageBar.text(inputData.message)

    dataRepositoryFailure: (message) =>
        @messageBar.text(message)

    userSubmits: (matrices) =>
        @dataRepository.putOutputData({matrices: matrices}, (->), @dataRepositoryFailure)
        @messageBar.text("Submitted")


class TestDataRepository
    getInputData: (onSuccess, onFailure) ->
        onSuccess {"unsortedStages": ["S", "x", "D", "G", "J", "V"]}

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

# Check for the various File API support.
if (window.File? && window.FileReader? && window.FileList?)
    # Great success! All the File APIs are supported.
else
    alert('The File APIs are not fully supported in this browser.')

# add "?test" to URL to invoke test
dataRepository = if $(location).attr('search') is "?test" then new TestDataRepository() else new PmrpcDataRepository("publish")
page = new MatrixSelectionPage(dataRepository, $('#message'))

$(document).ready page.run
