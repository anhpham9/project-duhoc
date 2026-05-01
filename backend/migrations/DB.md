## Tạo enum cho CSDL

```SQL
DO $$
BEGIN
    -- ================= SCHOOL STATUS =================
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'school_status_enum') THEN
        CREATE TYPE school_status_enum AS ENUM (
            'partner',
            'active',
            'paused',
            'pending'
        );
    END IF;

    -- ================= NEWS STATUS =================
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'news_status_enum') THEN
        CREATE TYPE news_status_enum AS ENUM (
            'draft',
            'published',
            'archived'
        );
    END IF;

    -- ================= CONTACT STATUS =================
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_status_enum') THEN
        CREATE TYPE contact_status_enum AS ENUM (
            'new',
            'pending',
            'responded',
            'closed'
        );
    END IF;

    -- ================= CONTACT METHOD =================
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_method_enum') THEN
        CREATE TYPE contact_method_enum AS ENUM (
            'phone',
            'email',
            'social'
        );
    END IF;

    -- ================= FAQ TYPE =================
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'faq_type_enum') THEN
        CREATE TYPE faq_type_enum AS ENUM (
            'school',
            'general'
        );
    END IF;

    -- ================= PAGE TYPE =================
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'page_type_enum') THEN
        CREATE TYPE page_type_enum AS ENUM (
            'static',
            'dynamic'
        );
    END IF;

    -- ================= PAGE STATUS =================
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'page_status_enum') THEN
        CREATE TYPE page_status_enum AS ENUM (
            'draft',
            'published'
        );
    END IF;

    -- ================= NOTIFICATION TYPE =================
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type_enum') THEN
        CREATE TYPE notification_type_enum AS ENUM (
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
        );
    END IF;

    -- ================= NOTIFICATION ACTION =================
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_action_enum') THEN
        CREATE TYPE notification_action_enum AS ENUM (
            'created',
            'updated',
            'deleted',
            'assigned',         -- đã được phân công
            'published',
            'approved',         -- đã được phê duyệt
            'rejected',         -- đã bị từ chối
            'login',
            'logout'
        );
    END IF;


    -- ================= AUDIT ACTION =================
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action_enum') THEN
        CREATE TYPE audit_action_enum AS ENUM (
            'create',
            'update',
            'delete',
            'login',            -- auth
            'logout',           -- auth
            'refresh_token',    -- security
            'assign',           -- RBAC (phân công)
            'upload',
            'download',
            'approve',          -- workflow (phê duyệt / chấp thuận)
            'reject'            -- từ chối / không chấp nhận
        );
    END IF;

END$$;
```

## Tạo TRIGGERS

```SQL
-- ======================== TRIGGERS ========================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

```

## Bảng trong CSDL

