import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  SiCloudflare,
  SiCss,
  SiDigitalocean,
  SiDocker,
  SiExpress,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiMongodb,
  SiNginx,
  SiNodedotjs,
  SiPuppeteer,
  SiReact,
  SiSocketdotio,
  SiStripe,
  SiTypescript,
} from "react-icons/si";
import excrowScreenshot from "../output/playwright/excrow-current.png";
import freqxIntroduction from "./assets/freqx-introduction.mp4";
import SystemSculpture from "./components/SystemSculpture";

const links = {
  github: "https://github.com/reallav0",
  freqx: "https://github.com/reallav0/freqx",
  freqxRelease: "https://github.com/reallav0/freqx/releases/tag/1.6.0",
  excrow: "https://excrow.xyz",
} as const;

const themeStorageKey = "av0-portfolio-theme";
const legacyThemeStorageKey = "wade-portfolio-theme";

type Theme = "light" | "dark";
type IconName = "arrow" | "arrow-down" | "close" | "code" | "lock" | "menu" | "moon" | "sun" | "volume";
type Capability = {
  name: string;
  description: string;
  items: Array<{ name: string; icon: ReactNode }>;
};

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="M7 17 17 7M8 7h9v9" />,
    "arrow-down": <path d="M12 5v14m-6-6 6 6 6-6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    code: <path d="m8 9-3 3 3 3m8-6 3 3-3 3m-2-9-4 12" />,
    lock: <path d="M7 11V8a5 5 0 0 1 10 0v3m-8 0h6a3 3 0 0 1 3 3v5H6v-5a3 3 0 0 1 3-3Zm3 4v1" />,
    menu: <path d="M4 8h16M4 16h16" />,
    moon: <path d="M20 15.4A8.5 8.5 0 0 1 8.6 4 8.5 8.5 0 1 0 20 15.4Z" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2v2m0 16v2M4.9 4.9l1.5 1.5m11.2 11.2 1.5 1.5M2 12h2m16 0h2M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" />
      </>
    ),
    volume: (
      <>
        <path d="M5 10v4h3l4 3V7l-4 3H5Z" />
        <path d="M15 9.5a4 4 0 0 1 0 5m2-7a7 7 0 0 1 0 9" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

const capabilities: Capability[] = [
  {
    name: "Interface",
    description: "Fast, responsive product surfaces with deliberate interaction detail.",
    items: [
      { name: "JavaScript", icon: <SiJavascript /> },
      { name: "TypeScript", icon: <SiTypescript /> },
      { name: "React", icon: <SiReact /> },
      { name: "HTML", icon: <SiHtml5 /> },
      { name: "CSS", icon: <SiCss /> },
      { name: "EJS", icon: <Icon name="code" /> },
    ],
  },
  {
    name: "Systems",
    description: "Application logic, real-time behavior, identity, and durable data.",
    items: [
      { name: "Node.js", icon: <SiNodedotjs /> },
      { name: "Express.js", icon: <SiExpress /> },
      { name: "REST APIs", icon: <Icon name="code" /> },
      { name: "Socket.io", icon: <SiSocketdotio /> },
      { name: "Authentication", icon: <Icon name="lock" /> },
      { name: "JWT", icon: <Icon name="lock" /> },
      { name: "MongoDB", icon: <SiMongodb /> },
    ],
  },
  {
    name: "Automation",
    description: "Reliable browser workflows for repetitive and testable work.",
    items: [
      { name: "Puppeteer", icon: <SiPuppeteer /> },
      { name: "Playwright", icon: <Icon name="code" /> },
    ],
  },
  {
    name: "Delivery",
    description: "The infrastructure and services that carry products into production.",
    items: [
      { name: "Docker", icon: <SiDocker /> },
      { name: "Git", icon: <SiGit /> },
      { name: "Nginx", icon: <SiNginx /> },
      { name: "Cloudflare", icon: <SiCloudflare /> },
      { name: "Stripe", icon: <SiStripe /> },
      { name: "AWS S3", icon: <Icon name="code" /> },
      { name: "DigitalOcean Spaces", icon: <SiDigitalocean /> },
    ],
  },
];

const navLinks = [
  { href: "#projects", label: "Projects", id: "projects" },
  { href: "#about", label: "About", id: "about" },
  { href: "#skills", label: "Skills", id: "skills" },
  { href: "#contact", label: "Contact", id: "contact" },
] as const;

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = (event: MediaQueryListEvent) => {
      try {
        if (window.localStorage.getItem(themeStorageKey) || window.localStorage.getItem(legacyThemeStorageKey)) return;
      } catch {
        return;
      }
      const nextTheme: Theme = event.matches ? "dark" : "light";
      document.documentElement.dataset.theme = nextTheme;
      setTheme(nextTheme);
    };
    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    const applyTheme = () => {
      document.documentElement.dataset.theme = nextTheme;
      setTheme(nextTheme);
      try {
        window.localStorage.setItem(themeStorageKey, nextTheme);
        window.localStorage.removeItem(legacyThemeStorageKey);
      } catch {
        // The selected theme still applies when local storage is unavailable.
      }
    };
    const page = document as Document & { startViewTransition?: (callback: () => void) => void };
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && page.startViewTransition) page.startViewTransition(applyTheme);
    else applyTheme();
  };

  return { theme, toggleTheme };
}

