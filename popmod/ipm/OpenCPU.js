(function() {
  var OpenCPU, OpenCPULog;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  OpenCPULog = (function() {
    function OpenCPULog(openCPU, log) {
      this.name = __bind(this.name, this);
      this.command = __bind(this.command, this);
      this.library = __bind(this.library, this);      if (log != null) {
        if (log.opencpu !== openCPU.base) {
          throw "different openCPU instance in log (" + log.opencpu + " != " + openCPU.base;
        }
        this.log = log;
      } else {
        this.log = {
          opencpu: openCPU.base,
          libraries: {},
          commands: [],
          names: {},
          rname: {}
        };
      }
    }
    OpenCPULog.prototype.library = function(library) {
      return this.log.libraries[library] = true;
    };
    OpenCPULog.prototype.command = function(func, args, result) {
      return this.log.commands.push(arguments);
    };
    OpenCPULog.prototype.name = function(name, result) {
      var base, i;
      if (name in this.log.names) {
        base = name;
        i = 1;
        while (true) {
          name = "" + base + "." + i;
          if (!(name in this.log.names)) {
            break;
          }
          i = i + 1;
        }
      }
      this.log.names[name] = result.object;
      return this.log.rname[result.object] = name;
    };
    return OpenCPULog;
  })();
  OpenCPU = (function() {
    function OpenCPU(base, log) {
      this.base = base;
      this.log = log != null ? log : new OpenCPULog(this);
      this.getPngUrl = __bind(this.getPngUrl, this);
      this.getUrl = __bind(this.getUrl, this);
      this.callScript = __bind(this.callScript, this);
      this.getObjectAsJson = __bind(this.getObjectAsJson, this);
      this.getObjectAsText = __bind(this.getObjectAsText, this);
      this.getObject = __bind(this.getObject, this);
      this.callObject = __bind(this.callObject, this);
      this.callFunction = __bind(this.callFunction, this);
      this.image = __bind(this.image, this);
      this.getLog = __bind(this.getLog, this);
    }
    OpenCPU.prototype.getLog = function() {
      return this.log.log;
    };
    OpenCPU.prototype.image = function(options) {
      var icon, main, openCPU, span;
      openCPU = this;
      span = $('<div>').css({
        position: 'relative',
        height: "" + ((options != null ? options.height : void 0) != null ? options.height : 480) + "px"
      }, {
        width: "" + ((options != null ? options.width : void 0) != null ? options.width : 640) + "px"
      });
      main = $('<span>').appendTo(span);
      icon = $('<span>').appendTo(span).css({
        position: 'absolute',
        top: '50%',
        left: '50%'
      });
      $.extend(span, {
        setBusy: function() {
          main.css({
            opacity: '0.4',
            filter: 'alpha(opacity=40)'
          });
          return icon.html($('<img>').attr({
            src: 'ajax-loader.gif'
          }));
        },
        setIdle: function() {
          icon.empty();
          return main.css({
            opacity: '1',
            filter: 'alpha(opacity=100)'
          });
        },
        loadImage: function(handle) {
          var d, image;
          d = $.Deferred();
          image = new Image();
          image.onload = function() {
            return d.resolve(image);
          };
          image.onerror = function() {
            return d.reject(null, 'Invalid image: #{handle}');
          };
          image.src = openCPU.getPngUrl(handle, options);
          return d.promise().done(function(img) {
            return main.html(img);
          }).fail(openCPU.showErrorIn(main)).always(function() {
            return span.setIdle();
          });
        },
        setSource: function(handle) {
          span.setBusy();
          span.loadImage(handle);
          return span;
        },
        updateSource: function(task) {
          span.setBusy();
          return task.then(function(handle) {
            return span.loadImage(handle);
          });
        }
      });
      return span;
    };
    OpenCPU.prototype.showErrorIn = function(parent) {
      return function(jqXHR, textStatus, errorThrown) {
        var message;
        message = errorThrown != null ? errorThrown : textStatus;
        if (jqXHR.responseText != null) {
          message = message + ': ' + jqXHR.responseText;
        }
        return parent.html($('<p>').css({
          color: '#cc0000'
        }).text(message));
      };
    };
    OpenCPU.prototype.callFunction = function(package, func, args, type, dataType) {
      var config;
      if (args == null) {
        args = '';
      }
      if (type == null) {
        type = "save";
      }
      if (dataType == null) {
        dataType = "json";
      }
      config = {
        type: "POST",
        data: args,
        dataType: dataType
      };
      return $.ajax(this.base + "R/pub/" + package + "/" + func + "/" + type, config).done(__bind(function(result) {
        var value;
        this.log.library(package);
        value = type === 'save' ? result : void 0;
        return this.log.command(func, args, value);
      }, this));
    };
    OpenCPU.prototype.callObject = function(object, args, type, dataType) {
      var config;
      if (args == null) {
        args = '';
      }
      if (type == null) {
        type = "save";
      }
      if (dataType == null) {
        dataType = "json";
      }
      config = {
        type: "POST",
        data: args,
        dataType: dataType
      };
      return $.ajax(this.getUrl(object) + "/" + type, config).done(__bind(function(result) {
        var value;
        value = type === 'save' ? result : void 0;
        return this.log.command(object, args, value);
      }, this));
    };
    OpenCPU.prototype.getObject = function(object, type, dataType) {
      var config;
      if (type == null) {
        type = "print";
      }
      if (dataType == null) {
        dataType = "text";
      }
      config = {
        type: "GET",
        dataType: dataType
      };
      return $.ajax(this.getUrl(object) + "/" + type, config);
    };
    OpenCPU.prototype.getObjectAsText = function(object) {
      return this.getObject(object);
    };
    OpenCPU.prototype.getObjectAsJson = function(object) {
      return this.getObject(object, 'json', 'json');
    };
    OpenCPU.prototype.callScript = function(script, args, type, dataType) {
      var param, prefix, stored, suffix;
      if (args == null) {
        args = '';
      }
      if (type == null) {
        type = "save";
      }
      if (dataType == null) {
        dataType = "json";
      }
      if (!args) {
        args = {
          'dummy123': 1
        };
      }
      prefix = "function(" + ((function() {
        var _results;
        _results = [];
        for (param in args) {
          _results.push(param);
        }
        return _results;
      })()).join() + ") {\n";
      suffix = "\n}";
      stored = prefix + script + suffix;
      return this.callFunction("base", "identity", {
        x: stored
      }).then(__bind(function(result) {
        return this.callObject(result.object, args, type, dataType);
      }, this));
    };
    OpenCPU.prototype.getUrl = function(object) {
      return this.base + "R/tmp/" + object;
    };
    OpenCPU.prototype.getPngUrl = function(object, options) {
      var name, params, value;
      params = options != null ? '?' + ((function() {
        var _results;
        _results = [];
        for (name in options) {
          value = options[name];
          _results.push("!" + name + "=" + value);
        }
        return _results;
      })()).join('&') : '';
      return this.getUrl("" + object + "/png" + params);
    };
    OpenCPU.prototype.quote = function(s) {
      return '"' + s.replace(/"/g, '\\"') + '"';
    };
    return OpenCPU;
  })();
  this.OpenCPU = OpenCPU;
}).call(this);
