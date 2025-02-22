import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import connectDB  from './config/connectDb';
import corsOption from './config/corsConfig';
import userRoutes from './routes/userRoutes'
import { errorHandler } from './middlewares/errorHandler';
import bodyParser from 'body-parser';

dotenv.config();

const app = express()

app.use(cors(corsOption));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../../Frontend/dist')));
// app.use(express.json());
// app.use(express.urlencoded({extended:true}));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(cookieParser());
// app.use(bodyParser.json({limit: '100mb'}));
// app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));

app.use('/api/user',userRoutes);
app.use(errorHandler)

const PORT = process.env.PORT || 3000
connectDB()
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server running on PORT: ${PORT}`);
    })
})
.catch((error)=>{
    console.error(`Database connection failed`,error)
    process.exit(1)
})