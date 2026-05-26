import { Link } from "react-router-dom";

export default function ChatButton() {
  return (
    <Link
      to="/ai-chat"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-emerald-500 hover:scale-105 transition-all duration-200"
      title="Chat with AI"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M12 8a2.83 2.83 0 0 0-4 0 2.83 2.83 0 0 0 0 4 2.83 2.83 0 0 0 4 0 2.83 2.83 0 0 0 0-4Z" />
        <path d="M7.5 13.5c-.93 0-2.07-.2-2.93-.93C3.61 12 3 10.93 3 10a2.83 2.83 0 0 1 4-2.83" />
        <path d="M16.5 13.5c.93 0 2.07-.2 2.93-.93C20.39 12 21 10.93 21 10a2.83 2.83 0 0 0-4-2.83" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
    </Link>
  );
}