```SQL
-- ======================== ROLES ========================
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- ======================== PERMISSIONS ========================
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- ======================== ROLE_PERMISSIONS ========================
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);

-- ======================== USERS ========================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    deleted_at TIMESTAMP
);
CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ======================== USER_ROLES ========================
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- ======================== CATEGORIES ========================
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================== NEWS ========================
CREATE TABLE IF NOT EXISTS news (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    thumbnail_url TEXT,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    author_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status news_status_enum DEFAULT 'draft',
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    UNIQUE (slug, category_id)
);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category_id);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at);
CREATE INDEX IF NOT EXISTS idx_news_slug_category ON news(slug, category_id);
CREATE INDEX IF NOT EXISTS idx_news_author ON news(author_id);
CREATE TRIGGER trigger_news_updated_at
BEFORE UPDATE ON news
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ======================== NEWS_VIEWS ========================
CREATE TABLE IF NOT EXISTS news_views (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    news_id BIGINT REFERENCES news(id) ON DELETE CASCADE,
    ip_address VARCHAR(50),
    user_agent TEXT,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_news_views_news_id ON news_views(news_id);

-- ======================== NEWS_VIEW_STATS ========================
CREATE TABLE IF NOT EXISTS news_view_stats (
    news_id BIGINT PRIMARY KEY REFERENCES news(id) ON DELETE CASCADE,
    view_count INTEGER DEFAULT 0
);

-- ======================== REGIONS ========================
CREATE TABLE IF NOT EXISTS regions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- ======================== SCHOOL_TYPES ========================
CREATE TABLE IF NOT EXISTS school_types (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- ======================== SCHOOLS ========================
CREATE TABLE IF NOT EXISTS schools (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    location TEXT,   -- địa chỉ chi tiết
    tuition_per_year INTEGER,   -- học phí
    class_size INTEGER,      -- sĩ số lớp
    visa_success_rate INTEGER,  -- % thành công xin visa
    features JSONB,      -- đặc điểm
    region_id INTEGER REFERENCES regions(id) ON DELETE SET NULL,
    type_id INTEGER REFERENCES school_types(id) ON DELETE SET NULL,
    status school_status_enum DEFAULT 'pending',
    logo_url TEXT,
    thumbnail_url TEXT,          -- ảnh chính
    rating DECIMAL(2,1), -- max 5.0
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_schools_region ON schools(region_id);
CREATE INDEX IF NOT EXISTS idx_schools_status ON schools(status);
CREATE TRIGGER trigger_schools_updated_at
BEFORE UPDATE ON schools
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ======================== SCHOOL_REVIEWS ========================
CREATE TABLE IF NOT EXISTS school_reviews (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    student_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    nationality VARCHAR(100),
    course_period VARCHAR(50),  -- ví dụ: 2023-2025
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reviews_school ON school_reviews(school_id);

-- ======================== FAQS ========================
CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    question TEXT NOT NULL,
    answer TEXT NOT NULL,

    -- loại FAQ: chung (general) hoặc theo trường (school)
    type faq_type_enum NOT NULL,

    -- nếu là FAQ của trường
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_faqs_school ON faqs(school_id);

-- ======================== CONTACTS ========================
CREATE TABLE IF NOT EXISTS contacts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(20),
    message TEXT,
    status contact_status_enum DEFAULT 'new',
    contact_method contact_method_enum,
    social_contact VARCHAR(255),
    assigned_to BIGINT REFERENCES users(id) ON DELETE SET NULL,
    first_contacted_at TIMESTAMP,
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_assigned ON contacts(assigned_to);
CREATE TRIGGER trigger_contacts_updated_at
BEFORE UPDATE ON contacts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ======================== CONTACT_NOTES ========================
CREATE TABLE IF NOT EXISTS contact_notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_contact_notes_contact ON contact_notes(contact_id);

-- ======================== STATIC_PAGES ========================
CREATE TABLE IF NOT EXISTS static_pages (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    hero_title VARCHAR(255),
    hero_description TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    type page_type_enum NOT NULL,
    status page_status_enum DEFAULT 'published',
    updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trigger_static_pages_updated_at
BEFORE UPDATE ON static_pages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ======================== PAGE_CONTENTS ========================
CREATE TABLE IF NOT EXISTS page_contents (
    page_id INTEGER PRIMARY KEY REFERENCES static_pages(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trigger_page_contents_updated_at
BEFORE UPDATE ON page_contents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ======================== SETTINGS ========================
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    description TEXT
);

-- ======================== NOTIFICATIONS ========================
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    -- target user / role
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,     -- người nhận (có thể NULL nếu là broadcast)
    role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,   -- hoặc gửi cho cả role

    -- phân loại
    type notification_type_enum NOT NULL,                      -- loại thông báo (news, contact, system, etc)
    action notification_action_enum NOT NULL,                  -- thao tác (news_created, 

    -- nội dung
    title VARCHAR(255) NOT NULL,                               -- tiêu đề ngắn gọn
    message TEXT,                                              -- nội dung chi tiết

    -- liên kết object
    entity_type VARCHAR(50),  -- ví dụ: 'contact', 'user'
    entity_id BIGINT,         -- id của record

    -- dữ liệu mở rộng
    data JSONB,                                                -- dữ liệu bổ sung (id đối tượng, link, ...)

    -- trạng thái
    is_read BOOLEAN DEFAULT FALSE,                             -- đã đọc hay chưa

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEX
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_role ON notifications(role_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type_action ON notifications(type, action);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ======================== NOTIFICATION_SETTINGS ========================
CREATE TABLE IF NOT EXISTS notification_settings (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,

    type notification_type_enum NOT NULL,
    action notification_action_enum, -- NULL = apply cho toàn bộ action

    enabled BOOLEAN DEFAULT TRUE,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- chỉ cho phép user hoặc role
ALTER TABLE notification_settings
ADD CONSTRAINT check_user_or_role
CHECK (
    (user_id IS NOT NULL AND role_id IS NULL)
    OR
    (user_id IS NULL AND role_id IS NOT NULL)
);

-- tránh duplicate setting
ALTER TABLE notification_settings
ADD CONSTRAINT unique_user_type_action
UNIQUE (user_id, type, action);

ALTER TABLE notification_settings
ADD CONSTRAINT unique_role_type_action
UNIQUE (role_id, type, action);

-- INDEX
CREATE INDEX IF NOT EXISTS idx_notification_settings_user ON notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_role ON notification_settings(role_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_type_action ON notification_settings(type, action);

-- TRIGGER updated_at
CREATE TRIGGER trigger_notification_settings_updated_at
BEFORE UPDATE ON notification_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ======================== AUDIT_LOGS ========================
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,

    action audit_action_enum NOT NULL,         -- ví dụ: 'create_user', 'delete_news'

    entity_type VARCHAR(50),                   -- ví dụ: 'user', 'news', 'contact'
    entity_id BIGINT,                          -- id của đối tượng bị tác động

    data JSONB,                                -- dữ liệu chi tiết (trước/sau)

    ip_address VARCHAR(50),
    user_agent TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ======================== ACTIVITY_LOGS ========================
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,

    action audit_action_enum NOT NULL,

    entity_type VARCHAR(50),
    entity_id BIGINT,

    data JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ======================== PASSWORD_RESET_TOKENS ========================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL, -- token sau khi hash 
    expired_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id);

-- ======================== USER_SESSIONS ========================
CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) UNIQUE NOT NULL,  -- token sau khi hash 
    ip_address VARCHAR(50),
    user_agent TEXT,
    expired_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);

-- ======================== FILES ========================
CREATE TABLE IF NOT EXISTS files (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,       -- Ai upload
    public_id VARCHAR(255) UNIQUE NOT NULL,                       -- Cloudinary public_id
    url TEXT NOT NULL,                                            -- URL truy cập ảnh
    resource_type VARCHAR(50),                                    -- image, video, raw
    format VARCHAR(20),                                           -- jpg, png, mp4, ...
    width INTEGER,
    height INTEGER,
    bytes BIGINT,                                                 -- Kích thước file
    folder VARCHAR(255),                                          -- Thư mục Cloudinary (nếu có)
    tags TEXT[],                                                  -- Tag Cloudinary
    context JSONB,                                                -- Metadata bổ sung (caption, alt, ...)
    used_in VARCHAR(50),                                          -- news, user, school, ...
    used_in_id BIGINT,                                            -- id đối tượng sử dụng
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_files_user ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_used_in ON files(used_in, used_in_id);
```

