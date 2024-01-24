const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.forwardemail.net",
    port: 465,
    secure: true,
  service: 'gmail',
  auth: {
 user: 'thasmai538@gmail.com',
 pass: 'fhzw fsoo fuxe flwd',
  },
});

const mailOptions = {
  from: 'thasmai538@gmail.com',
  to: 'jishaps3@gmail.com',
  subject: 'Test mail',
  text: 'Test mail',
  html: '<p>Test mail</p>',
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});
