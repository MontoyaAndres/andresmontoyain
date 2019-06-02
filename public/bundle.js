
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_style(node, key, value) {
        node.style.setProperty(key, value);
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.shift()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
        }
    }
    let outros;
    function group_outros() {
        outros = {
            remaining: 0,
            callbacks: []
        };
    }
    function check_outros() {
        if (!outros.remaining) {
            run_all(outros.callbacks);
        }
    }
    function on_outro(callback) {
        outros.callbacks.push(callback);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_render.forEach(add_render_callback);
    }
    function destroy(component, detaching) {
        if (component.$$) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                $$.fragment.l(children(options.target));
            }
            else {
                $$.fragment.c();
            }
            if (options.intro && component.$$.fragment.i)
                component.$$.fragment.i();
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy(this, true);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/components/layout/header.svelte generated by Svelte v3.4.4 */

    const file = "src/components/layout/header.svelte";

    function create_fragment(ctx) {
    	var div1, header, div0, img, t, h1;

    	return {
    		c: function create() {
    			div1 = element("div");
    			header = element("header");
    			div0 = element("div");
    			img = element("img");
    			t = space();
    			h1 = element("h1");
    			h1.textContent = "Andrés Montoya · Software Engineer in training (JavaScript)";
    			img.src = "./assets/images/logo.jpg";
    			img.className = "mr-3";
    			img.height = "35";
    			img.alt = "luna dog";
    			add_location(img, file, 10, 6, 225);
    			h1.className = "h4 f5 text-white text-bold";
    			add_location(h1, file, 15, 6, 342);
    			div0.className = "flex-auto d-flex flex-row pr-3";
    			add_location(div0, file, 9, 4, 174);
    			header.className = "main-content mx-auto p-responsive d-flex flex-items-center flex-wrap svelte-187w73k";
    			add_location(header, file, 7, 2, 80);
    			div1.className = "bg-gray-dark";
    			add_location(div1, file, 6, 0, 51);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, header);
    			append(header, div0);
    			append(div0, img);
    			append(div0, t);
    			append(div0, h1);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}
    		}
    	};
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, []);
    	}
    }

    /* src/components/layout/footer.svelte generated by Svelte v3.4.4 */

    const file$1 = "src/components/layout/footer.svelte";

    function create_fragment$1(ctx) {
    	var footer, p, t0, a0, t2, a1;

    	return {
    		c: function create() {
    			footer = element("footer");
    			p = element("p");
    			t0 = text("This site was created using\n    ");
    			a0 = element("a");
    			a0.textContent = "GitHub's Primer Design System CSS";
    			t2 = text("\n    and inspired by\n    ");
    			a1 = element("a");
    			a1.textContent = "Natalie Marleny";
    			a0.href = "http://primer.github.io";
    			add_location(a0, file$1, 3, 4, 93);
    			a1.href = "https://github.com/nataliemarleny";
    			add_location(a1, file$1, 5, 4, 189);
    			p.className = "mb-2";
    			add_location(p, file$1, 1, 2, 40);
    			footer.className = "mb-6 pt-4 border-top";
    			add_location(footer, file$1, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, footer, anchor);
    			append(footer, p);
    			append(p, t0);
    			append(p, a0);
    			append(p, t2);
    			append(p, a1);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(footer);
    			}
    		}
    	};
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$1, safe_not_equal, []);
    	}
    }

    /* src/components/layout/index.svelte generated by Svelte v3.4.4 */

    const file$2 = "src/components/layout/index.svelte";

    function create_fragment$2(ctx) {
    	var t0, div, t1, current;

    	var header = new Header({ $$inline: true });

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	var footer = new Footer({ $$inline: true });

    	return {
    		c: function create() {
    			header.$$.fragment.c();
    			t0 = space();
    			div = element("div");

    			if (default_slot) default_slot.c();
    			t1 = space();
    			footer.$$.fragment.c();

    			div.className = "main-content mx-auto px-3 p-responsive mt-4";
    			add_location(div, file$2, 6, 0, 111);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append(div, t1);
    			mount_component(footer, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			header.$$.fragment.i(local);

    			if (default_slot && default_slot.i) default_slot.i(local);

    			footer.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			header.$$.fragment.o(local);
    			if (default_slot && default_slot.o) default_slot.o(local);
    			footer.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			header.$destroy(detaching);

    			if (detaching) {
    				detach(t0);
    				detach(div);
    			}

    			if (default_slot) default_slot.d(detaching);

    			footer.$destroy();
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return { $$slots, $$scope };
    }

    class Index extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$2, safe_not_equal, []);
    	}
    }

    /* src/components/icons/localization.svelte generated by Svelte v3.4.4 */

    const file$3 = "src/components/icons/localization.svelte";

    function create_fragment$3(ctx) {
    	var svg, path;

    	return {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr(path, "fill", "#586069");
    			attr(path, "fill-rule", "evenodd");
    			attr(path, "d", "M6 0C2.69 0 0 2.5 0 5.5 0 10.02 6 16 6 16s6-5.98 6-10.5C12 2.5 9.31 0 6\n    0zm0 14.55C4.14 12.52 1 8.44 1 5.5 1 3.02 3.25 1 6 1c1.34 0 2.61.48 3.56\n    1.36.92.86 1.44 1.97 1.44 3.14 0 2.94-3.14 7.02-5 9.05zM8 5.5c0 1.11-.89 2-2\n    2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z");
    			add_location(path, file$3, 8, 2, 158);
    			attr(svg, "aria-label", "localization");
    			attr(svg, "class", "mr-2");
    			attr(svg, "width", "12");
    			attr(svg, "height", "16");
    			attr(svg, "viewBox", "0 0 12 16");
    			attr(svg, "role", "img");
    			set_style(svg, "min-width", "16px");
    			set_style(svg, "margin-left", "4px");
    			add_location(svg, file$3, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(svg);
    			}
    		}
    	};
    }

    class Localization extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, []);
    	}
    }

    /* src/components/icons/link.svelte generated by Svelte v3.4.4 */

    const file$4 = "src/components/icons/link.svelte";

    function create_fragment$4(ctx) {
    	var svg, path;

    	return {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr(path, "fill", "#586069");
    			attr(path, "fill-rule", "evenodd");
    			attr(path, "d", "M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0\n    1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98\n    0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98\n    0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55\n    13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z");
    			add_location(path, file$4, 8, 2, 136);
    			attr(svg, "aria-label", "link");
    			attr(svg, "class", "ml-1 mr-2");
    			attr(svg, "width", "16");
    			attr(svg, "height", "16");
    			attr(svg, "viewBox", "0 0 16 16");
    			attr(svg, "role", "img");
    			set_style(svg, "min-width", "16px");
    			add_location(svg, file$4, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(svg);
    			}
    		}
    	};
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$4, safe_not_equal, []);
    	}
    }

    /* src/components/resume/summary.svelte generated by Svelte v3.4.4 */

    const file$5 = "src/components/resume/summary.svelte";

    function create_fragment$5(ctx) {
    	var img, t0, div, h1, t2, h20, t4, h21, t6, p, t8, a0, t10, aside, a1, t12, ul, li0, t13, t14, li1, t15, a2, current;

    	var localization = new Localization({ $$inline: true });

    	var link = new Link({ $$inline: true });

    	return {
    		c: function create() {
    			img = element("img");
    			t0 = space();
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Andrés Mauricio Montoya Sánchez";
    			t2 = space();
    			h20 = element("h2");
    			h20.textContent = "Software Engineer in training";
    			t4 = space();
    			h21 = element("h2");
    			h21.textContent = "(Front-End / Back-End・JavaScript)";
    			t6 = space();
    			p = element("p");
    			p.textContent = "Fallen in love about programming and languages culture. Improving my learning!";
    			t8 = space();
    			a0 = element("a");
    			a0.textContent = "View this resume inside 👀";
    			t10 = space();
    			aside = element("aside");
    			a1 = element("a");
    			a1.textContent = "Professional network";
    			t12 = space();
    			ul = element("ul");
    			li0 = element("li");
    			localization.$$.fragment.c();
    			t13 = text("\n    Colombia, Girardot");
    			t14 = space();
    			li1 = element("li");
    			link.$$.fragment.c();
    			t15 = space();
    			a2 = element("a");
    			a2.textContent = "github.com/andresmontoyain";
    			img.className = "avatar width-full rounded-1";
    			img.src = "images/me.jpg";
    			img.alt = "Andrés Montoya";
    			add_location(img, file$5, 18, 0, 297);
    			h1.className = "text-bold summary-name svelte-1vysvvc";
    			add_location(h1, file$5, 24, 2, 410);
    			h20.className = "f3-light text-gray summary-subtitle svelte-1vysvvc";
    			add_location(h20, file$5, 25, 2, 484);
    			h21.className = "f3-light text-gray summary-subtitle svelte-1vysvvc";
    			add_location(h21, file$5, 28, 2, 577);
    			div.className = "py-3";
    			add_location(div, file$5, 23, 0, 389);
    			p.className = "f5 mb-3 gray-900-text";
    			add_location(p, file$5, 32, 0, 679);
    			a0.className = "btn mb-3 text-center text-gray-dark no-underline summary-button svelte-1vysvvc";
    			attr(a0, "role", "button");
    			a0.tabIndex = "0";
    			a0.href = "https://github.com/MontoyaAndres/andresmontoyain";
    			add_location(a0, file$5, 36, 0, 800);
    			a1.href = "https://www.linkedin.com/in/andresmontoyain/";
    			a1.className = "muted-link";
    			add_location(a1, file$5, 45, 2, 1056);
    			aside.className = "btn-link text-small muted-link mb-3";
    			add_location(aside, file$5, 44, 0, 1002);
    			li0.className = "d-flex flex-row flex-items-center flex-justify-start pt-1";
    			add_location(li0, file$5, 51, 2, 1238);
    			a2.href = "https://github.com/andresmontoyain";
    			add_location(a2, file$5, 57, 4, 1451);
    			li1.className = "d-flex flex-row flex-items-center flex-justify-start pt-1";
    			add_location(li1, file$5, 55, 2, 1363);
    			ul.className = "list-style-none border-top border-gray-light py-3";
    			add_location(ul, file$5, 50, 0, 1173);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, img, anchor);
    			insert(target, t0, anchor);
    			insert(target, div, anchor);
    			append(div, h1);
    			append(div, t2);
    			append(div, h20);
    			append(div, t4);
    			append(div, h21);
    			insert(target, t6, anchor);
    			insert(target, p, anchor);
    			insert(target, t8, anchor);
    			insert(target, a0, anchor);
    			insert(target, t10, anchor);
    			insert(target, aside, anchor);
    			append(aside, a1);
    			insert(target, t12, anchor);
    			insert(target, ul, anchor);
    			append(ul, li0);
    			mount_component(localization, li0, null);
    			append(li0, t13);
    			append(ul, t14);
    			append(ul, li1);
    			mount_component(link, li1, null);
    			append(li1, t15);
    			append(li1, a2);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			localization.$$.fragment.i(local);

    			link.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			localization.$$.fragment.o(local);
    			link.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(img);
    				detach(t0);
    				detach(div);
    				detach(t6);
    				detach(p);
    				detach(t8);
    				detach(a0);
    				detach(t10);
    				detach(aside);
    				detach(t12);
    				detach(ul);
    			}

    			localization.$destroy();

    			link.$destroy();
    		}
    	};
    }

    class Summary extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$5, safe_not_equal, []);
    	}
    }

    /* src/components/resume/elsewhere.svelte generated by Svelte v3.4.4 */

    const file$6 = "src/components/resume/elsewhere.svelte";

    function create_fragment$6(ctx) {
    	var div, h3, t1, a0, img0, t2, a1, img1, t3, a2, img2, t4, a3, img3, t5, a4, img4;

    	return {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			h3.textContent = "Elsewhere";
    			t1 = space();
    			a0 = element("a");
    			img0 = element("img");
    			t2 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t3 = space();
    			a2 = element("a");
    			img2 = element("img");
    			t4 = space();
    			a3 = element("a");
    			img3 = element("img");
    			t5 = space();
    			a4 = element("a");
    			img4 = element("img");
    			h3.className = "mb-1 h4";
    			add_location(h3, file$6, 1, 2, 37);
    			img0.src = "images/github.svg";
    			img0.className = "mr-1";
    			img0.height = "35";
    			img0.alt = "GitHub Logo";
    			add_location(img0, file$6, 6, 4, 205);
    			attr(a0, "aria-label", "GitHub");
    			a0.className = "tooltipped tooltipped-n avatar-group-item";
    			a0.href = "https://github.com/MontoyaAndres/";
    			add_location(a0, file$6, 2, 2, 74);
    			img1.src = "images/twitter.png";
    			img1.className = "mr-1";
    			img1.height = "35";
    			img1.alt = "Twitter Logo.";
    			add_location(img1, file$6, 12, 4, 424);
    			attr(a1, "aria-label", "Twitter");
    			a1.className = "tooltipped tooltipped-n avatar-group-item";
    			a1.href = "https://twitter.com/andresmontoyain/";
    			add_location(a1, file$6, 8, 2, 289);
    			img2.src = "images/instagram.png";
    			img2.className = "mr-1";
    			img2.height = "35";
    			img2.alt = "Instagram Logo.";
    			add_location(img2, file$6, 22, 4, 678);
    			attr(a2, "aria-label", "Instagram");
    			a2.className = "tooltipped tooltipped-n avatar-group-item";
    			a2.href = "https://www.instagram.com/andresmontoyain/";
    			add_location(a2, file$6, 18, 2, 535);
    			img3.src = "images/dev.svg";
    			img3.alt = "Andrés Montoya's DEV Profile";
    			img3.height = "35";
    			img3.width = "35";
    			add_location(img3, file$6, 29, 4, 839);
    			a3.href = "https://dev.to/andresmontoyain";
    			add_location(a3, file$6, 28, 2, 793);
    			img4.src = "images/platzi.png";
    			img4.alt = "Platzi Logo.";
    			img4.height = "35";
    			img4.width = "35";
    			add_location(img4, file$6, 36, 4, 1010);
    			a4.href = "https://platzi.com/@andresmontoyain";
    			add_location(a4, file$6, 35, 2, 959);
    			div.className = "border-top py-3 pr-3";
    			add_location(div, file$6, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h3);
    			append(div, t1);
    			append(div, a0);
    			append(a0, img0);
    			append(div, t2);
    			append(div, a1);
    			append(a1, img1);
    			append(div, t3);
    			append(div, a2);
    			append(a2, img2);
    			append(div, t4);
    			append(div, a3);
    			append(a3, img3);
    			append(div, t5);
    			append(div, a4);
    			append(a4, img4);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    class Elsewhere extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$6, safe_not_equal, []);
    	}
    }

    /* src/components/resume/toolkit-set.svelte generated by Svelte v3.4.4 */

    const file$7 = "src/components/resume/toolkit-set.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.item = list[i];
    	return child_ctx;
    }

    // (18:4) {#each items as item}
    function create_each_block(ctx) {
    	var li, t0_value = ctx.item, t0, t1;

    	return {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			li.className = "summary-toolkit p-2 rounded-1 my-1y mr-1 text-white f6 text-bold svelte-1oner8z";
    			set_style(li, "background-color", ctx.randomColor());
    			add_location(li, file$7, 18, 6, 330);
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);
    			append(li, t0);
    			append(li, t1);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.items) && t0_value !== (t0_value = ctx.item)) {
    				set_data(t0, t0_value);
    			}

    			if (changed.randomColor) {
    				set_style(li, "background-color", ctx.randomColor());
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}
    		}
    	};
    }

    function create_fragment$7(ctx) {
    	var div, h3, t0, t1, ul;

    	var each_value = ctx.items;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(ctx.title);
    			t1 = space();
    			ul = element("ul");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			h3.className = "h4";
    			add_location(h3, file$7, 13, 2, 176);
    			ul.className = "d-flex flex-wrap flex-justify-evenly flex-items-center\n    list-style-none";
    			add_location(ul, file$7, 14, 2, 206);
    			div.className = "border-top py-3 pr-3";
    			add_location(div, file$7, 12, 0, 139);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h3);
    			append(h3, t0);
    			append(div, t1);
    			append(div, ul);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.title) {
    				set_data(t0, ctx.title);
    			}

    			if (changed.randomColor || changed.items) {
    				each_value = ctx.items;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { title, items, randomColor } = $$props;

    	const writable_props = ['title', 'items', 'randomColor'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Toolkit_set> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('title' in $$props) $$invalidate('title', title = $$props.title);
    		if ('items' in $$props) $$invalidate('items', items = $$props.items);
    		if ('randomColor' in $$props) $$invalidate('randomColor', randomColor = $$props.randomColor);
    	};

    	return { title, items, randomColor };
    }

    class Toolkit_set extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$7, safe_not_equal, ["title", "items", "randomColor"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.title === undefined && !('title' in props)) {
    			console.warn("<Toolkit_set> was created without expected prop 'title'");
    		}
    		if (ctx.items === undefined && !('items' in props)) {
    			console.warn("<Toolkit_set> was created without expected prop 'items'");
    		}
    		if (ctx.randomColor === undefined && !('randomColor' in props)) {
    			console.warn("<Toolkit_set> was created without expected prop 'randomColor'");
    		}
    	}

    	get title() {
    		throw new Error("<Toolkit_set>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Toolkit_set>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<Toolkit_set>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Toolkit_set>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get randomColor() {
    		throw new Error("<Toolkit_set>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set randomColor(value) {
    		throw new Error("<Toolkit_set>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/resume/toolkit.svelte generated by Svelte v3.4.4 */

    function create_fragment$8(ctx) {
    	var t, current;

    	var toolkitset0 = new Toolkit_set({
    		props: {
    		randomColor: ctx.randomColor,
    		title: "Toolkit Set",
    		items: ctx.toolkits
    	},
    		$$inline: true
    	});

    	var toolkitset1 = new Toolkit_set({
    		props: {
    		randomColor: ctx.randomColor,
    		title: "Learning",
    		items: ctx.learning
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			toolkitset0.$$.fragment.c();
    			t = space();
    			toolkitset1.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(toolkitset0, target, anchor);
    			insert(target, t, anchor);
    			mount_component(toolkitset1, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var toolkitset0_changes = {};
    			if (changed.randomColor) toolkitset0_changes.randomColor = ctx.randomColor;
    			if (changed.toolkits) toolkitset0_changes.items = ctx.toolkits;
    			toolkitset0.$set(toolkitset0_changes);

    			var toolkitset1_changes = {};
    			if (changed.randomColor) toolkitset1_changes.randomColor = ctx.randomColor;
    			if (changed.learning) toolkitset1_changes.items = ctx.learning;
    			toolkitset1.$set(toolkitset1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			toolkitset0.$$.fragment.i(local);

    			toolkitset1.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			toolkitset0.$$.fragment.o(local);
    			toolkitset1.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			toolkitset0.$destroy(detaching);

    			if (detaching) {
    				detach(t);
    			}

    			toolkitset1.$destroy(detaching);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { randomColor } = $$props;

      const toolkits = [
        "Git",
        "HTML",
        "CSS",
        "JS",
        "React",
        "TypeScript",
        "GraphQL",
        "Apollo",
        "Node.js",
        "Jest",
        "NextJS",
        "Mobx",
        "MySQL",
        "MongoDB"
      ];

      const learning = [
        "Redis",
        "Python",
        "Svelte.js",
        "PostgreSQL",
        "Electron.js",
        "Firebase",
        "Figma",
        "Prisma"
      ];

    	const writable_props = ['randomColor'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Toolkit> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('randomColor' in $$props) $$invalidate('randomColor', randomColor = $$props.randomColor);
    	};

    	return { randomColor, toolkits, learning };
    }

    class Toolkit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$8, safe_not_equal, ["randomColor"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.randomColor === undefined && !('randomColor' in props)) {
    			console.warn("<Toolkit> was created without expected prop 'randomColor'");
    		}
    	}

    	get randomColor() {
    		throw new Error("<Toolkit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set randomColor(value) {
    		throw new Error("<Toolkit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/resume/index.svelte generated by Svelte v3.4.4 */

    const file$8 = "src/components/resume/index.svelte";

    function create_fragment$9(ctx) {
    	var section, t0, t1, current;

    	var summary = new Summary({ $$inline: true });

    	var elsewhere = new Elsewhere({ $$inline: true });

    	var toolkit = new Toolkit({
    		props: { randomColor: ctx.randomColor },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			section = element("section");
    			summary.$$.fragment.c();
    			t0 = space();
    			elsewhere.$$.fragment.c();
    			t1 = space();
    			toolkit.$$.fragment.c();
    			section.className = "pr-3 mb-6 left-column svelte-v3c9fh";
    			add_location(section, file$8, 14, 0, 238);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, section, anchor);
    			mount_component(summary, section, null);
    			append(section, t0);
    			mount_component(elsewhere, section, null);
    			append(section, t1);
    			mount_component(toolkit, section, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var toolkit_changes = {};
    			if (changed.randomColor) toolkit_changes.randomColor = ctx.randomColor;
    			toolkit.$set(toolkit_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			summary.$$.fragment.i(local);

    			elsewhere.$$.fragment.i(local);

    			toolkit.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			summary.$$.fragment.o(local);
    			elsewhere.$$.fragment.o(local);
    			toolkit.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(section);
    			}

    			summary.$destroy();

    			elsewhere.$destroy();

    			toolkit.$destroy();
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	

      let { randomColor } = $$props;

    	const writable_props = ['randomColor'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('randomColor' in $$props) $$invalidate('randomColor', randomColor = $$props.randomColor);
    	};

    	return { randomColor };
    }

    class Index$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$9, safe_not_equal, ["randomColor"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.randomColor === undefined && !('randomColor' in props)) {
    			console.warn("<Index> was created without expected prop 'randomColor'");
    		}
    	}

    	get randomColor() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set randomColor(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/icons/organization.svelte generated by Svelte v3.4.4 */

    /* src/components/icons/calendar.svelte generated by Svelte v3.4.4 */

    const file$9 = "src/components/icons/calendar.svelte";

    function create_fragment$a(ctx) {
    	var svg, path;

    	return {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			set_style(path, "fill", "#586069");
    			attr(path, "fill-rule", "evenodd");
    			attr(path, "d", "M13 2h-1v1.5c0 .28-.22.5-.5.5h-2c-.28 0-.5-.22-.5-.5V2H6v1.5c0\n    .28-.22.5-.5.5h-2c-.28 0-.5-.22-.5-.5V2H2c-.55 0-1 .45-1 1v11c0 .55.45 1 1\n    1h11c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm0 12H2V5h11v9zM5 3H4V1h1v2zm6\n    0h-1V1h1v2zM6 7H5V6h1v1zm2 0H7V6h1v1zm2 0H9V6h1v1zm2 0h-1V6h1v1zM4\n    9H3V8h1v1zm2 0H5V8h1v1zm2 0H7V8h1v1zm2 0H9V8h1v1zm2 0h-1V8h1v1zm-8\n    2H3v-1h1v1zm2 0H5v-1h1v1zm2 0H7v-1h1v1zm2 0H9v-1h1v1zm2 0h-1v-1h1v1zm-8\n    2H3v-1h1v1zm2 0H5v-1h1v1zm2 0H7v-1h1v1zm2 0H9v-1h1v1z");
    			add_location(path, file$9, 7, 2, 109);
    			attr(svg, "aria-label", "calendar");
    			attr(svg, "class", "mr-1");
    			attr(svg, "width", "14");
    			attr(svg, "height", "16");
    			attr(svg, "viewBox", "0 0 14 16");
    			attr(svg, "role", "img");
    			add_location(svg, file$9, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(svg);
    			}
    		}
    	};
    }

    class Calendar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$a, safe_not_equal, []);
    	}
    }

    /* src/components/icons/gift.svelte generated by Svelte v3.4.4 */

    const file$a = "src/components/icons/gift.svelte";

    function create_fragment$b(ctx) {
    	var svg, path;

    	return {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr(path, "fill", "#586069");
    			attr(path, "fill-rule", "evenodd");
    			attr(path, "d", "M13 4h-1.38c.19-.33.33-.67.36-.91.06-.67-.11-1.22-.52-1.61C11.1 1.1 10.65\n    1 10.1 1h-.11c-.53.02-1.11.25-1.53.58-.42.33-.73.72-.97\n    1.2-.23-.48-.55-.88-.97-1.2-.42-.32-1-.58-1.53-.58h-.03c-.56\n    0-1.06.09-1.44.48-.41.39-.58.94-.52 1.61.03.23.17.58.36.91H1.98c-.55 0-1\n    .45-1 1v3h1v5c0 .55.45 1 1 1h9c.55 0 1-.45\n    1-1V8h1V5c0-.55-.45-1-1-1H13zm-4.78-.88c.17-.36.42-.67.75-.92.3-.23.72-.39\n    1.05-.41h.09c.45 0 .66.11.8.25s.33.39.3.95c-.05.19-.25.61-.5\n    1h-2.9l.41-.88v.01zM4.09 2.04c.13-.13.31-.25.91-.25.31 0 .72.17\n    1.03.41.33.25.58.55.75.92L7.2\n    4H4.3c-.25-.39-.45-.81-.5-1-.03-.56.16-.81.3-.95l-.01-.01zM7\n    12.99H3V8h4v5-.01zm0-6H2V5h5v2-.01zm5 6H8V8h4v5-.01zm1-6H8V5h5v2-.01z");
    			add_location(path, file$a, 8, 2, 136);
    			attr(svg, "aria-label", "gift");
    			attr(svg, "class", "ml-1 mr-1");
    			attr(svg, "width", "16");
    			attr(svg, "height", "16");
    			attr(svg, "viewBox", "0 0 16 16");
    			attr(svg, "role", "img");
    			set_style(svg, "min-width", "16px");
    			add_location(svg, file$a, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(svg);
    			}
    		}
    	};
    }

    class Gift extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$b, safe_not_equal, []);
    	}
    }

    /* src/components/icons/rocket.svelte generated by Svelte v3.4.4 */

    const file$b = "src/components/icons/rocket.svelte";

    function create_fragment$c(ctx) {
    	var svg, path;

    	return {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			set_style(path, "fill", "#586069");
    			attr(path, "fill-rule", "evenodd");
    			attr(path, "d", "M12.17\n    3.83c-.27-.27-.47-.55-.63-.88-.16-.31-.27-.66-.34-1.02-.58.33-1.16.7-1.73\n    1.13-.58.44-1.14.94-1.69 1.48-.7.7-1.33 1.81-1.78 2.45H3L0\n    10h3l2-2c-.34.77-1.02 2.98-1 3l1 1c.02.02 2.23-.64 3-1l-2 2v3l3-3v-3c.64-.45\n    1.75-1.09 2.45-1.78.55-.55 1.05-1.13 1.47-1.7.44-.58.81-1.16\n    1.14-1.72-.36-.08-.7-.19-1.03-.34a3.39 3.39 0 0 1-.86-.63zM16 0s-.09.38-.3\n    1.06c-.2.7-.55 1.58-1.06\n    2.66-.7-.08-1.27-.33-1.66-.72-.39-.39-.63-.94-.7-1.64C13.36.84 14.23.48\n    14.92.28 15.62.08 16 0 16 0z");
    			add_location(path, file$b, 7, 2, 107);
    			attr(svg, "aria-label", "rocket");
    			attr(svg, "class", "mr-1");
    			attr(svg, "width", "16");
    			attr(svg, "height", "16");
    			attr(svg, "viewBox", "0 0 16 16");
    			attr(svg, "role", "img");
    			add_location(svg, file$b, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(svg);
    			}
    		}
    	};
    }

    class Rocket extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$c, safe_not_equal, []);
    	}
    }

    /* src/components/icons/megaphone.svelte generated by Svelte v3.4.4 */

    /* src/components/content/projects.svelte generated by Svelte v3.4.4 */

    const file$c = "src/components/content/projects.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.project = list[i];
    	return child_ctx;
    }

    // (32:6) {#each projects as project}
    function create_each_block$1(ctx) {
    	var li, div4, h5, a, t0_value = ctx.project.title, t0, a_href_value, t1, p, t2_value = ctx.project.description, t2, t3, div3, div0, span, t4, small0, t5_value = ctx.project.language, t5, t6, div1, t7, small1, t8_value = ctx.project.status, t8, t9, div2, t10, small2, t11_value = ctx.project.year, t11, t12, current;

    	var rocket = new Rocket({ $$inline: true });

    	var calendar = new Calendar({ $$inline: true });

    	return {
    		c: function create() {
    			li = element("li");
    			div4 = element("div");
    			h5 = element("h5");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			div3 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t4 = space();
    			small0 = element("small");
    			t5 = text(t5_value);
    			t6 = space();
    			div1 = element("div");
    			rocket.$$.fragment.c();
    			t7 = space();
    			small1 = element("small");
    			t8 = text(t8_value);
    			t9 = space();
    			div2 = element("div");
    			calendar.$$.fragment.c();
    			t10 = space();
    			small2 = element("small");
    			t11 = text(t11_value);
    			t12 = space();
    			a.href = a_href_value = ctx.project.url;
    			add_location(a, file$c, 37, 14, 999);
    			h5.className = "text-bold";
    			add_location(h5, file$c, 36, 12, 962);
    			p.className = "text-gray text-small d-block mt-2 mb-3";
    			add_location(p, file$c, 39, 12, 1073);
    			span.className = "language-indicator position-relative d-inline-block";
    			set_style(span, "background-color", ctx.randomColor());
    			add_location(span, file$c, 44, 16, 1288);
    			small0.className = "f6 text-gray";
    			add_location(small0, file$c, 47, 16, 1451);
    			div0.className = "mr-3";
    			add_location(div0, file$c, 43, 14, 1253);
    			small1.className = "f6 text-gray";
    			add_location(small1, file$c, 51, 16, 1628);
    			div1.className = "mr-3 d-flex flex-items-center";
    			add_location(div1, file$c, 49, 14, 1541);
    			small2.className = "f6 text-gray";
    			add_location(small2, file$c, 55, 16, 1800);
    			div2.className = "d-flex flex-items-center";
    			add_location(div2, file$c, 53, 14, 1716);
    			div3.className = "d-flex flex-row flex-justify-start";
    			add_location(div3, file$c, 42, 12, 1190);
    			div4.className = "flex-column";
    			add_location(div4, file$c, 35, 10, 924);
    			li.className = "d-flex p-3 mb-3 mr-2 border border-gray-dark rounded-1\n          pinned-item svelte-taiixn";
    			add_location(li, file$c, 32, 8, 814);
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);
    			append(li, div4);
    			append(div4, h5);
    			append(h5, a);
    			append(a, t0);
    			append(div4, t1);
    			append(div4, p);
    			append(p, t2);
    			append(div4, t3);
    			append(div4, div3);
    			append(div3, div0);
    			append(div0, span);
    			append(div0, t4);
    			append(div0, small0);
    			append(small0, t5);
    			append(div3, t6);
    			append(div3, div1);
    			mount_component(rocket, div1, null);
    			append(div1, t7);
    			append(div1, small1);
    			append(small1, t8);
    			append(div3, t9);
    			append(div3, div2);
    			mount_component(calendar, div2, null);
    			append(div2, t10);
    			append(div2, small2);
    			append(small2, t11);
    			append(li, t12);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if ((!current || changed.projects) && t0_value !== (t0_value = ctx.project.title)) {
    				set_data(t0, t0_value);
    			}

    			if ((!current || changed.projects) && a_href_value !== (a_href_value = ctx.project.url)) {
    				a.href = a_href_value;
    			}

    			if ((!current || changed.projects) && t2_value !== (t2_value = ctx.project.description)) {
    				set_data(t2, t2_value);
    			}

    			if (!current || changed.randomColor) {
    				set_style(span, "background-color", ctx.randomColor());
    			}

    			if ((!current || changed.projects) && t5_value !== (t5_value = ctx.project.language)) {
    				set_data(t5, t5_value);
    			}

    			if ((!current || changed.projects) && t8_value !== (t8_value = ctx.project.status)) {
    				set_data(t8, t8_value);
    			}

    			if ((!current || changed.projects) && t11_value !== (t11_value = ctx.project.year)) {
    				set_data(t11, t11_value);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			rocket.$$.fragment.i(local);

    			calendar.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			rocket.$$.fragment.o(local);
    			calendar.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}

    			rocket.$destroy();

    			calendar.$destroy();
    		}
    	};
    }

    function create_fragment$d(ctx) {
    	var section, h3, t_1, ul, div, current;

    	var each_value = ctx.projects;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	function outro_block(i, detaching, local) {
    		if (each_blocks[i]) {
    			if (detaching) {
    				on_outro(() => {
    					each_blocks[i].d(detaching);
    					each_blocks[i] = null;
    				});
    			}

    			each_blocks[i].o(local);
    		}
    	}

    	return {
    		c: function create() {
    			section = element("section");
    			h3 = element("h3");
    			h3.textContent = "Pinned Projects";
    			t_1 = space();
    			ul = element("ul");
    			div = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			h3.id = "section-1-header";
    			h3.className = "f4 mb-2 text-normal";
    			add_location(h3, file$c, 28, 2, 574);
    			div.className = "d-flex flex-wrap flex-justify-between pinned-list svelte-taiixn";
    			add_location(div, file$c, 30, 4, 708);
    			ul.className = "d-flex flex-column list-style-none mb-1";
    			add_location(ul, file$c, 29, 2, 651);
    			section.className = "mt-4";
    			attr(section, "aria-labelledby", "section-1-header");
    			add_location(section, file$c, 27, 0, 514);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, section, anchor);
    			append(section, h3);
    			append(section, t_1);
    			append(section, ul);
    			append(ul, div);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.projects || changed.randomColor) {
    				each_value = ctx.projects;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						each_blocks[i].i(1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].i(1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();
    				for (; i < each_blocks.length; i += 1) outro_block(i, 1, 1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) each_blocks[i].i();

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) outro_block(i, 0);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(section);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	

      let { randomColor, projects } = $$props;

    	const writable_props = ['randomColor', 'projects'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Projects> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('randomColor' in $$props) $$invalidate('randomColor', randomColor = $$props.randomColor);
    		if ('projects' in $$props) $$invalidate('projects', projects = $$props.projects);
    	};

    	return { randomColor, projects };
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$d, safe_not_equal, ["randomColor", "projects"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.randomColor === undefined && !('randomColor' in props)) {
    			console.warn("<Projects> was created without expected prop 'randomColor'");
    		}
    		if (ctx.projects === undefined && !('projects' in props)) {
    			console.warn("<Projects> was created without expected prop 'projects'");
    		}
    	}

    	get randomColor() {
    		throw new Error("<Projects>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set randomColor(value) {
    		throw new Error("<Projects>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get projects() {
    		throw new Error("<Projects>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set projects(value) {
    		throw new Error("<Projects>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/icons/git-repo.svelte generated by Svelte v3.4.4 */

    const file$d = "src/components/icons/git-repo.svelte";

    function create_fragment$e(ctx) {
    	var svg, path;

    	return {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr(path, "fill", "#586069");
    			attr(path, "fill-rule", "evenodd");
    			attr(path, "d", "M4 9H3V8h1v1zm0-3H3v1h1V6zm0-2H3v1h1V4zm0-2H3v1h1V2zm8-1v12c0 .55-.45 1-1\n    1H6v2l-1.5-1.5L3 16v-2H1c-.55 0-1-.45-1-1V1c0-.55.45-1 1-1h10c.55 0 1 .45 1\n    1zm-1 10H1v2h2v-1h3v1h5v-2zm0-10H2v9h9V1z");
    			add_location(path, file$d, 6, 2, 94);
    			attr(svg, "aria-label", "git-repo");
    			attr(svg, "width", "12");
    			attr(svg, "height", "16");
    			attr(svg, "viewBox", "0 0 12 16");
    			attr(svg, "role", "img");
    			add_location(svg, file$d, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(svg);
    			}
    		}
    	};
    }

    class Git_repo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$e, safe_not_equal, []);
    	}
    }

    /* src/components/content/experiences.svelte generated by Svelte v3.4.4 */

    const file$e = "src/components/content/experiences.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.color = list[i];
    	return child_ctx;
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.experience = list[i];
    	return child_ctx;
    }

    // (106:49) 
    function create_if_block_2(ctx) {
    	var current;

    	var gift = new Gift({ $$inline: true });

    	return {
    		c: function create() {
    			gift.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(gift, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			gift.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			gift.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			gift.$destroy(detaching);
    		}
    	};
    }

    // (104:12) {#if experience.icon === 'git'}
    function create_if_block_1(ctx) {
    	var current;

    	var gitrepo = new Git_repo({ $$inline: true });

    	return {
    		c: function create() {
    			gitrepo.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(gitrepo, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			gitrepo.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			gitrepo.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			gitrepo.$destroy(detaching);
    		}
    	};
    }

    // (179:12) {:else}
    function create_else_block(ctx) {
    	var span0, t0_value = ctx.experience.type, t0, t1, small, span1, t2, t3_value = ctx.experience.technology, t3;

    	return {
    		c: function create() {
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			small = element("small");
    			span1 = element("span");
    			t2 = space();
    			t3 = text(t3_value);
    			span0.className = "pr-3";
    			add_location(span0, file$e, 179, 14, 5604);
    			span1.className = "language-indicator position-relative d-inline-block";
    			set_style(span1, "background-color", ctx.randomColor());
    			add_location(span1, file$e, 181, 16, 5712);
    			small.className = "f6 text-gray pt-1";
    			add_location(small, file$e, 180, 14, 5662);
    		},

    		m: function mount(target, anchor) {
    			insert(target, span0, anchor);
    			append(span0, t0);
    			insert(target, t1, anchor);
    			insert(target, small, anchor);
    			append(small, span1);
    			append(small, t2);
    			append(small, t3);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.experiences) && t0_value !== (t0_value = ctx.experience.type)) {
    				set_data(t0, t0_value);
    			}

    			if (changed.randomColor) {
    				set_style(span1, "background-color", ctx.randomColor());
    			}

    			if ((changed.experiences) && t3_value !== (t3_value = ctx.experience.technology)) {
    				set_data(t3, t3_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span0);
    				detach(t1);
    				detach(small);
    			}
    		}
    	};
    }

    // (119:12) {#if experience.isCard}
    function create_if_block(ctx) {
    	var div7, div6, div0, svg, path, t0, h3, t1_value = ctx.experience.card.title, t1, t2, p, t3_value = ctx.experience.card.description, t3, t4, div5, div1, small0, t5, t6_value = ctx.experience.card.motivation.positive, t6, t7, small1, t8, t9_value = ctx.experience.card.motivation.negative, t9, t10, div4, div2, t11, div3, span, t13, small2, t14_value = ctx.experience.card.type, t14;

    	var each_value_1 = ctx.experience.card.motivation.colorCount;

    	var each_blocks = [];

    	for (var i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	return {
    		c: function create() {
    			div7 = element("div");
    			div6 = element("div");
    			div0 = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			div5 = element("div");
    			div1 = element("div");
    			small0 = element("small");
    			t5 = text("+ ");
    			t6 = text(t6_value);
    			t7 = space();
    			small1 = element("small");
    			t8 = text("- ");
    			t9 = text(t9_value);
    			t10 = space();
    			div4 = element("div");
    			div2 = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t11 = space();
    			div3 = element("div");
    			span = element("span");
    			span.textContent = "•";
    			t13 = space();
    			small2 = element("small");
    			t14 = text(t14_value);
    			attr(path, "fill", "#28a745");
    			attr(path, "fill-rule", "evenodd");
    			attr(path, "d", "M6.5 0C3.48 0 1 2.19 1 5c0 .92.55 2.25 1 3 1.34 2.25\n                        1.78 2.78 2 4v1h5v-1c.22-1.22.66-1.75 2-4 .45-.75 1-2.08\n                        1-3 0-2.81-2.48-5-5.5-5zm3.64 7.48c-.25.44-.47.8-.67\n                        1.11-.86 1.41-1.25 2.06-1.45\n                        3.23-.02.05-.02.11-.02.17H5c0-.06\n                        0-.13-.02-.17-.2-1.17-.59-1.83-1.45-3.23-.2-.31-.42-.67-.67-1.11C2.44\n                        6.78 2 5.65 2 5c0-2.2 2.02-4 4.5-4 1.22 0 2.36.42 3.22\n                        1.19C10.55 2.94 11 3.94 11 5c0 .66-.44 1.78-.86 2.48zM4\n                        14h5c-.23 1.14-1.3 2-2.5 2s-2.27-.86-2.5-2z");
    			add_location(path, file$e, 132, 22, 3300);
    			attr(svg, "aria-label", "lightbulb");
    			attr(svg, "class", "mr-2 timeline-card-octicon svelte-1w5qewm");
    			attr(svg, "width", "12");
    			attr(svg, "height", "16");
    			attr(svg, "viewBox", "0 0 12 16");
    			attr(svg, "role", "img");
    			set_style(svg, "min-width", "16px");
    			add_location(svg, file$e, 124, 20, 2982);
    			h3.className = "lh-condensed timeline-card-header svelte-1w5qewm";
    			add_location(h3, file$e, 146, 20, 4111);
    			div0.className = "d-flex timeline-card flex-items-center svelte-1w5qewm";
    			add_location(div0, file$e, 123, 18, 2909);
    			p.className = "timeline-card-text text-gray mt-2 mb-3 svelte-1w5qewm";
    			add_location(p, file$e, 150, 18, 4274);
    			small0.className = "f6 text-green text-bold pt-1 mr-3";
    			add_location(small0, file$e, 155, 22, 4559);
    			small1.className = "f6 pt-1 text-red text-bold";
    			add_location(small1, file$e, 158, 22, 4726);
    			div1.className = "timeline-card-info d-flex svelte-1w5qewm";
    			add_location(div1, file$e, 154, 20, 4497);
    			div2.className = "mx-3";
    			add_location(div2, file$e, 163, 22, 4973);
    			span.className = "text-gray-light mx-1";
    			add_location(span, file$e, 169, 24, 5260);
    			small2.className = "f6 text-gray pt-2";
    			add_location(small2, file$e, 170, 24, 5328);
    			add_location(div3, file$e, 168, 22, 5230);
    			div4.className = "timeline-card-info d-flex svelte-1w5qewm";
    			add_location(div4, file$e, 162, 20, 4911);
    			div5.className = "timeline-card-text d-flex flex-justify-evenly svelte-1w5qewm";
    			add_location(div5, file$e, 153, 18, 4417);
    			add_location(div6, file$e, 122, 16, 2885);
    			div7.className = "border border-gray-dark rounded-1 p-3 mt-3 timeline-card\n                d-flex svelte-1w5qewm";
    			add_location(div7, file$e, 119, 14, 2759);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div7, anchor);
    			append(div7, div6);
    			append(div6, div0);
    			append(div0, svg);
    			append(svg, path);
    			append(div0, t0);
    			append(div0, h3);
    			append(h3, t1);
    			append(div6, t2);
    			append(div6, p);
    			append(p, t3);
    			append(div6, t4);
    			append(div6, div5);
    			append(div5, div1);
    			append(div1, small0);
    			append(small0, t5);
    			append(small0, t6);
    			append(div1, t7);
    			append(div1, small1);
    			append(small1, t8);
    			append(small1, t9);
    			append(div5, t10);
    			append(div5, div4);
    			append(div4, div2);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append(div4, t11);
    			append(div4, div3);
    			append(div3, span);
    			append(div3, t13);
    			append(div3, small2);
    			append(small2, t14);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.experiences) && t1_value !== (t1_value = ctx.experience.card.title)) {
    				set_data(t1, t1_value);
    			}

    			if ((changed.experiences) && t3_value !== (t3_value = ctx.experience.card.description)) {
    				set_data(t3, t3_value);
    			}

    			if ((changed.experiences) && t6_value !== (t6_value = ctx.experience.card.motivation.positive)) {
    				set_data(t6, t6_value);
    			}

    			if ((changed.experiences) && t9_value !== (t9_value = ctx.experience.card.motivation.negative)) {
    				set_data(t9, t9_value);
    			}

    			if (changed.experiences) {
    				each_value_1 = ctx.experience.card.motivation.colorCount;

    				for (var i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value_1.length;
    			}

    			if ((changed.experiences) && t14_value !== (t14_value = ctx.experience.card.type)) {
    				set_data(t14, t14_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div7);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (165:24) {#each experience.card.motivation.colorCount as color}
    function create_each_block_1(ctx) {
    	var span, span_class_value;

    	return {
    		c: function create() {
    			span = element("span");
    			span.className = span_class_value = "timeline-card-commits bg-" + ctx.color + " svelte-1w5qewm";
    			add_location(span, file$e, 165, 26, 5097);
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.experiences) && span_class_value !== (span_class_value = "timeline-card-commits bg-" + ctx.color + " svelte-1w5qewm")) {
    				span.className = span_class_value;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    			}
    		}
    	};
    }

    // (85:2) {#each experiences as experience}
    function create_each_block$2(ctx) {
    	var div5, div0, h3, t0_value = ctx.experience.months, t0, t1, span0, t2_value = ctx.experience.years, t2, t3, span1, t4, div4, div1, span2, t5, span3, current_block_type_index, if_block0, t6, span4, t7, div3, span5, t8_value = ctx.experience.commit, t8, t9, div2, t10, current;

    	var if_block_creators = [
    		create_if_block_1,
    		create_if_block_2
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (ctx.experience.icon === 'git') return 0;
    		if (ctx.experience.icon === 'gift') return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	function select_block_type_1(ctx) {
    		if (ctx.experience.isCard) return create_if_block;
    		return create_else_block;
    	}

    	var current_block_type = select_block_type_1(ctx);
    	var if_block1 = current_block_type(ctx);

    	return {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			span0 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			span1 = element("span");
    			t4 = space();
    			div4 = element("div");
    			div1 = element("div");
    			span2 = element("span");
    			t5 = space();
    			span3 = element("span");
    			if (if_block0) if_block0.c();
    			t6 = space();
    			span4 = element("span");
    			t7 = space();
    			div3 = element("div");
    			span5 = element("span");
    			t8 = text(t8_value);
    			t9 = space();
    			div2 = element("div");
    			if_block1.c();
    			t10 = space();
    			span0.className = "pl-1 text-gray";
    			add_location(span0, file$e, 89, 10, 1628);
    			h3.className = "h6 pr-2 py-1 d-flex flex-nowrap";
    			add_location(h3, file$e, 87, 8, 1542);
    			span1.className = "timeline-horizontal gray-timeline svelte-1w5qewm";
    			set_style(span1, "flex-basis", "auto");
    			set_style(span1, "flex-grow", "2");
    			add_location(span1, file$e, 91, 8, 1705);
    			div0.className = "d-flex flex-row flex-items-center flex-start";
    			add_location(div0, file$e, 86, 6, 1475);
    			span2.className = "timeline-line-top gray-timeline svelte-1w5qewm";
    			add_location(span2, file$e, 99, 10, 1982);
    			span3.className = "d-flex flex-items-center flex-justify-center\n            timeline-circle-marker gray-timeline svelte-1w5qewm";
    			add_location(span3, file$e, 100, 10, 2041);
    			span4.className = "timeline-line-bottom gray-timeline svelte-1w5qewm";
    			set_style(span4, "flex-basis", "auto");
    			set_style(span4, "flex-grow", "2");
    			add_location(span4, file$e, 109, 10, 2351);
    			div1.className = "mr-3 d-flex flex-column flex-items-center flex-justify-center";
    			add_location(div1, file$e, 97, 8, 1886);
    			span5.className = "f4 text-gray lh-condensed";
    			add_location(span5, file$e, 114, 10, 2524);
    			div2.className = "d-flex flex-wrap flex-row flex-justify-start\n            flex-items-center mt-2";
    			add_location(div2, file$e, 115, 10, 2603);
    			div3.className = "py-3 pr-3";
    			add_location(div3, file$e, 113, 8, 2490);
    			div4.className = "d-flex flex-row flex-nowrap";
    			add_location(div4, file$e, 96, 6, 1836);
    			div5.className = "width-full";
    			add_location(div5, file$e, 85, 4, 1444);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div5, anchor);
    			append(div5, div0);
    			append(div0, h3);
    			append(h3, t0);
    			append(h3, t1);
    			append(h3, span0);
    			append(span0, t2);
    			append(div0, t3);
    			append(div0, span1);
    			append(div5, t4);
    			append(div5, div4);
    			append(div4, div1);
    			append(div1, span2);
    			append(div1, t5);
    			append(div1, span3);
    			if (~current_block_type_index) if_blocks[current_block_type_index].m(span3, null);
    			append(div1, t6);
    			append(div1, span4);
    			append(div4, t7);
    			append(div4, div3);
    			append(div3, span5);
    			append(span5, t8);
    			append(div3, t9);
    			append(div3, div2);
    			if_block1.m(div2, null);
    			append(div5, t10);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if ((!current || changed.experiences) && t0_value !== (t0_value = ctx.experience.months)) {
    				set_data(t0, t0_value);
    			}

    			if ((!current || changed.experiences) && t2_value !== (t2_value = ctx.experience.years)) {
    				set_data(t2, t2_value);
    			}

    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index !== previous_block_index) {
    				if (if_block0) {
    					group_outros();
    					on_outro(() => {
    						if_blocks[previous_block_index].d(1);
    						if_blocks[previous_block_index] = null;
    					});
    					if_block0.o(1);
    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block0 = if_blocks[current_block_type_index];
    					if (!if_block0) {
    						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block0.c();
    					}
    					if_block0.i(1);
    					if_block0.m(span3, null);
    				} else {
    					if_block0 = null;
    				}
    			}

    			if ((!current || changed.experiences) && t8_value !== (t8_value = ctx.experience.commit)) {
    				set_data(t8, t8_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(changed, ctx);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);
    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div2, null);
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (if_block0) if_block0.i();
    			current = true;
    		},

    		o: function outro(local) {
    			if (if_block0) if_block0.o();
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div5);
    			}

    			if (~current_block_type_index) if_blocks[current_block_type_index].d();
    			if_block1.d();
    		}
    	};
    }

    function create_fragment$f(ctx) {
    	var section, h3, t_1, current;

    	var each_value = ctx.experiences;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	function outro_block(i, detaching, local) {
    		if (each_blocks[i]) {
    			if (detaching) {
    				on_outro(() => {
    					each_blocks[i].d(detaching);
    					each_blocks[i] = null;
    				});
    			}

    			each_blocks[i].o(local);
    		}
    	}

    	return {
    		c: function create() {
    			section = element("section");
    			h3 = element("h3");
    			h3.textContent = "Experience activity";
    			t_1 = space();

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			h3.id = "section-3-header";
    			h3.className = "f4 mb-2 text-normal";
    			add_location(h3, file$e, 82, 2, 1324);
    			section.className = "mt-5";
    			attr(section, "aria-labelledby", "section-3-header");
    			add_location(section, file$e, 81, 0, 1264);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, section, anchor);
    			append(section, h3);
    			append(section, t_1);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.experiences || changed.randomColor) {
    				each_value = ctx.experiences;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						each_blocks[i].i(1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].i(1);
    						each_blocks[i].m(section, null);
    					}
    				}

    				group_outros();
    				for (; i < each_blocks.length; i += 1) outro_block(i, 1, 1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) each_blocks[i].i();

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) outro_block(i, 0);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(section);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	

      let { randomColor, experiences } = $$props;

    	const writable_props = ['randomColor', 'experiences'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Experiences> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('randomColor' in $$props) $$invalidate('randomColor', randomColor = $$props.randomColor);
    		if ('experiences' in $$props) $$invalidate('experiences', experiences = $$props.experiences);
    	};

    	return { randomColor, experiences };
    }

    class Experiences extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$f, safe_not_equal, ["randomColor", "experiences"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.randomColor === undefined && !('randomColor' in props)) {
    			console.warn("<Experiences> was created without expected prop 'randomColor'");
    		}
    		if (ctx.experiences === undefined && !('experiences' in props)) {
    			console.warn("<Experiences> was created without expected prop 'experiences'");
    		}
    	}

    	get randomColor() {
    		throw new Error("<Experiences>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set randomColor(value) {
    		throw new Error("<Experiences>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get experiences() {
    		throw new Error("<Experiences>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set experiences(value) {
    		throw new Error("<Experiences>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/content/index.svelte generated by Svelte v3.4.4 */

    const file$f = "src/components/content/index.svelte";

    // (144:2) {:else}
    function create_else_block$1(ctx) {
    	var current;

    	var experiences_1 = new Experiences({
    		props: {
    		experiences: ctx.experiences,
    		randomColor: ctx.randomColor
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			experiences_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(experiences_1, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var experiences_1_changes = {};
    			if (changed.experiences) experiences_1_changes.experiences = ctx.experiences;
    			if (changed.randomColor) experiences_1_changes.randomColor = ctx.randomColor;
    			experiences_1.$set(experiences_1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			experiences_1.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			experiences_1.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			experiences_1.$destroy(detaching);
    		}
    	};
    }

    // (142:2) {#if overview === 1}
    function create_if_block$1(ctx) {
    	var current;

    	var projects_1 = new Projects({
    		props: {
    		projects: ctx.projects,
    		randomColor: ctx.randomColor
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			projects_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(projects_1, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var projects_1_changes = {};
    			if (changed.projects) projects_1_changes.projects = ctx.projects;
    			if (changed.randomColor) projects_1_changes.randomColor = ctx.randomColor;
    			projects_1.$set(projects_1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			projects_1.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			projects_1.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			projects_1.$destroy(detaching);
    		}
    	};
    }

    function create_fragment$g(ctx) {
    	var div1, nav, div0, span1, t0, span0, t1_value = ctx.projects.length, t1, span1_class_value, t2, span3, t3, span2, t4_value = ctx.experiences.length, t4, span3_class_value, t5, current_block_type_index, if_block, current, dispose;

    	var if_block_creators = [
    		create_if_block$1,
    		create_else_block$1
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (ctx.overview === 1) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			div1 = element("div");
    			nav = element("nav");
    			div0 = element("div");
    			span1 = element("span");
    			t0 = text("Projects\n        ");
    			span0 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			span3 = element("span");
    			t3 = text("Experiences\n        ");
    			span2 = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			if_block.c();
    			span0.className = "Counter";
    			add_location(span0, file$f, 129, 8, 3651);
    			span1.title = "Overview";
    			span1.className = span1_class_value = "UnderlineNav-item " + (ctx.overview === 1 ? 'selected' : '') + " svelte-cuggrr";
    			add_location(span1, file$f, 124, 6, 3482);
    			span2.className = "Counter";
    			add_location(span2, file$f, 136, 8, 3893);
    			span3.title = "Experiences";
    			span3.className = span3_class_value = "UnderlineNav-item " + (ctx.overview === 2 ? 'selected' : '') + " svelte-cuggrr";
    			add_location(span3, file$f, 131, 6, 3718);
    			div0.className = "UnderlineNav-body";
    			add_location(div0, file$f, 123, 4, 3444);
    			nav.className = "UnderlineNav";
    			add_location(nav, file$f, 122, 2, 3413);
    			div1.className = "pb-4 pl-2 menu-large svelte-cuggrr";
    			add_location(div1, file$f, 121, 0, 3376);

    			dispose = [
    				listen(span1, "click", ctx.click_handler),
    				listen(span3, "click", ctx.click_handler_1)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, nav);
    			append(nav, div0);
    			append(div0, span1);
    			append(span1, t0);
    			append(span1, span0);
    			append(span0, t1);
    			append(div0, t2);
    			append(div0, span3);
    			append(span3, t3);
    			append(span3, span2);
    			append(span2, t4);
    			append(div1, t5);
    			if_blocks[current_block_type_index].m(div1, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if ((!current || changed.overview) && span1_class_value !== (span1_class_value = "UnderlineNav-item " + (ctx.overview === 1 ? 'selected' : '') + " svelte-cuggrr")) {
    				span1.className = span1_class_value;
    			}

    			if ((!current || changed.overview) && span3_class_value !== (span3_class_value = "UnderlineNav-item " + (ctx.overview === 2 ? 'selected' : '') + " svelte-cuggrr")) {
    				span3.className = span3_class_value;
    			}

    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				on_outro(() => {
    					if_blocks[previous_block_index].d(1);
    					if_blocks[previous_block_index] = null;
    				});
    				if_block.o(1);
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				if_block.i(1);
    				if_block.m(div1, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (if_block) if_block.i();
    			current = true;
    		},

    		o: function outro(local) {
    			if (if_block) if_block.o();
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			if_blocks[current_block_type_index].d();
    			run_all(dispose);
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	

      let { randomColor } = $$props;

      const projects = [
        {
          url: "https://github.com/MontoyaAndres/AVMod",
          title: "AVMod",
          description:
            "Create your own powershell, malware desktop app or even clickjacking web with a single command for unix and windows systems.",
          language: "Python",
          status: "Working on",
          year: "2019"
        },
        {
          url: "https://github.com/MontoyaAndres/GradeProject",
          title: "Exception of absenteeism UNIMINUTO",
          description:
            "Software Remission (exception of absenteeism) for UNIMINUTO Girardot, Colombia",
          language: "JavaScript",
          status: "Completed",
          year: "2018"
        },
        {
          url: "https://github.com/MontoyaAndres/slack-clone",
          title: "slack-clone",
          description:
            "Slack clone, the funtionality to create and login users who will can create workspaces, channels and send text or multimedia messages",
          language: "JavaScript",
          status: "Completed",
          year: "2018"
        },
        {
          url: "https://github.com/MontoyaAndres/FacebookNews",
          title: "Simulate a Fake news with Facebook? 👀",
          description: "Simulate a Facebook news section to deceive your victims!",
          language: "JavaScript",
          status: "Completed",
          year: "2019"
        },
        {
          url: "https://github.com/MontoyaAndres/platzi/tree/master/hapi-hello",
          title: "Platzioverflow",
          description: "Ask what you need and you will receive any response!",
          language: "JavaScript",
          status: "Completed",
          year: "2019"
        },
        {
          url:
            "https://github.com/MontoyaAndres/platzi/tree/master/electron-platzipics",
          title: "Platzipics",
          description:
            "Edit and filter your images with this desktop app on Windows, Mac or Linux",
          language: "JavaScript",
          status: "Completed",
          year: "2019"
        },
        {
          url: "https://github.com/MontoyaAndres/PWA-APP.git",
          title: "EDgram",
          description:
            "Progressive web application to upload your photos with your friends",
          language: "JavaScript",
          status: "Completed",
          year: "2018"
        }
      ];

      const experiences = [
        {
          months: "february-october",
          years: "2016-2019",
          icon: "gift",
          commit:
            "Finished Technology in Informatics career at UNIMINUTO Centro regional Girardot",
          type: "study/university",
          technology: "Community"
        },
        {
          months: "november",
          years: "2018-*",
          icon: "git",
          commit: "Let's beginning an entrepreneurship!",
          isCard: true,
          card: {
            title: "Te Vi Colombia",
            description:
              "Application for helping people and companies to grow up in their entrepreneurship, professional practices and employment in Colombia.",
            motivation: {
              positive: "JavaScript",
              negative: "Free time",
              colorCount: ["green", "green", "green", "red", "red"]
            },
            type: "Private"
          }
        }
      ];

      let overview = 1;

      function handleOverview(value) {
        $$invalidate('overview', overview = value);
      }

    	const writable_props = ['randomColor'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	function click_handler() {
    		return handleOverview(1);
    	}

    	function click_handler_1() {
    		return handleOverview(2);
    	}

    	$$self.$set = $$props => {
    		if ('randomColor' in $$props) $$invalidate('randomColor', randomColor = $$props.randomColor);
    	};

    	return {
    		randomColor,
    		projects,
    		experiences,
    		overview,
    		handleOverview,
    		click_handler,
    		click_handler_1
    	};
    }

    class Index$2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$g, safe_not_equal, ["randomColor"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.randomColor === undefined && !('randomColor' in props)) {
    			console.warn("<Index> was created without expected prop 'randomColor'");
    		}
    	}

    	get randomColor() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set randomColor(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.4.4 */

    const file$g = "src/App.svelte";

    // (28:0) <Layout>
    function create_default_slot(ctx) {
    	var div, t, current;

    	var resume = new Index$1({
    		props: { randomColor: newColor },
    		$$inline: true
    	});

    	var content = new Index$2({
    		props: { randomColor: newColor },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div = element("div");
    			resume.$$.fragment.c();
    			t = space();
    			content.$$.fragment.c();
    			div.className = "d-flex flex-justify-around flex-wrap column-container svelte-mbjxqh";
    			add_location(div, file$g, 28, 2, 500);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(resume, div, null);
    			append(div, t);
    			mount_component(content, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var resume_changes = {};
    			if (changed.newColor) resume_changes.randomColor = newColor;
    			resume.$set(resume_changes);

    			var content_changes = {};
    			if (changed.newColor) content_changes.randomColor = newColor;
    			content.$set(content_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			resume.$$.fragment.i(local);

    			content.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			resume.$$.fragment.o(local);
    			content.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			resume.$destroy();

    			content.$destroy();
    		}
    	};
    }

    function create_fragment$h(ctx) {
    	var current;

    	var layout = new Index({
    		props: {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			layout.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(layout, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var layout_changes = {};
    			if (changed.$$scope) layout_changes.$$scope = { changed, ctx };
    			layout.$set(layout_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			layout.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			layout.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			layout.$destroy(detaching);
    		}
    	};
    }

    function newColor() {
      return (
        "#" +
        Math.random()
          .toString(16)
          .substr(-6)
      );
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$h, safe_not_equal, []);
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
