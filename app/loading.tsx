export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div
        className="w-full max-w-[420px] rounded-[40px] border px-6 py-10 text-center shadow-soft"
        style={{
          background: "var(--shell-background)",
          borderColor: "var(--shell-border)",
          boxShadow: "0 18px 40px rgba(163, 120, 89, 0.16)",
        }}
      >
        <div className="mb-5 flex items-center justify-between">
          <span className="text-[22px]">☁️</span>
          <span className="text-[22px]">✨</span>
        </div>

        <div
          className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-[34px] border-4"
          style={{
            background: "linear-gradient(180deg, #ffe37a 0%, #ffd45f 100%)",
            borderColor: "#2a1f18",
            boxShadow: "0 10px 0 rgba(42, 31, 24, 0.08)",
          }}
        >
          <div className="relative h-10 w-12">
            <span className="absolute left-1 top-1 h-4 w-2 rounded-full bg-[#2a1f18]" />
            <span className="absolute right-1 top-1 h-4 w-2 rounded-full bg-[#2a1f18]" />
            <span className="absolute bottom-0 left-1/2 h-5 w-10 -translate-x-1/2 rounded-b-full border-b-4 border-[#2a1f18]" />
          </div>
        </div>

        <h1 className="kitsch-title-soft mb-3 text-4xl text-[#2a1f18]">Daily OK</h1>
        <p className="korean-copy mx-auto max-w-[18ch] text-lg text-[var(--text-body)]">
          오늘의 OK를 꺼내오는 중이에요.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="h-3 w-3 animate-bounce rounded-full bg-[#ff8a7f] [animation-delay:-0.2s]" />
          <span className="h-3 w-3 animate-bounce rounded-full bg-[#ffd45f] [animation-delay:-0.1s]" />
          <span className="h-3 w-3 animate-bounce rounded-full bg-[#8fd8bf]" />
        </div>
      </div>
    </main>
  );
}
