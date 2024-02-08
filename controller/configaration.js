const express = require ('express');
const router = express.Router();
const { Op } = require("sequelize");
const axios = require('axios');
const session = require('express-session');
const Redis = require('ioredis');
const redis = new Redis();
const financialconfig = require('../model/financialconfig');
const applicationconfig = require('../model/applicationConfig');
const { route } = require('./AdminController');


router.get('/financialconfig', async (req,res) => {
    try {
       // console.log("get financialconfig data");
        const finconfig = await financialconfig.findAll();
        
        res.status(200).json({message:'Fetching data successfully',finconfig});
    } catch(error) {
        //console.log(error);
        res.status(500).json({message:'An error occurred while fetching data'});
    }
});

router.put('/update-finconfig/:id', async (req, res) => {
    const id = req.params.id;
    const configdata = req.body;

    try {
        if (!id) {
            return res.status(400).json({ error: 'ID not found' });
        }

        // Find by id
        const data = await financialconfig.findOne({ where: { id } });

        // Update data
        if (data) {
           // console.log("finconfig data updated");
            await data.update(configdata);
            return res.status(200).json({ message: 'Data updated successfully' });
            
        } else {
            return res.status(404).json({ error: 'Data not found' });
        }
    } catch (error) {
        //console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/appconfig',async(req,res) =>{
    try{
        //console.log("get appconfig data");
        const appconfig = await applicationconfig.findAll();
        
        res.status(200).json({message:'Fetching data successfully',appconfig});
    } catch(error) {
        //console.log(error);
        res.status(500).json({message:'internal server error'});
    }
});

router.put('/update-appconfig/:id', async(req, res) =>{
    const id = req.params.id;
    const configdata = req.body;

    try{
        if(!id) {
            return res.status(400).json({error:'ID not found'});
        }
        // find by id
        const data = await applicationconfig.findOne({where:{id}});

        //updating
        if(data){
           // console.log("updating");
            await data.update(configdata);
            return res.status(200).json({message:'Data updated successfully'});
        } else {
            return res.status(404).json({ error:'Data not found'});
        }
    } catch(error) {
       // console.log(error);
        return res.status(500).json({error:'internal server error'});
    }
});


module.exports = router;