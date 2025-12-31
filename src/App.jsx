import { useState } from 'react'
import { RefreshCw, Sparkles } from 'lucide-react'
import { GoogleGenAI } from '@google/genai'

function App() {
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [globalPrompt, setGlobalPrompt] = useState('')
  const [prompts, setPrompts] = useState(['', '', '', '', ''])
  const [images, setImages] = useState([null, null, null, null, null])
  const [loading, setLoading] = useState([false, false, false, false, false])
  const [apiKey] = useState(import.meta.env.VITE_GOOGLE_API_KEY || '')

  const getModelName = () => {
    return 'gemini-2.5-flash-image'
  }

  const generateImage = async (index) => {
    if (!apiKey) {
      alert('API 키를 .env 파일에 설정해주세요.')
      return
    }

    const fullPrompt = globalPrompt 
      ? `${globalPrompt}. ${prompts[index]}`
      : prompts[index]

    if (!fullPrompt.trim()) {
      alert(`이미지 ${index + 1}의 프롬프트를 입력해주세요.`)
      return
    }

    const newLoading = [...loading]
    newLoading[index] = true
    setLoading(newLoading)

    try {
      const ai = new GoogleGenAI({ apiKey })
      const model = getModelName()
      
      const response = await ai.models.generateContent({
        model,
        contents: fullPrompt,
      })

      const newImages = [...images]
      
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data
          const mimeType = part.inlineData.mimeType || 'image/png'
          newImages[index] = `data:${mimeType};base64,${base64Data}`
          break
        }
      }
      
      setImages(newImages)
    } catch (error) {
      console.error('Image generation error:', error)
      alert(`이미지 생성 실패: ${error.response?.data?.error?.message || error.message}`)
    } finally {
      const newLoading = [...loading]
      newLoading[index] = false
      setLoading(newLoading)
    }
  }

  const generateAllImages = async () => {
    for (let i = 0; i < 5; i++) {
      if (prompts[i].trim()) {
        await generateImage(i)
      }
    }
  }

  const handlePromptChange = (index, value) => {
    const newPrompts = [...prompts]
    newPrompts[index] = value
    setPrompts(newPrompts)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Sparkles className="text-purple-600" />
            Instagram Carousel Generator
          </h1>
          <p className="text-gray-600">Nano Banana Pro로 캐러셀 이미지 생성</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              이미지 비율 선택
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setAspectRatio('1:1')}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                  aspectRatio === '1:1'
                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                1:1 (정사각형)
              </button>
              <button
                onClick={() => setAspectRatio('4:5')}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                  aspectRatio === '4:5'
                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                4:5 (세로형)
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              글로벌 포맷 프롬프트 (모든 이미지에 적용)
            </label>
            <textarea
              value={globalPrompt}
              onChange={(e) => setGlobalPrompt(e.target.value)}
              placeholder="예: professional photography, high quality, vibrant colors"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
              rows="3"
            />
          </div>

          <button
            onClick={generateAllImages}
            disabled={loading.some(l => l)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl mb-6"
          >
            {loading.some(l => l) ? '생성 중...' : 'Generate All Images'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {prompts.map((prompt, index) => (
            <div key={index} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  이미지 {index + 1}
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => handlePromptChange(index, e.target.value)}
                  placeholder={`이미지 ${index + 1} 프롬프트...`}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none text-sm"
                  rows="3"
                />
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div 
                  className={`relative bg-gray-100 flex items-center justify-center ${
                    aspectRatio === '1:1' ? 'aspect-square' : 'aspect-[4/5]'
                  }`}
                >
                  {loading[index] ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-gray-600">생성 중...</p>
                    </div>
                  ) : images[index] ? (
                    <>
                      <img
                        src={images[index]}
                        alt={`Generated ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => generateImage(index)}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
                        title="Regenerate"
                      >
                        <RefreshCw className="w-4 h-4 text-purple-600" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">대기 중</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
