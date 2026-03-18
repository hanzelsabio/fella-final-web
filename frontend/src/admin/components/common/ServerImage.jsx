const ServerImage = ({ src, alt, className, onError }) => {
  if (!src) return null;

  const getImageUrl = (imagePath) => {
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    if (imagePath.startsWith("data:image")) {
      return imagePath; // Base64 image
    }
    return `http://localhost:5000${imagePath}`;
  };

  return (
    <img
      src={getImageUrl(src)}
      alt={alt || "Image"}
      className={className}
      onError={(e) => {
        if (onError) {
          onError(e);
        } else {
          e.target.style.display = "none";
        }
      }}
    />
  );
};

export default ServerImage;
