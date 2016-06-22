(function() {
  var PmrpcDataRepository, TestDataRepository, YearIntervalSelection, dataRepository, page, toggleyear,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  toggleyear = function(years, year, visibleElement) {
    return function() {
      if (year in years) {
        delete years[year];
        return visibleElement.html('&nbsp; ');
      } else {
        years[year] = true;
        return visibleElement.html('&nbsp;|<br/>|&nbsp;');
      }
    };
  };

  YearIntervalSelection = (function() {

    function YearIntervalSelection(dataRepository) {
      this.dataRepository = dataRepository;
      this.dataRepositoryFailure = __bind(this.dataRepositoryFailure, this);
      this.getInputDataSuccess = __bind(this.getInputDataSuccess, this);
      this.run = __bind(this.run, this);
    }

    YearIntervalSelection.prototype.run = function() {
      $('#message').text("Fetching data...");
      return this.dataRepository.getInputData(this.getInputDataSuccess, this.dataRepositoryFailure);
    };

    YearIntervalSelection.prototype.getInputDataSuccess = function(inputData) {
      var clickElement, content, final, first, submitButton, visibleElement, year, years, _ref,
        _this = this;
      first = inputData.firstYear;
      final = inputData.finalYear;
      years = {};
      content = $('#content');
      content.append($('<span>').css({
        fontSize: '200%'
      }).html('|&nbsp;'));
      for (year = first, _ref = final - 1; first <= _ref ? year <= _ref : year >= _ref; first <= _ref ? year++ : year--) {
        clickElement = $('<span>');
        clickElement.append($('<span>').text(year));
        visibleElement = $('<span>').css({
          fontSize: '200%'
        }).html('&nbsp; ').appendTo(clickElement);
        clickElement.click(toggleyear(years, year, visibleElement));
        content.append(clickElement);
      }
      content.append($('<span>').text(final));
      content.append($('<span>').css({
        fontSize: '200%'
      }).html('&nbsp;|'));
      submitButton = $("<input type='button' value='Confirm'>");
      submitButton.button();
      submitButton.click(function() {
        var range, ranges, start, year;
        submitButton.button("disable");
        ranges = [];
        start = null;
        for (year = first; first <= final ? year <= final : year >= final; first <= final ? year++ : year--) {
          if (!(start != null)) start = year;
          if (year in years) {
            range = [start, year];
            ranges.push(range);
            start = null;
          }
        }
        if (start != null) {
          range = [start, final];
          ranges.push(range);
        }
        $('#message').text("Complete");
        return _this.dataRepository.putOutputData({
          yearIntervals: ranges
        }, (function() {}), _this.dataRepositoryFailure);
      });
      $('#submit').html(submitButton);
      return $('#message').text("Click between years to add or remove a partition, then click Confirm to submit years for restrospective analyses");
    };

    YearIntervalSelection.prototype.dataRepositoryFailure = function(message) {
      return $('#message').text(message);
    };

    return YearIntervalSelection;

  })();

  TestDataRepository = (function() {

    function TestDataRepository() {}

    TestDataRepository.prototype.getInputData = function(onSuccess, onFailure) {
      return onSuccess({
        "firstYear": 1987,
        "finalYear": 2011
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

  page = new YearIntervalSelection(dataRepository);

  $(document).ready(page.run);

}).call(this);
