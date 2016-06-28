var postcss = require('postcss');
var _ = require('lodash');
var autoprefixerIE8 = require('autoprefixer')({
	browsers: ['ie 8']
});

/**
 * strip media queries
 *
 * @param css the parsed css AST
 * @param options match-object for css-mediaquery
 */
function stripMediaqueries(css, options) {
	var mq = require('css-mediaquery');
	css.walkAtRules(function(rule) {
		if (rule.name === 'media') {
			if (!mq.match(rule.params, options)) {
				rule.remove();
				return;
			}

			rule.parent.insertBefore(rule, rule.nodes);
			rule.remove();
		}
	});
}

function stripAtRules(css, removeAtRules) {
	css.walkAtRules(function(atRule) {
		removeAtRules.forEach(function(removeAtRule) {
			if (removeAtRule.match(atRule)) {
				atRule.remove();
			}
		});
	});
}

function prefix(prop) {
	var separator;
	if (prop[0] === '-') {
		separator = prop.indexOf('-', 1) + 1;
		if (prop.slice(0, separator).indexOf(' ') > -1) {
			return '';
		}
		return prop.slice(0, separator);
	} else {
		return '';
	}
}

/**
 * strip properties.
 *
 * @param css the parsed css AST
 * @param options
 */
function stripProperties(css, options) {
	options = _.extend({
		removePrefixes: false,
		properties: [],
		values: []
	}, options);
	css.walkDecls(function(decl) {
		if (options.removePrefixes && prefix(decl.prop) ||
		  options.removePrefixes && prefix(decl.value) ||
		  options.properties.indexOf(decl.prop) > -1) {
			decl.remove();
			return;
		}

		if (options.values && options.values.length) {
			options.values.forEach(function(removeValue) {
				if (decl.value.match(removeValue)) {
					decl.remove();
				}
			});
		}
	});
}

/**
 * strip selectors which match a pattern
 *
 * @param css the parsed css AST
 */
function stripSelectors(css, removeSelectors) {
	css.walkRules(function(rule) {
		var selectors = rule.selectors.filter(function(selector) {
			var remove = false;
			removeSelectors.forEach(function(removeSelector) {
				remove = remove || selector.match(removeSelector);
			});

			return !remove;
		});

		if (!selectors.length) {
			rule.remove();
		} else {
			rule.selectors = selectors;
		}
	});
}

/**
 * remove all empty rules
 */
function removeEmpty(css) {
	css.walkAtRules(function(rule) {
		if (rule.name === 'media' && (!rule.nodes || !rule.nodes.length)) {
			rule.remove();
		}
	});

	css.walkRules(function(rule) {
		if (!rule.nodes.length) {
			rule.remove();
		}
	});
}

var defaults = {
	selectors: [
		/:last-child/,
		/:nth-child/,
		/:nth-last-child/,
		/:nth-of-type/,
		/:nth-last-of-type/,
		/:last-child/,
		/:first-of-type/,
		/:last-of-type/,
		/:only-child/,
		/:only-of-type/,
		/:not\(/,
		/:-webkit-/,
		/:-moz-/,
		/::selection/,
		// some modernizr classes
		/^\.(flexbox|csstransitions|csstransforms) /,
		/^\.no-js \.flexbox/,
		/\.__web-inspector-hide-shortcut__/
	],
	atRules: [
		'keyframes',
		'supports',
		'document',
	],
	removePrefixes: false,
	properties: [
		'user-select',

		'transition', 'transition-duration', 'transition-delay', 'transition-timing-function',
		'background-size',
		'border-radius',
		'box-shadow',
		'transform', 'transform-box', 'transform-origin', 'transform-style',
		'backface-visibility', 'perspective', 'perspective-origin',

		'animation', 'animation-delay', 'animation-direction', 'animation-duration', 'animation-fill-mode', 'animation-iteration-count', 'animation-name', 'animation-play-state', 'animation-timing-function',

		'flex', 'flex-basis', 'flex-direction', 'flex-flow', 'flex-grow', 'flex-shrink', 'flex-wrap',
		'order', 'align-content', 'align-items', 'align-self', 'justify-content',
	],
	values: [
		/data:image\/svg\+xml/,
		/^-webkit/,
		/^flex$/,
	],
	mqOptions: {
		type: 'screen',
		width: '1024px'
	}
};

module.exports = postcss.plugin('postcss-ie8', function(options) {
	opts = _.extend(defaults, options);
	return function(css, result) {
		autoprefixerIE8(css);
		stripMediaqueries(css, opts.mqOptions);
		stripSelectors(css, opts.selectors);
		stripAtRules(css, opts.atRules);
		stripProperties(css, {
			properties: opts.properties,
			values: opts.values,
			removePrefixes: opts.removePrefixes
		});
		removeEmpty(css);
	};
});
