import { FaqsProvider } from "../context/FaqsContext";
import FaqsTable from "../components/FaqsTable";
import Breadcrumb from "../../../../components/common/Breadcrumb";

const FaqsPage = () => (
  <FaqsProvider>
    <div>
      <Breadcrumb title="FAQs" />
      <FaqsTable />
    </div>
  </FaqsProvider>
);

export default FaqsPage;
