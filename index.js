const express = require("express"); //express 모듈 가져오기
const app = express();
const port = 5000; // 포트 설정
const bodyParser = require("body-parser"); //body-parser 설정
// User.js 에서 설정한 스키마 & 모델 가져오기
const { User } = require("./models/User");

const config = require("./config/key");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

    // 사용자 정보를 데이터베이스에 저장합니다.
    await user.save();

    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
