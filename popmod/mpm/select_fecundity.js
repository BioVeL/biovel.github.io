(function() {
  var PmrpcDataRepository, StagesDialog, TestDataRepository, createUpdateHandler, dataRepository, generateID, stagesDialog,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  generateID = function() {
    var alpha, i;
    alpha = "abcdefghijklmnopqrstuvwxyz";
    return ((function() {
      var _results;
      _results = [];
      for (i = 0; i <= 7; i++) {
        _results.push(alpha[Math.floor(Math.random() * 26)]);
      }
      return _results;
    })()).join('');
  };

  createUpdateHandler = function(tr, recruited, reproductive) {
    return function() {
      if (recruited.prop('checked')) {
        if (reproductive.prop('checked')) {
          return tr.css({
            'background-color': '#ccff99'
          });
        } else {
          return tr.css({
            'background-color': '#99ff99'
          });
        }
      } else {
        if (reproductive.prop('checked')) {
          return tr.css({
            'background-color': '#ffcc99'
          });
        } else {
          return tr.css({
            'background-color': '#66cc66'
          });
        }
      }
    };
  };

  StagesDialog = (function() {

    function StagesDialog(dataRepository, content, messageBar) {
      this.dataRepository = dataRepository;
      this.content = content;
      this.messageBar = messageBar;
      this.userSubmitsStages = __bind(this.userSubmitsStages, this);
      this.dataRepositoryFailure = __bind(this.dataRepositoryFailure, this);
      this.getInputDataSuccess = __bind(this.getInputDataSuccess, this);
      this.run = __bind(this.run, this);
    }

    StagesDialog.prototype.run = function() {
      this.messageBar.text("Fetching data...");
      return this.dataRepository.getInputData(this.getInputDataSuccess, this.dataRepositoryFailure);
    };

    StagesDialog.prototype.getInputDataSuccess = function(inputData) {
      var checkbox, recruitedCheckbox, reproductiveCheckbox, rowId, rows, stage, stages, submitButton, table, td, tr, _i, _j, _len, _len2, _ref,
        _this = this;
      $('#title').text(inputData.title);
      stages = inputData.unsortedStages;
      table = $("tbody#content");
      rows = [];
      for (_i = 0, _len = stages.length; _i < _len; _i++) {
        stage = stages[_i];
        rowId = 'content_' + generateID();
        tr = $("<tr id='" + rowId + "' style='background-color:#66cc66;padding-top:3px;padding-bottom:3px'><td width='20%' align='right'>" + stage + "</td></tr>'");
        recruitedCheckbox = $("<input type='checkbox'>");
        reproductiveCheckbox = $("<input type='checkbox'>");
        rows.push({
          stage: stage,
          recruitedCheckbox: recruitedCheckbox,
          reproductiveCheckbox: reproductiveCheckbox
        });
        _ref = [recruitedCheckbox, reproductiveCheckbox];
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          checkbox = _ref[_j];
          td = $("<td align='center'></td>");
          td.append(checkbox);
          tr.append(td);
          checkbox.change(createUpdateHandler(tr, recruitedCheckbox, reproductiveCheckbox));
        }
        table.append(tr);
      }
      submitButton = $("<input type='button' value='Confirm'>");
      submitButton.button();
      submitButton.click(function() {
        var recruitStages, reproductiveStages, row, sortedStages;
        submitButton.button("disable");
        sortedStages = (function() {
          var _k, _len3, _results;
          _results = [];
          for (_k = 0, _len3 = rows.length; _k < _len3; _k++) {
            row = rows[_k];
            _results.push(row.stage);
          }
          return _results;
        })();
        recruitStages = (function() {
          var _k, _len3, _results;
          _results = [];
          for (_k = 0, _len3 = rows.length; _k < _len3; _k++) {
            row = rows[_k];
            if (row.recruitedCheckbox.prop('checked')) _results.push(row.stage);
          }
          return _results;
        })();
        reproductiveStages = (function() {
          var _k, _len3, _results;
          _results = [];
          for (_k = 0, _len3 = rows.length; _k < _len3; _k++) {
            row = rows[_k];
            if (row.reproductiveCheckbox.prop('checked')) _results.push(row.stage);
          }
          return _results;
        })();
        return _this.userSubmitsStages({
          sortedStages: sortedStages,
          recruitedStages: recruitStages,
          reproductiveStages: reproductiveStages
        });
      });
      $('#submit').html(submitButton);
      return this.messageBar.text(inputData.message);
    };

    StagesDialog.prototype.dataRepositoryFailure = function(message) {
      return this.messageBar.text(message);
    };

    StagesDialog.prototype.userSubmitsStages = function(result) {
      this.dataRepository.putOutputData(result, (function() {}), this.dataRepositoryFailure);
      return this.messageBar.text("Submitted");
    };

    return StagesDialog;

  })();

  TestDataRepository = (function() {

    function TestDataRepository() {}

    TestDataRepository.prototype.getInputData = function(onSuccess, onFailure) {
      return onSuccess({
        "unsortedStages": ["S", "x", "D", "G", "J", "V"]
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