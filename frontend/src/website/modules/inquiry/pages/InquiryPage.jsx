import BackToTop from "../../../components/helper/BackToTop";
import AnnouncementLayout from "../../../components/layout/Announcement/AnnouncementLayout";
import Banner from "../../../components/layout/Banner/Banner";
import FooterLayout from "../../../components/layout/Footer/FooterLayout";
import HeaderLayout from "../../../components/layout/Header/HeaderLayout";
import ReviewsLayout from "../../../components/layout/Reviews/ReviewsLayout";
import InquiryForm from "../components/InquiryForm";

function InquiryPage() {
  return (
    <>
      <AnnouncementLayout />
      <HeaderLayout />
      <Banner />
      <InquiryForm />
      <ReviewsLayout />
      <div className="bg-black text-white">
        <FooterLayout />
      </div>
      <BackToTop />
    </>
  );
}

export default InquiryPage;
