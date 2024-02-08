require('dotenv').config();
const { DataTypes, Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    logging: false,

});
const financialconfig = sequelize.define('FinancialConfig', {
    points :{type:DataTypes.INTEGER},
    coupons: {type:DataTypes.INTEGER},
    coupon_saturation: {type:DataTypes.INTEGER},
    fee: {type:DataTypes.INTEGER},
},
{
    timestamps: false,
});
sequelize.sync({alter:true})
    .then((data) => {
       // console.log(data);
        console.log('FinancialConfig table created');
    })
    .catch((err) => {
        console.log(err);
    });
    module.exports = financialconfig