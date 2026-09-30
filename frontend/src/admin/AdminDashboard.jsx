import { Link, NavLink } from 'react-router-dom'
import { FiBookOpen, FiFileText, FiUsers, FiCpu, FiCheckSquare, FiAward, FiBarChart2 } from 'react-icons/fi'

export default function AdminDashboard() {
  return (
    <div className="dashboard-layout">
      <AdminSide />
      <main className="dashboard-main">
        <span className="eyebrow">Admin workspace</span>
        <h1>Keep the platform moving.</h1>
        <p className="muted">
          Manage the learning catalog, curriculum review & publishing, assessments, people, and analytics from one place.
        </p>
        <div className="summary-grid">
          <Summary icon={<FiBarChart2 />} label="Analytics & Insights" to="/admin/analytics" description="Platform telemetry, completions & mastery" />
          <Summary icon={<FiCheckSquare />} label="Content Review" to="/admin/content" description="Review, edit & publish notes, tasks, MCQs" />
          <Summary icon={<FiAward />} label="Assessments" to="/admin/assessments" description="Manage course final evaluations" />
          <Summary icon={<FiCpu />} label="AI Content Studio" to="/admin/ai-content" description="Bulk generate AI curriculum" />
          <Summary icon={<FiBookOpen />} label="Courses" to="/admin/courses" />
          <Summary icon={<FiUsers />} label="Users" to="/admin/users" />
          <Summary icon={<FiFileText />} label="Assignments" to="/admin/assignments" />
        </div>
        <div className="status">
          Use the workspace navigation to review and manage platform content and view telemetry.
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
      <NavLink to="/admin/analytics">
        Analytics
      </NavLink>
      <NavLink to="/admin/content">
        Content Review
      </NavLink>
      <NavLink to="/admin/assessments">
        Assessments
      </NavLink>
      <NavLink to="/admin/ai-content">
        AI Content Studio
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

function Summary({ icon, label, to, description }) {
  return (
    <Link className="summary-card" to={to}>
      {icon}
      <strong>{label}</strong>
      <span className="muted" style={{ fontSize: '13px', marginTop: 4 }}>
        {description || `Manage ${label.toLowerCase()}`}
      </span>
    </Link>
  )
}
