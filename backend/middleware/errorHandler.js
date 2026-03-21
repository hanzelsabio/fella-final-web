export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const globalErrorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.status ? err.message : "An unexpected error occurred.",
  });
};

export const notFoundHandler = (req, res) => {
  res
    .status(404)
    .json({
      success: false,
      message: `Route ${req.method} ${req.path} not found.`,
    });
};
