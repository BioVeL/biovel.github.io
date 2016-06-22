

TARGETS=DataRepository.js OpenCPU.js MatrixView.js \
	ipmIdentifyFields.js ipmSelectSGF.js ipmCreatePFMatrix.js \
	ipmAnalyse.js ipmBayesian.js

COFFEE_DEPENDS=

.SUFFIXES: .coffee .js

default : $(TARGETS)

.coffee.js :
	coffee --join $@ --compile ${COFFEE_DEPENDS} $<
