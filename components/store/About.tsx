export default function About() {
  return (
    <section
      id="about"
      className="px-6 py-20"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      {/* Main About container */}
      <div className="mx-auto max-w-6xl">
        {/* About content */}
        <div
          className="rounded-3xl border p-8 md:p-12"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
          }}
        >
          {/* Small label */}
          <p
            className="text-sm font-semibold"
            style={{
              color: "var(--text-primary)",
            }}
          >
            ABOUT
          </p>

          {/* Main heading */}
          <h2
            className="mt-4 max-w-2xl text-3xl font-bold md:text-4xl"
            style={{
              color: "var(--text-primary)",
            }}
          >
            Technology designed around you.
          </h2>

          {/* Description */}
          <p
            className="mt-6 max-w-2xl"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            Our store smartphones that combine thoughtful design, powerful
            performance and technology that fits naturally into everyday life.
          </p>

          {/* Features */}
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <div>
              <h3
                className="text-lg font-bold"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                Premium Design
              </h3>

              <p
                className="mt-2 text-sm "
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                Carefully designed devices with a modern and premium look.
              </p>
            </div>

            {/* Feature 2 */}
            <div>
              <h3 className="text-lg font-bold">Powerful Performance</h3>

              <p className="mt-2 text-sm text-gray-600">
                Fast and reliable performance for work, entertainment and
                everyday use.
              </p>
            </div>

            {/* Feature 3 */}
            <div>
              <h3 className="text-lg font-bold">Smart Technology</h3>

              <p className="mt-2 text-sm text-gray-600">
                Technology designed to make your everyday experience simpler.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
