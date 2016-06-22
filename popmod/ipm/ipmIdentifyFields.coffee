
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
        $('button').button()
        @dataRepository.getInputData()
        .fail (message) ->
            $('body').html $('<p>').text('getInputData failed: #{message}')
        .done (inputData) =>
            tbody = $('tbody')
            isFecundity = {}
            fieldLabels = {}
            for field in inputData.fields
                row = $('<tr>')
                row.append $('<td>').text(field)
                isFecundity[field] = $('<input>').attr(type: 'checkbox')
                $('<td>').css(textAlign: 'center').append(isFecundity[field]).appendTo(row)
                fieldLabels[field] = $('<input>').attr(type: 'text')
                $('<td>').append(fieldLabels[field]).appendTo(row)
                tbody.append(row)
            $('#wait').empty()
            $('#nextButton').click =>
                $('#nextButton').button('disable')
                labels = {}
                for field, textInput of fieldLabels
                    label = $.trim(textInput.val())
                    if label.length > 0
                        labels[field] = label
                @dataRepository.putOutputData({
                    fieldLabels: JSON.stringify(labels)
                    fecundityFields: (field for field, checkbox of isFecundity when checkbox.prop('checked'))
                })
                .done(displayWait)
                .fail (message) ->
                    alert(message)
                    $('#nextButton').button('enable')
            $('#nextButton').button('enable')

dataRepository = new PmrpcDataRepository('publish')
interaction = new Interaction(dataRepository)
$(document).ready ->
    interaction.display()
