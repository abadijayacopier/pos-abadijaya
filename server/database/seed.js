const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    try {
        const connection = await pool.getConnection();

        // =============== USERS ===============
        const [userRows] = await connection.query('SELECT COUNT(*) as count FROM users');
        if (userRows[0].count === 0) {
            console.log('Seeding Users...');

            const adminPass = await bcrypt.hash('admin123', 10);
            const kasirPass = await bcrypt.hash('kasir123', 10);
            const operatorPass = await bcrypt.hash('operator123', 10);
            const teknisiPass = await bcrypt.hash('teknisi123', 10);

            await connection.query(`
        INSERT INTO users (id, name, username, password, role) VALUES 
        ('u1', 'Admin Utama', 'admin', '${adminPass}', 'admin'),
        ('u2', 'Kasir Depan', 'kasir', '${kasirPass}', 'kasir'),
        ('u3', 'Operator Cetak', 'operator', '${operatorPass}', 'operator'),
        ('u4', 'Teknisi Abadi', 'teknisi', '${teknisiPass}', 'teknisi')
      `);
        }

        // =============== CATEGORIES ===============
        const [catRows] = await connection.query('SELECT COUNT(*) as count FROM categories');
        if (catRows[0].count === 0) {
            console.log('Seeding Categories...');
            await connection.query(`
        INSERT INTO categories (id, name, type, emoji) VALUES 
        ('c1', 'Pulpen & Pensil', 'atk', '🖊️'),
        ('c2', 'Buku & Kertas', 'atk', '📓'),
        ('c3', 'Map & Amplop', 'atk', '📁'),
        ('c4', 'Stapler & Lem', 'atk', '📎'),
        ('c5', 'Kertas Fotocopy', 'fotocopy_supply', '📄'),
        ('c6', 'Toner & Tinta', 'fotocopy_supply', '🖨️')
      `);
        }

        // =============== PRODUCTS ===============
        const [prodRows] = await connection.query('SELECT COUNT(*) as count FROM products');
        if (prodRows[0].count === 0) {
            console.log('Seeding Products...');
            await connection.query(`
        INSERT INTO products (id, code, name, category_id, buy_price, sell_price, stock, min_stock, unit, emoji) VALUES 
        ('p1', 'ATK-001', 'Pulpen Pilot BP-1RT', 'c1', 3500, 5000, 50, 10, 'pcs', '🖊️'),
        ('p2', 'ATK-002', 'Buku Tulis 58 lembar', 'c2', 3000, 4500, 30, 10, 'pcs', '📓'),
        ('p3', 'ATK-003', 'Map Plastik Bercetak F4', 'c3', 2000, 3500, 60, 15, 'pcs', '📁'),
        ('p4', 'ATK-004', 'Kertas HVS A4 70gsm', 'c5', 40000, 55000, 15, 5, 'rim', '📄'),
        ('p5', 'ATK-005', 'Isi Staples No 10', 'c4', 3000, 5000, 25, 10, 'box', '📎')
      `);
        }

        // =============== FOTOCOPY PRICES ===============
        const [fcRows] = await connection.query('SELECT COUNT(*) as count FROM fotocopy_prices');
        if (fcRows[0].count === 0) {
            console.log('Seeding Fotocopy Prices...');
            await connection.query(`
        INSERT INTO fotocopy_prices (id, paper, color, side, price, label) VALUES 
        ('fc1', 'HVS A4', 'bw', '1', 200, 'HVS A4 - B/W - 1 Sisi'),
        ('fc2', 'HVS A4', 'bw', '2', 350, 'HVS A4 - B/W - Bolak-balik'),
        ('fc3', 'HVS F4', 'bw', '1', 250, 'HVS F4 - B/W - 1 Sisi'),
        ('fc4', 'HVS F4', 'bw', '2', 400, 'HVS F4 - B/W - Bolak-balik'),
        ('fc5', 'HVS A3', 'bw', '1', 500, 'HVS A3 - B/W - 1 Sisi'),
        ('fc6', 'HVS A4', 'color', '1', 1500, 'HVS A4 - Warna - 1 Sisi')
      `);
        }

        console.log('✅ Proses Seeding (Data Contoh) Selesai!');
        connection.release();
        process.exit(0);

    } catch (err) {
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('❌ GAGAL: Database "pos_abadi" belum ada!');
        } else {
            console.error('❌ Terjadi kesalahan saat proses seeding:', err.message);
        }
        process.exit(1);
    }
};

seedData();
