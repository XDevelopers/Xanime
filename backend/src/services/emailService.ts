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


export const sendResetPasswordEmail = async (
  to: string,
  token: string
) => {

  const resetPasswordLink =
    `http://localhost:5173/?token=${token}`;

  const info = await transporter.sendMail({
    from: `"Anime Store" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset Your Password",
    html: `
      <h2>Password Reset</h2>

      <p>
        Click the button below to reset your password.
      </p>

      <a
        href="${resetPasswordLink}"
        style="
          padding:12px 18px;
          background:#4CAF50;
          color:white;
          text-decoration:none;
          border-radius:6px;
        "
      >
        Reset Password
      </a>

      <p>
        This link will expire in 15 minutes.
      </p>
    `,
  });

  console.log("Reset Password Mail:", info);
};

