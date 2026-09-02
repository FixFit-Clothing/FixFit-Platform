export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background">
      <main className="container flex flex-1 flex-col items-center justify-center py-24 sm:items-start">
        <div className="flex max-w-xl flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <p className="label">FixFit platform</p>
          <h1 className="display-md max-w-lg text-balance">
            This is the start of FixFit platform
          </h1>
          <p className="body-lg max-w-md">
            Place your orders now at{" "}
            <a
              href="https://fixfit.in/"
              className="font-medium text-primary transition-fast hover:text-primary-hover"
            >
              FixFit.in
            </a>{" "}
            or call us at +91 9876543210.
          </p>
        </div>
      </main>
    </div>
  );
}
