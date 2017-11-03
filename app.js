const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const sendmail = require('sendmail')();
const validator = require("email-validator");
const session = require('express-session');
require('mongoose-type-email');


mongoose.connect('mongourl');


var userpanel = new mongoose.Schema({
  username: {
    type: String,
    require: true
  },
  password: {
    type: String,
    require: true
  },
  email: mongoose.SchemaTypes.Email,
  skills: {
    type: String,
    require: true
  },
  location: {
    type: String,
    require: false
  },
  facebook: {
    type: String,
    require: false
  },
  twitter: {
    type: String,
    require: false
  },
  linkedin: {
    type: String,
    require: false
  },
  about: {
    type: String,
    require: false
  },
  avatar: {
    type: String,
    require: false
  }
});

var userthepost = new mongoose.Schema({
  title: {
    type: String,
    require: true
  },
  word: {
    type: String,
    require: true,
    trim : true
  },
  username: {
    type: String,
    require: true
  }
});

var User = mongoose.model('Userpanel', userpanel);
var Userpost = mongoose.model('Userpost', userthepost);

const app = express();



var urlencodedParser = bodyParser.urlencoded({
  extended: false
});

app.set('view engine', 'ejs');

app.use('/css', express.static('css'));
app.use('/img', express.static('img'));
app.use('/js', express.static('js'));
app.use('/scss', express.static('scss'));
app.use('/vendor', express.static('vendor'));
app.use('/uploads', express.static('uploads'));


app.use(cookieParser());
app.use(session({
  secret: 'iloveubabe'
}));



app.post('/user/check/mail', urlencodedParser, (req, res) => {
  sendmail({
    from: req.body.email,
    to: 'dayancbardak2@gmail.com',
    subject: 'Message from ' + req.body.name + ', ' + req.body.phone,
    html: req.body.Message
  }, function(err, reply) {
    console.log(err && err.stack);
    console.dir(reply);
  });
  res.redirect('/');
});

app.get('/', urlencodedParser, (req, res) => {
  if (req.session.username) {
    User.findOne({
      username: req.session.username
    }, function(err, doc) {
      User.find({ username : req.session.username }, (error, result) => {
        res.render('withoutregister', {
          username: doc.username,
          email: doc.password,
          skills: doc.skills,
          result: result
        });
      });

    });
  } else {
    res.render('index', {
      yanlis: '',
      emailyanlis: '',
      skills: '',
      harfkucuk: '',
      recipes: 0
    });
  }
});

app.get('/:username', urlencodedParser, (req, res) => {
  User.find({ username : req.params.username }, (err, doc) => {
    try{
      if(doc[0].username == req.params.username){
        Userpost.find({ username : req.params.username }, (error, result) => {
          if(req.session.username){
            res.render('withsession', {
              username : req.session.username,
              other : req.params.username,
              result : result,
              doc : doc,
              btoa: (string) => {
                return new Buffer(string).toString('hex')
              }
            });
          } else {
            res.render('withoutsession', {
              username : req.session.username,
              other : req.params.username,
              result : result,
              doc : doc,
              btoa: (string) => {
                return new Buffer(string).toString('hex')
              }
            });
          }
        });
      } else {
        res.send('an error occured!');
      }
    } catch(err) {
      res.send('User not found!');
    }
  });
});

app.get('/:username/:title/edit/:email', urlencodedParser, (req, res) => {
  var username = new Buffer(req.params.username, 'hex').toString('utf8');
  var title = new Buffer(req.params.title, 'hex').toString('utf8');
  if(req.session.username == username){
    User.find({ username : username }, (err, doc) => {
      try{
        if(doc[0].username == username){
          Userpost.find({ username : username, title : title }, (error, result) => {
            try {
              if(title != "" && username != ""){
                if(result[0].title == title){
                  res.render('bodyedit', {
                    username : username,
                    doc : doc,
                    result : result,
                    title : title,
                    bariz : 5,
                    word : result[0].word,
                    btoa: (string) => {
                      return new Buffer(string).toString('hex')
                    }
                  });
                } else {
                  res.send('There is an error!');
                }
              } else {
                res.send('Do not leave blank !');
              }
            } catch(err){
              res.send('Title not found!');
            }
          });
        } else {
          res.send('an error occured!');
        }
      } catch(err){
        res.send('User not found !');
      }

    });
  } else {
    res.send('You are not authorized to view this page !');
  }
});

