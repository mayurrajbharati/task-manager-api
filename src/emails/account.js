const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const welcomeEmail = (email,name)=>{
    transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Thanks for joining in!',
        text: `Welcome to the website ${name}. We are very happy to have you.`
    },);
  }
  
  const cancelEmail = (email,name)=>{
    transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Leave so soon?',
        text: `Dear ${name}, we are sorry that you could not spend much time! Can you please tell us what went wrong?`
    },);
  }
  const forgotPass = (email,name,password)=>{
    transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'We are here to help!',
        text: `Dear ${name},\n Your new password is ${password} \nWe are very happy to have you.`
    },);
  }

module.exports = {welcomeEmail,cancelEmail,forgotPass};