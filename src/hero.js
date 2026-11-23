/**
 * New-session hero: the brand mark shown before the blank-session headline.
 *
 * Only the mark seat is taken (`conversation.hero.brand.mark`); the headline
 * itself comes from the conversation locale dictionary and is not replaceable
 * from a plugin, so it is left to the host. The shipped pixel-whale artwork
 * keeps its own `conversation.hero.frame` hoc seat, which this plugin does not
 * touch.
 */

/** Hero mark: the same whale as the sidebar, drawn at the hero's larger size. */
function DuiHeroMark(props) {
  const settings = props === undefined || props === null ? {} : props;
  const size = typeof settings.size === 'number' ? settings.size : 48;
  return h('span', { className: 'dsui-hero-mark', 'aria-hidden': true },
    h(DuiWhaleMark, { size }));
}
