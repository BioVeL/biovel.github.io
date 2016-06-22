(function() {
  var Interaction, dataRepository, displayWait, interaction;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  displayWait = function() {
    $('body').css({
      cursor: 'wait'
    });
    return setTimeout((function() {
      return $('body').css({
        cursor: 'auto'
      });
    }), 10000);
  };
  Interaction = (function() {
    function Interaction(dataRepository) {
      this.dataRepository = dataRepository;
      this.display = __bind(this.display, this);
    }
    Interaction.prototype.display = function() {
      $('button').button();
      return this.dataRepository.getInputData().fail(function(message) {
        return $('body').html($('<p>').text('getInputData failed: #{message}'));
      }).done(__bind(function(inputData) {
        var field, fieldLabels, isFecundity, row, tbody, _i, _len, _ref;
        tbody = $('tbody');
        isFecundity = {};
        fieldLabels = {};
        _ref = inputData.fields;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          field = _ref[_i];
          row = $('<tr>');
          row.append($('<td>').text(field));
          isFecundity[field] = $('<input>').attr({
            type: 'checkbox'
          });
          $('<td>').css({
            textAlign: 'center'
          }).append(isFecundity[field]).appendTo(row);
          fieldLabels[field] = $('<input>').attr({
            type: 'text'
          });
          $('<td>').append(fieldLabels[field]).appendTo(row);
          tbody.append(row);
        }
        $('#wait').empty();
        $('#nextButton').click(__bind(function() {
          var checkbox, field, label, labels, textInput;
          $('#nextButton').button('disable');
          labels = {};
          for (field in fieldLabels) {
            textInput = fieldLabels[field];
            label = $.trim(textInput.val());
            if (label.length > 0) {
              labels[field] = label;
            }
          }
          return this.dataRepository.putOutputData({
            fieldLabels: JSON.stringify(labels),
            fecundityFields: (function() {
              var _results;
              _results = [];
              for (field in isFecundity) {
                checkbox = isFecundity[field];
                if (checkbox.prop('checked')) {
                  _results.push(field);
                }
              }
              return _results;
            })()
          }).done(displayWait).fail(function(message) {
            alert(message);
            return $('#nextButton').button('enable');
          });
        }, this));
        return $('#nextButton').button('enable');
      }, this));
    };
    return Interaction;
  })();
  dataRepository = new PmrpcDataRepository('publish');
  interaction = new Interaction(dataRepository);
  $(document).ready(function() {
    return interaction.display();
  });
}).call(this);
