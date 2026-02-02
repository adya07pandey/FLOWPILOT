export const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  if (res.headersSent) {
    return next(err); // 🔥 critical guard
  }

  res.status(err.status || 500).json({
    error: err.message || "Something went wrong",
  });
};
