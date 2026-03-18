import slugify from "../../../components/helper/slugify";

const FeaturedSection = ({ title, items, onItemClick }) => {
  return (
    <section className="max-w-6xl mx-auto pt-10 pb-20 px-8 md:px-20">
      <h2 className="text-xl font-semibold uppercase text-gray-800 text-start">
        {title}
      </h2>
      {items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <button
              key={slugify(item.title)}
              onClick={() => onItemClick(item)}
              className="block p-4 text-center transition-transform duration-200 hover:scale-105"
              style={{ cursor: "pointer" }}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full drop-shadow-[0px_25px_25px_rgba(0,0,0,0.5)] object-contain mb-4"
              />
              <h3 className="text-md font-medium text-gray-800 line-clamp-2 mb-1">
                {item.title}
              </h3>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <p className="text-center text-gray-500 py-30">
            No {title.toLowerCase()} available.
          </p>
        </div>
      )}
    </section>
  );
};

export default FeaturedSection;