#### Lưu ý thiết kế

- user_id và role_code có thể NULL, nhưng không nên NULL đồng thời (ít nhất phải xác định 1 đối tượng nhận).
- type nên chuẩn hóa (ví dụ: system, event, warning, info, ...).
- notification_settings cho phép user tắt/mở từng loại thông báo, ưu tiên user > role > mặc định hệ thống.
- Có thể mở rộng thêm trường như: expires_at, priority, v.v. nếu cần.

## Bổ sung các chức năng mở rộng

### 21. 🧱  Audit Logs (Lịch sử thao tác)

Mục đích: Ghi lại mọi thao tác quan trọng để phục vụ bảo mật, truy vết.

```SQL
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,         -- ví dụ: 'create_user', 'delete_news'
    entity_type VARCHAR(50),              -- ví dụ: 'user', 'news', 'contact'
    entity_id BIGINT,                     -- id của đối tượng bị tác động
    data JSONB,                           -- dữ liệu chi tiết (trước/sau)
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_object ON audit_logs(entity_type, entity_id);
```

### 22. 🧱 Password Reset Tokens (Quên mật khẩu)

Mục đích: Lưu token reset mật khẩu, thời gian hết hạn.

```SQL
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expired_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_password_reset_user ON password_reset_tokens(user_id);
```

