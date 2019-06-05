
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

    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (!stop) {
                    return; // not ready
                }
                subscribers.forEach((s) => s[1]());
                subscribers.forEach((s) => s[0](value));
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                }
            };
        }
        return { set, update, subscribe };
    }

    const language = writable("en");

    /* src/components/layout/header.svelte generated by Svelte v3.4.4 */

    const file = "src/components/layout/header.svelte";

    function create_fragment(ctx) {
    	var div2, header, div1, div0, img, t0, h1, t2, button, t3, dispose;

    	return {
    		c: function create() {
    			div2 = element("div");
    			header = element("header");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Andrés Montoya";
    			t2 = space();
    			button = element("button");
    			t3 = text(ctx.current_language);
    			img.src = "/images/world_white.svg";
    			img.className = "mr-3";
    			img.height = "35";
    			img.alt = "luna dog";
    			add_location(img, file, 16, 8, 363);
    			h1.className = "h4 f5 text-white text-bold";
    			add_location(h1, file, 21, 8, 489);
    			div0.className = "flex-auto d-flex";
    			add_location(div0, file, 15, 6, 324);
    			button.className = "btn btn-purple";
    			attr(button, "role", "button");
    			add_location(button, file, 23, 6, 567);
    			div1.className = "flex-auto d-flex flex-justify-between pr-3";
    			add_location(div1, file, 14, 4, 261);
    			header.className = "main-content mx-auto p-responsive d-flex flex-items-center flex-wrap svelte-187w73k";
    			add_location(header, file, 12, 2, 167);
    			div2.className = "bg-gray-dark";
    			add_location(div2, file, 11, 0, 138);
    			dispose = listen(button, "click", ctx.handleCurrentLanguage);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, header);
    			append(header, div1);
    			append(div1, div0);
    			append(div0, img);
    			append(div0, t0);
    			append(div0, h1);
    			append(div1, t2);
    			append(div1, button);
    			append(button, t3);
    		},

    		p: function update(changed, ctx) {
    			if (changed.current_language) {
    				set_data(t3, ctx.current_language);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    			}

    			dispose();
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { current_language, handleCurrentLanguage } = $$props;

    	const writable_props = ['current_language', 'handleCurrentLanguage'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('current_language' in $$props) $$invalidate('current_language', current_language = $$props.current_language);
    		if ('handleCurrentLanguage' in $$props) $$invalidate('handleCurrentLanguage', handleCurrentLanguage = $$props.handleCurrentLanguage);
    	};

    	return { current_language, handleCurrentLanguage };
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["current_language", "handleCurrentLanguage"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.current_language === undefined && !('current_language' in props)) {
    			console.warn("<Header> was created without expected prop 'current_language'");
    		}
    		if (ctx.handleCurrentLanguage === undefined && !('handleCurrentLanguage' in props)) {
    			console.warn("<Header> was created without expected prop 'handleCurrentLanguage'");
    		}
    	}

    	get current_language() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set current_language(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleCurrentLanguage() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleCurrentLanguage(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/layout/footer.svelte generated by Svelte v3.4.4 */

    const file$1 = "src/components/layout/footer.svelte";

    function create_fragment$1(ctx) {
    	var footer, p, raw_value = ctx.json[ctx.current_language].footer;

    	return {
    		c: function create() {
    			footer = element("footer");
    			p = element("p");
    			p.className = "mb-2";
    			add_location(p, file$1, 6, 2, 110);
    			footer.className = "mb-6 pt-4 border-top";
    			add_location(footer, file$1, 5, 0, 70);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, footer, anchor);
    			append(footer, p);
    			p.innerHTML = raw_value;
    		},

    		p: function update(changed, ctx) {
    			if ((changed.json || changed.current_language) && raw_value !== (raw_value = ctx.json[ctx.current_language].footer)) {
    				p.innerHTML = raw_value;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(footer);
    			}
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { json, current_language } = $$props;

    	const writable_props = ['json', 'current_language'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('json' in $$props) $$invalidate('json', json = $$props.json);
    		if ('current_language' in $$props) $$invalidate('current_language', current_language = $$props.current_language);
    	};

    	return { json, current_language };
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["json", "current_language"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.json === undefined && !('json' in props)) {
    			console.warn("<Footer> was created without expected prop 'json'");
    		}
    		if (ctx.current_language === undefined && !('current_language' in props)) {
    			console.warn("<Footer> was created without expected prop 'current_language'");
    		}
    	}

    	get json() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set json(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get current_language() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set current_language(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const en={footer:"This site was created using <a href='http://primer.github.io'>GitHub's Primer Design System CSS</a> and inspired by <a href='https://github.com/nataliemarleny'>Natalie Marleny</a>"};const es={footer:"Este sitio fue creado usando <a href='http://primer.github.io'>GitHub's Primer Design System CSS</a> e inspirado por <a href='https://github.com/nataliemarleny'>Natalie Marleny</a>"};var Language = {en:en,es:es};

    /* src/components/layout/index.svelte generated by Svelte v3.4.4 */

    const file$2 = "src/components/layout/index.svelte";

    function create_fragment$2(ctx) {
    	var t0, div, t1, current;

    	var header = new Header({
    		props: {
    		current_language: ctx.current_language,
    		handleCurrentLanguage: handleCurrentLanguage
    	},
    		$$inline: true
    	});

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	var footer = new Footer({
    		props: {
    		json: Language,
    		current_language: ctx.current_language
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			header.$$.fragment.c();
    			t0 = space();
    			div = element("div");

    			if (default_slot) default_slot.c();
    			t1 = space();
    			footer.$$.fragment.c();

    			div.className = "main-content mx-auto px-3 p-responsive mt-4";
    			add_location(div, file$2, 19, 0, 440);
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
    			var header_changes = {};
    			if (changed.current_language) header_changes.current_language = ctx.current_language;
    			if (changed.handleCurrentLanguage) header_changes.handleCurrentLanguage = handleCurrentLanguage;
    			header.$set(header_changes);

    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}

    			var footer_changes = {};
    			if (changed.Language) footer_changes.json = Language;
    			if (changed.current_language) footer_changes.current_language = ctx.current_language;
    			footer.$set(footer_changes);
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

    function handleCurrentLanguage() {
      language.update(value => (value === "es" ? "en" : "es"));
    }

    function instance$2($$self, $$props, $$invalidate) {
    	

      let current_language;

      language.subscribe(value => {
        $$invalidate('current_language', current_language = value);
      });

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return { current_language, $$slots, $$scope };
    }

    class Index extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, []);
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
    	var img, t0, div, h1, t2, h20, t3_value = ctx.json[ctx.current_language].subtitle, t3, t4, h21, t6, p, t7_value = ctx.json[ctx.current_language].description, t7, t8, a0, t9_value = ctx.json[ctx.current_language].codeMessage, t9, t10, aside, a1, t11_value = ctx.json[ctx.current_language].networkMessage, t11, t12, ul, li0, t13, t14, li1, t15, a2, current;

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
    			t3 = text(t3_value);
    			t4 = space();
    			h21 = element("h2");
    			h21.textContent = "(Front-End / Back-End・JavaScript)";
    			t6 = space();
    			p = element("p");
    			t7 = text(t7_value);
    			t8 = space();
    			a0 = element("a");
    			t9 = text(t9_value);
    			t10 = space();
    			aside = element("aside");
    			a1 = element("a");
    			t11 = text(t11_value);
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
    			add_location(img, file$5, 21, 0, 348);
    			h1.className = "text-bold summary-name svelte-1vysvvc";
    			add_location(h1, file$5, 27, 2, 461);
    			h20.className = "f3-light text-gray summary-subtitle svelte-1vysvvc";
    			add_location(h20, file$5, 28, 2, 535);
    			h21.className = "f3-light text-gray summary-subtitle svelte-1vysvvc";
    			add_location(h21, file$5, 31, 2, 633);
    			div.className = "py-3";
    			add_location(div, file$5, 26, 0, 440);
    			p.className = "f5 mb-3 gray-900-text";
    			add_location(p, file$5, 35, 0, 735);
    			a0.className = "btn mb-3 text-center text-gray-dark no-underline summary-button svelte-1vysvvc";
    			attr(a0, "role", "button");
    			a0.tabIndex = "0";
    			a0.href = "https://github.com/MontoyaAndres/andresmontoyain";
    			add_location(a0, file$5, 37, 0, 812);
    			a1.href = "https://www.linkedin.com/in/andresmontoyain/";
    			a1.className = "muted-link";
    			add_location(a1, file$5, 46, 2, 1079);
    			aside.className = "btn-link text-small muted-link mb-3";
    			add_location(aside, file$5, 45, 0, 1025);
    			li0.className = "d-flex flex-row flex-items-center flex-justify-start pt-1";
    			add_location(li0, file$5, 52, 2, 1281);
    			a2.href = "https://github.com/andresmontoyain";
    			add_location(a2, file$5, 58, 4, 1494);
    			li1.className = "d-flex flex-row flex-items-center flex-justify-start pt-1";
    			add_location(li1, file$5, 56, 2, 1406);
    			ul.className = "list-style-none border-top border-gray-light py-3";
    			add_location(ul, file$5, 51, 0, 1216);
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
    			append(h20, t3);
    			append(div, t4);
    			append(div, h21);
    			insert(target, t6, anchor);
    			insert(target, p, anchor);
    			append(p, t7);
    			insert(target, t8, anchor);
    			insert(target, a0, anchor);
    			append(a0, t9);
    			insert(target, t10, anchor);
    			insert(target, aside, anchor);
    			append(aside, a1);
    			append(a1, t11);
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

    		p: function update(changed, ctx) {
    			if ((!current || changed.json || changed.current_language) && t3_value !== (t3_value = ctx.json[ctx.current_language].subtitle)) {
    				set_data(t3, t3_value);
    			}

    			if ((!current || changed.json || changed.current_language) && t7_value !== (t7_value = ctx.json[ctx.current_language].description)) {
    				set_data(t7, t7_value);
    			}

    			if ((!current || changed.json || changed.current_language) && t9_value !== (t9_value = ctx.json[ctx.current_language].codeMessage)) {
    				set_data(t9, t9_value);
    			}

    			if ((!current || changed.json || changed.current_language) && t11_value !== (t11_value = ctx.json[ctx.current_language].networkMessage)) {
    				set_data(t11, t11_value);
    			}
    		},

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

    function instance$3($$self, $$props, $$invalidate) {
    	

      let { json, current_language } = $$props;

    	const writable_props = ['json', 'current_language'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Summary> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('json' in $$props) $$invalidate('json', json = $$props.json);
    		if ('current_language' in $$props) $$invalidate('current_language', current_language = $$props.current_language);
    	};

    	return { json, current_language };
    }

    class Summary extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$5, safe_not_equal, ["json", "current_language"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.json === undefined && !('json' in props)) {
    			console.warn("<Summary> was created without expected prop 'json'");
    		}
    		if (ctx.current_language === undefined && !('current_language' in props)) {
    			console.warn("<Summary> was created without expected prop 'current_language'");
    		}
    	}

    	get json() {
    		throw new Error("<Summary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set json(value) {
    		throw new Error("<Summary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get current_language() {
    		throw new Error("<Summary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set current_language(value) {
    		throw new Error("<Summary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/resume/elsewhere.svelte generated by Svelte v3.4.4 */

    const file$6 = "src/components/resume/elsewhere.svelte";

    function create_fragment$6(ctx) {
    	var div, h3, t0_value = ctx.json[ctx.current_language].socialNetworkTitle, t0, t1, a0, img0, t2, a1, img1, t3, a2, img2, t4, a3, img3, t5, a4, img4;

    	return {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
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
    			add_location(h3, file$6, 6, 2, 107);
    			img0.src = "images/github.svg";
    			img0.className = "mr-1";
    			img0.height = "35";
    			img0.alt = "GitHub Logo";
    			add_location(img0, file$6, 11, 4, 309);
    			attr(a0, "aria-label", "GitHub");
    			a0.className = "tooltipped tooltipped-n avatar-group-item";
    			a0.href = "https://github.com/MontoyaAndres/";
    			add_location(a0, file$6, 7, 2, 178);
    			img1.src = "images/twitter.png";
    			img1.className = "mr-1";
    			img1.height = "35";
    			img1.alt = "Twitter Logo.";
    			add_location(img1, file$6, 17, 4, 528);
    			attr(a1, "aria-label", "Twitter");
    			a1.className = "tooltipped tooltipped-n avatar-group-item";
    			a1.href = "https://twitter.com/andresmontoyain/";
    			add_location(a1, file$6, 13, 2, 393);
    			img2.src = "images/instagram.png";
    			img2.className = "mr-1";
    			img2.height = "35";
    			img2.alt = "Instagram Logo.";
    			add_location(img2, file$6, 27, 4, 782);
    			attr(a2, "aria-label", "Instagram");
    			a2.className = "tooltipped tooltipped-n avatar-group-item";
    			a2.href = "https://www.instagram.com/andresmontoyain/";
    			add_location(a2, file$6, 23, 2, 639);
    			img3.src = "images/dev.svg";
    			img3.alt = "Andrés Montoya's DEV Profile";
    			img3.height = "35";
    			img3.width = "35";
    			add_location(img3, file$6, 37, 4, 1022);
    			attr(a3, "aria-label", "Dev");
    			a3.className = "tooltipped tooltipped-n avatar-group-item";
    			a3.href = "https://dev.to/andresmontoyain";
    			add_location(a3, file$6, 33, 2, 897);
    			img4.src = "images/platzi.png";
    			img4.alt = "Platzi Logo.";
    			img4.height = "35";
    			img4.width = "35";
    			add_location(img4, file$6, 47, 4, 1275);
    			attr(a4, "aria-label", "Platzi");
    			a4.className = "tooltipped tooltipped-n avatar-group-item";
    			a4.href = "https://platzi.com/@andresmontoyain";
    			add_location(a4, file$6, 43, 2, 1142);
    			div.className = "border-top py-3 pr-3";
    			add_location(div, file$6, 5, 0, 70);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h3);
    			append(h3, t0);
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

    		p: function update(changed, ctx) {
    			if ((changed.json || changed.current_language) && t0_value !== (t0_value = ctx.json[ctx.current_language].socialNetworkTitle)) {
    				set_data(t0, t0_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { json, current_language } = $$props;

    	const writable_props = ['json', 'current_language'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Elsewhere> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('json' in $$props) $$invalidate('json', json = $$props.json);
    		if ('current_language' in $$props) $$invalidate('current_language', current_language = $$props.current_language);
    	};

    	return { json, current_language };
    }

    class Elsewhere extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$6, safe_not_equal, ["json", "current_language"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.json === undefined && !('json' in props)) {
    			console.warn("<Elsewhere> was created without expected prop 'json'");
    		}
    		if (ctx.current_language === undefined && !('current_language' in props)) {
    			console.warn("<Elsewhere> was created without expected prop 'current_language'");
    		}
    	}

    	get json() {
    		throw new Error("<Elsewhere>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set json(value) {
    		throw new Error("<Elsewhere>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get current_language() {
    		throw new Error("<Elsewhere>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set current_language(value) {
    		throw new Error("<Elsewhere>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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

    function instance$5($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$5, create_fragment$7, safe_not_equal, ["title", "items", "randomColor"]);

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
    		title: ctx.json[ctx.current_language].setToolsTitle,
    		items: ctx.toolkits,
    		randomColor: ctx.randomColor
    	},
    		$$inline: true
    	});

    	var toolkitset1 = new Toolkit_set({
    		props: {
    		title: ctx.json[ctx.current_language].learningToolsTitle,
    		items: ctx.learning,
    		randomColor: ctx.randomColor
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
    			if (changed.json || changed.current_language) toolkitset0_changes.title = ctx.json[ctx.current_language].setToolsTitle;
    			if (changed.toolkits) toolkitset0_changes.items = ctx.toolkits;
    			if (changed.randomColor) toolkitset0_changes.randomColor = ctx.randomColor;
    			toolkitset0.$set(toolkitset0_changes);

    			var toolkitset1_changes = {};
    			if (changed.json || changed.current_language) toolkitset1_changes.title = ctx.json[ctx.current_language].learningToolsTitle;
    			if (changed.learning) toolkitset1_changes.items = ctx.learning;
    			if (changed.randomColor) toolkitset1_changes.randomColor = ctx.randomColor;
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

    function instance$6($$self, $$props, $$invalidate) {
    	let { json, current_language, randomColor } = $$props;

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

    	const writable_props = ['json', 'current_language', 'randomColor'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Toolkit> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('json' in $$props) $$invalidate('json', json = $$props.json);
    		if ('current_language' in $$props) $$invalidate('current_language', current_language = $$props.current_language);
    		if ('randomColor' in $$props) $$invalidate('randomColor', randomColor = $$props.randomColor);
    	};

    	return {
    		json,
    		current_language,
    		randomColor,
    		toolkits,
    		learning
    	};
    }

    class Toolkit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$8, safe_not_equal, ["json", "current_language", "randomColor"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.json === undefined && !('json' in props)) {
    			console.warn("<Toolkit> was created without expected prop 'json'");
    		}
    		if (ctx.current_language === undefined && !('current_language' in props)) {
    			console.warn("<Toolkit> was created without expected prop 'current_language'");
    		}
    		if (ctx.randomColor === undefined && !('randomColor' in props)) {
    			console.warn("<Toolkit> was created without expected prop 'randomColor'");
    		}
    	}

    	get json() {
    		throw new Error("<Toolkit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set json(value) {
    		throw new Error("<Toolkit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get current_language() {
    		throw new Error("<Toolkit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set current_language(value) {
    		throw new Error("<Toolkit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get randomColor() {
    		throw new Error("<Toolkit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set randomColor(value) {
    		throw new Error("<Toolkit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const en$1={subtitle:"Software Engineer in training",description:"Fallen in love about programming and languages culture. Improving my learning!",codeMessage:"View this resume inside 👀",networkMessage:"Professional network",socialNetworkTitle:"Elsewhere",setToolsTitle:"Toolkit Set",learningToolsTitle:"Learning"};const es$1={subtitle:"Ingeniero de Software en formación",description:"Enamorado de la programación y la cultura de los idiomas. Mejorando mi aprendizaje!",codeMessage:"Ver este resumen por dentro 👀",networkMessage:"Red profesional",socialNetworkTitle:"¿Dónde más?",setToolsTitle:"Conjunto de herramientas",learningToolsTitle:"Aprendiendo"};var Language$1 = {en:en$1,es:es$1};

    /* src/components/resume/index.svelte generated by Svelte v3.4.4 */

    const file$8 = "src/components/resume/index.svelte";

    function create_fragment$9(ctx) {
    	var section, t0, t1, current;

    	var summary = new Summary({
    		props: {
    		json: Language$1,
    		current_language: ctx.current_language
    	},
    		$$inline: true
    	});

    	var elsewhere = new Elsewhere({
    		props: {
    		json: Language$1,
    		current_language: ctx.current_language
    	},
    		$$inline: true
    	});

    	var toolkit = new Toolkit({
    		props: {
    		json: Language$1,
    		current_language: ctx.current_language,
    		randomColor: ctx.randomColor
    	},
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
    			add_location(section, file$8, 23, 0, 420);
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
    			var summary_changes = {};
    			if (changed.Language) summary_changes.json = Language$1;
    			if (changed.current_language) summary_changes.current_language = ctx.current_language;
    			summary.$set(summary_changes);

    			var elsewhere_changes = {};
    			if (changed.Language) elsewhere_changes.json = Language$1;
    			if (changed.current_language) elsewhere_changes.current_language = ctx.current_language;
    			elsewhere.$set(elsewhere_changes);

    			var toolkit_changes = {};
    			if (changed.Language) toolkit_changes.json = Language$1;
    			if (changed.current_language) toolkit_changes.current_language = ctx.current_language;
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

    function instance$7($$self, $$props, $$invalidate) {
    	

      let { randomColor } = $$props;

      let current_language;

      language.subscribe(value => {
        $$invalidate('current_language', current_language = value);
      });

    	const writable_props = ['randomColor'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('randomColor' in $$props) $$invalidate('randomColor', randomColor = $$props.randomColor);
    	};

    	return { randomColor, current_language };
    }

    class Index$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$9, safe_not_equal, ["randomColor"]);

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

    // (36:6) {#each projects as project}
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
    			add_location(a, file$c, 41, 14, 1050);
    			h5.className = "text-bold";
    			add_location(h5, file$c, 40, 12, 1013);
    			p.className = "text-gray text-small d-block mt-2 mb-3";
    			add_location(p, file$c, 43, 12, 1124);
    			span.className = "language-indicator position-relative d-inline-block";
    			set_style(span, "background-color", ctx.randomColor());
    			add_location(span, file$c, 48, 16, 1339);
    			small0.className = "f6 text-gray";
    			add_location(small0, file$c, 51, 16, 1502);
    			div0.className = "mr-3";
    			add_location(div0, file$c, 47, 14, 1304);
    			small1.className = "f6 text-gray";
    			add_location(small1, file$c, 55, 16, 1679);
    			div1.className = "mr-3 d-flex flex-items-center";
    			add_location(div1, file$c, 53, 14, 1592);
    			small2.className = "f6 text-gray";
    			add_location(small2, file$c, 59, 16, 1851);
    			div2.className = "d-flex flex-items-center";
    			add_location(div2, file$c, 57, 14, 1767);
    			div3.className = "d-flex flex-row flex-justify-start";
    			add_location(div3, file$c, 46, 12, 1241);
    			div4.className = "flex-column";
    			add_location(div4, file$c, 39, 10, 975);
    			li.className = "d-flex p-3 mb-3 mr-2 border border-gray-dark rounded-1\n          pinned-item svelte-taiixn";
    			add_location(li, file$c, 36, 8, 865);
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
    	var section, h3, t0, t1, ul, div, current;

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
    			t0 = text(ctx.sectionProjectsTitle);
    			t1 = space();
    			ul = element("ul");
    			div = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			h3.id = "section-1-header";
    			h3.className = "f4 mb-2 text-normal";
    			add_location(h3, file$c, 29, 2, 609);
    			div.className = "d-flex flex-wrap flex-justify-between pinned-list svelte-taiixn";
    			add_location(div, file$c, 34, 4, 759);
    			ul.className = "d-flex flex-column list-style-none mb-1";
    			add_location(ul, file$c, 33, 2, 702);
    			section.className = "mt-4";
    			attr(section, "aria-labelledby", "section-1-header");
    			add_location(section, file$c, 28, 0, 549);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, section, anchor);
    			append(section, h3);
    			append(h3, t0);
    			append(section, t1);
    			append(section, ul);
    			append(ul, div);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!current || changed.sectionProjectsTitle) {
    				set_data(t0, ctx.sectionProjectsTitle);
    			}

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

    function instance$8($$self, $$props, $$invalidate) {
    	

      let { sectionProjectsTitle, projects, randomColor } = $$props;

    	const writable_props = ['sectionProjectsTitle', 'projects', 'randomColor'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Projects> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('sectionProjectsTitle' in $$props) $$invalidate('sectionProjectsTitle', sectionProjectsTitle = $$props.sectionProjectsTitle);
    		if ('projects' in $$props) $$invalidate('projects', projects = $$props.projects);
    		if ('randomColor' in $$props) $$invalidate('randomColor', randomColor = $$props.randomColor);
    	};

    	return {
    		sectionProjectsTitle,
    		projects,
    		randomColor
    	};
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$d, safe_not_equal, ["sectionProjectsTitle", "projects", "randomColor"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.sectionProjectsTitle === undefined && !('sectionProjectsTitle' in props)) {
    			console.warn("<Projects> was created without expected prop 'sectionProjectsTitle'");
    		}
    		if (ctx.projects === undefined && !('projects' in props)) {
    			console.warn("<Projects> was created without expected prop 'projects'");
    		}
    		if (ctx.randomColor === undefined && !('randomColor' in props)) {
    			console.warn("<Projects> was created without expected prop 'randomColor'");
    		}
    	}

    	get sectionProjectsTitle() {
    		throw new Error("<Projects>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sectionProjectsTitle(value) {
    		throw new Error("<Projects>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get projects() {
    		throw new Error("<Projects>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set projects(value) {
    		throw new Error("<Projects>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get randomColor() {
    		throw new Error("<Projects>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set randomColor(value) {
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

    // (112:51) 
    function create_if_block_4(ctx) {
    	var current;

    	var rocket = new Rocket({ $$inline: true });

    	return {
    		c: function create() {
    			rocket.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(rocket, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			rocket.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			rocket.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			rocket.$destroy(detaching);
    		}
    	};
    }

    // (110:49) 
    function create_if_block_3(ctx) {
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

    // (108:12) {#if experience.icon === 'git'}
    function create_if_block_2(ctx) {
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

    // (123:10) {#if experience.urlFile}
    function create_if_block_1(ctx) {
    	var div, img, img_src_value, img_alt_value;

    	return {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			img.className = "text-center width-fit";
    			img.src = img_src_value = ctx.experience.urlFile;
    			img.alt = img_alt_value = ctx.experience.commit;
    			add_location(img, file$e, 126, 14, 2942);
    			div.className = "border border-gray-dark rounded-1 p-2 mt-1";
    			set_style(div, "max-width", "350px");
    			add_location(div, file$e, 123, 12, 2818);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, img);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.experiences) && img_src_value !== (img_src_value = ctx.experience.urlFile)) {
    				img.src = img_src_value;
    			}

    			if ((changed.experiences) && img_alt_value !== (img_alt_value = ctx.experience.commit)) {
    				img.alt = img_alt_value;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    // (197:12) {:else}
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
    			add_location(span0, file$e, 197, 14, 6122);
    			span1.className = "language-indicator position-relative d-inline-block";
    			set_style(span1, "background-color", ctx.randomColor());
    			add_location(span1, file$e, 199, 16, 6230);
    			small.className = "f6 text-gray pt-1";
    			add_location(small, file$e, 198, 14, 6180);
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

    // (137:12) {#if experience.card}
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
    			add_location(path, file$e, 150, 22, 3818);
    			attr(svg, "aria-label", "lightbulb");
    			attr(svg, "class", "mr-2 timeline-card-octicon svelte-1w5qewm");
    			attr(svg, "width", "12");
    			attr(svg, "height", "16");
    			attr(svg, "viewBox", "0 0 12 16");
    			attr(svg, "role", "img");
    			set_style(svg, "min-width", "16px");
    			add_location(svg, file$e, 142, 20, 3500);
    			h3.className = "lh-condensed timeline-card-header svelte-1w5qewm";
    			add_location(h3, file$e, 164, 20, 4629);
    			div0.className = "d-flex timeline-card flex-items-center svelte-1w5qewm";
    			add_location(div0, file$e, 141, 18, 3427);
    			p.className = "timeline-card-text text-gray mt-2 mb-3 svelte-1w5qewm";
    			add_location(p, file$e, 168, 18, 4792);
    			small0.className = "f6 text-green text-bold pt-1 mr-3";
    			add_location(small0, file$e, 173, 22, 5077);
    			small1.className = "f6 pt-1 text-red text-bold";
    			add_location(small1, file$e, 176, 22, 5244);
    			div1.className = "timeline-card-info d-flex svelte-1w5qewm";
    			add_location(div1, file$e, 172, 20, 5015);
    			div2.className = "mx-3";
    			add_location(div2, file$e, 181, 22, 5491);
    			span.className = "text-gray-light mx-1";
    			add_location(span, file$e, 187, 24, 5778);
    			small2.className = "f6 text-gray pt-2";
    			add_location(small2, file$e, 188, 24, 5846);
    			add_location(div3, file$e, 186, 22, 5748);
    			div4.className = "timeline-card-info d-flex svelte-1w5qewm";
    			add_location(div4, file$e, 180, 20, 5429);
    			div5.className = "timeline-card-text d-flex flex-justify-evenly svelte-1w5qewm";
    			add_location(div5, file$e, 171, 18, 4935);
    			add_location(div6, file$e, 140, 16, 3403);
    			div7.className = "border border-gray-dark rounded-1 p-3 mt-3 timeline-card\n                d-flex svelte-1w5qewm";
    			add_location(div7, file$e, 137, 14, 3277);
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

    // (183:24) {#each experience.card.motivation.colorCount as color}
    function create_each_block_1(ctx) {
    	var span, span_class_value;

    	return {
    		c: function create() {
    			span = element("span");
    			span.className = span_class_value = "timeline-card-commits bg-" + ctx.color + " svelte-1w5qewm";
    			add_location(span, file$e, 183, 26, 5615);
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

    // (89:2) {#each experiences as experience}
    function create_each_block$2(ctx) {
    	var div5, div0, h3, t0_value = ctx.experience.months, t0, t1, span0, t2_value = ctx.experience.years, t2, t3, span1, t4, div4, div1, span2, t5, span3, current_block_type_index, if_block0, t6, span4, t7, div3, span5, t8_value = ctx.experience.commit, t8, t9, t10, div2, t11, current;

    	var if_block_creators = [
    		create_if_block_2,
    		create_if_block_3,
    		create_if_block_4
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (ctx.experience.icon === 'git') return 0;
    		if (ctx.experience.icon === 'gift') return 1;
    		if (ctx.experience.icon === 'rocket') return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	var if_block1 = (ctx.experience.urlFile) && create_if_block_1(ctx);

    	function select_block_type_1(ctx) {
    		if (ctx.experience.card) return create_if_block;
    		return create_else_block;
    	}

    	var current_block_type = select_block_type_1(ctx);
    	var if_block2 = current_block_type(ctx);

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
    			if (if_block1) if_block1.c();
    			t10 = space();
    			div2 = element("div");
    			if_block2.c();
    			t11 = space();
    			span0.className = "pl-1 text-gray";
    			add_location(span0, file$e, 93, 10, 1728);
    			h3.className = "h6 pr-2 py-1 d-flex flex-nowrap";
    			add_location(h3, file$e, 91, 8, 1642);
    			span1.className = "timeline-horizontal gray-timeline svelte-1w5qewm";
    			set_style(span1, "flex-basis", "auto");
    			set_style(span1, "flex-grow", "2");
    			add_location(span1, file$e, 95, 8, 1805);
    			div0.className = "d-flex flex-row flex-items-center flex-start";
    			add_location(div0, file$e, 90, 6, 1575);
    			span2.className = "timeline-line-top gray-timeline svelte-1w5qewm";
    			add_location(span2, file$e, 103, 10, 2082);
    			span3.className = "d-flex flex-items-center flex-justify-center\n            timeline-circle-marker gray-timeline svelte-1w5qewm";
    			add_location(span3, file$e, 104, 10, 2141);
    			span4.className = "timeline-line-bottom gray-timeline svelte-1w5qewm";
    			set_style(span4, "flex-basis", "auto");
    			set_style(span4, "flex-grow", "2");
    			add_location(span4, file$e, 115, 10, 2528);
    			div1.className = "mr-3 d-flex flex-column flex-items-center flex-justify-center";
    			add_location(div1, file$e, 101, 8, 1986);
    			span5.className = "f4 text-gray lh-condensed";
    			add_location(span5, file$e, 120, 10, 2701);
    			div2.className = "d-flex flex-wrap flex-row flex-justify-start\n            flex-items-center mt-2";
    			add_location(div2, file$e, 133, 10, 3123);
    			div3.className = "py-3 pr-3";
    			add_location(div3, file$e, 119, 8, 2667);
    			div4.className = "d-flex flex-row flex-nowrap";
    			add_location(div4, file$e, 100, 6, 1936);
    			div5.className = "width-full";
    			add_location(div5, file$e, 89, 4, 1544);
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
    			if (if_block1) if_block1.m(div3, null);
    			append(div3, t10);
    			append(div3, div2);
    			if_block2.m(div2, null);
    			append(div5, t11);
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

    			if (ctx.experience.urlFile) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(div3, t10);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(changed, ctx);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);
    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div2, null);
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
    			if (if_block1) if_block1.d();
    			if_block2.d();
    		}
    	};
    }

    function create_fragment$f(ctx) {
    	var section, h3, t0, t1, current;

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
    			t0 = text(ctx.sectionExperiencesTitle);
    			t1 = space();

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			h3.id = "section-3-header";
    			h3.className = "f4 mb-2 text-normal";
    			add_location(h3, file$e, 84, 2, 1409);
    			section.className = "mt-5";
    			attr(section, "aria-labelledby", "section-3-header");
    			add_location(section, file$e, 83, 0, 1349);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, section, anchor);
    			append(section, h3);
    			append(h3, t0);
    			append(section, t1);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!current || changed.sectionExperiencesTitle) {
    				set_data(t0, ctx.sectionExperiencesTitle);
    			}

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

    function instance$9($$self, $$props, $$invalidate) {
    	

      let { sectionExperiencesTitle, experiences, randomColor } = $$props;

    	const writable_props = ['sectionExperiencesTitle', 'experiences', 'randomColor'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Experiences> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('sectionExperiencesTitle' in $$props) $$invalidate('sectionExperiencesTitle', sectionExperiencesTitle = $$props.sectionExperiencesTitle);
    		if ('experiences' in $$props) $$invalidate('experiences', experiences = $$props.experiences);
    		if ('randomColor' in $$props) $$invalidate('randomColor', randomColor = $$props.randomColor);
    	};

    	return {
    		sectionExperiencesTitle,
    		experiences,
    		randomColor
    	};
    }

    class Experiences extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$f, safe_not_equal, ["sectionExperiencesTitle", "experiences", "randomColor"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.sectionExperiencesTitle === undefined && !('sectionExperiencesTitle' in props)) {
    			console.warn("<Experiences> was created without expected prop 'sectionExperiencesTitle'");
    		}
    		if (ctx.experiences === undefined && !('experiences' in props)) {
    			console.warn("<Experiences> was created without expected prop 'experiences'");
    		}
    		if (ctx.randomColor === undefined && !('randomColor' in props)) {
    			console.warn("<Experiences> was created without expected prop 'randomColor'");
    		}
    	}

    	get sectionExperiencesTitle() {
    		throw new Error("<Experiences>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sectionExperiencesTitle(value) {
    		throw new Error("<Experiences>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get experiences() {
    		throw new Error("<Experiences>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set experiences(value) {
    		throw new Error("<Experiences>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get randomColor() {
    		throw new Error("<Experiences>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set randomColor(value) {
    		throw new Error("<Experiences>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const en$2={menuProjectsTitle:"Projects",menuExperiencesTitle:"Experiences",sectionProjectsTitle:"Pinned Projects",sectionExperiencesTitle:"Experience activity",projects:[{url:"https://github.com/MontoyaAndres/AVMod",title:"AVMod",description:"Create your own powershell, malware desktop app or even clickjacking web with a single command for unix and windows systems.",language:"Python",status:"Working on",year:"2019"},{url:"https://github.com/MontoyaAndres/GradeProject",title:"Exception of absenteeism UNIMINUTO",description:"Software Remission (exception of absenteeism) for UNIMINUTO Girardot, Colombia",language:"JavaScript",status:"Completed",year:"2018"},{url:"https://github.com/MontoyaAndres/slack-clone",title:"slack-clone",description:"Slack clone, the funtionality to create and login users who will can create workspaces, channels and send text or multimedia messages",language:"JavaScript",status:"Completed",year:"2018"},{url:"https://github.com/MontoyaAndres/FacebookNews",title:"Simulate a Fake news with Facebook? 👀",description:"Simulate a Facebook news section to deceive your victims!",language:"JavaScript",status:"Completed",year:"2019"},{url:"https://github.com/MontoyaAndres/platzi/tree/master/hapi-hello",title:"Platzioverflow",description:"Ask what you need and you will receive any response!",language:"JavaScript",status:"Completed",year:"2019"},{url:"https://github.com/MontoyaAndres/platzi/tree/master/electron-platzipics",title:"Platzipics",description:"Edit and filter your images with this desktop app on Windows, Mac or Linux",language:"JavaScript",status:"Completed",year:"2019"},{url:"https://github.com/MontoyaAndres/PWA-APP.git",title:"EDgram",description:"Progressive web application to upload your photos with your friends",language:"JavaScript",status:"Completed",year:"2018"}],experiences:[{months:"february-october",years:"2016-2019",icon:"gift",commit:"Finished Technology in Informatics career at UNIMINUTO Centro regional Girardot",type:"study/university",technology:"Community"},{months:"may",years:"2019",icon:"rocket",urlFile:"images/diploma-backend-javascript.jpg",commit:"Diploma of \"BACKEND CON JAVASCRIPT\"",type:"study/platzi",technology:"JavaScript"},{months:"may",years:"2019",icon:"gift",urlFile:"images/premio-excelencia.jpeg",commit:"Recognition in the \"NOCHE DE LA EXCELENCIA\" at UNIMINUTO Centro regional Girardot",type:"study/university",technology:"Community"},{months:"april",years:"2019",icon:"rocket",urlFile:"images/diploma-idioma-ingles.jpg",commit:"Diploma of \"CARRERA DE INGLÉS\"",type:"study/platzi",technology:"Pation"},{months:"april",years:"2019",icon:"rocket",urlFile:"images/diploma-desarrollo-react.jpg",commit:"Diploma of \"CARRERA DE FRONT-END CON REACT.JS\"",type:"study/platzi",technology:"JavaScript"},{months:"april",years:"2019",icon:"rocket",urlFile:"images/diploma-arquitecto.jpg",commit:"Diploma of \"CARRERA DE ARQUITECTURA FRONT-END\"",type:"study/platzi",technology:"HTML-CSS"},{months:"november",years:"2018-*",icon:"git",commit:"Let's beginning an entrepreneurship!",card:{title:"Te Vi Colombia",description:"Application for helping people and companies to grow up in their entrepreneurship, professional practices and employment in Colombia.",motivation:{positive:"JavaScript",negative:"Free time",colorCount:["green","green","green","red","red"]},type:"Private"}}]};const es$2={menuProjectsTitle:"Proyectos",menuExperiencesTitle:"Experiencias",sectionProjectsTitle:"Proyectos fijados",sectionExperiencesTitle:"Experiencias",projects:[{url:"https://github.com/MontoyaAndres/AVMod",title:"AVMod",description:"Crear tu propia powershell, malware para escritorio o incluso clickjacking web con un único comando para sistemas unix y windows.",language:"Python",status:"Trabajando",year:"2019"},{url:"https://github.com/MontoyaAndres/GradeProject",title:"Excepción de ausentismo UNIMINUTO",description:"Software de remisión (excepción de ausentismo) para la UNIMINUTO Girardot, Colombia",language:"JavaScript",status:"Completado",year:"2018"},{url:"https://github.com/MontoyaAndres/slack-clone",title:"slack-clone",description:"Slack clone, la funcionalidad de crear y registrar usuarios que podrán crear espacios de trabajo, canales y enviar mensajes de texto o archivos.",language:"JavaScript",status:"Completado",year:"2018"},{url:"https://github.com/MontoyaAndres/FacebookNews",title:"Simular una noticia falsa con Facebook? 👀",description:"Simula una sección de noticia falsa de Facebook para engañar a tus victimas!",language:"JavaScript",status:"Completado",year:"2019"},{url:"https://github.com/MontoyaAndres/platzi/tree/master/hapi-hello",title:"Platzioverflow",description:"Pregunta lo que necesitas y recibiras alguna respuesta!",language:"JavaScript",status:"Completado",year:"2019"},{url:"https://github.com/MontoyaAndres/platzi/tree/master/electron-platzipics",title:"Platzipics",description:"Edita y filtra tus imagenes con esta aplicación de escritorio en Windows, Mac o Linux",language:"JavaScript",status:"Completado",year:"2019"},{url:"https://github.com/MontoyaAndres/PWA-APP.git",title:"EDgram",description:"Aplicación web progresiva para subir tus fotos con tus amigos",language:"JavaScript",status:"Completado",year:"2018"}],experiences:[{months:"febrero-octubre",years:"2016-2019",icon:"gift",commit:"Finalice la carrera Tecnología en Informática en la UNIMINUTO Centro regional Girardot",type:"estudio/universidad",technology:"Comunidad"},{months:"mayo",years:"2019",icon:"rocket",urlFile:"images/diploma-backend-javascript.jpg",commit:"Diploma de \"BACKEND CON JAVASCRIPT\"",type:"estudio/platzi",technology:"JavaScript"},{months:"mayo",years:"2019",icon:"gift",urlFile:"images/premio-excelencia.jpeg",commit:"Reconocimiento en la \"NOCHE DE LA EXCELENCIA\" en la UNIMINUTO Centro regional Girardot",type:"estudio/universidad",technology:"Comunidad"},{months:"abril",years:"2019",icon:"rocket",urlFile:"images/diploma-idioma-ingles.jpg",commit:"Diploma de \"CARRERA DE INGLÉS\"",type:"estudio/platzi",technology:"Pasión"},{months:"abril",years:"2019",icon:"rocket",urlFile:"images/diploma-desarrollo-react.jpg",commit:"Diploma de \"CARRERA DE FRONT-END CON REACT.JS\"",type:"estudio/platzi",technology:"JavaScript"},{months:"abril",years:"2019",icon:"rocket",urlFile:"images/diploma-arquitecto.jpg",commit:"Diploma de \"CARRERA DE ARQUITECTURA FRONT-END\"",type:"estudio/platzi",technology:"HTML-CSS"},{months:"noviembre",years:"2018-*",icon:"git",commit:"Comencemos un emprendimiento!",card:{title:"Te Vi Colombia",description:"Aplicación para ayudar personas y compañias a crecer en sus emprendimientos, prácticas profesionales y empleo en Colombia.",motivation:{positive:"JavaScript",negative:"Tiempo libre",colorCount:["green","green","green","red","red"]},type:"Privado"}}]};var json = {en:en$2,es:es$2};

    /* src/components/content/index.svelte generated by Svelte v3.4.4 */

    const file$f = "src/components/content/index.svelte";

    // (62:2) {:else}
    function create_else_block$1(ctx) {
    	var current;

    	var experiences = new Experiences({
    		props: {
    		sectionExperiencesTitle: json[ctx.current_language].sectionExperiencesTitle,
    		experiences: json[ctx.current_language].experiences,
    		randomColor: ctx.randomColor
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			experiences.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(experiences, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var experiences_changes = {};
    			if (changed.json || changed.current_language) experiences_changes.sectionExperiencesTitle = json[ctx.current_language].sectionExperiencesTitle;
    			if (changed.json || changed.current_language) experiences_changes.experiences = json[ctx.current_language].experiences;
    			if (changed.randomColor) experiences_changes.randomColor = ctx.randomColor;
    			experiences.$set(experiences_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			experiences.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			experiences.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			experiences.$destroy(detaching);
    		}
    	};
    }

    // (57:2) {#if overview === 1}
    function create_if_block$1(ctx) {
    	var current;

    	var projects = new Projects({
    		props: {
    		sectionProjectsTitle: json[ctx.current_language].sectionProjectsTitle,
    		projects: json[ctx.current_language].projects,
    		randomColor: ctx.randomColor
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			projects.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(projects, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var projects_changes = {};
    			if (changed.json || changed.current_language) projects_changes.sectionProjectsTitle = json[ctx.current_language].sectionProjectsTitle;
    			if (changed.json || changed.current_language) projects_changes.projects = json[ctx.current_language].projects;
    			if (changed.randomColor) projects_changes.randomColor = ctx.randomColor;
    			projects.$set(projects_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			projects.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			projects.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			projects.$destroy(detaching);
    		}
    	};
    }

    function create_fragment$g(ctx) {
    	var div1, nav, div0, span1, t0_value = json[ctx.current_language].menuProjectsTitle, t0, t1, span0, t2_value = json[ctx.current_language].projects.length, t2, span1_class_value, t3, span3, t4_value = json[ctx.current_language].menuExperiencesTitle, t4, t5, span2, t6_value = json[ctx.current_language].experiences.length, t6, span3_class_value, t7, current_block_type_index, if_block, current, dispose;

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
    			t0 = text(t0_value);
    			t1 = space();
    			span0 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			span3 = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			span2 = element("span");
    			t6 = text(t6_value);
    			t7 = space();
    			if_block.c();
    			span0.className = "Counter";
    			add_location(span0, file$f, 44, 8, 939);
    			span1.title = "Overview";
    			span1.className = span1_class_value = "UnderlineNav-item " + (ctx.overview === 1 ? 'selected' : '') + " svelte-cuggrr";
    			add_location(span1, file$f, 39, 6, 735);
    			span2.className = "Counter";
    			add_location(span2, file$f, 51, 8, 1239);
    			span3.title = "Experiences";
    			span3.className = span3_class_value = "UnderlineNav-item " + (ctx.overview === 2 ? 'selected' : '') + " svelte-cuggrr";
    			add_location(span3, file$f, 46, 6, 1029);
    			div0.className = "UnderlineNav-body";
    			add_location(div0, file$f, 38, 4, 697);
    			nav.className = "UnderlineNav";
    			add_location(nav, file$f, 37, 2, 666);
    			div1.className = "pb-4 pl-2 menu-large svelte-cuggrr";
    			add_location(div1, file$f, 36, 0, 629);

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
    			append(span1, t1);
    			append(span1, span0);
    			append(span0, t2);
    			append(div0, t3);
    			append(div0, span3);
    			append(span3, t4);
    			append(span3, t5);
    			append(span3, span2);
    			append(span2, t6);
    			append(div1, t7);
    			if_blocks[current_block_type_index].m(div1, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if ((!current || changed.current_language) && t0_value !== (t0_value = json[ctx.current_language].menuProjectsTitle)) {
    				set_data(t0, t0_value);
    			}

    			if ((!current || changed.current_language) && t2_value !== (t2_value = json[ctx.current_language].projects.length)) {
    				set_data(t2, t2_value);
    			}

    			if ((!current || changed.overview) && span1_class_value !== (span1_class_value = "UnderlineNav-item " + (ctx.overview === 1 ? 'selected' : '') + " svelte-cuggrr")) {
    				span1.className = span1_class_value;
    			}

    			if ((!current || changed.current_language) && t4_value !== (t4_value = json[ctx.current_language].menuExperiencesTitle)) {
    				set_data(t4, t4_value);
    			}

    			if ((!current || changed.current_language) && t6_value !== (t6_value = json[ctx.current_language].experiences.length)) {
    				set_data(t6, t6_value);
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

    function instance$a($$self, $$props, $$invalidate) {
    	

      let { randomColor } = $$props;

      let current_language;
      let overview = 1;

      language.subscribe(value => {
        $$invalidate('current_language', current_language = value);
      });

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
    		current_language,
    		overview,
    		handleOverview,
    		click_handler,
    		click_handler_1
    	};
    }

    class Index$2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$g, safe_not_equal, ["randomColor"]);

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
