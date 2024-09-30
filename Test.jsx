const PORT = process.env.PORT || 4000;

const express = require('express');
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }))

const jwt = require('jsonwebtoken')

const cors = require('cors')
app.use(cors())



const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL)



const User = mongoose.model('User', {
    name: {
        type: String,

    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,

    },
})

const Comment = mongoose.model('Comment',{
   id:{
    type:Number
   },
  
    reviews:[{
        rating:{
            type:Number
        },
        comment:{
            type:String
        }
       }
    ]
       
   

  

});



app.get('/comments',async(req,res)=>{
    try {
        const comments = await Comment.find(); 
        res.json({ commentList: comments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})
app.post('/comment', async (req, res) => {
    try {
        let existingComment = await Comment.findOne({ id: req.body.id });

        if (existingComment) {
           
            existingComment.reviews.push(req.body.review);

            
            await existingComment.save();

            res.status(200).send('Review added successfully');
        } else {
            const newComment = new Comment({
                id:req.body.id,
                reviews: [req.body.review]

            })

            await newComment.save();
            res.status(201).send('New comment created successfully');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
});






app.post('/signup', async (req, res) => {
    let check = await User.findOne({ email: req.body.email });

    if (check) {
        return res.status(400).json({
            success: false,
            error: 'The email already exists',
            
        })
    }
   


    const user = new User(
        {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        }
    )

    const data = {
        user:{
            id:user.id,
        }
    }

    const token = jwt.sign(data,'secret_carrent')

   
    await user.save();
    res.status(201).json({ success: true,token, message: 'User created successfully',customer:user.name,
    customerEmail:user.email });


})

app.post('/login', async (req, res) => {
    let user = await User.findOne({ email: req.body.email });

    if (user) {
        const passcompare = req.body.password === user.password;

        if (passcompare) {

            const data={
                user:{
                    id:user.id
                }
            }

            const token = jwt.sign(data,'secret_carrent')
         
            res.json({
                success: true,
                token,
                message: 'successful',
                customer: user.name,
                customerEmail:user.email
                
            })
            
        }

        else {
            res.json({
                success: false,
                error: 'Wrong password'
            })
        }
    }

    else {
        res.json({
            success: false,
            error: "wrong email"
        })
    }
})


const Booking = mongoose.model('Booking', {

    customer:{
        type:String
    },

    customerEmail:{
        type:String
    },

    vehicle:{
        type:String
    },

   
    pickupdate: {
        type: Date
    },
    returndate: {
        type: Date
    },
    pickuplocation: {
        type: String
    },
    returnlocation: {
        type: String
    },


})

app.post('/booking', async (req, res) => {
    try {
        
        const booking = new Booking({
            customer:req.body.customer,
            customerEmail:req.body.customerEmail,
            vehicle:req.body.vehicle,
            
            pickupdate: req.body.pickupdate,
            returndate: req.body.returndate,
            pickuplocation: req.body.pickuplocation,
            returnlocation: req.body.returnlocation
        });

        await booking.save();




        res.status(201).json({ success: true, message: 'Booking created successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});



app.listen(PORT, () => {
    console.log('server running in PORT ' + PORT);
})