const express = require ('express');
const router = express.Router();
const { Op } = require("sequelize");
const axios = require('axios');
const session = require('express-session');
const Redis = require('ioredis');
const redis = new Redis();
const financialconfig = require('../model/financialConfig');
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



/**
 * @swagger
 * components:
 *   schemas:
 *     UserUpdate:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         DOB:
 *           type: string
 *         gender:
 *           type: string
 *         email:
 *           type: string
 *         address:
 *           type: string
 *         pincode:
 *           type: integer
 *         state:
 *           type: string
 *         district:
 *           type: string
 *         country:
 *           type: string
 *         phone:
 *           type: string
 *         reference :
 *           type: string
 *         languages:
 *           type: string
 *         remark:
 *           type: string
 *         verify:
 *           type: string
 *         userId :
 *           type: integer
 *         DOJ:
 *           type: string 
 *         password:
 *           type: string
 *         classAttended:
 *           type: string
 *         createdAt :
 *           type: string
 *         updatedAt:
 *           type: string
 *     BankDetails:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         AadarNo:
 *           type: string
 *         IFSCCode:
 *           type: string
 *         branchName:
 *           type: string
 *         accountName:
 *           type: string
 *         accountNo:
 *           type: string
 *         createdAt :
 *           type: string
 *         updatedAt:
 *           type: string
 *         regId:
 *           type: integer
 */



/**
 * @swagger
 * /User/requestPasswordReset:
 *   post:
 *     summary: Used to reset the password
 *     description: Used to reset the password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *                 example: user@example.com
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */



