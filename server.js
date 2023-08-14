const express=require('express');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const app=express();

const server=app.listen(3000, ()=>{
    console.log("Listening on Port 3000");
})

const io=require('socket.io')(server);


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+'/public/'))

let socketsConnected = new Set();

io.on('connection', (socket)=>{
  socketsConnected.add(socket.id)
  console.log(socketsConnected);

  io.emit('total_clients', socketsConnected.size);

  socket.on('disconnect', ()=>{
    socketsConnected.delete(socket.id);
    console.log(socketsConnected);

    io.emit('total_clients', socketsConnected.size);
  });

  socket.on('client_message', (data)=>{
    console.log(data);
    socket.broadcast.emit('chat_message', data);
  })

  socket.on('typing_feedback', (message)=>{
    socket.broadcast.emit('feedback', message);
  })
});

app.get("/", (req, res)=>{
    console.log("Get Request")
    res.redirect('/register');
})

app.get('/register', (req, res)=>{
    res.render(__dirname+"/public/register.ejs");
})


app.post('/register', (req, res)=>{
    const fullName=req.body.firstNameInput+" "+req.body.lastNameInput;
    const emailInput=req.body.emailInput;
    const pwdInput=req.body.passwordInput;
    const genderInput=req.body.genderInput;
    
    const url='mongodb://127.0.0.1:27017/chatAppUsers';
    mongoose.connect(url);
    
    const schema=new mongoose.Schema({
        name: {
            type: String,
            required: [true, 'Please Mention Your Name']
        },
        email: {
            type: String,
            required: [true, 'Please Mention Your Email'],
            unique: true
        },
        password: {
            type: String,
            required: [true, 'Please Mention Your Email']
        },
        gender: {
            type: String,
            required: [true, 'Please Mention Your Gender']
        }
    });

    const model=mongoose.models.users || mongoose.model('users', schema);
    
    const doc=new model({
        name: fullName,
        email: emailInput,
        password: pwdInput,
        gender: genderInput
    });
    
    doc.save().then(()=>{
        res.render(__dirname+'/public/login.ejs')
    }).catch((err)=>{
        res.render(__dirname+"/public/register.ejs", {
            existing: "User Already Exists"
        });
    })
    
    // res.send("Response Saved In Database");
})

app.get('/login', (req, res)=>{
    res.render(__dirname+'/public/login.ejs');
})

app.post('/login', (req, res)=>{
    const emailInput=req.body.emailInput;
    const pwdInput=req.body.passwordInput;
    
    const url='mongodb://127.0.0.1:27017/chatAppUsers';
    mongoose.connect(url);

    const schema=new mongoose.Schema({
        name: {
            type: String,
            required: [true, 'Please Mention Your Name']
        },
        email: {
            type: String,
            required: [true, 'Please Mention Your Email'],
            unique: true
        },
        password: {
            type: String,
            required: [true, 'Please Mention Your Email']
        },
        gender: {
            type: String,
            required: [true, 'Please Mention Your Gender']
        }
    });

    const model=mongoose.models.users || mongoose.model('users', schema);

    const result=findUser(model, emailInput, pwdInput);

    result.then((result)=>{
        if(result==true) {
            res.sendFile(__dirname+"/public/chat.html");
        }else{
            res.render(__dirname+'/public/login.ejs', {
                incorrectPassword: "Incorrect Credentials. Please Login Again."
            })
        }
    })
})

async function findUser(model, emailInput, pwdInput) {
    let users=await model.find({email: {$eq: emailInput}, password: {$eq: pwdInput}}, {});

    console.log(users);

    for(let i of users) {
        if(i.email==emailInput && i.password==pwdInput) {
            console.log('Email and Password Combination Found')
            return true;
        }
    }

    console.log("Combination Not Found");

    return false;
}