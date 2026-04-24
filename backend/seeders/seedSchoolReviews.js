
import db from "../src/config/db.config.js";
import { faker } from '@faker-js/faker';

const nationalities = [
    'Việt Nam', 'Nhật Bản', 'Hàn Quốc', 'Trung Quốc', 'Mỹ', 'Úc', 'Anh', 'Pháp', 'Đức', 'Thái Lan'
];

const run = async () => {
    try {
        const res = await db.query('SELECT id FROM schools');
        const schoolIds = res.rows.map(row => row.id);
        if (schoolIds.length === 0) {
            console.log('No schools found. Please seed schools first.');
            return;
        }

        let total = 0;
        for (const schoolId of schoolIds) {
            const numReviews = faker.number.int({ min: 2, max: 4 });
            for (let i = 0; i < numReviews; i++) {
                const studentName = faker.person.fullName();
                const avatarUrl = faker.image.avatar();
                const nationality = faker.helpers.arrayElement(nationalities);
                const coursePeriod = `${faker.number.int({ min: 2021, max: 2026 })}-${faker.number.int({ min: 2027, max: 2030 })}`;
                const rating = faker.number.int({ min: 3, max: 5 });
                const content = faker.lorem.paragraphs(2);
                await db.query(
                    `INSERT INTO school_reviews (school_id, student_name, avatar_url, nationality, course_period, rating, content)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [schoolId, studentName, avatarUrl, nationality, coursePeriod, rating, content]
                );
                total++;
            }
        }
        console.log(`✅ Seeded ${total} school reviews.`);
    } catch (err) {
        console.error('❌ Error seeding school_reviews:', err.message);
    }
};

run();
