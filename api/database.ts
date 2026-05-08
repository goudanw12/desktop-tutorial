import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dataDir = path.join(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'social.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    phone TEXT,
    avatar TEXT,
    bio TEXT DEFAULT '',
    is_verified INTEGER DEFAULT 0,
    is_private INTEGER DEFAULT 0,
    theme TEXT DEFAULT 'light',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL DEFAULT '',
    images TEXT DEFAULT '[]',
    video_url TEXT,
    tags TEXT DEFAULT '[]',
    location TEXT,
    visibility TEXT DEFAULT 'public',
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    like_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS likes (
    id TEXT PRIMARY KEY,
    post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
    comment_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'post',
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(post_id, user_id, type),
    UNIQUE(comment_id, user_id, type)
  );

  CREATE TABLE IF NOT EXISTS follows (
    id TEXT PRIMARY KEY,
    follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(follower_id, following_id)
  );

  CREATE TABLE IF NOT EXISTS bookmarks (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(post_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'private',
    name TEXT,
    avatar TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS chat_members (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TEXT DEFAULT (datetime('now')),
    UNIQUE(chat_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'text',
    content TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS chat_hide (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(chat_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS verifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    real_name TEXT NOT NULL,
    id_number TEXT NOT NULL,
    id_type TEXT DEFAULT 'id_card',
    status TEXT DEFAULT 'pending',
    reason TEXT,
    submitted_at TEXT DEFAULT (datetime('now')),
    reviewed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
    content TEXT DEFAULT '',
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS stories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'image',
    media_url TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL
  );
`)

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
  CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
  CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
  CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
  CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
  CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
  CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
  CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
  CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
  CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);
  CREATE INDEX IF NOT EXISTS idx_chat_hide_chat_id ON chat_hide(chat_id);
  CREATE INDEX IF NOT EXISTS idx_chat_hide_user_id ON chat_hide(user_id);
`)

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }

if (userCount.count === 0) {
  const passwordHash = bcrypt.hashSync('123456', 10)

  const users = [
    { id: crypto.randomUUID(), username: 'alice_wang', email: 'alice@example.com', password_hash: passwordHash, phone: '13800000001', avatar: 'https://picsum.photos/seed/alice/200/200', bio: '热爱生活，喜欢摄影和旅行 📸✈️', is_verified: 1, is_private: 0, theme: 'light' },
    { id: crypto.randomUUID(), username: 'bob_zhang', email: 'bob@example.com', password_hash: passwordHash, phone: '13800000002', avatar: 'https://picsum.photos/seed/bob/200/200', bio: '全栈开发者，开源爱好者 💻', is_verified: 1, is_private: 0, theme: 'dark' },
    { id: crypto.randomUUID(), username: 'charlie_li', email: 'charlie@example.com', password_hash: passwordHash, phone: '13800000003', avatar: 'https://picsum.photos/seed/charlie/200/200', bio: '音乐人 | 吉他手 🎸', is_verified: 0, is_private: 0, theme: 'light' },
    { id: crypto.randomUUID(), username: 'diana_chen', email: 'diana@example.com', password_hash: passwordHash, phone: '13800000004', avatar: 'https://picsum.photos/seed/diana/200/200', bio: '美食博主，分享生活中的美味 🍜', is_verified: 1, is_private: 0, theme: 'light' },
    { id: crypto.randomUUID(), username: 'evan_liu', email: 'evan@example.com', password_hash: passwordHash, phone: '13800000005', avatar: 'https://picsum.photos/seed/evan/200/200', bio: '健身达人 | 运动就是生活 💪', is_verified: 0, is_private: 1, theme: 'dark' },
  ]

  const insertUser = db.prepare(`
    INSERT INTO users (id, username, email, password_hash, phone, avatar, bio, is_verified, is_private, theme)
    VALUES (@id, @username, @email, @password_hash, @phone, @avatar, @bio, @is_verified, @is_private, @theme)
  `)

  const insertPost = db.prepare(`
    INSERT INTO posts (id, user_id, content, images, tags, location, visibility, like_count, comment_count)
    VALUES (@id, @user_id, @content, @images, @tags, @location, @visibility, @like_count, @comment_count)
  `)

  const insertComment = db.prepare(`
    INSERT INTO comments (id, post_id, user_id, content, like_count)
    VALUES (@id, @post_id, @user_id, @content, @like_count)
  `)

  const insertLike = db.prepare(`
    INSERT INTO likes (id, post_id, comment_id, user_id, type)
    VALUES (@id, @post_id, @comment_id, @user_id, @type)
  `)

  const insertFollow = db.prepare(`
    INSERT INTO follows (id, follower_id, following_id)
    VALUES (@id, @follower_id, @following_id)
  `)

  const insertBookmark = db.prepare(`
    INSERT INTO bookmarks (id, post_id, user_id)
    VALUES (@id, @post_id, @user_id)
  `)

  const insertChat = db.prepare(`
    INSERT INTO chats (id, type, name, avatar)
    VALUES (@id, @type, @name, @avatar)
  `)

  const insertChatMember = db.prepare(`
    INSERT INTO chat_members (id, chat_id, user_id, role)
    VALUES (@id, @chat_id, @user_id, @role)
  `)

  const insertMessage = db.prepare(`
    INSERT INTO messages (id, chat_id, sender_id, type, content, is_read)
    VALUES (@id, @chat_id, @sender_id, @type, @content, @is_read)
  `)

  const insertNotification = db.prepare(`
    INSERT INTO notifications (id, user_id, from_user_id, type, post_id, content, is_read)
    VALUES (@id, @user_id, @from_user_id, @type, @post_id, @content, @is_read)
  `)

  const insertStory = db.prepare(`
    INSERT INTO stories (id, user_id, type, media_url, expires_at)
    VALUES (@id, @user_id, @type, @media_url, @expires_at)
  `)

  const transaction = db.transaction(() => {
    for (const user of users) {
      insertUser.run(user)
    }

    const [alice, bob, charlie, diana, evan] = users

    const posts = [
      { id: crypto.randomUUID(), user_id: alice.id, content: '今天去了西湖，风景太美了！🌅', images: JSON.stringify(['https://picsum.photos/seed/post1a/600/600', 'https://picsum.photos/seed/post1b/600/600']), tags: JSON.stringify(['旅行', '西湖']), location: '杭州·西湖', visibility: 'public', like_count: 12, comment_count: 3 },
      { id: crypto.randomUUID(), user_id: alice.id, content: '分享一张日落照片，每一天都值得记录 🌇', images: JSON.stringify(['https://picsum.photos/seed/post2a/600/600']), tags: JSON.stringify(['摄影', '日落']), location: '上海', visibility: 'public', like_count: 8, comment_count: 2 },
      { id: crypto.randomUUID(), user_id: alice.id, content: '周末的咖啡时光 ☕', images: JSON.stringify(['https://picsum.photos/seed/post3a/600/600', 'https://picsum.photos/seed/post3b/600/600', 'https://picsum.photos/seed/post3c/600/600']), tags: JSON.stringify(['咖啡', '周末']), location: '杭州', visibility: 'public', like_count: 5, comment_count: 1 },
      { id: crypto.randomUUID(), user_id: bob.id, content: '终于把新功能上线了！React 19 的新特性真的太棒了 🚀', images: JSON.stringify([]), tags: JSON.stringify(['编程', 'React']), location: '北京', visibility: 'public', like_count: 15, comment_count: 4 },
      { id: crypto.randomUUID(), user_id: bob.id, content: '开源项目突破 1000 star！感谢所有贡献者 🎉', images: JSON.stringify([]), tags: JSON.stringify(['开源', 'GitHub']), location: null, visibility: 'public', like_count: 20, comment_count: 6 },
      { id: crypto.randomUUID(), user_id: bob.id, content: 'TypeScript 5.4 发布了，新的类型推断功能很强大', images: JSON.stringify([]), tags: JSON.stringify(['TypeScript', '编程']), location: null, visibility: 'public', like_count: 10, comment_count: 2 },
      { id: crypto.randomUUID(), user_id: bob.id, content: '分享一个 VS Code 插件推荐，提升开发效率 200%', images: JSON.stringify(['https://picsum.photos/seed/post7a/600/600']), tags: JSON.stringify(['工具', 'VSCode']), location: null, visibility: 'public', like_count: 7, comment_count: 1 },
      { id: crypto.randomUUID(), user_id: charlie.id, content: '新歌录制完成，等混音中 🎵', images: JSON.stringify(['https://picsum.photos/seed/post8a/600/600']), tags: JSON.stringify(['音乐', '原创']), location: '成都', visibility: 'public', like_count: 18, comment_count: 5 },
      { id: crypto.randomUUID(), user_id: charlie.id, content: '今晚的演出太嗨了！感谢所有来的朋友们 🎤', images: JSON.stringify(['https://picsum.photos/seed/post9a/600/600', 'https://picsum.photos/seed/post9b/600/600']), tags: JSON.stringify(['演出', '现场']), location: '成都·小酒馆', visibility: 'public', like_count: 25, comment_count: 8 },
      { id: crypto.randomUUID(), user_id: charlie.id, content: '练琴日常，坚持就是胜利 💪🎸', images: JSON.stringify([]), tags: JSON.stringify(['吉他', '练习']), location: null, visibility: 'public', like_count: 6, comment_count: 1 },
      { id: crypto.randomUUID(), user_id: diana.id, content: '自制意面，简单又美味！食谱在评论区 🍝', images: JSON.stringify(['https://picsum.photos/seed/post11a/600/600', 'https://picsum.photos/seed/post11b/600/600']), tags: JSON.stringify(['美食', '意面', '食谱']), location: '广州', visibility: 'public', like_count: 30, comment_count: 10 },
      { id: crypto.randomUUID(), user_id: diana.id, content: '探店｜这家日料真的绝了！三文鱼新鲜到哭 🍣', images: JSON.stringify(['https://picsum.photos/seed/post12a/600/600', 'https://picsum.photos/seed/post12b/600/600', 'https://picsum.photos/seed/post12c/600/600']), tags: JSON.stringify(['探店', '日料', '美食']), location: '广州·天河区', visibility: 'public', like_count: 22, comment_count: 7 },
      { id: crypto.randomUUID(), user_id: diana.id, content: '早餐打卡，元气满满的一天从早餐开始 🥐', images: JSON.stringify(['https://picsum.photos/seed/post13a/600/600']), tags: JSON.stringify(['早餐', '美食']), location: '广州', visibility: 'public', like_count: 14, comment_count: 3 },
      { id: crypto.randomUUID(), user_id: diana.id, content: '烘焙新手的第一蛋糕，虽然丑但很好吃 😂', images: JSON.stringify(['https://picsum.photos/seed/post14a/600/600', 'https://picsum.photos/seed/post14b/600/600']), tags: JSON.stringify(['烘焙', '蛋糕']), location: null, visibility: 'public', like_count: 9, comment_count: 4 },
      { id: crypto.randomUUID(), user_id: evan.id, content: '今日训练打卡：胸+三头 💪🔥', images: JSON.stringify([]), tags: JSON.stringify(['健身', '打卡']), location: '深圳·健身房', visibility: 'public', like_count: 11, comment_count: 2 },
      { id: crypto.randomUUID(), user_id: evan.id, content: '晨跑 10km 完成，天气真好 🏃‍♂️', images: JSON.stringify(['https://picsum.photos/seed/post16a/600/600']), tags: JSON.stringify(['跑步', '晨跑']), location: '深圳·深圳湾', visibility: 'public', like_count: 16, comment_count: 3 },
      { id: crypto.randomUUID(), user_id: evan.id, content: '蛋白粉测评，这款性价比最高！', images: JSON.stringify([]), tags: JSON.stringify(['健身', '补剂']), location: null, visibility: 'public', like_count: 8, comment_count: 2 },
      { id: crypto.randomUUID(), user_id: alice.id, content: '读书笔记：《人类简史》真的让人深思 📚', images: JSON.stringify([]), tags: JSON.stringify(['读书', '笔记']), location: null, visibility: 'public', like_count: 4, comment_count: 1 },
      { id: crypto.randomUUID(), user_id: bob.id, content: '周末撸猫，程序员也需要放松 🐱', images: JSON.stringify(['https://picsum.photos/seed/post19a/600/600', 'https://picsum.photos/seed/post19b/600/600']), tags: JSON.stringify(['猫', '周末']), location: '北京', visibility: 'public', like_count: 13, comment_count: 3 },
      { id: crypto.randomUUID(), user_id: diana.id, content: '火锅季来了！你最喜欢什么锅底？🍲', images: JSON.stringify(['https://picsum.photos/seed/post20a/600/600']), tags: JSON.stringify(['火锅', '美食', '投票']), location: '重庆', visibility: 'public', like_count: 19, comment_count: 9 },
    ]

    for (const post of posts) {
      insertPost.run(post)
    }

    const comments = [
      { id: crypto.randomUUID(), post_id: posts[0].id, user_id: bob.id, content: '西湖确实很美！下次一起去', like_count: 2 },
      { id: crypto.randomUUID(), post_id: posts[0].id, user_id: charlie.id, content: '照片拍得真好！用的什么相机？', like_count: 1 },
      { id: crypto.randomUUID(), post_id: posts[0].id, user_id: diana.id, content: '杭州的秋天最美了 🍂', like_count: 0 },
      { id: crypto.randomUUID(), post_id: posts[3].id, user_id: alice.id, content: 'React 19 的 Server Components 确实好用', like_count: 3 },
      { id: crypto.randomUUID(), post_id: posts[3].id, user_id: evan.id, content: '学到了！感谢分享', like_count: 1 },
      { id: crypto.randomUUID(), post_id: posts[3].id, user_id: charlie.id, content: '虽然看不懂但觉得很厉害 😄', like_count: 2 },
      { id: crypto.randomUUID(), post_id: posts[3].id, user_id: diana.id, content: '程序员大佬！', like_count: 0 },
      { id: crypto.randomUUID(), post_id: posts[4].id, user_id: alice.id, content: '恭喜！🎉🎉🎉', like_count: 2 },
      { id: crypto.randomUUID(), post_id: posts[4].id, user_id: charlie.id, content: 'star 1000 只是开始！', like_count: 1 },
      { id: crypto.randomUUID(), post_id: posts[7].id, user_id: alice.id, content: '期待新歌！', like_count: 3 },
      { id: crypto.randomUUID(), post_id: posts[7].id, user_id: diana.id, content: '什么时候发布？等不及了', like_count: 2 },
      { id: crypto.randomUUID(), post_id: posts[7].id, user_id: evan.id, content: '音乐人加油！', like_count: 1 },
      { id: crypto.randomUUID(), post_id: posts[7].id, user_id: bob.id, content: '一定要听！', like_count: 0 },
      { id: crypto.randomUUID(), post_id: posts[7].id, user_id: charlie.id, content: '谢谢大家支持！', like_count: 5 },
      { id: crypto.randomUUID(), post_id: posts[10].id, user_id: alice.id, content: '食谱求分享！', like_count: 4 },
      { id: crypto.randomUUID(), post_id: posts[10].id, user_id: bob.id, content: '看起来好好吃', like_count: 2 },
      { id: crypto.randomUUID(), post_id: posts[10].id, user_id: evan.id, content: '碳水炸弹但值得', like_count: 1 },
      { id: crypto.randomUUID(), post_id: posts[11].id, user_id: alice.id, content: '这家店在哪里？想去！', like_count: 3 },
      { id: crypto.randomUUID(), post_id: posts[11].id, user_id: charlie.id, content: '三文鱼爱好者路过', like_count: 1 },
      { id: crypto.randomUUID(), post_id: posts[14].id, user_id: diana.id, content: '健身达人！', like_count: 2 },
    ]

    for (const comment of comments) {
      insertComment.run(comment)
    }

    const postLikes = [
      { id: crypto.randomUUID(), post_id: posts[0].id, comment_id: null, user_id: bob.id, type: 'post' },
      { id: crypto.randomUUID(), post_id: posts[0].id, comment_id: null, user_id: charlie.id, type: 'post' },
      { id: crypto.randomUUID(), post_id: posts[0].id, comment_id: null, user_id: diana.id, type: 'post' },
      { id: crypto.randomUUID(), post_id: posts[1].id, comment_id: null, user_id: bob.id, type: 'post' },
      { id: crypto.randomUUID(), post_id: posts[3].id, comment_id: null, user_id: alice.id, type: 'post' },
      { id: crypto.randomUUID(), post_id: posts[3].id, comment_id: null, user_id: evan.id, type: 'post' },
      { id: crypto.randomUUID(), post_id: posts[4].id, comment_id: null, user_id: alice.id, type: 'post' },
      { id: crypto.randomUUID(), post_id: posts[4].id, comment_id: null, user_id: charlie.id, type: 'post' },
      { id: crypto.randomUUID(), post_id: posts[4].id, comment_id: null, user_id: diana.id, type: 'post' },
      { id: crypto.randomUUID(), post_id: posts[7].id, comment_id: null, user_id: alice.id, type: 'post' },
      { id: crypto.randomUUID(), post_id: posts[7].id, comment_id: null, user_id: diana.id, type: 'post' },
      { id: crypto.randomUUID(), post_id: posts[8].id, comment_id: null, user_id: bob.id, type: 'post' },
      { id: crypto.randomUUID(), post_id: posts[8].id, comment_id: null, user_id: diana.id, type: 'post' },
      { id: crypto.randomUUID(), post_id: posts[8].id, comment_id: null, user_id: evan.id, type: 'post' },
      { id: crypto.randomUUID(), post_id: posts[10].id, comment_id: null, user_id: bob.id, type: 'post' },
      { id: crypto.randomUUID(), post_id: posts[10].id, comment_id: null, user_id: evan.id, type: 'post' },
      { id: crypto.randomUUID(), post_id: posts[11].id, comment_id: null, user_id: alice.id, type: 'post' },
      { id: crypto.randomUUID(), post_id: posts[14].id, comment_id: null, user_id: diana.id, type: 'post' },
      { id: crypto.randomUUID(), post_id: posts[15].id, comment_id: null, user_id: alice.id, type: 'post' },
      { id: crypto.randomUUID(), post_id: posts[15].id, comment_id: null, user_id: bob.id, type: 'post' },
    ]

    const commentLikes = [
      { id: crypto.randomUUID(), post_id: null, comment_id: comments[0].id, user_id: alice.id, type: 'comment' },
      { id: crypto.randomUUID(), post_id: null, comment_id: comments[3].id, user_id: bob.id, type: 'comment' },
      { id: crypto.randomUUID(), post_id: null, comment_id: comments[7].id, user_id: charlie.id, type: 'comment' },
    ]

    for (const like of [...postLikes, ...commentLikes]) {
      insertLike.run(like)
    }

    const follows = [
      { id: crypto.randomUUID(), follower_id: alice.id, following_id: bob.id },
      { id: crypto.randomUUID(), follower_id: alice.id, following_id: charlie.id },
      { id: crypto.randomUUID(), follower_id: alice.id, following_id: diana.id },
      { id: crypto.randomUUID(), follower_id: bob.id, following_id: alice.id },
      { id: crypto.randomUUID(), follower_id: bob.id, following_id: diana.id },
      { id: crypto.randomUUID(), follower_id: charlie.id, following_id: alice.id },
      { id: crypto.randomUUID(), follower_id: charlie.id, following_id: bob.id },
      { id: crypto.randomUUID(), follower_id: diana.id, following_id: alice.id },
      { id: crypto.randomUUID(), follower_id: diana.id, following_id: bob.id },
      { id: crypto.randomUUID(), follower_id: diana.id, following_id: charlie.id },
      { id: crypto.randomUUID(), follower_id: evan.id, following_id: alice.id },
      { id: crypto.randomUUID(), follower_id: evan.id, following_id: bob.id },
    ]

    for (const follow of follows) {
      insertFollow.run(follow)
    }

    const bookmarks = [
      { id: crypto.randomUUID(), post_id: posts[0].id, user_id: bob.id },
      { id: crypto.randomUUID(), post_id: posts[3].id, user_id: alice.id },
      { id: crypto.randomUUID(), post_id: posts[10].id, user_id: evan.id },
      { id: crypto.randomUUID(), post_id: posts[4].id, user_id: charlie.id },
      { id: crypto.randomUUID(), post_id: posts[11].id, user_id: alice.id },
    ]

    for (const bookmark of bookmarks) {
      insertBookmark.run(bookmark)
    }

    const chat1Id = crypto.randomUUID()
    const chat2Id = crypto.randomUUID()
    const chat3Id = crypto.randomUUID()

    insertChat.run({ id: chat1Id, type: 'private', name: null, avatar: null })
    insertChat.run({ id: chat2Id, type: 'private', name: null, avatar: null })
    insertChat.run({ id: chat3Id, type: 'group', name: '美食交流群', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=food' })

    insertChatMember.run({ id: crypto.randomUUID(), chat_id: chat1Id, user_id: alice.id, role: 'member' })
    insertChatMember.run({ id: crypto.randomUUID(), chat_id: chat1Id, user_id: bob.id, role: 'member' })
    insertChatMember.run({ id: crypto.randomUUID(), chat_id: chat2Id, user_id: alice.id, role: 'member' })
    insertChatMember.run({ id: crypto.randomUUID(), chat_id: chat2Id, user_id: diana.id, role: 'member' })
    insertChatMember.run({ id: crypto.randomUUID(), chat_id: chat3Id, user_id: alice.id, role: 'admin' })
    insertChatMember.run({ id: crypto.randomUUID(), chat_id: chat3Id, user_id: diana.id, role: 'member' })
    insertChatMember.run({ id: crypto.randomUUID(), chat_id: chat3Id, user_id: charlie.id, role: 'member' })

    const messages = [
      { id: crypto.randomUUID(), chat_id: chat1Id, sender_id: alice.id, type: 'text', content: 'Bob，你的新项目看起来很棒！', is_read: 1 },
      { id: crypto.randomUUID(), chat_id: chat1Id, sender_id: bob.id, type: 'text', content: '谢谢！有空一起讨论技术', is_read: 1 },
      { id: crypto.randomUUID(), chat_id: chat1Id, sender_id: alice.id, type: 'text', content: '好的，周末有空吗？', is_read: 0 },
      { id: crypto.randomUUID(), chat_id: chat2Id, sender_id: diana.id, type: 'text', content: 'Alice，你试过那家新开的甜品店吗？', is_read: 1 },
      { id: crypto.randomUUID(), chat_id: chat2Id, sender_id: alice.id, type: 'text', content: '还没呢，好吃吗？', is_read: 1 },
      { id: crypto.randomUUID(), chat_id: chat2Id, sender_id: diana.id, type: 'text', content: '超好吃！下次一起去', is_read: 0 },
      { id: crypto.randomUUID(), chat_id: chat3Id, sender_id: diana.id, type: 'text', content: '大家好！今天做了一道新菜', is_read: 1 },
      { id: crypto.randomUUID(), chat_id: chat3Id, sender_id: alice.id, type: 'text', content: '看起来好好吃！', is_read: 1 },
      { id: crypto.randomUUID(), chat_id: chat3Id, sender_id: charlie.id, type: 'text', content: '食谱分享一下！', is_read: 0 },
    ]

    for (const message of messages) {
      insertMessage.run(message)
    }

    const notifications = [
      { id: crypto.randomUUID(), user_id: alice.id, from_user_id: bob.id, type: 'like', post_id: posts[0].id, content: '赞了你的动态', is_read: 1 },
      { id: crypto.randomUUID(), user_id: alice.id, from_user_id: charlie.id, type: 'comment', post_id: posts[0].id, content: '评论了你的动态', is_read: 1 },
      { id: crypto.randomUUID(), user_id: alice.id, from_user_id: diana.id, type: 'follow', post_id: null, content: '关注了你', is_read: 0 },
      { id: crypto.randomUUID(), user_id: bob.id, from_user_id: alice.id, type: 'like', post_id: posts[3].id, content: '赞了你的动态', is_read: 1 },
      { id: crypto.randomUUID(), user_id: bob.id, from_user_id: charlie.id, type: 'follow', post_id: null, content: '关注了你', is_read: 0 },
      { id: crypto.randomUUID(), user_id: charlie.id, from_user_id: alice.id, type: 'like', post_id: posts[7].id, content: '赞了你的动态', is_read: 1 },
      { id: crypto.randomUUID(), user_id: charlie.id, from_user_id: diana.id, type: 'follow', post_id: null, content: '关注了你', is_read: 0 },
      { id: crypto.randomUUID(), user_id: diana.id, from_user_id: bob.id, type: 'like', post_id: posts[10].id, content: '赞了你的动态', is_read: 1 },
      { id: crypto.randomUUID(), user_id: diana.id, from_user_id: evan.id, type: 'comment', post_id: posts[10].id, content: '评论了你的动态', is_read: 0 },
      { id: crypto.randomUUID(), user_id: evan.id, from_user_id: alice.id, type: 'like', post_id: posts[14].id, content: '赞了你的动态', is_read: 0 },
    ]

    for (const notification of notifications) {
      insertNotification.run(notification)
    }

    const now = new Date()
    const stories = [
      { id: crypto.randomUUID(), user_id: alice.id, type: 'image', media_url: 'https://picsum.photos/seed/story1/400/700', expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() },
      { id: crypto.randomUUID(), user_id: alice.id, type: 'image', media_url: 'https://picsum.photos/seed/story2/400/700', expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() },
      { id: crypto.randomUUID(), user_id: bob.id, type: 'image', media_url: 'https://picsum.photos/seed/story3/400/700', expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() },
      { id: crypto.randomUUID(), user_id: bob.id, type: 'image', media_url: 'https://picsum.photos/seed/story3b/400/700', expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() },
      { id: crypto.randomUUID(), user_id: charlie.id, type: 'image', media_url: 'https://picsum.photos/seed/story4/400/700', expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() },
      { id: crypto.randomUUID(), user_id: diana.id, type: 'image', media_url: 'https://picsum.photos/seed/story5/400/700', expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() },
      { id: crypto.randomUUID(), user_id: diana.id, type: 'image', media_url: 'https://picsum.photos/seed/story6/400/700', expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() },
      { id: crypto.randomUUID(), user_id: evan.id, type: 'image', media_url: 'https://picsum.photos/seed/story7/400/700', expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() },
      { id: crypto.randomUUID(), user_id: evan.id, type: 'image', media_url: 'https://picsum.photos/seed/story7b/400/700', expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() },
    ]

    for (const story of stories) {
      insertStory.run(story)
    }
  })

  transaction()
  console.log('Database seeded successfully')
}

export default db
