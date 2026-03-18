import Breadcrumb from "../../../../components/common/Breadcrumb";
import CustomersTable from "../components/CustomersTable";

const CustomersPage = () => {
  return (
    <div>
      <Breadcrumb title="Customers" />
      <CustomersTable />
    </div>
  );
};

export default CustomersPage;
