// utils/userValidator.js

/**
 * Validate user fields for registration or update
 */
const USERNAME_REGEX = /^[A-Za-z][A-Za-z0-9_]{0,49}$/;
const EMAIL_REGEX = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
const VN_PHONE_REGEX = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-9])[0-9]{7}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

export function validateUser({ name, username, email, phone, password }) {
  const errors = {};

  // Name: required, <=100 chars, only letters, spaces, dots, hyphens, apostrophes
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.name = 'NAME_REQUIRED';
  } else if (name.length > 100) {
    errors.name = 'NAME_TOO_LONG';
  } else if (!/^([A-Za-zÀ-ỹ'’\-\. ]+)$/.test(name)) {
    errors.name = 'NAME_INVALID';
  }

  // Username: required, <=50 chars, starts with letter, only letters/numbers/_
  if (!username || typeof username !== 'string') {
    errors.username = 'USERNAME_REQUIRED';
  } else if (!USERNAME_REGEX.test(username)) {
    errors.username = 'USERNAME_INVALID';
  }

  // Email: required, <=150 chars, valid format
  if (!email || typeof email !== 'string') {
    errors.email = 'EMAIL_REQUIRED';
  } else if (email.length > 150) {
    errors.email = 'EMAIL_TOO_LONG';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'EMAIL_INVALID';
  }

  // Phone: optional, if provided must be valid VN phone
  if (phone && typeof phone === 'string') {
    if (!VN_PHONE_REGEX.test(phone)) {
      errors.phone = 'PHONE_INVALID';
    }
  }

  // Password: required, >=8 chars, at least 1 lowercase, 1 uppercase, 1 number
  if (!password || typeof password !== 'string') {
    errors.password = 'PASSWORD_REQUIRED';
  } else if (!PASSWORD_REGEX.test(password)) {
    errors.password = 'PASSWORD_INVALID';
  }

  return errors;
}

// Example usage:
// const errors = validateUser({ name, username, email, phone, password });
// if (Object.keys(errors).length > 0) { ... handle errors ... }
