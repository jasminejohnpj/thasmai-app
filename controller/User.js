const express = require('express');
const {reg} = require('../model/registration');
const BankDetails =require('../model/bankdetails');
const router = express.Router();
const { Op, where } = require("sequelize");
const axios = require('axios');
const Country =require('../model/country');
const session = require('express-session');
const Redis = require('ioredis');
const redis = new Redis();
const questions =require("../model/question");
const {Users,sequelize} = require('../model/validUsers');
const Meditation =require('../model/meditation');
const moment = require('moment');
const bcrypt = require('bcrypt');
const timeTracking = require('../model/timeTracking');
const Messages = require('../model/message');
const appointment = require("../model/appointment");
const nodemailer = require('nodemailer');
const meditation = require('../model/meditation');
const message = require('../model/message');

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

router.post('/countries', async (req, res) => {
    const data = req.body; // Assuming req.body is an array of objects

    if (Array.isArray(data)) {
        try {
            // Use Sequelize to bulk create the data in the database
            await Country.bulkCreate(data);

            res.status(200).send({ message: "Countries added to the database successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "An error occurred while adding countries to the database" });
        }
    } else {
        res.status(400).send({ message: "Invalid data format. Please send an array of objects." });
    }
});

router.get('/countrieslist', async (req, res) => {
    try {
      const countries = await Country.findAll({
        order: [['name', 'ASC']], // Order by the 'name' field in ascending order
      });
  
      res.json(countries);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'An error occurred while fetching countries' });
    }
  });