app.post('/:username/:title/edit/:email', urlencodedParser, (req, res) => {
  var username = new Buffer(req.params.username, 'hex').toString('utf8');
  var title = new Buffer(req.params.title, 'hex').toString('utf8');
  if(username != "" && title != ""){
    User.find({ username : username}, (err, doc) => {
      try{
        if(doc[0].username == username){
          try{
            Userpost.findOne({username : username, title : title}, (error, result) => {
              if (req.body.title != "" && req.body.title.length >= 1 && req.body.word != "" && req.body.word.length >= 1) {
                result.title = req.body.title;
                result.word = req.body.word;
                result.save();
                res.render('bodyedit', {
                  hata: '',
                  username : req.session.username,
                  doc : doc,
                  result : result,
                  title : result.title,
                  bariz : 0,
                  success : 'Successfully saved !',
                  word : result.word,
                  btoa: (string) => {
                    return new Buffer(string).toString('hex')
                  }
                });
              } else {
                res.render('bodyedit', {
                  hata: 'Please do not leave content blank !',
                  username : req.session.username,
                  doc : doc,
                  result : result,
                  title : result.title,
                  bariz : 1,
                  success : '',
                  word : result.word,
                  btoa: (string) => {
                    return new Buffer(string).toString('hex')
                  }
                });
              }
            });
          } catch(err){
            res.send('Content not found !');
          }
        } else {
          res.send('an error occured');
        }
      } catch (err) {
        res.send('User not found !');
      }
    });
  } else {
    res.send('please do not leave any fields blank !');
  }
});

app.get('/:username/:title/delete/:email', urlencodedParser, (req, res) => {
  var username = new Buffer(req.params.username, 'hex').toString('utf8');
  var title = new Buffer(req.params.title, 'hex').toString('utf8');
  if(username != "" && title != ""){
    if(req.session.username == username){
      try{
        User.find({ username : username }, (err, doc) => {
          if(doc[0].username == username){
            Userpost.findOne({ title : title }, (error, result) => {
              result.remove();
              res.redirect('/'+doc[0].username);
            });
          }
        });
      } catch (err){
        res.send('User not found !');
      }
    }
  } else {
    res.send('Fill everywhere !');
  }
});

app.get('/:username/:title', urlencodedParser, (req, res) => {
  var username = new Buffer(req.params.username, 'hex').toString('utf8');
  var title = new Buffer(req.params.title, 'hex').toString('utf8');
  User.find({ username : username }, (err, doc) => {
    try{
      if(doc[0].username == username){
        Userpost.find({ username : username, title : title }, (error, result) => {
          if(typeof result !== 'undefined' && result.length > 0){
            if(req.session.username){
              res.render('withsessbody', {
                username : req.session.username,
                other : username,
                result : result,
                title : title
              });
            } else {
              res.render('withoutsessbody', {
                username : req.session.username,
                other : username,
                result : result,
                title : title
              });
            }
          } else {
            res.send('Title not found');
          }
        });
      } else {
        res.send('an error occured');
      }
    } catch(err){
      res.send('User not found !');
    }
  });
});


app.post('/user/check/signup', urlencodedParser, (req, res) => {
  if (!req.session.username && !req.session.email) {
    User.find({
      username: req.body.username
    }, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        if (!data[0]) {
          if (validator.validate(req.body.email) && req.body.password != "" && req.body.username != "" && req.body.skills != "" && req.body.password.length >= 3 && req.body.username.length >= 3) {
            var newUser = User(req.body).save((err, result) => {
              if (err) throw err;
              req.session.username = req.body.username;
              req.session.email = req.body.email;
              req.session.skills = req.body.skills;
              setTimeout(() => {
                res.redirect('/#signup');
              }, 3000);
            });
          } else {
            res.render('index', {
              yanlis: '',
              emailyanlis: 'Please enter your email address correctly.',
              harfkucuk: "User name or password cannot be smaller than 3 letters.",
              hicbir: 'Fill everywhere.',
              recipes: 1
            });
          }
        } else {
          res.render('index', {
            yanlis: 'Such a user present !',
            emailyanlis: '',
            harfkucuk: '',
            recipes: 1
          });
        }
      }
    });
  } else {
    res.render('withoutregister', {
      username: req.session.username,
      email: req.session.email
    });
  }
});

