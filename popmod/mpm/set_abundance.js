(function() {
  var AbundanceDialog, PmrpcDataRepository, TestDataRepository, abundanceDialog, dataRepository, generateID,
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

  AbundanceDialog = (function() {

    function AbundanceDialog(dataRepository, content) {
      this.dataRepository = dataRepository;
      this.content = content;
      this.userSubmitsStages = __bind(this.userSubmitsStages, this);
      this.dataRepositoryFailure = __bind(this.dataRepositoryFailure, this);
      this.getInputDataSuccess = __bind(this.getInputDataSuccess, this);
      this.run = __bind(this.run, this);
    }

    AbundanceDialog.prototype.run = function() {
      this.content.text("Fetching data...");
      return this.dataRepository.getInputData(this.getInputDataSuccess, this.dataRepositoryFailure);
    };

    AbundanceDialog.prototype.getInputDataSuccess = function(inputData) {
      var abundanceFields, elemId, field, i, initial, label, maxStageChars, row, stage, stages, submitButton, _len,
        _this = this;
      $('#title').text(inputData.title);
      $('#message').text(inputData.message);
      stages = inputData.stages;
      this.content.empty();
      maxStageChars = Math.max.apply(Math, (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = stages.length; _i < _len; _i++) {
          stage = stages[_i];
          _results.push(stage.length);
        }
        return _results;
      })());
      abundanceFields = [];
      for (i = 0, _len = stages.length; i < _len; i++) {
        stage = stages[i];
        initial = inputData.abundances != null ? inputData.abundances[i].toString() : "0";
        elemId = generateID();
        label = $("<label>").attr({
          "for": elemId
        }).css({
          float: 'left',
          paddingRight: '5px',
          width: "" + maxStageChars + "em"
        }).text(stage);
        field = $("<input>").attr({
          id: elemId,
          value: initial
        }).css({
          width: '10em'
        }).focus(function(event) {
          return $(event.currentTarget).select();
        });
        abundanceFields.push(field);
        row = $("<div style='clear:both;padding-top:3px;padding-bottom:3px'></div>'").append(label).append(field);
        this.content.append(row);
      }
      abundanceFields[0].focus();
      submitButton = $("<input type='button' value='Confirm' style='clear:both'>");
      submitButton.button();
      submitButton.click(function() {
        var field;
        submitButton.button("disable");
        return _this.userSubmitsStages({
          abundances: (function() {
            var _i, _len2, _results;
            _results = [];
            for (_i = 0, _len2 = abundanceFields.length; _i < _len2; _i++) {
              field = abundanceFields[_i];
              _results.push(parseInt(field.val()));
            }
            return _results;
          })()
        });
      });
      return this.content.append(submitButton);
    };

    AbundanceDialog.prototype.dataRepositoryFailure = function(message) {
      return $('#message').text(message);
    };

    AbundanceDialog.prototype.userSubmitsStages = function(result) {
      this.dataRepository.putOutputData(result, (function() {}), this.dataRepositoryFailure);
      return $('#message').text("Submitted");
    };

    return AbundanceDialog;

  })();

  TestDataRepository = (function() {

    function TestDataRepository() {}

    TestDataRepository.prototype.getInputData = function(onSuccess, onFailure) {
      return onSuccess({
        "stages": ["S", "J", "V", "G", "D"]
      });
    };

    TestDataRepository.prototype.putOutputData = function(data, onSuccess, onFailure) {
      alert(JSON.stringify(data));
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

  abundanceDialog = new AbundanceDialog(dataRepository, $('#content'));

  $(document).ready(abundanceDialog.run);

}).call(this);
