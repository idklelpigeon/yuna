(() => {
  'use strict';

  // This is a browser-side keepsake gate, not server-side access control.
  const PASSPHRASE = 'together forever';
  const AUDIO_PATH = 'audio/sky-snave.mp3';
  const photos = [
  {
    "src": "photos/photo-01.jpg",
    "caption": "you, always",
    "alt": "A full-length photo of Yuna",
    "quote": "If I could give you one thing, I would give you the ability to see yourself through my eyes."
  },
  {
    "src": "photos/photo-02.jpg",
    "caption": "little memories",
    "alt": "A mirrored photo of Yuna",
    "quote": "You make ordinary moments feel extraordinary just by being a part of them."
  },
  {
    "src": "photos/photo-03.jpg",
    "caption": "a quiet moment",
    "alt": "Illustrated character in a snowy scene",
    "quote": "You are a beautiful thought in my busiest moments and a comforting thought when everything finally becomes quiet."
  },
  {
    "src": "photos/photo-04.jpg",
    "caption": "soft skies",
    "alt": "Illustrated character in a snowy scene",
    "quote": "There is something about your presence that makes everything feel a little warmer and a little brighter."
  },
  {
    "src": "photos/photo-05.jpg",
    "caption": "your smile",
    "alt": "A portrait of Yuna wearing glasses",
    "quote": "You would see how your smile can make even my hardest days feel a little easier."
  },
  {
    "src": "photos/photo-06.jpg",
    "caption": "a favorite hello",
    "alt": "A portrait of Yuna smiling",
    "quote": "A simple thought of you has made an ordinary day feel special."
  },
  {
    "src": "photos/photo-07.jpg",
    "caption": "side by side",
    "alt": "A mirrored portrait of Yuna",
    "quote": "I want to create more of those memories with you, one conversation and one beautiful day at a time."
  },
  {
    "src": "photos/photo-08.jpg",
    "caption": "one of my favorites",
    "alt": "A casual portrait of Yuna",
    "quote": "You have become one of those rare people who can make a difference in my day without even trying."
  },
  {
    "src": "photos/photo-09.jpg",
    "caption": "your little world",
    "alt": "A portrait of Yuna in a dark room",
    "quote": "I want you to be yourself around me, with all your little habits, your dreams, your fears, and your beautiful imperfections."
  },
  {
    "src": "photos/photo-10.jpg",
    "caption": "bright days",
    "alt": "A portrait of Yuna wearing a cap",
    "quote": "I would choose a thousand reasons for you to smile."
  },
  {
    "src": "photos/photo-11.jpg",
    "caption": "just you",
    "alt": "A portrait of Yuna in a car",
    "quote": "Thank you for being Yuna, for being the person you are, and for bringing your own special kind of beauty into my life."
  },
  {
    "src": "photos/photo-12.jpg",
    "caption": "soft light",
    "alt": "A portrait of Yuna in soft light",
    "quote": "I want you to feel appreciated, respected, understood, and genuinely loved."
  },
  {
    "src": "photos/photo-13.jpg",
    "caption": "study date",
    "alt": "Yuna sitting at a desk",
    "quote": "I want to celebrate your happiest moments and remind you of your strength when life becomes difficult."
  },
  {
    "src": "photos/photo-14.jpg",
    "caption": "another reason to smile",
    "alt": "A close-up portrait of Yuna",
    "quote": "You mean more to me than these words could ever explain."
  }
];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const gate = $('#gate');
  const siteContent = $('#site-content');
  const form = $('#unlock-form');
  const input = $('#passphrase');
  const passwordShell = $('#password-shell');
  const passwordStatus = $('#password-status');
  const modal = $('#photo-modal');
  const modalImage = $('#modal-image');
  const modalCaption = $('#modal-caption');
  const modalCounter = $('#modal-counter');
  const modalClose = $('#modal-close');
  const modalPrev = $('#modal-prev');
  const modalNext = $('#modal-next');
  const musicToggle = $('#music-toggle');
  const musicIcon = $('#music-icon');
  const musicStatus = $('#music-status');
  const backgroundAudio = $('#background-audio');

  let activePhotoIndex = 0;
  let modalOpener = null;
  let requestedPlay = false;
  let isPlaying = false;

  function normalizePhrase(value) {
    return String(value)
      .normalize('NFKC')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .toLowerCase()
      .replace(/[^a-z]/g, '');
  }

  function openSite() {
    gate.hidden = true;
    siteContent.hidden = false;
    siteContent.removeAttribute('aria-hidden');
    document.body.classList.add('site-open');
    $('#hero-heading').setAttribute('tabindex', '-1');
    $('#hero-heading').focus({ preventScroll: true });
    requestPlay();
  }

  function lockSite() {
    closePhotoModal(false);
    pauseMusic();
    siteContent.hidden = true;
    siteContent.setAttribute('aria-hidden', 'true');
    gate.hidden = false;
    document.body.classList.remove('site-open');
    input.value = '';
    passwordStatus.textContent = '';
    passwordShell.classList.remove('has-error');
    input.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (normalizePhrase(input.value) === normalizePhrase(PASSPHRASE)) {
      passwordStatus.textContent = '';
      passwordShell.classList.remove('has-error');
      openSite();
      return;
    }
    passwordShell.classList.remove('shake');
    // Restart the animation on repeated incorrect attempts.
    void passwordShell.offsetWidth;
    passwordShell.classList.add('shake', 'has-error');
    passwordStatus.textContent = 'Not quite. Try the two words you know. ♡';
    input.select();
  });

  $('#toggle-password').addEventListener('click', () => {
    const reveal = input.type === 'password';
    input.type = reveal ? 'text' : 'password';
    $('#toggle-password').setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
    $('#toggle-password').setAttribute('title', reveal ? 'Hide password' : 'Show password');
  });
  input.addEventListener('input', () => {
    passwordStatus.textContent = '';
    passwordShell.classList.remove('has-error');
  });
  $('#lock-button').addEventListener('click', lockSite);

  function openPhoto(index, opener) {
    activePhotoIndex = (index + photos.length) % photos.length;
    modalOpener = opener || document.activeElement;
    renderModalPhoto();
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modalClose.focus({ preventScroll: true });
  }

  function renderModalPhoto() {
    const photo = photos[activePhotoIndex];
    modalImage.src = photo.src;
    modalImage.alt = photo.alt;
    modalCaption.textContent = photo.caption;
    modalCounter.textContent = `${activePhotoIndex + 1} / ${photos.length}`;
    modalPrev.disabled = photos.length < 2;
    modalNext.disabled = photos.length < 2;
  }

  function closePhotoModal(restoreFocus = true) {
    if (modal.hidden) return;
    modal.hidden = true;
    modalImage.removeAttribute('src');
    document.body.classList.remove('modal-open');
    if (restoreFocus && modalOpener && typeof modalOpener.focus === 'function') {
      modalOpener.focus({ preventScroll: true });
    }
  }

  function movePhoto(delta) {
    activePhotoIndex = (activePhotoIndex + delta + photos.length) % photos.length;
    renderModalPhoto();
  }

  $$('[data-photo-index]').forEach((button) => {
    button.addEventListener('click', () => openPhoto(Number(button.dataset.photoIndex), button));
  });
  modalClose.addEventListener('click', () => closePhotoModal());
  modalPrev.addEventListener('click', () => movePhoto(-1));
  modalNext.addEventListener('click', () => movePhoto(1));
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closePhotoModal();
  });

  $$('[data-flip-index]').forEach((button) => {
    button.addEventListener('click', () => {
      const flipped = button.classList.toggle('is-flipped');
      button.setAttribute('aria-pressed', String(flipped));
      const label = photos[Number(button.dataset.flipIndex)].caption;
      button.setAttribute('aria-label', flipped ? `Turn back ${label}` : `Turn over ${label}`);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (modal.hidden) return;
    if (event.key === 'Escape') closePhotoModal();
    else if (event.key === 'ArrowLeft') movePhoto(-1);
    else if (event.key === 'ArrowRight') movePhoto(1);
  });

  function setMusicUi(playing, message) {
    isPlaying = playing;
    musicIcon.textContent = playing ? 'Ⅱ' : '▶';
    musicToggle.setAttribute('aria-label', playing ? 'Pause sky by snave' : 'Play sky by snave');
    musicToggle.setAttribute('title', playing ? 'Pause music' : 'Play music');
    musicStatus.textContent = message || (playing ? 'Music is playing' : 'Music is paused');
    musicToggle.classList.toggle('is-playing', playing);
  }

  function requestPlay() {
    requestedPlay = true;
    if (!backgroundAudio) {
      setMusicUi(false, `Add your MP3 at ${AUDIO_PATH}`);
      return;
    }

    musicStatus.textContent = 'Starting music…';
    try {
      // This runs directly from the password-submit or play-button gesture,
      // which is the most reliable way to satisfy browser playback policies.
      const playRequest = backgroundAudio.play();
      if (playRequest && typeof playRequest.then === 'function') {
        playRequest.then(() => {
          if (requestedPlay) setMusicUi(true, 'Music is playing');
        }).catch((error) => {
          if (!requestedPlay) return;
          if (backgroundAudio.error || error.name === 'NotSupportedError') {
            setMusicUi(false, `Add your MP3 at ${AUDIO_PATH}`);
          } else if (error.name === 'NotAllowedError') {
            setMusicUi(false, 'Tap play to start music');
          } else {
            setMusicUi(false, `Could not play the song. Check ${AUDIO_PATH}`);
          }
        });
      }
    } catch (_) {
      setMusicUi(false, `Could not play the song. Check ${AUDIO_PATH}`);
    }
  }

  function pauseMusic() {
    requestedPlay = false;
    if (backgroundAudio) backgroundAudio.pause();
    setMusicUi(false, 'Music is paused');
  }

  musicToggle.addEventListener('click', () => {
    if (isPlaying || (backgroundAudio && !backgroundAudio.paused)) pauseMusic();
    else requestPlay();
  });

  if (backgroundAudio) {
    backgroundAudio.addEventListener('playing', () => {
      if (requestedPlay) setMusicUi(true, 'Music is playing');
    });
    backgroundAudio.addEventListener('pause', () => {
      if (!requestedPlay) setMusicUi(false, 'Music is paused');
    });
    backgroundAudio.addEventListener('error', () => {
      if (requestedPlay) setMusicUi(false, `Add your MP3 at ${AUDIO_PATH}`);
    });
  }

  setMusicUi(false, 'Music is paused');
})();
