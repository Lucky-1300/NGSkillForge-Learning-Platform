import { useEffect, useState } from 'react'
import { FiArrowRight, FiBarChart2, FiCheckCircle, FiClock, FiDownload, FiFileText, FiLock } from 'react-icons/fi'
import api, { messageFrom } from '../services/api.js'
import Loader from '../components/Loader.jsx'
import './Assignments.css'

const statConfig = [
	{ label: 'Total assignments', icon: FiFileText },
	{ label: 'Pending', icon: FiClock },
	{ label: 'In progress', icon: FiBarChart2 },
	{ label: 'Completed', icon: FiCheckCircle },
]

export default function Assignments() {
	const [items, setItems] = useState([])
	const [state, setState] = useState({ loading: true, error: '' })
	useEffect(() => { api.get('/assignments/all-assignments').then(({ data }) => setItems(data.assignments || [])).catch((err) => setState({ loading: false, error: messageFrom(err) })).finally(() => setState((s) => ({ ...s, loading: false }))) }, [])
	const stats = [items.length, items.length, 0, 0]

	return <>
		<header className="assignment-header"><div className="container assignment-header-inner"><div><span className="eyebrow">Practice library</span><h1>Assignments</h1><p>Turn course ideas into practical work.</p></div><div className="assignment-header-mark"><FiBarChart2 /><span>Build your portfolio</span></div></div></header>
		<section className="assignment-section"><div className="container">
			<div className="assignment-stats">{statConfig.map(({ label, icon: Icon }, index) => <div className="assignment-stat" key={label}><span className="assignment-stat-icon"><Icon /></span><div><strong>{state.loading ? '-' : stats[index]}</strong><span>{label}</span></div></div>)}</div>
			<div className="assignment-section-heading"><div><span className="eyebrow">Your practice queue</span><h2>Keep building momentum</h2></div><p className="muted">Download each brief and turn your learning into something tangible.</p></div>
			{state.loading ? <Loader /> : state.error ? <div className="assignment-error" role="alert"><span className="assignment-error-icon"><FiLock /></span><div><h2>Authentication required</h2><p>Please sign in again to access your assignments.</p><small>{state.error}</small></div><a className="btn btn-primary" href="/login">Go to login <FiArrowRight /></a></div> : items.length ? <div className="assignment-grid">{items.map((item) => <article className="assignment-card" key={item._id}><div className="assignment-card-top"><span className="assignment-file-icon"><FiFileText /></span><span className="difficulty-badge">Practice</span></div><h3>{item.title}</h3><span className="assignment-course">{item.course?.title || 'Course assignment'}</span><p>{item.description}</p><div className="assignment-meta"><span><FiClock /> Self-paced</span><span>Brief available</span></div><div className="assignment-progress"><div><span>Progress</span><strong>0%</strong></div><span className="progress-track"><span /></span></div><a className="btn btn-primary assignment-action" href={item.fileUrl} target="_blank" rel="noreferrer"><FiDownload /> Download brief <FiArrowRight /></a></article>)}</div> : <div className="assignment-empty"><FiFileText /><h2>No assignments yet</h2><p>New practice briefs will appear here when they are published.</p></div>}
		</div></section>
	</>
}
