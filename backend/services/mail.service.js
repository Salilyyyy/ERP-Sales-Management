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
        console.log('Preparing to send email...');

        const mailOptions = {
            from: sender,
            to: to,
            subject: subject,
            html: html,
            category: "ERP System Email"
        };

        console.log('Sending with options:', {
            to: mailOptions.to,
            subject: mailOptions.subject
        });

        const info = await transporter.sendMail(mailOptions);
        
        console.log('Email sent successfully');
        console.log('Message ID:', info.messageId);

        return {
            success: true,
            messageId: info.messageId
        };
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
};

(async () => {
    try {
        await transporter.verify();
        console.log('SMTP connection ready');
    } catch (error) {
        console.error('SMTP connection test failed:', error);
    }
})();

module.exports = {
    sendEmail
};
