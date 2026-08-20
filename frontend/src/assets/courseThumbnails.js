import javascriptThumbnail from './js.png'
import reactThumbnail from './react-js.png'
import nodeThumbnail from './node.js.png'
import mongodbThumbnail from './mongodb.png'
import gitThumbnail from './git.png'

const thumbnails = [
	{ matches: ['javascript', 'javascript foundations'], image: javascriptThumbnail },
	{ matches: ['react', 'react interface'], image: reactThumbnail },
	{ matches: ['node', 'api engineering'], image: nodeThumbnail },
	{ matches: ['mongo', 'database', 'data modeling'], image: mongodbThumbnail },
	{ matches: ['git', 'collaborative development'], image: gitThumbnail },
]

export function thumbnailForCourse(course) {
	if (course.thumbnail) return course.thumbnail
	const title = course.title?.toLowerCase() || ''
	return thumbnails.find(({ matches }) => matches.some((match) => title.includes(match)))?.image || null
}
