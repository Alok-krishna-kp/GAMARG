frappe.ready(function() {
    const roles = frappe.boot.user.roles || [];
    const is_faculty_only = roles.includes('Faculty') && !roles.includes('Dept.Head');

    if (!is_faculty_only) return;

    function hide_faculty_elements() {
        $('.widget.shortcut-widget-box').each(function() {
            if ($(this).find('.widget-title').text().trim() === 'Faculties') {
                $(this).closest('.widget-col').hide();
                $(this).hide();
            }
        });
        $('.sidebar-item').each(function() {
            if ($(this).text().trim() === 'Faculty') {
                $(this).hide();
            }
        });
    }

    hide_faculty_elements();
    const observer = new MutationObserver(hide_faculty_elements);
    observer.observe(document.body, { childList: true, subtree: true });
});
