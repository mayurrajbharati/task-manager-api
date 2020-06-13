const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const welcomeEmail=(email,name)=>{
    sgMail.send({
        to: email,
        from: 'mayur14bharati@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the website ${name}. We are very happy to have you.`
    })
}

const cancelEmail = (email,name)=>{
    sgMail.send({
        to: email,
        from: 'mayur14bharati@gmail.com',
        subject: 'Why leave so soon?',
        text: `Dear ${name}, we are sorry that you could not spend much time! Can you please tell us what went wrong?`
    })
}

module.exports = {welcomeEmail,cancelEmail};