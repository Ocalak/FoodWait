import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export default function Impressum() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="border-b-2 border-black px-8 py-5 flex items-center gap-4" style={{ background: 'var(--primary)' }}>
        <button onClick={() => setLocation('/')} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-black uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="font-beb text-2xl uppercase tracking-widest text-white">Impressum</h1>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-16 space-y-10 text-foreground">
        <p className="text-sm text-zinc-500 font-medium">Legal disclosure pursuant to § 5 TMG (German Telemedia Act)</p>

        <section className="space-y-3">
          <h2 className="font-beb text-2xl uppercase tracking-wide">Operator</h2>
          <p className="text-base text-zinc-600 leading-relaxed">
            QBite<br />
            Queue Intelligence Platform<br />
            Germany
          </p>
          <p className="text-base text-zinc-600 leading-relaxed">
            <strong>E-Mail:</strong> hello@qbite.app<br />
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-beb text-2xl uppercase tracking-wide">Responsible for Content</h2>
          <p className="text-base text-zinc-600 leading-relaxed">
            Pursuant to § 55 Abs. 2 RStV:<br />
            QBite Team<br />
            Germany
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-beb text-2xl uppercase tracking-wide">Dispute Resolution</h2>
          <p className="text-base text-zinc-600 leading-relaxed">
            The European Commission provides a platform for online dispute resolution (OS): <strong>https://ec.europa.eu/consumers/odr</strong>.
          </p>
          <p className="text-base text-zinc-600 leading-relaxed">
            We are not obliged and not willing to participate in dispute resolution proceedings before a consumer arbitration board.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-beb text-2xl uppercase tracking-wide">Liability for Content</h2>
          <p className="text-base text-zinc-600 leading-relaxed">
            As a service provider, we are responsible for our own content on these pages in accordance with § 7 Abs. 1 TMG. However, according to §§ 8 to 10 TMG, we are not obligated as a service provider to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.
          </p>
          <p className="text-base text-zinc-600 leading-relaxed">
            Obligations to remove or block the use of information under general laws remain unaffected. Liability in this regard is, however, only possible from the time of knowledge of a specific infringement. Upon notification of corresponding violations, we will remove this content immediately.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-beb text-2xl uppercase tracking-wide">Liability for Links</h2>
          <p className="text-base text-zinc-600 leading-relaxed">
            Our offer contains links to external websites of third parties, on whose contents we have no influence. Therefore, we cannot assume any liability for these external contents. The respective provider or operator of the pages is always responsible for the content of the linked pages. The linked pages were checked for possible legal violations at the time of linking. Illegal contents were not recognisable at the time of linking.
          </p>
          <p className="text-base text-zinc-600 leading-relaxed">
            A permanent control of the contents of the linked pages is not reasonable without concrete evidence of a violation. Upon notification of violations, we will remove such links immediately.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-beb text-2xl uppercase tracking-wide">Copyright</h2>
          <p className="text-base text-zinc-600 leading-relaxed">
            The content and works created by the site operators on these pages are subject to German copyright law. Duplication, processing, distribution, or any form of commercialisation of such material beyond the scope of the copyright law shall require the prior written consent of its respective author or creator. Downloads and copies of this site are only permitted for private, non-commercial use.
          </p>
          <p className="text-base text-zinc-600 leading-relaxed">
            Insofar as the content on this site was not created by the operator, the copyrights of third parties are respected. In particular, third-party content is identified as such. Should you nevertheless become aware of a copyright infringement, please inform us accordingly. Upon notification of violations, we will remove such content immediately.
          </p>
        </section>
      </div>

      <div className="border-t-2 border-black/10 py-6 text-center">
        <p className="text-xs text-zinc-400 font-black uppercase tracking-widest">© 2026 QBite · Queue Intelligence Platform</p>
      </div>
    </div>
  );
}
