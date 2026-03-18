import Breadcrumb from "../../../../components/common/Breadcrumb";
import AnnouncementList from "../components/AnnouncementList";
import { AnnouncementProvider } from "../context/AnnouncementContext";

const AnnouncementPage = () => {
  return (
    <AnnouncementProvider>
      <div>
        <Breadcrumb title="Announcement" />
        <AnnouncementList />
      </div>
    </AnnouncementProvider>
  );
};

export default AnnouncementPage;
