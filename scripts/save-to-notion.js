#!/usr/bin/env node

/**
 * save-to-notion.js
 * 
 * Idea Museum DB에 아티클 저장
 * 
 * Usage: node save-to-notion.js --title "Title" --url "https://..." --source "Web" --summary "요약" --full_text "전문" --memo "메모"
 * 
 * Environment:
 *   NOTION_API_KEY - Notion integration API key
 *   NOTION_DB_ID - Target database ID (Idea Museum DB)
 */

const { Client } = require("@notionhq/client");

function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].replace(/^--/, '');
      args[key] = argv[i + 1] || '';
      i++;
    }
  }
  return args;
}

// 마크다운을 노션 블록으로 변환 (간단 버전)
function markdownToBlocks(md) {
  if (!md) return [];
  const blocks = [];
  const lines = md.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    if (trimmed.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: trimmed.slice(3) } }] }
      });
    } else if (trimmed.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: { rich_text: [{ type: 'text', text: { content: trimmed.slice(4) } }] }
      });
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: [{ type: 'text', text: { content: trimmed.slice(2) } }] }
      });
    } else if (/^\d+\.\s/.test(trimmed)) {
      blocks.push({
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: { rich_text: [{ type: 'text', text: { content: trimmed.replace(/^\d+\.\s/, '') } }] }
      });
    } else if (trimmed === '---') {
      blocks.push({ object: 'block', type: 'divider', divider: {} });
    } else {
      // 2000자 제한 처리
      const chunks = trimmed.match(/.{1,2000}/g) || [trimmed];
      for (const chunk of chunks) {
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: { rich_text: [{ type: 'text', text: { content: chunk } }] }
        });
      }
    }
  }
  return blocks;
}

async function main() {
  const args = parseArgs();
  
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DB_ID;
  
  if (!apiKey || !databaseId) {
    console.error(JSON.stringify({ success: false, error: 'NOTION_API_KEY and NOTION_DB_ID required' }));
    process.exit(1);
  }
  
  if (!args.title || !args.url) {
    console.error(JSON.stringify({ success: false, error: '--title and --url required' }));
    process.exit(1);
  }

  const notion = new Client({ auth: apiKey });

  // DB 프로퍼티에 맞춤: title, url, source, summary, full_text, memo, created_at(자동)
  const properties = {
    title: { title: [{ text: { content: args.title.slice(0, 200) } }] },
    url: { url: args.url }
  };
  
  if (args.source) {
    properties.source = { select: { name: args.source } };
  }
  if (args.summary) {
    properties.summary = { rich_text: [{ text: { content: args.summary.slice(0, 2000) } }] };
  }
  if (args.memo) {
    properties.memo = { rich_text: [{ text: { content: args.memo.slice(0, 2000) } }] };
  }

  // 본문 블록 구성
  const bodyParts = [];
  if (args.summary) bodyParts.push(`## 요약\n\n${args.summary}`);
  if (args.full_text) bodyParts.push(`## 본문\n\n${args.full_text}`);
  bodyParts.push(`---\n원본: ${args.url}`);
  
  const children = markdownToBlocks(bodyParts.join('\n\n'));

  try {
    const page = await notion.pages.create({
      parent: { database_id: databaseId },
      properties,
      children: children.slice(0, 100) // 노션 블록 100개 제한
    });

    console.log(JSON.stringify({
      success: true,
      pageId: page.id,
      pageUrl: page.url,
      title: args.title
    }));
  } catch (err) {
    console.error(JSON.stringify({
      success: false,
      error: err.message
    }));
    process.exit(1);
  }
}

main();
