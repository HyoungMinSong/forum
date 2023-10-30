const express = require('express')
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const app = express()
app.use(express.urlencoded({ extended: true} ));
app.use(express.json());
const directory = 'uploads'; // 디렉토리 이름

// 디렉토리가 존재하지 않는 경우 생성
if (!fs.existsSync(directory)) {
  fs.mkdirSync(directory);
}



const storage = multer.diskStorage({ // 디스크 저장소 정의
  destination: function (req, file, cb) {
    cb(null, 'uploads') // cb 콜백 함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname); // 원본 파일 확장자 유지
    const originalFileNameWithoutExt = path.basename(file.originalname, fileExtension);
    cb(null, originalFileNameWithoutExt + '-' + uniqueSuffix + fileExtension); // cb 콜백 함수를 통해 전송된 파일 이름 설정
  }
});

const upload = multer({ storage: storage });


app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
})


app.get('/get', (req, res) => {
  console.log("get 요청 들어옴.")
  res.send('get test')
}) 


app.post('/post', (req, res) => {
  console.log("post 요청 들어옴.")
  res.send('post test')
}) 

app.post('/upload', upload.single('file'), function (req, res, next) {
  console.log("요청들어옴")
  // 'file'은 폼 필드의 이름
  console.log(req.file); // 업로드된 파일 정보
  console.log(req.body); // 폼 필드 데이터
  console.log("요청끝남")
  res.end();
});


// 다중 파일 업로드
app.post('/uploads', upload.array('files', 2), function (req, res, next) {
  console.log("다중파일요청들어옴")
  console.log(req.files); // photos 이름의 멀티 파일
  console.log("다중파일요청끝남")
  res.end();
});

app.get('/download/:fileName', (req, res) => {
  console.log("다운로드 요청들어옴")
  console.log(__dirname);
  const fileName = req.params.fileName;// 클라이언트가 다운로드할 때 보여질 파일명, 클라이언트가 요청한 파일명
  const filePath = path.join(__dirname, 'uploads', fileName); // 다운로드할 파일의 경로
  

  res.download(filePath, fileName, (err) => {
    if (err) {
      // 파일 다운로드 중 오류 발생 시 오류 처리
      console.error('파일 다운로드 오류:', err);
      res.status(404).send('파일을 찾을 수 없음');
    }
  });
});



app.post('/multiplepost', (req,res) => {
  const posts = req.body;
  console.log(posts);
  res.end();
})

app.post('/download-multiple',  (req, res) => {
  const downloads = req.body;
console.log(downloads)
  // 각 파일을 반복하여 다운로드
   downloads.forEach((fileInfo) => {
    const filePath = path.join(__dirname, 'uploads', fileInfo.path);
    const fileName = fileInfo.path;

     res.download(filePath, fileName, (err) => {
      if (err) {
        // 파일 다운로드 중 오류 발생 시 오류 처리
        console.error('파일 다운로드 오류:', err);
        res.status(404).send('파일을 찾을 수 없음');
      }
    });
    
  });
  res.end();
});


app.post('/downloadMultiple', (req, res) => {
  // Create a new ZIP archive
  const files = req.body;

  const archive = archiver('zip', {
    zlib: { level: 9 },
  });
  console.log(files)
    
    files.forEach((fileInfo) => {
      const filePath = path.join(__dirname, 'uploads', fileInfo.path);
      archive.file(filePath, { name: fileInfo.path });
    })
  // // Add files to the archive
  // archive.file('file1.txt', { name: 'file1.txt' });
  // archive.file('file2.txt', { name: 'file2.txt' });

  // Set the appropriate headers
  res.attachment('multipleFiles.zip');

  // Pipe the archive data to the response stream
  archive.pipe(res);

  // Finalize the archive
  archive.finalize();
});



// const { MongoClient } = require('mongodb')

// app.use(express.static(__dirname + '/public'));





// let db
// const url = 'mongodb+srv://admin:qwer1234@cluster0.l665qtf.mongodb.net/?retryWrites=true&w=majority'
// new MongoClient(url).connect().then((client)=>{
//   console.log('DB연결성공')
//   db = client.db('forum')
//   app.listen(8080, () => {
//     console.log('http://localhost:8080 에서 서버 실행중')
// })
// }).catch((err)=>{
//   console.log(err)
// })



// app.get('/main', (요청, 응답) => {
//     응답.sendFile(__dirname + '/main.html')
//   }) 

  // app.get('/list', async (요청, 응답) => {
  //   let result = await db.collection('post').find().toArray()
  //   응답.send(result[0].title)
  // })



