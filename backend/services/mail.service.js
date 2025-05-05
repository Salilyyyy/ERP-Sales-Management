const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        console.log('Preparing to send email...');

        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: to,
            subject: subject,
            html: html
        };

        console.log('Sending with options:', {
            to: mailOptions.to,
            subject: mailOptions.subject
        });

        const info = await transporter.sendMail(mailOptions);
        
        console.log('Email sent successfully');
        console.log('Message ID:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

        return {
            success: true,
            messageId: info.messageId,
            previewUrl: nodemailer.getTestMessageUrl(info)
        };
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
};

// Test connection on startup
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
