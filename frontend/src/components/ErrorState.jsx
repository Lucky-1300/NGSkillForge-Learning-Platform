import { FiAlertCircle } from 'react-icons/fi'

export default function ErrorState({ onRetry, detail }) {
  return <div className="course-state error-state" role="alert"><FiAlertCircle /><h2>Unable to load courses</h2><p>Please check your connection and try again.</p>{detail && <small>{detail}</small>}<button className="btn btn-primary" type="button" onClick={onRetry}>Try again</button></div>
}
