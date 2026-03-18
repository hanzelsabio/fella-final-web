import { useNavigate } from "react-router-dom";

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[100vh] bg-white text-black text-center"
      style={{ textAlign: "center", padding: "80px 20px" }}
    >
      <h1 style={{ fontSize: "6rem", margin: 0 }}>403</h1>
      <h2>Access Denied</h2>
      <p>You don't have permission to view this page.</p>
      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          marginTop: "24px",
        }}
      >
        <button onClick={() => navigate("/admin/login")}>Admin Login</button>
        <button onClick={() => navigate("/staff/login")}>Staff Login</button>
      </div>
    </div>
  );
};

export default Forbidden;
