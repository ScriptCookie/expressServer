var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var app = express();
const cors = require('cors');
const options = {useUnifiedTopology: true};
var db;

var url = "mongodb://localhost:27017/testdb"

app.use(cors());

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended : true}))

MongoClient.connect(url, options, function(err, dataBase) {
    if(err) {
        console.log("연결실패");
        return
    } else{
        console.log("연결성공")
    }
    db = dataBase;
})

const list = [];
const login = [];
const sub = [];
var subjectArr;
var successSubData;
var resUrls;
var subjectData;
var subDatas;

app.get('/', function(req, res) {
    res.send("dd")
})

app.get('/api/subjectss', function(req, res) {
    res.json(resUrls);
})

app.post('/api/subjectss', function(req, res) {
    const {resUrl} = req.body
    console.log('받아온 URL' , resUrl);
    resUrls = resUrl;
})

app.get('/api/name', function(req, res) {
    res.json(successSubData); // 그럼 여기서 받아가지고 쓰는건 어떤가 클라이언트 뷰어 컴포넌트에서.
})

app.get('/api/subjects', function(req, res) {
    //res.json(successSubData); // 이 과목 이름 데이터를 클라이언트로 보내서 어느 과목의 PDF인지 구분지어보자.
                            // 아래에 다른 res.json 이 있기 때문에 다른곳에 쓰던 다른 방법 구색.
    var table = db.db("testdb");

    table.collection("Ccollection").find().toArray(function(err, docs) {
        for(var i = 0 ; i < docs.length ; i++) {
            console.log(docs[i]._id)
            
            if(successSubData === docs[i].subjects) {
                subjectArr = docs[i]._id;
                res.json(subjectArr);
            }
        }
    })
})

app.post('/api/subjects', function(req, res) {
    const {selectSub} = req.body;
    successSubData = selectSub;
    console.log('success', successSubData);
})
//--------------------------------------------------- 과목 별 페이지에서 데이터를 보여주려한 부분---------------------------------
// app.get('/api/subjectdata', function(req, res) {
//     var table = db.db("testdb");

//     table.collection("Ccollection").find().toArray(function(err, docs) {
//         for(var i = 0 ; i < docs.length ; i++) {
            
//             if(subjectData === docs[i].subjects) {
//                 subDatas = (docs[i])
//                 console.log('전달해야할 데이터', subDatas);
//             }
//         }
//     })
//         res.json(subDatas);
// })


// app.post('/api/subjectdata', function(req, res) {
//     const {selectSubs} = req.body;
//     subjectData = selectSubs
// })
//----------------------------------------------------------------------------------------------------------------------------

// -------------------------------------------------subject-------------------------------------------------------
app.get('/api/subject', function(req, res) {
    res.json(sub);

    var table = db.db("testdb");
    table.collection("Ccollection").find().toArray(function(err, docs) {
        sub.push(docs);
    })
    if(sub !== null) {
        sub.pop();
    }
})

app.post('/api/subject', function(req, res) {
    const {subject , explain , id} = req.body;

    var datas = ([{id : id, subjects : subject, explains : explain}]);
    var table = db.db("testdb");

    table.collection("Ccollection").insertMany(datas, function(err, res) {
        if(err) throw err;
        console.log("docunemt inserted");
    })
})

//------------------------------------------------list-------------------------------------------------
app.get('/api/list', function(req, res) {
    res.json(list)

    var table = db.db("testdb");
    table.collection("hz_member").find().toArray(function(err, docs) {
        list.push(docs);
        //db.close();
    })
})

app.post('/api/list', function(req, res) {
    const { data , subjectName } = req.body;
    //list.push(data)

    var datas = {data : data , subjectName : subjectName};

    var table = db.db("testdb");
    table.collection("hz_member").insertOne(datas, function(err, res) {
        if(err) throw err;
        console.log("docunemt inserted");
    })
    return res.send('success');
})
//-------------------------------------------------------------------------------------------------------
//----------------------------------------------login-----------------------------------------------------------
app.get('/api/login', function(req, res) {
    res.json(login);

    var table = db.db("testdb");
    table.collection("login_data").find().toArray(function(err, docs) {
        login.push(docs);
        //db.close();
    })
    if(login !== null) {
        login.pop();
    }
})

app.post('/api/login', function(req, res) {
    const {email , password , name} = req.body;

    var datas = {email : email, password : password, name : name};
    var table = db.db("testdb");

    table.collection("login_data").insertOne(datas, function(err, res) {
        if(err) throw err;
        console.log("docunemt inserted");
    })
    return res.send('success');
})
// ----------------------------------------------- 학생 데이터 비교 -----------------------------------------------------------
let studentData;
const selSubject = [];

app.get('/api/comparelogin', function(req, res) {
    res.json([studentData, selSubject]);

})

