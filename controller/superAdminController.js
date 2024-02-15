const express = require('express');
const { sequelize, reg, BankDetails } = require('../model/registration');
const router = express.Router();
const Users = require('../model/validUsers');
const { Op, where } = require("sequelize");
const Distribution = require('../model/distribution');
const financialconfig = require('../model/financialConfig');




////////////////////////////////////////userpage/////////////////////


const { validationResult } = require('express-validator');
const appointment = require('../model/appointment');
const { response } = require('../router/routing');

// router.get('/searchquery', async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const conditions = parseSearchConditions(req.query);
//     if (conditions.length === 0) {
//       return res.status(400).json({ error: 'Invalid search conditions' });
//     }

//     const logicalOperator = req.query.logicalOperator || 'and';

//     const whereCondition = (logicalOperator === 'or') ? { [Op.or]: conditions } : { [Op.and]: [...conditions, { user_Status: { [Op.ne]: "block" } }] };
//     const users = await Users.findAll({
//       where: whereCondition,
//     });

//     return res.status(200).json(users);
//   } catch (error) {
//     console.error('Error:', error);
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Helper function to parse search conditions
// function parseSearchConditions(query) {
//   const conditions = [];

//   if (query.field && query.operator && query.value) {
//     const fields = Array.isArray(query.field) ? query.field : [query.field];
//     const operators = Array.isArray(query.operator) ? query.operator : [query.operator];
//     const values = Array.isArray(query.value) ? query.value : [query.value];

//     fields.forEach((field, index) => {
//       const sequelizeOperator = getSequelizeOperator(operators[index]);
//       if (sequelizeOperator) {
//         conditions.push({
//           [field]: { [sequelizeOperator]: values[index] },
//         });
//       }
//     });
//   }

//   return conditions;
// }

// // Helper function to map operators
// function getSequelizeOperator(operator) {
//   const operatorMap = {
//     '=': Op.eq,
//     '>': Op.gt,
//     '<': Op.lt,
//     '>=': Op.gte,
//     '<=': Op.lte,
//     // Add more operators as needed
//   };
//   return operatorMap[operator];
// } 



