// frontend/utils/fieldValidation.js

// Trim đầu cuối chuỗi, null/undefined trả về ''
function trimString(str) {
    if (typeof str !== 'string') return '';
    return str.trim();
}

export function validateUsername(username) {
    username = trimString(username);
    if (!username) {
        return 'USERNAME_REQUIRED';
    }
    if (!/^[A-Za-z][A-Za-z0-9_]{0,49}$/.test(username)) {
        return 'USERNAME_INVALID';
    }
    return null;
}

export function validateName(name) {
    name = trimString(name);
    if (!name) {
        return 'NAME_REQUIRED';
    }
    if (name.length > 100) {
        return 'NAME_TOO_LONG';
    }
    return null;
}

export function validateEmail(email) {
    email = trimString(email);
    if (!email) {
        return 'EMAIL_REQUIRED';
    }
    if (email.length > 150) {
        return 'EMAIL_TOO_LONG';
    }
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return 'EMAIL_INVALID';
    }
    return null;
}

export function validatePhone(phone) {
    phone = trimString(phone);
    if (!phone) return null;
    if (!/^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-9])[0-9]{7}$/.test(phone)) {
        return 'PHONE_INVALID';
    }
    return null;
}

export function validateZalo(zalo) {
    zalo = trimString(zalo);
    if (!zalo) return null;
    if (!/^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-9])[0-9]{7}$/.test(zalo)) {
        return 'ZALO_INVALID';
    }
    return null;
}

export function validateFacebook(fb) {
    fb = trimString(fb);
    if (!fb) return null;
    if (!/^(https?:\/\/(www\.)?facebook\.com\/[A-Za-z0-9_.-]+$)/.test(fb)) {
        return 'FACEBOOK_INVALID';
    }
    return null;
}

export function validatePassword(password, isEdit = false) {
    password = trimString(password);
    if (!password && !isEdit) {
        return 'PASSWORD_REQUIRED';
    }
    if (password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
        return 'PASSWORD_INVALID';
    }
    return null;
}

export function validateUser(form, isEdit = false) {
    const errors = {};
    const usernameErr = validateUsername(form.username);
    if (usernameErr) errors.username = usernameErr;
    const nameErr = validateName(form.name);
    if (nameErr) errors.name = nameErr;
    const emailErr = validateEmail(form.email);
    if (emailErr) errors.email = emailErr;
    const phoneErr = validatePhone(form.phone);
    if (phoneErr) errors.phone = phoneErr;
    const zaloErr = validateZalo(form.zalo);
    if (zaloErr) errors.zalo = zaloErr;
    const fbErr = validateFacebook(form.fb);
    if (fbErr) errors.fb = fbErr;
    const passwordErr = validatePassword(form.password, isEdit);
    if (passwordErr) errors.password = passwordErr;
    return errors;
}

export function validateProfile(form) {
    const errors = {};
    const nameErr = validateName(form.name);
    if (nameErr) errors.name = nameErr;
    const emailErr = validateEmail(form.email);
    if (emailErr) errors.email = emailErr;
    const phoneErr = validatePhone(form.phone);
    if (phoneErr) errors.phone = phoneErr;
    const zaloErr = validateZalo(form.zalo);
    if (zaloErr) errors.zalo = zaloErr;
    const fbErr = validateFacebook(form.fb);
    if (fbErr) errors.fb = fbErr;
    return errors;
}
