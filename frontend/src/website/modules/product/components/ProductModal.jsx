import Button from "../../../components/common/Button/Button";
import { getImageUrl } from "../services/productAPI";

const ProductModal = ({ selectedService, product, onClose, onGetQuote }) => {
  if (!selectedService) return null;

  const bodyItems = (() => {
    if (!selectedService.body) return null;
    if (Array.isArray(selectedService.body)) return selectedService.body;
    try {
      const parsed = JSON.parse(selectedService.body);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  })();

  // Resolve service image
  const serviceImage = selectedService?.image
    ? getImageUrl(selectedService.image)
    : null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-auto"
      onClick={onClose}
    >
      <div
        className="services_section rounded-md bg-white shadow-xl p-6 w-full max-w-4xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {serviceImage ? (
            <img
              src={serviceImage}
              alt={selectedService?.title || selectedService?.name}
              className="w-full h-64 md:h-full drop-shadow-[0px_25px_25px_rgba(0,0,0,0.5)] object-contain mx-auto"
            />
          ) : (
            <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
          <div className="space-y-4 text-left px-2">
            <h1 className="text-2xl font-bold text-gray-800">
              {selectedService.title || selectedService.name}
            </h1>
            <p className="text-gray-900 font-medium">
              {selectedService.description}
            </p>
            {bodyItems && (
              <ol className="list-decimal list-inside text-gray-700">
                {bodyItems.map((item, index) => (
                  <li key={index} className="pb-1">
                    {item}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <Button
            onClick={onGetQuote}
            className="rounded-md bg-green-600 hover:bg-green-500"
          >
            Get a Quote
          </Button>
          <Button
            onClick={onClose}
            className="rounded-md bg-black hover:bg-gray-800"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
