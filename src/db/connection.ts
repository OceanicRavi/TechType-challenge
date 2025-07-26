import sqlite3 from 'sqlite3';

class Database {
    private db: sqlite3.Database;

    constructor() {
        this.db = new sqlite3.Database(':memory:');
        this.init();
    }

    private init() {
        this.db.serialize(() => {
            // Create tables
            this.db.run(`
        CREATE TABLE nodes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          parent_id INTEGER,
          path TEXT UNIQUE NOT NULL,
          FOREIGN KEY (parent_id) REFERENCES nodes (id)
        )
      `);

            this.db.run(`
        CREATE TABLE properties (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          node_id INTEGER NOT NULL,
          key TEXT NOT NULL,
          value REAL NOT NULL,
          FOREIGN KEY (node_id) REFERENCES nodes (id),
          UNIQUE(node_id, key)
        )
      `);
        });
    }

    query(sql: string, params: any[] = []): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    run(sql: string, params: any[] = []): Promise<{ lastID: number }> {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID });
            });
        });
    }

}

export const db = new Database();