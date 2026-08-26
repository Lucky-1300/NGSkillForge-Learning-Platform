const htmlThumbnail = 'https://res.cloudinary.com/dyjifbrab/image/upload/f_auto,q_auto/html.png'
const cssThumbnail = 'https://res.cloudinary.com/dyjifbrab/image/upload/f_auto,q_auto/css.png'
const javascriptThumbnail = 'https://res.cloudinary.com/dyjifbrab/image/upload/f_auto,q_auto/js.png'
const reactThumbnail = 'https://res.cloudinary.com/dyjifbrab/image/upload/f_auto,q_auto/react-js.png'
const nodeThumbnail = 'https://res.cloudinary.com/dyjifbrab/image/upload/f_auto,q_auto/node.js.png'
const expressThumbnail = 'https://res.cloudinary.com/dyjifbrab/image/upload/f_auto,q_auto/express.png'
const aiMlThumbnail = 'https://res.cloudinary.com/dyjifbrab/image/upload/f_auto,q_auto/aiandml.png'
const mongodbThumbnail = 'https://res.cloudinary.com/dyjifbrab/image/upload/f_auto,q_auto/mongodb.png'
const mysqlThumbnail = 'https://res.cloudinary.com/dyjifbrab/image/upload/f_auto,q_auto/mysql.png'
const gitThumbnail = 'https://res.cloudinary.com/dyjifbrab/image/upload/f_auto,q_auto/git.png'
const dsaThumbnail = 'https://res.cloudinary.com/dyjifbrab/image/upload/f_auto,q_auto/dsa.png'

export {
	htmlThumbnail,
	cssThumbnail,
	javascriptThumbnail,
	reactThumbnail,
	nodeThumbnail,
	expressThumbnail,
	aiMlThumbnail,
	mongodbThumbnail,
	mysqlThumbnail,
	gitThumbnail,
	dsaThumbnail,
}

const thumbnails = [
	// Specific backend & frameworks first
	{ matches: ['express', 'express.js', 'expressjs', 'express js', 'express framework'], image: expressThumbnail },
	{ matches: ['node', 'node.js', 'nodejs', 'node js', 'node api', 'api engineering'], image: nodeThumbnail },
	{ matches: ['react', 'react interface', 'react.js', 'reactjs', 'react js'], image: reactThumbnail },
	{ matches: ['html', 'html5'], image: htmlThumbnail },
	{ matches: ['css', 'css3', 'styling', 'layout', 'layouts'], image: cssThumbnail },
	{ matches: ['mongo', 'mongodb', 'data modeling', 'mongoose', 'nosql'], image: mongodbThumbnail },
	{ matches: ['mysql', 'sql', 'relational', 'sql mastery', 'postgres', 'postgresql'], image: mysqlThumbnail },
	{ matches: ['git', 'github', 'collaborative development', 'version control', 'tools'], image: gitThumbnail },
	{ matches: ['dsa', 'data structures', 'algorithm', 'algorithms'], image: dsaThumbnail },
	{ matches: ['full-stack', 'full stack', 'fullstack', 'mern'], image: reactThumbnail },
	{ matches: ['ai', 'ml', 'aiandml', 'artificial intelligence', 'machine learning'], image: aiMlThumbnail },
	// JavaScript matched last so 'js' doesn't hijack node.js or express.js
	{ matches: ['javascript', 'javascript foundations', 'js foundations', 'vanilla js', 'ecmascript', 'js'], image: javascriptThumbnail },
]

function matchText(text, keyword) {
	if (!text || !keyword) return false
	// Exact substring or word boundary check
	const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i')
	return regex.test(text) || text.includes(keyword)
}

export function thumbnailForCourse(course) {
	if (!course) return null

	if (typeof course === 'string') {
		const search = course.toLowerCase()
		return thumbnails.find(({ matches }) => matches.some((match) => matchText(search, match)))?.image || null
	}

	if (course.thumbnail && typeof course.thumbnail === 'string' && course.thumbnail.trim() !== '') {
		return course.thumbnail.trim()
	}

	const searchTitle = `${course.title || ''} ${course.name || ''} ${course.category || ''} ${course.topic || ''}`.toLowerCase()
	return thumbnails.find(({ matches }) => matches.some((match) => matchText(searchTitle, match)))?.image || null
}



