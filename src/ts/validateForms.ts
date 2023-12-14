const validate_email = (email: string) => {
  const expression = /^[^@]+@\w+(\.\w+)+\w$/;
  if (!expression.test(email) == true) {
    return false; // invvalid email
  }
  return true; // valid email
};

const validate_password = (password: string) => {
  if (password.length < 6) {
    return false; // invalid password format
  }
  return true; // valid password
};

const validate_field = (field: string) => {
  if (field == null || field.length <= 0) {
    return false;
  }

  return true;
};

export { validate_email, validate_field, validate_password };
