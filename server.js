const Bundler = require('parcel-bundler');
const express = require('express');
const app = express();

app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    next();
});

const bundler = new Bundler('src/index.html');
app.use(bundler.middleware());

app.listen(7777);
