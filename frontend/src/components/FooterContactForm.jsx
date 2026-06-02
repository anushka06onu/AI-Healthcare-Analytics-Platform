import React, { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'

function FooterContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const validate = () => {
    let tempErrors = {}
    if (!name.trim()) tempErrors.name = "Name is required"
    if (!email.trim()) {
      tempErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = "Invalid email"
    }
    if (!message.trim()) tempErrors.message = "Message cannot be empty"
    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      setIsSubmitting(true)
      setTimeout(() => {
        setIsSubmitting(false)
        setSubmitSuccess(true)
        setName('')
        setEmail('')
        setMessage('')
        setErrors({})
      }, 1500)
    }
  }

  return (
    <div className="w-full text-left">
      {submitSuccess ? (
        <div className="py-6 text-center space-y-3 animate-fade-in">
          <div className="inline-flex items-center justify-center text-emerald-500 bg-emerald-500/10 p-2.5 rounded-full mb-1">
            <CheckCircle2 className="h-8 w-8 animate-bounce" />
          </div>
          <h4 className="text-sm font-bold text-emerald-500">Message Sent Successfully!</h4>
          <p className="text-xs text-[var(--text-muted)] font-semibold max-w-xs mx-auto leading-relaxed">
            Thank you for reaching out! Our team has received your message and will get back to you shortly.
          </p>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-all"
          >
            Send Another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <h4 className="text-sm font-black text-[var(--text-color)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span>✉️ Send a Message</span>
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-[var(--text-color)]">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className={`block w-full px-3.5 py-2.5 text-sm text-[var(--text-color)] bg-[var(--bg-color)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all ${
                  errors.name ? 'border-red-500 ring-2 ring-red-500/10' : 'border-[var(--card-border)]'
                }`}
              />
              {errors.name && <p className="text-xxs text-red-500 font-extrabold">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-[var(--text-color)]">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@example.com"
                className={`block w-full px-3.5 py-2.5 text-sm text-[var(--text-color)] bg-[var(--bg-color)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all ${
                  errors.email ? 'border-red-500' : 'border-[var(--card-border)]'
                }`}
              />
              {errors.email && <p className="text-xxs text-red-500 font-extrabold">{errors.email}</p>}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-[var(--text-color)]">Your Message</label>
            <textarea
              rows="3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help you?"
              className={`block w-full px-3.5 py-2.5 text-sm text-[var(--text-color)] bg-[var(--bg-color)] border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium resize-none transition-all ${
                errors.message ? 'border-red-500' : 'border-[var(--card-border)]'
              }`}
            ></textarea>
            {errors.message && <p className="text-xxs text-red-500 font-extrabold">{errors.message}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl cursor-pointer shadow-md hover:scale-[1.01] active:translate-y-0.5 disabled:opacity-50 transition-all uppercase tracking-wider"
          >
            {isSubmitting ? (
              <span>Sending...</span>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Send Message</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}

export default FooterContactForm
