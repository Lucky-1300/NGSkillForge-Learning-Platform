import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api, { messageFrom } from '../services/api.js'
import Loader from '../components/Loader.jsx'
import { AdminSide } from './AdminDashboard.jsx'

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [state, setState] = useState({ loading: true, error: '' })

  const load = () =>
    api
      .get('/users/all-users')
      .then(({ data }) => setUsers(data.users || []))
      .catch((err) => setState({ loading: false, error: messageFrom(err) }))
      .finally(() => setState((s) => ({ ...s, loading: false })))

  useEffect(() => {
    load()
  }, [])

  const remove = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return
    try {
      const { data } = await api.delete(`/users/delete-user/${id}`)
      toast.success(data.message)
      load()
    } catch (err) {
      toast.error(messageFrom(err))
    }
  }

  return (
    <div className="dashboard-layout">
      <AdminSide />
      <main className="dashboard-main">
        <span className="eyebrow">Administration</span>
        <h1>Manage users</h1>
        <p className="muted">Review the people learning on your platform.</p>

        {state.loading ? (
          <Loader />
        ) : state.error ? (
          <div className="status error">{state.error}</div>
        ) : (
          <div className="table-wrap" style={{ marginTop: 28 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <strong>{user.name}</strong>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className="profile-role"
                        style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          textTransform: 'capitalize',
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => remove(user._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
