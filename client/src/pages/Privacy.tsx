import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="border-b-2 border-black px-8 py-5 flex items-center gap-4" style={{ background: 'var(--primary)' }}>
        <button onClick={() => setLocation('/')} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-black uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="font-beb text-2xl uppercase tracking-widest text-white">Privacy Policy</h1>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-16 space-y-10 text-foreground">
        <p className="text-sm text-zinc-500 font-medium">Last updated: April 2026</p>

        <section className="space-y-3">
          <h2 className="font-beb text-2xl uppercase tracking-wide">1. Who We Are</h2>
          <p className="text-base text-zinc-600 leading-relaxed">
            QBite ("we", "our", "us") is a web-based queue intelligence platform that helps users find restaurants and estimate waiting times. QBite is operated as an independent project and can be reached at the contact details provided in our Impressum.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-beb text-2xl uppercase tracking-wide">2. Data We Collect</h2>
          <p className="text-base text-zinc-600 leading-relaxed">
            QBite does not require registration. We collect only the minimum data necessary to provide our service:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-600 text-base">
            <li><strong>Location data</strong> — only when you explicitly tap "Use My Location". This is used solely to find nearby restaurants and is never stored on our servers.</li>
            <li><strong>Search inputs</strong> — food type and city queries you enter. These are processed in real time and not persisted.</li>
            <li><strong>Usage logs</strong> — standard server logs (IP address, browser type, timestamp) retained for up to 7 days for security and debugging purposes.</li>
            <li><strong>Reviews</strong> — if you submit a review, it is stored anonymously without any personal identifier.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-beb text-2xl uppercase tracking-wide">3. How We Use Your Data</h2>
          <p className="text-base text-zinc-600 leading-relaxed">
            We use the data described above exclusively to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-600 text-base">
            <li>Provide real-time queue estimates and restaurant discovery</li>
            <li>Improve the accuracy and performance of our service</li>
            <li>Diagnose technical issues</li>
          </ul>
          <p className="text-base text-zinc-600 leading-relaxed">
            We do not sell, share, or rent your data to third parties. We do not use your data for advertising or profiling.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-beb text-2xl uppercase tracking-wide">4. Cookies</h2>
          <p className="text-base text-zinc-600 leading-relaxed">
            QBite does not use tracking or advertising cookies. We may use a single session cookie to maintain application state (e.g. your current search). This cookie is essential for the service to function and is deleted when you close your browser.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-beb text-2xl uppercase tracking-wide">5. Third-Party Services</h2>
          <p className="text-base text-zinc-600 leading-relaxed">
            QBite may display links to third-party ordering platforms (UberEats, DoorDash, Deliveroo, etc.). When you click these links, you leave QBite and are subject to the privacy policies of those platforms. We have no control over and assume no responsibility for their data practices.
          </p>
          <p className="text-base text-zinc-600 leading-relaxed">
            Map data is provided by OpenStreetMap contributors under the Open Database Licence.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-beb text-2xl uppercase tracking-wide">6. Your Rights (GDPR)</h2>
          <p className="text-base text-zinc-600 leading-relaxed">
            If you are located in the European Union, you have the following rights under the General Data Protection Regulation (GDPR):
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-600 text-base">
            <li>Right to access the personal data we hold about you</li>
            <li>Right to rectification of inaccurate data</li>
            <li>Right to erasure ("right to be forgotten")</li>
            <li>Right to restriction of processing</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
          </ul>
          <p className="text-base text-zinc-600 leading-relaxed">
            To exercise any of these rights, please contact us at the address listed in the Impressum.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-beb text-2xl uppercase tracking-wide">7. Data Security</h2>
          <p className="text-base text-zinc-600 leading-relaxed">
            All data transmission between your browser and our servers is encrypted via HTTPS/TLS. We implement appropriate technical and organisational measures to protect your data against unauthorised access, loss, or misuse.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-beb text-2xl uppercase tracking-wide">8. Changes to This Policy</h2>
          <p className="text-base text-zinc-600 leading-relaxed">
            We may update this Privacy Policy from time to time. Changes will be published on this page with a revised "last updated" date. We encourage you to review this page periodically.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-beb text-2xl uppercase tracking-wide">9. Contact</h2>
          <p className="text-base text-zinc-600 leading-relaxed">
            For any privacy-related queries, please use the contact form on our <button onClick={() => setLocation('/contact')} className="underline font-bold hover:text-primary transition-colors">Contact page</button> or refer to the details in our <button onClick={() => setLocation('/impressum')} className="underline font-bold hover:text-primary transition-colors">Impressum</button>.
          </p>
        </section>
      </div>

      <div className="border-t-2 border-black/10 py-6 text-center">
        <p className="text-xs text-zinc-400 font-black uppercase tracking-widest">© 2026 QBite · Queue Intelligence Platform</p>
      </div>
    </div>
  );
}
