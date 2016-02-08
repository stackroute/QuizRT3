var router = require('express').Router(),
    fs = require('fs'),
    path = require('path'),
    formidable = require('formidable');

router.post('/profilePic', function(req,res,next) {

  var form = new formidable.IncomingForm(),
      sendResponse = function(err,tempUrl) {
        if ( err ) {
          res.send( JSON.stringify( {error:err}) );
        }else{
          res.send( JSON.stringify( {error:null, tempUrl: tempUrl}) );
        }
      };

  // make 'public/temp' directory if it doesn't exist
  try {
    fs.mkdirSync('public/temp');
  } catch(e) {
    if ( e.code != 'EEXIST' ) {
      throw e;
    }
  }
  // Send response only when file is saved to sever. (Hence the async callback)
  (function(callback) {
    var isImageType,
        tempUrl,
        deleteTempFile = function(filePath) {
          console.log('File exists on server. Deleting temp file...');
          fs.unlink(filePath, function (err) {
            if (err) return console.log(err);
          });
        };
    form.uploadDir = process.cwd() + '/public/temp';
    form.on('file', function(field, file) {
      isImageType = /image\/(jpeg|gif|png)/.test(file.type);
      if ( !isImageType ) {
        deleteTempFile(file.path); // Uploaded file is not an image, so delete it
        callback('NOTIMAGE',null);
      }else {
        var destFile = path.dirname(file.path) + '\\' + 'user_' + file.name; // append username to the file to avoid name collisions
        tempUrl = 'temp/' + path.basename(file.path);

        try {
          var stats = fs.statSync(destFile);
          if ( stats.isFile() ) {
            deleteTempFile(file.path);
            tempUrl = 'temp/' + 'user_' + file.name;
            return callback( null, tempUrl );
          }
        }catch(e) {
          // Rename the file to match the filename that the user uploaded
          fs.rename(file.path, destFile, function (err) {
            if (err) {
              console.log(err);
              return callback( 'PERMISSIONERROR', null );
            }else{
              console.log('No rename error');
              tempUrl = 'temp/' + 'user_' + file.name;
              callback( null, tempUrl );
            }
          });
        }
      }

    });
    form.parse(req); // parse the incoming request to get form-data
  })(sendResponse);
});
module.exports = router;
