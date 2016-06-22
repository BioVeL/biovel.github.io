(function() {
  var PmrpcDataRepository, TestDataRepository;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  TestDataRepository = (function() {
    function TestDataRepository(testData) {
      this.testData = testData;
      this.getInputData = __bind(this.getInputData, this);
    }
    TestDataRepository.prototype.getInputData = function() {
      return new Deferred().resolve(this.testData);
    };
    TestDataRepository.prototype.putOutputData = function(data) {
      alert(data);
      return new Deferred().resolve({});
    };
    return TestDataRepository;
  })();
  PmrpcDataRepository = (function() {
    function PmrpcDataRepository(destination) {
      this.destination = destination;
      this.putOutputData = __bind(this.putOutputData, this);
      this.getInputData = __bind(this.getInputData, this);
    }
    PmrpcDataRepository.prototype.getInputData = function() {
      var d;
      d = new $.Deferred();
      setTimeout((__bind(function() {
        return pmrpc.call({
          destination: this.destination,
          publicProcedureName: "getInputData",
          params: [],
          onSuccess: function(callResult) {
            return d.resolve(callResult.returnValue);
          },
          onFailure: function(callResult) {
            return d.reject(callResult.message);
          }
        });
      }, this)), 500);
      return d;
    };
    PmrpcDataRepository.prototype.putOutputData = function(data) {
      var d;
      d = new $.Deferred();
      pmrpc.call({
        destination: this.destination,
        publicProcedureName: "reply",
        params: ["OK", data],
        onSuccess: function(callResult) {
          return d.resolve(callResult.returnValue);
        },
        onFailure: function(callResult) {
          return d.reject(callResult.message);
        }
      });
      return d;
    };
    return PmrpcDataRepository;
  })();
  this.TestDataRepository = TestDataRepository;
  this.PmrpcDataRepository = PmrpcDataRepository;
}).call(this);
