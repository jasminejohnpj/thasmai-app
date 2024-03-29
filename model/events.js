require('dotenv').config();
const { DataTypes, Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    logging: false,

});
const events = sequelize.define('events', {
    event_name: { type: DataTypes.STRING},
    event_description: { type: DataTypes.STRING},
    priority: { type: DataTypes.STRING},
    place: { type: DataTypes.STRING},
    date: {type: DataTypes.DATE},
    image: {
        type:DataTypes.BLOB
    }    
 });


events.sync()
    .then((data) => {
       
        console.log('events table created');
    })
    .catch((err) => {
        console.log(err);
    });


    


module.exports = events;