const exiftool = require('node-exiftool')
const ep = new exiftool.ExiftoolProcess()
/*
 * Utility function to convert exif data into something a bit more consumable
 * by a template
 */
var exif = function(staticPath, callback){
  try {
    ep.open()
    // display pid
    .then(() => ep.readMetadata(staticPath, ['-File:all']))
    .then((data)=>{
      var exifMap = {};
      for (var i=0; i<data.data.length; i++){
        var t = data.data[i],
          careAbout = { // what props we're interested in, and what we call them in output, rather than silly exif-ey names
            "Make" : "Make",
            "Model" : "Model",
            "DateTimeOriginal" : "Time",
            "ApertureValue" : "aperture",
            "FocalLength" : "focalLength",
            "ISOSpeedRatings" : "ISO",
            "ExposureTime" : "Shutter Speed",
            "GPSLatitude" : "Lat",
            "GPSLongitude" : "Long",
            "ImageDescription" : "Description"
          };
        for(tagName in t) {
          if (careAbout.hasOwnProperty(tagName)) {
            var key = careAbout[tagName],
              value = t[tagName];

            if (key == "Shutter Speed") {
              // Transform shutter speed to a fraction
              value = dec2frac(value);
            }
            if (typeof value == "number") {
              value = Math.round(value * 100) / 100; // no long decimals
            }
            exifMap[key] = value;
          }
        }
      }
      console.log('exifmap', JSON.stringify(exifMap));
      return callback(null, exifMap);
    },(error) => {
      console.log('Exiftool caught error:', error);
      callback(error)
    })
    .then(() => ep.close())
    .catch(console.error)

  } catch (error) {
    console.log('Exif extraction failed', error);
    return callback(error);
  }
}

// source: http://stackoverflow.com/questions/95727/how-to-convert-floats-to-human-readable-fractions
function dec2frac(d) {

  var df = 1;
  var top = 1;
  var bot = 1;

  while (df != d) {
    if (df < d) {
      top += 1;
    }
    else {
      bot += 1;
      top = parseInt(d * bot);
    }
    df = top / bot;
  }
  return top + '/' + bot;
}

module.exports = exif;