### 23. 🧱 Session Tokens / Refresh Tokens (Nếu dùng JWT có refresh)

Mục đích: Lưu refresh token để quản lý đăng nhập, bảo mật.

```SQL
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    expired_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
```

### 24. 🧱  Bảng files (tối ưu cho Cloudinary)

```SQL
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),           -- Ai upload
    public_id VARCHAR(255) UNIQUE NOT NULL,        -- Cloudinary public_id
    url TEXT NOT NULL,                             -- URL truy cập ảnh
    resource_type VARCHAR(50),                     -- image, video, raw
    format VARCHAR(20),                            -- jpg, png, mp4, ...
    width INTEGER,
    height INTEGER,
    bytes BIGINT,                                  -- Kích thước file
    folder VARCHAR(255),                           -- Thư mục Cloudinary (nếu có)
    tags TEXT[],                                   -- Tag Cloudinary
    context JSONB,                                 -- Metadata bổ sung (caption, alt, ...)
    used_in VARCHAR(50),                           -- news, user, school, ...
    used_in_id BIGINT,                             -- id đối tượng sử dụng
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_files_user ON files(user_id);
CREATE INDEX idx_files_used_in ON files(used_in, used_in_id);
```

**Giải thích:**
- `public_id`: ID duy nhất của Cloudinary, dùng để xóa/cập nhật ảnh.
- `url`: Đường dẫn truy cập ảnh.
- `resource_type`, `format`, `width`, `height`, `bytes`: Metadata kỹ thuật.
- `folder`, `tags`, `context`: Quản lý nâng cao.
- `used_in`, `used_in_id`: Liên kết file với đối tượng sử dụng (news, user, ...).

Bạn có thể mở rộng thêm trường nếu cần (ví dụ: trạng thái, version, ...).


## Ý nghĩa các bảng trong CSDL

### 1. roles
Chứa các vai trò (role) của hệ thống, ví dụ: admin, user, editor. Mỗi vai trò có mã code và mô tả.

### 2. permissions
Chứa các quyền (permission) cụ thể, ví dụ: xem, sửa, xóa, tạo dữ liệu.

### 3. role_permissions
Bảng liên kết nhiều-nhiều giữa roles và permissions, xác định vai trò nào có quyền gì.

### 4. users
Chứa thông tin người dùng: tên, username, email, số điện thoại, mật khẩu, trạng thái hoạt động, thời gian tạo/cập nhật, v.v.

### 5. user_roles
Bảng liên kết nhiều-nhiều giữa users và roles, xác định người dùng thuộc vai trò nào.

### 6. categories
Chứa danh mục tin tức hoặc nội dung, gồm tên và slug.

### 7. news
Chứa bài viết/tin tức: tiêu đề, nội dung, trạng thái, tác giả, danh mục, ngày xuất bản, v.v.

### 8. news_views
Lưu lượt xem từng bài viết, gồm id bài viết, IP, user agent, thời gian xem.

### 9. news_view_stats
Thống kê tổng số lượt xem cho từng bài viết.

### 10. regions
Vùng/miền địa lý cho trường học, gồm tên và slug.

### 11. school_types
Các loại trường học (ví dụ: nhật ngữ, senmon có nhật ngữ), gồm tên và slug.

### 12. schools
Thông tin trường học: tên, slug, vị trí, học phí, loại trường, vùng, trạng thái, logo, đánh giá, v.v.

### 13. school_reviews
Đánh giá của học sinh về trường: tên học sinh, quốc tịch, khóa học, điểm đánh giá, nội dung, v.v.

### 14. faqs
Câu hỏi thường gặp, có thể liên kết với trường học.

