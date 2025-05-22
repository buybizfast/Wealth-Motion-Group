/**
 * Input validation utilities for form security
 */

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email.trim());
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    // Empty URLs are considered invalid but not malformed
    if (!url || url.trim() === '') return false;
    
    // Add protocol if missing
    let urlToCheck = url;
    if (!url.match(/^https?:\/\//i)) {
      urlToCheck = `https://${url}`;
    }
    
    new URL(urlToCheck);
    return true;
  } catch {
    return false;
  }
};

// Phone number validation
export const isValidPhone = (phone: string): boolean => {
  // Basic phone validation - can be adapted to specific country formats
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s()\-]/g, ''));
};

// Text content sanitization
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  // This is a basic sanitization - for more complex cases, use a library like DOMPurify
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// File validation for common image types
export const isValidImageFile = (file: File): boolean => {
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  return validImageTypes.includes(file.type);
};

// File size validation (in bytes)
export const isValidFileSize = (file: File, maxSizeBytes: number): boolean => {
  return file.size <= maxSizeBytes;
};

// Required field validation
export const isRequired = (value: string | number | boolean | null | undefined): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return true;
  if (typeof value === 'boolean') return true;
  return false;
};

// Length validation
export const isValidLength = (value: string, min: number, max: number): boolean => {
  if (!value) return false;
  const length = value.trim().length;
  return length >= min && length <= max;
};

// Password strength validation
export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Credit card validation (basic Luhn algorithm check)
export const isValidCreditCard = (cardNumber: string): boolean => {
  // Remove non-digits
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let shouldDouble = false;
  
  // Loop from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
}; 