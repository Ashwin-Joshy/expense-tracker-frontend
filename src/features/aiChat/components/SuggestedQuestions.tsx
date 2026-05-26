const QUESTIONS = [
  "What were my top expenses this month?",
  "How much did I spend on food?",
  "Summarize my spending trends",
  "What can I afford to save?",
];

type Props = {
  onSelect: (question: string) => void;
};

export default function SuggestedQuestions({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {QUESTIONS.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="rounded-xl border border-emerald-900/30 bg-zinc-950/40 px-4 py-3 text-left text-sm text-zinc-300 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-zinc-100"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
