const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Admin access only");
  }
  next();
};

export { isAdmin };