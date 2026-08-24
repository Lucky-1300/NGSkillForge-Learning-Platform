import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api, { messageFrom } from '../services/api.js'
import Loader from '../components/Loader.jsx'
import { AdminSide } from './AdminDashboard.jsx'

export default function ManageAssignments() {
  const [items, setItems] = useState([])
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    course: '',
    file: null,
  })
  const [state, setState] = useState({ loading: true, error: '' })

  const load = () =>
    Promise.all([
      api.get('/assignments/all-assignments'),
      api.get('/courses/all-courses?limit=100'),
    ])
      .then(([assignments, catalog]) => {
        setItems(assignments.data.assignments || [])
        setCourses(catalog.data.courses || [])
      })
      .catch((err) => setState({ loading: false, error: messageFrom(err) }))
      .finally(() => setState((s) => ({ ...s, loading: false })))

  useEffect(() => {
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    const body = new FormData()
    body.append('title', form.title)
    body.append('description', form.description)
    body.append('course', form.course)
    body.append('file', form.file)

    try {
      const { data } = await api.post(
        '/assignments/upload-assignment',
        body,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      toast.success(data.message)
      setForm({ title: '', description: '', course: '', file: null })
      load()
    } catch (err) {
      toast.error(messageFrom(err))
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this assignment?')) return
    try {
      const { data } = await api.delete(
        `/assignments/delete-assignment/${id}`
      )
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
        <h1>Manage assignments</h1>
        <p className="muted">Publish practical work alongside a course.</p>

        <form className="admin-form" onSubmit={submit}>
          <div className="field">
            <label>Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Course</label>
            <select
              required
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          <div className="field full">
            <label>Description</label>
            <textarea
              required
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label>File</label>
            <input
              required
              type="file"
              onChange={(e) =>
                setForm({ ...form, file: e.target.files[0] })
              }
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary" type="submit">
              Upload assignment
            </button>
          </div>
        </form>

        {state.loading ? (
          <Loader />
        ) : state.error ? (
          <div className="status error">{state.error}</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Course</th>
                  <th>File</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.title}</strong>
                    </td>
                    <td>{item.course?.title}</td>
                    <td>
                      <a
                        className="auth-link"
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.fileName}
                      </a>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => remove(item._id)}
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