app.post('/api/comparelogin', function(req, res) {
    const {id, name} = req.body;

    console.log('받아온 url', resUrls); // 이제 이 받아온 주소를 가지고 과목 컬렉션과 비교해서 해당 과목의 컬렉션을 가져와 comparelogin에 뿌려주자 !!!!!!

    var table = db.db('testdb');

    table.collection("Ccollection").find().toArray(function(err, docs) {
            for(var j = 0 ; j < docs.length ; j++) {
                if(successSubData === docs[j].subjects) {
                    selSubject.push(docs[j].subjects)
                }
            }
    })

    var studentDatas = {name : name, selSubject : selSubject};

    table.collection("login_data").find().toArray(function(err, docs) {

        for(var i = 0 ; i < docs.length ; i++) {
            if(id === docs[i].email || name === docs[i].name) {
                console.log(docs[i].name);
                studentData = docs[i].name;
            }
        }
        // 여기서 뽑아온 학생이름을 새로운 컬렉션에 넣고 해당 과목의 데이터도 넣을수 있도록
        // 위의 find 처럼 해당 과목의 _id번호도 비교해서 저장하고 위에 이름을 불러온것 처럼 해당 _id를 가진 과목의 정보도 뿌릴수있도록. 
    })

    table.collection("Student_Datas").insertOne(studentDatas, function(err, res) {
        if(err) throw err;
        console.log("docunemt inserted");
    })
    
})

let subName;
//let subName2;
//const subectNames2 = [];
let subectNames;

app.get('/api/compareData', function(req, res) {
    res.json([subName, subectNames]);

    var table = db.db('testdb');

    table.collection("Student_Datas").find().toArray(function(err, docs) {

        for(var i = 0 ; i < docs.length ; i++) {
            console.log('저장된 이름', docs[i].name);
            if(studentData === docs[i].name) {
                console.log('비교된 이름', docs[i].name)
                subName = docs[i].name;
                subectNames = (docs[i].selSubject);
            }
        }
        //subName2 = subName;
        //subectNames2.push(subectNames);
    })
})
//-------------------------------------------------------------------------------------------------------

const projectDatas = [];
let projectList;
let hi;
var filter;

app.get('/subjectproject', function(req, res) {
    res.json(projectList);

    var table = db.db('testdb');
    // table.collection("Subject_quest").find().toArray(function(err, docs) {
    //     //projectDatas = docs;
    //     for(var i = 0 ; i < docs.length ; i++) {
    //         if(successSubData === docs[i].subName) {
    //             hi = docs[i];
    //         }
    //     }
    //     //console.log('d', hi.subName)
    //     if(successSubData === hi.subName) {
    //         projectDatas.push(hi);
    //     }
    //     projectDatas.push(hi);
    //     //console.log('삭제전', projectDatas);
    //     filter = projectDatas.filter(function(data) {
    //         return data.subName === successSubData;
    //     })
    //     console.log('삭제후', filter);
    // })


    table.collection("Ccollection").find().toArray(function(err, docs) {
        
            //console.log('가져온 데이터', docs[0].explains);

            for(var i = 0 ; i < docs.length ; i++) {
                if(successSubData === docs[i].subjects) { // 어느 과목을 선택했는지 구분시켜줌.
                    //console.log('이거', docs[i].explains)
                    projectList = docs[i].explains;
                }
            }
            //console.log('저장된 것들', projectList)
    })
})

app.post('/subjectproject', function(req, res) {
    const {name , day, place} = req.body;

    var subjectDatas = {subName : successSubData , name : name , day : day , place : place};

    var table = db.db('testdb');
    table.collection("Subject_quest").insertOne(subjectDatas , function(err, res) {
        if(err) throw err;
        console.log('과제란 데이터가 저장되었습니다.')
    })

    table.collection("Subject_quest").find().toArray(function(err, docs) {

        for(var i = 0 ; i < docs.length ; i++) {
            if(successSubData === docs[i].subName) {
                hi = docs[i];
            }
        }
        console.log('결과', hi);

        if(successSubData === hi.subName) {
            projectDatas.push(hi);
        }
        //projectDatas.push(hi);
        //console.log('삭제전', projectDatas);
        filter = projectDatas.filter(function(data) {
            return data.subName === successSubData;
        })
        console.log('삭제후', filter);
    })
    
    var queryName = { subjects : successSubData}; // 선택한 리스트 이름에 따라서
    var newvalues = { $set : {explains : filter}} // 해당 리스트의 속성을 바꾸어준다.

    table.collection("Ccollection").updateOne(queryName, newvalues, function(err, res) {
        if(err) throw err;
        console.log('수정이 되었습니다.')
    })

    //console.log('gmd', subjectDatas.subName);
})

app.listen(8000 , (req, res) => {
    console.log('server start');
});