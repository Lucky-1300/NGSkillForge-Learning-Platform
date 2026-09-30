import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import './theme.css'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import Courses from './pages/Courses.jsx'
import CourseDetails from './pages/CourseDetails.jsx'
import CourseLectures from './pages/CourseLectures.jsx'
import Lesson from './pages/Lesson.jsx'
import TopicHub from './pages/TopicHub.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import VerifyOTP from './pages/VerifyOTP.jsx'
import Assignments from './pages/Assignments.jsx'
import MyEnrollments from './pages/MyEnrollments.jsx'
import Profile from './pages/Profile.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import Terms from './pages/Terms.jsx'
import AdminDashboard from './admin/AdminDashboard.jsx'
import ManageCourses from './admin/ManageCourses.jsx'
import ManageUsers from './admin/ManageUsers.jsx'
import ManageAssignments from './admin/ManageAssignments.jsx'
import ManageAIContent from './admin/ManageAIContent.jsx'
import AdminContentList from './admin/AdminContentList.jsx'
import AdminContentReview from './admin/AdminContentReview.jsx'

import CourseAssessment from './pages/CourseAssessment.jsx'
import ManageAssessments from './admin/ManageAssessments.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import StudentCertificates from './pages/StudentCertificates.jsx'
import CertificateView from './pages/CertificateView.jsx'
import VerifyCertificate from './pages/VerifyCertificate.jsx'
import AdminAnalytics from './admin/AdminAnalytics.jsx'
import SearchResults from './pages/SearchResults.jsx'

function App() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Platform Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/courses/:courseId/lectures" element={<CourseLectures />} />
          <Route path="/courses/:courseId/lectures/:lectureNumber" element={<CourseLectures />} />
          <Route path="/courses/:courseId/learn" element={<CourseLectures />} />
          <Route path="/courses/:courseId/learn/:lectureNumber" element={<CourseLectures />} />
          <Route path="/certificate/:certificateId" element={<CertificateView />} />
          <Route path="/verify-certificate" element={<VerifyCertificate />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* Company & Legal Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/about-us" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/terms-of-service" element={<Terms />} />

          {/* Protected Learner Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/dashboard/certificates" element={<StudentCertificates />} />
            <Route path="/courses/:courseId/assessment" element={<CourseAssessment />} />
            <Route path="/courses/:courseId/topics/:topicId" element={<TopicHub />} />
            <Route path="/courses/:courseId/topics/:topicId/subtopics/:subtopicId" element={<Lesson />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/enrollments" element={<MyEnrollments />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/assessments" element={<ManageAssessments />} />
            <Route path="/admin/content" element={<AdminContentList />} />
            <Route path="/admin/content/:lectureId" element={<AdminContentReview />} />
            <Route path="/admin/courses" element={<ManageCourses />} />
            <Route path="/admin/ai-content" element={<ManageAIContent />} />
            <Route path="/admin/ai-studio" element={<ManageAIContent />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/assignments" element={<ManageAssignments />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