router.get('/searchquery', async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const conditions = parseSearchConditions(req.query);
    if (conditions.length === 0) {
      return res.status(400).json({ error: 'Invalid search conditions' });
    }

    const logicalOperator = req.query.logicalOperator || 'and';

    //const whereCondition = (logicalOperator === 'or') ? { [Op.or]: conditions } : { [Op.and]: [...conditions, { user_Status: { [Op.ne]: 'block' } }] };
    const whereCondition = (logicalOperator === 'or')
    ? { [Op.or]: conditions.map(cond => ({ ...cond, ban: { [Op.ne]: true } })) }
    : { [Op.and]: conditions.map(cond => ({ ...cond, ban: { [Op.ne]: true } })) };

    console.log("whereCondition:", whereCondition); 

    const users = await Users.findAll({
      where: whereCondition,
    });


    console.log("Users:", users);

    return res.status(200).json(users);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Helper function to parse search conditions
function parseSearchConditions(query) {
  const conditions = [];

  if (query.field && query.operator && query.value) {
    const fields = Array.isArray(query.field) ? query.field : [query.field];
    const operators = Array.isArray(query.operator) ? query.operator : [query.operator];
    const values = Array.isArray(query.value) ? query.value : [query.value];

    fields.forEach((field, index) => {
      const sequelizeOperator = getSequelizeOperator(operators[index]);
      if (sequelizeOperator) {
        conditions.push({
          [field]: { [sequelizeOperator]: values[index] },
        });
      }
    });
  }

  return conditions;
}

// Helper function to map operators
function getSequelizeOperator(operator) {
  const operatorMap = {
    '=': Op.eq,
    '>': Op.gt,
    '<': Op.lt,
    '>=': Op.gte,
    '<=': Op.lte,
    // Add more operators as needed
  };
  return operatorMap[operator];
}


router.get('/searchfield', async (req, res) => {
  try {
    const field = req.query.field; // Retrieve the field from query parameters
    const value = req.query.value; // Retrieve the value from query parameters

    if (!field || !value) {
      return res.status(400).json({ message: 'Please provide both field and value parameters' });
    }

    // You can now use the field and value to search the database and fetch details
    const userDetails = await Users.findOne({
      where: {
        [field]: value,
      },
    });

    if (!userDetails) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Success', data: userDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// router.post('/coupon-distribute', async (req, res) => {
//   try {
//     const { totalCoupons, distributedIds,description } = req.body;

//     // Validate input
//     if (!totalCoupons || !distributedIds || !Array.isArray(distributedIds)) {
//       return res.status(400).json({ message: 'Invalid input. Please provide totalCoupons and an array of distributedIds.' });
//     }

//     // Check if totalCoupons is a positive integer
//     if (!Number.isInteger(totalCoupons) || totalCoupons <= 0) {
//       return res.status(400).json({ message: 'Invalid input. totalCoupons should be a positive integer.' });
//     }

//     // Fetch user IDs and corresponding coupon numbers in descending order
//     const usersWithCoupons = await Users.findAll({
//       attributes: ['UserId', 'coupons'],
//       order: [['coupons', 'DESC']], // Order by UserId in descending order
//       limit: totalCoupons,
//       where: {
//         UserId: { [Op.gte]: 11 },
//         coupons: { [Op.gt]: 0 }, // Start from UserId 11
//       }, // Exclude the first 10 records
//     });

// console.log("........................................................",usersWithCoupons);
//     // Check if enough coupons are available for distribution
//     if (usersWithCoupons.length < totalCoupons) {
//       return res.status(400).json({ message: 'Not enough coupons available to distribute.' });
//     }

//     // Build the where condition to ensure coupons is greater than or equal to 1
//     const whereCondition = {
//       UserId: usersWithCoupons
//         .filter((user) => user.coupons > 0) // Filter out users with 0 coupons
//         .map((user) => user.UserId),
//       coupons: { [Op.gte]: 1 }, // Ensure coupons is greater than or equal to 1
//     };
//     console.log("whereCondition........................................................................",whereCondition);

//     const updatedCoupons = await Users.update(
//       { coupons: sequelize.literal('coupons - 1') },
//       { where: whereCondition }
//     );
//     const couponsPerUser = totalCoupons / distributedIds.length;
//     const distributionRecords = await Promise.all(distributedIds.map(async (UId) => {
//       const user = await Users.findByPk(UId);
//       if (user) {
//         // Create distribution record
//         return Distribution.create({
//           firstName: user.firstName,
//           secondName: user.secondName,
//           UId: UId,
//           distributed_coupons: couponsPerUser,
//           description: description,
//           distribution_time: new Date().toISOString(),
//         });
//       }
//       return null;
//     }));

//     // Filter out null values in case a user is not found
//     const validDistributionRecords = distributionRecords.filter(record => record !== null);


//     res.json({ message: 'Coupons distributed successfully', updatedCoupons });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });


router.post('/coupon-distribute', async (req, res) => {
  try {
    const { totalCoupons, distributedIds, description } = req.body;

    // Validate input
    if (!totalCoupons || !distributedIds || !Array.isArray(distributedIds)) {
      return res.status(400).json({ message: 'Invalid input. Please provide totalCoupons and an array of distributedIds.' });
    }

    // Check if totalCoupons is a positive integer
    if (!Number.isInteger(totalCoupons) || totalCoupons <= 0) {
      return res.status(400).json({ message: 'Invalid input. totalCoupons should be a positive integer.' });
    }

    // Fetch user IDs and corresponding coupon numbers in descending order
    const usersWithCoupons = await Users.findAll({
      attributes: ['UserId', 'coupons'],
      order: [['coupons', 'DESC']], // Order by UserId in descending order
      limit: totalCoupons,
      where: {
        UserId: { [Op.gt]: 11 },
        coupons: { [Op.gt]: 0 }, // Start from UserId 11
      }, // Exclude the first 10 records
    });

    console.log("........................................................", usersWithCoupons);

    // Check if enough coupons are available for distribution
    if (usersWithCoupons.length < totalCoupons) {
      return res.status(400).json({ message: 'Not enough coupons available to distribute.' });
    }

    // Build the where condition to ensure coupons is greater than or equal to 1
    const whereCondition = {
      UserId: usersWithCoupons
        .filter((user) => user.coupons > 0) // Filter out users with 0 coupons
        .map((user) => user.UserId),
      coupons: { [Op.gte]: 1 }, // Ensure coupons is greater than or equal to 1
    };
    //console.log("whereCondition........................................................................", whereCondition);

    const updatedCoupons = await Users.update(
      { coupons: sequelize.literal('coupons - 1') },
      { where: whereCondition }
    );

    const couponsPerUser = totalCoupons / distributedIds.length;

    // Update Users table with couponsPerUser for each distributed user
    await Promise.all(distributedIds.map(async (UserId) => {
      const user = await Users.findByPk(UserId);
      if (user) {
        // Update coupons in the Users table by adding couponsPerUser
        await Users.update(
          { coupons: sequelize.literal(`coupons + ${couponsPerUser}`) },
          { where: { UserId: UserId } }
        );
              }
    }));

    // Send response after all updates are complete
    res.json({ message: 'Coupons distributed successfully', updatedCoupons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/export', async (req, res) => {
  try {
    const { coupons, UIds, description } = req.body;

    // Validate input
    if (!coupons || !UIds || !Array.isArray(UIds) || UIds.length === 0) {
      return res.status(400).json({ message: 'Invalid input. Please provide coupons and a non-empty array of UIds.' });
    }

    // Check if coupons is a positive integer
    if (!Number.isInteger(coupons) || coupons <= 0) {
      return res.status(400).json({ message: 'Invalid input. Coupons should be a positive integer.' });
    }

    // Fetch users with specified UIds and valid coupons
    const usersToUpdate = await Users.findAll({
      where: {
        UId: UIds,
        coupons: { [Op.gte]: coupons },
      },
    });

    // Check if enough coupons are available for all specified users
    if (usersToUpdate.length !== UIds.length) {
      return res.status(400).json({ message: 'Not enough coupons available for all specified users.' });
    }

    // Update coupons for each user
    await Promise.all(usersToUpdate.map(async (user) => {
      const updatedCoupons = user.coupons - coupons;
      await Users.update({ coupons: updatedCoupons }, { where: { UId: user.UId } });
      await Distribution.create({
        firstName: user.firstName,
        secondName: user.secondName,
        UId: user.UId,
        distributed_coupons: coupons,
        description: description,
        distribution_time: new Date().toISOString(),
      });

      //////////////////////////////////
      const latestDistributionRecord = await Distribution.findOne({
        attributes: ['firstName', 'secondName', 'UId', 'distributed_coupons', 'description', 'distribution_time'],
        where: { UId: user.UId },
        order: [['distribution_time', 'DESC']], // Order by distribution_time in descending order to get the latest record
      });

      // Fetch the corresponding bank details for the user
      const bankDetails = await BankDetails.findOne({
        attributes: ['AadarNo', 'IFSCCode', 'branchName', 'accountName', 'accountNo'],
        where: { userId: user.UId },
      });

      return {
        firstName: latestDistributionRecord.firstName,
        secondName: latestDistributionRecord.secondName,
        UId: latestDistributionRecord.UId,
        distributed_coupons: latestDistributionRecord.distributed_coupons,
        description: latestDistributionRecord.description,
        distribution_time: latestDistributionRecord.distribution_time,
        AadarNo: bankDetails.AadarNo,
        IFSCCode: bankDetails.IFSCCode,
        branchName: bankDetails.branchName,
        accountName: bankDetails.accountName,
        accountNo: bankDetails.accountNo,
      };
    }));

    res.json({ message: 'Coupons reduced successfully for specified users.', distributionDetails });
    } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/meditator', async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: ['DOJ', 'firstName', 'secondName', 'UId', 'coupons', 'email', 'phone', 'ban'],
      order: [['UserId', 'ASC']], // Order by UId in ascending order
           where: {
       UId: { [Op.gte]: 11 }, // Start from UId 11
      },
    });

    const totalCoupons = users.reduce((sum, user) => sum + user.coupons, 0);

    res.json({ users, totalCoupons });

   // res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// router.get('/list-all-appointment' , async(req, res) =>{
//   console.log("..........enter............")
//   try{
//     const data = await appointment.findAll();
//     res.json(data);
//   } catch ( error){
//     res.status(500).json({ message:' internal server error'});
//   }
// });

router.get('/list-all-appointment', async (req, res) => {
  try {
    const appointmentData = await appointment.findAll();

    if (!appointmentData || appointmentData.length === 0) {
      return res.status(404).json({ message: 'No appointments found' });
    }
    const UIds = appointmentData.map(appointment => appointment.UId);

    const userData = await Users.findAll({
      where: { UId: { [Op.in]: UIds } },
      attributes: ['UId', 'coupons'],
    });
    const userCouponMap = new Map(userData.map(user => [user.UId, user.coupons]));

    const mergedResults = appointmentData.map(appointment => {
      const userCoupons = userCouponMap.get(appointment.UId) || 0;
      return {
        ...appointment.dataValues,
        userCoupons,
      };
    });

    res.json({ message: 'Success', data: mergedResults });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/update-payment/:id', async (req, res) => {
  const id = req.params.id;  // Corrected to access the ID from the parameters
  const { check_out, payment, payment_method, appointment_status,appointmentDate } = req.body;

  try {
      if (!id) {
          return res.status(400).json({ error: 'ID not found' });
      }

      const dataToUpdate = {
        appointmentDate,
          check_out,
          payment,
          payment_method,
          appointment_status 
      };

      const updatedAppointment = await appointment.update(dataToUpdate, {
          where: { id: id } // Corrected to specify the appointment ID to update
      });
console.log(dataToUpdate);
      if (updatedAppointment[0] === 1) {
      
          return res.status(200).json({ message: 'Appointment updated successfully' });
          console.log(res);
      } else {
          return res.status(404).json({ error: 'Appointment not found' });
      }
  } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// router.put('/discount/:UId', async (req, res) => {
//   const { UId } = req.params;
//   const { coupon, id } = req.body;

//   try {
//     // Check if UId is a valid integer
//     if (isNaN(parseInt(UId))) {
//       return res.status(400).json({ error: 'Invalid User ID' });
//     }

//     // Check if coupon is numeric
//     if (isNaN(parseInt(coupon))) {
//       return res.status(400).json({ error: 'Coupon amount must be a number' });
//     }

//     const user = await Users.findOne({ where: { UId } });

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const totalCoupons = user.coupons;
//     if (coupon > totalCoupons) {
//       return res.status(400).json({ error: 'Invalid coupon amount' });
//     }

//     const updatedTotalCoupons = totalCoupons - coupon;
//     await Users.update({ coupons: updatedTotalCoupons }, { where: { UId } });

//     // Assuming 'appointment' is a model with a proper 'where' condition for the update
//     await appointment.update({ discount: coupon * 2500 }, { where: { id } });

//     return res.status(200).json({ message: 'Discount updated successfully' });
//   } catch (error) {
//     console.error('Error:', error);
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

router.put('/discount/:UId', async (req, res) => {
  const { UId } = req.params;
  const { coupon, id } = req.body;

  try {
    // Check if UId is a valid integer
    if (isNaN(parseInt(UId))) {
      return res.status(400).json({ error: 'Invalid User ID' });
    }

    // Check if coupon is numeric
    if (isNaN(parseInt(coupon))) {
      return res.status(400).json({ error: 'Coupon amount must be a number' });
    }

    const user = await Users.findOne({ where: { UId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const totalCoupons = user.coupons;
    if (coupon > totalCoupons) {
      return res.status(400).json({ error: 'Invalid coupon amount' });
    }

    const updatedTotalCoupons = totalCoupons - coupon;
    await Users.update({ coupons: updatedTotalCoupons }, { where: { UId } });

    // Assuming 'appointment' is a model with a proper 'where' condition for the update
    await appointment.update({ discount: coupon * 2500 }, { where: { id } });

    return res.status(200).json({ message: 'Discount updated successfully' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
})

router.get('/list-appointment/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Find appointment by ID
    const appointmentData = await appointment.findOne({ where: { id } });

    if (!appointmentData) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Send appointment details as response
    return res.status(200).json(appointmentData);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
