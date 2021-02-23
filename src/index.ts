import express from "express";
import {PORT} from './config/constants';
import {PrismaClient} from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.get('/', (req, res) =>{
    okay(async () =>{
        await prisma.user.create({
            data:{
                username:'alice_wonderland',
                email:'alice_from_wonderland@prisma.io',
                password:'bruh',
                profile:{
                    create:{name:'Alison Wonderland', bio:'I dont like turtles?'},
                },
            },
        });
        const allUsers = await prisma.user.findMany({
            include:{
                profile:true,
            }
        });
        res.send(JSON.stringify(allUsers));
    });
});

app.listen(PORT, ()=>{
    console.log(`Server running at http://localhost:${PORT}`);
})

let okay = (f) => {
    f().catch(e => {throw e;}).finally(async () =>{
        await prisma.$disconnect();
    })
}