/**
 * @swagger
 * /User/resetPassword:
 *   post:
 *     summary: To verify the OTP
 *     description: To verify the OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *               new_password:
 *                 type: string 
 *             required:
 *               - email
 *               - otp
 *               - new_password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */



 /**
 * @swagger
 * /User/login:
 *   post:
 *     summary: User login API
 *     description: User login API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Incorrect password!
 *       404:
 *         description: Invalid email!
 *       500:
 *         description: Internal Server Error
 */



 /**
 * @swagger
 * /User/updateUser:
 *   put:
 *     summary: Update User
 *     description: Update user details and associated bank details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *           properties:
 *            first_name:
 *              type: string
 *            last_name:
 *              type: string
 *            DOB:
 *              type: string
 *            gender:
 *              type: string
 *            email:
 *              type: string
 *            address:
 *              type: string
 *            pincode:
 *              type: integer
 *            state:
 *              type: string
 *            district:
 *              type: string
 *            country:
 *              type: string
 *            phone:
 *              type: string
 *            reference :
 *              type: string
 *            languages:
 *              type: string
 *            remark:
 *              type: string
 *            verify:
 *              type: string
 *            userId :
 *              type: integer
 *            DOJ:
 *              type: string 
 *     responses:
 *       200:
 *         description: User and bank details updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
 



 /**
 * @swagger
 * /User/reference/{UId}:
 *   get:
 *     summary: Get Referrer person by userId 
 *     parameters:
 *       - in: path
 *         name: UId
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               full_name: John Doe
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               message: User not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal Server Error
 */




 /**
 * @swagger
 * /User/list-questions:
 *   get:
 *     summary: Get a list of questions from the database
 *     description: Retrieve all questions from the database
 *     responses:
 *       200:
 *         description: A JSON array of questions
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 text: "What is your name?"
 *               - id: 2
 *                 text: "How are you?"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal Server Error
 */




 /**
 * @swagger
 * /User/user-details/{userId}:
 *   get:
 *     summary: Get the personal information about the user
 *     description: Get the personal information about the user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A JSON array of information
 *         content:
 *           application/json:
 *             examples:
 *               example1:
 *                 value:
 *                   full_name: john doe
 *                   phone: 9876543210
 *                   email: abc@gmail.com
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             examples:
 *               example2:
 *                 value:
 *                   message: User not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             examples:
 *               example3:
 *                 value:
 *                   message: Internal Server Error
 */



 /**
 * @swagger
 * /User/delete-user/{phone}:
 *   delete:
 *     summary: To delete the user from the database
 *     description: To delete the user from the database
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         description: The phone number of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */



 /**
 * @swagger
 * /User/meditation:
 *   post:
 *     summary: Used to insert meditation details into the database
 *     description: Used to insert meditation details into the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startdatetime:
 *                 type: string
 *               stopdatetime:
 *                 type: string
 *             required:
 *               - startdatetime
 *               - stopdatetime
 *     responses:
 *       200:
 *         description: Meditation time updated successfully
 *       500:
 *         description: Internal Server Error
 */



 /**
 * @swagger
 * /User/messages:
 *   post:
 *     summary: Used to send the message 
 *     description: Used to send the message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                messageTime:
 *                  type: string  
 *                message_priority:
 *                  type: string      
 *     responses:
 *       200:
 *         description: Message created successfully
 *       500:
 *         description: Internal Server Error
 */



 /**
 * @swagger
 * /User/appointment:
 *   post:
 *     summary: Place an appointment request
 *     description: Place an appointment request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointmentDate:
 *                 type: string
 *               num_of_people:
 *                 type: integer
 *               pickup:
 *                 type: boolean
 *               room:
 *                 type: string
 *               from:
 *                 type: string
 *               emergencyNumber:
 *                 type: string
 *               appointment_time:
 *                 type: string
 *               appointment_reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment has been allocated successfully! We will notify guruji soon
 *       500:
 *         description: Internal Server Error
 */



 /**
 * @swagger
 * /User/user-details:
 *   get:
 *     summary: Get the information about the user display in profile card
 *     description: Get the home page user information 
 *     responses:
 *       200:
 *         description: A JSON object with user details
 *         content:
 *           application/json:
 *             example:
 *               first_name: John
 *               last_name: Doe
 *               userId: 123
 *               DOJ: '2022-01-01'
 *               expiredDate: '2022-12-31'
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             example:
 *               error: User not authenticated
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               error: User not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: Internal Server Error
 */



 /**
 * @swagger
 * /User/meditation-detail:
 *   get:
 *     summary: Show the meditated details in that day
 *     description: Show the meditated details in that day
 *     responses:
 *       200:
 *         description: A JSON object with messages
 *         content:
 *           application/json:
 *             example:
 *               UId: 1
 *               med_starttime: "2023-12-19 14:06:49"
 *               med_stoptime: "2023-12-19 14:56:49"
 *               med_endtime: "2023-12-19 14:51:49"
 *               session_num: 1
 *               day: [0, 8]
 *               cycle: 0
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             example:
 *               error: "User not authenticated"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               error: "User not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: "Internal Server Error"
 */



 /**
 * @swagger
 * /User/get-messages:
 *   get:
 *     summary: To display messages in user app
 *     description: To display messages in user app
 *     responses:
 *       200:
 *         description: A JSON object with messages
 *         content:
 *           application/json:
 *             example:
 *               UsedId : 11
 *               message : am feel relaxing 
 *               messageTime: 7.02 A.M 
 *       404:
 *         description: Messages not found for the user
 *         content:
 *           application/json:
 *             example:
 *               error: Messages not found for the user
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: Internal Server Error
 */


 /**
 * @swagger
 * /User/meditation-date:
 *   get:
 *     summary: Show the meditated details of current  user
 *     description: Show the meditated details of current user
 *     responses:
 *       200:
 *         description: A JSON object with messages
 *         content:
 *           application/json:
 *             example:
 *               UserId: 11
 *               med_starttime: "6.00 A.M"
 *               timeEstimate: 45
 *               isMeditated: 1
 *       404:
 *         description: No records found with timeEstimate >= 90
 *         content:
 *           application/json:
 *             example:
 *               error: No records found with timeEstimate >= 90
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: Internal Server Error
 */  



 /**
 * @swagger
 * /User/getBankDetails/{UId}:
 *   get:
 *     summary: To get the bank details by using ID
 *     description: To get the bank details by using ID
 *     parameters:
 *       - in: path
 *         name: UId
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A JSON object with messages
 *         content:
 *           application/json:
 *             example:
 *               Id: 11
 *               AadarNo: "6878999087"
 *               IFSCCode: "abc677"
 *               branchName: "dfghj"
 *               accountName: "dfghjk"  # Corrected line
 *               accountNo: "4567890" 
 *       404:
 *         description: No records found with timeEstimate >= 90
 *         content:
 *           application/json:
 *             example:
 *               error: No records found with timeEstimate >= 90
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: Internal Server Error
 */



 /**
 * @swagger
 * /list-appointment:
 *   get:
 *     summary: Get a list of appointments
 *     description: Get a list of appointments based on the provided phone number.
 *     parameters:
 *       - in: query
 *         name: phone
 *         required: true
 *         description: The phone number to filter appointments.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched appointments
 *         content:
 *           application/json:
 *             example:
 *               message: Fetching appointments
 *               list:
 *                 - Id: 11
 *                   UId: "1"
 *                   phone: "76879890"
 *                   appointmentDate: "20-04-2023"
 *                   num_of_people: 2
 *                   pickup: "true" 
 *                   from: "airport"
 *                   room: "1"
 *                   emergencyNumber: "76879890"
 *                   appointment_time : "2:00:00"
 *                   appointment_reason : "visit"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal Server Error
 */



 