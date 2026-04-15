import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Send, Mail, MessageSquare } from 'lucide-react';

export default function Contact() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, wire this up to a backend endpoint or mailto
    setSent(true);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="border-b-2 border-black px-8 py-5 flex items-center gap-4" style={{ background: 'var(--primary)' }}>
        <button onClick={() => setLocation('/')} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-black uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="font-beb text-2xl uppercase tracking-widest text-white">Contact</h1>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-16">
        <div className="mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-400 mb-3">Get In Touch</p>
          <h2 className="font-beb text-[clamp(2rem,5vw,4rem)] uppercase leading-none text-black mb-4">We'd Love<br />to Hear You.</h2>
          <p className="text-zinc-500 text-base font-medium leading-relaxed max-w-md">
            Got a question, a suggestion, or a bug to report? Fill in the form and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center flex-shrink-0 text-white" style={{ background: 'var(--primary)', boxShadow: '2px 2px 0 #0A0A0A' }}>
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-wider text-black mb-0.5">E-Mail</p>
              <p className="text-zinc-500 text-sm font-medium">hello@qbite.app</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center flex-shrink-0 text-white" style={{ background: 'var(--primary)', boxShadow: '2px 2px 0 #0A0A0A' }}>
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-wider text-black mb-0.5">Response Time</p>
              <p className="text-zinc-500 text-sm font-medium">Within 2 business days</p>
            </div>
          </div>
        </div>

        {sent ? (
          <div className="rounded-2xl border-2 border-black p-10 text-center" style={{ background: 'var(--secondary)', boxShadow: '4px 4px 0 #0A0A0A' }}>
            <div className="font-beb text-4xl uppercase mb-3 text-black">Message Sent!</div>
            <p className="text-black/60 font-medium">Thanks for reaching out. We'll be in touch shortly.</p>
            <button onClick={() => { setForm({ name: '', email: '', subject: '', message: '' }); setSent(false); }}
              className="mt-6 font-black text-sm uppercase tracking-widest px-6 py-2 rounded-xl border-2 border-black bg-black text-white hover:bg-zinc-800 transition-colors">
              Send Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-1.5">Name <span className="text-red-500">*</span></label>
                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl border-2 border-black/20 focus:border-black outline-none text-sm font-medium bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-1.5">E-Mail <span className="text-red-500">*</span></label>
                <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-black/20 focus:border-black outline-none text-sm font-medium bg-white transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-1.5">Subject <span className="text-red-500">*</span></label>
              <select required value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-black/20 focus:border-black outline-none text-sm font-medium bg-white transition-colors">
                <option value="">Select a topic…</option>
                <option value="general">General Enquiry</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="restaurant">Restaurant Data Issue</option>
                <option value="privacy">Privacy / Data Request</option>
                <option value="press">Press & Media</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-1.5">Message <span className="text-red-500">*</span></label>
              <textarea required value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                rows={6} placeholder="Tell us what's on your mind…"
                className="w-full px-4 py-3 rounded-xl border-2 border-black/20 focus:border-black outline-none text-sm font-medium bg-white transition-colors resize-none"
              />
            </div>
            <button type="submit"
              className="flex items-center gap-2 font-beb text-lg uppercase tracking-widest px-8 py-4 rounded-xl border-2 border-black text-black transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--secondary)', boxShadow: '4px 4px 0 #0A0A0A' }}>
              <Send className="w-4 h-4" /> Send Message
            </button>
          </form>
        )}
      </div>

      <div className="border-t-2 border-black/10 py-6 text-center">
        <p className="text-xs text-zinc-400 font-black uppercase tracking-widest">© 2026 QBite · Queue Intelligence Platform</p>
      </div>
    </div>
  );
}
