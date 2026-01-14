import { useState, useEffect } from 'react'
import { RefreshCw, Image, Eye, ChevronLeft, ChevronRight, Download, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import { GoogleGenAI } from '@google/genai'
import JSZip from 'jszip'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

function App() {
  const { toast } = useToast()
  const [aspectRatio, setAspectRatio] = useState(() => {
    return localStorage.getItem('aspectRatio') || '1:1'
  })
  const [imageCount, setImageCount] = useState(() => {
    return parseInt(localStorage.getItem('imageCount')) || 5
  })
  const [selectedStyle, setSelectedStyle] = useState(() => {
    return localStorage.getItem('selectedStyle') || 'style1'
  })
  const [globalPrompt, setGlobalPrompt] = useState(() => {
    return localStorage.getItem('globalPrompt') || ''
  })
  const [prompts, setPrompts] = useState(() => {
    const saved = localStorage.getItem('prompts')
    return saved ? JSON.parse(saved) : Array(5).fill('')
  })
  const [images, setImages] = useState(Array(5).fill(null))
  const [loading, setLoading] = useState(Array(5).fill(false))
  const [apiKey] = useState(import.meta.env.VITE_GOOGLE_API_KEY || '')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [ideaSource, setIdeaSource] = useState('')
  const [ideaExpanded, setIdeaExpanded] = useState(false)
  const [generatingIdeas, setGeneratingIdeas] = useState(false)
  const [promptLanguage, setPromptLanguage] = useState('en')

  useEffect(() => {
    localStorage.setItem('aspectRatio', aspectRatio)
  }, [aspectRatio])

  useEffect(() => {
    localStorage.setItem('imageCount', imageCount.toString())
  }, [imageCount])

  useEffect(() => {
    localStorage.setItem('selectedStyle', selectedStyle)
    setGlobalPrompt(styles[selectedStyle].defaultGlobalPrompt)
  }, [selectedStyle])

  useEffect(() => {
    localStorage.setItem('globalPrompt', globalPrompt)
  }, [globalPrompt])

  useEffect(() => {
    localStorage.setItem('prompts', JSON.stringify(prompts))
  }, [prompts])

  const styles = {
    style1: {
      name: 'Executive Minimal',
      description: 'Ultra-clean business design',
      prompt: `Global style: clean modern business carousel, ultra-minimal editorial layout, strict modular grid, wide margins, strong typographic hierarchy, high contrast, vector shapes only (no photos), no logos, no trademarks, restrained geometric accents, crisp edges, premium LinkedIn-style design, consistent spacing system (8pt), plenty of negative space. Palette: Charcoal (#111827), Off-white (#F9FAFB), Accent Blue (#2563EB). Typography: Headline: bold sans-serif, tight tracking, sentence case, short punchy lines. Body: regular sans-serif, comfortable line-height, avoid tiny text, perfect English spelling. Emphasis: use weight + color only (no underlines, no italics overload).`,
      footer: `Footer (Fixed spec — identical on every slide): Footer bar height: thin strip at bottom (same height every slide). Background: Charcoal (#111827). Text color: Off-white (#F9FAFB). Left (all caps, small): WEAK TIES > STRONG TIES. Center (small): Hidden Job Market & Networking. Right (all caps, small): SLIDE_NUMBER/${imageCount.toString().padStart(2, '0')} (change per slide to 02/05, 03/05, etc.). Font: same sans-serif, small size, slightly increased letter spacing, baseline-aligned, no icons in footer.`,
      defaultGlobalPrompt: `Global style:
clean modern business carousel, ultra-minimal editorial layout, strict modular grid, wide margins, strong typographic hierarchy, high contrast, vector shapes only (no photos), no logos, no trademarks, restrained geometric accents, crisp edges, premium LinkedIn-style design, consistent spacing system (8pt), plenty of negative space

Palette:
Charcoal (#111827)
Off-white (#F9FAFB)
Accent Blue (#2563EB)

Typography:
Headline: bold sans-serif, tight tracking, sentence case, short punchy lines
Body: regular sans-serif, comfortable line-height, avoid tiny text, perfect English spelling
Emphasis: use weight + color only (no underlines, no italics overload)

Footer (Fixed spec — identical on every slide):
Footer bar height: thin strip at bottom (same height every slide)
Background: Charcoal (#111827)
Text color: Off-white (#F9FAFB)
Left (all caps, small): WEAK TIES > STRONG TIES
Center (small): Hidden Job Market & Networking
Right (all caps, small): 01/05 (change per slide to 02/05, 03/05, etc.)
Font: same sans-serif, small size, slightly increased letter spacing, baseline-aligned, no icons in footer`
    },
    style2: {
      name: 'Cyan Tech Grid',
      description: 'Sharp & bright tech design',
      prompt: `Global style: clean modern business carousel, minimalist editorial layout, subtle blueprint-style grid, strong typographic hierarchy, generous whitespace, high contrast, vector-only abstract tech shapes (lines, nodes, brackets), no photos, no logos, no trademarks, crisp edges, consistent margins, premium LinkedIn-style design, limited decorative elements (one accent motif per slide). Palette: Deep Navy (#0B1F3B), Off-white (#F7F7F5), Accent Cyan (#2EC4FF). Typography: Headline: bold sans-serif, large size, left-aligned, short lines, high impact. Body: regular sans-serif, medium size, clear hierarchy (max 2 levels), perfect English spelling. Numbers: tabular-feel consistency, never tiny.`,
      footer: `Footer (Fixed spec — identical on every slide): Footer bar height: thin strip at bottom (same height every slide). Background: Deep Navy (#0B1F3B). Text color: Off-white (#F7F7F5). Left (all caps, small): WEAK TIES > STRONG TIES. Center (small): Hidden Job Market & Networking. Right (all caps, small): SLIDE_NUMBER/${imageCount.toString().padStart(2, '0')} (change per slide to 02/05, 03/05, etc.). Font: same sans-serif, small size, slightly increased letter spacing, baseline-aligned, no icons in footer.`,
      defaultGlobalPrompt: `Global style:
clean modern business carousel, minimalist editorial layout, subtle blueprint-style grid, strong typographic hierarchy, generous whitespace, high contrast, vector-only abstract tech shapes (lines, nodes, brackets), no photos, no logos, no trademarks, crisp edges, consistent margins, premium LinkedIn-style design, limited decorative elements (one accent motif per slide)

Palette:
Deep Navy (#0B1F3B)
Off-white (#F7F7F5)
Accent Cyan (#2EC4FF)

Typography:
Headline: bold sans-serif, large size, left-aligned, short lines, high impact
Body: regular sans-serif, medium size, clear hierarchy (max 2 levels), perfect English spelling
Numbers: tabular-feel consistency, never tiny

Footer (Fixed spec — identical on every slide):
Footer bar height: thin strip at bottom (same height every slide)
Background: Deep Navy (#0B1F3B)
Text color: Off-white (#F7F7F5)
Left (all caps, small): WEAK TIES > STRONG TIES
Center (small): Hidden Job Market & Networking
Right (all caps, small): 01/05 (change per slide to 02/05, 03/05, etc.)
Font: same sans-serif, small size, slightly increased letter spacing, baseline-aligned, no icons in footer`
    },
    style3: {
      name: 'Warm Premium Editorial',
      description: 'Confident & human design',
      prompt: `Global style: clean modern business carousel, premium editorial layout, soft but structured grid, generous whitespace, strong typographic hierarchy, high contrast, vector shapes only (no photos), no logos, no trademarks, subtle rounded geometry accents, calm boardroom tone, consistent margins, crisp edges, minimal ornamentation (one highlight block per slide). Palette: Near-black (#0F172A), Warm Off-white (#FAF7F0), Accent Amber (#F59E0B). Typography: Headline: bold sans-serif, slightly wider tracking, title case or sentence case (stay consistent), short lines. Body: regular sans-serif, readable size, avoid long paragraphs, perfect English spelling. Callouts: accent color + bold weight, limit to 1 callout per slide.`,
      footer: `Footer (Fixed spec — identical on every slide): Footer bar height: thin strip at bottom (same height every slide). Background: Near-black (#0F172A). Text color: Warm Off-white (#FAF7F0). Left (all caps, small): WEAK TIES > STRONG TIES. Center (small): Hidden Job Market & Networking. Right (all caps, small): SLIDE_NUMBER/${imageCount.toString().padStart(2, '0')} (change per slide to 02/05, 03/05, etc.). Font: same sans-serif, small size, slightly increased letter spacing, baseline-aligned, no icons in footer.`,
      defaultGlobalPrompt: `Global style:
clean modern business carousel, premium editorial layout, soft but structured grid, generous whitespace, strong typographic hierarchy, high contrast, vector shapes only (no photos), no logos, no trademarks, subtle rounded geometry accents, calm boardroom tone, consistent margins, crisp edges, minimal ornamentation (one highlight block per slide)

Palette:
Near-black (#0F172A)
Warm Off-white (#FAF7F0)
Accent Amber (#F59E0B)

Typography:
Headline: bold sans-serif, slightly wider tracking, title case or sentence case (stay consistent), short lines
Body: regular sans-serif, readable size, avoid long paragraphs, perfect English spelling
Callouts: accent color + bold weight, limit to 1 callout per slide

Footer (Fixed spec — identical on every slide):
Footer bar height: thin strip at bottom (same height every slide)
Background: Near-black (#0F172A)
Text color: Warm Off-white (#FAF7F0)
Left (all caps, small): WEAK TIES > STRONG TIES
Center (small): Hidden Job Market & Networking
Right (all caps, small): 01/05 (change per slide to 02/05, 03/05, etc.)
Font: same sans-serif, small size, slightly increased letter spacing, baseline-aligned, no icons in footer`
    }
  }

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

    const aspectRatioText = aspectRatio === '1:1' ? '1:1 square ratio' : '4:5 vertical ratio for Instagram post'
    const stylePrompt = styles[selectedStyle].prompt
    const footerPrompt = styles[selectedStyle].footer ? ` ${styles[selectedStyle].footer.replace('SLIDE_NUMBER', (index + 1).toString().padStart(2, '0'))}` : ''
    const fullPrompt = globalPrompt 
      ? `${stylePrompt}${footerPrompt} ${globalPrompt}. ${prompts[index]}. ${aspectRatioText}`
      : `${stylePrompt}${footerPrompt} ${prompts[index]}. ${aspectRatioText}`
    
    console.log('=== Image Generation Debug ===')
    console.log('Selected Style:', selectedStyle)
    console.log('Style Name:', styles[selectedStyle].name)
    console.log('Full Prompt Length:', fullPrompt.length)
    console.log('Full Prompt Preview:', fullPrompt.substring(0, 200) + '...')
    console.log('==============================')

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
      for (let i = 0; i < imageCount; i++) {
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
    setPreviewIndex((prev) => (prev + 1) % imageCount)
  }

  const prevImage = () => {
    setPreviewIndex((prev) => (prev - 1 + imageCount) % imageCount)
  }

  const validImages = images.filter(img => img !== null)

  const generatePromptsFromIdea = async () => {
    if (!apiKey) {
      toast({
        variant: "destructive",
        title: "API 키 오류",
        description: "API 키를 .env 파일에 설정해주세요.",
      })
      return
    }

    if (!ideaSource.trim()) {
      toast({
        variant: "destructive",
        title: "입력 오류",
        description: "아이디어 소스를 입력해주세요.",
      })
      return
    }

    setGeneratingIdeas(true)

    try {
      const ai = new GoogleGenAI({ apiKey })
      const model = 'gemini-2.0-flash-exp'
      
      const aspectRatioText = aspectRatio === '1:1' ? '1:1 square' : '4:5 vertical'
      const languageText = promptLanguage === 'en' ? '영어로' : promptLanguage === 'ko' ? '한국어로' : '일본어로'
      const promptArray = Array(imageCount).fill('"prompt"').join(', ')
      const systemPrompt = `\`\`\`${ideaSource}\`\`\`\n\n위 내용을 가지고 ${languageText} Instagram carousel 만들 이미지 생성 프롬프트 시리즈 만들어줘. ${imageCount}장으로 만들어줘. 비율은 ${aspectRatioText}. 각 프롬프트는 명확하고 구체적으로 작성해줘. JSON 형식으로 정확히 ${imageCount}개의 프롬프트를 응답해줘: {"prompts": [${promptArray}]}`
      
      const response = await ai.models.generateContent({
        model,
        contents: systemPrompt,
      })

      const text = response.candidates[0].content.parts[0].text
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.prompts && Array.isArray(parsed.prompts) && parsed.prompts.length === imageCount) {
          const newPrompts = Array(5).fill('')
          parsed.prompts.forEach((p, i) => {
            if (i < 5) newPrompts[i] = p
          })
          setPrompts(newPrompts)
          toast({
            title: "프롬프트 생성 완료",
            description: `${imageCount}개의 이미지 프롬프트가 생성되었습니다.`,
          })
        } else {
          throw new Error('Invalid response format')
        }
      } else {
        throw new Error('Could not parse JSON response')
      }
    } catch (error) {
      console.error('Prompt generation error:', error)
      toast({
        variant: "destructive",
        title: "프롬프트 생성 실패",
        description: error.message || '알 수 없는 오류가 발생했습니다.',
      })
    } finally {
      setGeneratingIdeas(false)
    }
  }

  const downloadAllImages = async () => {
    const imagesToDownload = images.filter(img => img !== null)
    
    if (imagesToDownload.length === 0) {
      toast({
        variant: "destructive",
        title: "다운로드 실패",
        description: "다운로드할 이미지가 없습니다.",
      })
      return
    }

    try {
      const zip = new JSZip()
      const now = new Date()
      const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5)
      
      for (let i = 0; i < images.length; i++) {
        if (images[i]) {
          const base64Data = images[i].split(',')[1]
          zip.file(`image_${i + 1}.png`, base64Data, { base64: true })
        }
      }
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `carousel_${timestamp}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast({
        title: "다운로드 완료",
        description: `${imagesToDownload.length}개의 이미지가 다운로드되었습니다.`,
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        variant: "destructive",
        title: "다운로드 실패",
        description: error.message,
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-1">
            Instagram Carousel Generator
          </h1>
          <p className="text-sm text-muted-foreground">AI로 캐러셀 이미지 생성</p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-3">
                  <Label>이미지 개수</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={imageCount === 3 ? 'default' : 'outline'}
                      onClick={() => setImageCount(3)}
                      className="flex-1"
                    >
                      3개
                    </Button>
                    <Button
                      variant={imageCount === 5 ? 'default' : 'outline'}
                      onClick={() => setImageCount(5)}
                      className="flex-1"
                    >
                      5개
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>스타일 선택</Label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(styles).map(([key, style]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedStyle(key)}
                      className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                        selectedStyle === key
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="aspect-video bg-muted rounded mb-2 flex items-center justify-center text-muted-foreground text-xs">
                        Preview
                      </div>
                      <div className="font-medium text-sm">{style.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{style.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="global-prompt">글로벌 포맷 프롬프트 (선택사항)</Label>
                <Textarea
                  id="global-prompt"
                  value={globalPrompt}
                  onChange={(e) => setGlobalPrompt(e.target.value)}
                  placeholder="예: professional photography, high quality, vibrant colors"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <Label className="text-base font-medium">아이디어에서 프롬프트 자동 생성</Label>
                  <Select value={promptLanguage} onValueChange={setPromptLanguage}>
                    <SelectTrigger className="w-[120px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIdeaExpanded(!ideaExpanded)}
                >
                  {ideaExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              
              {ideaExpanded && (
                <div className="space-y-3 pt-2">
                  <Textarea
                    value={ideaSource}
                    onChange={(e) => setIdeaSource(e.target.value)}
                    placeholder="아이디어나 긴 글을 입력하세요. AI가 개수에 맞는 이미지 프롬프트로 변환해드립니다..."
                    rows={6}
                    className="resize-none"
                  />
                  <Button
                    onClick={generatePromptsFromIdea}
                    disabled={generatingIdeas || !ideaSource.trim()}
                    className="w-full"
                  >
                    {generatingIdeas ? '프롬프트 생성 중...' : `${imageCount}개 프롬프트 자동 생성`}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {prompts.slice(0, imageCount).map((prompt, index) => (
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
                  rows={5}
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

        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Button
                onClick={generateAllImages}
                disabled={loading.some(l => l) || prompts.slice(0, imageCount).some(p => !p.trim())}
                className="flex-1"
                size="lg"
              >
                {loading.some(l => l) ? '생성 중...' : 'Generate All Images'}
              </Button>
              {validImages.length > 0 && (
                <>
                  <Button
                    onClick={() => openPreview(0)}
                    variant="outline"
                    size="lg"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    onClick={downloadAllImages}
                    variant="outline"
                    size="lg"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </>
              )}
            </div>
            {prompts.slice(0, imageCount).some(p => !p.trim()) && (
              <p className="text-sm text-destructive mt-2">
                모든 프롬프트를 입력해주세요 ({prompts.slice(0, imageCount).filter(p => p.trim()).length}/{imageCount}개 완료)
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Instagram Carousel Preview</DialogTitle>
            <DialogDescription>
              생성된 이미지를 Instagram 캐러셀 형식으로 미리보기
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <div className={`relative bg-white flex items-center justify-center ${
              aspectRatio === '1:1' ? 'aspect-square' : 'aspect-[4/5]'
            }`}>
              {images[previewIndex] ? (
                <img
                  src={images[previewIndex]}
                  alt={`Preview ${previewIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-muted-foreground text-center">
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
              {images.slice(0, imageCount).map((img, idx) => (
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
              {previewIndex + 1} / {imageCount}
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
