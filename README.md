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

1. Create a [Notion integration](https://www.notion.so/my-integrations)
2. Create a database with these properties:
   - `title` (title)
   - `url` (url)
   - `source` (select): Web, Youtube, Instagram, X, threads, reddit
   - `summary` (rich_text)
   - `full_text` (rich_text)
   - `memo` (rich_text)
3. Share the database with your integration (⋯ → Add connections)

### 2. Install

```bash
# In your OpenClaw workspace
cd skills
git clone https://github.com/thedalbee/feed-your-notion.git

# Install dependencies
cd link-to-insight
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
link-to-insight/
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
