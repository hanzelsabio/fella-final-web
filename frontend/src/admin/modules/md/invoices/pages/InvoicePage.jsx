import Breadcrumb from "../../../../components/common/Breadcrumb";
import InvoiceStats from "../components/InvoiceStats";
import InvoiceTable from "../components/InvoiceTable";

const InvoicePage = () => {
  return (
    <div>
      <Breadcrumb title="Invoice" />
      <InvoiceStats />
      <InvoiceTable />
    </div>
  );
};

export default InvoicePage;
