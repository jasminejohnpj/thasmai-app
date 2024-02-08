const express = require('express');
const router = express.Router();
const { op } = require("sequelize");
const axios = require('axios');
const session = require('express-session');
const Redis = require('ioredis');
const redis = new Redis();
const supportcontact = require('../model/supportcontact');
const { route } = require('./AdminController');


router.get('/support',async(req,res) =>{
    try{
       // console.log('get support');
        const support = await supportcontact.findAll();
        res.status(200).json({message:'Fetching data successfully',support});

    } catch (error) {
        //console.log(error);
        res.status(500).json({message:'internal server error'});
    }
});

router.put('/update-support/:id', async (req, res) => {
    const id = req.params.id;
    const usersdata = req.body;

    try {
        if (!id) {
            return res.status(400).json({ error: 'Invalid request, missing ID' });
        }

        // Find the support contact by ID
        const data = await supportcontact.findOne({ where: { id } });

        if (data) {
            // Update the support contact data
            await data.update(usersdata);

            return res.status(200).json({ message: 'Data updated successfully' });
        } else {
            return res.status(404).json({ error: 'Support contact not found' });
        }
    } catch (error) {
        //console.error(error); 

        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});
module.exports = router;