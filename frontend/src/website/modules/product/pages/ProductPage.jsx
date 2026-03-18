import AnnouncementLayout from "../../../components/layout/Announcement/AnnouncementLayout";
import FooterLayout from "../../../components/layout/Footer/FooterLayout";
import HeaderLayout from "../../../components/layout/Header/HeaderLayout";
import ReviewsLayout from "../../../components/layout/Reviews/ReviewsLayout";
import BackToTop from "../../../components/helper/BackToTop";

import "../assets/styles/product.css";
import ProductLayout from "../components/ProductLayout";

const ProductPage = () => {
  return (
    <>
      <AnnouncementLayout />
      <HeaderLayout />
      <ProductLayout />
      <ReviewsLayout />
      <div className="bg-black text-white">
        <FooterLayout />
      </div>
      <BackToTop />
    </>
  );
};

export default ProductPage;
