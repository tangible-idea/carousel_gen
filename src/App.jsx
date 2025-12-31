import { useState, useEffect } from 'react'
import { RefreshCw, Image, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { GoogleGenAI } from '@google/genai'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

function App() {
  const { toast } = useToast()
  const [aspectRatio, setAspectRatio] = useState(() => {
    return localStorage.getItem('aspectRatio') || '1:1'
  })
  const [globalPrompt, setGlobalPrompt] = useState(() => {
    return localStorage.getItem('globalPrompt') || ''
  })
  const [prompts, setPrompts] = useState(() => {
    const saved = localStorage.getItem('prompts')
    return saved ? JSON.parse(saved) : ['', '', '', '', '']
  })
  const [images, setImages] = useState(() => {
    const saved = localStorage.getItem('images')
    return saved ? JSON.parse(saved) : [null, null, null, null, null]
  })
  const [loading, setLoading] = useState([false, false, false, false, false])
  const [apiKey] = useState(import.meta.env.VITE_GOOGLE_API_KEY || '')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)

  useEffect(() => {
    localStorage.setItem('aspectRatio', aspectRatio)
  }, [aspectRatio])

  useEffect(() => {
    localStorage.setItem('globalPrompt', globalPrompt)
  }, [globalPrompt])

  useEffect(() => {
    localStorage.setItem('prompts', JSON.stringify(prompts))
  }, [prompts])

  useEffect(() => {
    localStorage.setItem('images', JSON.stringify(images))
  }, [images])

  const getModelName = () => {
    return 'gemini-2.5-flash-image'
  }

  const generateImage = async (index, shouldThrow = false) => {
    if (!apiKey) {
      toast({
        variant: "destructive",
        title: "API 키 오류",
        description: "API 키를 .env 파일에 설정해주세요.",
      })
      if (shouldThrow) throw new Error('API 키 없음')
      return
    }

    const fullPrompt = globalPrompt 
      ? `${globalPrompt}. ${prompts[index]}`
      : prompts[index]

    if (!fullPrompt.trim()) {
      toast({
        variant: "destructive",
        title: "프롬프트 오류",
        description: `이미지 ${index + 1}의 프롬프트를 입력해주세요.`,
      })
      if (shouldThrow) throw new Error('프롬프트 없음')
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

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data
          const mimeType = part.inlineData.mimeType || 'image/png'
          const imageUrl = `data:${mimeType};base64,${base64Data}`
          
          setImages(prev => {
            const updated = [...prev]
            updated[index] = imageUrl
            return updated
          })
          break
        }
      }
    } catch (error) {
      console.error('Image generation error:', error)
      const errorMessage = error.message || error.response?.data?.error?.message || '알 수 없는 오류'
      toast({
        variant: "destructive",
        title: `이미지 ${index + 1} 생성 실패`,
        description: errorMessage,
      })
      if (shouldThrow) throw error
    } finally {
      const newLoading = [...loading]
      newLoading[index] = false
      setLoading(newLoading)
    }
  }

  const generateAllImages = async () => {
    const savedData = {
      aspectRatio,
      globalPrompt,
      prompts,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('lastGeneration', JSON.stringify(savedData))
    
    try {
      for (let i = 0; i < 5; i++) {
        if (prompts[i].trim()) {
          await generateImage(i, true)
        }
      }
    } catch (error) {
      console.error('Generation stopped due to error:', error)
    }
  }

  const handlePromptChange = (index, value) => {
    const newPrompts = [...prompts]
    newPrompts[index] = value
    setPrompts(newPrompts)
  }

  const openPreview = (index) => {
    setPreviewIndex(index)
    setPreviewOpen(true)
  }

  const nextImage = () => {
    setPreviewIndex((prev) => (prev + 1) % 5)
  }

  const prevImage = () => {
    setPreviewIndex((prev) => (prev - 1 + 5) % 5)
  }

  const validImages = images.filter(img => img !== null)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-1">
            Instagram Carousel Generator
          </h1>
          <p className="text-sm text-muted-foreground">Gemini로 캐러셀 이미지 생성</p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>이미지 비율</Label>
                <div className="flex gap-2">
                  <Button
                    variant={aspectRatio === '1:1' ? 'default' : 'outline'}
                    onClick={() => setAspectRatio('1:1')}
                    className="flex-1"
                  >
                    1:1
                  </Button>
                  <Button
                    variant={aspectRatio === '4:5' ? 'default' : 'outline'}
                    onClick={() => setAspectRatio('4:5')}
                    className="flex-1"
                  >
                    4:5
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="global-prompt">글로벌 포맷 프롬프트</Label>
                <Textarea
                  id="global-prompt"
                  value={globalPrompt}
                  onChange={(e) => setGlobalPrompt(e.target.value)}
                  placeholder="예: professional photography, high quality, vibrant colors"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={generateAllImages}
                  disabled={loading.some(l => l)}
                  className="flex-1"
                  size="lg"
                >
                  {loading.some(l => l) ? '생성 중...' : 'Generate All Images'}
                </Button>
                {validImages.length > 0 && (
                  <Button
                    onClick={() => openPreview(0)}
                    variant="outline"
                    size="lg"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {prompts.map((prompt, index) => (
            <div key={index} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor={`prompt-${index}`} className="text-xs">
                  이미지 {index + 1}
                </Label>
                <Textarea
                  id={`prompt-${index}`}
                  value={prompt}
                  onChange={(e) => handlePromptChange(index, e.target.value)}
                  placeholder={`프롬프트 입력...`}
                  rows={3}
                  className="text-sm"
                />
              </div>

              <Card className="overflow-hidden">
                <div 
                  className={`relative bg-muted flex items-center justify-center ${
                    aspectRatio === '1:1' ? 'aspect-square' : 'aspect-[4/5]'
                  }`}
                >
                  {loading[index] ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-muted-foreground">생성 중</p>
                    </div>
                  ) : images[index] ? (
                    <>
                      <img
                        src={images[index]}
                        alt={`Generated ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => openPreview(index)}
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            openPreview(index)
                          }}
                          className="h-8 w-8"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            generateImage(index)
                          }}
                          className="h-8 w-8"
                          title="Regenerate"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <Image className="w-8 h-8 text-muted-foreground/40 mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">대기 중</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
      <Toaster />

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Instagram Carousel Preview</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <div className={`relative bg-black flex items-center justify-center ${
              aspectRatio === '1:1' ? 'aspect-square' : 'aspect-[4/5]'
            }`}>
              {images[previewIndex] ? (
                <img
                  src={images[previewIndex]}
                  alt={`Preview ${previewIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-white text-center">
                  <Image className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>이미지 없음</p>
                </div>
              )}
              
              {validImages.length > 1 && (
                <>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
            
            <div className="flex justify-center gap-1 mt-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setPreviewIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === previewIndex 
                      ? 'w-8 bg-primary' 
                      : img 
                        ? 'w-1.5 bg-primary/40'
                        : 'w-1.5 bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {previewIndex + 1} / 5
              {prompts[previewIndex] && (
                <p className="mt-2 text-xs">{prompts[previewIndex]}</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App
