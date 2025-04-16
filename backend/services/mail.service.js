const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "8bcb2a430c763d",
        pass: "363ea37b439b59"
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        console.log('Preparing to send email...');

        const mailOptions = {
            from: '"ERP System" <from@example.com>',
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
