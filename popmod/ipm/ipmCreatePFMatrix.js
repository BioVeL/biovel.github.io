(function() {
  var Interaction, dataRepository, displayWait, interaction, showErrorIn;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  showErrorIn = function(parent) {
    return function(jqXHR, textStatus, errorThrown) {
      var message;
      parent.empty();
      message = errorThrown != null ? errorThrown : textStatus;
      if (jqXHR.responseText != null) {
        message = message + ': ' + jqXHR.responseText;
      }
      return parent.append($('<p>').css({
        color: '#cc0000'
      }).text(message));
    };
  };
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
      this.createFmatrix = __bind(this.createFmatrix, this);
      this.createPmatrix = __bind(this.createPmatrix, this);
      this.getInputDataOK = __bind(this.getInputDataOK, this);
      this.display = __bind(this.display, this);
      this.params = {};
    }
    Interaction.prototype.display = function() {
      $('button').button();
      $('#tabs').tabs();
      return this.dataRepository.getInputData().fail(function(message) {
        return $('#message').html($('<p>').text(message));
      }).done(this.getInputDataOK);
    };
    Interaction.prototype.getInputDataOK = function(inputData) {
      var fMatrixContour, openCPU, pMatrixContour, workspace;
      workspace = $.parseJSON(inputData.workspace);
      openCPU = new OpenCPU(workspace.openCPU);
      $('#minSize').attr({
        value: inputData.initialMinSize
      });
      $('#maxSize').attr({
        value: inputData.initialMaxSize
      });
      $('#matrixDim').attr({
        value: inputData.initialMaxSize - inputData.initialMinSize + 1
      });
      pMatrixContour = openCPU.image().appendTo($('#pmatrix .contour'));
      fMatrixContour = openCPU.image().appendTo($('#fmatrix .contour'));
      $('#createButton').click(__bind(function() {
        var fm, pm;
        $('#createButton').button('disable');
        $('#nextButton').button('disable');
        $('#pmatrixUpdateButton').button('disable');
        $('#fmatrixUpdateButton').button('disable');
        $('body').css({
          cursor: 'wait'
        });
        this.params = {
          matrixDim: $('#matrixDim').val(),
          chosenMinSize: $('#minSize').val(),
          chosenMaxSize: $('#maxSize').val(),
          integrateType: $('#integrateType').val(),
          correction: $('#correction').val(),
          preCensus: $('#preCensus').prop('checked')
        };
        pm = this.createPmatrix(openCPU, workspace, this.params, pMatrixContour);
        fm = this.createFmatrix(openCPU, workspace, this.params, fMatrixContour);
        return pm.always(function() {
          return fm.always(function() {
            $('body').css({
              cursor: 'auto'
            });
            $('#createButton').button('enable');
            if (workspace.Pmatrix && workspace.Fmatrix) {
              return $('#nextButton').button('enable');
            }
          });
        });
      }, this));
      $('#createButton').button('enable');
      $('#nextButton').click(__bind(function() {
        $('#nextButton').button('disable');
        return this.dataRepository.putOutputData({
          workspace: JSON.stringify(workspace),
          params: JSON.stringify(this.params)
        }).done(displayWait).fail(function(message) {
          $('#message').html($('<p>').text(message));
          return $('#nextButton').button('enable');
        });
      }, this));
      $('#pmatrixUpdateButton').click(__bind(function() {
        $('#pmatrixUpdateButton').button('disable');
        return this.updateContour(openCPU, pMatrixContour, workspace.Pmatrix, this.params.chosenMaxSize, 'Kernel Pmatrix', $('#pmatrixColours').val()).always(function() {
          return $('#pmatrixUpdateButton').button('enable');
        });
      }, this));
      return $('#fmatrixUpdateButton').click(__bind(function() {
        $('#fmatrixUpdateButton').button('disable');
        return this.updateContour(openCPU, fMatrixContour, workspace.Fmatrix, this.params.chosenMaxSize, 'Kernel Fmatrix', $('#fmatrixColours').val()).always(function() {
          return $('#fmatrixUpdateButton').button('enable');
        });
      }, this));
    };
    Interaction.prototype.createPmatrix = function(openCPU, workspace, params, pMatrixContour) {
      $('#pload').html($('<img>').attr({
        src: 'ajax-loader.gif'
      }));
      return openCPU.callFunction('IPMpack', 'createIPMPmatrix', {
        nEnvClass: 1,
        nBigMatrix: this.params.matrixDim,
        minSize: this.params.chosenMinSize,
        maxSize: this.params.chosenMaxSize,
        chosenCov: 'data.frame(NA)',
        survObj: workspace.survivalObject,
        growObj: workspace.growthObject,
        integrateType: openCPU.quote(this.params.integrateType),
        correction: openCPU.quote(this.params.correction)
      }).then(__bind(function(result) {
        workspace.Pmatrix = result.object;
        openCPU.getObjectAsText(workspace.Pmatrix).done(function(result) {
          return $('#pmatrix .text').html($('<pre>').text(result));
        }).fail(openCPU.showErrorIn($('#pmatrix .text')));
        return openCPU.callScript("library(lattice)\nprint(wireframe(Pmatrix, xlab=list('Size at t+1', rot=90),\n    ylab='Size at t', zlab='Pmatrix',\n    scales=list(col='royalblue2'),\n    screen=list(z=30, x=-60), shade=FALSE, drape=TRUE,\n    colorkey=TRUE))", {
          Pmatrix: workspace.Pmatrix
        });
      }, this)).done(function(result) {
        workspace.plot.PmatrixWireframePlot = result.graphs[0];
        return $('#pmatrix .wireframe').html($('<img>').attr({
          src: openCPU.getPngUrl(result.graphs[0])
        }));
      }).then(__bind(function() {
        return this.updateContour(openCPU, pMatrixContour, workspace.Pmatrix, this.params.chosenMaxSize, 'Kernel Pmatrix', $('#pmatrixColours').val());
      }, this)).done(__bind(function(result) {
        workspace.PmatrixMeshpoints = result.object;
        workspace.plot.PmatrixContourPlot = result.graphs[0];
        return $('#pmatrixUpdateButton').button('enable');
      }, this)).then(function() {
        return openCPU.callFunction('IPMpack', 'diagnosticsPmatrix', {
          Pmatrix: workspace.Pmatrix,
          growObj: workspace.growthObject,
          survObj: workspace.survivalObject,
          dff: workspace.data,
          integrateType: openCPU.quote(params.integrateType),
          correction: openCPU.quote(params.correction)
        });
      }).done(function(result) {
        var graph, _i, _len, _ref, _results;
        workspace.plot.PmatrixDiagnostics = result.graphs;
        $('#pmatrix .diagnostics').empty();
        _ref = result.graphs;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          graph = _ref[_i];
          _results.push($('#pmatrix .diagnostics').append($('<img>').attr({
            src: openCPU.getPngUrl(graph)
          })));
        }
        return _results;
      }).fail(showErrorIn($('#pmatrix .diagnostics'))).always(function() {
        return $('#pload').empty();
      });
    };
    Interaction.prototype.createFmatrix = function(openCPU, workspace, params, fMatrixContour) {
      $('#fload').html($('<img>').attr({
        src: 'ajax-loader.gif'
      }));
      return openCPU.callFunction('IPMpack', 'createIPMFmatrix', {
        nEnvClass: 1,
        nBigMatrix: this.params.matrixDim,
        minSize: this.params.chosenMinSize,
        maxSize: this.params.chosenMaxSize,
        chosenCov: 'data.frame(NA)',
        survObj: workspace.survivalObject,
        growObj: workspace.growthObject,
        fecObj: workspace.fecundityObject,
        integrateType: openCPU.quote(this.params.integrateType),
        correction: openCPU.quote(this.params.correction),
        preCensus: this.params.preCensus ? 'TRUE' : 'FALSE'
      }).then(__bind(function(result) {
        workspace.Fmatrix = result.object;
        openCPU.getObjectAsText(workspace.Fmatrix).done(function(result) {
          return $('#fmatrix .text').html($('<pre>').text(result));
        }).fail(openCPU.showErrorIn($('#pmatrix .text')));
        return openCPU.callScript("library(lattice)\nprint(wireframe(Fmatrix, xlab=list('Size at t+1', rot=90),\n    ylab='Size at t', zlab='Fmatrix',\n    scales=list(col='royalblue2'),\n    screen=list(z=-90, x=0), shade=FALSE, drape=TRUE,\n    colorkey=TRUE))", {
          Fmatrix: workspace.Fmatrix
        });
      }, this)).done(function(result) {
        workspace.plot.FmatrixWireframePlot = result.graphs[0];
        return $('#fmatrix .wireframe').html($('<img>').attr({
          src: openCPU.getPngUrl(result.graphs[0])
        }));
      }).fail(showErrorIn($('#fmatrix .wireframe'))).then(__bind(function() {
        return this.updateContour(openCPU, fMatrixContour, workspace.Fmatrix, this.params.chosenMaxSize, 'Kernel Fmatrix', $('#fmatrixColours').val());
      }, this)).done(__bind(function(result) {
        return workspace.plot.FmatrixContourPlot = result.graphs[0];
      }, this)).always(function() {
        $('#fmatrixUpdateButton').button('enable');
        return $('#fload').empty();
      });
    };
    Interaction.prototype.updateContour = function(openCPU, image, matrix, maxSize, title, color) {
      var task;
      task = openCPU.callScript("M <- t(matrix)\nmeshpts <- matrix@meshpoints\nq <- sum(meshpts <= maxSize)\nmeshpoints <- meshpts[1:q]\nfilled.contour(meshpoints, meshpoints, M[1:q,1:q], zlim=c(max(matrix),0),\n  xlab=\"size at time t\", ylab=\"size at time t+1\",\n  color=color, nlevels=100, cex.lab=0.8);\ntitle(plotTitle)\nmeshpoints", {
        matrix: matrix,
        maxSize: maxSize,
        plotTitle: openCPU.quote(title),
        color: color
      });
      image.updateSource(task.then(function(result) {
        return result.graphs[0];
      }));
      return task;
    };
    return Interaction;
  })();
  dataRepository = new PmrpcDataRepository('publish');
  interaction = new Interaction(dataRepository);
  $(document).ready(function() {
    $('#tabs').tabs();
    return interaction.display();
  });
}).call(this);
