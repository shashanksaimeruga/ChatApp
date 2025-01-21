const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendOtpEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Verification Code for Your Account',
        text: `Dear User,

        Thank you for registering with our service. To complete your registration, please use the verification code provided below. This code is valid for 10 minutes.

        Verification Code: ${otp}

        If you did not request this code, please ignore this email.

        Best regards,
        The Support Team`,
        html: `<p>Dear User,</p>
               <p>Thank you for registering with our service. To complete your registration, please use the verification code provided below. This code is valid for 10 minutes.</p>
               <h3>Verification Code: ${otp}</h3>
               <p>If you did not request this code, please ignore this email.</p>
               <p>Best regards,<br>The Support Team</p>`
    };

    try {
        console.log('Sending mail with options:', JSON.stringify(mailOptions, null, 2));
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
    } catch (error) {
        console.error('Detailed email error:', error);
        throw new Error('Error sending OTP email: ' + error.message);
    }
};

module.exports = {
    sendOtpEmail
};