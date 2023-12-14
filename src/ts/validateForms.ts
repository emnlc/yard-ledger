const validate_email = (email: string) => {
  const expression = /^[^@]+@\w+(\.\w+)+\w$/;
  if (!expression.test(email) == true) {
    return false; // invvalid email
  }
  return true; // valid email
};

const validate_password = (password: string) => {
  const minLengthRegex = /.{6,}/; // At least 6 characters
  const numberRegex = /\d/; // At least one digit
  const uppercaseRegex = /[A-Z]/; // At least one uppercase letter
  const specialCharRegex = /[!@#$%^&*-]/; // At least one special character

  return (
    minLengthRegex.test(password) &&
    numberRegex.test(password) &&
    uppercaseRegex.test(password) &&
    specialCharRegex.test(password)
  );
};

const validate_field = (field: string) => {
  if (field == null || field.length <= 0) {
    return false;
  }

  return true;
};

export { validate_email, validate_field, validate_password };