function Navigation() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const menuRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 761px)");
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      setScrolled(window.scrollY > 24);
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const sections = navLinks.map(({ id }) => document.getElementById(id)).filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current) setActiveSection(current.target.id);
        else if (window.scrollY < window.innerHeight * 0.55) setActiveSection("");
      },
      { rootMargin: "-30% 0px -60%", threshold: [0.01, 0.2] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflowY = "hidden";
    menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
      if (event.key !== "Tab") return;
      const items = [menuButtonRef.current, ...Array.from(menuRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [])].filter((item): item is HTMLButtonElement | HTMLAnchorElement => Boolean(item));
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      menuButtonRef.current?.focus({ preventScroll: true });
    };
  }, [menuOpen]);

  return (
    <header className={`site-nav${scrolled ? " is-scrolled" : ""}`} data-active={activeSection || undefined}>
      <div className="site-nav__bar">
        <a className="brand" href="#top" aria-label="av0, back to top">
          <span>av0</span><span className="brand__suffix" aria-hidden="true">(🥑)</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navLinks.slice(0, 3).map((link) => (
            <a href={link.href} className={activeSection === link.id ? "is-active" : undefined} aria-current={activeSection === link.id ? "location" : undefined} key={link.id}>{link.label}</a>
          ))}
          <a href={links.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="#contact" className={activeSection === "contact" ? "is-active" : undefined} aria-current={activeSection === "contact" ? "location" : undefined}>Contact</a>
        </nav>

        <div className="nav-actions">
          <button className="icon-button" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} aria-pressed={theme === "dark"}><Icon name={theme === "dark" ? "sun" : "moon"} /></button>
          <button ref={menuButtonRef} className="icon-button menu-button" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation"><Icon name={menuOpen ? "close" : "menu"} /></button>
        </div>
      </div>

      <button className={`mobile-nav__scrim${menuOpen ? " is-open" : ""}`} type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation" tabIndex={-1} />
      <nav ref={menuRef} id="mobile-navigation" className={`mobile-nav${menuOpen ? " is-open" : ""}`} aria-label="Mobile navigation" aria-hidden={!menuOpen}>
        <p>Navigate</p>
        {navLinks.map((link, index) => (
          <a href={link.href} onClick={() => setMenuOpen(false)} key={link.id} tabIndex={menuOpen ? 0 : -1}>{link.label}<span>0{index + 1}</span></a>
        ))}
        <a href={links.github} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>GitHub<Icon name="arrow" /></a>
      </nav>
    </header>
  );
}

