import AnnouncementLayout from "../../../components/layout/Announcement/AnnouncementLayout";
import HeaderLayout from "../../../components/layout/Header/HeaderLayout";
import HeroLayout from "../../../components/layout/Hero/HeroLayout";
import AboutLayout from "../../../components/layout/About/AboutLayout";
import WorksLayout from "../../../components/layout/Works/WorksLayout";
import ReviewsLayout from "../../../components/layout/Reviews/ReviewsLayout";
import FooterLayout from "../../../components/layout/Footer/FooterLayout";
import BackToTop from "../../../components/helper/BackToTop";

// import FooterLayoutTwo from "../../components/layout/Footer/FooterLayoutV2";

import "../../../../assets/styles/global.css";
import ProductLayout from "../../product/components/ProductLayout";
import { ProductProvider } from "../../product/context/ProductContext";

export default function HomePage() {
  return (
    <>
      <AnnouncementLayout />
      <HeaderLayout />
      <HeroLayout />
      <ProductProvider>
        <ProductLayout />
      </ProductProvider>
      <AboutLayout />
      <WorksLayout />
      <ReviewsLayout />
      <div className="text-white">
        <FooterLayout />
        {/* <FooterLayoutTwo /> */}
      </div>
      <BackToTop />
    </>
  );
}
