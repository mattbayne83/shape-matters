export function scrollToAnchor(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  const href = e.currentTarget.getAttribute('href');
  if (!href) return;
  const target = document.querySelector(href);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
