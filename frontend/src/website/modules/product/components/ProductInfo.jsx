import { useState } from "react";
import { Share } from "lucide-react";

import Button from "../../../components/common/Button/Button";
import Swatch from "../../../components/common/Swatch/Swatch";
import resolveImageUrl from "../../../../admin/components/helper/resolveImageUrl";

const ProductInfo = ({
  product,
  selectedColorName,
  onSwatchSelect,
  services,
  openModal,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("input");
      el.value = window.location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Only show services that are both active AND assigned to this product
  const activeServices = (services || []).filter(
    (s) => s.status === "active" && (product.services || []).includes(s.id),
  );

  // Parse product.body safely
  const bodyItems = (() => {
    if (!product.body) return null;
    if (Array.isArray(product.body)) return product.body.filter(Boolean);
    if (typeof product.body === "string") {
      try {
        const parsed = JSON.parse(product.body);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {
        // Not JSON — fall through to newline split
      }
      const lines = product.body
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      return lines.length > 0 ? lines : null;
    }
    return null;
  })();

  const sizeChartUrl = resolveImageUrl(
    product.sizeChartImage || product.size_chart,
  );

  return (
    <div className="product_details_content_block space-y-4 lg:text-left">
      <h1 className="text-end text-xl md:text-2xl font-semibold uppercase text-gray-800 pb-10">
        {product.title}
      </h1>

      {/* <p className="text-start text-lg font-medium uppercase text-gray-800">
        {product.price}
      </p> */}

      {/* Product Colorway Swatch */}
      {product.colorways?.length > 0 && (
        <Swatch
          colorways={product.colorways}
          selectedColorName={selectedColorName}
          onSelect={onSwatchSelect}
          showLabel={true}
        />
      )}

      {/* Short description */}
      {product.description && (
        <p className="text-sm text-gray-700 pt-2">{product.description}</p>
      )}

      {/* Body — bullet list */}
      {bodyItems && (
        <ul className="pt-2 text-gray-700 space-y-2">
          {bodyItems.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-700 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )}

      {/* Services */}
      {activeServices.length > 0 && (
        <>
          <p className="pt-6 text-sm font-semibold uppercase">
            Select a service:
          </p>
          <div className="grid grid-cols-1 justify-center gap-4">
            {activeServices.map((service) => (
              <Button
                key={service.id}
                onClick={() => openModal(service)}
                className="w-full rounded-md text-white bg-green-600 hover:bg-green-500"
              >
                {service.title || service.name}
              </Button>
            ))}
          </div>
        </>
      )}

      {/* Size Chart */}
      <p className="pt-6 text-sm font-semibold uppercase">Size Chart:</p>
      {sizeChartUrl ? (
        <img
          src={sizeChartUrl}
          alt={`${product.title} size chart`}
          className="w-full rounded-md"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : (
        <p className="text-sm text-gray-400">No size chart available</p>
      )}

      {/* Share Product */}
      <div className="py-6">
        <button
          onClick={handleShare}
          className="flex items-center justify-start transition-colors"
          style={{ cursor: "pointer" }}
        >
          {copied ? (
            <>
              <span className="text-sm font-semibold pe-2 text-black">
                Link Copied!
              </span>
            </>
          ) : (
            <>
              <span className="text-sm font-semibold uppercase pe-2">
                Share
              </span>
              <Share className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductInfo;
