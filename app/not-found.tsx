import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found page-shell">
      <h1>404</h1>
      <p>这个页面暂时没有内容。</p>
      <Link className="hero-link" href="/">
        回到首页
      </Link>
    </main>
  );
}
