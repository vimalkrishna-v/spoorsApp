/**
 * Validates form inputs based on provided data
 * @param {Object} formData - The form data to validate
 * @returns {Object} - Object containing validation errors (if any)
 */
export const validateForm = (formData) => {
  const errors = {};

  // Email validation
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email is invalid';
  }

  // Password validation
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
};

/**
 * Checks if an object has any properties
 * @param {Object} obj - The object to check
 * @returns {boolean} - Whether the object has properties
 */
export const hasErrors = (obj) => {
  return Object.keys(obj).length > 0;
};