router.post('/registerUser', async (req, res) => {
    const { email, phone } = req.body;

    try {
        const existingUser = await reg.findOne({
            where: {
                [Op.or]: [
                    { email: email },
                    { phone: phone }
                ]
            }
        });

        if (existingUser) {

            if (existingUser.email === email) {
                return res.status(400).json({ message: "Email already exists" , status:'false',flag :'email'});
            } else {
                return res.status(400).json({ message: "Phone number already exists",status:'false',flag :'phone' });
            }
        } 
        else{
            return res.status(200).json({ message: "OTP sent successfully" });
        }
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

function generateOTP() {
    // Generate a random 4-digit OTP
    return Math.floor(1000 + Math.random() * 9000).toString();
}

router.get('/displayDataFromRedis/:key', async (req, res) => {
    const key = req.params.key;

    try {
        // Retrieve data from Redis using the provided key
        const data = await redis.get(key);

        if (data) {
            // If data exists, parse it and send it in the response
            const parsedData = JSON.parse(data);
            res.status(200).json(parsedData);
        } else {
            res.status(404).json({ message: 'Data not found in Redis' });
        }
    } catch (error) {
        console.error('Error retrieving data from Redis:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.post("/verify_otp", async (req, res) => {
  console.log("<........verify OTP user........>");
  try {
    const { first_name, last_name, email, DOB, gender, country, phone, reference, languages, remark, OTP } = req.body;

    console.log("Phone: " + phone);
    console.log("OTP: " + OTP);
    const storedOTP = "1111";
    console.log(first_name, last_name, email, DOB, gender, country, phone, reference, languages, remark, OTP, storedOTP);

    if (storedOTP == OTP) {
      console.log(".......");

      const hashedPassword = await bcrypt.hash(phone, 10);
      const maxUserId = await reg.max('UId');
      const UId = maxUserId + 1;
      const currentDate = new Date().toJSON().split('T')[0]; // Get the current date in "YYYY-MM-DD" format
console.log("..................currentDate.",currentDate)
      const user = await reg.create({
        first_name,
        last_name,
        email,
        DOB,
        gender,
        phone,
        country,
        reference,
        languages,
        remark,
        UId,
        DOJ: currentDate, // Set only the date portion
        expiredDate: calculateExpirationDate(),
        password: hashedPassword, // Store the hashed password
        verify: 'true'
      });

   
            // console.log("UIds.dataValues.UId",[0].reg);
       
   // })();

      // Create a record in the BankDetails table
      await BankDetails.create({
        AadarNo: 0,
        IFSCCode: "",
        branchName: "",
        accountName: "",
        accountNo: 0,
        UId: user.UId // Assuming regId is the foreign key in BankDetails
      });

      const responseData = {
        message: "Success",
        data: {
          id: user.UserId,
          first_name: user.first_name,
          last_name: user.last_name,
          DOJ: user.DOJ, // The stored date without the time component
          expiredDate: user.expiredDate,
          UId: user.UId 
        }
      };

      return res.status(200).json(responseData);
    } else {
      // Respond with an error message if OTP is invalid
      return res.status(400).send("Invalid OTP");
    }
  } catch (err) {
    console.error("<........error........>", err);
    return res.status(500).send(err.message || "An error occurred during OTP verification");
  }
});

function calculateExpirationDate() {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 5);
    return d;
}

// router.get('/listName/:UserId', async (req, res) => {
//     try {
//         const { UserId } = req.params.UserId;

//         // Find the member with the provided id
//         const selectedMember = await reg.findByPk(UserId);

//         if (!selectedMember) {
//             return res.status(404).json({ error: 'Member not found' });
//         }

//         // Fetch the next 4 members including the selected member based on the id in ascending order
//         const members = await reg.findAll({
//             where: {
//               UserId: {
//                     [Op.lte]: selectedMember.UserId, // Greater than or equal to the selected member's id
//                 },
//             },
//             order: [['UserId', 'DESC']], // Order by id in ascending order
//             limit: 5, // Limit to retrieve 5 records
//             attributes: ['first_name', 'last_name'], // Select only the first_name and last_name columns
//         });

//         const processedData = members.map(user => ({
//             name: `${user.first_name} ${user.last_name}`,
//         }));

//         res.status(200).json(processedData);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'An error occurred' });
//     }
// });


router.get('/listName/:UId', async (req, res) => {
  try {
      const { UId } = req.params;

      // Find the member with the provided id
      const selectedMember = await reg.findByPk(UId);

      if (!selectedMember) {
          return res.status(404).json({ error: 'Member not found' });
      }

      // Fetch the next 4 members including the selected member based on the id in ascending order
      const members = await reg.findAll({
          where: {
            UId: {
                  [Op.gte]: selectedMember.UserId, // Greater than or equal to the selected member's id
              },
          },
          order: [['UId', 'DESC']], 
          limit: 5, 
          attributes: ['first_name', 'last_name'], 
      });

      const processedData = members.map(user => ({
          name: `${user.first_name} ${user.last_name}`,
      }));

      res.status(200).json(processedData);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
  }
});

router.post('/requestPasswordReset', async (req, res) => {
    const { email } = req.body;

    try {
        // Find the user with the provided email
        const user = await reg.findOne({ where: { email: email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        } else {
        // // User does not exist, generate a new OTP
        // const otp = generateOTP();

        // // Save the OTP in Redis with a key that includes the user's phone number
        // const redisKey = `reqotp:${user.phone}`;
        // await redis.setex(redisKey, 600, otp);

        // // Send OTP to the user via SMS
        // const otpRequest = {
        //     method: 'get',
        //     url: `https://www.fast2sms.com/dev/bulkV2?authorization=aKVbUigWHc8CBXFA9rRQ17YjD4xhz5ovJGd6Ite3k0mnSNuZPMolFREdzJGqw8YVAD7HU1OatPTS6uiK&variables_values=${otp}&route=otp&numbers=${user.phone}`,
        //     headers: {
        //         Accept: 'application/json'
        //     }
        // };

        // await axios(otpRequest);

        return res.status(200).json({ message: "OTP sent successfully"});
    }
} catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
}
});

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

router.post('/resetPassword', async (req, res) => {
    const { email, otp, new_password } = req.body;

    try {
        // Find the user with the provided email in the 'reg' schema
        const regUser = await reg.findOne({ where: { email: email } });

        if (!regUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const storedOTP = "1234";
        if (storedOTP === otp) {
            const hashedPassword = await bcrypt.hash(new_password, 10);

            // Update password and set classAttended to true in the 'reg' table
            await reg.update({
                password: hashedPassword,
                classAttended: true,
            }, {
                where: { email: regUser.email },
            });


            return res.status(200).json({ message: "Password reset successfully" });
        } else {
            // Respond with an error message if OTP is invalid
            return res.status(400).json({message:"Invalid OTP"});
        }
    } catch (err) {
        console.error("Error resetting password:", err);
        return res.status(500).send(err.message || "An error occurred during password reset");
    }
});

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

const sessionMiddleware = session({
    secret: '8be00e304a7ab94f27b5e5172cc0f3b2c575e87d',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  });
  
  router.use(sessionMiddleware);

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    // Validate email and password
  
    
  if (!email || !password) {
      return res.status(400).json({ message:'Email and password are required' });
    }
  
    try {
        const user = await reg.findOne({
            where: {
                email: email,
                classAttended: true, // Check if classAttended is true
            },
        });
      if (!user) {
        return res.status(404).json({ message: 'Invalid email !' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Incorrect password !' });
      }
  
      // Create session and store user ID
      req.session.UId = user.UId;
      //xconsole.log(res)
      res.json({
        message: 'Login successful',
        user: {
          UserId: user.UserId,
          email: user.email,
          first_name: user.first_name,
          last_name : user.last_name,
          UId : user.UId,
          DOJ : user.DOJ,
          expiredDate :user.expiredDate
          // Don't send sensitive information like password
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

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

router.put('/updateUser', async (req, res) => {
  const UId = req.session.UId;
  const userData = req.body;

  try {
      // Check if the user is authenticated
      if (!UId) {
          return res.status(401).json({ error: 'Unauthorized' });
      }

      // Find the user by UId
      const user = await reg.findOne({ where: { UId } });

      // Update user details
      if (user) {
          // Update all fields provided in the request
          await user.update(userData);
      } else {
          return res.status(404).json({ error: 'User not found' });
      }

      // Find or create the associated bank details for the user
      let bankDetails = await BankDetails.findOne({ where: { UId: UId } });
      if (!bankDetails) {
          bankDetails = await BankDetails.create({ UId: UId });
      }

      // Update all fields of BankDetails provided in the request
      await bankDetails.update(userData);

      return res.status(200).json({ message: 'User and bank details updated successfully' });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
});

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
 
router.get('/reference/:UId', async (req, res) => {
  const UId = req.params.UId;

  try {
      const user = await reg.findOne({
          where: { UId },
          attributes: ['first_name', 'last_name'],
      });

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      const fullName = `${user.first_name} ${user.last_name}`.trim();
      res.json({ full_name: fullName });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

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


router.get('/list-questions', async (req, res) => {
    try {
      const Questions = await questions.findAll();
      res.json(Questions);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

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
router.get('/user-details/:userId', async (req, res) => {
  const UId = req.params.userId;

  try {
      // Fetch details from reg table
      const userDetails = await reg.findOne({
          where: { UId },
      });

      if (!userDetails) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Fetch details from BankDetails table
      const bankDetails = await BankDetails.findOne({
          where: { UId },
      });

      // Combine the data from both tables
      const combinedData = {
          userDetails: userDetails.toJSON(),
          bankDetails: bankDetails ? bankDetails.toJSON() : null,
      };

      res.json(combinedData);
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

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
router.delete('/delete-user/:phone', async (req, res) => {
    const phone = req.params.phone;

    try {
        // Find the user based on the phone number
        const user = await reg.findOne({ where: { phone } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete the user
        await user.destroy();

        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

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


router.delete('/deleteuser/:phone', async (req, res) => {
    const phone = req.params.phone;
    try {
        // Find the user based on the phone number
        const user = await reg.findOne({ where: { phone } });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
const bank = await bankDetails.findOne({ where: {regId: user.id} });
await user.destroy();
if (bank) {
    await bank.destroy();
}
return res.status(200).json({ message: 'User deleted successfully' });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

 
router.post('/meditation', async (req, res) => {
  try {
      const { UId } = req.session;
      const { startdatetime, stopdatetime } = req.body;

      console.log('Received UId:', UId);
      console.log('Received startdatetime:', startdatetime);
      console.log('Received stopdatetime:', stopdatetime);

      // Check if UId exists in the reg table
      const userExists = await Users.findOne({ where: { UId } });
      if (!userExists) {
          return res.status(404).json({ error: 'User not found in reg table' });
      }

      const refStartDate = moment(`${startdatetime}`, "YYYY-MM-DD HH:mm:ss", true);
      const refFutureDate = refStartDate.clone().add(45, "minutes");
      const refStopDate = moment(`${stopdatetime}`, "YYYY-MM-DD HH:mm:ss", true);

      console.log('Parsed startdatetime:', refStartDate.format('YYYY-MM-DD HH:mm:ss'));
      console.log('Parsed stopdatetime:', refStopDate.format('YYYY-MM-DD HH:mm:ss'));

      const difference = refStopDate.diff(refStartDate, 'minutes');
      let ismeditated;

      if (difference >= 90) {
          ismeditated = 1;
      } else {
          ismeditated = 2;
      }

      console.log('Difference:', difference);
      const TimeTracking = await timeTracking.create({
          UId,
          med_starttime: refStartDate.format('YYYY-MM-DD HH:mm:ss'),
          med_stoptime: refStopDate.format('YYYY-MM-DD HH:mm:ss'),
          timeEstimate: difference,
          ismeditated
      });
      await TimeTracking.save();

      // Check if there is an existing record for the UId
      const existingMeditationRecord = await Meditation.findOne({ where: { UId } });

      if (existingMeditationRecord) {
          // Update the existing record
          existingMeditationRecord.med_starttime = refStartDate.format('YYYY-MM-DD HH:mm:ss');
          existingMeditationRecord.med_stoptime = refStopDate.format('YYYY-MM-DD HH:mm:ss');
          existingMeditationRecord.med_endtime = refFutureDate.format('YYYY-MM-DD HH:mm:ss');

          if (difference >= 45) {
              existingMeditationRecord.session_num += 1;
              if (existingMeditationRecord.session_num > 2) {
                  existingMeditationRecord.session_num = 1;
              }
          }

          if (existingMeditationRecord.session_num === 2) {
              existingMeditationRecord.day += 1;
              //existingMeditationRecord.session_num = 0;
          }

          if (existingMeditationRecord.day === 15) {
              existingMeditationRecord.cycle += 1;
              existingMeditationRecord.day = 0;
          }

          await existingMeditationRecord.save();
          return res.status(200).json({ message: 'Meditation time updated successfully' });
      } else {
          // Create a new record if there is no existing record
          const meditationRecord = await Meditation.create({
              UId,
              med_starttime: refStartDate.format('YYYY-MM-DD HH:mm:ss'),
              med_stoptime: refStopDate.format('YYYY-MM-DD HH:mm:ss'),
              med_endtime: refFutureDate.format('YYYY-MM-DD HH:mm:ss'),
              session_num: 0,
              day: 0,
              cycle: 0,
          });

          if (difference >= 45) {
              meditationRecord.session_num += 1;
          }

          if (meditationRecord.session_num === 2) {
              meditationRecord.day += 1;
              meditationRecord.session_num = 0;
          }

          if (meditationRecord.day === 41) {
              meditationRecord.cycle += 1;
              meditationRecord.day = 0;
          }

          await meditationRecord.save();
          return res.status(200).json({ message: 'Meditation time inserted successfully' });

      }

  } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
});

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

router.post('/messages', async (req, res) => {
  try {
      const { UId } = req.session;
      const { message, messageTime , message_priority} = req.body;

      // Check if the user exists
      const existingUser = await Users.findOne({ where: { UId } });
      if (!existingUser) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Create a new message record
      const newMessage = await Messages.create({
          UId,
          message,
          messageTime,
          message_priority
      });

      // Save the new message record
      await newMessage.save();

      return res.status(200).json({ message: 'Message created successfully' });
  } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
});

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

router.post("/appointment", async (req, res) => {
  try {
      
      const {phone, appointmentDate, num_of_people, pickup, room, from, emergencyNumber, appointment_time, appointment_reason , register_date } = req.body;

      const existingUser = await reg.findOne({ where: { phone } });
      if (!existingUser) {
          return res.status(404).json({ error: 'User not found' });
      }

      const newappointment = await appointment.create({
          UId : existingUser.UId,
          phone,
          appointmentDate,
          num_of_people,
          pickup,
          room,
          from,
          emergencyNumber,
          appointment_time,
          appointment_reason,
          register_date,
          user_name : existingUser.first_name +" "+ existingUser.last_name,
          appointment_status:"Not Arrived",
          discount: "0"

      });

      await newappointment.save();

      return res.status(200).json({ message: 'Appointment has been allocated successfully! We will notify guruji soon.' });
  } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
});

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

router.post('/send-email', async (req, res) => {
    try {
      const to = req.body.to;
  
      // Create a Nodemailer transporter
      const transporter = nodemailer.createTransport({
        host: 'smtp.forwardemail.net',
        port: 465,
        secure: true,
        service: 'gmail',
        auth: {
        
          user: 'thasmai538@gmail.com',
          pass: 'fhzw fsoo fuxe flwd',
        },
      });
  
      // Define email options
      const mailOptions = {
        from: 'thasmai538@gmail.com',
        to,
        subject: 'Registration successfull',
        text: 'Your registration is complete!',
        html: `
        <head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Kalnia:wght@100;200;300;400;500;600;700&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
        <style>
        body {
          font-family: sans-serif;
        }
        .center {
          text-align: center;
        }
        *{
          font-family: "Poppins", sans-serif;
      }
  
      body {
        margin: 0;
      }
  
      .email-template{
        background-color:#634E26;
        text-align: center;
        padding-bottom: 100px;
      }
  
      .main-logo{
        width: 20%;
        margin-top: 60px;
      }
      
      .main-head{
       color: white;
        margin-bottom: 60px;
        font-size: 24px;
      }
  
      .message-container{
        color: white;
        font-size: 20px;
        text-align:left;
        width: 75%;
        margin: auto;
        margin-bottom: 60px;
      }
  
      /* .message{
        margin-left: 30px;
      } */
  
      .whatsapp-link{
        margin-bottom: 80px;
        color: rgb(243, 180, 20);
        font-weight: 600;
        font-size: 20px;
      } 
  
  
      .card-container{
        background-color: #BA9E69;
        text-align: center;
        padding: 10px 5px 50px;
      }
      
  
      .reg-success-card {
        background-image: url('https://lh3.googleusercontent.com/u/0/drive-viewer/AEYmBYSTd0j36gM01xV3QywOEHBov73Q1zg8U0UhZkjZVVYIfUMudrzZnOqkbds3v3-Hnux7O_NJYMJEgyWlMO3V9LMiQ6gVeA=w1920-h922');
        background-repeat: no-repeat;
        background-color: rgb(62, 61, 91);
        background-size: cover;
        border-radius: 19px;
        height: 260px;
        width: 450px;
        text-align: center;
        margin:50px auto;
      }
  
      .reg-success-card-head {
        margin: 0;
        padding: 3% 0 0;
        height: 30%;
        width: 100%;
      }
  
      .reg-card-number {
        text-align: left;
        color: white;
        padding-left: 20px;
      }
  
      .reg-card-number p {
        font-size: 0.6rem;
        margin: 0;
        text-wrap: nowrap;
      }
  
      .reg-card-number h1 {
        font-size: 1.1rem;
        font-weight: bold;
        margin: 0;
      }
  
      .reg-card-logo {
        width: 12%;
        padding-right: 20px;
      }
  
      .logo-container{
        text-align: right;
      }
  
      .reg-success-card-content {
        height: 30%;
      }
  
      .content-chip{
        width: 20%;
      }
  
      .chip {
        width: 40%;
      }
  
      .center-content{
        text-align: left;
        width: 60%;
      }
       
      .reg-success-card-content div {
        margin: 0;
        padding: 0;
        text-align: center;
      }
  
      .reg-card-star-life-logo {
        width: 35%;
        margin: 0;
        padding: 0;
      }
  
      .reg-card-contact-number {
        font-size: 0.8rem;
        font-weight: bold;
        margin: 0;
        color: #fff;
      }
  
      .reg-card-success-message {
        color: #f4e893;
        font-size: 1.1rem;
        margin: 3px 0;
      }
  
      .empty-cell{
        width: 20%;
      }
  
      .reg-success-card-footer {
        margin: 0;
        padding: 0 0 3%;
        width: 100%;
        height: 40%;
      }
  
      .card-holder-group {
        text-align: left;
        color: white;
        padding-left: 20px;
      }
  
      .card-holder-name p {
        font-size: 0.6rem;
        margin: 0;
      }
  
      .card-holder-name h2 {
        font-size: 1.1rem;
        font-weight: bold;
        margin: 0;
      }
  
      .reg-card-validity{
       padding-right: 20px;
       text-align: right;
      }
  
      .reg-card-validity p {
        font-size: 0.6rem;
        margin: auto;
        color: #ffffff;
      }
  
      .special-message{
       color: white;
       background-color: #634E26;
       font-size: 12px;
       width: 90%;
       margin: 0 auto 30px;
       text-align: left;  
       padding: 20px;
       padding-left: 25px;
       border-radius: 10px;
      }
  
  
      @media only screen and (max-width: 600px) {
        .main-logo {
          width: 30%;
        }
      }
      </style>
      </head>
      <body>

      <div class="email-template"> 
      
        <img class="main-logo" src="https://lh3.googleusercontent.com/u/0/drive-viewer/AEYmBYR_f8knFIgYTA9_3I1rK7UwAPR7n13UuKSN9hD8Gg3FQsAG-eZI2jPBoZJtn0NQyUlgk7hlzNsPdrzwJ_aAVh-vRo-C=w1920-h922" alt="">
      
      <h1 class="main-head">Satyam Vada Dharmam Chara</h1>
      <div class="message-container">
      <p>Dear Krishnadas R,</p>
      <p class="message">Your registration is complete, For the zoom session  please
      send a "Hi" to the WhatsApp number : +919008290027" </p>
      </div>
      <p class="whatsapp-link"> 
      <a class="whatsapp-link" href="https://wa.me/+919008290027">Click here to Join  Whatsapp Group</a>
      </p>
        <!-- ertyu--------------------------------------------------------------------------- -->
      <div class="card-container">
      
      
      
        <div class="reg-success-card">
          <table  class="reg-success-card-head">
            <tr>
            <td class="reg-card-number">
              <p>Card Number</p>
              <!-- <h1>{data.userId}</h1> -->
              <h1>24</h1>
            </td>
               <td class="logo-container">
            <img class="reg-card-logo" src="https://lh3.googleusercontent.com/u/0/drive-viewer/AEYmBYR_f8knFIgYTA9_3I1rK7UwAPR7n13UuKSN9hD8Gg3FQsAG-eZI2jPBoZJtn0NQyUlgk7hlzNsPdrzwJ_aAVh-vRo-C=w1920-h922" alt="Thasmai logo" />
          </td> 
          </tr>
          </table>
      
          <table class="reg-success-card-content">
            <tr>
              <td class="content-chip">
            <img class="chip" src="https://lh3.googleusercontent.com/u/4/drive-viewer/AEYmBYTxR0xtWDAc6vsYvzTczVpqRnS46VUeCY9KsKUSAC-ea8rSuQBUWzSF462QKYxoYavYUH5VhcgPdJRQwngVx6ZTG3Hb=w1920-h922" alt="chip" />
          </td>
          <td class="center-content">
            <div>
              <img class="reg-card-star-life-logo" src="https://lh3.googleusercontent.com/u/0/drive-viewer/AEYmBYQevim8IaLnDiUWrPZygsD8d0yQUjT0St4SddRBzjjlYq0v8RrVMWUcINin-htMG7MS4_KrtxOLDQwjihA2nDPWCkSk=w1920-h922" alt="star-life-img" />
              <h3 class="reg-card-success-message">Registration Successful</h3>
              <p class="reg-card-contact-number">
                <span>Contact: +91 9008290027</span>
              </p>
              <!-- <a class="success-page-link" href="/registrationSuccess">OK</a> -->
            </div>
          </td>
          <td class="empty-cell"></td>
          </tr>
        
          </table>
      
          <table class="reg-success-card-footer">
            <tr>
            <td class="card-holder-group">
              <div class="card-holder-name">
                <p>Cardholder Name</p>
                <!-- <h2>{data.first_name} {data.last_name}</h2> -->
                <h2>Krishnadas R</h2>
                <!-- <p>DOJ: {dayOfJoining + "/" + monthOfJoining + "/" + yearOfJoining}</p> -->
                <p>DOJ:19/01/24</p>
              </div>
            </td>
      
            <td class="reg-card-validity">
              <!-- <p>VALID: {expiry.day}/{expiry.month}/{expiry.year}</p> -->
              <p>VALID:19/1/2030</p>
            </td>
          </tr>
          </table>
        </div>
      
      <!----  conatiner msg      -->
      <div class="special-message">
      <p>You'll be joining a community of like-minded individuals. Get ready to stay informed and inspired!</p>
      
      
      </div>
      
      
      
      
      </div>  <!--end of card container-->
      
        <!-- eno of template -->
      </div>
      </body>`,
      };
  
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      return res.status(200).json({ message: 'Email sent successfully' });
      });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  router.get('/user-details', async (req, res) => {
    try {
        const { UId } = req.session;

        if (!UId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const user = await reg.findOne({
            attributes: ['first_name', 'last_name', 'UId', 'DOJ', 'expiredDate'],
            where: { UId },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

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
  
router.get('/meditation-detail', async (req, res) => {
  try {
      const { UId } = req.session;

      if (!UId) {
          return res.status(401).json({ error: 'User not authenticated' });
      }

      const user = await meditation.findOne({
          attributes: ['UId', 'med_starttime', 'med_stoptime', 'med_endtime', 'session_num', 'day', 'cycle'],
          where: { UId: UId },
      });

      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(user);
  } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
});

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


router.get('/get-messages', async (req, res) => {
  try {
      const { UId } = req.session;

      if (!UId) {
          return res.status(401).json({ error: 'User not authenticated' });
      }

      const messages = await Messages.findAll({
          attributes: ['UId', 'message', 'messageTime'],
          where: { UId: UId },
      });

      if (!messages || messages.length === 0) {
          return res.status(404).json({ error: 'Messages not found for the user' });
      }

      return res.status(200).json(messages);
  } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
});

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
  
router.get('/meditation-date', async (req, res) => {
  try {
      const { UId } = req.session;

      if (!UId) {
          return res.status(401).json({ error: 'User not authenticated' });
      }

      const user = await timeTracking.findAll({
          attributes: ['UId', 'med_starttime', 'timeEstimate', 'ismeditated'],
          where: {
              UId: UId,
          },
      });

      if (!user || user.length === 0) {
          return res.status(404).json({ error: 'No records found with timeEstimate >= 90' });
      }

      // Modify the med_starttime in each record
      const formattedUser = user.map(record => {
          const parsedDate = moment(record.med_starttime, "YYYY-MM-DD HH:mm:ss");
          const formattedDate = parsedDate.format("YYYY-MM-DD HH:mm:ss");
          const replacedDate = formattedDate.replace(/-/g, ',');

          // Add the formatted date to the record
          return { ...record.dataValues, med_starttime: replacedDate };
      });

      return res.status(200).json(formattedUser);
  } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
});

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


router.get('/getBankDetails/:UId', async (req, res) => {
  try {
    const UId = parseInt(req.params.UId);

    // Fetch the 'reg' record with associated 'BankDetails'
    const userData = await BankDetails.findOne({
      where: { UId },
      
    });

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

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

  router.get('/list-appointment', async(req,res) =>{
    try{
      const { phone } = req.query;

      if(!phone) {
         
        return res.status(401).json({error:'User not authenticated'});
      }
      //console.log('get appointment list');
      // find the appointment
      const list = await appointment.findAll({where:{phone},});
      res.status(200).json({message:'Fetching appointments',list });
    } catch(error) {
      console.log(error);
      res.status(500).json({message:'internal server error'});
    }
  });

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


  router.delete('/appointment', async(req,res) =>{
    // console.log('delete')
    const { phone,id} = req.query
    // const id = req.params.id;/
    try{

      //console.log('delete appointment');
     // find the appointment
      const data = await appointment.findOne({ where:{id}});

      if(!phone) {
        return res.status(404).json({error:'User not authenticated'});
      }
      // delete appointment
      await data.destroy();
      return res.status(200).json({message:'delete appointment'});

    } catch(error){
      return res.status(500).json({message:'internal server error'});
    }
  });
/**
 * @swagger
 * /User/appointment:
 *   delete:
 *     summary: Delete an appointment
 *     description: Delete an appointment by providing the appointment ID and user's phone number for authentication.
 *     parameters:
 *       - in: query
 *         name: id
 *         description: ID of the appointment to be deleted
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: phone
 *         description: User's phone number for authentication
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Internal Server Error
 */

router.get('/user_profile/:UId' , async(req,res) =>{

})
module.exports = router;