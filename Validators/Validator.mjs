// email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// password validation
const validatePassword = (password) => {
  // Password must be at least 8 characters long
  return password.length >= 8;
};

const validateUserInfo = (userInfo) => {
  if (!userInfo || typeof userInfo !== "object") {
    return false;
  }
  // Additional validation rules for user info object properties
  if (userInfo.name && typeof userInfo.name !== "string") {
    return false;
  }

  if (userInfo.mob_num && typeof userInfo.mob_num !== "string") {
    return false;
  }

  if (userInfo.age && typeof userInfo.age !== "number") {
    return false;
  }

  // Additional validation rules can be added as needed

  return true;
};

const validateDealershipInfo = (dealerInfo) => {
  return true
};

const validateDealershipName = (dealerName) => {
  return true
};

export {
  validateEmail,
  validatePassword,
  validateUserInfo,
  validateDealershipInfo,
  validateDealershipName,
};
