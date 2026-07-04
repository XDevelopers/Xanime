import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  const verificationLink =
`http://localhost:3000/api/v1/users/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify Your Email',
    html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
  });
  const info = await transporter.sendMail({
  from: `"Your App" <${process.env.EMAIL_USER}>`,
  to,
  subject: "Verify Your Email",
  html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
});

console.log("Mail Sent:", info);
};

