# Treating Whitespace in Turndown

Treatment of whitespace in HTML is determined by its rendering in browsers.
This is called whitespace collapsing. When Turndown processes HTML, the rule
of thumb is:
1. The whitespace SHOULD be collapsed the HTML way if the generated Markdown
   would render differently than the original HTML.
2. The whitespace MIGHT be collapsed the HTML way, as long as it does not
   cause rendering differences.

The second principle allows turndown to simplify several things and its right
operation actually depends on it.

There is not much special about whitesplace inside text. The situation is more
tricky for whitespace at the edges of text nodes.

## Flanking Delimiter Run Treatment

See [CommonMark spec](https://spec.commonmark.org/0.29/#delimiter-run) for
more information.

The situation in Turndown 6.0.0 is as follows. Consider an element containing
a text node and a followed by text node `<b>foo(End)</b>(Start)Next`. The
non-breaking space is alternatively written as `·` to improve readibility.

| # | End         | Next Start | HTML collapse | Turndown operation | Example of Processing |
|---| ---         | ---         | ---           | ---             | --- |
| 1 | ASCII WS    | ASCII WS    | eaten         | no op           | `<i>foo </i> bar`<br>→`<i>foo</i> bar`<br>→`_foo_ bar` |
| 2 | nonWS       | ASCII WS    | no-op         | no op           | `<i>foo</i> bar`<br>→`<i>foo</i> bar`<br>→`_foo_ bar` |
| 3 | ASCII WS    | nonWS       | no-op         | move End outside | `<i>foo </i>bar`<br>→`<i>foo </i>bar`<br>→`_foo_ bar` |
| 4 | nonASCII WS | nonWS       | no-op         | •change End to 0x20<br>•move End outside | `<i>foo&nbsp;</i>bar`<br>→`<i>foo&nbsp;</i>bar`<br>→`_foo_ bar` |
| 5 | nonASCII WS | nonASCII WS | no-op         | •change End to 0x20<br>•move End outside | `<i>foo&nbsp;</i>&nbsp;bar`<br>→`<i>foo&nbsp;</i>&nbsp;bar`<br>→`_foo_ ·bar` |
| 6 | ASCII WS    | nonASCII WS | no-op         | move End outside | `<i>foo </i>&nbsp;bar`<br>→`<i>foo </i>&nbsp;bar`<br>→`_foo_ ·bar` |
| 7 | nonASCII WS | ASCII WS    | no-op         | •output End as is<br>•change End to 0x20<br>move End outside | `<i>foo&nbsp;</i> bar`<br>→`<i>foo&nbsp;</i> bar`<br>→`_foo·_ bar` |

Cases 1 and 2 exactly match the rule of thumb. Let's discuss the other ones.

### Turndown 6.0 Behavior Evaluation

#### Case 3: Allow small exception

Although the case 3 is a small change to HTML behavior:
- Text content still matches.
- Not really unexpected, normal WS should be treated as a fragile thing.
- Likely resulting from unintended input artefacts, e.g. mouse-selecting text
  and pressing the *I* button.
- A strictly matching encoding - `_foo&#32;_bar` - is just too ugly given
  the above reasons.

On the other hand, this is also applied to inlines that don't need it,
specifically `<code>`. E.g. `` `foo `bar `` renders as
`<code>foo </code>bar`, which turndowns to `` `foo` bar `` now.
\[NO-CODE\]

#### Cases 4-6: Unexpected and Misfmormatting vulnerability

The technical issue behind the current behavior lies in CommonMark spec.
CommonMark requires some of the tags not to be surrounded by Unicode
whitespace. But HTML whitespace collapsing works only with ASCII whitespace.

Suppose `~` means a non-breaking space (HTML `&nbsp;`, unicode `\u00A0`).
The current behavior has three issues:
- Replacing Unicode whitespace with ASCII is not expected by users,
  e.g. `Law §~<b>1782</b>` should not break after `§`. \[RESPECT-ORIGINAL-WS\]
- Without extra escaping, replacing Unicode whitespace can produce false
  formatting. E.g. `<p>~1. foo</p>` `<p>1.~<b>foo</b></p>` and both produces
  ordered lists, which were not on the input. \[RESPECT-ORIGINAL-WS\]
- Users do not expect ASCII and nonASCII whitespace to be merged, e.g.
  `always add <b>~km</b> as the distance unit` should not collapse in
  a single space after `add`. \[DO-NOT-COLLAPSE-MIXED-WS\]
- Some users might expect unicode whitespace to be kept wihin emphasis
  elements, e.g. `Law §<b>~1782</b>`. But this is can be considered
  a similar situation to normal whitespace, where it is actually moved.
  ~~\[DO-NOT-MOVE-UNICODE-WS\]~~

#### Case 7: Broken Flanking Delimiter Run

Case 7 adds extra issue of broken formating on top of the previous issue.
This is partially due to an implementation detail of how it is decided
when the content should be `trim()`med. ~~\[TRIM-REGARDLESS-OF-WS-DETECTION]\~~

The issue would also occured if HTML whitespace was not collapsed. But
it is actually collapsed and the enabler of this issue is the mentioned
\[DO-NOT-COLLAPSE-MIXED-WS\].

### Suggested Changes

For fixing treatment of Unicode whitespace, the following should be fixed:
- \[RESPECT-ORIGINAL-WS\]
- \[DO-NOT-COLLAPSE-MIXED-WS\]

As it seems that moving whitespace outside is only a deal for inline code,
\[NO-CODE\] is actually already handled by `preformattedCode` option.
This is probably better choice, as it address all whitespace within code.
