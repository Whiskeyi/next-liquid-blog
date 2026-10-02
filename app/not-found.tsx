import Link from "next/link";
import { LocalizedText } from "@/components/localized";

export default function NotFound() {
  return (
    <main className="not-found page-shell">
      <h1>404</h1>
      <p><LocalizedText id="notFound" /></p>
      <Link className="hero-link" href="/">
        <LocalizedText id="backHome" />
      </Link>
    </main>
  );
}
