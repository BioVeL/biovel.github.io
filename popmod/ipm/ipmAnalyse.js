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
      this.getInputDataSuccess = __bind(this.getInputDataSuccess, this);
      this.display = __bind(this.display, this);
    }
    Interaction.prototype.display = function() {
      $('#tabs').tabs();
      $('button').button();
      return this.dataRepository.getInputData().fail(function(message) {
        return alert('getInputData failed: #{message}');
      }).done(this.getInputDataSuccess);
    };
    Interaction.prototype.getInputDataSuccess = function(inputData) {
      var Pmatrix, elas, ipmModel, mlet, openCPU, params, sels, sens, survPlot, workspace;
      params = {};
      workspace = $.parseJSON(inputData.workspace);
      openCPU = new OpenCPU(workspace.openCPU);
      ipmModel = workspace.IPM;
      $('#ipmlambda').html($('<p>').text("Lambda: " + inputData.lambda));
      Pmatrix = workspace.Pmatrix;
      $('#continue').click(__bind(function() {
        $('#continue').button('disable');
        return this.dataRepository.putOutputData({
          workspace: JSON.stringify(workspace),
          params: JSON.stringify(params)
        }).done(displayWait).fail(function(message) {
          $('#message').html($('<p>').text(message));
          return $('#continue').button('enable');
        });
      }, this));
      $('#message').empty();
      $('#ipmLoad').html($('<img>').attr({
        src: 'ajax-loader.gif'
      }));
      new MatrixView($('#ipmgraph'), ipmModel, workspace.PmatrixMeshpoints, "Kernel IPM", openCPU).display().then(function(result) {
        workspace.plot.ipmContourPlot = result.contourPlot;
        return workspace.plot.ipmWireframePlot = result.wireframePlot;
      }).always(function() {
        return $('#ipmLoad').empty();
      }).fail(openCPU.showErrorIn($('#ipmprint')));
      $('#sensLoad').html($('<img>').attr({
        src: 'ajax-loader.gif'
      }));
      sens = openCPU.callFunction('IPMpack', 'sens', {
        A: ipmModel
      }).fail(openCPU.showErrorIn($('#sens'))).then(__bind(function(result) {
        workspace.ipmSensistivity = result.object;
        return new MatrixView($('#sens'), result.object, workspace.PmatrixMeshpoints, "Kernel IPM Sensitivity", openCPU).display();
      }, this)).then(function(result) {
        workspace.plot.ipmSensitivityContourPlot = result.contourPlot;
        return workspace.plot.ipmSensitivityWireframePlot = result.wireframePlot;
      }).always(function() {
        return $('#sensLoad').empty();
      });
      $('#elasLoad').html($('<img>').attr({
        src: 'ajax-loader.gif'
      }));
      elas = openCPU.callFunction('IPMpack', 'elas', {
        A: ipmModel
      }).fail(openCPU.showErrorIn($('#elas'))).then(__bind(function(result) {
        workspace.ipmElasticity = result.object;
        return new MatrixView($('#elas'), result.object, workspace.PmatrixMeshpoints, "Kernel IPM Elasticity", openCPU).display();
      }, this)).then(function(result) {
        workspace.plot.ipmElasticityContourPlot = result.contourPlot;
        return workspace.plot.ipmElasticityWireframePlot = result.wireframePlot;
      }).always(function() {
        return $('#elasLoad').empty();
      });
      $('#selsLoad').html($('<img>').attr({
        src: 'ajax-loader.gif'
      }));
      sels = openCPU.callScript('par(mfrow=c(1,1), xpd=T, mar=c(8,4,4,4))\nbarplot(sens$elam, \n    main = expression("Parameter elasticity of population growth rate "* lambda), \n    las = 2, cex.names = 0.7, col = "yellowgreen", border = par("fg"))\nbarplot(sens$slam, \n    main = expression("Parameter sensitivity of population growth rate "* lambda), \n    las = 2, cex.names = 0.7, col = "turquoise2", border = par("fg"))\nbarplot(Ro$elam, main = expression("Parameter elasticity of Ro"), \n    las = 2, cex.names = 0.7, col = "darkolivegreen1", border = par("fg"))\nbarplot(Ro$slam, main = expression("Parameter sensitivity of Ro"), \n    las = 2, cex.names = 0.7, col = "steelblue1", border = par("fg"))\nbarplot(LE$elam, \n    main = expression("Parameter elasticity of Life expectancy"), \n    las = 2, cex.names = 0.7, col =  "lightskyblue", border = par("fg"))\nbarplot(LE$slam, \n    main = expression("Parameter sensitivity of Life expectancy"), \n    las = 2, cex.names = 0.7, col = "springgreen1", border = par("fg"))', {
        sens: workspace.LambdaSensitivity,
        Ro: workspace.R0sensitivity,
        LE: workspace.LifeExpectancySensitivity
      }).fail(openCPU.showErrorIn($('#sels'))).done(__bind(function(result) {
        $('#sels .lambda .elas').html($('<img>').attr({
          src: openCPU.getPngUrl(result.graphs[0])
        }));
        $('#sels .lambda .sens').html($('<img>').attr({
          src: openCPU.getPngUrl(result.graphs[1])
        }));
        $('#sels .Ro .elas').html($('<img>').attr({
          src: openCPU.getPngUrl(result.graphs[2])
        }));
        $('#sels .Ro .sens').html($('<img>').attr({
          src: openCPU.getPngUrl(result.graphs[3])
        }));
        $('#sels .lifeexpect .elas').html($('<img>').attr({
          src: openCPU.getPngUrl(result.graphs[4])
        }));
        return $('#sels .lifeexpect .sens').html($('<img>').attr({
          src: openCPU.getPngUrl(result.graphs[5])
        }));
      }, this)).always(function() {
        return $('#selsLoad').empty();
      });
      $('#survLoc').val(inputData.maxSize);
      $('#survMaxAge').val(inputData.maxAge);
      $('#survSubmit').button('enable');
      survPlot = openCPU.image().appendTo($('#survPlot'));
      $('#survSubmit').click(function() {
        var task;
        $('#survSubmit').button('disable');
        $('#survLoad').html($('<img>').attr({
          src: 'ajax-loader.gif'
        }));
        params.survivorship = {
          loc: $('#survLoc').val(),
          maxAge: $('#survMaxAge').val()
        };
        task = openCPU.callScript("library(IPMpack)\nsu <- survivorship(Pmatrix, loc=loc, maxAge=maxAge)\npar(mfrow=c(1,1), xpd=TRUE, mar=c(5,5,5,8))\nplot(su$surv.curv, type=\"l\", col=\"green\", ylab=\"survivorship\", \n    xlab=\"age\", ylim=c(0,1), main=\"Surviving across stages\")\npoints(su$mortality, type=\"l\", col=\"red\", lty=2)\nlegend(maxAge+0.5, 0.98, c(\"survivorship\", \"mortality\"), cex=0.7, lty=c(1,2),\n    col=c(\"green\", \"red\"))\nsu", {
          Pmatrix: Pmatrix,
          loc: params.survivorship.loc,
          maxAge: params.survivorship.maxAge
        }).then(function(result) {
          return workspace.plot.survivorshipPlot = result.graphs[0];
        });
        return survPlot.updateSource(task).always(function() {
          $('#survLoad').empty();
          return $('#survSubmit').button('enable');
        });
      });
      $('#mlet').empty().text('Loading Mean Life Expectancy & Passage Time...');
      $('#mletLoad').html($('<img>').attr({
        src: 'ajax-loader.gif'
      }));
      mlet = openCPU.callScript("library(IPMpack)\nmLE <- meanLifeExpect(Pmatrix)\nvLE <- varLifeExpect(Pmatrix)\nplot(mLE, ylab = \"Mean life expectancy\", xlab = \"Size\", type = \"l\", col=\"cornflowerblue\",\n    ylim = c(0, max(mLE)))\ntargetSize <- 100\npTime <- passageTime(targetSize, Pmatrix)\nplot(Pmatrix@meshpoints, pTime, ylab = \"Passage time\", xlab = \"Size stage\", type = \"l\",\n    col = \"darkviolet\", ylim = c(0, max(pTime)), xlim=c(Pmatrix@meshpoints[1], targetSize+1))\nabline(v=targetSize, col=\"red\")", {
        Pmatrix: Pmatrix
      }).always(function() {
        return $('#mletLoad').empty();
      }).fail(openCPU.showErrorIn($('#mlet'))).done(function(result) {
        workspace.plot.meanLifeExpectancyPlot = result.graphs[0];
        workspace.plot.passageTimePlot = result.graphs[1];
        $('#mlet').html($('<img>').attr({
          src: openCPU.getPngUrl(result.graphs[0])
        }));
        return $('#mlet').append($('<img>').attr({
          src: openCPU.getPngUrl(result.graphs[1])
        }));
      });
      return sens.always(function() {
        return elas.always(function() {
          return sels.always(function() {
            return mlet.always(function() {
              return $('#continue').button('enable');
            });
          });
        });
      });
    };
    return Interaction;
  })();
  dataRepository = new PmrpcDataRepository("publish");
  interaction = new Interaction(dataRepository);
  $(document).ready(interaction.display());
}).call(this);
