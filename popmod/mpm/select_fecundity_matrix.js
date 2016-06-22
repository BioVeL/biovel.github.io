(function() {
  var PmrpcDataRepository, StagesDialog, TestDataRepository, createUpdateHandler, dataRepository, stagesDialog,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  createUpdateHandler = function(td, checkbox) {
    return function() {
      if (checkbox.prop('checked')) {
        return td.css({
          backgroundColor: '#99ff99'
        });
      } else {
        return td.css({
          backgroundColor: '#cccccc'
        });
      }
    };
  };

  StagesDialog = (function() {

    function StagesDialog(dataRepository, content, messageBar) {
      this.dataRepository = dataRepository;
      this.content = content;
      this.messageBar = messageBar;
      this.userSubmits = __bind(this.userSubmits, this);
      this.dataRepositoryFailure = __bind(this.dataRepositoryFailure, this);
      this.getInputDataSuccess = __bind(this.getInputDataSuccess, this);
      this.run = __bind(this.run, this);
    }

    StagesDialog.prototype.run = function() {
      this.messageBar.text("Fetching data...");
      return this.dataRepository.getInputData(this.getInputDataSuccess, this.dataRepositoryFailure);
    };

    StagesDialog.prototype.getInputDataSuccess = function(inputData) {
      var checkbox, col, header, headerRow, row, rows, stage, stageCol, stageRow, stages, submitButton, table, td, tr, _i, _len, _len2, _len3,
        _this = this;
      $('#title').text(inputData.title);
      stages = inputData.stages;
      rows = [];
      header = $('thead#head');
      headerRow = $('<tr>').append($('<th>'));
      for (_i = 0, _len = stages.length; _i < _len; _i++) {
        stage = stages[_i];
        headerRow.append($('<th>').text(stage));
      }
      header.html(headerRow);
      table = $("tbody#content");
      for (row = 0, _len2 = stages.length; row < _len2; row++) {
        stageRow = stages[row];
        tr = $('<tr>').css({
          paddingTop: '3px',
          paddingBottom: '3px'
        });
        tr.append($('<th>').attr({
          align: 'right'
        }).text(stageRow));
        for (col = 0, _len3 = stages.length; col < _len3; col++) {
          stageCol = stages[col];
          checkbox = $('<input>').attr({
            type: 'checkbox',
            value: "" + (row + 1) + (col + 1)
          });
          td = $('<td>').attr({
            align: 'center'
          }).css({
            backgroundColor: '#cccccc'
          }).append(checkbox);
          checkbox.change(createUpdateHandler(td, checkbox));
          tr.append(td);
        }
        table.append(tr);
      }
      submitButton = $('<input>').attr({
        type: 'button',
        value: 'Confirm'
      });
      submitButton.button();
      submitButton.click(function() {
        var fecundity;
        submitButton.button("disable");
        fecundity = $('input:checkbox:checked').map(function() {
          return $(this).val();
        }).get() || [];
        return _this.userSubmits({
          fecundityIndices: fecundity
        });
      });
      $('#submit').html(submitButton);
      return this.messageBar.text(inputData.message);
    };

    StagesDialog.prototype.dataRepositoryFailure = function(message) {
      return this.messageBar.text(message);
    };

    StagesDialog.prototype.userSubmits = function(result) {
      console.log(result);
      this.dataRepository.putOutputData(result, (function() {}), this.dataRepositoryFailure);
      return this.messageBar.text("Submitted");
    };

    return StagesDialog;

  })();

  TestDataRepository = (function() {

    function TestDataRepository() {}

    TestDataRepository.prototype.getInputData = function(onSuccess, onFailure) {
      return onSuccess({
        'title': 'Select fecundity transitions',
        'message': 'Select fecundity stage transitions, and click the Confirm button',
        "stages": ["S", "J", "V", "G", "D"]
      });
    };

    TestDataRepository.prototype.putOutputData = function(data, onSuccess, onFailure) {
      return onSuccess({});
    };

    return TestDataRepository;

  })();

  PmrpcDataRepository = (function() {

    function PmrpcDataRepository(destination) {
      this.destination = destination;
    }

    PmrpcDataRepository.prototype.getInputData = function(onSuccess, onFailure) {
      return pmrpc.call({
        destination: this.destination,
        publicProcedureName: "getInputData",
        params: [],
        onSuccess: function(callResult) {
          return onSuccess(callResult.returnValue);
        },
        onFailure: function(callResult) {
          return onFailure(callResult.message);
        }
      });
    };

    PmrpcDataRepository.prototype.putOutputData = function(data, onSuccess, onFailure) {
      return pmrpc.call({
        destination: this.destination,
        publicProcedureName: "reply",
        params: ["OK", data],
        onSuccess: function(callResult) {
          return onSuccess(callResult.returnValue);
        },
        onFailure: function(callResult) {
          return onFailure(callResult.message);
        }
      });
    };

    return PmrpcDataRepository;

  })();

  dataRepository = $(location).attr('search') === "?test" ? new TestDataRepository() : new PmrpcDataRepository("publish");

  stagesDialog = new StagesDialog(dataRepository, $('#content'), $('#message'));

  $(document).ready(stagesDialog.run);

}).call(this);
