-- 为users表添加nickname列
ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname VARCHAR(50);

-- 将现有用户的nickname设置为与fullName相同的值（如果fullName存在）
UPDATE users SET nickname = full_name WHERE nickname IS NULL AND full_name IS NOT NULL;

-- 将仍为空的nickname设置为与username相同的值
UPDATE users SET nickname = username WHERE nickname IS NULL; 