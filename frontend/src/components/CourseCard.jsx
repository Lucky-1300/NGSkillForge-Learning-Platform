import { Link } from 'react-router-dom'
import { FiArrowUpRight, FiClock, FiCode } from 'react-icons/fi'
import { thumbnailForCourse } from '../assets/courseThumbnails.js'

export default function CourseCard({ course }) {
  const thumbnail = thumbnailForCourse(course)
  return (
    <article className="course-card">
      <div className="course-visual">
        {thumbnail ? <img src={thumbnail} alt={`${course.title} course`} /> : <FiCode />}
      </div>
      <div className="course-body">
        <div className="course-meta">
          <span>{course.category}</span>
          <span>{course.level}</span>
        </div>
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        <div className="course-detail-row">
          <span><FiClock /> {course.duration}</span>
          <strong>{course.price ? `$${course.price}` : 'Free'}</strong>
        </div>
        <div className="course-footer">
          <Link className="btn btn-primary" to={`/courses/${course._id}`}>
            View course <FiArrowUpRight />
          </Link>
        </div>
      </div>
    </article>
  )
}
