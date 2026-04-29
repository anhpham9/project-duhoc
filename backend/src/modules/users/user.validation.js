// User validation functions
const USERNAME_REGEX = /^[A-Za-z][A-Za-z0-9_]{0,49}$/;
const EMAIL_REGEX = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
const VN_PHONE_REGEX = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-9])[0-9]{7}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

export function validateName(name) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return 'NAME_REQUIRED';
    }
    if (name.length > 100) {
        return 'NAME_TOO_LONG';
    }
    if (!/^([A-Za-zÀ-ỹ'’\-\. ]+)$/.test(name)) {
        return 'NAME_INVALID';
    }
    return null;
}

export function validateUsername(username) {
    if (!username || typeof username !== 'string') {
        return 'USERNAME_REQUIRED';
    }
    if (!USERNAME_REGEX.test(username)) {
        return 'USERNAME_INVALID';
    }
    return null;
}

export function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return 'EMAIL_REQUIRED';
    }
    if (email.length > 150) {
        return 'EMAIL_TOO_LONG';
    }
    if (!EMAIL_REGEX.test(email)) {
        return 'EMAIL_INVALID';
    }
    return null;
}

export function validatePhone(phone) {
    if (!phone) return null; // optional
    if (typeof phone !== 'string' || !VN_PHONE_REGEX.test(phone)) {
        return 'PHONE_INVALID';
    }
    return null;
}

export function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return 'PASSWORD_REQUIRED';
    }
    if (!PASSWORD_REGEX.test(password)) {
        return 'PASSWORD_INVALID';
    }
    return null;
}

// Tổng hợp
export function validateUser({ name, username, email, phone, password }) {
    const errors = {};
    const nameErr = validateName(name);
    if (nameErr) errors.name = nameErr;
    const usernameErr = validateUsername(username);
    if (usernameErr) errors.username = usernameErr;
    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;
    const phoneErr = validatePhone(phone);
    if (phoneErr) errors.phone = phoneErr;
    const passwordErr = validatePassword(password);
    if (passwordErr) errors.password = passwordErr;
    return errors;
}

export function validateUpdateUser({ name, username, email, phone }) {
    const errors = {};
    const nameErr = validateName(name);
    if (nameErr) errors.name = nameErr;
    const usernameErr = validateUsername(username);
    if (usernameErr) errors.username = usernameErr;
    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;
    const phoneErr = validatePhone(phone);
    if (phoneErr) errors.phone = phoneErr;
    return errors;
}