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
      var form, submitButton, year, yearField, yearSelector, years, _i, _len,
        _this = this;
      years = inputData.years;
      yearSelector = $("<select />").append("<option selected value=''>Select...</option>");
      for (_i = 0, _len = years.length; _i < _len; _i++) {
        year = years[_i];
        yearSelector.append("<option value='" + year + "'>" + year + "</option>");
      }
      submitButton = $("<input type='button' value='Confirm' disabled='true'>");
      yearField = $("<fieldset><label>Start Year: </label></fieldset>");
      yearField.css("background-color", "#ff9999");
      yearField.append(yearSelector);
      form = $("<form />").append(yearField).append(submitButton);
      yearSelector.change(function() {
        if (yearSelector.val() === '') {
          submitButton.attr('disabled', true);
          yearField.css("background-color", "#ff9999");
          return _this.messageBar.text("Complete all fields");
        } else {
          submitButton.attr('disabled', false);
          yearField.css("background-color", "transparent");
          return _this.messageBar.text("Click Confirm to submit selection to workflow");
        }
      });
      submitButton.click(function() {
        submitButton.attr('disabled', true);
        yearSelector.attr('disabled', true);
        return _this.userSubmitsYear(yearSelector.val());
      });
      this.messageBar.text("Complete all fields");
      return this.content.html(form);
    };

    YearDialog.prototype.dataRepositoryFailure = function(message) {
      return this.messageBar.text(message);
    };

    YearDialog.prototype.userSubmitsYear = function(year) {
      var yearSubmitted,
        _this = this;
      this.messageBar.text("Submitting selection to workflow...");
      yearSubmitted = function() {
        return _this.messageBar.text("Year " + year + " submitted");
      };
      return this.dataRepository.putOutputData({
        year: year
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
