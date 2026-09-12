// ================= MOBILE NAV TOGGLE =================
// Shared by index.html, history.html, and about.html. Only does
// anything below the mobile breakpoint — on desktop the button is
// hidden by CSS and .nav-links is always visible regardless of
// the "open" class, so this script is a no-op there.

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.getElementById("navLinks");

if (navToggle && navLinks) {

    function closeMenu() {

        navLinks.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");

    }

    navToggle.addEventListener("click", function () {

        const isOpen = navLinks.classList.toggle("open");

        navToggle.classList.toggle("open", isOpen);

        navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");

    });

    // Tapping a link closes the menu instead of leaving it open
    // behind the next page.
    navLinks.querySelectorAll("a").forEach(function (link) {

        link.addEventListener("click", closeMenu);

    });

    // Resizing past the mobile breakpoint (e.g. rotating a tablet)
    // shouldn't leave the menu stuck open.
    window.addEventListener("resize", function () {

        if (window.innerWidth > 700) closeMenu();

    });

}
