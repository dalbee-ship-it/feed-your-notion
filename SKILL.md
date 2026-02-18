# Link → Insight Pipeline

링크를 받으면 자동으로 내용을 수집하고, 요약하여 노션 Idea Museum DB에 저장하는 파이프라인.

## 트리거

텔레그램 DM으로 URL을 보내면:
- URL만 단독으로 보낸 경우 → 자동 저장
- URL + 짧은 코멘트 → 코멘트를 memo에 포함하여 저장
- "저장 [URL]" → 강제 저장
- "저장 안 해" → 스킵
- 대화 맥락 속 참고 링크 → 판단 애매하면 "저장할까요?" 물어보기

## 플로우

1. URL 감지
2. `web_fetch`로 내용 수집 (X/Twitter는 fxtwitter API)
3. AI 요약 + source 판별
4. `save-to-notion.js`로 노션 DB 저장
5. 확인 메시지: "저장 완료 — [한줄 요약]"

## 환경 변수 (필수)

```bash
NOTION_API_KEY=your_notion_api_key
NOTION_DB_ID=your_notion_database_id
```

## 저장 스크립트 사용법

```bash
node skills/link-to-insight/scripts/save-to-notion.js \
  --title "제목" \
  --url "https://..." \
  --source "Web" \
  --summary "3줄 요약" \
  --full_text "본문 요약" \
  --memo "코멘트"
```

## X/Twitter 수집 방법

fxtwitter API 사용 (무료, API 키 불필요):
```bash
curl -s "https://api.fxtwitter.com/i/status/{TWEET_ID}" | jq '.tweet'
```
응답: `.tweet.text`, `.tweet.author.name`, `.tweet.author.screen_name`, `.tweet.likes`, `.tweet.created_at`

## Source 매핑

- `x.com/*`, `twitter.com/*` → X
- `instagram.com/*` → Instagram
- `threads.net/*` → threads
- `youtube.com/*`, `youtu.be/*` → Youtube
- `reddit.com/*` → reddit
- 그 외 → Web

## 노션 DB 프로퍼티

- **title** (title): 아티클 제목
- **url** (url): 원본 링크
- **source** (select): Web / Youtube / Instagram / X / threads / reddit
- **summary** (rich_text): 요약
- **full_text** (rich_text): 전문 텍스트
- **memo** (rich_text): 사용자 코멘트
- **created_at** (created_time): 자동 생성

## 설치

1. 노션 인테그레이션 생성 (https://www.notion.so/my-integrations)
2. 대상 DB에 인테그레이션 연결 추가
3. 환경 변수 설정
4. `npm install @notionhq/client`
5. 스킬 폴더를 오픈클로 워크스페이스 `skills/`에 복사
