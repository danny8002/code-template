import express from 'express';

// Initialize the express engine
const app: express.Application = express();

// Handling '/' Request
app.get('/', (_req, _res) => {
    _res.send("TypeScript With Express");
});

export { app };