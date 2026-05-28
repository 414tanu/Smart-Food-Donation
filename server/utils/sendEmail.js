const nodemailer = require('nodemailer');
const env = require('../config/env');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: env.emailService,
      auth: {
        user: env.emailUser,
        pass: env.emailPass
      }
    });

    const mailOptions = {
      from: `${env.appName} <${env.emailUser}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;
