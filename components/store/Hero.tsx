export default function Hero() {
  return (
    <section
      className="px-6 py-20 text-center lg:text-left"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      {/* Main hero container */}
      <div className="mx-auto max-w-6xl">
        {/* Hero layout */}
        <div className="flex flex-col lg:flex-row lg:items-center">
          {/* LEFT SIDE - Hero text */}
          <div className="flex-1">
            {/* Small heading */}
            <p
              className="text-sm font-semibold tracking-wider"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              THE FUTURE OF MOBILE
            </p>

            {/* Main heading */}

            <h1
              className="mt-6 text-5xl font-bold leading-tight sm:text-6xl"
              style={{
                color: "var(--text-primary)",
              }}
            >
              Technology
              <br />
              Made Personal.
            </h1>

            {/* Description */}
            <p
              className="mt-6 max-w-xl text-lg"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              Discover smartphones designed for performance, style and everyday
              life.
            </p>

            {/* Explore button */}
            <a
              href="#phones"
              className="theme-accent-hover mt-8 inline-block cursor-pointer rounded-full px-6 py-3 font-semibold transition"
              style={{
                backgroundColor: "var(--text-primary)",
                color: "var(--bg-primary)",
              }}
            >
              Explore Phones
            </a>
          </div>

          {/* RIGHT SIDE - Tilted phone image */}
          <div className="mt-16 flex flex-1 items-center justify-center lg:mt-0">
            <img
              src="https://img.magnific.com/free-photo/technology-concept-with-futuristic-element_23-2151910959.jpg?semt=ais_test_b&w=740&q=80"
              alt=" Nova systems"
              className="w-64 rotate-6 rounded-3xl object-contain transition duration-500 hover:rotate-3 hover:-translate-y-2 sm:w-72 lg:w-80 hover:drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
