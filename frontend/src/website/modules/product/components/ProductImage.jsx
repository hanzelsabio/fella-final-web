import ProductThumbnail from "./ProductThumbnail";

const ProductImage = ({ activeImage, product, thumbnails, setActiveImage }) => {
  return (
    <div className="product_details_image_block flex flex-col items-center">
      <div className="product_details_default_image flex flex-col items-center gap-4">
        {activeImage && (
          <img
            src={activeImage}
            alt={product.title}
            className="w-full max-w-md drop-shadow-[0px_25px_25px_rgba(0,0,0,0.5)] object-contain"
          />
        )}
        <ProductThumbnail
          thumbnails={thumbnails}
          activeImage={activeImage}
          setActiveImage={setActiveImage}
        />
      </div>
    </div>
  );
};

export default ProductImage;
