(function() {
  var FecundityTab, GrowthTab, Interaction, SubmitTab, SurvivalTab, dataRepository, displayWait, interaction;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
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
  SurvivalTab = (function() {
    var explanatoryVariables;
    explanatoryVariables = ['1', 'size', 'size+size2', 'size+size2+size3'];
    function SurvivalTab(submitTab) {
      this.submitTab = submitTab;
      this.survivalCompare = __bind(this.survivalCompare, this);
      this.start = __bind(this.start, this);
      $('#survivalControlSubmit').button();
      $('#survivalControlCompare').button();
    }
    SurvivalTab.prototype.start = function(openCPU, workspace, params, palette) {
      this.openCPU = openCPU;
      this.workspace = workspace;
      this.params = params;
      this.palette = palette;
      $('#survivalInitialPlot').html(this.openCPU.image({
        height: 400,
        width: 400
      }).setSource(workspace.plot.survivalInitialPlot));
      $('#survivalControlCompare').click(this.survivalCompare);
      $('#survivalControlCompare').button('enable');
      return this.comparisonImage = this.openCPU.image().appendTo($('#survivalComparisonPlot'));
    };
    SurvivalTab.prototype.survivalCompare = function() {
      var ev, expVars, task, testType;
      $('#survivalControlCompare').button('disable');
      $('#srvl').css({
        cursor: 'wait'
      });
      $('#srvlload').html($('<img>').attr({
        src: 'ajax-loader.gif'
      }));
      $('#survivalComparisonChoice').empty();
      expVars = "c(" + (((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = explanatoryVariables.length; _i < _len; _i++) {
          ev = explanatoryVariables[_i];
          _results.push('surv~' + ev);
        }
        return _results;
      })()).join()) + ")";
      this.params.testType = $('#survivalControlTestType').val();
      testType = this.openCPU.quote(this.params.testType);
      task = this.openCPU.callFunction('IPMpack', 'survModelComp', {
        dataf: this.workspace.data,
        expVars: expVars,
        testType: testType
      }).then(__bind(function(result) {
        this.survComparison = result.object;
        return this.openCPU.callScript('library(IPMpack)\nsummaryTable <- sc$summaryTable\nplotSurvModelComp(sc$survObjects, summaryTable, dataf,\n    expVars, testType=testType, plotLegend=FALSE)\nsprintf("%s: %s=%.1f", levels(summaryTable[,1]), testType, as.numeric(as.vector(summaryTable[,2])))', {
          sc: this.survComparison,
          dataf: this.workspace.data,
          expVars: expVars,
          testType: testType
        });
      }, this));
      this.comparisonImage.updateSource(task.then(function(result) {
        return result.graphs[0];
      }));
      return task.then(__bind(function(result) {
        var dataType, type;
        return this.openCPU.getObject(result.object, type = 'json', dataType = 'json');
      }, this)).always(__bind(function() {
        $('#survivalControlCompare').button('enable');
        $('#srvl').css({
          cursor: 'auto'
        });
        return $('#srvlload').empty();
      }, this)).fail(this.openCPU.showErrorIn($('#survivalComparisonChoice'))).done(__bind(function(result) {
        var form, i, legend, submit, survComparison, _len;
        submit = $('#survivalControlSubmit');
        form = $('<form>');
        for (i = 0, _len = result.length; i < _len; i++) {
          legend = result[i];
          $('<input>').attr({
            type: 'radio',
            name: 'surv',
            value: "" + i
          }).appendTo(form).click(function() {
            return submit.button('enable');
          });
          form.append($('<span>').css({
            color: this.palette[i + 1]
          }).html(' &mdash;&mdash; '));
          form.append($('<span>').css({
            fontSize: 'small'
          }).text(legend));
          form.append($('<br>'));
        }
        survComparison = this.survComparison;
        submit.click(__bind(function() {
          var val;
          submit.button('disable');
          val = parseInt($('input[name=surv]:radio:checked').val());
          task = this.openCPU.callScript('sc$survObjects[[i]]', {
            sc: survComparison,
            i: val + 1
          }).done(__bind(function(result) {
            this.workspace.survivalObject = result.object;
            return this.params.explanatoryVariables = explanatoryVariables[val];
          }, this));
          return this.submitTab.updateSurvival(task);
        }, this));
        return $('#survivalComparisonChoice').html(form);
      }, this));
    };
    return SurvivalTab;
  })();
  GrowthTab = (function() {
    var explanatoryVariables;
    explanatoryVariables = ['1', 'size', 'size+size2', 'size+size2+size3'];
    function GrowthTab(submitTab) {
      this.submitTab = submitTab;
      this.growthCompare = __bind(this.growthCompare, this);
      this.start = __bind(this.start, this);
      $('#growthControlSubmit').button();
      $('#growthControlCompare').button();
    }
    GrowthTab.prototype.start = function(openCPU, workspace, params, palette) {
      this.openCPU = openCPU;
      this.workspace = workspace;
      this.params = params;
      this.palette = palette;
      $('#growthInitialPlot').html(this.openCPU.image({
        width: 400,
        height: 400
      }).setSource(this.workspace.plot.growthInitialPlot));
      $('#growthControlCompare').click(this.growthCompare);
      $('#growthControlCompare').button('enable');
      return this.comparisonImage = this.openCPU.image().appendTo($('#growthComparisonPlot'));
    };
    GrowthTab.prototype.growthCompare = function() {
      var ev, expVars, task, testType;
      $('#growthControlCompare').button('disable');
      $('#grow').css({
        cursor: 'wait'
      });
      $('#growload').html($('<img>').attr({
        src: 'ajax-loader.gif'
      }));
      $('#growthComparisonChoice').empty();
      expVars = "c(" + (((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = explanatoryVariables.length; _i < _len; _i++) {
          ev = explanatoryVariables[_i];
          _results.push('sizeNext~' + ev);
        }
        return _results;
      })()).join()) + ")";
      this.params.testType = $('#growthControlTestType').val();
      testType = this.openCPU.quote(this.params.testType);
      task = this.openCPU.callFunction('IPMpack', 'growthModelComp', {
        dataf: this.workspace.data,
        expVars: expVars,
        regressionType: this.openCPU.quote('constantVar'),
        testType: testType
      }).then(__bind(function(result) {
        this.growComparison = result.object;
        return this.openCPU.callScript('library(IPMpack)\nsummaryTable <- gc$summaryTable\nplotGrowthModelComp(gc$growthObjects, summaryTable, dataf,\n    expVars, testType=testType, plotLegend=FALSE)\nsprintf("%s: %s=%.1f", levels(summaryTable[,1]), testType, as.numeric(as.vector(summaryTable[,3])))', {
          gc: this.growComparison,
          dataf: this.workspace.data,
          expVars: expVars,
          testType: testType
        });
      }, this));
      this.comparisonImage.updateSource(task.then(function(result) {
        return result.graphs[0];
      }));
      return task.then(__bind(function(result) {
        var dataType, type;
        return this.openCPU.getObject(result.object, type = 'json', dataType = 'json');
      }, this)).always(__bind(function() {
        $('#growthControlCompare').button('enable');
        $('#grow').css({
          cursor: 'auto'
        });
        return $('#growload').empty();
      }, this)).fail(this.openCPU.showErrorIn($('#growthComparisonChoice'))).done(__bind(function(result) {
        var form, growComparison, i, legend, submit, _len;
        submit = $('#growthControlSubmit');
        form = $('<form>');
        for (i = 0, _len = result.length; i < _len; i++) {
          legend = result[i];
          $('<input>').attr({
            type: 'radio',
            name: 'grow',
            value: "" + i
          }).appendTo(form).click(function() {
            return submit.button('enable');
          });
          form.append($('<span>').css({
            color: this.palette[i + 1]
          }).html(' &mdash;&mdash; '));
          form.append($('<span>').css({
            fontSize: 'small'
          }).text(legend));
          form.append($('<br>'));
        }
        growComparison = this.growComparison;
        submit.click(__bind(function() {
          var val;
          submit.button('disable');
          val = parseInt($('input[name=grow]:radio:checked').val());
          task = this.openCPU.callScript('gc$growthObjects[[i]]', {
            gc: growComparison,
            i: val + 1
          }).done(__bind(function(result) {
            this.workspace.growthObject = result.object;
            return this.params.explanatoryVariables = explanatoryVariables[val];
          }, this));
          return this.submitTab.updateGrowth(task);
        }, this));
        return $('#growthComparisonChoice').html(form);
      }, this));
    };
    return GrowthTab;
  })();
  FecundityTab = (function() {
    function FecundityTab(submitTab) {
      this.submitTab = submitTab;
      this.makeFecundityObjects = __bind(this.makeFecundityObjects, this);
      this.completeControls = __bind(this.completeControls, this);
      this.showInitialPlots = __bind(this.showInitialPlots, this);
      this.start = __bind(this.start, this);
      $('#fecundityControlPlot').button();
      $('#fecundityControlSubmit').button();
      this.path = [];
    }
    FecundityTab.prototype.start = function(openCPU, workspace, params, palette, fecundityFields, fecundityPlotsInitial, fecundityHistsInitial, fieldLabels, x, x0) {
      var fecundityPlot;
      this.openCPU = openCPU;
      this.workspace = workspace;
      this.palette = palette;
      this.fieldLabels = fieldLabels;
      this.completeControls(fecundityFields);
      this.showInitialPlots(fecundityFields, fecundityPlotsInitial, fecundityHistsInitial);
      fecundityPlot = this.openCPU.image().appendTo($('#fecundityPlot'));
      $('#fecundityControlPlot').click(__bind(function() {
        $('#fecundityControlPlot').button('disable');
        $('#fecundityControlSubmit').button('disable');
        return this.makeFecundityObjects(fecundityPlot, x, x0);
      }, this));
      return $('#fecundityControlSubmit').click(__bind(function() {
        var f;
        $('#fecundityControlSubmit').button('disable');
        params.fecundity = (function() {
          var _i, _len, _ref, _results;
          _ref = this.path;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            f = _ref[_i];
            _results.push({
              field: f.field,
              family: f.family,
              transform: f.transform,
              explanatoryVar: f.explanatoryVar
            });
          }
          return _results;
        }).call(this);
        this.workspace.fecundityObject = this.path[this.path.length - 1].fecundityObject;
        return this.submitTab.updateFecundity(this.path);
      }, this));
    };
    FecundityTab.prototype.showInitialPlots = function(fields, plots, hists) {
      var div, i, _ref, _results;
      _results = [];
      for (i = 0, _ref = fields.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        div = $('<div>').appendTo($('#fecundityInitial'));
        div.append($('<h2>').text(fields[i]));
        div.append($('<img>').attr({
          src: this.openCPU.getPngUrl(plots[i], {
            width: 400,
            height: 400
          })
        }));
        _results.push(div.append($('<img>').attr({
          src: this.openCPU.getPngUrl(hists[i], {
            width: 400,
            height: 400
          })
        })));
      }
      return _results;
    };
    FecundityTab.prototype.completeControls = function(fields) {
      var field, select, _i, _len;
      select = $('#fecundityControlField');
      select.empty();
      for (_i = 0, _len = fields.length; _i < _len; _i++) {
        field = fields[_i];
        select.append($('<option>').attr({
          value: field
        }).text(field));
      }
      select.attr({
        disabled: false
      });
      return $('#fecundityControlPlot').button('enable');
    };
    FecundityTab.prototype.makeFecundityObjects = function(fecundityPlot, x, x0) {
      var args, data, formula, frame, tasks, _i, _len, _ref;
      $('#fcnd').css({
        cursor: 'wait'
      });
      $('#fcndload').html($('<img>').attr({
        src: 'ajax-loader.gif'
      }));
      $('#fecundityChoice').empty();
      args = {
        dataf: this.workspace.data,
        fecConstants: 'data.frame(NA)',
        meanOffspringSize: 'NA',
        sdOffspringSize: 'NA',
        vitalRatesPerOffspringType: 'data.frame(NA)',
        Formula: 'c(',
        Family: 'c(',
        Transform: 'c('
      };
      _ref = this.path;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        frame = _ref[_i];
        args.Formula = args.Formula + frame.formula + ',';
        args.Family = args.Family + '"' + frame.family + '",';
        args.Transform = args.Transform + '"' + frame.transform + '",';
      }
      frame = {
        field: $('#fecundityControlField').val(),
        family: $('#fecundityControlFamily').val(),
        transform: $('#fecundityControlTransform').val(),
        formulae: ['1', 'size', 'size+size2']
      };
      args.Formula = args.Formula + frame.field;
      args.Family = args.Family + '"' + frame.family + '")';
      args.Transform = args.Transform + '"' + frame.transform + '")';
      tasks = (function() {
        var _j, _len2, _ref2, _results;
        _ref2 = frame.formulae;
        _results = [];
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          formula = _ref2[_j];
          data = $.extend({}, args);
          data.Formula = data.Formula + '~' + formula + ')';
          _results.push(this.openCPU.callFunction('IPMpack', 'makeFecObj', data));
        }
        return _results;
      }).call(this);
      fecundityPlot.setBusy();
      return $.when.apply($, tasks).fail(this.openCPU.showErrorIn($('#fecundityChoice'))).fail(function() {
        $('#fcnd').css({
          cursor: 'auto'
        });
        $('#fcndload').empty();
        $('#fecundityControlPlot').button('enable');
        return fecundityPlot.setIdle();
      }).done(__bind(function() {
        var aic, doneArgs, fo, formula, i, legend, n, responses, script, task, varName, _len2, _ref2;
        responses = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        this.fecundityObjects = (function() {
          var _j, _len2, _results;
          _results = [];
          for (_j = 0, _len2 = responses.length; _j < _len2; _j++) {
            doneArgs = responses[_j];
            _results.push(doneArgs[0].object);
          }
          return _results;
        })();
        data = {
          Sp: this.workspace.data,
          field: this.openCPU.quote(frame.field),
          x: x,
          x0: x0
        };
        script = ['fs <- order(Sp$size, na.last=NA)\nfs.fec <- (Sp[,field])[fs]\nfs.size <- (Sp$size)[fs]\nlevels <- as.numeric(cut(fs.size, 50))\npfz <- tapply(fs.size, levels, mean, na.rm=TRUE)\nps <- tapply(fs.fec, levels, mean, na.rm=TRUE)\npfz <- pfz[!is.na(pfz)]\nps <- ps[!is.na(pfz)]\nplot(as.numeric(pfz), as.numeric(ps), pch = 19, cex=1, col=\'black\', xlab=\'size\', ylab=field)'];
        legend = (function() {
          var _j, _len2, _ref2, _results;
          _ref2 = frame.formulae;
          _results = [];
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            formula = _ref2[_j];
            _results.push('"' + frame.field + '~' + formula + '"');
          }
          return _results;
        })();
        n = this.path.length + 1;
        aic = [];
        _ref2 = this.fecundityObjects;
        for (i = 0, _len2 = _ref2.length; i < _len2; i++) {
          fo = _ref2[i];
          varName = 'fo' + i;
          data[varName] = fo;
          script.push("y0 <- predict(" + varName + "@fitFec[[" + n + "]], newdata=x0)\ny0 <- " + (frame.family === 'binomial' ? 'exp(y0)/(exp(y0)+1)' : 'exp(y0)+1') + "\nlines(x, y0, col=" + (i + 2) + ")");
          aic.push("AIC(" + varName + "@fitFec[[" + n + "]])");
        }
        script.push("sprintf(\"%s: %s = %.1f\", c(" + (legend.join()) + "), \"AIC\", c(" + (aic.join()) + "))");
        task = this.openCPU.callScript(script.join('\n'), data);
        fecundityPlot.updateSource(task.then(function(result) {
          return result.graphs[0];
        }));
        return task.then(__bind(function(result) {
          return this.openCPU.getObjectAsJson(result.object);
        }, this)).always(function() {
          $('#fcnd').css({
            cursor: 'auto'
          });
          $('#fcndload').empty();
          return $('#fecundityControlPlot').button('enable');
        }).fail(this.openCPU.showErrorIn($('#fecundityChoice'))).done(__bind(function(legends) {
          var addButton, fecundityObjects, form, i, legend, _len3;
          form = $('<form>');
          addButton = $('<button>').attr({
            type: 'button'
          }).text('Add').button();
          addButton.button('disable');
          for (i = 0, _len3 = legends.length; i < _len3; i++) {
            legend = legends[i];
            $('<input>').attr({
              type: 'radio',
              name: 'fec',
              value: "" + i
            }).appendTo(form).click(function() {
              return addButton.button('enable');
            });
            form.append($('<span>').css({
              color: this.palette[i + 1]
            }).html(' &mdash;&mdash; '));
            form.append($('<span>').css({
              fontSize: 'small'
            }).text(legend));
            form.append($('<br>'));
          }
          fecundityObjects = this.fecundityObjects;
          addButton.appendTo(form).click(__bind(function() {
            var f, field, label, val, _j, _len4, _ref3;
            addButton.button('disable');
            val = parseInt($('input[name=fec]:radio:checked').val());
            field = frame.field;
            label = this.fieldLabels[field] != null ? "" + this.fieldLabels[field] + " (" + field + ")" : field;
            frame.explanatoryVar = frame.formulae[val];
            frame.formula = field + '~' + frame.explanatoryVar;
            frame.fecundityObject = fecundityObjects[val];
            this.path.push(frame);
            frame.task = this.openCPU.callScript("fs <- order(Sp$size, na.last=NA)\nfs.fec <- (Sp[,field])[fs]\nfs.size <- (Sp$size)[fs]\nlevels <- as.numeric(cut(fs.size, 50))\npfz <- tapply(fs.size, levels, mean, na.rm=TRUE)\nps <- tapply(fs.fec, levels, mean, na.rm=TRUE)\npfz <- pfz[!is.na(pfz)]\nps <- ps[!is.na(pfz)]\nplot(as.numeric(pfz), as.numeric(ps), pch = 19, cex=1, col='black', xlab='size', ylab=field)\ny0 <- predict(fo@fitFec[[i]], newdata=x0)\ny0 <- " + (frame.family === 'binomial' ? 'exp(y0)/(exp(y0)+1)' : 'exp(y0)+1') + "\nlines(x, y0, col=\"green\")", {
              Sp: this.workspace.data,
              fo: frame.fecundityObject,
              i: this.path.length,
              x: x,
              x0: x0,
              field: this.openCPU.quote(field),
              label: this.openCPU.quote(label)
            });
            $('#fecundityPath').empty();
            _ref3 = this.path;
            for (_j = 0, _len4 = _ref3.length; _j < _len4; _j++) {
              f = _ref3[_j];
              $('#fecundityPath').append($('<p>').css({
                fontSize: 'small'
              }).text("" + f.formula + " (family=" + f.family + ", transform=" + f.transform + ")"));
            }
            return $('#fecundityControlSubmit').button('enable');
          }, this));
          return $('#fecundityChoice').html(form);
        }, this));
      }, this));
    };
    return FecundityTab;
  })();
  SubmitTab = (function() {
    function SubmitTab(dataRepository) {
      this.dataRepository = dataRepository;
      this.updateFecundity = __bind(this.updateFecundity, this);
      this.updateGrowth = __bind(this.updateGrowth, this);
      this.updateSurvival = __bind(this.updateSurvival, this);
      this.checkReady = __bind(this.checkReady, this);
      this.start = __bind(this.start, this);
      $('#submitButton').button();
      $('#submitSurvivalMessage').html($('<p>').css({
        color: '#cc0000',
        cursor: 'pointer'
      }).text('Click here to create a Survival Object').click(function() {
        return $('#tabs').tabs('select', 1);
      }));
      $('#submitGrowthMessage').html($('<p>').css({
        color: '#cc0000',
        cursor: 'pointer'
      }).text('Click here to create a Growth Object').click(function() {
        return $('#tabs').tabs('select', 2);
      }));
      $('#submitFecundityMessage').html($('<p>').css({
        color: '#cc0000',
        cursor: 'pointer'
      }).text('Click here to create a Fecundity Object').click(function() {
        return $('#tabs').tabs('select', 3);
      }));
    }
    SubmitTab.prototype.start = function(openCPU, workspace, params) {
      this.openCPU = openCPU;
      this.workspace = workspace;
      this.params = params;
      this.checkReady();
      return $('#submitButton').click(__bind(function() {
        $('#submitMessage').empty();
        $('#submitButton').button('disable');
        return this.dataRepository.putOutputData({
          workspace: JSON.stringify(this.workspace),
          params: JSON.stringify(this.params)
        }).done(displayWait).fail(function(message) {
          $('#submitMessage').html($('<p>').text(message));
          return $('#submitButton').button('enable');
        });
      }, this));
    };
    SubmitTab.prototype.checkReady = function() {
      if ((this.workspace.survivalObject != null) && (this.workspace.growthObject != null) && (this.workspace.fecundityObject != null)) {
        $('#submitMessage').html($('<p>').text('Ready to submit'));
        return $('#submitButton').button('enable');
      } else {
        $('#submitMessage').html($('<p>').text('Not ready to submit:'));
        return $('#submitButton').button('disable');
      }
    };
    SubmitTab.prototype.updateSurvival = function(task) {
      $('#submitSurvivalMessage').html($('<p>').css({
        color: '#999999'
      }).text('Creating Survival Objects...'));
      $('#submitSurvivalMessage p').append($('<img>').attr({
        src: 'ajax-loader.gif'
      }));
      $('#tabs').tabs('select', 4);
      return task.then(__bind(function() {
        $('#submitSurvival .plot').empty();
        $('#submitSurvival .text').html($('<img>').attr({
          src: 'ajax-loader.gif'
        }));
        return this.openCPU.callScript('library(IPMpack)\npicSurv(data, survivalObject, ncuts=100)', {
          data: this.workspace.data,
          survivalObject: this.workspace.survivalObject
        });
      }, this)).then(__bind(function(result) {
        var fitPlot;
        fitPlot = result.graphs[0];
        this.workspace.plot.survivalObjectFitPlot = fitPlot;
        $('#submitSurvival .plot').html($('<img>').attr({
          src: this.openCPU.getPngUrl(fitPlot)
        }));
        return this.openCPU.getObjectAsText(this.workspace.survivalObject);
      }, this)).done(function(result) {
        $('#submitSurvival .text').html($('<pre>').text(result));
        return $('#submitSurvivalMessage').empty();
      }).fail(this.openCPU.showErrorIn($('#submitSurvival .text'))).fail(__bind(function() {
        if (this.workspace.survivalObject != null) {
          return $('#submitSurvivalMessage').empty();
        } else {
          return $('#submitSurvivalMessage').html($('<p>').css({
            color: '#cc0000',
            cursor: 'pointer'
          }).text('Click here to create a Survival Object').click(function() {
            return $('#tabs').tabs('select', 1);
          }));
        }
      }, this)).always(this.checkReady);
    };
    SubmitTab.prototype.updateGrowth = function(task) {
      $('#submitGrowthMessage').html($('<p>').css({
        color: '#999999'
      }).text('Creating Growth Objects...'));
      $('#submitGrowthMessage p').append($('<img>').attr({
        src: 'ajax-loader.gif'
      }));
      $('#tabs').tabs('select', 4);
      return task.then(__bind(function() {
        $('#submitGrowth .plot').empty();
        $('#submitGrowth .text').html($('<img>').attr({
          src: 'ajax-loader.gif'
        }));
        return this.openCPU.callScript('library(IPMpack)\npicGrow(data, growthObject)', {
          data: this.workspace.data,
          growthObject: this.workspace.growthObject
        });
      }, this)).then(__bind(function(result) {
        var fitPlot;
        fitPlot = result.graphs[0];
        this.workspace.plot.growthObjectFitPlot = fitPlot;
        $('#submitGrowth .plot').html($('<img>').attr({
          src: this.openCPU.getPngUrl(fitPlot)
        }));
        return this.openCPU.getObjectAsText(this.workspace.growthObject);
      }, this)).done(function(result) {
        $('#submitGrowth .text').html($('<pre>').text(result));
        return $('#submitGrowthMessage').empty();
      }).fail(this.openCPU.showErrorIn($('#submitGrowth .text'))).fail(__bind(function() {
        if (this.workspace.growthObject != null) {
          return $('#submitGrowthMessage').empty();
        } else {
          return $('#submitGrowthMessage').html($('<p>').css({
            color: '#cc0000',
            cursor: 'pointer'
          }).text('Click here to create a Growth Object').click(function() {
            return $('#tabs').tabs('select', 2);
          }));
        }
      }, this)).always(this.checkReady);
    };
    SubmitTab.prototype.updateFecundity = function(fecundityPath) {
      var content, formulae, frame, handleFrameTask, i, tasks;
      $('#submitFecundityMessage').html($('<p>').css({
        color: '#999999'
      }).text('Creating Fecundity Objects...'));
      $('#submitFecundityMessage p').append($('<img>').attr({
        src: 'ajax-loader.gif'
      }));
      $('#submitFecundity .content').empty();
      $('#tabs').tabs('select', 4);
      formulae = [];
      tasks = [];
      this.workspace.plot.fecundityObjectFitPlots = [];
      content = $('#submitFecundity .content');
      handleFrameTask = __bind(function(frame, i) {
        var div;
        div = $('<div>').appendTo(content);
        div.html($('<img>').attr({
          src: 'ajax-loader.gif'
        }));
        return frame.task.then(__bind(function(result) {
          var plot;
          plot = result.graphs[0];
          this.workspace.plot.fecundityObjectFitPlots[i] = plot;
          div.html($('<img>').attr({
            src: this.openCPU.getPngUrl(plot)
          }));
          return this.openCPU.getObjectAsText(frame.fecundityObject);
        }, this)).done(__bind(function(text) {
          return div.append($('<pre>').text(text));
        }, this)).fail(this.openCPU.showErrorIn(div));
      }, this);
      tasks = (function() {
        var _len, _results;
        _results = [];
        for (i = 0, _len = fecundityPath.length; i < _len; i++) {
          frame = fecundityPath[i];
          formulae.push(frame.formula);
          content.append($('<h3>').text(formulae.join(', ')));
          _results.push(handleFrameTask(frame, i));
        }
        return _results;
      })();
      return $.when.apply($, tasks).always(function() {
        return $('#submitFecundityMessage').empty();
      }).always(this.checkReady);
    };
    return SubmitTab;
  })();
  Interaction = (function() {
    function Interaction(dataRepository) {
      this.dataRepository = dataRepository;
      this.display = __bind(this.display, this);
    }
    Interaction.prototype.display = function() {
      var fecundityTab, growthTab, params, submitTab, survivalTab;
      submitTab = new SubmitTab(this.dataRepository);
      survivalTab = new SurvivalTab(submitTab);
      growthTab = new GrowthTab(submitTab);
      fecundityTab = new FecundityTab(submitTab);
      $('#dataload').html($('<img>').attr({
        src: 'ajax-loader.gif'
      }));
      params = {
        survival: {},
        growth: {}
      };
      return this.dataRepository.getInputData().fail(function(message) {
        $('#data').html($('<p>').text('getInputData failed: #{message}'));
        return $('#dataload').empty();
      }).done(__bind(function(inputData) {
        var data, openCPU, workspace;
        workspace = $.parseJSON(inputData.workspace);
        openCPU = new OpenCPU(workspace.openCPU);
        data = workspace.data;
        openCPU.getObject(workspace.data).done(__bind(function(result) {
          return $('#data').html($('<pre>').text(result));
        }, this)).fail(openCPU.showErrorIn($('#data'))).always(function() {
          return $('#dataload').empty();
        });
        openCPU.callFunction('grDevices', 'rgb', {
          red: 't(col2rgb(palette()))',
          alpha: 255,
          maxColorValue: 255
        }, 'json').done(__bind(function(result) {
          var palette, rgba;
          palette = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = result.length; _i < _len; _i++) {
              rgba = result[_i];
              _results.push(rgba.substr(0, 7));
            }
            return _results;
          })();
          survivalTab.start(openCPU, workspace, params.survival, palette);
          growthTab.start(openCPU, workspace, params.growth, palette);
          return fecundityTab.start(openCPU, workspace, params, palette, inputData.fecundityFields, inputData.fecundityPlotsInitial, inputData.fecundityHistsInitial, inputData.fieldLabels, inputData.x, inputData.x0);
        }, this));
        return submitTab.start(openCPU, workspace, params);
      }, this));
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
