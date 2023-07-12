const express = require("express"); //express 모듈 가져오기
const app = express();
const port = 5000; // 포트 설정
const bodyParser = require("body-parser"); //body-parser 설정
const cookieParser = require("cookie-parser");
// User.js 에서 설정한 스키마 & 모델 가져오기
const { User } = require("./models/User");

const config = require("./config/key");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require("mongoose");
const uri = config.mongoURI;
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDb Connected"))
  .catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("안녕하세요~ 새해복많이 받으세요");
});

app.post("/register", async (req, res) => {
  try {
    // 회원가입 할 때 필요한 정보들을 클라이언트에서 가져옵니다.
    // User 모델을 사용하여 새로운 사용자 인스턴스를 생성합니다.
    const user = new User(req.body);

    // 사용자 정보를 데이터베이스에 저장합니다. save는 몽고DB 메서드
    await user.save();

    // 성공했을 경우 success:true 로 응답
    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    // 1. 요청된 이메일을 데이터베이스에서 찾기
    const user = await User.findOne({ email: req.body.email }).exec();

    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다",
      });
    }

    // 2. 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는지 확인
    const isMatch = await user.comparePassword(req.body.password);

    if (!isMatch) {
      return res.json({
        loginSuccess: false,
        message: "비밀번호가 틀렸습니다.",
      });
    }

    // 3. 비밀번호까지 맞다면 토큰을 생성하기
    const token = await user.generateToken();

    // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지 등
    res
      .cookie("x_auth", token)
      .status(200)
      .json({ loginSuccess: true, userId: user._id });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
