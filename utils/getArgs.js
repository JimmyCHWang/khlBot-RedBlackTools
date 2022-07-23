const getArgs = (args) => {
    let normalParams = [];
    let flags = {};
    args.forEach(arg => {
        let argStr = "";
        if (arg.startsWith('\\-\\-') && arg.length > 4) {
            argStr = arg.substr(4);
        } else if (arg.startsWith('-') && arg.length > 1) {
            argStr = arg.charAt(1);
        }
        if (argStr.indexOf('=') > 0) {
            flags[argStr.substr(0, argStr.indexOf('='))] = argStr.substr(argStr.indexOf('=') + 1);
        } else if (argStr !== '') {
            flags[argStr] = true;
        } else {
            if (arg.length > 0) normalParams.push(arg);
        }
    })
    return {
        params: normalParams,
        flags
    }
}

module.exports = getArgs;