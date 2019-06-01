
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
        "Prisma",
        "Firebase",
        "PostgreSQL",
        "Figma",
        "Python",
        "Electron.js"
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

    /* src/components/projects/menu.svelte generated by Svelte v3.4.4 */

    const file$9 = "src/components/projects/menu.svelte";

    function create_fragment$a(ctx) {
    	var nav, div, a0, t0, span0, t1, t2, a1, t3, span1, t4;

    	return {
    		c: function create() {
    			nav = element("nav");
    			div = element("div");
    			a0 = element("a");
    			t0 = text("Projects\n      ");
    			span0 = element("span");
    			t1 = text(ctx.projects);
    			t2 = space();
    			a1 = element("a");
    			t3 = text("Experiences\n      ");
    			span1 = element("span");
    			t4 = text(ctx.experiences);
    			span0.className = "Counter";
    			add_location(span0, file$9, 9, 6, 236);
    			a0.href = "#projects";
    			a0.title = "Overview";
    			a0.className = "UnderlineNav-item selected";
    			add_location(a0, file$9, 7, 4, 142);
    			span1.className = "Counter";
    			add_location(span1, file$9, 13, 6, 383);
    			a1.href = "#experiences";
    			a1.title = "Experiences";
    			a1.className = "UnderlineNav-item";
    			add_location(a1, file$9, 11, 4, 289);
    			div.className = "UnderlineNav-body";
    			add_location(div, file$9, 6, 2, 106);
    			nav.className = "UnderlineNav";
    			add_location(nav, file$9, 5, 0, 77);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, nav, anchor);
    			append(nav, div);
    			append(div, a0);
    			append(a0, t0);
    			append(a0, span0);
    			append(span0, t1);
    			append(div, t2);
    			append(div, a1);
    			append(a1, t3);
    			append(a1, span1);
    			append(span1, t4);
    		},

    		p: function update(changed, ctx) {
    			if (changed.projects) {
    				set_data(t1, ctx.projects);
    			}

    			if (changed.experiences) {
    				set_data(t4, ctx.experiences);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(nav);
    			}
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { projects = 0, experiences = 0 } = $$props;

    	const writable_props = ['projects', 'experiences'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('projects' in $$props) $$invalidate('projects', projects = $$props.projects);
    		if ('experiences' in $$props) $$invalidate('experiences', experiences = $$props.experiences);
    	};

    	return { projects, experiences };
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$a, safe_not_equal, ["projects", "experiences"]);
    	}

    	get projects() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set projects(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get experiences() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set experiences(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/icons/organization.svelte generated by Svelte v3.4.4 */

    /* src/components/icons/calendar.svelte generated by Svelte v3.4.4 */

    const file$a = "src/components/icons/calendar.svelte";

    function create_fragment$b(ctx) {
    	var svg, path;

    	return {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			set_style(path, "fill", "#586069");
    			attr(path, "fill-rule", "evenodd");
    			attr(path, "d", "M13 2h-1v1.5c0 .28-.22.5-.5.5h-2c-.28 0-.5-.22-.5-.5V2H6v1.5c0\n    .28-.22.5-.5.5h-2c-.28 0-.5-.22-.5-.5V2H2c-.55 0-1 .45-1 1v11c0 .55.45 1 1\n    1h11c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm0 12H2V5h11v9zM5 3H4V1h1v2zm6\n    0h-1V1h1v2zM6 7H5V6h1v1zm2 0H7V6h1v1zm2 0H9V6h1v1zm2 0h-1V6h1v1zM4\n    9H3V8h1v1zm2 0H5V8h1v1zm2 0H7V8h1v1zm2 0H9V8h1v1zm2 0h-1V8h1v1zm-8\n    2H3v-1h1v1zm2 0H5v-1h1v1zm2 0H7v-1h1v1zm2 0H9v-1h1v1zm2 0h-1v-1h1v1zm-8\n    2H3v-1h1v1zm2 0H5v-1h1v1zm2 0H7v-1h1v1zm2 0H9v-1h1v1z");
    			add_location(path, file$a, 7, 2, 109);
    			attr(svg, "aria-label", "calendar");
    			attr(svg, "class", "mr-1");
    			attr(svg, "width", "14");
    			attr(svg, "height", "16");
    			attr(svg, "viewBox", "0 0 14 16");
    			attr(svg, "role", "img");
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

    class Calendar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$b, safe_not_equal, []);
    	}
    }

    /* src/components/icons/gift.svelte generated by Svelte v3.4.4 */

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

    /* src/components/projects/index.svelte generated by Svelte v3.4.4 */

    const file$c = "src/components/projects/index.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.project = list[i];
    	return child_ctx;
    }

    // (100:8) {#each projects as project}
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
    			add_location(a, file$c, 105, 16, 3073);
    			h5.className = "text-bold";
    			add_location(h5, file$c, 104, 14, 3034);
    			p.className = "text-gray text-small d-block mt-2 mb-3";
    			add_location(p, file$c, 107, 14, 3151);
    			span.className = "language-indicator position-relative d-inline-block svelte-cufehv";
    			set_style(span, "background-color", ctx.randomColor());
    			add_location(span, file$c, 112, 18, 3376);
    			small0.className = "f6 text-gray";
    			add_location(small0, file$c, 115, 18, 3545);
    			div0.className = "mr-3";
    			add_location(div0, file$c, 111, 16, 3339);
    			small1.className = "f6 text-gray";
    			add_location(small1, file$c, 119, 18, 3730);
    			div1.className = "mr-3 d-flex flex-items-center";
    			add_location(div1, file$c, 117, 16, 3639);
    			small2.className = "f6 text-gray";
    			add_location(small2, file$c, 123, 18, 3910);
    			div2.className = "d-flex flex-items-center";
    			add_location(div2, file$c, 121, 16, 3822);
    			div3.className = "d-flex flex-row flex-justify-start";
    			add_location(div3, file$c, 110, 14, 3274);
    			div4.className = "flex-column";
    			add_location(div4, file$c, 103, 12, 2994);
    			li.className = "d-flex p-3 mb-3 mr-2 border border-gray-dark rounded-1\n            pinned-item svelte-cufehv";
    			add_location(li, file$c, 100, 10, 2878);
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
    			if (!current || changed.randomColor) {
    				set_style(span, "background-color", ctx.randomColor());
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
    	var div1, t0, section, h3, t2, ul, div0, current;

    	var menu = new Menu({
    		props: { projects: ctx.projects.length },
    		$$inline: true
    	});

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
    			div1 = element("div");
    			menu.$$.fragment.c();
    			t0 = space();
    			section = element("section");
    			h3 = element("h3");
    			h3.textContent = "Pinned Projects";
    			t2 = space();
    			ul = element("ul");
    			div0 = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			h3.id = "section-1-header";
    			h3.className = "f4 mb-2 text-normal";
    			add_location(h3, file$c, 96, 4, 2630);
    			div0.className = "d-flex flex-wrap flex-justify-between pinned-list svelte-cufehv";
    			add_location(div0, file$c, 98, 6, 2768);
    			ul.className = "d-flex flex-column list-style-none mb-1";
    			add_location(ul, file$c, 97, 4, 2709);
    			section.className = "mt-4";
    			attr(section, "aria-labelledby", "section-1-header");
    			add_location(section, file$c, 95, 2, 2568);
    			div1.className = "pb-4 pl-2";
    			add_location(div1, file$c, 92, 0, 2503);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			mount_component(menu, div1, null);
    			append(div1, t0);
    			append(div1, section);
    			append(section, h3);
    			append(section, t2);
    			append(section, ul);
    			append(ul, div0);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var menu_changes = {};
    			if (changed.projects) menu_changes.projects = ctx.projects.length;
    			menu.$set(menu_changes);

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
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();
    				for (; i < each_blocks.length; i += 1) outro_block(i, 1, 1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			menu.$$.fragment.i(local);

    			for (var i = 0; i < each_value.length; i += 1) each_blocks[i].i();

    			current = true;
    		},

    		o: function outro(local) {
    			menu.$$.fragment.o(local);

    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) outro_block(i, 0);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			menu.$destroy();

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	

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
        }
      ];

    	const writable_props = ['randomColor'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('randomColor' in $$props) $$invalidate('randomColor', randomColor = $$props.randomColor);
    	};

    	return { randomColor, projects };
    }

    class Index$2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$d, safe_not_equal, ["randomColor"]);

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

    const file$d = "src/App.svelte";

    // (35:0) <Layout>
    function create_default_slot(ctx) {
    	var div, t, current;

    	var resume = new Index$1({
    		props: { randomColor: newColor },
    		$$inline: true
    	});

    	var projects = new Index$2({
    		props: { randomColor: newColor },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div = element("div");
    			resume.$$.fragment.c();
    			t = space();
    			projects.$$.fragment.c();
    			div.className = "d-flex flex-justify-around flex-wrap column-container svelte-127q8ll";
    			add_location(div, file$d, 35, 2, 602);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(resume, div, null);
    			append(div, t);
    			mount_component(projects, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var resume_changes = {};
    			if (changed.newColor) resume_changes.randomColor = newColor;
    			resume.$set(resume_changes);

    			var projects_changes = {};
    			if (changed.newColor) projects_changes.randomColor = newColor;
    			projects.$set(projects_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			resume.$$.fragment.i(local);

    			projects.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			resume.$$.fragment.o(local);
    			projects.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			resume.$destroy();

    			projects.$destroy();
    		}
    	};
    }

    function create_fragment$e(ctx) {
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
    		init(this, options, null, create_fragment$e, safe_not_equal, []);
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
