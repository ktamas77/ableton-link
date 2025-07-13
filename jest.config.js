module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/test/**/*.test.js'],
    collectCoverageFrom: [
        'index.js',
        '!**/node_modules/**',
        '!**/build/**',
        '!**/link/**'
    ],
    coverageDirectory: 'coverage',
    verbose: true
};