const getArgs = require('../utils/getArgs');

test('general args test', () => {
    expect(JSON.stringify(getArgs(['10', '285', 'str=10', '-f', '-N', '\\-\\-overload', '\\-\\-highlight=1234'])))
        .toBe(JSON.stringify({
            params: ["10", "285", "str=10"],
            flags: {
                f: true,
                N: true,
                overload: true,
                highlight: "1234"
            }
        }))
})