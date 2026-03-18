import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const getDefaultColor = (p) =>
    p.colorways?.find((c) => c.name.toLowerCase() === "black") ||
    p.colorways?.[0] ||
    null;

  const [selectedColor, setSelectedColor] = useState(() =>
    getDefaultColor(product),
  );
  // Always start with the main product image (first uploaded image)
  const [previewImage, setPreviewImage] = useState(() => product.image || null);

  // Re-sync when product data changes (e.g. after context loads)
  useEffect(() => {
    setSelectedColor(getDefaultColor(product));
    setPreviewImage(product.image || null);
  }, [product]);

  const handleNavigate = () => {
    navigate(`/package/${product.slug}`, {
      state: {
        color: selectedColor,
        image: previewImage,
      },
    });
  };

  return (
    <div className="p-4 flex flex-col justify-between">
      {/* Image + Title */}
      <div onClick={handleNavigate} className="cursor-pointer">
        {previewImage ? (
          <img
            src={previewImage}
            alt={product.title}
            className="w-full h-full object-contain mb-4 drop-shadow-[0px_10px_10px_rgba(0,0,0,0.5)]
                       transition-all duration-500 ease-in-out transform hover:scale-105"
          />
        ) : (
          <div className="w-full h-64 bg-gray-100 rounded mb-4 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
        <h3 className="text-gray-800 font-medium text-center text-md mb-2 line-clamp-2">
          {product.title}
        </h3>
      </div>

      {/* Color Swatches */}
      {product.colorways?.length > 0 && (
        <div className="flex justify-center gap-2 mt-16">
          {product.colorways.map((swatch) => {
            const isActive = selectedColor?.name === swatch.name;
            return (
              <button
                key={swatch.name}
                type="button"
                onClick={() => {
                  setSelectedColor(swatch);
                  setPreviewImage(swatch.image || product.image);
                }}
                className={`w-5 h-5 border transition border-gray-300 rounded-full hover:border-gray-400 ${
                  isActive ? "ring-1 ring-gray-400" : ""
                }`}
                style={{ backgroundColor: swatch.color, cursor: "pointer" }}
                aria-label={swatch.name}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductCard;
