const protectRoute = (allowedRoles = []) => {
  return (req, res, next) => {
    // 1. Check whether user is logged in
    if (!req.session.user) {
      return res.status(401).json({
        message: "Unauthorized. Please login first.",
      });
    }

    const user = req.session.user;

    // 2. Check role if roles were provided
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.user_role)) {
      return res.status(403).json({
        message: "Forbidden. You don't have permission.",
      });
    }

    // 3. Make logged-in user available to controllers
    req.user = user;

    next();
  };
};

export default protectRoute;
