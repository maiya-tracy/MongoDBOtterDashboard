var express = require("express");

var path = require("path");
var session = require('express-session');

var app = express();
var bodyParser = require('body-parser');
const server = app.listen(1337);
const io = require('socket.io')(server);

app.use(session({
  secret: 'keyboardkitteh',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60000
  }
}))

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Otter');

const flash = require('express-flash');
app.use(flash());

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json({
  limit: '5mb'
}));

app.use(express.static(path.join(__dirname, "./static")));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');


var OtterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2
  },
  age: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
})
mongoose.model('Otter', OtterSchema);
var Otter = mongoose.model('Otter');


app.get('/', (req, res) => {
  Otter.find({}, (err, otters) => {
    if (err) {
      console.log("We have an error!", err);
      res.render("index")
    } else {
      // console.log(otters)
      res.render("index", {otters: otters});
    }
  });
});
app.get('/otter/new', (req, res) => {
  res.render("new_otter");
})
app.get('/otter/:id', (req, res) => {
  Otter.findById(req.params.id, (err, current_otter) =>{
    if (err) {
      console.log("error finding otter")
      res.render("index")
    }
    else {
      // console.log(current_otter)
      res.render("show_otter", {otter: current_otter});
    }
  })
})

app.get('/otter/edit/:id', (req, res) => {
  Otter.findById(req.params.id, (err, current_otter) =>{
    if (err) {
      console.log("error finding otter")
      res.render("index")
    }
    else {
      // console.log(current_otter)
      res.render("edit_otter", {otter: current_otter});
    }
  })
})


app.post('/otter', (req, res) => {
  var otter = new Otter({
    name: req.body.name,
    age: req.body.age
  });
  otter.save(function(err) {
    if (err) {
      console.log("We have an error!", err);
      for (var key in err.errors) {
        req.flash('ottererrors', err.errors[key].message);
      }
      res.redirect('/otter/new');
    } else {
      res.redirect("/");
    }
  });
})
app.post('/otter/edit/:id', (req, res) => {
  var id = req.params.id;
  var current_otter = {name: req.body.name, age: req.body.age, updateDate: Date.now()};
  Otter.findByIdAndUpdate(id, current_otter, {runValidators: true, new: true}, (err, otter) => {
    if (err) {
      console.log("We have an error!", err);
      for (var key in err.errors) {
        req.flash('ottererrors', err.errors[key].message);
      }
      res.redirect('/otter/edit/'+id);
    } else {
      res.redirect('/')
    }
  })
})
app.get('/otter/destroy/:id', (req, res) => {
  Otter.remove({_id: req.params.id}, (err) =>{
    if (err) {
      console.log("error finding otter")
      res.redirect("/")
    }
    else {
      res.redirect("/");
    }
  })
})

app.get('*', function(request, response){
	response.send("404")
});
