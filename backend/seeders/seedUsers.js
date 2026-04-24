
import bcrypt from "bcrypt";
import db from "../src/config/db.config.js";

const run = async () => {
    try {

        const hash = await bcrypt.hash("123456", 10);
        const users = [];

        // 1 superadmin
        users.push(["Super Admin", "superadmin", "superadmin@example.com", hash]);

        // 3 admin
        for (let i = 1; i <= 3; i++) {
            users.push([
                `Admin User ${i}`,
                `admin${i}`,
                `admin${i}@example.com`,
                hash
            ]);
        }

        // 5 manager
        for (let i = 1; i <= 5; i++) {
            users.push([
                `Manager User ${i}`,
                `manager${i}`,
                `manager${i}@example.com`,
                hash
            ]);
        }

        // 10 editor
        for (let i = 1; i <= 10; i++) {
            users.push([
                `Editor User ${i}`,
                `editor${i}`,
                `editor${i}@example.com`,
                hash
            ]);
        }

        // 10 consultant
        for (let i = 1; i <= 10; i++) {
            users.push([
                `Consultant User ${i}`,
                `consultant${i}`,
                `consultant${i}@example.com`,
                hash
            ]);
        }

        for (const [name, username, email, password] of users) {
            await db.query(
                `INSERT INTO users (name, username, email, password)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (username) DO NOTHING`,
                [name, username, email, password]
            );
        }

        console.log("✅ Users seeded");
    } catch (err) {
        console.error("❌ Users seed error:", err.message);
    }
};

run();