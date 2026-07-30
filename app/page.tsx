export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-between bg-white px-16 py-32 dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs font-serif text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            This is the start of FixFit platform
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Place your orders now at{" "}
            <a
              href="https://fixfit.in/"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              FixFit.in
            </a>{" "}
            or the center.
          </p>
        </div>
      </main>
    </div>
  );
}
