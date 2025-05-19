require('dotenv').config();
const Nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");

const transporter = Nodemailer.createTransport(
    MailtrapTransport({
        token: process.env.MAILTRAP_TOKEN,
    })
);

const sender = {
    address: "hello@erpsystem.io.vn",
    name: "ERP System's support team",
};

const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: sender,
            to: to,
            subject: subject,
            html: html,
            category: "ERP System Email"
        };

        const info = await transporter.sendMail(mailOptions);
        
        return {
            success: true,
            messageId: info.messageId
        };
    } catch (error) {
        console.error('Mail service error:', error);
        if (error.message.includes('Unauthorized') || error.message.includes('Invalid token')) {
            throw new Error('Email service authentication failed. Please check your credentials.');
        }
        throw new Error('Failed to send email. Please try again later.');
    }
};


module.exports = {
    sendEmail
};
