const ProductThumbnail = ({ thumbnails, activeImage, setActiveImage }) => {
  if (thumbnails.length <= 1) return null;

  return (
    <div className="product_details_thumbnail flex overflow-x-auto max-w-lg scrollbar-hide">
      {thumbnails.map((img, index) => (
        <button
          key={index}
          onClick={() => setActiveImage(img)}
          className="flex-shrink-0 p-1 transition-all"
          style={{ cursor: "pointer" }}
        >
          <img
            src={img}
            alt={`Thumbnail ${index + 1}`}
            className="w-30 h-30 object-contain drop-shadow-md"
          />
        </button>
      ))}
    </div>
  );
};

export default ProductThumbnail;
