const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const bodyParser = require('body-parser');
import { generatePathUnique, get_post_hash, createTable, getLanguages, getFileSize } from '../plugins/function.js';

const app = express();

// Membuka koneksi ke database SQLite
const db = new sqlite3.Database('pastebin.db');

// membuat tabel jika belum ada
createTable(db);

app.use(bodyParser.json({ limit: '3mb' }));
app.use(bodyParser.text({ type: "*/*" }));

app.get('/post', (req, res) => {
    return res.status(400).json({
        message: 'Post method is required.'
    })
})

app.post('/post', (req, res) => {
    try {
        let { options } = req.headers;
        let text = req.body;
        let expired, language, password, name;

        try {
            options = JSON.parse(options);
        } catch (error) { // console.log('error parsing')
            options = {}
        }
        expired = options.expired || null;
        language = options.language || null;
        password = options.password || null;
        name = options.name || null;

        // return res.json({expired, language, password, text})

        // Validasi parameter text
        if (!text || text.length === 0) {
            return res.status(400).json({
                message: 'Text post required.'
            });
        }

        // Validasi panjang text
        if (text.length > 3 * 1024 * 1024) {
            return res.status(400).json({
                message: 'The text length cannot exceed 3MB.'
            });
        }

        // Konversi expired menjadi waktu kedaluwarsa
        let timeExpired;

        if (expired === '10 minute') {
            timeExpired = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        } else if (expired === '1 hour') {
            timeExpired = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        } else if (expired === '1 day') {
            timeExpired = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        } else if (expired === '1 week') {
            timeExpired = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        } else if (expired === '1 month') {
            timeExpired = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        } else {
            // Default: 1 bulan
            timeExpired = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        }


        // Validasi parameter language
        let languages = getLanguages();
        if (language && !languages.includes(language)) {
            return res.status(400).json({
                message: 'Parameter language tidak valid.'
            });
        }

        // Generate hash_content menggunakan md5
        const hashContent = crypto.createHash('md5').update(text).digest('hex');

        // Generate path_unique sepanjang 5 karakter azAZ
        const pathUnique = generatePathUnique(6);

        get_post_hash(db, hashContent, text)
            .then((result) => {
                // Memasukkan data paste ke dalam tabel "paste"
                db.run(
                    `INSERT INTO paste (path, hash_content, language, password, time_added, time_expired, active, total_visitor, ip, paste_name) VALUES (?, ?, ?, ?, datetime('now'), ?, 1, 0, ?, ?)`,
                    [pathUnique, hashContent, language || null, password || null, timeExpired, req.ip || null, name],
                    function (err) {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({
                                message: 'Failed to save text. try again'
                            });
                        }

                        // console.log(`Paste dengan id ${this.lastID} berhasil disimpan.`);
                        return res.status(200).json({
                            message: 'Saved Successfully.',
                            path: pathUnique,
                            expired_time: timeExpired
                        });
                    }
                );
            })
            .catch((err) => {
                console.error(err);
            });
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            message: 'Failed to save text. try again'
        });
    }
});

app.use('/raw/:path/:hash_pwd?', (req, res) => {
    const path = req.params.path;
    const hash_pwd = req.params.hash_pwd

    db.get(`SELECT content.content, language, paste.time_expired as time_expired, paste_name,password FROM paste,content WHERE path = ? and hash_content = content.hash AND (time_expired IS NULL OR time_expired >= DATETIME('now'))`, [path], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: 'Failed to get paste.'
            });
        }
        res.set('Content-Type', 'text/plain')
        res.set('access-control-allow-origin', '*')
        res.set('access-control-allow-methods', 'GET, POST, OPTIONS')
        res.set('access-control-allow-headers', 'Content-Type')
        if (row) {
            let head = {
                expired_time: row.time_expired,
                name: row.paste_name,
                language: row.language,
            }
            if (row.password !== null) {
                let hash_paste_password = crypto.createHash('sha256').update(row.password).digest('hex').substr(0, 20);
                if (hash_paste_password !== hash_pwd) {
                    return res.status(401).send('Unauthorized');
                }
                head.hash_pwd = hash_paste_password
            }
            res.set('info', JSON.stringify(head))
            return res.status(200).send(row.content)
        } else {
            return res.status(404).send('Not Found')
        }
    })
});

app.use('/api/highlightWorker.js', (req, res) => {
    res.set('Content-Type', 'application/json');
    if (req.query.lang) {
        let lang = req.query.lang.toLowerCase();
        let languages = getLanguages();
        if (languages.includes(lang)) {
            if (lang == 'c++') {
                lang = 'cpp'
            } else if (lang == 'html') {
                lang = 'xml'
            }
            let more = '';
            if (lang == 'php') {
                more = 'importScripts("/h/languages/php-template.min.js");'
            }
            let template = `importScripts('/h/highlight.js');
${more}
importScripts('/h/languages/${lang}.min.js')

self.onmessage = function (event) {
    const code = event.data;
    
    // Perform the code highlighting
    const highlightedCode = self.hljs.highlightAuto(code).value;
    
    self.postMessage(highlightedCode);
};`
            return res.status(200).send(template)
        } else {
            return res.status(404).send('Not Found')
        }
    } else {
        return res.status(404).send('-1')
    }
});


module.exports = {
    path: '/',
    handler: app
};
