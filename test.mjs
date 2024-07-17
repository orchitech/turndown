import { escapeCrude, escapeGfm, escapeMulti, escapeNamed, escapeReplacer, escapeSingle, escapeSmart } from "./src/escape-functions.mjs";

const LENGTH = +process.env.LENGTH || Number.MAX_SAFE_INTEGER;

const CONTENT_LIPSUM = (
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin congue lorem quis felis malesuada convallis. Cras nec mi nisl. Suspendisse sit amet porta mi, ut faucibus ante. Donec in vehicula massa. Fusce id aliquam tellus. Etiam hendrerit fermentum tortor eget pharetra. Nulla vel orci convallis, consectetur sem ac, consectetur ligula. Etiam tempor eros quis orci blandit volutpat. Nullam iaculis ante eu turpis rhoncus dictum. Sed at arcu non turpis fermentum tempor. Nullam pretium augue vitae velit egestas feugiat. Curabitur fringilla velit sit amet velit auctor malesuada. Quisque consequat odio sed enim gravida, eget bibendum nisi hendrerit. Nulla orci erat, convallis ut porta sit amet, varius eget sapien. Ut consequat, ligula non dignissim faucibus, neque massa tempus lectus, et semper nisl massa eget felis.\n' +
  'Etiam nec augue dui. Ut eu odio tristique, convallis massa et, posuere ligula. Ut hendrerit mollis commodo. Nunc sed nulla erat. Sed et lectus molestie, posuere elit eget, pulvinar neque. Praesent ac justo eu felis facilisis fermentum. Sed interdum lectus et magna volutpat, non imperdiet dui maximus. Nullam finibus elementum ex, et cursus nisl tincidunt vel. Praesent vitae mollis leo. Aliquam ornare posuere velit sit amet viverra. Maecenas dictum eros in elementum commodo. Nullam congue lectus id lorem aliquet, quis iaculis est pharetra. Proin ornare nec ex vel vestibulum.'
).substring(0, LENGTH);

const CONTENT_COLUMN = CONTENT_LIPSUM.replace(/ /g, '\n');

const CONTENT_MARKDOWN = (
  ' 1. *hello* _world_ ` foo \\ bar [] baz \n= ~hello~ \n\n> *****\n~~~~\n' +
  "An h1 header\n" +
  "============\n" +
  "\n" +
  "Paragraphs are separated by a blank line.\n" +
  "\n" +
  "2nd paragraph. *Italic*, **bold**, and `monospace`. Itemized lists\n" +
  "look like:\n" +
  "\n" +
  "  * this one\n" +
  "  * that one\n" +
  "  * the other one\n" +
  "\n" +
  "Note that --- not considering the asterisk --- the actual text\n" +
  "content starts at 4-columns in.\n" +
  "\n" +
  "> Block quotes are\n" +
  "> written like so.\n" +
  ">\n" +
  "> They can span multiple paragraphs,\n" +
  "> if you like.\n" +
  "\n" +
  "Use 3 dashes for an em-dash. Use 2 dashes for ranges (ex., \"it's all\n" +
  "in chapters 12--14\"). Three dots ... will be converted to an ellipsis.\n" +
  "Unicode is supported. ☺\n" +
  "\n" +
  "\n" +
  "\n" +
  "An h2 header\n" +
  "------------\n" +
  "\n" +
  "Here's a numbered list:\n" +
  "\n" +
  " 1. first item\n" +
  " 2. second item\n" +
  " 3. third item\n" +
  "\n" +
  "Note again how the actual text starts at 4 columns in (4 characters\n" +
  "from the left side). Here's a code sample:\n" +
  "\n" +
  "    # Let me re-iterate ...\n" +
  "    for i in 1 .. 10 { do-something(i) }\n" +
  "\n" +
  "As you probably guessed, indented 4 spaces. By the way, instead of\n" +
  "indenting the block, you can use delimited blocks, if you like:\n" +
  "\n" +
  "~~~\n" +
  "define foobar() {\n" +
  "    print \"Welcome to flavor country!\";\n" +
  "}\n" +
  "~~~\n"
).substring(0, LENGTH);

const LOOPS = +process.argv?.[3] || 10;
const ESCAPE = process.argv[2] || 'LEGACY';
const REPEAT = +process.env.REPEAT || 1;
let runEscape = escapeMulti;
if (ESCAPE === 'SINGLE') {
  runEscape = escapeSingle;
} else if (ESCAPE === 'SMART') {
  runEscape = escapeSmart;
} else if (ESCAPE === 'REPLACER') {
  runEscape = escapeReplacer;
} else if (ESCAPE === 'CRUDE') {
  runEscape = escapeCrude;
} else if (ESCAPE === 'NAMED') {
  runEscape = escapeNamed;
} else if (ESCAPE === 'GFM') {
  runEscape = escapeGfm;
} else if (ESCAPE !== 'LEGACY') {
  throw 'Invalid mode';
}

console.log();
console.log(`Mode: ${runEscape.name} - ${runEscape.description}`);

let content = '';
for (let i = 0; i < REPEAT; i++) {
  content += i + CONTENT_LIPSUM + CONTENT_COLUMN + CONTENT_MARKDOWN;
}

const startTime = process.hrtime.bigint()

let length = 0;
for (let i = 0; i < LOOPS; i++) {
  const prefix = i + '\n';
  length += runEscape (prefix + content).length;
  length += runEscape (prefix + CONTENT_LIPSUM + i).length;
  length += runEscape (prefix + CONTENT_COLUMN + i).length;
  length += runEscape (prefix + CONTENT_MARKDOWN + i).length;
}

const totalMs = (process.hrtime.bigint() - startTime) / 1000000n;

console.log(`Total result length: ${length}`);
console.log(`Run time: ${totalMs}ms`);

if (process.env.SAMPLE) {
  console.log(runEscape(CONTENT_MARKDOWN.substring(0, 80)));
}
