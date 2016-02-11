var router = require('express').Router(),
    fs = require('fs'),
    path = require('path'),
    formidable = require('formidable'),
    Profile = require("./../models/profile");

router.post('/profilePic', function(req,res,next) {
  var form = new formidable.IncomingForm(),
      userId = null,
      sendResponse = function(err,tempUrl) {
        if ( err ) {
          res.send( JSON.stringify( {error:err}) );
        }else{
          // updating user-profile in MogoDB
          Profile.findOneAndUpdate( {'userId': userId}, {imageLink:tempUrl}, {upsert:false}, function(err, doc){
            if (err)
              return res.send(500, { error: 'MONGOERROR' });
            res.send( JSON.stringify( {error:null, tempUrl: tempUrl}) );
          });
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
        overwritePic = function(oldFilePath, tempFilePath) {
          var fileName = path.basename(oldFilePath);
          console.log('Overwriting the pic uploaded: ' + fileName);
          fs.unlink(oldFilePath, function (err) {
            if (err) {
              console.log(err);
              return callback( 'CANTDELETE', null );
            } else {
              // Rename the file to match the filename that the user uploaded
              fs.rename(tempFilePath, oldFilePath, function (err) {
                if (err) {
                  console.log(err);
                  return callback( 'PERMISSIONERROR', null );
                }else{
                  console.log('No rename error');
                  tempUrl = 'temp/' + fileName;
                  callback( null, tempUrl );
                }
              });
            }
          });
        },
        deleteTempFile = function(filePath) {
          console.log('Deleting file...');
          fs.unlink(filePath, function (err) {
            if (err)
              return console.log(err);
          });
        };
    form.uploadDir = process.cwd() + '/public/temp';
    form.on( 'field', function( name, value ) {
      userId = value;
    });
    form.on('file', function(field, file) {
      isImageType = /image\/(jpeg|gif|png)/.test(file.type);
      if ( !isImageType ) {
        deleteTempFile(file.path); // Uploaded file is not an image, so delete it
        callback('NOTIMAGE',null);
      }else {
        var newName = userId + '_' + file.name,// append username to the file to avoid name collisions
            destFile = path.dirname(file.path) + '/' + newName;
            tempUrl = 'temp/' + newName;
        try {
          var stats = fs.statSync(destFile);
          if ( stats.isFile() ) {
            return overwritePic(destFile, file.path);// delete the previous file
          }
        }catch(e) {
          // Rename the file to match the filename that the user uploaded
          fs.rename(file.path, 'public/' + tempUrl, function (err) {
            if (err) {
              console.log(err);
              return callback( 'PERMISSIONERROR', null );
            }else{
              console.log('No rename error');
              if ( userId == null ) {
                while( userId == null ) {
                  if ( userId ) {
                    callback( null, tempUrl );
                    break;
                  }
                }
              } else {
                callback( null, tempUrl );
              }
            }
          }); //end rename
        }
      }

    });
    form.parse(req); // parse the incoming request to get form-data
  })(sendResponse);
});

module.exports = router;
