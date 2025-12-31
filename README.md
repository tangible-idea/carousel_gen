# Instagram Carousel Generator

Google Gemini의 Nano Banana (이미지 생성) API를 사용하여 인스타그램 캐러셀 이미지를 자동으로 생성하는 애플리케이션입니다.

## 기능

- **비율 선택**: 1:1 (정사각형) 또는 4:5 (세로형)
- **글로벌 포맷 프롬프트**: 모든 이미지에 공통으로 적용되는 스타일 지정
- **5개 개별 프롬프트**: 각 이미지별 고유 설명 입력
- **실시간 생성**: Gemini 2.5 Flash Image 모델 사용
- **개별 재생성**: 각 이미지 우측 상단의 🔄 아이콘으로 재생성
- **모던한 UI/UX**: TailwindCSS + Lucide 아이콘

## 설정

1. **의존성 설치**:
```bash
npm install
```

2. **Google API 키 설정**:
   - [Google AI Studio](https://aistudio.google.com/apikey)에서 API 키 발급
   - `.env` 파일에 API 키 추가:
```
VITE_GOOGLE_API_KEY=your_google_api_key_here
```

3. **개발 서버 실행**:
```bash
npm run dev
```

## 사용 방법

1. 이미지 비율 선택 (1:1 또는 4:5)
2. 글로벌 포맷 프롬프트 입력 (예: "professional photography, high quality, vibrant colors")
3. 각 이미지별 프롬프트 입력 (텍스트박스 바로 아래에 결과 표시)
4. "Generate All Images" 버튼 클릭하여 모든 이미지 생성
5. 개별 이미지 재생성이 필요한 경우 해당 이미지의 regenerate 아이콘 클릭

## 기술 스택

- **React 18** - UI 프레임워크
- **Vite** - 빌드 도구
- **TailwindCSS** - 스타일링
- **@google/genai** - Google Gemini API SDK
- **Lucide React** - 아이콘
- **Gemini 2.5 Flash Image** - 이미지 생성 모델
