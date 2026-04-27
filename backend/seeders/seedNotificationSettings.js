
import db from "../src/config/db.config.js";

const notificationTypes = [
    'system',
    'page',
    'contact',
    'news',
    'schools',
    'user',
    'role',
    'file',
    'warning',
    'success',
    'error'
];

const run = async () => {
    try {
        // Lấy user và role
        const usersRes = await db.query('SELECT id FROM users ORDER BY id LIMIT 10');
        const users = usersRes.rows;
        const rolesRes = await db.query('SELECT id FROM roles');
        const roles = rolesRes.rows.map(r => r.id);

        // Seed cho từng user: mỗi user 2-3 loại notification, enabled ngẫu nhiên
        for (const user of users) {
            const types = notificationTypes.sort(() => 0.5 - Math.random()).slice(0, 3);
            for (const type of types) {
                await db.query(
                    `INSERT INTO notification_settings (user_id, role_id, type, enabled)
           VALUES ($1, NULL, $2, $3)
           ON CONFLICT DO NOTHING`,
                    [user.id, type, Math.random() > 0.3]
                );
            }
        }

        // Seed cho từng role: mỗi role 2 loại notification
        for (const role_id of roles) {
            const types = notificationTypes.sort(() => 0.5 - Math.random()).slice(0, 2);
            for (const type of types) {
                await db.query(
                    `INSERT INTO notification_settings (user_id, role_id, type, enabled)
           VALUES (NULL, $1, $2, $3)
           ON CONFLICT DO NOTHING`,
                    [role_id, type, Math.random() > 0.2]
                );
            }
        }
        console.log('✅ Seeded notification_settings for test UI/backend!');
    } catch (err) {
        console.error('❌ Error seeding notification_settings:', err.message);
    }
};

run();
