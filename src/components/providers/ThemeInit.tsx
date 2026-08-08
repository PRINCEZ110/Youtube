/**
 * Sets the theme class on <html> before first paint so there's no flash of the
 * wrong theme. Reads the same localStorage key + system preference as
 * ThemeProvider, so client and server state agree after hydration.
 */
export default function ThemeInit() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var t=localStorage.getItem('theme');var dark=t?(t==='dark'):window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',!!dark);}catch(e){}})();`,
      }}
    />
  )
}