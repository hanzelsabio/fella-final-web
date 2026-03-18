import Breadcrumb from "../../../../components/common/Breadcrumb";
import ViewCustomerDetails from "../components/ViewCustomerDetails";

const ViewCustomerPage = () => {
  return (
    <div>
      <Breadcrumb title="Customers" />
      <ViewCustomerDetails />
    </div>
  );
};

export default ViewCustomerPage;
