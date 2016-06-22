(function() {
  var Interaction, dataRepository, displayWait, filterFirstGraph, interaction;
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
  filterFirstGraph = function(result) {
    return result.graphs[0];
  };
  Interaction = (function() {
    function Interaction(dataRepository) {
      this.dataRepository = dataRepository;
      this.getInputDataSuccess = __bind(this.getInputDataSuccess, this);
      this.display = __bind(this.display, this);
    }
    Interaction.prototype.display = function() {
      $('button').button();
      return this.dataRepository.getInputData().fail(function(message) {
        return alert('getInputData failed: #{message}');
      }).done(this.getInputDataSuccess);
    };
    Interaction.prototype.getInputDataSuccess = function(inputData) {
      var openCPU, params, res, workspace;
      params = {};
      workspace = $.parseJSON(inputData.workspace);
      openCPU = new OpenCPU(workspace.openCPU);
      $('#continue').click(__bind(function() {
        $('#continue').button('disable');
        return this.dataRepository.putOutputData({
          workspace: JSON.stringify(workspace)
        }).done(displayWait).fail(function(message) {
          $('#message').html($('<p>').text(message));
          return $('#continue').button('enable');
        });
      }, this));
      $('#message').html($('<img>').attr({
        src: 'ajax-loader.gif'
      }));
      $('#baye').css({
        cursor: 'wait'
      });
      res = inputData.ipmBayesian;
      workspace.bayesianIPM = res;
      return openCPU.callScript('plot(res$meshpoints, res$LE[1,], xlab="Stage", ylab="Life expectancy",\n    type="l", ylim=range(res$LE, na.rm=TRUE))\nfor (j in 1:nrow(res$LE)) points(res$meshpoints, res$LE[j,], col=j, type="l")', {
        res: res
      }).then(filterFirstGraph).then(function(graph) {
        $('#baye').html($('<img>').attr({
          src: openCPU.getPngUrl(graph)
        }));
        workspace.plot.bayesianLifeExpectancy = graph;
        return openCPU.callScript('plot(res$meshpoints, res$pTime[1,], xlab="Stage", ylab="Passage time",\n    type="l", ylim=range(res$pTime, na.rm=TRUE))\nfor (j in 1:nrow(res$pTime)) points(res$meshpoints, res$pTime[j,], col=j, type="l")', {
          res: res
        });
      }).then(filterFirstGraph).then(function(graph) {
        $('#baye').append($('<img>').attr({
          src: openCPU.getPngUrl(graph)
        }));
        workspace.plot.bayesianPassageTime = graph;
        return openCPU.callScript('plot(res$meshpoints, Re(res$stableStage[1,]), xlab="Stage", \n    ylab="Stable distribution", type="l", ylim=range(Re(res$stableStage), na.rm=TRUE))\nfor (j in 1:nrow(res$stableStage))\n    points(res$meshpoints, Re(res$stableStage[j,]), col=j, type="l")', {
          res: res
        });
      }).then(filterFirstGraph).then(function(graph) {
        $('#baye').append($('<img>').attr({
          src: openCPU.getPngUrl(graph)
        }));
        workspace.plot.bayesianStableDistribution = graph;
        return openCPU.callScript('ci <- quantile(res$lambda, c(0.025, 0.975), na.rm=TRUE)\nhist(res$lambda, xlab=expression(lambda), main="Histogram of lambda", col="darkorange2")\nabline(v=ci, lty=3)', {
          res: res
        });
      }).then(filterFirstGraph).done(function(graph) {
        $('#baye').append($('<img>').attr({
          src: openCPU.getPngUrl(graph)
        }));
        return workspace.plot.bayesianLambda = graph;
      }).always(function() {
        $('#baye').css({
          cursor: 'auto'
        });
        $('#message').empty();
        return $('#continue').button('enable');
      }).fail(function(x, y, z) {
        var div;
        div = $('<div>');
        this.openCPU.showErrorIn(div)(x, y, z);
        return $('#baye').append(div);
      });
    };
    return Interaction;
  })();
  dataRepository = new PmrpcDataRepository("publish");
  interaction = new Interaction(dataRepository);
  $(document).ready(interaction.display());
}).call(this);
