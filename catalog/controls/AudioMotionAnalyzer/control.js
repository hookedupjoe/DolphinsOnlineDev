(function (ActionAppCore, $) {

	var ControlSpecs = { 
		options: {
			padding: true
		},
		content: [
		{
			ctl: "spot",
			name: "AudioMotionAnalyzerBody",
			text: '<div id="containermic"></div>'
		}
		]
	}

	var ControlCode = {};

  var currStream = false,
     audioMotion = false;
     
  

  ControlCode.startWithMic = startWithMic;
  function startWithMic() {
    this.initSetup();
    this.micOn();
  }
  ControlCode.initSetup = initSetup;
  function initSetup() {

    // instantiate analyzer
    audioMotion = new AudioMotionAnalyzer(
      document.getElementById('containermic'),
      {
        gradient: 'rainbow',
        height: window.innerHeight - 40,
        showScaleY: true,
        useCanvas: true,
        onCanvasDraw: function(instance){
          ThisApp.common.eqDataMic = {
            bands: instance.getBars(),
            peak: instance.getEnergy('peak'),
            bass: instance.getEnergy('bass'),
            lowMid: instance.getEnergy('lowMid'),
            mid: instance.getEnergy('mid'),
            highMid: instance.getEnergy('highMid'),
            treble: instance.getEnergy('treble')
          }
        }
      }
    );
    window.audioMotionInUse = audioMotion;

    audioMotion.mode = 6;

  }


ControlCode.micOn = micOn;
  function micOn() {
    console.log( 'micOn ctl');

    if ( navigator.mediaDevices ) {
    navigator.mediaDevices.getUserMedia( {
      audio: true, video: false
    }).then(function(stream){
        const micStream = audioMotion.audioCtx.createMediaStreamSource(stream);
        audioMotion.connectInput(micStream);
        audioMotion.volume = 0;
      })
      .catch(function(err){
        console.error('Error accessing mic',err);
      });

    } else {
      console.error('Mic not supported');      
    }
  }

  ControlCode.micOff = micOff;
  function micOff() {
    if( audioMotion ){
      audioMotion.disconnectInput(false, true);
    }
  }



     



























    ControlCode.setup = setup;
    function setup(){
        console.log("Ran setup")
    }

    ControlCode._onInit = _onInit;
    function _onInit(){
        //initSetup();
    }

	var ThisControl = {specs: ControlSpecs, options: { proto: ControlCode, parent: ThisApp }};
	return ThisControl;
})(ActionAppCore, $);