"use strict";

// Only the dismiss button of a compose-area banner is trusted as a starting
// point. Messages, chat rows and search results can quote the notice's wording,
// but they never contain this button, so they are never touched.
const DISMISS_BUTTON =
  'button.ui-alert__dismissaction[data-track-panel-type="ComposeBanner"]';
const BANNER_TEXT = ".ui-alert__content";

// Bidirectional marks and other invisible characters that can surround names.
const INVISIBLE = /[\u200B-\u200F\u202A-\u202E\u2060\u2066-\u2069\uFEFF]/g;

// Translations differ in a final full stop, so it is ignored.
function normalize(text) {
  return text
    .replace(INVISIBLE, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.。।]$/u, "");
}

// A template such as "{memberOne} is out of office" must match the whole banner
// text, with people's names in place of the placeholders.
function templateToPattern(template) {
  return normalize(template)
    .split(/\{member(?:One|Two)\}/)
    .map((literal) => literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".+");
}

const NOTICE = new RegExp(
  `^(?:${NOTICE_TEMPLATES.map(templateToPattern).join("|")})$`,
  "iu"
);

function bannerText(banner) {
  const content = banner.querySelector(BANNER_TEXT);
  return content ? normalize(content.textContent) : "";
}

const hidden = new Set();
// Each button is clicked once per text, so Teams re-rendering a banner it
// refuses to remove cannot cause a click loop.
const clickedText = new WeakMap();
let scheduled = false;

// Teams reuses DOM nodes between chats, so a hidden element may later hold
// something else, which must become visible again.
function restoreReused() {
  for (const banner of hidden) {
    if (!banner.isConnected) {
      hidden.delete(banner);
    } else if (!NOTICE.test(bannerText(banner))) {
      banner.style.removeProperty("display");
      hidden.delete(banner);
    }
  }
}

function update() {
  scheduled = false;
  restoreReused();
  for (const button of document.querySelectorAll(DISMISS_BUTTON)) {
    const banner = button.parentElement;
    const text = bannerText(banner);
    if (!NOTICE.test(text)) continue;
    // Hide first so the notice never paints.
    banner.style.setProperty("display", "none", "important");
    hidden.add(banner);
    // Hiding alone leaves the compose box cropped at the top, apparently because
    // Teams styles it differently while a banner is showing. Dismissing lets
    // Teams render its normal no-banner layout.
    if (clickedText.get(button) !== text) {
      clickedText.set(button, text);
      button.click();
    }
  }
}

new MutationObserver(() => {
  // Run before the next paint so the notice does not flash.
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(update);
  }
}).observe(document.documentElement, {
  childList: true,
  characterData: true,
  subtree: true,
});

update();
