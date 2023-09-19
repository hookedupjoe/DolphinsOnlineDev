(function (ActionAppCore, $) {

  var ControlSpecs = {
    options: {
      padding: false,
      required: {
        templates: {
          map:
          {
            "LogoSVG": {
              source: "__app", name: "LogoSVG"
            }
          }
        }
      }
    },
    content: [
      {ctl: 'div',
        name: 'spacer',
        classes:'pad10',
        text: ''
      },
      {
      ctl: "spot",
      name: "body",
      text: ""
    },{
      ctl: "control",
      hidden: true,
      controlname: "AudioMotionAnalyzer",
      name: "audiomotion",
      source: "__app"
    }]
  }

  var ControlCode = {};

  
  ControlCode.startMic = startMic
  
  function startMic(){
    this.parts.audiomotion.startWithMic();
    this.micInit = true;
    this.startMusicResponse();
  }

  function RGBtoHSV(r, g, b) {
    if (arguments.length === 1) {
      g = r.g,
      b = r.b,
      r = r.r;
    }
    var max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min,
    h,
    s = (max === 0 ? 0: d / max),
    v = max / 255;

    switch (max) {
      case min: h = 0; break;
      case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
      case g: h = (b - r) + d * 2; h /= 6 * d; break;
      case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

    return {
      h: h,
      s: s,
      v: v
    };
  }
  function HSVtoRGB(h, s, v) {
    let f = (n, k = (n+h/60)%6) => v - v*s*Math.max(Math.min(k, 4-k, 1), 0);
    var tmpR = f(5);
    var tmpG = f(3);
    var tmpB = f(1);

    return {
      r: tmpR*255,
      g: tmpG*255,
      b: tmpB*255
    };
  }

  var hueOffset = 20;
  var brtOffset = 10;
  var allColors = [];

  
  ControlCode.offsetColorItem = offsetColorItem;
  function offsetColorItem(theItem, theOffset) {
    var tmpSpecs = this.colorIndex[theItem];
    var tmpElem = tmpSpecs.el
    var tmpOrig = tmpSpecs.colors;
    
      var tmpH = tmpOrig.h;
      var tmpS = tmpOrig.s/255;
      var tmpV = tmpOrig.v/255;
      
      tmpS += theOffset;
      if( tmpS > 1){
        tmpS = 1
      } else if( tmpS < 0){
        tmpS = 0
      }

      var tmpNewRGB = HSVtoRGB(tmpH, tmpS, tmpV)
      var tmpNewRGBFill = 'rgb(' + tmpNewRGB.r + ',' + tmpNewRGB.g + ',' + tmpNewRGB.b + ')';
      //console.log('tmpEntry',tmpNewRGBFill);
      tmpElem.css('fill', tmpNewRGBFill);
  }

  
    ControlCode.initColors = initColors;
  function initColors(){
    this.colorIndex = {};
    
    this.colorElems = ThisApp.getByAttr$({
        appuse: "charcolor"
    });
    
    for (var i = 0; i < this.colorElems.length; i++) {
      var tmpEntry = $(this.colorElems[i]);
      var tmpID = tmpEntry.attr('id');
      var tmpFillRGB = tmpEntry.css('fill');
      var tmpColors = getColorsFromFillValue(tmpFillRGB);
      
      this.colorIndex[tmpID] = {
        el: tmpEntry,
        colors: tmpColors
      }
    }
    
    console.log('this.elemIndex',this.elemIndex);
  }
  
  ControlCode.initElems = initElems;
  function initElems() {
    this.elemIndex = {};
    this.charElems = this.getByAttr$({
      appuse: "charpart"
    });

    for (var i = 0; i < this.charElems.length; i++) {
      var tmpEntry = $(this.charElems[i]);
      var tmpID = tmpEntry.attr('id');
      
      var tmpFillRGB = tmpEntry.css('fill');
      var tmpColors = getColorsFromFillValue(tmpFillRGB);
      tmpEntry.data('colors',tmpColors);

      _charElems[tmpID] = tmpEntry;
    }
    this.charIndex = _charElems;

  }

  // var _charSpecs = {
  //   tail: {strings:['updown']},
  //   frontleft: {strings:['updown','forwardback']},
  //   backleft: {strings:['updown','forwardback']},
  //   backright: {strings:['updown','forwardback']},
  //   frontright: {strings:['updown','forwardback']},
  //   body: {strings:['updown']},
  //   shell: {strings:['updown']},
  //   pupils: {strings:['updown','leftright']},
  //   eyebrowleft: {strings:['updown']},
  //   eyebrowright: {strings:['updown']},
  //   mouth: {strings:['openclose']},
  //   head: {strings:['updown']},
  // };
  
  //=== ToDo: Refactor and change structure ..
  var _charDetails = {
    
    part_sun: {
      x: 0,
      y: 0
    },
    part_dolphin: {
      x: 300,
      y: 218
    },
    head: {
      x: 350,
      y: 100
    }
  }

  var _charElems = {}

  window.charDetails = _charDetails;
  window._charElems = _charElems;

  ControlCode.mapNumber = mapNumber;
  function mapNumber (number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  }

  ControlCode.moveMouthAmt = moveMouthAmt;
  function moveMouthAmt(theAmount, theString) {

   var tmpName = 'mouth';
    var tmpFrom = -10;
    var tmpTo = 16;
    var tmpAmt = this.mapNumber(theAmount, 0, 255, tmpFrom, tmpTo);

    if (theString == 'updown') {
      translateItem(tmpName, 0, tmpAmt);
    }
  }

  
    var voiceBandMin = 20;
  
    
  function amtForVoiceBand(theValue, theBand){
    return theValue;
    var tmpVal = Math.max(voiceBandMin,theValue);
    var tmpRet = tmpVal/255;
    return tmpRet;
  }
  function amtForIntensityBand(theValue, theBand){
    var tmpVal = Math.max(voiceBandMin,mapNumber(theValue, 0,128,0,255));
    var tmpRet = tmpVal/255;
    return tmpRet;
  }
  
  
    function amtForLevelBand(theValue, theBand){
    var tmpValue = theValue * 255;
    var tmpVal = Math.max(voiceBandMin,mapNumber(tmpValue, 0,255,30,230));
    //var tmpRet = tmpVal; ///255;
    return tmpVal;
  }


  function bandVal(theBand){
    if(!(ThisApp.common.eqDataMic)){
      return;
    }
    return amtForLevelBand(ThisApp.common.eqDataMic.bands[theBand].value[0],theBand);
  }
  ControlCode.reactionSpeak = function(){
           // var tmpVol = ThisApp.common.eqData.B15 || 0;
    //var tmpEQ = ThisApp.common.eqData;
    var tmpEQMic = ThisApp.common.eqDataMic;
  
    var tmpAmt = (bandVal(13) + bandVal(14) + bandVal(15) + bandVal(16) + bandVal(17) + bandVal(18) + bandVal(19));
    tmpAmt /= 7;
    tmpAmt = this.mapNumber(tmpAmt, 30, 120, 0, 20);
    
    if( tmpAmt > 20 ){
      tmpAmt = 20;
    }
    if( tmpAmt < 0 ){
      tmpAmt = 0;
    }
    tmpAmt = Math.round(tmpAmt);
    var tmpShowAmt = '' + tmpAmt;
    if( tmpAmt < 10){
      tmpShowAmt = '0' + tmpShowAmt;
    }
    var tmpAmtS = '1.'+(tmpShowAmt);
    var tmpScaleAmt = tmpAmtS;
    var tmpScale = 'scale(' + tmpScaleAmt + ',' + tmpScaleAmt + ')';
    var tmpTranslate = 'translate(-' + tmpAmt + ',-' + tmpAmt + ')';
    var tmpPart = this.charIndex.part_sun.get(0)
    tmpPart.setAttribute("transform", tmpTranslate + ' ' + tmpScale)

//console.log(tmpTranslate + ' ' + tmpScale)

    //this.pullString({name:'mouth', amount:tmpAmt,  string: 'updown'});

  }
  

  var watchDog1 = 0;
  var ThisControl;
  

  // var reactionFunction = false;
  // ControlCode.runReaction = function(theName) {
  //   var tmpFunc = ThisControl[theName];
  //   if( !(tmpFunc) ) return;
  //   tmpFunc = tmpFunc.bind(this);
  //   reactionFunction = tmpFunc;
  // }
  
  
  // ControlCode.runReactionAction(theParams, theTarget) {
  //           var tmpParams = ThisApp.getActionParams(theParams, theTarget, ['href']);
    
  // }
  
  ControlCode.startMusicResponse = startMusicResponse;
  function startMusicResponse(){
    // update the display based on data'
    var self = this;
    this.danceInterval = d3.interval(function () {
     
      try {
        self.reactionSpeak();
    } catch (ex) {
        //temp -> 
        if( watchDog1++ > 10){
          return;
        }
        console.error("Error ", ex);
      }
    },
      5);
  }
  
  ControlCode.stopMusicResponse = stopMusicResponse;
  function stopMusicResponse(){
    if( !this.danceInterval ) return;
      
    this.danceInterval.stop();
  }

  
  ControlCode.movePupilsAmt = movePupilsAmt;
  function movePupilsAmt(theAmount, theString) {
    var tmpName = 'pupils';
    var tmpFrom = -7;
    var tmpTo = 7;
    var tmpTranslate = this.mapNumber(theAmount, 0, 255, tmpFrom, tmpTo);

    if (theString == 'updown') {
      translateItem(tmpName, false, tmpTranslate);
    } else if (theString == 'leftright') {
      translateItem(tmpName, tmpTranslate, false);
    }
  }


  ControlCode.moveTailAmt = moveTailAmt;
  function moveTailAmt(theAmount, theString) {
    var tmpName = 'tail';
    var tmpFrom = 12;
    var tmpTo = -12;
    var tmpAmt = this.mapNumber(theAmount, 0, 255, tmpFrom, tmpTo);

    if (theString == 'updown') {
      rotateItem(tmpName, tmpAmt);
    }
  }
  
  ControlCode.moveHeadAmt = moveHeadAmt;
  function moveHeadAmt(theAmount, theString) {
    var tmpName = 'head';
    if (theString == 'updown') {
      var tmpFrom = -10;
      var tmpTo = 10;
      var tmpAmt = this.mapNumber(theAmount, 0, 255, tmpFrom, tmpTo);
      translateItem(tmpName, false, tmpAmt);
    } else if (theString == 'leftright') {
      var tmpFrom = -8;
      var tmpTo = 8;
      var tmpAmt = this.mapNumber(theAmount, 0, 255, tmpFrom, tmpTo);
      translateItem(tmpName, tmpAmt, false);
    } else if (theString == 'tilt') {
      var tmpFrom = -10;
      var tmpTo = 10;
      var tmpAmt = this.mapNumber(theAmount, 0, 255, tmpFrom, tmpTo);
      rotateItem(tmpName, tmpAmt);
    }
  }

  ControlCode.moveArmAmt = moveArmAmt;
  function moveArmAmt(theName, theAmount, theString) {
    var tmpName = theName;
    var tmpFrom = -100;
    var tmpTo = 10;
    if( theName == 'rightarm'){
      tmpFrom = 107;
      tmpTo = -10;
    }
    var tmpAmt = this.mapNumber(theAmount, 0, 255, tmpFrom, tmpTo);

    if (theString == 'updown') {
      rotateItem(tmpName, tmpAmt);
    }
  }

  ControlCode.moveShellAmt = moveShellAmt;
  function moveShellAmt(theAmount, theString) {
    var tmpName = 'shell';
    var tmpFrom = -10;
    var tmpTo = 10;
    var tmpAmt = this.mapNumber(theAmount, 0, 255, tmpFrom, tmpTo);

    if (theString == 'updown') {
      translateItem(tmpName, false, tmpAmt);
    }
  }

  ControlCode.moveBodyAmt = moveBodyAmt;
  function moveBodyAmt(theAmount, theString) {
    var tmpName = 'body';
    var tmpFrom = -10;
    var tmpTo = 10;
    var tmpAmt = this.mapNumber(theAmount, 0, 255, tmpFrom, tmpTo);

    if (theString == 'updown') {
      translateItem(tmpName, false, tmpAmt);
    }
  }


  ControlCode.moveLegAmt = moveLegAmt;
  function moveLegAmt(theName, theAmount, theString) {

    var tmpFromRotate = -15;
    var tmpToRotate = 15;
    var tmpFromTranslate = -15;
    var tmpToTranslate = 15;

    var tmpRotate = this.mapNumber(theAmount, 0, 255, tmpFromRotate, tmpToRotate);
    var tmpTranslate = this.mapNumber(theAmount, 0, 255, tmpFromTranslate, tmpToTranslate);
    if (theString == 'forwardback') {
      rotateItem(theName, tmpRotate);
    } else if (theString == 'updown') {
      translateItem(theName, false, tmpTranslate);
    }
  }
  
  // --- Strings: leftright updown forwardback openclose
  ControlCode.pullString = function(theOptions) {
    var tmpOptions = theOptions || {};

    var tmpName = theOptions.name;
    var tmpString = theOptions.string;
    var tmpAmount = theOptions.amount;
    var tmpSpecs = _charDetails[tmpName];
    var tmpElem = _charElems[tmpName].get(0);

    if (tmpName == 'pupils') {
      this.movePupilsAmt(tmpAmount, tmpString);
    } else if (tmpName == 'mouth') {
      this.moveMouthAmt(tmpAmount, tmpString);
    } else if (tmpName == 'tail') {
      this.moveTailAmt(tmpAmount, tmpString);
    } else if (tmpName == 'head') {
      this.moveHeadAmt(tmpAmount, tmpString);
    } else if (tmpName == 'shell') {
      this.moveShellAmt(tmpAmount, tmpString);
    } else if (tmpName == 'body') {
      this.moveBodyAmt(tmpAmount, tmpString);
    } else if (tmpName == 'leftarm' || tmpName == 'rightarm') {
      this.moveArmAmt(tmpName, tmpAmount, tmpString)
    } else if (tmpName == 'frontleft' || tmpName == 'frontright' || tmpName == 'backleft' || tmpName == 'backright') {
      this.moveLegAmt(tmpName, tmpAmount, tmpString)
    }

  }



  ControlCode.transformItem = transformItem;
  function transformItem(theItem, theTransform) {
    var tmpSpecs = _charDetails[theItem];
    var tmpElem = _charElems[theItem].get(0);
    tmpElem.setAttribute("transform", theTransform);
  }

  ControlCode.translateItem = translateItem;
  function translateItem(theItem, theXAmt, theYAmt) {
    var tmpEl = _charElems[theItem];
    var tmpElem = tmpEl.get(0);
    var tmpIsX = (theXAmt !== false);
    var tmpIsY = (theYAmt !== false);
    var tmpXAmt = tmpIsX ? theXAmt: 0;
    var tmpYAmt = tmpIsY ? theYAmt: 0;
    var tmpData = tmpEl.data() || {};

    //--- Save element(s) data that is being set
    if (tmpIsX) {
      tmpEl.data('tX', tmpXAmt);
    } else {
      tmpXAmt = tmpEl.data('tX') || 0;
    }
    if (tmpIsY) {
      tmpEl.data('tY', tmpYAmt)
    } else {
      tmpYAmt = tmpEl.data('tY') || 0;
    }

    tmpElem.setAttribute("transform", "translate(" + tmpXAmt + "," + tmpYAmt + ")");
  }

  ControlCode.rotateItem = rotateItem;
  function rotateItem(theItem, thePerc, theOptX, theOptY) {
    var tmpSpecs = _charDetails[theItem];
    var tmpElem = _charElems[theItem].get(0);
    if( theOptX && theOptY){
      tmpElem.setAttribute("transform", "rotate(" + thePerc + "," + theOptX + ',' + theOptY + ")");
    } else {
      tmpElem.setAttribute("transform", "rotate(" + thePerc + "," + tmpSpecs.x + "," + tmpSpecs.y + ")");
    }
  }


  function getColorsFromFillValue(theCSSValue){
    var tmpColors = theCSSValue.replace('rgb(', '').replace(')', '').replace(' ', '');
      tmpColors = tmpColors.split(',');
      var tmpR = parseInt(tmpColors[0]);
      var tmpG = parseInt(tmpColors[1]);
      var tmpB = parseInt(tmpColors[2]);
      var tmpColors = RGBtoHSV(tmpR, tmpG, tmpB);

      tmpColors.r = tmpR;
      tmpColors.g = tmpG;
      tmpColors.b = tmpB;
      
      tmpColors.h = Math.round(tmpColors.h * 360);
      tmpColors.s = Math.round(tmpColors.s * 255 );
      tmpColors.v = Math.round(tmpColors.v * 255 );
      
      return tmpColors
  }
  

  ControlCode._onInit = _onInit;
  function _onInit() {
    //-- For debugging only
    window.Logo = this;

    this.showDebug = false;
    ThisControl = this;

    this.moveMouth = true

    this.loadSpot('body', {}, 'LogoSVG');
    this.initElems();
    this.initColors();
    this.colorIndex.color_outline.el.css('fill', 'transparent')
    
    //this.getSpot('body').css('background-color', 'green');
    ThisApp.util.clearToTop(this.getSpot$('body').get(0));

  }
  


  var ThisControl = {
    specs: ControlSpecs,
    options: {
      proto: ControlCode,
      parent: ThisApp
    }};
  return ThisControl;
})(ActionAppCore, $);
