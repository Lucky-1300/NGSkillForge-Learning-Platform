import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api, { messageFrom } from '../services/api.js'
import Loader from '../components/Loader.jsx'
import { AdminSide } from './AdminDashboard.jsx'

const empty = {
  title: '',
  description: '',
  instructor: '',
  price: '0',
  thumbnail: '',
  notesDocUrl: '',
  category: '',
  level: 'Beginner',
  duration: '',
}

export default function ManageCourses() {
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [state, setState] = useState({ loading: true, error: '' })

  const load = () =>
    api
      .get('/courses/all-courses?limit=100')
      .then(({ data }) => setCourses(data.courses || []))
      .catch((err) => setState({ loading: false, error: messageFrom(err) }))
      .finally(() => setState((s) => ({ ...s, loading: false })))

  useEffect(() => {
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
      }
      const data = editing
        ? await api.put(`/courses/update-course/${editing}`, payload)
        : await api.post('/courses/create-course', payload)
      toast.success(data.data.message)
      setForm(empty)
      setEditing(null)
      load()
    } catch (err) {
      toast.error(messageFrom(err))
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this course?')) return
    try {
      const { data } = await api.delete(`/courses/delete-course/${id}`)
      toast.success(data.message)
      load()
    } catch (err) {
      toast.error(messageFrom(err))
    }
  }

  const getFieldLabel = (key) => {
    if (key === 'notesDocUrl') return 'Google Doc / Cloud Notes URL'
    if (key === 'thumbnail') return 'Thumbnail URL / Name'
    return key[0].toUpperCase() + key.slice(1)
  }

  return (
    <div className="dashboard-layout">
      <AdminSide />
      <main className="dashboard-main">
        <span className="eyebrow">Administration</span>
        <h1>Manage courses</h1>
        <p className="muted">Create and maintain the public learning catalog.</p>

        <form className="admin-form" onSubmit={submit}>
          {Object.keys(empty).map((key) =>
            key === 'level' ? (
              <div className="field" key={key}>
                <label>Level</label>
                <select
                  value={form[key]}
                  onChange={(e) =>
                    setForm({ ...form, [key]: e.target.value })
                  }
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            ) : (
              <div
                className={`field ${key === 'description' ? 'full' : ''}`}
                key={key}
              >
                <label>{getFieldLabel(key)}</label>
                {key === 'description' ? (
                  <textarea
                    required
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  />
                ) : (
                  <input
                    required={key !== 'thumbnail' && key !== 'notesDocUrl'}
                    type={key === 'price' ? 'number' : 'text'}
                    placeholder={key === 'notesDocUrl' ? 'https://docs.google.com/document/d/.../edit' : ''}
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  />
                )}
              </div>
            )
          )}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="btn btn-primary" type="submit">
              {editing ? 'Update course' : 'Create course'}
            </button>
            {editing && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditing(null)
                  setForm(empty)
                }}
              >
                Cancel
              </button>
            )}
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
                  <th>Category</th>
                  <th>Level</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id}>
                    <td>
                      <strong>{course.title}</strong>
                    </td>
                    <td>{course.category}</td>
                    <td>{course.level}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => {
                            setEditing(course._id)
                            setForm({ ...empty, ...course })
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => remove(course._id)}
                        >
                          Delete
                        </button>
                      </div>
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
