/* IMAGINE Kids local test build: a small renderer for the prototype boards.
   It reads the board template (<template id="dc-tpl">) and the board logic
   (<script type="text/x-dc-logic">), renders {{holes}}, <sc-if> and <sc-for>,
   and updates the page with morphdom when the state changes. */
(function () {
  var BOOL = { disabled: 1, checked: 1, selected: 1, autofocus: 1, hidden: 1, readonly: 1, required: 1 };
  var HOLE = /\{\{\s*([\w.$]+)\s*\}\}/g;

  function lookup(scopes, path) {
    var parts = path.split('.');
    for (var i = scopes.length - 1; i >= 0; i--) {
      if (scopes[i] && Object.prototype.hasOwnProperty.call(scopes[i], parts[0])) {
        var v = scopes[i][parts[0]];
        for (var k = 1; k < parts.length; k++) { if (v == null) return undefined; v = v[parts[k]]; }
        return v;
      }
    }
    return undefined;
  }
  function single(str) { var m = /^\s*\{\{\s*([\w.$]+)\s*\}\}\s*$/.exec(str); return m ? m[1] : null; }
  function interp(str, scopes) { return str.replace(HOLE, function (_, p) { var v = lookup(scopes, p); return v == null ? '' : String(v); }); }

  window.DCLogic = function DCLogic(props) { this.props = props || {}; this.state = {}; };
  window.DCLogic.prototype.setState = function (patch) {
    var prev = Object.assign({}, this.state);
    Object.assign(this.state, typeof patch === 'function' ? patch(this.state) : patch);
    if (this.__app) this.__app.update(prev);
  };

  function App(root, tpl, Comp) {
    this.root = root; this.tpl = tpl; this.handlers = [];
    this.comp = new Comp({});
    this.comp.__app = this;
    var self = this;
    ['click', 'input', 'keydown', 'change'].forEach(function (type) {
      root.addEventListener(type, function (e) {
        var el = e.target;
        while (el && el !== root) {
          var id = el.getAttribute && el.getAttribute('data-on-' + type);
          if (id != null) { var fn = self.handlers[+id]; if (typeof fn === 'function') fn(e); return; }
          el = el.parentNode;
        }
      });
    });
  }
  App.prototype.build = function (node, scopes, parent) {
    var self = this;
    if (node.nodeType === 3) { parent.appendChild(document.createTextNode(interp(node.nodeValue, scopes))); return; }
    if (node.nodeType !== 1) return;
    var name = node.localName;
    if (name === 'sc-if') {
      var v = lookup(scopes, single(node.getAttribute('value') || '') || '');
      if (v) node.childNodes.forEach(function (c) { self.build(c, scopes, parent); });
      return;
    }
    if (name === 'sc-for') {
      var list = lookup(scopes, single(node.getAttribute('list') || '') || '') || [];
      var as = node.getAttribute('as') || 'item';
      list.forEach(function (item, i) { var sc = {}; sc[as] = item; sc.$index = i; node.childNodes.forEach(function (c) { self.build(c, scopes.concat([sc]), parent); }); });
      return;
    }
    var el = node.namespaceURI === 'http://www.w3.org/2000/svg' ? document.createElementNS(node.namespaceURI, name) : document.createElement(name);
    for (var a = 0; a < node.attributes.length; a++) {
      var at = node.attributes[a], an = at.name, av = at.value;
      if (an.indexOf('hint-') === 0) continue;
      if (/^on[a-z]+$/.test(an)) {
        var fn = lookup(scopes, single(av) || '');
        if (typeof fn === 'function') { this.handlers.push(fn); el.setAttribute('data-on-' + an.slice(2), String(this.handlers.length - 1)); }
        continue;
      }
      var p = single(av);
      if (p) {
        var val = lookup(scopes, p);
        if (BOOL[an]) { if (val && val !== 'false') el.setAttribute(an, ''); continue; }
        if (val == null) continue;
        el.setAttribute(an, String(val));
      } else {
        el.setAttribute(an, interp(av, scopes));
      }
    }
    var kids = node.localName === 'template' ? node.content.childNodes : node.childNodes;
    kids.forEach(function (c) { self.build(c, scopes, el); });
    parent.appendChild(el);
  };
  App.prototype.render = function () {
    this.handlers = [];
    var vals = this.comp.renderVals();
    var scopes = [Object.assign({ props: this.comp.props }, vals)];
    var next = document.createElement('div');
    next.id = this.root.id;
    var self = this;
    this.tpl.content.childNodes.forEach(function (c) { self.build(c, scopes, next); });
    var hadFocus = document.activeElement;
    morphdom(this.root, next, {
      getNodeKey: function (n) { return n && n.getAttribute ? (n.getAttribute('key') || n.id || undefined) : undefined; },
      onBeforeElUpdated: function (from, to) {
        if (from.tagName === 'INPUT' && from === hadFocus && to.hasAttribute('value')) { if (from.value !== to.getAttribute('value')) from.value = to.getAttribute('value'); }
        return true;
      }
    });
    var lg = this.comp.state && this.comp.state.lang;
    if (lg && /^(en|fr|nl)$/.test(lg)) document.documentElement.lang = lg;
    if (lg) document.querySelectorAll('a[data-keep-lang]').forEach(function (a) { a.setAttribute('href', a.getAttribute('data-base') + '#lang=' + lg); });
    var af = this.root.querySelector('[autofocus]:not([disabled])');
    if (af && af !== document.activeElement && !(document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName))) { try { af.focus(); } catch (e) {} }
  };
  App.prototype.update = function (prev) {
    this.render();
    if (this.comp.componentDidUpdate) this.comp.componentDidUpdate(this.comp.props, prev);
  };

  window.addEventListener('DOMContentLoaded', function () {
    var tpl = document.getElementById('dc-tpl');
    var root = document.getElementById('dc-root');
    var Comp = window.__Component;
    var app = new App(root, tpl, Comp);
    window.__app = app;
    app.render();
    if (app.comp.componentDidMount) app.comp.componentDidMount();
    var m = /lang=(en|fr|nl)/.exec(location.hash || '');
    if (m && app.comp.state && app.comp.state.lang !== m[1]) {
      var v = app.comp.renderVals(), hit = (v.langs || []).filter(function (x) { return String(x.code || x.key || '').toLowerCase() === m[1]; })[0];
      if (hit && typeof hit.pick === 'function') hit.pick(); else app.comp.setState({ lang: m[1] });
    }
  });
})();
