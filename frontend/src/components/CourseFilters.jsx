import { FiSearch } from 'react-icons/fi'

export default function CourseFilters({
  search,
  category,
  categories,
  onChange,
}) {
  return (
    <div className="course-filters" aria-label="Course filters">
      <div className="course-search">
        <FiSearch aria-hidden="true" />
        <input
          className="search-box"
          value={search}
          onChange={(event) => onChange('search', event.target.value)}
          placeholder="Search by course title..."
          aria-label="Search by course title"
        />
      </div>
      <select
        value={category}
        onChange={(event) => onChange('category', event.target.value)}
        aria-label="Filter by category"
      >
        <option value="">All categories</option>
        {categories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  )
}
