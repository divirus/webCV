const body = document.body;
const menuButton = document.querySelector('[data-menu-button]');
const nav = document.querySelector('[data-nav]');
const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
const progressBar = document.querySelector('.page-progress');
const yearNode = document.querySelector('[data-current-year]');
const languageButtons = [...document.querySelectorAll('[data-language-option]')];
const translatableNodes = [...document.querySelectorAll('[data-i18n]')];
const attributeNodes = [...document.querySelectorAll('[data-i18n-attr]')];
const revealNodes = [...document.querySelectorAll('.reveal')];
const cvDownloadLinks = [...document.querySelectorAll('[data-cv-download]')];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);
const languageStorageKey = 'dmitry-bardin-cv-language';
const defaultLanguage = 'ru';

const translations = window.cvTranslations ?? {};

const updateCvLinks = (language) => {
  if (!cvDownloadLinks.length) return;

  const fileName = language === 'ru'
    ? 'dmitry-bardin-cv-ru.pdf'
    : 'dmitry-bardin-cv-en.pdf';

  const filePath = `assets/docs/${fileName}`;

  cvDownloadLinks.forEach((link) => {
    link.href = filePath;
    link.setAttribute('download', fileName);
  });
};

const getStoredLanguage = () => {
  try {
    return window.localStorage.getItem(languageStorageKey);
  } catch {
    return null;
  }
};

const saveLanguage = (language) => {
  try {
    window.localStorage.setItem(languageStorageKey, language);
  } catch {
    // Language switching should keep working even when storage is unavailable.
  }
};

const getInitialLanguage = () => {
  const requestedLanguage = new URLSearchParams(window.location.search).get('lang');
  const storedLanguage = getStoredLanguage();
  return translations[requestedLanguage] ? requestedLanguage : translations[storedLanguage] ? storedLanguage : defaultLanguage;
};

const syncLanguageUrl = (language) => {
  const nextUrl = new URL(window.location.href);

  if (language === 'ru') {
    nextUrl.searchParams.delete('lang');
  } else {
    nextUrl.searchParams.set('lang', language);
  }

  window.history.replaceState(null, '', nextUrl);
};

const updateDocumentMeta = ({ description, lang, ogDescription, ogTitle, title }) => {
  document.documentElement.lang = lang;
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', ogTitle);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', ogDescription);
};

const updateTextContent = (dictionary) => {
  translatableNodes.forEach((node) => {
    const translationKey = node.dataset.i18n;
    const translatedText = dictionary.text[translationKey];

    if (typeof translatedText === 'string') {
      node.textContent = translatedText;
    }
  });
};

const updateAttributes = (dictionary) => {
  attributeNodes.forEach((node) => {
    node.dataset.i18nAttr.split(' ').forEach((item) => {
      const [attributeName, translationKey] = item.split(':');
      const translatedValue = dictionary.attributes[translationKey];

      if (attributeName && typeof translatedValue === 'string') {
        node.setAttribute(attributeName, translatedValue);
      }
    });
  });
};

const updateLanguageButtons = (language) => {
  languageButtons.forEach((button) => {
    const isActive = button.dataset.languageOption === language;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
};

const applyLanguage = (language) => {
  const dictionary = translations[language] ?? translations[defaultLanguage];

  if (!dictionary) {
    return;
  }

  updateDocumentMeta(dictionary);
  updateTextContent(dictionary);
  updateAttributes(dictionary);
  updateLanguageButtons(language);
  updateCvLinks(language);

  saveLanguage(language);
  syncLanguageUrl(language);
};

const revealNode = (node) => {
  node.classList.add('is-visible');
};

const isNodeInViewport = (node) => {
  const rect = node.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
};

const revealInitialViewportNodes = () => {
  revealNodes.filter(isNodeInViewport).forEach(revealNode);
};

const closeMenu = () => {
  body.classList.remove('is-menu-open');
  nav?.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
};

const updateProgress = () => {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  progressBar?.style.setProperty('transform', `scaleX(${Math.min(progress, 1)})`);
};

const setActiveNavItem = () => {
  const currentSection = sections
    .map((section) => ({
      id: section.id,
      offset: Math.abs(section.getBoundingClientRect().top - 120),
      visible: section.getBoundingClientRect().top < window.innerHeight * 0.6,
    }))
    .filter((section) => section.visible)
    .sort((a, b) => a.offset - b.offset)[0];

  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('href') === `#${currentSection?.id}`);
  });
};

menuButton?.addEventListener('click', () => {
  const isOpen = nav?.classList.toggle('is-open') ?? false;
  body.classList.toggle('is-menu-open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener('click', closeMenu);
});

languageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selectedLanguage = button.dataset.languageOption;

    if (translations[selectedLanguage]) {
      applyLanguage(selectedLanguage);
      closeMenu();
    }
  });
});

window.addEventListener('scroll', () => {
  updateProgress();
  setActiveNavItem();
}, { passive: true });

window.addEventListener('resize', closeMenu);

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        revealNode(entry.target);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealNodes.forEach((node) => revealObserver.observe(node));
  requestAnimationFrame(revealInitialViewportNodes);
} else {
  revealNodes.forEach(revealNode);
}

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

applyLanguage(getInitialLanguage());
updateProgress();
setActiveNavItem();
