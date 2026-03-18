import Breadcrumb from "../../../../components/common/Breadcrumb";
import ViewProductDetails from "../components/ViewProductDetails";

const ViewProductPage = () => {
  return (
    <div>
      <Breadcrumb title="Products" />
      <ViewProductDetails />
    </div>
  );
};

export default ViewProductPage;
