const mongoose = require("mongoose");

const bcrypt = require("bcrypt"); // 비밀번호 암호화
const saltRounds = 10; // 비밀번호 해싱에 사용될 salt 길이
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

//save 저장 되기 전에 실행되는 미들웨어
// 사용자가 비밀번호를 변경할 때마다 해당 비밀번호를 암호화한다.
userSchema.pre("save", function (next) {
  var user = this;

  //password 가 변경될때만 암호화해준다.
  if (user.isModified("password")) {
    //비밀번호를 암호화 시킨다.
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  //plainPassword 1234567  암호화된 비밀번호 $2b$10$RzvTp90gHwRHPaT1AzbzCOAgCiK6laWccCYELWtTnA8bmhE8CvavK 같은지 체크해야함
  //1234567 도 암호화를 한다음에 암호화된 비밀번호랑 맞는지 체크해야해. 암호화된 비밀번호를 다시 1234567 plainPassword로 바꿀수는 없다
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err), cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  var user = this;
  //jsonwebtoken 을 이용해서 token 을 생성하기
  var token = jwt.sign(user._id.toHexString(), "secretToken");

  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
