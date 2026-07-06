import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import pool from "../../db/db.js";
import { sendResetPasswordEmail, sendVerificationEmail } from "../../services/emailService.js";
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetPasswordToken,
  generateVerificationToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyResetPasswordToken,
} from "../../utils/jwt/jwt.js";
import { ActiveStatus, Role } from "../../enum.js";
import { verifyVerificationToken } from "../../utils/jwt/jwt.js";

import { AuthRequest } from "../../middleware/verifyJWT.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      first_name,
      last_name,
      gender,
      email,
      password,
      phone_number,
      street_name,
      city,
      state,
      country,
      pincode,
    } = req.body;

    // Validate input
    if (
      !first_name?.trim() ||
      !last_name?.trim() ||
      !gender ||
      !email?.trim() ||
      !password ||
      !phone_number?.trim() ||
      !street_name?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !country?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    // Normalize Email
    const normalizedEmail = email.trim().toLowerCase();

    // Check existing user
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      normalizedEmail,
    ]);

    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: "Email already registered",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert User
    const result = await pool.query(
      `
      INSERT INTO users
      (
        first_name,
        last_name,
        gender,
        email,
        password,
        phone_number,
        street_name,
        city,
        state,
        country,
        pincode,
        role,
        status,
        email_verified
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,false
      )
      RETURNING
      id,
      first_name,
      last_name,
      email,
      role,
      status,
      email_verified
      `,
      [
        first_name.trim(),
        last_name.trim(),
        gender,
        normalizedEmail,
        hashedPassword,
        phone_number.trim(),
        street_name.trim(),
        city.trim(),
        state.trim(),
        country.trim(),
        pincode.trim(),
        Role.User,
        ActiveStatus.Active,
      ],
    );

    const newUser = result.rows[0];

    const verificationToken = generateVerificationToken(
      newUser.id,
      newUser.email,
    );

    // Send Verification Email
    sendVerificationEmail(normalizedEmail, verificationToken).catch(
      (
        err, //access token in letter we can change verification token
      ) => console.error("Email sending failed:", err),
    );

    // Response
    return res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: newUser,
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    // Step 1 : Validation
    if (!email?.trim() || !password) {
      return res.status(400).json({
        error: "Email and Password are required",
      });
    }

    // Step 2 : Normalize Email
    const normalizedEmail = email.trim().toLowerCase();

    // Step 3 : Find User
    const result = await pool.query(
      `
      SELECT
        id,
        first_name,
        last_name,
        email,
        password,
        role,
        status,
        email_verified,
        refresh_token
      FROM users
      WHERE email = $1
      `,
      [normalizedEmail],
    );

    // Step 4 : User Exists?
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const user = result.rows[0];

    // Step 5 Email Verification Check
    if (!user.email_verified) {
      return res.status(403).json({
        error: "Please verify your email before logging in.",
      });
    }

    // Step 6 : Status Check
    if (user.status === ActiveStatus.Blocked) {
      return res.status(403).json({
        error: "Your account has been blocked. Please contact support.",
      });
    }

    if (user.status === ActiveStatus.InActive) {
      return res.status(403).json({
        error: "Your account is inactive.",
      });
    }

    // Step 7 : Compare Password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Step 8 : Generate Tokens
    const accessToken = generateAccessToken(user.id, user.email);

    // Generate Refresh Token
    const refreshToken = generateRefreshToken(user.id, user.email);

    // Step 9 : Save Refresh Token
    await pool.query(
      `
  UPDATE users
  SET refresh_token = $1,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = $2
  `,
      [refreshToken, user.id],
    );

    // Step 10 : Response
    return res.status(200).json({
      message: "Login Successful",

      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        status: user.status,
        email_verified: user.email_verified,
      },

      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login Error :", error);

    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.query.token as string;

    if (!token) {
      return res.status(400).json({
        error: "Verification token is required",
      });
    }

    const decoded = verifyVerificationToken(token);

    const result = await pool.query(
      `
            UPDATE users
            SET
                email_verified = true,
                updated_at = CURRENT_TIMESTAMP
            WHERE
                id = $1
            RETURNING
                id,
                first_name,
                last_name,
                email
            `,
      [decoded.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json({
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.log("Verify Email Error :", error);

    if (res.headersSent) {
      return next(error);
    }

    return res.status(401).json({
      error: "Invalid or Expired Verification Link",
    });
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    await pool.query(
      `
      UPDATE users
      SET
        refresh_token = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [req.user.id],
    );

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout Error:", error);

    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken: incomingRefreshToken } = req.body;

    if (!incomingRefreshToken) {
      return res.status(400).json({
        error: "Refresh Token is required",
      });
    }
    const decoded = verifyRefreshToken(incomingRefreshToken);
    const result = await pool.query(
      `
SELECT
id,
email,
refresh_token,
role,
status,
email_verified
FROM users
WHERE id=$1
`,
      [decoded.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    const user = result.rows[0];

    if (user.refresh_token !== incomingRefreshToken) {
      return res.status(401).json({
        error: "Invalid Refresh Token",
      });
    }
    if (user.status === ActiveStatus.Blocked) {
      return res.status(403).json({
        error: "Account Blocked",
      });
    }
    if (!user.email_verified) {
      return res.status(403).json({
        error: "Email not verified",
      });
    }
    const newAccessToken = generateAccessToken(user.id, user.email);

    const newRefreshToken = generateRefreshToken(user.id, user.email);
    await pool.query(
      `
UPDATE users
SET
refresh_token=$1,
updated_at=CURRENT_TIMESTAMP
WHERE id=$2
`,
      [newRefreshToken, user.id],
    );
    return res.status(200).json({
      message: "Token Refreshed",

      accessToken: newAccessToken,

      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.log("Refresh Token Error:", error);

    if (res.headersSent) {
      return next(error);
    }

    return res.status(401).json({
      error: "Invalid or Expired Refresh Token",
    });
  }
};

export const getCurrentUser = async (
    req: AuthRequest,
    res: Response
) => {

    return res.status(200).json({
        success:true,
        user:req.user
    });

}



export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
  `
  SELECT
    id,
    email,
    email_verified,
    status
  FROM users
  WHERE email = $1
  `,
  [normalizedEmail]
);
if (result.rows.length === 0) {
  return res.status(200).json({
    message:
      "If an account exists with this email, a password reset link has been sent.",
  });
}
const user = result.rows[0];
if (!user.email_verified) {
  return res.status(403).json({
    error: "Please verify your email first.",
  });
}
if (user.status === ActiveStatus.Blocked) {
  return res.status(403).json({
    error: "Account Blocked",
  });
}
const resetToken = generateResetPasswordToken(
    user.id,
    user.email
);
sendResetPasswordEmail(
  normalizedEmail,
  resetToken
).catch((err) =>
  console.error(err)
);

return res.status(200).json({
  message:
    "If an account exists with this email, a password reset link has been sent.",
});

  } catch (error) {

    console.log("Forgot Password Error:", error);

    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      error: "Internal Server Error",
    });

  }
};


export const resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
)=>{
  const { token, password } = req.body;

if(!token || !password){

    return res.status(400).json({

        error:"Token and Password are required"

    });

}
const decoded = verifyResetPasswordToken(token);
const result = await pool.query(
`
SELECT
id,
email,
status,
email_verified
FROM users
WHERE id=$1
`,
[
decoded.id
]
);
if(result.rows.length===0){

    return res.status(404).json({

        error:"User not found"

    });

}
const user=result.rows[0];

if(user.status===ActiveStatus.Blocked){

    return res.status(403).json({

        error:"Account Blocked"

    });

}
const hashedPassword =
await bcrypt.hash(password,10);

await pool.query(
`
UPDATE users
SET
password=$1,
refresh_token=NULL,
updated_at=CURRENT_TIMESTAMP
WHERE id=$2
`,
[
hashedPassword,
user.id
]
);

return res.status(200).json({

    message:
    "Password reset successfully. Please login again."

});
}

export const resendVerificationEmail=async(req:Request,res:Response,next:NextFunction)=>{
const { email } = req.body;

if (!email?.trim()) {
    return res.status(400).json({
        error: "Email is required"
    });
}


const normalizedEmail = email.trim().toLowerCase();

const result=await pool.query(`
  SELECT
id,
email,
email_verified,
status
FROM users
WHERE email=$1
  `,[normalizedEmail])

  if(result.rows.length===0){
    return res.status(200).json({
     
    message:"If an account exists, a verification email has been sent."

    })
  }

  const user = result.rows[0];
  if (user.email_verified) {

    return res.status(400).json({
        error:"Email is already verified."
    });

}
if (user.status === ActiveStatus.Blocked) {

    return res.status(403).json({
        error:"Account Blocked"
    });

}
const verificationToken =
generateVerificationToken(
    user.id,
    user.email
);
sendVerificationEmail(
  user.email,
  verificationToken
).catch((err) =>
  console.error("Verification Email Error:", err)
);
return res.status(200).json({

    message:
    "If an account exists, a verification email has been sent."

});
}



//change pass

export const changePassword=async(req:AuthRequest,res:Response,next:NextFunction)=>{
  try {
    const { oldPassword, newPassword } = req.body;
  
  if (
      !oldPassword?.trim() ||
      !newPassword?.trim()
  ) {
  
      return res.status(400).json({
          error:"Old Password and New Password are required."
      });
  
   
  }
  
  const result = await pool.query(
  `
  SELECT
  password,
  status
  FROM users
  WHERE id=$1
  `,
  [
      req.user.id
  ]
  );
  if(result.rows.length===0){
  
      return res.status(404).json({
          error:"User not found."
      });
  
  }
  const user=result.rows[0]
  if(user.status===ActiveStatus.Blocked){
  
      return res.status(403).json({
          error:"Account Blocked."
      });
  
  }
  const isPasswordCorrect =
  await bcrypt.compare(
      oldPassword,
      user.password
  );
  if(!isPasswordCorrect){
    return res.status(400).json({
      error:"Old password not match"
    })
  }
  if(oldPassword===newPassword){
  
      return res.status(401).json({
  
          error:"New Password cannot be same as old password."
  
      });
  
  }
  const hashedPassword =
  await bcrypt.hash(newPassword,10);
 await pool.query(
`
UPDATE users
SET
password=$1,
refresh_token=NULL,
updated_at=CURRENT_TIMESTAMP
WHERE id=$2
`,
[
hashedPassword,
req.user.id
]
);

return res.status(200).json({
    message:"Password changed successfully. Please login again."
});
  } catch (error) {
    console.log("Chnage pass error",error)
  }
}


export const cat=async(req:Request,res:Response,next:NextFunction)=>{
console.log("hello i am on admin login!")

return res.status(200).json({
  message:"Hello i Am Admin"
})
}