const express = require('express');
const {reg,BankDetails} = require('../model/registration');
const router = express.Router();
const { Op } = require("sequelize");
const axios = require('axios');
const Country =require('../model/country');
const session = require('express-session');
const Redis = require('ioredis');
const redis = new Redis();
const questions =require("../model/question");
const {Users,sequelize} = require('../model/validUsers');

const bcrypt = require('bcrypt');



router.put('/processPayment', async (request, response) => {
 
    // const userId = req.session.userId;
    const userId = request.body.UId;
    console.log(userId);
console.log(reg)
  try {
    // Find the user in the reg table by userId
   // const userReg = await reg.findByPk(userId);
const userReg = await reg.findOne({
    where :{userId} })
    console.log("............................",userReg.first_name);
    if (!userReg) {
       
      return response.status(404).json({ error: 'User not found' });

    }
    console.log('userReg', userReg);

    // Update payment status to true
    await userReg.update({ payment: true });
  
    const res = await sequelize.query(`CALL referUser('${userReg.first_name}','${userReg.last_name}','${userReg.DOB}','${userReg.phone}','${userReg.email}','${userReg.state}','${userReg.district}','${userReg.userId}','${userReg.DOJ}')`);
  
    if (res) {
        console.log(res)
        let LastUserID = res[0]['LastUserID'];
        
        const referers = await sequelize.query(`CALL GetReferrerTreeWithCorrection('${LastUserID}')`);
        const list = referers[0];
        const list_of_referers = [
            list.Sam_Referrer, list.Level_2_Referrer, list.Level_3_Referrer, list.Level_4_Referrer,
            list.Level_5_Referrer, list.Level_6_Referrer, list.Level_7_Referrer, list.Level_8_Referrer,
            list.Level_9_Referrer, list.First_ID
        ];

        for (const userID of list_of_referers) {
            const user = await Users.findByPk(userID);

            

            if(user.ban === false){
            if (user.coupons === 0) {
                user.points += 250;
                // user.distributed_points+=250;
                await user.save();



                if (user.points === 2500) {
                    user.points = 0;
                    user.coupons += 1;
                    user.distributed_points = 0;
                    user.distribute = true;
                    await user.save();

                }

            }
            else{
                if(user.distribute === true && user.Level != 1){
                    console.log('Ready to distribute')
                    const phil = await Users.findOne({
                        attributes: ['UserId', 'Level', 'points'],
                        where: {
                            Level: user.Level,
                            ban:{
                                   [Op.ne] : true
                            },
                            coupons: {
                              [Op.lt]: user.coupons
                            },

                        },
                        limit: 1
                    });
                    console.log()
                    if (phil) {
                        const { UserId, Level, points } = phil;
                        

                        console.log(UserId,Level,points)
                       
                            await Users.update({ points: points + 250 }, { where: { UserId } });
                            user.distributed_points+=250;
                            user.reserved_id+=250;
                            await user.save()
                            console.log(user.distribute,'distribution')
                            let updated_user = await Users.findByPk(UserId);

                            if(user.distributed_points === 2500){
                                user.distribute = false;
                                await user.save()
                            }
                            if (updated_user && updated_user.points >= 2500) {
                                updated_user.points = 0;
                                updated_user.coupons += 1;
                                await updated_user.save();
                            }
                            
                           
    
 
                        
                    } //if
                     else{
                                user.points += 250;
                                // user.distributed_points+=250;
                                user.reserved_id+=250;
                                await user.save();
        
        
        
                                if (user.points === 2500) {

                                    user.points = 0;
                                    user.coupons += 1;
                                    user.distributed_points = 0;
                                    await user.save();
        
                                }
                            }
                } //distribute
                else{
                    user.points += 250;
                    // user.distributed_points+=250;
                    await user.save()
                    if (user.points === 2500) {
                        user.points = 0;
                        user.coupons += 1;
                        user.distributed_points = 0;
                        user.distribute = true;
                        await user.save();

                    }
                }
            }

            
        }//else
        else{
            const thasmai_id = 1;
          const thasmai = await Users.findByPk(thasmai_id);
          thasmai.points += 250;
          // user.distributed_points+=250;
          await thasmai.save();



          if (thasmai.points === 2500) {
              thasmai.points = 0;
              thasmai.coupons += 1;
              await thasmai.save();

          }

        }
    }
    
}
      return response.status(200).json({ message: 'Payment processed and data copied successfully' });
    } catch (error) {
      console.error('Error:', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }

  });


router.get('/findall',async(request,response)=>{
    console.log('findall')
    try {
        const user_list = await Users.findAll();
        if(user_list){
            return response.json({status:"success",user_list})
        }
    } catch (error) {
        return response.json({status:"failed",error})
    }
})
router.post('/findrefs',async (request,response)=>{
const {id} = request.body;
    
const participant = await Users.findByPk(id);


    const referers = await sequelize.query(`CALL GetReferrerTreeWithCorrection('${id}')`);
    const {Sam_Referrer,Level_2_Referrer,Level_3_Referrer,Level_4_Referrer,Level_5_Referrer,Level_6_Referrer,Level_7_Referrer,Level_8_Referrer,Level_9_Referrer,First_ID} = referers[0]
    const refererslist = [Sam_Referrer,Level_2_Referrer,Level_3_Referrer,Level_4_Referrer,Level_5_Referrer,Level_6_Referrer,Level_7_Referrer,Level_8_Referrer,Level_9_Referrer,First_ID]
    
    
    const foundReferers = await Users.findAll({
        where: {
          UserId: {
            [Op.in]: refererslist,
          },
        }
        })
    



const refs = foundReferers.map(user => user.dataValues);
// console.log(refs)
return response.json({status:"success",refs:refs})
})
// ban the user
router.post('/closeuser',async (req,res)=>{
    
    
    const {id} = req.body
    let closeuserid = await Users.findByPk(id)
    closeuserid.ban = true
    await closeuserid.save()
    return res.json({status:"success",data:"user updated successfully"})
})

router.get('/search', async (req, res) => {
    try {
      const { userlevel, usernode } = req.query;
  
      let whereClause = {};
  
      // Build the dynamic where clause based on the provided parameters
      if (userlevel) {
        whereClause = {
          ...whereClause,
          Level: userlevel,
        };
      }
  
      if (usernode) {
        whereClause = {
          ...whereClause,
          node_number: usernode,
        };
      }
  
      const searchdata = await Users.findAll({
        where: whereClause,
      });
  
      const searchResults = searchdata.map((user) => user.dataValues);
  
      console.log(searchResults);
  
      return res.json({ status: 'success', data: searchResults });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  });


  // router.get('/searchquery', async (req, res) => {
  //   try {
  //     const { field, operator, value, logicalOperator } = req.query;
  //     console.log(field, operator, value, logicalOperator);
  
  //     if (!field || !operator || !value) {
  //       return res.status(400).json({ error: 'Field, operator, and value are required' });
  //     }
  
  //     const whereCondition = {};
  
  //     // Map the operator to Sequelize operator
  //     const sequelizeOperator = getSequelizeOperator(operator);
  // console.log(sequelizeOperator,operator);
  //     if (!sequelizeOperator) {
  //       return res.status(400).json({ error: 'Invalid operator' });
  //     }
  
  //     whereCondition[field] = {
  //       [sequelizeOperator]: value,
  //     };
  
  //     let U;
  
  //     if (logicalOperator === 'or') {
  //       U = await reg.findAll({
  //         where: {
  //           [Op.or]: [whereCondition],
  //         },
  //       });
  //     } else {
  //       U = await reg.findAll({
  //         where: whereCondition,
  //       });
  //     }
  
  //     return res.status(200).json(U);
  //   } catch (error) {
  //     console.error('Error:', error);
  //     return res.status(500).json({ error: 'Internal Server Error' });
  //   }
  // });
  
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

 

  module.exports = router;