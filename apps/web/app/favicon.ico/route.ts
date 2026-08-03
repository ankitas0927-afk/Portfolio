const faviconSvg = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Ankita Singh">
  <rect width="64" height="64" rx="16" fill="#0f766e"/>
  <path d="M20 44 32 16l12 28h-7l-2.8-7H29.8L27 44zm11-13h5l-2.5-6.8z" fill="#ffffff"/>
</svg>`;

export function GET(): Response {
  return new Response(faviconSvg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
