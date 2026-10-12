"use client";

export default function Loader() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-solid"
        style={{
          borderColor: "var(--border-color)",
          borderTopColor: "var(--accent-color)",
        }}
      />
    </div>
  );
}