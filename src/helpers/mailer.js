require('dotenv').config();

const nodemailer = require("nodemailer");
const sgTransport = require('nodemailer-sendgrid-transport');

async function sendEmail(email, code) {
    try {
        const senderAddress = "noreply@astrosri.guru";
        let toAddress = email;
        const smtpPassword = process.env.SENDGRID_API_KEY;
        let subject = "Verify your email";
        // The body of the email for recipients
        var body_html = `<!DOCTYPE>
                <html>
                <body>
                <p>Your authentication code is : </p> <b>${code}</b>
                </body>
                </html>
        `;
        let transporter = nodemailer.createTransport(sgTransport(
            {
                auth: {
                    api_key: smtpPassword
                }
            }
        ));
        // Specify the fields in the email.
        let mailOptions = {
            from: senderAddress,
            to: toAddress,
            subject: subject,
            html: body_html,
        };
        let info = await transporter.sendMail(mailOptions);
        return { error: false };
    } catch (error) {
        console.error("send-email-error", error);
        return {
            error: true,
            message: "Cannot send email",
        };
    }
}
module.exports = { sendEmail };