const express = require('express');
const app = express();
const mongoose = require('mongoose');
const userModel = require('./models/usermodel');
const foodModel = require('./models/foodModel');
const trackerModel = require('./models/trackerModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

app.use(express.json());
app.use(cors());
mongoose
  .connect('mongodb://localhost:27017/nutrifydb')
  .then(() => {
    console.log('db connected');
  })
  .catch((err) => {
    console.log(err);
  });

app.post('/register', (req, res) => {
  let userData = req.body;

  bcrypt.genSalt(10, (err, salt) => {
    if (!err) {
      bcrypt.hash(userData.password, salt, (err, phash) => {
        if (!err) {
          userData.password = phash;
          userModel
            .create(userData)
            .then((data) => {
              res.status(201).send({ message: 'registration success' });
            })
            .catch((err) => {
              res.status(500).send({ message: 'some problem' });
            });
        }
      });
    }
  });
});

app.post('/login', (req, res) => {
  let userData = req.body;

  userModel
    .findOne({ email: userData.email })
    .then((data) => {
      if (data != null) {
        bcrypt.compare(userData.password, data.password, (err, result) => {
          if (result == true) {
            jwt.sign({ email: userData.email }, 'sarodas', (err, token) => {
              if (!err) {
                res.send({
                  message: 'login success',
                  token: token,
                  userId: data._id,
                });
              }
            });
          } else {
            res.status(403).send({ message: 'password incorrect' });
          }
        });
      } else {
        res.status(404).send({ message: 'wrong email' });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: 'some problem' });
    });
});

app.get('/foods', verifyToken, (req, res) => {
  foodModel
    .find()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.get('/foods/:name', verifyToken, (req, res) => {
  foodModel
    .find({ name: { $regex: req.params.name, $options: 'i' } })
    .then((data) => {
      if (data.length !== 0) {
        res.send(data);
      } else {
        res.send({ message: 'found nothing' });
      }
    })
    .catch((err) => {
      res.send({ message: err });
    });
});

app.post('/track', verifyToken, (req, res) => {
  let trackData = req.body;

  trackerModel
    .create(trackData)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.get('/track/:id/:date', verifyToken, (req, res) => {
  let userId = req.params.id;
  let date = new Date(req.params.date);
  let strDate =
    date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
  console.log(strDate);

  trackerModel
    .find({ user: userId, eatenDate: strDate })
    .populate('user')
    .populate('food')
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

function verifyToken(req, res, next) {
  let token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, 'sarodas', (err, data) => {
    if (!err) {
      next();
    } else {
      res.send({ message: 'invalid token' });
    }
  });
}

app.listen(8000, () => {
  console.log('server connected');
});
