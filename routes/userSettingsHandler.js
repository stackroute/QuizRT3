var router = require('express').Router(),
    fs = require('fs'),
    path = require('path'),
    formidable = require('formidable'),
    Profile = require("./../models/profile");

// to handle profile pic upload
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
            res.send( JSON.stringify( {error:null, tempUrl: doc.imageLink}) );
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
        overwritePic = function(oldFilePath, tempFilePath, renamePath) {
          var fileName = path.basename(oldFilePath);
          console.log('Overwriting the pic uploaded: ' + fileName);
          fs.unlink(oldFilePath, function (err) {
            if (err) {
              console.log(err);
              return callback( 'CANTDELETE', null );
            } else {
              // Rename the file to match the filename that the user uploaded
              fs.rename(tempFilePath, 'public/' + renamePath, function (err) {
                if (err) {
                  console.log(err);
                  return callback( 'PERMISSIONERROR', null );
                }else{
                  console.log('No rename error');
                  tempUrl = renamePath;
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
            tempUrl = 'images/userProfileImages/' + newName;
        try {
          var stats = fs.statSync(destFile);
          if ( stats.isFile() ) {
            return overwritePic(destFile, file.path, tempUrl);// overwrite the previous file
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

router.post('/updateProfile', function(req,res,next) {
  var updatedUser = req.body.user;
  Profile.findOne({userId:updatedUser.userId}, function(err,profileData){
    if ( err || !profileData ) {
      console.error(err);
      res.writeHead(500,{'Content-Type':'application/json'});
      res.end( JSON.stringify({ error:'MongoDB error while reading the user profile.'}) );
    }else {
      profileData.name = updatedUser.name;
      profileData.age = updatedUser.age;
      profileData.country = updatedUser.country;
      profileData.emailId = updatedUser.emailId;
      if ( !updatedUser.imageLink.trim() ) {
        updatedUser.imageLink = 'images/userProfileImages/user.png';
      }
      profileData.imageLink = updatedUser.imageLink;
      validateAndSaveProfile( profileData, res );
    }
  });
});

// persist user profile to MongoDB
function validateAndSaveProfile( profileData, res ) {
  var validationError = profileData.validateSync();
  if ( validationError ) {
    console.log('Mongoose validaton error of user profile.');
    console.error(validationError);
    res.writeHead(500,{'Content-Type':'application/json'});
    res.end( JSON.stringify({ error:'Mongoose validaton error of user profile.'}) );
  } else {
    profileData.save( function(err, updatedUserProfile ) {
      if ( err ) {
        console.log('Could not save the updated user profile to MongoDB!');
        console.error(err);
        res.writeHead(500,{'Content-Type':'application/json'});
        res.end( JSON.stringify({ error:'Could not save the updated user profile to MongoDB!'}) );
      }else {
        console.log("User profile updated sucessfully!!\n");
        res.end( JSON.stringify({ error:null, updatedUserProfile: updatedUserProfile }) );
      }
    }); //end save
  }
}

module.exports = router;
