import db from "../src/config/db.config.js";

const run = async () => {
    try {
        // Lấy user id và role id
        const users = await db.query(`SELECT id, username FROM users`);
        const roles = await db.query(`SELECT id, code FROM roles`);
        const roleMap = Object.fromEntries(roles.rows.map(r => [r.code, r.id]));

        // Gán user_roles dựa trên username prefix
        for (const user of users.rows) {
            let roleCode = null;
            if (user.username.startsWith('superadmin')) roleCode = 'superadmin';
            else if (user.username.startsWith('admin')) roleCode = 'admin';
            else if (user.username.startsWith('manager')) roleCode = 'manager';
            else if (user.username.startsWith('editor')) roleCode = 'editor';
            else if (user.username.startsWith('consultant')) roleCode = 'consultant';
            if (roleCode && roleMap[roleCode]) {
                await db.query(
                    `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                    [user.id, roleMap[roleCode]]
                );
            }
        }
        console.log("✅ user_roles seeded");
    } catch (err) {
        console.error("❌ user_roles seed error:", err.message);
    }
};

run();
