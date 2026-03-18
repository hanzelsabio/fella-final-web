import { ReviewsProvider } from "../context/ReviewsContext";
import ClientReviewList from "../components/ClientReviewList";
import Breadcrumb from "../../../../components/common/Breadcrumb";

const ClientReviewPage = () => (
  <ReviewsProvider>
    <div>
      <Breadcrumb title="Reviews" />
      <ClientReviewList />
    </div>
  </ReviewsProvider>
);

export default ClientReviewPage;
