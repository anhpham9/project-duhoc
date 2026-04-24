-- Bạn chạy file migration này bằng lệnh psql của PostgreSQL:

-- Đảm bảo đã tạo database và có user phù hợp.
-- Mở terminal, cd vào thư mục backend.
-- Chạy lệnh sau (thay đổi user/db nếu cần):
-- psql -U <db_user> -d <db_name> -f scripts/migrations/init_schema.sql
-- Ví dụ:
-- psql -U postgres -d duhocnb -f scripts/migrations/init_schema.sql

-- =========================================================
-- ENUMS (RUN FIRST)
-- =========================================================

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
            'system',        -- thông báo hệ thống
            'contact',       -- liên quan contact (lead mới, cập nhật)
            'news',          -- bài viết
            'schools',       -- trường học
            'user',          -- user (login, tạo tài khoản,...)
            'role',          -- RBAC thay đổi
            'file',          -- upload file
            'warning',       -- cảnh báo
            'success',       -- thành công
            'error'          -- lỗi
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
            'assign',           -- RBAC
            'upload',
            'download',
            'approve',          -- workflow
            'reject'
        );
    END IF;

END$$;

-- ======================== TRIGGERS ========================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ======================== ROLES ========================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- ======================== PERMISSIONS ========================
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
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
    id BIGSERIAL PRIMARY KEY,
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
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================== NEWS ========================
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
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
    id SERIAL PRIMARY KEY,
    news_id INTEGER REFERENCES news(id) ON DELETE CASCADE,
    ip_address VARCHAR(50),
    user_agent TEXT,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_news_views_news_id ON news_views(news_id);

-- ======================== NEWS_VIEW_STATS ========================
CREATE TABLE IF NOT EXISTS news_view_stats (
    news_id INTEGER PRIMARY KEY REFERENCES news(id) ON DELETE CASCADE,
    view_count INTEGER DEFAULT 0
);

-- ======================== REGIONS ========================
CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- ======================== SCHOOL_TYPES ========================
CREATE TABLE IF NOT EXISTS school_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- ======================== SCHOOLS ========================
CREATE TABLE IF NOT EXISTS schools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    location TEXT,
    tuition_per_year INTEGER,
    class_size INTEGER,
    visa_success_rate INTEGER,
    features JSONB,
    region_id INTEGER REFERENCES regions(id) ON DELETE SET NULL,
    type_id INTEGER REFERENCES school_types(id) ON DELETE SET NULL,
    status school_status_enum DEFAULT 'pending',
    logo_url TEXT,
    thumbnail_url TEXT,
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
    id SERIAL PRIMARY KEY,
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    student_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    nationality VARCHAR(100),
    course_period VARCHAR(50),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reviews_school ON school_reviews(school_id);

-- ======================== FAQS ========================
CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    type faq_type_enum NOT NULL,
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_faqs_school ON faqs(school_id);

-- ======================== CONTACTS ========================
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
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
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_contact_notes_contact ON contact_notes(contact_id);

-- ======================== STATIC_PAGES ========================
CREATE TABLE IF NOT EXISTS static_pages (
    id SERIAL PRIMARY KEY,
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
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    type notification_type_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_role ON notifications(role_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ======================== NOTIFICATION_SETTINGS ========================
CREATE TABLE IF NOT EXISTS notification_settings (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    type notification_type_enum NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE notification_settings
ADD CONSTRAINT check_user_or_role
CHECK (
    (user_id IS NOT NULL AND role_id IS NULL)
    OR
    (user_id IS NULL AND role_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user ON notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_role ON notification_settings(role_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_type ON notification_settings(type);

CREATE TRIGGER trigger_notification_settings_updated_at
BEFORE UPDATE ON notification_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ======================== AUDIT_LOGS ========================
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action audit_action_enum NOT NULL,
    object_type VARCHAR(50),
    object_id BIGINT,
    data JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_object ON audit_logs(object_type, object_id);

-- ======================== PASSWORD_RESET_TOKENS ========================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL, -- token sau khi hash 
    expired_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id);

-- ======================== USER_SESSIONS ========================
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
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
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    public_id VARCHAR(255) UNIQUE NOT NULL,
    url TEXT NOT NULL,
    resource_type VARCHAR(50),
    format VARCHAR(20),
    width INTEGER,
    height INTEGER,
    bytes BIGINT,
    folder VARCHAR(255),
    tags TEXT[],
    context JSONB,
    used_in VARCHAR(50),
    used_in_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_files_user ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_used_in ON files(used_in, used_in_id);

-- ======================== ACTIVITY_LOGS ========================
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action audit_action_enum NOT NULL,
    object_type VARCHAR(50),
    object_id BIGINT,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);