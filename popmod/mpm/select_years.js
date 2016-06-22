(function() {
  var PmrpcDataRepository, TestDataRepository, YearDialog, dataRepository, yearDialog,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  YearDialog = (function() {

    function YearDialog(dataRepository, content, messageBar) {
      this.dataRepository = dataRepository;
      this.content = content;
      this.messageBar = messageBar;
      this.userSubmitsYear = __bind(this.userSubmitsYear, this);
      this.dataRepositoryFailure = __bind(this.dataRepositoryFailure, this);
      this.getInputDataSuccess = __bind(this.getInputDataSuccess, this);
      this.run = __bind(this.run, this);
    }

    YearDialog.prototype.run = function() {
      this.messageBar.text("Fetching data...");
      return this.dataRepository.getInputData(this.getInputDataSuccess, this.dataRepositoryFailure);
    };

    YearDialog.prototype.getInputDataSuccess = function(inputData) {
      var checkbox, checkboxes, form, i, p, submitButton, year, yearField, years,
        _this = this;
      years = inputData.years;
      submitButton = $("<input type='button' value='Confirm' disabled='true'>");
      yearField = $("<fieldset><label>Generate Stage Matrices for: </label></fieldset>");
      checkboxes = (function() {
        var _len, _ref, _results;
        _ref = years.slice(0, -1);
        _results = [];
        for (i = 0, _len = _ref.length; i < _len; i++) {
          year = _ref[i];
          p = yearField;
          p.append($('<br>'));
          checkbox = $("<input type='checkbox' name='year' value='" + year + "'>").appendTo(p);
          p.append($('<span>').text("" + year + " - " + years[i + 1]));
          _results.push(checkbox);
        }
        return _results;
      })();
      form = $("<form />").append(yearField).append(submitButton);
      submitButton.attr('disabled', false);
      submitButton.click(function() {
        var checkbox, selected;
        submitButton.attr('disabled', true);
        selected = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = checkboxes.length; _i < _len; _i++) {
            checkbox = checkboxes[_i];
            if (checkbox.prop('checked')) _results.push(checkbox.val());
          }
          return _results;
        })();
        return _this.userSubmitsYear(selected);
      });
      this.messageBar.text("Select year range to generate stage matrices for transition. Click Confirm when done.");
      return this.content.html(form);
    };

    YearDialog.prototype.dataRepositoryFailure = function(message) {
      return this.messageBar.text(message);
    };

    YearDialog.prototype.userSubmitsYear = function(years) {
      var yearSubmitted,
        _this = this;
      this.messageBar.text("Submitting selection to workflow...");
      yearSubmitted = function() {
        return _this.messageBar.text("Years " + years + " submitted");
      };
      return this.dataRepository.putOutputData({
        years: years
      }, yearSubmitted, this.dataRepositoryFailure);
    };

    return YearDialog;

  })();

  TestDataRepository = (function() {

    function TestDataRepository() {}

    TestDataRepository.prototype.getInputData = function(onSuccess, onFailure) {
      return onSuccess({
        "years": [1987, 1988, 1989]
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

  yearDialog = new YearDialog(dataRepository, $('#content'), $('#message'));

  $(document).ready(yearDialog.run);

}).call(this);
