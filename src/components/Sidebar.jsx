import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "My Designs" },
    { to: "/create-design", label: "Create 2D Design" },
    { to: "/design3d", label: "Create 3D Design" },
    { to: "/customize-room", label: "Customize Room" },
    { to: "/explore", label: "Explore" },
    { to: "/profile", label: "Profile" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Dream Space</h3>
        <p>Designer Panel</p>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;