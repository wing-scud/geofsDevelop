import ui from './ui'
import geofs from "../geofs"
var panel = {
    init() {
        $(document).on('click', '[data-toggle-panel]', function(a) {
            ui.panel.toggle($(this).attr('data-toggle-panel'));
            a.stopImmediatePropagation();
        });
        $(document).on('click', () => {
            ui.panel.hide($('.geofs-toggle-panel.geofs-visible').not('[data-noblur]'), !0);
        });
        $(document).on('click', '.geofs-list-collapsible-item', function(a) {
            ui.panel.toggleItem(this, a);
            a.preventDefault();
            a.stopImmediatePropagation();
        });
        $(document).on('click', '.geofs-collapsible', (a) => {
            a.stopImmediatePropagation();
        });
    },
    toggleItem(a, b) {
        let c = $(a),
            d = c.parents('.geofs-list').first();
        d.find('.geofs-list-item-expanded').not(b.target).removeClass('geofs-list-item-expanded');
        c.toggleClass('geofs-list-item-expanded');
        c.hasClass('geofs-list-item-expanded') ? c.trigger('expanded') : c.trigger('collapsed');
        d.scrollTop(a.offsetTop);
    },
    expendItem(a, b) {
        let c = $(a),
            d = c.parents('.geofs-list').first();
        d.find('.geofs-list-item-expanded').not(b.target).removeClass('geofs-list-item-expanded');
        c.addClass('geofs-list-item-expanded');
        c.trigger('expanded');
        d.scrollTop(a.offsetTop);
    },
    toggle(a) {
        $(a).hasClass('geofs-visible') ? ui.panel.hide(a, !0) : ui.panel.show(a);
    },
    show(a) {
        a = $(a);
        if (ui.panel.hide()) {
            ui.expandLeft('panel');
            a.addClass('geofs-visible');
            try {
                eval(a.attr('onShow'));
            } catch (b) {
                geofs.debug.throw(b);
            }
            a.find('.geofs-list-item-expanded').trigger('expanded');
        }
    },
    hide(a, b) {
        let c = !0,
            d = $(a || '.geofs-toggle-panel.geofs-visible');
        $(d).each(function(b) {
            b = $(this);
            if (!a && b.attr('data-modal')) { return c = !1; }
            b.removeClass('geofs-visible');
            try {
                eval(b.attr('onHide'));
            } catch (f) {}
        });
        d.length && b && ui.collapseLeft(a);
        d.find('.geofs-list-collapsible-item').trigger('collapsed');
        return c;
    },
};

export default panel;