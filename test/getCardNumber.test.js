let { getCardNumber } = require('../kbotify/commands/printCard');

test('单纯结构测试', () => {
    expect(getCardNumber('6c')).toBe(13*3+6);
})

test('单纯结构测试2', () => {
    expect(getCardNumber('Th')).toBe(10+13);
})

test('10x测试', () => {
    expect(getCardNumber('10h')).toBe(10+13);
})

test('10x测试2', () => {
    expect(getCardNumber('10s')).toBe(10);
})

test('鬼牌测试', () => {
    expect(getCardNumber('鬼')).toBe(53);
})

test('中文格式测试', () => {
    expect(getCardNumber('方块4')).toBe(13*2+4);
})

test('中文格式测试2', () => {
    expect(getCardNumber('黑桃A')).toBe(1);
})

test('中文格式反效果测试', () => {
    expect(getCardNumber('方块')).toBe(-1);
})

test('Unicode花色字符测试', () => {
    expect(getCardNumber('♠8')).toBe(8);
})
