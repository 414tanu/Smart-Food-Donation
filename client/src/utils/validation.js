export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phonePattern = /^\d{10}$/;

export const validateEmail = (email) => emailPattern.test(email.trim());
export const validatePassword = (password) => password.length >= 8;
export const validatePhone = (phone) => phonePattern.test(phone);
