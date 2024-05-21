import app from './app.js'
import connectDB from './db/index.js'
import dotenv from 'dotenv'

dotenv.config({
    path : './env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log("server started at port number ", process.env.PORT || 8080)
    })
})
.catch((err) => {
    console.log("Mongodb connection error :- ", err)
})










// import express from 'express'

// const app = express()

// (
//     async () => {
//         try{
//             await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//             app.on('error', () => {
//                 console.log("application not able to talk to database")
//             })
//             app.listen(process.env.PORT, () =>{
//                 console.log("server started")
//             })
//         }
//         catch(error){
//             console.log(error)
//             throw error
//         }
//     }
// )()