const fs = require('fs');
const path = require('path');

export function getLanguages() {
    return [
        'python',
        'c++',
        'php',
        'go',
        'html',
        'css',
        'javascript',
        'perl',
        'java',
        'ruby'
    ]
}

export function generatePathUnique(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let pathUnique = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        const character = characters[randomIndex];
        pathUnique += character;
    }

    return pathUnique;
}

// Fungsi untuk mendapatkan hash atau memasukkan text baru ke tabel content
export
    function get_post_hash(db, hash, text) {
    return new Promise((resolve, reject) => {
        // Membuka koneksi ke database
        // const db = new sqlite3.Database('pastebin.db');

        // Mengecek apakah hash sudah ada di tabel content
        db.get('SELECT hash FROM content WHERE hash = ?', [hash], (err, row) => {
            if (err) {
                reject(err);
            } else if (row) {
                // Jika hash sudah ada, langsung mengembalikan hash
                // db.close();
                resolve(row.hash);
            } else {
                // Jika hash belum ada, memasukkan text baru ke tabel content
                const timeAdded = new Date().toISOString();
                db.run('INSERT INTO content (hash, content, length, time_added) VALUES (?, ?, ?, ?)', [hash, text, text.length, timeAdded], function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        // Mengembalikan hash yang baru dibuat
                        // db.close();
                        resolve(hash);
                    }
                });
            }
        });
    });
}

export function createTable(db) {
    db.run(`CREATE TABLE IF NOT EXISTS content (
        hash VARCHAR PRIMARY KEY,
        content TEXT,
        length int,
        time_added DATETIME
     )`);
    db.run(`CREATE TABLE IF NOT EXISTS paste (
        id INTEGER PRIMARY KEY,
        path VARCHAR UNIQUE,
        hash_content VARCHAR,
        paste_name VARCHAR,
        language VARCHAR NULL,
        password VARCHAR NULL,
        total_visitor INTEGER,
        ip VARCHAR NULL,
        time_added DATETIME,
        time_expired DATETIME NULL,
        active BOOLEAN,
        FOREIGN KEY (hash_content) REFERENCES content(hash)
     )`)
    db.run(`CREATE TABLE IF NOT EXISTS report (
        id INTEGER PRIMARY KEY,
        paste_id INTEGER,
        message TEXT,
        time_added DATETIME,
        viewed BOOLEAN,
        FOREIGN KEY (paste_id) REFERENCES paste(id)
     )`)
}

function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    else if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    else return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// Fungsi async untuk mendapatkan ukuran file
export async function getFileSize(filePath) {
    try {
        const stats = await fs.promises.stat(filePath);
        return formatSize(stats.size);
    } catch (error) {
        console.error('Error reading file size:', error);
        throw error;
    }
}
