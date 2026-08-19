export default function LoadingSkeleton() {
  return <div className="course-grid" aria-label="Loading courses" aria-busy="true">{Array.from({ length: 6 }, (_, index) => <div className="course-skeleton" key={index}><div className="skeleton-block skeleton-visual" /><div className="skeleton-body"><div className="skeleton-block skeleton-line short" /><div className="skeleton-block skeleton-line title" /><div className="skeleton-block skeleton-line" /><div className="skeleton-block skeleton-line" /></div></div>)}</div>
}
