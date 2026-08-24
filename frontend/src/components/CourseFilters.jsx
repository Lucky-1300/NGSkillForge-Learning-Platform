import { FiRotateCcw, FiSearch } from 'react-icons/fi'

export default function CourseFilters({
  search,
  category,
  level,
  sort,
  categories,
  onChange,
  onClear,
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
      <select
        value={level}
        onChange={(event) => onChange('level', event.target.value)}
        aria-label="Filter by level"
      >
        <option value="">All levels</option>
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
      </select>
      <select
        value={sort}
        onChange={(event) => onChange('sort', event.target.value)}
        aria-label="Sort courses"
      >
        <option value="relevance">Sort: Relevance</option>
        <option value="title-asc">Title: A-Z</option>
        <option value="price-low">Price: Low to high</option>
        <option value="price-high">Price: High to low</option>
      </select>
      <button className="filter-clear" type="button" onClick={onClear}>
        <FiRotateCcw /> Clear
      </button>
    </div>
  )
}
