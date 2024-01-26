const express = require ('express');
const router = express.Router();
const { Op } = require("sequelize");
const axios = require('axios');
const session = require('express-session');
const Redis = require('ioredis');
const redis = new Redis();



router.get('/appconfig', async (req,res))