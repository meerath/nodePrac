
let express=require('express')
let app= express()
let dotenv= require('dotenv')
dotenv.config()
let mongo=require('mongodb')
let mongoClient= mongo.MongoClient;
let MongoUrl= process.env.MongoUrl
let client= new mongoClient(MongoUrl)
let db
let bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
let cors= require('cors');
app.use(cors());
client.connect().then(async(result)=>{
    db=await client.db("foodie");
    console.log("success and connected")
}).catch((err)=>{
    console.log(err)
})

let port=process.env.PORT || 3400
app.get('/',(req,res)=>{
    res.send('hello from node js')
})
 
app.get('/foodList',async (req,res)=>{
    let query={};
    let menuId= +req.query.menuId;
    if(menuId){
        query={menu_id:menuId}
    }
    let foodlist=await db.collection('RestaurantMenu').find(query).toArray();
    res.send(foodlist)
})

app.get('/locations',async (req,res)=>{
    let locations=await db.collection('Locations').find().toArray();
    res.send(locations)
})
app.get('/restaurantMenu/:id',async (req,res)=>{
    let query={};
    console.log(req.params)
    let restaurantId=+req.params.id;
    if(restaurantId){
        query={restaurant_id:restaurantId}
    }
    let restaurantMenu=await db.collection('RestaurantMenu').find(query).toArray();
    res.send(restaurantMenu)
})

app.get('/filter/:mealId',async (req,res)=>{
    let query={}
    let mealId = +req.params.mealId;
    let cuisineId= +req.query.cuisineId;
    let lcost=+req.query.lcost;
    let sort=+req.query.sort
    let hcost= +req.query.hcost;
    if(cuisineId){
        query={
            "mealTypes.mealtype_id":mealId,
            "cuisines.cuisine_id":cuisineId
        }
    }
    else if(lcost && hcost ){
        query={
            "mealTypes.mealtype_id":mealId,
            $and:[{cost:{$gt:lcost, $lt:hcost}}]
        }

    }
    let restaurants=await db.collection('RestaurantsData').find(query).sort({cost:sort}).toArray();
    res.send(restaurants)
})
app.get('/details/:resId', async(req,res)=>{
    console.log(req.params.resId)
    let resId=+req.params.resId
    let query={}
    if(resId){
        query={restaurant_id:resId}
    }
    let details= await db.collection('RestaurantsData').find(query).toArray();
    res.send(details)
})

app.get('/restaurants',async (req,res)=>{
    let query={};
    let stateId=+req.query.stateId;
    let mealId=+req.query.mealId;
    if(stateId){
        query={state_id:stateId}
    }else if(mealId){
        query={"mealTypes.mealtype_id":mealId}
    }
    let restaurants=await db.collection('RestaurantsData').find(query).toArray();
    res.send(restaurants)
    })
    app.get('/meals',async (req,res)=>{
    let meals=await db.collection('Mealtypes').find().toArray();
    res.send(meals)
})

 app.post('/placeOrder', async(req,res)=>{
    // console.log(res)
    res.send(req.body)
 })

// app.post('/placeOrder', async(res,req)=>{
//     console.log('post call for place order');
//     const order = req.body;
//     console.log(order)
//     res.send('post call')
//  })

app.listen(port,()=>{
    console.log(`runs on ${port}`)
})