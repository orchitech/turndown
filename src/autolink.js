function tryConvertAutolink(link) {
    // https://spec.commonmark.org/0.29/#absolute-uri
    const uri = /^([a-zA-Z][a-zA-Z0-9+.-]{1,31}:[^\s\x00-\x1f<>\\]*)$/

    // https://spec.commonmark.org/0.29/#email-address
    const mail = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/

    if (uri.test(link) || mail.test(link)) {
        return link 
    }
    return null
}

function tests() {
    // From CommonMark's specs: https://spec.commonmark.org/0.29/#autolinks
    const validAutolinks = [
        'http://foo.bar.baz',
        'http://foo.bar.baz/test?q=hello&id=22&boolean',
        'irc://foo.bar:2233/baz',
        'MAILTO:FOO@BAR.BAZ',

        // technically not valid URIs but CommonMark permits them
        'a+b+c:d',
        'made-up-scheme://foo,bar',
        'http://../',
        'localhost:5001/foo',
    ]

    const invalidAutolinks = [
        'http://foo.bar/baz bim',
        'http://example.com/\\[\\'
    ]

    validAutolinks.forEach(link => {
        if (tryConvertAutolink(link) !== link) {
            throw `${link} was not converted to an autolink`
        }
    })

    invalidAutolinks.forEach(link => {
        if (tryConvertAutolink(link) !== null) {
            throw `${link} was converted to an autolink`
        }
    })

    console.log("All tests passed...")
}