// ================= TOAST NOTIFICATIONS =================
// Shared, tiny notification system. Any page's script can call
// window.showToast(message, type) once this file has loaded —
// type is "success" | "error" | "info" (defaults to "info").
// Builds its own container on first use, so no markup is needed
// in the HTML files.

(function () {

    const TOAST_ICONS = {

        success: `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 13l4 4L19 7" />
            </svg>
        `,

        error: `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2.5" stroke-linecap="round">
                <path d="M6 6L18 18" />
                <path d="M18 6L6 18" />
            </svg>
        `,

        info: `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v.01M12 11v5" />
            </svg>
        `

    };

    let container = null;

    function getContainer() {

        if (container) return container;

        container = document.createElement("div");
        container.className = "toast-container";
        container.setAttribute("aria-live", "polite");
        container.setAttribute("aria-atomic", "true");

        document.body.appendChild(container);

        return container;

    }

    window.showToast = function (message, type) {

        type = (type === "success" || type === "error") ? type : "info";

        const toast = document.createElement("div");
        toast.className = "toast toast-" + type;
        toast.setAttribute("role", "status");

        toast.innerHTML =
            '<span class="toast-icon">' + TOAST_ICONS[type] + "</span>" +
            '<span class="toast-text"></span>';

        toast.querySelector(".toast-text").textContent = message;

        getContainer().appendChild(toast);

        // Next frame so the entrance transition actually plays.
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                toast.classList.add("show");
            });
        });

        let dismissed = false;

        function dismiss() {

            if (dismissed) return;
            dismissed = true;

            toast.classList.remove("show");
            toast.classList.add("hide");

            setTimeout(function () { toast.remove(); }, 220);

        }

        const autoTimer = setTimeout(dismiss, 3200);

        toast.addEventListener("click", function () {
            clearTimeout(autoTimer);
            dismiss();
        });

    };

})();
