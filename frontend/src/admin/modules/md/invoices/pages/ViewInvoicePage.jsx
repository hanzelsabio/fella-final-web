import Breadcrumb from "../../../../components/common/Breadcrumb";
import ViewInvoiceDetails from "../components/ViewInvoiceDetails";

const ViewInvoicePage = () => {
  return (
    <div>
      <Breadcrumb title="Invoice" />
      <ViewInvoiceDetails />
    </div>
  );
};

export default ViewInvoicePage;
