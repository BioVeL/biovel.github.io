(function() {
  var PmrpcDataRepository, ResultsPage, TestDataRepository, dataRepository, resultsPage,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ResultsPage = (function() {

    function ResultsPage(dataRepository, content) {
      this.dataRepository = dataRepository;
      this.content = content;
      this.dataRepositoryFailure = __bind(this.dataRepositoryFailure, this);
      this.getInputDataSuccess = __bind(this.getInputDataSuccess, this);
      this.run = __bind(this.run, this);
    }

    ResultsPage.prototype.run = function() {
      this.content.text("Fetching data...");
      return this.dataRepository.getInputData(this.getInputDataSuccess, this.dataRepositoryFailure);
    };

    ResultsPage.prototype.getCITable = function(confidenceIntervalJSON) {
      var botRow, confidenceInterval, k, table, topRow, v;
      confidenceInterval = $.parseJSON(confidenceIntervalJSON);
      table = $('<table>');
      topRow = $('<tr>').attr({
        "class": 'ui-widget-header'
      });
      botRow = $('<tr>').attr({
        "class": 'ui-widget-content'
      });
      for (k in confidenceInterval) {
        v = confidenceInterval[k];
        topRow.append($('<th>').text(k));
        botRow.append($('<td>').text(v));
      }
      return table.append(topRow).append(botRow);
    };

    ResultsPage.prototype.getInputDataSuccess = function(inputData) {
      $('#header').text(inputData.speciesName);
      this.content.text("");
      this.content.append($("<h2>").text("Stage Matrix"));
      this.content.append($("<pre>").text(inputData.stageMatrix));
      this.content.append($("<h2>").text("Eigenanalysis"));
      this.content.append($("<pre>").text(inputData.eigenanalysis));
      this.content.append($("<h2>").text("Projection Matrix"));
      this.content.append($('<img>').attr({
        src: inputData.projectionMatrix
      }));
      this.content.append($("<h2>").text("Bar Plot"));
      this.content.append($('<img>').attr({
        src: inputData.barPlot
      }));
      this.content.append($("<h2>").text("Elasticity Matrix"));
      this.content.append($('<img>').attr({
        src: inputData.elasticityMatrix
      }));
      this.content.append($("<h2>").text("Sensitivity Matrix 1"));
      this.content.append($('<img>').attr({
        src: inputData.sensitivityMatrix1
      }));
      this.content.append($("<h2>").text("Sensitivity Matrix 2"));
      this.content.append($('<img>').attr({
        src: inputData.sensitivityMatrix2
      }));
      this.content.append($('<h2>').text("Confidence Interval"));
      this.content.append(this.getCITable(inputData.confidenceIntervalJSON));
      this.content.append($('<img>').attr({
        src: inputData.ciHistogram
      }));
      return this.dataRepository.putOutputData({}, (function() {}), (function() {}));
    };

    ResultsPage.prototype.dataRepositoryFailure = function(message) {
      return this.content.text(message);
    };

    return ResultsPage;

  })();

  TestDataRepository = (function() {

    function TestDataRepository() {}

    TestDataRepository.prototype.getInputData = function(onSuccess, onFailure) {
      return onSuccess({
        speciesName: "Dicia taba",
        stageMatrix: "Lot's of text",
        eigenanalysis: "Lot's of text",
        projectionMatrix: "http://www.statmethods.net/graphs/images/barplot1.jpg",
        barPlot: "http://www.statmethods.net/graphs/images/barplot1.jpg",
        elasticityMatrix: "http://www.statmethods.net/graphs/images/barplot1.jpg",
        sensitivityMatrix1: "http://www.statmethods.net/graphs/images/barplot1.jpg",
        sensitivityMatrix2: "http://www.statmethods.net/graphs/images/barplot1.jpg",
        confidenceIntervalJSON: '{"2.5%": 0.89, "97.5%": 1.47}',
        ciHistogram: "http://www.statmethods.net/graphs/images/barplot1.jpg"
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

  resultsPage = new ResultsPage(dataRepository, $('#content'));

  $(document).ready(resultsPage.run);

}).call(this);
