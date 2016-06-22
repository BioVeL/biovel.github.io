(function() {
  var MatrixView;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  MatrixView = (function() {
    function MatrixView(parent, matrix, meshPoints, title, openCPU) {
      this.parent = parent;
      this.matrix = matrix;
      this.meshPoints = meshPoints;
      this.title = title;
      this.openCPU = openCPU;
      this.updateWireframe = __bind(this.updateWireframe, this);
      this.updateContour = __bind(this.updateContour, this);
      this.display = __bind(this.display, this);
      this.matrixCache = {};
    }
    MatrixView.prototype.display = function() {
      var bottom, clear, control, left, right;
      left = $('<div>').attr({
        style: 'float:left'
      });
      right = $('<div>').attr({
        style: 'float:left'
      });
      clear = $('<div>').attr({
        style: 'clear:both'
      });
      bottom = $('<div>');
      this.wireframe = $('<div>').appendTo(left).html($('<img>').attr({
        src: 'ajax-loader.gif'
      }));
      control = $('<div>').appendTo(right);
      this.contour = this.openCPU.image().appendTo(right);
      control.append($('<br>'), $('<label>').text('Colors'));
      this.colorSelect = $('<select>').appendTo(control).append($('<option>').attr({
        value: 'rainbow'
      }).text('rainbow'), $('<option>').attr({
        value: 'heat.colors'
      }).text('heat'), $('<option>').attr({
        value: 'terrain.colors'
      }).text('terrain'), $('<option>').attr({
        value: 'topo.colors',
        selected: 'true'
      }).text('topo'), $('<option>').attr({
        value: 'cm.colors'
      }).text('cm'));
      control.append($('<br>'));
      this.update = $('<button>').attr({
        type: 'button',
        disabled: false
      }).text('Update').appendTo(control);
      this.update.button();
      this.update.click(this.updateContour);
      this.parent.empty().append(left, right, clear, bottom);
      return this.openCPU.getObjectAsText(this.matrix).then(__bind(function(result) {
        bottom.html($('<pre>').text(result));
        return this.updateWireframe();
      }, this)).then(__bind(function(wireframePlot) {
        return this.updateContour().then(function(contourPlot) {
          return {
            wireframePlot: wireframePlot,
            contourPlot: contourPlot
          };
        });
      }, this));
    };
    MatrixView.prototype.updateContour = function() {
      var task;
      this.update.button('disable');
      task = this.openCPU.callScript("library(graphics)\nlibrary(grDevices)\nM = t(matrix)\nq <- length(meshpts)\nfilled.contour(meshpts, meshpts, M[1:q,1:q],\n               zlim=c(max(matrix),0), xlab=\"size at time t\",\n               ylab=\"size at time t+1\", color=colorRange,\n               nlevels=100, cex.lab=0.8)\ntitle(plotTitle)", {
        matrix: this.matrix,
        meshpts: this.meshPoints,
        colorRange: this.colorSelect.val(),
        plotTitle: this.openCPU.quote(this.title)
      }).then(function(result) {
        return result.graphs[0];
      });
      this.contour.updateSource(task).always(__bind(function() {
        return this.update.button('enable');
      }, this));
      return task;
    };
    MatrixView.prototype.updateWireframe = function() {
      return this.openCPU.callScript("library(lattice)\nprint(wireframe(matrix, xlab=xlab, ylab=ylab, zlab=zlab,\n      scales=scales, screen=screen, shade=shade, drape=drape,\n      colorkey=colorkey))", {
        matrix: this.matrix,
        xlab: 'list("Size at t+1", rot=90)',
        ylab: this.openCPU.quote('Size at t'),
        zlab: this.openCPU.quote("                 " + this.title),
        scales: 'list(col="royalblue2")',
        screen: 'list(z=-90, x=0)',
        shade: 'FALSE',
        drape: 'TRUE',
        colorkey: 'TRUE'
      }).then(function(result) {
        return result.graphs[0];
      }).done(__bind(function(graph) {
        return this.wireframe.html($('<img>').attr({
          src: this.openCPU.getPngUrl(graph)
        }));
      }, this)).fail(this.openCPU.showErrorIn(this.wireframe));
    };
    return MatrixView;
  })();
  this.MatrixView = MatrixView;
}).call(this);
