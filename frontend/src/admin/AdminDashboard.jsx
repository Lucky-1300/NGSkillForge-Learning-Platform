import { Link, NavLink } from 'react-router-dom'
import { FiBookOpen, FiFileText, FiUsers, FiLayers } from 'react-icons/fi'

export default function AdminDashboard() {
  return (
    <div className="dashboard-layout">
      <AdminSide />
      <main className="dashboard-main">
        <span className="eyebrow">Admin workspace</span>
        <h1>Keep the platform moving.</h1>
        <p className="muted">
          Manage the learning catalog, people, and assignments from one place.
        </p>
        <div className="summary-grid">
          <Summary icon={<FiBookOpen />} label="Courses" to="/admin/courses" />
          <Summary icon={<FiUsers />} label="Users" to="/admin/users" />
          <Summary icon={<FiFileText />} label="Assignments" to="/admin/assignments" />
        </div>
        <div className="status">
          Use the workspace navigation to review and manage platform content.
        </div>
      </main>
    </div>
  )
}

export function AdminSide() {
  return (
    <aside className="dashboard-side">
      <NavLink to="/admin" end>
        Overview
      </NavLink>
      <NavLink to="/admin/courses">
        Courses
      </NavLink>
      <NavLink to="/admin/users">
        Users
      </NavLink>
      <NavLink to="/admin/assignments">
        Assignments
      </NavLink>
    </aside>
  )
}

function Summary({ icon, label, to }) {
  return (
    <Link className="summary-card" to={to}>
      {icon}
      <strong>{label}</strong>
      <span className="muted" style={{ fontSize: '13px', marginTop: 4 }}>
        Manage {label.toLowerCase()}
      </span>
    </Link>
  )
}