function ExcrowBrowser({ hero = false }: { hero?: boolean }) {
  return (
    <div className={`excrow-browser${hero ? " excrow-browser--hero" : ""}`}>
      <img src={excrowScreenshot} width="1440" height="900" alt={hero ? "" : "Current Excrow product interface showing its crypto escrow workflow"} loading={hero ? "eager" : "lazy"} />
    </div>
  );
}

function HeroStage() {
  return (
    <figure className="hero-stage" aria-labelledby="hero-stage-caption">
      <div className="hero-stage__label" aria-hidden="true"><span>av0 / SYSTEM (01)</span><span>INTERFACE → INFRASTRUCTURE</span></div>
      <SystemSculpture />
      <figcaption id="hero-stage-caption" className="sr-only">An interactive, layered hardware sculpture representing interface, application logic, and infrastructure.</figcaption>
    </figure>
  );
}

function TextLink({ href, children, primary = false }: { href: string; children: ReactNode; primary?: boolean }) {
  return <a className={`text-link${primary ? " text-link--primary" : ""}`} href={href} target="_blank" rel="noopener noreferrer">{children}<Icon name="arrow" /></a>;
}

function App() {
  const year = new Date().getFullYear();
  const [philosophyIndex, setPhilosophyIndex] = useState(0);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navigation />
      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero__copy page-shell">
            <p className="eyebrow hero__eyebrow"><i aria-hidden="true" />Independent developer</p>
            <h1 id="hero-title">I build <br />software <br /><span>that feels <br />finished.</span></h1>
            <p className="hero__intro">Thoughtful interfaces. Dependable systems. Full-stack products, built from the inside out.</p>
            <div className="hero__actions">
              <a className="button button--primary" href="#projects">Explore my work<Icon name="arrow-down" /></a>
              <a className="button button--quiet" href={links.github} target="_blank" rel="noopener noreferrer"><SiGithub aria-hidden="true" />GitHub</a>
            </div>
          </div>
          <HeroStage />
        </section>

        <section className="work" id="projects" aria-labelledby="projects-title">
          <header className="section-intro" data-reveal>
            <h2 id="projects-title">Selected work <span>(02)</span></h2><p>Different problems. The same attention to detail.</p>
          </header>

          <article className="project project--freqx" aria-labelledby="freqx-title">
            <div className="project-stage project-stage--freqx" data-reveal>
              <div className="stage-caption"><span>FREQX / DESKTOP AUDIO</span><span>(01)</span></div>
              <video className="freqx-video" controls playsInline preload="metadata" aria-label="FreqX introduction">
                <source src={freqxIntroduction} type="video/mp4" />
                <a href={freqxIntroduction}>Watch the FreqX introduction video</a>
              </video>
              <span className="visualization-note">FREQX INTRODUCTION</span>
            </div>
            <div className="project-meta" data-reveal>
              <div className="project-meta__title"><p>01 / Desktop product</p><h3 id="freqx-title">FreqX</h3><strong>Your sounds. Instantly accessible.</strong></div>
              <div className="project-meta__body">
                <p>A Windows soundboard that brings a live microphone and local effects into one Discord-ready output. Boards, hotkeys, per-sound controls, routing, and a custom import protocol keep the experience immediate.</p>
                <ul className="tag-list" aria-label="FreqX technologies"><li>Electron</li><li>JavaScript</li><li>Desktop audio</li><li>Custom protocol</li></ul>
                <div className="project-links"><TextLink href={links.freqx} primary>View source</TextLink><TextLink href={links.freqxRelease}>Windows release</TextLink></div>
                <p className="project-note">Product website currently offline. Source and Windows release available on GitHub.</p>
              </div>
            </div>
          </article>

          <article className="project project--excrow" aria-labelledby="excrow-title">
            <div className="project-stage project-stage--excrow" data-reveal>
              <div className="stage-caption"><span>EXCROW / WEB PRODUCT</span><span>(02)</span></div><ExcrowBrowser />
              <div className="deployment-rail" aria-label="Excrow deployment stack"><span>Cloudflare</span><i /><span>Nginx</span><i /><span>Docker</span><i /><span>Node.js</span></div>
            </div>
            <div className="project-meta" data-reveal>
              <div className="project-meta__title"><p>02 / Full-stack web product</p><h3 id="excrow-title">Excrow</h3><strong>A complex workflow, made clear.</strong></div>
              <div className="project-meta__body">
                <p>A web product that brings agreement, funding, release, and dispute handling into one legible flow, backed by a production-minded full-stack deployment.</p>
                <ul className="tag-list" aria-label="Excrow technologies"><li>Node.js</li><li>Express.js</li><li>Docker</li><li>Nginx</li><li>SSL</li><li>Cloudflare</li></ul>
                <div className="project-links"><TextLink href={links.excrow} primary>Visit project</TextLink></div>
              </div>
            </div>
          </article>
        </section>

        <section className="about" id="about" aria-labelledby="about-title">
          <div className="page-shell">
            <div className="about__heading"><h2 id="about-title" data-reveal>Curiosity.<br />Then code.</h2><span className="about__signature" aria-hidden="true">av0 ( )</span></div>
            <div className="about__details" data-reveal>
              <p className="about__lead">I started coding in sixth grade. By eighth, I was already building for other people.</p>
              <p>I wanted to understand how software worked. That curiosity became years of real projects: interfaces, backend systems, automations, desktop tools, infrastructure, and experiments that began with a useful question.</p>
              <p>I like working across the seams—where product thinking meets engineering, where a polished frontend depends on dependable system behavior, and where shipping is part of the craft.</p>
            </div>
            <div className="about__meta" data-reveal><span><small>Working across</small>Frontend to infrastructure</span><span><small>Languages</small>English · Vietnamese</span></div>
          </div>
        </section>

        <section className="skills page-shell" id="skills" aria-labelledby="skills-title">
          <header className="section-intro section-intro--skills" data-reveal><h2 id="skills-title">Behind the build.</h2><p>From the first interaction to the final deployment.</p></header>
          <div className="capability-rack">
            {capabilities.map((capability, index) => (
              <section className="capability-row" aria-labelledby={`capability-${index}`} data-reveal key={capability.name}>
                <div className="capability-row__intro"><span>0{index + 1}</span><div><h3 id={`capability-${index}`}>{capability.name}</h3><p>{capability.description}</p></div></div>
                <ul className="capability-row__tools">{capability.items.map((item) => <li key={item.name}><span aria-hidden="true">{item.icon}</span>{item.name}</li>)}</ul>
              </section>
            ))}
          </div>
        </section>

        <section className="philosophy" aria-label="Build philosophy" data-reveal>
          <div className="page-shell philosophy__inner">
            <span className="philosophy__label">A SIMPLE APPROACH</span>
            <div className="philosophy__phrases" aria-live="off">
              {["Build real things.", "Learn by shipping.", "Keep moving."].map((phrase, index) => <p className={philosophyIndex === index ? "is-active" : undefined} aria-hidden={philosophyIndex !== index} key={phrase}>{phrase}</p>)}
            </div>
            <p className="philosophy__aside">Make technology useful.<br />Explore what is possible.</p>
            <div className="philosophy__controls" aria-label="Working principles">{["Build real things.", "Learn by shipping.", "Keep moving."].map((phrase, index) => <button type="button" aria-label={phrase} aria-pressed={philosophyIndex === index} onClick={() => setPhilosophyIndex(index)} key={phrase}>0{index + 1}</button>)}</div>
          </div>
        </section>
      </main>

      <footer className="contact" id="contact" aria-labelledby="contact-title">
        <div className="page-shell contact__inner">
          <h2 id="contact-title">Something in mind?</h2>
          <p>I’m interested in ambitious ideas, interesting products, and technical challenges with real edges.</p>
          <a className="button button--light" href={links.github} target="_blank" rel="noopener noreferrer"><SiGithub aria-hidden="true" />Find me on GitHub<Icon name="arrow" /></a>
          <div className="contact__footer"><a href="#top">av0</a><span>Software Developer · English / Vietnamese</span><span>© {year}</span></div>
        </div>
      </footer>
    </>
  );
}

export default App;
