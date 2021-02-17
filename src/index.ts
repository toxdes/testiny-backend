import express from "express";
import {PORT} from './config/constants';

const app = express();

app.get('/', (req, res) =>{
    res.send('Hello, world!');
});

app.listen(PORT, ()=>{
    console.log(`Server running at http://localhost:${PORT}`);
})