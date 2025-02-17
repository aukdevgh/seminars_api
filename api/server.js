import jsonServer from 'json-server';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();
const dbFile = path.join(__dirname, 'db.json');

server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);

// Имитация задержки API
server.use(async (req, res, next) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    next();
});

// Получение всех семинаров
server.get('/seminars', (req, res) => {
    const db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
    res.json(db.seminars);
});

// Добавление нового семинара
server.post('/seminars', (req, res) => {
    console.log('Received request for seminars');
    const db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
    const newSeminar = { id: Date.now(), ...req.body };
    db.seminars.push(newSeminar);

    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
    res.status(201).json(newSeminar);
});

// Редактирование семинара
server.put('/seminars/:id', (req, res) => {
    const db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
    const seminarIndex = db.seminars.findIndex(s => s.id == req.params.id);

    if (seminarIndex === -1) {
        return res.status(404).json({ error: 'Семинар не найден' });
    }

    db.seminars[seminarIndex] = { ...db.seminars[seminarIndex], ...req.body };

    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
    res.json(db.seminars[seminarIndex]);
});

// Удаление семинара
server.delete('/seminars/:id', (req, res) => {
    const db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
    const filteredSeminars = db.seminars.filter(s => s.id != req.params.id);

    if (filteredSeminars.length === db.seminars.length) {
        return res.status(404).json({ error: 'Семинар не найден' });
    }

    db.seminars = filteredSeminars;
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));

    res.status(204).send();
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`JSON Server is running on http://localhost:${PORT}`);
});

export default server;
