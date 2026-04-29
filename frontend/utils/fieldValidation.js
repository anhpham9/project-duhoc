// frontend/utils/fieldValidation.js

export function validateUsername(username) {
    if (!username || typeof username !== 'string') {
        return 'USERNAME_REQUIRED';
    }
    if (!/^[A-Za-z][A-Za-z0-9_]{0,49}$/.test(username)) {
        return 'USERNAME_INVALID';
    }
    return null;
}

export function validateName(name) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return 'NAME_REQUIRED';
    }
    if (name.length > 100) {
        return 'NAME_TOO_LONG';
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
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return 'EMAIL_INVALID';
    }
    return null;
}

export function validatePhone(phone) {
    if (!phone) return null;
    if (!/^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-9])[0-9]{7}$/.test(phone)) {
        return 'PHONE_INVALID';
    }
    return null;
}

export function validatePassword(password, isEdit = false) {
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
    const passwordErr = validatePassword(form.password, isEdit);
    if (passwordErr) errors.password = passwordErr;
    return errors;
}
