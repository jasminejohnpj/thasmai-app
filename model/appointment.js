
require('dotenv').config();
const { DataTypes, Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    logging: false,

});
const appointment = sequelize.define('appointment',{
    UId :{type:DataTypes.INTEGER},
   appointmentDate : { type: DataTypes.STRING },
   num_of_people : { type: DataTypes.INTEGER},
   pickup : { type: DataTypes.BOOLEAN},
   from : { type: DataTypes.STRING},
   room: { type: DataTypes.STRING},
   emergencyNumber : { type: DataTypes.STRING},
   appointment_time: { type: DataTypes.STRING},
   appointment_reason: { type: DataTypes.TEXT},
},
{timestamps: false});
sequelize.sync({alter:true})
    .then((data) => {
       // console.log(data);
        console.log('meditation table created');
    })
    .catch((err) => {
        console.log(err);
    });
module.exports = appointment