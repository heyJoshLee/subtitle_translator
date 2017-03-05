var timeCodeAdjustment = 0,
    timeCodeLength = 2000,
    timeCodeAdjustmentDisplay = document.getElementById("time_code_adjustment_display"),
    timeCodeLengthDisplay = document.getElementById("time_code_length_display")
    $subtitle_input = $("#subtitle_input"),
    $outputSubtitlesContainer = $("#output_subtitles"),
    $downloadOutputSubtitles = $("#downloadOutputSubtitles"),
    $downloadOutputScript = $("#downloadOutputScript"),
    $downloadTranslatedSubtitles = $("#downloadTranslatedSubtitles"),
    $downloadTranslatedScript = $("#downloadTranslatedScript"),
    $translatedSubtitlesContainer = $("#translatedSubtitlesContainer"),
    subtitle_array = [],
    timeCodeStrings = [],
    translatedSubtitles = "",
    inputSubtitles =  "",
    $languageToTranslateTo = $("#languageToTranslateTo"),
    adjustedSubtitles = "",
    hoursSeparator = ":",
    minutesSeparator = ":",
    secondsSeparator = ".",
    subtitleType = "WEBVTT";


//// Create Subtitles

function stringToSeconds(string) {
  var a = string.split(",")[0].split(':'); // split it at the colons
  var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
  return seconds;
}

