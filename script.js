const GITHUB_USERNAME = "AravDakshZen";
const contributionGrid = document.querySelector("#contributions");
const contributionTotal = document.querySelector("#contribution-total");

const renderContributions = (contributions) => {
  contributionGrid.replaceChildren();
  const firstDate = new Date(`${contributions[0].date}T00:00:00Z`);
  firstDate.setUTCDate(firstDate.getUTCDate() - firstDate.getUTCDay());

  contributions.forEach((entry) => {
    const date = new Date(`${entry.date}T00:00:00Z`);
    const dayOffset = Math.round((date - firstDate) / 86400000);
    const cell = document.createElement("i");
    cell.dataset.level = String(
      entry.level || Math.min(4, Math.ceil(entry.count / 4)),
    );
    cell.style.gridColumn = String(Math.floor(dayOffset / 7) + 1);
    cell.style.gridRow = String(date.getUTCDay() + 1);
    cell.title = `${entry.count} contribution${entry.count === 1 ? "" : "s"} on ${entry.date}`;
    cell.setAttribute("aria-label", cell.title);
    contributionGrid.appendChild(cell);
  });
};

const loadContributions = async () => {
  contributionGrid.classList.add("is-loading");
  try {
    const response = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(GITHUB_USERNAME)}?y=last`,
    );
    if (!response.ok) throw new Error("GitHub activity could not be loaded.");
    const data = await response.json();
    const contributions = data.contributions || [];
    if (!contributions.length)
      throw new Error("No contribution history was returned.");
    renderContributions(contributions);
    const total =
      data.total?.lastYear ??
      contributions.reduce((sum, entry) => sum + entry.count, 0);
    contributionTotal.textContent = `${total.toLocaleString()} contributions in the last year`;
  } catch (error) {
    contributionTotal.textContent = error.message;
  } finally {
    contributionGrid.classList.remove("is-loading");
  }
};

loadContributions();
setInterval(() => loadContributions(), 5 * 60 * 1000);

const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    }),
  { threshold: 0.08 },
);
document
  .querySelectorAll(".reveal")
  .forEach((element) => observer.observe(element));
window.lucide?.createIcons();

document.querySelector("#customize").addEventListener("click", () => {
  document.body.classList.toggle("warm");
});

document.querySelectorAll(".row-action").forEach((button) => {
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    button.lastElementChild.textContent = expanded ? "⌄" : "⌃";
  });
});
