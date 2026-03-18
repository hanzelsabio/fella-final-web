import Breadcrumb from "../../../../components/common/Breadcrumb";
import InquiriesStats from "../components/InquiriesStats";
import InquiriesTable from "../components/InquiriesTable";

const InquiriesPage = () => {
  return (
    <div>
      <Breadcrumb title="Inquiries" />
      <InquiriesStats />
      <InquiriesTable />
    </div>
  );
};

export default InquiriesPage;
