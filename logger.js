function Logger (message) {
    if (process.env.NODE_ENV === 'dev') console.log(message)
}

module.exports = Logger
