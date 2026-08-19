import { FiSearch } from 'react-icons/fi'

export default function EmptyState({ onClear }) {
  return <div className="course-state" role="status"><FiSearch /><h2>No courses found</h2><p>Try changing your search or filters.</p><button className="btn btn-secondary" type="button" onClick={onClear}>Clear filters</button></div>
}
