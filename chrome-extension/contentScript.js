function clean(text) {
  return (text || "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function getTextFrom(selector) {
  const el = document.querySelector(selector);
  return el ? clean(el.innerText) : "";
}

function getSectionByHeading(headingText) {
  const headings = Array.from(document.querySelectorAll("h2, h3, span[aria-hidden='true']"));
  const target = headings.find((h) => (h.textContent || "").trim() === headingText);
  if (!target) return null;
  return target.closest("section") || target.parentElement;
}

function extractListItems(section) {
  if (!section) return [];
  const items = Array.from(section.querySelectorAll("li"));
  return items
    .map((li) => clean(li.innerText))
    .filter((t) => t && t.length > 20)
    .slice(0, 25);
}

function extractProfile() {
  const name = clean(getTextFrom("h1"));
  const headline =
    clean(getTextFrom(".text-body-medium.break-words")) ||
    clean(getTextFrom("[data-generated-suggestion-target]"));

  // About section: LinkedIn has multiple layouts; we try a few.
  const aboutSection =
    getSectionByHeading("About") ||
    getSectionByHeading("عن") || // Arabic "About" (best-effort)
    getSectionByHeading("Info");
  const about =
    clean(getTextFrom("section:has(#about)")) ||
    clean(getTextFrom("#about ~ *")) ||
    (aboutSection ? clean(aboutSection.innerText) : "");

  const experienceSection = getSectionByHeading("Experience") || getSectionByHeading("تجربة");
  const experiences = extractListItems(experienceSection);

  const skillsSection = getSectionByHeading("Skills") || getSectionByHeading("مهارات");
  const skills = extractListItems(skillsSection)
    .map((t) => t.split("\n")[0])
    .filter(Boolean)
    .slice(0, 30);

  const parts = [
    name ? `Name: ${name}` : "",
    headline ? `Headline: ${headline}` : "",
    about && about.toLowerCase() !== "about" ? `About:\n${about}` : "",
    experiences.length ? `Experience:\n- ${experiences.join("\n- ")}` : "",
    skills.length ? `Skills:\n- ${skills.join("\n- ")}` : "",
  ].filter(Boolean);

  const text = clean(parts.join("\n\n"));
  return { name, headline, about, experiences, skills, text };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "LR_EXTRACT_PROFILE") {
    try {
      const data = extractProfile();
      sendResponse({ ok: true, data });
    } catch (e) {
      sendResponse({ ok: false, error: String(e?.message || e) });
    }
  }
  return true;
});

