export function HighlightGrid({ items = [] }) {
  if (!items.length) return null;

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <div key={item} className="rounded-[22px] border border-emerald-100 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <p className="text-sm font-black text-slate-900">{item}</p>
        </div>
      ))}
    </section>
  );
}

export function SectionCards({ sections = [] }) {
  if (!sections.length) return null;

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      {sections.map((section) => (
        <div key={section.heading} className="rounded-[24px] border border-emerald-100 bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <h2 className="text-2xl font-black text-slate-950">{section.heading}</h2>
          {section.body ? <p className="mt-4 text-sm leading-7 text-slate-500">{section.body}</p> : null}
          {section.bullets?.length ? (
            <div className="mt-4 space-y-3">
              {section.bullets.map((bullet) => (
                <div key={bullet} className="flex items-start gap-3">
                  <span className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#16a34a]" />
                  <p className="text-sm leading-7 text-slate-500">{bullet}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </section>
  );
}

export function FaqCards({ items = [] }) {
  if (!items.length) return null;

  return (
    <section className="grid gap-4">
      {items.map(([question, answer]) => (
        <details key={question} className="rounded-[18px] border border-emerald-100 bg-white px-5 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.03)]">
          <summary className="cursor-pointer list-none text-sm font-bold text-slate-800">{question}</summary>
          <p className="mt-3 text-sm leading-7 text-slate-500">{answer}</p>
        </details>
      ))}
    </section>
  );
}
