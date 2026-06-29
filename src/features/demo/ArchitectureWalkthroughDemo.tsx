import { useEffect, useState } from 'react';
import {
  BarChart3,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  CloudUpload,
  Database,
  FileCheck2,
  FileInput,
  FileText,
  Gauge,
  Lock,
  SearchCheck,
  Scale,
  ShieldCheck,
  Users,
  Zap,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

const steps = [
  {
    title: 'G2 Import',
    subtitle: 'Daily bankruptcy court data ingestion',
    icon: CloudUpload,
    color: 'blue',
    status: 'Completed'
  },
  {
    title: 'Placement Import',
    subtitle: 'Client account placement files',
    icon: FileInput,
    color: 'sky',
    status: 'Completed'
  },
  {
    title: 'Scrub',
    subtitle: 'Portfolio bankruptcy detection',
    icon: SearchCheck,
    color: 'emerald',
    status: 'In Progress'
  },
  {
    title: 'Matching Review',
    subtitle: 'Debtor/account/case match scoring',
    icon: Users,
    color: 'violet',
    status: 'Pending'
  },
  {
    title: 'Legal Review',
    subtitle: 'Attorney & case readiness review',
    icon: Scale,
    color: 'amber',
    status: 'Pending'
  },
  {
    title: 'Filing Operations',
    subtitle: 'Generate, submit & track claims',
    icon: FileCheck2,
    color: 'blue',
    status: 'Pending'
  },
  {
    title: 'NDC Payments',
    subtitle: 'Trustee payment import & posting',
    icon: RotateCcw,
    color: 'green',
    status: 'Pending'
  },
  {
    title: 'Reporting',
    subtitle: 'Operations, audit & executive reports',
    icon: BarChart3,
    color: 'purple',
    status: 'Pending'
  }
];

const colorMap: Record<string, string> = {
  blue: 'border-blue-500 shadow-blue-500/40 text-blue-300',
  sky: 'border-sky-500 shadow-sky-500/40 text-sky-300',
  emerald: 'border-emerald-500 shadow-emerald-500/40 text-emerald-300',
  violet: 'border-violet-500 shadow-violet-500/40 text-violet-300',
  amber: 'border-amber-500 shadow-amber-500/40 text-amber-300',
  green: 'border-green-500 shadow-green-500/40 text-green-300',
  purple: 'border-purple-500 shadow-purple-500/40 text-purple-300'
};

export default function ArchitectureWalkthroughDemo() {
  const [active, setActive] = useState(2);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((x) => (x + 1) % steps.length);
    }, 2600);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#020617] text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      <div className="relative p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.25),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.22),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.18),transparent_35%)]" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-sm text-slate-400 mb-2">Demo › Architecture Demo</div>
              <h1 className="text-4xl font-black tracking-tight">
                Bankruptcy Operations Architecture Walkthrough
              </h1>
              <p className="mt-3 text-slate-300 text-lg">
                From data ingestion to claim filing, payment posting, and executive reporting.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 w-80">
              <div className="text-sm font-bold text-slate-300">Workflow Run Progress</div>
              <div className="flex items-center gap-4 mt-4">
                <div className="h-16 w-16 rounded-full border-4 border-blue-500 flex items-center justify-center text-xl font-black">
                  {active + 1}/8
                </div>
                <div>
                  <div className="text-xl font-black">{steps[active].title}</div>
                  <div className="text-emerald-400 font-bold">Live Demo</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-8 gap-5">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === active;
              const isDone = index < active;

              return (
                <div key={step.title} className="relative">
                  <div
                    className={[
                      'relative h-72 rounded-2xl border bg-slate-950/80 p-5 transition-all duration-700',
                      colorMap[step.color],
                      isActive ? 'scale-105 shadow-[0_0_45px]' : 'shadow-lg',
                      isDone ? 'opacity-100' : 'opacity-90'
                    ].join(' ')}
                  >
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 h-11 w-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-black shadow-lg">
                      {index + 1}
                    </div>

                    <div className="mt-6 text-center">
                      <h3 className="text-lg font-black leading-tight min-h-12">{step.title}</h3>

                      <div className="mt-6 flex justify-center">
                        <Icon size={58} strokeWidth={1.8} />
                      </div>

                      <p className="text-sm text-slate-300 mt-6 min-h-12">{step.subtitle}</p>

                      <div
                        className={[
                          'mt-5 rounded-lg py-2 text-sm font-black',
                          isDone
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : isActive
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'bg-slate-800 text-slate-300'
                        ].join(' ')}
                      >
                        {isDone ? 'Completed' : isActive ? 'In Progress' : step.status}
                      </div>
                    </div>
                  </div>

                  {index < steps.length - 1 && (
                    <ArrowRight
                      className="absolute top-32 -right-7 z-20 text-blue-400"
                      size={30}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center px-8">
            {steps.map((_, index) => (
              <div key={index} className="flex flex-1 items-center">
                <div
                  className={[
                    'h-9 w-9 rounded-full border-4 flex items-center justify-center transition-all',
                    index <= active
                      ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_28px_rgba(16,185,129,0.65)]'
                      : 'border-slate-600 bg-slate-900'
                  ].join(' ')}
                >
                  {index < active && <CheckCircle2 size={18} className="text-emerald-300" />}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={[
                      'h-[2px] flex-1 border-t border-dashed',
                      index < active ? 'border-emerald-400' : 'border-slate-600'
                    ].join(' ')}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-12 gap-8">
            <Panel title="DATA SOURCES" className="col-span-3">
              <Source icon={CloudUpload} title="G2 Provider" text="Bankruptcy court data" />
              <Source icon={FileText} title="Client Placement Files" text="Accounts & attributes" />
              <Source icon={Database} title="Internal Sources" text="Accounts, contacts, timeline" />
              <Source icon={RotateCcw} title="Trustee / NDC" text="Payment files & receipts" />
            </Panel>

            <Panel title="XOCKET PLATFORM" className="col-span-6 border-violet-500/60">
              <div className="grid grid-cols-3 gap-5 items-center">
                <div className="space-y-4">
                  <Source icon={CloudUpload} title="Import Engine" text="" compact />
                  <Source icon={ShieldCheck} title="Scrub Engine" text="" compact />
                  <Source icon={Gauge} title="Matching Engine" text="" compact />
                  <Source icon={Zap} title="Workflow Engine" text="" compact />
                </div>

                <div className="h-48 rounded-full border border-violet-500/60 bg-violet-500/10 flex flex-col items-center justify-center shadow-[0_0_60px_rgba(139,92,246,0.4)]">
                  <Database className="text-violet-300" size={52} />
                  <div className="font-black mt-4">CQRS +</div>
                  <div className="text-sm text-slate-300">Modular Monolith</div>
                </div>

                <div className="space-y-4">
                  <Source icon={FileText} title="Document Service" text="" compact />
                  <Source icon={Bell} title="Notification Service" text="" compact />
                  <Source icon={ClipboardCheck} title="Audit & Logging" text="" compact />
                  <Source icon={Lock} title="Security & Access" text="" compact />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-5">
                <div className="rounded-xl bg-slate-950/70 border border-blue-500/30 p-4 text-center">
                  <Database className="mx-auto text-blue-400" />
                  <div className="font-black mt-2">CoreDB</div>
                  <div className="text-slate-400 text-sm">Operational</div>
                </div>
                <div className="rounded-xl bg-slate-950/70 border border-emerald-500/30 p-4 text-center">
                  <Database className="mx-auto text-emerald-400" />
                  <div className="font-black mt-2">BankruptcyDB</div>
                  <div className="text-slate-400 text-sm">Reference</div>
                </div>
              </div>
            </Panel>

            <Panel title="BUSINESS OUTCOMES" className="col-span-3">
              <Source icon={ShieldCheck} title="Accurate Bankruptcy Detection" text="Reduce false positives" />
              <Source icon={Zap} title="Operational Efficiency" text="Automated workflows & queues" />
              <Source icon={ClipboardCheck} title="Compliance & Auditability" text="Full tracking & audit trail" />
              <Source icon={BarChart3} title="Executive Visibility" text="Real-time reporting & KPIs" />
            </Panel>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-950/70 p-6">
            <h2 className="text-blue-300 font-black mb-5">LIVE PROCESS FLOW</h2>

            <div className="grid grid-cols-6 gap-4">
              {[
                ['File Received', 'G2 file landed in staging'],
                ['Validation', 'Schema and format validated'],
                ['Scrubbing', 'Debtor matching logic runs'],
                ['Results', 'Potential bankruptcies identified'],
                ['Queue', 'Ready for matching review'],
                ['Next Step', 'Proceed to legal review']
              ].map(([title, text], i) => (
                <div key={title} className="text-center relative">
                  <div className="mx-auto h-16 w-16 rounded-full bg-blue-500/10 border border-blue-500/60 flex items-center justify-center">
                    {i === active % 6 ? (
                      <SearchCheck className="text-emerald-300 animate-pulse" size={30} />
                    ) : (
                      <FileText className="text-blue-300" size={28} />
                    )}
                  </div>
                  <div className="font-black mt-3">{title}</div>
                  <div className="text-sm text-slate-400 mt-1">{text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  className = '',
  children
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border border-slate-700 bg-slate-950/70 p-5 ${className}`}>
      <h2 className="text-center text-blue-300 font-black mb-5">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Source({
  icon: Icon,
  title,
  text,
  compact
}: {
  icon: React.ElementType;
  title: string;
  text: string;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <Icon className="text-blue-300 shrink-0" size={compact ? 22 : 32} />
      <div>
        <div className="font-black">{title}</div>
        {text && <div className="text-sm text-slate-400">{text}</div>}
      </div>
    </div>
  );
}