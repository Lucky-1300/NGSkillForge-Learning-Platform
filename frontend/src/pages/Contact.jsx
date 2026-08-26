import { useState } from 'react'
import {
  FiCheckCircle,
  FiClock,
  FiHelpCircle,
  FiMail,
  FiMapPin,
  FiMessageSquare,
  FiSend,
  FiUsers,
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import './CompanyPages.css'

const faqs = [
  {
    q: 'How do course enrollments and assignments work?',
    a: 'Once enrolled in a course, you get immediate access to all learning materials, exercises, and assignment prompts. You can submit assignments anytime from your dashboard and receive grading and mentor feedback.',
  },
  {
    q: 'Can I get a certificate of completion?',
    a: 'Yes! Upon finishing all course modules and receiving passing grades on required assignments, you will automatically be issued a verified digital certificate.',
  },
  {
    q: 'What is your response time for support inquiries?',
    a: 'Our dedicated support team typically replies to technical queries and account assistance within 12 to 24 hours during business days.',
  },
  {
    q: 'Do you offer team training or enterprise bulk licenses?',
    a: 'Yes, we provide custom enterprise plans with centralized team dashboards, progress analytics, and custom learning paths. Reach out using the form above!',
  },
]

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'General Inquiry',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      return toast.error('Please fill in all required fields.')
    }

    setIsSubmitting(true)

    // Simulate API submission
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success('Thank you! Your message has been sent. We will get back to you shortly.')
      setFormData({
        name: '',
        email: '',
        topic: 'General Inquiry',
        subject: '',
        message: '',
      })
    }, 1000)
  }

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="company-hero">
        <div className="container">
          <div className="company-hero-content">
            <span className="company-hero-badge">
              <FiMessageSquare /> Contact Us
            </span>
            <h1>Get in Touch with the NGSkillForge Team</h1>
            <p>
              Have a question about our courses, need technical assistance, or
              want to discuss enterprise learning solutions? We are here to help.
            </p>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="contact-layout">
          {/* Contact Details & Channels */}
          <div className="contact-info-panel">
            <div className="contact-card">
              <div className="contact-icon-box">
                <FiMail />
              </div>
              <div className="contact-card-content">
                <h3>Email Support</h3>
                <p>For student inquiries, account assistance, or general feedback:</p>
                <a href="mailto:support@ngskillforge.com">support@ngskillforge.com</a>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-icon-box">
                <FiClock />
              </div>
              <div className="contact-card-content">
                <h3>Response Times</h3>
                <p>We review every inquiry thoroughly to provide helpful answers.</p>
                <span className="contact-hours-badge">
                  <i /> Typical response: &lt; 12 hours
                </span>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-icon-box">
                <FiMapPin />
              </div>
              <div className="contact-card-content">
                <h3>Global Headquarters</h3>
                <p>NGSkillForge Learning Technologies, Inc.</p>
                <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                  500 Howard Street, Suite 400<br />
                  San Francisco, CA 94105 &amp; Global Remote
                </span>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-icon-box">
                <FiUsers />
              </div>
              <div className="contact-card-content">
                <h3>Community &amp; Partnerships</h3>
                <p>Interested in becoming an instructor or enterprise partner?</p>
                <a href="mailto:partners@ngskillforge.com">partners@ngskillforge.com</a>
              </div>
            </div>
          </div>

          {/* Interactive Contact Form */}
          <div className="contact-form-card">
            <h2>Send Us a Message</h2>
            <p>Fill out the form below and a member of our team will respond soon.</p>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="field">
                  <label htmlFor="name">Your Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="field">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="topic">Topic / Category</label>
                  <select
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Course Questions">Course &amp; Curriculum Questions</option>
                    <option value="Technical Support">Technical &amp; Account Support</option>
                    <option value="Enterprise Training">Enterprise &amp; Team Training</option>
                    <option value="Instructor Application">Instructor Application</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="subject">Subject</label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="Brief summary of your request"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  placeholder="How can we assist you today?"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ width: '100%', padding: '14px', fontSize: '15px' }}
              >
                {isSubmitting ? (
                  'Sending Message...'
                ) : (
                  <>
                    Send Message <FiSend />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* FAQs Section */}
        <section className="contact-faq-section">
          <div className="section-heading">
            <span className="eyebrow">Quick Answers</span>
            <h2>Frequently Asked Questions</h2>
            <p className="muted">
              Find answers to common questions about our platform and learning system.
            </p>
          </div>

          <div className="faq-grid">
            {faqs.map((faq, i) => (
              <div className="faq-item" key={i}>
                <h4>
                  <FiHelpCircle style={{ color: 'var(--primary)', marginRight: '6px', verticalAlign: 'middle' }} />
                  {faq.q}
                </h4>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
