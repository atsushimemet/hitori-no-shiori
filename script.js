const moodInput = document.querySelector("#moodInput");
const moodForm = document.querySelector("#moodForm");
const formNote = document.querySelector("#formNote");
const planCard = document.querySelector("#planCard");
const chips = document.querySelectorAll(".chips button");
const choiceGroups = document.querySelectorAll(".choice-group");
const exampleCards = document.querySelectorAll(".example-card");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const setSelected = (buttons, target) => {
  buttons.forEach((button) => {
    button.classList.toggle("is-selected", button === target);
    button.setAttribute("aria-pressed", String(button === target));
  });
};

chips.forEach((chip) => {
  chip.setAttribute("aria-pressed", "false");
  chip.addEventListener("click", () => {
    setSelected(chips, chip);
    moodInput.value = chip.dataset.mood;
    moodInput.focus();
    formNote.textContent = "この気分から、栞を編みます。";
  });
});

choiceGroups.forEach((group) => {
  const buttons = group.querySelectorAll("button");

  buttons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => setSelected(buttons, button));
  });
});

moodForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!moodInput.value.trim()) {
    moodInput.focus();
    formNote.textContent = "ひとことだけ、入れてみる。";
    return;
  }

  formNote.textContent = "今日の栞を置きました。";
  planCard.classList.add("is-awake");
  planCard.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "center",
  });

  window.setTimeout(() => {
    planCard.classList.remove("is-awake");
  }, 1700);
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 },
  );

  exampleCards.forEach((card) => observer.observe(card));
} else {
  exampleCards.forEach((card) => card.classList.add("is-visible"));
}
