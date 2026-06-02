import React, { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldAlert } from 'lucide-react'
import Card from '../components/Card'

function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const validate = () => {
    let tempErrors = {}
    if (!name.trim()) tempErrors.name = "Full Name is required"
    if (!email.trim()) {
      tempErrors.email = "Email Address is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = "Email is not valid"
    }
    if (!subject.trim()) tempErrors.subject = "Subject is required"
    if (!message.trim()) tempErrors.message = "Message cannot be empty"
    
    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      setIsSubmitting(true)
      
      // Simulate real API dispatch delay
      setTimeout(() => {
        setIsSubmitting(false)
        setSubmitSuccess(true)
        
        // Reset form
        setName('')
        setEmail('')
        setSubject('')
        setMessage('')
        setErrors({})
      }, 1500)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4 sm:py-6 animate-fade-in text-[var(--text-color)]">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center justify-center bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-health-primary p-2.5 rounded-full mb-2">
          <Mail className="h-6 w-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-color)]">
          Contact Our Health Support Team
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium leading-relaxed">
          Have questions about our AI wellness metrics or want to give feedback? Reach out to us anytime!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Contact Card Info */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[var(--text-color)]">
                Get In Touch
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-semibold leading-relaxed">
                Our support team is dedicated to addressing your wellness queries and enhancing your health awareness experience.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="bg-blue-600/10 text-blue-600 p-2.5 rounded-xl border border-blue-500/15">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xxs font-bold text-[var(--text-muted)] uppercase tracking-wider">Email Us</h4>
                  <p className="text-xs sm:text-sm font-extrabold">anushkaonu@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="bg-purple-600/10 text-purple-600 p-2.5 rounded-xl border border-purple-500/15">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xxs font-bold text-[var(--text-muted)] uppercase tracking-wider">Location</h4>
                  <p className="text-xs sm:text-sm font-extrabold">Dhaka, Bangladesh</p>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--card-border)] pt-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-500">
                <ShieldAlert className="h-4 w-4" />
                <span className="text-xxs font-extrabold uppercase tracking-wider">Urgent Support</span>
              </div>
              <p className="text-xxs text-[var(--text-muted)] leading-relaxed font-semibold">
                Please note this channel is strictly for technical issues or portal feedback. For active, acute clinical emergencies, contact your local medical dispatch (911/112) immediately.
              </p>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Workable Contact Form */}
        <div className="lg:col-span-7">
          <Card className="p-6">
            
            {submitSuccess ? (
              <div className="text-center py-12 space-y-4 animate-fade-in">
                <div className="inline-flex items-center justify-center text-emerald-500 bg-emerald-500/10 p-3 rounded-full mb-1">
                  <CheckCircle2 className="h-10 w-10 animate-bounce" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-emerald-500">Message Sent Successfully!</h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-sm mx-auto font-medium leading-relaxed">
                  Thank you for reaching out! Our wellness support team has received your message and will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="font-extrabold text-sm sm:text-base border-b border-[var(--card-border)] pb-2 mb-2 uppercase tracking-wider">
                  ✉️ Send Us A Message
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Fateha Hossain Anushka"
                      className={`block w-full px-3.5 py-2.5 text-[var(--text-color)] bg-[var(--card-bg)] border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-xs sm:text-sm ${
                        errors.name ? 'border-red-500' : 'border-[var(--card-border)]'
                      }`}
                    />
                    {errors.name && <p className="text-xxs text-red-500 font-bold">{errors.name}</p>}
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="fateha@example.com"
                      className={`block w-full px-3.5 py-2.5 text-[var(--text-color)] bg-[var(--card-bg)] border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-xs sm:text-sm ${
                        errors.email ? 'border-red-500' : 'border-[var(--card-border)]'
                      }`}
                    />
                    {errors.email && <p className="text-xxs text-red-500 font-bold">{errors.email}</p>}
                  </div>
                </div>

                {/* Subject field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Feedback about AI Risk calculations"
                    className={`block w-full px-3.5 py-2.5 text-[var(--text-color)] bg-[var(--card-bg)] border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-xs sm:text-sm ${
                      errors.subject ? 'border-red-500' : 'border-[var(--card-border)]'
                    }`}
                  />
                  {errors.subject && <p className="text-xxs text-red-500 font-bold">{errors.subject}</p>}
                </div>

                {/* Message field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Your Message</label>
                  <textarea
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your feedback or questions here..."
                    className={`block w-full px-3.5 py-2.5 text-[var(--text-color)] bg-[var(--card-bg)] border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-xs sm:text-sm resize-none ${
                      errors.message ? 'border-red-500' : 'border-[var(--card-border)]'
                    }`}
                  ></textarea>
                  {errors.message && <p className="text-xxs text-red-500 font-bold">{errors.message}</p>}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl cursor-pointer shadow-md hover:scale-[1.01] active:translate-y-0.5 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? (
                    <span>Sending Message...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </Card>
        </div>

      </div>
    </div>
  )
}

export default Contact
