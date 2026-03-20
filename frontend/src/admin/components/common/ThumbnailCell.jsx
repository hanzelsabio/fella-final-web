/**
 * ThumbnailCell
 * Renders a 48x48 image thumbnail with a fallback placeholder.
 * Replaces the repeated image/no-image div pattern in ProductTable and DraftProductTable.
 *
 * Usage:
 *   <ThumbnailCell src={imageUrl} alt={product.title} />
 *   <ThumbnailCell src={null} alt="Draft" fallbackLabel="–" />
 */
const ThumbnailCell = ({ src, alt, fallbackLabel = "No image" }) => (
  <div className="h-12 w-12 flex-shrink-0">
    {src ? (
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover rounded"
        onError={(e) => {
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "flex";
        }}
      />
    ) : null}
    <div
      className="w-full h-full bg-gray-200 rounded flex items-center justify-center"
      style={{ display: src ? "none" : "flex" }}
    >
      <span className="text-gray-400 text-xs">{fallbackLabel}</span>
    </div>
  </div>
);

export default ThumbnailCell;