function msToTime(duration) {
  // http://stackoverflow.com/questions/19700283/how-to-convert-time-milliseconds-to-hours-min-sec-format-in-javascript
    var milliseconds = parseInt((duration%1000)/100)
        , seconds = parseInt((duration/1000)%60)
        , minutes = parseInt((duration/(1000*60))%60)
        , hours = parseInt((duration/(1000*60*60))%24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    if (seconds % 2 === 0 ) { lastTime = seconds; }
    return hours + hoursSeparator + minutes + minutesSeparator + seconds + secondsSeparator + milliseconds + "00";
}

function changeTimeCodeValues(value) {
  timeCodeAdjustment = value;
  timeCodeAdjustmentDisplay.innerHTML = timeCodeAdjustment;
  renderSubtitles();
  renderTranslatedSubtitles(translatedSubtitles);
}

function changeTimeCodeLength(value) {
  timeCodeLength = value;
  timeCodeLengthDisplay.innerHTML = timeCodeLength;
  renderSubtitles();
  renderTranslatedSubtitles(translatedSubtitles);
}

function setInputSubtitles() {
  inputSubtitles = $subtitle_input.val();
  subtitleArray = inputSubtitles.split('\n\n');
}

// $subtitle_input.on("keyup", function() {
//   console.log("Change")
//   $outputSubtitlesContainer.val($subtitle_input.val());
// });


// Update 
$subtitle_input.bind("input propertychange", function (e) {
  console.log("Change")
  $outputSubtitlesContainer.val($subtitle_input.val());
})

function generateTimeCodeArray() {
  setInputSubtitles();
  timeCodeStrings = [];

  for(var i = 0; i < subtitleArray.length; i++) {
    try{
      var array = subtitleArray[i].split('\n'),
        text = array[1].trim(),
        topRow = array[0].trim(),
        topRowSplit = topRow.split(" "),
        beginningTime = topRowSplit[0],
        seperator = topRowSplit[1],
        endingTime = topRowSplit[2]
        beginningTimeWithoutMilliseconds = topRowSplit[0].split(",")[0],
        beginningTimeMilliseconds = topRowSplit[0].split(",")[1],
        endingTimeWithoutMilliseconds = topRowSplit[2].split(",")[0],
        endingTimeMilliseconds = topRowSplit[2].split(",")[1];

      var beginningTimeInSeconds = stringToSeconds(beginningTimeWithoutMilliseconds),
          adjustedTimeInSeconds = (beginningTimeInSeconds * 1000) + parseInt(timeCodeAdjustment),
          beginningAdjustedTimeString = msToTime(adjustedTimeInSeconds);

      var endingAdjustedTimeString = msToTime(adjustedTimeInSeconds + parseInt(timeCodeLength));
      var fullTimeCodeString = beginningAdjustedTimeString.replace("-", "") + " --> " + endingAdjustedTimeString.replace("-", "");
      timeCodeStrings.push(fullTimeCodeString)
    }
    catch (e) {
      console.log(e)
    }
  }
}


function renderSubtitles() {
  adjustedSubtitles = "";
  if (subtitleType === "WEBVTT") {
    adjustedSubtitles += "WEBVTT\n\n";
  }
  generateTimeCodeArray();

  for(var i = 0; i < timeCodeStrings.length; i ++) {
    adjustedSubtitles += timeCodeStrings[i] + "\n" + subtitleArray[i].split("\n")[1] + "\n\n\n";
  }

  $outputSubtitlesContainer.val(adjustedSubtitles);
}

//// Create Subtitles End

//// Translate

var languageFrom = "",
    languageTo = "",
    text_to_translate = "",
    app_id = "c07d1698-c537-4d30-aeeb-731f7b595b76",
    api_key = "5add09c3686a448e8ea93cfd3acc477f",
    newLineBreaksArray = [];

var $start_translate = $("#start_translate"),
    $translatedSubtitlesContainer = $("#translatedSubtitlesContainer");

$start_translate.on("click", function(e) {
  e.preventDefault();
  var textToTranslate = ""
  generateTimeCodeArray()
  var array = $subtitle_input.val().split("\n\n");
  for(var i = 0; i < array.length; i++) {
     var splitArray = array[i].split("\n");
     textToTranslate += splitArray[1];
     textToTranslate += "%%%";
  }
  $.ajax({
    url: '/translate',
    type: 'POST',
    data: {textToTranslate: textToTranslate, toLanguage: $languageToTranslateTo.val()},
  })
  .done(function(data) {
    console.log("success");
    translatedSubtitles = data;
    renderTranslatedSubtitles(translatedSubtitles);
  })
  .fail(function() {
    console.log("error");
  })
  .always(function() {
    console.log("complete");
  });
  
});

function renderTranslatedSubtitles(translation) {
  if (translatedSubtitles !== "") {
    var splitTranslation = translation.split("%%%");
    var translatedOutput = ""; 
    for(var i = 0; i < timeCodeStrings.length; i++) {
      translatedOutput += timeCodeStrings[i] + "\n";
      translatedOutput +=splitTranslation[i] + "\n\n"
    }
    $translatedSubtitlesContainer.val(translatedOutput);
  }
}



function downloadFile(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}

function subtitleToScript(inputText) {
  var output =  [],
      textArray = inputText.split("\n")

  for(var i = 0; i < textArray.length; i ++) {
    if (textArray[i] === "" || textArray[i][0] === "0") {
      continue;
    }
    else {
      output.push(textArray[i]);
    }
  }
  return output.join(" ").replace(/\s\s+/g, ' ')
}




// buttons

$("#generate_custom_subtitles").on("click", function() {
  renderSubtitles();
});

$downloadOutputSubtitles.on("click", function(e) {
  e.preventDefault();
  var fileName = "EN-subtitles.srt"; 
  if (subtitleType === "WEBVTT") {
    fileName = "EN-subtitles.vtt";
  }
  downloadFile(fileName, $outputSubtitlesContainer.val());
})

$downloadOutputScript.on("click", function(e) {
  e.preventDefault();
  downloadFile("EN-script.txt", subtitleToScript($outputSubtitlesContainer.val()));
});

$downloadTranslatedSubtitles.on("click", function(e) {
  e.preventDefault();
  var languePrefix = $languageToTranslateTo.val().substr(0,2).toUpperCase();
  var fileName = languePrefix + "-subtitles.srt";
  downloadFile(fileName, $translatedSubtitlesContainer.val());
});

$downloadTranslatedScript.on("click", function(e) {
  e.preventDefault();
  var languePrefix = $languageToTranslateTo.val().substr(0,2).toUpperCase();
  var fileName = languePrefix + "-script.txt";
  var subtitleContent = subtitleToScript($translatedSubtitlesContainer.val());
  if (languePrefix == "ZH") {
    subtitleContent = subtitleContent.replace(/ /g, "");
  }
  downloadFile(fileName, subtitleContent)
})