app.get('/user/check/signup', urlencodedParser, (req, res) => {
  res.redirect('/#signup');
});

app.get('/user/check/signout', urlencodedParser, (req, res) => {
  if(req.session.username){
    req.session.destroy();
    res.redirect('/#signin');
  } else {
    res.redirect('/#signin');
  }
});

app.post('/user/check/userpanel', urlencodedParser, (req, res) => {
  User.findOne({
    username: req.session.username
  }, function(err, doc) {
    if (req.body.username != "" && req.body.username.length >= 5) {
      doc.username = req.body.username;
    }
    if (req.body.password != "" && req.body.password.length >= 5) {
      doc.password = req.body.password;
    }
    if (req.body.skills != "" && req.body.skills.length >= 1) {
      doc.skills = req.body.skills;
    }
    if (req.body.avatar != "" && req.body.avatar.length >= 4) {
      doc.avatar = req.body.avatar;
    } else {
      doc.avatar = 'img/profile.png';
    }
    if (req.body.location != "" && req.body.location.length >= 1) {
      doc.location = req.body.location;
    }
    if (req.body.facebook != "" && req.body.facebook.length >= 1) {
      if(req.body.facebook.startsWith('https://') || req.body.facebook.startsWith('http://')){
        doc.facebook = req.body.facebook;
      } else {
        doc.facebook = 'http://'+req.body.facebook;
      }
    }
    if (req.body.twitter != "" && req.body.twitter.length >= 1) {
      if(req.body.twitter.startsWith('https://') || req.body.twitter.startsWith('http://')){
        doc.twitter = req.body.twitter;
      } else {
        doc.twitter = 'http://'+req.body.twitter;
      }
    }
    if (req.body.linkedin != "" && req.body.linkedin.length >= 1) {
      if(req.body.linkedin.startsWith('https://') || req.body.linkedin.startsWith('http://')){
        doc.linkedin = req.body.linkedin;
      } else {
        doc.linkedin = 'http://'+req.body.linkedin;
      }
    }
    if (req.body.about != "" && req.body.about.length >= 1) {
      doc.about = req.body.about;
    }
    doc.save();
    res.redirect('/'+doc.username);
  });
});


app.post('/user/check/signin', urlencodedParser, (req, res) => {
  if (req.session.username || req.session.email) {
    res.redirect('/');
  } else {
    User.find({
      username: req.body.username,
      password: req.body.password
    }, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        if (data[0]) {
          req.session.username = req.body.username;
          req.session.email = req.body.email;
          setTimeout(() => {
            res.redirect('/#signin');
          }, 3000);
        } else {
          res.redirect('/#signin?error=1');
        }
      }
    });
  }
});

app.get('/user/check/blog', urlencodedParser, (req, res) => {
  if (req.session.username) {
    res.render('blog', {
      username: req.session.username,
      hata: '',
      success : '',
      bariz : 5
    });
  } else {
    res.redirect('/#signin');
  }
});

app.post('/user/check/blog', urlencodedParser, (req, res) => {
  User.findOne({
    username: req.session.username
  }, function(err, doc) {
    if (err) throw err;
    if(req.body.title != "" && req.body.word != ""){
      if (doc) {
        var newTodo = Userpost({ title : req.body.title, word : req.body.word, username : req.session.username}).save((err, data) => {
          if (err) throw err;
        });
        res.render('blog', {
          hata : '',
          bariz : 0,
          success : 'Successfully saved, Within 3 seconds you will be redirected to your profile.',
          username : req.session.username
        });
      }
    }
    else {
      res.render('blog', {
        hata: 'Please create a title and do not leave blog content blank.',
        bariz : 1,
        success : '',
        username : req.session.username
      });
    }
  });
});

app.listen(3000, () => {
  console.log('App listening on port ' + 3000);
});
