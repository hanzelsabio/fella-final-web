import BackToTop from "../../../components/helper/BackToTop";
import AnnouncementLayout from "../../../components/layout/Announcement/AnnouncementLayout";
import Banner from "../../../components/layout/Banner/Banner";
import FaqsLayout from "../../../components/layout/FAQ/FaqsLayout";
import FooterLayout from "../../../components/layout/Footer/FooterLayout";
import HeaderLayout from "../../../components/layout/Header/HeaderLayout";
import ReviewsLayout from "../../../components/layout/Reviews/ReviewsLayout";
import "../assets/styles/contact.css";
import ContactLayout from "../components/ContactLayout";

const ContactPage = () => {
  return (
    <>
      <AnnouncementLayout />
      <HeaderLayout />
      <ContactLayout />
      <Banner />
      <FaqsLayout />
      <ReviewsLayout />
      <div className="bg-black text-white">
        <FooterLayout />
      </div>
      <BackToTop />
    </>
  );
};

export default ContactPage;