### 15. contacts
Thông tin liên hệ từ khách hàng: tên, email, số điện thoại, nội dung, trạng thái, phương thức liên hệ, người phụ trách, v.v.

### 16. contact_notes
Ghi chú của nhân viên về từng liên hệ.

### 17. static_pages
Các trang tĩnh (giới thiệu, điều khoản, v.v.), gồm tiêu đề, slug, trạng thái, loại trang.

### 18. page_contents
Nội dung chi tiết của từng trang tĩnh.

### 19. settings
Cấu hình hệ thống dạng key-value.

### 20. notifications (UX (hiển thị cho user))
Thông báo gửi cho user hoặc role, gồm loại thông báo, tiêu đề, nội dung, trạng thái đã đọc, v.v.

### 21. notification_settings
Cài đặt nhận thông báo của từng user hoặc role cho từng loại thông báo.

### 22. audit_logs (Tracking (ghi lại lịch sử))

* ✔️ thay đổi dữ liệu
* ✔️ ảnh hưởng hệ thống
* ✔️ cần trace

Lưu lại các hành động quan trọng (audit) của user: hành động gì, đối tượng nào, dữ liệu liên quan, IP, user agent, v.v.

### 23. activity_logs

* ✔️ view page
* ✔️ click
* ✔️ login/logout

Lưu lại các hoạt động của user (giống audit_logs nhưng có thể dùng cho mục đích tracking thông thường hơn).

### 24. password_reset_tokens
Token dùng để reset mật khẩu, liên kết với user, có thời hạn và trạng thái đã dùng/chưa dùng.

### 25. user_sessions
Lưu thông tin phiên đăng nhập của user, gồm refresh token, IP, user agent, thời gian hết hạn.

### 26. files
Lưu thông tin file upload: user upload, public id, url, loại file, kích thước, thư mục, tag, v.v.

## Chỉnh sửa DB

### Thêm giá trị mới cho enum

```SQL
ALTER TYPE audit_action_enum 
ADD VALUE 'reset_password';

```

### Thêm giá trị mới cho enum vào vị trí chỉ định

```SQL
ALTER TYPE audit_action_enum 
ADD VALUE 'reset_password' AFTER 'refresh_token';

```

### Xóa toàn bộ dữ liệu bảng + reset ID (sequence) + các thông tin liên quan tới bảng

```SQL
-- role_permissions cũng bị xóa khi xóa permissions
TRUNCATE TABLE permissions RESTART IDENTITY CASCADE;
```

### Thêm trường vào bảng có sẵn

```SQL
ALTER TABLE users
ADD COLUMN zalo VARCHAR(100),       -- link zalo
ADD COLUMN fb VARCHAR(200);         -- link fb

-- Sau đó mới thêm unique
ALTER TABLE users
ADD CONSTRAINT users_zalo_unique UNIQUE (zalo);

ALTER TABLE users
ADD CONSTRAINT users_fb_unique UNIQUE (fb);
```

## Modules logics

- Controller (ví dụ: notification.controller.js hoặc notification.routes.js):

Chỉ xử lý HTTP request/response (nhận req, trả về res).
Nhận dữ liệu từ client, gọi service để thực hiện nghiệp vụ, trả kết quả về client.
Không chứa logic nghiệp vụ phức tạp, không thao tác DB trực tiếp.

- Service (ví dụ: notification.service.js):

Chứa logic nghiệp vụ (business logic) của ứng dụng.
Xử lý các quy trình, phối hợp nhiều thao tác, validate, gọi repository để thao tác DB.
Không liên quan đến HTTP request/response.
Có thể tái sử dụng ở nhiều controller hoặc các service khác.

- Repository

Chỉ chứa các hàm thao tác trực tiếp với database/model Notification (CRUD, query, bulk insert, update, delete...).
Ví dụ: createNotification, findNotificationsByUser, markNotificationAsRead, bulkCreateNotifications...

* Routes = gọi controller
* Controller = giao tiếp với client (HTTP), gọi service.
* Service = xử lý nghiệp vụ, gọi repository.
* Repository = thao tác DB thuần, gọi model.