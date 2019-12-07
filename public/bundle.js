
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        return definition[2] && fn
            ? $$scope.dirty | definition[2](fn(dirty))
            : $$scope.dirty;
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
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
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
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            $$.fragment && $$.fragment.p($$.ctx, $$.dirty);
            $$.dirty = [-1];
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
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
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
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

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
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

    const subscriber_queue = [];
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
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
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
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const language = writable("en");

    /* src/components/layout/header.svelte generated by Svelte v3.16.0 */

    const file = "src/components/layout/header.svelte";

    function create_fragment(ctx) {
    	let div2;
    	let header;
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let h1;
    	let t2;
    	let button;
    	let t3;
    	let dispose;

    	const block = {
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
    			t3 = text(/*current_language*/ ctx[0]);
    			if (img.src !== (img_src_value = "/images/Colombia_white.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "mr-3");
    			attr_dev(img, "height", "35");
    			attr_dev(img, "alt", "luna dog");
    			add_location(img, file, 16, 8, 363);
    			attr_dev(h1, "class", "h4 f5 text-white text-bold");
    			add_location(h1, file, 21, 8, 492);
    			attr_dev(div0, "class", "flex-auto d-flex");
    			add_location(div0, file, 15, 6, 324);
    			attr_dev(button, "class", "btn btn-purple");
    			attr_dev(button, "role", "button");
    			add_location(button, file, 23, 6, 570);
    			attr_dev(div1, "class", "flex-auto d-flex flex-justify-between pr-3");
    			add_location(div1, file, 14, 4, 261);
    			attr_dev(header, "class", "main-content mx-auto p-responsive d-flex flex-items-center flex-wrap svelte-187w73k");
    			add_location(header, file, 12, 2, 167);
    			attr_dev(div2, "class", "bg-gray-dark");
    			add_location(div2, file, 11, 0, 138);
    			dispose = listen_dev(button, "click", /*handleCurrentLanguage*/ ctx[1], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, header);
    			append_dev(header, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, h1);
    			append_dev(div1, t2);
    			append_dev(div1, button);
    			append_dev(button, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*current_language*/ 1) set_data_dev(t3, /*current_language*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { current_language } = $$props;
    	let { handleCurrentLanguage } = $$props;
    	const writable_props = ["current_language", "handleCurrentLanguage"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("current_language" in $$props) $$invalidate(0, current_language = $$props.current_language);
    		if ("handleCurrentLanguage" in $$props) $$invalidate(1, handleCurrentLanguage = $$props.handleCurrentLanguage);
    	};

    	$$self.$capture_state = () => {
    		return { current_language, handleCurrentLanguage };
    	};

    	$$self.$inject_state = $$props => {
    		if ("current_language" in $$props) $$invalidate(0, current_language = $$props.current_language);
    		if ("handleCurrentLanguage" in $$props) $$invalidate(1, handleCurrentLanguage = $$props.handleCurrentLanguage);
    	};

    	return [current_language, handleCurrentLanguage];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			current_language: 0,
    			handleCurrentLanguage: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*current_language*/ ctx[0] === undefined && !("current_language" in props)) {
    			console.warn("<Header> was created without expected prop 'current_language'");
    		}

    		if (/*handleCurrentLanguage*/ ctx[1] === undefined && !("handleCurrentLanguage" in props)) {
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

    /* src/components/layout/footer.svelte generated by Svelte v3.16.0 */

    const file$1 = "src/components/layout/footer.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let p;
    	let raw_value = /*json*/ ctx[0][/*current_language*/ ctx[1]].footer + "";

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			p = element("p");
    			attr_dev(p, "class", "mb-2");
    			add_location(p, file$1, 6, 2, 110);
    			attr_dev(footer, "class", "mb-6 pt-4 border-top");
    			add_location(footer, file$1, 5, 0, 70);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, p);
    			p.innerHTML = raw_value;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*json, current_language*/ 3 && raw_value !== (raw_value = /*json*/ ctx[0][/*current_language*/ ctx[1]].footer + "")) p.innerHTML = raw_value;		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { json } = $$props;
    	let { current_language } = $$props;
    	const writable_props = ["json", "current_language"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("json" in $$props) $$invalidate(0, json = $$props.json);
    		if ("current_language" in $$props) $$invalidate(1, current_language = $$props.current_language);
    	};

    	$$self.$capture_state = () => {
    		return { json, current_language };
    	};

    	$$self.$inject_state = $$props => {
    		if ("json" in $$props) $$invalidate(0, json = $$props.json);
    		if ("current_language" in $$props) $$invalidate(1, current_language = $$props.current_language);
    	};

    	return [json, current_language];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { json: 0, current_language: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*json*/ ctx[0] === undefined && !("json" in props)) {
    			console.warn("<Footer> was created without expected prop 'json'");
    		}

    		if (/*current_language*/ ctx[1] === undefined && !("current_language" in props)) {
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

    /* src/components/layout/index.svelte generated by Svelte v3.16.0 */
    const file$2 = "src/components/layout/index.svelte";

    function create_fragment$2(ctx) {
    	let t0;
    	let div;
    	let t1;
    	let current;

    	const header = new Header({
    			props: {
    				current_language: /*current_language*/ ctx[0],
    				handleCurrentLanguage
    			},
    			$$inline: true
    		});

    	const default_slot_template = /*$$slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const footer = new Footer({
    			props: {
    				json: Language,
    				current_language: /*current_language*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			div = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(div, "class", "main-content mx-auto px-3 p-responsive mt-4");
    			add_location(div, file$2, 19, 0, 440);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(div, t1);
    			mount_component(footer, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const header_changes = {};
    			if (dirty & /*current_language*/ 1) header_changes.current_language = /*current_language*/ ctx[0];
    			header.$set(header_changes);

    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 2) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[1], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null));
    			}

    			const footer_changes = {};
    			if (dirty & /*current_language*/ 1) footer_changes.current_language = /*current_language*/ ctx[0];
    			footer.$set(footer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(default_slot, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(default_slot, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handleCurrentLanguage() {
    	language.update(value => value === "es" ? "en" : "es");
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let current_language;

    	language.subscribe(value => {
    		$$invalidate(0, current_language = value);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("current_language" in $$props) $$invalidate(0, current_language = $$props.current_language);
    	};

    	return [current_language, $$scope, $$slots];
    }

    class Layout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/icons/localization.svelte generated by Svelte v3.16.0 */

    const file$3 = "src/components/icons/localization.svelte";

    function create_fragment$3(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "#586069");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M6 0C2.69 0 0 2.5 0 5.5 0 10.02 6 16 6 16s6-5.98 6-10.5C12 2.5 9.31 0 6\n    0zm0 14.55C4.14 12.52 1 8.44 1 5.5 1 3.02 3.25 1 6 1c1.34 0 2.61.48 3.56\n    1.36.92.86 1.44 1.97 1.44 3.14 0 2.94-3.14 7.02-5 9.05zM8 5.5c0 1.11-.89 2-2\n    2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z");
    			add_location(path, file$3, 8, 2, 158);
    			attr_dev(svg, "aria-label", "localization");
    			attr_dev(svg, "class", "mr-2");
    			attr_dev(svg, "width", "12");
    			attr_dev(svg, "height", "16");
    			attr_dev(svg, "viewBox", "0 0 12 16");
    			attr_dev(svg, "role", "img");
    			set_style(svg, "min-width", "16px");
    			set_style(svg, "margin-left", "4px");
    			add_location(svg, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Localization extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Localization",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/icons/link.svelte generated by Svelte v3.16.0 */

    const file$4 = "src/components/icons/link.svelte";

    function create_fragment$4(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "#586069");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0\n    1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98\n    0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98\n    0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55\n    13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z");
    			add_location(path, file$4, 8, 2, 136);
    			attr_dev(svg, "aria-label", "link");
    			attr_dev(svg, "class", "ml-1 mr-2");
    			attr_dev(svg, "width", "16");
    			attr_dev(svg, "height", "16");
    			attr_dev(svg, "viewBox", "0 0 16 16");
    			attr_dev(svg, "role", "img");
    			set_style(svg, "min-width", "16px");
    			add_location(svg, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/icons/megaphone.svelte generated by Svelte v3.16.0 */

    const file$5 = "src/components/icons/megaphone.svelte";

    function create_fragment$5(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "#586069");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M10 1c-.17 0-.36.05-.52.14C8.04 2.02 4.5 4.58 3 5c-1.38 0-3 .67-3\n    2.5S1.63 10 3 10c.3.08.64.23 1 .41V15h2v-3.45c1.34.86 2.69 1.83 3.48\n    2.31.16.09.34.14.52.14.52 0 1-.42 1-1V2c0-.58-.48-1-1-1zm0\n    12c-.38-.23-.89-.58-1.5-1-.16-.11-.33-.22-.5-.34V3.31c.16-.11.31-.2.47-.31.61-.41\n    1.16-.77 1.53-1v11zm2-6h4v1h-4V7zm0 2l4 2v1l-4-2V9zm4-6v1l-4 2V5l4-2z");
    			add_location(path, file$5, 7, 2, 110);
    			attr_dev(svg, "aria-label", "megaphone");
    			attr_dev(svg, "class", "mr-1");
    			attr_dev(svg, "width", "16");
    			attr_dev(svg, "height", "16");
    			attr_dev(svg, "viewBox", "0 0 16 16");
    			attr_dev(svg, "role", "img");
    			add_location(svg, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Megaphone extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Megaphone",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/icons/comment.svelte generated by Svelte v3.16.0 */

    const file$6 = "src/components/icons/comment.svelte";

    function create_fragment$6(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M15 1H6c-.55 0-1 .45-1 1v2H1c-.55 0-1 .45-1 1v6c0 .55.45 1 1\n    1h1v3l3-3h4c.55 0 1-.45 1-1V9h1l3 3V9h1c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zM9\n    11H4.5L3 12.5V11H1V5h4v3c0 .55.45 1 1 1h3v2zm6-3h-2v1.5L11.5 8H6V2h9v6z");
    			add_location(path, file$6, 8, 2, 136);
    			attr_dev(svg, "aria-label", "gift");
    			attr_dev(svg, "class", "ml-1 mr-1");
    			attr_dev(svg, "width", "16");
    			attr_dev(svg, "height", "16");
    			attr_dev(svg, "viewBox", "0 0 16 16");
    			attr_dev(svg, "role", "img");
    			set_style(svg, "min-width", "16px");
    			add_location(svg, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Comment extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Comment",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/resume/summary.svelte generated by Svelte v3.16.0 */
    const file$7 = "src/components/resume/summary.svelte";

    function create_fragment$7(ctx) {
    	let img;
    	let img_src_value;
    	let t0;
    	let div;
    	let h1;
    	let t2;
    	let h20;
    	let t3_value = /*json*/ ctx[0][/*current_language*/ ctx[1]].subtitle + "";
    	let t3;
    	let t4;
    	let h21;
    	let t6;
    	let p;
    	let t7_value = /*json*/ ctx[0][/*current_language*/ ctx[1]].description + "";
    	let t7;
    	let t8;
    	let a0;
    	let t9_value = /*json*/ ctx[0][/*current_language*/ ctx[1]].codeMessage + "";
    	let t9;
    	let t10;
    	let aside;
    	let a1;
    	let t11_value = /*json*/ ctx[0][/*current_language*/ ctx[1]].networkMessage + "";
    	let t11;
    	let t12;
    	let ul;
    	let li0;
    	let t13;
    	let t14;
    	let li1;
    	let t15;
    	let a2;
    	let t17;
    	let li2;
    	let t18;
    	let a3;
    	let t20;
    	let li3;
    	let t21;
    	let a4;
    	let current;
    	const localization = new Localization({ $$inline: true });
    	const megaphone = new Megaphone({ $$inline: true });
    	const comment = new Comment({ $$inline: true });
    	const link = new Link({ $$inline: true });

    	const block = {
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
    			h21.textContent = "(Front-End Dev)";
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
    			create_component(localization.$$.fragment);
    			t13 = text("\n    Colombia, Girardot");
    			t14 = space();
    			li1 = element("li");
    			create_component(megaphone.$$.fragment);
    			t15 = space();
    			a2 = element("a");
    			a2.textContent = "+57 3213726060";
    			t17 = space();
    			li2 = element("li");
    			create_component(comment.$$.fragment);
    			t18 = space();
    			a3 = element("a");
    			a3.textContent = "andresmontoyafcb@gmail.com";
    			t20 = space();
    			li3 = element("li");
    			create_component(link.$$.fragment);
    			t21 = space();
    			a4 = element("a");
    			a4.textContent = "github.com/MontoyaAndres/";
    			attr_dev(img, "class", "avatar width-full rounded-1");
    			if (img.src !== (img_src_value = "images/me.jpeg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Andrés Montoya");
    			add_location(img, file$7, 23, 0, 448);
    			attr_dev(h1, "class", "text-bold summary-name svelte-1vysvvc");
    			add_location(h1, file$7, 29, 2, 562);
    			attr_dev(h20, "class", "f3-light text-gray summary-subtitle svelte-1vysvvc");
    			add_location(h20, file$7, 30, 2, 636);
    			attr_dev(h21, "class", "f3-light text-gray summary-subtitle svelte-1vysvvc");
    			add_location(h21, file$7, 33, 2, 734);
    			attr_dev(div, "class", "py-3");
    			add_location(div, file$7, 28, 0, 541);
    			attr_dev(p, "class", "f5 mb-3 gray-900-text");
    			add_location(p, file$7, 37, 0, 818);
    			attr_dev(a0, "class", "btn mb-3 text-center text-gray-dark no-underline summary-button svelte-1vysvvc");
    			attr_dev(a0, "role", "button");
    			attr_dev(a0, "tabindex", "0");
    			attr_dev(a0, "href", "https://github.com/MontoyaAndres/andresmontoyain");
    			add_location(a0, file$7, 39, 0, 895);
    			attr_dev(a1, "href", "https://www.linkedin.com/in/andresmontoyain/");
    			attr_dev(a1, "class", "muted-link");
    			add_location(a1, file$7, 48, 2, 1162);
    			attr_dev(aside, "class", "btn-link text-small muted-link mb-3");
    			add_location(aside, file$7, 47, 0, 1108);
    			attr_dev(li0, "class", "d-flex flex-row flex-items-center flex-justify-start pt-1");
    			add_location(li0, file$7, 54, 2, 1364);
    			attr_dev(a2, "href", "tel:+573213726060");
    			add_location(a2, file$7, 60, 4, 1582);
    			attr_dev(li1, "class", "d-flex flex-row flex-items-center flex-justify-start pt-1");
    			add_location(li1, file$7, 58, 2, 1489);
    			attr_dev(a3, "href", "mailto:andresmontoyafcb@gmail.com");
    			add_location(a3, file$7, 66, 4, 1742);
    			attr_dev(li2, "class", "d-flex flex-row flex-items-center flex-justify-start pt-1");
    			add_location(li2, file$7, 64, 2, 1651);
    			attr_dev(a4, "href", "https://github.com/MontoyaAndres/");
    			add_location(a4, file$7, 72, 4, 1927);
    			attr_dev(li3, "class", "d-flex flex-row flex-items-center flex-justify-start pt-1");
    			add_location(li3, file$7, 70, 2, 1839);
    			attr_dev(ul, "class", "list-style-none border-top border-gray-light py-3");
    			add_location(ul, file$7, 53, 0, 1299);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t2);
    			append_dev(div, h20);
    			append_dev(h20, t3);
    			append_dev(div, t4);
    			append_dev(div, h21);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t7);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, a0, anchor);
    			append_dev(a0, t9);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, aside, anchor);
    			append_dev(aside, a1);
    			append_dev(a1, t11);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			mount_component(localization, li0, null);
    			append_dev(li0, t13);
    			append_dev(ul, t14);
    			append_dev(ul, li1);
    			mount_component(megaphone, li1, null);
    			append_dev(li1, t15);
    			append_dev(li1, a2);
    			append_dev(ul, t17);
    			append_dev(ul, li2);
    			mount_component(comment, li2, null);
    			append_dev(li2, t18);
    			append_dev(li2, a3);
    			append_dev(ul, t20);
    			append_dev(ul, li3);
    			mount_component(link, li3, null);
    			append_dev(li3, t21);
    			append_dev(li3, a4);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*json, current_language*/ 3) && t3_value !== (t3_value = /*json*/ ctx[0][/*current_language*/ ctx[1]].subtitle + "")) set_data_dev(t3, t3_value);
    			if ((!current || dirty & /*json, current_language*/ 3) && t7_value !== (t7_value = /*json*/ ctx[0][/*current_language*/ ctx[1]].description + "")) set_data_dev(t7, t7_value);
    			if ((!current || dirty & /*json, current_language*/ 3) && t9_value !== (t9_value = /*json*/ ctx[0][/*current_language*/ ctx[1]].codeMessage + "")) set_data_dev(t9, t9_value);
    			if ((!current || dirty & /*json, current_language*/ 3) && t11_value !== (t11_value = /*json*/ ctx[0][/*current_language*/ ctx[1]].networkMessage + "")) set_data_dev(t11, t11_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(localization.$$.fragment, local);
    			transition_in(megaphone.$$.fragment, local);
    			transition_in(comment.$$.fragment, local);
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(localization.$$.fragment, local);
    			transition_out(megaphone.$$.fragment, local);
    			transition_out(comment.$$.fragment, local);
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(a0);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(aside);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(ul);
    			destroy_component(localization);
    			destroy_component(megaphone);
    			destroy_component(comment);
    			destroy_component(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { json } = $$props;
    	let { current_language } = $$props;
    	const writable_props = ["json", "current_language"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Summary> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("json" in $$props) $$invalidate(0, json = $$props.json);
    		if ("current_language" in $$props) $$invalidate(1, current_language = $$props.current_language);
    	};

    	$$self.$capture_state = () => {
    		return { json, current_language };
    	};

    	$$self.$inject_state = $$props => {
    		if ("json" in $$props) $$invalidate(0, json = $$props.json);
    		if ("current_language" in $$props) $$invalidate(1, current_language = $$props.current_language);
    	};

    	return [json, current_language];
    }

    class Summary extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$7, safe_not_equal, { json: 0, current_language: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Summary",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*json*/ ctx[0] === undefined && !("json" in props)) {
    			console.warn("<Summary> was created without expected prop 'json'");
    		}

    		if (/*current_language*/ ctx[1] === undefined && !("current_language" in props)) {
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

    /* src/components/resume/elsewhere.svelte generated by Svelte v3.16.0 */

    const file$8 = "src/components/resume/elsewhere.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let h3;
    	let t0_value = /*json*/ ctx[0][/*current_language*/ ctx[1]].socialNetworkTitle + "";
    	let t0;
    	let t1;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let a1;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let a2;
    	let img2;
    	let img2_src_value;
    	let t4;
    	let a3;
    	let img3;
    	let img3_src_value;
    	let t5;
    	let a4;
    	let img4;
    	let img4_src_value;

    	const block = {
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
    			attr_dev(h3, "class", "mb-1 h4");
    			add_location(h3, file$8, 6, 2, 107);
    			if (img0.src !== (img0_src_value = "images/github.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "mr-1");
    			attr_dev(img0, "height", "35");
    			attr_dev(img0, "alt", "GitHub Logo");
    			add_location(img0, file$8, 11, 4, 309);
    			attr_dev(a0, "aria-label", "GitHub");
    			attr_dev(a0, "class", "tooltipped tooltipped-n avatar-group-item");
    			attr_dev(a0, "href", "https://github.com/MontoyaAndres/");
    			add_location(a0, file$8, 7, 2, 178);
    			if (img1.src !== (img1_src_value = "images/twitter.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "mr-1");
    			attr_dev(img1, "height", "35");
    			attr_dev(img1, "alt", "Twitter Logo.");
    			add_location(img1, file$8, 17, 4, 528);
    			attr_dev(a1, "aria-label", "Twitter");
    			attr_dev(a1, "class", "tooltipped tooltipped-n avatar-group-item");
    			attr_dev(a1, "href", "https://twitter.com/andresmontoyain/");
    			add_location(a1, file$8, 13, 2, 393);
    			if (img2.src !== (img2_src_value = "images/instagram.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "class", "mr-1");
    			attr_dev(img2, "height", "35");
    			attr_dev(img2, "alt", "Instagram Logo.");
    			add_location(img2, file$8, 27, 4, 782);
    			attr_dev(a2, "aria-label", "Instagram");
    			attr_dev(a2, "class", "tooltipped tooltipped-n avatar-group-item");
    			attr_dev(a2, "href", "https://www.instagram.com/andresmontoyain/");
    			add_location(a2, file$8, 23, 2, 639);
    			if (img3.src !== (img3_src_value = "images/dev.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Andrés Montoya's DEV Profile");
    			attr_dev(img3, "height", "35");
    			attr_dev(img3, "width", "35");
    			add_location(img3, file$8, 37, 4, 1022);
    			attr_dev(a3, "aria-label", "Dev");
    			attr_dev(a3, "class", "tooltipped tooltipped-n avatar-group-item");
    			attr_dev(a3, "href", "https://dev.to/andresmontoyain");
    			add_location(a3, file$8, 33, 2, 897);
    			if (img4.src !== (img4_src_value = "images/platzi.svg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Platzi Logo.");
    			attr_dev(img4, "height", "35");
    			attr_dev(img4, "width", "35");
    			add_location(img4, file$8, 47, 4, 1276);
    			attr_dev(a4, "aria-label", "Platzi");
    			attr_dev(a4, "class", "tooltipped tooltipped-n avatar-group-item");
    			attr_dev(a4, "href", "https://platzi.com/@AndresMontoyaIN/");
    			add_location(a4, file$8, 43, 2, 1142);
    			attr_dev(div, "class", "border-top py-3 pr-3");
    			add_location(div, file$8, 5, 0, 70);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(div, t1);
    			append_dev(div, a0);
    			append_dev(a0, img0);
    			append_dev(div, t2);
    			append_dev(div, a1);
    			append_dev(a1, img1);
    			append_dev(div, t3);
    			append_dev(div, a2);
    			append_dev(a2, img2);
    			append_dev(div, t4);
    			append_dev(div, a3);
    			append_dev(a3, img3);
    			append_dev(div, t5);
    			append_dev(div, a4);
    			append_dev(a4, img4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*json, current_language*/ 3 && t0_value !== (t0_value = /*json*/ ctx[0][/*current_language*/ ctx[1]].socialNetworkTitle + "")) set_data_dev(t0, t0_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { json } = $$props;
    	let { current_language } = $$props;
    	const writable_props = ["json", "current_language"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Elsewhere> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("json" in $$props) $$invalidate(0, json = $$props.json);
    		if ("current_language" in $$props) $$invalidate(1, current_language = $$props.current_language);
    	};

    	$$self.$capture_state = () => {
    		return { json, current_language };
    	};

    	$$self.$inject_state = $$props => {
    		if ("json" in $$props) $$invalidate(0, json = $$props.json);
    		if ("current_language" in $$props) $$invalidate(1, current_language = $$props.current_language);
    	};

    	return [json, current_language];
    }

    class Elsewhere extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$8, safe_not_equal, { json: 0, current_language: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Elsewhere",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*json*/ ctx[0] === undefined && !("json" in props)) {
    			console.warn("<Elsewhere> was created without expected prop 'json'");
    		}

    		if (/*current_language*/ ctx[1] === undefined && !("current_language" in props)) {
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

    /* src/components/resume/toolkit-set.svelte generated by Svelte v3.16.0 */

    const file$9 = "src/components/resume/toolkit-set.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (18:4) {#each items as item}
    function create_each_block(ctx) {
    	let li;
    	let t0_value = /*item*/ ctx[3] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(li, "class", "summary-toolkit p-2 rounded-1 my-1y mr-1 text-white f6 text-bold svelte-1oner8z");
    			set_style(li, "background-color", /*randomColor*/ ctx[2]());
    			add_location(li, file$9, 18, 6, 330);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items*/ 2 && t0_value !== (t0_value = /*item*/ ctx[3] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*randomColor*/ 4) {
    				set_style(li, "background-color", /*randomColor*/ ctx[2]());
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(18:4) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let h3;
    	let t0;
    	let t1;
    	let ul;
    	let each_value = /*items*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h3, "class", "h4");
    			add_location(h3, file$9, 13, 2, 176);
    			attr_dev(ul, "class", "d-flex flex-wrap flex-justify-evenly flex-items-center\n    list-style-none");
    			add_location(ul, file$9, 14, 2, 206);
    			attr_dev(div, "class", "border-top py-3 pr-3");
    			add_location(div, file$9, 12, 0, 139);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(div, t1);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);

    			if (dirty & /*randomColor, items*/ 6) {
    				each_value = /*items*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
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
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { title } = $$props;
    	let { items } = $$props;
    	let { randomColor } = $$props;
    	const writable_props = ["title", "items", "randomColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Toolkit_set> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("items" in $$props) $$invalidate(1, items = $$props.items);
    		if ("randomColor" in $$props) $$invalidate(2, randomColor = $$props.randomColor);
    	};

    	$$self.$capture_state = () => {
    		return { title, items, randomColor };
    	};

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("items" in $$props) $$invalidate(1, items = $$props.items);
    		if ("randomColor" in $$props) $$invalidate(2, randomColor = $$props.randomColor);
    	};

    	return [title, items, randomColor];
    }

    class Toolkit_set extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$9, safe_not_equal, { title: 0, items: 1, randomColor: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toolkit_set",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<Toolkit_set> was created without expected prop 'title'");
    		}

    		if (/*items*/ ctx[1] === undefined && !("items" in props)) {
    			console.warn("<Toolkit_set> was created without expected prop 'items'");
    		}

    		if (/*randomColor*/ ctx[2] === undefined && !("randomColor" in props)) {
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

    /* src/components/resume/toolkit.svelte generated by Svelte v3.16.0 */

    function create_fragment$a(ctx) {
    	let current;

    	const toolkitset = new Toolkit_set({
    			props: {
    				title: /*json*/ ctx[0][/*current_language*/ ctx[1]].setToolsTitle,
    				items: /*toolkits*/ ctx[3],
    				randomColor: /*randomColor*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(toolkitset.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(toolkitset, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const toolkitset_changes = {};
    			if (dirty & /*json, current_language*/ 3) toolkitset_changes.title = /*json*/ ctx[0][/*current_language*/ ctx[1]].setToolsTitle;
    			if (dirty & /*randomColor*/ 4) toolkitset_changes.randomColor = /*randomColor*/ ctx[2];
    			toolkitset.$set(toolkitset_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toolkitset.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toolkitset.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toolkitset, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { json } = $$props;
    	let { current_language } = $$props;
    	let { randomColor } = $$props;

    	const toolkits = [
    		"Git",
    		"HTML",
    		"CSS",
    		"JavaScript",
    		"React.js",
    		"TypeScript",
    		"GraphQL",
    		"Apollo",
    		"Node.js",
    		"Jest",
    		"Electron.js",
    		"Serverless"
    	];

    	const writable_props = ["json", "current_language", "randomColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Toolkit> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("json" in $$props) $$invalidate(0, json = $$props.json);
    		if ("current_language" in $$props) $$invalidate(1, current_language = $$props.current_language);
    		if ("randomColor" in $$props) $$invalidate(2, randomColor = $$props.randomColor);
    	};

    	$$self.$capture_state = () => {
    		return { json, current_language, randomColor };
    	};

    	$$self.$inject_state = $$props => {
    		if ("json" in $$props) $$invalidate(0, json = $$props.json);
    		if ("current_language" in $$props) $$invalidate(1, current_language = $$props.current_language);
    		if ("randomColor" in $$props) $$invalidate(2, randomColor = $$props.randomColor);
    	};

    	return [json, current_language, randomColor, toolkits];
    }

    class Toolkit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$a, safe_not_equal, {
    			json: 0,
    			current_language: 1,
    			randomColor: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toolkit",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*json*/ ctx[0] === undefined && !("json" in props)) {
    			console.warn("<Toolkit> was created without expected prop 'json'");
    		}

    		if (/*current_language*/ ctx[1] === undefined && !("current_language" in props)) {
    			console.warn("<Toolkit> was created without expected prop 'current_language'");
    		}

    		if (/*randomColor*/ ctx[2] === undefined && !("randomColor" in props)) {
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

    const en$1={subtitle:"Software Engineer",description:"I'm just curious about this kind of things 👀",codeMessage:"View this resume inside 👀",networkMessage:"Professional network",socialNetworkTitle:"Elsewhere",setToolsTitle:"Toolkit Set"};const es$1={subtitle:"Ingeniero de Software",description:"Solamente soy curioso en este tipo de cosas 👀",codeMessage:"Ver este resumen por dentro 👀",networkMessage:"Red profesional",socialNetworkTitle:"¿Dónde más?",setToolsTitle:"Conjunto de herramientas"};var Language$1 = {en:en$1,es:es$1};

    /* src/components/resume/index.svelte generated by Svelte v3.16.0 */
    const file$a = "src/components/resume/index.svelte";

    function create_fragment$b(ctx) {
    	let section;
    	let t0;
    	let t1;
    	let current;

    	const summary = new Summary({
    			props: {
    				json: Language$1,
    				current_language: /*current_language*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const elsewhere = new Elsewhere({
    			props: {
    				json: Language$1,
    				current_language: /*current_language*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const toolkit = new Toolkit({
    			props: {
    				json: Language$1,
    				current_language: /*current_language*/ ctx[1],
    				randomColor: /*randomColor*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(summary.$$.fragment);
    			t0 = space();
    			create_component(elsewhere.$$.fragment);
    			t1 = space();
    			create_component(toolkit.$$.fragment);
    			attr_dev(section, "class", "pr-3 mb-6 left-column svelte-v3c9fh");
    			add_location(section, file$a, 23, 0, 420);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(summary, section, null);
    			append_dev(section, t0);
    			mount_component(elsewhere, section, null);
    			append_dev(section, t1);
    			mount_component(toolkit, section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const summary_changes = {};
    			if (dirty & /*current_language*/ 2) summary_changes.current_language = /*current_language*/ ctx[1];
    			summary.$set(summary_changes);
    			const elsewhere_changes = {};
    			if (dirty & /*current_language*/ 2) elsewhere_changes.current_language = /*current_language*/ ctx[1];
    			elsewhere.$set(elsewhere_changes);
    			const toolkit_changes = {};
    			if (dirty & /*current_language*/ 2) toolkit_changes.current_language = /*current_language*/ ctx[1];
    			if (dirty & /*randomColor*/ 1) toolkit_changes.randomColor = /*randomColor*/ ctx[0];
    			toolkit.$set(toolkit_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(summary.$$.fragment, local);
    			transition_in(elsewhere.$$.fragment, local);
    			transition_in(toolkit.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(summary.$$.fragment, local);
    			transition_out(elsewhere.$$.fragment, local);
    			transition_out(toolkit.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(summary);
    			destroy_component(elsewhere);
    			destroy_component(toolkit);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { randomColor } = $$props;
    	let current_language;

    	language.subscribe(value => {
    		$$invalidate(1, current_language = value);
    	});

    	const writable_props = ["randomColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Resume> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("randomColor" in $$props) $$invalidate(0, randomColor = $$props.randomColor);
    	};

    	$$self.$capture_state = () => {
    		return { randomColor, current_language };
    	};

    	$$self.$inject_state = $$props => {
    		if ("randomColor" in $$props) $$invalidate(0, randomColor = $$props.randomColor);
    		if ("current_language" in $$props) $$invalidate(1, current_language = $$props.current_language);
    	};

    	return [randomColor, current_language];
    }

    class Resume extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$b, safe_not_equal, { randomColor: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Resume",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*randomColor*/ ctx[0] === undefined && !("randomColor" in props)) {
    			console.warn("<Resume> was created without expected prop 'randomColor'");
    		}
    	}

    	get randomColor() {
    		throw new Error("<Resume>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set randomColor(value) {
    		throw new Error("<Resume>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/icons/calendar.svelte generated by Svelte v3.16.0 */

    const file$b = "src/components/icons/calendar.svelte";

    function create_fragment$c(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			set_style(path, "fill", "#586069");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M13 2h-1v1.5c0 .28-.22.5-.5.5h-2c-.28 0-.5-.22-.5-.5V2H6v1.5c0\n    .28-.22.5-.5.5h-2c-.28 0-.5-.22-.5-.5V2H2c-.55 0-1 .45-1 1v11c0 .55.45 1 1\n    1h11c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm0 12H2V5h11v9zM5 3H4V1h1v2zm6\n    0h-1V1h1v2zM6 7H5V6h1v1zm2 0H7V6h1v1zm2 0H9V6h1v1zm2 0h-1V6h1v1zM4\n    9H3V8h1v1zm2 0H5V8h1v1zm2 0H7V8h1v1zm2 0H9V8h1v1zm2 0h-1V8h1v1zm-8\n    2H3v-1h1v1zm2 0H5v-1h1v1zm2 0H7v-1h1v1zm2 0H9v-1h1v1zm2 0h-1v-1h1v1zm-8\n    2H3v-1h1v1zm2 0H5v-1h1v1zm2 0H7v-1h1v1zm2 0H9v-1h1v1z");
    			add_location(path, file$b, 7, 2, 109);
    			attr_dev(svg, "aria-label", "calendar");
    			attr_dev(svg, "class", "mr-1");
    			attr_dev(svg, "width", "14");
    			attr_dev(svg, "height", "16");
    			attr_dev(svg, "viewBox", "0 0 14 16");
    			attr_dev(svg, "role", "img");
    			add_location(svg, file$b, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Calendar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Calendar",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/components/icons/gift.svelte generated by Svelte v3.16.0 */

    const file$c = "src/components/icons/gift.svelte";

    function create_fragment$d(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "#586069");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M13 4h-1.38c.19-.33.33-.67.36-.91.06-.67-.11-1.22-.52-1.61C11.1 1.1 10.65\n    1 10.1 1h-.11c-.53.02-1.11.25-1.53.58-.42.33-.73.72-.97\n    1.2-.23-.48-.55-.88-.97-1.2-.42-.32-1-.58-1.53-.58h-.03c-.56\n    0-1.06.09-1.44.48-.41.39-.58.94-.52 1.61.03.23.17.58.36.91H1.98c-.55 0-1\n    .45-1 1v3h1v5c0 .55.45 1 1 1h9c.55 0 1-.45\n    1-1V8h1V5c0-.55-.45-1-1-1H13zm-4.78-.88c.17-.36.42-.67.75-.92.3-.23.72-.39\n    1.05-.41h.09c.45 0 .66.11.8.25s.33.39.3.95c-.05.19-.25.61-.5\n    1h-2.9l.41-.88v.01zM4.09 2.04c.13-.13.31-.25.91-.25.31 0 .72.17\n    1.03.41.33.25.58.55.75.92L7.2\n    4H4.3c-.25-.39-.45-.81-.5-1-.03-.56.16-.81.3-.95l-.01-.01zM7\n    12.99H3V8h4v5-.01zm0-6H2V5h5v2-.01zm5 6H8V8h4v5-.01zm1-6H8V5h5v2-.01z");
    			add_location(path, file$c, 8, 2, 136);
    			attr_dev(svg, "aria-label", "gift");
    			attr_dev(svg, "class", "ml-1 mr-1");
    			attr_dev(svg, "width", "16");
    			attr_dev(svg, "height", "16");
    			attr_dev(svg, "viewBox", "0 0 16 16");
    			attr_dev(svg, "role", "img");
    			set_style(svg, "min-width", "16px");
    			add_location(svg, file$c, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Gift extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gift",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/components/icons/rocket.svelte generated by Svelte v3.16.0 */

    const file$d = "src/components/icons/rocket.svelte";

    function create_fragment$e(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			set_style(path, "fill", "#586069");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M12.17\n    3.83c-.27-.27-.47-.55-.63-.88-.16-.31-.27-.66-.34-1.02-.58.33-1.16.7-1.73\n    1.13-.58.44-1.14.94-1.69 1.48-.7.7-1.33 1.81-1.78 2.45H3L0\n    10h3l2-2c-.34.77-1.02 2.98-1 3l1 1c.02.02 2.23-.64 3-1l-2 2v3l3-3v-3c.64-.45\n    1.75-1.09 2.45-1.78.55-.55 1.05-1.13 1.47-1.7.44-.58.81-1.16\n    1.14-1.72-.36-.08-.7-.19-1.03-.34a3.39 3.39 0 0 1-.86-.63zM16 0s-.09.38-.3\n    1.06c-.2.7-.55 1.58-1.06\n    2.66-.7-.08-1.27-.33-1.66-.72-.39-.39-.63-.94-.7-1.64C13.36.84 14.23.48\n    14.92.28 15.62.08 16 0 16 0z");
    			add_location(path, file$d, 7, 2, 107);
    			attr_dev(svg, "aria-label", "rocket");
    			attr_dev(svg, "class", "mr-1");
    			attr_dev(svg, "width", "16");
    			attr_dev(svg, "height", "16");
    			attr_dev(svg, "viewBox", "0 0 16 16");
    			attr_dev(svg, "role", "img");
    			add_location(svg, file$d, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Rocket extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Rocket",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/components/content/projects.svelte generated by Svelte v3.16.0 */
    const file$e = "src/components/content/projects.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (36:6) {#each projects as project}
    function create_each_block$1(ctx) {
    	let li;
    	let div4;
    	let h5;
    	let a;
    	let t0_value = /*project*/ ctx[3].title + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let p;
    	let t2_value = /*project*/ ctx[3].description + "";
    	let t2;
    	let t3;
    	let div3;
    	let div0;
    	let span;
    	let t4;
    	let small0;
    	let t5_value = /*project*/ ctx[3].language + "";
    	let t5;
    	let t6;
    	let div1;
    	let t7;
    	let small1;
    	let t8_value = /*project*/ ctx[3].status + "";
    	let t8;
    	let t9;
    	let div2;
    	let t10;
    	let small2;
    	let t11_value = /*project*/ ctx[3].year + "";
    	let t11;
    	let t12;
    	let current;
    	const rocket = new Rocket({ $$inline: true });
    	const calendar = new Calendar({ $$inline: true });

    	const block = {
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
    			create_component(rocket.$$.fragment);
    			t7 = space();
    			small1 = element("small");
    			t8 = text(t8_value);
    			t9 = space();
    			div2 = element("div");
    			create_component(calendar.$$.fragment);
    			t10 = space();
    			small2 = element("small");
    			t11 = text(t11_value);
    			t12 = space();
    			attr_dev(a, "href", a_href_value = /*project*/ ctx[3].url);
    			add_location(a, file$e, 41, 14, 1050);
    			attr_dev(h5, "class", "text-bold");
    			add_location(h5, file$e, 40, 12, 1013);
    			attr_dev(p, "class", "text-gray text-small d-block mt-2 mb-3");
    			add_location(p, file$e, 43, 12, 1124);
    			attr_dev(span, "class", "language-indicator position-relative d-inline-block");
    			set_style(span, "background-color", /*randomColor*/ ctx[2]());
    			add_location(span, file$e, 48, 16, 1339);
    			attr_dev(small0, "class", "f6 text-gray");
    			add_location(small0, file$e, 51, 16, 1502);
    			attr_dev(div0, "class", "mr-3");
    			add_location(div0, file$e, 47, 14, 1304);
    			attr_dev(small1, "class", "f6 text-gray");
    			add_location(small1, file$e, 55, 16, 1679);
    			attr_dev(div1, "class", "mr-3 d-flex flex-items-center");
    			add_location(div1, file$e, 53, 14, 1592);
    			attr_dev(small2, "class", "f6 text-gray");
    			add_location(small2, file$e, 59, 16, 1851);
    			attr_dev(div2, "class", "d-flex flex-items-center");
    			add_location(div2, file$e, 57, 14, 1767);
    			attr_dev(div3, "class", "d-flex flex-row flex-justify-start");
    			add_location(div3, file$e, 46, 12, 1241);
    			attr_dev(div4, "class", "flex-column");
    			add_location(div4, file$e, 39, 10, 975);
    			attr_dev(li, "class", "d-flex p-3 mb-3 mr-2 border border-gray-dark rounded-1\n          pinned-item svelte-taiixn");
    			add_location(li, file$e, 36, 8, 865);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div4);
    			append_dev(div4, h5);
    			append_dev(h5, a);
    			append_dev(a, t0);
    			append_dev(div4, t1);
    			append_dev(div4, p);
    			append_dev(p, t2);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, span);
    			append_dev(div0, t4);
    			append_dev(div0, small0);
    			append_dev(small0, t5);
    			append_dev(div3, t6);
    			append_dev(div3, div1);
    			mount_component(rocket, div1, null);
    			append_dev(div1, t7);
    			append_dev(div1, small1);
    			append_dev(small1, t8);
    			append_dev(div3, t9);
    			append_dev(div3, div2);
    			mount_component(calendar, div2, null);
    			append_dev(div2, t10);
    			append_dev(div2, small2);
    			append_dev(small2, t11);
    			append_dev(li, t12);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*projects*/ 2) && t0_value !== (t0_value = /*project*/ ctx[3].title + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*projects*/ 2 && a_href_value !== (a_href_value = /*project*/ ctx[3].url)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if ((!current || dirty & /*projects*/ 2) && t2_value !== (t2_value = /*project*/ ctx[3].description + "")) set_data_dev(t2, t2_value);

    			if (!current || dirty & /*randomColor*/ 4) {
    				set_style(span, "background-color", /*randomColor*/ ctx[2]());
    			}

    			if ((!current || dirty & /*projects*/ 2) && t5_value !== (t5_value = /*project*/ ctx[3].language + "")) set_data_dev(t5, t5_value);
    			if ((!current || dirty & /*projects*/ 2) && t8_value !== (t8_value = /*project*/ ctx[3].status + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty & /*projects*/ 2) && t11_value !== (t11_value = /*project*/ ctx[3].year + "")) set_data_dev(t11, t11_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(rocket.$$.fragment, local);
    			transition_in(calendar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(rocket.$$.fragment, local);
    			transition_out(calendar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(rocket);
    			destroy_component(calendar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(36:6) {#each projects as project}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let section;
    	let h3;
    	let t0;
    	let t1;
    	let ul;
    	let div;
    	let current;
    	let each_value = /*projects*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section = element("section");
    			h3 = element("h3");
    			t0 = text(/*sectionProjectsTitle*/ ctx[0]);
    			t1 = space();
    			ul = element("ul");
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h3, "id", "section-1-header");
    			attr_dev(h3, "class", "f4 mb-2 text-normal");
    			add_location(h3, file$e, 29, 2, 609);
    			attr_dev(div, "class", "d-flex flex-wrap flex-justify-between pinned-list svelte-taiixn");
    			add_location(div, file$e, 34, 4, 759);
    			attr_dev(ul, "class", "d-flex flex-column list-style-none mb-1");
    			add_location(ul, file$e, 33, 2, 702);
    			attr_dev(section, "class", "mt-4");
    			attr_dev(section, "aria-labelledby", "section-1-header");
    			add_location(section, file$e, 28, 0, 549);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h3);
    			append_dev(h3, t0);
    			append_dev(section, t1);
    			append_dev(section, ul);
    			append_dev(ul, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*sectionProjectsTitle*/ 1) set_data_dev(t0, /*sectionProjectsTitle*/ ctx[0]);

    			if (dirty & /*projects, randomColor*/ 6) {
    				each_value = /*projects*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { sectionProjectsTitle } = $$props;
    	let { projects } = $$props;
    	let { randomColor } = $$props;
    	const writable_props = ["sectionProjectsTitle", "projects", "randomColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Projects> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("sectionProjectsTitle" in $$props) $$invalidate(0, sectionProjectsTitle = $$props.sectionProjectsTitle);
    		if ("projects" in $$props) $$invalidate(1, projects = $$props.projects);
    		if ("randomColor" in $$props) $$invalidate(2, randomColor = $$props.randomColor);
    	};

    	$$self.$capture_state = () => {
    		return {
    			sectionProjectsTitle,
    			projects,
    			randomColor
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("sectionProjectsTitle" in $$props) $$invalidate(0, sectionProjectsTitle = $$props.sectionProjectsTitle);
    		if ("projects" in $$props) $$invalidate(1, projects = $$props.projects);
    		if ("randomColor" in $$props) $$invalidate(2, randomColor = $$props.randomColor);
    	};

    	return [sectionProjectsTitle, projects, randomColor];
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$f, safe_not_equal, {
    			sectionProjectsTitle: 0,
    			projects: 1,
    			randomColor: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Projects",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*sectionProjectsTitle*/ ctx[0] === undefined && !("sectionProjectsTitle" in props)) {
    			console.warn("<Projects> was created without expected prop 'sectionProjectsTitle'");
    		}

    		if (/*projects*/ ctx[1] === undefined && !("projects" in props)) {
    			console.warn("<Projects> was created without expected prop 'projects'");
    		}

    		if (/*randomColor*/ ctx[2] === undefined && !("randomColor" in props)) {
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

    /* src/components/icons/git-repo.svelte generated by Svelte v3.16.0 */

    const file$f = "src/components/icons/git-repo.svelte";

    function create_fragment$g(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "#586069");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M4 9H3V8h1v1zm0-3H3v1h1V6zm0-2H3v1h1V4zm0-2H3v1h1V2zm8-1v12c0 .55-.45 1-1\n    1H6v2l-1.5-1.5L3 16v-2H1c-.55 0-1-.45-1-1V1c0-.55.45-1 1-1h10c.55 0 1 .45 1\n    1zm-1 10H1v2h2v-1h3v1h5v-2zm0-10H2v9h9V1z");
    			add_location(path, file$f, 6, 2, 94);
    			attr_dev(svg, "aria-label", "git-repo");
    			attr_dev(svg, "width", "12");
    			attr_dev(svg, "height", "16");
    			attr_dev(svg, "viewBox", "0 0 12 16");
    			attr_dev(svg, "role", "img");
    			add_location(svg, file$f, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Git_repo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Git_repo",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/components/content/experiences.svelte generated by Svelte v3.16.0 */
    const file$g = "src/components/content/experiences.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (112:51) 
    function create_if_block_4(ctx) {
    	let current;
    	const rocket = new Rocket({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(rocket.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(rocket, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(rocket.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(rocket.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(rocket, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(112:51) ",
    		ctx
    	});

    	return block;
    }

    // (110:49) 
    function create_if_block_3(ctx) {
    	let current;
    	const gift = new Gift({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(gift.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gift, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gift.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gift.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gift, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(110:49) ",
    		ctx
    	});

    	return block;
    }

    // (108:12) {#if experience.icon === 'git'}
    function create_if_block_2(ctx) {
    	let current;
    	const gitrepo = new Git_repo({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(gitrepo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gitrepo, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gitrepo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gitrepo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gitrepo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(108:12) {#if experience.icon === 'git'}",
    		ctx
    	});

    	return block;
    }

    // (123:10) {#if experience.urlFile}
    function create_if_block_1(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			attr_dev(img, "class", "text-center width-fit");
    			if (img.src !== (img_src_value = /*experience*/ ctx[3].urlFile)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*experience*/ ctx[3].commit);
    			add_location(img, file$g, 126, 14, 2942);
    			attr_dev(div, "class", "border border-gray-dark rounded-1 p-2 mt-1");
    			set_style(div, "max-width", "350px");
    			add_location(div, file$g, 123, 12, 2818);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*experiences*/ 2 && img.src !== (img_src_value = /*experience*/ ctx[3].urlFile)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*experiences*/ 2 && img_alt_value !== (img_alt_value = /*experience*/ ctx[3].commit)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(123:10) {#if experience.urlFile}",
    		ctx
    	});

    	return block;
    }

    // (197:12) {:else}
    function create_else_block(ctx) {
    	let span0;
    	let t0_value = /*experience*/ ctx[3].type + "";
    	let t0;
    	let t1;
    	let small;
    	let span1;
    	let t2;
    	let t3_value = /*experience*/ ctx[3].technology + "";
    	let t3;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			small = element("small");
    			span1 = element("span");
    			t2 = space();
    			t3 = text(t3_value);
    			attr_dev(span0, "class", "pr-3");
    			add_location(span0, file$g, 197, 14, 6122);
    			attr_dev(span1, "class", "language-indicator position-relative d-inline-block");
    			set_style(span1, "background-color", /*randomColor*/ ctx[2]());
    			add_location(span1, file$g, 199, 16, 6230);
    			attr_dev(small, "class", "f6 text-gray pt-1");
    			add_location(small, file$g, 198, 14, 6180);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			append_dev(span0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, small, anchor);
    			append_dev(small, span1);
    			append_dev(small, t2);
    			append_dev(small, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*experiences*/ 2 && t0_value !== (t0_value = /*experience*/ ctx[3].type + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*randomColor*/ 4) {
    				set_style(span1, "background-color", /*randomColor*/ ctx[2]());
    			}

    			if (dirty & /*experiences*/ 2 && t3_value !== (t3_value = /*experience*/ ctx[3].technology + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(small);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(197:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (137:12) {#if experience.card}
    function create_if_block(ctx) {
    	let div7;
    	let div6;
    	let div0;
    	let svg;
    	let path;
    	let t0;
    	let h3;
    	let t1_value = /*experience*/ ctx[3].card.title + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*experience*/ ctx[3].card.description + "";
    	let t3;
    	let t4;
    	let div5;
    	let div1;
    	let small0;
    	let t5;
    	let t6_value = /*experience*/ ctx[3].card.motivation.positive + "";
    	let t6;
    	let t7;
    	let small1;
    	let t8;
    	let t9_value = /*experience*/ ctx[3].card.motivation.negative + "";
    	let t9;
    	let t10;
    	let div4;
    	let div2;
    	let t11;
    	let div3;
    	let span;
    	let t13;
    	let small2;
    	let t14_value = /*experience*/ ctx[3].card.type + "";
    	let t14;
    	let each_value_1 = /*experience*/ ctx[3].card.motivation.colorCount;
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
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

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t11 = space();
    			div3 = element("div");
    			span = element("span");
    			span.textContent = "•";
    			t13 = space();
    			small2 = element("small");
    			t14 = text(t14_value);
    			attr_dev(path, "fill", "#28a745");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M6.5 0C3.48 0 1 2.19 1 5c0 .92.55 2.25 1 3 1.34 2.25\n                        1.78 2.78 2 4v1h5v-1c.22-1.22.66-1.75 2-4 .45-.75 1-2.08\n                        1-3 0-2.81-2.48-5-5.5-5zm3.64 7.48c-.25.44-.47.8-.67\n                        1.11-.86 1.41-1.25 2.06-1.45\n                        3.23-.02.05-.02.11-.02.17H5c0-.06\n                        0-.13-.02-.17-.2-1.17-.59-1.83-1.45-3.23-.2-.31-.42-.67-.67-1.11C2.44\n                        6.78 2 5.65 2 5c0-2.2 2.02-4 4.5-4 1.22 0 2.36.42 3.22\n                        1.19C10.55 2.94 11 3.94 11 5c0 .66-.44 1.78-.86 2.48zM4\n                        14h5c-.23 1.14-1.3 2-2.5 2s-2.27-.86-2.5-2z");
    			add_location(path, file$g, 150, 22, 3818);
    			attr_dev(svg, "aria-label", "lightbulb");
    			attr_dev(svg, "class", "mr-2 timeline-card-octicon svelte-1w5qewm");
    			attr_dev(svg, "width", "12");
    			attr_dev(svg, "height", "16");
    			attr_dev(svg, "viewBox", "0 0 12 16");
    			attr_dev(svg, "role", "img");
    			set_style(svg, "min-width", "16px");
    			add_location(svg, file$g, 142, 20, 3500);
    			attr_dev(h3, "class", "lh-condensed timeline-card-header");
    			add_location(h3, file$g, 164, 20, 4629);
    			attr_dev(div0, "class", "d-flex timeline-card flex-items-center svelte-1w5qewm");
    			add_location(div0, file$g, 141, 18, 3427);
    			attr_dev(p, "class", "timeline-card-text text-gray mt-2 mb-3 svelte-1w5qewm");
    			add_location(p, file$g, 168, 18, 4792);
    			attr_dev(small0, "class", "f6 text-green text-bold pt-1 mr-3");
    			add_location(small0, file$g, 173, 22, 5077);
    			attr_dev(small1, "class", "f6 pt-1 text-red text-bold");
    			add_location(small1, file$g, 176, 22, 5244);
    			attr_dev(div1, "class", "timeline-card-info d-flex svelte-1w5qewm");
    			add_location(div1, file$g, 172, 20, 5015);
    			attr_dev(div2, "class", "mx-3");
    			add_location(div2, file$g, 181, 22, 5491);
    			attr_dev(span, "class", "text-gray-light mx-1");
    			add_location(span, file$g, 187, 24, 5778);
    			attr_dev(small2, "class", "f6 text-gray pt-2");
    			add_location(small2, file$g, 188, 24, 5846);
    			add_location(div3, file$g, 186, 22, 5748);
    			attr_dev(div4, "class", "timeline-card-info d-flex svelte-1w5qewm");
    			add_location(div4, file$g, 180, 20, 5429);
    			attr_dev(div5, "class", "timeline-card-text d-flex flex-justify-evenly svelte-1w5qewm");
    			add_location(div5, file$g, 171, 18, 4935);
    			add_location(div6, file$g, 140, 16, 3403);
    			attr_dev(div7, "class", "border border-gray-dark rounded-1 p-3 mt-3 timeline-card\n                d-flex");
    			add_location(div7, file$g, 137, 14, 3277);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, div0);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    			append_dev(div0, t0);
    			append_dev(div0, h3);
    			append_dev(h3, t1);
    			append_dev(div6, t2);
    			append_dev(div6, p);
    			append_dev(p, t3);
    			append_dev(div6, t4);
    			append_dev(div6, div5);
    			append_dev(div5, div1);
    			append_dev(div1, small0);
    			append_dev(small0, t5);
    			append_dev(small0, t6);
    			append_dev(div1, t7);
    			append_dev(div1, small1);
    			append_dev(small1, t8);
    			append_dev(small1, t9);
    			append_dev(div5, t10);
    			append_dev(div5, div4);
    			append_dev(div4, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div4, t11);
    			append_dev(div4, div3);
    			append_dev(div3, span);
    			append_dev(div3, t13);
    			append_dev(div3, small2);
    			append_dev(small2, t14);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*experiences*/ 2 && t1_value !== (t1_value = /*experience*/ ctx[3].card.title + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*experiences*/ 2 && t3_value !== (t3_value = /*experience*/ ctx[3].card.description + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*experiences*/ 2 && t6_value !== (t6_value = /*experience*/ ctx[3].card.motivation.positive + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*experiences*/ 2 && t9_value !== (t9_value = /*experience*/ ctx[3].card.motivation.negative + "")) set_data_dev(t9, t9_value);

    			if (dirty & /*experiences*/ 2) {
    				each_value_1 = /*experience*/ ctx[3].card.motivation.colorCount;
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
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

    			if (dirty & /*experiences*/ 2 && t14_value !== (t14_value = /*experience*/ ctx[3].card.type + "")) set_data_dev(t14, t14_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(137:12) {#if experience.card}",
    		ctx
    	});

    	return block;
    }

    // (183:24) {#each experience.card.motivation.colorCount as color}
    function create_each_block_1(ctx) {
    	let span;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", span_class_value = "timeline-card-commits bg-" + /*color*/ ctx[6] + " svelte-1w5qewm");
    			add_location(span, file$g, 183, 26, 5615);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*experiences*/ 2 && span_class_value !== (span_class_value = "timeline-card-commits bg-" + /*color*/ ctx[6] + " svelte-1w5qewm")) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(183:24) {#each experience.card.motivation.colorCount as color}",
    		ctx
    	});

    	return block;
    }

    // (89:2) {#each experiences as experience}
    function create_each_block$2(ctx) {
    	let div5;
    	let div0;
    	let h3;
    	let t0_value = /*experience*/ ctx[3].months + "";
    	let t0;
    	let t1;
    	let span0;
    	let t2_value = /*experience*/ ctx[3].years + "";
    	let t2;
    	let t3;
    	let span1;
    	let t4;
    	let div4;
    	let div1;
    	let span2;
    	let t5;
    	let span3;
    	let current_block_type_index;
    	let if_block0;
    	let t6;
    	let span4;
    	let t7;
    	let div3;
    	let span5;
    	let t8_value = /*experience*/ ctx[3].commit + "";
    	let t8;
    	let t9;
    	let t10;
    	let div2;
    	let t11;
    	let current;
    	const if_block_creators = [create_if_block_2, create_if_block_3, create_if_block_4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*experience*/ ctx[3].icon === "git") return 0;
    		if (/*experience*/ ctx[3].icon === "gift") return 1;
    		if (/*experience*/ ctx[3].icon === "rocket") return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	let if_block1 = /*experience*/ ctx[3].urlFile && create_if_block_1(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*experience*/ ctx[3].card) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block2 = current_block_type(ctx);

    	const block = {
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
    			attr_dev(span0, "class", "pl-1 text-gray");
    			add_location(span0, file$g, 93, 10, 1728);
    			attr_dev(h3, "class", "h6 pr-2 py-1 d-flex flex-nowrap");
    			add_location(h3, file$g, 91, 8, 1642);
    			attr_dev(span1, "class", "timeline-horizontal gray-timeline svelte-1w5qewm");
    			set_style(span1, "flex-basis", "auto");
    			set_style(span1, "flex-grow", "2");
    			add_location(span1, file$g, 95, 8, 1805);
    			attr_dev(div0, "class", "d-flex flex-row flex-items-center flex-start");
    			add_location(div0, file$g, 90, 6, 1575);
    			attr_dev(span2, "class", "timeline-line-top gray-timeline svelte-1w5qewm");
    			add_location(span2, file$g, 103, 10, 2082);
    			attr_dev(span3, "class", "d-flex flex-items-center flex-justify-center\n            timeline-circle-marker gray-timeline svelte-1w5qewm");
    			add_location(span3, file$g, 104, 10, 2141);
    			attr_dev(span4, "class", "timeline-line-bottom gray-timeline svelte-1w5qewm");
    			set_style(span4, "flex-basis", "auto");
    			set_style(span4, "flex-grow", "2");
    			add_location(span4, file$g, 115, 10, 2528);
    			attr_dev(div1, "class", "mr-3 d-flex flex-column flex-items-center flex-justify-center");
    			add_location(div1, file$g, 101, 8, 1986);
    			attr_dev(span5, "class", "f4 text-gray lh-condensed");
    			add_location(span5, file$g, 120, 10, 2701);
    			attr_dev(div2, "class", "d-flex flex-wrap flex-row flex-justify-start\n            flex-items-center mt-2");
    			add_location(div2, file$g, 133, 10, 3123);
    			attr_dev(div3, "class", "py-3 pr-3");
    			add_location(div3, file$g, 119, 8, 2667);
    			attr_dev(div4, "class", "d-flex flex-row flex-nowrap");
    			add_location(div4, file$g, 100, 6, 1936);
    			attr_dev(div5, "class", "width-full");
    			add_location(div5, file$g, 89, 4, 1544);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div0, h3);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    			append_dev(h3, span0);
    			append_dev(span0, t2);
    			append_dev(div0, t3);
    			append_dev(div0, span1);
    			append_dev(div5, t4);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div1, span2);
    			append_dev(div1, t5);
    			append_dev(div1, span3);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(span3, null);
    			}

    			append_dev(div1, t6);
    			append_dev(div1, span4);
    			append_dev(div4, t7);
    			append_dev(div4, div3);
    			append_dev(div3, span5);
    			append_dev(span5, t8);
    			append_dev(div3, t9);
    			if (if_block1) if_block1.m(div3, null);
    			append_dev(div3, t10);
    			append_dev(div3, div2);
    			if_block2.m(div2, null);
    			append_dev(div5, t11);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*experiences*/ 2) && t0_value !== (t0_value = /*experience*/ ctx[3].months + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*experiences*/ 2) && t2_value !== (t2_value = /*experience*/ ctx[3].years + "")) set_data_dev(t2, t2_value);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block0) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block0 = if_blocks[current_block_type_index];

    					if (!if_block0) {
    						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block0.c();
    					}

    					transition_in(if_block0, 1);
    					if_block0.m(span3, null);
    				} else {
    					if_block0 = null;
    				}
    			}

    			if ((!current || dirty & /*experiences*/ 2) && t8_value !== (t8_value = /*experience*/ ctx[3].commit + "")) set_data_dev(t8, t8_value);

    			if (/*experience*/ ctx[3].urlFile) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
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
    				if_block2.p(ctx, dirty);
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
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			if (if_block1) if_block1.d();
    			if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(89:2) {#each experiences as experience}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let section;
    	let h3;
    	let t0;
    	let t1;
    	let current;
    	let each_value = /*experiences*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section = element("section");
    			h3 = element("h3");
    			t0 = text(/*sectionExperiencesTitle*/ ctx[0]);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h3, "id", "section-3-header");
    			attr_dev(h3, "class", "f4 mb-2 text-normal");
    			add_location(h3, file$g, 84, 2, 1409);
    			attr_dev(section, "class", "mt-5");
    			attr_dev(section, "aria-labelledby", "section-3-header");
    			add_location(section, file$g, 83, 0, 1349);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h3);
    			append_dev(h3, t0);
    			append_dev(section, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*sectionExperiencesTitle*/ 1) set_data_dev(t0, /*sectionExperiencesTitle*/ ctx[0]);

    			if (dirty & /*experiences, randomColor*/ 6) {
    				each_value = /*experiences*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(section, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { sectionExperiencesTitle } = $$props;
    	let { experiences } = $$props;
    	let { randomColor } = $$props;
    	const writable_props = ["sectionExperiencesTitle", "experiences", "randomColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Experiences> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("sectionExperiencesTitle" in $$props) $$invalidate(0, sectionExperiencesTitle = $$props.sectionExperiencesTitle);
    		if ("experiences" in $$props) $$invalidate(1, experiences = $$props.experiences);
    		if ("randomColor" in $$props) $$invalidate(2, randomColor = $$props.randomColor);
    	};

    	$$self.$capture_state = () => {
    		return {
    			sectionExperiencesTitle,
    			experiences,
    			randomColor
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("sectionExperiencesTitle" in $$props) $$invalidate(0, sectionExperiencesTitle = $$props.sectionExperiencesTitle);
    		if ("experiences" in $$props) $$invalidate(1, experiences = $$props.experiences);
    		if ("randomColor" in $$props) $$invalidate(2, randomColor = $$props.randomColor);
    	};

    	return [sectionExperiencesTitle, experiences, randomColor];
    }

    class Experiences extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$h, safe_not_equal, {
    			sectionExperiencesTitle: 0,
    			experiences: 1,
    			randomColor: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Experiences",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*sectionExperiencesTitle*/ ctx[0] === undefined && !("sectionExperiencesTitle" in props)) {
    			console.warn("<Experiences> was created without expected prop 'sectionExperiencesTitle'");
    		}

    		if (/*experiences*/ ctx[1] === undefined && !("experiences" in props)) {
    			console.warn("<Experiences> was created without expected prop 'experiences'");
    		}

    		if (/*randomColor*/ ctx[2] === undefined && !("randomColor" in props)) {
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

    const en$2={menuProjectsTitle:"Projects",menuExperiencesTitle:"Experiences",sectionProjectsTitle:"Pinned Projects",sectionExperiencesTitle:"Experience activity",projects:[{url:"https://github.com/MontoyaAndres/AVMod",title:"AVMod",description:"Create your own powershell, malware desktop app or even clickjacking web with a single command for unix and windows systems.",language:"Python",status:"Working on",year:"2019"},{url:"https://github.com/MontoyaAndres/TeViColombia",title:"Te Vi Colombia",description:"Tejidos virtuales for the entrepreneurship, the professional practices and employment",language:"JavaScript",status:"Completed",year:"2019"},{url:"https://github.com/MontoyaAndres/GradeProject",title:"Exception of absenteeism UNIMINUTO",description:"Software Remission (exception of absenteeism) for UNIMINUTO Girardot, Colombia",language:"JavaScript",status:"Completed",year:"2018"},{url:"https://github.com/MontoyaAndres/slack-clone",title:"slack-clone",description:"Slack clone, the funtionality to create and login users who will can create workspaces, channels and send text or multimedia messages",language:"JavaScript",status:"Completed",year:"2018"},{url:"https://github.com/MontoyaAndres/FacebookNews",title:"Simulate a Fake news with Facebook? 👀",description:"Simulate a Facebook news section to deceive your victims!",language:"JavaScript",status:"Completed",year:"2019"},{url:"https://github.com/MontoyaAndres/platzi/tree/master/hapi-hello",title:"Platzioverflow",description:"Ask what you need and you will receive any response!",language:"JavaScript",status:"Completed",year:"2019"},{url:"https://github.com/MontoyaAndres/platzi/tree/master/electron-platzipics",title:"Platzipics",description:"Edit and filter your images with this desktop app on Windows, Mac or Linux",language:"JavaScript",status:"Completed",year:"2019"},{url:"https://github.com/MontoyaAndres/PWA-APP.git",title:"EDgram",description:"Progressive web application to upload your photos with your friends",language:"JavaScript",status:"Completed",year:"2018"}],experiences:[{months:"december",years:"2019",icon:"rocket",urlFile:"images/diploma-escuela-js.jpg",commit:"Diploma of \"CARRERA DE JAVASCRIPT\"",type:"study/platzi",technology:"JavaScript"},{months:"february-october",years:"2016-2019",icon:"gift",commit:"Finished Technology in Informatics career at UNIMINUTO Centro regional Girardot",type:"study/university",technology:"Community"},{months:"july",years:"2019",icon:"rocket",urlFile:"images/diploma-base-de-datos.jpg",commit:"Diploma of \"CARRERA DE BASES DE DATOS\"",type:"study/platzi",technology:"SQL and NoSQL"},{months:"july",years:"2019",icon:"rocket",urlFile:"images/diploma-react-native.jpg",commit:"Diploma of \"DESARROLLO DE APPS CON REACT NATIVE\"",type:"study/platzi",technology:"JavaScript"},{months:"june",years:"2019",icon:"rocket",urlFile:"images/diploma-desarrollo-nodejs.jpg",commit:"Diploma of \"DESARROLLO CON NODE.JS\"",type:"study/platzi",technology:"JavaScript"},{months:"may",years:"2019",icon:"rocket",urlFile:"images/diploma-backend-javascript.jpg",commit:"Diploma of \"BACKEND CON JAVASCRIPT\"",type:"study/platzi",technology:"JavaScript"},{months:"may",years:"2019",icon:"gift",urlFile:"images/premio-excelencia.jpeg",commit:"Recognition in the \"NOCHE DE LA EXCELENCIA\" at UNIMINUTO Centro regional Girardot",type:"study/university",technology:"Community"},{months:"april",years:"2019",icon:"rocket",urlFile:"images/diploma-idioma-ingles.jpg",commit:"Diploma of \"CARRERA DE INGLÉS\"",type:"study/platzi",technology:"Pation"},{months:"april",years:"2019",icon:"rocket",urlFile:"images/diploma-desarrollo-react.jpg",commit:"Diploma of \"CARRERA DE FRONT-END CON REACT.JS\"",type:"study/platzi",technology:"JavaScript"},{months:"april",years:"2019",icon:"rocket",urlFile:"images/diploma-arquitecto.jpg",commit:"Diploma of \"CARRERA DE ARQUITECTURA FRONT-END\"",type:"study/platzi",technology:"HTML-CSS"},{months:"november",years:"2018-2019",icon:"git",commit:"Let's beginning an entrepreneurship!",card:{title:"Te Vi Colombia",description:"Application for helping people and companies to grow up in their entrepreneurship, professional practices and employment in Colombia.",motivation:{positive:"JavaScript",negative:"Free time",colorCount:["green","green","green","red","red"]},type:"Private"}}]};const es$2={menuProjectsTitle:"Proyectos",menuExperiencesTitle:"Experiencias",sectionProjectsTitle:"Proyectos fijados",sectionExperiencesTitle:"Experiencias",projects:[{url:"https://github.com/MontoyaAndres/AVMod",title:"AVMod",description:"Crear tu propia powershell, malware para escritorio o incluso clickjacking web con un único comando para sistemas unix y windows.",language:"Python",status:"Trabajando",year:"2019"},{url:"https://github.com/MontoyaAndres/TeViColombia",title:"Te Vi Colombia",description:"Tejidos virtuales para el emprendimiento, las prácticas profesionales y la empleabilidad",language:"JavaScript",status:"Completado",year:"2019"},{url:"https://github.com/MontoyaAndres/GradeProject",title:"Excepción de ausentismo UNIMINUTO",description:"Software de remisión (excepción de ausentismo) para la UNIMINUTO Girardot, Colombia",language:"JavaScript",status:"Completado",year:"2018"},{url:"https://github.com/MontoyaAndres/slack-clone",title:"slack-clone",description:"Slack clone, la funcionalidad de crear y registrar usuarios que podrán crear espacios de trabajo, canales y enviar mensajes de texto o archivos.",language:"JavaScript",status:"Completado",year:"2018"},{url:"https://github.com/MontoyaAndres/FacebookNews",title:"Simular una noticia falsa con Facebook? 👀",description:"Simula una sección de noticia falsa de Facebook para engañar a tus victimas!",language:"JavaScript",status:"Completado",year:"2019"},{url:"https://github.com/MontoyaAndres/platzi/tree/master/hapi-hello",title:"Platzioverflow",description:"Pregunta lo que necesitas y recibiras alguna respuesta!",language:"JavaScript",status:"Completado",year:"2019"},{url:"https://github.com/MontoyaAndres/platzi/tree/master/electron-platzipics",title:"Platzipics",description:"Edita y filtra tus imagenes con esta aplicación de escritorio en Windows, Mac o Linux",language:"JavaScript",status:"Completado",year:"2019"},{url:"https://github.com/MontoyaAndres/PWA-APP.git",title:"EDgram",description:"Aplicación web progresiva para subir tus fotos con tus amigos",language:"JavaScript",status:"Completado",year:"2018"}],experiences:[{months:"diciembre",years:"2019",icon:"rocket",urlFile:"images/diploma-escuela-js.jpg",commit:"Diploma de \"CARRERA DE JAVASCRIPT\"",type:"estudio/platzi",technology:"JavaScript"},{months:"febrero-octubre",years:"2016-2019",icon:"gift",commit:"Finalice la carrera Tecnología en Informática en la UNIMINUTO Centro regional Girardot",type:"estudio/universidad",technology:"Comunidad"},{months:"julio",years:"2019",icon:"rocket",urlFile:"images/diploma-base-de-datos.jpg",commit:"Diploma de \"CARRERA DE BASES DE DATOS\"",type:"estudio/platzi",technology:"SQL y NoSQL"},{months:"julio",years:"2019",icon:"rocket",urlFile:"images/diploma-react-native.jpg",commit:"Diploma de \"DESARROLLO DE APPS CON REACT NATIVE\"",type:"estudio/platzi",technology:"JavaScript"},{months:"junio",years:"2019",icon:"rocket",urlFile:"images/diploma-desarrollo-nodejs.jpg",commit:"Diploma de \"DESARROLLO CON NODE.JS\"",type:"estudio/platzi",technology:"JavaScript"},{months:"mayo",years:"2019",icon:"rocket",urlFile:"images/diploma-backend-javascript.jpg",commit:"Diploma de \"BACKEND CON JAVASCRIPT\"",type:"estudio/platzi",technology:"JavaScript"},{months:"mayo",years:"2019",icon:"gift",urlFile:"images/premio-excelencia.jpeg",commit:"Reconocimiento en la \"NOCHE DE LA EXCELENCIA\" en la UNIMINUTO Centro regional Girardot",type:"estudio/universidad",technology:"Comunidad"},{months:"abril",years:"2019",icon:"rocket",urlFile:"images/diploma-idioma-ingles.jpg",commit:"Diploma de \"CARRERA DE INGLÉS\"",type:"estudio/platzi",technology:"Pasión"},{months:"abril",years:"2019",icon:"rocket",urlFile:"images/diploma-desarrollo-react.jpg",commit:"Diploma de \"CARRERA DE FRONT-END CON REACT.JS\"",type:"estudio/platzi",technology:"JavaScript"},{months:"abril",years:"2019",icon:"rocket",urlFile:"images/diploma-arquitecto.jpg",commit:"Diploma de \"CARRERA DE ARQUITECTURA FRONT-END\"",type:"estudio/platzi",technology:"HTML-CSS"},{months:"noviembre",years:"2018-*",icon:"git",commit:"Comencemos un emprendimiento!",card:{title:"Te Vi Colombia",description:"Aplicación para ayudar personas y compañias a crecer en sus emprendimientos, prácticas profesionales y empleo en Colombia.",motivation:{positive:"JavaScript",negative:"Tiempo libre",colorCount:["green","green","green","red","red"]},type:"Privado"}}]};var json = {en:en$2,es:es$2};

    /* src/components/content/index.svelte generated by Svelte v3.16.0 */
    const file$h = "src/components/content/index.svelte";

    // (62:2) {:else}
    function create_else_block$1(ctx) {
    	let current;

    	const experiences = new Experiences({
    			props: {
    				sectionExperiencesTitle: json[/*current_language*/ ctx[1]].sectionExperiencesTitle,
    				experiences: json[/*current_language*/ ctx[1]].experiences,
    				randomColor: /*randomColor*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(experiences.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(experiences, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const experiences_changes = {};
    			if (dirty & /*current_language*/ 2) experiences_changes.sectionExperiencesTitle = json[/*current_language*/ ctx[1]].sectionExperiencesTitle;
    			if (dirty & /*current_language*/ 2) experiences_changes.experiences = json[/*current_language*/ ctx[1]].experiences;
    			if (dirty & /*randomColor*/ 1) experiences_changes.randomColor = /*randomColor*/ ctx[0];
    			experiences.$set(experiences_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(experiences.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(experiences.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(experiences, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(62:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (57:2) {#if overview === 1}
    function create_if_block$1(ctx) {
    	let current;

    	const projects = new Projects({
    			props: {
    				sectionProjectsTitle: json[/*current_language*/ ctx[1]].sectionProjectsTitle,
    				projects: json[/*current_language*/ ctx[1]].projects,
    				randomColor: /*randomColor*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(projects.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(projects, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const projects_changes = {};
    			if (dirty & /*current_language*/ 2) projects_changes.sectionProjectsTitle = json[/*current_language*/ ctx[1]].sectionProjectsTitle;
    			if (dirty & /*current_language*/ 2) projects_changes.projects = json[/*current_language*/ ctx[1]].projects;
    			if (dirty & /*randomColor*/ 1) projects_changes.randomColor = /*randomColor*/ ctx[0];
    			projects.$set(projects_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projects.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projects.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(projects, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(57:2) {#if overview === 1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div1;
    	let nav;
    	let div0;
    	let span1;
    	let t0_value = json[/*current_language*/ ctx[1]].menuProjectsTitle + "";
    	let t0;
    	let t1;
    	let span0;
    	let t2_value = json[/*current_language*/ ctx[1]].projects.length + "";
    	let t2;
    	let span1_class_value;
    	let t3;
    	let span3;
    	let t4_value = json[/*current_language*/ ctx[1]].menuExperiencesTitle + "";
    	let t4;
    	let t5;
    	let span2;
    	let t6_value = json[/*current_language*/ ctx[1]].experiences.length + "";
    	let t6;
    	let span3_class_value;
    	let t7;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*overview*/ ctx[2] === 1) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
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
    			attr_dev(span0, "class", "Counter");
    			add_location(span0, file$h, 44, 8, 939);
    			attr_dev(span1, "title", "Overview");
    			attr_dev(span1, "class", span1_class_value = "UnderlineNav-item " + (/*overview*/ ctx[2] === 1 ? "selected" : ""));
    			add_location(span1, file$h, 39, 6, 735);
    			attr_dev(span2, "class", "Counter");
    			add_location(span2, file$h, 51, 8, 1239);
    			attr_dev(span3, "title", "Experiences");
    			attr_dev(span3, "class", span3_class_value = "UnderlineNav-item " + (/*overview*/ ctx[2] === 2 ? "selected" : ""));
    			add_location(span3, file$h, 46, 6, 1029);
    			attr_dev(div0, "class", "UnderlineNav-body");
    			add_location(div0, file$h, 38, 4, 697);
    			attr_dev(nav, "class", "UnderlineNav");
    			add_location(nav, file$h, 37, 2, 666);
    			attr_dev(div1, "class", "pb-4 pl-2 menu-large svelte-cuggrr");
    			add_location(div1, file$h, 36, 0, 629);

    			dispose = [
    				listen_dev(span1, "click", /*click_handler*/ ctx[4], false, false, false),
    				listen_dev(span3, "click", /*click_handler_1*/ ctx[5], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, nav);
    			append_dev(nav, div0);
    			append_dev(div0, span1);
    			append_dev(span1, t0);
    			append_dev(span1, t1);
    			append_dev(span1, span0);
    			append_dev(span0, t2);
    			append_dev(div0, t3);
    			append_dev(div0, span3);
    			append_dev(span3, t4);
    			append_dev(span3, t5);
    			append_dev(span3, span2);
    			append_dev(span2, t6);
    			append_dev(div1, t7);
    			if_blocks[current_block_type_index].m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*current_language*/ 2) && t0_value !== (t0_value = json[/*current_language*/ ctx[1]].menuProjectsTitle + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*current_language*/ 2) && t2_value !== (t2_value = json[/*current_language*/ ctx[1]].projects.length + "")) set_data_dev(t2, t2_value);

    			if (!current || dirty & /*overview*/ 4 && span1_class_value !== (span1_class_value = "UnderlineNav-item " + (/*overview*/ ctx[2] === 1 ? "selected" : ""))) {
    				attr_dev(span1, "class", span1_class_value);
    			}

    			if ((!current || dirty & /*current_language*/ 2) && t4_value !== (t4_value = json[/*current_language*/ ctx[1]].menuExperiencesTitle + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*current_language*/ 2) && t6_value !== (t6_value = json[/*current_language*/ ctx[1]].experiences.length + "")) set_data_dev(t6, t6_value);

    			if (!current || dirty & /*overview*/ 4 && span3_class_value !== (span3_class_value = "UnderlineNav-item " + (/*overview*/ ctx[2] === 2 ? "selected" : ""))) {
    				attr_dev(span3, "class", span3_class_value);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div1, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_blocks[current_block_type_index].d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { randomColor } = $$props;
    	let current_language;
    	let overview = 1;

    	language.subscribe(value => {
    		$$invalidate(1, current_language = value);
    	});

    	function handleOverview(value) {
    		$$invalidate(2, overview = value);
    	}

    	const writable_props = ["randomColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Content> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleOverview(1);
    	const click_handler_1 = () => handleOverview(2);

    	$$self.$set = $$props => {
    		if ("randomColor" in $$props) $$invalidate(0, randomColor = $$props.randomColor);
    	};

    	$$self.$capture_state = () => {
    		return { randomColor, current_language, overview };
    	};

    	$$self.$inject_state = $$props => {
    		if ("randomColor" in $$props) $$invalidate(0, randomColor = $$props.randomColor);
    		if ("current_language" in $$props) $$invalidate(1, current_language = $$props.current_language);
    		if ("overview" in $$props) $$invalidate(2, overview = $$props.overview);
    	};

    	return [
    		randomColor,
    		current_language,
    		overview,
    		handleOverview,
    		click_handler,
    		click_handler_1
    	];
    }

    class Content extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$i, safe_not_equal, { randomColor: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Content",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*randomColor*/ ctx[0] === undefined && !("randomColor" in props)) {
    			console.warn("<Content> was created without expected prop 'randomColor'");
    		}
    	}

    	get randomColor() {
    		throw new Error("<Content>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set randomColor(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.16.0 */
    const file$i = "src/App.svelte";

    // (28:0) <Layout>
    function create_default_slot(ctx) {
    	let div;
    	let t;
    	let current;

    	const resume = new Resume({
    			props: { randomColor: newColor },
    			$$inline: true
    		});

    	const content = new Content({
    			props: { randomColor: newColor },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(resume.$$.fragment);
    			t = space();
    			create_component(content.$$.fragment);
    			attr_dev(div, "class", "d-flex flex-justify-around flex-wrap column-container svelte-mbjxqh");
    			add_location(div, file$i, 28, 2, 500);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(resume, div, null);
    			append_dev(div, t);
    			mount_component(content, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resume.$$.fragment, local);
    			transition_in(content.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resume.$$.fragment, local);
    			transition_out(content.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(resume);
    			destroy_component(content);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(28:0) <Layout>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let current;

    	const layout = new Layout({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(layout.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(layout, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const layout_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				layout_changes.$$scope = { dirty, ctx };
    			}

    			layout.$set(layout_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(layout, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function newColor() {
    	return "#" + Math.random().toString(16).substr(-6);
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
