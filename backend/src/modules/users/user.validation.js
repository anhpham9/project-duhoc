// User validation functions
const USERNAME_REGEX = /^[A-Za-z][A-Za-z0-9_]{0,49}$/;
const EMAIL_REGEX = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
const VN_PHONE_REGEX = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-9])[0-9]{7}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

// Helper: Trim all string fields in data object
export function trimStringFields(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const trimmed = {};
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            const val = obj[key].trim();
            trimmed[key] = val === '' ? null : val;
        } else {
            trimmed[key] = obj[key];
        }
    }
    return trimmed;
}

// Helper: Trim a single string field
export function trimStringField(value) {
    return (typeof value === 'string') ? value.trim() : value;
}

export function validateName(name) {
    name = trimStringField(name);

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
    username = trimStringField(username);

    if (!username || typeof username !== 'string') {
        return 'USERNAME_REQUIRED';
    }
    if (!USERNAME_REGEX.test(username)) {
        return 'USERNAME_INVALID';
    }
    return null;
}

export function validateEmail(email) {
    email = trimStringField(email);
    
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
    phone = trimStringField(phone);

    if (!phone) return null; // optional
    if (typeof phone !== 'string' || !VN_PHONE_REGEX.test(phone)) {
        return 'PHONE_INVALID';
    }
    return null;
}

export function validateZalo(zalo) {
    zalo = trimStringField(zalo);

    if (!zalo) return null; // optional
    if (typeof zalo !== 'string' || !VN_PHONE_REGEX.test(zalo)) {
        return 'ZALO_INVALID';
    }
    return null;
}

export function validateFacebook(fb) {
    fb = trimStringField(fb);

    if (!fb) return null; // optional
    if (typeof fb !== 'string' || !/^https?:\/\/(www\.)?facebook\.com\/[A-Za-z0-9_.-]+$/.test(fb)) {
        return 'FACEBOOK_INVALID';
    }
    return null;
}

export function validatePassword(password) {
    password = trimStringField(password);
    
    if (!password || typeof password !== 'string') {
        return 'PASSWORD_REQUIRED';
    }
    if (!PASSWORD_REGEX.test(password)) {
        return 'PASSWORD_INVALID';
    }
    return null;
}

// Tổng hợp
export function validateUser({ name, username, email, phone, zalo, fb, password }) {
    const data = trimStringFields({ name, username, email, phone, zalo, fb, password });
    const errors = {};
    const nameErr = validateName(data.name);
    if (nameErr) errors.name = nameErr;
    const usernameErr = validateUsername(data.username);
    if (usernameErr) errors.username = usernameErr;
    const emailErr = validateEmail(data.email);
    if (emailErr) errors.email = emailErr;
    const phoneErr = validatePhone(data.phone);
    if (phoneErr) errors.phone = phoneErr;
    const zaloErr = validateZalo(data.zalo);
    if (zaloErr) errors.zalo = zaloErr;
    const fbErr = validateFacebook(data.fb);
    if (fbErr) errors.fb = fbErr;
    const passwordErr = validatePassword(data.password);
    if (passwordErr) errors.password = passwordErr;
    return errors;
}

export function validateUpdateUser({ name, username, email, phone, zalo, fb }) {
    const data = trimStringFields({ name, username, email, phone, zalo, fb });
    const errors = {};
    const nameErr = validateName(data.name);
    if (nameErr) errors.name = nameErr;
    const usernameErr = validateUsername(data.username);
    if (usernameErr) errors.username = usernameErr;
    const emailErr = validateEmail(data.email);
    if (emailErr) errors.email = emailErr;
    const phoneErr = validatePhone(data.phone);
    if (phoneErr) errors.phone = phoneErr;
    const zaloErr = validateZalo(data.zalo);
    if (zaloErr) errors.zalo = zaloErr;
    const fbErr = validateFacebook(data.fb);
    if (fbErr) errors.fb = fbErr;
    return errors;
}

export function validateProfile({ name, email, phone, zalo, fb }) {
    const data = trimStringFields({ name, email, phone, zalo, fb });
    const errors = {};
    const nameErr = validateName(data.name);
    if (nameErr) errors.name = nameErr;
    const emailErr = validateEmail(data.email);
    if (emailErr) errors.email = emailErr;
    const phoneErr = validatePhone(data.phone);
    if (phoneErr) errors.phone = phoneErr;
    const zaloErr = validateZalo(data.zalo);
    if (zaloErr) errors.zalo = zaloErr;
    const fbErr = validateFacebook(data.fb);
    if (fbErr) errors.fb = fbErr;
    return errors;
}