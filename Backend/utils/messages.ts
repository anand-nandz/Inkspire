export const Messages = {
    Auth: {

        OTP_SENT: `OTP sent to your email for verification.`,
        REGISTER_SUCCESS: `Registration successful.`,
        LOGIN_SUCCESS: `Login successful.`,
        LOGOUT_SUCCESS: `Logged Out successfully...`,
        LOGIN_FAILED: 'Failed to login',
        FAIL_GENERATE_OTP: "Couldn't generate OTP",
        USER_REG_FAILED: 'Failed to register User',
        OTP_EXPIRED: `The OTP has expired. Please request a new one.`,
        INVALID_OTP: `The provided OTP is invalid.`,
        INVALID_TOKEN: 'Invalid Token',
        OTP_VERIFY_FAIL: `OTP verification failed`,
        EMAIL_ALREADY_EXISTS: `This email is already registered.`,
        USER_NOT_FOUND: `User not found. Please register.`,
        INVALID_PASSWORD: `Invalid password. Please try again.`,
        SESSION_EXPIRED: `Cookie expired`,
        ACCOUNT_CREATED: 'Account created successfully!',
        AUTHENTICATION_REQUIRED: 'Authentication required' ,
        NO_REFRESHTOKEN: 'No refresh token provided',
        REFRESHTOKEN_EXP: 'Refresh token expired',
        PASSWORD_RESET_LINK: 'Password reset link sent to your email' ,
        PASSWORD_RESET_SUCCESS: 'Password Reset Successfull',
        INCORRECT_PASSWORD: 'Incorrect Password',
        BLOCKED_BY_ADMIN: 'Blocked by Admin'

    },


    Common: {

        ARTICLE_NOT_FOUND: `Article Not Found.`,
        DATA_SAVED: `Data saved successfully.`,
        LOGOUT_SUCCESS: `You have been logged out successfully.`,
    },

    Warning: {
        UNAUTHORIZED_ACCESS: `Unauthorized access attempt detected.`,
        TOKEN_NOT_VALID: 'Token is not valid',
        INVALID_PAYLOAD: 'Token payload is invalid',
        USER_ID_MISSING: 'User ID is missing',



    }
};
