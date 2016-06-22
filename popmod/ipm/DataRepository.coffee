class TestDataRepository

    constructor: (@testData) ->

    getInputData: =>
        new Deferred().resolve(@testData)

    putOutputData: (data) ->
        alert data
        new Deferred().resolve({})

class PmrpcDataRepository

    constructor: (@destination) ->

    # get problems with hangs if we call getInputData too soon. 
    # Waiting 0.5s seems to fix it.
    getInputData: =>
        d = new $.Deferred()
        setTimeout((=>
            pmrpc.call(
                destination: @destination
                publicProcedureName: "getInputData"
                params: []
                onSuccess: (callResult) -> d.resolve(callResult.returnValue)
                onFailure: (callResult) -> d.reject(callResult.message)
            )), 500)
        d

    putOutputData: (data) =>
        d = new $.Deferred()
        pmrpc.call(
            destination : @destination
            publicProcedureName : "reply"
            params : ["OK", data]
            onSuccess: (callResult) -> d.resolve(callResult.returnValue)
            onFailure: (callResult) -> d.reject(callResult.message)
        )
        d

this.TestDataRepository = TestDataRepository
this.PmrpcDataRepository = PmrpcDataRepository
