const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* 1. Typing effect for the role */
const roles = ["Frontend Developer", "Backend Developer", "Full Stack Developer"];
const roleEl = document.getElementById("role");
let r = 0, c = 0, deleting = false;

function type() {
    const word = roles[r];
    roleEl.textContent = word.slice(0, c);
    if (!deleting && c === word.length) { deleting = true; return setTimeout(type, 1400); }
    if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; }
    c += deleting ? -1 : 1;
    setTimeout(type, deleting ? 50 : 100);
}
reduceMotion ? (roleEl.textContent = roles[0]) : type();

/* 2. Mobile menu (hamburger) */
const toggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("navbar");
const links = nav.querySelectorAll("a");

toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
});

links.forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
}));

/* 3. Highlight the nav link of the section you're viewing */
const sections = document.querySelectorAll("main section[id]");
const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            links.forEach(link =>
                link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id)
            );
        }
    });
}, { rootMargin: "-45% 0px -50% 0px" });
sections.forEach(section => spy.observe(section));

/* 4. Skill bars fill up when they scroll into view */
const bars = document.querySelectorAll(".bar span");
if (!reduceMotion) {
    bars.forEach(bar => {
        bar.dataset.width = bar.style.width;
        bar.style.width = "0";
    });
    const barObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.width = entry.target.dataset.width;
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });
    bars.forEach(bar => barObserver.observe(bar));
}

/* 5. Fade-in on scroll */
if (!reduceMotion) {
    const items = document.querySelectorAll(
        ".section h2, .lead, .about-body, .grid article, .skill"
    );
    items.forEach(item => item.classList.add("reveal"));
    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    items.forEach(item => revealObserver.observe(item));
}

/* 6. Contact form (sends through FormSubmit) */
const form = document.querySelector(".contact-form");
const statusEl = document.getElementById("form-status");

if (form) {
    form.addEventListener("submit", async event => {
        event.preventDefault();
        const formData = new FormData(form);
        formData.append("access_key", "30252380-b3dd-451a-8bac-2b123369da72");
        const button = form.querySelector("button[type=submit]");
        button.disabled = true;
        statusEl.textContent = "Sending...";

        try {
            const response = await fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: { Accept: "application/json" }
            });
            const data = await response.json();
            if (!response.ok || String(data.success) !== "true") throw new Error(data.message || "Request failed");
            statusEl.textContent = "Thanks! Your message has been sent.";
            form.reset();
        } catch (error) {
            statusEl.textContent = "Something went wrong. Please try again, or email me directly.";
        } finally {
            button.disabled = false;
        }
    });
}