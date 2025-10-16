import Link from "next/link";

export default function RootPage() {
  return (
    <main style={{ padding: 24, display: "grid", gap: 12 }}>
      <h1>Imagine</h1>
      <Link href="/home">Go to Home</Link>
    </main>
  );
}
