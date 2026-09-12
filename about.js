// ================= SCROLL REVEAL =================
// Step cards, feature cards, and the closing CTA fade/slide into
// view the first time they cross into the viewport. The verdict
// step's icon (ring + checkmark) draws itself in once revealed —
// see the matching CSS rules under "ABOUT PAGE SCROLL REVEAL".
//
// Progressive enhancement: the "reveal" class (which starts an
// element at opacity 0) is only ever added here in JS, so if this
// script fails to load, every section is simply shown at full
// opacity immediately — nothing depends on JS to become visible.

const revealTargets = document.querySelectorAll(
    ".step-card, .feature-card, .tech-item, .faq-item, .about-cta"
);

if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver(function (entries) {

        entries.forEach(function (entry) {

            if (entry.isIntersecting) {

                entry.target.classList.add("is-visible");

                observer.unobserve(entry.target);

            }

        });

    }, { threshold: 0.25 });

    revealTargets.forEach(function (el, index) {

        el.classList.add("reveal");

        el.style.transitionDelay = (index % 4) * 70 + "ms";

        observer.observe(el);

    });

} else {

    // No IntersectionObserver support — just show everything as-is.
    revealTargets.forEach(function (el) {
        el.classList.add("reveal", "is-visible");
    });

}
