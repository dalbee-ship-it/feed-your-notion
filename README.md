# 🍽️ Feed Your Notion

An OpenClaw skill that automatically saves links to your Notion database with AI-generated summaries.

**Drop a link → Get a summary → Fed to Notion. Automatically.**

## Features

- **Auto-detect URLs** in your Telegram DM
- **AI-powered summarization** of articles, tweets, and posts
- **Notion DB integration** with structured properties (title, source, summary, tags)
- **X/Twitter support** via fxtwitter API (no API key needed!)
- **Daily digest** via cron job (7:30 AM your timezone)
- **Source detection**: Web, X, YouTube, Instagram, Threads, Reddit

## Quick Start

### 1. Set up Notion

#### Create an integration
1. Go to [My Integrations](https://www.notion.so/my-integrations)
2. Click "New integration" → name it whatever you want
3. Copy the API key (starts with `ntn_`)

#### Create the database (1-click with Notion AI)
1. Open any Notion page
2. Click the **Notion AI button** (bottom-right ✨ icon)
3. Paste this prompt:

```
Create an inline database called "Knowledge Vault" with the following properties:
- title (title): Article title
- url (url): Original link
- source (select, options: Web, Youtube, Instagram, X, threads, reddit): Where the link came from
- summary (rich_text): AI-generated summary
- full_text (rich_text): Full article text
- memo (rich_text): User comments
```

4. Done! Now share the DB with your integration: click ⋯ → **Add connections** → select your integration

#### Get your Database ID
The DB ID is in the URL when you open the database:
```
https://www.notion.so/YOUR_WORKSPACE/[DATABASE_ID]?v=...
                                      ^^^^^^^^^^^^
```

### 2. Install

```bash
# In your OpenClaw workspace
cd skills
git clone https://github.com/dalbee-ship-it/feed-your-notion.git

# Install dependencies
cd feed-your-notion
npm install @notionhq/client

# Set environment variables
cp .env.example .env
# Edit .env with your Notion API key and DB ID
```

### 3. Use

Just send a URL to your OpenClaw agent. It will:
1. Fetch the content
2. Generate a summary
3. Save to your Notion DB
4. Confirm with a one-line summary

### Manual save

```bash
NOTION_API_KEY=your_key NOTION_DB_ID=your_db_id \
node scripts/save-to-notion.js \
  --title "Article Title" \
  --url "https://example.com" \
  --source "Web" \
  --summary "Brief summary here"
```

## X/Twitter Support

Uses the free [fxtwitter API](https://github.com/FixTweet/FxTwitter) — no X Developer account needed:

```bash
curl -s "https://api.fxtwitter.com/i/status/{TWEET_ID}" | jq '.tweet'
```

## Daily Digest

Set up a cron job to get a daily summary of saved links:
- Queries Notion DB for items saved in the last 24 hours
- Sends a formatted digest to your chat

## Project Structure

```
feed-your-notion/
├── SKILL.md          # OpenClaw skill definition
├── README.md         # This file
├── .env.example      # Environment variable template
├── .gitignore        # Git ignore rules
└── scripts/
    ├── save-to-notion.js   # Core save script
    └── apify-fetch.js      # SNS content fetcher (optional)
```

## License

MIT

## Author

[@thedalbee](https://threads.net/@thedalbee)
